<template>
  <div class="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto">
    <!-- TOP BAR: Title, Current Shift Live Badge, & Quick Action Buttons -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs">
      <div>
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shadow-sm">
            📅
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-black text-zinc-900 leading-tight">
              Operator Schedule & Shift Calendar
            </h1>
            <p class="text-[11px] text-zinc-500 font-medium">
              Sistem Rotasi Jadwal Kerja Mingguan 3 Grup & Penugasan Operator Produksi
            </p>
          </div>
        </div>
      </div>

      <!-- Live Shift Badge & Handover Action Button -->
      <div class="flex flex-wrap items-center gap-2">
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <div class="text-xs">
            <span class="font-bold text-zinc-600">Shift Sekarang: </span>
            <span 
              class="font-black px-1.5 py-0.5 rounded text-[11px]"
              :style="{ backgroundColor: currentShiftLive.definition.bgColor, color: currentShiftLive.definition.textColor }"
            >
              {{ currentShiftLive.definition.shortName }} (Grup {{ currentShiftLive.group }})
            </span>
          </div>
        </div>

        <button
          @click="scheduleStore.showShiftHandoverModal = true"
          class="px-3.5 py-2 text-xs font-black bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span>🔄 Pergantian Shift</span>
        </button>
      </div>
    </div>

    <!-- CALENDAR CONTROLS & VIEW SWITCHER (BULAN / MINGGU / HARI) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
      <!-- Left: Navigation (Prev, Next, Today, Date Label) -->
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-zinc-100 rounded-xl p-0.5 border border-zinc-200">
          <button
            @click="navigatePeriod(-1)"
            class="p-1.5 rounded-lg hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
            title="Sebelumnya"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          </button>
          <button
            @click="goToToday"
            class="px-2.5 py-1 text-xs font-bold hover:bg-white text-zinc-700 rounded-lg transition-colors cursor-pointer"
          >
            Hari Ini
          </button>
          <button
            @click="navigatePeriod(1)"
            class="p-1.5 rounded-lg hover:bg-white text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
            title="Berikutnya"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
          </button>
        </div>

        <span class="font-black text-sm text-zinc-800 ml-1">
          {{ periodLabel }}
        </span>
      </div>

      <!-- Right: View Mode Selector (Bulan | Minggu | Hari) & Group Filter -->
      <div class="flex items-center gap-2">
        <div class="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            @click="viewMode = 'month'"
            :class="['px-3 py-1.5 rounded-lg transition-all cursor-pointer', viewMode === 'month' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
          >
            🗓️ Bulan
          </button>
          <button
            @click="viewMode = 'week'"
            :class="['px-3 py-1.5 rounded-lg transition-all cursor-pointer', viewMode === 'week' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
          >
            📅 Minggu
          </button>
          <button
            @click="viewMode = 'day'"
            :class="['px-3 py-1.5 rounded-lg transition-all cursor-pointer', viewMode === 'day' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
          >
            ⏱️ Hari
          </button>
        </div>

        <!-- Filter Grup Dropdown -->
        <select 
          v-model="selectedGroupFilter" 
          class="px-2.5 py-1.5 text-xs font-bold border border-zinc-300 rounded-xl bg-white text-zinc-800 outline-none"
        >
          <option value="ALL">Semua Grup (A, B, C)</option>
          <option value="A">Hanya Grup A</option>
          <option value="B">Hanya Grup B</option>
          <option value="C">Hanya Grup C</option>
          <option value="NON-GRUP">Non-Grup / Normal</option>
        </select>
      </div>
    </div>

    <!-- 1. TAMPILAN KALENDER BULAN (MONTH VIEW) -->
    <div v-if="viewMode === 'month'" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <!-- Days of Week Header -->
      <div class="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/80 text-center text-xs font-black text-zinc-600 py-2.5">
        <span class="text-zinc-800">Senin</span>
        <span class="text-zinc-800">Selasa</span>
        <span class="text-zinc-800">Rabu</span>
        <span class="text-zinc-800">Kamis</span>
        <span class="text-amber-700">Jumat (LS)</span>
        <span class="text-red-600">Sabtu (LS)</span>
        <span class="text-red-600">Minggu (LS)</span>
      </div>

      <!-- Calendar Month Grid -->
      <div class="grid grid-cols-7 divide-x divide-y divide-zinc-200">
        <div
          v-for="(cell, idx) in monthGridCells"
          :key="idx"
          @click="selectDayFromMonth(cell.dateStr)"
          :class="[
            'min-h-[105px] p-2 flex flex-col justify-between transition-colors cursor-pointer hover:bg-blue-50/40',
            !cell.isCurrentMonth ? 'bg-zinc-50/60 opacity-40' : 'bg-white',
            cell.isToday ? 'ring-2 ring-blue-500 ring-inset bg-blue-50/20' : ''
          ]"
        >
          <div class="flex items-center justify-between">
            <span :class="['text-xs font-black', cell.isToday ? 'px-1.5 py-0.5 bg-blue-600 text-white rounded-full' : (cell.isWeekend ? 'text-red-600' : 'text-zinc-800')]">
              {{ cell.dayNum }}
            </span>
            <span v-if="cell.isToday" class="text-[9px] font-black text-blue-600 uppercase">Hari Ini</span>
          </div>

          <!-- Shift Badges per Group -->
          <div class="space-y-1 my-1">
            <div
              v-for="grp in displayGroups"
              :key="grp"
              class="flex items-center justify-between px-1.5 py-0.5 rounded text-[9.5px] border"
              :style="{
                backgroundColor: SHIFT_DEFINITIONS[cell.shifts[grp]]?.bgColor || '#f3f4f6',
                color: SHIFT_DEFINITIONS[cell.shifts[grp]]?.textColor || '#374151',
                borderColor: SHIFT_DEFINITIONS[cell.shifts[grp]]?.color + '40'
              }"
            >
              <span class="font-bold">Grup {{ grp }}</span>
              <span class="font-black">{{ SHIFT_DEFINITIONS[cell.shifts[grp]]?.shortName || cell.shifts[grp] }}</span>
            </div>
          </div>

          <div class="text-[8.5px] text-zinc-400 font-mono text-right">
            {{ cell.isWeekend ? '12 Jam' : '8 Jam' }}
          </div>
        </div>
      </div>
    </div>

    <!-- 2. TAMPILAN KALENDER MINGGU (WEEK VIEW) -->
    <div v-else-if="viewMode === 'week'" class="space-y-3">
      <div class="grid grid-cols-1 md:grid-cols-7 gap-3">
        <div
          v-for="day in weekDaysList"
          :key="day.dateStr"
          :class="[
            'bg-white rounded-2xl border p-3 flex flex-col justify-between space-y-3 shadow-xs',
            day.isToday ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-zinc-200'
          ]"
        >
          <!-- Header Day -->
          <div class="border-b border-zinc-100 pb-2">
            <div class="flex items-center justify-between">
              <span class="font-black text-xs uppercase" :class="day.isWeekend ? 'text-red-600' : 'text-zinc-700'">
                {{ day.dayName }}
              </span>
              <span v-if="day.isToday" class="px-1.5 py-0.5 bg-blue-600 text-white rounded text-[9px] font-black">
                Hari Ini
              </span>
            </div>
            <p class="font-black text-sm text-zinc-900 mt-0.5">{{ day.formattedDate }}</p>
          </div>

          <!-- Group Shifts for this Day -->
          <div class="space-y-2 flex-1">
            <div
              v-for="grp in displayGroups"
              :key="grp"
              class="p-2 rounded-xl border space-y-1"
              :style="{
                backgroundColor: SHIFT_DEFINITIONS[day.shifts[grp]]?.bgColor || '#f3f4f6',
                borderColor: SHIFT_DEFINITIONS[day.shifts[grp]]?.color + '50'
              }"
            >
              <div class="flex items-center justify-between text-[11px]">
                <span class="font-black text-zinc-900">GRUP {{ grp }}</span>
                <span
                  class="font-black px-1.5 py-0.5 rounded text-[10px]"
                  :style="{ backgroundColor: SHIFT_DEFINITIONS[day.shifts[grp]]?.color, color: '#ffffff' }"
                >
                  {{ SHIFT_DEFINITIONS[day.shifts[grp]]?.shortName }}
                </span>
              </div>
              <div class="text-[10px] text-zinc-600 font-medium">
                Jam: {{ SHIFT_DEFINITIONS[day.shifts[grp]]?.startTime }} - {{ SHIFT_DEFINITIONS[day.shifts[grp]]?.endTime }}
              </div>
            </div>
          </div>

          <button
            @click="selectDayFromMonth(day.dateStr)"
            class="w-full py-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
          >
            Lihat Roster Operator →
          </button>
        </div>
      </div>
    </div>

    <!-- 3. TAMPILAN KALENDER HARI (DAY VIEW & OPERATOR ROSTER) -->
    <div v-else-if="viewMode === 'day'" class="space-y-4">
      <!-- Day Summary Card -->
      <div class="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg">🗓️</span>
            <h2 class="text-base font-black">{{ dayViewFullDateString }}</h2>
          </div>
          <p class="text-xs text-zinc-400 mt-0.5">
            Jadwal pembagian shift dan daftar penugasan operator per stasiun mesin.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-300 font-semibold">Tipe Hari:</span>
          <span class="px-2.5 py-1 rounded-full text-xs font-black bg-white/20 text-white">
            {{ isWeekendDay(activeDayDateStr) ? 'Weekend (Long Shift 12 Jam)' : 'Weekday (Shift Pendek 8 Jam)' }}
          </span>
        </div>
      </div>

      <!-- Shift Breakdown Cards on Selected Day -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          v-for="shift in activeDayShifts"
          :key="shift.shiftCode"
          class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col justify-between"
        >
          <!-- Card Header -->
          <div
            class="p-3.5 border-b text-white flex items-center justify-between"
            :style="{ backgroundColor: shift.definition.color }"
          >
            <div>
              <span class="text-[10px] font-black uppercase tracking-wider bg-white/25 px-2 py-0.5 rounded-full">
                GRUP {{ shift.group }}
              </span>
              <h3 class="font-black text-sm mt-1 text-white">{{ shift.definition.name }}</h3>
            </div>
            <div class="text-right">
              <span class="text-xs font-mono font-bold">{{ shift.definition.startTime }} - {{ shift.definition.endTime }}</span>
              <div class="text-[10px] text-white/80">{{ shift.definition.durationHours }} Jam Kerja</div>
            </div>
          </div>

          <!-- Operators for this shift -->
          <div class="p-3.5 space-y-2.5 flex-1 bg-zinc-50/50">
            <div class="text-[11px] font-black text-zinc-500 uppercase tracking-wider">
              Operator per Stasiun Mesin:
            </div>

            <div class="space-y-1.5">
              <div
                v-for="station in ['CASTING', 'METALIZE', 'SLITTING', 'REWIND']"
                :key="station"
                class="flex items-center justify-between p-2 rounded-xl bg-white border border-zinc-200 text-xs shadow-2xs"
              >
                <div class="flex items-center gap-1.5">
                  <span class="font-bold text-zinc-500 text-[10px] uppercase w-16">{{ station }}</span>
                </div>
                <div class="text-right">
                  <span v-if="shift.roster[station]" class="font-black text-zinc-900">
                    [{{ shift.roster[station].kodeOperator }}] {{ shift.roster[station].nama }}
                  </span>
                  <span v-else class="text-zinc-400 italic text-[11px]">
                    Belum Terjadwal
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer Action -->
          <div class="p-3 bg-white border-t border-zinc-100 flex justify-end">
            <button
              @click="scheduleStore.showShiftHandoverModal = true"
              class="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              Atur / Ganti Operator →
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Shift Handover Modal Component -->
    <ShiftHandoverModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useScheduleStore, SHIFT_DEFINITIONS } from '@/stores/scheduleStore';
