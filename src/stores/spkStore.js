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
        plans.value = (await db.spk_plans.toArray()).reverse();
      }
      if (db.spk_revisions) {
        revisions.value = (await db.spk_revisions.toArray()).reverse();
      }

      // Seed initial data from physical sheet "JADWAL SLITTING (3B-PROD)" if empty
      if (plans.value.length === 0) {
        await seedFromJadwalSlitting();
      }
    } catch (err) {
      console.error('Failed to load SPK plans:', err);
    } finally {
      isLoading.value = false;
    }
  };

  // Seed sample from physical sheet 3B-PROD
  const seedFromJadwalSlitting = async () => {
    const sampleDate = '2026-09-03';
    const initialItems = [
      {
        uuid: 'spk-sample-01',
        spkNo: '04/VIII',
        docNo: '3B-PROD',
        formula: 'M07',
        jenis: 'CPP',
        thickness: 35,
        lebarParent: 2320,
        panjangParent: 19300,
        jumlahJumbo: 3,
        totalPlannedMeter: 240000,
        totalPlannedRolls: 6,
        chartingJson: JSON.stringify([
          { upNo: 1, lebar: 1145, panjang: 12000, qty: 3 },
          { upNo: 2, lebar: 1145, panjang: 12000, qty: 3 }
        ]),
        trimAuto: 30, // 2320 - (1145 * 2) = 30 mm
        keterangan: 'Jadwal Standar Batch 1',
        status: 'IN_PROGRESS',
        source: 'AI_SCAN',
        revisionsCount: 0,
        tanggal: sampleDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        uuid: 'spk-sample-02',
        spkNo: '07/XII/25 & 02/I', // Multi-SPK dalam 1 JR
        docNo: '3B-PROD',
        formula: 'M06',
        jenis: 'CPP',
        thickness: 25,
        lebarParent: 2260,
        panjangParent: 5300,
        jumlahJumbo: 1,
        totalPlannedMeter: 40000,
        totalPlannedRolls: 2,
        chartingJson: JSON.stringify([
          { upNo: 1, lebar: 1100, panjang: 10000, qty: 1 },
          { upNo: 2, lebar: 1100, panjang: 10000, qty: 1 }
        ]),
        trimAuto: 60, // 2260 - 2200 = 60 mm
        keterangan: 'C1 TENGAH - Cross Order Multi SPK',
        status: 'PLANNED',
        source: 'AI_SCAN',
        revisionsCount: 0,
        tanggal: sampleDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        uuid: 'spk-sample-03',
        spkNo: '07/VI',
        docNo: '3B-PROD',
        formula: 'M07',
        jenis: 'CPP',
        thickness: 25,
        lebarParent: 2410,
        panjangParent: 11000,
        jumlahJumbo: 1,
        totalPlannedMeter: 24000,
        totalPlannedRolls: 2,
        chartingJson: JSON.stringify([
          { upNo: 1, lebar: 1220, panjang: 12000, qty: 1 },
          { upNo: 2, lebar: 1160, panjang: 12000, qty: 1 }
        ]),
        trimAuto: 30, // 2410 - (1220 + 1160) = 30 mm
        keterangan: 'C1 ATAS',
        status: 'PLANNED',
        source: 'AI_SCAN',
        revisionsCount: 0,
        tanggal: sampleDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        uuid: 'spk-sample-04',
        spkNo: '01/IX',
        docNo: '3B-PROD',
        formula: 'M07',
        jenis: 'CPP',
        thickness: 35,
        lebarParent: 2250,
        panjangParent: 20300,
        jumlahJumbo: 2,
        totalPlannedMeter: 40000,
        totalPlannedRolls: 6,
        chartingJson: JSON.stringify([
          { upNo: 1, lebar: 740, panjang: 12000, qty: 2 },
          { upNo: 2, lebar: 740, panjang: 12000, qty: 2 },
          { upNo: 3, lebar: 740, panjang: 12000, qty: 2 }
        ]),
        trimAuto: 30, // 2250 - (740 * 3) = 30 mm
        keterangan: 'Potong 3 UP Standard',
        status: 'PLANNED',
        source: 'AI_SCAN',
        revisionsCount: 0,
        tanggal: sampleDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        uuid: 'spk-sample-05',
        spkNo: 'PANVERTA',
        docNo: '3B-PROD',
        formula: 'CMGX',
        jenis: 'CPP',
        thickness: 35,
        lebarParent: 2320,
        panjangParent: 20300,
        jumlahJumbo: 8,
        totalPlannedMeter: 160000,
        totalPlannedRolls: 16,
        chartingJson: JSON.stringify([
          { upNo: 1, lebar: 1145, panjang: 12000, qty: 8 },
          { upNo: 2, lebar: 1145, panjang: 12000, qty: 8 }
        ]),
        trimAuto: 30,
        keterangan: 'Order Khusus Eksternal',
        status: 'PLANNED',
        source: 'AI_SCAN',
        revisionsCount: 0,
        tanggal: sampleDate,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    if (db.spk_plans) {
      await db.spk_plans.bulkAdd(initialItems);
      plans.value = (await db.spk_plans.toArray()).reverse();
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

  // REALTIME AGGREGATION & ANALYTICS HELPER
  // Mengintegrasikan planned SPK dengan realisasi aktual dari labelStore.labels dan dataRollStore.rolls
  const getSpkRealtimeAnalytics = (spkNo, plan = null) => {
    const cleanSpk = String(spkNo || '').trim().toUpperCase();
    if (!cleanSpk) return null;

    // Support multi-SPK matching (misal "07/XII/25 & 02/I")
    const subSpkTokens = cleanSpk.split('&').map(s => s.trim()).filter(Boolean);

    const allLabels = labelStore.labels || [];
    const allRolls = dataRollStore.rolls || [];

    // Filter matched records
    const matchedLabels = allLabels.filter(l => {
      if (!l.spk) return false;
      const s = String(l.spk).trim().toUpperCase();
      return s === cleanSpk || subSpkTokens.includes(s) || cleanSpk.includes(s);
    });

    const matchedRolls = allRolls.filter(r => {
      if (!r.spk) return false;
      const s = String(r.spk).trim().toUpperCase();
      return s === cleanSpk || subSpkTokens.includes(s) || cleanSpk.includes(s);
    });

    // Gabungkan nomor lot unik
    const lotMap = new Map();
    matchedLabels.forEach(l => {
      const lot = l.lot || l.barcode || l.uniqId;
      if (!lotMap.has(lot)) {
        lotMap.set(lot, {
          lot,
          width: parseFloat(l.width) || 0,
          length: parseFloat(l.length) || parseFloat(l.meter) || 0,
          weight: parseFloat(l.netto) || parseFloat(l.beratNetto) || 0,
          status: String(l.status || 'PASS').toUpperCase(),
          turunan: l.turunan || 1,
          source: 'LABEL',
          date: l.tanggal || l.createdAt
        });
      }
    });

    matchedRolls.forEach(r => {
      const lot = r.lot || r.kodeFg || r.uuid;
      if (!lotMap.has(lot)) {
        lotMap.set(lot, {
          lot,
          width: parseFloat(r.width) || 0,
          length: parseFloat(r.length) || 0,
          weight: parseFloat(r.netto) || 0,
          status: String(r.qualityStatus || 'PASS').toUpperCase(),
          turunan: r.turunan || 1,
          source: 'DATA_ROLL',
          date: r.tanggal || r.createdAt
        });
      }
    });

    const realLots = Array.from(lotMap.values());
    const totalRealRolls = realLots.length;
    const totalRealMeter = realLots.reduce((sum, item) => sum + item.length, 0);
    const totalRealKg = realLots.reduce((sum, item) => sum + item.weight, 0);

    let passCount = 0;
    let holdCount = 0;
    let rejectCount = 0;

    realLots.forEach(item => {
      if (item.status === 'PASS' || item.status === 'OK') passCount++;
      else if (item.status === 'HOLD') holdCount++;
      else if (item.status === 'REJECT' || item.status === 'NG') rejectCount++;
      else passCount++;
    });

    // Breakdown per ukuran lebar roll turunan
    const widthSummaryMap = new Map();
    realLots.forEach(item => {
      const w = Math.round(item.width);
      if (!widthSummaryMap.has(w)) {
        widthSummaryMap.set(w, {
          width: w,
          totalRoll: 0,
          totalMeter: 0,
          totalKg: 0
        });
      }
      const wObj = widthSummaryMap.get(w);
      wObj.totalRoll++;
      wObj.totalMeter += item.length;
      wObj.totalKg += item.weight;
    });

    const widthSummaries = Array.from(widthSummaryMap.values()).sort((a, b) => b.width - a.width);

    // Smart Charting Match & Cross-Order Sign Warning
    let isCrossOrderWarning = false;
    let warningMessage = '';

    if (subSpkTokens.length > 1) {
      isCrossOrderWarning = true;
      warningMessage = `SPK multi-item (${subSpkTokens.join(' & ')}) dalam 1 lembar pengerjaan.`;
    }

    if (plan) {
      const upList = plan.chartingJson ? JSON.parse(plan.chartingJson) : [];
      const plannedWidths = upList.map(u => Math.round(u.lebar));

      // Cek apakah ada roll aktual yang ukurannya cocok dengan UP tapi nomor SPK aslinya berbeda
      allLabels.forEach(l => {
        if (!l.spk) return;
        const s = String(l.spk).trim().toUpperCase();
        if (s !== cleanSpk && !subSpkTokens.includes(s)) {
          const lWidth = Math.round(parseFloat(l.width) || 0);
          if (plannedWidths.includes(lWidth) && Math.abs(new Date(l.tanggal || l.createdAt) - new Date(plan.tanggal || Date.now())) < 86400000 * 2) {
            isCrossOrderWarning = true;
            warningMessage = `Terdeteksi kesesuaian UP (${lWidth} mm) pada SPK berbeda: ${s} (Potensi Cross-Order/Gabungan).`;
          }
        }
      });
    }

    // Time calculations
    const speed = plan ? getSlittingSpeed(plan.formula, plan.jenis) : 600;
    const plannedMeter = plan ? (plan.totalPlannedMeter || (plan.panjangParent * plan.jumlahJumbo)) : (totalRealMeter || 24000);
    const jumlahJumbo = plan ? (plan.jumlahJumbo || 1) : 1;
    const timeEst = calculateEstimateMinutes(plannedMeter, jumlahJumbo, speed);

    // Achievement percentage
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
      realLots,
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
    getSpkRealtimeAnalytics
  };
});
