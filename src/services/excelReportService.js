import * as XLSX from 'xlsx';

/**
 * Service untuk mengkonversi dan mengekspor data verifikasi ke file Excel multi-sheet (.xlsx).
 * Mendukung ekspor 1 shift tunggal maupun Multi-Shift (seluruh shift dalam 1 file Excel).
 */


export const ROMAN_MONTHS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/**
 * Standardisasi nomor SPK khusus standar INHOUSE PT. Saptawarna Cemerlang
 * Pola Baku: [Urutan 2-digit]/[Bulan Romawi]/SPK/[Tahun 4-digit] (e.g. 01/VIII/SPK/2026)
 */
export function standardizeSpkInhouse(rawSpk, fallbackDate) {
  if (!rawSpk && !fallbackDate) return '';
  let str = String(rawSpk || '').trim().toUpperCase();
  str = str.replace(/\s*\/\s*/g, '/');

  if (str.includes('/')) {
    const parts = str.split('/');
    if (parts.length >= 4) {
      const seg0 = parts[0].replace(/\D/g, '') || parts[0];
      const seg1 = parts[1].trim();
      const seg3 = parts[3].trim();

      const num0 = parseInt(seg0, 10);
      const seq = !isNaN(num0) ? String(num0).padStart(2, '0') : seg0;

      let roman = seg1;
      const numMonth = parseInt(seg1, 10);
      if (!isNaN(numMonth) && numMonth >= 1 && numMonth <= 12) {
        roman = ROMAN_MONTHS[numMonth];
      }

      const year = seg3.length === 2 ? `20${seg3}` : seg3;
      return `${seq}/${roman}/SPK/${year}`;
    } else if (parts.length === 3) {
      const seg0 = parts[0].replace(/\D/g, '') || parts[0];
      const seg1 = parts[1].trim();
      const seg2 = parts[2].trim();

      const num0 = parseInt(seg0, 10);
      const seq = !isNaN(num0) ? String(num0).padStart(2, '0') : seg0;

      let roman = seg1;
      const numMonth = parseInt(seg1, 10);
      if (!isNaN(numMonth) && numMonth >= 1 && numMonth <= 12) {
        roman = ROMAN_MONTHS[numMonth];
      }

      const year = seg2.length === 2 ? `20${seg2}` : seg2;
      return `${seq}/${roman}/SPK/${year}`;
    }
  }

  const rawNum = parseInt(str.replace(/\D/g, ''), 10);
  if (!isNaN(rawNum) && rawNum > 0) {
    const seq = String(rawNum).padStart(2, '0');
    const d = fallbackDate ? new Date(fallbackDate) : new Date();
    const validD = isNaN(d.getTime()) ? new Date() : d;
    const roman = ROMAN_MONTHS[validD.getMonth() + 1] || 'VIII';
    const year = validD.getFullYear();
    return `${seq}/${roman}/SPK/${year}`;
  }

  return str;
}

/**
 * Format 29 Kolom Roll Output
 */
