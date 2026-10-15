import { defineStore } from 'pinia';
import { markRaw } from 'vue';
import * as XLSX from 'xlsx';
import { db, generateUniqID, getSetting, saveSetting } from '@/db';
import { parseContinuousLot, detectSupplier, extractCleanParentLot } from '@/services/dataRollParserService';
import { useConfigStore } from '@/stores/configStore';
import { useGlobalLoading } from '@/services/loadingService';
import { supabase, pushLocalToSupabase, deleteFromSupabase, deleteMultipleFromSupabase, recordTombstones, getTombstones, recordLabelsWipedCloud, broadcastRealtimeEvent } from '@/services/syncService';

export function normalizeTurunan(val) {
  if (!val) return '';
  let str = String(val).trim().toUpperCase();
  if (str.includes(' ') || str.includes('/')) {
    str = str.replace(/\s*\/\s*/g, '/').replace(/\s+/g, '/');
  }
  return str;
}

export function formatTurunanDisplay(turunan) {
  if (!turunan) return '-';
  const str = String(turunan).trim().toUpperCase();
  if (str.includes('/')) {
    return str.split('/').map(s => s.trim()).filter(Boolean).join(' / ');
  }
  if (str.includes(' ')) {
    return str.split(/\s+/).filter(Boolean).join(' / ');
  }
  return str;
}

export function getOperatorCodeFromTurunan(turunan, mesin = '') {
  if (!turunan) return '';
  const str = String(turunan).trim().toUpperCase();
  const m = String(mesin || '').trim().toUpperCase();

  // 1. Kasus Compound (ada slash '/' atau spasi)
  if (str.includes('/') || str.includes(' ')) {
    const parts = str.split(/[\/\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const child = parts[parts.length - 1];
      const childMatch = child.match(/^([A-Z]+)\d+$/);
      if (childMatch) {
        const letters = childMatch[1];
        if (letters.length > 1 && ['A', 'B', 'C', 'D'].includes(letters.slice(-1))) {
          return letters.slice(0, -1);
        }
        return letters.charAt(0);
      }
      const firstChar = child.charAt(0);
      if (/[A-Z]/.test(firstChar)) return firstChar;
    }
  }

  // 2. Format Single Rewind (e.g. J101, K101, J01, JA01)
  if (m === 'REWIND') {
    const rewindMatch = str.match(/^([A-Z]+)\d+$/);
    if (rewindMatch) {
      const letters = rewindMatch[1];
      if (letters.length > 1 && ['A', 'B', 'C', 'D'].includes(letters.slice(-1))) {
        return letters.slice(0, -1);
      }
      return letters.charAt(0);
    }
    return str.charAt(0);
  }

  // 3. Format Casting: L04270826B1A27 atau format turunan A01 (huruf awal adalah charting, bukan operator)
  if (m === 'CASTING') {
    const matchCasting = str.match(/^([A-Za-z]\d{2})(\d{6})([A-Za-z])([1-3])([A-Za-z])(\d{1,2})$/);
    if (matchCasting) {
      return matchCasting[3].toUpperCase();
    }
    return '';
  }

  // 4. Standar Slitting: HA01 -> H
  const matchSlitting = str.match(/^([A-Za-z]+?)([A-Za-z])(\d+)$/);
  if (matchSlitting) {
    return matchSlitting[1].toUpperCase();
  }

  const matchSimple = str.match(/^([A-Za-z]+)(\d+)$/);
  if (matchSimple) {
    const letters = matchSimple[1].toUpperCase();
    if (letters.length >= 2) return letters.substring(0, letters.length - 1);
    return letters;
  }

  return str.charAt(0) || 'G';
}

export function computeLabelSortKeys(item, defaultMesin = 'SLITTING') {
  if (!item) return {};
  const lot = String(item.lot || '').toUpperCase();
  const parts = lot.split('/');

  let t = String(item.turunan || '').toUpperCase();
  if (!t && parts.length >= 2) {
    t = parts[parts.length - 1].toUpperCase();
  }

  const cleanParent = extractCleanParentLot(lot, t);
  const baseLot = (cleanParent || (parts.length >= 3 ? parts.slice(0, -1).join('/') : lot)).toUpperCase();

  // Jika compound (ada slash atau spasi), gunakan bagian child/rewind untuk penomoran urut
  let sortToken = t;
  if (t.includes('/') || t.includes(' ')) {
    const subParts = t.split(/[\/\s]+/).filter(Boolean);
    if (subParts.length >= 2) {
      sortToken = subParts[subParts.length - 1];
    }
  }

  const match = sortToken.match(/^([A-Za-z]+)(\d+)(.*)$/);
  const turunanNum = match ? parseInt(match[2], 10) : (parseInt(sortToken, 10) || 999999);
  const turunanPrefix = match ? match[1] : sortToken;
  const turunanExtra = match ? match[3] || '' : '';

  const dateStr = String(item.tanggalFormatted || item.tanggal || '');
  const mesin = String(item.mesin || item.machineName || defaultMesin).toUpperCase();
  const spkStr = String(item.spk || '').toUpperCase();
  const packPrefix = String(item.kodePack || '').toUpperCase();
  const rawSub = String(item.subKode || item.packing || '').trim();
  const subNum = parseInt(rawSub, 10);
  const validSubNum = (!isNaN(subNum) && subNum > 0) ? subNum : 999999;
  const packKey = `${item.kodePack || ''}${item.subKode || item.packing || ''}`.toUpperCase();

  // Shift extraction
  let shiftNum = 99;
  const rawShift = String(item.shift || item.shiftCombined || item.groupShift || item.group_shift || item.shift_id || item.shift_group || '').trim();
  const shiftDigitMatch = rawShift.match(/\d+/);
  if (shiftDigitMatch) {
    shiftNum = parseInt(shiftDigitMatch[0], 10);
  }
  const shiftStr = String(item.shiftCombined || item.shift || item.groupShift || item.group_shift || '').trim().toUpperCase();

  let createdTime = 0;
  const rawCreated = item.createdAt || item.created_at || item.waktuInput || item.waktu_input;
  if (rawCreated) {
    const dt = new Date(rawCreated);
    if (!isNaN(dt.getTime())) {
      createdTime = dt.getTime();
    }
  }

  const numId = typeof item.id === 'number'
    ? item.id
    : (item.originalRollId || parseInt(String(item.id || '').replace('roll_', ''), 10) || 0);

  return {
    _dateStr: dateStr,
    _shiftNum: shiftNum,
    _shiftStr: shiftStr,
    _mesin: mesin,
    _spk: spkStr,
    _baseLot: baseLot,
    _turunanNum: turunanNum,
    _turunanPrefix: turunanPrefix,
    _turunanExtra: turunanExtra,
    _packPrefix: packPrefix,
    _subNum: validSubNum,
    _packKey: packKey,
    _createdTime: createdTime,
    _numericId: numId
  };
}

/**
 * Menghitung & mengunci urutan Sesi Pengerjaan Lot Induk (Contiguous Lot Session)
 * pada setiap kombinasi (Tanggal, Shift, Mesin).
 *
 * Mengatasi kasus No. Lot Induk Kembar yang dikerjakan kembali beberapa jam kemudian
 * (setelah berganti Jumbo Roll baru) pada tanggal dan shift yang sama agar tetap berada
 * pada urutan alur produksi kronologisnya dan tidak lompat mundur ke sesi awal.
 */
export function assignLotSessionAnchors(items) {
  if (!Array.isArray(items) || items.length === 0) return items;

  // 1. Kelompokkan per (Tanggal, Shift, Mesin)
  const shiftBuckets = new Map();
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item) continue;
    if (item._turunanNum === undefined || item._baseLot === undefined) {
      Object.assign(item, computeLabelSortKeys(item, item.mesin || item.machineName || 'SLITTING'));
    }
    const bucketKey = `${item._dateStr || ''}__${item._shiftNum ?? 99}__${item._shiftStr || ''}__${item._mesin || 'SLITTING'}`;
    let bucket = shiftBuckets.get(bucketKey);
    if (!bucket) {
      bucket = [];
      shiftBuckets.set(bucketKey, bucket);
    }
    bucket.push(item);
  }

  // 2. Di setiap bucket (Tanggal + Shift + Mesin), urutkan berdasarkan kronologi produksi fisik
  //    (Kode Pack subKode berurutan & waktu input createdAt / ID), lalu deteksi sesi pengerjaan Lot
  shiftBuckets.forEach((bucket) => {
    if (bucket.length === 1) {
      bucket[0]._lotSessionOrder = 1;
      bucket[0]._lotSessionPart = 1;
      bucket[0]._lotTotalSessions = 1;
      return;
    }

    const timeline = [...bucket].sort((a, b) => {
      const subA = a._subNum !== undefined ? a._subNum : 999999;
      const subB = b._subNum !== undefined ? b._subNum : 999999;
      const hasValidSubA = subA > 0 && subA < 999999;
      const hasValidSubB = subB > 0 && subB < 999999;

      // Jika keduanya memiliki Kode Pack prefix yang sama & subKode valid yang berbeda,
      // urutan nomor Kode Pack adalah urutan fisik keluarnya roll dari mesin
      if (hasValidSubA && hasValidSubB && a._packPrefix === b._packPrefix && subA !== subB) {
        return subA - subB;
      }

      // Jika waktu input (createdAt) tersedia dan terpaut > 60 detik, gunakan urutan waktu
      const timeA = a._createdTime || 0;
      const timeB = b._createdTime || 0;
      if (timeA > 0 && timeB > 0 && Math.abs(timeA - timeB) > 60000) {
        return timeA - timeB;
      }

      // Fallback ke subKode numerik meskipun prefix berbeda
      if (hasValidSubA && hasValidSubB && subA !== subB) {
        return subA - subB;
      }

      // Fallback waktu input presisi
      if (timeA > 0 && timeB > 0 && timeA !== timeB) {
        return timeA - timeB;
      }

      // Fallback ID database
      return (a._numericId || 0) - (b._numericId || 0);
    });

    let currentSessionOrder = 0;
    let currentGroupKey = null;
    let prevItem = null;
    let sessionMaxTurunanNum = 0;
    let sessionSeenTurunan = new Set();
    let sessionArmMaxNum = new Map();

    const lotSessionListMap = new Map(); // groupKey -> array of sessionOrder numbers

    for (let i = 0; i < timeline.length; i++) {
      const item = timeline[i];
      const groupKey = `${item._spk || ''}__${item._baseLot || ''}`;
      const fullTurunanKey = `${item._turunanPrefix || ''}_${item._turunanNum || 0}_${item._turunanExtra || ''}`;
      const armPrefix = item._turunanPrefix || '';
      const tNum = item._turunanNum !== undefined && item._turunanNum < 999999 ? item._turunanNum : 0;

      let isNewSession = false;

      if (currentGroupKey === null || groupKey !== currentGroupKey) {
        // Berganti ke SPK / No. Lot Induk yang berbeda (misal ganti Jumbo Roll lain)
        isNewSession = true;
      } else if (prevItem) {
        // Masih di SPK & No. Lot Induk yang sama, cek apakah ini Jumbo Roll Kembar di sesi baru:
        const timeA = prevItem._createdTime || 0;
        const timeB = item._createdTime || 0;
        const timeGap = (timeA > 0 && timeB > 0) ? Math.abs(timeB - timeA) : 0;

        const subA = prevItem._subNum !== undefined ? prevItem._subNum : 999999;
        const subB = item._subNum !== undefined ? item._subNum : 999999;
        const samePackPrefix = prevItem._packPrefix === item._packPrefix;
        const subGap = (samePackPrefix && subA < 999999 && subB < 999999) ? (subB - subA) : 0;

        // Indikator 1: Jeda waktu pengerjaan > 45 menit (2.700.000 ms)
        const isLongTimeGap = timeGap > 2700000;

        // Indikator 2: Lompatan nomor Kode Pack jauh (>= 8 nomor pada kodePack yang sama, atau >= 2 nomor dengan jeda > 15 menit)
        const isSubKodeJump = subGap >= 8 || (subGap >= 2 && timeGap > 900000);

        // Indikator 3: Kode turunan persis sama muncul lagi dengan Kode Pack berbeda (misal HA01 lalu HA01 lagi di jumbo baru)
        const isDuplicateTurunanInNewPack =
          tNum > 0 &&
          sessionSeenTurunan.has(fullTurunanKey) &&
          (subGap >= 1 || timeGap > 300000);

        // Indikator 4: Nomor urut tarikan mundur pada arm yang sama atau setelah jeda Kode Pack / waktu
        const prevArmMax = sessionArmMaxNum.get(armPrefix) || 0;
        const isTurunanReset =
          tNum > 0 &&
          ((prevArmMax > 0 && tNum < prevArmMax && (subGap >= 1 || timeGap > 300000)) ||
           (sessionMaxTurunanNum > 0 && tNum < sessionMaxTurunanNum && (subGap >= 2 || timeGap > 600000)));

        if (isLongTimeGap || isSubKodeJump || isDuplicateTurunanInNewPack || isTurunanReset) {
          isNewSession = true;
        }
      }

      if (isNewSession) {
        currentSessionOrder++;
        currentGroupKey = groupKey;
        sessionMaxTurunanNum = 0;
        sessionSeenTurunan = new Set();
        sessionArmMaxNum = new Map();

        let sessions = lotSessionListMap.get(groupKey);
        if (!sessions) {
          sessions = [];
          lotSessionListMap.set(groupKey, sessions);
        }
        sessions.push(currentSessionOrder);
      }

      const sessionsForLot = lotSessionListMap.get(groupKey);
      item._lotSessionOrder = currentSessionOrder;
      item._lotSessionPart = sessionsForLot ? sessionsForLot.length : 1;

      if (tNum > 0) {
        if (tNum > sessionMaxTurunanNum) sessionMaxTurunanNum = tNum;
        const prevArmMax = sessionArmMaxNum.get(armPrefix) || 0;
        if (tNum > prevArmMax) sessionArmMaxNum.set(armPrefix, tNum);
        sessionSeenTurunan.add(fullTurunanKey);
      }
      prevItem = item;
    }

    for (let i = 0; i < timeline.length; i++) {
      const item = timeline[i];
      const groupKey = `${item._spk || ''}__${item._baseLot || ''}`;
      const sessions = lotSessionListMap.get(groupKey);
      item._lotTotalSessions = sessions ? sessions.length : 1;
    }
  });

  return items;
}

