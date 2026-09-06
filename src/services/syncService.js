import { ref, reactive } from 'vue';
import { supabase } from './supabaseClient';
import { db } from '@/db';

export { supabase };

export const syncState = reactive({
  isOnline: navigator.onLine,
  isSyncing: false,
  lastSyncTime: localStorage.getItem('mlabel_last_sync_time') || null,
  unsyncedCount: 0,
  realtimeConnected: false,
  lastError: null
});

// Network liveness listeners
window.addEventListener('online', () => {
  syncState.isOnline = true;
  syncAll();
});
window.addEventListener('offline', () => {
  syncState.isOnline = false;
});

// Helper to convert label from Dexie format to Supabase snake_case format
function mapLabelToSupabase(l) {
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
    is_deleted: Boolean(l.isDeleted),
    created_at: l.createdAt || new Date().toISOString(),
    updated_at: l.updatedAt || new Date().toISOString()
  };
}

// Helper to convert label from Supabase snake_case format to Dexie format
function mapLabelFromSupabase(s) {
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
    verified: s.verified ? 1 : 0,
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
  if (column === 'uuid' || column === 'uniq_id') {
    recordTombstones(table, [value]);
  }
  if (!navigator.onLine) return;
  try {
    const { error } = await supabase.from(table).delete().eq(column, value);
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

          await db.transaction('rw', db.labels, async () => {
            for (const l of unsyncedLabels) {
              await db.labels.update(l.id, { synced: 1 });
            }
          });
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
          await db.transaction('rw', db.data_rolls, async () => {
            for (const r of unsyncedRolls) {
              await db.data_rolls.update(r.id, { synced: 1 });
            }
          });
        }
      })());
    }

    // 1d. Operator List Sync
    if (db.operator_list) {
      tasks.push((async () => {
        try {
          const operators = await db.operator_list.toArray();
          if (operators.length > 0) {
            const payload = operators.map(o => ({
              nama: o.nama,
              mesin: o.mesin || '',
              kode_grup: o.kodeGrup || '',
              kode_operator: o.kodeOperator || '',
              active: o.active !== false,
              created_at: o.createdAt || new Date().toISOString(),
              updated_at: o.updatedAt || new Date().toISOString()
            }));
            const { error } = await supabase.from('operator_list').upsert(payload, { onConflict: 'nama' });
            if (error) {
              console.warn('operator_list upsert notice, trying missing insert:', error.message);
              const { data: existing } = await supabase.from('operator_list').select('nama');
              const existingSet = new Set((existing || []).map(e => (e.nama || '').trim().toUpperCase()));
              const missing = payload.filter(p => !existingSet.has((p.nama || '').trim().toUpperCase()));
              if (missing.length > 0) {
                await supabase.from('operator_list').insert(missing);
              }
            }
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
export async function pullFromSupabase() {
  if (!navigator.onLine) return;
  syncState.isSyncing = true;
  syncState.lastError = null;

  try {
    const pullTasks = [];

    // Pull Labels (Paginated Range)
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
            const { data, error } = await supabase
              .from('labels')
              .select('*')
              .order('updated_at', { ascending: false })
              .range(from, to);

            if (error) {
              console.error('[SyncPull] Error fetching labels page ' + page + ':', error.message);
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
        }

        if (!fetchCompleted && cloudLabels.length === 0) return;

        const cloudUniqIds = new Set(cloudLabels.map(cl => cl.uniq_id).filter(Boolean));
        if (cloudUniqIds.size > 0) {
          removeTombstones('labels', cloudUniqIds);
        }

        const deletedLabelSet = new Set(getTombstones('labels'));
        const existingLocal = await db.labels.toArray();
        const localMap = new Map(existingLocal.map(l => [l.uniqId, l.id]));
        const toUpdate = [];
        const toAdd = [];

        for (const cl of cloudLabels) {
          if (deletedLabelSet.has(cl.uniq_id)) continue;
          const mapped = mapLabelFromSupabase(cl);
          const localId = localMap.get(cl.uniq_id);
          if (localId) {
            toUpdate.push({ ...mapped, id: localId });
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
      })());
    }

    // Pull SPK Batches
    if (db.spk_batches) {
      pullTasks.push((async () => {
        const { data: cloudBatches } = await supabase.from('spk_batches').select('*');
        if (cloudBatches && cloudBatches.length > 0) {
          const existingLocal = await db.spk_batches.toArray();
          const localMap = new Map(existingLocal.map(b => [b.uuid, b.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cb of cloudBatches) {
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

          await db.transaction('rw', db.spk_batches, async () => {
            if (toUpdate.length > 0) await db.spk_batches.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.spk_batches.bulkAdd(toAdd);
          });
        }
      })());
    }

    // Pull SPK Plans
    if (db.spk_plans) {
      pullTasks.push((async () => {
        const { data: cloudPlans } = await supabase.from('spk_plans').select('*');
        if (cloudPlans && cloudPlans.length > 0) {
          const existingLocal = await db.spk_plans.toArray();
          const localMap = new Map(existingLocal.map(p => [p.uuid, p.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const cp of cloudPlans) {
            const pRecord = mapSpkPlanFromSupabase(cp);
            const localId = localMap.get(cp.uuid);
            if (localId) {
              toUpdate.push({ ...pRecord, id: localId });
            } else {
              toAdd.push(pRecord);
            }
          }

          await db.transaction('rw', db.spk_plans, async () => {
            if (toUpdate.length > 0) await db.spk_plans.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.spk_plans.bulkAdd(toAdd);
          });
        }
      })());
    }

    // Pull Data Rolls (Paginated Range in chunks of 1000 to fetch all 10,000+ rolls)
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
            const { data, error } = await supabase
              .from('data_rolls')
              .select('*')
              .order('created_at', { ascending: false })
              .range(from, to);

            if (error) {
              console.error('[SyncPull] Error fetching data_rolls page ' + page + ':', error.message);
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
        }

        // Jika fetch sama sekali gagal (misal koneksi terputus sebelum halaman pertama), jangan sentuh lokal
        if (!fetchCompleted && allCloudRolls.length === 0) return;

        const cloudUuids = new Set(allCloudRolls.map(cr => cr.uuid).filter(Boolean));

        // PENTING: Jika data ada di cloud, ini membuktikan data tersebut AKTIF dan TIDAK TERHAPUS!
        // Segera hapus UUID-nya dari blacklist tombstone lokal (agar tidak terblokir di UI)
        if (cloudUuids.size > 0) {
          removeTombstones('data_rolls', cloudUuids);
        }

        const deletedRollSet = new Set(getTombstones('data_rolls'));
        const existingLocal = await db.data_rolls.toArray();
        const localMap = new Map(existingLocal.map(r => [r.uuid, r.id]));
        const toUpdate = [];
        const toAdd = [];

        for (const cr of allCloudRolls) {
          if (deletedRollSet.has(cr.uuid)) continue;
          const mapped = mapDataRollFromSupabase(cr);
          const localId = localMap.get(cr.uuid);
          if (localId) {
            toUpdate.push({ ...mapped, id: localId });
          } else {
            toAdd.push(mapped);
          }
        }

        // REKONSILIASI DELETE UNTUK DATA ROLLS:
        // HANYA hapus lokal jika:
        // 1. Fetch cloud telah SELESAI 100% (fetchCompleted === true)
        // 2. DAN roll lokal sudah pernah tersinkron (synced === 1) tetapi tidak ada di cloud
        let staleLocalRolls = [];
        if (fetchCompleted) {
          const nowMs = Date.now();
          staleLocalRolls = existingLocal.filter(r => {
            if (!r.uuid) return false;
            // Jika masuk tombstone dan memang tidak ada di cloud
            if (deletedRollSet.has(r.uuid) && !cloudUuids.has(r.uuid)) return true;
            // Jika tidak ada di cloud
            if (!cloudUuids.has(r.uuid)) {
              if (r.synced === 0 && r.createdAt) {
                const ageMs = nowMs - new Date(r.createdAt).getTime();
                if (!isNaN(ageMs) && ageMs < 60000) return false; // Jangan hapus data yang baru dibuat offline
              }
              return r.synced === 1;
            }
            return false;
          });
        }

        // Simpan dalam chunk 2500 agar transaksi IndexedDB sangat stabil
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
      })());
    }

    // Pull Operators
    if (db.operator_list) {
      pullTasks.push((async () => {
        const { data: cloudOps } = await supabase.from('operator_list').select('*');
        if (cloudOps && cloudOps.length > 0) {
          const existing = await db.operator_list.toArray();
          const localMap = new Map(existing.map(o => [o.nama.toUpperCase(), o.id]));
          const toUpdate = [];
          const toAdd = [];

          for (const co of cloudOps) {
            const rec = {
              nama: co.nama,
              mesin: co.mesin,
              kodeGrup: co.kode_grup,
              kodeOperator: co.kode_operator,
              active: co.active,
              createdAt: co.created_at,
              updatedAt: co.updated_at
            };
            const localId = localMap.get(co.nama.toUpperCase());
            if (localId) {
              toUpdate.push({ ...rec, id: localId });
            } else {
              toAdd.push(rec);
            }
          }

          await db.transaction('rw', db.operator_list, async () => {
            if (toUpdate.length > 0) await db.operator_list.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.operator_list.bulkAdd(toAdd);
          });
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

          await db.transaction('rw', db.mesin_list, async () => {
            if (toUpdate.length > 0) await db.mesin_list.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.mesin_list.bulkAdd(toAdd);
          });
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

          await db.transaction('rw', db.film_configs, async () => {
            if (toUpdate.length > 0) await db.film_configs.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.film_configs.bulkAdd(toAdd);
          });
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

          await db.transaction('rw', db.resin_items, async () => {
            if (toUpdate.length > 0) await db.resin_items.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.resin_items.bulkAdd(toAdd);
          });
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

          await db.transaction('rw', db.bom_formulas, async () => {
            if (toUpdate.length > 0) await db.bom_formulas.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.bom_formulas.bulkAdd(toAdd);
          });
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

          await db.transaction('rw', db.location_list, async () => {
            if (toUpdate.length > 0) await db.location_list.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.location_list.bulkAdd(toAdd);
          });
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

          await db.transaction('rw', db.standard_lengths, async () => {
            if (toUpdate.length > 0) await db.standard_lengths.bulkPut(toUpdate);
            if (toAdd.length > 0) await db.standard_lengths.bulkAdd(toAdd);
          });
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
            }
            await db.settings.bulkPut(toUpdate);
          }
        } catch (setPullErr) {
          console.warn('[SyncPull] Settings pull notice:', setPullErr.message || setPullErr);
        }
      })());
    }

    // Jalankan seluruh pull secara PARALEL
    await Promise.all(pullTasks);

    // Kirim notifikasi event ke store (agar Pinia langsung refresh tanpa perlu reload browser)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sync:config-updated'));
      window.dispatchEvent(new CustomEvent('sync:data-rolls-updated'));
      window.dispatchEvent(new CustomEvent('sync:labels-updated'));
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
export async function syncAll() {
  if (syncState.isSyncing) return;
  // PULL FIRST! Selalu unduh dan rekonsiliasi data/hapus dari cloud sebelum mencoba push
  await pullFromSupabase();
  await pushLocalToSupabase();
  await countUnsynced();
}

// 5. Broadcast helper antar device (misal ketika Hapus Semua Data Roll ditekan)
export async function broadcastClearAllRolls() {
  try {
    if (realtimeChannel) {
      await realtimeChannel.send({
        type: 'broadcast',
        event: 'clear_all_data_rolls',
        payload: { timestamp: Date.now() }
      });
    }
  } catch (err) {
    console.warn('broadcastClearAllRolls notice:', err);
  }
}

// 6. REALTIME LISTENER: Menerima perubahan langsung dari Supabase saat user lain menginput
let realtimeChannel = null;
let debounceConfigPullTimer = null;

function debouncedPull(callback, table) {
  if (debounceConfigPullTimer) clearTimeout(debounceConfigPullTimer);
  debounceConfigPullTimer = setTimeout(async () => {
    await pullFromSupabase();
    if (callback) callback(table);
  }, 1000);
}

export function startRealtimeSync(onDataChangeCallback) {
  if (realtimeChannel) return;

  realtimeChannel = supabase.channel('m_label_realtime_stream')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'labels' }, async (payload) => {
      console.log('⚡ Realtime Label event received:', payload.eventType);
      if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const item = mapLabelFromSupabase(payload.new);
        const existing = await db.labels.where('uniqId').equals(item.uniqId).first();
        if (existing) {
          await db.labels.update(existing.id, item);
        } else {
          await db.labels.add(item);
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const targetId = payload.old.uniq_id || payload.old.uniqId || payload.old.id;
        if (targetId) {
          recordTombstones('labels', [targetId]);
          const existing = await db.labels.where('uniqId').equals(targetId).first();
          if (existing) await db.labels.delete(existing.id);
        }
      }
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('sync:labels-updated'));
      }
      if (onDataChangeCallback) onDataChangeCallback('labels');
    })
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
        // Tarik perubahan terbaru dari cloud secara debounced
        debouncedPull(onDataChangeCallback, 'data_rolls');
      } else if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
        const item = mapDataRollFromSupabase(payload.new);
        const deletedRollSet = new Set(getTombstones('data_rolls'));
        if (!deletedRollSet.has(item.uuid)) {
          const existing = await db.data_rolls.where('uuid').equals(item.uuid).first();
          if (existing) {
            await db.data_rolls.update(existing.id, item);
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
    .on('postgres_changes', { event: '*', schema: 'public', table: 'mesin_list' }, () => {
      debouncedPull(onDataChangeCallback, 'mesin_list');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'location_list' }, () => {
      debouncedPull(onDataChangeCallback, 'location_list');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'standard_lengths' }, () => {
      debouncedPull(onDataChangeCallback, 'standard_lengths');
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        syncState.realtimeConnected = true;
        console.log('🟢 Supabase Realtime channel connected successfully!');
      } else {
        syncState.realtimeConnected = false;
      }
    });
}