function formatRollRow(row, defaultHeader = {}) {
  let timeMinutes = row.time_menit;
  if (!timeMinutes && row.start_time && row.finish_time) {
    timeMinutes = calculateDurationMinutes(row.start_time, row.finish_time);
  }

  return {
    'Tanggal': convertDateToNumericExcel(row.tanggal || defaultHeader.tanggal || ''),
    'Group/Shift': row.group_shift || defaultHeader.shift_group || '',
    'Start Time': row.start_time || '',
    'Finish Time': row.finish_time || '',
    'Time': Number(timeMinutes) || '',
    'Downtime': (row.downtime !== '' && row.downtime !== undefined && row.downtime !== null) ? Number(row.downtime) : '', // Angka murni
    'Keterangan DT': row.downtime_ket || '',
    'No Batch': '', // Sesuai aturan: kosongkan
    'No.SPK': standardizeSpkInhouse(row.spk_no || defaultHeader.spk_no || '', row.tanggal || defaultHeader.tanggal),
    'No Lot': row.no_lot || '',
    'Jenis': row.jenis || 'CPP',
    'Kode Formula': row.kode_formula || '',
    'Thickness': Number(row.thickness) || '',
    'Width': Number(row.width) || '',
    'Length': Number(row.length) || '',
    'Berat Aktual': Number(row.berat_aktual) || '',
    'Berat Teori': Number(row.berat_teori) || '',
    'Berat Selisih': Number(row.berat_selisih) || '',
    'Tanda': row.tanda || '',
    'No Pack': row.no_pack || '',
    'Sample QC': Number(row.sample_qc) > 0 ? Number(row.sample_qc) : '',
    'Start Up': Number(row.start_up) > 0 ? Number(row.start_up) : '',
    'Transisi': Number(row.transisi) > 0 ? Number(row.transisi) : '',
    'Bekuan': Number(row.bekuan) > 0 ? Number(row.bekuan) : '',
    'Sesetan': Number(row.sesetan) > 0 ? Number(row.sesetan) : '',
    'Quality Status': (row.quality_status && row.quality_status !== 'PASS') ? row.quality_status : '', // Kosong jika PASS
    'Keterangan Hasil': row.keterangan_hasil || '',
    'Lokasi Jumbo': row.lokasi_jumbo || '',
    'Posisi Jumbo': row.posisi_jumbo || ''
  };
}

/**
 * Format 7 Kolom Pemakaian Resin
 */
function formatResinRow(res, defaultHeader = {}) {
  return {
    'Tanggal': convertDateToNumericExcel(res.tanggal || defaultHeader.tanggal || ''),
    'No Urut': res.no_urut || '',
    'Tujuan': res.tujuan || 'BAHAN',
    'Keterangan': res.keterangan || '',
    'Nama Resin': res.nama_resin || '',
    'Weight (kg)': Number(res.pemakaian_kg) || '',
    'Grup Shift Manual': res.group_shift || defaultHeader.shift_group || ''
  };
}

// Auto-width lebar kolom standar
const COLS_WIDTH_29 = [
  { wch: 16 }, { wch: 12 }, { wch: 11 }, { wch: 11 }, { wch: 8 },
  { wch: 10 }, { wch: 25 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
  { wch: 8 },  { wch: 14 }, { wch: 11 }, { wch: 10 }, { wch: 10 },
  { wch: 13 }, { wch: 13 }, { wch: 13 }, { wch: 8 },  { wch: 10 },
  { wch: 11 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 },
  { wch: 14 }, { wch: 22 }, { wch: 14 }, { wch: 14 }
];

const COLS_WIDTH_7 = [
  { wch: 16 }, { wch: 9 }, { wch: 10 }, { wch: 18 }, { wch: 22 }, { wch: 12 }, { wch: 18 }
];

/**
 * Ekspor 1 Shift Spesifik ke Excel (.xlsx)
 */
export function exportCastingReportToExcel(headerData, rollsData, resinData) {
  const tglFormatted = (headerData.tanggal || 'Laporan_Casting').replace(/[\s\/]/g, '_');
  const shiftName = (headerData.shift_name || headerData.shift_group || 'Shift').replace(/[\s\/]/g, '_');
  const fileName = `Laporan_Casting_${shiftName}_${tglFormatted}.xlsx`;

  const sheet1Data = rollsData.map(r => formatRollRow(r, headerData));
  const sheet2Data = resinData.map(r => formatResinRow(r, headerData));

  // Data Sheet 3: Material Balance Summary
  const totalResin = resinData.reduce((acc, r) => acc + (parseFloat(r.pemakaian_kg) || 0), 0);
  const totalRolls = rollsData.reduce((acc, r) => acc + (parseFloat(r.berat_aktual) || 0), 0);
  const totalWaste = rollsData.reduce((acc, r) => acc + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.bekuan) || 0), 0);
  const diff = Number((totalRolls + totalWaste - totalResin).toFixed(2));

  const sheet3Data = [
    { 'Kategori': '1. Total Bahan Masuk (Resin)', 'Jumlah (kg)': totalResin },
    { 'Kategori': '2. Total Output Roll Jumbo', 'Jumlah (kg)': totalRolls },
    { 'Kategori': '3. Total Waste Produksi', 'Jumlah (kg)': totalWaste },
    { 'Kategori': '4. Total Output + Waste', 'Jumlah (kg)': totalRolls + totalWaste },
    { 'Kategori': '5. Selisih Neraca (Material Balance)', 'Jumlah (kg)': diff },
    { 'Kategori': '6. Status Neraca', 'Jumlah (kg)': diff === 0 ? 'SEIMBANG (100% PAS)' : (diff > 0 ? 'LEBIH' : 'SUSUT') }
  ];

  
