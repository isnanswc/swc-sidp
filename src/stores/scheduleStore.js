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
   */
  const getCurrentShiftInfo = (customDate = null) => {
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

    // Evaluasi pola hari berdasarkan HARI KERJA (workDateStr)
    const workDayIdx = getDayIndex(workDateStr);
    const isWeekendLongShiftDay = workDayIdx >= 4; // Jumat(4), Sabtu(5), Minggu(6)

    let currentShiftCode = '1';

    if (isWeekendLongShiftDay) {
      // Long shift days (Jumat, Sabtu, Minggu)
      // LS1: 07:00 - 19:00
      // LS2: 19:00 - 07:00 (mencakup 19:00-23:59 hari kerja dan 00:00-06:59 keesokan harinya)
      if (timeVal >= 7 && timeVal < 19) {
        currentShiftCode = 'LS1';
      } else {
        currentShiftCode = 'LS2';
      }
    } else {
      // Weekdays (Senin-Kamis 8 jam)
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
      isLongShift: definition.type === 'LONG'
    };
  };

  /**
   * Mendapatkan pasangan shift untuk Serah Terima (Handover):
   * 1. previousShift: Shift yang TELAH bekerja / baru saja selesai
   * 2. upcomingShift: Shift yang AKAN bekerja / bertugas berikutnya (atau shift yang sedang berjalan)
   * Mengikuti aturan pergantian hari kerja jam 07:00 pagi.
   */
  const getHandoverShifts = (customDate = null) => {
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
    const workDayIdx = getDayIndex(workDateStr); // 0=Senin, 1=Selasa, ..., 4=Jumat, 5=Sabtu, 6=Minggu
    const isWorkWeekend = workDayIdx >= 4; // Jumat, Sabtu, Minggu menggunakan Long Shift (LS1 & LS2)

    let prevShiftCode = '1';
    let prevDate = workDateStr;
    let upShiftCode = '2';
    let upDate = workDateStr;

    // EVALUASI POLA HARI KERJA:
    if (isWorkWeekend) {
      // Hari Long Shift: LS1 (07:00 - 19:00), LS2 (19:00 - 07:00)
      if (timeVal >= 7.0 && timeVal < 19.0) {
        // Saat ini sedang berlangsung LS1 (atau handover masuk ke LS1)
        upShiftCode = 'LS1';
        upDate = workDateStr;

        // Shift sebelumnya adalah shift malam yang baru selesai di jam 07:00 pagi (hari kerja kemarin)
        prevDate = yesterdayCalStr;
        const prevWorkDayIdx = getDayIndex(prevDate);
        // Jika kemarin adalah Kamis (dayIdx = 3), shift malamnya adalah Shift 3!
        // Jika kemarin adalah Jumat/Sabtu/Minggu, shift malamnya adalah LS2!
        prevShiftCode = (prevWorkDayIdx >= 4) ? 'LS2' : '3';
      } else {
        // Saat ini sedang berlangsung LS2 (19:00 - 07:00)
        upShiftCode = 'LS2';
        upDate = workDateStr;

        // Shift sebelumnya adalah LS1 pada hari kerja yang sama
        prevShiftCode = 'LS1';
        prevDate = workDateStr;
      }
    } else {
      // Hari Reguler 8 Jam (Senin - Kamis):
      // Shift 1: 07:00 - 15:00
      // Shift 2: 15:00 - 23:00
      // Shift 3: 23:00 - 07:00 (reset jam 07:00 pagi)
      if (timeVal >= 7.0 && timeVal < 15.0) {
        // Shift 1 (Pagi)
        upShiftCode = '1';
        upDate = workDateStr;

        // Shift sebelumnya adalah Shift 3 hari kemarin
        prevDate = yesterdayCalStr;
        const prevWorkDayIdx = getDayIndex(prevDate);
        prevShiftCode = (prevWorkDayIdx >= 4) ? 'LS2' : '3';
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

    for (const m of machines) {
      const matched = allOps.filter(o => 
        o.mesin && o.mesin.toUpperCase() === m &&
        (String(o.kodeGrup || '').toUpperCase() === assignedGroup || String(o.kodeGrup || '').toUpperCase() === `GRUP ${assignedGroup}`)
      );
      
      roster[m] = matched.length > 0 ? matched[0] : null;
    }

    return {
      group: assignedGroup,
      roster
    };
  };

  // Confirm Handover Roster
  const confirmShiftHandover = async (rosterData) => {
    confirmedRoster.value = { ...rosterData };
    lastHandoverConfirmedAt.value = new Date().toISOString();
    showShiftHandoverModal.value = false;

    try {
      await saveSetting('confirmed_shift_roster', confirmedRoster.value);
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

      const savedTime = await getSetting('last_handover_time', null);
      if (savedTime) lastHandoverConfirmedAt.value = savedTime;

      const savedAnchor = await getSetting('schedule_anchor_date', null);
      if (savedAnchor) anchorMonday.value = savedAnchor;
    } catch (e) {
      console.error('Failed to load schedule state:', e);
    }
  };

  // Reactive Computed Shift Properties
  const currentShift = computed(() => getCurrentShiftInfo(currentNow.value));
  const currentHandoverShifts = computed(() => getHandoverShifts(currentNow.value));

  return {
    anchorMonday,
    showShiftHandoverModal,
    lastHandoverConfirmedAt,
    confirmedRoster,
    currentNow,
    tickLiveClock,
    currentShift,
    currentHandoverShifts,
    getWorkDate,
    getWeekOffset,
    getDayIndex,
    getShiftForGroupAndDate,
    getCurrentShiftInfo,
    getHandoverShifts,
    getScheduledOperators,
    confirmShiftHandover,
    loadConfirmedRoster
  };
});
