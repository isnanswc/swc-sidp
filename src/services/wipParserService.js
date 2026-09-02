/**
 * WIP Parser & Aging Helper Service
 * Menangani parsing data WIP Jumbo dari Excel & Clipboard Copas,
 * konversi angka serial tanggal/waktu Excel, dan sistem perhitungan Aging Countdown.
 */

/**
 * Konversi Serial Number Excel ke JavaScript Date Object
 * Mendukung serial tanggal murni (misal: 45973) maupun datetime (misal: 46263.76597 / 46263,76597)
 */
export function excelSerialToDate(serialVal) {
  if (serialVal === null || serialVal === undefined || serialVal === '') return null;
  
  if (serialVal instanceof Date && !isNaN(serialVal.getTime())) {
    return serialVal;
  }

  const num = typeof serialVal === 'string' 
    ? parseFloat(serialVal.replace(',', '.')) 
    : parseFloat(serialVal);

  if (isNaN(num) || num <= 0) return null;

  // Excel epoch: 30 Dec 1899 UTC
  const excelEpoch = new Date(Date.UTC(1899, 11, 30));
  const ms = num * 86400 * 1000;
  return new Date(excelEpoch.getTime() + ms);
}

/**
 * Format Serial Tanggal Excel ke teks Indonesia (misal: "12 Nov 2025" atau "29 Agu 2026, 18:23 WIB")
 */
