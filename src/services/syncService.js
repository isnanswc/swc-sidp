import { ref, reactive } from 'vue';
import { supabase } from './supabaseClient';
import { db } from '@/db';

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

// 1. PUSH: Kirim data lokal yang belum tersinkron (synced === 0) ke Supabase
export async function pushLocalToSupabase() {
  if (!navigator.onLine) return;
  syncState.isSyncing = true;
  syncState.lastError = null;

  try {
    // 1a. Labels Sync
    if (db.labels) {
      const unsyncedLabels = await db.labels.filter(l => l.synced === 0 || !l.synced).toArray();
      if (unsyncedLabels.length > 0) {
        const payload = unsyncedLabels.map(mapLabelToSupabase);
        const { error } = await supabase.from('labels').upsert(payload, { onConflict: 'uniq_id' });
        if (error) throw error;

        // Mark as synced locally
        await db.transaction('rw', db.labels, async () => {
          for (const l of unsyncedLabels) {
            await db.labels.update(l.id, { synced: 1 });
          }
        });
      }
    }

    // 1b. SPK Batches Sync
    if (db.spk_batches) {
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
    }

    // 1c. SPK Plans Sync
    if (db.spk_plans) {
      const allPlans = await db.spk_plans.toArray();
      if (allPlans.length > 0) {
        const payload = allPlans.map(mapSpkPlanToSupabase);
        await supabase.from('spk_plans').upsert(payload, { onConflict: 'uuid' });
      }
    }

    // 1d. Operator List Sync
    if (db.operator_list) {
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
        await supabase.from('operator_list').upsert(payload, { onConflict: 'nama' });
      }
    }

    // 1d-2. Mesin List Sync
    if (db.mesin_list) {
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
    }

    // 1e. Film Configs Sync
    if (db.film_configs) {
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
    }

    // 1f. Resin Items Sync
    if (db.resin_items) {
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
    }

    // 1g. BOM Formulas Sync
    if (db.bom_formulas) {
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
    }

    // 1h. Location List Sync
    if (db.location_list) {
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
        await supabase.from('location_list').upsert(payload, { onConflict: 'nama' });
      }
    }

    // 1i. Standard Lengths Sync
    if (db.standard_lengths) {
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
    }

    await countUnsynced();
  } catch (err) {
    console.error('Error pushing to Supabase:', err);
    syncState.lastError = err.message || 'Gagal mengirim data ke cloud';
  } finally {
    syncState.isSyncing = false;
  }
}

