import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/db';

export function parseNumSafe(val, fallback = 0) {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'number') return isNaN(val) ? fallback : val;
  let str = String(val).trim();
  if (!str) return fallback;

  // Case 1: "1.500.000,50" -> Indonesian format with thousands dot and decimal comma
  if (str.includes('.') && str.includes(',')) {
    str = str.replace(/\./g, '').replace(/,/g, '.');
  } 
  // Case 2: "1,500,000.50" -> English format with thousands comma and decimal dot
  else if (str.includes(',') && str.includes('.')) {
    str = str.replace(/,/g, '');
  }
  // Case 3: Only comma, e.g. "0,91" or "232,96" or "1004,64" -> decimal comma
  else if (str.includes(',')) {
    str = str.replace(/,/g, '.');
  }
  // Case 4: Only dot, e.g. "1.500.000" (multiple dots) -> thousands separator
  else if ((str.match(/\./g) || []).length > 1) {
    str = str.replace(/\./g, '');
  }

  // Clean any non-numeric chars except dot and minus
  str = str.replace(/[^\d.-]/g, '');
  const num = parseFloat(str);
  return isNaN(num) ? fallback : num;
}

export function formatExcelDate(val) {
  if (!val) return '-';
  const str = String(val).trim();
  if (/^\d{5}$/.test(str)) {
    const serial = parseInt(str, 10);
    const ms = (serial - 25569) * 86400 * 1000;
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
  }
  return str;
}

export function cleanCell(str) {
  if (str === undefined || str === null) return '';
  let s = String(str).trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).trim();
  }
  return s;
}

/**
 * Parser Baris Data FG Roll 27 Kolom:
 * 1. Description Excel
 * 2. Description NAV
 * 3. Source No.
 * 4. Jenis
 * 5. Kode Formula
 * 6. Thickness
 * 7. Width
 * 8. Length
 * 9. Core
 * 10. OD
 * 11. Tanda
 * 12. Density
 * 13. Weight
 * 14. Keterangan
 * 15. Last Production
 * 16. Last Transfer
 * 17. Moving
 * 18. T. Panjang
 * 19. T. Berat
 * 20. T. Roll
 * 21. A
 * 22. B
 * 23. C
 * 24. D
 * 25. E
 * 26. Qty Rak
 * 27. List Rak
 */