function formatWorksheetDateCells(ws) {
  if (!ws || !ws['!ref']) return;
  const range = XLSX.utils.decode_range(ws['!ref']);
  for (let R = range.s.r + 1; R <= range.e.r; ++R) {
    const cellRef = XLSX.utils.encode_cell({ c: 0, r: R }); // Column A: Tanggal
    const cell = ws[cellRef];
    if (cell && typeof cell.v === 'number') {
      cell.t = 'n';
      cell.z = 'yyyy-mm-dd';
    }
  }
}

  const wb = XLSX.utils.book_new();

  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
  const ws3 = XLSX.utils.json_to_sheet(sheet3Data);

  ws1['!cols'] = COLS_WIDTH_29;
  ws2['!cols'] = COLS_WIDTH_7;
  ws3['!cols'] = [{ wch: 35 }, { wch: 25 }];

  formatWorksheetDateCells(ws1);
  formatWorksheetDateCells(ws2);
  XLSX.utils.book_append_sheet(wb, ws1, 'Laporan Produksi Roll');
  XLSX.utils.book_append_sheet(wb, ws2, 'Pemakaian Resin');
  XLSX.utils.book_append_sheet(wb, ws3, 'Material Balance');

  XLSX.writeFile(wb, fileName);
}

export const INDONESIAN_MONTHS = {
  'januari': '01', 'jan': '01',
  'februari': '02', 'feb': '02',
  'maret': '03', 'mar': '03',
  'april': '04', 'apr': '04',
  'mei': '05', 'may': '05',
  'juni': '06', 'jun': '06',
  'juli': '07', 'jul': '07',
  'agustus': '08', 'ags': '08', 'agt': '08',
  'september': '09', 'sep': '09',
  'oktober': '10', 'okt': '10', 'oct': '10',
  'november': '11', 'nov': '11',
  'desember': '12', 'des': '12', 'dec': '12'
};

/**
 * Konversi tanggal teks Indonesia ("05 Januari 2026") ke format numerik global ISO ("2026-01-05")
 * agar bisa diformat dan dikonversi dengan standar internasional di Excel/Sheets.
 */
export function convertDateToNumericExcel(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();

  let y = 0, m = 0, d = 0;

  // 1. YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if (isoMatch) {
    y = parseInt(isoMatch[1], 10);
    m = parseInt(isoMatch[2], 10);
    d = parseInt(isoMatch[3], 10);
  } else {
    // 2. DD/MM/YYYY or DD-MM-YYYY
    const slashMatch = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/);
    if (slashMatch) {
      d = parseInt(slashMatch[1], 10);
      m = parseInt(slashMatch[2], 10);
      y = parseInt(slashMatch[3], 10);
    } else {
      // 3. DD MMMM YYYY (Indonesian)
      const textMatch = str.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
      if (textMatch) {
        d = parseInt(textMatch[1], 10);
        const mName = textMatch[2].toLowerCase();
        const mNum = INDONESIAN_MONTHS[mName];
        if (mNum) {
          m = parseInt(mNum, 10);
          y = parseInt(textMatch[3], 10);
        }
      }
    }
  }

  if (y > 1970 && m >= 1 && m <= 12 && d >= 1 && d <= 31) {
    // Return Excel Serial Number (Days since 1899-12-30) as pure Number
    const utcDate = Date.UTC(y, m - 1, d);
    const excelEpoch = Date.UTC(1899, 11, 30);
    const serialNumber = Math.round((utcDate - excelEpoch) / (24 * 60 * 60 * 1000));
    return serialNumber;
  }

  // Jika berupa timestamp numerik murni
  if (!isNaN(Number(str)) && Number(str) > 0) {
    return Number(str);
  }

  return str;
}

