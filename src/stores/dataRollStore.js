import { defineStore } from 'pinia';
import { ref, computed, markRaw } from 'vue';
import { db } from '@/db';
import { parseContinuousLot, detectSupplier, extractCleanParentLot, parseDateToIso, extractDateFromLot } from '@/services/dataRollParserService';
import { useGlobalLoading } from '@/services/loadingService';
import { supabase, pushLocalToSupabase, deleteFromSupabase, deleteMultipleFromSupabase, recordTombstones, getTombstones, broadcastClearAllRolls, recordDataRollsWipedCloud } from '@/services/syncService';

export function computeDataRollSortKeys(item) {
  const rawDate = item.tanggalFormatted || item.tanggal || '';
  const dateStr = rawDate ? String(rawDate).slice(0, 10) : '';

  let mach = 'SLITTING';
  if (item.machineName) mach = String(item.machineName).toUpperCase();
  else if (item.mesin) mach = String(item.mesin).toUpperCase();
  else if (item.slitting) mach = 'SLITTING';
  else if (item.rewind) mach = 'REWIND';
  else if (item.sml) mach = 'SML';

  const fullLot = String(item.lot || '').toUpperCase();
  const parts = fullLot.split('/');
  const baseLot = parts.length >= 3 ? parts.slice(0, -1).join('/') : fullLot;

  let t = String(item.turunan || '').toUpperCase();
  if (!t && item.lot && parts.length >= 2) {
    t = parts[parts.length - 1].toUpperCase();
  }
  const match = t.match(/^([A-Za-z]+)(\d+)(.*)$/);
  const turunanNum = match ? parseInt(match[2], 10) : 999999;
  const turunanPrefix = match ? match[1] : t;
  const turunanExtra = match ? match[3] || '' : '';

  const spkStr = String(item.spk || '').toUpperCase();
  const packPrefix = String(item.kodePack || item.noPack || '').toUpperCase();
  const rawSub = String(item.subKode || '').trim();
  const subNum = parseInt(rawSub, 10);
  const validSubNum = (!isNaN(subNum) && subNum > 0) ? subNum : 999999;
  const packKey = String(item.kodePack || item.noPack || '').toUpperCase();

  return {
    _dateStr: dateStr,
    _machName: mach,
    _spk: spkStr,
    _baseLot: baseLot,
    _turunanNum: turunanNum,
    _turunanPrefix: turunanPrefix,
    _turunanExtra: turunanExtra,
    _packPrefix: packPrefix,
    _subNum: validSubNum,
    _packKey: packKey
  };
}

