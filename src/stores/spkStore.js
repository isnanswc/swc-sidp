export function getBatchDateMatchingWindow(batch) {
  if (!batch || !batch.tanggal) return null;

  const raw = String(batch.tanggal).trim();
  const isoDates = raw.match(/\d{4}-\d{2}-\d{2}/g);
  let startDate = null;
  let endDate = null;

  if (isoDates && isoDates.length >= 2) {
    startDate = new Date(isoDates[0]);
    endDate = new Date(isoDates[isoDates.length - 1]);
  } else if (isoDates && isoDates.length === 1) {
    startDate = new Date(isoDates[0]);
    endDate = new Date(isoDates[0]);
  } else {
    const rangeMatch = raw.match(/(\d{1,2})\s*-\s*(\d{1,2})\s*([A-Za-z]+)\s*(\d{4})/);
    if (rangeMatch) {
      const dStart = parseInt(rangeMatch[1], 10);
      const dEnd = parseInt(rangeMatch[2], 10);
      const mStr = rangeMatch[3].toLowerCase();
      const yr = parseInt(rangeMatch[4], 10);
      const monthMap = { jan: 0, feb: 1, mar: 2, apr: 3, mei: 4, may: 4, jun: 5, jul: 6, agu: 7, aug: 7, sep: 8, okt: 9, oct: 9, nov: 10, des: 11, dec: 11 };
      const mIdx = monthMap[mStr.slice(0, 3)] ?? 8;
      startDate = new Date(yr, mIdx, dStart);
      endDate = new Date(yr, mIdx, dEnd);
    } else {
      startDate = new Date(batch.createdAt || Date.now());
      endDate = new Date(startDate);
    }
  }

  startDate.setHours(0, 0, 0, 0);
  const limitDate = new Date(endDate);
  limitDate.setDate(limitDate.getDate() + 1); // H+1 aturan user
  limitDate.setHours(23, 59, 59, 999);

  return {
    startDate,
    endDate,
    limitDate,
    startDateMs: startDate.getTime(),
    limitDateMs: limitDate.getTime(),
    label: `${startDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })} s/d ${limitDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} (H+1)`
  };
}

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/db';
import { useConfigStore } from '@/stores/configStore';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { pushLocalToSupabase, deleteFromSupabase, deleteMultipleFromSupabase } from '@/services/syncService';
import { extractCleanParentLot } from '@/services/dataRollParserService';
export function getFilmDensity(jenis, kodeFormula, spkNo = '', filmConfigs = []) {
  const cleanJenis = String(jenis || '').toUpperCase().trim();
  const cleanKode = String(kodeFormula || '').toUpperCase().trim();
  const cleanSpk = String(spkNo || '').toUpperCase().trim();

  // 1. ConfigStore / DB lookup
  if (Array.isArray(filmConfigs) && filmConfigs.length > 0) {
    // Exact match jenis & kodeFormula
    if (cleanJenis && cleanKode) {
      const matched = filmConfigs.find(r => 
        String(r.jenis || '').toUpperCase().trim() === cleanJenis && 
        String(r.kodeFormula || '').toUpperCase().trim() === cleanKode
      );
      if (matched && matched.density && parseFloat(matched.density) > 0) {
        return parseFloat(matched.density);
      }
    }

    // Match by kodeFormula (e.g. M01 - M39, L01 - L05)
    if (cleanKode) {
      const byFormula = filmConfigs.find(r => 
        String(r.kodeFormula || '').toUpperCase().trim() === cleanKode
      );
      if (byFormula && byFormula.density && parseFloat(byFormula.density) > 0) {
        return parseFloat(byFormula.density);
      }
    }

    // Match by jenis
    if (cleanJenis) {
      const byJenis = filmConfigs.find(r => 
        String(r.jenis || '').toUpperCase().trim() === cleanJenis
      );
      if (byJenis && byJenis.density && parseFloat(byJenis.density) > 0) {
        return parseFloat(byJenis.density);
      }
    }
  }

  // 2. Direct Polymer Density Heuristics based on jenis, formula, or spkNo
  const combined = `${cleanJenis} ${cleanKode} ${cleanSpk}`;
  if (combined.includes('PET') || combined.includes('VMPET') || combined.includes('POLYESTER')) return 1.40;
  if (combined.includes('ALU') || combined.includes('FOIL')) return 2.70;
  if (combined.includes('NYLON') || combined.includes('BOPA') || combined.includes('OPA')) return 1.15;
  if (combined.includes('LLDPE') || combined.includes('LDPE') || combined.includes('HDPE') || combined.includes('PE')) return 0.92;
  if (combined.includes('CPP') || combined.includes('VMCPP') || combined.includes('BOPP') || combined.includes('PP')) return 0.91;

  // Default standard factory rotogravure film density
  return 0.91;
}

export function calculateBeratTeori(thickness, width, length, density = 0.91) {
  const t = parseFloat(thickness) || 0;
  const w = parseFloat(width) || 0;
  const m = parseFloat(length) || 0;
  const d = parseFloat(density) || 0.91;

  if (t <= 0 || w <= 0 || m <= 0 || d <= 0) return 0;
  // Rumus: (Tebal * Lebar * Panjang * Density) / 1,000,000
  return parseFloat(((t * w * m * d) / 1000000).toFixed(2));
}

export const evaluateTargetStatus = (actualRoll, planRoll, isSkipped = false) => {
  if (isSkipped) {
    return {
      key: 'SKIPPED',
      label: 'Dilewati',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      borderClass: 'border-purple-300',
      color: '#9333ea',
      icon: '⏭️'
    };
  }
  const act = parseFloat(actualRoll) || 0;
  const pln = parseFloat(planRoll) || 0;

  if (act === 0) {
    return {
      key: 'NOT_STARTED',
      label: 'Belum Dikerjakan',
      badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-300',
      borderClass: 'border-zinc-200',
      color: '#71717a',
      icon: '⏱️'
    };
  }
  if (pln > 0 && act < pln) {
    return {
      key: 'UNDER_TARGET',
      label: 'Kurang Target',
      badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
      borderClass: 'border-amber-300',
      color: '#f59e0b',
      icon: '⚠️'
    };
  }
  if (pln > 0 && act === pln) {
    return {
      key: 'ON_TARGET',
      label: 'Pas Target',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      borderClass: 'border-emerald-300',
      color: '#10b981',
      icon: '✓'
    };
  }
  return {
    key: 'OVER_TARGET',
    label: 'Lebih Target',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    borderClass: 'border-cyan-300',
    color: '#06b6d4',
    icon: '🚀'
  };
};