export function compareHierarkiLabel(a, b, sortOrder = 'asc') {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;

  // 1. Tanggal Produksi (Date)
  const dateA = a._dateStr !== undefined ? a._dateStr : String(a.tanggalFormatted || a.tanggal || '');
  const dateB = b._dateStr !== undefined ? b._dateStr : String(b.tanggalFormatted || b.tanggal || '');
  const dateComp = dateA.localeCompare(dateB);
  if (dateComp !== 0) {
    return sortOrder === 'desc' ? -dateComp : dateComp;
  }

  // 2. Shift Produksi (Shift 1 -> Shift 2 -> Shift 3, lalu Grup Shift)
  const shiftNumA = a._shiftNum !== undefined ? a._shiftNum : (function() {
    const s = String(a.shift || a.shiftCombined || a.groupShift || a.group_shift || a.shift_id || a.shift_group || '');
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : 99;
  })();
  const shiftNumB = b._shiftNum !== undefined ? b._shiftNum : (function() {
    const s = String(b.shift || b.shiftCombined || b.groupShift || b.group_shift || b.shift_id || b.shift_group || '');
    const m = s.match(/\d+/);
    return m ? parseInt(m[0], 10) : 99;
  })();
  if (shiftNumA !== shiftNumB) {
    const sCmp = shiftNumA - shiftNumB;
    return sortOrder === 'desc' ? -sCmp : sCmp;
  }

  const shiftStrA = a._shiftStr !== undefined ? a._shiftStr : String(a.shiftCombined || a.shift || a.groupShift || a.group_shift || '').trim().toUpperCase();
  const shiftStrB = b._shiftStr !== undefined ? b._shiftStr : String(b.shiftCombined || b.shift || b.groupShift || b.group_shift || '').trim().toUpperCase();
  if (shiftStrA !== shiftStrB) {
    const sStrCmp = shiftStrA.localeCompare(shiftStrB);
    return sortOrder === 'desc' ? -sStrCmp : sStrCmp;
  }

  // 3. Mesin
  const machA = a._mesin !== undefined ? a._mesin : String(a.mesin || a.machineName || 'SLITTING').toUpperCase();
  const machB = b._mesin !== undefined ? b._mesin : String(b.mesin || b.machineName || 'SLITTING').toUpperCase();
  const machComp = machA.localeCompare(machB);
  if (machComp !== 0) {
    return sortOrder === 'desc' ? -machComp : machComp;
  }

  // 4. Urutan Sesi Pengerjaan Jumbo Roll (Contiguous Lot Session)
  // Mengunci posisi sesi secara kronologis & transitif agar Lot Induk kembar yang dikerjakan
  // kembali beberapa jam kemudian (setelah ganti Jumbo Roll) tidak lompat ke belakang.
  if (a._lotSessionOrder !== undefined && b._lotSessionOrder !== undefined && a._lotSessionOrder !== b._lotSessionOrder) {
    const sessCmp = a._lotSessionOrder - b._lotSessionOrder;
    return sortOrder === 'desc' ? -sessCmp : sessCmp;
  }

  // 5. SPK & Base Lot (Fallback jika _lotSessionOrder belum dihitung)
  const spkA = a._spk !== undefined ? a._spk : String(a.spk || '').toUpperCase();
  const spkB = b._spk !== undefined ? b._spk : String(b.spk || '').toUpperCase();
  const baseLotA = a._baseLot !== undefined ? a._baseLot : String(a.lot || '').toUpperCase();
  const baseLotB = b._baseLot !== undefined ? b._baseLot : String(b.lot || '').toUpperCase();

  // Pastikan keys turunan & subkode tersedia
  let tNumA = a._turunanNum;
  let tPrefA = a._turunanPrefix;
  let tExtA = a._turunanExtra;
  let subA = a._subNum;
  let packKeyA = a._packKey;
  if (tNumA === undefined) {
    const kA = computeLabelSortKeys(a, machA);
    Object.assign(a, kA);
    tNumA = kA._turunanNum;
    tPrefA = kA._turunanPrefix;
    tExtA = kA._turunanExtra;
    subA = kA._subNum;
    packKeyA = kA._packKey;
  }

  let tNumB = b._turunanNum;
  let tPrefB = b._turunanPrefix;
  let tExtB = b._turunanExtra;
  let subB = b._subNum;
  let packKeyB = b._packKey;
  if (tNumB === undefined) {
    const kB = computeLabelSortKeys(b, machB);
    Object.assign(b, kB);
    tNumB = kB._turunanNum;
    tPrefB = kB._turunanPrefix;
    tExtB = kB._turunanExtra;
    subB = kB._subNum;
    packKeyB = kB._packKey;
  }

  // Waktu Input / Timeline Pembuatan Fisik (createdAt / waktuInput)
  let timeA = a._createdTime;
  if (timeA === undefined) {
    const raw = a.createdAt || a.created_at || a.waktuInput || a.waktu_input;
    if (raw) {
      const dt = new Date(raw);
      timeA = isNaN(dt.getTime()) ? 0 : dt.getTime();
    } else {
      timeA = 0;
    }
    a._createdTime = timeA;
  }

  let timeB = b._createdTime;
  if (timeB === undefined) {
    const raw = b.createdAt || b.created_at || b.waktuInput || b.waktu_input;
    if (raw) {
      const dt = new Date(raw);
      timeB = isNaN(dt.getTime()) ? 0 : dt.getTime();
    } else {
      timeB = 0;
    }
    b._createdTime = timeB;
  }
  const timeDiff = timeA - timeB;

  let cmp = 0;

  // JIKA DALAM SESI LOT YANG SAMA (ATAU SPK & LOT YANG SAMA):
  // Urutan Turunan roll (Tarikan 01, 02, Arm A, B, dsb.) & Kode Pack WAJIB SELALU TERURUT, lalu waktu input!
  const isSameLotGroup = (spkA === spkB) && (baseLotA === baseLotB) && (baseLotA !== '');
  if (isSameLotGroup) {
    if (tNumA !== tNumB) {
      cmp = tNumA - tNumB;
    } else if (tPrefA !== tPrefB) {
      cmp = String(tPrefA).localeCompare(String(tPrefB));
    } else if (tExtA !== tExtB) {
      cmp = String(tExtA).localeCompare(String(tExtB));
    } else if (subA !== subB) {
      cmp = subA - subB;
    } else if (packKeyA !== packKeyB) {
      cmp = String(packKeyA).localeCompare(String(packKeyB));
    } else if (timeDiff !== 0) {
      cmp = timeDiff;
    } else {
      const idA = a._numericId !== undefined ? a._numericId : (Number(a.id) || 0);
      const idB = b._numericId !== undefined ? b._numericId : (Number(b.id) || 0);
      cmp = idA - idB;
    }
  } else {
    // JIKA BEDA SPK / LOT DALAM SHIFT YANG SAMA (Fallback bila _lotSessionOrder belum ada):
    if (subA < 999999 && subB < 999999 && a._packPrefix === b._packPrefix && subA !== subB) {
      cmp = subA - subB;
    } else if (Math.abs(timeDiff) >= 120000 && timeA > 0 && timeB > 0) {
      cmp = timeDiff;
    } else {
      const spkComp = spkA.localeCompare(spkB, undefined, { numeric: true, sensitivity: 'base' });
      if (spkComp !== 0) {
        cmp = spkComp;
      } else {
        const lotComp = baseLotA.localeCompare(baseLotB, undefined, { numeric: true, sensitivity: 'base' });
        if (lotComp !== 0) {
          cmp = lotComp;
        } else if (tNumA !== tNumB) {
          cmp = tNumA - tNumB;
        } else if (tPrefA !== tPrefB) {
          cmp = String(tPrefA).localeCompare(String(tPrefB));
        } else if (tExtA !== tExtB) {
          cmp = String(tExtA).localeCompare(String(tExtB));
        } else if (subA !== subB) {
          cmp = subA - subB;
        } else if (packKeyA !== packKeyB) {
          cmp = String(packKeyA).localeCompare(String(packKeyB));
        } else if (timeDiff !== 0) {
          cmp = timeDiff;
        } else {
          const idA = a._numericId !== undefined ? a._numericId : (Number(a.id) || 0);
          const idB = b._numericId !== undefined ? b._numericId : (Number(b.id) || 0);
          cmp = idA - idB;
        }
      }
    }
  }

  return sortOrder === 'desc' ? -cmp : cmp;
}