export function formatExcelDate(serialVal, includeTime = false) {
  const d = excelSerialToDate(serialVal);
  if (!d) return '—';

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const day = d.getUTCDate();
  const month = months[d.getUTCMonth()];
  const year = d.getUTCFullYear();

  if (!includeTime) {
    return `${day} ${month} ${year}`;
  }

  const hours = String(d.getUTCHours()).padStart(2, '0');
  const minutes = String(d.getUTCMinutes()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes} WIB`;
}

/**
 * Menghitung Diameter Luar Roll (Outer Diameter / OD) dalam centimeter (cm)
 * Rumus: OD = sqrt(Core_OD^2 + (4 * Length * Thickness) / PI)
 */
export function calculateRollDiameterCm(thickMicron, lengthMeter, coreInch = 6) {
  const t = parseFloat(thickMicron) || 20;
  const l = parseFloat(lengthMeter) || 6000;
  // Core 6 inch OD ~ 17.0 cm (170 mm), Core 3 inch OD ~ 8.9 cm (89 mm)
  const coreCm = (parseFloat(coreInch) || 6) === 3 ? 8.9 : 17.0;
  
  // Konversi satuan:
  // l in cm = l * 100
  // t in cm = t * 0.0001 (1 micron = 0.0001 cm)
  const lCm = l * 100;
  const tCm = t * 0.0001;

  const areaFilm = lCm * tCm;
  const outerSq = Math.pow(coreCm, 2) + (4 * areaFilm) / Math.PI;
  const odCm = Math.sqrt(outerSq);

  return parseFloat(odCm.toFixed(1));
}

// Konstanta Kapasitas Panjang Rel Rak (dalam cm & meter)
export const RACK_LEVEL_SPECS = {
  BAWAH: { name: 'BAWAH', maxRolls18k: 15, maxSpanCm: 1368.0, maxSpanM: 13.68, levelIndex: 1 },
  TENGAH: { name: 'TENGAH', maxRolls18k: 12, maxSpanCm: 1094.4, maxSpanM: 10.94, levelIndex: 2 },
  ATAS: { name: 'ATAS', maxRolls18k: 9, maxSpanCm: 820.8, maxSpanM: 8.21, levelIndex: 3 }
};

export const RACK_TOTAL_MAX_SPAN_CM = 3283.2; // 32.83 Meter total per master rack
export const RACK_TOTAL_MAX_SPAN_M = 32.83;

/**
 * Menghitung Estimasi Muatan Roll Berdasarkan List Thickness / Panjang Standard
 * @param {number} remainingSpanCm - Sisa panjang rel kosong dalam cm
 * @param {Array} standardLengths - Daftar master panjang standard (dari configStore)
 * @param {boolean} isJumbo - True untuk estimasi Jumbo, False untuk Roll FG
 * @param {number} coreInch - Ukuran diameter core (default: 6 inch)
 */
export function calculateCapacityEstimatesByThickness(remainingSpanCm, standardLengths = [], isJumbo = true, coreInch = 6) {
  const remCm = Math.max(0, parseFloat(remainingSpanCm) || 0);

  // Default standard lengths jika belum ter-load dari database
  const list = (Array.isArray(standardLengths) && standardLengths.length > 0)
    ? standardLengths.filter(s => s.active !== false)
    : [
        { thickness: 12, maxPanjangFg: 12000, maxPanjangJumbo: 36300 },
        { thickness: 20, maxPanjangFg: 12000, maxPanjangJumbo: 36300 },
        { thickness: 25, maxPanjangFg: 12000, maxPanjangJumbo: 29300 },
        { thickness: 30, maxPanjangFg: 12000, maxPanjangJumbo: 24300 },
        { thickness: 35, maxPanjangFg: 12000, maxPanjangJumbo: 20500 },
        { thickness: 40, maxPanjangFg: 8000, maxPanjangJumbo: 16300 },
        { thickness: 50, maxPanjangFg: 6000, maxPanjangJumbo: 12300 },
        { thickness: 60, maxPanjangFg: 6000, maxPanjangJumbo: 12300 },
      ];

  return list.map(item => {
    const thick = parseFloat(item.thickness);
    const stdLength = isJumbo
      ? (parseFloat(item.maxPanjangJumbo) || 20500)
      : (parseFloat(item.maxPanjangFg) || 12000);

    const dCm = calculateRollDiameterCm(thick, stdLength, coreInch);
    const rollsPerAs = isJumbo ? 1 : 2; // 1 AS muat 1 Jumbo atau 2 Roll FG
    const asCanFit = (remCm > 0 && dCm > 0) ? Math.floor(remCm / dCm) : 0;
    const rollsCanFit = asCanFit * rollsPerAs;
    const spaceUsedCm = asCanFit * dCm;
    const spaceLeftAfterCm = Math.max(0, remCm - spaceUsedCm);

    return {
      thickness: thick,
      isJumbo,
      rollsPerAs,
      asCanFit,
      standardLength: stdLength,
      standardLengthFormatted: Number(stdLength).toLocaleString('id-ID'),
      diameterCm: dCm,
      diameterMeter: (dCm / 100).toFixed(2),
      rollsCanFit,
      spaceUsedMeter: (spaceUsedCm / 100).toFixed(2),
      spaceLeftAfterMeter: (spaceLeftAfterCm / 100).toFixed(2)
    };
  });
}

/**
 * Analisa Kapasitas Linear & Estimasi Sisa Ruang per Tingkat Rak
 */
export function getRackLevelLinearAnalysis(rolls = [], levelName = 'BAWAH', standardLengths = []) {
  const spec = RACK_LEVEL_SPECS[levelName] || RACK_LEVEL_SPECS.BAWAH;
  
  // Filter roll yang berada di tingkat ini
  const levelRolls = rolls.filter(r => {
    const pos = (r.posisiAktif || 'BAWAH').toUpperCase();
    return pos === spec.name || (spec.name === 'BAWAH' && (pos === '0' || !pos || pos === 'R-1'));
  });

  // Hitung diameter masing-masing roll dan total terpakai
  let usedSpanCm = 0;
  const rollsWithDiameter = levelRolls.map(r => {
    const dCm = calculateRollDiameterCm(r.thickness, r.length, r.core);
    usedSpanCm += dCm;
    return {
      ...r,
      diameterCm: dCm,
      diameterMeter: (dCm / 100).toFixed(2)
    };
  });

  const remainingSpanCm = Math.max(0, parseFloat((spec.maxSpanCm - usedSpanCm).toFixed(1)));
  const occupancyPercent = Math.min(100, Math.round((usedSpanCm / spec.maxSpanCm) * 100));

  // Estimasi muatan tambahan berdasarkan ukuran roll
  const estimates = {
    superJumbo_18k: Math.floor(remainingSpanCm / 91.2), // 35u x 18rb m (Ø 91.2 cm)
    jumbo_12k: Math.floor(remainingSpanCm / 80.9),      // 40u x 12.3rb m (Ø 80.9 cm)
    standar_8k: Math.floor(remainingSpanCm / 59.0),     // 30u x 8.3rb m (Ø 59.0 cm)
    ramping_6k: Math.floor(remainingSpanCm / 43.6),     // 20u x 6.3rb m (Ø 43.6 cm)
    sisa_1k5: Math.floor(remainingSpanCm / 31.4)        // 35u x 1.5rb m (Ø 31.4 cm)
  };

  const estimatesByThicknessJumbo = calculateCapacityEstimatesByThickness(remainingSpanCm, standardLengths, true);
  const estimatesByThicknessFg = calculateCapacityEstimatesByThickness(remainingSpanCm, standardLengths, false);

  return {
    levelName: spec.name,
    maxSpanCm: spec.maxSpanCm,
    maxSpanMeter: spec.maxSpanM,
    usedSpanCm: parseFloat(usedSpanCm.toFixed(1)),
    usedSpanMeter: parseFloat((usedSpanCm / 100).toFixed(2)),
    remainingSpanCm,
    remainingSpanMeter: parseFloat((remainingSpanCm / 100).toFixed(2)),
    occupancyPercent,
    rollsCount: levelRolls.length,
    rolls: rollsWithDiameter,
    estimates,
    estimatesByThicknessJumbo,
    estimatesByThicknessFg
  };
}

/**
 * Analisa Keseluruhan 3 Tingkat Rak
 */
export function getRackTotalLinearAnalysis(rolls = [], standardLengths = []) {
  const atas = getRackLevelLinearAnalysis(rolls, 'ATAS', standardLengths);
  const tengah = getRackLevelLinearAnalysis(rolls, 'TENGAH', standardLengths);
  const bawah = getRackLevelLinearAnalysis(rolls, 'BAWAH', standardLengths);

  const totalUsedSpanCm = atas.usedSpanCm + tengah.usedSpanCm + bawah.usedSpanCm;
  const totalMaxSpanCm = RACK_TOTAL_MAX_SPAN_CM;
  const totalRemainingSpanCm = Math.max(0, parseFloat((totalMaxSpanCm - totalUsedSpanCm).toFixed(1)));
  const totalOccupancyPercent = Math.min(100, Math.round((totalUsedSpanCm / totalMaxSpanCm) * 100));

  const totalEstimatesByThicknessJumbo = calculateCapacityEstimatesByThickness(totalRemainingSpanCm, standardLengths, true);
  const totalEstimatesByThicknessFg = calculateCapacityEstimatesByThickness(totalRemainingSpanCm, standardLengths, false);

  return {
    totalMaxSpanMeter: RACK_TOTAL_MAX_SPAN_M,
    totalUsedSpanMeter: parseFloat((totalUsedSpanCm / 100).toFixed(2)),
    totalRemainingSpanMeter: parseFloat((totalRemainingSpanCm / 100).toFixed(2)),
    totalOccupancyPercent,
    totalRollsCount: rolls.length,
    totalEstimatesByThicknessJumbo,
    totalEstimatesByThicknessFg,
    levels: {
      ATAS: atas,
      TENGAH: tengah,
      BAWAH: bawah
    }
  };
}

/**
 * Menghitung umur simpan stok di gudang (FIFO Stock Age in Days)
 */
export function calculateStockAgeDays(tanggalMasukSerial) {
  const masukDate = excelSerialToDate(tanggalMasukSerial);
  if (!masukDate) return null;

  const now = new Date();
  const diffMs = now.getTime() - masukDate.getTime();
  const diffDays = Math.floor(diffMs / (86400 * 1000));
  return Math.max(0, diffDays);
}

/**
 * Format Waktu Aging (Fraksi Hari ke Teks Durasi Jam & Menit)
 * Contoh: 0,249775926 -> "5j 59m" (atau 6 Jam)
 */
export function formatAgingDuration(fractionOfDay) {
  if (fractionOfDay === null || fractionOfDay === undefined || fractionOfDay === '') return '—';
  const num = typeof fractionOfDay === 'string' 
    ? parseFloat(fractionOfDay.replace(',', '.')) 
    : parseFloat(fractionOfDay);
  
  if (isNaN(num) || num <= 0) return '—';

  const totalMinutes = Math.round(num * 24 * 60);
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;

  if (hours > 0 && mins > 0) {
    return `${hours} Jam ${mins} Menit`;
  } else if (hours > 0) {
    return `${hours} Jam`;
  }
  return `${mins} Menit`;
}

/**
 * Menghitung Status Aging & Live Countdown Info
 */
export function getAgingCountdownInfo(estimasiSerial, waktuAgingSerial) {
  const targetDate = excelSerialToDate(estimasiSerial);
  
  // Jika tidak ada estimasi waktu aging atau estimasi kosong, bahan otomatis SIAP PAKAI
  if (!targetDate) {
    return {
      isAging: false,
      isReady: true,
      remainingMs: 0,
      remainingMinutes: 0,
      remainingFormatted: 'Siap Pakai',
      targetDateFormatted: '—',
      progressPercent: 100,
      statusText: 'SIAP PAKAI',
      badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
    };
  }

  // Bandingkan target datetime dengan waktu sekarang
  const targetUtcMs = Date.UTC(
    targetDate.getUTCFullYear(),
    targetDate.getUTCMonth(),
    targetDate.getUTCDate(),
    targetDate.getUTCHours(),
    targetDate.getUTCMinutes(),
    targetDate.getUTCSeconds()
  );
  
  const nowUtcMs = Date.now();
  const remainingMs = targetUtcMs - nowUtcMs;

  const targetDateFormatted = formatExcelDate(estimasiSerial, true);

  if (remainingMs > 0) {
    const totalRemainingMinutes = Math.ceil(remainingMs / (1000 * 60));
    const hours = Math.floor(totalRemainingMinutes / 60);
    const mins = totalRemainingMinutes % 60;
    
    const remainingFormatted = hours > 0 ? `${hours}j ${mins}m` : `${mins}m`;

    // Hitung progress jika waktu aging total tersedia
    let progressPercent = 50;
    const waktuAgingNum = typeof waktuAgingSerial === 'string' 
      ? parseFloat(waktuAgingSerial.replace(',', '.')) 
      : parseFloat(waktuAgingSerial);
    
    if (!isNaN(waktuAgingNum) && waktuAgingNum > 0) {
      const totalMs = waktuAgingNum * 86400 * 1000;
      const elapsedMs = Math.max(0, totalMs - remainingMs);
      progressPercent = Math.min(99, Math.max(5, Math.round((elapsedMs / totalMs) * 100)));
    }

    return {
      isAging: true,
      isReady: false,
      remainingMs,
      remainingMinutes: totalRemainingMinutes,
      remainingFormatted: `Sisa ${remainingFormatted}`,
      targetDateFormatted,
      progressPercent,
      statusText: 'PROSES AGING',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
    };
  }

  // Waktu aging sudah terlewati
  return {
    isAging: false,
    isReady: true,
    remainingMs: 0,
    remainingMinutes: 0,
    remainingFormatted: 'Aging Selesai',
    targetDateFormatted,
    progressPercent: 100,
    statusText: 'SIAP PAKAI',
    badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300'
  };
}

/**
 * Parsing Kolom CODE (Gabungan No Lot + Deskripsi Excel)
 * Contoh input:
 * "L01121125B301 CPP L01 40 MC X 2180 MM = 12300 , 6 INCHI 0"
 * "M07280826C102/F103 VMCPP M07 35 MC X 2190 MM = 1500 , 6 INCHI OD2.4+PLASMA"
 * "DYR3260428B03101/E301 VMPET PURMET2 12 MC X 1950 MM = 6000 , 6 INCHI OD3.2+PLASMA BOPET"
 */
export function parseWipCodeColumn(rawCodeStr) {
  if (!rawCodeStr) return null;
  const str = String(rawCodeStr).trim().replace(/\s+/g, ' ');
  if (!str) return null;

  // 1. Ekstrak No Lot (Token pertama sebelum spasi)
  const firstSpaceIdx = str.indexOf(' ');
  const lot = (firstSpaceIdx !== -1 ? str.substring(0, firstSpaceIdx) : str).trim().replace(/^["']|["']$/g, '');
  const descPart = firstSpaceIdx !== -1 ? str.substring(firstSpaceIdx + 1).trim() : '';

  if (!lot || lot.length < 2) return null;

  // Default values
  let jenis = 'CPP';
  let kodeFormula = 'M07';

  // Smart formula prefix heuristic
  if (lot.toUpperCase().startsWith('VM') || lot.toUpperCase().startsWith('M')) {
    jenis = 'VMCPP';
    kodeFormula = lot.length >= 3 ? lot.substring(0, 3).toUpperCase() : 'M07';
  } else if (lot.toUpperCase().startsWith('DY') || lot.toUpperCase().startsWith('PET') || lot.toUpperCase().startsWith('VMPET')) {
    jenis = 'VMPET';
    kodeFormula = 'DYR';
  } else if (lot.toUpperCase().startsWith('L') || lot.toUpperCase().startsWith('C')) {
    jenis = 'CPP';
    kodeFormula = lot.length >= 3 ? lot.substring(0, 3).toUpperCase() : 'L01';
  }

  let thickness = 20;
  let width = 1000;
  let length = 6000;
  let core = '6';
  let od = (jenis === 'VMCPP' || jenis === 'VMPET' || jenis === 'METALIZE') ? 'OD2.4+PLASMA' : '0';
  let tanda = '';

  if (descPart) {
    // A. Deteksi Jenis Film (CPP, VMCPP, PET, VMPET, BOPP, dll)
    const jenisMatch = descPart.match(/^(VMCPP|VMPET|CPP|PET|BOPP|METALIZE|ALU)\b/i);
    if (jenisMatch) {
      jenis = jenisMatch[1].toUpperCase();
    }

    // B. Deteksi Kode Formula (Kata tepat setelah Jenis Film atau sebelum angka ketebalan MC)
    const formulaAfterJenisMatch = descPart.match(/^(?:VMCPP|VMPET|CPP|PET|BOPP|METALIZE|ALU)\s+([A-Z0-9_-]+)/i);
    if (formulaAfterJenisMatch && formulaAfterJenisMatch[1].toUpperCase() !== jenis) {
      kodeFormula = formulaAfterJenisMatch[1].toUpperCase();
    } else {
      const formulaMatch = descPart.match(/\b([A-Z]\d{2}[A-Z0-9]*)\b/i);
      if (formulaMatch && formulaMatch[1].toUpperCase() !== jenis) {
        kodeFormula = formulaMatch[1].toUpperCase();
      }
    }

    // C. Deteksi Thickness (Angka sebelum MC / MIC / MICRON)
    const thickMatch = descPart.match(/(\d+(?:[.,]\d+)?)\s*(?:MC|MIC|MICRON)\b/i);
    if (thickMatch) {
      thickness = parseFloat(thickMatch[1].replace(',', '.')) || thickness;
    }

    // D. Deteksi Width (Angka sebelum MM atau setelah X)
    const widthMatch = descPart.match(/(?:X|\*)\s*(\d+(?:[.,]\d+)?)\s*MM\b/i) || descPart.match(/(\d+(?:[.,]\d+)?)\s*MM\b/i);
    if (widthMatch) {
      width = parseFloat(widthMatch[1].replace(',', '.')) || width;
    }

    // E. Deteksi Length (Angka setelah = atau sebelum koma)
    const lengthMatch = descPart.match(/=\s*(\d+(?:[.,]\d+)?)/i);
    if (lengthMatch) {
      length = parseFloat(lengthMatch[1].replace(',', '.')) || length;
    }

    // F. Deteksi Core (Angka sebelum INCHI / INCH)
    const coreMatch = descPart.match(/,\s*(\d+(?:[.,]\d+)?)\s*INCH(?:I)?\b/i) || descPart.match(/(\d+(?:[.,]\d+)?)\s*INCH(?:I)?\b/i);
    if (coreMatch) {
      core = String(coreMatch[1]);
    }

    // G. Deteksi OD & Tanda (Segala teks setelah kata INCHI)
    const afterInchiMatch = descPart.match(/\bINCH(?:I)?\s+(.+)$/i);
    if (afterInchiMatch) {
      const afterInchiStr = afterInchiMatch[1].trim();
      const tokens = afterInchiStr.split(/\s+/);
      if (tokens.length >= 1) {
        od = tokens[0].trim();
        if (tokens.length > 1) {
          tanda = tokens.slice(1).join('_').trim().toUpperCase();
        }
      }
    }
  }

  // Bersihkan tanda dari spasi berlebih
  if (tanda) {
    tanda = tanda.replace(/\s+/g, '_');
  }

  // Standard Description NAV & Excel
  const descriptionNav = `${jenis} ${kodeFormula} ${thickness} MC X ${width} MM`.replace(/\s+/g, ' ').trim();
  let descriptionExcel = `${descriptionNav} = ${length} , ${core} INCHI ${od}`;
  if (tanda) {
    descriptionExcel += ` ${tanda}`;
  }

  return {
    lot: lot.toUpperCase(),
    jenis,
    kodeFormula,
    thickness,
    width,
    length,
    core,
    od,
    tanda,
    descriptionNav,
    descriptionExcel: descPart || descriptionExcel
  };
}

/**
 * Parser Baris Data WIP dari Format Tabel (10 Kolom Standar):
 * CODE | No. SPK | Berat Aktual | Lokasi Aktif | Posisi Aktif | Keterangan | Tanggal Masuk Stok | Aging | Waktu Aging | Estimasi Waktu Aging
 */
export function parseWipRowData(rowArrayOrObject) {
  let codeRaw = '';
  let spkRaw = '';
  let beratRaw = 0;
  let lokasiRaw = 'STAGING';
  let posisiRaw = 'BAWAH';
  let ketRaw = '';
  let tglMasukRaw = '';
  let agingRaw = '';
  let waktuAgingRaw = '';
  let estimasiAgingRaw = '';

  if (Array.isArray(rowArrayOrObject)) {
    let cols = rowArrayOrObject.map(c => c !== null && c !== undefined ? String(c).trim() : '');
    // Clean wrapping quotes
    cols = cols.map(c => (c.startsWith('"') && c.endsWith('"')) ? c.slice(1, -1).trim() : c);

    if (cols.length === 0 || cols.every(c => !c)) return null;

    // Abaikan baris header tabel
    const combined = cols.join(' ').toUpperCase();
    if (
      (combined.includes('CODE') && (combined.includes('SPK') || combined.includes('BERAT') || combined.includes('LOKASI'))) ||
      (combined.includes('NO LOT') && (combined.includes('SPK') || combined.includes('BERAT') || combined.includes('LOKASI'))) ||
      (combined.includes('NO.') && combined.includes('LOT') && combined.includes('BERAT')) ||
      (combined.includes('ITEM NO') && combined.includes('DESCRIPTION'))
    ) {
      return null;
    }

    // Jika kolom pertama adalah nomor urut 1, 2, 3.. dan kolom kedua adalah Lot/Code
    if (cols.length >= 3 && /^\d{1,4}$/.test(cols[0]) && cols[1] && (/[A-Za-z]/.test(cols[1]) || cols[1].length >= 4)) {
      cols = cols.slice(1);
    }

    // Kasus: Kolom 0 = Lot, Kolom 1 = Deskripsi (Separate)
    if (cols[0] && !cols[0].includes(' ') && cols[1] && (cols[1].includes('MC') || cols[1].includes('MM') || cols[1].includes('='))) {
      codeRaw = `${cols[0]} ${cols[1]}`;
      spkRaw = cols[2] || '';
      beratRaw = cols[3] || 0;
      lokasiRaw = cols[4] || 'STAGING';
      posisiRaw = cols[5] || 'BAWAH';
      ketRaw = cols[6] || '';
      tglMasukRaw = cols[7] || '';
      agingRaw = cols[8] || '';
      waktuAgingRaw = cols[9] || '';
      estimasiAgingRaw = cols[10] || '';
    } else {
      codeRaw = cols[0] || '';
      spkRaw = cols[1] || '';
      beratRaw = cols[2] || 0;
      lokasiRaw = cols[3] || 'STAGING';
      posisiRaw = cols[4] || 'BAWAH';
      ketRaw = cols[5] || '';
      tglMasukRaw = cols[6] || '';
      agingRaw = cols[7] || '';
      waktuAgingRaw = cols[8] || '';
      estimasiAgingRaw = cols[9] || '';
    }
  } else if (typeof rowArrayOrObject === 'object') {
    const obj = rowArrayOrObject;
    codeRaw = obj.CODE || obj.code || obj.Code || obj.LOT || obj.lot || obj['NO LOT'] || obj['No Lot'] || obj['No. Lot'] || obj['Item No.'] || obj['Item No'] || '';
    
    const desc = obj.Description || obj.DESCRIPTION || obj.Deskripsi || obj['Item Description'] || obj['Nama Barang'] || '';
    if (desc && !codeRaw.includes(' ')) {
      codeRaw = `${codeRaw} ${desc}`;
    }

    spkRaw = obj['No. SPK'] || obj['NO. SPK'] || obj['No SPK'] || obj.SPK || obj.spk || obj.noSpk || obj['Document No.'] || '';
    beratRaw = obj['Berat Aktual'] || obj['BERAT AKTUAL'] || obj.beratAktual || obj.berat || obj.Berat || obj.Weight || obj.Netto || obj['Remaining Quantity'] || obj['Quantity (Base)'] || obj.Qty || obj.KG || obj.kg || 0;
    lokasiRaw = obj['Lokasi Aktif'] || obj['LOKASI AKTIF'] || obj.lokasiAktif || obj.lokasi || obj.Lokasi || obj['Location Code'] || obj.Location || obj.Gudang || obj.Rak || 'STAGING';
    posisiRaw = obj['Posisi Aktif'] || obj['POSISI AKTIF'] || obj.posisiAktif || obj.posisi || obj.Posisi || obj['Bin Code'] || obj.Bin || obj.Level || 'BAWAH';
    ketRaw = obj.Keterangan || obj.KETERANGAN || obj.keterangan || obj.Note || obj.Remark || obj.Remarks || '';
    tglMasukRaw = obj['Tanggal Masuk Stok'] || obj['TANGGAL MASUK STOK'] || obj.tanggalMasukStok || obj.tanggalMasuk || obj['Posting Date'] || obj['Tgl Masuk'] || '';
    agingRaw = obj.Aging || obj.AGING || obj.aging || '';
    waktuAgingRaw = obj['Waktu Aging'] || obj['WAKTU AGING'] || obj.waktuAging || '';
    estimasiAgingRaw = obj['Estimasi Waktu Aging'] || obj['ESTIMASI WAKTU AGING'] || obj.estimasiWaktuAging || '';
  }

  if (!codeRaw) return null;

  // 1. Ekstrak data dari kolom CODE
  const codeParsed = parseWipCodeColumn(codeRaw);
  if (!codeParsed || !codeParsed.lot) return null;

  // 2. Bersihkan Berat Aktual
  const beratClean = typeof beratRaw === 'string' 
    ? parseFloat(beratRaw.replace(/\./g, '').replace(',', '.')) || 0
    : parseFloat(beratRaw) || 0;

  // 3. Bersihkan Nilai Keterangan (jika '0' atau '-', jadikan string kosong)
  const keteranganClean = (ketRaw === '0' || ketRaw === '-' ? '' : String(ketRaw)).trim();

  // 4. Bersihkan Lokasi & Posisi
  // Aturan Cerdas: Jika lokasi berupa GUDANG, FLOOR, LANTAI, TRANSIT, 0, -, atau nama non-rak master -> lokasi = 'STAGING', posisi = nama tersebut
  let lokasiClean = (lokasiRaw === '0' || !lokasiRaw ? 'STAGING' : String(lokasiRaw).trim()).toUpperCase();
  let posisiClean = (posisiRaw === '0' || !posisiRaw ? 'BAWAH' : String(posisiRaw).trim()).toUpperCase();

  const isMasterRack = /^(RAK\s+)?(A1|A2|A3|A4|B1|B2|B3|B4|C1|C2|C3|C4|D1|D2|D3|D4|G1|G2|G3|G4|H1|H2|H3|H4|A1A2|A3A4|B1B2|B3B4|C1C2|C3C4|D1D2|D3D4|G1G2|G3G4|H1H2|H3H4)$/i.test(lokasiClean.replace(/[*#]/g, '').trim());

  if (!isMasterRack && lokasiClean !== 'STAGING') {
    if (['FLOOR', 'GUDANG', 'LANTAI', 'TRANSIT', 'AREA STAGING'].some(term => lokasiClean.includes(term))) {
      posisiClean = lokasiClean; // Jadikan nama posisi asli, misal 'FLOOR' atau 'GUDANG'
    }
    lokasiClean = 'STAGING';
  }

  // 5. Tanggal Masuk & Umur Stok
  const tanggalMasukFormatted = tglMasukRaw && tglMasukRaw !== '0' ? formatExcelDate(tglMasukRaw) : '—';
  const stockAgeDays = tglMasukRaw && tglMasukRaw !== '0' ? calculateStockAgeDays(tglMasukRaw) : null;

  // 6. Aging Countdown Info
  const agingInfo = getAgingCountdownInfo(estimasiAgingRaw, waktuAgingRaw);

  // 7. Hitung Berat Teori
  const faktor = ['VMPET', 'PET'].includes(codeParsed.jenis) ? 1.4 : 0.91;
  const beratTeori = parseFloat(((codeParsed.thickness * codeParsed.width * codeParsed.length * faktor) / 1000000).toFixed(2));

  return {
    lot: codeParsed.lot,
    spk: String(spkRaw).trim().toUpperCase(),
    jenis: codeParsed.jenis,
    kodeFormula: codeParsed.kodeFormula,
    thickness: codeParsed.thickness,
    width: codeParsed.width,
    length: codeParsed.length,
    core: codeParsed.core,
    od: codeParsed.od,
    tanda: codeParsed.tanda,
    beratAktual: beratClean > 0 ? beratClean : beratTeori,
    beratTeori,
    lokasiAktif: lokasiClean,
    posisiAktif: posisiClean,
    keterangan: keteranganClean,
    status: 'AVAILABLE', // Sesuai instruksi: semua quality status dianggap AVAILABLE
    
    // Informasi Tambahan Aging & Tanggal Masuk
    tanggalMasukStokRaw: tglMasukRaw,
    tanggalMasukFormatted,
    stockAgeDays,
    aging: agingRaw && agingRaw !== '0' ? String(agingRaw).trim() : '',
    waktuAgingRaw,
    waktuAgingFormatted: formatAgingDuration(waktuAgingRaw),
    estimasiWaktuAgingRaw: estimasiAgingRaw,
    estimasiWaktuAgingFormatted: agingInfo.targetDateFormatted,
    agingStatus: agingInfo.statusText,
    isAging: agingInfo.isAging,
    isReady: agingInfo.isReady,
    agingRemainingFormatted: agingInfo.remainingFormatted,
    agingProgressPercent: agingInfo.progressPercent,

    descriptionNav: codeParsed.descriptionNav,
    descriptionExcel: codeParsed.descriptionExcel
  };
}