/**
 * Format 27 Kolom Laporan Metalize (FILM.FM.002) sesuai spesifikasi PT Saptawarna Cemerlang
 */
export function formatMetalizeRow(row, defaultHeader = {}) {
  let timeMinutes = row.time_menit;
  if (!timeMinutes && row.start_time && row.finish_time) {
    timeMinutes = calculateDurationMinutes(row.start_time, row.finish_time);
  }

  const rawTgl = row.tanggal || defaultHeader.tanggal || '';
  const numericTgl = convertDateToNumericExcel(rawTgl);

  // Normalisasi jenis metalized
  let jenis = String(row.jenis || '').trim().toUpperCase();
  const formula = String(row.kode_formula || '').trim().toUpperCase();
  if (!jenis || jenis === 'CPP') {
    jenis = formula.startsWith('P') ? 'VMPET' : 'VMCPP';
  }

  // Normalisasi No Lot Awal (tanpa spasi liar)
  let lotAwal = String(row.no_lot_awal || '').trim().toUpperCase().replace(/\s+/g, '');

  return {
    'TANGGAL': numericTgl,
    'Operator': String(row.operator || defaultHeader.operator || '').trim().toUpperCase(),
    'Group/shift': String(row.group_shift || defaultHeader.shift_group || '').trim().toUpperCase(),
    'Start': row.start_time || '',
    'Finish': row.finish_time || '',
    'Time': Number(timeMinutes) || '',
    'No SPK': String(row.spk_no || defaultHeader.spk_no || '').trim().toUpperCase(),
    'No Lot Awal': lotAwal,
    'Lot Metal': String(row.lot_metal || '').trim().toUpperCase(),
    'Jenis': jenis,
    'Kode Formula': formula || 'M06',
    'Thickness': Number(row.thickness) || '',
    'Width': Number(row.width) || '',
    'Panjang bahan': Number(row.panjang_bahan) || '',
    'Berat bahan': Number(row.berat_bahan) || '',
    'Panjang hasil': Number(row.panjang_hasil) || '',
    'Berat hasil': Number(row.berat_hasil) || '',
    'Atribute': row.atribute || 'OD2.4+PLASMA',
    'Tanda Hasil': row.tanda_hasil || '',
    'Quality Status': row.quality_status || '',
    'Keterangan Hasil': row.keterangan_hasil || '',
    'Meter Sisa Bahan': (row.meter_sisa_bahan !== '' && row.meter_sisa_bahan !== undefined && row.meter_sisa_bahan !== null) ? Number(row.meter_sisa_bahan) : '',
    'Keterangan Sisa Bahan': row.keterangan_sisa_bahan || '',
    'Lokasi': row.lokasi || '',
    'Posisi': row.posisi || '',
    'Waste Polos': (row.waste_polos !== '' && row.waste_polos !== undefined && row.waste_polos !== null) ? Number(row.waste_polos) : '',
    'Waste Metal': (row.waste_metal !== '' && row.waste_metal !== undefined && row.waste_metal !== null) ? Number(row.waste_metal) : ''
  };
}

