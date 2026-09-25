import { ref, reactive } from 'vue';
import { supabase } from './supabaseClient';
import { db } from '@/db';

export { supabase };

export const syncState = reactive({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: localStorage.getItem('mlabel_last_sync_time') || null,
  lastSyncIso: localStorage.getItem('mlabel_last_sync_iso') || null,
  unsyncedCount: 0,
  realtimeConnected: false,
  lastError: null
});

// Network liveness listeners
window.addEventListener('online', () => {
  syncState.isOnline = true;
  syncAll(false);
});
window.addEventListener('offline', () => {
  syncState.isOnline = false;
});

// Helper to convert label from Dexie format to Supabase snake_case format
function mapLabelToSupabase(l) {
  // Simpan mesin, keterangan, shift, diameterCore, serta Parent Metadata ke dalam synced_by sebagai JSON metadata
  // Hal ini menjamin 100% data tersimpan di Supabase tanpa memicu schema error PostgREST (PGRST204)
  const meta = {
    mesin: l.mesin || '',
    keterangan: l.keterangan || '',
    shift: l.shift || '',
    diameterCore: l.diameterCore || (parseFloat(l.paperCore) < 4.5 && parseFloat(l.paperCore) > 0 ? 3 : 6),
    parentWidth: l.parentWidth !== undefined && l.parentWidth !== null ? l.parentWidth : '',
    parentTrim: l.parentTrim !== undefined && l.parentTrim !== null ? l.parentTrim : 0,
    parentMeter: l.parentMeter !== undefined && l.parentMeter !== null ? l.parentMeter : '',
    parentSisaMeter: l.parentSisaMeter !== undefined && l.parentSisaMeter !== null ? l.parentSisaMeter : 0,
    parentSisaKg: l.parentSisaKg !== undefined && l.parentSisaKg !== null ? l.parentSisaKg : 0,
    parentDensity: l.parentDensity || 0.91,
    parentBeratTeori: l.parentBeratTeori !== undefined && l.parentBeratTeori !== null ? l.parentBeratTeori : null,
    parentBeratAktual: l.parentBeratAktual !== undefined && l.parentBeratAktual !== null ? l.parentBeratAktual : null,
    parentBeratMasuk: l.parentBeratMasuk !== undefined && l.parentBeratMasuk !== null ? l.parentBeratMasuk : null,
    parentRollsJoint: l.parentRollsJoint || null,
    resinConsumptions: l.resinConsumptions || null,
    shiftWaste: l.shiftWaste !== undefined && l.shiftWaste !== null ? l.shiftWaste : 0,
    shiftWasteNote: l.shiftWasteNote || '',
    shiftWasteDetails: l.shiftWasteDetails || null
  };

  return {
    uniq_id: l.uniqId || l.uuid || `LBL-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    supplier: l.supplier || '',
    spk: l.spk || '',
    lot: l.lot || '',
    turunan: l.turunan || '',
    operator: l.operator || '',
    kode_operator: l.kodeOperator || '',
    jenis: l.jenis || '',
    type: l.type || '',
    kode: l.kode || '',
    thickness: parseFloat(l.thickness) || 0,
    width: parseFloat(l.width) || 0,
    length: parseFloat(l.length) || 0,
    meter: parseFloat(l.meter) || 0,
    joint: parseFloat(l.joint) || 0,
    netto: parseFloat(l.netto) || 0,
    paper_core: parseFloat(l.paperCore) || 0,
    kode_pack: l.kodePack || '',
    sub_kode: l.subKode || '',
    status: l.status || 'PASS',
    treatment: l.treatment || '',
    od: l.od || '',
    tanggal: l.tanggal || '',
    jenis_print: l.jenisPrint || '',
    verified: Boolean(l.verified),
    synced_by: JSON.stringify(meta),
    is_deleted: Boolean(l.isDeleted),
    created_at: l.createdAt || new Date().toISOString(),
    updated_at: l.updatedAt || new Date().toISOString()
  };
}

// Helper to convert label from Supabase snake_case format to Dexie format
function mapLabelFromSupabase(s) {
  let meta = {};
  if (s.synced_by) {
    try {
      meta = typeof s.synced_by === 'string' && s.synced_by.startsWith('{')
        ? JSON.parse(s.synced_by)
        : (typeof s.synced_by === 'object' && s.synced_by !== null ? s.synced_by : {});
    } catch (e) {
      meta = {};
    }
  }

  return {
    uniqId: s.uniq_id,
    supplier: s.supplier,
    spk: s.spk,
    lot: s.lot,
    turunan: s.turunan,
    operator: s.operator,
    kodeOperator: s.kode_operator,
    jenis: s.jenis,
    type: s.type,
    kode: s.kode,
    thickness: s.thickness,
    width: s.width,
    length: s.length,
    meter: s.meter,
    joint: s.joint,
    netto: s.netto,
    paperCore: s.paper_core,
    kodePack: s.kode_pack,
    subKode: s.sub_kode,
    status: s.status,
    treatment: s.treatment,
    od: s.od,
    tanggal: s.tanggal,
    jenisPrint: s.jenis_print,
    verified: s.verified,
    mesin: s.mesin || meta.mesin || '',
    keterangan: s.keterangan || meta.keterangan || '',
    shift: s.shift || meta.shift || '',
    diameterCore: s.diameter_core || meta.diameterCore || (parseFloat(s.paper_core) < 4.5 && parseFloat(s.paper_core) > 0 ? 3 : 6),
    parentWidth: s.parent_width || (meta.parentWidth !== undefined ? meta.parentWidth : ''),
    parentTrim: s.parent_trim !== undefined ? s.parent_trim : (meta.parentTrim !== undefined ? meta.parentTrim : 0),
    parentMeter: s.parent_meter || (meta.parentMeter !== undefined ? meta.parentMeter : ''),
    parentSisaMeter: s.parent_sisa_meter !== undefined ? s.parent_sisa_meter : (meta.parentSisaMeter !== undefined ? meta.parentSisaMeter : 0),
    parentSisaKg: s.parent_sisa_kg !== undefined ? s.parent_sisa_kg : (meta.parentSisaKg !== undefined ? meta.parentSisaKg : 0),
    parentDensity: s.parent_density || meta.parentDensity || 0.91,
    parentBeratTeori: s.parent_berat_teori !== undefined ? s.parent_berat_teori : (meta.parentBeratTeori !== undefined ? meta.parentBeratTeori : null),
    parentBeratAktual: s.parent_berat_aktual !== undefined ? s.parent_berat_aktual : (meta.parentBeratAktual !== undefined ? meta.parentBeratAktual : null),
    parentBeratMasuk: s.parent_berat_masuk !== undefined ? s.parent_berat_masuk : (meta.parentBeratMasuk !== undefined ? meta.parentBeratMasuk : null),
    parentRollsJoint: meta.parentRollsJoint || null,
    resinConsumptions: meta.resinConsumptions || null,
    shiftWaste: meta.shiftWaste !== undefined ? meta.shiftWaste : 0,
    shiftWasteNote: meta.shiftWasteNote || '',
    shiftWasteDetails: meta.shiftWasteDetails || null,
    synced: 1,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
}

// Map SPK Plan
function mapSpkPlanToSupabase(p) {
  return {
    uuid: p.uuid || `spk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    batch_id: p.batchId || null,
    seq: parseInt(p.seq, 10) || 1,
    spk_no: p.spkNo || '',
    doc_no: p.docNo || '3B-PROD',
    formula: p.formula || '',
    jenis: p.jenis || '',
    thickness: parseFloat(p.thickness) || 0,
    lebar_parent: parseFloat(p.lebarParent) || 0,
    panjang_parent: parseFloat(p.panjangParent) || 0,
    jumlah_jumbo: parseInt(p.jumlahJumbo, 10) || 1,
    total_planned_rolls: parseInt(p.totalPlannedRolls, 10) || 0,
    total_planned_meter: parseFloat(p.totalPlannedMeter) || 0,
    total_planned_kg: parseFloat(p.totalPlannedKg) || 0,
    charting_json: p.chartingJson ? (typeof p.chartingJson === 'string' ? JSON.parse(p.chartingJson) : p.chartingJson) : [],
    trim_auto: parseFloat(p.trimAuto) || 0,
    keterangan: p.keterangan || '',
    status: p.status || 'PLANNED',
    source: p.source || 'AI_SCAN',
    revisions_count: parseInt(p.revisionsCount, 10) || 0,
    tanggal: p.tanggal || '',
    is_deleted: false,
    created_at: p.createdAt || new Date().toISOString(),
    updated_at: p.updatedAt || new Date().toISOString()
  };
}

