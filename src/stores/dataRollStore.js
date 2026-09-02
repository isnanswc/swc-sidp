import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/db';
import * as XLSX from 'xlsx';
import { parseContinuousLot, detectSupplier, extractCleanParentLot } from '@/services/dataRollParserService';

export const useDataRollStore = defineStore('dataRollStore', () => {
  const rolls = ref([]);
  const uploadHistory = ref([]);
  const loading = ref(false);
  const filterSearch = ref('');
  const filterMachine = ref('ALL'); // 'ALL' | 'SLITTING' | 'REWIND' | 'SML'
  const filterStatus = ref('ALL');  // 'ALL' | 'PASS' | 'HOLD' | 'REJECT'
  const sortDirection = ref('desc'); // 'desc' | 'asc'

  // Computed metrics
  const totalRolls = computed(() => rolls.value.length);
  const passCount = computed(() => rolls.value.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length);
  const holdCount = computed(() => rolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length);
  const rejectCount = computed(() => rolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length);

  const slittingCount = computed(() => rolls.value.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SLITTING').length);
  const rewindCount = computed(() => rolls.value.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'REWIND').length);
  const smlCount = computed(() => rolls.value.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SML').length);

  // Multi-level Hierarchical Sorting Comparator
  // 1. Tanggal -> 2. Mesin -> 3. No. Lot (Slitting & Induk) -> 4. Turunan Set & Arm (HA01, HC01, HA02...) -> 5. Kode Pack
  const sortDataRolls = (a, b) => {
    // 1. Tanggal (Date)
    const dateA = String(a.tanggalFormatted || a.tanggal || '');
    const dateB = String(b.tanggalFormatted || b.tanggal || '');
    const dateComp = sortDirection.value === 'desc' 
      ? dateB.localeCompare(dateA) 
      : dateA.localeCompare(dateB);
    if (dateComp !== 0) return dateComp;

    // 2. Mesin (Machine)
    const getMachineName = (item) => {
      if (item.machineName) return String(item.machineName).toUpperCase();
      if (item.mesin) return String(item.mesin).toUpperCase();
      if (item.slitting) return 'SLITTING';
      if (item.rewind) return 'REWIND';
      if (item.sml) return 'SML';
      return 'SLITTING';
    };
    const machA = getMachineName(a);
    const machB = getMachineName(b);
    const machComp = machA.localeCompare(machB);
    if (machComp !== 0) return machComp;

    // 3. No. Lot (Lot Induk & Batch Slitting, misal M07210726A210/D108 vs M07270726B205/F104)
    const getBaseLot = (item) => {
      const full = String(item.lot || '').toUpperCase();
      const parts = full.split('/');
      if (parts.length >= 3) {
        return parts.slice(0, -1).join('/'); // take M07210726A210/D108
      }
      return full;
    };
    const baseLotA = getBaseLot(a);
    const baseLotB = getBaseLot(b);
    const lotComp = baseLotA.localeCompare(baseLotB, undefined, { numeric: true, sensitivity: 'base' });
    if (lotComp !== 0) return lotComp;

    // 4. Turunan (Set Potong & Arm: HA01 -> HC01 -> HA02 -> HC02...)
    const getTurunanKey = (item) => {
      let t = String(item.turunan || '').toUpperCase();
      if (!t && item.lot) {
        const parts = String(item.lot).split('/');
        if (parts.length >= 2) t = parts[parts.length - 1].toUpperCase();
      }
      // Extract numeric suffix if any (e.g. HA01 -> num: 1, prefix: HA)
      const match = t.match(/^([A-Za-z]+)(\d+)(.*)$/);
      if (match) {
        const prefix = match[1];
        const num = parseInt(match[2], 10);
        const extra = match[3] || '';
        return { num, prefix, extra, raw: t };
      }
      return { num: 999999, prefix: t, extra: '', raw: t };
    };

    const tA = getTurunanKey(a);
    const tB = getTurunanKey(b);

    // First compare Set Number (e.g. 01 before 02)
    if (tA.num !== tB.num) {
      return tA.num - tB.num;
    }
    // Then compare Arm prefix (e.g. HA before HC)
    if (tA.prefix !== tB.prefix) {
      return tA.prefix.localeCompare(tB.prefix);
    }
    if (tA.extra !== tB.extra) {
      return tA.extra.localeCompare(tB.extra);
    }

    // 5. Kode Pack / Codepack
    const packA = String(a.kodePack || a.noPack || '').toUpperCase();
    const packB = String(b.kodePack || b.noPack || '').toUpperCase();
    const packComp = packA.localeCompare(packB, undefined, { numeric: true, sensitivity: 'base' });
    if (packComp !== 0) return packComp;

    return 0;
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
  const loadRolls = async () => {
    loading.value = true;
    try {
      const rawExplicit = db.data_rolls ? await db.data_rolls.toArray() : [];
      const explicitRolls = rawExplicit.map(r => {
        let lot = r.lot || '';
        let turunan = r.turunan || '';
        let kodeOperator = r.kodeOperator || '';
        let shift = r.shift || '';
        const supplier = r.supplier || detectSupplier(r.kodeFg || lot, r.spk);

        if (lot && !lot.includes('/')) {
          const parsed = parseContinuousLot(lot, r.machineName || (r.slitting ? 'SLITTING' : 'REWIND'), supplier);
          if (parsed && parsed.parsedLot) {
            lot = parsed.parsedLot;
            turunan = turunan || parsed.turunan;
            kodeOperator = kodeOperator || parsed.kodeOperator;
            shift = shift || parsed.shift || '';
          }
        }

        return {
          ...r,
          lot,
          turunan,
          kodeOperator: kodeOperator || (turunan ? turunan.charAt(0) : 'G'),
          operator: r.operator || (kodeOperator ? `OPERATOR ${kodeOperator}` : 'OPERATOR'),
          shift,
          supplier
        };
      });

      // Also load all labels from DE Report (db.labels)
      let deRolls = [];
      if (db.labels) {
        const labelsList = await db.labels.toArray();
        deRolls = labelsList.map(l => {
          const rawDate = l.tanggal || (l.verifiedAt ? l.verifiedAt.slice(0, 10) : (l.createdAt ? l.createdAt.slice(0, 10) : new Date().toISOString().slice(0, 10)));
          const mesin = (l.mesin || 'SLITTING').toUpperCase();
          const thickness = String(l.thickness || l.tebal || l.thick || '20');
          const width = String(l.width || l.lebar || '1000');
          const length = String(l.length || l.meter || l.panjang || '4000');
          const core = l.paperCore ? (String(l.paperCore).includes('3') ? 3 : 6) : 6;
          const status = (l.status || 'PASS').toUpperCase();

          return {
            id: `de_label_${l.id}`,
            originalLabelId: l.id,
            uuid: l.uniqId || `de_roll_${l.id}`,
            uploadId: `de_${rawDate}_${mesin}`,
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
            tanggal: rawDate,
            tanggalFormatted: rawDate,
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
            createdAt: l.createdAt || rawDate,
            updatedAt: l.updatedAt || rawDate
          };
        });
      }

      // Combine both sources, avoiding duplicate UUIDs / IDs
      const combinedMap = new Map();
      for (const r of explicitRolls) {
        const key = r.uuid || `${r.lot}_${r.turunan}_${r.kodePack}_${r.subKode}`;
        combinedMap.set(key, r);
      }
      for (const r of deRolls) {
        const key = r.uuid || `${r.lot}_${r.turunan}_${r.kodePack}_${r.subKode}`;
        if (!combinedMap.has(key)) {
          combinedMap.set(key, r);
        }
      }

      rolls.value = Array.from(combinedMap.values());
      await loadUploadHistory();
    } catch (e) {
      console.error('Failed to load data_rolls:', e);
      rolls.value = [];
    } finally {
      loading.value = false;
    }
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
          thickness: String(l.thickness || '20'),
          width: String(l.width || '1000'),
          length: String(l.length || l.meter || '4000'),
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
      }
      const now = new Date().toISOString();
      const uploadUuid = 'upload_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
      
      const sanitized = parsedItems.map(item => ({
        ...item,
        uploadId: uploadUuid,
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
          status: 'SUCCESS',
          rollsJson: JSON.stringify(sampleRolls),
          createdAt: now,
          updatedAt: now
        });
      }

      await loadRolls();
      await loadUploadHistory();
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

          // 2. If it is a DE Report Batch (uuid starts with 'de_'), remove matching labels from db.labels
          if (item.uuid.startsWith('de_') && db.labels) {
            const parts = item.uuid.split('_'); // ['de', '2026-08-01', 'SLITTING']
            if (parts.length >= 3) {
              const bDate = parts[1];
              const bMesin = parts[2];
              const matchingLabels = await db.labels.filter(l => l.tanggal === bDate && (l.mesin || 'SLITTING').toUpperCase() === bMesin).toArray();
              if (matchingLabels.length > 0) {
                const labelIds = matchingLabels.map(l => l.id);
                await db.labels.bulkDelete(labelIds);
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
        ...item,
        createdAt: now,
        updatedAt: now
      };
      const id = await db.data_rolls.add(newRoll);
      await loadRolls();
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
        updatedAt: now
      });
      await loadRolls();
    } catch (e) {
      console.error('Failed to update roll:', e);
      throw e;
    }
  };

  // Delete roll
  const deleteRoll = async (id) => {
    try {
      await db.data_rolls.delete(id);
      await loadRolls();
    } catch (e) {
      console.error('Failed to delete roll:', e);
      throw e;
    }
  };

  // Delete multiple rolls
  const deleteMultiple = async (ids) => {
    try {
      await db.data_rolls.bulkDelete(ids);
      await loadRolls();
    } catch (e) {
      console.error('Failed to delete multiple rolls:', e);
      throw e;
    }
  };

  // Clear all rolls
  const clearAll = async () => {
    try {
      await db.data_rolls.clear();
      rolls.value = [];
    } catch (e) {
      console.error('Failed to clear data_rolls:', e);
      throw e;
    }
  };

  // Export to Excel
  const exportToExcel = (itemsToExport = null, customFileName = null) => {
    const list = itemsToExport || filteredRolls.value;
    if (!list || list.length === 0) return;

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
  };

  return {
    rolls,
    uploadHistory,
    loading,
    filterSearch,
    filterMachine,
    filterStatus,
    sortDirection,
    totalRolls,
    passCount,
    holdCount,
    rejectCount,
    slittingCount,
    rewindCount,
    smlCount,
    filteredRolls,
    loadRolls,
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