// 2. PULL: Ambil data terbaru dari Supabase ke lokal Dexie
export async function pullFromSupabase() {
  if (!navigator.onLine) return;
  syncState.isSyncing = true;
  syncState.lastError = null;

  try {
    // Pull Labels
    const { data: cloudLabels, error: lErr } = await supabase
      .from('labels')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(2000);

    if (lErr) throw lErr;

    if (cloudLabels && cloudLabels.length > 0) {
      await db.transaction('rw', db.labels, async () => {
        for (const cl of cloudLabels) {
          const existing = await db.labels.where('uniqId').equals(cl.uniq_id).first();
          const mapped = mapLabelFromSupabase(cl);
          if (existing) {
            await db.labels.update(existing.id, mapped);
          } else {
            await db.labels.add(mapped);
          }
        }
      });
    }

    // Pull SPK Batches
    const { data: cloudBatches, error: bErr } = await supabase.from('spk_batches').select('*');
    if (!bErr && cloudBatches && cloudBatches.length > 0) {
      await db.transaction('rw', db.spk_batches, async () => {
        for (const cb of cloudBatches) {
          const existing = await db.spk_batches.where('uuid').equals(cb.uuid).first();
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
          if (existing) {
            await db.spk_batches.update(existing.id, bRecord);
          } else {
            await db.spk_batches.add(bRecord);
          }
        }
      });
    }

    // Pull SPK Plans
    const { data: cloudPlans, error: pErr } = await supabase.from('spk_plans').select('*');
    if (!pErr && cloudPlans && cloudPlans.length > 0) {
      await db.transaction('rw', db.spk_plans, async () => {
        for (const cp of cloudPlans) {
          const existing = await db.spk_plans.where('uuid').equals(cp.uuid).first();
          const pRecord = mapSpkPlanFromSupabase(cp);
          if (existing) {
            await db.spk_plans.update(existing.id, pRecord);
          } else {
            await db.spk_plans.add(pRecord);
          }
        }
      });
    }

    // Pull Operators
    if (db.operator_list) {
      const { data: cloudOps } = await supabase.from('operator_list').select('*');
      if (cloudOps && cloudOps.length > 0) {
        await db.transaction('rw', db.operator_list, async () => {
          for (const co of cloudOps) {
            const existing = await db.operator_list.where('nama').equals(co.nama).first();
            const rec = {
              nama: co.nama,
              mesin: co.mesin,
              kodeGrup: co.kode_grup,
              kodeOperator: co.kode_operator,
              active: co.active,
              createdAt: co.created_at,
              updatedAt: co.updated_at
            };
            if (existing) {
              await db.operator_list.update(existing.id, rec);
            } else {
              await db.operator_list.add(rec);
            }
          }
        });
      }
    }

    // Pull Mesin
    if (db.mesin_list) {
      const { data: cloudMachines } = await supabase.from('mesin_list').select('*');
      if (cloudMachines && cloudMachines.length > 0) {
        await db.transaction('rw', db.mesin_list, async () => {
          for (const cm of cloudMachines) {
            const existing = await db.mesin_list.where('nama').equals(cm.nama).first();
            const rec = {
              nama: cm.nama,
              praKodePack: cm.pra_kode_pack,
              active: cm.active,
              createdAt: cm.created_at
            };
            if (existing) {
              await db.mesin_list.update(existing.id, rec);
            } else {
              await db.mesin_list.add(rec);
            }
          }
        });
      }
    }

    // Pull Film Configs
    if (db.film_configs) {
      const { data: cloudFilms } = await supabase.from('film_configs').select('*');
      if (cloudFilms && cloudFilms.length > 0) {
        await db.transaction('rw', db.film_configs, async () => {
          for (const cf of cloudFilms) {
            const existing = await db.film_configs.filter(f => f.jenis === cf.jenis && f.kodeFormula === cf.kode_formula).first();
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
            if (existing) {
              await db.film_configs.update(existing.id, rec);
            } else {
              await db.film_configs.add(rec);
            }
          }
        });
      }
    }

    // Pull Resin Items
    if (db.resin_items) {
      const { data: cloudResins } = await supabase.from('resin_items').select('*');
      if (cloudResins && cloudResins.length > 0) {
        await db.transaction('rw', db.resin_items, async () => {
          for (const cr of cloudResins) {
            const existing = await db.resin_items.filter(r => (r.resin || '').toUpperCase() === (cr.resin || '').toUpperCase()).first();
            const rec = {
              resin: cr.resin,
              kode: cr.kode,
              nomorItem: cr.nomor_item,
              active: cr.active,
              createdAt: cr.created_at,
              updatedAt: cr.updated_at
            };
            if (existing) {
              await db.resin_items.update(existing.id, rec);
            } else {
              await db.resin_items.add(rec);
            }
          }
        });
      }
    }

    // Pull BOM Formulas
    if (db.bom_formulas) {
      const { data: cloudBoms } = await supabase.from('bom_formulas').select('*');
      if (cloudBoms && cloudBoms.length > 0) {
        await db.transaction('rw', db.bom_formulas, async () => {
          for (const cb of cloudBoms) {
            const existing = await db.bom_formulas.filter(b => b.formula === cb.formula && b.rm === cb.rm).first();
            const rec = {
              formula: cb.formula,
              rm: cb.rm,
              persen: cb.persen,
              active: cb.active,
              createdAt: cb.created_at,
              updatedAt: cb.updated_at
            };
            if (existing) {
              await db.bom_formulas.update(existing.id, rec);
            } else {
              await db.bom_formulas.add(rec);
            }
          }
        });
      }
    }

    // Pull Location List
    if (db.location_list) {
      const { data: cloudLocs } = await supabase.from('location_list').select('*');
      if (cloudLocs && cloudLocs.length > 0) {
        await db.transaction('rw', db.location_list, async () => {
          for (const cl of cloudLocs) {
            const existing = await db.location_list.where('nama').equals(cl.nama).first();
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
            if (existing) {
              await db.location_list.update(existing.id, rec);
            } else {
              await db.location_list.add(rec);
            }
          }
        });
      }
    }

    // Pull Standard Lengths
    if (db.standard_lengths) {
      const { data: cloudLens } = await supabase.from('standard_lengths').select('*');
      if (cloudLens && cloudLens.length > 0) {
        await db.transaction('rw', db.standard_lengths, async () => {
          for (const cl of cloudLens) {
            const existing = await db.standard_lengths.filter(s => parseFloat(s.thickness) === parseFloat(cl.thickness)).first();
            const rec = {
              thickness: cl.thickness,
              maxPanjangFg: cl.max_panjang_fg,
              maxPanjangJumbo: cl.max_panjang_jumbo,
              active: cl.active,
              createdAt: cl.created_at,
              updatedAt: cl.updated_at
            };
            if (existing) {
              await db.standard_lengths.update(existing.id, rec);
            } else {
              await db.standard_lengths.add(rec);
            }
          }
        });
      }
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
  await pushLocalToSupabase();
  await pullFromSupabase();
  await countUnsynced();
}

// 5. REALTIME LISTENER: Menerima perubahan langsung dari Supabase saat user lain menginput
let realtimeChannel = null;

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
        const existing = await db.labels.where('uniqId').equals(payload.old.uniq_id).first();
        if (existing) await db.labels.delete(existing.id);
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
      }
      if (onDataChangeCallback) onDataChangeCallback('spk_plans');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'film_configs' }, async () => {
      await pullFromSupabase();
      if (onDataChangeCallback) onDataChangeCallback('film_configs');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'resin_items' }, async () => {
      await pullFromSupabase();
      if (onDataChangeCallback) onDataChangeCallback('resin_items');
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'bom_formulas' }, async () => {
      await pullFromSupabase();
      if (onDataChangeCallback) onDataChangeCallback('bom_formulas');
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