export function parseFg27ColRow(rowArrayOrObject) {
  if (!rowArrayOrObject) return null;

  let cols = [];
  if (Array.isArray(rowArrayOrObject)) {
    cols = rowArrayOrObject.map(cleanCell);
    if (cols.length === 0 || cols.every(c => !c)) return null;

    // Check if header row
    const combined = cols.join(' ').toLowerCase();
    if (
      (combined.includes('description') && (combined.includes('nav') || combined.includes('excel') || combined.includes('source'))) ||
      (combined.includes('t. roll') && combined.includes('qty rak'))
    ) {
      return null;
    }

    // Strip leading row index (#) if present
    if (cols.length >= 28 && /^\d{1,4}$/.test(cols[0])) {
      cols = cols.slice(1);
    }
  } else if (typeof rowArrayOrObject === 'object') {
    const obj = rowArrayOrObject;
    const descExcel = cleanCell(obj['Description Excel'] || obj.descriptionExcel || obj['Nama Barang'] || '');
    const descNav = cleanCell(obj['Description NAV'] || obj.descriptionNav || descExcel);
    const sourceNo = cleanCell(obj['Source No.'] || obj['Source No'] || obj.sourceNo || obj['Item No.'] || '-');
    const jenis = cleanCell(obj['Jenis'] || obj.jenis || 'VMCPP').toUpperCase();
    const kodeFormula = cleanCell(obj['Kode Formula'] || obj.kodeFormula || 'M06').toUpperCase();
    const thickness = String(parseNumSafe(obj['Thickness'] || obj.thickness, 20));
    const width = String(parseNumSafe(obj['Width'] || obj.width, 1000));
    const length = String(parseNumSafe(obj['Length'] || obj.length, 6000));
    const core = String(cleanCell(obj['Core'] || obj.core || '6').replace(/\D/g, '') || '6');
    const od = cleanCell(obj['OD'] || obj.od || '0');
    const tanda = cleanCell(obj['Tanda'] || obj.tanda || '');
    const density = parseNumSafe(obj['Density'] || obj.density, ['PET', 'VMPET'].includes(jenis) ? 1.40 : 0.91);
    const weight = parseNumSafe(obj['Weight'] || obj.weight, 0);
    const totalRoll = Math.round(parseNumSafe(obj['T. Roll'] || obj.totalRoll || obj.TotalRoll || obj.qty, 0));
    const unitWeight = weight > 0 ? weight : parseFloat(((parseFloat(thickness) * parseFloat(width) * parseFloat(length) * density) / 1000000).toFixed(4));
    const totalPanjang = parseNumSafe(obj['T. Panjang'] || obj.totalPanjang, totalRoll * parseFloat(length));
    const totalKg = parseNumSafe(obj['T. Berat'] || obj.totalKg, parseFloat((totalRoll * unitWeight).toFixed(2)));

    return {
      descriptionExcel: descExcel,
      descriptionNav: descNav,
      sourceNo,
      jenis,
      kodeFormula,
      thickness,
      width,
      length,
      core,
      od,
      tanda,
      density,
      weight: unitWeight,
      keterangan: cleanCell(obj['Keterangan'] || obj.keterangan || ''),
      lastProduction: formatExcelDate(cleanCell(obj['Last Production'] || obj.lastProduction || '-')),
      lastTransfer: formatExcelDate(cleanCell(obj['Last Transfer'] || obj.lastTransfer || '-')),
      moving: cleanCell(obj['Moving'] || obj.moving || '-'),
      totalPanjang,
      totalKg,
      totalRoll,
      areaA: Math.round(parseNumSafe(obj['A'] || obj.areaA, 0)),
      areaB: Math.round(parseNumSafe(obj['B'] || obj.areaB, 0)),
      areaC: Math.round(parseNumSafe(obj['C'] || obj.areaC, 0)),
      areaD: Math.round(parseNumSafe(obj['D'] || obj.areaD, 0)),
      areaE: Math.round(parseNumSafe(obj['E'] || obj.areaE, 0)),
      qtyRak: Math.round(parseNumSafe(obj['Qty Rak'] || obj.qtyRak, 0)),
      listRak: cleanCell(obj['List Rak'] || obj.listRak || '')
    };
  }

  if (cols.length < 2) return null;

  // Map 27 columns from array
  const descExcel = cols[0] || '';
  const descNav = cols[1] || descExcel;
  const sourceNo = cols[2] || '-';
  const jenis = (cols[3] || 'VMCPP').toUpperCase();
  const kodeFormula = (cols[4] || 'M06').toUpperCase();
  const thickness = String(parseNumSafe(cols[5], 20));
  const width = String(parseNumSafe(cols[6], 1000));
  const length = String(parseNumSafe(cols[7], 6000));
  const core = String(cleanCell(cols[8] || '6').replace(/\D/g, '') || '6');
  const od = cols[9] || '0';
  const tanda = cols[10] || '';
  const density = parseNumSafe(cols[11], ['PET', 'VMPET'].includes(jenis) ? 1.40 : 0.91);
  const rawWeight = parseNumSafe(cols[12], 0);
  const unitWeight = rawWeight > 0 ? rawWeight : parseFloat(((parseFloat(thickness) * parseFloat(width) * parseFloat(length) * density) / 1000000).toFixed(4));
  const keterangan = cols[13] || '';
  const lastProduction = formatExcelDate(cols[14] || '-');
  const lastTransfer = formatExcelDate(cols[15] || '-');
  const moving = cols[16] || '-';
  const totalPanjang = parseNumSafe(cols[17], 0);
  const totalKg = parseNumSafe(cols[18], 0);
  const totalRoll = Math.round(parseNumSafe(cols[19], 0));
  const areaA = Math.round(parseNumSafe(cols[20], 0));
  const areaB = Math.round(parseNumSafe(cols[21], 0));
  const areaC = Math.round(parseNumSafe(cols[22], 0));
  const areaD = Math.round(parseNumSafe(cols[23], 0));
  const areaE = Math.round(parseNumSafe(cols[24], 0));
  const qtyRak = Math.round(parseNumSafe(cols[25], 0));
  const listRak = cols[26] || '';

  if (!descExcel && !descNav && totalRoll === 0) return null;

  return {
    descriptionExcel: descExcel,
    descriptionNav: descNav,
    sourceNo,
    jenis,
    kodeFormula,
    thickness,
    width,
    length,
    core,
    od,
    tanda,
    density,
    weight: unitWeight,
    keterangan,
    lastProduction,
    lastTransfer,
    moving,
    totalPanjang: totalPanjang > 0 ? totalPanjang : totalRoll * parseFloat(length),
    totalKg: totalKg > 0 ? totalKg : parseFloat((totalRoll * unitWeight).toFixed(2)),
    totalRoll,
    areaA,
    areaB,
    areaC,
    areaD,
    areaE,
    qtyRak,
    listRak
  };
}

