import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useConfigStore } from '@/stores/configStore';
import { getSetting, saveSetting } from '@/db';

/**
 * 3 Weekly Rotation Patterns:
 * Index 0 (Pola 1 - Pagi): Sen-Kam (1), Jum (LS1), Sab (OFF), Min (LS2)
 * Index 1 (Pola 3 - Malam): Sen-Kam (3), Jum (LS2), Sab (LS2), Min (OFF)
 * Index 2 (Pola 2 - Sore): Sen-Kam (2), Jum (OFF), Sab (LS1), Min (LS1)
 */
export const SHIFT_PATTERNS = {
  PATTERN_1: ['1', '1', '1', '1', 'LS1', 'OFF', 'LS2'], // Pola Shift 1
  PATTERN_3: ['3', '3', '3', '3', 'LS2', 'LS2', 'OFF'], // Pola Shift 3
  PATTERN_2: ['2', '2', '2', '2', 'OFF', 'LS1', 'LS1'], // Pola Shift 2
};

export const ROTATION_CYCLE = [
  SHIFT_PATTERNS.PATTERN_1,
  SHIFT_PATTERNS.PATTERN_3,
  SHIFT_PATTERNS.PATTERN_2
];

export const SHIFT_DEFINITIONS = {
  '1': {
    name: 'Shift 1 (Pagi)',
    shortName: 'Shift 1',
    code: '1',
    type: 'SHORT',
    durationHours: 8,
    startTime: '07:00',
    endTime: '15:00',
    color: '#2563eb', // Blue
    bgColor: '#dbeafe',
    textColor: '#1e40af',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  '2': {
    name: 'Shift 2 (Sore)',
    shortName: 'Shift 2',
    code: '2',
    type: 'SHORT',
    durationHours: 8,
    startTime: '15:00',
    endTime: '23:00',
    color: '#d97706', // Amber
    bgColor: '#fef3c7',
    textColor: '#92400e',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  '3': {
    name: 'Shift 3 (Malam)',
    shortName: 'Shift 3',
    code: '3',
    type: 'SHORT',
    durationHours: 8,
    startTime: '23:00',
    endTime: '07:00',
    color: '#4f46e5', // Indigo
    bgColor: '#e0e7ff',
    textColor: '#3730a3',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  },
  'LS1': {
    name: 'Long Shift 1 (Siang 12 Jam)',
    shortName: 'LS 1',
    code: 'LS1',
    type: 'LONG',
    durationHours: 12,
    startTime: '07:00',
    endTime: '19:00',
    color: '#059669', // Emerald
    bgColor: '#d1fae5',
    textColor: '#065f46',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  'LS2': {
    name: 'Long Shift 2 (Malam 12 Jam)',
    shortName: 'LS 2',
    code: 'LS2',
    type: 'LONG',
    durationHours: 12,
    startTime: '19:00',
    endTime: '07:00',
    color: '#7c3aed', // Purple
    bgColor: '#ede9fe',
    textColor: '#5b21b6',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  'OFF': {
    name: 'Libur (Day Off)',
    shortName: 'OFF',
    code: 'OFF',
    type: 'OFF',
    durationHours: 0,
    startTime: '—',
    endTime: '—',
    color: '#6b7280', // Gray
    bgColor: '#f3f4f6',
    textColor: '#374151',
    badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-300'
  },
  'NONSHIFT': {
    name: 'Non-Shift / Normal',
    shortName: 'Normal',
    code: 'NONSHIFT',
    type: 'NORMAL',
    durationHours: 8,
    startTime: '08:00',
    endTime: '17:00',
    color: '#0891b2', // Cyan
    bgColor: '#cffafe',
    textColor: '#155e75',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-300'
  }
};

/**
 * Anchor Date: 2026-08-31 (Senin)
 * Pada minggu ini:
 * - Grup C: Pola 1 (Shift 1) -> index 0
 * - Grup A: Pola 2 (Shift 2) -> index 2
 * - Grup B: Pola 3 (Shift 3) -> index 1
 */
export const DEFAULT_ANCHOR_DATE = '2026-08-31';

/**
 * Menghitung tanggal hari kerja (Work Date) produksi.
 * Aturan perusahaan:
 * Pergantian hari kerja di-reset setiap jam 07:00 pagi.
 * - Jam 07:00:00 s/d 23:59:59 = Tanggal hari ini (kalender berjalan)
 * - Jam 00:00:00 s/d 06:59:59 = Masih terhitung tanggal kemarin (Shift 3 / LS2 semalam)
 */
export const getWorkDate = (dateInput = null) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 10);

  const currentHour = d.getHours();
  const workDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  if (currentHour < 7) {
    workDate.setDate(workDate.getDate() - 1);
  }
  const year = workDate.getFullYear();
  const month = String(workDate.getMonth() + 1).padStart(2, '0');
  const day = String(workDate.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const useScheduleStore = defineStore('scheduleStore', () => {
  const configStore = useConfigStore();

  const anchorMonday = ref(DEFAULT_ANCHOR_DATE);
  const showShiftHandoverModal = ref(false);
  const lastHandoverConfirmedAt = ref(null);

  // Live Reactive Clock (memastikan transisi shift terdeteksi otomatis tanpa refresh browser)
  const currentNow = ref(new Date());
  let liveClockTimer = null;
  const initLiveClock = () => {
    if (liveClockTimer) return;
    liveClockTimer = setInterval(() => {
      currentNow.value = new Date();
    }, 5000); // Evaluasi setiap 5 detik
  };
  initLiveClock();

  const tickLiveClock = () => {
    currentNow.value = new Date();
  };

  // Active confirmed roster for each machine station
  const confirmedRoster = ref({
    CASTING: null,   // { operator: 'SUDARMAJI', kodeOperator: 'A', group: 'A', isSubstituted: false, note: '' }
    METALIZE: null,
    SLITTING: null,
    REWIND: null
  });
  const confirmedRosterShift = ref('');
  const confirmedRosterDate = ref('');

  // Daily Shift Overrides: menyimpan penyesuaian manual/darurat mode shift (e.g. 12 Jam Long Shift)
  // Format: { [dateStr]: { isLongShift: true, machines: { SLITTING: true, ... }, note: 'Operator sakit' } }
  const dailyShiftOverrides = ref({});

  const normalizeMachineKey = (name) => {
    if (!name) return null;
    const s = String(name).toUpperCase();
    if (s.includes('CAST')) return 'CASTING';
    if (s.includes('MET')) return 'METALIZE';
    if (s.includes('REW')) return 'REWIND';
    if (s.includes('SLIT')) return 'SLITTING';
    return null;
  };

  const isDateLongShift = (dateStr, machineName = null) => {
    if (!dateStr) return false;
    const cleanD = String(dateStr).slice(0, 10);
    if (dailyShiftOverrides.value && dailyShiftOverrides.value[cleanD] !== undefined) {
      const entry = dailyShiftOverrides.value[cleanD];
      if (machineName && entry.machines) {
        const cleanM = normalizeMachineKey(machineName);
        if (cleanM && entry.machines[cleanM] !== undefined) {
          return Boolean(entry.machines[cleanM]);
        }
      }
      return Boolean(entry.isLongShift);
    }
    const dayIdx = getDayIndex(cleanD);
    return dayIdx >= 4; // Jumat(4), Sabtu(5), Minggu(6)
  };

  const getMachinesShiftMap = (dateStr) => {
    const cleanD = String(dateStr || '').slice(0, 10);
    const machines = ['CASTING', 'METALIZE', 'SLITTING', 'REWIND'];
    const res = {};
    for (const m of machines) {
      res[m] = isDateLongShift(cleanD, m);
    }
    return res;
  };

  const setShiftModeOverride = async (dateStr, isLongShift, machines = null, note = '') => {
    if (!dateStr) return;
    const cleanD = String(dateStr).slice(0, 10);
    const existingEntry = dailyShiftOverrides.value[cleanD] || {};
    const existingMachines = existingEntry.machines || {
      CASTING: existingEntry.isLongShift ?? isLongShift,
      METALIZE: existingEntry.isLongShift ?? isLongShift,
      SLITTING: existingEntry.isLongShift ?? isLongShift,
      REWIND: existingEntry.isLongShift ?? isLongShift
    };

    const finalMachines = machines 
      ? { ...existingMachines, ...machines }
      : { CASTING: isLongShift, METALIZE: isLongShift, SLITTING: isLongShift, REWIND: isLongShift };

    const anyLong = Object.values(finalMachines).some(Boolean);

    dailyShiftOverrides.value = {
      ...dailyShiftOverrides.value,
      [cleanD]: {
        isLongShift: anyLong,
        machines: finalMachines,
        note: note || existingEntry.note || '',
        updatedAt: new Date().toISOString()
      }
    };
    try {
      await saveSetting('confirmed_shift_overrides', dailyShiftOverrides.value);
    } catch (e) {
      console.error('Failed to save shift override:', e);
    }
    tickLiveClock();
  };

  const setMachineShiftModeOverride = async (dateStr, machineName, isLongShift, note = '') => {
    if (!dateStr || !machineName) return;
    const cleanM = normalizeMachineKey(machineName);
    if (!cleanM) return;
    const currentMachines = getMachinesShiftMap(dateStr);
    const updatedMachines = {
      ...currentMachines,
      [cleanM]: Boolean(isLongShift)
    };
    const anyLong = Object.values(updatedMachines).some(Boolean);
    await setShiftModeOverride(dateStr, anyLong, updatedMachines, note || `Mode ${cleanM} diset ke ${isLongShift ? '12 Jam' : '8 Jam'}`);
  };

  // Helper to parse 'YYYY-MM-DD' safely without timezone offset issues
  const parseDateOnly = (dateStr) => {
    if (!dateStr) return new Date();
    if (typeof dateStr === 'object' && dateStr instanceof Date) {
      return new Date(dateStr.getFullYear(), dateStr.getMonth(), dateStr.getDate());
    }
    const parts = String(dateStr).split('T')[0].split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  };

  // Calculate week difference from anchor Monday
  const getWeekOffset = (dateStr) => {
    const d = parseDateOnly(dateStr);
    const anchor = parseDateOnly(anchorMonday.value);

    // Normalize to Monday of that week
    const dDayIdx = (d.getDay() + 6) % 7; // Mon=0..Sun=6
    const dMonday = new Date(d);
    dMonday.setDate(d.getDate() - dDayIdx);

    const diffDays = Math.round((dMonday.getTime() - anchor.getTime()) / (1000 * 60 * 60 * 24));
    return Math.round(diffDays / 7);
  };

  // Day of week index: 0 = Senin, 1 = Selasa, ..., 6 = Minggu
  const getDayIndex = (dateStr) => {
    const d = parseDateOnly(dateStr);
    const day = d.getDay(); // 0 is Sunday, 1 is Monday...
    return (day + 6) % 7; // Convert to 0=Mon, 1=Tue... 6=Sun
  };

  /**
   * Mengambil kode shift ('1', '2', '3', 'LS1', 'LS2', 'OFF', 'NONSHIFT')
   * untuk grup tertentu pada tanggal tertentu.
   */
  const getShiftForGroupAndDate = (groupCode, dateStr) => {
    const cleanGroup = String(groupCode || '').trim().toUpperCase();
    if (cleanGroup === 'NON-GRUP' || cleanGroup === 'NONGRUP' || cleanGroup === 'NONSHIFT') {
      const dayIdx = getDayIndex(dateStr);
      // Sabtu/Minggu libur untuk non-shift
      if (dayIdx === 5 || dayIdx === 6) return 'OFF';
      return 'NONSHIFT';
    }

    const weekOffset = getWeekOffset(dateStr);
    const dayIdx = getDayIndex(dateStr);

    // At anchor week (2026-08-31):
    // Grup C = Index 0 (Pattern 1: Shift 1)
    // Grup A = Index 2 (Pattern 2: Shift 2)
    // Grup B = Index 1 (Pattern 3: Shift 3)
    let basePatternIdx = 0;
    if (cleanGroup === 'C' || cleanGroup === 'GRUP C') basePatternIdx = 0;
    else if (cleanGroup === 'A' || cleanGroup === 'GRUP A') basePatternIdx = 2;
    else if (cleanGroup === 'B' || cleanGroup === 'GRUP B') basePatternIdx = 1;

    // Rotation progression: each week moves to next pattern in ROTATION_CYCLE [Pattern 1, Pattern 3, Pattern 2]
    const cycleIdx = ((basePatternIdx + weekOffset) % 3 + 3) % 3;
    const pattern = ROTATION_CYCLE[cycleIdx];

    return pattern[dayIdx] || 'OFF';
  };

  /**
   * Mendeteksi shift mana yang sedang berjalan saat ini (berdasarkan jam lokal sekarang).
   * Pergantian hari kerja di-reset setiap jam 07:00 pagi.
   * Mendukung evaluasi spesifik per mesin (misal hanya 1 mesin yang shift panjang 12 jam).
   */
  const getCurrentShiftInfo = (customDate = null, machineName = null) => {
    const nowDate = customDate || currentNow.value;

    // 1. Tanggal Hari Kerja Produksi (reset setiap jam 07:00 pagi)
    const workDateStr = getWorkDate(nowDate);

    // Tanggal aktual kalender
    const actualYear = nowDate.getFullYear();
    const actualMonth = String(nowDate.getMonth() + 1).padStart(2, '0');
    const actualDay = String(nowDate.getDate()).padStart(2, '0');
    const actualDateStr = `${actualYear}-${actualMonth}-${actualDay}`;

    const hours = nowDate.getHours();
    const minutes = nowDate.getMinutes();
    const timeVal = hours + minutes / 60; // e.g. 17.5 = 17:30

    // Evaluasi pola hari berdasarkan HARI KERJA (workDateStr), status override, dan spesifik mesin
    const isLongShiftDay = isDateLongShift(workDateStr, machineName);

    let currentShiftCode = '1';

    if (isLongShiftDay) {
      // Long shift days (Jumat, Sabtu, Minggu, atau hari kerja yang di-override 12 Jam)
      // LS1: 07:00 - 19:00
      // LS2: 19:00 - 07:00 (mencakup 19:00-23:59 hari kerja dan 00:00-06:59 keesokan harinya)
      if (timeVal >= 7 && timeVal < 19) {
        currentShiftCode = 'LS1';
      } else {
        currentShiftCode = 'LS2';
      }
    } else {
      // Weekdays (Senin-Kamis normal 8 jam)
      // Shift 1: 07:00 - 15:00
      // Shift 2: 15:00 - 23:00
      // Shift 3: 23:00 - 07:00 (mencakup 23:00-23:59 hari kerja dan 00:00-06:59 keesokan harinya)
      if (timeVal >= 7 && timeVal < 15) {
        currentShiftCode = '1';
      } else if (timeVal >= 15 && timeVal < 23) {
        currentShiftCode = '2';
      } else {
        currentShiftCode = '3';
      }
    }

    // Cari grup yang ditugaskan pada currentShiftCode pada HARI KERJA workDateStr
    let currentShiftGroup = 'C';
    const groups = ['A', 'B', 'C'];
    for (const g of groups) {
      if (getShiftForGroupAndDate(g, workDateStr) === currentShiftCode) {
        currentShiftGroup = g;
        break;
      }
    }

    const definition = SHIFT_DEFINITIONS[currentShiftCode] || SHIFT_DEFINITIONS['1'];

    return {
      date: workDateStr, // Tanggal hari kerja (tercatat di label & laporan)
      actualDate: actualDateStr, // Tanggal kalender aktual saat label dibuat
      timeString: nowDate.toTimeString().slice(0, 5),
      shiftCode: currentShiftCode,
      group: currentShiftGroup,
      definition,
      isLongShift: definition.type === 'LONG',
      machineName: normalizeMachineKey(machineName) || null
    };
  };

  /**
   * Mendapatkan pasangan shift untuk Serah Terima (Handover):
   * 1. previousShift: Shift yang TELAH bekerja / baru saja selesai
   * 2. upcomingShift: Shift yang AKAN bekerja / bertugas berikutnya (atau shift yang sedang berjalan)
   * Mengikuti aturan pergantian hari kerja jam 07:00 pagi.
   */
  const getHandoverShifts = (customDate = null, machineName = null) => {
    const nowDate = customDate || currentNow.value;

    // Tanggal aktual kalender
    const calYear = nowDate.getFullYear();
    const calMonth = String(nowDate.getMonth() + 1).padStart(2, '0');
    const calDay = String(nowDate.getDate()).padStart(2, '0');
    const calendarDateStr = `${calYear}-${calMonth}-${calDay}`;

    // Tanggal kemarin kalender
    const yCalDate = new Date(nowDate);
    yCalDate.setDate(yCalDate.getDate() - 1);
    const yesterdayCalStr = `${yCalDate.getFullYear()}-${String(yCalDate.getMonth() + 1).padStart(2, '0')}-${String(yCalDate.getDate()).padStart(2, '0')}`;

    const hours = nowDate.getHours();
    const minutes = nowDate.getMinutes();
    const timeVal = hours + minutes / 60; // Desimal jam (misal 18:05 = 18.083)

    // Tentukan hari kerja saat ini (reset setiap jam 07:00 pagi)
    const workDateStr = getWorkDate(nowDate);
    const isWorkLongShift = isDateLongShift(workDateStr, machineName); // Mendukung override manual 12 jam per mesin

    let prevShiftCode = '1';
    let prevDate = workDateStr;
    let upShiftCode = '2';
    let upDate = workDateStr;

    // EVALUASI POLA HARI KERJA:
    if (isWorkLongShift) {
      // Hari Long Shift: LS1 (07:00 - 19:00), LS2 (19:00 - 07:00)
      if (timeVal >= 7.0 && timeVal < 19.0) {
        // Saat ini sedang berlangsung LS1 (atau handover masuk ke LS1)
        upShiftCode = 'LS1';
        upDate = workDateStr;

        // Shift sebelumnya adalah shift malam yang baru selesai di jam 07:00 pagi (hari kerja kemarin)
        prevDate = yesterdayCalStr;
        const prevIsLong = isDateLongShift(prevDate, machineName);
        prevShiftCode = prevIsLong ? 'LS2' : '3';
      } else {
        // Saat ini sedang berlangsung LS2 (19:00 - 07:00)
        upShiftCode = 'LS2';
        upDate = workDateStr;

        // Shift sebelumnya adalah LS1 pada hari kerja yang sama
        prevShiftCode = 'LS1';
        prevDate = workDateStr;
      }
    } else {
      // Hari Reguler 8 Jam (Senin - Kamis normal):
      // Shift 1: 07:00 - 15:00
      // Shift 2: 15:00 - 23:00
      // Shift 3: 23:00 - 07:00 (reset jam 07:00 pagi)
      if (timeVal >= 7.0 && timeVal < 15.0) {
        // Shift 1 (Pagi)
        upShiftCode = '1';
        upDate = workDateStr;

        // Shift sebelumnya adalah Shift 3 / LS2 hari kemarin
        prevDate = yesterdayCalStr;
        const prevIsLong = isDateLongShift(prevDate, machineName);
        prevShiftCode = prevIsLong ? 'LS2' : '3';
      } else if (timeVal >= 15.0 && timeVal < 23.0) {
        // Shift 2 (Sore)
        upShiftCode = '2';
        upDate = workDateStr;

        // Shift sebelumnya adalah Shift 1 pada hari yang sama
        prevShiftCode = '1';
        prevDate = workDateStr;
      } else {
        // Shift 3 (Malam)
        upShiftCode = '3';
        upDate = workDateStr;

        // Shift sebelumnya adalah Shift 2 pada hari kerja yang sama
        prevShiftCode = '2';
        prevDate = workDateStr;
      }
    }

    const resolveGroup = (code, dStr) => {
      const groups = ['A', 'B', 'C'];
      for (const g of groups) {
        if (getShiftForGroupAndDate(g, dStr) === code) return g;
      }
      return 'A';
    };

    const prevGroup = resolveGroup(prevShiftCode, prevDate);
    const upGroup = resolveGroup(upShiftCode, upDate);

    const prevDef = SHIFT_DEFINITIONS[prevShiftCode] || SHIFT_DEFINITIONS['1'];
    const upDef = SHIFT_DEFINITIONS[upShiftCode] || SHIFT_DEFINITIONS['2'];

    return {
      previousShift: {
        date: prevDate,
        shiftCode: prevShiftCode,
        group: prevGroup,
        definition: prevDef,
        isLongShift: prevDef.type === 'LONG'
      },
      upcomingShift: {
        date: upDate,
        shiftCode: upShiftCode,
        group: upGroup,
        definition: upDef,
        isLongShift: upDef.type === 'LONG'
      }
    };
  };

  /**
   * Mengambil daftar operator terjadwal untuk setiap mesin pada shift tertentu.
   */
  const getScheduledOperators = (dateStr, shiftCode, targetGroup = null) => {
    let assignedGroup = targetGroup;
    if (!assignedGroup) {
      const groups = ['A', 'B', 'C'];
      for (const g of groups) {
        if (getShiftForGroupAndDate(g, dateStr) === shiftCode) {
          assignedGroup = g;
          break;
        }
      }
    }

    const allOps = configStore.operatorList || [];
    const machines = ['CASTING', 'METALIZE', 'SLITTING', 'REWIND'];
    const roster = {};

    const cleanGroup = (val) => String(val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^GR(O)?UP/, '').trim();

    for (const m of machines) {
      const matched = allOps.filter(o => {
        if (o.active === false) return false;
        const opMesin = String(o.mesin || '').toUpperCase().trim();
        const machineMatches = opMesin === m || opMesin.includes(m) || m.includes(opMesin);
        if (!machineMatches) return false;

        const opGrup = cleanGroup(o.kodeGrup);
        const targetGrup = cleanGroup(assignedGroup);
        return opGrup === targetGrup;
      });

      roster[m] = matched.length > 0 ? matched[0] : null;
    }

    return {
      group: assignedGroup,
      roster
    };
  };

  // Confirm Handover Roster
  const confirmShiftHandover = async (rosterData, options = {}) => {
    const shift = currentHandoverShifts.value?.upcomingShift || currentShift.value;
    confirmedRoster.value = { ...rosterData };
    confirmedRosterShift.value = shift ? shift.shiftCode : '';
    confirmedRosterDate.value = shift ? shift.date : '';
    lastHandoverConfirmedAt.value = new Date().toISOString();
    showShiftHandoverModal.value = false;

    if (options && options.isLongShift !== undefined && shift) {
      await setShiftModeOverride(shift.date, options.isLongShift, options.machines, options.note);
    }

    try {
      await saveSetting('confirmed_shift_roster', confirmedRoster.value);
      await saveSetting('confirmed_shift_code', confirmedRosterShift.value);
      await saveSetting('confirmed_shift_date', confirmedRosterDate.value);
      await saveSetting('last_handover_time', lastHandoverConfirmedAt.value);
    } catch (e) {
      console.error('Failed to persist shift roster:', e);
    }
  };

  // Load persisted roster on startup
  const loadConfirmedRoster = async () => {
    try {
      const savedRoster = await getSetting('confirmed_shift_roster', null);
      if (savedRoster) confirmedRoster.value = savedRoster;

      const savedShift = await getSetting('confirmed_shift_code', '');
      if (savedShift) confirmedRosterShift.value = savedShift;

      const savedDate = await getSetting('confirmed_shift_date', '');
      if (savedDate) confirmedRosterDate.value = savedDate;

      const savedTime = await getSetting('last_handover_time', null);
      if (savedTime) lastHandoverConfirmedAt.value = savedTime;

      const savedAnchor = await getSetting('schedule_anchor_date', null);
      if (savedAnchor) anchorMonday.value = savedAnchor;

      const savedOverrides = await getSetting('confirmed_shift_overrides', null);
      if (savedOverrides) dailyShiftOverrides.value = savedOverrides;
    } catch (e) {
      console.error('Failed to load schedule state:', e);
    }
  };

  /**
   * Ekstraksi informasi operator dari catatan roll (turunan, kodeOperator, atau operator field).
   */
  const extractOperatorFromRoll = (roll, operatorList = null) => {
    const ops = operatorList || configStore.operatorList || [];

    // 1. Explicit operator name
    const rawOpName = String(roll.operator || '').trim();
    if (rawOpName) {
      const matched = ops.find(o => o.nama && o.nama.toUpperCase() === rawOpName.toUpperCase());
      if (matched) return { ...matched, source: 'operator' };
    }

    // 2. Explicit kodeOperator
    const rawKode = String(roll.kodeOperator || '').trim().toUpperCase();
    if (rawKode) {
      const matched = ops.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawKode);
      if (matched) return { ...matched, source: 'kodeOperator' };
    }

    // 3. Extract from turunan string
    const t = String(roll.turunan || '').trim().toUpperCase();
    if (t) {
      // Mesin Rewind: [JK][12][0-9]+
      const mRewind = t.match(/^([JK])(\d)/);
      if (mRewind) {
        const code = mRewind[1];
        const matched = ops.find(o => o.kodeOperator === code);
        if (matched) return { ...matched, detectedShift: mRewind[2], source: 'turunan' };
        return { kodeOperator: code, nama: code === 'J' ? 'DZAKI' : 'DAVVA', mesin: 'REWIND', detectedShift: mRewind[2], source: 'turunan' };
      }

      // Mesin Slitting: [GHI][ACD][0-9]+
      const mSlit = t.match(/^([GHI])([ACD])/);
      if (mSlit) {
        const code = mSlit[1];
        const matched = ops.find(o => o.kodeOperator === code);
        if (matched) return { ...matched, arm: mSlit[2], source: 'turunan' };
        const fallbackNames = { 'G': 'SANAN', 'H': 'UMAR', 'I': 'HENDRI' };
        return { kodeOperator: code, nama: fallbackNames[code] || code, mesin: 'SLITTING', arm: mSlit[2], source: 'turunan' };
      }

      // Generic first character match
      const firstChar = t.charAt(0);
      const matched = ops.find(o => o.kodeOperator === firstChar);
      if (matched) return { ...matched, source: 'turunanPrefix' };
    }

    return null;
  };

  /**
   * Deteksi Cerdas Mode Shift Hari Kerja (Normal 8 Jam vs Long Shift 12 Jam):
   * - Mesin 24 Jam (Slitting, Casting, Metalize): jika hanya ada 2 operator aktif -> Long Shift (12 Jam)!
   * - Mesin Rewind: jika kedua operator aktif, roll >= 8, dan pembagian shift seimbang -> Long Shift!
   */
  const detectWorkDateShiftMode = (dateStr, rollsData = []) => {
    const cleanD = String(dateStr || '').slice(0, 10);
    const opList = configStore.operatorList || [];

    // Filter rolls for this date
    const dayRolls = (rollsData || []).filter(r => {
      const rd = String(r.tanggalFormatted || r.tanggal || r.createdAt || '').slice(0, 10);
      return rd === cleanD;
    });

    const isOverridden = dailyShiftOverrides.value && dailyShiftOverrides.value[cleanD];
    const defaultIsLong = isDateLongShift(cleanD);

    if (dayRolls.length === 0) {
      return {
        date: cleanD,
        hasData: false,
        totalRolls: 0,
        isLongShift: defaultIsLong,
        isOverridden: Boolean(isOverridden),
        overrideNote: isOverridden ? isOverridden.note : '',
        detectedMode: defaultIsLong ? 'LONG' : 'SHORT',
        modeLabel: defaultIsLong ? 'Long Shift (12 Jam)' : 'Shift Normal (8 Jam)',
        reason: isOverridden ? 'Dikonfirmasi secara manual' : (defaultIsLong ? 'Jadwal Akhir Pekan (Jumat-Minggu)' : 'Jadwal Standar Hari Kerja'),
        machineAnalysis: {}
      };
    }

    // Group rolls by machine
    const machGroups = { SLITTING: [], REWIND: [], CASTING: [], METALIZE: [] };
    for (const r of dayRolls) {
      let m = 'SLITTING';
      const rawM = String(r.machineName || r.mesin || '').toUpperCase();
      if (rawM.includes('REWIND') || r.rewind === 1 || r.rewind === '1') m = 'REWIND';
      else if (rawM.includes('CAST') || r.casting === 1 || r.casting === '1') m = 'CASTING';
      else if (rawM.includes('MET') || r.metalize === 1 || r.metalize === '1') m = 'METALIZE';
      else m = 'SLITTING';

      if (!machGroups[m]) machGroups[m] = [];
      machGroups[m].push(r);
    }

    const machineAnalysis = {};
    let slittingIsLong = null;
    let longShiftMachineCount = 0;
    let active24hMachineCount = 0;

    // 1. Evaluasi Mesin 24 Jam (SLITTING, CASTING, METALIZE)
    for (const mKey of ['SLITTING', 'CASTING', 'METALIZE']) {
      const mRolls = machGroups[mKey] || [];
      if (mRolls.length === 0) {
        machineAnalysis[mKey] = { active: false, rollCount: 0, uniqueOps: [], isLongShift: false, reason: 'Tidak ada produksi' };
        continue;
      }
      active24hMachineCount++;
      const opMap = new Map();
      for (const r of mRolls) {
        const op = extractOperatorFromRoll(r, opList);
        if (op && (op.kodeOperator || op.nama)) {
          const key = (op.kodeOperator || op.nama).toUpperCase();
          opMap.set(key, op.nama || key);
        }
      }
      const uniqueOps = Array.from(opMap.values());
      const opCount = uniqueOps.length;

      // Rule: 2 operator unik dalam 24 jam = Long Shift 12 Jam!
      const isLong = opCount === 2 && mRolls.length >= 2;
      if (isLong) longShiftMachineCount++;
      if (mKey === 'SLITTING') slittingIsLong = isLong;

      machineAnalysis[mKey] = {
        active: true,
        rollCount: mRolls.length,
        opCount,
        uniqueOps,
        isLongShift: isLong,
        reason: isLong 
          ? `Terdeteksi 2 operator dalam 24 jam (${uniqueOps.join(', ')}) → Long Shift (12 Jam)`
          : (opCount >= 3 ? `Terdeteksi 3 operator (${uniqueOps.join(', ')}) → Shift Normal (8 Jam)` : `Hanya 1 operator aktif (${uniqueOps.join(', ') || 'Anonim'})`)
      };
    }

    // 2. Evaluasi Mesin REWIND
    const rewindRolls = machGroups['REWIND'] || [];
    if (rewindRolls.length > 0) {
      let s1 = 0;
      let s2 = 0;
      const opMap = new Map();
      for (const r of rewindRolls) {
        const op = extractOperatorFromRoll(r, opList);
        if (op) {
          const key = (op.kodeOperator || op.nama).toUpperCase();
          opMap.set(key, op.nama || key);
          if (op.detectedShift === '1' || r.shift === '1' || r.shift === 1) s1++;
          else if (op.detectedShift === '2' || r.shift === '2' || r.shift === 2) s2++;
        } else {
          if (r.shift === '1' || r.shift === 1) s1++;
          else if (r.shift === '2' || r.shift === 2) s2++;
        }
      }
      const tot = rewindRolls.length;
      const uniqueOps = Array.from(opMap.values());
      const hasBothOps = (opMap.has('J') && opMap.has('K')) || (s1 > 0 && s2 > 0);
      const isHighVolume = tot >= 8;
      const balanceRatio = tot > 0 ? Math.min(s1, s2) / tot : 0;
      const isBalanced = balanceRatio >= 0.35;

      const isRewindLong = hasBothOps && isHighVolume && isBalanced;
      machineAnalysis['REWIND'] = {
        active: true,
        rollCount: tot,
        opCount: uniqueOps.length,
        uniqueOps,
        shift1Count: s1,
        shift2Count: s2,
        balancePercent: Math.round(balanceRatio * 100),
        isLongShift: isRewindLong,
        reason: isRewindLong
          ? `Volume tinggi (${tot} roll) & seimbang (${s1} Shift 1 vs ${s2} Shift 2) → Long Shift (12 Jam)`
          : (tot < 8 ? `Volume rendah (${tot} roll) → Pengerjaan parsial/normal` : `Distribusi tidak seimbang (${s1} vs ${s2})`)
      };
    } else {
      machineAnalysis['REWIND'] = { active: false, rollCount: 0, uniqueOps: [], isLongShift: false, reason: 'Tidak ada produksi' };
    }

    // 3. Keputusan Keseluruhan Hari Kerja
    let finalIsLong = false;
    let finalReason = '';

    if (isOverridden) {
      finalIsLong = Boolean(isOverridden.isLongShift);
      finalReason = `Dikonfirmasi manual: ${isOverridden.note || (finalIsLong ? 'Long Shift (12 Jam)' : 'Normal (8 Jam)')}`;
    } else if (slittingIsLong !== null) {
      finalIsLong = slittingIsLong;
      finalReason = machineAnalysis['SLITTING'].reason;
    } else if (active24hMachineCount > 0) {
      finalIsLong = longShiftMachineCount >= Math.ceil(active24hMachineCount / 2);
      finalReason = `${longShiftMachineCount} dari ${active24hMachineCount} mesin utama terdeteksi long shift`;
    } else if (rewindRolls.length > 0) {
      finalIsLong = machineAnalysis['REWIND'].isLongShift;
      finalReason = machineAnalysis['REWIND'].reason;
    } else {
      finalIsLong = defaultIsLong;
      finalReason = finalIsLong ? 'Jadwal Akhir Pekan (12 Jam)' : 'Jadwal Reguler (8 Jam)';
    }

    return {
      date: cleanD,
      hasData: true,
      totalRolls: dayRolls.length,
      isLongShift: finalIsLong,
      isOverridden: Boolean(isOverridden),
      detectedMode: finalIsLong ? 'LONG' : 'SHORT',
      modeLabel: finalIsLong ? 'Long Shift (12 Jam)' : 'Shift Normal (8 Jam)',
      reason: finalReason,
      machineAnalysis
    };
  };

  /**
   * Rekap Komparasi Rencana vs Realisasi Aktual (Data Roll) per Hari Kerja:
   */
  const getActualWorkHistory = (dateStr, rollsData = [], labelsData = []) => {
    const cleanD = String(dateStr || '').slice(0, 10);
    const opList = configStore.operatorList || [];
    const shiftMode = detectWorkDateShiftMode(cleanD, rollsData);

    // Ambil data roll pada tanggal ini
    const dayRolls = (rollsData || []).filter(r => {
      const rd = String(r.tanggalFormatted || r.tanggal || r.createdAt || '').slice(0, 10);
      return rd === cleanD;
    });

    const stations = [
      { machine: 'SLITTING', icon: '✂️', name: 'Slitting Machine' },
      { machine: 'REWIND', icon: '🔄', name: 'Rewind Machine' },
      { machine: 'CASTING', icon: '🏭', name: 'Casting Station' },
      { machine: 'METALIZE', icon: '✨', name: 'Metalize Chamber' },
    ];

    let grandChildCount = 0;
    let grandParentCount = 0;
    let grandNetto = 0;
    let grandMeter = 0;
    let grandPass = 0;
    let grandHold = 0;
    let grandReject = 0;

    const stationRecords = stations.map(station => {
      const mKey = station.machine;
      const mRolls = dayRolls.filter(r => {
        const rawM = String(r.machineName || r.mesin || '').toUpperCase();
        if (mKey === 'REWIND') return rawM.includes('REWIND') || r.rewind === 1 || r.rewind === '1';
        if (mKey === 'CASTING') return rawM.includes('CAST') || r.casting === 1 || r.casting === '1';
        if (mKey === 'METALIZE') return rawM.includes('MET') || r.metalize === 1 || r.metalize === '1';
        return rawM.includes('SLIT') || r.slitting === 1 || r.slitting === '1' || (!rawM && mKey === 'SLITTING');
      });

      // Scheduled operator (Rencana) spesifik per mesin
      const isMachLong = isDateLongShift(cleanD, mKey);
      const scheduledShiftCode = isMachLong ? 'LS1' : '1';
      const scheduled = getScheduledOperators(cleanD, scheduledShiftCode);
      const scheduledOp = scheduled.roster[mKey] || null;

      // Actual operators (Realisasi)
      const opMap = new Map();
      const parentSet = new Set();
      const spkMap = {};
      let netto = 0;
      let meter = 0;
      let pass = 0;
      let hold = 0;
      let reject = 0;

      for (const r of mRolls) {
        const op = extractOperatorFromRoll(r, opList);
        if (op && (op.nama || op.kodeOperator)) {
          const key = (op.kodeOperator || op.nama).toUpperCase();
          if (!opMap.has(key)) {
            opMap.set(key, { ...op, rollCount: 0 });
          }
          opMap.get(key).rollCount++;
        }

        const rawParent = (r.parentLot || r.lotInduk || r.lot || '').toString().trim();
        const pClean = rawParent.split('/')[0].trim().toUpperCase();
        if (pClean) parentSet.add(pClean);

        netto += parseFloat(r.netto || r.berat || 0) || 0;
        meter += parseFloat(r.length || r.meter || 0) || 0;

        const st = String(r.qualityStatus || r.status || 'PASS').toUpperCase();
        if (st === 'PASS' || st === 'OK') pass++;
        else if (st === 'HOLD') hold++;
        else if (st === 'REJECT') reject++;
        else pass++;

        const spk = (r.spk || 'Tanpa SPK').trim().toUpperCase();
        if (!spkMap[spk]) spkMap[spk] = 0;
        spkMap[spk]++;
      }

      const actualOps = Array.from(opMap.values());
      const childCount = mRolls.length;
      const parentCount = parentSet.size;

      grandChildCount += childCount;
      grandParentCount += parentCount;
      grandNetto += netto;
      grandMeter += meter;
      grandPass += pass;
      grandHold += hold;
      grandReject += reject;

      // Cek apakah ada substitusi
      let isSubstituted = false;
      if (scheduledOp && actualOps.length > 0) {
        const schedNama = String(scheduledOp.nama || '').toUpperCase();
        const schedKode = String(scheduledOp.kodeOperator || '').toUpperCase();
        const found = actualOps.some(o => 
          (o.nama && o.nama.toUpperCase() === schedNama) ||
          (o.kodeOperator && o.kodeOperator.toUpperCase() === schedKode)
        );
        isSubstituted = !found;
      }

      const passPercent = childCount > 0 ? Math.round((pass / childCount) * 100) : 0;
      const holdPercent = childCount > 0 ? Math.round((hold / childCount) * 100) : 0;
      const rejectPercent = childCount > 0 ? Math.round((reject / childCount) * 100) : 0;

      const spkList = Object.entries(spkMap).map(([spk, count]) => ({ spk, count }));

      return {
        ...station,
        hasData: childCount > 0,
        childCount,
        parentCount,
        netto: Math.round(netto * 100) / 100,
        meter: Math.round(meter),
        passCount: pass,
        holdCount: hold,
        rejectCount: reject,
        passPercent,
        holdPercent,
        rejectPercent,
        scheduledOp,
        actualOps,
        isSubstituted,
        isLongShift: isMachLong,
        spkList,
        analysis: shiftMode.machineAnalysis[mKey] || null
      };
    });

    const grandPassPercent = grandChildCount > 0 ? Math.round((grandPass / grandChildCount) * 100) : 0;

    return {
      date: cleanD,
      hasData: grandChildCount > 0,
      shiftMode,
      summary: {
        totalChild: grandChildCount,
        totalParent: grandParentCount,
        totalNetto: Math.round(grandNetto * 100) / 100,
        totalMeter: Math.round(grandMeter),
        passCount: grandPass,
        holdCount: grandHold,
        rejectCount: grandReject,
        passPercent: grandPassPercent,
      },
      stations: stationRecords
    };
  };

  // Reactive Computed Shift Properties
  const currentShift = computed(() => getCurrentShiftInfo(currentNow.value));
  const currentHandoverShifts = computed(() => getHandoverShifts(currentNow.value));

  return {
    anchorMonday,
    showShiftHandoverModal,
    lastHandoverConfirmedAt,
    confirmedRoster,
    confirmedRosterShift,
    confirmedRosterDate,
    dailyShiftOverrides,
    currentNow,
    tickLiveClock,
    currentShift,
    currentHandoverShifts,
    getWorkDate,
    getWeekOffset,
    getDayIndex,
    isDateLongShift,
    normalizeMachineKey,
    getMachinesShiftMap,
    setShiftModeOverride,
    setMachineShiftModeOverride,
    getShiftForGroupAndDate,
    getCurrentShiftInfo,
    getHandoverShifts,
    getScheduledOperators,
    confirmShiftHandover,
    loadConfirmedRoster,
    extractOperatorFromRoll,
    detectWorkDateShiftMode,
    getActualWorkHistory
  };
});
