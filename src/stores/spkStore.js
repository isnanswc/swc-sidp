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

export const useSpkStore = defineStore('spk', () => {
  const plans = ref([]);
  const batches = ref([]);
  const revisions = ref([]);
  const isLoading = ref(false);
  const activePlanId = ref(null);
  const selectedBatchId = ref(null);
  const activeTimelineBatchUuid = ref(null);

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
  const loadAll = async () => {
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
        plans.value = rawPlans.sort((a, b) => (a.seq || a.no || a.id) - (b.seq || b.no || b.id));
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
        const pId = await db.spk_plans.add(planRecord);
        planRecord.id = pId;
        plans.value.push(planRecord);
        createdPlans.push(planRecord);
      }
    }

    return { batch: batchRecord, plans: createdPlans };
  };

  // Delete Batch and all its child plans
  const deleteBatch = async (batchUuid) => {
    if (db.spk_batches) {
      const b = await db.spk_batches.where('uuid').equals(batchUuid).first();
      if (b) await db.spk_batches.delete(b.id);
      batches.value = batches.value.filter(b => b.uuid !== batchUuid);
    }
    if (db.spk_plans) {
      const childPlans = await db.spk_plans.where('batchId').equals(batchUuid).toArray();
      if (childPlans.length > 0) {
        await db.spk_plans.bulkDelete(childPlans.map(c => c.id));
        plans.value = plans.value.filter(p => p.batchId !== batchUuid);
      }
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

    const record = {
      uuid: `spk_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
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
      plans.value.unshift(record);
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
    }
  };

  // Delete Plan
  const deletePlan = async (id) => {
    if (db.spk_plans) {
      await db.spk_plans.delete(id);
      plans.value = plans.value.filter(p => p.id !== id);
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
      const spkObj = getOrInitSpk(s);
      const lotKey = l.lot || l.barcode || l.uniqId || `L_${i}`;

      if (!spkObj.lots.has(lotKey)) {
        const w = parseFloat(l.width) || 0;
        const m = parseFloat(l.length) || parseFloat(l.meter) || 0;
        const kg = parseFloat(l.netto) || parseFloat(l.beratNetto) || 0;
        const st = String(l.status || 'PASS').toUpperCase();

        spkObj.lots.set(lotKey, {
          lot: lotKey,
          width: w,
          length: m,
          weight: kg,
          status: st,
          source: 'LABEL',
          date: l.tanggal || l.createdAt,
          formula: l.kodeFormula || l.formula || l.type || l.jenis || '',
          thickness: parseFloat(l.thickness) || 0,
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

      // Filter tanggal aktual: data masa lampau diabaikan, hanya berlaku [startDate ... H+1]
      const rawDateStr = r.tanggal || r.tanggalFormatted || r.createdAt;
      if (wnd && rawDateStr) {
        const itemTime = new Date(rawDateStr).getTime();
        if (!isNaN(itemTime)) {
          if (itemTime < minTime || itemTime > maxTime) continue;
        }
      }
      const s = String(r.spk).trim().toUpperCase();
      const spkObj = getOrInitSpk(s);
      const lotKey = r.lot || r.kodeFg || r.uuid || `R_${i}`;

      if (!spkObj.lots.has(lotKey)) {
        const w = parseFloat(r.width) || 0;
        const m = parseFloat(r.length) || 0;
        const kg = parseFloat(r.netto) || 0;
        const st = String(r.qualityStatus || 'PASS').toUpperCase();

        spkObj.lots.set(lotKey, {
          lot: lotKey,
          width: w,
          length: m,
          weight: kg,
          status: st,
          source: 'DATA_ROLL',
          date: r.tanggal || r.tanggalFormatted || r.createdAt,
          formula: r.kodeFormula || r.jenis || '',
          thickness: parseFloat(r.thickness) || 0,
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

    // Check exact match or token matches in O(1)
    const matchedSpkKeys = new Set([cleanSpk, ...subSpkTokens]);
    for (const key of matchedSpkKeys) {
      const spkData = dataMap.get(key);
      if (spkData) {
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
      totalUp,
      achievementPercent,
      isCrossOrderWarning,
      warningMessage,
      plan
    };
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
    activeBatch,
    activeDateWindow,
    spkRealtimeDataMap,
    getSpkRealtimeAnalytics
  };
});