import { useConfigStore } from '@/stores/configStore';
import ShiftHandoverModal from '@/components/schedule/ShiftHandoverModal.vue';

const scheduleStore = useScheduleStore();
const configStore = useConfigStore();

const viewMode = ref('month'); // 'month' | 'week' | 'day'
const selectedGroupFilter = ref('ALL');
const currentDate = ref(new Date());
const activeDayDateStr = ref(scheduleStore.getWorkDate(new Date()));

const currentShiftLive = computed(() => scheduleStore.getCurrentShiftInfo());

const displayGroups = computed(() => {
  if (selectedGroupFilter.value === 'ALL') return ['A', 'B', 'C'];
  if (selectedGroupFilter.value === 'NON-GRUP') return ['NON-GRUP'];
  return [selectedGroupFilter.value];
});

// Period Label Header (Month/Year, Week of Month, or Specific Date)
const periodLabel = computed(() => {
  const d = currentDate.value;
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  if (viewMode.value === 'month') {
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  } else if (viewMode.value === 'week') {
    const startOfWeek = new Date(d);
    const day = startOfWeek.getDay();
    const diff = (day + 6) % 7;
    startOfWeek.setDate(startOfWeek.getDate() - diff);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 6);

    return `${startOfWeek.getDate()} ${monthNames[startOfWeek.getMonth()]} - ${endOfWeek.getDate()} ${monthNames[endOfWeek.getMonth()]} ${endOfWeek.getFullYear()}`;
  } else {
    const dayDate = new Date(activeDayDateStr.value);
    const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    return `${dayNames[dayDate.getDay()]}, ${dayDate.getDate()} ${monthNames[dayDate.getMonth()]} ${dayDate.getFullYear()}`;
  }
});

