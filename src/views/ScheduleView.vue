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

        <span class="font-black text-xs sm:text-sm text-zinc-800 ml-1 truncate">
          {{ periodLabel }}
        </span>
      </div>

      <!-- Right: View Mode Selector (Bulan | Minggu | Hari) & Group Filter -->
      <div class="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-between sm:justify-end">
        <div class="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            @click="viewMode = 'month'"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', viewMode === 'month' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
          >
            🗓️ Bulan
          </button>
          <button
            @click="viewMode = 'week'"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', viewMode === 'week' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
          >
            📅 Minggu
          </button>
          <button
            @click="viewMode = 'day'"
            :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-all cursor-pointer', viewMode === 'day' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
          >
            ⏱️ Hari
          </button>
        </div>

        <!-- Filter Grup Dropdown -->
        <select 
          v-model="selectedGroupFilter" 
          class="px-2.5 py-1.5 text-xs font-bold border border-zinc-300 rounded-xl bg-white text-zinc-800 outline-none flex-1 sm:flex-none"
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
      <div class="grid grid-cols-7 border-b border-zinc-200 bg-zinc-50/80 text-center text-[11px] sm:text-xs font-black py-2.5 select-none">
        <span class="text-zinc-800"><span class="sm:hidden">Sen</span><span class="hidden sm:inline">Senin</span></span>
        <span class="text-zinc-800"><span class="sm:hidden">Sel</span><span class="hidden sm:inline">Selasa</span></span>
        <span class="text-zinc-800"><span class="sm:hidden">Rab</span><span class="hidden sm:inline">Rabu</span></span>
        <span class="text-zinc-800"><span class="sm:hidden">Kam</span><span class="hidden sm:inline">Kamis</span></span>
        <span class="text-amber-700"><span class="sm:hidden">Jum</span><span class="hidden sm:inline">Jumat (LS)</span></span>
        <span class="text-red-600"><span class="sm:hidden">Sab</span><span class="hidden sm:inline">Sabtu (LS)</span></span>
        <span class="text-red-600"><span class="sm:hidden">Min</span><span class="hidden sm:inline">Minggu (LS)</span></span>
      </div>

      <!-- Calendar Month Grid -->
      <div class="grid grid-cols-7 divide-x divide-y divide-zinc-200">
        <div
          v-for="(cell, idx) in monthGridCells"
          :key="idx"
          @click="onMonthCellClick(cell.dateStr)"
          :class="[
            'transition-all cursor-pointer select-none',
            'min-h-[64px] sm:min-h-[76px] md:min-h-[105px] p-1 sm:p-1.5 md:p-2 flex flex-col justify-between',
            !cell.isCurrentMonth ? 'bg-zinc-50/60 opacity-40' : 'bg-white',
            cell.dateStr === activeMonthSelectedDateStr ? 'bg-blue-50/40 ring-2 ring-blue-600 ring-inset z-10' : 'hover:bg-blue-50/20'
          ]"
        >
          <!-- Top Row: Day Number & Today Marker -->
          <div class="flex items-center justify-between w-full">
            <span
              :class="[
                'text-[11px] sm:text-xs font-black transition-all',
                cell.isToday
                  ? 'w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-xs'
                  : (cell.dateStr === activeMonthSelectedDateStr ? 'text-blue-700 underline font-black' : (cell.isWeekend ? 'text-red-600' : 'text-zinc-800'))
              ]"
            >
              {{ cell.dayNum }}
            </span>
            <span v-if="cell.isToday" class="hidden md:inline text-[9px] font-black text-blue-600 uppercase">Hari Ini</span>
          </div>

          <!-- DESKTOP SHIFT BADGES (Screen MD and above) -->
          <div class="hidden md:block space-y-1 my-1 w-full">
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

          <!-- MOBILE SHIFT INDICATORS (Screen below MD) -->
          <div class="md:hidden flex flex-col items-center justify-center w-full my-auto py-0.5">
            <!-- If ALL groups: show 3 colored dots with tooltip -->
            <div v-if="selectedGroupFilter === 'ALL'" class="flex items-center justify-center gap-1">
              <span
                v-for="grp in ['A', 'B', 'C']"
                :key="grp"
                class="w-1.5 h-1.5 rounded-full"
                :style="{ backgroundColor: SHIFT_DEFINITIONS[cell.shifts[grp]]?.color || '#9ca3af' }"
                :title="`Grup ${grp}: ${SHIFT_DEFINITIONS[cell.shifts[grp]]?.shortName}`"
              ></span>
            </div>
            <!-- If single group filter: show compact micro badge -->
            <div v-else class="w-full text-center">
              <span
                class="inline-block px-1 py-0.2 rounded text-[8.5px] font-black max-w-full truncate"
                :style="{
                  backgroundColor: SHIFT_DEFINITIONS[cell.shifts[selectedGroupFilter]]?.bgColor,
                  color: SHIFT_DEFINITIONS[cell.shifts[selectedGroupFilter]]?.textColor
                }"
              >
                {{ SHIFT_DEFINITIONS[cell.shifts[selectedGroupFilter]]?.code || cell.shifts[selectedGroupFilter] }}
              </span>
            </div>
          </div>

          <!-- Production Data Roll Indicator Badge -->
          <div 
            v-if="cell.production" 
            class="mt-0.5 flex items-center justify-between px-1 py-0.5 rounded text-[8px] sm:text-[8.5px] font-bold border"
            :class="cell.production.isLongShift ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
            :title="`Realisasi: ${cell.production.totalRolls} Roll (${cell.production.modeLabel})`"
          >
            <span class="flex items-center gap-0.5 truncate font-black">
              <span>{{ cell.production.isLongShift ? '⚡' : '⏱️' }}</span>
              <span>{{ cell.production.totalRolls }}r</span>
            </span>
            <span class="font-mono text-[7.5px] sm:text-[8px] opacity-80">{{ cell.production.passPercent }}%</span>
          </div>

          <!-- Hours Indicator Footer -->
          <div class="text-[8px] sm:text-[8.5px] text-zinc-400 font-mono text-right w-full mt-0.5">
            <span class="hidden sm:inline">{{ cell.isWeekend ? '12 Jam' : '8 Jam' }}</span>
            <span class="sm:hidden">{{ cell.isWeekend ? '12j' : '8j' }}</span>
          </div>
        </div>
      </div>

      <!-- Quick Day Agenda Inspector Panel below Month Calendar -->
      <div class="border-t border-zinc-200 bg-zinc-50 p-3 sm:p-4 space-y-3">
        <div class="flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <div class="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
              📋
            </div>
            <div>
              <h3 class="text-xs sm:text-sm font-black text-zinc-900 leading-tight">
                Detail Shift: {{ formatSelectedDateString(activeMonthSelectedDateStr) }}
              </h3>
              <span class="text-[10.5px] text-zinc-500 font-medium">
                {{ isWeekendDay(activeMonthSelectedDateStr) ? 'Weekend • Long Shift (12 Jam)' : 'Weekday • Normal Shift (8 Jam)' }}
              </span>
            </div>
          </div>

          <button
            @click="selectDayFromMonth(activeMonthSelectedDateStr)"
            class="px-3 py-1.5 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
          >
            <span>Buka Roster Lengkap</span>
            <span>→</span>
          </button>
        </div>

        <!-- Shift Cards Grid for Selected Date -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
          <div
            v-for="grp in displayGroups"
            :key="grp"
            class="p-2.5 sm:p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-between"
          >
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-lg bg-zinc-100 text-zinc-800 font-black text-xs flex items-center justify-center border border-zinc-200">
                {{ grp }}
              </span>
              <div>
                <div class="text-xs font-black text-zinc-900">
                  Grup {{ grp }}
                </div>
                <div class="text-[10.5px] text-zinc-500 font-mono">
                  {{ SHIFT_DEFINITIONS[scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr)]?.startTime || '-' }} - {{ SHIFT_DEFINITIONS[scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr)]?.endTime || '-' }}
                </div>
              </div>
            </div>

            <span
              class="px-2.5 py-1 rounded-lg text-xs font-black border"
              :style="{
                backgroundColor: SHIFT_DEFINITIONS[scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr)]?.bgColor,
                color: SHIFT_DEFINITIONS[scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr)]?.textColor,
                borderColor: (SHIFT_DEFINITIONS[scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr)]?.color || '#000') + '40'
              }"
            >
              {{ SHIFT_DEFINITIONS[scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr)]?.shortName || scheduleStore.getShiftForGroupAndDate(grp, activeMonthSelectedDateStr) }}
            </span>
          </div>
        </div>

        <!-- Legend Shift Dots on Mobile -->
        <div class="flex items-center justify-center gap-2.5 sm:gap-3 pt-2 border-t border-zinc-200/80 text-[10px] font-bold text-zinc-500 flex-wrap">
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-blue-600"></span> Shift 1 (07-15)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Shift 2 (15-23)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-indigo-600"></span> Shift 3 (23-07)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-red-500"></span> Long Shift (12 Jam)</span>
          <span class="flex items-center gap-1"><span class="w-2 h-2 rounded-full bg-zinc-400"></span> Libur (OFF)</span>
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

          <!-- Production Data Roll Indicator Badge -->
          <div 
            v-if="day.production" 
            class="flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-bold border"
            :class="day.production.isLongShift ? 'bg-purple-50 text-purple-800 border-purple-200' : 'bg-emerald-50 text-emerald-800 border-emerald-200'"
          >
            <span class="flex items-center gap-1 font-black">
              <span>{{ day.production.isLongShift ? '⚡' : '⏱️' }}</span>
              <span>{{ day.production.totalRolls }} Roll</span>
            </span>
            <span class="font-mono text-[9px] opacity-80">{{ day.production.passPercent }}% OK</span>
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

    <!-- 3. TAMPILAN KALENDER HARI (DAY VIEW & OPERATOR ROSTER / ACTUAL WORK HISTORY) -->
    <div v-else-if="viewMode === 'day'" class="space-y-4">
      <!-- Day Summary Card -->
      <div class="bg-gradient-to-r from-zinc-900 to-zinc-800 text-white p-4 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-lg">🗓️</span>
            <h2 class="text-base font-black">{{ dayViewFullDateString }}</h2>
          </div>
          <p class="text-xs text-zinc-400 mt-0.5">
            Komparasi jadwal rencana vs realisasi aktual pengerjaan data roll per stasiun mesin.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Detected Shift Mode Badge with manual toggle button -->
          <div class="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
            <span class="text-xs">
              {{ activeDayWorkHistory.shiftMode.isLongShift ? '⚡' : '⏱️' }}
            </span>
            <span class="text-xs font-black text-white">
              {{ activeDayWorkHistory.shiftMode.modeLabel }}
            </span>
            <button
              @click="toggleManualShiftMode(activeDayDateStr)"
              class="ml-1 text-[10px] text-zinc-300 hover:text-white underline cursor-pointer"
              title="Klik untuk ubah mode 8 jam / 12 jam pada hari ini"
            >
              (Ubah)
            </button>
          </div>

          <!-- Day Subview Tab Switcher (Realisasi Data Roll vs Jadwal Rencana) -->
          <div class="flex items-center bg-zinc-800 p-1 rounded-xl border border-zinc-700 text-xs font-bold">
            <button
              @click="daySubView = 'actual'"
              :class="['px-3 py-1.5 rounded-lg transition-all cursor-pointer', daySubView === 'actual' ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-zinc-400 hover:text-white']"
            >
              🏭 Realisasi Data Roll
            </button>
            <button
              @click="daySubView = 'planned'"
              :class="['px-3 py-1.5 rounded-lg transition-all cursor-pointer', daySubView === 'planned' ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-zinc-400 hover:text-white']"
            >
              📋 Jadwal Rencana
            </button>
          </div>
        </div>
      </div>

      <!-- TAB 1: REALISASI AKTUAL (DATA ROLL & OPERATOR RIIL) -->
      <div v-if="daySubView === 'actual'" class="space-y-4">
        <!-- Empty State if no rolls found on this date -->
        <div v-if="!activeDayWorkHistory.hasData" class="bg-white rounded-2xl border border-zinc-200 p-8 text-center space-y-3">
          <div class="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-400 flex items-center justify-center text-2xl mx-auto">
            📭
          </div>
          <div>
            <h3 class="font-black text-zinc-800 text-sm">Belum Ada Catatan Data Roll pada Tanggal Ini</h3>
            <p class="text-xs text-zinc-500 mt-1 max-w-md mx-auto">
              Tidak ditemukan data roll atau label yang tercatat pada {{ dayViewFullDateString }}. Anda dapat melihat jadwal rotasi grup rencana atau membuka serah terima shift.
            </p>
          </div>
          <div class="flex items-center justify-center gap-2 pt-2">
            <button
              @click="daySubView = 'planned'"
              class="px-4 py-2 text-xs font-black bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Lihat Jadwal Rencana →
            </button>
            <button
              @click="scheduleStore.showShiftHandoverModal = true"
              class="px-4 py-2 text-xs font-black bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl transition-colors cursor-pointer"
            >
              Buka Serah Terima Shift
            </button>
          </div>
        </div>

        <!-- Populated Actual Work History Content -->
        <template v-else>
          <!-- Shift Detection Analysis Banner -->
          <div 
            class="p-3.5 rounded-2xl border flex items-start gap-3 shadow-2xs"
            :class="activeDayWorkHistory.shiftMode.isLongShift ? 'bg-purple-50/80 border-purple-200 text-purple-950' : 'bg-blue-50/80 border-blue-200 text-blue-950'"
          >
            <span class="text-lg shrink-0">{{ activeDayWorkHistory.shiftMode.isLongShift ? '⚡' : 'ℹ️' }}</span>
            <div class="text-xs space-y-0.5">
              <div class="font-black flex items-center gap-2">
                <span>Analisis Jam Kerja Hari Ini: {{ activeDayWorkHistory.shiftMode.modeLabel }}</span>
                <span v-if="activeDayWorkHistory.shiftMode.isOverridden" class="px-1.5 py-0.2 bg-purple-200 text-purple-900 rounded text-[9.5px]">Override Manual</span>
              </div>
              <p class="text-[11.5px] opacity-90 leading-relaxed">
                {{ activeDayWorkHistory.shiftMode.reason }}
              </p>
            </div>
          </div>

          <!-- Overall Production Metrics Grid -->
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div class="p-3 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Roll FG</div>
              <div class="text-xl font-black text-zinc-900 font-mono mt-1">
                {{ formatNum(activeDayWorkHistory.summary.totalChild) }} <span class="text-xs font-sans text-zinc-400 font-bold">Roll</span>
              </div>
            </div>

            <div class="p-3 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Parent</div>
              <div class="text-xl font-black text-indigo-600 font-mono mt-1">
                {{ formatNum(activeDayWorkHistory.summary.totalParent) }} <span class="text-xs font-sans text-zinc-400 font-bold">Jumbo</span>
              </div>
            </div>

            <div class="p-3 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Tonase (Netto)</div>
              <div class="text-xl font-black text-emerald-600 font-mono mt-1">
                {{ formatNum(activeDayWorkHistory.summary.totalNetto) }} <span class="text-xs font-sans text-zinc-400 font-bold">kg</span>
              </div>
            </div>

            <div class="p-3 bg-white rounded-2xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Total Panjang</div>
              <div class="text-xl font-black text-blue-600 font-mono mt-1">
                {{ formatNum(activeDayWorkHistory.summary.totalMeter) }} <span class="text-xs font-sans text-zinc-400 font-bold">m</span>
              </div>
            </div>

            <div class="p-3 bg-white rounded-2xl border border-zinc-200 shadow-2xs col-span-2 sm:col-span-1">
              <div class="text-[10px] font-black text-zinc-400 uppercase tracking-wider">Rasio Kualitas (QC)</div>
              <div class="text-xl font-black text-zinc-900 font-mono mt-1 flex items-baseline gap-1">
                <span>{{ activeDayWorkHistory.summary.passPercent }}%</span>
                <span class="text-[10px] font-sans font-bold text-emerald-600">PASS</span>
              </div>
              <div class="text-[9.5px] text-zinc-400 mt-0.5">
                {{ activeDayWorkHistory.summary.passCount }} OK • {{ activeDayWorkHistory.summary.holdCount }} Hold • {{ activeDayWorkHistory.summary.rejectCount }} Rej
              </div>
            </div>
          </div>

          <!-- Station Performance Cards Grid (SLITTING, REWIND, CASTING, METALIZE) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="station in activeDayWorkHistory.stations"
              :key="station.machine"
              class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden flex flex-col justify-between"
            >
              <!-- Card Header -->
              <div class="p-3.5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800">
                <div class="flex items-center gap-2">
                  <span class="text-base">{{ station.icon }}</span>
                  <div>
                    <h3 class="font-black text-xs sm:text-sm text-white uppercase">{{ station.name }}</h3>
                    <span class="text-[10px] text-zinc-400 font-medium">Stasiun Produksi {{ station.machine }}</span>
                  </div>
                </div>

                <div class="text-right">
                  <span 
                    v-if="station.hasData"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black"
                    :class="station.isSubstituted ? 'bg-amber-400 text-zinc-950' : 'bg-emerald-500 text-white'"
                  >
                    {{ station.isSubstituted ? '🔄 Substitusi Operator' : '✓ Sesuai Rencana' }}
                  </span>
                  <span v-else class="text-[10px] text-zinc-500 italic">
                    Tidak Beroperasi
                  </span>
                </div>
              </div>

              <!-- Operator Planned vs Actual Row -->
              <div class="p-3.5 bg-zinc-50 border-b border-zinc-200 grid grid-cols-2 gap-2 text-xs">
                <div class="space-y-0.5">
                  <div class="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Operator Rencana:</div>
                  <div v-if="station.scheduledOp" class="font-black text-zinc-800 truncate">
                    [{{ station.scheduledOp.kodeOperator }}] {{ station.scheduledOp.nama }}
                  </div>
                  <div v-else class="text-zinc-400 italic text-[11px]">Tidak terjadwal</div>
                </div>

                <div class="space-y-0.5">
                  <div class="text-[9.5px] font-bold text-zinc-400 uppercase tracking-wider">Operator Aktual:</div>
                  <div v-if="station.actualOps.length > 0" class="flex flex-wrap gap-1">
                    <span 
                      v-for="op in station.actualOps" 
                      :key="op.kodeOperator"
                      class="px-1.5 py-0.5 rounded text-[10px] font-black bg-white border border-zinc-300 text-zinc-900 shadow-2xs"
                    >
                      [{{ op.kodeOperator }}] {{ op.nama }} ({{ op.rollCount }}r)
                    </span>
                  </div>
                  <div v-else class="text-zinc-400 italic text-[11px]">—</div>
                </div>
              </div>

              <!-- Machine Metrics & SPKs -->
              <div class="p-3.5 space-y-3 flex-1">
                <div v-if="station.hasData" class="space-y-3">
                  <!-- Numeric Mini Metrics -->
                  <div class="grid grid-cols-4 gap-2 text-center">
                    <div class="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div class="text-[9px] text-zinc-400 font-bold uppercase">Roll FG</div>
                      <div class="text-sm font-black text-zinc-900 font-mono">{{ station.childCount }}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div class="text-[9px] text-zinc-400 font-bold uppercase">Jumbo</div>
                      <div class="text-sm font-black text-indigo-600 font-mono">{{ station.parentCount }}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div class="text-[9px] text-zinc-400 font-bold uppercase">Netto kg</div>
                      <div class="text-sm font-black text-emerald-600 font-mono">{{ formatNum(station.netto) }}</div>
                    </div>
                    <div class="p-2 rounded-xl bg-zinc-50 border border-zinc-100">
                      <div class="text-[9px] text-zinc-400 font-bold uppercase">Panjang m</div>
                      <div class="text-sm font-black text-blue-600 font-mono">{{ formatNum(station.meter) }}</div>
                    </div>
                  </div>

                  <!-- Quality Progress Bar -->
                  <div>
                    <div class="flex items-center justify-between text-[11px] mb-1">
                      <span class="font-bold text-zinc-600">Rasio Kualitas QC</span>
                      <span class="font-mono font-black text-emerald-600">{{ station.passPercent }}% PASS</span>
                    </div>
                    <div class="h-2 rounded-full bg-zinc-100 flex overflow-hidden">
                      <div :style="{ width: `${station.passPercent}%` }" class="bg-emerald-500 h-full" title="Pass"></div>
                      <div :style="{ width: `${station.holdPercent}%` }" class="bg-amber-400 h-full" title="Hold"></div>
                      <div :style="{ width: `${station.rejectPercent}%` }" class="bg-red-500 h-full" title="Reject"></div>
                    </div>
                    <div class="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                      <span>Pass: {{ station.passCount }}</span>
                      <span>Hold: {{ station.holdCount }}</span>
                      <span>Reject: {{ station.rejectCount }}</span>
                    </div>
                  </div>

                  <!-- SPKs Chips -->
                  <div v-if="station.spkList && station.spkList.length > 0">
                    <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-1">SPK Diproses:</div>
                    <div class="flex flex-wrap gap-1">
                      <span 
                        v-for="s in station.spkList" 
                        :key="s.spk" 
                        class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200"
                      >
                        {{ s.spk }} ({{ s.count }} roll)
                      </span>
                    </div>
                  </div>

                  <!-- Heuristic Analysis Pill -->
                  <div v-if="station.analysis?.reason" class="text-[10.5px] text-zinc-500 italic bg-zinc-50 p-2 rounded-xl border border-zinc-200">
                    💬 {{ station.analysis.reason }}
                  </div>
                </div>

                <div v-else class="py-6 text-center text-xs text-zinc-400 italic">
                  Tidak ada catatan pengerjaan roll untuk mesin {{ station.name }} pada hari ini.
                </div>
              </div>

              <!-- Card Footer Action -->
              <div class="p-3 bg-zinc-50/50 border-t border-zinc-100 flex items-center justify-between">
                <span class="text-[10px] text-zinc-400 font-mono">Status: {{ station.hasData ? 'Aktif' : 'Off' }}</span>
                <button
                  @click="scheduleStore.showShiftHandoverModal = true"
                  class="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Serah Terima / Roster →
                </button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- TAB 2: JADWAL RENCANA (PLANNED ROSTER & ROTATION) -->
      <div v-else class="space-y-4">
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
    </div>

    <!-- Shift Handover Modal Component -->
    <ShiftHandoverModal />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useScheduleStore, SHIFT_DEFINITIONS } from '@/stores/scheduleStore';
