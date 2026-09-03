import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/db';
import { useConfigStore } from '@/stores/configStore';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';

export const useSpkStore = defineStore('spk', () => {
  const plans = ref([]);
  const revisions = ref([]);
  const isLoading = ref(false);
  const activePlanId = ref(null);

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
      if (db.spk_plans) {
        // ZERO-SEEDING POLICY: Bersihkan segala data sample / dummy SPK
        const dummyItems = await db.spk_plans.filter(p => String(p.uuid || '').startsWith('spk-sample-')).toArray();
        if (dummyItems.length > 0) {
          await db.spk_plans.bulkDelete(dummyItems.map(d => d.id));
        }
        plans.value = (await db.spk_plans.toArray()).reverse();
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
          date: l.tanggal || l.createdAt
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
          date: r.tanggal || r.createdAt
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

    // Speed & time calculation in O(1)
    const speed = plan ? getSlittingSpeed(plan.formula, plan.jenis) : 600;
    const plannedMeter = plan ? (plan.totalPlannedMeter || (plan.panjangParent * plan.jumlahJumbo)) : (totalRealMeter || 24000);
    const jumlahJumbo = plan ? (plan.jumlahJumbo || 1) : 1;
    const timeEst = calculateEstimateMinutes(plannedMeter, jumlahJumbo, speed);

    const plannedRollsCount = plan ? (plan.totalPlannedRolls || (jumlahJumbo * 2)) : Math.max(totalRealRolls, 1);
    const achievementPercent = plannedRollsCount > 0 ? Math.min(100, Math.round((totalRealRolls / plannedRollsCount) * 100)) : 0;

    return {
      spkNo: cleanSpk,
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
      achievementPercent,
      isCrossOrderWarning,
      warningMessage,
      plan
    };
  };

  return {
    plans,
    revisions,
    isLoading,
    activePlanId,
    loadAll,
    addPlan,
    updatePlan,
    deletePlan,
    getSlittingSpeed,
    calculateEstimateMinutes,
    calculateTrim,
    spkRealtimeDataMap,
    getSpkRealtimeAnalytics
  };
});