function mapSpkPlanFromSupabase(s) {
  return {
    uuid: s.uuid,
    batchId: s.batch_id,
    seq: s.seq,
    spkNo: s.spk_no,
    docNo: s.doc_no,
    formula: s.formula,
    jenis: s.jenis,
    thickness: s.thickness,
    lebarParent: s.lebar_parent,
    panjangParent: s.panjang_parent,
    jumlahJumbo: s.jumlah_jumbo,
    totalPlannedRolls: s.total_planned_rolls,
    totalPlannedMeter: s.total_planned_meter,
    totalPlannedKg: s.total_planned_kg,
    chartingJson: typeof s.charting_json === 'string' ? s.charting_json : JSON.stringify(s.charting_json || []),
    trimAuto: s.trim_auto,
    keterangan: s.keterangan,
    status: s.status,
    source: s.source,
    revisionsCount: s.revisions_count,
    tanggal: s.tanggal,
    synced: 1,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
}

// Map Data Rolls
function mapDataRollToSupabase(r) {
  return {
    uuid: r.uuid || `roll_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    upload_id: r.uploadId || '',
    batch_id: r.batchId || '',
    kode_fg: r.kodeFg || '',
    lot: r.lot || '',
    turunan: r.turunan || '',
    jenis: r.jenis || '',
    kode_formula: r.kodeFormula || '',
    thickness: parseFloat(r.thickness) || 0,
    width: parseFloat(r.width) || 0,
    length: parseFloat(r.length) || 0,
    core: parseFloat(r.core) || 6,
    treatment: r.treatment || '',
    od: r.od || '',
    slitting: String(r.slitting || ''),
    rewind: String(r.rewind || ''),
    sml: String(r.sml || ''),
    machine_name: r.machineName || '',
    tanggal: r.tanggal || '',
    tanggal_formatted: r.tanggalFormatted || '',
    spk: r.spk || '',
    kode_pack: r.kodePack || '',
    sub_kode: r.subKode || '',
    quality_status: r.qualityStatus || r.status || 'PASS',
    verified: Boolean(r.verified),
    is_deleted: false,
    created_at: r.createdAt || new Date().toISOString(),
    updated_at: r.updatedAt || new Date().toISOString()
  };
}

function mapDataRollFromSupabase(s) {
  return {
    uuid: s.uuid,
    uploadId: s.upload_id,
    batchId: s.batch_id,
    kodeFg: s.kode_fg,
    lot: s.lot,
    turunan: s.turunan,
    jenis: s.jenis,
    kodeFormula: s.kode_formula,
    thickness: s.thickness,
    width: s.width,
    length: s.length,
    core: s.core,
    treatment: s.treatment,
    od: s.od,
    slitting: s.slitting === '1' || s.slitting === 1 ? 1 : 0,
    rewind: s.rewind === '1' || s.rewind === 1 ? 1 : 0,
    sml: s.sml === '1' || s.sml === 1 ? 1 : 0,
    machineName: s.machine_name,
    tanggal: s.tanggal,
    tanggalFormatted: s.tanggal_formatted,
    spk: s.spk,
    kodePack: s.kode_pack,
    subKode: s.sub_kode,
    qualityStatus: s.quality_status,
    operator: s.operator || '',
    keterangan: s.keterangan || s.reason_defect || '',
    reasonDefect: s.reason_defect || s.keterangan || '',
    netto: s.netto !== undefined ? s.netto : undefined,
    verified: s.verified ? 1 : 0,
    synced: 1,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
}

// Map WIP Roll to Supabase Format
function mapWipRollToSupabase(w) {
  return {
    uuid: w.uuid || `wip_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    update_id: w.updateId || '',
    tanggal_spk: w.tanggalSpk || w.tanggalInput || '',
    spk: w.spk || '',
    lot: w.lot || '',
    jenis: w.jenis || '',
    kode_formula: w.kodeFormula || '',
    thickness: parseFloat(w.thickness) || 0,
    width: parseFloat(w.width) || 0,
    length: parseFloat(w.length) || 0,
    core: parseFloat(w.core) || 6,
    od: w.od || '',
    tanda: w.tanda || '',
    berat_aktual: parseFloat(w.beratAktual) || 0,
    berat_teori: parseFloat(w.beratTeori) || 0,
    lokasi_aktif: w.lokasiAktif || '',
    posisi_aktif: w.posisiAktif || '',
    description_excel: w.descriptionExcel || '',
    description_nav: w.descriptionNav || '',
    keterangan: w.keterangan || '',
    status: w.status || 'AVAILABLE',
    is_deleted: false,
    created_at: w.createdAt || new Date().toISOString(),
    updated_at: w.updatedAt || new Date().toISOString()
  };
}

function mapWipRollFromSupabase(s) {
  return {
    uuid: s.uuid,
    updateId: s.update_id,
    tanggalSpk: s.tanggal_spk,
    tanggalInput: s.tanggal_spk,
    spk: s.spk,
    lot: s.lot,
    jenis: s.jenis,
    kodeFormula: s.kode_formula,
    thickness: s.thickness,
    width: s.width,
    length: s.length,
    core: s.core,
    od: s.od,
    tanda: s.tanda,
    beratAktual: s.berat_aktual,
    beratTeori: s.berat_teori,
    lokasiAktif: s.lokasi_aktif,
    posisiAktif: s.posisi_aktif,
    descriptionExcel: s.description_excel,
    descriptionNav: s.description_nav,
    keterangan: s.keterangan,
    status: s.status || 'AVAILABLE',
    synced: 1,
    createdAt: s.created_at,
    updatedAt: s.updated_at
  };
}

// ── TOMBSTONES: Cegah data yang sudah dihapus diunggah kembali (resurrect loop) ──
const TOMBSTONE_MAX = 50000;
export function getTombstones(key) {
  try {
    const raw = localStorage.getItem(`mlabel_deleted_${key}`);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function recordTombstones(key, ids) {
  try {
    const list = Array.isArray(ids) ? ids : [ids];
    const current = new Set(getTombstones(key));
    list.forEach(id => { if (id) current.add(id); });
    const arr = Array.from(current);
    const trimmed = arr.length > TOMBSTONE_MAX ? arr.slice(arr.length - TOMBSTONE_MAX) : arr;
    localStorage.setItem(`mlabel_deleted_${key}`, JSON.stringify(trimmed));
  } catch (e) {
    console.warn('Failed to record tombstones:', e);
  }
}

export function removeTombstones(key, ids) {
  try {
    const list = Array.isArray(ids) ? ids : (ids instanceof Set ? Array.from(ids) : [ids]);
    if (!list || list.length === 0) return;
    const toRemove = new Set(list);
    const current = getTombstones(key);
    const filtered = current.filter(id => !toRemove.has(id));
    localStorage.setItem(`mlabel_deleted_${key}`, JSON.stringify(filtered));
  } catch (e) {
    console.warn('Failed to remove tombstones:', e);
  }
}

export function clearTombstones(key) {
  try {
    localStorage.removeItem(`mlabel_deleted_${key}`);
  } catch (e) {
    console.warn('Failed to clear tombstones:', e);
  }
}

export function isTombstoned(key, id) {
  if (!id) return false;
  const current = getTombstones(key);
  return current.includes(id);
}

// ── SYNC DELETES: Hapus data dari Supabase agar tidak ditarik kembali ──────────
export async function deleteFromSupabase(table, column, value) {
  if (!value) return;
  // Catat ke tombstone lokal agar device ini tidak pernah re-push jika masih tersisa
  if (column === 'uuid' || column === 'uniq_id' || column === 'nama') {
    recordTombstones(table, [String(value).toUpperCase()]);
  }
  if (!navigator.onLine) return;
  try {
    const valStr = String(value).trim();
    let { error } = await supabase.from(table).delete().eq(column, valStr);
    if (error && column === 'nama') {
      const res = await supabase.from(table).delete().ilike('nama', valStr);
      error = res.error;
    }
    if (error) {
      console.warn(`[SyncDelete] Gagal hapus dari ${table} (${column} = ${value}):`, error.message);
    } else {
      console.log(`[SyncDelete] Berhasil hapus dari ${table} (${column} = ${value})`);
    }
  } catch (err) {
    console.warn(`[SyncDelete] Error saat hapus dari ${table}:`, err);
  }
}

export async function deleteMultipleFromSupabase(table, column, values) {
  if (!Array.isArray(values) || values.length === 0) return;
  if (column === 'uuid' || column === 'uniq_id') {
    recordTombstones(table, values);
  }
  if (!navigator.onLine) return;
  try {
    const CHUNK = 500;
    for (let i = 0; i < values.length; i += CHUNK) {
      const chunk = values.slice(i, i + CHUNK);
      const { error } = await supabase.from(table).delete().in(column, chunk);
      if (error) {
        console.warn(`[SyncDelete] Gagal bulk delete dari ${table}:`, error.message);
      }
    }
  } catch (err) {
    console.warn(`[SyncDelete] Error saat bulk delete dari ${table}:`, err);
  }
}

// ── GLOBAL WIPE TRACKER: Tandai di Cloud saat database di-reset agar device lain ikut bersih ──
export async function recordDataRollsWipedCloud() {
  const nowIso = new Date().toISOString();
  localStorage.setItem('mlabel_local_data_rolls_wiped_at', String(new Date(nowIso).getTime()));
  clearTombstones('data_rolls');
  if (!navigator.onLine) return;
  try {
    await supabase.from('settings').upsert([
      { key: 'data_rolls_wiped_at', value: nowIso, updated_at: nowIso }
    ], { onConflict: 'key' });
    console.log('[SyncWipe] Berhasil mencatat data_rolls_wiped_at di cloud');
  } catch (e) {
    console.warn('[SyncWipe] Gagal mencatat data_rolls_wiped_at di cloud:', e);
  }
}

export async function recordLabelsWipedCloud() {
  const nowIso = new Date().toISOString();
  localStorage.setItem('mlabel_local_labels_wiped_at', String(new Date(nowIso).getTime()));
  clearTombstones('labels');
  if (!navigator.onLine) return;
  try {
    await supabase.from('settings').upsert([
      { key: 'labels_wiped_at', value: nowIso, updated_at: nowIso }
    ], { onConflict: 'key' });
    console.log('[SyncWipe] Berhasil mencatat labels_wiped_at di cloud');
  } catch (e) {
    console.warn('[SyncWipe] Gagal mencatat labels_wiped_at di cloud:', e);
  }
}

// ── WIP REGISTRY DIRECT PUSH: Sinkronkan acuan aktif & daftar batch WIP langsung ke Cloud ──
export async function pushWipRegistryToSupabase(preferredActiveUuid = null) {
  if (!navigator.onLine || !db.wip_updates) return null;
  try {
    const updates = await db.wip_updates.toArray();
    if (updates.length === 0) return null;

    // Urutkan batch dari tanggal terbaru (latest date first)
    const sorted = updates.slice().sort((a, b) => {
      const timeB = new Date(b.tanggal || b.createdAt || 0).getTime() || 0;
      const timeA = new Date(a.tanggal || a.createdAt || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || 0) - (a.id || 0);
    });

    let activeBatch = null;
    if (preferredActiveUuid) {
      activeBatch = sorted.find(u => u.uuid === preferredActiveUuid || String(u.id) === String(preferredActiveUuid));
    }
    if (!activeBatch) {
      const activeCandidates = sorted.filter(u => u.isActive === 1 || u.isActive === true);
      activeBatch = activeCandidates.length > 0 ? activeCandidates[0] : sorted[0];
    }

    const activeUuid = activeBatch?.uuid || (typeof window !== 'undefined' ? localStorage.getItem('m_label_active_wip_batch_uuid') : null) || sorted[0]?.uuid || null;
    const nowIso = new Date().toISOString();

    if (activeUuid && typeof window !== 'undefined') {
      localStorage.setItem('m_label_active_wip_batch_uuid', activeUuid);
      localStorage.setItem('m_label_active_wip_batch_updated_at', String(Date.now()));
    }

    // Pastikan di db.wip_updates lokal hanya 1 batch yang isActive = 1
    for (const u of updates) {
      const shouldBeActive = (u.uuid === activeUuid || u.id === activeBatch?.id) ? 1 : 0;
      if (u.isActive !== shouldBeActive && u.id) {
        await db.wip_updates.update(u.id, { isActive: shouldBeActive, updatedAt: nowIso });
      }
    }

    const payload = {
      key: 'ims_wip_updates_registry',
      value: JSON.stringify({
        activeWipBatchUuid: activeUuid,
        updates: sorted.map(u => ({
          uuid: u.uuid,
          title: u.title,
          tanggal: u.tanggal,
          fileName: u.fileName,
          totalRolls: u.totalRolls,
          totalKg: u.totalKg,
          isActive: (u.uuid === activeUuid || u.id === activeBatch?.id) ? 1 : 0,
          createdAt: u.createdAt,
          updatedAt: u.updatedAt || nowIso
        }))
      }),
      updated_at: nowIso
    };

    const { error } = await supabase.from('settings').upsert([payload], { onConflict: 'key' });
    if (error) {
      console.warn('[SyncPush] Direct push WIP registry notice:', error.message);
    } else {
      console.log(`[SyncPush] Berhasil memperbarui acuan WIP di cloud: ${activeUuid}`);
    }
    return activeUuid;
  } catch (err) {
    console.warn('[SyncPush] Gagal push WIP registry:', err);
    return null;
  }
}

// 1. PUSH: Kirim data lokal yang belum tersinkron ke Supabase (PARALLEL & BULK)
export async function pushLocalToSupabase() {
  if (!navigator.onLine) return;
  syncState.isSyncing = true;
  syncState.lastError = null;

  try {
    const tasks = [];

    // 1a. Labels Sync (Hanya yang belum synced)
    if (db.labels) {
      tasks.push((async () => {
        const unsyncedLabels = await db.labels.filter(l => l.synced === 0 || !l.synced).toArray();
        if (unsyncedLabels.length > 0) {
          const payload = unsyncedLabels.map(mapLabelToSupabase);
          const { error } = await supabase.from('labels').upsert(payload, { onConflict: 'uniq_id' });
          if (error) throw error;

          for (const l of unsyncedLabels) {
            await db.labels.update(l.id, { synced: 1 });
          }
        }
      })());
    }

    // 1b. SPK Batches Sync
    if (db.spk_batches) {
      tasks.push((async () => {
        const allBatches = await db.spk_batches.toArray();
        if (allBatches.length > 0) {
          const payload = allBatches.map(b => ({
            uuid: b.uuid,
            batch_name: b.batchName,
            doc_no: b.docNo || '3B-PROD',
            tanggal: b.tanggal,
            total_items: b.totalItems || 0,
            total_jumbo: b.totalJumbo || 0,
            total_meter: b.totalMeter || 0,
            source: b.source || 'AI_SCAN',
            created_at: b.createdAt || new Date().toISOString(),
            updated_at: b.updatedAt || new Date().toISOString()
          }));
          await supabase.from('spk_batches').upsert(payload, { onConflict: 'uuid' });
        }
      })());
    }

    // 1c. SPK Plans Sync
    if (db.spk_plans) {
      tasks.push((async () => {
        const allPlans = await db.spk_plans.toArray();
        if (allPlans.length > 0) {
          const payload = allPlans.map(mapSpkPlanToSupabase);
          await supabase.from('spk_plans').upsert(payload, { onConflict: 'uuid' });
        }
      })());
    }

    // 1c-2. Data Rolls Sync (Chunked Bulk Upsert for Thousands of Rolls)
    if (db.data_rolls) {
      tasks.push((async () => {
        const deletedRollSet = new Set(getTombstones('data_rolls'));
        const allRolls = await db.data_rolls.toArray();

        // 1. Bersihkan roll lokal yang ada di daftar tombstone agar Device ini bersih
        const zombieRolls = allRolls.filter(r => r.uuid && deletedRollSet.has(r.uuid));
        if (zombieRolls.length > 0) {
          console.log(`[SyncPush] Menghapus ${zombieRolls.length} zombie roll lokal yang sudah dihapus...`);
          await db.data_rolls.bulkDelete(zombieRolls.map(z => z.id));
        }

        // 2. HANYA push roll yang BELUM tersinkron (synced === 0 atau !r.synced) dan BUKAN tombstone!
        // Hal ini sangat penting agar Device B tidak mengunggah kembali data yang sudah dihapus di cloud!
        const unsyncedRolls = allRolls.filter(r => (r.synced === 0 || !r.synced) && (!r.uuid || !deletedRollSet.has(r.uuid)));
        if (unsyncedRolls.length > 0) {
          const CHUNK = 500;
          for (let i = 0; i < unsyncedRolls.length; i += CHUNK) {
            const chunk = unsyncedRolls.slice(i, i + CHUNK);
            const payload = chunk.map(mapDataRollToSupabase);
            const { error } = await supabase.from('data_rolls').upsert(payload, { onConflict: 'uuid' });
            if (error) throw error;
          }

          // Tandai sebagai synced: 1 agar tidak di-push ulang di sesi berikutnya
          for (const r of unsyncedRolls) {
            await db.data_rolls.update(r.id, { synced: 1 });
          }
        }
      })());
    }

    // 1d. Operator List Sync
    if (db.operator_list) {
      tasks.push((async () => {
        try {
          const tombstones = new Set(getTombstones('operator_list').map(t => String(t).toUpperCase()));
          if (tombstones.size > 0) {
            for (const deadName of tombstones) {
              try {
                await supabase.from('operator_list').delete().ilike('nama', deadName);
              } catch (_) {}
            }
          }

          const operators = await db.operator_list.toArray();
          const validOperators = operators.filter(o => o.nama && !tombstones.has(o.nama.trim().toUpperCase()));

          if (validOperators.length > 0) {
            const payload = validOperators.map(o => ({
              nama: (o.nama || '').trim().toUpperCase(),
              mesin: (o.mesin || '').trim().toUpperCase(),
              kode_grup: (o.kodeGrup || 'A').trim().toUpperCase(),
              kode_operator: (o.kodeOperator || '').trim().toUpperCase(),
              active: o.active !== false,
              created_at: o.createdAt || new Date().toISOString(),
              updated_at: o.updatedAt || new Date().toISOString()
            }));

            await supabase.from('operator_list').upsert(payload, { onConflict: 'nama' });
          }
        } catch (e) {
          console.warn('operator_list push error:', e);
        }
      })());
    }

    // 1d-2. Mesin List Sync
    if (db.mesin_list) {
      tasks.push((async () => {
        try {
          const machines = await db.mesin_list.toArray();
          if (machines.length > 0) {
            const payload = machines.map(m => ({
              nama: m.nama,
              pra_kode_pack: m.praKodePack || '',
              active: m.active !== false,
              created_at: m.createdAt || new Date().toISOString()
            }));
            await supabase.from('mesin_list').upsert(payload, { onConflict: 'nama' });
          }
        } catch (e) {
          console.warn('mesin_list push error:', e);
        }
      })());
    }

    // 1e. Film Configs Sync
    if (db.film_configs) {
      tasks.push((async () => {
        try {
          const films = await db.film_configs.toArray();
          if (films.length > 0) {
            const payload = films.map(f => ({
              jenis: f.jenis,
              kode_formula: f.kodeFormula,
              alias: f.alias || '',
              tipe_bahan: f.tipeBahan || '',
              jenis_bahan: f.jenisBahan || '',
              kategori_film: f.kategoriFilm || '',
              keterangan: f.keterangan || '',
              supplier: f.supplier || '',
              density: parseFloat(f.density) || 0.91,
              active: f.active !== false,
              created_at: f.createdAt || new Date().toISOString(),
              updated_at: f.updatedAt || new Date().toISOString()
            }));
            await supabase.from('film_configs').upsert(payload, { onConflict: 'jenis,kode_formula' });
          }
        } catch (e) {
          console.warn('film_configs push error:', e);
        }
      })());
    }

    // 1f. Resin Items Sync
    if (db.resin_items) {
      tasks.push((async () => {
        try {
          const resins = await db.resin_items.toArray();
          if (resins.length > 0) {
            const payload = resins.map(r => ({
              resin: r.resin,
              kode: r.kode || '',
              nomor_item: r.nomorItem || '',
              active: r.active !== false,
              created_at: r.createdAt || new Date().toISOString(),
              updated_at: r.updatedAt || new Date().toISOString()
            }));
            await supabase.from('resin_items').upsert(payload, { onConflict: 'resin' });
          }
        } catch (e) {
          console.warn('resin_items push error:', e);
        }
      })());
    }

    // 1g. BOM Formulas Sync
    if (db.bom_formulas) {
      tasks.push((async () => {
        try {
          const boms = await db.bom_formulas.toArray();
          if (boms.length > 0) {
            const payload = boms.map(b => ({
              formula: b.formula,
              rm: b.rm,
              persen: parseFloat(b.persen) || 0,
              active: b.active !== false,
              created_at: b.createdAt || new Date().toISOString(),
              updated_at: b.updatedAt || new Date().toISOString()
            }));
            await supabase.from('bom_formulas').upsert(payload, { onConflict: 'formula,rm' });
          }
        } catch (e) {
          console.warn('bom_formulas push error:', e);
        }
      })());
    }

    // 1h. Location List Sync
    if (db.location_list) {
      tasks.push((async () => {
        try {
          const locs = await db.location_list.toArray();
          if (locs.length > 0) {
            const payload = locs.map(l => ({
              nama: l.nama,
              jenis: l.jenis || '',
              alias: l.alias || '',
              kapasitas: parseInt(l.kapasitas, 10) || 0,
              keterangan: l.keterangan || '',
              active: l.active !== false,
              created_at: l.createdAt || new Date().toISOString(),
              updated_at: l.updatedAt || new Date().toISOString()
            }));
            const { error } = await supabase.from('location_list').upsert(payload, { onConflict: 'nama' });
            if (error) {
              console.warn('location_list upsert notice, trying missing insert:', error.message);
              const { data: existing } = await supabase.from('location_list').select('nama');
              const existingSet = new Set((existing || []).map(e => (e.nama || '').trim().toUpperCase()));
              const missing = payload.filter(p => !existingSet.has((p.nama || '').trim().toUpperCase()));
              if (missing.length > 0) {
                await supabase.from('location_list').insert(missing);
              }
            }
          }
        } catch (e) {
          console.warn('location_list push error:', e);
        }
      })());
    }

    // 1i. Standard Lengths Sync
    if (db.standard_lengths) {
      tasks.push((async () => {
        const lens = await db.standard_lengths.toArray();
        if (lens.length > 0) {
          const payload = lens.map(s => ({
            thickness: parseFloat(s.thickness),
            max_panjang_fg: parseFloat(s.maxPanjangFg) || 0,
            max_panjang_jumbo: parseFloat(s.maxPanjangJumbo) || 0,
            active: s.active !== false,
            created_at: s.createdAt || new Date().toISOString(),
            updated_at: s.updatedAt || new Date().toISOString()
          }));
          await supabase.from('standard_lengths').upsert(payload, { onConflict: 'thickness' });
        }
      })());
    }

    // 1j. Settings Sync (EmailJS Configuration & App Settings)
    if (db.settings) {
      tasks.push((async () => {
        try {
          const allSettings = await db.settings.toArray();
          if (allSettings.length > 0) {
            const payload = allSettings.map(st => ({
              key: st.key,
              value: typeof st.value === 'string' ? st.value : JSON.stringify(st.value),
              updated_at: st.updatedAt || new Date().toISOString()
            }));
            await supabase.from('settings').upsert(payload, { onConflict: 'key' });
          }
        } catch (setErr) {
          console.warn('[SyncPush] Settings sync notice:', setErr.message || setErr);
        }
      })());
    }

    // 1k. System Users Registry Sync (Multi-Device User Accounts)
    if (db.users) {
      tasks.push((async () => {
        try {
          const allUsers = await db.users.toArray();
          if (allUsers.length > 0) {
            const payload = {
              key: 'system_users_registry',
              value: JSON.stringify(allUsers),
              updated_at: new Date().toISOString()
            };
            await supabase.from('settings').upsert([payload], { onConflict: 'key' });
          }
        } catch (usrPushErr) {
          console.warn('[SyncPush] Users registry notice:', usrPushErr.message || usrPushErr);
        }
      })());
    }

    // 1l. WIP Rolls & WIP Updates Sync (IMS Module)
    if (db.wip_rolls) {
      tasks.push((async () => {
        try {
          const deletedWipSet = new Set(getTombstones('wip_rolls'));
          const allWips = await db.wip_rolls.toArray();
          
          // Bersihkan tombstone lokal
          const zombieWips = allWips.filter(w => w.uuid && deletedWipSet.has(w.uuid));
          if (zombieWips.length > 0) {
            await db.wip_rolls.bulkDelete(zombieWips.map(z => z.id));
          }

          // Push rolls yang belum disinkron
          const unsyncedWips = allWips.filter(w => (w.synced === 0 || !w.synced) && (!w.uuid || !deletedWipSet.has(w.uuid)));
          if (unsyncedWips.length > 0) {
            const CHUNK = 250;
            for (let i = 0; i < unsyncedWips.length; i += CHUNK) {
              const chunk = unsyncedWips.slice(i, i + CHUNK);
              const payload = chunk.map(mapWipRollToSupabase);
              const { error } = await supabase.from('wip_rolls').upsert(payload, { onConflict: 'uuid' });
              if (error) {
                console.warn('[SyncPush] WIP rolls chunk error:', error.message);
                break;
              }
            }
            for (const w of unsyncedWips) {
              await db.wip_rolls.update(w.id, { synced: 1 });
            }
          }

          // Sinkronkan registry batch upload WIP (wip_updates)
          if (db.wip_updates) {
            await pushWipRegistryToSupabase();
          }
        } catch (wipPushErr) {
          console.warn('[SyncPush] WIP sync error:', wipPushErr.message || wipPushErr);
        }
      })());
    }

    // 1m. Inventory FG Stock Sync (IMS Module)
    if (db.inventory_stock_uploads) {
      tasks.push((async () => {
        try {
          // Push master items jika ada
          if (db.inventory_items) {
            const items = await db.inventory_items.toArray();
            if (items.length > 0) {
              const payload = {
                key: 'ims_inventory_master_items',
                value: JSON.stringify(items),
                updated_at: new Date().toISOString()
              };
              await supabase.from('settings').upsert([payload], { onConflict: 'key' });
            }
          }

          // Push stock uploads & current stock snapshot
          const uploads = await db.inventory_stock_uploads.toArray();
          const currentStocks = db.inventory_current_stocks ? await db.inventory_current_stocks.toArray() : [];
          if (uploads.length > 0 || currentStocks.length > 0) {
            const activeId = localStorage.getItem('m_label_active_fg_upload_id');
            const activeUuid = localStorage.getItem('m_label_active_fg_upload_uuid');
            const payload = {
              key: 'ims_inventory_stocks_registry',
              value: JSON.stringify({
                activeUploadId: activeId ? parseInt(activeId, 10) : null,
                activeUploadUuid: activeUuid || null,
                uploads: uploads.map(u => ({
                  id: u.id,
                  uuid: u.uuid || (`fg_upload_${u.id}`),
                  uploadDate: u.uploadDate,
                  fileName: u.fileName,
                  totalSku: u.totalSku,
                  totalRoll: u.totalRoll,
                  uploadedBy: u.uploadedBy,
                  createdAt: u.createdAt
                })),
                currentStocks
              }),
              updated_at: new Date().toISOString()
            };
            await supabase.from('settings').upsert([payload], { onConflict: 'key' });
          }
        } catch (invPushErr) {
          console.warn('[SyncPush] Inventory sync error:', invPushErr.message || invPushErr);
        }
      })());
    }

    // 1n. Data Roll Uploads History Sync
    if (db.data_roll_uploads) {
      tasks.push((async () => {
        try {
          const uploads = await db.data_roll_uploads.toArray();
          if (uploads.length > 0) {
            const payload = {
              key: 'data_roll_uploads_registry',
              value: JSON.stringify(uploads.map(u => ({
                uuid: u.uuid,
                uploadDate: u.uploadDate,
                batchName: u.batchName,
                source: u.source,
                fileName: u.fileName,
                machine: u.machine,
                totalRolls: u.totalRolls,
                totalKg: u.totalKg,
                passCount: u.passCount,
                holdCount: u.holdCount,
                rejectCount: u.rejectCount,
                uploadedBy: u.uploadedBy,
                status: u.status,
                rollsJson: u.rollsJson,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt
              }))),
              updated_at: new Date().toISOString()
            };
            await supabase.from('settings').upsert([payload], { onConflict: 'key' });

            // Try upserting to data_roll_uploads table if available in Supabase
            try {
              const tablePayload = uploads.map(u => ({
                uuid: u.uuid || `dru_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
                upload_date: u.uploadDate || '',
                batch_name: u.batchName || '',
                source: u.source || '',
                file_name: u.fileName || '',
                machine: u.machine || '',
                total_rolls: parseInt(u.totalRolls, 10) || 0,
                total_kg: parseFloat(u.totalKg) || 0,
                pass_count: parseInt(u.passCount, 10) || 0,
                hold_count: parseInt(u.holdCount, 10) || 0,
                reject_count: parseInt(u.rejectCount, 10) || 0,
                uploaded_by: u.uploadedBy || '',
                status: u.status || '',
                rolls_json: typeof u.rollsJson === 'string' ? u.rollsJson : JSON.stringify(u.rollsJson || []),
                created_at: u.createdAt || new Date().toISOString(),
                updated_at: u.updatedAt || new Date().toISOString()
              }));
              await supabase.from('data_roll_uploads').upsert(tablePayload, { onConflict: 'uuid' });
            } catch (tErr) {
              // Ignore if dedicated table doesn't exist
            }
          }
        } catch (druErr) {
          console.warn('[SyncPush] Data roll uploads sync error:', druErr.message || druErr);
        }
      })());
    }

    // Jalankan seluruh sync push secara PARALEL
    await Promise.all(tasks);
    await countUnsynced();
  } catch (err) {
    console.error('Error pushing to Supabase:', err);
    syncState.lastError = err.message || 'Gagal mengirim data ke cloud';
  } finally {
    syncState.isSyncing = false;
  }
}

// 2. PULL: Ambil data terbaru dari Supabase ke lokal Dexie (PARALLEL & BULK UPSERT)
export async function pullFromSupabase(forceFull = false) {
  if (!navigator.onLine) return;
  if (syncState.isSyncing) {
    console.log('[SyncPull] Sinkronisasi sedang berlangsung di latar belakang, abaikan panggilan paralel.');
    return;
  }
  syncState.isSyncing = true;
  syncState.lastError = null;

  let effectiveForceFull = Boolean(forceFull);

  // 0. Deteksi apakah Data Rolls, Labels, atau Master Config telah di-wipe / reset di Cloud Supabase
  try {
    const { data: wipeSettings } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['data_rolls_wiped_at', 'labels_wiped_at', 'master_config_wiped_at']);

    if (wipeSettings && wipeSettings.length > 0) {
      for (const ws of wipeSettings) {
        if (ws.key === 'data_rolls_wiped_at' && ws.value) {
          const cloudWiped = new Date(ws.value).getTime();
          const localWiped = parseInt(localStorage.getItem('mlabel_local_data_rolls_wiped_at') || '0', 10);
          if (cloudWiped > localWiped) {
            console.log('[SyncPull] Mendeteksi Reset Data Rolls di Cloud. Membersihkan data rolls lokal...');
            localStorage.setItem('mlabel_local_data_rolls_wiped_at', String(cloudWiped));
            clearTombstones('data_rolls');
            if (db.data_rolls) await db.data_rolls.clear();
            if (db.data_roll_uploads) await db.data_roll_uploads.clear();
            localStorage.removeItem('mlabel_last_sync_iso');
            effectiveForceFull = true;
          }
        }
        if (ws.key === 'labels_wiped_at' && ws.value) {
          const cloudWiped = new Date(ws.value).getTime();
          const localWiped = parseInt(localStorage.getItem('mlabel_local_labels_wiped_at') || '0', 10);
          if (cloudWiped > localWiped) {
            console.log('[SyncPull] Mendeteksi Reset Labels di Cloud. Membersihkan labels lokal...');
            localStorage.setItem('mlabel_local_labels_wiped_at', String(cloudWiped));
            clearTombstones('labels');
            if (db.labels) await db.labels.clear();
            localStorage.removeItem('mlabel_last_sync_iso');
            effectiveForceFull = true;
          }
        }
        if (ws.key === 'master_config_wiped_at' && ws.value) {
          const cloudWipedTime = new Date(ws.value).getTime();
          const localWipedTime = parseInt(localStorage.getItem('mlabel_local_config_wiped_at') || '0', 10);
          if (cloudWipedTime > localWipedTime) {
            localStorage.setItem('mlabel_local_config_wiped_at', String(cloudWipedTime));
            await Promise.allSettled([
              db.film_configs?.clear(),
              db.bom_formulas?.clear(),
              db.resin_items?.clear(),
              db.mesin_list?.clear(),
              db.operator_list?.clear(),
              db.location_list?.clear(),
              db.standard_lengths?.clear(),
            ]);
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('sync:config-updated'));
            }
          }
        }
      }
    }
  } catch (wipeErr) {
    console.warn('[SyncPull] Pengecekan cloud wipe settings warning:', wipeErr);
  }

  const lastSyncIso = localStorage.getItem('mlabel_last_sync_iso');
  const isDelta = !effectiveForceFull && Boolean(lastSyncIso);
  const syncStartTime = new Date().toISOString();
  let syncHasErrors = false;

  if (isDelta) {
    console.log(`[SyncPull] Memulai Sinkronisasi Delta (sejak ${lastSyncIso})...`);
  } else {
    console.log('[SyncPull] Memulai Sinkronisasi Penuh (Full Sync)...');
  }

  try {
    const pullTasks = [];

    // Pull Labels (Paginated Range - Delta or Full)
    if (db.labels) {
      pullTasks.push((async () => {
        const cloudLabels = [];
        let page = 0;
        const PAGE_SIZE = 1000;
        let fetchCompleted = false;

        try {
          while (true) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            let query = supabase
              .from('labels')
              .select('*')
              .order('updated_at', { ascending: true })
              .order('id', { ascending: true });

            if (isDelta) {
              query = query.gt('updated_at', lastSyncIso);
            }

            const { data, error } = await query.range(from, to);

            if (error) {
              console.error('[SyncPull] Error fetching labels page ' + page + ':', error.message);
              syncHasErrors = true;
              break;
            }
            if (!data || data.length === 0) {
              fetchCompleted = true;
              break;
            }
            cloudLabels.push(...data);
            if (data.length < PAGE_SIZE) {
              fetchCompleted = true;
              break;
            }
            page++;
          }
        } catch (err) {
          console.error('[SyncPull] Labels pull loop error:', err);
          syncHasErrors = true;
        }

        if (isDelta) {
          // DELTA SYNC MODE: Hanya proses baris yang berubah, tanpa db.labels.toArray() seluruh tabel
          if (cloudLabels.length === 0) return;

          const toDeleteCloud = cloudLabels.filter(cl => cl.is_deleted);
          const toUpsertCloud = cloudLabels.filter(cl => !cl.is_deleted);

          if (toDeleteCloud.length > 0) {
            const delIds = toDeleteCloud.map(cl => cl.uniq_id).filter(Boolean);
            recordTombstones('labels', delIds);
            for (const uid of delIds) {
              try {
                await db.labels.where('uniqId').equals(uid).delete();
              } catch (eDel) {
                const matched = await db.labels.filter(l => l.uniqId === uid || l.uuid === uid).toArray();
                if (matched.length > 0) await db.labels.bulkDelete(matched.map(m => m.id));
              }
            }
          }

          if (toUpsertCloud.length > 0) {
            const cloudUniqIds = toUpsertCloud.map(cl => cl.uniq_id).filter(Boolean);
            removeTombstones('labels', cloudUniqIds);

            let existingLocal = [];
            try {
              existingLocal = await db.labels.where('uniqId').anyOf(cloudUniqIds).toArray();
            } catch (eIndex) {
              const idSet = new Set(cloudUniqIds);
              existingLocal = await db.labels.filter(l => idSet.has(l.uniqId) || idSet.has(l.uuid)).toArray();
            }
            const localMap = new Map(existingLocal.map(l => [l.uniqId || l.uuid, l]));
            const toUpdate = [];
            const toAdd = [];

            for (const cl of toUpsertCloud) {
              const mapped = mapLabelFromSupabase(cl);
              const localRec = localMap.get(cl.uniq_id);
              if (localRec) {
                // Non-destructive merge: jangan pernah menimpa mesin/keterangan lokal yang sudah terisi dengan nilai kosong
                toUpdate.push({
                  ...localRec,
                  ...mapped,
                  mesin: mapped.mesin || localRec.mesin || '',
                  keterangan: mapped.keterangan || localRec.keterangan || '',
                  shift: mapped.shift || localRec.shift || '',
                  diameterCore: mapped.diameterCore || localRec.diameterCore || 6,
                  id: localRec.id
                });
              } else {
                toAdd.push(mapped);
              }
            }

            const CHUNK_DEXIE = 2500;
            for (let i = 0; i < toUpdate.length; i += CHUNK_DEXIE) {
              await db.labels.bulkPut(toUpdate.slice(i, i + CHUNK_DEXIE));
            }
            for (let i = 0; i < toAdd.length; i += CHUNK_DEXIE) {
              await db.labels.bulkAdd(toAdd.slice(i, i + CHUNK_DEXIE));
            }
          }
        } else {
          // FULL SYNC MODE: Rekonsiliasi menyeluruh terhadap seluruh data lokal
          if (!fetchCompleted && cloudLabels.length === 0) return;

          const cloudUniqIds = new Set(cloudLabels.map(cl => cl.uniq_id).filter(Boolean));
          if (cloudUniqIds.size > 0) {
            removeTombstones('labels', cloudUniqIds);
          }

          const deletedLabelSet = new Set(getTombstones('labels'));
          const existingLocal = await db.labels.toArray();
          const localMap = new Map(existingLocal.map(l => [l.uniqId, l]));
          const toUpdate = [];
          const toAdd = [];

          for (const cl of cloudLabels) {
            if (deletedLabelSet.has(cl.uniq_id)) continue;
            const mapped = mapLabelFromSupabase(cl);
            const localRec = localMap.get(cl.uniq_id);
            if (localRec) {
              // Non-destructive merge
              toUpdate.push({
                ...localRec,
                ...mapped,
                mesin: mapped.mesin || localRec.mesin || '',
                keterangan: mapped.keterangan || localRec.keterangan || '',
                shift: mapped.shift || localRec.shift || '',
                diameterCore: mapped.diameterCore || localRec.diameterCore || 6,
                id: localRec.id
              });
            } else {
              toAdd.push(mapped);
            }
          }

          let staleLocalLabels = [];
          if (fetchCompleted) {
            staleLocalLabels = existingLocal.filter(l => {
              if (!l.uniqId) return false;
              if (deletedLabelSet.has(l.uniqId) && !cloudUniqIds.has(l.uniqId)) return true;
              if (l.synced === 1 && !cloudUniqIds.has(l.uniqId)) return true;
              return false;
            });
          }

          const CHUNK_DEXIE = 2500;
          for (let i = 0; i < toUpdate.length; i += CHUNK_DEXIE) {
            await db.labels.bulkPut(toUpdate.slice(i, i + CHUNK_DEXIE));
          }
          for (let i = 0; i < toAdd.length; i += CHUNK_DEXIE) {
            await db.labels.bulkAdd(toAdd.slice(i, i + CHUNK_DEXIE));
          }
          if (staleLocalLabels.length > 0) {
            console.log(`[SyncPull] Menghapus ${staleLocalLabels.length} label di lokal yang telah dihapus di cloud`);
            await db.labels.bulkDelete(staleLocalLabels.map(s => s.id));
          }
        }
      })());
    }

    // Pull SPK Batches
    if (db.spk_batches) {
      pullTasks.push((async () => {
        let q = supabase.from('spk_batches').select('*');
        if (isDelta) {
          q = q.gt('updated_at', lastSyncIso);
        }
        const { data: cloudBatches } = await q;
        if (cloudBatches && cloudBatches.length > 0) {
          const uuids = cloudBatches.map(b => b.uuid).filter(Boolean);
          const existingLocal = isDelta
            ? await db.spk_batches.where('uuid').anyOf(uuids).toArray()
            : await db.spk_batches.toArray();
          const localMap = new Map(existingLocal.map(b => [b.uuid, b.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cb of cloudBatches) {
            if (cb.is_deleted) {
              const localId = localMap.get(cb.uuid);
              if (localId) await db.spk_batches.delete(localId);
              continue;
            }
            const bRecord = {
              uuid: cb.uuid,
              batchName: cb.batch_name,
              docNo: cb.doc_no,
              tanggal: cb.tanggal,
              totalItems: cb.total_items,
              totalJumbo: cb.total_jumbo,
              totalMeter: cb.total_meter,
              source: cb.source,
              createdAt: cb.created_at,
              updatedAt: cb.updated_at
            };
            const localId = localMap.get(cb.uuid);
            if (localId) {
              toUpdate.push({ ...bRecord, id: localId });
            } else {
              toAdd.push(bRecord);
            }
          }

          if (toUpdate.length > 0) await db.spk_batches.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.spk_batches.bulkAdd(toAdd);
        }
      })());
    }

    // Pull SPK Plans
    if (db.spk_plans) {
      pullTasks.push((async () => {
        let q = supabase.from('spk_plans').select('*');
        if (isDelta) {
          q = q.gt('updated_at', lastSyncIso);
        }
        const { data: cloudPlans } = await q;
        if (cloudPlans && cloudPlans.length > 0) {
          const uuids = cloudPlans.map(p => p.uuid).filter(Boolean);
          const existingLocal = isDelta
            ? await db.spk_plans.where('uuid').anyOf(uuids).toArray()
            : await db.spk_plans.toArray();
          const localMap = new Map(existingLocal.map(p => [p.uuid, p.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cp of cloudPlans) {
            if (cp.is_deleted) {
              const localId = localMap.get(cp.uuid);
              if (localId) await db.spk_plans.delete(localId);
              continue;
            }
            const pRecord = mapSpkPlanFromSupabase(cp);
            const localId = localMap.get(cp.uuid);
            if (localId) {
              toUpdate.push({ ...pRecord, id: localId });
            } else {
              toAdd.push(pRecord);
            }
          }

          if (toUpdate.length > 0) await db.spk_plans.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.spk_plans.bulkAdd(toAdd);
        }
      })());
    }

    // Pull Data Rolls (Paginated Range - Delta or Full)
    if (db.data_rolls) {
      pullTasks.push((async () => {
        const allCloudRolls = [];
        let page = 0;
        const PAGE_SIZE = 1000;
        let fetchCompleted = false;

        try {
          while (true) {
            const from = page * PAGE_SIZE;
            const to = from + PAGE_SIZE - 1;
            let query = supabase
              .from('data_rolls')
              .select('*')
              .order('updated_at', { ascending: true })
              .order('id', { ascending: true });

            if (isDelta) {
              query = query.gt('updated_at', lastSyncIso);
            }

            const { data, error } = await query.range(from, to);

            if (error) {
              console.error('[SyncPull] Error fetching data_rolls page ' + page + ':', error.message);
              syncHasErrors = true;
              break;
            }
            if (!data || data.length === 0) {
              fetchCompleted = true;
              break;
            }
            allCloudRolls.push(...data);
            if (data.length < PAGE_SIZE) {
              fetchCompleted = true;
              break;
            }
            page++;
          }
        } catch (errLoop) {
          console.error('[SyncPull] Exception in data_rolls pull loop:', errLoop);
          syncHasErrors = true;
        }

        if (isDelta) {
          // DELTA SYNC MODE: Hanya proses baris yang berubah, tanpa db.data_rolls.toArray() seluruh tabel
          if (allCloudRolls.length === 0) return;

          const toDeleteRolls = allCloudRolls.filter(cr => cr.is_deleted);
          const toUpsertRolls = allCloudRolls.filter(cr => !cr.is_deleted);

          if (toDeleteRolls.length > 0) {
            const delUuids = toDeleteRolls.map(cr => cr.uuid).filter(Boolean);
            recordTombstones('data_rolls', delUuids);
            for (const u of delUuids) {
              await db.data_rolls.where('uuid').equals(u).delete();
            }
          }

          if (toUpsertRolls.length > 0) {
            const cloudUuids = toUpsertRolls.map(cr => cr.uuid).filter(Boolean);
            removeTombstones('data_rolls', cloudUuids);

            const existingLocal = await db.data_rolls.where('uuid').anyOf(cloudUuids).toArray();
            const localMap = new Map(existingLocal.map(r => [r.uuid, r]));
            const toUpdate = [];
            const toAdd = [];

            for (const cr of toUpsertRolls) {
              const mapped = mapDataRollFromSupabase(cr);
              const localRec = localMap.get(cr.uuid);
              if (localRec) {
                toUpdate.push({
                  ...localRec,
                  ...mapped,
                  machineName: mapped.machineName || localRec.machineName || '',
                  keterangan: mapped.keterangan || localRec.keterangan || localRec.reasonDefect || '',
                  reasonDefect: mapped.reasonDefect || localRec.reasonDefect || localRec.keterangan || '',
                  id: localRec.id
                });
              } else {
                toAdd.push(mapped);
              }
            }

            const CHUNK_DEXIE = 2500;
            for (let i = 0; i < toUpdate.length; i += CHUNK_DEXIE) {
              await db.data_rolls.bulkPut(toUpdate.slice(i, i + CHUNK_DEXIE));
            }
            for (let i = 0; i < toAdd.length; i += CHUNK_DEXIE) {
              await db.data_rolls.bulkAdd(toAdd.slice(i, i + CHUNK_DEXIE));
            }
          }
        } else {
          // FULL SYNC MODE: Rekonsiliasi menyeluruh terhadap seluruh data lokal
          if (!fetchCompleted && allCloudRolls.length === 0) return;

          const cloudUuids = new Set(allCloudRolls.map(cr => cr.uuid).filter(Boolean));

          if (cloudUuids.size > 0) {
            removeTombstones('data_rolls', cloudUuids);
          }

          const deletedRollSet = new Set(getTombstones('data_rolls'));
          const existingLocal = await db.data_rolls.toArray();
          const localMap = new Map(existingLocal.map(r => [r.uuid, r]));
          const toUpdate = [];
          const toAdd = [];

          for (const cr of allCloudRolls) {
            if (deletedRollSet.has(cr.uuid)) continue;
            const mapped = mapDataRollFromSupabase(cr);
            const localRec = localMap.get(cr.uuid);
            if (localRec) {
              toUpdate.push({
                ...localRec,
                ...mapped,
                machineName: mapped.machineName || localRec.machineName || '',
                keterangan: mapped.keterangan || localRec.keterangan || localRec.reasonDefect || '',
                reasonDefect: mapped.reasonDefect || localRec.reasonDefect || localRec.keterangan || '',
                id: localRec.id
              });
            } else {
              toAdd.push(mapped);
            }
          }

          let staleLocalRolls = [];
          if (fetchCompleted) {
            const nowMs = Date.now();
            staleLocalRolls = existingLocal.filter(r => {
              if (!r.uuid) return false;
              if (deletedRollSet.has(r.uuid) && !cloudUuids.has(r.uuid)) return true;
              if (!cloudUuids.has(r.uuid)) {
                if (r.synced === 0 && r.createdAt) {
                  const ageMs = nowMs - new Date(r.createdAt).getTime();
                  if (!isNaN(ageMs) && ageMs < 60000) return false;
                }
                return r.synced === 1;
              }
              return false;
            });
          }

          const CHUNK_DEXIE = 2500;
          for (let i = 0; i < toUpdate.length; i += CHUNK_DEXIE) {
            await db.data_rolls.bulkPut(toUpdate.slice(i, i + CHUNK_DEXIE));
          }
          for (let i = 0; i < toAdd.length; i += CHUNK_DEXIE) {
            await db.data_rolls.bulkAdd(toAdd.slice(i, i + CHUNK_DEXIE));
          }
          if (staleLocalRolls.length > 0) {
            console.log(`[SyncPull] Menghapus ${staleLocalRolls.length} roll di lokal yang telah dihapus di cloud`);
            const staleUuids = staleLocalRolls.map(s => s.uuid).filter(Boolean);
            recordTombstones('data_rolls', staleUuids);
            await db.data_rolls.bulkDelete(staleLocalRolls.map(s => s.id));
          }
        }
      })());
    }

    // Deteksi apakah Master Data Config telah di-wipe di Cloud Supabase
    try {
      const { data: wipeSetting } = await supabase.from('settings').select('value').eq('key', 'master_config_wiped_at').maybeSingle();
      if (wipeSetting && wipeSetting.value) {
        const cloudWipedTime = new Date(wipeSetting.value).getTime();
        const localWipedTime = parseInt(localStorage.getItem('mlabel_local_config_wiped_at') || '0', 10);
        if (cloudWipedTime > localWipedTime) {
          localStorage.setItem('mlabel_local_config_wiped_at', String(cloudWipedTime));
          await Promise.allSettled([
            db.film_configs?.clear(),
            db.bom_formulas?.clear(),
            db.resin_items?.clear(),
            db.mesin_list?.clear(),
            db.operator_list?.clear(),
            db.location_list?.clear(),
            db.standard_lengths?.clear(),
          ]);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sync:config-updated'));
          }
        }
      }
    } catch (e) {}

    // Pull Operators (Cloud as Single Source of Truth)
    if (db.operator_list) {
      pullTasks.push((async () => {
        const [opsRes, tenureRes] = await Promise.all([
          supabase.from('operator_list').select('*'),
          supabase.from('settings').select('value').eq('key', 'operator_tenure_registry').single()
        ]);

        const cloudOps = opsRes.data;
        if (cloudOps && cloudOps.length > 0) {
          const tombstones = new Set(getTombstones('operator_list').map(t => String(t).toUpperCase()));
          const existing = await db.operator_list.toArray();
          const localMap = new Map(existing.map(o => [(o.nama || '').trim().toUpperCase(), o]));
          const cloudNamesSet = new Set(cloudOps.map(co => (co.nama || '').trim().toUpperCase()));
          const today = new Date().toISOString().slice(0, 10);

          let tenureMap = {};
          if (tenureRes.data && tenureRes.data.value) {
            try {
              tenureMap = typeof tenureRes.data.value === 'string'
                ? JSON.parse(tenureRes.data.value)
                : tenureRes.data.value;
            } catch (eT) {
              tenureMap = {};
            }
          }

          // Bersihkan record lokal yang tidak ada di Cloud (ZOMBIE PURGE)
          // Kecuali record yang baru saja dibuat di lokal (< 2 menit) untuk mencegah race condition
          const nowMs = Date.now();
          const zombieIds = [];
          for (const o of existing) {
            const opName = (o.nama || '').trim().toUpperCase();
            if (!opName) continue;
            if (!cloudNamesSet.has(opName)) {
              const ageMs = nowMs - new Date(o.createdAt || 0).getTime();
              if (ageMs >= 120000) {
                zombieIds.push(o.id);
              } else {
                // Record baru dibuat di lokal: segera push ke Cloud!
                supabase.from('operator_list').upsert({
                  nama: opName,
                  mesin: (o.mesin || '').trim().toUpperCase(),
                  kode_grup: (o.kodeGrup || 'A').trim().toUpperCase(),
                  kode_operator: (o.kodeOperator || '').trim().toUpperCase(),
                  active: o.active !== false,
                  created_at: o.createdAt || new Date().toISOString(),
                  updated_at: o.updatedAt || new Date().toISOString()
                }, { onConflict: 'nama' }).then(() => {});
              }
            }
          }
          if (zombieIds.length > 0) {
            await db.operator_list.bulkDelete(zombieIds);
          }

          const toUpdate = [];
          const toAdd = [];
          const cloudDeadNames = [];

          for (const co of cloudOps) {
            const nameUpper = (co.nama || '').trim().toUpperCase();
            if (!nameUpper) continue;

            if (tombstones.has(nameUpper)) {
              cloudDeadNames.push(co.nama);
              continue;
            }

            const localOp = localMap.get(nameUpper);
            const tInfo = tenureMap[nameUpper] || {};
            const cloudTime = co.updated_at ? new Date(co.updated_at).getTime() : 0;
            const localTime = localOp?.updatedAt ? new Date(localOp.updatedAt).getTime() : 0;
            const isLocalFresher = localOp && (localTime > cloudTime);

            const today = new Date().toISOString().slice(0, 10);
            let finalBerlakuMulai = co.berlaku_mulai || tInfo.berlakuMulai || localOp?.berlakuMulai || '2020-01-01';
            let finalBerlakuSampai = (co.berlaku_sampai !== undefined && co.berlaku_sampai !== null)
              ? co.berlaku_sampai
              : ((tInfo.berlakuSampai !== undefined) ? tInfo.berlakuSampai : (localOp?.berlakuSampai ?? null));

            if (isLocalFresher) {
              finalBerlakuMulai = localOp.berlakuMulai || finalBerlakuMulai;
              finalBerlakuSampai = localOp.berlakuSampai ?? finalBerlakuSampai;
            }

            const isExpired = Boolean(finalBerlakuSampai && finalBerlakuSampai <= today);
            let finalActive = isLocalFresher ? (localOp.active !== false) : (co.active !== false);
            if (co.active === false || tInfo.active === false || isExpired) {
              finalActive = false;
            }

            const rec = {
              nama: nameUpper,
              mesin: (co.mesin || tInfo.mesin || localOp?.mesin || '').trim().toUpperCase(),
              kodeGrup: (co.kode_grup || tInfo.kodeGrup || localOp?.kodeGrup || 'A').trim().toUpperCase(),
              kodeOperator: (co.kode_operator || tInfo.kodeOperator || localOp?.kodeOperator || '').trim().toUpperCase(),
              berlakuMulai: finalBerlakuMulai,
              berlakuSampai: finalBerlakuSampai,
              active: finalActive,
              createdAt: co.created_at || localOp?.createdAt || new Date().toISOString(),
              updatedAt: isLocalFresher ? localOp.updatedAt : (co.updated_at || new Date().toISOString())
            };

            if (localOp?.id) {
              toUpdate.push({ ...rec, id: localOp.id });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.operator_list.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.operator_list.bulkAdd(toAdd);

          // Pemicu reaktif agar pinia store & UI seketika memuat perubahan operator terbaru
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('sync:config-updated'));
          }

          // Purge sisa-sisa baris terhapus di Supabase jika ada
          if (cloudDeadNames.length > 0) {
            for (const deadName of cloudDeadNames) {
              try {
                await supabase.from('operator_list').delete().ilike('nama', deadName);
              } catch (_) {}
            }
          }
        }
      })());
    }

    // Pull Mesin
    if (db.mesin_list) {
      pullTasks.push((async () => {
        const { data: cloudMachines } = await supabase.from('mesin_list').select('*');
        if (cloudMachines && cloudMachines.length > 0) {
          const existing = await db.mesin_list.toArray();
          const localMap = new Map(existing.map(m => [m.nama.toUpperCase(), m.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cm of cloudMachines) {
            const rec = {
              nama: cm.nama,
              praKodePack: cm.pra_kode_pack,
              active: cm.active,
              createdAt: cm.created_at
            };
            const localId = localMap.get(cm.nama.toUpperCase());
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.mesin_list.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.mesin_list.bulkAdd(toAdd);
        }
      })());
    }

    // Pull Film Configs
    if (db.film_configs) {
      pullTasks.push((async () => {
        const { data: cloudFilms } = await supabase.from('film_configs').select('*');
        if (cloudFilms && cloudFilms.length > 0) {
          const existing = await db.film_configs.toArray();
          const localMap = new Map(existing.map(f => [`${f.jenis}_${f.kodeFormula}`.toUpperCase(), f.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cf of cloudFilms) {
            const rec = {
              jenis: cf.jenis,
              kodeFormula: cf.kode_formula,
              alias: cf.alias,
              tipeBahan: cf.tipe_bahan,
              jenisBahan: cf.jenis_bahan,
              kategoriFilm: cf.kategori_film,
              keterangan: cf.keterangan,
              supplier: cf.supplier,
              density: cf.density,
              active: cf.active,
              createdAt: cf.created_at,
              updatedAt: cf.updated_at
            };
            const key = `${cf.jenis}_${cf.kode_formula}`.toUpperCase();
            const localId = localMap.get(key);
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.film_configs.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.film_configs.bulkAdd(toAdd);
        }
      })());
    }

    // Pull Resin Items
    if (db.resin_items) {
      pullTasks.push((async () => {
        const { data: cloudResins } = await supabase.from('resin_items').select('*');
        if (cloudResins && cloudResins.length > 0) {
          const existing = await db.resin_items.toArray();
          const localMap = new Map(existing.map(r => [(r.resin || '').toUpperCase(), r.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cr of cloudResins) {
            const rec = {
              resin: cr.resin,
              kode: cr.kode,
              nomorItem: cr.nomor_item,
              active: cr.active,
              createdAt: cr.created_at,
              updatedAt: cr.updated_at
            };
            const localId = localMap.get((cr.resin || '').toUpperCase());
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.resin_items.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.resin_items.bulkAdd(toAdd);
        }
      })());
    }

    // Pull BOM Formulas
    if (db.bom_formulas) {
      pullTasks.push((async () => {
        const { data: cloudBoms } = await supabase.from('bom_formulas').select('*');
        if (cloudBoms && cloudBoms.length > 0) {
          const existing = await db.bom_formulas.toArray();
          const localMap = new Map(existing.map(b => [`${b.formula}_${b.rm}`.toUpperCase(), b.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cb of cloudBoms) {
            const rec = {
              formula: cb.formula,
              rm: cb.rm,
              persen: cb.persen,
              active: cb.active,
              createdAt: cb.created_at,
              updatedAt: cb.updated_at
            };
            const key = `${cb.formula}_${cb.rm}`.toUpperCase();
            const localId = localMap.get(key);
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.bom_formulas.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.bom_formulas.bulkAdd(toAdd);
        }
      })());
    }

    // Pull Location List
    if (db.location_list) {
      pullTasks.push((async () => {
        const { data: cloudLocs } = await supabase.from('location_list').select('*');
        if (cloudLocs && cloudLocs.length > 0) {
          const existing = await db.location_list.toArray();
          const localMap = new Map(existing.map(l => [l.nama.toUpperCase(), l.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cl of cloudLocs) {
            const rec = {
              nama: cl.nama,
              jenis: cl.jenis,
              alias: cl.alias,
              kapasitas: cl.kapasitas,
              keterangan: cl.keterangan,
              active: cl.active,
              createdAt: cl.created_at,
              updatedAt: cl.updated_at
            };
            const localId = localMap.get(cl.nama.toUpperCase());
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.location_list.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.location_list.bulkAdd(toAdd);
        }
      })());
    }

    // Pull Standard Lengths
    if (db.standard_lengths) {
      pullTasks.push((async () => {
        const { data: cloudLens } = await supabase.from('standard_lengths').select('*');
        if (cloudLens && cloudLens.length > 0) {
          const existing = await db.standard_lengths.toArray();
          const localMap = new Map(existing.map(s => [parseFloat(s.thickness), s.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cl of cloudLens) {
            const rec = {
              thickness: cl.thickness,
              maxPanjangFg: cl.max_panjang_fg,
              maxPanjangJumbo: cl.max_panjang_jumbo,
              active: cl.active,
              createdAt: cl.created_at,
              updatedAt: cl.updated_at
            };
            const localId = localMap.get(parseFloat(cl.thickness));
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          if (toUpdate.length > 0) await db.standard_lengths.bulkPut(toUpdate);
          if (toAdd.length > 0) await db.standard_lengths.bulkAdd(toAdd);
        }
      })());
    }

    // Pull Settings (EmailJS & System Settings)
    if (db.settings) {
      pullTasks.push((async () => {
        try {
          const { data: cloudSettings, error } = await supabase.from('settings').select('*');
          if (!error && cloudSettings && cloudSettings.length > 0) {
            const toUpdate = [];
            for (const cs of cloudSettings) {
              let parsedVal = cs.value;
              try {
                parsedVal = JSON.parse(cs.value);
              } catch (e) {
                parsedVal = cs.value;
              }
              toUpdate.push({
                key: cs.key,
                value: parsedVal,
                updatedAt: cs.updated_at || new Date().toISOString()
              });
              if (typeof window !== 'undefined' && window.localStorage) {
                localStorage.setItem(`mlabel_setting_${cs.key}`, JSON.stringify(parsedVal));
              }

              // Jika ini registry pengguna, sinkronkan ke db.users
              if (cs.key === 'system_users_registry' && db.users && Array.isArray(parsedVal)) {
                try {
                  for (const cu of parsedVal) {
                    const exist = await db.users.where('username').equalsIgnoreCase(cu.username).first();
                    if (!exist) {
                      const { id, ...cleanUser } = cu;
                      await db.users.add(cleanUser);
                    } else if (new Date(cu.updatedAt || 0) > new Date(exist.updatedAt || 0)) {
                      await db.users.update(exist.id, {
                        ...cu,
                        id: exist.id
                      });
                    }
                  }
                } catch (usrErr) {
                  console.warn('Sync pull users registry into db.users:', usrErr);
                }
              }

              // SPK Active Reference Batch Sync
              if (cs.key === 'spk_active_reference_batch_uuid') {
                const refUuid = typeof parsedVal === 'string' ? parsedVal : String(cs.value || '');
                if (refUuid && typeof window !== 'undefined') {
                  const currentStored = localStorage.getItem('spk_active_reference_batch_uuid');
                  if (currentStored !== refUuid) {
                    localStorage.setItem('spk_active_reference_batch_uuid', refUuid);
                    window.dispatchEvent(new CustomEvent('sync:spk-reference-updated', { detail: { batchUuid: refUuid } }));
                  }
                }
              }

              // Jika ini registry batch update WIP, sinkronkan ke db.wip_updates
              if (cs.key === 'ims_wip_updates_registry' && db.wip_updates) {
                try {
                  const updatesList = Array.isArray(parsedVal) ? parsedVal : (parsedVal?.updates || []);
                  const cloudActiveWipUuid = (!Array.isArray(parsedVal) && parsedVal?.activeWipBatchUuid) ? parsedVal.activeWipBatchUuid : null;

                  const localLastActiveChange = parseInt(localStorage.getItem('m_label_active_wip_batch_updated_at') || '0', 10);
                  const cloudUpdatedAt = cs.updated_at ? new Date(cs.updated_at).getTime() : 0;
                  const currentLocalActiveUuid = localStorage.getItem('m_label_active_wip_batch_uuid');

                  // Jika lokal baru saja mengubah acuan (< 10 menit atau timestamp lokal > cloud), jangan timpa acuan lokal!
                  const isLocalFresher = localLastActiveChange > cloudUpdatedAt || (Date.now() - localLastActiveChange < 600000 && Boolean(currentLocalActiveUuid));

                  const existingBatches = await db.wip_updates.toArray();
                  const batchMap = new Map(existingBatches.map(b => [b.uuid, b]));

                  // Merge batch dari cloud tanpa menghilangkan batch lokal terbaru
                  for (const cb of updatesList) {
                    const localBatch = batchMap.get(cb.uuid);
                    if (localBatch) {
                      const shouldBeActive = isLocalFresher
                        ? (localBatch.uuid === currentLocalActiveUuid ? 1 : 0)
                        : (cloudActiveWipUuid ? (cb.uuid === cloudActiveWipUuid ? 1 : 0) : cb.isActive);
                      await db.wip_updates.update(localBatch.id, {
                        ...cb,
                        id: localBatch.id,
                        isActive: shouldBeActive
                      });
                    } else {
                      const { id, ...newBatch } = cb;
                      await db.wip_updates.add({
                        ...newBatch,
                        isActive: (!isLocalFresher && cloudActiveWipUuid && cb.uuid === cloudActiveWipUuid) ? 1 : 0
                      });
                    }
                  }

                  const allBatchesAfterSync = await db.wip_updates.toArray();
                  const sortedBatches = allBatchesAfterSync.slice().sort((a, b) => {
                    const tB = new Date(b.tanggal || b.createdAt || 0).getTime() || 0;
                    const tA = new Date(a.tanggal || a.createdAt || 0).getTime() || 0;
                    return tB - tA;
                  });
                  const newestBatch = sortedBatches[0];
                  const cloudBatchItem = allBatchesAfterSync.find(b => b.uuid === cloudActiveWipUuid);

                  const newestBatchTime = newestBatch ? (new Date(newestBatch.tanggal || newestBatch.createdAt || 0).getTime() || 0) : 0;
                  const cloudBatchTime = cloudBatchItem ? (new Date(cloudBatchItem.tanggal || cloudBatchItem.createdAt || 0).getTime() || 0) : 0;

                  // Tentukan acuan akhir:
                  // 1. Jika lokal baru saja mengubah acuan secara eksplisit -> gunakan lokal
                  // 2. Jika ada batch lokal dengan tanggal upload lebih baru dari acuan cloud -> gunakan batch terbaru!
                  // 3. Jika tidak, gunakan acuan dari cloud
                  let finalActiveUuid = null;
                  if (isLocalFresher && currentLocalActiveUuid) {
                    finalActiveUuid = currentLocalActiveUuid;
                  } else if (newestBatch && newestBatchTime > cloudBatchTime) {
                    finalActiveUuid = newestBatch.uuid;
                  } else {
                    finalActiveUuid = cloudActiveWipUuid;
                  }

                  const validBatch = allBatchesAfterSync.find(b => b.uuid === finalActiveUuid);
                  if (!validBatch && sortedBatches.length > 0) {
                    finalActiveUuid = sortedBatches[0].uuid;
                  }

                  if (finalActiveUuid && typeof window !== 'undefined') {
                    localStorage.setItem('m_label_active_wip_batch_uuid', finalActiveUuid);
                  }

                  // Pastikan hanya batch terpilih yang isActive = 1 di IndexedDB
                  for (const b of allBatchesAfterSync) {
                    const shouldBe = (b.uuid === finalActiveUuid) ? 1 : 0;
                    if (b.isActive !== shouldBe) {
                      await db.wip_updates.update(b.id, { isActive: shouldBe });
                    }
                  }

                  // Jika acuan lokal berbeda / lebih baru daripada cloud, sinkronkan acuan lokal ke cloud sekarang juga
                  if (finalActiveUuid && finalActiveUuid !== cloudActiveWipUuid) {
                    pushWipRegistryToSupabase(finalActiveUuid).catch(() => {});
                  }
                } catch (wipBatchErr) {
                  console.warn('Sync pull wip_updates registry:', wipBatchErr);
                }
              }

              // Jika ini registry master items inventory, sinkronkan ke db.inventory_items
              if (cs.key === 'ims_inventory_master_items' && db.inventory_items && Array.isArray(parsedVal)) {
                try {
                  const existingItems = await db.inventory_items.toArray();
                  const itemMap = new Map(existingItems.map(i => [(i.descriptionExcel || '').trim().toLowerCase(), i.id]));
                  for (const mi of parsedVal) {
                    const key = (mi.descriptionExcel || '').trim().toLowerCase();
                    const localId = itemMap.get(key);
                    if (localId) {
                      await db.inventory_items.update(localId, { ...mi, id: localId });
                    } else {
                      const { id, ...newItem } = mi;
                      await db.inventory_items.add(newItem);
                    }
                  }
                } catch (invItemErr) {
                  console.warn('Sync pull inventory master items:', invItemErr);
                }
              }

              // Jika ini registry stok FG, sinkronkan upload & current stock
              if (cs.key === 'ims_inventory_stocks_registry' && parsedVal && typeof parsedVal === 'object') {
                try {
                  if (parsedVal.activeUploadUuid && typeof window !== 'undefined') {
                    localStorage.setItem('m_label_active_fg_upload_uuid', parsedVal.activeUploadUuid);
                  }
                  if (parsedVal.activeUploadId && typeof window !== 'undefined') {
                    localStorage.setItem('m_label_active_fg_upload_id', String(parsedVal.activeUploadId));
                  }
                  if (db.inventory_stock_uploads && Array.isArray(parsedVal.uploads)) {
                    for (const up of parsedVal.uploads) {
                      let exist = null;
                      if (up.uuid) {
                        exist = await db.inventory_stock_uploads.where('uuid').equals(up.uuid).first();
                      }
                      if (!exist && up.uploadDate) {
                        exist = await db.inventory_stock_uploads.where('uploadDate').equals(up.uploadDate).first();
                      }
                      if (!exist) {
                        const { id, ...newUp } = up;
                        await db.inventory_stock_uploads.add(newUp);
                      } else if (up.uuid && !exist.uuid) {
                        await db.inventory_stock_uploads.update(exist.id, { uuid: up.uuid });
                      }
                    }
                  }
                  if (db.inventory_current_stocks && Array.isArray(parsedVal.currentStocks) && parsedVal.currentStocks.length > 0) {
                    await db.inventory_current_stocks.clear();
                    const cleanStocks = parsedVal.currentStocks.map(s => {
                      const { id, ...rest } = s;
                      return rest;
                    });
                    await db.inventory_current_stocks.bulkAdd(cleanStocks);
                  }
                } catch (invStockErr) {
                  console.warn('Sync pull inventory stocks:', invStockErr);
                }
              }

              // Jika ini registry riwayat upload data roll, sinkronkan ke db.data_roll_uploads
              if (cs.key === 'data_roll_uploads_registry' && db.data_roll_uploads && Array.isArray(parsedVal)) {
                try {
                  const existingBatches = await db.data_roll_uploads.toArray();
                  const batchMap = new Map(existingBatches.map(b => [b.uuid, b.id]));
                  for (const cb of parsedVal) {
                    const localId = batchMap.get(cb.uuid);
                    if (localId) {
                      await db.data_roll_uploads.update(localId, { ...cb, id: localId });
                    } else {
                      const { id, ...newBatch } = cb;
                      await db.data_roll_uploads.add(newBatch);
                    }
                  }
                } catch (druErr) {
                  console.warn('Sync pull data_roll_uploads registry:', druErr);
                }
              }
            }
            await db.settings.bulkPut(toUpdate);
          }
        } catch (setPullErr) {
          console.warn('[SyncPull] Settings pull notice:', setPullErr.message || setPullErr);
        }
      })());
    }

    // Pull WIP Rolls dari Cloud
    if (db.wip_rolls) {
      pullTasks.push((async () => {
        try {
          let q = supabase.from('wip_rolls').select('*').limit(5000);
          if (isDelta) {
            q = q.gt('updated_at', lastSyncIso);
          }
          const { data: cloudWips, error } = await q;
          if (!error && cloudWips && cloudWips.length > 0) {
            const uuids = cloudWips.map(w => w.uuid).filter(Boolean);
            const existingWips = isDelta
              ? await db.wip_rolls.where('uuid').anyOf(uuids).toArray()
              : await db.wip_rolls.toArray();
            const localMap = new Map(existingWips.map(w => [w.uuid, w.id]));
            const toUpdate = [];
            const toAdd = [];

            for (const cw of cloudWips) {
              if (cw.is_deleted) {
                const localId = localMap.get(cw.uuid);
                if (localId) await db.wip_rolls.delete(localId);
                continue;
              }
              const mapped = mapWipRollFromSupabase(cw);
              const localId = localMap.get(cw.uuid);
              if (localId) {
                toUpdate.push({ ...mapped, id: localId });
              } else {
                toAdd.push(mapped);
              }
            }

            if (toUpdate.length > 0) await db.wip_rolls.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.wip_rolls.bulkAdd(toAdd);
          }
        } catch (wipPullErr) {
          console.warn('[SyncPull] WIP rolls pull notice:', wipPullErr.message || wipPullErr);
        }
      })());
    }

    // Pull Data Roll Uploads table dari Cloud jika ada
    if (db.data_roll_uploads) {
      pullTasks.push((async () => {
        try {
          let q = supabase.from('data_roll_uploads').select('*').limit(2000);
          if (isDelta) {
            q = q.gt('updated_at', lastSyncIso);
          }
          const { data: cloudUploads, error } = await q;
          if (!error && cloudUploads && cloudUploads.length > 0) {
            const uuids = cloudUploads.map(u => u.uuid).filter(Boolean);
            const existingBatches = isDelta
              ? await db.data_roll_uploads.where('uuid').anyOf(uuids).toArray()
              : await db.data_roll_uploads.toArray();
            const localMap = new Map(existingBatches.map(b => [b.uuid, b.id]));
            for (const cu of cloudUploads) {
              const mapped = {
                uuid: cu.uuid,
                uploadDate: cu.upload_date,
                batchName: cu.batch_name,
                source: cu.source,
                fileName: cu.file_name,
                machine: cu.machine,
                totalRolls: cu.total_rolls,
                totalKg: cu.total_kg,
                passCount: cu.pass_count,
                holdCount: cu.hold_count,
                rejectCount: cu.reject_count,
                uploadedBy: cu.uploaded_by,
                status: cu.status,
                rollsJson: cu.rolls_json,
                createdAt: cu.created_at,
                updatedAt: cu.updated_at
              };
              const localId = localMap.get(cu.uuid);
              if (localId) {
                await db.data_roll_uploads.update(localId, { ...mapped, id: localId });
              } else {
                await db.data_roll_uploads.add(mapped);
              }
            }
          }
        } catch (e) {
          // Table may not exist on cloud, fallback settings registry handles it
        }
      })());
    }

    // Jalankan seluruh pull secara PARALEL
    await Promise.all(pullTasks);

    // Sukses: simpan ISO timestamp untuk delta sync berikutnya HANYA jika tidak ada error pada halaman penarikan
    if (!syncHasErrors || forceFull) {
      localStorage.setItem('mlabel_last_sync_iso', syncStartTime);
      syncState.lastSyncIso = syncStartTime;
    } else {
      console.warn('[SyncPull] Beberapa halaman gagal ditarik, cursor delta sync TIDAK dimajukan agar data yang tertinggal dapat ditarik kembali.');
    }

    // Kirim notifikasi event ke store (agar Pinia langsung refresh tanpa perlu reload browser)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sync:config-updated'));
      window.dispatchEvent(new CustomEvent('sync:ai-config-updated'));
      window.dispatchEvent(new CustomEvent('sync:data-rolls-updated'));
      window.dispatchEvent(new CustomEvent('sync:data-roll-uploads-updated'));
      window.dispatchEvent(new CustomEvent('sync:labels-updated'));
      window.dispatchEvent(new CustomEvent('sync:wip-updated'));
      window.dispatchEvent(new CustomEvent('sync:inventory-updated'));
      window.dispatchEvent(new CustomEvent('sync:spk-plans-updated'));
    }

    syncState.lastSyncTime = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    localStorage.setItem('mlabel_last_sync_time', syncState.lastSyncTime);
  } catch (err) {
    console.error('Error pulling from Supabase:', err);
    syncState.lastError = err.message || 'Gagal mengunduh data dari cloud';
  } finally {
    syncState.isSyncing = false;
  }
}

// 3. Count unsynced records
export async function countUnsynced() {
  try {
    if (!db.labels) return 0;
    const count = await db.labels.filter(l => l.synced === 0 || !l.synced).count();
    syncState.unsyncedCount = count;
    return count;
  } catch (e) {
    return 0;
  }
}

// 4. Full Bidirectional Sync
export async function syncAll(forceFull = false) {
  if (syncState.isSyncing) return;
  // PULL FIRST! Selalu unduh dan rekonsiliasi data/hapus dari cloud sebelum mencoba push
  await pullFromSupabase(forceFull);
  await pushLocalToSupabase();
  await countUnsynced();
}

// 4b. Force Full Sync Reconciliation (Menghapus cursor delta dan menarik ulang 100% data dari cloud)
export async function forceFullSync() {
  localStorage.removeItem('mlabel_last_sync_iso');
  syncState.lastSyncIso = null;
  return syncAll(true);
}

// 5. Broadcast helper antar device (sub-100ms real-time event sync)
const CLIENT_DEVICE_ID = 'dev_' + Math.random().toString(36).substring(2, 9);

export async function broadcastRealtimeEvent(event, payload = {}) {
  try {
    if (realtimeChannel && syncState.realtimeConnected) {
      await realtimeChannel.send({
        type: 'broadcast',
        event,
        payload: { ...payload, senderDeviceId: CLIENT_DEVICE_ID, timestamp: Date.now() }
      });
    }
  } catch (err) {
    console.warn(`broadcastRealtimeEvent (${event}) notice:`, err);
  }
}

export async function broadcastClearAllRolls() {
  return broadcastRealtimeEvent('clear_all_data_rolls', { timestamp: Date.now() });
}

// 6. REALTIME LISTENER: Menerima perubahan langsung dari Supabase saat user lain menginput
let realtimeChannel = null;
let debounceConfigPullTimer = null;
let reconnectTimer = null;
let backgroundSyncInterval = null;
let isIntentionallyClosingChannel = false;
let reconnectAttempts = 0;

function debouncedPull(callback, table) {
  if (debounceConfigPullTimer) clearTimeout(debounceConfigPullTimer);
  debounceConfigPullTimer = setTimeout(async () => {
    if (!syncState.isSyncing) {
      await pullFromSupabase(false);
    }
    if (callback) callback(table);
  }, 1000);
}

function scheduleRealtimeReconnect(callback) {
  if (reconnectTimer) return;
  const delay = Math.min(30000, 4000 * Math.pow(1.5, Math.min(reconnectAttempts, 5)));
  reconnectTimer = setTimeout(async () => {
    reconnectTimer = null;
    reconnectAttempts++;
    if (realtimeChannel) {
      try {
        isIntentionallyClosingChannel = true;
        await supabase.removeChannel(realtimeChannel);
      } catch (e) {
      } finally {
        isIntentionallyClosingChannel = false;
      }
      realtimeChannel = null;
    }
    console.log(`🔄 Reconnecting Supabase Realtime channel (percobaan ke-${reconnectAttempts})...`);
    startRealtimeSync(callback);
    if (!syncState.isSyncing) {
      pullFromSupabase(false).catch(() => {});
    }
  }, delay);
}

function startBackgroundSyncPoller() {
  if (backgroundSyncInterval) return;
  backgroundSyncInterval = setInterval(async () => {
    if (navigator.onLine && !syncState.isSyncing) {
      try {
        await pullFromSupabase(false);
      } catch (e) {
        console.warn('[BackgroundPoller] Delta sync error:', e);
      }
    }
  }, 45000);
}

// Tambahkan auto-reconnect saat tab kembali aktif atau device online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    if (!syncState.realtimeConnected) {
      scheduleRealtimeReconnect();
    }
  });
  window.addEventListener('focus', () => {
    if (!syncState.realtimeConnected) {
      scheduleRealtimeReconnect();
    }
  });
}

export function startRealtimeSync(onDataChangeCallback) {
  if (realtimeChannel) return;

  startBackgroundSyncPoller();

  realtimeChannel = supabase.channel('m_label_realtime_stream')
    // 1. Labels
    .on('postgres_changes', { event: '*', schema: 'public', table: 'labels' }, async (payload) => {
      console.log('⚡ Realtime Label event received:', payload.eventType);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const item = mapLabelFromSupabase(payload.new);
        let existing = null;
        try {
          existing = await db.labels.where('uniqId').equals(item.uniqId).first();
        } catch (eFind) {
          existing = await db.labels.filter(l => l.uniqId === item.uniqId || l.uuid === item.uniqId).first();
        }
        if (existing) {
          const merged = {
            ...existing,
            ...item,
            mesin: item.mesin || existing.mesin || '',
            keterangan: item.keterangan || existing.keterangan || '',
            shift: item.shift || existing.shift || '',
            diameterCore: item.diameterCore || existing.diameterCore || 6,
            id: existing.id
          };
          await db.labels.update(existing.id, merged);
        } else {
          await db.labels.add(item);
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const targetId = payload.old.uniq_id || payload.old.uniqId || payload.old.id;
        if (targetId) {
          recordTombstones('labels', [targetId]);
          let existing = null;
          try {
            existing = await db.labels.where('uniqId').equals(targetId).first();
          } catch (eFind) {
            existing = await db.labels.filter(l => l.uniqId === targetId || l.uuid === targetId).first();
          }
          if (existing) await db.labels.delete(existing.id);
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:labels-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('labels');
    })
    // 2. SPK Plans
    .on('postgres_changes', { event: '*', schema: 'public', table: 'spk_plans' }, async (payload) => {
      console.log('⚡ Realtime SPK Plan event received:', payload.eventType);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const plan = mapSpkPlanFromSupabase(payload.new);
        const existing = await db.spk_plans.where('uuid').equals(plan.uuid).first();
        if (existing) {
          await db.spk_plans.update(existing.id, plan);
        } else {
          await db.spk_plans.add(plan);
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const targetUuid = payload.old.uuid;
        if (targetUuid) {
          const existing = await db.spk_plans.where('uuid').equals(targetUuid).first();
          if (existing) await db.spk_plans.delete(existing.id);
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:spk-plans-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('spk_plans');
    })
    // 3. SPK Batches
    .on('postgres_changes', { event: '*', schema: 'public', table: 'spk_batches' }, async (payload) => {
      console.log('⚡ Realtime SPK Batches event received:', payload.eventType);
      debouncedPull(onDataChangeCallback, 'spk_batches');
    })
    // 4. Data Rolls
    .on('postgres_changes', { event: '*', schema: 'public', table: 'data_rolls' }, async (payload) => {
      console.log('⚡ Realtime data_rolls event received:', payload.eventType);
      if (payload.eventType === 'DELETE') {
        const targetUuid = payload.old ? (payload.old.uuid || payload.old.id) : null;
        if (targetUuid) {
          recordTombstones('data_rolls', [targetUuid]);
          const existing = await db.data_rolls.where('uuid').equals(targetUuid).first();
          if (existing) {
            await db.data_rolls.delete(existing.id);
          }
        }
        debouncedPull(onDataChangeCallback, 'data_rolls');
      } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const item = mapDataRollFromSupabase(payload.new);
        const deletedRollSet = new Set(getTombstones('data_rolls'));
        if (!deletedRollSet.has(item.uuid)) {
          const existing = await db.data_rolls.where('uuid').equals(item.uuid).first();
          if (existing) {
            const merged = {
              ...existing,
              ...item,
              machineName: item.machineName || existing.machineName || '',
              keterangan: item.keterangan || existing.keterangan || existing.reasonDefect || '',
              reasonDefect: item.reasonDefect || existing.reasonDefect || existing.keterangan || '',
              id: existing.id
            };
            await db.data_rolls.update(existing.id, merged);
          } else {
            await db.data_rolls.add(item);
          }
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:data-rolls-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('data_rolls');
    })
    // 5. WIP Rolls
    .on('postgres_changes', { event: '*', schema: 'public', table: 'wip_rolls' }, async (payload) => {
      console.log('⚡ Realtime wip_rolls event received:', payload.eventType);
      if (payload.eventType === 'DELETE') {
        const targetUuid = payload.old ? (payload.old.uuid || payload.old.id) : null;
        if (targetUuid && db.wip_rolls) {
          const existing = await db.wip_rolls.where('uuid').equals(targetUuid).first();
          if (existing) await db.wip_rolls.delete(existing.id);
        }
      } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        if (payload.new && db.wip_rolls) {
          const mapped = mapWipRollFromSupabase(payload.new);
          const existing = await db.wip_rolls.where('uuid').equals(mapped.uuid).first();
          if (existing) {
            await db.wip_rolls.update(existing.id, mapped);
          } else {
            await db.wip_rolls.add(mapped);
          }
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:wip-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('wip_rolls');
    })
    // 6. Broadcast Events (Sub-100ms ultra fast device-to-device sync)
    .on('broadcast', { event: 'wip_broadcast' }, async (payload) => {
      // Abaikan jika broadcast berasal dari perangkat ini sendiri untuk mencegah race condition loop
      if (payload?.payload?.senderDeviceId === CLIENT_DEVICE_ID) {
        return;
      }
      console.log('⚡ [Realtime] Received WIP broadcast from another device', payload);
      const wUuid = payload?.payload?.targetUuid || payload?.payload?.batchUuid || payload?.payload?.newActiveUuid;
      if (wUuid && typeof window !== 'undefined') {
        localStorage.setItem('m_label_active_wip_batch_uuid', wUuid);
        localStorage.setItem('m_label_active_wip_batch_updated_at', String(Date.now()));
      }
      await pullFromSupabase(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:wip-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('wip');
    })
    .on('broadcast', { event: 'inventory_broadcast' }, async (payload) => {
      console.log('⚡ [Realtime] Received Inventory broadcast from another device', payload);
      const upUuid = payload?.payload?.uploadUuid;
      const upId = payload?.payload?.uploadId;
      if (typeof window !== 'undefined') {
        if (upUuid) localStorage.setItem('m_label_active_fg_upload_uuid', upUuid);
        if (upId) localStorage.setItem('m_label_active_fg_upload_id', String(upId));
      }
      await pullFromSupabase(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:inventory-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('inventory');
    })
    .on('broadcast', { event: 'spk_broadcast' }, async (payload) => {
      console.log('⚡ [Realtime] Received SPK broadcast from another device', payload);
      const bUuid = payload?.payload?.batchUuid;
      if (bUuid && typeof window !== 'undefined') {
        localStorage.setItem('spk_active_reference_batch_uuid', bUuid);
        window.dispatchEvent(new CustomEvent('sync:spk-reference-updated', { detail: { batchUuid: bUuid } }));
      }
      await pullFromSupabase(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:spk-plans-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('spk_plans');
    })
    .on('broadcast', { event: 'labels_broadcast' }, async () => {
      console.log('⚡ [Realtime] Received Labels broadcast from another device');
      await pullFromSupabase(false);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:labels-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('labels');
    })
    .on('broadcast', { event: 'clear_all_data_rolls' }, async () => {
      console.log('⚡ [Realtime] Menerima broadcast Hapus Semua Data Roll dari perangkat lain');
      if (db.data_rolls) {
        const all = await db.data_rolls.toArray();
        const allUuids = all.map(r => r.uuid).filter(Boolean);
        if (allUuids.length > 0) recordTombstones('data_rolls', allUuids);
        await db.data_rolls.clear();
      }
      if (db.data_roll_uploads) {
        await db.data_roll_uploads.clear();
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:data-rolls-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('data_rolls');
    })
    // 7. Master Config Tables
    .on('postgres_changes', { event: '*', schema: 'public', table: 'film_configs' }, () => {
      debouncedPull(onDataChangeCallback, 'film_configs');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'resin_items' }, () => {
      debouncedPull(onDataChangeCallback, 'resin_items');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bom_formulas' }, () => {
      debouncedPull(onDataChangeCallback, 'bom_formulas');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'operator_list' }, () => {
      debouncedPull(onDataChangeCallback, 'operator_list');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'settings' }, (payload) => {
      const key = payload?.new?.key || payload?.old?.key;
      console.log('⚡ Realtime settings event received for key:', key);
      if (key === 'operator_tenure_registry') {
        debouncedPull(onDataChangeCallback, 'operator_list');
      } else if (key === 'ims_wip_updates_registry' || key === 'ims_wip_active_batch_uuid') {
        debouncedPull(onDataChangeCallback, 'wip');
      } else if (key === 'ims_inventory_stocks_registry' || key === 'ims_inventory_master_items') {
        debouncedPull(onDataChangeCallback, 'inventory');
      } else if (key === 'spk_active_reference_batch_uuid') {
        const newBatchUuid = payload?.new?.value;
        if (newBatchUuid && typeof window !== 'undefined') {
          localStorage.setItem('spk_active_reference_batch_uuid', newBatchUuid);
          window.dispatchEvent(new CustomEvent('sync:spk-reference-updated', { detail: { batchUuid: newBatchUuid } }));
        }
        debouncedPull(onDataChangeCallback, 'spk_reference');
      } else if (key === 'system_users_registry') {
        debouncedPull(onDataChangeCallback, 'users');
      } else if (key === 'data_roll_uploads_registry') {
        debouncedPull(onDataChangeCallback, 'data_roll_uploads');
      }
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mesin_list' }, () => {
      debouncedPull(onDataChangeCallback, 'mesin_list');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'location_list' }, () => {
      debouncedPull(onDataChangeCallback, 'location_list');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'standard_lengths' }, () => {
      debouncedPull(onDataChangeCallback, 'standard_lengths');
    })
    .subscribe((status, err) => {
      if (status === 'SUBSCRIBED') {
        syncState.realtimeConnected = true;
        reconnectAttempts = 0;
        console.log('🟢 Supabase Realtime channel connected successfully!');
      } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        syncState.realtimeConnected = false;
        console.warn(`⚠️ Supabase Realtime channel status: ${status}. Scheduling reconnect...`, err);
        scheduleRealtimeReconnect(onDataChangeCallback);
      } else if (status === 'CLOSED') {
        syncState.realtimeConnected = false;
        if (!isIntentionallyClosingChannel) {
          console.warn(`⚠️ Supabase Realtime channel status: CLOSED. Scheduling reconnect...`);
          scheduleRealtimeReconnect(onDataChangeCallback);
        }
      } else {
        syncState.realtimeConnected = false;
      }
    });
}