import { useConfigStore } from '@/stores/configStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import ShiftHandoverModal from '@/components/schedule/ShiftHandoverModal.vue';

const scheduleStore = useScheduleStore();
const configStore = useConfigStore();
const dataRollStore = useDataRollStore();

const viewMode = ref('month'); // 'month' | 'week' | 'day'
const daySubView = ref('actual'); // 'actual' | 'planned'
const selectedGroupFilter = ref('ALL');
const currentDate = ref(new Date());
const activeDayDateStr = ref(scheduleStore.getWorkDate(new Date()));
const activeMonthSelectedDateStr = ref(scheduleStore.getWorkDate(new Date()));

const currentShiftLive = computed(() => scheduleStore.getCurrentShiftInfo());

const formatNum = (val) => {
  if (!val) return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
};

const displayGroups = computed(() => {
  if (selectedGroupFilter.value === 'ALL') return ['A', 'B', 'C'];
  if (selectedGroupFilter.value === 'NON-GRUP') return ['NON-GRUP'];
  return [selectedGroupFilter.value];
});

// Map rolls by date string (YYYY-MM-DD) for ultra fast O(1) cell lookups
const rollsByDateMap = computed(() => {
  const map = new Map();
  for (const r of dataRollStore.rolls) {
    const d = String(r.tanggalFormatted || r.tanggal || r.createdAt || '').slice(0, 10);
    if (!d) continue;
    if (!map.has(d)) map.set(d, []);
    map.get(d).push(r);
  }
  return map;
});

