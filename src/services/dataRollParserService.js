import * as XLSX from 'xlsx';

/**
 * Robust date parser for Indonesian text dates, Excel serials, ISO dates, and DMY
 */
export function parseDateToIso(rawDate) {
  if (!rawDate) return '';

  // 1. If already a JS Date object (e.g. from XLSX cellDates: true)
  if (rawDate instanceof Date && !isNaN(rawDate.getTime())) {
    const y = rawDate.getFullYear();
    const m = String(rawDate.getMonth() + 1).padStart(2, '0');
    const d = String(rawDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  // 1.5 If raw number from Excel serial
  if (typeof rawDate === 'number' && !isNaN(rawDate) && rawDate > 30000 && rawDate < 65000) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + rawDate * 86400000);
    return jsDate.toISOString().slice(0, 10);
  }

  const s = String(rawDate).trim();
  if (!s) return '';

  // 2. Standard ISO format YYYY-MM-DD (or with time: YYYY-MM-DDTHH:mm:ss...)
  const isoPrefix = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoPrefix) {
    return `${isoPrefix[1]}-${isoPrefix[2]}-${isoPrefix[3]}`;
  }

  // 3. Check Excel Serial Number (e.g. 40000 - 65000)
  const numDate = parseFloat(s);
  if (!isNaN(numDate) && numDate > 30000 && numDate < 65000 && !s.includes(' ') && !s.includes('/') && !s.includes('-') && !s.includes('.')) {
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const jsDate = new Date(excelEpoch.getTime() + numDate * 86400000);
    return jsDate.toISOString().slice(0, 10);
  }

  // 4. Format: YYYY/MM/DD or YYYY.MM.DD
  const ymdMatch = s.match(/^(\d{4})[./](\d{1,2})[./](\d{1,2})/);
  if (ymdMatch) {
    const year = ymdMatch[1];
    const month = ymdMatch[2].padStart(2, '0');
    const day = ymdMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // 5. Indonesian & English Month map
  const months = {
    'januari': '01', 'jan': '01', 'january': '01',
    'februari': '02', 'feb': '02', 'february': '02',
    'maret': '03', 'mar': '03', 'march': '03',
    'april': '04', 'apr': '04',
    'mei': '05', 'may': '05',
    'juni': '06', 'jun': '06', 'june': '06',
    'juli': '07', 'jul': '07', 'july': '07',
    'agustus': '08', 'agu': '08', 'agust': '08', 'august': '08', 'aug': '08',
    'september': '09', 'sep': '09', 'sept': '09',
    'oktober': '10', 'okt': '10', 'october': '10', 'oct': '10',
    'november': '11', 'nov': '11',
    'desember': '12', 'des': '12', 'december': '12', 'dec': '12'
  };

  // 6. Format: "01 Agustus 2026" or "1-Agustus-26" or "1-Aug-2026"
  const idMatch = s.match(/^(\d{1,2})[\s\-_]+([A-Za-z]+)[\s\-_]+(\d{2,4})/);
  if (idMatch) {
    const day = idMatch[1].padStart(2, '0');
    const mName = idMatch[2].toLowerCase();
    const month = months[mName] || '01';
    let year = idMatch[3];
    if (year.length === 2) {
      const yr = parseInt(year, 10);
      year = String(yr < 50 ? 2000 + yr : 1900 + yr);
    }
    return `${year}-${month}-${day}`;
  }

  // 7. Format: "DD/MM/YYYY" or "DD-MM-YYYY" or "DD.MM.YYYY"
  const dmyMatch = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 8. Format: "DD/MM/YY" or "DD-MM-YY" or "DD.MM.YY" (2-digit year)
  const dmyMatch2 = s.match(/^(\d{1,2})[./-](\d{1,2})[./-](\d{2})$/);
  if (dmyMatch2) {
    const day = dmyMatch2[1].padStart(2, '0');
    const month = dmyMatch2[2].padStart(2, '0');
    const yr = parseInt(dmyMatch2[3], 10);
    const year = String(yr < 50 ? 2000 + yr : 1900 + yr);
    return `${year}-${month}-${day}`;
  }

  // 9. Standard JavaScript Date parser fallback (e.g. "Wed Jan 15 2026 ...")
  const parsedJsDate = new Date(s);
  if (!isNaN(parsedJsDate.getTime()) && parsedJsDate.getFullYear() >= 1990 && parsedJsDate.getFullYear() <= 2099) {
    const y = parsedJsDate.getFullYear();
    const m = String(parsedJsDate.getMonth() + 1).padStart(2, '0');
    const d = String(parsedJsDate.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  return s;
}

/**
 * Extract real production date from Lot string if formatted with [Formula 3-chars][DDMMYY 6-digits]
 * Examples: L01050125C2A12 -> 2025-01-05 | M07260626A201 -> 2026-06-26
 */
export function extractDateFromLot(lotStr) {
  if (!lotStr) return '';
  const s = String(lotStr).trim().toUpperCase();

  // 1. Standard inhouse format: L01050125 / M07260626
  const m = s.match(/^[A-Z]\d{2}(\d{2})(\d{2})(\d{2})/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const yy = parseInt(m[3], 10);
    if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12) {
      const yyyy = 2000 + yy;
      return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }
  }

  // 2. Generic lot with 6 digit date pattern: e.g. M07/260626/... or 07260626
  const mGeneric = s.match(/(?:^|[^0-9])(\d{2})(\d{2})(\d{2})(?:[^0-9]|$)/);
  if (mGeneric) {
    const dd = parseInt(mGeneric[1], 10);
    const mm = parseInt(mGeneric[2], 10);
    const yy = parseInt(mGeneric[3], 10);
    if (dd >= 1 && dd <= 31 && mm >= 1 && mm <= 12 && yy >= 20 && yy <= 35) {
      const yyyy = 2000 + yy;
      return `${yyyy}-${String(mm).padStart(2, '0')}-${String(dd).padStart(2, '0')}`;
    }
  }

  return '';
}

/**
 * Service to parse Excel / TSV / CSV / Copas Text for Data Roll Identity
 */
/**
 * Detects supplier name from Lot and SPK string based on manufacturing domain standards
 * - Inhouse: 3 initial characters start with L0* (e.g. L01, L03, L05) or M0* (e.g. M01, M05, M07), or SPK format [URUTAN]/[ROMAN]/SPK/[YEAR]
 * - Outside Supplier: Non-L0/M0 prefix or SPK format [BAHAN]/[ROMAN]/[NAMA_SUPPLIER]/[YEAR] (e.g. CPP/V/PANVERTA/2025, KHM/IV/SPK/2025)
 */
export function detectSupplier(lotStr, spkStr) {
  const lot = String(lotStr || '').trim().toUpperCase();
  const spk = String(spkStr || '').trim();

  // 1. Ciri Khas INHOUSE: 3 karakter awal berawalan L0* atau M0*
  const prefix3 = lot.slice(0, 3);
  if (/^(L0\d|M0\d)/i.test(prefix3)) {
    return 'INHOUSE';
  }

  // 2. Cek Format SPK
  if (spk) {
    const spkParts = spk.split('/');
    if (spkParts.length >= 4) {
      if (spkParts[2].toUpperCase() === 'SPK') {
        // [URUTAN]/[ROMAN]/SPK/[YEAR] -> Jika segment 0 angka maka INHOUSE, jika teks misal KHM/IV/SPK/2025 -> KHM
        if (isNaN(parseInt(spkParts[0], 10))) {
          return spkParts[0].toUpperCase();
        }
        return 'INHOUSE';
      } else {
        // [BAHAN]/[ROMAN]/[NAMA_SUPPLIER]/[YEAR] -> Misal CPP/V/PANVERTA/2025 -> PANVERTA
        return spkParts[2].toUpperCase();
      }
    } else if (spkParts.length === 3) {
      if (isNaN(parseInt(spkParts[0], 10))) {
        return spkParts[0].toUpperCase();
      }
    }
  }

  if (lot.startsWith('W') || lot.startsWith('KHM')) {
    if (spk.toUpperCase().includes('KHM')) return 'KHM';
    if (spk.toUpperCase().includes('PANVERTA')) return 'PANVERTA';
    return 'SUPPLIER LUAR';
  }

  return 'INHOUSE';
}

/**
 * Memisahkan dan membersihkan Lot Parent (induk) dari Turunan (child).
 * Memastikan pada export excel dan penyimpanan, turunan tidak tertulis dobel di dalam Lot Parent.
 * Contoh:
 * - extractCleanParentLot("M07260626A201/F201/GA07", "GA07") => "M07260626A201/F201"
 * - extractCleanParentLot("M07210726A210/D108/J101", "J101") => "M07210726A210/D108"
 * - extractCleanParentLot("L04270826B1A27", "A27") => "L04270826B1"
 */
export function extractCleanParentLot(lotStr, turunanStr = '') {
  if (!lotStr) return '';
  let lot = String(lotStr).trim();
  const turunan = String(turunanStr || '').trim();

  // 1. Jika lot mengandung slash '/', periksa apakah segmen terakhir adalah turunan
  if (lot.includes('/')) {
    const segments = lot.split('/').filter(Boolean);
    if (segments.length > 1) {
      const lastSeg = segments[segments.length - 1].trim();
      const cleanLast = lastSeg.replace(/(SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)$/i, '').trim();

      // Jika turunan cocok dengan segmen terakhir, hapus segmen terakhir
      if (turunan) {
        const cleanT = turunan.replace(/(SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)$/i, '').trim().toUpperCase();
        if (cleanLast.toUpperCase() === cleanT || cleanLast.toUpperCase().startsWith(cleanT)) {
          segments.pop();
          return segments.join('/');
        }
      }

      // Jika turunan kosong tapi segmen terakhir memiliki pola kode turunan (misal GA07, J101, F201)
      if (!turunan && /^[A-Z]{1,2}\d{1,3}$/i.test(cleanLast)) {
        segments.pop();
        return segments.join('/');
      }
    }
  }

  // 2. Jika turunan cocok dengan akhir lot dengan pemisah / atau - atau _
  if (turunan) {
    const escapedTurunan = turunan.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regexSlash = new RegExp(`[/_-]${escapedTurunan}(?:SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)?$`, 'i');
    if (regexSlash.test(lot)) {
      lot = lot.replace(regexSlash, '');
      return lot.replace(/\/+$/, '');
    }

    // 3. Jika format continuous tanpa slash (misal Casting L04270826B1A27 dan turunan A27)
    if (lot.length > turunan.length && lot.toUpperCase().endsWith(turunan.toUpperCase())) {
      lot = lot.slice(0, -turunan.length);
    }
  }

  return lot.replace(/\/+$/, '');
}

/**
 * Parses continuous lot strings (2025 legacy) into structured segments and standardized parsedLot (with /)
 */
export function parseContinuousLot(fullLotStr, machineName = 'SLITTING', supplier = 'INHOUSE') {
  if (!fullLotStr) return { parsedLot: '', baseLot: '', turunan: '', kodeOperator: '', shift: '', statusSuffix: '' };

  let lotRaw = fullLotStr.trim();
  
  // 1. Detect Suffixes (SORTIR, SISA, SAMPLE, AFVAL, REJECT, HOLD)
  let statusSuffix = '';
  const suffixMatch = lotRaw.match(/(SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)$/i);
  if (suffixMatch) {
    statusSuffix = suffixMatch[1].toUpperCase();
    lotRaw = lotRaw.slice(0, -statusSuffix.length);
  }

  // 2. If already contains slashes '/', normalize segments and return
  if (lotRaw.includes('/')) {
    const rawSegments = lotRaw.split('/').filter(Boolean);
    const segments = [...rawSegments];
    if (statusSuffix && segments.length > 0) {
      segments[segments.length - 1] += statusSuffix;
    }

    let lastSeg = rawSegments[rawSegments.length - 1] || '';
    let turunan = lastSeg;
    let kodeOperator = '';
    let shift = '';

    const rewMatch = lastSeg.match(/^([A-Za-z])(\d+)$/);
    if (rewMatch) {
      kodeOperator = rewMatch[1].toUpperCase();
      const numStr = rewMatch[2];
      // Format Rewind: [Kode Operator: 1][Shift: 1 digit (1-3)][Turunan: 2 digit] (misal J101 -> Op: J, Shift: 1)
      if (numStr.length >= 3) {
        shift = numStr.charAt(0);
      } else {
        shift = numStr;
      }
    } else {
      const slitMatch = lastSeg.match(/^([A-Za-z])/);
      if (slitMatch) kodeOperator = slitMatch[1].toUpperCase();
    }

    const parsedLot = segments.join('/');
    const baseLot = segments.length > 1 ? segments.slice(0, -1).join('/') : segments[0];

    return {
      parsedLot,
      baseLot,
      turunan,
      kodeOperator: kodeOperator || (turunan ? turunan.charAt(0).toUpperCase() : 'G'),
      shift,
      statusSuffix
    };
  }

  // 3. Continuous Legacy 2025 Parsing:
  let parsedSegments = [];
  let turunan = '';
  let kodeOperator = '';
  let shift = '';

  const mName = String(machineName || 'SLITTING').toUpperCase();

  // SPECIAL CASE: CASTING (dan SML)
  // Format FG Roll: [KODE FORMULA: 3][TANGGAL (DDMMYY): 6][KODE OPERATOR: 1][SHIFT: 1][CHARTINGAN: 1][TURUNAN: 1-2]
  // Contoh: L01050125C2A12 -> L01050125C2A12 (NO SLASH!) | L01050125A3B20 -> L01050125A3B20
  if (mName === 'CASTING' || mName === 'SML') {
    // 1. Pattern FG Casting: [Formula: 3 chars][Date: 6 digits][Op: 1 letter][Shift: 1 digit][Chartingan: 1 letter][Turunan: 1-2 digits]
    // e.g. L01050125C2A12 -> Base: L01050125C2, Turunan: A12, Op: C, Shift: 2
    const smlFgMatch = lotRaw.match(/^([ML]0\d)(\d{6})([A-Z])(\d)([A-Z])(\d{1,2})(.*)$/i);
    if (smlFgMatch) {
      const formula = smlFgMatch[1].toUpperCase();
      const date = smlFgMatch[2];
      const op = smlFgMatch[3].toUpperCase();
      const sh = smlFgMatch[4];
      const chart = smlFgMatch[5].toUpperCase();
      const turunanNum = smlFgMatch[6];
      const extra = smlFgMatch[7] || '';

      const baseLot = `${formula}${date}${op}${sh}`;
      let turunanVal = `${chart}${turunanNum}`;
      if (statusSuffix) turunanVal += statusSuffix;

      const parsedLot = `${formula}${date}${op}${sh}${turunanVal}${extra}`; // NO SLASH FOR CASTING!
      return {
        parsedLot,
        baseLot,
        turunan: turunanVal,
        kodeOperator: op,
        shift: sh,
        statusSuffix
      };
    }

    // 2. Pattern Casting with 4-char Roll: [Formula: 3 chars][Date: 6 digits][Cast Roll: 4 chars][Turunan: 2-3 chars]
    // e.g. L03060125B102E20 -> Base: L03060125B102, Turunan: E20, Op: E
    const smlCastMatch = lotRaw.match(/^([ML]0\d)(\d{6})([A-Z]\d{3})([A-Z]\d{1,2})(.*)$/i);
    if (smlCastMatch) {
      const baseLot = `${smlCastMatch[1]}${smlCastMatch[2]}${smlCastMatch[3]}`.toUpperCase();
      let turunanVal = smlCastMatch[4].toUpperCase();
      if (statusSuffix) turunanVal += statusSuffix;

      const parsedLot = `${baseLot}${turunanVal}${smlCastMatch[5] || ''}`; // NO SLASH FOR CASTING!
      return {
        parsedLot,
        baseLot,
        turunan: turunanVal,
        kodeOperator: turunanVal.charAt(0),
        shift: '1',
        statusSuffix
      };
    }

    // 3. Pattern Casting Master Roll (Tanpa pemotongan sekunder): [Formula: 3 chars][Date: 6 digits][Op: 1 letter][Shift: 1 digit]
    // e.g. L01050125C2
    const smlMasterMatch = lotRaw.match(/^([ML]0\d)(\d{6})([A-Z])(\d)(.*)$/i);
    if (smlMasterMatch) {
      const op = smlMasterMatch[3].toUpperCase();
      const sh = smlMasterMatch[4];
      const parsedLot = statusSuffix ? `${lotRaw}${statusSuffix}` : lotRaw;
      return {
        parsedLot,
        baseLot: parsedLot,
        turunan: `${op}${sh}`,
        kodeOperator: op,
        shift: sh,
        statusSuffix
      };
    }

    // Default Casting fallback (NO SLASH)
    const parsedLot = statusSuffix ? `${lotRaw}${statusSuffix}` : lotRaw;
    const cleanLast = lotRaw.replace(/(SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)$/i, '');
    const mRoll = cleanLast.match(/([A-Za-z]\d{1,3})$/);
    if (mRoll) {
      turunan = mRoll[1];
      kodeOperator = turunan.charAt(0).toUpperCase();
    }
    return {
      parsedLot,
      baseLot: parsedLot,
      turunan: turunan || cleanLast.slice(-2),
      kodeOperator: kodeOperator || 'C',
      shift: '1',
      statusSuffix
    };
  }

  const isInhouse = supplier === 'INHOUSE' || /^(L0\d|M0\d)/i.test(lotRaw);

  if (isInhouse) {
    // INHOUSE CONTINUOUS PATTERN:
    // 1. Casting Segment (Formula: 3, Date: 6, Cast Roll: 4 [1 letter + 3 digits] -> EXACTLY 13 chars)
    const castMatch = lotRaw.match(/^([ML]0\d)(\d{6})([A-Z]\d{3})(.*)$/i);
    if (castMatch) {
      const castSegment = `${castMatch[1]}${castMatch[2]}${castMatch[3]}`.toUpperCase();
      parsedSegments.push(castSegment);
      let rest = castMatch[4];

      if (rest) {
        let metSegment = '';
        let slitSegment1 = '';
        let slitSegment2 = '';
        let rewSegment = '';

        if (mName === 'REWIND') {
          // REWIND Machine: [Metalize] + [Slitting 2 letters+2 digits] + [Rewind 1 letter+1-2 digits]
          // e.g. E107 + HA06 + J1 or D310A + HC18 + K1 or D307 + IC12 + K1
          let m = rest.match(/^([A-Z]\d{2,3}[A-B]?)([A-Z]{2,3}\d{2}[A-Z]?)([A-Z]\d{1,2})$/i);
          if (m) {
            metSegment = m[1].toUpperCase();
            slitSegment1 = m[2].toUpperCase();
            rewSegment = m[3].toUpperCase();
          } else {
            // Fallback Rewind: [Metalize] + [Rewind]
            m = rest.match(/^([A-Z]\d{2,3}[A-B]?)([A-Z]\d{1,2})$/i);
            if (m) {
              metSegment = m[1].toUpperCase();
              rewSegment = m[2].toUpperCase();
            } else {
              slitSegment1 = rest.toUpperCase();
            }
          }
        } else {
          // SLITTING Machine:
          // Pattern A1: Plain Film 2-Stage Slitting (Tanpa Metalize) e.g. HA01 + HC01, HA01 + HA01, HA01 + HC02
          let m = rest.match(/^([A-Z]{2}\d{2})([A-Z]{2}\d{2})$/i);
          if (m) {
            slitSegment1 = m[1].toUpperCase();
            slitSegment2 = m[2].toUpperCase();
          } else {
            // Pattern A2: Multi-arm Slitting dengan Metalize e.g. E202 + HA01 + IA03
            m = rest.match(/^([A-Z]\d{2,3}[A-B]?)([A-Z]{2}\d{2}[A-Z]?)([A-Z]{2}\d{2}[A-Z]?)$/i);
            if (m) {
              metSegment = m[1].toUpperCase();
              slitSegment1 = m[2].toUpperCase();
              slitSegment2 = m[3].toUpperCase();
            } else {
              // Pattern B: Standard Slitting dengan Metalize e.g. E103 + HA08, C101 + FAC05, C04 + AA02, D108 + HA01
              m = rest.match(/^([A-Z]\d{2,3})([A-Z]{2,3}\d{2}[A-Z]?)$/i);
              if (m) {
                metSegment = m[1].toUpperCase();
                slitSegment1 = m[2].toUpperCase();
              } else {
                // Pattern C: Metalize with variant A/B e.g. D310A + HC18
                m = rest.match(/^([A-Z]\d{2,3}[A-B])([A-Z]{2,3}\d{2}[A-Z]?)$/i);
                if (m) {
                  metSegment = m[1].toUpperCase();
                  slitSegment1 = m[2].toUpperCase();
                } else {
                  // Pattern D: Single Slitting tanpa Metalize e.g. HA01, HB01, HC01, HD01
                  m = rest.match(/^([A-Z]{2}\d{2}[A-Z]?)$/i);
                  if (m) {
                    slitSegment1 = m[1].toUpperCase();
                  } else {
                    slitSegment1 = rest.toUpperCase();
                  }
                }
              }
            }
          }
        }

        if (metSegment) parsedSegments.push(metSegment);
        if (slitSegment1) parsedSegments.push(slitSegment1);
        if (slitSegment2) parsedSegments.push(slitSegment2);
        if (rewSegment) parsedSegments.push(rewSegment);
      }

      // Append suffix if exists
      if (statusSuffix && parsedSegments.length > 0) {
        parsedSegments[parsedSegments.length - 1] += statusSuffix;
      }

      // Determine turunan & kodeOperator
      const lastSeg = parsedSegments[parsedSegments.length - 1] || '';
      const cleanLast = lastSeg.replace(/(SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)$/i, '');
      
      const rewOp = cleanLast.match(/^([A-Za-z])(\d+)$/);
      if (rewOp) {
        turunan = cleanLast;
        kodeOperator = rewOp[1].toUpperCase();
        const numStr = rewOp[2];
        // Format Rewind: [Kode Operator: 1][Shift: 1 digit (1-3)][Turunan: 2 digit] (misal J101 -> Op: J, Shift: 1)
        if (numStr.length >= 3) {
          shift = numStr.charAt(0);
        } else {
          shift = numStr;
        }
      } else {
        const slitOp = cleanLast.match(/^([A-Za-z])/);
        turunan = cleanLast;
        if (slitOp) kodeOperator = slitOp[1].toUpperCase();
      }

      const parsedLot = parsedSegments.join('/');
      const baseLot = parsedSegments.length > 1 ? parsedSegments.slice(0, -1).join('/') : parsedSegments[0];

      return {
        parsedLot,
        baseLot,
        turunan,
        kodeOperator: kodeOperator || (turunan ? turunan.charAt(0).toUpperCase() : 'G'),
        shift,
        statusSuffix
      };
    }
  }

  // External Supplier continuous:
  // e.g. W5403702F106HA03HA02 -> W5403702 / F106 / HA03 / HA02
  // e.g. W5403702F106HC03HA01 -> W5403702 / F106 / HC03 / HA01
  const extMatch4 = lotRaw.match(/^([A-Z0-9]+?)(\d{6,8}|[A-Z]\d{2,3})([A-Z]{2}\d{2})([A-Z]{2}\d{2}|[A-Z]\d{1,2})$/i);
  if (extMatch4) {
    parsedSegments = [extMatch4[1].toUpperCase(), extMatch4[2].toUpperCase(), extMatch4[3].toUpperCase(), extMatch4[4].toUpperCase()];
  } else {
    const extMatch3 = lotRaw.match(/^([A-Z0-9]+?)(\d{6,8}|[A-Z]\d{2,3})([A-Z]{2}\d{2}|[A-Z]\d{1,2})$/i);
    if (extMatch3) {
      parsedSegments = [extMatch3[1].toUpperCase(), extMatch3[2].toUpperCase(), extMatch3[3].toUpperCase()];
    } else {
      const extMatch2 = lotRaw.match(/^([A-Z0-9]{4,12})([A-Z]{2}\d{2}|[A-Z]\d{1,2})$/i);
      if (extMatch2) {
        parsedSegments = [extMatch2[1].toUpperCase(), extMatch2[2].toUpperCase()];
      }
    }
  }

  if (parsedSegments.length > 0) {
    if (statusSuffix) {
      parsedSegments[parsedSegments.length - 1] += statusSuffix;
    }
    const cleanLast = (parsedSegments[parsedSegments.length - 1] || '').replace(/(SORTIR|SISA|SAMPLE|AFVAL|HOLD|REJECT)$/i, '');
    turunan = cleanLast;
    const opM = turunan.match(/^([A-Za-z])/);
    if (opM) kodeOperator = opM[1].toUpperCase();
  }

  if (parsedSegments.length === 0) {
    parsedSegments = [statusSuffix ? `${lotRaw}${statusSuffix}` : lotRaw];
    turunan = lotRaw.slice(-4);
    kodeOperator = turunan.charAt(0).toUpperCase();
  }

  const parsedLot = parsedSegments.join('/');
  const baseLot = parsedSegments.length > 1 ? parsedSegments.slice(0, -1).join('/') : parsedSegments[0];

  return {
    parsedLot,
    baseLot,
    turunan,
    kodeOperator: kodeOperator || (turunan ? turunan.charAt(0).toUpperCase() : 'G'),
    shift: '1',
    statusSuffix
  };
}

/**
 * Service to parse Excel / TSV / CSV / Copas Text for Data Roll Identity
 */
export function parseDataRollRow(row) {
  if (!row) return null;

  let kodeFg = '';
  let lotRaw = '';
  let slitting = 0;
  let rewind = 0;
  let sml = 0;
  let machineRaw = '';
  let tanggalRaw = '';
  let spk = '';
  let kodePackRaw = '';
  let qualityStatus = 'PASS';
  let thicknessRaw = '';
  let widthRaw = '';
  let lengthRaw = '';
  let reasonDefectRaw = '';

  if (Array.isArray(row)) {
    // Array handling based on length
    if (row.length === 3) {
      // Format 3 Kolom: [Lot Akhir / Kode FG, Kode Pack, Tanggal]
      lotRaw = String(row[0] || '').trim();
      kodePackRaw = String(row[1] || '').trim();
      tanggalRaw = String(row[2] || '').trim();
    } else if (row.length >= 8) {
      // Standard 9 Kolom: [Kode FG, Slitting, Rewind, SML, Tanggal, No SPK, Kode Pack, Quality Status, REASON OF DEFECT]
      kodeFg = String(row[0] || '').trim();
      slitting = parseInt(row[1], 10) || 0;
      rewind = parseInt(row[2], 10) || 0;
      sml = parseInt(row[3], 10) || 0;
      tanggalRaw = String(row[4] || '').trim();
      spk = String(row[5] || '').trim();
      kodePackRaw = String(row[6] || '').trim();
      qualityStatus = String(row[7] || 'PASS').trim().toUpperCase();
      reasonDefectRaw = String(row[8] || '').trim();
    } else if (row.length >= 7) {
      // Standard 8 Kolom: [Kode FG, Slitting, Rewind, SML, Tanggal, No SPK, Kode Pack, Quality Status]
      kodeFg = String(row[0] || '').trim();
      slitting = parseInt(row[1], 10) || 0;
      rewind = parseInt(row[2], 10) || 0;
      sml = parseInt(row[3], 10) || 0;
      tanggalRaw = String(row[4] || '').trim();
      spk = String(row[5] || '').trim();
      kodePackRaw = String(row[6] || '').trim();
      qualityStatus = String(row[7] || 'PASS').trim().toUpperCase();
    } else {
      // Generic array mapping
      lotRaw = String(row[0] || '').trim();
      kodePackRaw = String(row[1] || '').trim();
      tanggalRaw = String(row[2] || '').trim();
      if (row[3]) spk = String(row[3]).trim();
      if (row[4]) qualityStatus = String(row[4]).trim().toUpperCase();
      if (row[5]) reasonDefectRaw = String(row[5]).trim();
    }
  } else if (typeof row === 'object' && row !== null) {
    // Helper to get property by multiple alias keys (case-insensitive & whitespace-tolerant)
    const getVal = (aliases) => {
      const keys = Object.keys(row);
      for (const alias of aliases) {
        if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
          return row[alias];
        }
        const cleanedAlias = alias.toLowerCase().replace(/[^a-z0-9]/g, '');
        const matchedKey = keys.find(k => k.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanedAlias);
        if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
          return row[matchedKey];
        }
      }
      return '';
    };

    kodeFg = String(getVal([
      'Kode FG', 'KODE FG', 'kodeFg', 'kode_fg', 'KodeFg', 'Deskripsi', 'DESKRIPSI', 'Kode Barcode', 
      'Item', 'Produk', 'Nama Produk', 'Nama Barang', 'Item Name', 'Deskripsi Barang', 'Type Film', 'Jenis Film'
    ]) || '').trim();

    lotRaw = String(getVal([
      'Lot Akhir', 'LOT AKHIR', 'Lot No.', 'LOT NO.', 'No Lot', 'NO LOT', 'No. Lot', 'NO. LOT', 
      'Lot FG', 'Lot', 'LOT', 'No_Lot', 'LotNo', 'No Lot Slitting', 'NO LOT SLITTING', 'No Lot Rewind', 
      'NO LOT REWIND', 'Lot Induk', 'LOT INDUK', 'Lot Number', 'LOT NUMBER', 'Nomor Lot', 'NOMOR LOT', 
      'Roll No', 'No Roll', 'NO ROLL', 'No. Roll', 'NO. ROLL', 'Kode Roll', 'Identitas Roll', 'Lot/Roll', 'No'
    ]) || '').trim();

    // Fallback if lotRaw is still empty: find any key that contains 'lot' or 'roll'
    if (!lotRaw) {
      const keys = Object.keys(row);
      const fallbackLotKey = keys.find(k => {
        const lk = k.toLowerCase();
        return (lk.includes('lot') || lk.includes('roll')) && !lk.includes('total') && !lk.includes('berat');
      });
      if (fallbackLotKey && row[fallbackLotKey]) {
        lotRaw = String(row[fallbackLotKey]).trim();
      }
    }

    slitting = parseInt(getVal(['SLITTING', 'Slitting', 'slitting']) || '0', 10) || 0;
    rewind = parseInt(getVal(['REWIND', 'Rewind', 'rewind']) || '0', 10) || 0;
    sml = parseInt(getVal(['SML', 'Sml', 'sml']) || '0', 10) || 0;
    machineRaw = String(getVal(['Mesin', 'MESIN', 'Machine', 'machineName', 'machine', 'Posisi Mesin']) || '').trim();

    tanggalRaw = getVal([
      'Tanggal', 'TANGGAL', 'tanggal', 'Date', 'DATE', 'date', 'Tgl', 'TGL', 'tgl', 
      'Tanggal Produksi', 'Tgl Produksi', 'Prod Date', 'PROD DATE', 'Production Date', 
      'Tgl. Produksi', 'TGL PRODUKSI', 'Tanggal Slitting', 'Tgl Slitting', 'Tanggal Rewind', 
      'Tgl Rewind', 'Tgl Masuk', 'Tgl Proses', 'Waktu'
    ]);

    // Fallback if tanggalRaw is still empty: find any key that contains 'tgl' or 'date' or 'tanggal'
    if (!tanggalRaw) {
      const keys = Object.keys(row);
      const fallbackDateKey = keys.find(k => {
        const lk = k.toLowerCase();
        return lk.includes('tgl') || lk.includes('date') || lk.includes('tanggal');
      });
      if (fallbackDateKey && row[fallbackDateKey]) {
        tanggalRaw = row[fallbackDateKey];
      }
    }

    spk = String(getVal(['No SPK', 'NO SPK', 'No. SPK', 'SPK', 'spk', 'NoSpk', 'No_SPK', 'Nomor SPK']) || '').trim();
    kodePackRaw = String(getVal(['Kode Pack', 'KODE PACK', 'kodePack', 'kode_pack', 'KodePack', 'No Pack', 'NO PACK', 'Packing', 'PACKING', 'Pack', 'Sub Kode', 'Barcode']) || '').trim();
    qualityStatus = String(getVal(['Quality Status', 'QUALITY STATUS', 'qualityStatus', 'Status', 'STATUS', 'status', 'QC Status', 'Kualitas', 'Grade']) || 'PASS').trim().toUpperCase();
    reasonDefectRaw = String(getVal(['REASON OF DEFECT', 'Reason of Defect', 'Reason Of Defect', 'REASON OF DEFFECT', 'Reason Of Deffect', 'REASON DEFECT', 'Reason Defect', 'reasonDefect', 'reason_defect', 'Defect', 'DEFECT', 'Alasan Defect', 'Keterangan', 'KETERANGAN', 'Ket', 'Notes']) || '').trim();

    thicknessRaw = getVal(['Thickness', 'THICKNESS', 'Tebal', 'Micron', 'MC']);
    widthRaw = getVal(['Width', 'WIDTH', 'Lebar', 'Lebar (MM)', 'Lebar Hasil', 'Lebar MM']);
    lengthRaw = getVal(['Length', 'LENGTH', 'Panjang', 'Panjang (M)', 'Panjang Hasil', 'Meter', 'Panjang M']);
  }

  // Fallback between kodeFg and lotRaw
  if (!kodeFg && lotRaw) kodeFg = lotRaw;
  if (!lotRaw && kodeFg) lotRaw = kodeFg.split(/\s+/)[0];

  // Clean strings
  const cleanLot = (lotRaw || '').trim();
  const cleanFg = (kodeFg || '').trim();
  const cleanSpk = (spk || '').trim();

  // Strict validation: row MUST have a valid identifier (cannot be empty, '0', '-', or summary headers)
  const isInvalidLot = !cleanLot || cleanLot === '0' || cleanLot === '-' || /^(total|grand total|subtotal|sub total|jumlah|no lot|kode fg|deskripsi)$/i.test(cleanLot);
  const isInvalidFg = !cleanFg || cleanFg === '0' || cleanFg === '-' || /^(total|grand total|subtotal|sub total|jumlah|no lot|kode fg|deskripsi)$/i.test(cleanFg);
  const isInvalidSpk = !cleanSpk || cleanSpk === '0' || cleanSpk === '-' || /^(total|grand total|subtotal|sub total|jumlah)$/i.test(cleanSpk);

  if (isInvalidLot && isInvalidFg && isInvalidSpk) {
    return null;
  }

  // If lot is invalid/empty, dimensions must be non-zero
  const testW = parseFloat(widthRaw || 0) || 0;
  const testL = parseFloat(lengthRaw || 0) || 0;
  if (isInvalidLot && isInvalidFg && testW === 0 && testL === 0) {
    return null;
  }

  // Machine determination: Ubah SML otomatis menjadi CASTING
  let machineName = 'SLITTING';
  if (machineRaw) {
    const mUpper = machineRaw.toUpperCase();
    if (mUpper.includes('SML') || mUpper.includes('CAST')) {
      machineName = 'CASTING';
    } else if (mUpper.includes('REW')) {
      machineName = 'REWIND';
    } else {
      machineName = 'SLITTING';
    }
  } else if (sml === 1) {
    machineName = 'CASTING';
  } else if (rewind === 1) {
    machineName = 'REWIND';
  } else if (slitting === 1) {
    machineName = 'SLITTING';
  }

  const fgParts = kodeFg.split(/\s+/).filter(Boolean);
  const fullLotStr = fgParts.length > 0 ? fgParts[0] : (lotRaw || '');

  // Format Tanggal (Standardized ISO YYYY-MM-DD)
  let tanggalFormatted = parseDateToIso(tanggalRaw);
  if (!tanggalFormatted) {
    tanggalFormatted = extractDateFromLot(fullLotStr || kodeFg || lotRaw) || '';
  }

  // Parse Kode Pack & Sub Kode (e.g. 3B08260001, R3B06250085, 3B01250000)
  let kodePack = kodePackRaw;
  let subKode = '0000';
  if (kodePackRaw.startsWith('R') || kodePackRaw.startsWith('r')) {
    // Rewind Pack with R prefix (e.g. R3B06250085 -> R3B0625 + 0085)
    if (kodePackRaw.length >= 11) {
      kodePack = kodePackRaw.slice(0, 7);
      subKode = kodePackRaw.slice(7);
    } else if (kodePackRaw.length >= 7) {
      kodePack = kodePackRaw.slice(0, 7);
      subKode = kodePackRaw.slice(7) || '0000';
    }
  } else if (kodePackRaw.length >= 10) {
    kodePack = kodePackRaw.slice(0, 6);
    subKode = kodePackRaw.slice(6);
  } else if (kodePackRaw.length === 6) {
    kodePack = kodePackRaw;
    subKode = '0000';
  } else if (kodePackRaw === '0' || kodePackRaw === '0000' || !kodePackRaw) {
    kodePack = '3B0826';
    subKode = '0000';
  } else if (/^\d{1,4}$/.test(kodePackRaw)) {
    kodePack = '3B0826';
    subKode = kodePackRaw.padStart(4, '0');
  }

  // Detect Supplier (INHOUSE vs External like PANVERTA, KHM)
  const supplier = detectSupplier(fullLotStr || kodeFg, spk);

  // Perform continuous parsing & normalization
  const parsedLotData = parseContinuousLot(fullLotStr, machineName, supplier);
  const turunan = parsedLotData.turunan || '';
  const fullLot = parsedLotData.parsedLot || fullLotStr;
  const lot = extractCleanParentLot(parsedLotData.baseLot || parsedLotData.parsedLot || fullLotStr, turunan);
  const kodeOperator = parsedLotData.kodeOperator || (turunan ? turunan.charAt(0) : 'G');
  const shift = parsedLotData.shift || '';

  // Apply Suffix status if present
  if (parsedLotData.statusSuffix === 'SORTIR') {
    qualityStatus = 'REJECT';
  } else if (parsedLotData.statusSuffix === 'SISA') {
    qualityStatus = 'HOLD';
  }

  // Quality Status default rule (0000 is HOLD/REJECT)
  qualityStatus = qualityStatus.toUpperCase();
  if (subKode === '0000' || subKode === '0' || kodePackRaw.endsWith('0000') || kodePackRaw === '0') {
    if (qualityStatus === 'PASS' && !row?.['Quality Status'] && !row?.['QUALITY STATUS'] && !row?.['Status']) {
      qualityStatus = 'HOLD';
    }
  }

  // Clean Quality status
  if (qualityStatus.includes('HOLD') || qualityStatus === 'KARANTINA') qualityStatus = 'HOLD';
  else if (qualityStatus.includes('REJECT') || qualityStatus === 'SCRAP' || qualityStatus === 'AFVAL' || qualityStatus === 'SORTIR') qualityStatus = 'REJECT';
  else qualityStatus = 'PASS';

  let jenis = '';
  let kodeFormula = '';
  let thickness = thicknessRaw || '';
  let width = widthRaw || '';
  let length = lengthRaw || '';
  let core = 6;
  let treatment = 'INSIDE'; // Default INSIDE
  let od = '';

  // Extract Jenis from Kode FG (VMCPP, CPP, BOPP, MCPP, PET, NYLON, etc.)
  const jenisMatch = kodeFg.match(/\b(VMCPP|CPP|BOPP|MCPP|PET|NYLON|PE|LLDPE)\b/i);
  if (jenisMatch) jenis = jenisMatch[1].toUpperCase();

  // Extract Formula (e.g. M07, M06, L01, B01, etc.)
  const formulaMatch = (fullLotStr || kodeFg).match(/\b([A-Z]\d{2})\b/);
  if (formulaMatch) kodeFormula = formulaMatch[1].toUpperCase();
  else if (/^([ML]0\d)/i.test(fullLotStr)) kodeFormula = fullLotStr.slice(0, 3).toUpperCase();

  // Extract Thickness if not provided
  if (!thickness) {
    const thickMatch = kodeFg.match(/(\d+(?:\.\d+)?)\s*(?:MC|MICRON)/i);
    if (thickMatch) thickness = thickMatch[1];
  }

  // Extract Width if not provided
  if (!width) {
    const widthMatch = kodeFg.match(/[Xx]\s*(\d+(?:\.\d+)?)\s*(?:MM)?/i);
    if (widthMatch) width = widthMatch[1];
  }

  // Extract Length if not provided
  if (!length) {
    const lengthMatch = kodeFg.match(/=\s*(\d+(?:\.\d+)?)/);
    if (lengthMatch) length = lengthMatch[1];
  }

  // Core & Treatment
  const coreMatch = kodeFg.match(/(\d+)\s*(?:INCHI|INCH|")/i);
  if (coreMatch) core = parseInt(coreMatch[1], 10);

  const odMatch = kodeFg.match(/(OD\s*\d+(?:\.\d+)?(?:\+[A-Z0-9]+)?)/i);
  if (odMatch) od = odMatch[1].toUpperCase();

  if (kodeFg.toUpperCase().includes('PLASMA')) treatment = 'PLASMA';
  else if (kodeFg.toUpperCase().includes('CORONA')) treatment = 'CORONA';
  else if (kodeFg.toUpperCase().includes('OUTSIDE')) treatment = 'OUTSIDE';
  else treatment = 'INSIDE'; // Default INSIDE

  // Ensure full kodeFg description has the parsedLot representation
  let normalizedKodeFg = kodeFg;
  if (!kodeFg || kodeFg === fullLotStr) {
    const dimParts = [];
    if (thickness) dimParts.push(`${thickness}MC`);
    if (width) dimParts.push(`X ${width}MM`);
    if (length) dimParts.push(`= ${length}`);
    const dimStr = dimParts.join(' ');
    normalizedKodeFg = `${lot}${jenis ? ' ' + jenis : ''}${kodeFormula ? ' ' + kodeFormula : ''}${dimStr ? ' ' + dimStr : ''}`.trim();
  } else if (fullLotStr && kodeFg.startsWith(fullLotStr)) {
    normalizedKodeFg = kodeFg.replace(fullLotStr, lot);
  }

  // Film Density factor for Theoretical Weight Calculation (kg)
  const filmJenis = (jenis || 'VMCPP').toUpperCase();
  let density = 0.91; // Standard CPP/VMCPP/BOPP
  if (['VMPET', 'PET', 'POLYESTER'].includes(filmJenis)) {
    density = 1.40;
  } else if (['NYLON', 'BOPA', 'OPA'].includes(filmJenis)) {
    density = 1.15;
  } else if (['ALU', 'ALUMINIUM'].includes(filmJenis)) {
    density = 2.70;
  } else if (['PE', 'LLDPE', 'LDPE', 'HDPE'].includes(filmJenis)) {
    density = 0.92;
  }

  const numThick = parseFloat(thickness) || 0;
  const numWidth = parseFloat(width) || 0;
  const numLength = parseFloat(length) || 0;
  const numCore = parseInt(core, 10) || 6;

  // Rumus Berat Teori Netto (Rotogravure standard): (Tebal * Lebar * Panjang * Density) / 1,000,000
  const beratTeori = (numThick && numWidth && numLength) ? parseFloat(((numThick * numWidth * numLength * density) / 1000000).toFixed(2)) : 0;
  
  // Rumus Berat Paper Core: (((0.003077 * Lebar + 3.01532) * Core) / 6)
  const paperCore = numWidth ? parseFloat((((0.003077 * numWidth + 3.01532) * numCore) / 6).toFixed(2)) : 0;

  // Berat Bruto Teori
  const brutoTeori = parseFloat((beratTeori + paperCore).toFixed(2));

  const reasonDefect = reasonDefectRaw || (qualityStatus === 'HOLD' ? (parsedLotData.statusSuffix === 'SISA' ? 'HOLD (SISA)' : (subKode === '0000' ? 'Non-standard pack / Hold' : 'Hold QC')) : (qualityStatus === 'REJECT' ? (parsedLotData.statusSuffix === 'SORTIR' ? 'REJECT (SORTIR)' : 'Reject defect') : ''));
  const keterangan = reasonDefect || (qualityStatus === 'PASS' ? 'QC Pass' : (qualityStatus === 'HOLD' ? 'Hold' : 'Reject'));

  return {
    uuid: 'roll_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
    kodeFg: normalizedKodeFg,
    lot, // Lot Parent murni tanpa turunan (e.g. M07260626A201/F201)
    baseLot: lot,
    parentLot: lot,
    fullLot, // Lot lengkap dengan turunan (e.g. M07260626A201/F201/GA07)
    rawLot: fullLotStr,
    turunan, // Turunan / Child murni (e.g. GA07)
    kodeOperator: kodeOperator || (turunan ? turunan.charAt(0) : 'G'),
    operator: kodeOperator ? `OPERATOR ${kodeOperator}` : 'OPERATOR',
    shift,
    supplier,
    jenis: filmJenis,
    kodeFormula: kodeFormula || 'M07',
    thickness: String(numThick),
    width: String(numWidth),
    length: String(numLength),
    core: numCore,
    treatment: treatment || 'INSIDE',
    od: od || '',
    netto: beratTeori,
    berat: beratTeori,
    beratTeori: beratTeori,
    paperCore: paperCore,
    bruto: brutoTeori,
    density: density,
    slitting: slitting || (machineName === 'SLITTING' ? 1 : 0),
    rewind: rewind || (machineName === 'REWIND' ? 1 : 0),
    sml: sml || (machineName === 'SML' ? 1 : 0),
    machineName,
    tanggal: tanggalFormatted,
    tanggalFormatted,
    spk,
    kodePackRaw,
    kodePack,
    subKode,
    qualityStatus,
    reasonDefect,
    keterangan,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Parse text copied from Excel (tab-separated or comma/semicolon-separated)
 */
export function parseCopasTextDataRoll(text) {
  if (!text || typeof text !== 'string') return [];
  const lines = text.trim().split(/\r?\n/);
  if (lines.length === 0) return [];

  const results = [];
  let startIndex = 0;

  // Check if first line is a header
  const firstLine = lines[0].toLowerCase();
  if (firstLine.includes('lot') || firstLine.includes('kode') || firstLine.includes('slitting') || firstLine.includes('spk') || firstLine.includes('tanggal')) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    // Skip lines with only whitespace, delimiters, zeroes, or dashes
    if (/^[\s\t,;0\-_]+$/.test(line)) continue;

    // Detect delimiter: tab (\t), comma (,), semicolon (;)
    let cols = [];
    if (line.includes('\t')) {
      cols = line.split('\t');
    } else if (line.includes(';')) {
      cols = line.split(';');
    } else if (line.includes(',')) {
      cols = line.split(',');
    } else {
      cols = line.split(/\s{2,}/); // 2 or more spaces
    }

    // Skip if all columns are empty, 0, or dash
    const hasMeaningfulCol = cols.some(c => {
      const v = String(c || '').trim();
      return v && v !== '0' && v !== '-';
    });
    if (!hasMeaningfulCol) continue;

    const parsed = parseDataRollRow(cols);
    if (parsed) {
      results.push(parsed);
    }
  }

  return results;
}

/**
 * Parse uploaded Excel file buffer (.xlsx, .xls, .csv) with auto header detection
 * Optimized for large datasets (10,000 - 50,000+ rows)
 */
export async function parseExcelFileDataRoll(file, onProgress = null) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        if (onProgress) onProgress({ phase: 'reading', percent: 10, message: 'Membaca buffer file Excel...' });
        
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array', cellDates: true, dense: true });
        const sheetNames = workbook.SheetNames || [];
        if (sheetNames.length === 0) {
          resolve([]);
          return;
        }

        const results = [];
        const keywords = ['lot', 'kode', 'tanggal', 'date', 'tgl', 'spk', 'status', 'slitting', 'pack', 'deskripsi', 'packing', 'rewind', 'lebar', 'panjang', 'meter', 'thick', 'tebal', 'berat', 'netto'];

        for (let sIdx = 0; sIdx < sheetNames.length; sIdx++) {
          const sheetName = sheetNames[sIdx];
          const worksheet = workbook.Sheets[sheetName];
          if (!worksheet) continue;

          // 1. Read sheet as 2D raw array
          const rawGrid = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
          if (!rawGrid || rawGrid.length === 0) continue;

          const totalRows = rawGrid.length;
          if (onProgress) {
            const sheetPercent = Math.round(((sIdx) / sheetNames.length) * 40) + 10;
            onProgress({ 
              phase: 'scanning', 
              percent: sheetPercent, 
              message: `Menganalisa sheet "${sheetName}" (${sIdx + 1}/${sheetNames.length}, ${totalRows.toLocaleString()} baris)...` 
            });
          }

          // 2. Find the header row (search first 30 rows)
          let headerRowIdx = -1;
          for (let r = 0; r < Math.min(rawGrid.length, 30); r++) {
            const rowArr = rawGrid[r];
            if (Array.isArray(rowArr)) {
              const rowStr = rowArr.map(c => String(c || '').toLowerCase()).join(' ');
              const matchedCount = keywords.filter(kw => rowStr.includes(kw)).length;
              if (matchedCount >= 2) {
                headerRowIdx = r;
                break;
              }
            }
          }

          const startRow = headerRowIdx !== -1 ? headerRowIdx + 1 : 0;
          const headers = headerRowIdx !== -1 ? rawGrid[headerRowIdx].map(h => String(h || '').trim()) : null;

          for (let r = startRow; r < rawGrid.length; r++) {
            const rowArr = rawGrid[r];
            if (!rowArr || rowArr.length === 0) continue;

            let parsed = null;
            if (headers) {
              const rowObj = {};
              for (let c = 0; c < headers.length; c++) {
                if (headers[c]) {
                  rowObj[headers[c]] = rowArr[c] !== undefined ? rowArr[c] : '';
                }
              }
              parsed = parseDataRollRow(rowObj);
            } else {
              parsed = parseDataRollRow(rowArr);
            }

            if (parsed) {
              results.push(parsed);
            }

            // Asynchronously yield every 2,500 rows
            if (r % 2500 === 0) {
              if (onProgress) {
                const currentPercent = 40 + Math.round(((r - startRow) / (totalRows - startRow || 1)) * 50);
                onProgress({
                  phase: 'parsing',
                  current: results.length,
                  total: totalRows,
                  percent: Math.min(currentPercent, 95),
                  message: `Mengekstrak sheet "${sheetName}": ${results.length.toLocaleString()} roll...`
                });
              }
              await new Promise(res => setTimeout(res, 0));
            }
          }
        }

        if (onProgress) onProgress({ phase: 'complete', percent: 100, message: `Selesai mengekstrak total ${results.length.toLocaleString()} roll dari ${sheetNames.length} sheet.` });
        resolve(results);
      } catch (err) {
        console.error('Error parsing Excel file:', err);
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}

