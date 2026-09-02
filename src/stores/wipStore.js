import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db, generateUniqID } from '@/db';
import { useConfigStore } from '@/stores/configStore';

export const useWipStore = defineStore('wip', () => {
  const wipUpdates = ref([]); // List of batch update sessions
  const wipRolls = ref([]); // All rolls currently loaded in memory
  const selectedUpdateId = ref(null); // Currently viewed batch update in detail view
  const isLoading = ref(false);

  // Helper to calculate Theoretical Weight (Netto kg)
  const calculateBeratTeori = (thick, width, length, jenis) => {
    const faktor = ['VMPET', 'PET'].includes(jenis) ? 1.4 : 0.91;
    const t = parseFloat(thick) || 0;
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    if (!t || !w || !l) return 0;
    return parseFloat(((t * w * l * faktor) / 1000000).toFixed(2));
  };

  // 1. Description NAV: [JENIS] [FORMULA] [THICK] MC X [WIDTH] MM
  const generateDescNav = (jenis, formula, thick, width) => {
    const j = (jenis || '').trim().toUpperCase();
    const f = (formula || '').trim().toUpperCase();
    const t = (thick !== undefined && thick !== null ? String(thick) : '').trim();
    const w = (width !== undefined && width !== null ? String(width) : '').trim();
    return `${j} ${f} ${t} MC X ${w} MM`.replace(/\s+/g, ' ').trim();
  };

  // 2. Description Excel: [DESCRIPTION NAV] = [LENGTH] , [CORE] INCHI [OD] [TANDA]
  const generateDescExcel = (jenis, formula, thick, width, length, core, od, tanda) => {
    const nav = generateDescNav(jenis, formula, thick, width);
    const l = (length !== undefined && length !== null ? String(length) : '').trim();
    const c = (core !== undefined && core !== null && String(core).trim() ? String(core).trim() : '6');
    const rawOd = (od || '').trim();
    const odVal = rawOd ? rawOd : '0';
    const tandaVal = (tanda || '').trim();

    let excel = `${nav} = ${l} , ${c} INCHI ${odVal}`;
    if (tandaVal) {
      excel += ` ${tandaVal}`;
    }
    return excel.trim();
  };

  // Active Update Session (Acuan Utama Stok)
  const activeUpdate = computed(() => {
    const list = Array.isArray(wipUpdates.value) ? wipUpdates.value : [];
    return list.find(u => u.isActive === 1 || u.isActive === true) || list[0] || null;
  });

  // Active WIP Rolls used as Primary Anchor for Stock & Label Auto-Suggest
  const activeWipRolls = computed(() => {
    const allRolls = Array.isArray(wipRolls.value) ? wipRolls.value : [];
    if (!activeUpdate.value) return allRolls;
    const activeId = activeUpdate.value.uuid || activeUpdate.value.id;
    const filtered = allRolls.filter(r => r.updateId === activeId || String(r.updateId) === String(activeUpdate.value.id));
    return filtered.length > 0 ? filtered : allRolls;
  });

  // Load All WIP Updates & Rolls from IndexedDB
  const loadWipRolls = async () => {
    isLoading.value = true;
    try {
      // 1. Load Batches
      const updates = await db.wip_updates.orderBy('id').reverse().toArray();
      wipUpdates.value = updates || [];

      // 2. Load Rolls & Auto-Normalize to Master Racks
      const rolls = await db.wip_rolls.orderBy('id').reverse().toArray();
      
      // Auto-normalize any dirty location in existing stored rolls
      try {
        const configStore = useConfigStore();
        
        for (const r of rolls) {
          const cleanLoc = configStore.normalizeLocation(r.lokasiAktif, 'WIP JUMBO');
          const cleanPos = (r.posisiAktif === '0' || !r.posisiAktif) ? 'BAWAH' : r.posisiAktif.toUpperCase();
          if (r.lokasiAktif !== cleanLoc || r.posisiAktif !== cleanPos) {
            r.lokasiAktif = cleanLoc;
            r.posisiAktif = cleanPos;
            await db.wip_rolls.update(r.id, { lokasiAktif: cleanLoc, posisiAktif: cleanPos });
          }
        }
      } catch (normErr) {
        console.warn('Could not auto-normalize stored rolls:', normErr);
      }

      wipRolls.value = rolls || [];

      // If there are legacy rolls without an update batch, wrap them into an initial batch
      if (wipUpdates.value.length === 0 && wipRolls.value.length > 0) {
        const legacyUuid = generateUniqID('WIP_BATCH');
        const legacyBatch = {
          uuid: legacyUuid,
          title: 'Update Stok WIP Awal (Master Data)',
          tanggal: new Date().toISOString().slice(0, 10),
          fileName: 'Initial Import',
          totalRolls: wipRolls.value.length,
          totalKg: wipRolls.value.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0),
          isActive: 1,
          rollsJson: JSON.stringify(wipRolls.value),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        const newBatchId = await db.wip_updates.add(legacyBatch);
        legacyBatch.id = newBatchId;
        wipUpdates.value = [legacyBatch];

        // Link existing rolls to this batch
        for (const r of wipRolls.value) {
          await db.wip_rolls.update(r.id, { updateId: legacyUuid });
          r.updateId = legacyUuid;
        }
      }

      // Ensure exactly one active update batch
      const activeCount = wipUpdates.value.filter(u => u.isActive === 1 || u.isActive === true).length;
      if (activeCount === 0 && wipUpdates.value.length > 0) {
        wipUpdates.value[0].isActive = 1;
        await db.wip_updates.update(wipUpdates.value[0].id, { isActive: 1 });
      }
    } catch (e) {
      console.error('Failed to load WIP data from DB:', e);
    } finally {
      isLoading.value = false;
    }
  };

  // Set One Update Batch as Active Primary Stock Anchor
  const setActiveUpdate = async (updateItemOrId) => {
    const targetId = typeof updateItemOrId === 'object' ? (updateItemOrId.id || updateItemOrId.uuid) : updateItemOrId;
    
    for (const update of wipUpdates.value) {
      const isMatch = update.id === targetId || update.uuid === targetId;
      const newStatus = isMatch ? 1 : 0;
      update.isActive = newStatus;
      if (update.id) {
        await db.wip_updates.update(update.id, { isActive: newStatus, updatedAt: new Date().toISOString() });
      }
    }
  };

  // Create New WIP Update Batch from Upload / Import
  const createWipUpdate = async ({ title, tanggal, fileName, rawRollsList, makeActive = true }) => {
    if (!rawRollsList || rawRollsList.length === 0) {
      throw new Error('Tidak ada data baris WIP yang dapat di-import.');
    }

    const batchUuid = generateUniqID('WIP_BATCH');
    const tgl = tanggal || new Date().toISOString().slice(0, 10);
    const batchTitle = title || `Update Stok WIP ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;

    let totalKg = 0;
    const formattedRecords = rawRollsList.map(r => {
      const thick = String(r.thickness || '20').trim();
      const width = String(r.width || '1000').trim();
      const length = String(r.length || '6000').trim();
      const jenis = (r.jenis || 'VMCPP').trim().toUpperCase();
      const kodeFormula = (r.kodeFormula || r.formula || 'M01').trim().toUpperCase();
      const core = String(r.core || '6').trim();
      const od = (r.od || '').trim();
      const tanda = (r.tanda || '').trim();

      const beratTeori = calculateBeratTeori(thick, width, length, jenis);
      const rawBeratAktual = parseFloat(r.beratAktual);
      const beratAktual = !isNaN(rawBeratAktual) && rawBeratAktual > 0 ? rawBeratAktual : beratTeori;
      totalKg += beratAktual;

      const descNav = generateDescNav(jenis, kodeFormula, thick, width);
      const descExcel = generateDescExcel(jenis, kodeFormula, thick, width, length, core, od, tanda);

      return {
        uuid: r.uuid || generateUniqID('WIP'),
        updateId: batchUuid,
        tanggalInput: r.tanggalInput || r.tanggalSpk || tgl,
        tanggalSpk: r.tanggalSpk || r.tanggalInput || tgl,
        spk: (r.spk || '').trim().toUpperCase(),
        lot: (r.lot || r.noLot || '').trim().toUpperCase(),
        jenis,
        kodeFormula,
        thickness: thick,
        width,
        length,
        core,
        od,
        tanda,
        beratTeori,
        beratAktual,
        lokasiAktif: (r.lokasiAktif || r.lokasi || 'STAGING').trim().toUpperCase(),
        posisiAktif: (r.posisiAktif || r.posisi || 'R-1').trim().toUpperCase(),
        descriptionNav: descNav,
        descriptionExcel: descExcel,
        keterangan: (r.keterangan || '').trim(),
        status: 'AVAILABLE', // Semua status kualitas otomatis AVAILABLE sesuai arahan
        
        // Data Tambahan Tanggal Masuk & Aging
        tanggalMasukStokRaw: r.tanggalMasukStokRaw || '',
        tanggalMasukFormatted: r.tanggalMasukFormatted || '—',
        stockAgeDays: r.stockAgeDays !== undefined ? r.stockAgeDays : null,
        aging: r.aging || '',
        waktuAgingRaw: r.waktuAgingRaw || '',
        waktuAgingFormatted: r.waktuAgingFormatted || '—',
        estimasiWaktuAgingRaw: r.estimasiWaktuAgingRaw || '',
        estimasiWaktuAgingFormatted: r.estimasiWaktuAgingFormatted || '—',
        agingStatus: r.agingStatus || 'SIAP PAKAI',
        isAging: r.isAging || false,
        isReady: r.isReady !== undefined ? r.isReady : true,
        agingRemainingFormatted: r.agingRemainingFormatted || 'Siap Pakai',
        agingProgressPercent: r.agingProgressPercent !== undefined ? r.agingProgressPercent : 100,

        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    // If making active, deactivate all existing batches first
    if (makeActive) {
      for (const u of wipUpdates.value) {
        u.isActive = 0;
        if (u.id) await db.wip_updates.update(u.id, { isActive: 0 });
      }
    }

    const newBatch = {
      uuid: batchUuid,
      title: batchTitle,
      tanggal: tgl,
      fileName: fileName || 'Upload_WIP.xlsx',
      totalRolls: formattedRecords.length,
      totalKg: Number(totalKg.toFixed(2)),
      isActive: makeActive ? 1 : 0,
      rollsJson: JSON.stringify(formattedRecords),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const batchId = await db.wip_updates.add(newBatch);
    newBatch.id = batchId;
    wipUpdates.value.unshift(newBatch);

    // Save individual rolls
    await db.wip_rolls.bulkAdd(formattedRecords);
    wipRolls.value.unshift(...formattedRecords);

    return newBatch;
  };

  // Delete an entire WIP update batch
  const deleteWipUpdate = async (updateId) => {
    const idx = wipUpdates.value.findIndex(u => u.id === updateId || u.uuid === updateId);
    if (idx === -1) return;

    const target = wipUpdates.value[idx];
    const uuid = target.uuid || target.id;

    // Delete batch
    if (target.id) await db.wip_updates.delete(target.id);
    wipUpdates.value.splice(idx, 1);

    // Delete associated rolls
    await db.wip_rolls.where('updateId').equals(uuid).delete();
    wipRolls.value = wipRolls.value.filter(r => r.updateId !== uuid);

    // If the deleted batch was active, activate the next available batch
    if (target.isActive && wipUpdates.value.length > 0) {
      await setActiveUpdate(wipUpdates.value[0]);
    }
  };

  // Rename a WIP update batch
  const renameWipUpdate = async (updateId, newTitle) => {
    const update = wipUpdates.value.find(u => u.id === updateId || u.uuid === updateId);
    if (!update || !newTitle.trim()) return;

    update.title = newTitle.trim();
    update.updatedAt = new Date().toISOString();
    if (update.id) {
      await db.wip_updates.update(update.id, { title: update.title, updatedAt: update.updatedAt });
    }
  };

  // Add Single Roll to an update batch
  const addWipRoll = async (rollData, updateIdParam = null) => {
    const targetUpdateId = updateIdParam || selectedUpdateId.value || activeUpdate.value?.uuid || 'DEFAULT';
    const thick = String(rollData.thickness || '20').trim();
    const width = String(rollData.width || '1000').trim();
    const length = String(rollData.length || '6000').trim();
    const jenis = (rollData.jenis || 'VMCPP').trim().toUpperCase();
    const kodeFormula = (rollData.kodeFormula || rollData.formula || 'M01').trim().toUpperCase();
    const core = String(rollData.core || '6').trim();
    const od = (rollData.od || '').trim();
    const tanda = (rollData.tanda || '').trim();

    const beratTeori = calculateBeratTeori(thick, width, length, jenis);
    const rawBeratAktual = parseFloat(rollData.beratAktual);
    const beratAktual = !isNaN(rawBeratAktual) && rawBeratAktual > 0 ? rawBeratAktual : beratTeori;

    const descNav = generateDescNav(jenis, kodeFormula, thick, width);
    const descExcel = generateDescExcel(jenis, kodeFormula, thick, width, length, core, od, tanda);
    const tgl = rollData.tanggalInput || rollData.tanggalSpk || new Date().toISOString().slice(0, 10);

    const record = {
      uuid: rollData.uuid || generateUniqID('WIP'),
      updateId: targetUpdateId,
      tanggalInput: tgl,
      tanggalSpk: tgl,
      spk: (rollData.spk || '').trim().toUpperCase(),
      lot: (rollData.lot || rollData.noLot || '').trim().toUpperCase(),
      jenis,
      kodeFormula,
      thickness: thick,
      width,
      length,
      core,
      od,
      tanda,
      beratTeori,
      beratAktual,
      lokasiAktif: (rollData.lokasiAktif || rollData.lokasi || 'STAGING').trim().toUpperCase(),
      posisiAktif: (rollData.posisiAktif || rollData.posisi || 'R-1').trim().toUpperCase(),
      descriptionNav: descNav,
      descriptionExcel: descExcel,
      keterangan: (rollData.keterangan || '').trim(),
      status: rollData.status || 'AVAILABLE',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const id = await db.wip_rolls.add(record);
    record.id = id;
    wipRolls.value.unshift(record);

    // Update batch totals
    const batch = wipUpdates.value.find(u => u.uuid === targetUpdateId || u.id === targetUpdateId);
    if (batch) {
      batch.totalRolls = (batch.totalRolls || 0) + 1;
      batch.totalKg = Number(((batch.totalKg || 0) + beratAktual).toFixed(2));
      if (batch.id) await db.wip_updates.update(batch.id, { totalRolls: batch.totalRolls, totalKg: batch.totalKg });
    }

    return record;
  };

  // Update a single WIP roll
  const updateWipRoll = async (id, updatedFields) => {
    const fields = {
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    await db.wip_rolls.update(id, fields);
    const idx = wipRolls.value.findIndex(r => r.id === id);
    if (idx !== -1) {
      wipRolls.value[idx] = { ...wipRolls.value[idx], ...fields };
    }
  };

  // Delete a single roll
  const deleteWipRoll = async (id) => {
    const roll = wipRolls.value.find(r => r.id === id);
    await db.wip_rolls.delete(id);
    wipRolls.value = wipRolls.value.filter(r => r.id !== id);

    if (roll && roll.updateId) {
      const batch = wipUpdates.value.find(u => u.uuid === roll.updateId || u.id === roll.updateId);
      if (batch) {
        batch.totalRolls = Math.max(0, (batch.totalRolls || 1) - 1);
        batch.totalKg = Number(Math.max(0, (batch.totalKg || 0) - (parseFloat(roll.beratAktual) || 0)).toFixed(2));
        if (batch.id) await db.wip_updates.update(batch.id, { totalRolls: batch.totalRolls, totalKg: batch.totalKg });
      }
    }
  };

  // Clear all data
  const clearAllWipRolls = async () => {
    await db.wip_updates.clear();
    await db.wip_rolls.clear();
    wipUpdates.value = [];
    wipRolls.value = [];
    selectedUpdateId.value = null;
  };

  return {
    wipUpdates,
    wipRolls,
    activeUpdate,
    activeWipRolls,
    selectedUpdateId,
    isLoading,
    calculateBeratTeori,
    generateDescNav,
    generateDescExcel,
    loadWipRolls,
    setActiveUpdate,
    createWipUpdate,
    deleteWipUpdate,
    renameWipUpdate,
    addWipRoll,
    updateWipRoll,
    deleteWipRoll,
    clearAllWipRolls
  };
});