const COLS_WIDTH_METALIZE = [
  { wch: 16 }, { wch: 12 }, { wch: 12 }, { wch: 9 }, { wch: 9 }, { wch: 8 },
  { wch: 18 }, { wch: 18 }, { wch: 12 }, { wch: 10 }, { wch: 14 }, { wch: 11 },
  { wch: 10 }, { wch: 14 }, { wch: 13 }, { wch: 14 }, { wch: 13 }, { wch: 16 },
  { wch: 12 }, { wch: 14 }, { wch: 18 }, { wch: 16 }, { wch: 20 }, { wch: 10 },
  { wch: 10 }, { wch: 13 }, { wch: 13 }
];

/**
 * Ekspor 1 Shift Metalize Spesifik ke Excel (.xlsx)
 */
export function exportMetalizeReportToExcel(headerData, metalizeRows) {
  const tglFormatted = (headerData.tanggal || 'Laporan_Metalize').replace(/[\s\/]/g, '_');
  const shiftName = (headerData.shift_name || headerData.shift_group || 'Shift').replace(/[\s\/]/g, '_');
  const fileName = `Laporan_Metalize_${shiftName}_${tglFormatted}.xlsx`;

  const sheet1Data = metalizeRows.map(r => formatMetalizeRow(r, headerData));

  // Material Balance Metalize
  const totalBahan = metalizeRows.reduce((acc, r) => acc + (parseFloat(r.berat_bahan) || 0), 0);
  const totalHasil = metalizeRows.reduce((acc, r) => acc + (parseFloat(r.berat_hasil) || 0), 0);
  const wastePolos = parseFloat(headerData.waste_polos) || 0;
  const wasteMetal = parseFloat(headerData.waste_metal) || 0;
  const totalWaste = wastePolos + wasteMetal;
  const diff = Number((totalHasil + totalWaste - totalBahan).toFixed(2));

  const sheet2Data = [
    { 'Kategori': '1. Total Bahan Masuk (No Lot Awal)', 'Jumlah (kg)': totalBahan },
    { 'Kategori': '2. Total Hasil Jadi Metal (Lot Metal)', 'Jumlah (kg)': totalHasil },
    { 'Kategori': '3. Waste Polos', 'Jumlah (kg)': wastePolos },
    { 'Kategori': '4. Waste Metal', 'Jumlah (kg)': wasteMetal },
    { 'Kategori': '5. Total Waste (Polos + Metal)', 'Jumlah (kg)': totalWaste },
    { 'Kategori': '6. Total Output + Waste', 'Jumlah (kg)': totalHasil + totalWaste },
    { 'Kategori': '7. Selisih Neraca (Material Balance)', 'Jumlah (kg)': diff },
    { 'Kategori': '8. Status Neraca', 'Jumlah (kg)': diff === 0 ? 'SEIMBANG (100% PAS)' : (diff > 0 ? 'LEBIH' : 'SUSUT') }
  ];

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(sheet1Data);
  const ws2 = XLSX.utils.json_to_sheet(sheet2Data);

  ws1['!cols'] = COLS_WIDTH_METALIZE;
  ws2['!cols'] = [{ wch: 35 }, { wch: 25 }];

  XLSX.utils.book_append_sheet(wb, ws1, 'Laporan Produksi Metalize');
  XLSX.utils.book_append_sheet(wb, ws2, 'Material Balance');

  XLSX.writeFile(wb, fileName);
}

/**
 * Ekspor Seluruh Sesi (Multi-Shift Harian) ke 1 File Excel Lengkap (.xlsx)
 */