const dayViewFullDateString = computed(() => {
  const d = new Date(activeDayDateStr.value);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
});

const isWeekendDay = (dateStr) => {
  const d = new Date(dateStr);
  const day = d.getDay();
  return day === 5 || day === 6 || day === 0; // Fri, Sat, Sun
};

// Navigation (Prev / Next)
const navigatePeriod = (direction) => {
  const d = new Date(currentDate.value);
  if (viewMode.value === 'month') {
    d.setMonth(d.getMonth() + direction);
    currentDate.value = d;
  } else if (viewMode.value === 'week') {
    d.setDate(d.getDate() + direction * 7);
    currentDate.value = d;
  } else {
    const act = new Date(activeDayDateStr.value);
    act.setDate(act.getDate() + direction);
    activeDayDateStr.value = act.toISOString().slice(0, 10);
    currentDate.value = act;
  }
};

const goToToday = () => {
  const wDate = scheduleStore.getWorkDate(new Date());
  currentDate.value = new Date(wDate);
  activeDayDateStr.value = wDate;
};

const selectDayFromMonth = (dateStr) => {
  activeDayDateStr.value = dateStr;
  currentDate.value = new Date(dateStr);
  viewMode.value = 'day';
};

// Month Grid Generator (42 cells: 6 full weeks)
const monthGridCells = computed(() => {
  const d = currentDate.value;
  const year = d.getFullYear();
  const month = d.getMonth();

  const firstDay = new Date(year, month, 1);
  const startDayIdx = (firstDay.getDay() + 6) % 7; // Mon=0..Sun=6

  const startDate = new Date(year, month, 1 - startDayIdx);

  const todayStr = scheduleStore.getWorkDate(new Date());
  const cells = [];

  for (let i = 0; i < 42; i++) {
    const cellDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i);

    const cYear = cellDate.getFullYear();
    const cMonth = String(cellDate.getMonth() + 1).padStart(2, '0');
    const cDay = String(cellDate.getDate()).padStart(2, '0');
    const dateStr = `${cYear}-${cMonth}-${cDay}`;

    const isCurrentMonth = cellDate.getMonth() === month;
    const isToday = dateStr === todayStr;
    const isWeekend = cellDate.getDay() === 0 || cellDate.getDay() === 6;

    const shifts = {
      'A': scheduleStore.getShiftForGroupAndDate('A', dateStr),
      'B': scheduleStore.getShiftForGroupAndDate('B', dateStr),
      'C': scheduleStore.getShiftForGroupAndDate('C', dateStr),
      'NON-GRUP': scheduleStore.getShiftForGroupAndDate('NON-GRUP', dateStr)
    };

    cells.push({
      dayNum: cellDate.getDate(),
      dateStr,
      isCurrentMonth,
      isToday,
      isWeekend,
      shifts
    });
  }

  return cells;
});