export const useSpkStore = defineStore('spk', () => {
  const plans = ref([]);
  const batches = ref([]);
  const revisions = ref([]);
  const isLoading = ref(false);
  const activePlanId = ref(null);
  const selectedBatchId = ref(null);
  const activeTimelineBatchUuid = ref(localStorage.getItem('spk_active_reference_batch_uuid') || null);

  const setActiveReferenceBatch = (batchUuid) => {
    activeTimelineBatchUuid.value = batchUuid || null;
    if (batchUuid) {
      localStorage.setItem('spk_active_reference_batch_uuid', batchUuid);
    } else {
      localStorage.removeItem('spk_active_reference_batch_uuid');
    }
  };

  const activeBatch = computed(() => {
    if (activeTimelineBatchUuid.value) {
      const found = (batches.value || []).find(b => b.uuid === activeTimelineBatchUuid.value);
      if (found) return found;
    }
    return (batches.value || [])[0] || null;
  });

  const activeDateWindow = computed(() => {
    return getBatchDateMatchingWindow(activeBatch.value);
  });

  const configStore = useConfigStore();
  const labelStore = useLabelStore();
  const dataRollStore = useDataRollStore();

  // Helper Speed & Time
  const getSlittingSpeed = (formulaCode, jenisFilm = 'CPP') => {
    const fCode = String(formulaCode || '').toUpperCase().trim();
    const jFilm = String(jenisFilm || '').toUpperCase().trim();

    // Check configStore.filmConfigs if available
    const found = (configStore.filmConfigs || []).find(
      f => (f.kodeFormula || '').toUpperCase() === fCode && (!jenisFilm || (f.jenis || '').toUpperCase() === jFilm)
    );
    if (found && found.speed) return found.speed;

    // Standard rules: Metalized 400 m/min, Polos 600 m/min
    if (fCode.startsWith('M') && (jFilm.includes('METAL') || jFilm === 'VMCPP' || found?.kategoriFilm === 'METAL')) {
      return 400;
    }
    return 600; // Default Polos
  };

  const calculateEstimateMinutes = (totalMeter, jumlahJumbo, speed) => {
    const meter = parseFloat(totalMeter) || 0;
    const jumbo = parseInt(jumlahJumbo, 10) || 1;
    const spd = parseFloat(speed) || 600;

    const cuttingMinutes = spd > 0 ? (meter / spd) : 0;
    const changeOverMinutes = jumbo * 18; // Standard 18 menit per Jumbo Roll
    const totalMinutes = Math.round(cuttingMinutes + changeOverMinutes);

    return {
      cuttingMinutes: Math.round(cuttingMinutes),
      changeOverMinutes,
      totalMinutes
    };
  };

  const calculateTrim = (lebarParent, upList) => {
    const parent = parseFloat(lebarParent) || 0;
    const sumUp = (upList || []).reduce((sum, up) => sum + (parseFloat(up.lebar) || 0), 0);
    return Math.max(0, parent - sumUp);
  };

  // Load All SPK Data from Dexie
  const loadAll = async (force = false) => {
    if (!force && plans.value.length > 0 && batches.value.length > 0 && !isLoading.value) {
      return;
    }
    isLoading.value = true;
    try {
      if (db.spk_batches) {
        batches.value = (await db.spk_batches.toArray()).reverse();
      }
      if (db.spk_plans) {
        // ZERO-SEEDING POLICY: Bersihkan segala data sample / dummy SPK
        const dummyItems = await db.spk_plans.filter(p => String(p.uuid || '').startsWith('spk-sample-')).toArray();
        if (dummyItems.length > 0) {
          await db.spk_plans.bulkDelete(dummyItems.map(d => d.id));
        }
        const rawPlans = await db.spk_plans.toArray();
        plans.value = rawPlans.sort((a, b) => {
          if (a.batchId && b.batchId && a.batchId !== b.batchId) {
            return String(a.batchId).localeCompare(String(b.batchId));
          }
          const seqA = a.seq !== undefined && a.seq !== null ? a.seq : (a.no || a.id || 0);
          const seqB = b.seq !== undefined && b.seq !== null ? b.seq : (b.no || b.id || 0);
          return seqA - seqB;
        });
      }
      if (db.spk_revisions) {
        revisions.value = (await db.spk_revisions.toArray()).reverse();
      }
    } catch (err) {
      console.error('Failed to load SPK plans:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Create New Batch with multiple SPK Plans (1 Scan = 1 Batch Harian)
  const addBatchWithPlans = async (batchMeta, planItems) => {
    const now = new Date().toISOString();
    const batchUuid = `spk_batch_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const items = planItems || [];

    const totalItems = items.length;
    const totalJumbo = items.reduce((sum, it) => sum + (parseInt(it.jumlahJumbo, 10) || 1), 0);
    const totalMeter = items.reduce((sum, it) => sum + (parseFloat(it.totalPlannedMeter) || 0), 0);

    const batchRecord = {
      uuid: batchUuid,
      batchName: batchMeta.batchName || `Jadwal Slitting ${batchMeta.tanggal || now.slice(0, 10)}`,
      docNo: batchMeta.docNo || '3B-PROD',
      tanggal: batchMeta.tanggal || now.slice(0, 10),
      totalItems,
      totalJumbo,
      totalMeter,
      source: batchMeta.source || 'AI_SCAN',
      createdAt: now,
      updatedAt: now
    };

    if (db.spk_batches) {
      const bId = await db.spk_batches.add(batchRecord);
      batchRecord.id = bId;
      batches.value.unshift(batchRecord);
    }

    const createdPlans = [];
    for (const planData of items) {
      const upList = planData.upList || [];
      const trim = calculateTrim(planData.lebarParent, upList);
      const planRecord = {
        uuid: `spk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        batchId: batchUuid,
        spkNo: String(planData.spkNo || '').trim(),
        docNo: String(batchRecord.docNo || '3B-PROD').trim(),
        formula: String(planData.formula || 'M01').toUpperCase().trim(),
        jenis: String(planData.jenis || 'CPP').toUpperCase().trim(),
        thickness: parseFloat(planData.thickness) || 20,
        lebarParent: parseFloat(planData.lebarParent) || 0,
        panjangParent: parseFloat(planData.panjangParent) || 0,
        jumlahJumbo: parseInt(planData.jumlahJumbo, 10) || 1,
        totalPlannedMeter: parseFloat(planData.totalPlannedMeter) || 0,
        totalPlannedRolls: parseInt(planData.totalPlannedRolls, 10) || (upList.length * (parseInt(planData.jumlahJumbo, 10) || 1)),
        chartingJson: JSON.stringify(upList),
        trimAuto: trim,
        keterangan: planData.keterangan || '',
        status: planData.status || 'PLANNED',
        source: batchRecord.source,
        revisionsCount: 0,
        tanggal: batchRecord.tanggal,
        createdAt: now,
        updatedAt: now
      };

      if (db.spk_plans) {
        planRecord.seq = createdPlans.length + 1;
        const pId = await db.spk_plans.add(planRecord);
        planRecord.id = pId;
        plans.value.push(planRecord);
        createdPlans.push(planRecord);
      }
    }

    // Acuan monitoring otomatis mengikuti batch SPK yang baru dibuat/discan
    setActiveReferenceBatch(batchUuid);
    pushLocalToSupabase().catch(() => {});

    return { batch: batchRecord, plans: createdPlans };
  };

  // Delete Batch and all its child plans
  const deleteBatch = async (batchUuid) => {
    if (db.spk_batches) {
      const b = await db.spk_batches.where('uuid').equals(batchUuid).first();
      if (b) await db.spk_batches.delete(b.id);
      batches.value = batches.value.filter(b => b.uuid !== batchUuid);
      deleteFromSupabase('spk_batches', 'uuid', batchUuid).catch(() => {});
    }
    if (db.spk_plans) {
      const childPlans = await db.spk_plans.where('batchId').equals(batchUuid).toArray();
      if (childPlans.length > 0) {
        await db.spk_plans.bulkDelete(childPlans.map(c => c.id));
        plans.value = plans.value.filter(p => p.batchId !== batchUuid);
      }
      deleteFromSupabase('spk_plans', 'batch_id', batchUuid).catch(() => {});
    }
    if (selectedBatchId.value === batchUuid) {
      selectedBatchId.value = null;
    }
  };

  // Add New Plan
  const addPlan = async (planData) => {
    const now = new Date().toISOString();
    const upList = planData.upList || [];
    const trim = calculateTrim(planData.lebarParent, upList);

    const bId = planData.batchId || null;
    const existingInBatch = bId ? plans.value.filter(p => p.batchId === bId) : [];
    const newSeq = planData.seq || (existingInBatch.length + 1);

    const record = {
      uuid: `spk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      batchId: bId,
      seq: newSeq,
      spkNo: String(planData.spkNo || '').trim(),
      docNo: String(planData.docNo || '3B-PROD').trim(),
      formula: String(planData.formula || 'M01').toUpperCase().trim(),
      jenis: String(planData.jenis || 'CPP').toUpperCase().trim(),
      thickness: parseFloat(planData.thickness) || 20,
      lebarParent: parseFloat(planData.lebarParent) || 0,
      panjangParent: parseFloat(planData.panjangParent) || 0,
      jumlahJumbo: parseInt(planData.jumlahJumbo, 10) || 1,
      totalPlannedMeter: parseFloat(planData.totalPlannedMeter) || 0,
      totalPlannedRolls: parseInt(planData.totalPlannedRolls, 10) || (upList.length * (parseInt(planData.jumlahJumbo, 10) || 1)),
      chartingJson: JSON.stringify(upList),
      trimAuto: trim,
      keterangan: planData.keterangan || '',
      status: planData.status || 'PLANNED',
      source: planData.source || 'MANUAL',
      revisionsCount: 0,
      tanggal: planData.tanggal || now.slice(0, 10),
      createdAt: now,
      updatedAt: now
    };

    if (db.spk_plans) {
      const id = await db.spk_plans.add(record);
      record.id = id;
      plans.value.push(record);
      pushLocalToSupabase().catch(() => {});
      return record;
    }
  };

  // Update Plan with Revision Tracking
  const updatePlan = async (id, updatedFields, reason = 'Pembaruan Dokumen SPK', user = 'Admin') => {
    const existingIndex = plans.value.findIndex(p => p.id === id);
    if (existingIndex === -1) return;

    const oldData = { ...plans.value[existingIndex] };
    const now = new Date().toISOString();
    const newRevCount = (oldData.revisionsCount || 0) + 1;

    let trim = oldData.trimAuto;
    if (updatedFields.lebarParent !== undefined || updatedFields.upList !== undefined) {
      const parent = updatedFields.lebarParent !== undefined ? updatedFields.lebarParent : oldData.lebarParent;
      const ups = updatedFields.upList || (oldData.chartingJson ? JSON.parse(oldData.chartingJson) : []);
      trim = calculateTrim(parent, ups);
    }

    const payload = {
      ...updatedFields,
      trimAuto: trim,
      revisionsCount: newRevCount,
      updatedAt: now
    };
    if (updatedFields.upList) {
      payload.chartingJson = JSON.stringify(updatedFields.upList);
      delete payload.upList;
    }

    // Save revision history
    if (db.spk_revisions) {
      const revRecord = {
        planId: id,
        spkNo: oldData.spkNo,
        revNumber: newRevCount,
        previousDataJson: JSON.stringify(oldData),
        newDataJson: JSON.stringify({ ...oldData, ...payload }),
        changesDiffJson: JSON.stringify(updatedFields),
        reason,
        revisedBy: user,
        createdAt: now
      };
      await db.spk_revisions.add(revRecord);
      revisions.value.unshift(revRecord);
    }

    if (db.spk_plans) {
      await db.spk_plans.update(id, payload);
      plans.value[existingIndex] = { ...oldData, ...payload };
      pushLocalToSupabase().catch(() => {});
    }
  };

  // Delete Plan
  const deletePlan = async (id) => {
    if (db.spk_plans) {
      const plan = await db.spk_plans.get(id);
      const uuid = plan?.uuid;
      await db.spk_plans.delete(id);
      plans.value = plans.value.filter(p => p.id !== id);
      if (uuid) {
        deleteFromSupabase('spk_plans', 'uuid', uuid).catch(() => {});
      }
    }
  };

  // Reorder Plans in a Batch (Drag-and-Drop Cut Order)
  const reorderBatchPlans = async (batchUuid, reorderedList) => {
    if (!reorderedList || !reorderedList.length) return;
    
    // Assign sequential seq order
    const updates = [];
    reorderedList.forEach((plan, index) => {
      const newSeq = index + 1;
      plan.seq = newSeq;
      updates.push({ id: plan.id, uuid: plan.uuid, seq: newSeq });

      // Update in reactive plans array
      const pIdx = plans.value.findIndex(p => (plan.id && p.id === plan.id) || (plan.uuid && p.uuid === plan.uuid));
      if (pIdx !== -1) {
        plans.value[pIdx].seq = newSeq;
      }
    });

    // Force complete reactivity trigger across all computed properties
    plans.value = [...plans.value];

    // Persist to Dexie DB
    if (db.spk_plans) {
      try {
        await db.transaction('rw', db.spk_plans, async () => {
          for (const up of updates) {
            if (up.id) {
              await db.spk_plans.update(up.id, { seq: up.seq });
            } else if (up.uuid) {
              const p = await db.spk_plans.where('uuid').equals(up.uuid).first();
              if (p && p.id) {
                await db.spk_plans.update(p.id, { seq: up.seq });
              }
            }
          }
        });
      } catch (dbErr) {
        console.warn('Failed persisting reordered spk_plans to Dexie:', dbErr);
      }
    }
  };

  // REALTIME AGGREGATION & ANALYTICS HELPER (HIGH-PERFORMANCE O(1) MAP INDEXING)
  // Pre-index seluruh labels & rolls sekali jalan secara reaktif
  const spkRealtimeDataMap = computed(() => {
    const labels = labelStore.labels || [];
    const rolls = dataRollStore.rolls || [];
    const spkMap = new Map();

    const wnd = activeDateWindow.value;
    const minTime = wnd ? wnd.startDateMs : 0;
    const maxTime = wnd ? wnd.limitDateMs : Infinity;

    const getOrInitSpk = (spkKey) => {
      if (!spkMap.has(spkKey)) {
        spkMap.set(spkKey, {
          spkNo: spkKey,
          lots: new Map(),
          totalRealRolls: 0,
          totalRealMeter: 0,
          totalRealKg: 0,
          passCount: 0,
          holdCount: 0,
          rejectCount: 0,
          widthMap: new Map()
        });
      }
      return spkMap.get(spkKey);
    };

    // Tracking sets to prevent double counting between labelStore and dataRollStore
    const processedRollUuids = new Set();
    const processedRollIds = new Set();
    const processedSignatures = new Set();

    // Index labels in single O(N) pass
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      if (!l || !l.spk) continue;

      // Filter tanggal aktual: data masa lampau diabaikan, hanya berlaku [startDate ... H+1]
      const rawDateStr = l.tanggal || l.createdAt;
      if (wnd && rawDateStr) {
        const itemTime = new Date(rawDateStr).getTime();
        if (!isNaN(itemTime)) {
          if (itemTime < minTime || itemTime > maxTime) continue;
        }
      }
      const s = String(l.spk).trim().toUpperCase();
      const rawLot = String(l.lot || '').trim();
      const turunan = String(l.turunan || '').trim();
      const cleanParentLot = extractCleanParentLot(rawLot, turunan) || rawLot.split('/')[0] || rawLot;

      // Unique identifier for this child roll
      const rollKey = (l.uniqId || l.uuid)
        ? `L_UID_${l.uniqId || l.uuid}`
        : (l.id ? `L_ID_${l.id}` : (l.barcode ? `L_BC_${l.barcode}` : `L_${cleanParentLot}_${turunan}_${i}`));

      const spkObj = getOrInitSpk(s);

      // Track to avoid duplicate indexing from data rolls
      if (l.uniqId) processedRollUuids.add(String(l.uniqId));
      if (l.uuid) processedRollUuids.add(String(l.uuid));
      if (l.originalRollId) processedRollIds.add(String(l.originalRollId));
      if (typeof l.id === 'number') processedRollIds.add(String(l.id));
      if (turunan) {
        processedSignatures.add(`${s}::${cleanParentLot.toUpperCase()}::${turunan.toUpperCase()}`);
      }

      if (!spkObj.lots.has(rollKey)) {
        let displayLot = rawLot;
        if (turunan && !rawLot.toUpperCase().includes(turunan.toUpperCase())) {
          displayLot = rawLot ? `${rawLot} / ${turunan}` : turunan;
        }
        if (!displayLot) {
          displayLot = l.barcode || l.uniqId || `ROLL_${l.id || i + 1}`;
        }

        const w = parseFloat(l.width || l.lebar) || 0;
        const m = parseFloat(l.length || l.meter || l.panjang) || 0;
        let kg = parseFloat(l.netto || l.beratNetto || l.beratTeori) || 0;
        const st = String(l.status || 'PASS').toUpperCase();
        let thk = parseFloat(l.thickness || l.ketebalan) || (spkObj.plan ? parseFloat(spkObj.plan.thickness) : 0) || 0;
        const formula = l.kodeFormula || l.formula || l.type || l.jenis || (spkObj.plan?.formula || '');
        const density = getFilmDensity(l.jenis || spkObj.plan?.jenis, formula, s, configStore?.filmConfigs);
        if (kg <= 0 && w > 0 && m > 0) {
          if (thk <= 0) thk = 25;
          kg = calculateBeratTeori(thk, w, m, density);
        }

        spkObj.lots.set(rollKey, {
          id: l.id || rollKey,
          lot: displayLot,
          parentLot: cleanParentLot,
          turunan: turunan,
          width: w,
          length: m,
          weight: kg,
          status: st,
          source: l.isDataRoll ? 'DATA_ROLL' : 'LABEL',
          date: l.tanggal || l.createdAt,
          formula: formula,
          thickness: thk,
          operator: l.operator || l.kodeOperator || '-',
          supplier: l.supplier || 'INHOUSE'
        });

        spkObj.totalRealRolls++;
        spkObj.totalRealMeter += m;
        spkObj.totalRealKg += kg;

        if (st === 'PASS' || st === 'OK') spkObj.passCount++;
        else if (st === 'HOLD') spkObj.holdCount++;
        else if (st === 'REJECT' || st === 'NG') spkObj.rejectCount++;
        else spkObj.passCount++;

        const roundedW = Math.round(w);
        if (roundedW > 0) {
          if (!spkObj.widthMap.has(roundedW)) {
            spkObj.widthMap.set(roundedW, { width: roundedW, totalRoll: 0, totalMeter: 0, totalKg: 0 });
          }
          const wEntry = spkObj.widthMap.get(roundedW);
          wEntry.totalRoll++;
          wEntry.totalMeter += m;
          wEntry.totalKg += kg;
        }
      }
    }

    // Index data rolls in single O(M) pass
    for (let i = 0; i < rolls.length; i++) {
      const r = rolls[i];
      if (!r || !r.spk) continue;

      if (r.uuid && processedRollUuids.has(String(r.uuid))) continue;
      if (r.id && processedRollIds.has(String(r.id))) continue;

      const s = String(r.spk).trim().toUpperCase();
      const rawLot = String(r.lot || '').trim();
      const turunan = String(r.turunan || '').trim();
      const cleanParentLot = extractCleanParentLot(rawLot, turunan) || rawLot.split('/')[0] || rawLot;

      if (turunan && processedSignatures.has(`${s}::${cleanParentLot.toUpperCase()}::${turunan.toUpperCase()}`)) {
        continue;
      }

      // Filter tanggal aktual: data masa lampau diabaikan, hanya berlaku [startDate ... H+1]
      const rawDateStr = r.tanggal || r.tanggalFormatted || r.createdAt;
      if (wnd && rawDateStr) {
        const itemTime = new Date(rawDateStr).getTime();
        if (!isNaN(itemTime)) {
          if (itemTime < minTime || itemTime > maxTime) continue;
        }
      }

      const spkObj = getOrInitSpk(s);
      const rollKey = (r.uuid)
        ? `R_UID_${r.uuid}`
        : (r.id ? `R_ID_${r.id}` : `R_${cleanParentLot}_${turunan}_${i}`);

      if (!spkObj.lots.has(rollKey)) {
        let displayLot = rawLot;
        if (turunan && !rawLot.toUpperCase().includes(turunan.toUpperCase())) {
          displayLot = rawLot ? `${rawLot} / ${turunan}` : turunan;
        }
        if (!displayLot) {
          displayLot = r.kodeFg || `ROLL_${r.id || i + 1}`;
        }

        const w = parseFloat(r.width) || 0;
        const m = parseFloat(r.length) || 0;
        let kg = parseFloat(r.netto || r.berat || r.beratTeori) || 0;
        const st = String(r.qualityStatus || 'PASS').toUpperCase();
        let thk = parseFloat(r.thickness) || (spkObj.plan ? parseFloat(spkObj.plan.thickness) : 0) || 0;
        if (thk <= 0 && r.kodeFg) {
          const mThk = String(r.kodeFg).match(/(\d+(?:\.\d+)?)\s*(?:MC|MIC|MICRON)/i);
          if (mThk) thk = parseFloat(mThk[1]);
        }
        if (thk <= 0) thk = 25;

        const formula = r.kodeFormula || r.jenis || (spkObj.plan?.formula || '');
        const density = getFilmDensity(r.jenis || spkObj.plan?.jenis, formula, s, configStore?.filmConfigs);
        if (kg <= 0 && w > 0 && m > 0 && thk > 0) {
          kg = calculateBeratTeori(thk, w, m, density);
        }

        spkObj.lots.set(rollKey, {
          id: r.id || rollKey,
          lot: displayLot,
          parentLot: cleanParentLot,
          turunan: turunan,
          width: w,
          length: m,
          weight: kg,
          status: st,
          source: 'DATA_ROLL',
          date: r.tanggal || r.tanggalFormatted || r.createdAt,
          formula: r.kodeFormula || r.jenis || '',
          thickness: thk,
          operator: r.machineName || '-',
          supplier: 'INHOUSE'
        });

        spkObj.totalRealRolls++;
        spkObj.totalRealMeter += m;
        spkObj.totalRealKg += kg;

        if (st === 'PASS' || st === 'OK') spkObj.passCount++;
        else if (st === 'HOLD') spkObj.holdCount++;
        else if (st === 'REJECT' || st === 'NG') spkObj.rejectCount++;
        else spkObj.passCount++;

        const roundedW = Math.round(w);
        if (roundedW > 0) {
          if (!spkObj.widthMap.has(roundedW)) {
            spkObj.widthMap.set(roundedW, { width: roundedW, totalRoll: 0, totalMeter: 0, totalKg: 0 });
          }
          const wEntry = spkObj.widthMap.get(roundedW);
          wEntry.totalRoll++;
          wEntry.totalMeter += m;
          wEntry.totalKg += kg;
        }
      }
    }

    return spkMap;
  });

  const getSpkRealtimeAnalytics = (spkNo, plan = null) => {
    const cleanSpk = String(spkNo || '').trim().toUpperCase();
    if (!cleanSpk) return null;

    const dataMap = spkRealtimeDataMap.value || new Map();
    const subSpkTokens = cleanSpk.split('&').map(s => s.trim()).filter(Boolean);

    let totalRealRolls = 0;
    let totalRealMeter = 0;
    let totalRealKg = 0;
    let passCount = 0;
    let holdCount = 0;
    let rejectCount = 0;
    const allLots = [];
    const aggregatedWidthMap = new Map();

    const normalizeKey = (str) => String(str || '').toUpperCase().replace(/[\s\-_/]/g, '');
    const targetNorm = normalizeKey(cleanSpk);
    const subNorms = subSpkTokens.map(normalizeKey).filter(Boolean);

    const matchedSpkDataList = [];
    const matchedKeys = new Set();

    // 1. Direct key match (exact SPK or token)
    for (const key of [cleanSpk, ...subSpkTokens]) {
      if (dataMap.has(key) && !matchedKeys.has(key)) {
        matchedSpkDataList.push(dataMap.get(key));
        matchedKeys.add(key);
      }
    }

    // 2. Normalized fallback if exact match wasn't found
    if (matchedSpkDataList.length === 0) {
      for (const [mapKey, spkData] of dataMap.entries()) {
        if (matchedKeys.has(mapKey)) continue;
        const normKey = normalizeKey(mapKey);
        if (normKey === targetNorm || subNorms.some(sn => normKey === sn || (normKey.length >= 4 && sn.includes(normKey)))) {
          matchedSpkDataList.push(spkData);
          matchedKeys.add(mapKey);
        }
      }
    }

    for (const spkData of matchedSpkDataList) {
      totalRealRolls += spkData.totalRealRolls;
      totalRealMeter += spkData.totalRealMeter;
      totalRealKg += spkData.totalRealKg;
      passCount += spkData.passCount;
      holdCount += spkData.holdCount;
      rejectCount += spkData.rejectCount;
      spkData.lots.forEach(lotObj => allLots.push(lotObj));
      spkData.widthMap.forEach((wObj, w) => {
        if (!aggregatedWidthMap.has(w)) {
          aggregatedWidthMap.set(w, { width: w, totalRoll: 0, totalMeter: 0, totalKg: 0 });
        }
        const tgt = aggregatedWidthMap.get(w);
        tgt.totalRoll += wObj.totalRoll;
        tgt.totalMeter += wObj.totalMeter;
        tgt.totalKg += wObj.totalKg;
      });
    }

    const widthSummaries = Array.from(aggregatedWidthMap.values()).sort((a, b) => b.width - a.width);

    // Cross Order detection
    const isCrossOrderWarning = subSpkTokens.length > 1;
    const warningMessage = isCrossOrderWarning ? `SPK multi-item (${subSpkTokens.join(' & ')}) dalam 1 lembar pengerjaan.` : '';

    // Extract dynamic dates, year, month, formula, thickness, supplier
    let latestTimestamp = 0;
    let detectedFormula = '';
    let detectedThickness = 0;
    let detectedSupplier = 'INHOUSE (PT. SWC)';

    for (const lt of allLots) {
      if (lt.date) {
        const t = new Date(lt.date).getTime();
        if (t > latestTimestamp) latestTimestamp = t;
      }
      if (!detectedFormula && lt.formula) detectedFormula = lt.formula;
      if (!detectedThickness && lt.thickness) detectedThickness = lt.thickness;
      if (lt.supplier && lt.supplier !== 'INHOUSE') detectedSupplier = lt.supplier;
    }

    if (plan && plan.tanggal) {
      const pt = new Date(plan.tanggal).getTime();
      if (pt > latestTimestamp) latestTimestamp = pt;
    }

    const d = latestTimestamp > 0 ? new Date(latestTimestamp) : new Date();
    const year = d.getFullYear() || 2026;
    const month = d.getMonth() + 1; // 1 - 12
    const monthNamesId = [
      '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const monthName = monthNamesId[month] || 'September';

    const formula = plan?.formula || detectedFormula || 'M01';
    const thickness = plan?.thickness || detectedThickness || 25;
    const supplier = (cleanSpk.includes('PANVERTA') ? 'PANVERTA' : detectedSupplier) || 'INHOUSE (PT. SWC)';
    const totalJumbo = plan?.jumlahJumbo || Math.max(1, Math.ceil(totalRealRolls / 2));

    // Speed & time calculation in O(1)
    const speed = plan ? getSlittingSpeed(formula, plan.jenis) : 600;
    const plannedMeter = plan ? (plan.totalPlannedMeter || (plan.panjangParent * totalJumbo)) : (totalRealMeter || 24000);
    const timeEst = calculateEstimateMinutes(plannedMeter, totalJumbo, speed);

    // Parent, Child & Variance Precision Analytics
    let upList = [];
    try {
      if (plan?.upList && Array.isArray(plan.upList)) upList = plan.upList;
      else if (plan?.chartingJson) upList = JSON.parse(plan.chartingJson);
    } catch (_) {}
    const validUps = upList.filter(u => u && parseFloat(u.lebar) > 0);
    const totalUp = Math.max(1, validUps.length || 2);

    const plannedParentRolls = parseInt(plan?.jumlahJumbo, 10) || totalJumbo || 1;
    const plannedChildRolls = plannedParentRolls * totalUp;
    const actualChildRolls = totalRealRolls;

    // Hitung Parent Jumbo yang telah dipotong dari unique parent lots
    const uniqueParents = new Set(
      allLots
        .map(lt => lt.parentLot || (lt.lot ? String(lt.lot).split(/[-_/]/)[0] : ''))
        .filter(Boolean)
    );
    const actualParentCut = uniqueParents.size > 0 
      ? uniqueParents.size 
      : (actualChildRolls > 0 ? Math.ceil(actualChildRolls / totalUp) : 0);

    const diffParent = actualParentCut - plannedParentRolls;
    const diffChild = actualChildRolls - plannedChildRolls;
    const diffMeter = Math.round(totalRealMeter - plannedMeter);
    const achievementPercent = plannedChildRolls > 0 
      ? Math.min(100, Math.round((actualChildRolls / plannedChildRolls) * 100)) 
      : 0;

    // Durasi pengerjaan aktual dari selisih waktu label
    let firstLabelTime = Infinity;
    let lastLabelTime = 0;
    for (const lt of allLots) {
      if (lt.date) {
        const t = new Date(lt.date).getTime();
        if (t > 0 && t < firstLabelTime) firstLabelTime = t;
        if (t > lastLabelTime) lastLabelTime = t;
      }
    }
    const actualDurationMinutes = (lastLabelTime > 0 && firstLabelTime < Infinity && lastLabelTime > firstLabelTime)
      ? Math.round((lastLabelTime - firstLabelTime) / 60000)
      : (actualChildRolls > 0 ? Math.max(5, Math.round(timeEst.totalMinutes * Math.min(1, actualChildRolls / plannedChildRolls))) : 0);

    return {
      spkNo: cleanSpk,
      year,
      month,
      monthName,
      timestamp: latestTimestamp,
      firstLabelTime: firstLabelTime === Infinity ? 0 : firstLabelTime,
      lastLabelTime,
      actualDurationMinutes,
      formula,
      thickness,
      supplier,
      totalJumbo,
      totalRealRolls,
      totalRealMeter,
      totalRealKg,
      passCount,
      holdCount,
      rejectCount,
      realLots: allLots,
      widthSummaries,
      speed,
      cuttingMinutes: timeEst.cuttingMinutes,
      changeOverMinutes: timeEst.changeOverMinutes,
      totalMinutes: timeEst.totalMinutes,
      plannedParentRolls,
      actualParentCut,
      plannedChildRolls,
      actualChildRolls,
      diffParent,
      diffChild,
      diffMeter,
      startTimeFormatted: firstLabelTime !== Infinity && firstLabelTime > 0 
        ? new Date(firstLabelTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(firstLabelTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-',
      endTimeFormatted: lastLabelTime > 0 
        ? new Date(lastLabelTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(lastLabelTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-',
      targetStatus: evaluateTargetStatus(actualChildRolls, plannedChildRolls, plan?.status === 'SKIPPED'),
      totalUp,
      achievementPercent,
      isCrossOrderWarning,
      warningMessage,
      plan
    };
  };

  // ── UNRESTRICTED REALTIME AGGREGATION FOR ALL DATA ROLLS (SHEET 3: LIST SPK) ──
  const allDataRollSpkList = computed(() => {
    const rolls = dataRollStore.rolls || [];
    const labels = labelStore.labels || [];
    const plansList = plans.value || [];
    const spkMap = new Map();

    const getOrInit = (spkKey) => {
      const clean = String(spkKey || '').trim().toUpperCase();
      if (!spkMap.has(clean)) {
        spkMap.set(clean, {
          spkNo: clean,
          lots: new Map(),
          totalRealRolls: 0,
          totalRealMeter: 0,
          totalRealKg: 0,
          passCount: 0,
          holdCount: 0,
          rejectCount: 0,
          machines: new Set(),
          formulas: new Set(),
          thicknesses: new Set(),
          widthMap: new Map(),
          dates: [],
          latestTimestamp: 0,
          plan: null
        });
      }
      return spkMap.get(clean);
    };

    // Attach plans first
    for (const p of plansList) {
      if (!p || !p.spkNo) continue;
      const entry = getOrInit(p.spkNo);
      if (!entry.plan) entry.plan = p;
      if (p.formula) entry.formulas.add(String(p.formula).toUpperCase());
      if (p.thickness) entry.thicknesses.add(parseFloat(p.thickness) || 0);
      if (p.tanggal) {
        const pt = new Date(p.tanggal).getTime();
        if (pt > entry.latestTimestamp) entry.latestTimestamp = pt;
      }
    }

    // Index data rolls
    const processedSignatures = new Set();
    for (let i = 0; i < rolls.length; i++) {
      const r = rolls[i];
      if (!r || !r.spk) continue;
      const s = String(r.spk).trim().toUpperCase();
      const rawLot = String(r.lot || '').trim();
      const turunan = String(r.turunan || '').trim();
      const cleanParent = extractCleanParentLot(rawLot, turunan) || rawLot.split('/')[0] || rawLot;
      
      const sig = `${s}::${cleanParent.toUpperCase()}::${turunan.toUpperCase()}`;
      if (turunan && processedSignatures.has(sig)) continue;
      if (turunan) processedSignatures.add(sig);

      const entry = getOrInit(s);
      const w = parseFloat(r.width) || 0;
      const m = parseFloat(r.length) || 0;
      let kg = parseFloat(r.netto || r.berat || r.beratTeori) || 0;
      const st = String(r.qualityStatus || 'PASS').toUpperCase();
      const mach = String(r.machineName || r.mesin || (r.slitting ? 'SLITTING' : (r.rewind ? 'REWIND' : ''))).toUpperCase();
      const formula = String(r.kodeFormula || r.jenis || '').toUpperCase();
      let thk = parseFloat(r.thickness) || (entry.plan ? parseFloat(entry.plan.thickness) : 0) || 0;
      if (thk <= 0 && r.kodeFg) {
        const mThk = String(r.kodeFg).match(/(\d+(?:\.\d+)?)\s*(?:MC|MIC|MICRON)/i);
        if (mThk) thk = parseFloat(mThk[1]);
      }
      if (thk <= 0 && entry.thicknesses.size > 0) {
        thk = Array.from(entry.thicknesses)[0];
      }
      if (thk <= 0) thk = 25;

      const density = getFilmDensity(r.jenis || (entry.plan?.jenis || ''), formula || (entry.plan?.formula || ''), s, configStore?.filmConfigs);
      if (kg <= 0 && w > 0 && m > 0 && thk > 0) {
        kg = calculateBeratTeori(thk, w, m, density);
      }
      const rawDate = r.tanggal || r.tanggalFormatted || r.createdAt;

      if (mach) entry.machines.add(mach);
      if (formula) entry.formulas.add(formula);
      if (thk > 0) entry.thicknesses.add(thk);

      if (rawDate) {
        const t = new Date(rawDate).getTime();
        if (!isNaN(t) && t > entry.latestTimestamp) entry.latestTimestamp = t;
        entry.dates.push(rawDate);
      }

      entry.totalRealRolls++;
      entry.totalRealMeter += m;
      entry.totalRealKg += kg;

      const roundedW = Math.round(w);
      if (roundedW > 0) {
        if (!entry.widthMap.has(roundedW)) {
          entry.widthMap.set(roundedW, { width: roundedW, totalRoll: 0, totalMeter: 0, totalKg: 0 });
        }
        const wEntry = entry.widthMap.get(roundedW);
        wEntry.totalRoll++;
        wEntry.totalMeter += m;
        wEntry.totalKg += kg;
      }

      if (st === 'PASS' || st === 'OK') entry.passCount++;
      else if (st === 'HOLD') entry.holdCount++;
      else if (st === 'REJECT' || st === 'NG') entry.rejectCount++;
      else entry.passCount++;

      let displayLot = rawLot;
      if (turunan && !rawLot.toUpperCase().includes(turunan.toUpperCase())) {
        displayLot = rawLot ? `${rawLot} / ${turunan}` : turunan;
      }
      const rollKey = r.uuid ? `R_${r.uuid}` : (r.id ? `R_ID_${r.id}` : `R_${i}`);
      entry.lots.set(rollKey, {
        id: r.id || rollKey,
        lot: displayLot || `ROLL_${i + 1}`,
        parentLot: cleanParent,
        turunan,
        width: w,
        length: m,
        weight: kg,
        status: st,
        machine: mach || 'SLITTING',
        source: 'DATA_ROLL',
        date: rawDate,
        formula,
        thickness: thk
      });
    }

    // Also scan labels table for any label rolls
    for (let i = 0; i < labels.length; i++) {
      const l = labels[i];
      if (!l || !l.spk) continue;
      const s = String(l.spk).trim().toUpperCase();
      const rawLot = String(l.lot || '').trim();
      const turunan = String(l.turunan || '').trim();
      const cleanParent = extractCleanParentLot(rawLot, turunan) || rawLot.split('/')[0] || rawLot;
      const sig = `${s}::${cleanParent.toUpperCase()}::${turunan.toUpperCase()}`;
      if (turunan && processedSignatures.has(sig)) continue;
      if (turunan) processedSignatures.add(sig);

      const entry = getOrInit(s);
      const w = parseFloat(l.width || l.lebar) || 0;
      const m = parseFloat(l.length || l.meter || l.panjang) || 0;
      let kg = parseFloat(l.netto || l.beratNetto || l.beratTeori) || 0;
      const st = String(l.status || 'PASS').toUpperCase();
      const mach = String(l.noMesin || 'SLITTING').toUpperCase();
      const formula = String(l.kodeFormula || l.formula || l.type || '').toUpperCase();
      let thk = parseFloat(l.thickness || l.ketebalan) || (entry.plan ? parseFloat(entry.plan.thickness) : 0) || 0;
      if (thk <= 0 && entry.thicknesses.size > 0) {
        thk = Array.from(entry.thicknesses)[0];
      }
      if (thk <= 0) thk = 25;

      const density = getFilmDensity(l.jenis || (entry.plan?.jenis || ''), formula || (entry.plan?.formula || ''), s, configStore?.filmConfigs);
      if (kg <= 0 && w > 0 && m > 0 && thk > 0) {
        kg = calculateBeratTeori(thk, w, m, density);
      }
      const rawDate = l.tanggal || l.createdAt;

      if (mach) entry.machines.add(mach);
      if (formula) entry.formulas.add(formula);
      if (thk > 0) entry.thicknesses.add(thk);

      if (rawDate) {
        const t = new Date(rawDate).getTime();
        if (!isNaN(t) && t > entry.latestTimestamp) entry.latestTimestamp = t;
        entry.dates.push(rawDate);
      }

      entry.totalRealRolls++;
      entry.totalRealMeter += m;
      entry.totalRealKg += kg;

      const roundedW = Math.round(w);
      if (roundedW > 0) {
        if (!entry.widthMap.has(roundedW)) {
          entry.widthMap.set(roundedW, { width: roundedW, totalRoll: 0, totalMeter: 0, totalKg: 0 });
        }
        const wEntry = entry.widthMap.get(roundedW);
        wEntry.totalRoll++;
        wEntry.totalMeter += m;
        wEntry.totalKg += kg;
      }

      if (st === 'PASS' || st === 'OK') entry.passCount++;
      else if (st === 'HOLD') entry.holdCount++;
      else if (st === 'REJECT' || st === 'NG') entry.rejectCount++;
      else entry.passCount++;

      let displayLot = rawLot;
      if (turunan && !rawLot.toUpperCase().includes(turunan.toUpperCase())) {
        displayLot = rawLot ? `${rawLot} / ${turunan}` : turunan;
      }
      const rollKey = l.uniqId ? `L_${l.uniqId}` : (l.id ? `L_ID_${l.id}` : `L_${i}`);
      entry.lots.set(rollKey, {
        id: l.id || rollKey,
        lot: displayLot || `ROLL_${i + 1}`,
        parentLot: cleanParent,
        turunan,
        width: w,
        length: m,
        weight: kg,
        status: st,
        machine: mach || 'SLITTING',
        source: 'LABEL',
        date: rawDate,
        formula,
        thickness: thk,
        operator: l.operator || '-'
      });
    }

    // Convert map to array with parsed metadata
    const resultList = [];
    for (const item of spkMap.values()) {
      const sampleDate = item.dates[0] || (item.latestTimestamp > 0 ? new Date(item.latestTimestamp).toISOString() : null);
      const meta = parseSpkMetadata(item.spkNo, sampleDate);
      
      const formulaStr = Array.from(item.formulas).filter(Boolean).join(', ') || item.plan?.formula || '-';
      const thkStr = Array.from(item.thicknesses).filter(t => t > 0).join(', ') || (item.plan?.thickness ? `${item.plan.thickness}` : '-');
      const machinesArr = Array.from(item.machines).filter(Boolean);
      if (machinesArr.length === 0) machinesArr.push('SLITTING');

      const realLots = Array.from(item.lots.values());
      const widthSummaries = Array.from(item.widthMap.values()).sort((a, b) => b.width - a.width);
      const totalJumbo = item.plan?.jumlahJumbo || Math.max(1, Math.ceil(item.totalRealRolls / 2));
      const plannedMeter = item.plan ? (item.plan.totalPlannedMeter || (item.plan.panjangParent * totalJumbo)) : item.totalRealMeter;
      const plannedRolls = item.plan?.totalPlannedRolls || item.totalRealRolls;
      const achievementPercent = plannedMeter > 0 ? Math.min(100, Math.round((item.totalRealMeter / plannedMeter) * 100)) : 100;

      resultList.push({
        spkNo: item.spkNo,
        category: meta.category,
        year: meta.year,
        month: meta.month,
        monthName: meta.monthName,
        romanMonth: meta.romanMonth,
        noUrut: meta.noUrut,
        vendor: meta.vendor,
        isTrial: meta.isTrial,
        material: meta.material,
        isSupplierInhouse: meta.category === 'INHOUSE',
        supplier: meta.vendor,
        totalRealRolls: item.totalRealRolls,
        totalRealMeter: Math.round(item.totalRealMeter),
        totalRealKg: Math.round(item.totalRealKg * 10) / 10,
        passCount: item.passCount,
        holdCount: item.holdCount,
        rejectCount: item.rejectCount,
        machines: machinesArr,
        formula: formulaStr,
        thickness: thkStr,
        totalJumbo,
        plannedMeter,
        plannedRolls,
        achievementPercent,
        latestTimestamp: item.latestTimestamp,
        realLots,
        widthSummaries,
        plan: item.plan
      });
    }

    return resultList;
  });

  const getAllSpkAnalytics = (spkNo) => {
    const clean = String(spkNo || '').trim().toUpperCase();
    if (!clean) return null;
    const found = allDataRollSpkList.value.find(s => s.spkNo === clean);
    if (found) return found;
    return getSpkRealtimeAnalytics(clean, null);
  };

  return {
    plans,
    batches,
    selectedBatchId,
    revisions,
    isLoading,
    activePlanId,
    loadAll,
    addPlan,
    addBatchWithPlans,
    updatePlan,
    deletePlan,
    deleteBatch,
    getSlittingSpeed,
    calculateEstimateMinutes,
    calculateTrim,
    activeTimelineBatchUuid,
    setActiveReferenceBatch,
    reorderBatchPlans,
    activeBatch,
    activeDateWindow,
    spkRealtimeDataMap,
    getSpkRealtimeAnalytics,
    allDataRollSpkList,
    getAllSpkAnalytics,
    parseSpkMetadata
  };
});

export const ROMAN_TO_MONTH = {
  'I': 1, 'II': 2, 'III': 3, 'IV': 4, 'V': 5, 'VI': 6,
  'VII': 7, 'VIII': 8, 'IX': 9, 'X': 10, 'XI': 11, 'XII': 12
};

export const MONTH_NAMES_ID = [
  '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

export function parseSpkMetadata(spkNo, sampleDate = null) {
  const cleanSpk = String(spkNo || '').trim().toUpperCase();
  if (!cleanSpk) {
    return {
      spkNo: '',
      category: 'INHOUSE',
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      monthName: MONTH_NAMES_ID[new Date().getMonth() + 1] || 'September',
      romanMonth: '',
      noUrut: null,
      vendor: 'PT SWC (INHOUSE)',
      isTrial: false,
      material: 'CPP'
    };
  }

  // Check category:
  // INHOUSE if contains /SPK/ or starts with SPK/ or ends with /SPK or is TRIAL/V/SPK...
  const isInhouse = cleanSpk.includes('/SPK/') || cleanSpk.startsWith('SPK/') || cleanSpk.endsWith('/SPK') || cleanSpk === 'SPK';
  const category = isInhouse ? 'INHOUSE' : 'EXTERNAL';

  let year = null;
  let month = null;
  let romanMonth = '';
  let noUrut = null;
  let vendor = isInhouse ? 'PT SWC (INHOUSE)' : 'EKSTERNAL';
  let isTrial = cleanSpk.includes('TRIAL');
  let material = '';

  // Extract year (4 digit 202x)
  const yrMatch = cleanSpk.match(/\b(202\d)\b/);
  if (yrMatch) {
    year = parseInt(yrMatch[1], 10);
  }

  // Tokenize by '/' or '-'
  const tokens = cleanSpk.split(/[\/\-_]/).map(t => t.trim()).filter(Boolean);

  if (isInhouse) {
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (/^\d+$/.test(tok)) {
        if (tok.length <= 3 && noUrut === null) {
          noUrut = parseInt(tok, 10);
        } else if (tok.length === 4 && year === null) {
          year = parseInt(tok, 10);
        }
      } else if (ROMAN_TO_MONTH[tok]) {
        romanMonth = tok;
        month = ROMAN_TO_MONTH[tok];
      }
    }
  } else {
    for (let i = 0; i < tokens.length; i++) {
      const tok = tokens[i];
      if (['CPP', 'PET', 'BOPP', 'VMPET', 'VMCPP', 'METALIZE', 'LLDPE'].includes(tok)) {
        material = tok;
      } else if (ROMAN_TO_MONTH[tok]) {
        romanMonth = tok;
        month = ROMAN_TO_MONTH[tok];
      } else if (/^\d+$/.test(tok)) {
        if (tok.length === 4 && year === null) {
          year = parseInt(tok, 10);
        } else if (tok.length <= 3 && noUrut === null) {
          noUrut = parseInt(tok, 10);
        }
      } else if (tok !== 'SPK' && tok.length >= 2) {
        if (vendor === 'EKSTERNAL' || vendor === '') {
          vendor = tok;
        } else if (tokens[i - 1] === 'MAX' && tok === 'BF') {
          vendor = 'MAX-BF';
        } else if (tokens[i - 1] === 'MAX' && tok === 'O2') {
          vendor = 'MAX-O2';
        }
      }
    }
  }

  // Fallback for date if year or month missing
  if ((!year || !month) && sampleDate) {
    const d = new Date(sampleDate);
    if (!isNaN(d.getTime())) {
      if (!year) year = d.getFullYear();
      if (!month) month = d.getMonth() + 1;
    }
  }

  if (!year) year = new Date().getFullYear();
  if (!month) month = new Date().getMonth() + 1;
  const monthName = MONTH_NAMES_ID[month] || 'September';

  return {
    spkNo: cleanSpk,
    category,
    year,
    month,
    monthName,
    romanMonth,
    noUrut,
    vendor,
    isTrial,
    material
  };
}