export function exportFullSessionToExcel(session) {
  const tglFormatted = (session.tanggal || 'Harian').replace(/[\s\/]/g, '_');
  const sessionName = (session.name || `Laporan_${session.machine || 'Casting'}`).replace(/[\s\/]/g, '_');
  const fileName = `${sessionName}_${tglFormatted}.xlsx`;

  const shifts = session.shifts || [];
  const wb = XLSX.utils.book_new();

  // ══════════════════════════════════════════════
  // JIKA SESI MESIN METALIZE
  // ══════════════════════════════════════════════
  if (session.machine === 'METALIZE') {
    // 1. REKAP HARIAN METALIZE
    const summaryMetalize = shifts.map((s, idx) => {
      const rows = s.tabel_metalize || [];
      const sBahan = rows.reduce((a, r) => a + (parseFloat(r.berat_bahan) || 0), 0);
      const sHasil = rows.reduce((a, r) => a + (parseFloat(r.berat_hasil) || 0), 0);
      const sWastePolos = parseFloat(s.header?.waste_polos) || 0;
      const sWasteMetal = parseFloat(s.header?.waste_metal) || 0;
      const sWaste = sWastePolos + sWasteMetal;
      const sDiff = Number((sHasil + sWaste - sBahan).toFixed(2));

      return {
        'No': idx + 1,
        'Shift Kerja': s.shift_name || `Shift ${idx + 1}`,
        'Operator': s.header?.operator || '-',
        'Jumlah Roll': rows.length,
        'Bahan Masuk (kg)': sBahan,
        'Hasil Jadi (kg)': sHasil,
        'Waste Polos (kg)': sWastePolos,
        'Waste Metal (kg)': sWasteMetal,
        'Total Waste (kg)': sWaste,
        'Total Hasil + Waste (kg)': sHasil + sWaste,
        'Selisih Shift (kg)': sDiff,
        'Status Neraca': sDiff === 0 ? 'SEIMBANG' : (sDiff > 0 ? 'LEBIH' : 'SUSUT')
      };
    });

    const wsGlobal = XLSX.utils.json_to_sheet(summaryMetalize);
    wsGlobal['!cols'] = [
      { wch: 6 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 },
      { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 22 },
      { wch: 18 }, { wch: 15 }
    ];
    XLSX.utils.book_append_sheet(wb, wsGlobal, 'Rekap Harian Metalize');

    // 2. SHEET SEMUA ROLL METALIZE (27 KOLOM STANDAR)
    const allMetalizeRows = [];
    shifts.forEach(s => {
      const rows = s.tabel_metalize || [];
      rows.forEach(r => {
        allMetalizeRows.push(formatMetalizeRow(r, s.header || {}));
      });
    });

    const wsAll = XLSX.utils.json_to_sheet(allMetalizeRows);
    wsAll['!cols'] = COLS_WIDTH_METALIZE;
    XLSX.utils.book_append_sheet(wb, wsAll, 'Laporan Metalize Harian');

    // 3. INDIVIDUAL SHEETS PER SHIFT
    if (shifts.length > 1) {
      shifts.forEach((s, idx) => {
        const sName = (s.shift_name || `Shift ${idx + 1}`).substring(0, 25);
        const sRows = (s.tabel_metalize || []).map(r => formatMetalizeRow(r, s.header || {}));
        const wsShift = XLSX.utils.json_to_sheet(sRows);
        wsShift['!cols'] = COLS_WIDTH_METALIZE;
        XLSX.utils.book_append_sheet(wb, wsShift, sName);
      });
    }

    XLSX.writeFile(wb, fileName);
    return;
  }

  // ══════════════════════════════════════════════
  // JIKA SESI MESIN CASTING (DEFAULT)
  // ══════════════════════════════════════════════
  // 1. REKAP HARIAN (GLOBAL SUMMARY SHEET)
  const globalSummaryData = shifts.map((s, idx) => {
    const sResin = (s.tabel_2_resin || []).reduce((a, r) => a + (parseFloat(r.pemakaian_kg) || 0), 0);
    const sRolls = (s.tabel_1_rolls || []).reduce((a, r) => a + (parseFloat(r.berat_aktual) || 0), 0);
    const sWaste = (s.tabel_1_rolls || []).reduce((a, r) => a + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.bekuan) || 0), 0);
    const sDiff = Number((sRolls + sWaste - sResin).toFixed(2));

    return {
      'No': idx + 1,
      'Shift Kerja': s.shift_name || `Shift ${idx + 1}`,
      'Operator': s.header?.operator || '-',
      'Jumlah Roll': s.tabel_1_rolls?.length || 0,
      'Bahan Masuk (kg)': sResin,
      'Output Roll (kg)': sRolls,
      'Waste (kg)': sWaste,
      'Total Hasil (kg)': sRolls + sWaste,
      'Selisih Shift (kg)': sDiff,
      'Status Neraca': sDiff === 0 ? 'SEIMBANG' : (sDiff > 0 ? 'LEBIH' : 'SUSUT')
    };
  });

  const wsGlobal = XLSX.utils.json_to_sheet(globalSummaryData);
  wsGlobal['!cols'] = [
    { wch: 6 }, { wch: 15 }, { wch: 18 }, { wch: 12 }, { wch: 18 },
    { wch: 18 }, { wch: 14 }, { wch: 18 }, { wch: 18 }, { wch: 15 }
  ];
  XLSX.utils.book_append_sheet(wb, wsGlobal, 'Rekap Harian Seluruh Shift');

  // 2. SHEET SEMUA ROLL (AKUMULASI SELURUH SHIFT DALAM 29 KOLOM)
  const allRollsData = [];
  shifts.forEach(s => {
    (s.tabel_1_rolls || []).forEach(r => {
      allRollsData.push(formatRollRow(r, s.header || {}));
    });
  });
  const wsAllRolls = XLSX.utils.json_to_sheet(allRollsData);
  wsAllRolls['!cols'] = COLS_WIDTH_29;
  formatWorksheetDateCells(wsAllRolls);
  formatWorksheetDateCells(wsAllResin);
  XLSX.utils.book_append_sheet(wb, wsAllRolls, 'Semua Roll Harian (29 Kolom)');

  // 3. SHEET SEMUA RESIN (AKUMULASI SELURUH SHIFT DALAM 7 KOLOM)
  const allResinData = [];
  shifts.forEach(s => {
    (s.tabel_2_resin || []).forEach(res => {
      allResinData.push(formatResinRow(res, s.header || {}));
    });
  });
  const wsAllResin = XLSX.utils.json_to_sheet(allResinData);
  wsAllResin['!cols'] = COLS_WIDTH_7;
  XLSX.utils.book_append_sheet(wb, wsAllResin, 'Semua Resin Harian (7 Kolom)');

  // 4. INDIVIDUAL SHEETS UNTUK TIAP SHIFT JIKA LEBIH DARI 1 SHIFT
  if (shifts.length > 1) {
    shifts.forEach((s, idx) => {
      const shiftSheetName = (s.shift_name || `Shift ${idx + 1}`).substring(0, 25);
      const sRollsData = (s.tabel_1_rolls || []).map(r => formatRollRow(r, s.header || {}));
      const wsShift = XLSX.utils.json_to_sheet(sRollsData);
      wsShift['!cols'] = COLS_WIDTH_29;
      XLSX.utils.book_append_sheet(wb, wsShift, shiftSheetName);
    });
  }

  XLSX.writeFile(wb, fileName);
}

export function calculateDurationMinutes(startTimeStr, finishTimeStr) {
  if (!startTimeStr || !finishTimeStr) return 0;

  const p1 = String(startTimeStr).trim().split(':').map(Number);
  const p2 = String(finishTimeStr).trim().split(':').map(Number);
  if (p1.length < 2 || p2.length < 2) return 0;
  const [h1, m1] = p1;
  const [h2, m2] = p2;

  if (isNaN(h1) || isNaN(m1) || isNaN(h2) || isNaN(m2)) return 0;
  if (h1 < 0 || h1 > 23 || m1 < 0 || m1 > 59 || h2 < 0 || h2 > 23 || m2 < 0 || m2 > 59) return 0;

  let totalMinutes1 = h1 * 60 + m1;
  let totalMinutes2 = h2 * 60 + m2;

  if (totalMinutes2 < totalMinutes1) {
    totalMinutes2 += 24 * 60;
  }

  const diff = totalMinutes2 - totalMinutes1;
  return (diff >= 0 && diff <= 24 * 60) ? diff : 0;
}