export const useLabelStore = defineStore('labelStore', {
  state: () => ({
    labels: [],
    loading: false,
    searchTerm: '',
    filterMesin: 'ALL',
    filterStatus: 'ALL',
    sortBy: 'hierarki',
    sortOrder: 'asc',
    currentPage: 1,
    rowsPerPage: 25,
    selectedIds: new Set(),
    totalDbCount: 0,
    isWindowed: false,
    windowLimit: 20000
  }),

  getters: {
    totalCount: (state) => state.labels.length,
    totalDbLabels: (state) => state.totalDbCount || state.labels.length,

    duplicateKodePacks: (state) => {
      const counts = {};
      const duplicates = new Set();
      state.labels.forEach(item => {
        if (item.status !== 'HOLD' && item.status !== 'REJECT') {
          const key = (item.kodePack || '') + (item.subKode || '');
          counts[key] = (counts[key] || 0) + 1;
          if (counts[key] > 1) {
            duplicates.add(key);
          }
        }
      });
      return duplicates;
    },

    filteredLabels: (state) => {
      // Pastikan seluruh item memiliki penanda sesi lot (_lotSessionOrder) yang dihitung dari seluruh populasi shift
      if (state.labels.length > 0 && state.labels.some(l => l && l._lotSessionOrder === undefined)) {
        assignLotSessionAnchors(state.labels);
      }

      const rawTerm = (state.searchTerm || '').trim();
      const tokens = rawTerm.toLowerCase().split(/\s+/).filter(Boolean);

      let configOpList = [];
      try {
        const configStore = useConfigStore();
        configOpList = configStore.operatorList || [];
      } catch (e) {}

      // Pre-map matched operators untuk setiap token pencarian
      const tokenOpMap = new Map();
      if (tokens.length > 0 && configOpList.length > 0) {
        tokens.forEach(tok => {
          const matched = configOpList.filter(o => 
            (o.nama && o.nama.toLowerCase().includes(tok)) ||
            (o.kodeOperator && o.kodeOperator.toLowerCase() === tok)
          );
          if (matched.length > 0) {
            tokenOpMap.set(tok, matched);
          }
        });
      }

      const filtered = state.labels.filter(item => {
        // 1. Fast checks first: Mesin & Status (Instant O(1) equality check)
        const matchesMesin = state.filterMesin === 'ALL' || 
          item.mesin === state.filterMesin ||
          (state.filterMesin === 'SLITTING' && (item.mesin === 'SLT01' || item.mesin === 'SLT02' || (item.mesin && item.mesin.includes('SLIT')))) ||
          (state.filterMesin === 'REWIND' && (item.mesin === 'REW01' || (item.mesin && item.mesin.includes('REW')))) ||
          (state.filterMesin === 'CASTING' && (item.mesin === 'CASTING' || (item.mesin && (item.mesin.includes('CAST') || item.mesin.includes('SML'))))) ||
          (state.filterMesin === 'SML' && (item.mesin === 'SML' || (item.mesin && (item.mesin.includes('SML') || item.mesin.includes('CAST'))))) ||
          (state.filterMesin === 'METALIZE' && (item.mesin && item.mesin.includes('MET')));

        if (!matchesMesin) return false;

        const matchesStatus = state.filterStatus === 'ALL' || item.status === state.filterStatus;
        if (!matchesStatus) return false;

        // 2. Jika tidak ada kata kunci pencarian, langsung loloskan
        if (tokens.length === 0) return true;

        // 3. Bangun corpus teks pencarian komprehensif (Multi-field & Composite keys)
        const supplier = item.supplier || '';
        const spk = item.spk || '';
        const lot = item.lot || '';
        const turunan = item.turunan || '';
        const fullLotSlash = `${lot}/${turunan}`;
        const fullLotSpace = `${lot} ${turunan}`;
        const kodePack = item.kodePack || '';
        const subKode = item.subKode || '';
        const fullPack = `${kodePack}${subKode}`;
        const fullPackSpace = `${kodePack} ${subKode}`;
        const fullPackDash = `${kodePack}-${subKode}`;
        const opName = item.operator || '';
        const opCode = item.kodeOperator || '';
        const mesin = item.mesin || '';
        const shift = item.shift || '';
        const tanggal = item.tanggal || '';
        const tanggalFormatted = item.tanggalFormatted || '';
        const jenis = item.jenis || '';
        const kode = item.kode || '';
        const thickness = item.thickness || '';
        const width = item.width || '';
        const length = item.length || item.meter || '';
        const netto = item.netto || item.berat || '';
        const status = item.status || '';
        const treatment = item.treatment || '';
        const od = item.od || '';
        const keterangan = item.keterangan || '';
        const reasonDefect = item.reasonDefect || '';
        const uniqId = item.uniqId || '';
        const joint = item.joint ? `${item.joint}x joint` : '';

        const corpus = `
          ${supplier} ${spk} ${lot} ${turunan} ${fullLotSlash} ${fullLotSpace}
          ${kodePack} ${subKode} ${fullPack} ${fullPackSpace} ${fullPackDash}
          ${opName} ${opCode} ${mesin} shift ${shift} ${tanggal} ${tanggalFormatted}
          ${jenis} ${kode} ${thickness}mc ${width}mm ${length}m ${netto}kg ${status}
          ${treatment} ${od} ${keterangan} ${reasonDefect} ${uniqId} ${joint}
        `.toLowerCase();

        // Multi-Token AND Search: Seluruh kata harus cocok pada roll ini
        return tokens.every(tok => {
          if (corpus.includes(tok)) return true;
          // Periksa operator alias / nama lengkap dari config
          const ops = tokenOpMap.get(tok);
          if (ops && ops.length > 0) {
            return ops.some(o => 
              (opCode && opCode.toUpperCase() === o.kodeOperator.toUpperCase()) ||
              (opName && (opName.toUpperCase().includes(o.kodeOperator.toUpperCase()) || opName.toUpperCase().includes(o.nama.toUpperCase()))) ||
              (turunan && getOperatorCodeFromTurunan(turunan, mesin) === o.kodeOperator.toUpperCase())
            );
          }
          return false;
        });
      });

      // Ultra-fast Hierarchical Slitting Comparator (O(1) comparisons using precomputed keys)
      return [...filtered].sort((a, b) => {
        if (state.sortBy === 'hierarki') {
          return compareHierarkiLabel(a, b, state.sortOrder);
        }

        let cmp = 0;
        if (state.sortBy === 'id') {
          const idA = a._numericId !== undefined ? a._numericId : (typeof a.id === 'number' ? a.id : (a.originalRollId || parseInt(String(a.id || '').replace('roll_', ''), 10) || 0));
          const idB = b._numericId !== undefined ? b._numericId : (typeof b.id === 'number' ? b.id : (b.originalRollId || parseInt(String(b.id || '').replace('roll_', ''), 10) || 0));
          cmp = idA - idB;
        } else if (state.sortBy === 'tanggal') {
          const timeA = new Date(a.tanggalFormatted || a.tanggal || 0).getTime();
          const timeB = new Date(b.tanggalFormatted || b.tanggal || 0).getTime();
          cmp = timeA - timeB;
        } else if (state.sortBy === 'netto') {
          cmp = (parseFloat(a.netto || a.berat) || 0) - (parseFloat(b.netto || b.berat) || 0);
        } else if (state.sortBy === 'lot') {
          const lotA = `${a.lot || ''}${a.turunan || ''}`;
          const lotB = `${b.lot || ''}${b.turunan || ''}`;
          cmp = lotA.localeCompare(lotB, undefined, { numeric: true, sensitivity: 'base' });
        } else if (state.sortBy === 'operator') {
          cmp = (a.operator || '').localeCompare(b.operator || '', undefined, { sensitivity: 'base' });
        } else if (state.sortBy === 'kodePack') {
          const packA = `${a.kodePack || ''}${a.subKode || ''}`;
          const packB = `${b.kodePack || ''}${b.subKode || ''}`;
          cmp = packA.localeCompare(packB, undefined, { numeric: true, sensitivity: 'base' });
        } else if (state.sortBy === 'spk') {
          cmp = (a.spk || '').localeCompare(b.spk || '', undefined, { numeric: true, sensitivity: 'base' });
        } else if (state.sortBy === 'status') {
          cmp = (a.status || '').localeCompare(b.status || '', undefined, { sensitivity: 'base' });
        } else if (state.sortBy === 'mesin') {
          cmp = (a.mesin || '').localeCompare(b.mesin || '', undefined, { sensitivity: 'base' });
        } else if (state.sortBy === 'supplier') {
          cmp = (a.supplier || '').localeCompare(b.supplier || '', undefined, { sensitivity: 'base' });
        } else {
          const valA = String(a[state.sortBy] || '');
          const valB = String(b[state.sortBy] || '');
          cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
        }

        // Secondary tie-breaker with natural slitting hierarchy
        if (cmp === 0) {
          cmp = compareHierarkiLabel(a, b, 'asc');
        }

        return state.sortOrder === 'asc' ? cmp : -cmp;
      });
    },

    paginatedLabels() {
      const total = Math.ceil(this.filteredLabels.length / this.rowsPerPage) || 1;
      const validPage = Math.min(Math.max(1, this.currentPage), total);
      if (this.currentPage > total) {
        this.currentPage = validPage;
      }
      const start = (validPage - 1) * this.rowsPerPage;
      return this.filteredLabels.slice(start, start + this.rowsPerPage);
    },

    totalPages() {
      return Math.ceil(this.filteredLabels.length / this.rowsPerPage) || 1;
    },

    // Deteksi cerdas apakah kata kunci pencarian ditemukan di mesin lain saat mesin aktif kosong
    crossMachineMatches(state) {
      const rawTerm = (state.searchTerm || '').trim();
      if (!rawTerm || state.filterMesin === 'ALL') return [];

      // Hanya muncul jika hasil di mesin aktif kosong
      if (this.filteredLabels.length > 0) return [];

      const tokens = rawTerm.toLowerCase().split(/\s+/).filter(Boolean);
      if (tokens.length === 0) return [];

      const byMachine = {};
      const activeMesin = (state.filterMesin || '').toUpperCase();

      state.labels.forEach(item => {
        if (state.filterStatus !== 'ALL' && item.status !== state.filterStatus) return;
        const itemMesin = (item.mesin || 'SLITTING').toUpperCase();
        if (itemMesin === activeMesin) return; // Hanya hitung mesin lain

        const corpus = `
          ${item.supplier || ''} ${item.spk || ''} ${item.lot || ''} ${item.turunan || ''}
          ${item.lot || ''}/${item.turunan || ''} ${item.kodePack || ''}${item.subKode || ''}
          ${item.kodePack || ''} ${item.subKode || ''} ${item.operator || ''} ${item.kodeOperator || ''}
          ${item.mesin || ''} shift ${item.shift || ''} ${item.tanggal || ''} ${item.tanggalFormatted || ''}
          ${item.jenis || ''} ${item.kode || ''} ${item.thickness || ''}mc ${item.width || ''}mm
          ${item.length || item.meter || ''} ${item.netto || item.berat || ''} ${item.status || ''}
          ${item.keterangan || ''} ${item.reasonDefect || ''} ${item.uniqId || ''}
        `.toLowerCase();

        if (tokens.every(t => corpus.includes(t))) {
          byMachine[itemMesin] = (byMachine[itemMesin] || 0) + 1;
        }
      });

      return Object.entries(byMachine).map(([mesin, count]) => ({ mesin, count }));
    },

    statistics() {
      const stats = {
        total: this.labels.length,
        slitting: 0,
        rewind: 0,
        casting: 0,
        metalize: 0,
        sml: 0,
        pass: 0,
        hold: 0,
        reject: 0,
        verified: 0,
        unverified: 0,
        totalNetto: 0
      };

      this.labels.forEach(item => {
        const m = (item.mesin || '').toUpperCase();
        if (m.includes('SLIT')) stats.slitting++;
        else if (m.includes('REW')) stats.rewind++;
        else if (m.includes('CAST')) stats.casting++;
        else if (m.includes('MET')) stats.metalize++;
        else if (m.includes('SML')) stats.sml++;
        else stats.slitting++;

        if (item.status === 'HOLD') stats.hold++;
        else if (item.status === 'REJECT') stats.reject++;
        else stats.pass++;

        if (item.verified === 1) stats.verified++;
        else stats.unverified++;

        stats.totalNetto += (parseFloat(item.netto || item.berat) || 0);
      });

      stats.totalNetto = parseFloat(stats.totalNetto.toFixed(2));
      return stats;
    },

    unverifiedLabels: (state) => {
      return state.labels.filter(item => !item.verified || item.verified === 0);
    },

    verifiedLabels: (state) => {
      return state.labels.filter(item => item.verified === 1);
    }
  },

  actions: {
    setSearchTerm(term) {
      this.searchTerm = term || '';
      this.currentPage = 1;
    },

    async loadLabels(force = false, options = {}) {
      const opts = typeof options === 'object' && options !== null ? options : {};
      const loadAll = opts.loadAll === true;
      const limit = opts.limit || this.windowLimit || 5000;

      if (!force && !loadAll && this.labels.length > 0 && !this.loading) {
        return;
      }
      this.loading = true;
      const { startLoading, stopLoading } = useGlobalLoading();
      startLoading('Memuat data label...');
      try {
        const totalInDb = await db.labels.count();
        this.totalDbCount = totalInDb;

        let raw = [];
        if (!loadAll && totalInDb > limit) {
          raw = await db.labels.orderBy('id').reverse().limit(limit).toArray();
          raw.reverse();
          this.isWindowed = true;
        } else {
          raw = await db.labels.orderBy('id').toArray();
          this.isWindowed = false;
        }
        
        // Auto-normalize any old field names if present
        const standardLabels = raw.map(item => {
          let lot = item.lot || '';
          let turunan = item.turunan || '';
          let kodeOperator = item.kodeOperator || '';
          let shift = item.shift || '1';
          const supplier = item.supplier || detectSupplier(lot, item.spk);

          if (lot && !lot.includes('/')) {
            const parsed = parseContinuousLot(lot, item.mesin || 'SLITTING', supplier);
            if (parsed && parsed.parsedLot) {
              lot = parsed.parsedLot;
              if (!turunan && parsed.turunan && parsed.turunan !== parsed.baseLot) {
                turunan = parsed.turunan;
              }
              kodeOperator = kodeOperator || parsed.kodeOperator;
              shift = shift || parsed.shift || '1';
            }
          }

          // Pastikan label di db.labels tidak pernah membawa flag data roll
          delete item.isDataRoll;
          delete item.originalRollId;

          const normTurunan = normalizeTurunan(turunan);
          const detectedOpCode = getOperatorCodeFromTurunan(normTurunan, item.mesin || 'SLITTING');
          const finalOpCode = (item.mesin === 'REWIND' && detectedOpCode) ? detectedOpCode : (kodeOperator || detectedOpCode || 'G');

          const baseObj = {
            ...item,
            isDataRoll: false,
            originalRollId: null,
            lot,
            turunan: normTurunan,
            kodeOperator: finalOpCode,
            operator: item.operator || (finalOpCode ? `OPERATOR ${finalOpCode}` : 'OPERATOR'),
            shift,
            supplier,
            uniqId: item.uniqId || `LBL-${Date.now().toString(36)}`,
            thickness: item.thickness || item.tebal || item.thick || '18',
            width: item.width || item.lebar || '1000',
            length: item.length || item.panjang || '3000',
            meter: item.meter !== undefined && item.meter !== null && String(item.meter) !== String(item.length) ? String(item.meter) : (item.joint && parseInt(item.joint, 10) > 0 ? String(item.meter || '') : ''),
            joint: item.joint !== undefined ? String(item.joint) : '0',
            netto: item.netto || item.berat || '49.14',
            diameterCore: item.diameterCore || (parseFloat(item.paperCore) < 4.5 && parseFloat(item.paperCore) > 0 ? '3' : '6'),
            paperCore: item.paperCore || '2.50',
            kode: item.kode || (item.lot ? item.lot.substring(0, 3) : 'M01'),
            kodePack: item.kodePack || '3B0826',
            subKode: item.subKode || '0001',
            treatment: item.treatment || 'INSIDE',
            status: item.status === 'OK' ? 'PASS' : (item.status || 'PASS'),
            jenisPrint: item.jenisPrint || 'FINISH GOODS'
          };

          const sortKeys = computeLabelSortKeys(baseObj, baseObj.mesin || 'SLITTING');
          return markRaw({ ...baseObj, ...sortKeys });
        });

        const deletedLabelSet = new Set(getTombstones('labels'));
        const deletedRollSet = new Set(getTombstones('data_rolls'));

        // Filter out any standardLabels that are tombstoned
        const cleanStandardLabels = standardLabels.filter(l => !l.uniqId || (!deletedLabelSet.has(l.uniqId) && !deletedRollSet.has(l.uniqId)));

        // Load and map all imported Data Rolls (db.data_rolls) so they are available for re-printing
        let mappedDataRolls = [];
        if (db.data_rolls) {
          let rawDataRolls = [];
          const totalRollsInDb = await db.data_rolls.count();
          if (!loadAll && totalRollsInDb > limit) {
            rawDataRolls = await db.data_rolls.orderBy('id').reverse().limit(limit).toArray();
            rawDataRolls.reverse();
          } else {
            rawDataRolls = await db.data_rolls.toArray();
          }
          const existingUuids = new Set(cleanStandardLabels.map(l => l.uniqId || l.uuid));

          mappedDataRolls = rawDataRolls
            .filter(r => !existingUuids.has(r.uuid) && (!r.uuid || !deletedRollSet.has(r.uuid)))
            .map(r => {
              const lot = r.lot || '';
              const normTurunan = normalizeTurunan(r.turunan || '');
              const turunan = normTurunan || r.turunan || '';
              const detectedOpCode = getOperatorCodeFromTurunan(normTurunan, r.mesin || 'SLITTING');
              const kodeOperator = (r.mesin === 'REWIND' && detectedOpCode) ? detectedOpCode : (r.kodeOperator || detectedOpCode || 'G');
              const shift = r.shift || '';
              const supplier = r.supplier || detectSupplier(r.kodeFg || lot, r.spk);

              const thick = String(r.thickness || '');
              const width = String(r.width || '');
              const length = String(r.length || r.meter || '');
              const jenis = r.jenis || 'VMCPP';
              const density = ["VMPET", "PET"].includes(jenis) ? 1.4 : 0.91;
              const calcNetto = (parseFloat(thick) && parseFloat(width) && parseFloat(length))
                ? ((parseFloat(thick) * parseFloat(width) * parseFloat(length) * density) / 1000000).toFixed(2)
                : '0.00';
              const core = r.core || 6;
              const calcCore = parseFloat(width) ? (((0.003077 * parseFloat(width) + 3.01532) * core) / 6).toFixed(2) : '0.00';
              const status = (r.qualityStatus || 'PASS').toUpperCase();

              const rollBaseObj = {
                id: `roll_${r.id || r.uuid}`,
                originalRollId: r.id,
                isDataRoll: true,
                uniqId: r.uuid || `DR-${r.id}`,
                supplier,
                spk: r.spk || '',
                tanggal: r.tanggalFormatted || r.tanggal || new Date().toISOString().slice(0, 10),
                tanggalShift: r.tanggalFormatted || r.tanggal || new Date().toISOString().slice(0, 10),
                shift,
                tanggalManual: '',
                mesin: (r.machineName || 'SLITTING').toUpperCase(),
                jenis,
                type: jenis === 'VMCPP' ? 'METALIZED' : 'TRANSPARENT',
                kode: r.kodeFormula || '',
                thickness: thick,
                width,
                length,
                meter: r.meter && String(r.meter) !== String(length) ? String(r.meter) : '',
                joint: r.joint !== undefined ? String(r.joint) : '0',
                netto: String(r.netto || calcNetto),
                paperCore: String(calcCore),
                diameterCore: String(core),
                kodePack: r.kodePack || '',
                subKode: r.subKode || '0000',
                status,
                treatment: r.treatment || 'INSIDE',
                od: r.od || '',
                lot,
                turunan,
                operator: r.operator || (kodeOperator ? `OPERATOR ${kodeOperator}` : 'OPERATOR'),
                kodeOperator,
                reasonDefect: r.reasonDefect || '',
                keterangan: r.reasonDefect || r.keterangan || (status === 'PASS' ? 'QC Pass' : (status === 'HOLD' ? 'Hold non-standard' : 'Reject defect')),
                jenisPrint: 'FINISH GOODS',
                verified: 1,
                parentWidth: r.parentWidth !== undefined ? r.parentWidth : '',
                parentTrim: r.parentTrim !== undefined ? r.parentTrim : '',
                parentMeter: r.parentMeter !== undefined ? r.parentMeter : '',
                parentSisaMeter: r.parentSisaMeter !== undefined ? r.parentSisaMeter : '',
                parentSisaKg: r.parentSisaKg !== undefined ? r.parentSisaKg : '',
                parentDensity: r.parentDensity || 0.91,
                parentBeratTeori: r.parentBeratTeori !== undefined ? r.parentBeratTeori : null,
                parentBeratAktual: r.parentBeratAktual !== undefined ? r.parentBeratAktual : null,
                parentBeratMasuk: r.parentBeratMasuk !== undefined ? r.parentBeratMasuk : null,
                parentRollsJoint: r.parentRollsJoint || null,
                resinConsumptions: r.resinConsumptions || null,
                shiftWaste: r.shiftWaste !== undefined ? r.shiftWaste : 0,
                shiftWasteNote: r.shiftWasteNote || '',
                shiftWasteDetails: r.shiftWasteDetails || null,
                synced: 0,
                createdAt: r.createdAt || r.created_at || '',
                updatedAt: r.updatedAt || new Date().toISOString()
              };

              const sortKeys = computeLabelSortKeys(rollBaseObj, rollBaseObj.mesin || 'SLITTING');
              return markRaw({ ...rollBaseObj, ...sortKeys });
            });
        }

        const prevPage = this.currentPage;
        const allLoadedLabels = [...cleanStandardLabels, ...mappedDataRolls];
        assignLotSessionAnchors(allLoadedLabels);
        this.labels = allLoadedLabels;
        
        // JANGAN reset halaman jika user sudah berada di halaman tertentu (misal saat background sync)
        // Reset ke totalPages HANYA pada pemuatan awal jika belum pernah diset (prevPage <= 1) dan bukan preservePage
        if (opts.resetToLastPage) {
          this.currentPage = Math.max(1, this.totalPages);
        } else if (prevPage && prevPage > 1) {
          // Pertahankan halaman aktif user, batasi tidak melebihi totalPages terbaru
          this.currentPage = Math.min(Math.max(1, prevPage), Math.max(1, this.totalPages));
        } else if (!this.currentPage || this.currentPage < 1) {
          this.currentPage = Math.max(1, this.totalPages);
        }
      } catch (err) {
        console.error('Failed to load labels:', err);
      } finally {
        this.loading = false;
        stopLoading();
      }
    },

    async loadAllLabels() {
      return this.loadLabels(true, { loadAll: true });
    },

    async clearAllLabels() {
      this.loading = true;
      try {
        const allExisting = await db.labels.toArray();
        const existingUniqIds = allExisting.map(l => l.uniqId).filter(Boolean);
        if (existingUniqIds.length > 0) {
          recordTombstones('labels', existingUniqIds);
        }
        await db.labels.clear();
        await saveSetting('labels_initialized_flag_v1', true);
        await recordLabelsWipedCloud();
        this.labels = [];
        this.selectedIds.clear();
        this.currentPage = 1;
        try {
          await supabase.from('labels').delete().neq('uniq_id', 'keep_all');
        } catch (errCloud) {
          console.warn('Supabase clear labels warning:', errCloud);
        }
      } finally {
        this.loading = false;
      }
    },

    async addLabel(labelData) {
      const cleanData = { ...labelData };
      delete cleanData.id; // Pastikan id tidak null / 0 agar Dexie auto-increment
      delete cleanData.isDataRoll;
      delete cleanData.originalRollId;

      const record = {
        ...cleanData,
        isDataRoll: false,
        originalRollId: null,
        uniqId: cleanData.uniqId || generateUniqID('LBL'),
        synced: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      const id = await db.labels.add(record);
      record.id = id;
      const sortKeys = computeLabelSortKeys(record, record.mesin || 'SLITTING');
      this.labels.unshift(markRaw({ ...record, ...sortKeys }));
      assignLotSessionAnchors(this.labels);
      this.totalDbCount++;
      try {
        await pushLocalToSupabase();
        broadcastRealtimeEvent('labels_broadcast', { action: 'add_label', uniqId: record.uniqId });
      } catch (e) {}
      return record;
    },

    async updateLabel(id, updatedFields) {
      const isRoll = typeof id === 'string' && id.startsWith('roll_');
      const cleanId = (typeof id === 'string' && /^\d+$/.test(id)) ? parseInt(id, 10) : id;
      const item = this.labels.find(l => l.id === id || l.id === cleanId || l.id == id);
      const rollId = isRoll ? (item?.originalRollId || parseInt(id.replace('roll_', ''), 10)) : null;

      if (isRoll && rollId && db.data_rolls) {
        // Update di database master data_rolls agar perubahan permanen
        const rollPayload = {
          updatedAt: new Date().toISOString()
        };
        if (updatedFields.lot !== undefined) rollPayload.lot = updatedFields.lot;
        if (updatedFields.turunan !== undefined) rollPayload.turunan = updatedFields.turunan;
        if (updatedFields.spk !== undefined) rollPayload.spk = updatedFields.spk;
        if (updatedFields.supplier !== undefined) rollPayload.supplier = updatedFields.supplier;
        if (updatedFields.width !== undefined) rollPayload.width = parseFloat(updatedFields.width) || 0;
        if (updatedFields.length !== undefined) rollPayload.length = parseFloat(updatedFields.length) || 0;
        if (updatedFields.thickness !== undefined) rollPayload.thickness = parseFloat(updatedFields.thickness) || 0;
        if (updatedFields.netto !== undefined) rollPayload.netto = parseFloat(updatedFields.netto) || 0;
        if (updatedFields.status !== undefined) rollPayload.qualityStatus = updatedFields.status;
        if (updatedFields.operator !== undefined) rollPayload.operator = updatedFields.operator;
        if (updatedFields.kodeOperator !== undefined) rollPayload.kodeOperator = updatedFields.kodeOperator;
        if (updatedFields.shift !== undefined) rollPayload.shift = updatedFields.shift;
        if (updatedFields.mesin !== undefined) rollPayload.machineName = updatedFields.mesin;
        if (updatedFields.tanggal !== undefined) rollPayload.tanggal = updatedFields.tanggal;
        if (updatedFields.keterangan !== undefined) rollPayload.reasonDefect = updatedFields.keterangan;
        if (updatedFields.kodePack !== undefined) rollPayload.kodePack = updatedFields.kodePack;
        if (updatedFields.subKode !== undefined) rollPayload.subKode = updatedFields.subKode;
        if (updatedFields.treatment !== undefined) rollPayload.treatment = updatedFields.treatment;
        if (updatedFields.diameterCore !== undefined) rollPayload.core = parseFloat(updatedFields.diameterCore) || 6;
        if (updatedFields.paperCore !== undefined) rollPayload.paperCore = updatedFields.paperCore;
        if (updatedFields.meter !== undefined) rollPayload.meter = updatedFields.meter;
        if (updatedFields.joint !== undefined) rollPayload.joint = updatedFields.joint;
        if (updatedFields.od !== undefined) rollPayload.od = updatedFields.od;
        if (updatedFields.kode !== undefined) rollPayload.kodeFormula = updatedFields.kode;
        if (updatedFields.jenis !== undefined) rollPayload.jenis = updatedFields.jenis;
        if (updatedFields.parentWidth !== undefined) rollPayload.parentWidth = updatedFields.parentWidth;
        if (updatedFields.parentTrim !== undefined) rollPayload.parentTrim = updatedFields.parentTrim;
        if (updatedFields.parentMeter !== undefined) rollPayload.parentMeter = updatedFields.parentMeter;
        if (updatedFields.parentSisaMeter !== undefined) rollPayload.parentSisaMeter = updatedFields.parentSisaMeter;
        if (updatedFields.parentSisaKg !== undefined) rollPayload.parentSisaKg = updatedFields.parentSisaKg;
        if (updatedFields.parentDensity !== undefined) rollPayload.parentDensity = updatedFields.parentDensity;
        if (updatedFields.parentBeratTeori !== undefined) rollPayload.parentBeratTeori = updatedFields.parentBeratTeori;
        if (updatedFields.parentBeratAktual !== undefined) rollPayload.parentBeratAktual = updatedFields.parentBeratAktual;
        if (updatedFields.parentBeratMasuk !== undefined) rollPayload.parentBeratMasuk = updatedFields.parentBeratMasuk;
        if (updatedFields.parentRollsJoint !== undefined) rollPayload.parentRollsJoint = updatedFields.parentRollsJoint;
        if (updatedFields.resinConsumptions !== undefined) rollPayload.resinConsumptions = updatedFields.resinConsumptions;
        if (updatedFields.shiftWaste !== undefined) rollPayload.shiftWaste = updatedFields.shiftWaste;
        if (updatedFields.shiftWasteNote !== undefined) rollPayload.shiftWasteNote = updatedFields.shiftWasteNote;
        if (updatedFields.shiftWasteDetails !== undefined) rollPayload.shiftWasteDetails = updatedFields.shiftWasteDetails;
        rollPayload.synced = 0;
        
        await db.data_rolls.update(rollId, rollPayload);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync:data-rolls-updated'));
        }
      } else {
        const payload = {
          ...updatedFields,
          synced: 0,
          updatedAt: new Date().toISOString()
        };
        delete payload.isDataRoll;
        delete payload.originalRollId;
        if (typeof cleanId === 'number' || (typeof cleanId === 'string' && !cleanId.startsWith('roll_'))) {
          await db.labels.update(cleanId, payload);
        }
      }

      const idx = this.labels.findIndex(l => l.id === cleanId || l.id === id || l.id == id || (l.uniqId && updatedFields.uniqId && l.uniqId === updatedFields.uniqId));
      if (idx !== -1) {
        const merged = { ...this.labels[idx], ...updatedFields, updatedAt: new Date().toISOString() };
        const sortKeys = computeLabelSortKeys(merged, merged.mesin || 'SLITTING');
        this.labels.splice(idx, 1, markRaw({ ...merged, ...sortKeys }));
        assignLotSessionAnchors(this.labels);
      }
      try {
        await pushLocalToSupabase();
        broadcastRealtimeEvent('labels_broadcast', { action: 'update_label', id });
      } catch (e) {}
    },

    async deleteLabel(id) {
      const isRoll = typeof id === 'string' && id.startsWith('roll_');
      const item = this.labels.find(l => l.id === id);
      const rollId = isRoll ? (item?.originalRollId || parseInt(id.replace('roll_', ''), 10)) : null;

      // 1. Jika data bersumber dari data_rolls, hapus permanen dari db.data_rolls
      if (isRoll && rollId && db.data_rolls) {
        const rollObj = await db.data_rolls.get(rollId);
        const rUuid = rollObj?.uuid || item?.uniqId;
        await db.data_rolls.delete(rollId);
        if (rUuid) {
          recordTombstones('data_rolls', [rUuid]);
          deleteFromSupabase('data_rolls', 'uuid', rUuid).catch(() => {});
        }
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('sync:data-rolls-updated'));
        }
      }

      // 2. Hapus dari db.labels jika bukan data roll
      const targetUniqId = item?.uniqId;
      if (!isRoll) {
        if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('roll_'))) {
          await db.labels.delete(id);
        } else if (item && item.uniqId) {
          try {
            await db.labels.where('uniqId').equals(item.uniqId).delete();
          } catch (eDel) {
            const matched = await db.labels.filter(l => l.uniqId === item.uniqId || l.uuid === item.uniqId).toArray();
            if (matched.length > 0) await db.labels.bulkDelete(matched.map(m => m.id));
          }
        }
        if (targetUniqId) {
          recordTombstones('labels', [targetUniqId]);
          deleteFromSupabase('labels', 'uniq_id', targetUniqId).catch(() => {});
        }
      }

      // 3. Hapus dari state lokal
      this.labels = this.labels.filter(l => l.id !== id);
      assignLotSessionAnchors(this.labels);
      this.selectedIds.delete(id);
      if (this.totalDbCount > 0) this.totalDbCount--;
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages);
      }
      try {
        await pushLocalToSupabase();
        broadcastRealtimeEvent('labels_broadcast', { action: 'delete_label', id });
      } catch (e) {}
    },

    async deleteSelectedLabels(ids) {
      const regularLabelIds = [];
      const rollIds = [];
      const labelUniqIds = [];
      const rollUuids = [];

      for (const id of ids) {
        const isRoll = typeof id === 'string' && id.startsWith('roll_');
        const item = this.labels.find(l => l.id === id);
        const rollId = isRoll ? (item?.originalRollId || parseInt(id.replace('roll_', ''), 10)) : null;

        if (isRoll && rollId) {
          rollIds.push(rollId);
          if (item?.uniqId) rollUuids.push(item.uniqId);
        } else if (typeof id === 'number' || (typeof id === 'string' && !id.startsWith('roll_'))) {
          regularLabelIds.push(id);
          if (item?.uniqId) labelUniqIds.push(item.uniqId);
        }
      }

      // Hapus dari kedua tabel IndexedDB secara permanen dengan pencatatan tombstone
      if (regularLabelIds.length > 0) {
        await db.labels.bulkDelete(regularLabelIds);
        if (labelUniqIds.length > 0) {
          recordTombstones('labels', labelUniqIds);
          deleteMultipleFromSupabase('labels', 'uniq_id', labelUniqIds).catch(() => {});
        }
      }
      if (rollIds.length > 0 && db.data_rolls) {
        // Cari uuid yang mungkin belum ada di labelUniqIds
        const rolls = await db.data_rolls.where('id').anyOf(rollIds).toArray();
        const foundUuids = rolls.map(r => r.uuid).filter(Boolean);
        const allRollUuids = [...new Set([...rollUuids, ...foundUuids])];
        await db.data_rolls.bulkDelete(rollIds);
        if (allRollUuids.length > 0) {
          recordTombstones('data_rolls', allRollUuids);
          deleteMultipleFromSupabase('data_rolls', 'uuid', allRollUuids).catch(() => {});
        }
      }

      const idSet = new Set(ids);
      this.labels = this.labels.filter(l => !idSet.has(l.id));
      assignLotSessionAnchors(this.labels);
      this.selectedIds.clear();
      this.totalDbCount = Math.max(0, this.totalDbCount - ids.length);
      if (this.currentPage > this.totalPages) {
        this.currentPage = Math.max(1, this.totalPages);
      }
      try {
        await pushLocalToSupabase();
        broadcastRealtimeEvent('labels_broadcast', { action: 'delete_selected_labels', count: ids.length });
      } catch (e) {}
    },

    async duplicateLabel(item) {
      const copy = {
        ...item,
        id: undefined,
        uniqId: generateUniqID('LBL'),
        verified: 0,
        verifiedAt: null,
        verifiedBy: null,
        synced: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      delete copy.isDataRoll;
      delete copy.originalRollId;
      copy.isDataRoll = false;
      copy.originalRollId = null;

      const newId = await db.labels.add(copy);
      copy.id = newId;
      const sortKeys = computeLabelSortKeys(copy, copy.mesin || 'SLITTING');
      this.labels.push(markRaw({ ...copy, ...sortKeys }));
      assignLotSessionAnchors(this.labels);
      this.totalDbCount++;
      this.currentPage = this.totalPages;
      return copy;
    },

    async verifyLabels(ids, verifiedBy = 'Data Entry') {
      const now = new Date().toISOString();
      const idList = Array.isArray(ids) ? ids : [ids];
      for (const rawId of idList) {
        const cleanId = (typeof rawId === 'string' && /^\d+$/.test(rawId)) ? parseInt(rawId, 10) : rawId;
        const updated = await db.labels.update(cleanId, {
          verified: 1,
          verifiedAt: now,
          verifiedBy,
          updatedAt: now
        });
        if (updated === 0 && db.data_rolls) {
          await db.data_rolls.update(cleanId, {
            verified: 1,
            verifiedAt: now,
            verifiedBy,
            updatedAt: now
          });
        }
        const idx = this.labels.findIndex(l => l.id === cleanId || l.id == rawId);
        if (idx !== -1) {
          const merged = {
            ...this.labels[idx],
            verified: 1,
            verifiedAt: now,
            verifiedBy,
            updatedAt: now
          };
          const sortKeys = computeLabelSortKeys(merged, merged.mesin || 'SLITTING');
          this.labels[idx] = markRaw({ ...merged, ...sortKeys });
        }
      }

      await this.loadLabels();

      // Auto-sync verified rolls into dataRollStore history batch
      try {
        const { useDataRollStore } = await import('@/stores/dataRollStore');
        const dataRollStore = useDataRollStore();
        await dataRollStore.syncVerifiedDeBatches();
        await dataRollStore.loadRolls();
      } catch (err) {
        console.warn('Auto-sync to dataRollStore:', err);
      }
    },

    async unverifyLabels(ids) {
      const now = new Date().toISOString();
      const idList = Array.isArray(ids) ? ids : [ids];
      for (const rawId of idList) {
        const cleanId = (typeof rawId === 'string' && /^\d+$/.test(rawId)) ? parseInt(rawId, 10) : rawId;
        const updated = await db.labels.update(cleanId, {
          verified: 0,
          verifiedAt: null,
          verifiedBy,
          updatedAt: now
        });
        if (updated === 0 && db.data_rolls) {
          await db.data_rolls.update(cleanId, {
            verified: 0,
            verifiedAt: null,
            verifiedBy: null,
            updatedAt: now
          });
        }
        const idx = this.labels.findIndex(l => l.id === cleanId || l.id == rawId);
        if (idx !== -1) {
          const merged = {
            ...this.labels[idx],
            verified: 0,
            verifiedAt: null,
            verifiedBy: null,
            updatedAt: now
          };
          const sortKeys = computeLabelSortKeys(merged, merged.mesin || 'SLITTING');
          this.labels[idx] = markRaw({ ...merged, ...sortKeys });
        }
      }

      await this.loadLabels();

      try {
        const { useDataRollStore } = await import('@/stores/dataRollStore');
        const dataRollStore = useDataRollStore();
        await dataRollStore.syncVerifiedDeBatches();
        await dataRollStore.loadRolls();
      } catch (err) {
        console.warn('Auto-sync to dataRollStore:', err);
      }
    },

    async updateLabelCell(id, field, value) {
      const now = new Date().toISOString();
      const cleanId = (typeof id === 'string' && /^\d+$/.test(id)) ? parseInt(id, 10) : id;
      const payload = { [field]: value, updatedAt: now };
      const updated = await db.labels.update(cleanId, payload);
      if (updated === 0 && db.data_rolls) {
        await db.data_rolls.update(cleanId, payload);
      }
      const idx = this.labels.findIndex(l => l.id === cleanId || l.id == id);
      if (idx !== -1) {
        const merged = { ...this.labels[idx], ...payload };
        const sortKeys = computeLabelSortKeys(merged, merged.mesin || 'SLITTING');
        this.labels[idx] = markRaw({ ...merged, ...sortKeys });
        assignLotSessionAnchors(this.labels);
      }
    },

    async duplicateLabelsBulk(ids) {
      const idList = Array.isArray(ids) ? ids : [ids];
      const itemsToCopy = this.labels.filter(l => idList.includes(l.id));
      const newItems = [];
      for (const item of itemsToCopy) {
        const copy = {
          ...item,
          id: undefined,
          uniqId: generateUniqID('LBL'),
          verified: 0,
          verifiedAt: null,
          verifiedBy: null,
          synced: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        delete copy.isDataRoll;
        delete copy.originalRollId;
        copy.isDataRoll = false;
        copy.originalRollId = null;

        const newId = await db.labels.add(copy);
        copy.id = newId;
        const sortKeys = computeLabelSortKeys(copy, copy.mesin || 'SLITTING');
        newItems.push(markRaw({ ...copy, ...sortKeys }));
      }
      this.labels.push(...newItems);
      assignLotSessionAnchors(this.labels);
      this.totalDbCount += newItems.length;
      this.currentPage = this.totalPages;
      return newItems;
    },

    async exportToExcel() {
      const { startLoading, stopLoading } = useGlobalLoading();
      startLoading('Menyiapkan data label dari database lokal untuk diekspor ke Excel...');

      try {
        if (this.isWindowed) {
          try {
            await this.loadAllLabels();
          } catch (e) {
            console.warn('Gagal memuat seluruh arsip label dari windowed mode, melanjutkan dengan data lokal saat ini:', e);
          }
        }

        // Ambil data untuk ekspor: prioritaskan filteredLabels yang sedang aktif di layar
        let exportSource = this.filteredLabels;

        // Jika memory store kosong (misal baru buka app offline), ambil langsung dari Dexie IndexedDB lokal
        if (!exportSource || exportSource.length === 0) {
          try {
            const rawDbLabels = await db.labels.toArray();
            if (rawDbLabels && rawDbLabels.length > 0) {
              const currentFilterMesin = (this.filterMesin || 'ALL').toUpperCase();
              if (currentFilterMesin !== 'ALL') {
                exportSource = rawDbLabels.filter(l => (l.mesin || '').toUpperCase() === currentFilterMesin);
              } else {
                exportSource = rawDbLabels;
              }
            }
          } catch (dbErr) {
            console.warn('Gagal membaca data dari db.labels lokal:', dbErr);
          }
        }

        if (!exportSource || exportSource.length === 0) {
          alert('Tidak ada data label yang ditemukan di database lokal untuk diekspor.');
          return;
        }

        let opList = [];
        try {
          const configStore = useConfigStore();
          opList = configStore.operatorList || [];
        } catch (e) {}

        const worksheetData = exportSource.map((item, index) => {
          const cleanParent = extractCleanParentLot(item.lot, item.turunan);
          let opName = item.operator || '';
          let opCode = item.kodeOperator || '';

          if (opList.length > 0) {
            const found = opList.find(o => 
              (opCode && o.kodeOperator && o.kodeOperator.toUpperCase() === opCode.toUpperCase()) ||
              (opName && o.nama && o.nama.toUpperCase() === opName.toUpperCase()) ||
              (opName && o.kodeOperator && o.kodeOperator.toUpperCase() === opName.toUpperCase())
            );
            if (found) {
              opName = found.nama;
              opCode = found.kodeOperator;
            }
          }

          return {
            No: index + 1,
            'UNIQ ID': item.uniqId,
            Tanggal: item.tanggal,
            Mesin: item.mesin,
            Operator: opName || (opCode ? `OPERATOR ${opCode}` : 'OPERATOR'),
            'Kode Operator': opCode,
            Supplier: item.supplier || 'INHOUSE',
            SPK: item.spk,
            'No Lot': cleanParent, // Bersih dari turunan!
            Turunan: item.turunan || '',
            Jenis: item.jenis,
            Type: item.type,
            OD: item.od,
            Treatment: item.treatment,
            Thickness: item.thickness,
            Width: item.width,
            Length: item.length,
            Joint: item.joint,
            Meter: item.meter,
            Kode: item.kode,
            'Kode Pack': item.kodePack,
            'Sub Kode': item.subKode,
            Status: item.status,
            Netto: item.netto,
            'Paper Core': item.paperCore,
            Keterangan: item.keterangan
          };
        });

        const ws = XLSX.utils.json_to_sheet(worksheetData);
        const wb = XLSX.utils.book_new();
        const sheetName = this.filterMesin && this.filterMesin !== 'ALL' ? `Label ${this.filterMesin}` : 'Data Label';
        XLSX.utils.book_append_sheet(wb, ws, sheetName.slice(0, 31));

        const machineTag = this.filterMesin && this.filterMesin !== 'ALL' ? `_${this.filterMesin}` : '';
        const todayStr = new Date().toISOString().slice(0, 10);
        XLSX.writeFile(wb, `LabelData${machineTag}_${todayStr}.xlsx`);
      } catch (err) {
        console.error('Gagal mengekspor data ke Excel:', err);
        alert('Terjadi kesalahan saat mengekspor ke Excel: ' + (err?.message || err));
      } finally {
        stopLoading();
      }
    }
  }
});

// Auto-reload labelStore whenever cloud sync or realtime updates labels (debounced)
if (typeof window !== 'undefined' && !window.__mlabel_label_sync_listener_attached) {
  window.__mlabel_label_sync_listener_attached = true;
  let reloadTimer = null;
  window.addEventListener('sync:labels-updated', () => {
    if (reloadTimer) clearTimeout(reloadTimer);
    reloadTimer = setTimeout(async () => {
      try {
        const store = useLabelStore();
        await store.loadLabels(true);
      } catch (e) {
        console.warn('Auto reload labelStore failed:', e);
      }
    }, 300);
  });
}
