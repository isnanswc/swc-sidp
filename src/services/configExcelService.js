import * as XLSX from 'xlsx';
import { db } from '@/db';
import { getDefaultFilmAlias } from '@/stores/configStore';

/**
 * Service untuk Export & Import Excel Master Data Configuration
 * Mendukung Multi-Sheet Workbook (Seluruh Konfigurasi) maupun Single Sheet (Per Tab).
 * Mengatur lebar kolom otomatis agar tabel rapi dan informatif.
 */

// Mapping konfigurasi sheet (8 Master Sheets Data Configuration)
export const CONFIG_SHEET_DEFS = {
  film: {
    id: 'film',
    sheetName: 'Formula_Film',
    title: 'Konfigurasi Formula Film',
    stateKey: 'filmConfigs',
    tableName: 'film_configs',
    columns: [
      { key: 'jenis', header: 'Jenis Film', width: 14 },
      { key: 'kodeFormula', header: 'Kode Formula', width: 16 },
      { key: 'alias', header: 'Alias', width: 16 },
      { key: 'tipeBahan', header: 'Tipe Bahan', width: 14 },
      { key: 'jenisBahan', header: 'Jenis Bahan', width: 16 },
      { key: 'kategoriFilm', header: 'Kategori Film', width: 16 },
      { key: 'density', header: 'Density', width: 12 },
      { key: 'keterangan', header: 'Keterangan', width: 30 },
      { key: 'supplier', header: 'Supplier', width: 18 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  location: {
    id: 'location',
    sheetName: 'Lokasi_Rak',
    title: 'Master Lokasi & Denah Rak',
    stateKey: 'locationList',
    tableName: 'location_list',
    columns: [
      { key: 'nama', header: 'Nama Lokasi Rak', width: 20 },
      { key: 'jenis', header: 'Jenis Peruntukan', width: 18 },
      { key: 'alias', header: 'Alias / Shorthand', width: 35 },
      { key: 'kapasitas', header: 'Kapasitas (Roll)', width: 16 },
      { key: 'keterangan', header: 'Keterangan Lokasi', width: 35 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  mesin: {
    id: 'mesin',
    sheetName: 'Mesin_PraCodePack',
    title: 'Master Mesin & Pra-CodePack',
    stateKey: 'mesinList',
    tableName: 'mesin_list',
    columns: [
      { key: 'nama', header: 'Nama Mesin', width: 20 },
      { key: 'praKodePack', header: 'Pra-CodePack (Prefix)', width: 22 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  operator: {
    id: 'operator',
    sheetName: 'Operator',
    title: 'Master Operator Produksi',
    stateKey: 'operatorList',
    tableName: 'operator_list',
    columns: [
      { key: 'nama', header: 'Nama Operator', width: 20 },
      { key: 'mesin', header: 'Mesin Penugasan', width: 18 },
      { key: 'kodeGrup', header: 'Kode Grup', width: 14 },
      { key: 'kodeOperator', header: 'Kode Operator', width: 16 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  jenis: {
    id: 'jenis',
    sheetName: 'Jenis_Film',
    title: 'Master Jenis Film',
    stateKey: 'jenisList',
    tableName: 'jenis_list',
    columns: [
      { key: 'nama', header: 'Nama Jenis Film', width: 20 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  jenisBahan: {
    id: 'jenisBahan',
    sheetName: 'Jenis_Bahan',
    title: 'Master Jenis Bahan',
    stateKey: 'jenisBahanList',
    tableName: 'jenis_bahan_list',
    columns: [
      { key: 'nama', header: 'Nama Jenis Bahan', width: 22 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  tipeBahan: {
    id: 'tipeBahan',
    sheetName: 'Tipe_Bahan',
    title: 'Master Tipe Bahan',
    stateKey: 'tipeBahanList',
    tableName: 'tipe_bahan_list',
    columns: [
      { key: 'nama', header: 'Nama Tipe Bahan', width: 20 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  kategori: {
    id: 'kategori',
    sheetName: 'Kategori_Film',
    title: 'Master Kategori Film',
    stateKey: 'kategoriFilmList',
    tableName: 'kategori_film_list',
    columns: [
      { key: 'nama', header: 'Nama Kategori Film', width: 22 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  panjangStandard: {
    id: 'panjangStandard',
    sheetName: 'Panjang_Standard',
    title: 'Master Panjang Standard Roll (FG & Jumbo)',
    stateKey: 'standardLengthList',
    tableName: 'standard_lengths',
    columns: [
      { key: 'thickness', header: 'Thickness', width: 14 },
      { key: 'maxPanjangFg', header: 'Max Panjang FG', width: 18 },
      { key: 'maxPanjangJumbo', header: 'Max Panjang Jumbo', width: 20 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  resinItems: {
    id: 'resinItems',
    sheetName: 'Item_Resin',
    title: 'Master Item Resin',
    stateKey: 'resinItemList',
    tableName: 'resin_items',
    columns: [
      { key: 'resin', header: 'RESIN', width: 22 },
      { key: 'kode', header: 'KODE', width: 14 },
      { key: 'nomorItem', header: 'NOMOR ITEM', width: 20 },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  },
  bomFormulas: {
    id: 'bomFormulas',
    sheetName: 'BOM_Formula',
    title: 'Master BOM Formula Film (Bill of Materials)',
    stateKey: 'bomFormulaList',
    tableName: 'bom_formulas',
    columns: [
      { key: 'formula', header: 'FORMULA', width: 14 },
      { key: 'rm', header: 'RM', width: 22 },
      { key: 'persen', header: 'PERSEN', width: 14, format: v => (parseFloat(v) || 0).toFixed(2).replace('.', ',') + '%' },
      { key: 'active', header: 'Status Aktif', width: 14, format: v => v !== false ? 'Aktif' : 'Non-aktif' }
    ]
  }
};

/**
 * Kalkulasi lebar kolom otomatis berdasarkan panjang isi data & header
 */
function calculateAutoFitCols(exportRows, colsDef) {
  return colsDef.map(col => {
    let maxLen = col.header.length;
    exportRows.forEach(row => {
      const val = row[col.header] !== null && row[col.header] !== undefined ? String(row[col.header]) : '';
      if (val.length > maxLen) maxLen = val.length;
    });
    // Berikan padding + 4 karakter dan batas min-max
    return { wch: Math.min(65, Math.max(col.width || 12, maxLen + 4)) };
  });
}

/**
 * Buat Sheet Object dari Data Config dengan Format Tabel Excel AutoFilter
 */
function createConfigWorksheet(dataList, def) {
  const exportRows = (dataList || []).map((row, idx) => {
    const obj = { '#': idx + 1 };
    def.columns.forEach(col => {
      const rawVal = row[col.key];
      obj[col.header] = col.format ? col.format(rawVal, row) : (rawVal ?? '');
    });
    return obj;
  });

  const wsData = exportRows.length > 0 
    ? exportRows 
    : [{ '#': 1, ...def.columns.reduce((a, c) => ({ ...a, [c.header]: '' }), {}) }];

  const ws = XLSX.utils.json_to_sheet(wsData);
  
  // Set Auto-fit columns
  const allColsDef = [{ header: '#', width: 6 }, ...def.columns];
  ws['!cols'] = calculateAutoFitCols(exportRows, allColsDef);

  // Set Excel Table AutoFilter (Setara Ctrl+T Filter Dropdown di Excel)
  if (ws['!ref']) {
    ws['!autofilter'] = { ref: ws['!ref'] };
  }

  return ws;
}

/**
 * 1. EXPORT SELURUH MASTER DATA KE 1 WORKBOOK DENGAN SHEET TERPISAH
 */
export function exportAllConfigsToExcel(configStore) {
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);

  Object.values(CONFIG_SHEET_DEFS).forEach(def => {
    const rawData = configStore[def.stateKey] || [];
    const ws = createConfigWorksheet(rawData, def);
    XLSX.utils.book_append_sheet(wb, ws, def.sheetName);
  });

  const fileName = `Data_Configuration_Master_Full_${dateStr}.xlsx`;
  XLSX.writeFile(wb, fileName);
}

/**
 * 2. EXPORT SINGLE TAB DATA CONFIGURATION
 */
export function exportSingleConfigToExcel(configStore, tabId) {
  const def = CONFIG_SHEET_DEFS[tabId] || CONFIG_SHEET_DEFS.film;
  const wb = XLSX.utils.book_new();
  const dateStr = new Date().toISOString().slice(0, 10);

  const rawData = configStore[def.stateKey] || [];
  const ws = createConfigWorksheet(rawData, def);
  XLSX.utils.book_append_sheet(wb, ws, def.sheetName);

}

/**
 * 3. DOWNLOAD TEMPLATE EXCEL KOSONG SIAP ISI (DENGAN 1 BARIS CONTOH FORMAT)
 */
export function downloadConfigExcelTemplate(specificSheetKey = null) {
  const wb = XLSX.utils.book_new();

  const sampleRows = {
    film: [
      {
        jenis: 'CPP',
        kodeFormula: 'L01',
        alias: 'TPTGS',
        tipeBahan: 'LG',
        jenisBahan: 'Transparent',
        kategoriFilm: 'POLOS',
        density: 0.91,
        keterangan: 'Standard CPP Film Polos',
        supplier: 'INTERNAL',
        active: true
      }
    ],
    bomFormulas: [
      {
        formula: 'L01',
        rm: 'F600F',
        persen: 76.70,
        active: true
      },
      {
        formula: 'L01',
        rm: 'FL-7632-L',
        persen: 22.02,
        active: true
      }
    ],
    resinItems: [
      {
        resin: 'F600F',
        kode: 'HM01',
        nomorItem: '1140102000001',
        active: true
      },
      {
        resin: 'FL-7632-L',
        kode: 'CC01',
        nomorItem: '1140201000001',
        active: true
      }
    ],
    mesin: [
      {
        nama: 'CASTING 1',
        praKodePack: 'C1',
        active: true
      },
      {
        nama: 'REWIND 1',
        praKodePack: 'R1',
        active: true
      }
    ],
    operator: [
      {
        nama: 'UMAR',
        kodeOperator: 'UMR',
        mesin: 'CASTING 1',
        kodeGrup: 'GRUP A',
        active: true
      }
    ],
    location: [
      {
        nama: 'RAK A1A2',
        jenis: 'WIP Jumbo Roll',
        alias: 'A1, A2',
        kapasitas: 12,
        keterangan: 'Rak Jumbo Blok A',
        active: true
      }
    ],
    panjangStandard: [
      {
        thickness: 20,
        maxPanjangFg: 12000,
        maxPanjangJumbo: 36300,
        active: true
      }
    ],
    jenis: [{ nama: 'CPP', active: true }, { nama: 'VMCPP', active: true }],
    jenisBahan: [{ nama: 'Transparent', active: true }, { nama: 'Matte', active: true }],
    tipeBahan: [{ nama: 'LG', active: true }, { nama: 'MG', active: true }],
    kategori: [{ nama: 'POLOS', active: true }, { nama: 'METAL', active: true }],
  };

  const targetDefs = specificSheetKey && CONFIG_SHEET_DEFS[specificSheetKey]
    ? [CONFIG_SHEET_DEFS[specificSheetKey]]
    : Object.values(CONFIG_SHEET_DEFS);

  targetDefs.forEach(def => {
    const sample = sampleRows[def.id] || [];
    const ws = createConfigWorksheet(sample, def);
    XLSX.utils.book_append_sheet(wb, ws, def.sheetName);
  });

  const fileName = specificSheetKey && CONFIG_SHEET_DEFS[specificSheetKey]
    ? `Template_Import_${CONFIG_SHEET_DEFS[specificSheetKey].sheetName}.xlsx`
    : `Template_Import_Data_Configuration_Master.xlsx`;

  XLSX.writeFile(wb, fileName);
}

/**
 * 4. BACA DAN PARSE FILE EXCEL IMPORT
 * Mengembalikan ringkasan sheet dan baris yang ditemukan
 */
export async function parseImportConfigFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        
        const result = {
          fileName: file.name,
          sheets: []
        };

        wb.SheetNames.forEach(sName => {
          const ws = wb.Sheets[sName];
          const rawJson = XLSX.utils.sheet_to_json(ws, { defval: '' });
          
          // Cocokkan sheetName ke konfigurasi standar
          const matchedDef = Object.values(CONFIG_SHEET_DEFS).find(
            d => d.sheetName.toUpperCase() === sName.trim().toUpperCase() ||
                 sName.trim().toUpperCase().includes(d.sheetName.toUpperCase()) ||
                 sName.trim().toUpperCase().includes(d.id.toUpperCase())
          );

          result.sheets.push({
            sheetName: sName,
            matchedDef: matchedDef || null,
            def: matchedDef || null,
            rowCount: rawJson.length,
            rows: rawJson
          });
        });

        resolve(result);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * 4. TERAPKAN DATA IMPORT KE DEXIE DB & REFRESH CONFIG STORE
 */
export async function applyImportConfigToDb(param1, param2, param3, param4) {
  let def, rows, mode = 'upsert', configStore;
  if (param1 && param1.tableName) {
    def = param1;
    rows = Array.isArray(param2) ? param2 : (param2?.rows || []);
    mode = typeof param3 === 'string' ? param3 : 'upsert';
    configStore = param4;
  } else {
    const sheetObj = param1 || {};
    rows = Array.isArray(sheetObj.rows) ? sheetObj.rows : (Array.isArray(sheetObj) ? sheetObj : []);
    def = param2 || sheetObj.def || sheetObj.matchedDef;
    configStore = param3;
    mode = typeof param4 === 'string' ? param4 : 'upsert';
  }

  const now = new Date().toISOString();
  if (!def || !def.tableName || !rows || rows.length === 0) return { addedCount: 0, updatedCount: 0 };

  const table = db[def.tableName];
  if (!table) return { addedCount: 0, updatedCount: 0 };

  // Jika mode replace, bersihkan data lama
  if (mode === 'replace') {
    await table.clear();
  }

  const existingItems = await table.toArray();
  let addedCount = 0;
  let updatedCount = 0;

  for (const rawRow of rows) {
    // Normalisasi baris berdasarkan headers
    const rowObj = {};
    Object.entries(rawRow).forEach(([h, val]) => {
      const col = def.columns.find(c => c.header.toUpperCase() === h.trim().toUpperCase() || c.key.toUpperCase() === h.trim().toUpperCase());
      if (col) {
        rowObj[col.key] = val;
      }
    });

    if (Object.keys(rowObj).length === 0) continue;

    // Bersihkan nilai spesifik per tabel
    if (def.id === 'film') {
      if (!rowObj.kodeFormula) continue;
      const jenisClean = String(rowObj.jenis || 'CPP').trim().toUpperCase();
      const kodeClean = String(rowObj.kodeFormula).trim().toUpperCase();
      const aliasClean = (rowObj.alias !== undefined && rowObj.alias !== null)
        ? String(rowObj.alias).trim().toUpperCase()
        : getDefaultFilmAlias(jenisClean, kodeClean);

      const clean = {
        jenis: jenisClean,
        kodeFormula: kodeClean,
        alias: aliasClean,
        tipeBahan: (rowObj.tipeBahan || '').trim(),
        jenisBahan: (rowObj.jenisBahan || '').trim(),
        kategoriFilm: (rowObj.kategoriFilm || '').trim(),
        density: parseFloat(rowObj.density) || (['PET', 'VMPET'].includes(jenisClean) ? 1.4 : 0.91),
        keterangan: (rowObj.keterangan || '').trim(),
        supplier: (rowObj.supplier || '').trim(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };

      const match = existingItems.find(e => e.kodeFormula.toUpperCase() === clean.kodeFormula && e.jenis.toUpperCase() === clean.jenis);
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }

      // Auto-sinkronisasi Tag Parameter ke tabel list masing-masing
      if (clean.jenis) {
        const jMatch = await db.jenis_list.where('nama').equalsIgnoreCase(clean.jenis).first();
        if (!jMatch) await db.jenis_list.add({ nama: clean.jenis, active: true, createdAt: now });
      }
      if (clean.jenisBahan) {
        const jbMatch = await db.jenis_bahan_list.where('nama').equalsIgnoreCase(clean.jenisBahan).first();
        if (!jbMatch) await db.jenis_bahan_list.add({ nama: clean.jenisBahan, active: true, createdAt: now });
      }
      if (clean.kategoriFilm) {
        const kfMatch = await db.kategori_film_list.where('nama').equalsIgnoreCase(clean.kategoriFilm).first();
        if (!kfMatch) await db.kategori_film_list.add({ nama: clean.kategoriFilm, active: true, createdAt: now });
      }
      if (clean.tipeBahan) {
        const tbMatch = await db.tipe_bahan_list.where('nama').equalsIgnoreCase(clean.tipeBahan).first();
        if (!tbMatch) await db.tipe_bahan_list.add({ nama: clean.tipeBahan, active: true, createdAt: now });
      }
    } else if (def.id === 'location') {
      if (!rowObj.nama) continue;
      const clean = {
        nama: String(rowObj.nama).trim().toUpperCase(),
        jenis: String(rowObj.jenis || 'WIP JUMBO').trim().toUpperCase(),
        alias: String(rowObj.alias || '').trim().toUpperCase(),
        kapasitas: parseInt(rowObj.kapasitas, 10) || 12,
        keterangan: (rowObj.keterangan || '').trim(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };

      const match = existingItems.find(e => e.nama.toUpperCase() === clean.nama);
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else if (def.id === 'mesin') {
      if (!rowObj.nama) continue;
      const clean = {
        nama: String(rowObj.nama).trim().toUpperCase(),
        praKodePack: String(rowObj.praKodePack || '').trim().toUpperCase(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };
      const match = existingItems.find(e => e.nama.toUpperCase() === clean.nama);
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else if (def.id === 'sign') {
      if (!rowObj.name) continue;
      const clean = {
        name: String(rowObj.name).trim(),
        triggerType: (rowObj.triggerType || 'JENIS_MESIN').trim(),
        triggerValue: (rowObj.triggerValue || '').trim(),
        badgeText: (rowObj.badgeText || '').trim(),
        textColor: (rowObj.textColor || '#ffffff').trim(),
        bgColor: (rowObj.bgColor || '#15803d').trim(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };
      const match = existingItems.find(e => e.name.toUpperCase() === clean.name.toUpperCase());
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else if (def.id === 'operator') {
      if (!rowObj.nama) continue;
      const clean = {
        nama: String(rowObj.nama).trim().toUpperCase(),
        mesin: String(rowObj.mesin || '').trim().toUpperCase(),
        kodeGrup: String(rowObj.kodeGrup || '').trim().toUpperCase(),
        kodeOperator: String(rowObj.kodeOperator || '').trim().toUpperCase(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };
      const match = existingItems.find(e => e.nama.toUpperCase() === clean.nama.toUpperCase() && e.mesin.toUpperCase() === clean.mesin.toUpperCase());
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else if (def.id === 'panjangStandard') {
      const thickVal = parseFloat(rowObj.thickness);
      if (isNaN(thickVal) || thickVal <= 0) continue;
      const clean = {
        thickness: thickVal,
        maxPanjangFg: parseFloat(rowObj.maxPanjangFg) || 0,
        maxPanjangJumbo: parseFloat(rowObj.maxPanjangJumbo) || 0,
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };
      const match = existingItems.find(e => parseFloat(e.thickness) === clean.thickness);
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else if (def.id === 'resinItems') {
      const rawResin = rowObj.resin || rowObj.RESIN || rowObj['Nama Resin'] || rowObj.Nama;
      if (!rawResin) continue;
      const clean = {
        resin: String(rawResin).trim().replace(/\s+/g, '-').toUpperCase(),
        kode: String(rowObj.kode || rowObj.KODE || rowObj['Kode'] || '').trim().toUpperCase(),
        nomorItem: String(rowObj.nomorItem || rowObj.NOMOR_ITEM || rowObj['NOMOR ITEM'] || rowObj['Nomor Item'] || '').trim(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };
      const match = existingItems.find(e => (e.resin || '').toUpperCase() === clean.resin);
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else if (def.id === 'bomFormulas') {
      const rawFormula = rowObj.formula || rowObj.FORMULA || rowObj['Kode Formula'] || rowObj.Formula;
      const rawRm = rowObj.rm || rowObj.RM || rowObj['Raw Material'] || rowObj.Resin || rowObj.RESIN || rowObj['Nama Resin'];
      if (!rawFormula || !rawRm) continue;

      let rawPersen = rowObj.persen || rowObj.PERSEN || rowObj.Persen || rowObj.Percentage || rowObj['%'] || 0;
      if (typeof rawPersen === 'string') {
        rawPersen = parseFloat(rawPersen.replace('%', '').replace(',', '.')) || 0;
      }

      const clean = {
        formula: String(rawFormula).trim().toUpperCase(),
        rm: String(rawRm).trim().replace(/\s+/g, '-').toUpperCase(),
        persen: Number(rawPersen) || 0,
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        updatedAt: now
      };

      const match = existingItems.find(e =>
        (e.formula || '').toUpperCase() === clean.formula &&
        (e.rm || '').toUpperCase() === clean.rm
      );
      if (match) {
        await table.update(match.id, clean);
        updatedCount++;
      } else {
        await table.add({ ...clean, createdAt: now });
        addedCount++;
      }
    } else {
      // Simple List: jenis, jenisBahan, tipeBahan, kategori
      if (!rowObj.nama) continue;
      const clean = {
        nama: String(rowObj.nama).trim().toUpperCase(),
        active: String(rowObj.active).toLowerCase() !== 'non-aktif' && rowObj.active !== false,
        createdAt: now
      };
      const match = existingItems.find(e => e.nama.toUpperCase() === clean.nama.toUpperCase());
      if (!match) {
        await table.add(clean);
        addedCount++;
      }
    }
  }

  // Reload config store
  await configStore.loadAll();
  return { addedCount, updatedCount };
}