// Actual Work History on the active Day
const activeDayWorkHistory = computed(() => {
  const rolls = rollsByDateMap.value.get(activeDayDateStr.value) || [];
  return scheduleStore.getActualWorkHistory(activeDayDateStr.value, rolls);
});

// Toggle Shift Mode (Normal 8 Jam vs Long Shift 12 Jam)
const toggleManualShiftMode = async (dateStr) => {
  const currentIsLong = scheduleStore.isDateLongShift(dateStr);
  const newIsLong = !currentIsLong;
  await scheduleStore.setShiftModeOverride(dateStr, newIsLong, null, 'Diubah manual di menu jadwal');
};

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
  return scheduleStore.isDateLongShift(dateStr);
};

// Navigation (Prev / Next)
const navigatePeriod = (direction) => {
  const d = new Date(currentDate.value);
  if (viewMode === 'month' || viewMode.value === 'month') {
    d.setMonth(d.getMonth() + direction);
    currentDate.value = d;
  } else if (viewMode === 'week' || viewMode.value === 'week') {
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
  activeMonthSelectedDateStr.value = wDate;
};

const onMonthCellClick = (dateStr) => {
  activeMonthSelectedDateStr.value = dateStr;
};

const formatSelectedDateString = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  return `${dayNames[d.getDay()]}, ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
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
    const isWeekend = scheduleStore.isDateLongShift(dateStr);

    const shifts = {
      'A': scheduleStore.getShiftForGroupAndDate('A', dateStr),
      'B': scheduleStore.getShiftForGroupAndDate('B', dateStr),
      'C': scheduleStore.getShiftForGroupAndDate('C', dateStr),
      'NON-GRUP': scheduleStore.getShiftForGroupAndDate('NON-GRUP', dateStr)
    };

    // Actual production stats for this cell if data exists
    const dayRolls = rollsByDateMap.value.get(dateStr) || [];
    let production = null;
    if (dayRolls.length > 0) {
      const mode = scheduleStore.detectWorkDateShiftMode(dateStr, dayRolls);
      let pass = 0;
      for (const r of dayRolls) {
        const st = String(r.qualityStatus || r.status || 'PASS').toUpperCase();
        if (st === 'PASS' || st === 'OK') pass++;
      }
      production = {
        totalRolls: dayRolls.length,
        isLongShift: mode.isLongShift,
        modeLabel: mode.modeLabel,
        passPercent: Math.round((pass / dayRolls.length) * 100)
      };
    }

    cells.push({
      dayNum: cellDate.getDate(),
      dateStr,
      isCurrentMonth,
      isToday,
      isWeekend,
      shifts,
      production
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
    const isWeekend = scheduleStore.isDateLongShift(dateStr);

    const shifts = {
      'A': scheduleStore.getShiftForGroupAndDate('A', dateStr),
      'B': scheduleStore.getShiftForGroupAndDate('B', dateStr),
      'C': scheduleStore.getShiftForGroupAndDate('C', dateStr),
      'NON-GRUP': scheduleStore.getShiftForGroupAndDate('NON-GRUP', dateStr)
    };

    // Actual production stats for this day if data exists
    const dayRolls = rollsByDateMap.value.get(dateStr) || [];
    let production = null;
    if (dayRolls.length > 0) {
      const mode = scheduleStore.detectWorkDateShiftMode(dateStr, dayRolls);
      let pass = 0;
      for (const r of dayRolls) {
        const st = String(r.qualityStatus || r.status || 'PASS').toUpperCase();
        if (st === 'PASS' || st === 'OK') pass++;
      }
      production = {
        totalRolls: dayRolls.length,
        isLongShift: mode.isLongShift,
        modeLabel: mode.modeLabel,
        passPercent: Math.round((pass / dayRolls.length) * 100)
      };
    }

    list.push({
      dayName: dayNames[i],
      formattedDate: `${cur.getDate()} ${monthNames[cur.getMonth()]}`,
      dateStr,
      isToday,
      isWeekend,
      shifts,
      production
    });
  }

  return list;
});

// Shifts on Active Day for Planned Day View
const activeDayShifts = computed(() => {
  const dateStr = activeDayDateStr.value;
  const isWeekend = scheduleStore.isDateLongShift(dateStr);

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
  if (!dataRollStore.rolls || dataRollStore.rolls.length === 0) {
    dataRollStore.loadAllRolls().catch(() => {});
  }
});
</script>