export const useDataRollStore = defineStore('dataRollStore', () => {
  const rolls = ref([]);
  const uploadHistory = ref([]);
  const loading = ref(false);
  const filterSearch = ref('');
  const filterMachine = ref('ALL'); // 'ALL' | 'SLITTING' | 'REWIND' | 'SML'
  const filterStatus = ref('ALL');  // 'ALL' | 'PASS' | 'HOLD' | 'REJECT'
  const sortDirection = ref('desc'); // 'desc' | 'asc'

  // Large-scale database windowing & metrics
  const totalDbRolls = ref(0);
  const isWindowed = ref(false);
  const windowLimit = ref(20000);

  // Computed metrics
  const totalRolls = computed(() => rolls.value.length);
  const passCount = computed(() => rolls.value.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length);
  const holdCount = computed(() => rolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length);
  const rejectCount = computed(() => rolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length);

  const slittingCount = computed(() => rolls.value.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SLITTING').length);
  const rewindCount = computed(() => rolls.value.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'REWIND').length);
  const smlCount = computed(() => rolls.value.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SML').length);

  // Multi-level Hierarchical Sorting Comparator (Ultra-fast O(1) using precomputed keys)
  const sortDataRolls = (a, b) => {
    // 1. Tanggal Produksi (Date)
    const dateA = a._dateStr !== undefined ? a._dateStr : String(a.tanggalFormatted || a.tanggal || '');
    const dateB = b._dateStr !== undefined ? b._dateStr : String(b.tanggalFormatted || b.tanggal || '');
    const dateComp = sortDirection.value === 'desc' 
      ? dateB.localeCompare(dateA) 
      : dateA.localeCompare(dateB);
    if (dateComp !== 0) return dateComp;

    // 2. Mesin (Machine)
    const machA = a._machName !== undefined ? a._machName : String(a.machineName || a.mesin || 'SLITTING').toUpperCase();
    const machB = b._machName !== undefined ? b._machName : String(b.machineName || b.mesin || 'SLITTING').toUpperCase();
    const machComp = machA.localeCompare(machB);
    if (machComp !== 0) return machComp;

    // 3. No. SPK (Surat Perintah Kerja)
    const spkA = a._spk !== undefined ? a._spk : String(a.spk || '').toUpperCase();
    const spkB = b._spk !== undefined ? b._spk : String(b.spk || '').toUpperCase();
    const spkComp = spkA.localeCompare(spkB, undefined, { numeric: true, sensitivity: 'base' });
    if (spkComp !== 0) return spkComp;

    // 4. Nomor Urut Turunan (Set Potong: Tarikan 01, 02, 03... mengunci roll HOLD/REJECT 0000 di posisinya)
    const tNumA = a._turunanNum !== undefined ? a._turunanNum : 999999;
    const tNumB = b._turunanNum !== undefined ? b._turunanNum : 999999;
    if (tNumA !== tNumB) {
      return tNumA - tNumB;
    }

    // 5. Posisi Arm / Chartingan (Arm A vs Arm C, Operator Prefix)
    const tPrefA = a._turunanPrefix !== undefined ? a._turunanPrefix : '';
    const tPrefB = b._turunanPrefix !== undefined ? b._turunanPrefix : '';
    if (tPrefA !== tPrefB) {
      return tPrefA.localeCompare(tPrefB);
    }
    const tExtA = a._turunanExtra !== undefined ? a._turunanExtra : '';
    const tExtB = b._turunanExtra !== undefined ? b._turunanExtra : '';
    if (tExtA !== tExtB) {
      return tExtA.localeCompare(tExtB);
    }

    // 6. No. Lot (Base Lot jika nomor turunan sama)
    const lotA = a._baseLot !== undefined ? a._baseLot : String(a.lot || '').toUpperCase();
    const lotB = b._baseLot !== undefined ? b._baseLot : String(b.lot || '').toUpperCase();
    const lotComp = lotA.localeCompare(lotB, undefined, { numeric: true, sensitivity: 'base' });
    if (lotComp !== 0) return lotComp;

    // 7. Sub Kode Resmi Numerik (>0) berurutan (PASS didahulukan sebelum HOLD/REJECT 0000 jika turunan sama)
    const subA = a._subNum !== undefined ? a._subNum : 999999;
    const subB = b._subNum !== undefined ? b._subNum : 999999;
    if (subA !== subB) return subA - subB;

    // 8. Kode Pack / Codepack string fallback
    const packA = a._packKey !== undefined ? a._packKey : String(a.kodePack || a.noPack || '').toUpperCase();
    const packB = b._packKey !== undefined ? b._packKey : String(b.kodePack || b.noPack || '').toUpperCase();
    const packComp = packA.localeCompare(packB, undefined, { numeric: true, sensitivity: 'base' });
    if (packComp !== 0) return packComp;

    // 9. Timeline Fisik Asli (ID Record)
    return (Number(a.id) || 0) - (Number(b.id) || 0);
  };

  const filteredRolls = computed(() => {
    let list = [...rolls.value];

    // Filter Machine
    if (filterMachine.value !== 'ALL') {
      if (filterMachine.value === 'SLITTING') {
        list = list.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SLITTING');
      } else if (filterMachine.value === 'REWIND') {
        list = list.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'REWIND');
      } else if (filterMachine.value === 'SML') {
        list = list.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SML');
      }
    }

    // Filter Status
    if (filterStatus.value !== 'ALL') {
      list = list.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === filterStatus.value);
    }

    // Search Query
    if (filterSearch.value.trim()) {
      const q = filterSearch.value.trim().toLowerCase();
      list = list.filter(r => 
        (r.kodeFg || '').toLowerCase().includes(q) ||
        (r.lot || '').toLowerCase().includes(q) ||
        (r.spk || '').toLowerCase().includes(q) ||
        (r.kodePack || '').toLowerCase().includes(q) ||
        (r.subKode || '').toLowerCase().includes(q) ||
        (r.kodeFormula || '').toLowerCase().includes(q) ||
        (r.jenis || '').toLowerCase().includes(q) ||
        (r.turunan || '').toLowerCase().includes(q) ||
        (r.tanggalFormatted || r.tanggal || '').toLowerCase().includes(q)
      );
    }

    // Sort according to standard: Tanggal -> Mesin -> KodePack -> Lot -> Turunan
    return list.sort(sortDataRolls);
  });

  // Load from Dexie DB (Merges explicit data_rolls and all DE Report labels)
  const loadRolls = async (force = false, options = {}) => {
    const opts = typeof options === 'object' && options !== null ? options : {};
    const loadAll = opts.loadAll === true;
    const limit = opts.limit || windowLimit.value || 5000;

    if (!force && !loadAll && rolls.value.length > 0 && !loading.value) {
      return;
    }
    loading.value = true;
    const { startLoading, stopLoading } = useGlobalLoading();
    startLoading('Memuat data roll...');
    try {
      let rawExplicit = [];
      if (db.data_rolls) {
        const totalRollsCount = await db.data_rolls.count();
        totalDbRolls.value = totalRollsCount;

        if (!loadAll && totalRollsCount > limit) {
          rawExplicit = await db.data_rolls.orderBy('id').reverse().limit(limit).toArray();
          rawExplicit.reverse();
          isWindowed.value = true;
        } else {
          rawExplicit = await db.data_rolls.toArray();
          isWindowed.value = false;
        }
      }

      const explicitRolls = rawExplicit.map(r => {
        const lot = r.lot || '';
        const turunan = r.turunan || '';
        const kodeOperator = r.kodeOperator || (turunan ? turunan.charAt(0) : 'G');
        const shift = r.shift || '';
        const supplier = r.supplier || detectSupplier(r.kodeFg || lot, r.spk);
        const rawDate = r.tanggalFormatted || r.tanggal;
        const cleanDate = rawDate ? String(rawDate).slice(0, 10) : '';

        const baseRoll = {
          ...r,
          lot,
          turunan,
          tanggal: cleanDate || r.tanggal || '',
          tanggalFormatted: cleanDate || r.tanggalFormatted || '',
          kodeOperator,
          operator: r.operator || (kodeOperator ? `OPERATOR ${kodeOperator}` : 'OPERATOR'),
          shift,
          supplier
        };
        const sortKeys = computeDataRollSortKeys(baseRoll);
        return markRaw({ ...baseRoll, ...sortKeys });
      });

      // Also load all labels from DE Report (db.labels)
      let deRolls = [];
      if (db.labels) {
        let labelsList = [];
        const totalLabelsCount = await db.labels.count();
        if (!loadAll && totalLabelsCount > limit) {
          labelsList = await db.labels.orderBy('id').reverse().limit(limit).toArray();
          labelsList.reverse();
        } else {
          labelsList = await db.labels.toArray();
        }

        deRolls = labelsList.map(l => {
          const rawDate = l.tanggal || (l.verifiedAt ? l.verifiedAt.slice(0, 10) : (l.createdAt ? l.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)));
          const cleanDate = rawDate ? String(rawDate).slice(0, 10) : '';
          const mesin = (l.mesin || 'SLITTING').toUpperCase();
          const thickness = String(l.thickness || l.tebal || l.thick || '');
          const width = String(l.width || l.lebar || '');
          const length = String(l.length || l.meter || l.panjang || '');
          const core = l.paperCore ? (String(l.paperCore).includes('3') ? 3 : 6) : 6;
          const status = (l.status || 'PASS').toUpperCase();

          const deRollBase = {
            id: `de_label_${l.id}`,
            originalLabelId: l.id,
            uuid: l.uniqId || `de_roll_${l.id}`,
            uploadId: `de_${cleanDate}_${mesin}`,
            source: 'DE Report',
            kodeFg: `${l.lot || ''}${l.turunan ? '/' + l.turunan : ''} ${l.jenis || ''} ${l.kode || ''} ${thickness}MC X ${width}MM = ${length}`,
            lot: l.lot || '',
            turunan: l.turunan || '',
            jenis: l.jenis || 'VMCPP',
            kodeFormula: l.kode || 'M06',
            thickness,
            width,
            length,
            netto: parseFloat(l.netto || l.berat || 0) || 0,
            core,
            treatment: l.treatment || 'INSIDE',
            od: l.od || '',
            slitting: mesin === 'SLITTING' ? 1 : 0,
            rewind: mesin === 'REWIND' ? 1 : 0,
            sml: mesin === 'SML' ? 1 : 0,
            machineName: mesin,
            tanggal: cleanDate,
            tanggalFormatted: cleanDate,
            spk: l.spk || '',
            kodePack: l.kodePack || '',
            subKode: l.subKode || '0000',
            qualityStatus: status,
            verified: l.verified || 0,
            verifiedAt: l.verifiedAt,
            verifiedBy: l.verifiedBy,
            operator: l.operator || '',
            shift: l.shift || '',
            shiftCombined: l.shiftCombined || '',
            createdAt: l.createdAt || cleanDate,
            updatedAt: l.updatedAt || cleanDate
          };
          const sortKeys = computeDataRollSortKeys(deRollBase);
          return markRaw({ ...deRollBase, ...sortKeys });
        });
      }

      // Combine both sources, avoiding duplicate UUIDs / IDs and filtering out deleted/tombstoned rolls
      const deletedRollSet = new Set(getTombstones('data_rolls'));
      const deletedLabelSet = new Set(getTombstones('labels'));

      const combinedMap = new Map();
      const orphanedExplicitIds = [];
      for (const r of explicitRolls) {
        if (r.uuid && deletedRollSet.has(r.uuid)) {
          if (r.id) orphanedExplicitIds.push(r.id);
          continue;
        }
        const key = r.uuid || (r.id ? `dr_${r.id}` : `${r.lot}_${r.turunan}_${r.kodePack}_${r.subKode}_${Math.random()}`);
        combinedMap.set(key, r);
      }

      // Cleanup local database from any dead explicit rolls asynchronously
      if (orphanedExplicitIds.length > 0 && db.data_rolls) {
        db.data_rolls.bulkDelete(orphanedExplicitIds).catch(() => {});
      }

      const orphanedDeLabelIds = [];
      for (const r of deRolls) {
        if (r.uuid && (deletedRollSet.has(r.uuid) || deletedLabelSet.has(r.uuid))) {
          if (r.originalLabelId) orphanedDeLabelIds.push(r.originalLabelId);
          continue;
        }
        const key = r.uuid || `de_${r.originalLabelId || r.id}`;
        if (!combinedMap.has(key)) {
          combinedMap.set(key, r);
        }
      }

      if (orphanedDeLabelIds.length > 0 && db.labels) {
        db.labels.bulkDelete(orphanedDeLabelIds).catch(() => {});
      }

      rolls.value = Array.from(combinedMap.values());
      await loadUploadHistory();
    } catch (e) {
      console.error('Failed to load data_rolls:', e);
      rolls.value = [];
    } finally {
      loading.value = false;
      stopLoading();
    }
  };

  const loadAllRolls = async () => {
    return loadRolls(true, { loadAll: true });
  };

  // Load Upload History & Sync DE Verified Batches
  const loadUploadHistory = async () => {
    try {
      if (db.data_roll_uploads) {
        const history = await db.data_roll_uploads.toArray();
        uploadHistory.value = history.sort((a, b) => new Date(b.uploadDate || b.createdAt) - new Date(a.uploadDate || a.createdAt));
      } else {
        uploadHistory.value = [];
      }

      // Auto-sync any verified DE labels to create daily history batches
      await syncVerifiedDeBatches();
    } catch (e) {
      console.error('Failed to load upload history:', e);
    }
  };

  // Sync DE Verified Batches into Upload History & Data Rolls
  const syncVerifiedDeBatches = async () => {
    try {
      if (!db.labels || !db.data_roll_uploads) return;
      const verifiedLabels = await db.labels.filter(l => l.verified === 1).toArray();
      if (!verifiedLabels || verifiedLabels.length === 0) return;

      // Group verified labels by Tanggal + Mesin
      const groups = {};
      for (const l of verifiedLabels) {
        const rawDate = l.tanggal || new Date(l.verifiedAt || l.createdAt || Date.now()).toISOString().slice(0, 10);
        const mesin = (l.mesin || 'SLITTING').toUpperCase();
        const key = `de_${rawDate}_${mesin}`;
        if (!groups[key]) {
          groups[key] = {
            batchKey: key,
            tanggal: rawDate,
            mesin: mesin,
            verifiedAt: l.verifiedAt || l.updatedAt || new Date().toISOString(),
            verifiedBy: l.verifiedBy || 'Data Entry',
            items: []
          };
        }
        groups[key].items.push(l);
      }

      for (const key of Object.keys(groups)) {
        const g = groups[key];
        const existing = await db.data_roll_uploads.where('uuid').equals(g.batchKey).first();
        
        const totalRolls = g.items.length;
        const totalKg = parseFloat(g.items.reduce((sum, i) => sum + (parseFloat(i.netto || i.berat || 0) || 0), 0).toFixed(2));
        const passCount = g.items.filter(i => (i.status || 'PASS').toUpperCase() === 'PASS').length;
        const holdCount = g.items.filter(i => (i.status || '').toUpperCase() === 'HOLD').length;
        const rejectCount = g.items.filter(i => (i.status || '').toUpperCase() === 'REJECT').length;

        const standardizedRolls = g.items.map(l => ({
          uuid: l.uniqId || `de_roll_${l.id}`,
          uploadId: g.batchKey,
          kodeFg: `${l.lot || ''}${l.turunan ? '/' + l.turunan : ''} ${l.jenis || ''} ${l.kode || ''} ${l.thickness || ''}MC X ${l.width || ''}MM = ${l.length || l.meter || ''}`,
          lot: l.lot || '',
          turunan: l.turunan || '',
          jenis: l.jenis || 'VMCPP',
          kodeFormula: l.kode || 'M06',
          thickness: String(l.thickness || ''),
          width: String(l.width || ''),
          length: String(l.length || l.meter || ''),
          netto: parseFloat(l.netto || l.berat || 0) || 0,
          core: l.paperCore ? (l.paperCore.includes('3') ? 3 : 6) : 6,
          treatment: l.treatment || 'INSIDE',
          od: l.od || '',
          slitting: g.mesin === 'SLITTING' ? 1 : 0,
          rewind: g.mesin === 'REWIND' ? 1 : 0,
          sml: g.mesin === 'SML' ? 1 : 0,
          machineName: g.mesin,
          tanggal: g.tanggal,
          tanggalFormatted: g.tanggal,
          spk: l.spk || '',
          kodePack: l.kodePack || '',
          subKode: l.subKode || '0000',
          qualityStatus: l.status || 'PASS',
          verified: 1,
          verifiedAt: g.verifiedAt,
          verifiedBy: g.verifiedBy,
          createdAt: l.createdAt || g.verifiedAt,
          updatedAt: l.updatedAt || g.verifiedAt
        }));

        const uploadData = {
          uuid: g.batchKey,
          uploadDate: g.verifiedAt,
          batchName: `Batch Verifikasi DE - ${g.tanggal} (${g.mesin})`,
          source: 'Verifikasi DE Report',
          fileName: `DE_Report_${g.mesin}_${g.tanggal}.xlsx`,
          machine: g.mesin,
          totalRolls,
          totalKg,
          passCount,
          holdCount,
          rejectCount,
          uploadedBy: g.verifiedBy,
          status: 'VERIFIED',
          rollsJson: JSON.stringify(standardizedRolls),
          updatedAt: new Date().toISOString()
        };

        if (existing) {
          await db.data_roll_uploads.update(existing.id, uploadData);
        } else {
          uploadData.createdAt = g.verifiedAt;
          await db.data_roll_uploads.add(uploadData);
        }
      }

      // Reload upload history list
      const updatedHistory = await db.data_roll_uploads.toArray();
      uploadHistory.value = updatedHistory.sort((a, b) => new Date(b.uploadDate || b.createdAt) - new Date(a.uploadDate || a.createdAt));
      pushLocalToSupabase().catch(() => {});
    } catch (err) {
      console.error('Failed to sync DE verified batches:', err);
    }
  };

  // Import rolls (replace or append) with chunked batch processing and upload tracking
  const importRolls = async (parsedItems, mode = 'append', meta = {}, onProgress = null) => {
    loading.value = true;
    try {
      if (mode === 'replace') {
        await db.data_rolls.clear();
        await db.data_roll_uploads.clear();
        await recordDataRollsWipedCloud();
        try {
          await supabase.from('data_rolls').delete().neq('uuid', 'keep_all');
        } catch (errCloud) {
          console.warn('Supabase clear data_rolls warning:', errCloud);
        }
      }
      const now = new Date().toISOString();
      const uploadUuid = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      
      // Filter out any ghost, empty, or header rows
      const validItems = (parsedItems || []).filter(item => {
        if (!item) return false;
        const lot = String(item.lot || item.fullLot || item.kodeFg || '').trim();
        const spk = String(item.spk || '').trim();
        const w = parseFloat(item.width || 0);
        const l = parseFloat(item.length || 0);

        if (/^(total|grand total|subtotal|sub total|jumlah|no lot|kode fg|deskripsi)$/i.test(lot)) return false;
        if (/^(total|grand total|subtotal|sub total|jumlah)$/i.test(spk)) return false;

        const hasLot = lot.length >= 2 && !/^0+$/.test(lot) && lot !== '-';
        const hasSpk = spk.length >= 2 && !/^0+$/.test(spk) && spk !== '-';
        if (!hasLot && !hasSpk) return false;
        if (!hasLot && w <= 0 && l <= 0) return false;
        return true;
      });

      if (validItems.length === 0) {
        return { success: false, error: 'Tidak ada baris data roll yang valid ditemukan.' };
      }

      const sanitized = validItems.map(item => ({
        ...item,
        uuid: item.uuid || `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        uploadId: uploadUuid,
        verified: 1,
        synced: 0,
        verifiedAt: item.verifiedAt || now,
        verifiedBy: meta.uploadedBy || 'Import Excel',
        createdAt: item.createdAt || now,
        updatedAt: now
      }));

      // Chunked bulkAdd (2,500 per chunk) to ensure smooth performance for 10k - 50k rows
      const CHUNK_SIZE = 2500;
      for (let i = 0; i < sanitized.length; i += CHUNK_SIZE) {
        const chunk = sanitized.slice(i, i + CHUNK_SIZE);
        await db.data_rolls.bulkAdd(chunk);
        
        if (onProgress) {
          const currentCount = Math.min(i + CHUNK_SIZE, sanitized.length);
          const percent = Math.round((currentCount / sanitized.length) * 100);
          onProgress({
            phase: 'saving',
            current: currentCount,
            total: sanitized.length,
            percent,
            message: `Menyimpan ${currentCount.toLocaleString()} dari ${sanitized.length.toLocaleString()} roll ke database (${percent}%)...`
          });
        }
        await new Promise(r => setTimeout(r, 0)); // Yield to keep UI responsive
      }

      // Create history batch entry
      if (db.data_roll_uploads) {
        const totalRollsCount = sanitized.length;
        const totalKgCount = parseFloat(sanitized.reduce((sum, r) => sum + (parseFloat(r.netto || r.berat || 0) || 0), 0).toFixed(2));
        const pCount = sanitized.filter(r => (r.qualityStatus || 'PASS').toUpperCase() === 'PASS').length;
        const hCount = sanitized.filter(r => (r.qualityStatus || '').toUpperCase() === 'HOLD').length;
        const rCount = sanitized.filter(r => (r.qualityStatus || '').toUpperCase() === 'REJECT').length;

        // Keep JSON light: for huge datasets, store sample 300 items so IndexedDB stays fast
        const sampleRolls = sanitized.length > 2000 ? sanitized.slice(0, 300) : sanitized;

        await db.data_roll_uploads.add({
          uuid: uploadUuid,
          uploadDate: meta.uploadDate || now,
          batchName: meta.batchName || (meta.fileName ? `Upload File: ${meta.fileName}` : `Upload Data Roll (${new Date().toLocaleDateString('id-ID')})`),
          source: meta.source || (meta.fileName ? `Import File Excel (${meta.fileName})` : 'Import Excel / Paste'),
          fileName: meta.fileName || 'Data_Roll.xlsx',
          machine: meta.machine || 'ALL',
          totalRolls: totalRollsCount,
          totalKg: totalKgCount,
          passCount: pCount,
          holdCount: hCount,
          rejectCount: rCount,
          uploadedBy: meta.uploadedBy || 'Admin / Operator',
          status: 'VERIFIED',
          verifiedAt: now,
          verifiedBy: meta.uploadedBy || 'Import Excel',
          rollsJson: JSON.stringify(sampleRolls),
          createdAt: now,
          updatedAt: now
        });
      }

      await loadRolls();
      await loadUploadHistory();
      pushLocalToSupabase().catch(() => {});
      return { success: true, count: sanitized.length };
    } catch (e) {
      console.error('Failed to import rolls:', e);
      return { success: false, error: e.message };
    } finally {
      loading.value = false;
    }
  };

  // Delete an upload history item and ALL its associated rolls
  const deleteUploadHistory = async (id, deleteAssociatedRolls = true) => {
    try {
      if (db.data_roll_uploads) {
        let item = await db.data_roll_uploads.get(id);
        if (!item && typeof id === 'string') {
          item = await db.data_roll_uploads.where('uuid').equals(id).first();
        }

        if (item && item.uuid) {
          // 1. Delete all rolls with this uploadId from db.data_rolls
          await db.data_rolls.where('uploadId').equals(item.uuid).delete();
          // Sync delete batch rolls from Supabase
          deleteFromSupabase('data_rolls', 'upload_id', item.uuid).catch(() => {});

          // 2. If it is a DE Report Batch (uuid starts with 'de_'), remove matching labels from db.labels
          if (item.uuid.startsWith('de_') && db.labels) {
            const parts = item.uuid.split('_'); // ['de', '2026-08-01', 'SLITTING']
            if (parts.length >= 3) {
              const bDate = parts[1];
              const bMesin = parts[2];
              const matchingLabels = await db.labels.filter(l => l.tanggal === bDate && (l.mesin || 'SLITTING').toUpperCase() === bMesin).toArray();
              if (matchingLabels.length > 0) {
                const labelIds = matchingLabels.map(l => l.id);
                const uniqIds = matchingLabels.map(l => l.uniqId).filter(Boolean);
                await db.labels.bulkDelete(labelIds);
                if (uniqIds.length > 0) {
                  deleteMultipleFromSupabase('labels', 'uniq_id', uniqIds).catch(() => {});
                }
              }
            }
          }

          // 3. Delete from data_roll_uploads table
          if (item.id) {
            await db.data_roll_uploads.delete(item.id);
          }
        } else if (typeof id === 'number') {
          await db.data_roll_uploads.delete(id);
        }

        await loadRolls();
        await loadUploadHistory();
        pushLocalToSupabase().catch(() => {});
      }
    } catch (e) {
      console.error('Failed to delete upload history:', e);
      throw e;
    }
  };

  // Add single roll
  const addRoll = async (item) => {
    try {
      const now = new Date().toISOString();
      const newRoll = {
        uuid: item.uuid || `roll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ...item,
        synced: 0,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.data_rolls.add(newRoll);
      await loadRolls(true);
      pushLocalToSupabase().catch(() => {});
      return id;
    } catch (e) {
      console.error('Failed to add roll:', e);
      throw e;
    }
  };

  // Update roll
  const updateRoll = async (id, updates) => {
    try {
      const now = new Date().toISOString();
      await db.data_rolls.update(id, {
        ...updates,
        synced: 0,
        updatedAt: now
      });
      await loadRolls(true);
      pushLocalToSupabase().catch(() => {});
    } catch (e) {
      console.error('Failed to update roll:', e);
      throw e;
    }
  };

  // Delete roll (supports both db.data_rolls and db.labels from DE Report)
  const deleteRoll = async (id) => {
    try {
      const isDeLabel = typeof id === 'string' && id.startsWith('de_label_');
      const itemInMemory = rolls.value.find(r => r.id === id);

      if (isDeLabel || itemInMemory?.originalLabelId) {
        const labelId = itemInMemory?.originalLabelId || (typeof id === 'string' ? parseInt(id.replace('de_label_', ''), 10) : id);
        const labelObj = db.labels ? await db.labels.get(labelId) : null;
        const uId = labelObj?.uniqId || itemInMemory?.uuid;
        if (uId) {
          recordTombstones('labels', [uId]);
          deleteFromSupabase('labels', 'uniq_id', uId).catch(() => {});
        }
        if (itemInMemory?.uuid) {
          recordTombstones('data_rolls', [itemInMemory.uuid]);
        }
        if (db.labels) await db.labels.delete(labelId);
      } else {
        const roll = await db.data_rolls.get(id);
        const uuid = roll?.uuid || itemInMemory?.uuid;
        if (uuid) {
          recordTombstones('data_rolls', [uuid]);
          deleteFromSupabase('data_rolls', 'uuid', uuid).catch(() => {});
        }
        await db.data_rolls.delete(id);
      }
      await loadRolls(true);
    } catch (e) {
      console.error('Failed to delete roll:', e);
      throw e;
    }
  };

  // Delete multiple rolls (supports both db.data_rolls and db.labels)
  const deleteMultiple = async (ids) => {
    try {
      const rollIds = [];
      const deLabelIds = [];
      const rollUuids = [];
      const labelUniqIds = [];

      for (const id of ids) {
        const item = rolls.value.find(r => r.id === id);
        const isDeLabel = (typeof id === 'string' && id.startsWith('de_label_')) || item?.originalLabelId;
        if (isDeLabel) {
          const lId = item?.originalLabelId || (typeof id === 'string' ? parseInt(id.replace('de_label_', ''), 10) : id);
          deLabelIds.push(lId);
          if (item?.uuid) labelUniqIds.push(item.uuid);
        } else {
          rollIds.push(id);
          if (item?.uuid) rollUuids.push(item.uuid);
        }
      }

      if (rollIds.length > 0 && db.data_rolls) {
        const rollsToDelete = await db.data_rolls.where('id').anyOf(rollIds).toArray();
        const foundUuids = rollsToDelete.map(r => r.uuid).filter(Boolean);
        const allUuids = [...new Set([...rollUuids, ...foundUuids])];
        if (allUuids.length > 0) {
          recordTombstones('data_rolls', allUuids);
          deleteMultipleFromSupabase('data_rolls', 'uuid', allUuids).catch(() => {});
        }
        await db.data_rolls.bulkDelete(rollIds);
      }

      if (deLabelIds.length > 0 && db.labels) {
        const labelsToDelete = await db.labels.where('id').anyOf(deLabelIds).toArray();
        const foundUniqIds = labelsToDelete.map(l => l.uniqId).filter(Boolean);
        const allUniqIds = [...new Set([...labelUniqIds, ...foundUniqIds])];
        if (allUniqIds.length > 0) {
          recordTombstones('labels', allUniqIds);
          deleteMultipleFromSupabase('labels', 'uniq_id', allUniqIds).catch(() => {});
        }
        await db.labels.bulkDelete(deLabelIds);
      }

      await loadRolls(true);
    } catch (e) {
      console.error('Failed to delete multiple rolls:', e);
      throw e;
    }
  };

  // Clear all rolls
  const clearAll = async () => {
    try {
      loading.value = true;
      // 1. Gather all existing UUIDs from rolls currently displayed
      const currentUuids = rolls.value.map(r => r.uuid).filter(Boolean);
      const deLabelIds = [];
      const deLabelUniqIds = [];

      for (const r of rolls.value) {
        if (r.source === 'DE Report' || (typeof r.id === 'string' && r.id.startsWith('de_label_')) || r.originalLabelId) {
          const lId = r.originalLabelId || (typeof r.id === 'string' ? parseInt(r.id.replace('de_label_', ''), 10) : null);
          if (lId) deLabelIds.push(lId);
          if (r.uuid) deLabelUniqIds.push(r.uuid);
        }
      }

      // 2. Also gather all UUIDs from db.data_rolls directly
      const allExisting = db.data_rolls ? await db.data_rolls.toArray() : [];
      const explicitUuids = allExisting.map(r => r.uuid).filter(Boolean);

      // 3. Also gather all from db.labels if any DE rolls
      if (db.labels) {
        const allLabelsInDb = await db.labels.toArray();
        for (const l of allLabelsInDb) {
          if (l.uniqId) deLabelUniqIds.push(l.uniqId);
          deLabelIds.push(l.id);
        }
      }

      const allRollUuids = [...new Set([...currentUuids, ...explicitUuids])];
      if (allRollUuids.length > 0) {
        recordTombstones('data_rolls', allRollUuids);
      }
      const uniqueDeLabelIds = [...new Set(deLabelIds)];
      const uniqueDeLabelUniqIds = [...new Set(deLabelUniqIds.filter(Boolean))];
      if (uniqueDeLabelUniqIds.length > 0) {
        recordTombstones('labels', uniqueDeLabelUniqIds);
      }

      // 4. Clear local db.data_rolls
      if (db.data_rolls) {
        await db.data_rolls.clear();
      }

      // 5. Delete matching DE labels if user wants full wipe
      if (uniqueDeLabelIds.length > 0 && db.labels) {
        await db.labels.bulkDelete(uniqueDeLabelIds);
        if (uniqueDeLabelUniqIds.length > 0) {
          deleteMultipleFromSupabase('labels', 'uniq_id', uniqueDeLabelUniqIds).catch(() => {});
        }
      }

      // 6. Clear batch uploads if any
      if (db.data_roll_uploads) {
        await db.data_roll_uploads.clear();
      }

      rolls.value = [];
      uploadHistory.value = [];

      // 7. Delete all from Supabase data_rolls
      try {
        await supabase.from('data_rolls').delete().neq('uuid', 'keep_all');
      } catch (errCloud) {
        console.warn('Supabase clear data_rolls warning:', errCloud);
      }

      // 8. Catat wipe persisten ke Cloud Supabase agar perangkat lain otomatis bersih
      await recordDataRollsWipedCloud();

      // 9. Broadcast clear ke semua perangkat lain yang sedang online
      await broadcastClearAllRolls();
    } catch (e) {
      console.error('Failed to clear data_rolls:', e);
      throw e;
    } finally {
      loading.value = false;
    }
  };

  // Export to Excel & Auto-record as Verified Batch
  const exportToExcel = async (itemsToExport = null, customFileName = null) => {
    if (isWindowed.value && !itemsToExport) {
      const { startLoading, stopLoading } = useGlobalLoading();
      startLoading('Menyiapkan seluruh arsip data roll untuk diekspor ke Excel...');
      try {
        await loadAllRolls();
      } finally {
        stopLoading();
      }
    }
    const list = itemsToExport || filteredRolls.value;
    if (!list || list.length === 0) return;
    const XLSX = await import('xlsx');

    const data = list.map((r, idx) => {
      // Pastikan Lot FG bersih dari turunan (e.g. M07260626A201/F201 murni, bukan M07260626A201/F201/GA07)
      const cleanParent = extractCleanParentLot(r.lot || r.parentLot || r.baseLot, r.turunan);
      return {
        'No': idx + 1,
        'Kode FG': r.kodeFg || `${cleanParent}${r.turunan ? '/' + r.turunan : ''} ${r.jenis || ''} ${r.kodeFormula || ''}`,
        'SLITTING': r.slitting ? 1 : 0,
        'REWIND': r.rewind ? 1 : 0,
        'SML': r.sml ? 1 : 0,
        'Tanggal': r.tanggalFormatted || r.tanggal,
        'No SPK': r.spk,
        'Kode Pack': `${r.kodePack || ''}${r.subKode || ''}`,
        'Quality Status': r.qualityStatus || r.status || 'PASS',
        'REASON OF DEFECT': r.reasonDefect || r.keterangan || '',
        'Lot FG': cleanParent, // Parent murni tanpa turunan child!
        'Turunan': r.turunan || '',
        'Jenis': r.jenis,
        'Kode Formula': r.kodeFormula,
        'Micron': r.thickness,
        'Lebar (MM)': r.width,
        'Panjang (M)': r.length,
        'Core (Inch)': r.core,
        'Treatment': r.treatment || 'INSIDE',
        'OD': r.od
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Data Roll Identitas');

    const dateStr = new Date().toISOString().slice(0, 10);
    const fileName = customFileName || `Data_Roll_Identitas_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    // Auto-record export into db.data_roll_uploads as a verified batch
    try {
      if (db.data_roll_uploads) {
        const now = new Date().toISOString();
        const exportUuid = 'batch_export_' + Date.now();
        const totalRollsCount = list.length;
        const totalKgCount = parseFloat(list.reduce((sum, r) => sum + (parseFloat(r.netto || r.berat || 0) || 0), 0).toFixed(2));
        const pCount = list.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length;
        const hCount = list.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length;
        const rCount = list.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length;
        const machine = list[0]?.machineName || list[0]?.mesin || (list[0]?.slitting ? 'SLITTING' : (list[0]?.rewind ? 'REWIND' : 'ALL'));

        await db.data_roll_uploads.add({
          uuid: exportUuid,
          uploadDate: now,
          batchName: customFileName ? `Export Data Roll: ${customFileName}` : `Batch Export Data Roll (${new Date().toLocaleDateString('id-ID')})`,
          source: 'Export Excel Data Roll',
          fileName: fileName,
          machine: machine,
          totalRolls: totalRollsCount,
          totalKg: totalKgCount,
          passCount: pCount,
          holdCount: hCount,
          rejectCount: rCount,
          uploadedBy: 'Data Roll Export',
          status: 'VERIFIED',
          rollsJson: JSON.stringify(list.length > 5000 ? list.slice(0, 1000) : list),
          createdAt: now,
          updatedAt: now
        });
        await loadUploadHistory();
      }
    } catch (err) {
      console.warn('Failed to auto-record export batch:', err);
    }
  };

  return {
    rolls,
    uploadHistory,
    loading,
    filterSearch,
    filterMachine,
    filterStatus,
    sortDirection,
    totalDbRolls,
    isWindowed,
    totalRolls,
    passCount,
    holdCount,
    rejectCount,
    slittingCount,
    rewindCount,
    smlCount,
    filteredRolls,
    loadRolls,
    loadAllRolls,
    loadUploadHistory,
    syncVerifiedDeBatches,
    importRolls,
    deleteUploadHistory,
    addRoll,
    updateRoll,
    deleteRoll,
    deleteMultiple,
    clearAll,
    exportToExcel
  };
});

// Auto-reload dataRollStore whenever cloud sync or realtime updates data_rolls (debounced)
if (typeof window !== 'undefined' && !window.__mlabel_data_roll_sync_listener_attached) {
  window.__mlabel_data_roll_sync_listener_attached = true;
  let reloadTimer = null;
  window.addEventListener('sync:data-rolls-updated', () => {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(async () => {
      try {
        const store = useDataRollStore();
        await store.loadRolls(true);
      } catch (e) {
        console.warn('Auto reload dataRollStore failed:', e);
      }
    }, 1500);
  });

  window.addEventListener('sync:data-roll-uploads-updated', () => {
    try {
      const store = useDataRollStore();
      store.loadUploadHistory();
    } catch (e) {
      console.warn('Auto reload uploadHistory failed:', e);
    }
  });
}