export const useInventoryStore = defineStore('inventory', () => {
  const masterItems = ref([]);
  const stockUploads = ref([]);
  const currentStocks = ref([]);
  const isLoading = ref(false);
  const stockViewMode = ref('EXCEL');

  const activeUploadId = ref(localStorage.getItem('m_label_active_fg_upload_id') ? parseInt(localStorage.getItem('m_label_active_fg_upload_id'), 10) : null);

  const activeUpload = computed(() => {
    if (!stockUploads.value || stockUploads.value.length === 0) return null;
    if (activeUploadId.value) {
      const found = stockUploads.value.find(u => u.id === activeUploadId.value);
      if (found) return found;
    }
    return stockUploads.value[0];
  });

  const setActiveUpload = async (uploadId) => {
    activeUploadId.value = uploadId;
    localStorage.setItem('m_label_active_fg_upload_id', String(uploadId));
    
    const targetUpload = stockUploads.value.find(u => u.id === uploadId);
    if (targetUpload && targetUpload.itemsJson) {
      try {
        const items = JSON.parse(targetUpload.itemsJson);
        await db.inventory_current_stocks.clear();
        const records = items.map(row => ({
          itemKey: `KEY_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          descriptionExcel: row.descriptionExcel,
          descriptionNav: row.descriptionNav,
          sourceNo: row.sourceNo,
          jenis: row.jenis,
          kodeFormula: row.kodeFormula,
          thickness: row.thickness,
          width: row.width,
          length: row.length,
          core: row.core,
          od: row.od,
          tanda: row.tanda,
          density: row.density,
          weight: row.weight,
          keterangan: row.keterangan || '',
          lastProduction: row.lastProduction || '-',
          lastTransfer: row.lastTransfer || '-',
          moving: row.moving || '-',
          totalRoll: row.totalRoll,
          totalPanjang: row.totalPanjang,
          totalKg: row.totalKg,
          areaA: row.areaA || 0,
          areaB: row.areaB || 0,
          areaC: row.areaC || 0,
          areaD: row.areaD || 0,
          areaE: row.areaE || 0,
          qtyRak: row.qtyRak || 0,
          listRak: row.listRak || '',
          lastUploadDate: targetUpload.uploadDate,
          updatedAt: new Date().toISOString()
        }));
        await db.inventory_current_stocks.bulkAdd(records);
        currentStocks.value = await db.inventory_current_stocks.toArray();
      } catch (err) {
        console.error('Failed to set active FG upload:', err);
      }
    }
  };

  // Load All Inventory Data
  const loadInventory = async () => {
    isLoading.value = true;
    try {
      const [items, uploads, stocks] = await Promise.all([
        db.inventory_items ? db.inventory_items.toArray() : Promise.resolve([]),
        db.inventory_stock_uploads ? db.inventory_stock_uploads.toArray().then(a => a.reverse()) : Promise.resolve([]),
        db.inventory_current_stocks ? db.inventory_current_stocks.toArray() : Promise.resolve([])
      ]);

      masterItems.value = items || [];
      stockUploads.value = uploads || [];
      currentStocks.value = stocks || [];

      if (stockUploads.value.length > 0) {
        if (!activeUploadId.value || !stockUploads.value.some(u => u.id === activeUploadId.value)) {
          activeUploadId.value = stockUploads.value[0].id;
          localStorage.setItem('m_label_active_fg_upload_id', String(stockUploads.value[0].id));
        }
      }
    } catch (e) {
      console.error('Failed to load inventory data:', e);
    } finally {
      isLoading.value = false;
    }
  };

  // Helper to calculate theoretical kg per roll
  const calculateRollKg = (thick, width, length, jenis) => {
    const faktor = ['VMPET', 'PET'].includes(jenis) ? 1.4 : 0.91;
    const t = parseFloat(thick) || 0;
    const w = parseFloat(width) || 0;
    const l = parseFloat(length) || 0;
    if (!t || !w || !l) return 0;
    return parseFloat(((t * w * l * faktor) / 1000000).toFixed(2));
  };

  // ----------------------------------------------------
  // MASTER ITEM CRUD
  // ----------------------------------------------------
  const addMasterItem = async (item) => {
    const record = {
      descriptionExcel: item.descriptionExcel?.trim() || '',
      descriptionNav: item.descriptionNav?.trim() || '',
      sourceNo: item.sourceNo?.trim() || '',
      jenis: item.jenis?.trim() || 'VMCPP',
      kodeFormula: item.kodeFormula?.trim() || 'M06',
      thickness: String(item.thickness || '20').trim(),
      width: String(item.width || '1000').trim(),
      length: String(item.length || '6000').trim(),
      core: String(item.core || '6').trim(),
      od: item.od?.trim() || 'OD2.4+PLASMA',
      tanda: item.tanda?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const id = await db.inventory_items.add(record);
    record.id = id;
    masterItems.value.push(record);
    return record;
  };

  const updateMasterItem = async (id, updatedFields) => {
    const fields = {
      ...updatedFields,
      updatedAt: new Date().toISOString()
    };
    await db.inventory_items.update(id, fields);
    const idx = masterItems.value.findIndex(i => i.id === id);
    if (idx !== -1) {
      masterItems.value[idx] = { ...masterItems.value[idx], ...fields };
    }
  };

  const deleteMasterItem = async (id) => {
    await db.inventory_items.delete(id);
    masterItems.value = masterItems.value.filter(i => i.id !== id);
  };

  const importMasterItems = async (itemsList) => {
    if (!itemsList || itemsList.length === 0) return 0;

    const formatted = itemsList.map(item => ({
      descriptionExcel: item.descriptionExcel?.trim() || '',
      descriptionNav: item.descriptionNav?.trim() || '',
      sourceNo: item.sourceNo?.trim() || '',
      jenis: item.jenis?.trim() || 'VMCPP',
      kodeFormula: item.kodeFormula?.trim() || 'M06',
      thickness: String(item.thickness || '20').trim(),
      width: String(item.width || '1000').trim(),
      length: String(item.length || '6000').trim(),
      core: String(item.core || '6').trim(),
      od: item.od?.trim() || '',
      tanda: item.tanda?.trim() || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }));

    await db.inventory_items.bulkAdd(formatted);
    await loadInventory();
    return formatted.length;
  };

  // ----------------------------------------------------
  // STOCK UPLOADS & CURRENT STOCK ENGINE (27 COLUMNS)
  // ----------------------------------------------------
  const processStockUpload = async ({ uploadDate, fileName, uploadedBy, items }) => {
    if (!items || items.length === 0) return;

    const validDate = uploadDate || new Date().toISOString().slice(0, 10);
    const totalRoll = items.reduce((sum, item) => sum + (parseInt(item.totalRoll, 10) || 0), 0);

    const uploadRecord = {
      uploadDate: validDate,
      fileName: fileName || 'Upload_Stock.xlsx',
      totalSku: items.length,
      totalRoll,
      uploadedBy: uploadedBy || 'Admin Inventory',
      itemsJson: JSON.stringify(items),
      createdAt: new Date().toISOString()
    };

    const uploadId = await db.inventory_stock_uploads.add(uploadRecord);
    uploadRecord.id = uploadId;
    stockUploads.value.unshift(uploadRecord);

    // Update / Upsert Current Stocks with all 27 fields
    for (const row of items) {
      const descExcel = row.descriptionExcel?.trim() || '';
      const rollCount = parseInt(row.totalRoll, 10) || 0;

      // Find matching master item or auto-register
      let master = masterItems.value.find(m => 
        m.descriptionExcel?.toLowerCase().trim() === descExcel.toLowerCase() ||
        m.descriptionNav?.toLowerCase().trim() === descExcel.toLowerCase()
      );

      const descNav = row.descriptionNav?.trim() || (master ? master.descriptionNav : descExcel);
      const sourceNo = row.sourceNo && row.sourceNo !== '-' ? row.sourceNo : (master ? master.sourceNo : '-');
      const jenis = row.jenis || (master ? master.jenis : 'VMCPP');
      const kodeFormula = row.kodeFormula || (master ? master.kodeFormula : 'M06');
      const thick = row.thickness || (master ? master.thickness : 20);
      const width = row.width || (master ? master.width : 1000);
      const length = row.length || (master ? master.length : 6000);
      const core = row.core || (master ? master.core : 6);
      const od = row.od !== undefined ? row.od : (master ? master.od : '0');
      const tanda = row.tanda !== undefined ? row.tanda : (master ? master.tanda : '');
      const density = row.density || (['PET', 'VMPET'].includes(jenis) ? 1.40 : 0.91);
      const unitWeight = row.weight > 0 ? row.weight : calculateRollKg(thick, width, length, jenis);
      const totalKg = row.totalKg > 0 ? row.totalKg : parseFloat((rollCount * unitWeight).toFixed(2));
      const totalPanjang = row.totalPanjang > 0 ? row.totalPanjang : (rollCount * (parseFloat(length) || 0));

      const stockPayload = {
        descriptionExcel: descExcel,
        descriptionNav: descNav,
        sourceNo,
        jenis,
        kodeFormula,
        thickness: thick,
        width,
        length,
        core,
        od,
        tanda,
        density,
        weight: unitWeight,
        keterangan: row.keterangan || '',
        lastProduction: row.lastProduction || '-',
        lastTransfer: row.lastTransfer || '-',
        moving: row.moving || '-',
        totalRoll: rollCount,
        totalPanjang,
        totalKg,
        areaA: row.areaA || 0,
        areaB: row.areaB || 0,
        areaC: row.areaC || 0,
        areaD: row.areaD || 0,
        areaE: row.areaE || 0,
        qtyRak: row.qtyRak || 0,
        listRak: row.listRak || '',
        lastUploadDate: validDate,
        updatedAt: new Date().toISOString()
      };

      const existingStock = await db.inventory_current_stocks.where('descriptionExcel').equals(descExcel).first();

      if (existingStock) {
        await db.inventory_current_stocks.update(existingStock.id, stockPayload);
      } else {
        await db.inventory_current_stocks.add({
          itemKey: `KEY_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          ...stockPayload
        });
      }
    }

    currentStocks.value = await db.inventory_current_stocks.toArray();
    await setActiveUpload(uploadId);
    return uploadRecord;
  };

  const deleteUploadRecord = async (uploadId) => {
    await db.inventory_stock_uploads.delete(uploadId);
    stockUploads.value = stockUploads.value.filter(u => u.id !== uploadId);
    if (activeUploadId.value === uploadId) {
      if (stockUploads.value.length > 0) {
        await setActiveUpload(stockUploads.value[0].id);
      } else {
        activeUploadId.value = null;
        localStorage.removeItem('m_label_active_fg_upload_id');
        await db.inventory_current_stocks.clear();
        currentStocks.value = [];
      }
    }
  };

  // ----------------------------------------------------
  // COMPUTED KPI & TOTALS
  // ----------------------------------------------------
  const totalMasterSku = computed(() => (masterItems.value || []).length);
  
  const totalStockRolls = computed(() => {
    return (currentStocks.value || []).reduce((sum, s) => sum + (parseInt(s?.totalRoll, 10) || 0), 0);
  });

  const totalStockKg = computed(() => {
    return (currentStocks.value || []).reduce((sum, s) => sum + (parseFloat(s?.totalKg) || 0), 0);
  });

  const totalStockPanjang = computed(() => {
    const list = currentStocks.value || [];
    if (list.length === 0) return 0;

    const masterMap = new Map();
    for (const m of (masterItems.value || [])) {
      if (m?.descriptionExcel) {
        masterMap.set(String(m.descriptionExcel).toLowerCase().trim(), parseFloat(m.length) || 0);
      }
    }

    return list.reduce((sum, s) => {
      if (!s) return sum;
      if (s.totalPanjang !== undefined && s.totalPanjang !== null && !isNaN(parseFloat(s.totalPanjang))) {
        return sum + (parseFloat(s.totalPanjang) || 0);
      }
      const desc = String(s.descriptionExcel || '').toLowerCase().trim();
      const l = masterMap.get(desc) || parseFloat(s.length) || 0;
      return sum + ((parseInt(s.totalRoll, 10) || 0) * l);
    }, 0);
  });

  const lastUploadDate = computed(() => {
    if (!stockUploads.value || stockUploads.value.length === 0) return '-';
    return stockUploads.value[0]?.uploadDate || '-';
  });

  return {
    masterItems,
    stockUploads,
    currentStocks,
    isLoading,
    stockViewMode,
    activeUploadId,
    activeUpload,
    setActiveUpload,
    totalMasterSku,
    totalStockRolls,
    totalStockKg,
    totalStockPanjang,
    lastUploadDate,
    loadInventory,
    addMasterItem,
    updateMasterItem,
    deleteMasterItem,
    importMasterItems,
    processStockUpload,
    deleteUploadRecord,
    calculateRollKg
  };
});