// Week View Days List
const weekDaysList = computed(() => {
  const d = currentDate.value;
  const startOfWeek = new Date(d);
  const day = startOfWeek.getDay();
  const diff = (day + 6) % 7;
  startOfWeek.setDate(startOfWeek.getDate() - diff);

  const dayNames = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
  const todayStr = scheduleStore.getWorkDate(new Date());
  const list = [];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(startOfWeek);
    cur.setDate(cur.getDate() + i);

    const cYear = cur.getFullYear();
    const cMonth = String(cur.getMonth() + 1).padStart(2, '0');
    const cDay = String(cur.getDate()).padStart(2, '0');
    const dateStr = `${cYear}-${cMonth}-${cDay}`;

    const isToday = dateStr === todayStr;
    const isWeekend = i >= 4; // Fri, Sat, Sun are long shifts

    const shifts = {
      'A': scheduleStore.getShiftForGroupAndDate('A', dateStr),
      'B': scheduleStore.getShiftForGroupAndDate('B', dateStr),
      'C': scheduleStore.getShiftForGroupAndDate('C', dateStr),
      'NON-GRUP': scheduleStore.getShiftForGroupAndDate('NON-GRUP', dateStr)
    };

    list.push({
      dayName: dayNames[i],
      formattedDate: `${cur.getDate()} ${monthNames[cur.getMonth()]}`,
      dateStr,
      isToday,
      isWeekend,
      shifts
    });
  }

  return list;
});

// Shifts on Active Day for Day View
const activeDayShifts = computed(() => {
  const dateStr = activeDayDateStr.value;
  const isWeekend = isWeekendDay(dateStr);

  const shiftCodes = isWeekend ? ['LS1', 'LS2'] : ['1', '2', '3'];
  const results = [];

  for (const sCode of shiftCodes) {
    const def = SHIFT_DEFINITIONS[sCode];
    const scheduled = scheduleStore.getScheduledOperators(dateStr, sCode);

    results.push({
      shiftCode: sCode,
      definition: def,
      group: scheduled.group,
      roster: scheduled.roster
    });
  }

  return results;
});

onMounted(async () => {
  await configStore.loadAll();
  await scheduleStore.loadConfirmedRoster();
});
</script>
