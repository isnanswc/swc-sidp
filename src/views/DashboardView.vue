<template>
  <div class="space-y-4 pb-16 font-sans select-none text-zinc-900 anim-fade-in">
    
    <!-- Dashboard Loading Indicator Banner -->
    <Transition name="fade">
      <div v-if="isDashboardLoading" class="bg-indigo-50/95 border border-indigo-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 text-xs font-mono text-indigo-950 shadow-xs animate-pulse">
        <div class="flex items-center gap-2.5">
          <svg class="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
          </svg>
          <span class="font-bold">Memuat sinkronisasi data roll & analitik sistem...</span>
        </div>
        <span class="text-[10.5px] text-indigo-600 bg-white px-2.5 py-0.5 rounded-lg border border-indigo-200 font-bold">Sinkronisasi Database Lokal</span>
      </div>
    </Transition>
    <div class="bg-white border border-zinc-200/90 rounded-2xl sm:rounded-3xl p-3.5 sm:p-4.5 shadow-xs relative overflow-hidden anim-enter-1">
      <!-- Looping Moving Gradient Accent Line -->
      <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-zinc-900 to-red-600 bg-[length:200%_100%] anim-gradient-flow"></div>

      <!-- Baris 1: Live Status, Hari Kerja, Shift, & Navigasi Cepat -->
      <div class="flex flex-wrap items-center justify-between gap-2.5 border-b border-zinc-100 pb-2.5 mb-3">
        <div class="flex items-center gap-2 flex-wrap text-[11px] font-mono font-bold">
          <!-- Live Radar Pulse Beacon -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200 shadow-2xs">
            <span class="relative flex h-2 w-2">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-2 w-2 bg-red-600"></span>
            </span>
            <span>PT. SWC</span>
          </span>

          <!-- Live Clock -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
            <svg class="w-3.5 h-3.5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><polyline points="12 6 12 12 16 14" stroke-width="2"></polyline></svg>
            <span>{{ liveTimeString }}</span>
          </span>

          <!-- Hari Kerja Produksi -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200" title="Hari Kerja Produksi pabrik (cut-off 07:00 pagi)">
            <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke-width="2"></rect><line x1="16" y1="2" x2="16" y2="6" stroke-width="2"></line><line x1="8" y1="2" x2="8" y2="6" stroke-width="2"></line><line x1="3" y1="10" x2="21" y2="10" stroke-width="2"></line></svg>
            <span>Hari Kerja: <strong>{{ workDateLabel }}</strong></span>
          </span>

          <!-- Shift Aktif Badge -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{{ currentShift.definition.shortName }} (Grup {{ currentShift.group }})</span>
          </span>

          <!-- Total Database Roll Badge (Live Verification) -->
          <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200" title="Total seluruh roll tersimpan di IndexedDB">
            <svg class="w-3.5 h-3.5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><ellipse cx="12" cy="5" rx="9" ry="3" stroke-width="2"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" stroke-width="2"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" stroke-width="2"></path></svg>
            <span>DB: <strong>{{ formatNum(allProductionRolls.length) }}</strong> Roll</span>
          </span>
        </div>

        <!-- Quick Navigation Actions (Minimalist Flat) -->
        <div class="flex items-center gap-1.5">
          <router-link
            to="/label"
            class="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Cetak Label Roll Baru"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path><line x1="7" y1="7" x2="7.01" y2="7" stroke-width="2" stroke-linecap="round"></line></svg>
            <span>Label</span>
          </router-link>
          <router-link
            to="/spk"
            class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-[11px] font-mono flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Buka Manajemen SPK"
          >
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke-width="2"></path><polyline points="14 2 14 8 20 8" stroke-width="2"></polyline><line x1="16" y1="13" x2="8" y2="13" stroke-width="2"></line><line x1="16" y1="17" x2="8" y2="17" stroke-width="2"></line></svg>
            <span>SPK</span>
          </router-link>
          <router-link
            to="/inventory"
            class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-[11px] font-mono border border-zinc-200 flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Buka Manajemen Stok Gudang IMS"
          >
            <svg class="w-3.5 h-3.5 text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke-width="2"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96" stroke-width="2"></polyline><line x1="12" y1="22.08" x2="12" y2="12" stroke-width="2"></line></svg>
            <span>IMS</span>
          </router-link>
        </div>
      </div>

      <!-- Baris 2: Judul Dashboard & Filter Dropdown Waktu + Stepper Minimalis -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-black text-zinc-950 tracking-tight">
              DASHBOARD PRODUKSI & STOK FILM
            </h1>
            <span class="px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-[9px] font-black uppercase tracking-wider">
              COCKPIT
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium mt-0.5">
            Monitoring terpusat hasil konversi slitting, rewind, kendali mutu QC, dan inventaris stok.
          </p>
        </div>

        <!-- Filter Rentang Waktu Dropdown Minimalis + Stepper -->
        <div class="flex flex-wrap items-center gap-2 max-w-full">
          <!-- Dropdown Periode Minimalis -->
          <div class="relative flex items-center">
            <select
              v-model="selectedFrequency"
              @change="onFrequencyChange"
              class="appearance-none bg-zinc-100 hover:bg-zinc-200/70 border border-zinc-200/90 text-zinc-900 text-xs font-mono font-bold py-1.5 pl-3 pr-8 rounded-xl shadow-2xs outline-none cursor-pointer transition-colors focus:border-zinc-400"
            >
              <option v-for="freq in frequencyOptions" :key="freq.key" :value="freq.key">
                {{ freq.label }}
              </option>
            </select>
            <div class="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </div>
          </div>

          <!-- Stepper Hari Minimalis (Hanya muncul saat mode DAY) -->
          <div v-if="selectedFrequency === 'DAY'" class="bg-zinc-100/90 p-0.5 rounded-xl border border-zinc-200 flex items-center gap-0.5 text-xs font-mono font-bold shrink-0">
            <button
              @click="stepPrevDay"
              class="p-1.5 rounded-lg bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 shadow-2xs transition-all cursor-pointer active:scale-95"
              title="Hari Sebelumnya (H-1)"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <!-- Active Target Date Display Badge -->
            <div
              :class="[
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 shrink-0',
                dayOffset === 0
                  ? 'text-zinc-800'
                  : 'bg-red-50 text-red-700 border border-red-200 font-black'
              ]"
            >
              <span>{{ activeTargetDateDisplay }}</span>
            </div>

            <button
              @click="stepNextDay"
              :disabled="dayOffset >= 0"
              :class="[
                'p-1.5 rounded-lg transition-all',
                dayOffset < 0
                  ? 'bg-white hover:bg-zinc-200 text-zinc-700 border border-zinc-200/80 shadow-2xs cursor-pointer active:scale-95'
                  : 'text-zinc-300 cursor-not-allowed'
              ]"
              title="Hari Berikutnya"
            >
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>

            <button
              v-if="dayOffset !== 0"
              @click="resetToToday"
              class="px-2 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-[10.5px] transition-all cursor-pointer shadow-2xs font-bold"
              title="Kembali ke Hari Ini"
            >
              Hari Ini
            </button>
          </div>

          <!-- Input Rentang Custom (Mulai & Selesai) -->
          <div v-if="selectedFrequency === 'CUSTOM'" class="bg-white p-1 rounded-xl border border-zinc-200 shadow-2xs flex items-center gap-1.5 text-xs font-mono shrink-0">
            <span class="text-zinc-400 pl-1 text-[10.5px] font-bold">Dari:</span>
            <input
              type="date"
              v-model="customStartDate"
              @change="onCustomDateChange"
              class="px-2 py-0.5 rounded-lg border border-zinc-200 text-zinc-800 text-xs outline-none focus:border-red-500 font-mono"
            />
            <span class="text-zinc-400 text-[10.5px] font-bold">s/d</span>
            <input
              type="date"
              v-model="customEndDate"
              @change="onCustomDateChange"
              class="px-2 py-0.5 rounded-lg border border-zinc-200 text-zinc-800 text-xs outline-none focus:border-red-500 font-mono"
            />
          </div>

          <!-- Subtitle Rentang Periode jika bukan mode DAY -->
          <div v-if="selectedFrequency !== 'DAY'" class="px-2.5 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 border border-zinc-200 text-[11px] font-mono font-medium flex items-center gap-1 shadow-2xs shrink-0">
            <span>{{ activePeriodSubtitle }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- BLOK 1: EXECUTIVE ANALYTICS HUB (THE BIG 3 & PERFORMANSI GLOBAL)          -->
    <!-- Nuansa: Clean Minimalist Executive Cards with Generous White Space        -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div ref="block1Ref" class="space-y-3.5 sm:space-y-4">
      
      <!-- Blok 1 Scope Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-200/80 pb-2">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="px-2.5 py-0.5 rounded-full text-[9.5px] font-black font-mono bg-zinc-900 text-white uppercase tracking-wider shadow-2xs">
            BLOK 1 • EXECUTIVE ANALYTICS
          </span>
          <span class="text-xs font-mono font-bold text-zinc-600">
            Kinerja Produksi Periode: <strong class="text-zinc-900">{{ activePeriodSubtitle }}</strong>
          </span>
        </div>
        <div class="flex items-center gap-2 text-xs font-mono text-zinc-500 font-medium">
          <span class="text-zinc-400">Status Laju:</span>
          <span
            :class="[
              'px-2 py-0.5 rounded-lg text-[10.5px] font-bold inline-flex items-center gap-1.5',
              forecastMetrics.runRateStatus === 'AHEAD' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
              forecastMetrics.runRateStatus === 'ON_TRACK' ? 'bg-blue-50 text-blue-800 border border-blue-200' :
              'bg-amber-50 text-amber-800 border border-amber-200'
            ]"
          >
            <span class="w-1.5 h-1.5 rounded-full" :class="forecastMetrics.runRateStatus === 'AHEAD' ? 'bg-emerald-500 animate-pulse' : forecastMetrics.runRateStatus === 'ON_TRACK' ? 'bg-blue-500' : 'bg-amber-500'"></span>
            <span>{{ forecastMetrics.runRateStatus === 'AHEAD' ? '🚀 Optimal (Di Atas Target)' : forecastMetrics.runRateStatus === 'ON_TRACK' ? '✓ On Track' : '⚠️ Perlu Perhatian' }}</span>
          </span>
        </div>
      </div>

      <!-- THE BIG 3 HERO METRIC CARDS (BERSIH, TEGAS, LEGA DENGAN ANIMASI COUNTING) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 reveal-on-scroll">
        
        <!-- CARD 1: TONASE BERSIH -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-zinc-400 hover:shadow-xs transition-all group flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-wider font-mono">
              Tonase Bersih (Net Weight)
            </span>
            <div class="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0 ml-1">
              ⚖️
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{{ animatedKpi.tonase.toFixed(2) }}</span>
              <span class="text-sm sm:text-base font-bold text-zinc-500 font-sans">Ton</span>
            </div>
            <div class="flex items-center justify-between text-[11px] text-zinc-500 font-mono font-medium mt-2 pt-2 border-t border-zinc-100">
              <span>{{ formatNum(animatedKpi.kg) }} Kg</span>
              <span class="text-zinc-700 font-bold">~{{ animatedKpi.dailyAverageTon.toFixed(2) }} Ton/Hari</span>
            </div>
          </div>
        </div>

        <!-- CARD 2: VOLUME OUTPUT (ROLL & METER) -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all group flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-wider font-mono">
              Volume Hasil Produksi
            </span>
            <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0 ml-1">
              📦
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{{ formatNum(animatedKpi.rolls) }}</span>
              <span class="text-sm sm:text-base font-bold text-zinc-500 font-sans">Roll FG</span>
            </div>
            <div class="flex items-center justify-between text-[10.5px] sm:text-[11px] text-zinc-500 font-mono font-medium mt-2 pt-2 border-t border-zinc-100 flex-wrap gap-1">
              <span class="text-zinc-700 font-bold">{{ formatNum(animatedKpi.meters) }} M</span>
              <span class="text-zinc-400">Slit: <strong>{{ formatNum(animatedKpi.slittingRolls) }}</strong> • Rwd: <strong>{{ formatNum(animatedKpi.rewindRolls) }}</strong> • Cast: <strong>{{ formatNum(animatedKpi.smlRolls) }}</strong></span>
            </div>
          </div>
        </div>

        <!-- CARD 3: MUTU & KENDALI KUALITAS -->
        <div class="bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-zinc-200/90 shadow-2xs hover:border-emerald-300 hover:shadow-xs transition-all group flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-black text-zinc-400 uppercase tracking-wider font-mono">
              Yield Mutu (Kualitas QC)
            </span>
            <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-xs group-hover:scale-105 transition-transform shrink-0 ml-1">
              🛡️
            </div>
          </div>
          <div class="mt-3">
            <div class="text-2xl sm:text-3xl font-black text-emerald-600 font-mono tracking-tight flex items-baseline gap-1.5">
              <span>{{ animatedKpi.passRate.toFixed(1) }}%</span>
              <span class="text-xs sm:text-sm font-bold text-emerald-700 font-sans uppercase">Pass</span>
            </div>
            <div class="flex items-center gap-1.5 text-[10.5px] sm:text-[11px] font-mono font-bold mt-2 pt-2 border-t border-zinc-100 flex-wrap">
              <span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                ✓ {{ formatNum(animatedKpi.passCount) }} Pass
              </span>
              <span v-if="animatedKpi.holdCount > 0 || kpiMetrics.holdCount > 0" class="text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                ⚠️ {{ formatNum(animatedKpi.holdCount) }} Hold
              </span>
              <span v-if="animatedKpi.rejectCount > 0 || kpiMetrics.rejectCount > 0" class="text-red-700 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                ✕ {{ formatNum(animatedKpi.rejectCount) }} Rej
              </span>
            </div>
          </div>
        </div>

      </div>

    <!-- Banner Pemberitahuan Status Hari Ini / Tanggal Target (Berdasarkan Tanggal Aktual Produksi) -->
    <div
      v-if="kpiMetrics.totalRolls === 0 && selectedFrequency === 'DAY'"
      class="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs reveal-on-scroll"
    >
      <div class="flex items-start gap-2.5">
        <svg class="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke-width="2"></circle><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"></line><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"></line></svg>
        <div class="text-xs text-amber-950">
          <p class="font-bold">
            Belum ada rekaman output produksi pada <span class="font-mono underline">{{ activeTargetDateDisplay }}</span>.
          </p>
          <p class="text-[11px] text-amber-800 mt-0.5">
            Data dashboard ini difilter murni berdasarkan <strong>tanggal nyata barang diproduksi</strong> (bukan tanggal file Excel di-upload).
          </p>
        </div>
      </div>
      <button
        @click="jumpToPrevProductionDay"
        class="shrink-0 px-3 py-1.5 bg-amber-200/90 hover:bg-amber-300 text-amber-950 border border-amber-300/80 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        <span>Cek Produksi Sebelumnya</span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- 3. ROW TENGAH: DIAGRAM GARIS MULTI-METRIK & TAB MESIN / DONAT OPERATOR   -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 reveal-on-scroll">
      
      <!-- KIRI: DIAGRAM GARIS (TOTAL ROLL, PASS, HOLD, REJECT) - SPAN 7 KOLOM -->
      <div class="lg:col-span-7 bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <!-- Header Diagram Garis -->
          <div class="flex flex-col gap-3 border-b border-zinc-100 pb-3">
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-sm sm:text-base font-black text-zinc-950 tracking-tight">TREN KOMPARASI HASIL PRODUKSI</span>
                  <span class="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-zinc-900 text-white font-mono uppercase">
                    {{ lineChartTotals.periodLabel || activePeriodSubtitle }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-500 font-medium mt-0.5">
                  Perbandingan volume total roll, mutu PASS, karantina HOLD, dan afval REJECT.
                </p>
              </div>

              <!-- Selector Granularitas Adaptif (Sesuai Rentang Waktu Aktif) -->
              <div class="flex items-center bg-zinc-100/90 p-0.5 rounded-xl border border-zinc-200 text-xs font-mono font-bold shrink-0 overflow-x-auto max-w-full scrollbar-none">
                <button
                  v-for="g in availableGranularities"
                  :key="g.key"
                  @click="setChartGranularity(g.key)"
                  :class="[
                    'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-[10.5px] shrink-0',
                    chartGranularity === g.key
                      ? 'bg-white text-zinc-950 shadow-2xs font-black'
                      : 'text-zinc-500 hover:text-zinc-900'
                  ]"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>

            <!-- Baris Sheet Mesin (Slitting ➔ Rewind ➔ Casting ➔ Gabungan) -->
            <div class="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none flex-wrap">
              <span class="text-[10px] text-zinc-400 font-mono font-bold uppercase shrink-0">Sheet Mesin:</span>
              <div class="flex items-center gap-1 bg-zinc-100/90 p-0.5 rounded-xl border border-zinc-200">
                <button
                  v-for="sheet in chartMachineSheets"
                  :key="sheet.key"
                  @click="setChartMachineSheet(sheet.key)"
                  :class="[
                    'px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0',
                    activeChartMachineSheet === sheet.key
                      ? 'bg-zinc-950 text-white shadow-xs font-black ring-1 ring-zinc-900'
                      : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
                  ]"
                >
                  <span>{{ sheet.icon }}</span>
                  <span>{{ sheet.label }}</span>
                </button>
              </div>
            </div>

            <!-- Custom Legend Badges dengan Angka Terintegrasi (Klik untuk On/Off Garis) -->
            <div class="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono font-bold flex-wrap justify-between sm:justify-start">
              <div class="text-[10px] text-zinc-400 font-sans uppercase mr-1">Tampilkan:</div>
              <button
                @click="toggleDataset('total')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none text-[11px]',
                  chartVisibility.total
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-50 text-zinc-400 border-zinc-200 line-through opacity-50'
                ]"
                title="Klik untuk on/off garis Total"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.total ? 'bg-white' : 'bg-zinc-400'"></span>
                <span>Total: <strong>{{ formatNum(lineChartTotals.total) }}</strong></span>
              </button>
              <button
                @click="toggleDataset('pass')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none text-[11px]',
                  chartVisibility.pass
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-zinc-50 text-zinc-400 border-zinc-200 line-through opacity-50'
                ]"
                title="Klik untuk on/off garis Pass"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.pass ? 'bg-emerald-500' : 'bg-zinc-400'"></span>
                <span>Pass: <strong>{{ formatNum(lineChartTotals.pass) }}</strong></span>
              </button>
              <button
                @click="toggleDataset('hold')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none text-[11px]',
                  chartVisibility.hold
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                    : 'bg-zinc-50 text-zinc-400 border-zinc-200 line-through opacity-50'
                ]"
                title="Klik untuk on/off garis Hold"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.hold ? 'bg-amber-500' : 'bg-zinc-400'"></span>
                <span>Hold: <strong>{{ formatNum(lineChartTotals.hold) }}</strong></span>
              </button>
              <button
                @click="toggleDataset('reject')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all cursor-pointer select-none text-[11px]',
                  chartVisibility.reject
                    ? 'bg-red-50 text-red-800 border-red-300 shadow-2xs'
                    : 'bg-zinc-50 text-zinc-400 border-zinc-200 line-through opacity-50'
                ]"
                title="Klik untuk on/off garis Reject"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.reject ? 'bg-red-500' : 'bg-zinc-400'"></span>
                <span>Reject: <strong>{{ formatNum(lineChartTotals.reject) }}</strong></span>
              </button>
            </div>
          </div>

          <!-- Canvas Chart (Lebar & Tinggi Maksimal, Bersih & Bernapas) -->
          <div class="h-68 sm:h-76 relative w-full mt-3">
            <canvas ref="lineComparisonChartCanvas"></canvas>
          </div>
        </div>

        <div class="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>* Periode: <strong>{{ activePeriodSubtitle }}</strong></span>
          <span class="text-zinc-500 font-bold">Sinkronisasi Otomatis</span>
        </div>
      </div>

      <!-- KANAN: TAB MESIN & DIAGRAM DONAT OPERATOR - SPAN 5 KOLOM -->
      <div class="lg:col-span-5 bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs flex flex-col justify-between">
        <div>
          <!-- Header & Machine Tabs -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 pb-3">
            <div>
              <h2 class="text-sm sm:text-base font-black text-zinc-950">MUTU & HASIL PER OPERATOR</h2>
              <p class="text-[11px] text-zinc-500 font-medium">Distribusi persen Pass, Hold, dan Reject.</p>
            </div>

            <!-- Machine Tab Buttons (Slitting, Rewind, Casting) Minimalist -->
            <div class="bg-zinc-100 p-1 rounded-xl border border-zinc-200 flex items-center gap-1 text-[11px] font-mono font-bold shrink-0">
              <button
                v-for="tab in machineTabs"
                :key="tab.key"
                @click="selectedMachineTab = tab.key"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1',
                  selectedMachineTab === tab.key
                    ? 'bg-zinc-950 text-white shadow-xs font-black'
                    : 'text-zinc-600 hover:text-zinc-950'
                ]"
              >
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>

          <!-- Operator Donut Cards List -->
          <div class="mt-3 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            <div
              v-for="op in operatorQualityStats"
              :key="op.name"
              class="p-3.5 rounded-2xl bg-zinc-50/80 border border-zinc-200/90 hover:border-zinc-300 transition-all flex items-center justify-between gap-3"
            >
              <!-- Info Operator & Metrik Angka -->
              <div class="space-y-0.5">
                <div class="flex items-center gap-1.5 flex-wrap">
                  <span class="w-2 h-2 rounded-full" :class="op.fromDb ? 'bg-emerald-500' : 'bg-red-500'"></span>
                  <span class="font-black text-xs sm:text-sm text-zinc-900 font-mono">{{ op.name }}</span>
                  <span v-if="op.code && op.code !== '-'" class="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-zinc-200 text-zinc-700">
                    KODE: {{ op.code }}
                  </span>
                  <span v-if="op.group" class="px-1.5 py-0.2 rounded text-[9.5px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                    GRUP {{ op.group }}
                  </span>
                  <span v-if="op.fromDb" class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200" title="Terdaftar di Master Operator Database">
                    ✓ MASTER DB
                  </span>
                </div>
                <div class="text-[11px] text-zinc-500 font-medium">
                  Total: <strong class="text-zinc-900 font-mono">{{ formatNum(op.totalRolls) }} Roll</strong>
                  • {{ formatNum(op.totalKg) }} kg
                  • {{ formatNum(op.totalMeters) }} m
                </div>
                <!-- Badge Rincian Count -->
                <div class="flex items-center gap-1.5 pt-0.5 text-[10.5px] font-mono font-bold">
                  <span class="text-emerald-700 bg-emerald-100/80 px-1.5 py-0.5 rounded">
                    {{ op.passCount }} Pass ({{ op.passRate }}%)
                  </span>
                  <span v-if="op.holdCount > 0" class="text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                    {{ op.holdCount }} Hold
                  </span>
                  <span v-if="op.rejectCount > 0" class="text-red-700 bg-red-100/80 px-1.5 py-0.5 rounded">
                    {{ op.rejectCount }} Rej
                  </span>
                </div>
              </div>

              <!-- Diagram Donat Melingkar -->
              <div class="relative flex items-center justify-center shrink-0">
                <svg class="w-16 h-16 -rotate-90 transform" viewBox="0 0 36 36">
                  <path
                    class="text-zinc-200"
                    stroke-width="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    class="text-emerald-500 transition-all duration-1000"
                    stroke-width="3.5"
                    :stroke-dasharray="`${op.passRate}, 100`"
                    stroke-linecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    v-if="op.holdRate > 0"
                    class="text-amber-500 transition-all duration-1000"
                    stroke-width="3.5"
                    :stroke-dasharray="`${op.holdRate}, 100`"
                    :stroke-dashoffset="`-${op.passRate}`"
                    stroke-linecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    v-if="op.rejectRate > 0"
                    class="text-red-500 transition-all duration-1000"
                    stroke-width="3.5"
                    :stroke-dasharray="`${op.rejectRate}, 100`"
                    :stroke-dashoffset="`-${op.passRate + op.holdRate}`"
                    stroke-linecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <!-- Angka Persen di Tengah Donat -->
                <div class="absolute flex flex-col items-center justify-center font-mono">
                  <span class="text-[11px] font-black text-zinc-900">{{ op.passRate }}%</span>
                  <span class="text-[7.5px] font-bold text-zinc-400 uppercase">PASS</span>
                </div>
              </div>
            </div>

            <!-- Empty State Operator -->
            <div
              v-if="operatorQualityStats.length === 0"
              class="p-6 text-center text-xs text-zinc-400 font-medium bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2.5"
            >
              <div class="text-sm text-zinc-600 font-bold">Tidak ada output produksi mesin {{ selectedMachineTab }} pada {{ activePeriodSubtitle }}.</div>
              <p class="text-[11px] text-zinc-400">Hasil produksi dihitung murni berdasarkan tanggal aktual pengerjaan roll.</p>
              
              <!-- Tampilkan Daftar Master Operator Database yang Tersedia untuk Mesin Ini -->
              <div v-if="configStore.operatorList.filter(o => !o.mesin || o.mesin.toUpperCase().includes(selectedMachineTab) || selectedMachineTab.includes(o.mesin.toUpperCase())).length > 0" class="pt-2 border-t border-zinc-200/80">
                <span class="text-[10px] text-zinc-500 font-mono block mb-1.5">Daftar Operator Terdaftar di Master Database:</span>
                <div class="flex flex-wrap items-center justify-center gap-1.5">
                  <span
                    v-for="dbOp in configStore.operatorList.filter(o => !o.mesin || o.mesin.toUpperCase().includes(selectedMachineTab) || selectedMachineTab.includes(o.mesin.toUpperCase()))"
                    :key="dbOp.id"
                    class="px-2 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-white text-zinc-700 border border-zinc-200 shadow-2xs inline-flex items-center gap-1"
                  >
                    <svg class="w-3 h-3 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke-width="2"></path><circle cx="12" cy="7" r="4" stroke-width="2"></circle></svg>
                    <span>{{ dbOp.nama }}</span>
                    <span class="text-blue-600">({{ dbOp.kodeOperator }})</span>
                    <span v-if="dbOp.kodeGrup" class="text-zinc-400 text-[9.5px]">Grup {{ dbOp.kodeGrup }}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Shift Overview -->
        <div class="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
          <span>Mesin: <strong>{{ selectedMachineTab }}</strong></span>
          <span class="text-emerald-700 font-bold">{{ operatorQualityStats.length }} Operator Terdata</span>
        </div>
      </div>

      </div>
    </div>
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- AKHIR BLOK 1: EXECUTIVE ANALYTICS & FORECASTING HUB                       -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- BLOK 2: LIVE OPERATIONAL MONITORING (SAAT INI / REAL-TIME SHOPFLOOR HUD)   -->
    <!-- Nuansa: Industrial Live Cockpit (Dark Slate Accents, Pulsing Realtime Node)-->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div class="space-y-4 pt-3">
      
      <!-- Blok 2 Identity Banner -->
      <div class="bg-gradient-to-r from-zinc-950 via-slate-900 to-zinc-900 text-white p-3.5 sm:p-4.5 rounded-3xl border border-zinc-800/90 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-3 relative overflow-hidden">
        <!-- Looping Moving Accent Flow -->
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-cyan-400 bg-[length:200%_100%] anim-gradient-flow"></div>
        <div class="space-y-1">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="px-2.5 py-0.5 rounded-full text-[9.5px] font-black font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-flex items-center gap-1.5 shadow-2xs">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>BLOK 2 • LIVE OPERATIONAL MONITORING</span>
            </span>
            <span class="text-xs font-mono font-bold text-zinc-300">
              Representasi Waktu Riil Lantai Produksi
            </span>
          </div>
          <p class="text-xs text-zinc-400 font-medium">
            Pelacakan alur pengerjaan SPK (Rencana vs Realisasi) & rincian dimensi ukuran barang jadi (FG) yang keluar dari pisau mesin hari ini.
          </p>
        </div>

        <div class="flex items-center gap-2 text-xs font-mono font-bold shrink-0 flex-wrap">
          <div class="px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 flex items-center gap-1.5 shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Shift {{ currentShift.definition.shortName }} (Grup {{ currentShift.group }})</span>
          </div>
          <div class="px-3 py-1.5 rounded-xl bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 flex items-center gap-1.5 shadow-2xs">
            <span>📅 {{ workDateLabel }}</span>
          </div>
        </div>
      </div>

      <!-- 4.1 BLOK TIMELINE HORIZONTAL SPK (ATAS: PLAN, BAWAH: REALISASI) -->
      <div class="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4 reveal-on-scroll">
      
      <!-- Header Monitor SPK -->
      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 border-b border-zinc-100 pb-3.5">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-base sm:text-lg">⏱️</span>
            <h2 class="text-sm sm:text-base font-black text-zinc-950 tracking-tight">TIMELINE PELACAKAN SPK (PLANNING & REALISASI)</h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 font-mono">
              {{ dashboardTimelineRows.length }} SPK TERDATA
            </span>
            <div v-if="spkStore.activeDateWindow" class="px-2.5 py-0.5 rounded-xl bg-zinc-100 text-zinc-700 font-mono text-[10.5px] border border-zinc-200 flex items-center gap-1">
              <span>📅</span>
              <span class="text-zinc-400">Rentang:</span>
              <strong class="text-emerald-700">{{ spkStore.activeDateWindow.label }}</strong>
            </div>
            <div class="flex items-center gap-1.5 bg-zinc-100 px-2.5 py-0.5 rounded-xl border border-zinc-200">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span class="text-[10px] font-bold text-emerald-800 font-mono">ACUAN:</span>
              <select
                v-if="(spkStore.batches || []).length > 0"
                v-model="spkStore.activeTimelineBatchUuid"
                @change="spkStore.setActiveReferenceBatch(spkStore.activeTimelineBatchUuid)"
                class="bg-transparent text-zinc-800 text-xs font-bold font-mono border-0 outline-none cursor-pointer max-w-[160px] truncate"
              >
                <option v-for="b in spkStore.batches" :key="b.uuid" :value="b.uuid">
                  {{ b.batchName }} ({{ b.tanggal }})
                </option>
              </select>
            </div>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium mt-1">
            Garis Lurus Tengah • Bagian Atas: <strong>Target Planning</strong> • Bagian Bawah: <strong>Realisasi Aktual</strong>. Posisi sinkron otomatis saat terjadi pergeseran urutan, order dilewati, atau order sisipan.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap w-full lg:w-auto justify-between lg:justify-end">
          <button
            v-if="totalTimelinePlansCount > 15"
            @click="showAllTimelineSpk = !showAllTimelineSpk"
            class="px-2.5 py-1.5 rounded-xl text-[10.5px] font-mono font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
          >
            {{ showAllTimelineSpk ? 'Tampilkan 15 Saja' : `Lihat Semua (${totalTimelinePlansCount} SPK)` }}
          </button>
          <router-link
            to="/spk"
            class="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <span>Buka Manajemen SPK</span>
            <span>➔</span>
          </router-link>
        </div>
      </div>

      <!-- Executive Schedule & Realtime Progress Banner -->
      <div class="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-950 text-white p-3.5 sm:p-4 rounded-2xl border border-zinc-800 flex flex-col md:flex-row md:items-center md:justify-between gap-3 select-none">
        <div class="flex items-center gap-3 sm:gap-4 flex-wrap text-xs font-mono">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span class="text-zinc-400">Selesai:</span>
            <strong class="text-emerald-400 text-sm font-black">{{ timelineBatchSummary.completedCount }}</strong>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
            <span class="text-zinc-400">Berjalan:</span>
            <strong class="text-blue-400 text-sm font-black">{{ timelineBatchSummary.runningCount }}</strong>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-zinc-400"></span>
            <span class="text-zinc-400">Antrean:</span>
            <strong class="text-zinc-200 text-sm font-black">{{ timelineBatchSummary.upcomingCount }}</strong>
          </div>
          <div v-if="timelineBatchSummary.skippedCount > 0" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span class="text-purple-300">Dilewati:</span>
            <strong class="text-purple-300 text-sm font-black">{{ timelineBatchSummary.skippedCount }}</strong>
          </div>
          <div v-if="timelineBatchSummary.unplannedCount > 0" class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span class="text-amber-300">Sisipan:</span>
            <strong class="text-amber-300 text-sm font-black">{{ timelineBatchSummary.unplannedCount }}</strong>
          </div>
        </div>

        <!-- Meter & Roll Progress Bars with Support for >100% -->
        <div class="flex items-center gap-3 sm:gap-4 text-xs font-mono w-full md:w-auto">
          <!-- Meter Progress -->
          <div class="bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700 min-w-[125px] flex-1 md:flex-initial space-y-1">
            <div class="flex justify-between text-[10.5px] text-zinc-400">
              <span>Meter</span>
              <strong :class="timelineBatchSummary.meterPercent > 100 ? 'text-cyan-400 font-black' : 'text-emerald-400'">
                {{ timelineBatchSummary.meterPercent > 100 ? `🚀 ${timelineBatchSummary.meterPercent}%` : `${timelineBatchSummary.meterPercent}%` }}
              </strong>
            </div>
            <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="timelineBatchSummary.meterPercent > 100 ? 'bg-gradient-to-r from-emerald-500 to-cyan-400' : 'bg-emerald-500'"
                :style="{ width: `${Math.min(100, timelineBatchSummary.meterPercent)}%` }"
              ></div>
            </div>
            <div class="text-[9.5px] text-zinc-300 text-right truncate">
              {{ formatNum(timelineBatchSummary.totalActMeters) }} / {{ formatNum(timelineBatchSummary.totalPlanMeters) }} m
            </div>
          </div>

          <!-- Roll Progress -->
          <div class="bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700 min-w-[125px] flex-1 md:flex-initial space-y-1">
            <div class="flex justify-between text-[10.5px] text-zinc-400">
              <span>Roll FG</span>
              <strong :class="timelineBatchSummary.rollPercent > 100 ? 'text-cyan-400 font-black' : 'text-blue-400'">
                {{ timelineBatchSummary.rollPercent > 100 ? `🚀 ${timelineBatchSummary.rollPercent}%` : `${timelineBatchSummary.rollPercent}%` }}
              </strong>
            </div>
            <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
              <div
                class="h-full rounded-full transition-all duration-500"
                :class="timelineBatchSummary.rollPercent > 100 ? 'bg-gradient-to-r from-blue-500 to-cyan-400' : 'bg-blue-500'"
                :style="{ width: `${Math.min(100, timelineBatchSummary.rollPercent)}%` }"
              ></div>
            </div>
            <div class="text-[9.5px] text-zinc-300 text-right truncate">
              {{ formatNum(timelineBatchSummary.totalActRolls) }} / {{ formatNum(timelineBatchSummary.totalPlanRolls) }} Roll
            </div>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- TIMELINE HORIZONTAL (GARIS LURUS, ATAS PLAN, BAWAH REALISASI)       -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div v-if="dashboardTimelineRows.length > 0" class="relative overflow-x-auto py-4 px-2 scrollbar-thin">
        <div class="min-w-max flex items-center justify-start relative py-4 px-3 gap-3">
          
          <!-- Background Center Track Line (Runs horizontally between all nodes) -->
          <div class="absolute top-1/2 left-8 right-8 -translate-y-1/2 h-1 bg-zinc-200 z-0"></div>
          <!-- Active Progress Line with Looping Gradient Flow -->
          <div class="absolute top-1/2 left-8 right-1/4 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-400 z-0 anim-gradient-flow"></div>

          <!-- Nodes Loop -->
          <div
            v-for="(row, idx) in dashboardTimelineRows"
            :key="row.id"
            class="relative z-10 flex flex-col items-center w-64 sm:w-72 shrink-0 px-1"
          >
            <!-- ═══════════════════════════════════════════════ -->
            <!-- 1. BAGIAN ATAS: PLAN (RENCANA SPK)            -->
            <!-- ═══════════════════════════════════════════════ -->
            <div class="w-full h-[225px] flex flex-col justify-end">
              <!-- If Plan Exists -->
              <div
                v-if="row.plan"
                @click="openSpkModal(row, 'PLANNING')"
                class="w-full h-full bg-white hover:bg-amber-50/60 p-2.5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between group shadow-2xs hover:shadow-md relative overflow-hidden"
                :class="[
                  row.isCurrentlyRunning ? 'border-blue-500 ring-2 ring-blue-500/40 bg-blue-50/20' : 'border-zinc-200 hover:border-amber-400'
                ]"
                title="Klik untuk info planning SPK"
              >
                <!-- Highlight Indicator Running Now -->
                <div v-if="row.isCurrentlyRunning" class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] anim-gradient-flow"></div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-1 flex-wrap">
                    <span
                      class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono"
                      :class="row.isCurrentlyRunning ? 'bg-blue-600 text-white animate-pulse' : 'bg-amber-100 text-amber-900'"
                    >
                      {{ row.isCurrentlyRunning ? '⚡ RUNNING # ' + (idx + 1) : '📋 PLAN #' + (idx + 1) }}
                    </span>
                    <span class="text-[9.5px] font-mono font-bold text-zinc-500">
                      {{ row.formula }} ({{ row.thickness }}μ)
                    </span>
                  </div>
                  <div class="text-xs font-black font-mono text-zinc-900 truncate" :title="row.spkNo">
                    {{ row.spkNo }}
                    <span v-if="row.customer && row.customer !== '-'" class="font-normal text-zinc-500 text-[10px]">
                      • {{ row.customer }}
                    </span>
                  </div>

                  <!-- Ringkasan Pola Potong Pisau UP -->
                  <div v-if="row.chartingSummary" class="text-[9.5px] font-mono font-bold text-indigo-900 bg-indigo-50/90 px-1.5 py-0.5 rounded border border-indigo-200 truncate" :title="'Target Pola Pisau: ' + row.chartingSummary">
                    🔪 Pisau UP: <strong>{{ row.chartingSummary }}</strong>
                  </div>

                  <div class="text-[9.5px] text-zinc-500 font-mono truncate" :title="row.ukuranJumbo">
                    📐 Jumbo: {{ row.ukuranJumbo }}
                  </div>
                </div>

                <!-- TARGET DIMENSI CHILD (PISAU FG) SESUAI PLAN SPK -->
                <div class="pt-1 border-t border-zinc-100 space-y-1">
                  <!-- Match / Deviation Badge Status -->
                  <div v-if="row.actual" class="flex items-center justify-between gap-1">
                    <span
                      v-if="row.isChartingFullyMatched"
                      class="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
                    >
                      ✓ Pisau Sesuai SPK
                    </span>
                    <span
                      v-else
                      class="inline-flex items-center gap-1 text-[8.5px] font-mono font-bold text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-300 truncate"
                      :title="row.chartingDeviationMessage"
                    >
                      ⚠️ Deviasi Pisau Potong
                    </span>
                    <span class="text-[9px] font-mono text-zinc-500 font-bold ml-auto">
                      {{ formatNum(row.plannedChildRolls) }} Roll Target
                    </span>
                  </div>
                  <div v-else class="text-[9.5px] text-zinc-700 font-mono font-bold flex items-center justify-between">
                    <span>Target: <strong>{{ formatNum(row.plannedChildRolls) }} Roll</strong></span>
                    <span class="text-zinc-500">{{ formatNum(row.plannedParentRolls) }} JR</span>
                  </div>

                  <!-- Chip / List Dimensi Child Target -->
                  <div v-if="row.childAnalytics && row.childAnalytics.length > 0" class="space-y-0.5">
                    <div
                      v-for="(child, cIdx) in row.childAnalytics.slice(0, 2)"
                      :key="cIdx"
                      class="flex items-center justify-between text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-50 border border-zinc-200/80"
                    >
                      <span class="font-bold text-zinc-800">
                        {{ child.lebar }}mm × {{ formatNum(child.panjang) }}m
                      </span>
                      <span class="text-zinc-600">
                        Target: <strong class="text-zinc-900">{{ child.targetRolls }}</strong>
                        <span v-if="child.actualRolls > 0" class="text-emerald-600 font-bold"> (✓{{ child.actualRolls }})</span>
                      </span>
                    </div>
                    <div v-if="row.childAnalytics.length > 2" class="text-[8.5px] font-mono text-zinc-400 text-right pr-1">
                      +{{ row.childAnalytics.length - 2 }} pisau lainnya
                    </div>
                  </div>
                </div>
              </div>

              <!-- If Unplanned (Order Sisipan Lapangan) -->
              <div
                v-else
                class="w-full h-full bg-amber-50/70 p-2.5 rounded-2xl border border-dashed border-amber-300 text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono bg-amber-200 text-amber-900">
                      ⚠️ SISIPAN LAPANGAN
                    </span>
                  </div>
                  <div class="text-xs font-bold text-amber-950 font-mono mt-1">
                    Tanpa Planned SPK
                  </div>
                  <div class="text-[10px] text-amber-800 leading-tight mt-1">
                    Proses aktual order ini tidak ada dalam jadwal SPK (dikerjakan langsung di lapangan).
                  </div>
                </div>
                <div class="text-[9.5px] font-mono text-amber-900 bg-amber-100/70 px-1.5 py-0.5 rounded border border-amber-200">
                  Total Aktual: <strong>{{ formatNum(row.actual?.totalRealRolls || 0) }} Roll</strong>
                </div>
              </div>
            </div>

            <!-- Vertical Connector Atas ke Tengah (Line) -->
            <div class="w-0.5 h-3.5 bg-zinc-300 transition-colors z-0 my-0.5"></div>

            <!-- ═══════════════════════════════════════════════ -->
            <!-- 2. BAGIAN TENGAH: NODE CIRCLE (MARKER)        -->
            <!-- ═══════════════════════════════════════════════ -->
            <div
              @click="openSpkModal(row, 'ALL')"
              :class="[
                'w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-black text-[11px] transition-all shadow-sm hover:scale-110 z-10 cursor-pointer',
                row.status === 'COMPLETED' ? 'bg-emerald-500 border-white text-white ring-4 ring-emerald-100' :
                row.isCurrentlyRunning ? 'bg-blue-600 border-white text-white ring-4 ring-blue-300 animate-pulse' :
                row.status === 'IN_PROGRESS' ? 'bg-blue-600 border-white text-white ring-4 ring-blue-100 animate-pulse' :
                row.status === 'SKIPPED' ? 'bg-purple-600 border-white text-white ring-4 ring-purple-100' :
                row.status === 'UNPLANNED' ? 'bg-amber-500 border-white text-white ring-4 ring-amber-100' :
                'bg-white border-zinc-300 text-zinc-600 ring-4 ring-zinc-50'
              ]"
              :title="'Klik untuk detail SPK: ' + row.spkNo"
            >
              <span v-if="row.status === 'COMPLETED'">✓</span>
              <span v-else-if="row.isCurrentlyRunning">⚡</span>
              <span v-else-if="row.status === 'IN_PROGRESS'">▶</span>
              <span v-else-if="row.status === 'SKIPPED'">⏭️</span>
              <span v-else-if="row.status === 'UNPLANNED'">⚠️</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>

            <!-- Vertical Connector Tengah ke Bawah (Line) -->
            <div class="w-0.5 h-3.5 bg-zinc-300 transition-colors z-0 my-0.5"></div>

            <!-- ═══════════════════════════════════════════════ -->
            <!-- 3. BAGIAN BAWAH: REALISASI (AKTUAL LAPANGAN)  -->
            <!-- ═══════════════════════════════════════════════ -->
            <div class="w-full h-[225px] flex flex-col justify-start">
              <!-- If Actual Production Exists -->
              <div
                v-if="row.actual"
                @click="openSpkModal(row, 'REALISASI')"
                class="w-full h-full bg-white hover:bg-emerald-50/60 p-2.5 rounded-2xl border transition-all cursor-pointer text-left flex flex-col justify-between group shadow-2xs hover:shadow-md relative overflow-hidden"
                :class="[
                  row.targetStatus ? row.targetStatus.borderClass : 'border-zinc-200',
                  row.isCurrentlyRunning ? 'ring-2 ring-blue-400/50 bg-blue-50/20' : 'hover:border-emerald-400'
                ]"
                title="Klik untuk info realisasi aktual"
              >
                <!-- Highlight Indicator Running Now -->
                <div v-if="row.isCurrentlyRunning" class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-500 to-blue-600 bg-[length:200%_100%] anim-gradient-flow"></div>

                <div class="space-y-1">
                  <div class="flex items-center justify-between gap-1">
                    <span
                      v-if="row.targetStatus"
                      class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono border truncate max-w-[120px]"
                      :class="row.targetStatus.badgeClass"
                    >
                      {{ row.targetStatus.icon }} {{ row.targetStatus.label }}
                    </span>
                    <span
                      :class="[
                        'px-1.5 py-0.2 rounded text-[9.5px] font-bold font-mono',
                        row.achievementPercent > 100 ? 'text-cyan-800 bg-cyan-100 border border-cyan-300 font-black' :
                        row.status === 'COMPLETED' ? 'text-emerald-700 font-black' :
                        row.status === 'IN_PROGRESS' || row.isCurrentlyRunning ? 'text-blue-700 font-black' : 'text-zinc-500'
                      ]"
                    >
                      {{ row.achievementPercent > 100 ? '🚀 ' + row.achievementPercent + '%' : row.achievementPercent + '%' }}
                    </span>
                  </div>

                  <div class="text-xs font-black font-mono text-zinc-900 truncate">
                    {{ formatNum(row.actual.totalRealRolls) }} Roll Selesai
                    <span v-if="row.actual.operator" class="font-normal text-zinc-500 text-[10px]">
                      • 👤 {{ row.actual.operator }}
                    </span>
                  </div>

                  <!-- Ringkasan Progres Pemotongan Mesin -->
                  <div v-if="row.isCurrentlyRunning && row.status === 'IN_PROGRESS'" class="text-[9.5px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200 font-bold animate-pulse">
                    ⚡ Sedang Memotong di Slitting...
                  </div>

                  <div class="text-[10px] text-zinc-500 font-mono">
                    {{ formatNum(row.actual.totalRealMeter) }} m • {{ formatNum(row.actual.totalRealKg) }} kg
                  </div>
                </div>

                <div class="space-y-1 pt-1 border-t border-zinc-100">
                  <div class="text-[9.5px] font-mono text-zinc-600 flex items-center justify-between">
                    <span>Potong: <strong>{{ row.actualParentCut || 0 }} JR</strong></span>
                    <span class="flex items-center gap-1">
                      <span class="text-emerald-700 font-bold">✓{{ row.actual.passCount }}</span>
                      <span v-if="row.actual.holdCount > 0" class="text-amber-700 font-bold">⚠️{{ row.actual.holdCount }}</span>
                      <span v-if="row.actual.rejectCount > 0" class="text-red-700 font-bold">✕{{ row.actual.rejectCount }}</span>
                    </span>
                  </div>
                  <div class="text-[9px] text-zinc-500 font-mono pt-0.5 border-t border-zinc-100 flex items-center justify-between truncate">
                    <span>🕒 {{ row.startTimeFormatted || '-' }}</span>
                    <span>➔</span>
                    <span>🏁 {{ row.endTimeFormatted || '-' }}</span>
                  </div>
                </div>
              </div>

              <!-- If Skipped (Dilewati / Dilompati) -->
              <div
                v-else-if="row.status === 'SKIPPED'"
                class="w-full h-full bg-purple-50/70 p-2.5 rounded-2xl border border-dashed border-purple-300 text-left flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <div class="flex items-center justify-between">
                    <span class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono bg-purple-200 text-purple-900">
                      ⏭️ DILEWATI
                    </span>
                  </div>
                  <div class="text-xs font-bold text-purple-950 font-mono mt-1">
                    Dilompati di Lapangan
                  </div>
                  <div class="text-[10px] text-purple-800 leading-tight mt-1">
                    SPK ini terlewat karena order urutan selanjutnya telah selesai dikerjakan terlebih dahulu.
                  </div>
                </div>
                <div class="text-[9.5px] font-mono text-purple-700 bg-purple-100/70 px-1.5 py-0.5 rounded border border-purple-200">
                  Target: {{ formatNum(row.plannedChildRolls) }} Roll
                </div>
              </div>

              <!-- If Upcoming (Menunggu Giliran) -->
              <div
                v-else
                class="w-full h-full bg-zinc-50/70 p-2.5 rounded-2xl border border-dashed border-zinc-200 text-left flex flex-col justify-between shadow-2xs"
                :class="row.isCurrentlyRunning ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-300/40' : ''"
              >
                <div>
                  <div class="flex items-center justify-between">
                    <span
                      class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono"
                      :class="row.isCurrentlyRunning ? 'bg-blue-600 text-white animate-pulse' : 'bg-zinc-200 text-zinc-700'"
                    >
                      {{ row.isCurrentlyRunning ? '⚡ ANTRIAN AKTIF' : '⏱️ ANTREAN #' + (idx + 1) }}
                    </span>
                  </div>
                  <div class="text-xs font-bold text-zinc-800 font-mono mt-1">
                    {{ row.isCurrentlyRunning ? 'Menunggu Mesin Slitting Dimulai' : 'Menunggu Giliran Mesin' }}
                  </div>
                  <div class="text-[10px] text-zinc-500 leading-tight mt-1">
                    Est. Mulai: <strong class="text-zinc-800">{{ row.startTimeFormatted || '-' }}</strong>
                  </div>
                </div>
                <div class="text-[9.5px] font-mono text-zinc-700 bg-white/80 px-1.5 py-0.5 rounded border border-zinc-200">
                  Target: <strong>{{ formatNum(row.plannedChildRolls) }} Roll</strong> ({{ row.planDurationMinutes }} mnt)
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      <!-- Clean Empty State -->
      <div v-else class="py-8 px-4 text-center rounded-2xl bg-zinc-50/80 border border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2">
        <div class="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-lg text-zinc-400">
          📋
        </div>
        <p class="text-xs font-mono font-bold text-zinc-700">
          Belum ada jadwal SPK aktif yang terdaftar
        </p>
        <p class="text-[11px] text-zinc-400 max-w-md">
          Impor jadwal pengerjaan atau buat jadwal baru di Manajemen SPK untuk melacak target planning dan realisasi aktual secara real-time.
        </p>
        <router-link
          to="/spk"
          class="mt-1 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-mono font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
        >
          <span>Buka Manajemen SPK</span>
          <span>➔</span>
        </router-link>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 4.B RINCIAN UKURAN FG SELESAI DIPROSES HARI INI (DESKRIPSI NAV & STATUS)   -->
    <!-- Format: [JENIS] [KF] [THICK] MC X [WIDTH] MM                              -->
    <!-- ========================================================================= -->
    <div class="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4 reveal-on-scroll">
      
      <!-- Header Section -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 pb-3">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-base sm:text-lg">📦</span>
            <h2 class="text-sm sm:text-base font-black text-zinc-950 tracking-tight">
              RINCIAN UKURAN FG SELESAI DIPROSES HARI INI
            </h2>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-100 text-indigo-800 font-mono">
              {{ todayFgSizeSummary.grandTotals.variantCount }} VARIAN UKURAN
            </span>
            <span class="px-2.5 py-0.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 font-mono text-[10.5px] font-bold">
              📅 {{ activeTargetDateDisplay }}
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium mt-1">
            Format resmi <strong>Deskripsi NAV ([JENIS] [KF] [THICK] MC X [WIDTH] MM)</strong> beserta akumulasi Roll, Meter, Berat Netto (kg), dan status kendali mutu QC (PASS / HOLD / REJECT).
          </p>
        </div>

        <span class="text-xs font-mono font-bold text-zinc-500">
          Total: <strong class="text-zinc-900 text-sm font-black">{{ formatNum(todayFgSizeSummary.grandTotals.totalRolls) }}</strong> Roll FG
        </span>
      </div>

      <!-- Summary KPI Strip: 4 Metric Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3">
        <!-- Total Roll -->
        <div class="bg-zinc-50/90 p-3 rounded-2xl border border-zinc-200/80 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Total Roll FG</span>
            <span class="text-lg sm:text-xl font-black text-zinc-900 font-mono">{{ formatNum(todayFgSizeSummary.grandTotals.totalRolls) }}</span>
            <span class="text-[10px] text-zinc-500 font-mono block">Roll Jadi Selesai</span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-blue-100/70 text-blue-700 flex items-center justify-center text-base">🎯</div>
        </div>

        <!-- Total Berat Netto -->
        <div class="bg-zinc-50/90 p-3 rounded-2xl border border-zinc-200/80 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Total Tonase Netto</span>
            <span class="text-lg sm:text-xl font-black text-zinc-900 font-mono">{{ formatNum(todayFgSizeSummary.grandTotals.totalKg) }}</span>
            <span class="text-[10px] text-zinc-500 font-mono block">kg ({{ (todayFgSizeSummary.grandTotals.totalKg / 1000).toFixed(2) }} Ton)</span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center text-base">⚖️</div>
        </div>

        <!-- Total Meter -->
        <div class="bg-zinc-50/90 p-3 rounded-2xl border border-zinc-200/80 flex items-center justify-between">
          <div>
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono block">Total Panjang</span>
            <span class="text-lg sm:text-xl font-black text-zinc-900 font-mono">{{ formatNum(todayFgSizeSummary.grandTotals.totalMeter) }}</span>
            <span class="text-[10px] text-zinc-500 font-mono block">Meter Linear</span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center text-base">📏</div>
        </div>

        <!-- Mutu QC Breakdown -->
        <div class="bg-zinc-50/90 p-3 rounded-2xl border border-zinc-200/80 flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider font-mono">Status Mutu QC</span>
            <span class="text-[10px] font-mono font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
              {{ todayFgSizeSummary.grandTotals.passRate }}% Pass
            </span>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap font-mono text-[11px] font-bold mt-1">
            <span class="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200" title="Lolos QC / Pass">
              ✓ {{ formatNum(todayFgSizeSummary.grandTotals.passRolls) }}
            </span>
            <span class="text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200" title="Karantina / Hold">
              ⚠️ {{ formatNum(todayFgSizeSummary.grandTotals.holdRolls) }}
            </span>
            <span class="text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-200" title="Reject / NG">
              ✕ {{ formatNum(todayFgSizeSummary.grandTotals.rejectRolls) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Controls: Filter & Sort Toolbar -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-1">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-sm">
          <input
            v-model="fgSearchQuery"
            type="text"
            placeholder="Cari deskripsi NAV (mis: M07, 1145, 25 MC)..."
            class="w-full bg-zinc-50 border border-zinc-200/90 rounded-xl px-3 py-1.5 text-xs font-mono text-zinc-800 placeholder-zinc-400 outline-none focus:border-red-500 focus:bg-white transition-colors"
          />
          <span v-if="fgSearchQuery" @click="fgSearchQuery = ''" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 cursor-pointer text-xs">✕</span>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Status Filter Tabs -->
          <div class="bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 flex items-center text-[10.5px] font-mono font-bold">
            <button
              @click="fgStatusFilter = 'ALL'"
              :class="fgStatusFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer"
            >
              Semua
            </button>
            <button
              @click="fgStatusFilter = 'PASS'"
              :class="fgStatusFilter === 'PASS' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <span>✓</span> PASS
            </button>
            <button
              @click="fgStatusFilter = 'HOLD'"
              :class="fgStatusFilter === 'HOLD' ? 'bg-amber-500 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <span>⚠️</span> HOLD
            </button>
            <button
              @click="fgStatusFilter = 'REJECT'"
              :class="fgStatusFilter === 'REJECT' ? 'bg-red-600 text-white shadow-2xs' : 'text-zinc-600 hover:text-zinc-900'"
              class="px-2.5 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1"
            >
              <span>✕</span> REJECT
            </button>
          </div>

          <!-- Sort Select: Default NAV -->
          <div class="flex items-center gap-1 bg-zinc-100 px-2.5 py-1 rounded-xl border border-zinc-200 text-xs font-mono">
            <span class="text-zinc-400 text-[10px] font-bold">Urut:</span>
            <select
              v-model="fgSortBy"
              class="bg-transparent text-zinc-800 font-bold border-0 outline-none cursor-pointer text-xs"
            >
              <option value="NAV">Deskripsi NAV (A-Z)</option>
              <option value="ROLL">Roll Terbanyak</option>
              <option value="KG">Tonase (Kg) Terbesar</option>
              <option value="METER">Meter Terpanjang</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Professional Table View of FG Sizes grouped by NAV Description -->
      <div v-if="todayFgSizeSummary.groups.length > 0" class="overflow-x-auto rounded-2xl border border-zinc-200/90 shadow-2xs">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-zinc-100/90 text-zinc-700 font-mono text-[10.5px] uppercase tracking-wider border-b border-zinc-200">
              <th class="py-2.5 px-3.5 font-bold">No</th>
              <th class="py-2.5 px-3.5 font-bold">Deskripsi NAV ([JENIS] [KF] [THICK] MC X [WIDTH] MM)</th>
              <th class="py-2.5 px-3 font-bold text-center bg-blue-50/60 border-l border-r border-blue-100">
                Total Output (Roll • m • kg)
              </th>
              <th class="py-2.5 px-3 font-bold text-center bg-emerald-50/60 border-r border-emerald-100 text-emerald-900">
                ✓ PASS (Roll • m • kg)
              </th>
              <th class="py-2.5 px-3 font-bold text-center bg-amber-50/60 border-r border-amber-100 text-amber-900">
                ⚠️ HOLD (Roll • m • kg)
              </th>
              <th class="py-2.5 px-3 font-bold text-center bg-red-50/60 text-red-900">
                ✕ REJECT (Roll • m • kg)
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 font-mono">
            <tr
              v-for="(item, idx) in todayFgSizeSummary.groups"
              :key="item.navDescription"
              class="hover:bg-zinc-50/90 transition-colors"
            >
              <td class="py-3 px-3.5 text-zinc-400 font-bold">{{ idx + 1 }}</td>
              
              <!-- Kolom Deskripsi NAV -->
              <td class="py-3 px-3.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="text-xs sm:text-[13px] font-black text-zinc-950 font-mono tracking-tight bg-zinc-100/80 px-2 py-0.5 rounded-lg border border-zinc-200">
                    {{ item.navDescription }}
                  </span>
                  <span v-if="item.machineList && item.machineList.length > 0" class="text-[10px] text-zinc-400 truncate hidden xl:inline">
                    • Mesin: {{ item.machineList.join(', ') }}
                  </span>
                </div>
              </td>

              <!-- Total Output -->
              <td class="py-3 px-3 text-center bg-blue-50/20 border-l border-r border-blue-100/70">
                <div class="font-black text-blue-900 text-xs">
                  {{ formatNum(item.totalRolls) }} Roll
                </div>
                <div class="text-[10.5px] text-zinc-600 font-medium">
                  {{ formatNum(item.totalMeter) }} m • {{ formatNum(item.totalKg) }} kg
                </div>
              </td>

              <!-- Status QC: PASS -->
              <td class="py-3 px-3 text-center bg-emerald-50/20 border-r border-emerald-100/70">
                <div v-if="item.passRolls > 0">
                  <div class="font-black text-emerald-800 text-xs">
                    {{ formatNum(item.passRolls) }} Roll
                  </div>
                  <div class="text-[10px] text-emerald-700">
                    {{ formatNum(item.passMeter) }} m • {{ formatNum(item.passKg) }} kg
                  </div>
                </div>
                <span v-else class="text-zinc-300 font-bold">-</span>
              </td>

              <!-- Status QC: HOLD -->
              <td class="py-3 px-3 text-center bg-amber-50/20 border-r border-amber-100/70">
                <div v-if="item.holdRolls > 0">
                  <div class="font-black text-amber-800 text-xs">
                    {{ formatNum(item.holdRolls) }} Roll
                  </div>
                  <div class="text-[10px] text-amber-700">
                    {{ formatNum(item.holdMeter) }} m • {{ formatNum(item.holdKg) }} kg
                  </div>
                </div>
                <span v-else class="text-zinc-300 font-bold">-</span>
              </td>

              <!-- Status QC: REJECT -->
              <td class="py-3 px-3 text-center bg-red-50/20">
                <div v-if="item.rejectRolls > 0">
                  <div class="font-black text-red-800 text-xs">
                    {{ formatNum(item.rejectRolls) }} Roll
                  </div>
                  <div class="text-[10px] text-red-700">
                    {{ formatNum(item.rejectMeter) }} m • {{ formatNum(item.rejectKg) }} kg
                  </div>
                </div>
                <span v-else class="text-zinc-300 font-bold">-</span>
              </td>
            </tr>
          </tbody>
          <tfoot>
            <tr class="bg-zinc-100 font-mono font-black text-zinc-900 text-xs border-t-2 border-zinc-300">
              <td colspan="2" class="py-3 px-3.5 text-right uppercase">Total Akumulasi:</td>
              <td class="py-3 px-3 text-center bg-blue-100/60 border-l border-r border-blue-200 text-blue-950">
                <div>{{ formatNum(todayFgSizeSummary.grandTotals.totalRolls) }} Roll</div>
                <div class="text-[10px] font-normal text-blue-800">{{ formatNum(todayFgSizeSummary.grandTotals.totalMeter) }} m • {{ formatNum(todayFgSizeSummary.grandTotals.totalKg) }} kg</div>
              </td>
              <td class="py-3 px-3 text-center bg-emerald-100/60 border-r border-emerald-200 text-emerald-950">
                <div>{{ formatNum(todayFgSizeSummary.grandTotals.passRolls) }} Roll</div>
                <div class="text-[10px] font-normal text-emerald-800">{{ formatNum(todayFgSizeSummary.grandTotals.passMeter) }} m • {{ formatNum(todayFgSizeSummary.grandTotals.passKg) }} kg</div>
              </td>
              <td class="py-3 px-3 text-center bg-amber-100/60 border-r border-amber-200 text-amber-950">
                <div>{{ formatNum(todayFgSizeSummary.grandTotals.holdRolls) }} Roll</div>
                <div class="text-[10px] font-normal text-amber-800">{{ formatNum(todayFgSizeSummary.grandTotals.holdMeter) }} m • {{ formatNum(todayFgSizeSummary.grandTotals.holdKg) }} kg</div>
              </td>
              <td class="py-3 px-3 text-center bg-red-100/60 text-red-950">
                <div>{{ formatNum(todayFgSizeSummary.grandTotals.rejectRolls) }} Roll</div>
                <div class="text-[10px] font-normal text-red-800">{{ formatNum(todayFgSizeSummary.grandTotals.rejectMeter) }} m • {{ formatNum(todayFgSizeSummary.grandTotals.rejectKg) }} kg</div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Empty State -->
      <div v-else class="py-10 px-4 text-center rounded-2xl bg-zinc-50/80 border border-dashed border-zinc-200 flex flex-col items-center justify-center gap-2">
        <div class="w-10 h-10 rounded-2xl bg-zinc-100 flex items-center justify-center text-lg text-zinc-400">
          📦
        </div>
        <p class="text-xs font-mono font-bold text-zinc-700">
          Belum ada rekaman roll Finished Goods (FG) selesai diproses untuk tanggal {{ activeTargetDateDisplay }}
        </p>
        <p class="text-[11px] text-zinc-400 max-w-md">
          Data roll FG akan otomatis teragregasi secara real-time saat operator mencetak label roll slitting atau mengimpor laporan produksi.
        </p>
      </div>

    </div>
    </div>
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- AKHIR BLOK 2: LIVE OPERATIONAL MONITORING                                 -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->

    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- BLOK 3: WAREHOUSE & STOCK LEDGER (DATA STOK GUDANG IMS)                   -->
    <!-- Nuansa: Clean Warehouse Storage Ledger (Dipertahankan Rapi & Terisolasi)  -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <div class="space-y-4 pt-3">
      
      <!-- Blok 3 Identity Banner -->
      <div class="bg-zinc-100/90 border border-zinc-200/90 rounded-2xl p-2.5 sm:p-3 flex items-center justify-between gap-3 text-xs font-mono shadow-2xs">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-md bg-zinc-900 text-white font-black text-[9px] uppercase tracking-wider">
            BLOK 3 • INVENTORY & STOCK LEDGER
          </span>
          <span class="text-zinc-600 font-bold hidden sm:inline">Data Stok Gudang IMS & WIP (Sesi Aktif)</span>
        </div>
        <span class="text-[10.5px] text-zinc-500 font-medium">Dipertahankan Terisolasi</span>
      </div>

      <!-- 5. KONDISI STOK IMS: 3 KRITERIA & 3 SATUAN KUANTITAS -->
      <div class="bg-white border border-zinc-200/90 rounded-3xl p-4 sm:p-5 shadow-2xs space-y-4 reveal-on-scroll">
      
      <!-- Header Stok & Filter Kriteria & Satuan -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 border-b border-zinc-100 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm sm:text-base font-black text-zinc-950 tracking-tight">KONDISI STOK GUDANG (ACUAN MENU IMS)</span>
            <span class="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-red-600 text-white font-mono">
              IMS LIVE DATA
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium mt-0.5">
            Data stok aktual diambil dari sesi aktif menu Stok Gudang (IMS) & WIP. Diperbarui setiap hari oleh user.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <!-- 1. Kriteria Pengelompokan (Jenis, Formula, Micron) -->
          <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[11px] font-mono font-bold">
            <span class="px-1.5 text-[10px] text-zinc-400 font-sans uppercase">Kriteria:</span>
            <button
              v-for="crit in stockCriteriaOptions"
              :key="crit.key"
              @click="selectedStockCriteria = crit.key"
              :class="[
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                selectedStockCriteria === crit.key
                  ? 'bg-zinc-950 text-white shadow-xs font-black'
                  : 'text-zinc-600 hover:text-zinc-950'
              ]"
            >
              {{ crit.label }}
            </button>
          </div>

          <!-- 2. Satuan Kuantitas (Roll, Meter, Berat Kg) -->
          <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[11px] font-mono font-bold">
            <span class="px-1.5 text-[10px] text-zinc-400 font-sans uppercase">Satuan:</span>
            <button
              v-for="u in stockUnitOptions"
              :key="u.key"
              @click="selectedStockUnit = u.key"
              :class="[
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
                selectedStockUnit === u.key
                  ? 'bg-red-600 text-white shadow-xs font-black'
                  : 'text-zinc-600 hover:text-zinc-950'
              ]"
            >
              {{ u.label }}
            </button>
          </div>

          <!-- 3. Scope: Semua Stok vs FG vs WIP -->
          <div class="flex items-center gap-0.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-[11px] font-mono font-bold">
            <button
              @click="stockScopeFilter = 'ALL'"
              :class="['px-2 py-1 rounded-lg transition-all cursor-pointer', stockScopeFilter === 'ALL' ? 'bg-zinc-800 text-white' : 'text-zinc-600']"
            >Semua</button>
            <button
              @click="stockScopeFilter = 'FG'"
              :class="['px-2 py-1 rounded-lg transition-all cursor-pointer', stockScopeFilter === 'FG' ? 'bg-zinc-800 text-white' : 'text-zinc-600']"
            >FG</button>
            <button
              @click="stockScopeFilter = 'JUMBO'"
              :class="['px-2 py-1 rounded-lg transition-all cursor-pointer', stockScopeFilter === 'JUMBO' ? 'bg-zinc-800 text-white' : 'text-zinc-600']"
            >WIP</button>
          </div>
        </div>
      </div>

      <!-- Sesi Aktif IMS Banner -->
      <div class="bg-emerald-50/80 border border-emerald-300 p-3 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-2.5 text-xs">
        <div class="flex flex-wrap items-center gap-2.5">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-emerald-950 font-mono text-[11px]">Sesi Aktif FG (IMS):</span>
            <span class="px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-900 font-mono font-black text-[11px]">
              {{ activeFgUpload ? activeFgUpload.fileName : 'Data Stok FG Aktif' }}
            </span>
            <span class="text-emerald-700 font-mono text-[11px]">
              Tgl: <strong>{{ activeFgUpload ? activeFgUpload.uploadDate : inventoryStore.lastUploadDate }}</strong>
            </span>
          </div>
          <span class="text-emerald-300 hidden md:inline">|</span>
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span class="font-bold text-emerald-950 font-mono text-[11px]">Sesi Jumbo WIP:</span>
            <span class="px-2 py-0.5 rounded bg-white border border-blue-300 text-blue-900 font-mono font-black text-[11px]">
              {{ activeWipUpdate ? (activeWipUpdate.title || activeWipUpdate.fileName) : 'Sesi WIP Aktif' }}
            </span>
          </div>
        </div>
        <router-link
          to="/inventory"
          class="px-2.5 py-1 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-mono font-bold text-[10.5px] transition-colors flex items-center gap-1 shadow-2xs self-start md:self-auto"
        >
          <span>Kelola di Menu IMS ➔</span>
        </router-link>
      </div>

      <!-- Grid Kartu Kriteria Stok (Berdasarkan Jenis, Formula, atau Micron) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        <div
          v-for="item in stockGroupedByCriteria"
          :key="item.key"
          @click="openStockDetailModal(item)"
          class="bg-zinc-50/80 hover:bg-white p-3.5 rounded-2xl border border-zinc-200/90 hover:border-red-300 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-black text-zinc-950 font-mono px-2 py-0.5 rounded-lg bg-zinc-200/80 group-hover:bg-red-50 group-hover:text-red-600 transition-colors">
                {{ item.key }}
              </span>
              <span class="text-[10px] font-mono font-bold text-zinc-400">
                {{ item.percentShare }}%
              </span>
            </div>

            <!-- Nilai Kuantitas Sesuai Satuan yang Dipilih -->
            <div class="mt-2.5">
              <div class="text-xl font-black text-zinc-950 font-mono tracking-tight group-hover:text-red-600 transition-colors">
                {{ formatNum(item.displayValue) }}
                <span class="text-xs font-bold text-zinc-500 font-sans">{{ unitSuffixLabel }}</span>
              </div>
              <div class="text-[10.5px] text-zinc-500 font-mono mt-0.5">
                {{ formatNum(item.fgCount) }} FG • {{ formatNum(item.wipCount) }} WIP
              </div>
            </div>
          </div>

          <!-- Bar Komposisi Proporsional -->
          <div class="w-full bg-zinc-200/70 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              class="bg-zinc-900 group-hover:bg-red-600 h-full rounded-full transition-all duration-500"
              :style="{ width: `${item.percentShare}%` }"
            ></div>
          </div>
        </div>

        <div v-if="stockGroupedByCriteria.length === 0" class="col-span-full p-6 text-center text-xs text-zinc-400 font-medium">
          Tidak ada data stok yang sesuai dengan filter yang dipilih.
        </div>
      </div>
    </div>
    </div>
    <!-- ═════════════════════════════════════════════════════════════════════════ -->
    <!-- AKHIR BLOK 3: WAREHOUSE & STOCK LEDGER                                    -->
    <!-- ═════════════════════════════════════════════════════════════════════════ -->

    <!-- ========================================================================= -->
    <!-- 6. MODAL KECIL INFORMASI SPK (PLANNING VS REALISASI)                      -->
    <!-- ========================================================================= -->
    <DashboardSpkModal
      v-model="showSpkModal"
      :spk="selectedSpkModal"
      :format-num="formatNum"
    />

    <!-- ========================================================================= -->
    <!-- 7. MODAL INTERAKTIF: DRILL-DOWN RINCIAN STOK DESKRIPSI NAV               -->
    <!-- ========================================================================= -->
    <DashboardStockDrilldownModal
      v-model="showStockModal"
      v-model:search-query="modalSearchQuery"
      :selected-stock-category="selectedStockCategory"
      :grouped-nav-items="groupedNavItems"
      :format-num="formatNum"
    />

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useConfigStore } from '@/stores/configStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useSpkStore, evaluateTargetStatus, isSpkMatch, parseSpkCanonical } from '@/stores/spkStore';

const block1Ref = ref(null);
import { useWipStore } from '@/stores/wipStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { parseDateToIso, extractDateFromLot } from '@/services/dataRollParserService';
import DashboardSpkModal from '@/components/dashboard/DashboardSpkModal.vue';
import DashboardStockDrilldownModal from '@/components/dashboard/DashboardStockDrilldownModal.vue';
import Chart from 'chart.js/auto';

const authStore = useAuthStore();
const labelStore = useLabelStore();
const dataRollStore = useDataRollStore();
const configStore = useConfigStore();
const scheduleStore = useScheduleStore();
const spkStore = useSpkStore();
const wipStore = useWipStore();
const inventoryStore = useInventoryStore();

// =========================================================================
// 1. LIVE TIME, HARI KERJA & SHIFT BERJALAN
// =========================================================================
const liveTimeString = ref('');
let liveTimer = null;

const updateLiveTime = () => {
  const d = new Date();
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dayName = days[d.getDay()];
  const dateNum = d.getDate();
  const monthName = months[d.getMonth()];
  const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  liveTimeString.value = `${dayName}, ${dateNum} ${monthName} ${d.getFullYear()} • ${time}`;
};

const currentShift = computed(() => scheduleStore.getCurrentShiftInfo());

// Hari Kerja Produksi Aktif (Default)
const workDateLabel = computed(() => {
  const info = scheduleStore.getCurrentShiftInfo();
  return info?.date || new Date().toISOString().slice(0, 10);
});

// Shift Elapsed Percentage
const shiftElapsedPercent = computed(() => {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const currentMinutes = h * 60 + m;

  const shift = currentShift.value.definition;
  if (!shift || !shift.startTime || !shift.endTime || shift.type === 'OFF') return 50;

  const [startH, startM] = shift.startTime.split(':').map(Number);
  let [endH, endM] = shift.endTime.split(':').map(Number);

  let startMin = startH * 60 + startM;
  let endMin = endH * 60 + endM;

  if (endMin < startMin) {
    // Cross midnight (e.g. 23:00 to 07:00)
    endMin += 1440;
    let adjustedNow = currentMinutes;
    if (adjustedNow < startMin) adjustedNow += 1440;
    const progress = Math.round(((adjustedNow - startMin) / (endMin - startMin)) * 100);
    return Math.max(0, Math.min(100, progress));
  } else {
    const progress = Math.round(((currentMinutes - startMin) / (endMin - startMin)) * 100);
    return Math.max(0, Math.min(100, progress));
  }
});

// =========================================================================
// 2. FREKUENSI FILTER WAKTU & STEPPER HARI SEBELUMNYA (PREVIOUS MULTI-TIMES)
// =========================================================================
const frequencyOptions = [
  { key: 'DAY', label: 'Hari Ini' },
  { key: 'WEEK', label: 'Minggu Ini' },
  { key: 'MONTH', label: 'Bulan Ini' },
  { key: '3MONTH', label: '3 Bulan' },
  { key: '6MONTH', label: '6 Bulan' },
  { key: 'YEAR', label: '1 Tahun' },
  { key: 'ALL', label: 'Semua Riwayat' },
  { key: 'CUSTOM', label: 'Rentang Kustom...' }
];

const selectedFrequency = ref('DAY');
const dayOffset = ref(0); // 0 = Hari ini, -1 = Kemarin (H-1), -2 = 2 hari lalu (H-2), dst.
const customStartDate = ref('');
const customEndDate = ref('');
const isDashboardLoading = ref(true);

// Granularitas Tampilan Diagram Garis (Auto, Harian, Mingguan, Bulanan)
const chartGranularity = ref('auto'); // 'auto' | 'daily' | 'weekly' | 'monthly'

const setChartGranularity = (gran) => {
  chartGranularity.value = gran;
  updateLineChart();
};

const onFrequencyChange = () => {
  dayOffset.value = 0;
  chartGranularity.value = 'auto'; // Reset agar selalu cocok dengan frekuensi baru
  updateLineChart();
};

// Chart dataset visibility toggler
const chartVisibility = ref({
  total: true,
  pass: true,
  hold: true,
  reject: true
});

const toggleDataset = (datasetKey) => {
  chartVisibility.value[datasetKey] = !chartVisibility.value[datasetKey];
  if (!lineComparisonChartInstance) return;
  const datasetIndexMap = { total: 0, pass: 1, hold: 2, reject: 3 };
  const idx = datasetIndexMap[datasetKey];
  if (idx !== undefined) {
    lineComparisonChartInstance.setDatasetVisibility(idx, chartVisibility.value[datasetKey]);
    lineComparisonChartInstance.update();
  }
};

const setFrequency = (freqKey) => {
  selectedFrequency.value = freqKey;
  dayOffset.value = 0; // Reset offset saat user memilih frekuensi lain
  chartGranularity.value = 'auto'; // Reset agar grafik selalu sinkron
  updateLineChart();
};

const onCustomDateChange = () => {
  chartGranularity.value = 'auto';
  updateLineChart();
};

// Stepper mundur ke hari sebelumnya berkali-kali
const stepPrevDay = () => {
  dayOffset.value--;
  selectedFrequency.value = 'DAY';
  chartGranularity.value = 'auto';
  updateLineChart();
};

// Lompat langsung ke tanggal rekaman produksi sebelumnya yang benar-benar ada datanya
const jumpToPrevProductionDay = () => {
  const all = allProductionRolls.value;
  const currentTarget = activeTargetDateIso.value;
  const prevDates = all
    .map(r => getRealProductionDate(r))
    .filter(d => d && d < currentTarget)
    .sort();

  if (prevDates.length > 0) {
    const targetDateStr = prevDates[prevDates.length - 1]; // tanggal terdekat sebelumnya yang ada data
    const [y, m, d] = targetDateStr.split('-').map(Number);
    const targetDateObj = new Date(y, m - 1, d);
    const baseParts = String(workDateLabel.value).split('-').map(Number);
    const baseDate = new Date(baseParts[0], baseParts[1] - 1, baseParts[2]);
    const diffDays = Math.round((targetDateObj.getTime() - baseDate.getTime()) / 86400000);
    dayOffset.value = diffDays;
    selectedFrequency.value = 'DAY';
    chartGranularity.value = 'auto';
    updateLineChart();
  } else {
    stepPrevDay();
  }
};

// Stepper maju ke hari berikutnya
const stepNextDay = () => {
  if (dayOffset.value < 0) {
    dayOffset.value++;
    selectedFrequency.value = 'DAY';
    chartGranularity.value = 'auto';
    updateLineChart();
  }
};

// Reset kembali ke Hari Ini
const resetToToday = () => {
  dayOffset.value = 0;
  selectedFrequency.value = 'DAY';
  chartGranularity.value = 'auto';
  updateLineChart();
};

// Tanggal Target yang Sedang Dilihat
const activeTargetDateObj = computed(() => {
  const baseWorkDate = workDateLabel.value; // Format: YYYY-MM-DD
  const parts = String(baseWorkDate).split('-').map(Number);
  const target = new Date(parts[0], parts[1] - 1, parts[2]);
  target.setDate(target.getDate() + dayOffset.value);
  return target;
});

const activeTargetDateIso = computed(() => {
  const t = activeTargetDateObj.value;
  const yr = t.getFullYear();
  const mo = String(t.getMonth() + 1).padStart(2, '0');
  const da = String(t.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
});

const toYmd = (d) => {
  if (!d) return '';
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, '0');
  const da = String(d.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${da}`;
};

const activeTargetDateDisplay = computed(() => {
  const t = activeTargetDateObj.value;
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dayName = days[t.getDay()];
  const formatted = `${dayName}, ${t.getDate()} ${months[t.getMonth()]} ${t.getFullYear()}`;
  
  if (dayOffset.value === 0) return `${formatted} (Hari Ini)`;
  if (dayOffset.value === -1) return `${formatted} (Kemarin / H-1)`;
  return `${formatted} (H${dayOffset.value})`;
});

const formatDateIndo = (d) => {
  if (!d) return '';
  const dateObj = new Date(d);
  if (isNaN(dateObj.getTime())) return '';
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  return `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
};

// Rentang Tanggal Presisi Aktif (Start & End Date serta Start & End ISO YYYY-MM-DD)
const currentPeriodRange = computed(() => {
  const targetObj = activeTargetDateObj.value;
  const targetIso = activeTargetDateIso.value;
  const year = targetObj.getFullYear();
  const month = targetObj.getMonth();

  if (selectedFrequency.value === 'DAY') {
    return {
      startDate: new Date(year, month, targetObj.getDate()),
      endDate: new Date(year, month, targetObj.getDate()),
      startIso: targetIso,
      endIso: targetIso
    };
  }

  if (selectedFrequency.value === 'WEEK') {
    // 7 hari (Senin s/d Minggu) dari minggu kalender targetObj
    const dayOfWeek = (targetObj.getDay() + 6) % 7; // 0 = Senin, 6 = Minggu
    const monday = new Date(year, month, targetObj.getDate() - dayOfWeek);
    const sunday = new Date(year, month, targetObj.getDate() - dayOfWeek + 6);
    return {
      startDate: monday,
      endDate: sunday,
      startIso: toYmd(monday),
      endIso: toYmd(sunday)
    };
  }

  if (selectedFrequency.value === 'MONTH') {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      startDate: firstDay,
      endDate: lastDay,
      startIso: toYmd(firstDay),
      endIso: toYmd(lastDay)
    };
  }

  if (selectedFrequency.value === '3MONTH') {
    const firstDay = new Date(year, month - 2, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      startDate: firstDay,
      endDate: lastDay,
      startIso: toYmd(firstDay),
      endIso: toYmd(lastDay)
    };
  }

  if (selectedFrequency.value === '6MONTH') {
    const firstDay = new Date(year, month - 5, 1);
    const lastDay = new Date(year, month + 1, 0);
    return {
      startDate: firstDay,
      endDate: lastDay,
      startIso: toYmd(firstDay),
      endIso: toYmd(lastDay)
    };
  }

  if (selectedFrequency.value === 'YEAR') {
    const firstDay = new Date(year, 0, 1);
    const lastDay = new Date(year, 11, 31);
    return {
      startDate: firstDay,
      endDate: lastDay,
      startIso: `${year}-01-01`,
      endIso: `${year}-12-31`
    };
  }

  if (selectedFrequency.value === 'CUSTOM') {
    let startStr = String(customStartDate.value || '').trim();
    let endStr = String(customEndDate.value || '').trim();
    const firstDay = new Date(year, month, 1, 12, 0, 0);
    const lastDay = new Date(year, month + 1, 0, 12, 0, 0);

    if (!startStr && !endStr) {
      return {
        startDate: firstDay,
        endDate: lastDay,
        startIso: toYmd(firstDay),
        endIso: toYmd(lastDay)
      };
    }
    if (startStr && !endStr) endStr = startStr;
    if (!startStr && endStr) startStr = endStr;
    if (startStr > endStr) {
      const tmp = startStr;
      startStr = endStr;
      endStr = tmp;
    }

    const sParts = startStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    const eParts = endStr.match(/^(\d{4})-(\d{2})-(\d{2})/);

    const sDate = sParts ? new Date(parseInt(sParts[1], 10), parseInt(sParts[2], 10) - 1, parseInt(sParts[3], 10), 12, 0, 0) : firstDay;
    const eDate = eParts ? new Date(parseInt(eParts[1], 10), parseInt(eParts[2], 10) - 1, parseInt(eParts[3], 10), 12, 0, 0) : lastDay;

    return {
      startDate: sDate,
      endDate: eDate,
      startIso: toYmd(sDate),
      endIso: toYmd(eDate)
    };
  }

  // 'ALL'
  return {
    startDate: null,
    endDate: null,
    startIso: '',
    endIso: ''
  };
});

const activePeriodSubtitle = computed(() => {
  const range = currentPeriodRange.value;
  const targetObj = activeTargetDateObj.value;

  if (selectedFrequency.value === 'DAY') {
    return activeTargetDateDisplay.value;
  } else if (selectedFrequency.value === 'WEEK') {
    return `Minggu Ini (${formatDateIndo(range.startDate)} - ${formatDateIndo(range.endDate)})`;
  } else if (selectedFrequency.value === 'MONTH') {
    const fullMonthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${fullMonthNames[targetObj.getMonth()]} ${targetObj.getFullYear()} (${formatDateIndo(range.startDate)} - ${formatDateIndo(range.endDate)})`;
  } else if (selectedFrequency.value === '3MONTH') {
    return `3 Bulan (${formatDateIndo(range.startDate)} - ${formatDateIndo(range.endDate)})`;
  } else if (selectedFrequency.value === '6MONTH') {
    return `6 Bulan (${formatDateIndo(range.startDate)} - ${formatDateIndo(range.endDate)})`;
  } else if (selectedFrequency.value === 'YEAR') {
    return `Tahun ${targetObj.getFullYear()} (${formatDateIndo(range.startDate)} - ${formatDateIndo(range.endDate)})`;
  } else if (selectedFrequency.value === 'ALL') {
    return `Semua Periode (${formatNum(filteredLabels.value.length)} Roll Terdata)`;
  } else if (selectedFrequency.value === 'CUSTOM') {
    if (customStartDate.value && customEndDate.value) {
      return `Custom (${formatDateIndo(range.startDate)} s/d ${formatDateIndo(range.endDate)})`;
    } else if (customStartDate.value) {
      return `Custom (Mulai ${formatDateIndo(range.startDate)})`;
    } else if (customEndDate.value) {
      return `Custom (Sampai ${formatDateIndo(range.endDate)})`;
    }
    return 'Custom (Tentukan Rentang Tanggal)';
  }
  const found = frequencyOptions.find(f => f.key === selectedFrequency.value);
  return found ? found.label : 'Periode';
});

// Granularitas Adaptif berdasarkan rentang waktu aktif
const availableGranularities = computed(() => {
  const freq = selectedFrequency.value;
  const range = currentPeriodRange.value;

  if (freq === 'DAY') {
    return [
      { key: 'auto', label: 'Auto' },
      { key: 'hourly', label: 'Per Jam' },
      { key: 'shift', label: 'Per Shift' }
    ];
  }

  let diffDays = 7;
  if (freq === 'WEEK') {
    diffDays = 7;
  } else if (freq === 'MONTH') {
    diffDays = 31;
  } else if (freq === 'CUSTOM' && range.startDate && range.endDate) {
    const diffMs = range.endDate.getTime() - range.startDate.getTime();
    diffDays = Math.max(1, Math.round(diffMs / 86400000) + 1);
  } else if (['3MONTH', '6MONTH', 'YEAR', 'ALL'].includes(freq)) {
    diffDays = 90;
  }

  if (diffDays <= 7) {
    return [
      { key: 'auto', label: 'Auto' },
      { key: 'daily', label: 'Harian' },
      { key: 'shift', label: 'Per Shift' }
    ];
  }

  if (diffDays <= 35) {
    return [
      { key: 'auto', label: 'Auto' },
      { key: 'daily', label: 'Harian' },
      { key: 'weekly', label: 'Mingguan' }
    ];
  }

  return [
    { key: 'auto', label: 'Auto' },
    { key: 'weekly', label: 'Mingguan' },
    { key: 'monthly', label: 'Bulanan' }
  ];
});

watch(availableGranularities, (newOpts) => {
  if (!newOpts.some(g => g.key === chartGranularity.value)) {
    chartGranularity.value = 'auto';
  }
});

// Helper: Mengambil tanggal nyata barang diproduksi (BUKAN tanggal upload file / createdAt)
const getRealProductionDate = (item) => {
  if (!item) return '';

  // 1. Cek tanggalFormatted / tanggal eksplisit dari file Excel atau input produksi
  const rawTanggal = item.tanggalFormatted || item.tanggal || item.date || item.tgl;
  if (rawTanggal) {
    if (typeof rawTanggal === 'string') {
      const match = rawTanggal.trim().match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const iso = parseDateToIso(rawTanggal);
    if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
      return String(iso).slice(0, 10);
    }
  }

  // 2. Ekstrak dari Lot produksi jika berformat [Formula: 3 char][DDMMYY: 6 digit]
  // Contoh Casting/SML: L01050125C2A12 -> 2025-01-05 | Slitting: M07260626A201 -> 2026-06-26
  const lotStr = String(item.lot || item.fullLot || item.rawLot || item.kodeFg || '').trim();
  const lotDate = extractDateFromLot(lotStr);
  if (lotDate) return lotDate;

  // 3. Fallback timestamp
  const ts = item.verifiedAt || item.createdAt;
  if (ts) {
    if (typeof ts === 'string') {
      const match = ts.trim().match(/^(\d{4}-\d{2}-\d{2})/);
      if (match) return match[1];
    }
    const iso = parseDateToIso(ts);
    if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
      return String(iso).slice(0, 10);
    }
  }

  return '';
};

// Gabungan seluruh roll produksi (baik dari Data Roll Excel yang di-upload maupun dari Manajemen Label)
const allProductionRolls = computed(() => {
  const rolls = dataRollStore.rolls || [];
  const labels = labelStore.labels || [];
  if (rolls.length === 0) return labels;
  if (labels.length === 0) return rolls;

  const seen = new Set();
  const merged = [];

  const getRollDedupKey = (r) => {
    const barcode = r.barcode || r.uniqId || r.uuid;
    if (barcode) return `BC_${barcode}`;
    const spk = String(r.spk || r.no_spk || r.noSpk || '').trim().toUpperCase();
    const lot = String(r.lot || r.no_lot || r.noLot || '').trim().toUpperCase();
    const turunan = String(r.turunan || '').trim().toUpperCase();
    const date = getRealProductionDate(r);
    return `KEY_${spk}_${lot}_${turunan}_${date}`;
  };

  for (const r of rolls) {
    const key = getRollDedupKey(r);
    seen.add(key);
    merged.push(r);
  }

  for (const l of labels) {
    const key = getRollDedupKey(l);
    if (!seen.has(key)) {
      seen.add(key);
      merged.push(l);
    }
  }

  return merged;
});

// Helper penentuan apakah rekaman berada dalam rentang frekuensi / tanggal target
const isDateInFrequency = (prodDateStr) => {
  if (selectedFrequency.value === 'ALL') {
    return true; // Tampilkan seluruh roll tanpa filter tanggal!
  }
  if (!prodDateStr) return false;
  try {
    const itemIso = String(prodDateStr).slice(0, 10);
    const range = currentPeriodRange.value;
    if (selectedFrequency.value === 'DAY') {
      return itemIso === range.startIso;
    }
    if (!range.startIso || !range.endIso) return true;
    return itemIso >= range.startIso && itemIso <= range.endIso;
  } catch (_) {
    return false;
  }
};

// Filtered roll produksi murni berdasarkan TANGGAL NYATA PRODUKSI
const filteredLabels = computed(() => {
  const all = allProductionRolls.value;
  // Filter ketat berdasarkan tanggal produksi nyata (TANPA FALLBACK all.slice(0, 500))
  // Jika hari ini belum ada rekaman produksi, dashboard akan secara jujur menampilkan 0 roll
  return all.filter(r => {
    const prodDate = getRealProductionDate(r);
    return isDateInFrequency(prodDate);
  });
});

// =========================================================================
// 3. KPI METRICS (TOTAL ROLL, TONASE, QC YIELD)
// =========================================================================
const kpiMetrics = computed(() => {
  const list = filteredLabels.value;
  let totalRolls = list.length;
  let totalBeratKg = 0;
  let totalMeter = 0;
  let slittingRolls = 0;
  let rewindRolls = 0;
  let smlRolls = 0;
  let passCount = 0;
  let holdCount = 0;
  let rejectCount = 0;

  for (let i = 0; i < list.length; i++) {
    const it = list[i];
    const kg = parseFloat(it.netto || it.beratNetto || it.berat || 0) || 0;
    const m = parseFloat(it.length || it.meter || it.panjang || 0) || 0;
    totalBeratKg += kg;
    totalMeter += m;

    const mesin = String(it.machineName || it.mesin || '').toUpperCase();
    if (mesin.includes('REWIND') || it.rewind) rewindRolls++;
    else if (mesin.includes('SML') || mesin.includes('CASTING') || it.sml) smlRolls++;
    else slittingRolls++;

    const st = String(it.qualityStatus || it.status || 'PASS').toUpperCase();
    if (st === 'HOLD') holdCount++;
    else if (st === 'REJECT' || st === 'NG') rejectCount++;
    else passCount++;
  }

  const yieldPassRate = totalRolls > 0 ? Math.round((passCount / totalRolls) * 100) : 0;

  return {
    totalRolls,
    totalBeratKg: Math.round(totalBeratKg),
    totalMeter: Math.round(totalMeter),
    slittingRolls,
    rewindRolls,
    smlRolls,
    passCount,
    holdCount,
    rejectCount,
    yieldPassRate
  };
});

// =========================================================================
// 3.B ESTIMASI FORECAST & RUN-RATE GLOBAL PERFORMANCE (BLOK 1)
// =========================================================================
const forecastMetrics = computed(() => {
  const kpi = kpiMetrics.value;
  const currentKg = kpi.totalBeratKg || 0;
  const currentRolls = kpi.totalRolls || 0;
  const freq = selectedFrequency.value;

  const targetDate = activeTargetDateObj.value;
  const today = new Date();

  let totalPeriodDays = 1;
  let elapsedDays = 1;
  let remainingDays = 0;

  if (freq === 'DAY') {
    const hr = today.getHours();
    const elapsedHourInDay = Math.min(24, Math.max(1, (hr - 7 + 24) % 24));
    const dayProgressRatio = Math.max(0.08, elapsedHourInDay / 24);
    const projectedKg = Math.round(currentKg / dayProgressRatio);
    const projectedRolls = Math.round(currentRolls / dayProgressRatio);

    return {
      periodLabel: 'Hari Operasional Ini',
      dailyAverageKg: currentKg,
      dailyAverageTon: (currentKg / 1000).toFixed(2),
      dailyAverageRolls: currentRolls,
      projectedTotalKg: projectedKg,
      projectedTotalTon: (projectedKg / 1000).toFixed(2),
      projectedTotalRolls: projectedRolls,
      remainingDays: 0,
      runRateStatus: kpi.yieldPassRate >= 95 ? 'AHEAD' : 'ON_TRACK',
      runRateLabel: kpi.yieldPassRate >= 95 ? 'Laju Kerja Optimal (Yield > 95%)' : 'Laju Kerja Berjalan Normal',
      velocityTrend: 'STABLE',
      velocityPercent: '+0.0%'
    };
  } else if (freq === 'WEEK') {
    totalPeriodDays = 7;
    const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Senin, 6 = Minggu
    elapsedDays = Math.max(1, dayOfWeek + 1);
    remainingDays = Math.max(0, totalPeriodDays - elapsedDays);
  } else if (freq === 'MONTH') {
    const yr = targetDate.getFullYear();
    const mo = targetDate.getMonth();
    totalPeriodDays = new Date(yr, mo + 1, 0).getDate();
    if (yr === today.getFullYear() && mo === today.getMonth()) {
      elapsedDays = Math.max(1, today.getDate());
    } else {
      elapsedDays = totalPeriodDays;
    }
    remainingDays = Math.max(0, totalPeriodDays - elapsedDays);
  } else if (freq === 'YEAR') {
    totalPeriodDays = 365;
    if (targetDate.getFullYear() === today.getFullYear()) {
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      elapsedDays = Math.max(1, Math.round((today - startOfYear) / 86400000));
    } else {
      elapsedDays = 365;
    }
    remainingDays = Math.max(0, totalPeriodDays - elapsedDays);
  } else {
    const r = currentPeriodRange.value;
    if (r.startDate && r.endDate) {
      totalPeriodDays = Math.max(1, Math.round((r.endDate - r.startDate) / 86400000) + 1);
      if (today >= r.startDate && today <= r.endDate) {
        elapsedDays = Math.max(1, Math.round((today - r.startDate) / 86400000) + 1);
      } else if (today > r.endDate) {
        elapsedDays = totalPeriodDays;
      } else {
        elapsedDays = 1;
      }
      remainingDays = Math.max(0, totalPeriodDays - elapsedDays);
    }
  }

  const dailyAverageKg = elapsedDays > 0 ? (currentKg / elapsedDays) : 0;
  const dailyAverageRolls = elapsedDays > 0 ? (currentRolls / elapsedDays) : 0;
  const projectedTotalKg = Math.round(currentKg + (dailyAverageKg * remainingDays));
  const projectedTotalRolls = Math.round(currentRolls + (dailyAverageRolls * remainingDays));

  let runRateStatus = 'ON_TRACK';
  let runRateLabel = 'Sesuai Target Laju Kerja Pabrik';
  if (kpi.yieldPassRate >= 96 && dailyAverageKg > 0) {
    runRateStatus = 'AHEAD';
    runRateLabel = 'Performa Tinggi (Yield & Kecepatan Di Atas Rata-rata)';
  } else if (kpi.yieldPassRate < 92) {
    runRateStatus = 'ATTENTION';
    runRateLabel = 'Peringatan: Tingkat Afval / Hold Meningkat';
  }

  return {
    periodLabel: activePeriodSubtitle.value,
    totalPeriodDays,
    elapsedDays,
    remainingDays,
    dailyAverageKg: Math.round(dailyAverageKg),
    dailyAverageTon: (dailyAverageKg / 1000).toFixed(2),
    dailyAverageRolls: Math.round(dailyAverageRolls),
    projectedTotalKg,
    projectedTotalTon: (projectedTotalKg / 1000).toFixed(2),
    projectedTotalRolls,
    runRateStatus,
    runRateLabel,
    velocityTrend: dailyAverageKg > 3000 ? 'UP' : 'STABLE',
    velocityPercent: dailyAverageKg > 3000 ? '+8.5%' : '+0.0%'
  };
});

// =========================================================================
// 3.C ANIMASI ROLLING COUNTING (COUNTUP) BLOK 1
// =========================================================================
const animatedKpi = reactive({
  tonase: 0,
  kg: 0,
  dailyAverageTon: 0,
  rolls: 0,
  meters: 0,
  slittingRolls: 0,
  rewindRolls: 0,
  smlRolls: 0,
  passRate: 0,
  passCount: 0,
  holdCount: 0,
  rejectCount: 0
});

const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));
let animFrameId = null;

const runKpiCountAnimation = () => {
  if (animFrameId) cancelAnimationFrame(animFrameId);

  const startValues = { ...animatedKpi };
  const targetValues = {
    tonase: Number((kpiMetrics.value.totalBeratKg / 1000).toFixed(2)) || 0,
    kg: Math.round(kpiMetrics.value.totalBeratKg) || 0,
    dailyAverageTon: Number(forecastMetrics.value.dailyAverageTon) || 0,
    rolls: Math.round(kpiMetrics.value.totalRolls) || 0,
    meters: Math.round(kpiMetrics.value.totalMeter) || 0,
    slittingRolls: Math.round(kpiMetrics.value.slittingRolls) || 0,
    rewindRolls: Math.round(kpiMetrics.value.rewindRolls) || 0,
    smlRolls: Math.round(kpiMetrics.value.smlRolls) || 0,
    passRate: Number(kpiMetrics.value.yieldPassRate) || 0,
    passCount: Math.round(kpiMetrics.value.passCount) || 0,
    holdCount: Math.round(kpiMetrics.value.holdCount) || 0,
    rejectCount: Math.round(kpiMetrics.value.rejectCount) || 0
  };

  const duration = 900;
  const startTime = performance.now();

  const step = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(1, Math.max(0, elapsed / duration));
    const factor = easeOutExpo(progress);

    animatedKpi.tonase = Number((startValues.tonase + (targetValues.tonase - startValues.tonase) * factor).toFixed(2));
    animatedKpi.kg = Math.round(startValues.kg + (targetValues.kg - startValues.kg) * factor);
    animatedKpi.dailyAverageTon = Number((startValues.dailyAverageTon + (targetValues.dailyAverageTon - startValues.dailyAverageTon) * factor).toFixed(2));
    animatedKpi.rolls = Math.round(startValues.rolls + (targetValues.rolls - startValues.rolls) * factor);
    animatedKpi.meters = Math.round(startValues.meters + (targetValues.meters - startValues.meters) * factor);
    animatedKpi.slittingRolls = Math.round(startValues.slittingRolls + (targetValues.slittingRolls - startValues.slittingRolls) * factor);
    animatedKpi.rewindRolls = Math.round(startValues.rewindRolls + (targetValues.rewindRolls - startValues.rewindRolls) * factor);
    animatedKpi.smlRolls = Math.round(startValues.smlRolls + (targetValues.smlRolls - startValues.smlRolls) * factor);
    animatedKpi.passRate = Number((startValues.passRate + (targetValues.passRate - startValues.passRate) * factor).toFixed(1));
    animatedKpi.passCount = Math.round(startValues.passCount + (targetValues.passCount - startValues.passCount) * factor);
    animatedKpi.holdCount = Math.round(startValues.holdCount + (targetValues.holdCount - startValues.holdCount) * factor);
    animatedKpi.rejectCount = Math.round(startValues.rejectCount + (targetValues.rejectCount - startValues.rejectCount) * factor);

    if (progress < 1) {
      animFrameId = requestAnimationFrame(step);
    } else {
      Object.assign(animatedKpi, targetValues);
      animFrameId = null;
    }
  };

  animFrameId = requestAnimationFrame(step);
};

// Re-run counting animation whenever filter range or KPI metrics change
watch(
  () => [
    kpiMetrics.value.totalBeratKg,
    kpiMetrics.value.totalRolls,
    kpiMetrics.value.yieldPassRate,
    selectedFrequency.value,
    dayOffset.value,
    customStartDate.value,
    customEndDate.value
  ],
  () => {
    runKpiCountAnimation();
  },
  { deep: true }
);

// =========================================================================
// 4. DIAGRAM GARIS: MULTI-SHEET MESIN (SLITTING, REWIND, CASTING, TOTAL)
// =========================================================================
const chartMachineSheets = [
  { key: 'SLITTING', label: 'Slitting', icon: '✂️' },
  { key: 'REWIND', label: 'Rewind', icon: '🔄' },
  { key: 'CASTING', label: 'Casting / SML', icon: '🏭' },
  { key: 'TOTAL', label: 'Gabungan Mesin', icon: '🌐' }
];

const activeChartMachineSheet = ref('SLITTING'); // Default Slitting sesuai instruksi

const filterByMachine = (items, targetMachine) => {
  if (!items || items.length === 0) return [];
  if (targetMachine === 'TOTAL') return items;
  return items.filter(item => {
    const mesin = String(item.machineName || item.mesin || (item.slitting ? 'SLITTING' : item.rewind ? 'REWIND' : 'CASTING')).toUpperCase();
    if (targetMachine === 'REWIND') {
      return mesin.includes('REWIND') || item.rewind;
    }
    if (targetMachine === 'CASTING') {
      return mesin.includes('CASTING') || mesin.includes('SML') || item.sml;
    }
    if (targetMachine === 'SLITTING') {
      return !mesin.includes('REWIND') && !mesin.includes('CASTING') && !mesin.includes('SML');
    }
    return true;
  });
};

const setChartMachineSheet = (key) => {
  activeChartMachineSheet.value = key;
  // Sinkronkan panel operator kanan agar selaras jika bukan TOTAL
  if (key !== 'TOTAL') {
    selectedMachineTab.value = key;
  }
  updateLineChart();
};

const lineComparisonChartCanvas = ref(null);
let lineComparisonChartInstance = null;

// Ringkasan metrik khusus untuk data yang sedang aktif ditampilkan pada diagram garis
const lineChartTotals = ref({
  total: 0,
  pass: 0,
  hold: 0,
  reject: 0,
  periodLabel: ''
});

const generateLineChartData = () => {
  const rawList = filteredLabels.value;
  const list = filterByMachine(rawList, activeChartMachineSheet.value);
  let labels = [];
  let totalData = [];
  let passData = [];
  let holdData = [];
  let rejectData = [];
  let chartScopeLabel = '';

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  const accumulateQuality = (bucket, item) => {
    bucket.total++;
    const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
    if (st === 'HOLD') bucket.hold++;
    else if (st === 'REJECT' || st === 'NG') bucket.reject++;
    else bucket.pass++;
  };

  const range = currentPeriodRange.value;
  const targetObj = activeTargetDateObj.value;

  // Calendar week helpers (Senin s/d Minggu standard pabrik)
  const getMonday = (d) => {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (date.getDay() + 6) % 7; // 0 = Senin, 6 = Minggu
    date.setDate(date.getDate() - day);
    return date;
  };

  const getSunday = (monday) => {
    const sun = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate());
    sun.setDate(sun.getDate() + 6);
    return sun;
  };

  // Safe string-based parser (kebal terhadap bias timezone UTC / DST)
  const parseYmdParts = (isoStr) => {
    if (!isoStr || typeof isoStr !== 'string') return null;
    const match = isoStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    return {
      year: parseInt(match[1], 10),
      month: parseInt(match[2], 10) - 1, // 0-indexed
      day: parseInt(match[3], 10)
    };
  };

  // Helper ekstrak jam produksi
  const extractHour = (item) => {
    if (item.jam && typeof item.jam === 'string' && /^\d{1,2}:\d{2}/.test(item.jam.trim())) {
      return parseInt(item.jam.trim().split(':')[0], 10);
    }
    const ts = item.verifiedAt || item.createdAt;
    if (ts && typeof ts === 'string' && ts.includes('T')) {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d.getHours();
    }
    const s = String(item.shift || '').trim().toUpperCase();
    if (s === '1' || s === 'LS1') return 9;
    if (s === '2') return 17;
    if (s === '3' || s === 'LS2') return 1;
    return 9;
  };

  // Helper ekstrak shift (0 = Shift 1, 1 = Shift 2, 2 = Shift 3)
  const extractShiftIndex = (item) => {
    const s = String(item.shift || '').trim().toUpperCase();
    if (s.includes('1') || s.includes('LS1')) return 0;
    if (s.includes('2')) return 1;
    if (s.includes('3') || s.includes('LS2')) return 2;
    const hr = extractHour(item);
    if (hr >= 7 && hr < 15) return 0;
    if (hr >= 15 && hr < 23) return 1;
    return 2;
  };

  // Tentukan granularitas efektif:
  let effectiveGranularity = chartGranularity.value;
  if (effectiveGranularity === 'auto') {
    if (selectedFrequency.value === 'DAY') {
      effectiveGranularity = 'hourly';
    } else if (selectedFrequency.value === 'WEEK') {
      effectiveGranularity = 'daily';
    } else if (selectedFrequency.value === 'MONTH') {
      effectiveGranularity = 'daily';
    } else if (selectedFrequency.value === 'CUSTOM') {
      const diffMs = (range.endDate && range.startDate) ? (range.endDate.getTime() - range.startDate.getTime()) : 0;
      const diffDays = Math.max(1, Math.round(diffMs / 86400000) + 1);
      if (diffDays <= 1) effectiveGranularity = 'hourly';
      else if (diffDays <= 35) effectiveGranularity = 'daily';
      else if (diffDays <= 120) effectiveGranularity = 'weekly';
      else effectiveGranularity = 'monthly';
    } else {
      // 3MONTH, 6MONTH, YEAR, ALL
      effectiveGranularity = 'monthly';
    }
  }

  // -------------------------------------------------------------------------
  // 1. GRANULARITAS PER JAM ('hourly' / 'intraday')
  // -------------------------------------------------------------------------
  if (effectiveGranularity === 'hourly' || effectiveGranularity === 'intraday') {
    chartScopeLabel = `Per Jam (${activeTargetDateDisplay.value || 'Hari Ini'})`;
    labels = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00', '01:00', '03:00', '05:00'];
    const buckets = labels.map(() => ({ total: 0, pass: 0, hold: 0, reject: 0 }));

    for (const item of list) {
      const hr = extractHour(item);
      let bucketIdx = Math.floor(((hr - 7 + 24) % 24) / 2);
      if (bucketIdx < 0 || bucketIdx >= 12) bucketIdx = 0;
      accumulateQuality(buckets[bucketIdx], item);
    }

    totalData = buckets.map(b => b.total);
    passData = buckets.map(b => b.pass);
    holdData = buckets.map(b => b.hold);
    rejectData = buckets.map(b => b.reject);

  // -------------------------------------------------------------------------
  // 2. GRANULARITAS PER SHIFT ('shift')
  // -------------------------------------------------------------------------
  } else if (effectiveGranularity === 'shift') {
    let diffDays = 1;
    if (selectedFrequency.value === 'WEEK') diffDays = 7;
    else if (selectedFrequency.value === 'CUSTOM' && range.startDate && range.endDate) {
      const diffMs = range.endDate.getTime() - range.startDate.getTime();
      diffDays = Math.max(1, Math.round(diffMs / 86400000) + 1);
    }

    if (diffDays <= 1) {
      // 1 Hari: 3 Shift
      chartScopeLabel = `Per Shift (${activeTargetDateDisplay.value || 'Hari Ini'})`;
      labels = ['Shift 1 (07:00-15:00)', 'Shift 2 (15:00-23:00)', 'Shift 3 (23:00-07:00)'];
      const buckets = labels.map(() => ({ total: 0, pass: 0, hold: 0, reject: 0 }));

      for (const item of list) {
        const sIdx = extractShiftIndex(item);
        accumulateQuality(buckets[sIdx], item);
      }
      totalData = buckets.map(b => b.total);
      passData = buckets.map(b => b.pass);
      holdData = buckets.map(b => b.hold);
      rejectData = buckets.map(b => b.reject);
    } else {
      // Lebih dari 1 Hari (misal 1 Minggu): Breakdown Shift per Hari
      chartScopeLabel = `Per Shift (${activePeriodSubtitle.value || 'Minggu Ini'})`;
      const startD = new Date(range.startDate.getFullYear(), range.startDate.getMonth(), range.startDate.getDate(), 12, 0, 0);
      const endD = new Date(range.endDate.getFullYear(), range.endDate.getMonth(), range.endDate.getDate(), 12, 0, 0);
      const cur = new Date(startD);
      const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
      const buckets = [];

      while (cur <= endD) {
        const iso = toYmd(cur);
        const dayName = dayNames[cur.getDay()];
        for (let s = 1; s <= 3; s++) {
          labels.push(`${dayName} S${s}`);
          buckets.push({ key: `${iso}_${s - 1}`, total: 0, pass: 0, hold: 0, reject: 0 });
        }
        cur.setDate(cur.getDate() + 1);
      }

      const bucketMap = new Map(buckets.map(b => [b.key, b]));
      for (const item of list) {
        const prodDate = getRealProductionDate(item);
        const sIdx = extractShiftIndex(item);
        const k = `${prodDate}_${sIdx}`;
        if (bucketMap.has(k)) {
          accumulateQuality(bucketMap.get(k), item);
        }
      }
      totalData = buckets.map(b => b.total);
      passData = buckets.map(b => b.pass);
      holdData = buckets.map(b => b.hold);
      rejectData = buckets.map(b => b.reject);
    }

  // -------------------------------------------------------------------------
  // 3. GRANULARITAS HARIAN ('daily')
  // -------------------------------------------------------------------------
  } else if (effectiveGranularity === 'daily') {
    let startD = range.startDate ? new Date(range.startDate.getFullYear(), range.startDate.getMonth(), range.startDate.getDate(), 12, 0, 0) : null;
    let endD = range.endDate ? new Date(range.endDate.getFullYear(), range.endDate.getMonth(), range.endDate.getDate(), 12, 0, 0) : null;

    if (selectedFrequency.value === 'DAY') {
      startD = new Date(targetObj.getFullYear(), targetObj.getMonth(), targetObj.getDate(), 12, 0, 0);
      endD = new Date(startD);
      chartScopeLabel = `Harian (${activeTargetDateDisplay.value})`;
    } else if (selectedFrequency.value === 'WEEK') {
      chartScopeLabel = 'Minggu Ini (Senin s/d Minggu)';
    } else if (selectedFrequency.value === 'MONTH') {
      chartScopeLabel = `Bulan ${monthNames[targetObj.getMonth()]} ${targetObj.getFullYear()}`;
    } else if (selectedFrequency.value === 'ALL') {
      const dataDates = (list.length > 0 ? list : allProductionRolls.value)
        .map(it => getRealProductionDate(it))
        .filter(d => d && /^\d{4}-\d{2}-\d{2}/.test(d))
        .sort();
      if (dataDates.length > 0) {
        const [minY, minM, minDay] = dataDates[0].split('-').map(Number);
        const [maxY, maxM, maxDay] = dataDates[dataDates.length - 1].split('-').map(Number);
        startD = new Date(minY, minM - 1, minDay, 12, 0, 0);
        endD = new Date(maxY, maxM - 1, maxDay, 12, 0, 0);
        const diffDays = Math.round((endD.getTime() - startD.getTime()) / 86400000);
        if (diffDays > 366) {
          startD = new Date(endD);
          startD.setDate(endD.getDate() - 365);
        }
      } else {
        endD = new Date(targetObj.getFullYear(), targetObj.getMonth(), targetObj.getDate(), 12, 0, 0);
        startD = new Date(endD);
        startD.setDate(endD.getDate() - 29);
      }
      chartScopeLabel = `Harian (${formatDateIndo(startD)} - ${formatDateIndo(endD)})`;
    } else {
      chartScopeLabel = `Harian (${activePeriodSubtitle.value})`;
    }

    if (!startD) startD = new Date(targetObj.getFullYear(), targetObj.getMonth(), targetObj.getDate() - 6, 12, 0, 0);
    if (!endD) endD = new Date(targetObj.getFullYear(), targetObj.getMonth(), targetObj.getDate(), 12, 0, 0);
    if (startD > endD) {
      const tmp = startD;
      startD = endD;
      endD = tmp;
    }

    const buckets = [];
    const cur = new Date(startD);
    let safety = 0;
    const isMultiYear = startD.getFullYear() !== endD.getFullYear();
    const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    while (cur <= endD && safety++ < 1000) {
      const iso = toYmd(cur);
      const dNum = cur.getDate();
      const mIdx = cur.getMonth();
      let lbl = '';
      if (selectedFrequency.value === 'WEEK') {
        lbl = `${dayNames[cur.getDay()]} (${String(dNum).padStart(2, '0')}/${String(mIdx + 1).padStart(2, '0')})`;
      } else if (selectedFrequency.value === 'MONTH') {
        lbl = String(dNum);
      } else if (isMultiYear) {
        lbl = `${dNum} ${monthNames[mIdx]} '${String(cur.getFullYear()).slice(2)}`;
      } else {
        lbl = `${dNum} ${monthNames[mIdx]}`;
      }

      labels.push(lbl);
      buckets.push({ iso, total: 0, pass: 0, hold: 0, reject: 0 });
      cur.setDate(cur.getDate() + 1);
    }

    const bucketMap = new Map(buckets.map(b => [b.iso, b]));
    const sourceRolls = (selectedFrequency.value === 'ALL') ? allProductionRolls.value : list;

    for (const item of sourceRolls) {
      const prodDate = getRealProductionDate(item);
      if (prodDate && bucketMap.has(prodDate)) {
        accumulateQuality(bucketMap.get(prodDate), item);
      }
    }

    totalData = buckets.map(b => b.total);
    passData = buckets.map(b => b.pass);
    holdData = buckets.map(b => b.hold);
    rejectData = buckets.map(b => b.reject);

  // -------------------------------------------------------------------------
  // 4. GRANULARITAS MINGGUAN ('weekly')
  // -------------------------------------------------------------------------
  } else if (effectiveGranularity === 'weekly') {
    if (selectedFrequency.value === 'MONTH') {
      const yr = targetObj.getFullYear();
      const mo = targetObj.getMonth();
      const lastDay = new Date(yr, mo + 1, 0).getDate();
      chartScopeLabel = `Mingguan (${monthNames[mo]} ${yr})`;

      const weekDefs = [
        { label: 'Mgg 1 (1-7)', startDay: 1, endDay: 7 },
        { label: 'Mgg 2 (8-14)', startDay: 8, endDay: 14 },
        { label: 'Mgg 3 (15-21)', startDay: 15, endDay: 21 },
        { label: 'Mgg 4 (22-28)', startDay: 22, endDay: 28 }
      ];
      if (lastDay > 28) {
        weekDefs.push({ label: `Mgg 5 (29-${lastDay})`, startDay: 29, endDay: lastDay });
      }

      const buckets = weekDefs.map(w => {
        labels.push(w.label);
        return { ...w, total: 0, pass: 0, hold: 0, reject: 0 };
      });

      for (const item of list) {
        const prodDate = getRealProductionDate(item);
        const parts = parseYmdParts(prodDate);
        if (parts && parts.year === yr && parts.month === mo) {
          const b = buckets.find(bk => parts.day >= bk.startDay && parts.day <= bk.endDay);
          if (b) accumulateQuality(b, item);
        }
      }
      totalData = buckets.map(b => b.total);
      passData = buckets.map(b => b.pass);
      holdData = buckets.map(b => b.hold);
      rejectData = buckets.map(b => b.reject);

    } else {
      const startD = range.startDate || new Date(targetObj.getFullYear(), targetObj.getMonth() - 2, 1);
      const endD = range.endDate || targetObj;
      const startMon = getMonday(startD);
      const endSun = getSunday(getMonday(endD));
      const buckets = [];
      const cur = new Date(startMon);
      let safety = 0;

      while (cur <= endSun && safety++ < 500) {
        const wSun = getSunday(cur);
        labels.push(`${cur.getDate()} ${monthNames[cur.getMonth()]} - ${wSun.getDate()} ${monthNames[wSun.getMonth()]}`);
        buckets.push({ startIso: toYmd(cur), endIso: toYmd(wSun), total: 0, pass: 0, hold: 0, reject: 0 });
        cur.setDate(cur.getDate() + 7);
      }

      chartScopeLabel = `Mingguan (${buckets.length} Minggu)`;
      const sourceList = (selectedFrequency.value === 'ALL' || !range.startDate)
        ? filterByMachine(allProductionRolls.value, activeChartMachineSheet.value)
        : list;

      for (const item of sourceList) {
        const prodDate = getRealProductionDate(item);
        if (prodDate) {
          const b = buckets.find(bk => prodDate >= bk.startIso && prodDate <= bk.endIso);
          if (b) accumulateQuality(b, item);
        }
      }
      totalData = buckets.map(b => b.total);
      passData = buckets.map(b => b.pass);
      holdData = buckets.map(b => b.hold);
      rejectData = buckets.map(b => b.reject);
    }

  // -------------------------------------------------------------------------
  // 5. GRANULARITAS BULANAN ('monthly')
  // -------------------------------------------------------------------------
  } else if (effectiveGranularity === 'monthly') {
    const yr = targetObj.getFullYear();
    const mo = targetObj.getMonth();
    const targetMonthDefs = [];

    if (selectedFrequency.value === '3MONTH') {
      chartScopeLabel = 'Tren 3 Bulan';
      for (let i = 2; i >= 0; i--) {
        const d = new Date(yr, mo - i, 1);
        targetMonthDefs.push({
          label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          year: d.getFullYear(),
          month: d.getMonth()
        });
      }
    } else if (selectedFrequency.value === '6MONTH') {
      chartScopeLabel = 'Tren 6 Bulan';
      for (let i = 5; i >= 0; i--) {
        const d = new Date(yr, mo - i, 1);
        targetMonthDefs.push({
          label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
          year: d.getFullYear(),
          month: d.getMonth()
        });
      }
    } else if (selectedFrequency.value === 'YEAR') {
      chartScopeLabel = `Tahun ${yr}`;
      for (let m = 0; m < 12; m++) {
        targetMonthDefs.push({
          label: monthNames[m],
          year: yr,
          month: m
        });
      }
    } else if (selectedFrequency.value === 'ALL') {
      chartScopeLabel = 'Semua Riwayat Bulanan';
      const distinctYm = [...new Set(allProductionRolls.value.map(it => {
        const p = getRealProductionDate(it);
        return p && /^\d{4}-\d{2}/.test(p) ? p.slice(0, 7) : null;
      }).filter(Boolean))].sort();

      if (distinctYm.length > 0) {
        const sliceYm = distinctYm.length > 18 ? distinctYm.slice(-18) : distinctYm;
        for (const ym of sliceYm) {
          const [y, m] = ym.split('-').map(Number);
          targetMonthDefs.push({
            label: `${monthNames[m - 1]} '${String(y).slice(2)}`,
            year: y,
            month: m - 1
          });
        }
      } else {
        for (let m = 0; m < 12; m++) {
          targetMonthDefs.push({ label: monthNames[m], year: yr, month: m });
        }
      }
    } else if (selectedFrequency.value === 'CUSTOM') {
      chartScopeLabel = 'Bulanan Kustom';
      const start = range.startDate || new Date(yr, mo - 5, 1);
      const end = range.endDate || new Date(yr, mo, 1);
      const cur = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);
      let safety = 0;

      while (cur <= endMonth && safety++ < 120) {
        targetMonthDefs.push({
          label: `${monthNames[cur.getMonth()]} '${String(cur.getFullYear()).slice(2)}`,
          year: cur.getFullYear(),
          month: cur.getMonth()
        });
        cur.setMonth(cur.getMonth() + 1);
      }
    } else {
      chartScopeLabel = `Bulan ${monthNames[mo]} ${yr}`;
      targetMonthDefs.push({
        label: `${monthNames[mo]} ${yr}`,
        year: yr,
        month: mo
      });
    }

    labels = targetMonthDefs.map(t => t.label);
    const buckets = targetMonthDefs.map(t => ({
      year: t.year,
      month: t.month,
      total: 0,
      pass: 0,
      hold: 0,
      reject: 0
    }));

    const sourceList = filterByMachine((selectedFrequency.value === 'ALL') ? allProductionRolls.value : rawList, activeChartMachineSheet.value);

    for (const item of sourceList) {
      const prodDate = getRealProductionDate(item);
      const parts = parseYmdParts(prodDate);
      if (parts) {
        const b = buckets.find(bk => bk.year === parts.year && bk.month === parts.month);
        if (b) accumulateQuality(b, item);
      }
    }

    totalData = buckets.map(b => b.total);
    passData = buckets.map(b => b.pass);
    holdData = buckets.map(b => b.hold);
    rejectData = buckets.map(b => b.reject);
  }

  // Jaminan data selalu terisi minimal 1 label agar Chart.js tidak pernah menerima dataset kosong / null
  if (!labels || labels.length === 0) {
    labels = [activePeriodSubtitle.value || 'Periode Terpilih'];
    totalData = [0];
    passData = [0];
    holdData = [0];
    rejectData = [0];
  }

  // Sinkronkan ringkasan metrik chart (total, pass, hold, reject) dengan data yang sedang aktif dirender
  const totalSum = totalData.reduce((a, b) => a + b, 0);
  const passSum = passData.reduce((a, b) => a + b, 0);
  const holdSum = holdData.reduce((a, b) => a + b, 0);
  const rejectSum = rejectData.reduce((a, b) => a + b, 0);

  const sheetMeta = chartMachineSheets.find(s => s.key === activeChartMachineSheet.value);
  lineChartTotals.value = {
    total: totalSum,
    pass: passSum,
    hold: holdSum,
    reject: rejectSum,
    periodLabel: `${chartScopeLabel || activePeriodSubtitle.value} (${sheetMeta?.label || 'Semua Mesin'})`
  };

  return { labels, totalData, passData, holdData, rejectData };
};

const initLineChart = () => {
  if (!lineComparisonChartCanvas.value) return;

  // Hancurkan chart yang mungkin masih terikat pada canvas element untuk mencegah error "Canvas is already in use"
  try {
    const existingChart = Chart.getChart(lineComparisonChartCanvas.value);
    if (existingChart) {
      existingChart.destroy();
    }
  } catch (_) {}

  if (lineComparisonChartInstance) {
    try {
      lineComparisonChartInstance.destroy();
    } catch (_) {}
    lineComparisonChartInstance = null;
  }

  const { labels, totalData, passData, holdData, rejectData } = generateLineChartData();

  const isDense = totalData.length > 90;
  const pRadius = isDense ? 0 : 3.5;
  const bWidth = isDense ? 1.8 : 2.5;

  try {
    lineComparisonChartInstance = new Chart(lineComparisonChartCanvas.value, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Roll',
            data: totalData,
            hidden: !chartVisibility.value.total,
            borderColor: '#0f172a',
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
            fill: true,
            tension: 0.35,
            borderWidth: bWidth,
            pointRadius: pRadius,
            pointHoverRadius: 6,
            pointHitRadius: 10
          },
          {
            label: 'PASS',
            data: passData,
            hidden: !chartVisibility.value.pass,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.04)',
            fill: false,
            tension: 0.35,
            borderWidth: bWidth,
            pointRadius: pRadius,
            pointHoverRadius: 6,
            pointHitRadius: 10
          },
          {
            label: 'HOLD',
            data: holdData,
            hidden: !chartVisibility.value.hold,
            borderColor: '#f59e0b',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.35,
            borderWidth: Math.max(1.5, bWidth - 0.5),
            pointRadius: pRadius,
            pointHoverRadius: 5,
            pointHitRadius: 10
          },
          {
            label: 'REJECT',
            data: rejectData,
            hidden: !chartVisibility.value.reject,
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            fill: false,
            tension: 0.35,
            borderWidth: Math.max(1.5, bWidth - 0.5),
            pointRadius: pRadius,
            pointHoverRadius: 5,
            pointHitRadius: 10
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 900,
          easing: 'easeOutQuart'
        },
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            padding: 10,
            cornerRadius: 10,
            titleFont: { family: 'monospace', size: 11, weight: 'bold' },
            bodyFont: { family: 'monospace', size: 10.5 }
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              autoSkip: true,
              maxTicksLimit: 14,
              maxRotation: 0,
              font: { family: 'monospace', size: 9.5 }
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(24, 24, 27, 0.06)' },
            ticks: { precision: 0, font: { family: 'monospace', size: 9.5 } }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error creating line comparison chart instance:', err);
  }
};

const updateLineChart = () => {
  if (!lineComparisonChartCanvas.value) return;
  initLineChart();
};

// Reaktif re-render diagram garis saat data roll / label selesai dimuat atau sheet mesin berganti
watch([filteredLabels, allProductionRolls, activeChartMachineSheet], () => {
  nextTick(() => {
    if (!lineComparisonChartInstance) {
      initLineChart();
    } else {
      updateLineChart();
    }
    initScrollAnimations();
  });
}, { deep: true });

// =========================================================================
// 5. TAB MESIN (SLITTING, REWIND, CASTING) & OPERATOR QUALITY STATS
// =========================================================================
const machineTabs = [
  { key: 'SLITTING', label: 'Slitting', icon: '✂️' },
  { key: 'REWIND', label: 'Rewind', icon: '🔄' },
  { key: 'CASTING', label: 'Casting / SML', icon: '🏭' }
];

const selectedMachineTab = ref('SLITTING');

// Helper pencocokan Nama Operator dengan Master Database (db.operator_list)
const resolveOperatorInfo = (item, targetMachine) => {
  const rawOp = String(item.operator || '').trim();
  const rawCode = String(item.kodeOperator || (item.turunan ? item.turunan.charAt(0) : '')).trim().toUpperCase();
  const targetDate = item.tanggalShift || item.tanggalProduksi || item.tanggal || (item.createdAt ? String(item.createdAt).slice(0, 10) : null);
  const dbOps = configStore.operatorList || [];

  // 1. Prioritaskan kecocokan masa jabatan berdasarkan tanggal produksi & kode operator
  let matched = null;
  if (rawCode && typeof configStore.getOperatorByDate === 'function') {
    matched = configStore.getOperatorByDate(rawCode, targetMachine, targetDate);
  }

  // 2. Cari exact match by Nama Operator di Master Database
  if (!matched && rawOp) {
    matched = dbOps.find(o => o.nama && o.nama.toUpperCase() === rawOp.toUpperCase());
  }

  // 3. Cari by Kode Operator & Mesin
  if (!matched && rawCode) {
    matched = dbOps.find(o => 
      o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode &&
      (!o.mesin || o.mesin.toUpperCase().includes(targetMachine) || targetMachine.includes(o.mesin.toUpperCase()))
    );
  }

  // 4. Cari by Kode Operator saja
  if (!matched && rawCode) {
    matched = dbOps.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode);
  }

  // 4. Jika rawOp berformat "OPERATOR A", ekstrak kodenya
  if (!matched && /OPERATOR\s+([A-Z0-9])/i.test(rawOp)) {
    const codeMatch = rawOp.match(/OPERATOR\s+([A-Z0-9])/i);
    if (codeMatch) {
      const extractedCode = codeMatch[1].toUpperCase();
      matched = dbOps.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === extractedCode);
    }
  }

  if (matched) {
    return {
      name: matched.nama,
      code: matched.kodeOperator || rawCode,
      group: matched.kodeGrup || '',
      machine: matched.mesin || targetMachine,
      fromDb: true
    };
  }

  // Fallback jika belum terdaftar di database master
  const displayName = (rawOp && !rawOp.toUpperCase().startsWith('OPERATOR ') && rawOp !== rawCode)
    ? rawOp.toUpperCase()
    : (rawCode ? `OPERATOR ${rawCode}` : 'OPERATOR UMUM');

  return {
    name: displayName,
    code: rawCode || '-',
    group: '',
    machine: targetMachine,
    fromDb: false
  };
};

const operatorQualityStats = computed(() => {
  const list = filteredLabels.value;
  const targetMachine = selectedMachineTab.value;
  const opMap = new Map();

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const mesin = String(item.machineName || item.mesin || (item.slitting ? 'SLITTING' : item.rewind ? 'REWIND' : 'CASTING')).toUpperCase();

    let isMatched = false;
    if (targetMachine === 'REWIND' && (mesin.includes('REWIND') || item.rewind)) isMatched = true;
    else if (targetMachine === 'CASTING' && (mesin.includes('CASTING') || mesin.includes('SML') || item.sml)) isMatched = true;
    else if (targetMachine === 'SLITTING' && !mesin.includes('REWIND') && !mesin.includes('CASTING') && !mesin.includes('SML')) isMatched = true;

    if (!isMatched) continue;

    const resolved = resolveOperatorInfo(item, targetMachine);
    const opKey = resolved.name;

    if (!opMap.has(opKey)) {
      opMap.set(opKey, {
        name: resolved.name,
        code: resolved.code,
        group: resolved.group,
        fromDb: resolved.fromDb,
        totalRolls: 0,
        totalKg: 0,
        totalMeters: 0,
        passCount: 0,
        holdCount: 0,
        rejectCount: 0
      });
    }

    const entry = opMap.get(opKey);
    entry.totalRolls++;
    entry.totalKg += parseFloat(item.netto || item.beratNetto || item.berat || 0) || 0;
    entry.totalMeters += parseFloat(item.length || item.meter || item.panjang || 0) || 0;

    const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
    if (st === 'HOLD') entry.holdCount++;
    else if (st === 'REJECT' || st === 'NG') entry.rejectCount++;
    else entry.passCount++;
  }

  return Array.from(opMap.values()).map(op => {
    const total = op.totalRolls || 1;
    const passRate = Math.round((op.passCount / total) * 100);
    const holdRate = Math.round((op.holdCount / total) * 100);
    const rejectRate = Math.round((op.rejectCount / total) * 100);
    return {
      ...op,
      totalKg: Math.round(op.totalKg),
      totalMeters: Math.round(op.totalMeters),
      passRate,
      holdRate,
      rejectRate
    };
  }).sort((a, b) => b.totalRolls - a.totalRolls);
});

// =========================================================================
// 6. TIMELINE HORIZONTAL: PELACAKAN SPK PLAN VS AKTUAL
// =========================================================================
const showSpkModal = ref(false);
const selectedSpkModal = ref(null);
const showAllTimelineSpk = ref(false);

const openSpkModal = (row, activeView = 'ALL') => {
  selectedSpkModal.value = {
    ...(row.plan || row.actual || row),
    ...row,
    activeView
  };
  showSpkModal.value = true;
};

// Aligned Timeline Rows: Mendukung urutan kerja, plan dilewati, dan order sisipan (unplanned)
const dashboardTimelineRows = computed(() => {
  const batch = spkStore.activeBatch;
  const rawPlans = batch ? (spkStore.plans || []).filter(p => p.batchId === batch.uuid) : (spkStore.plans || []);
  
  // 1. Urutkan rencana strictly sesuai urutan pengerjaan & bersihkan dari string kosong / - / UNKNOWN
  const plannedList = [...rawPlans]
    .filter(p => {
      const s = String(p.spkNo || '').trim();
      const canon = parseSpkCanonical(s);
      return canon !== '' && s !== '-' && s.toUpperCase() !== 'UNKNOWN' && s.toUpperCase() !== 'NULL' && s !== '0';
    })
    .sort((a, b) => (a.seq !== undefined && a.seq !== null ? a.seq : (a.no || a.id || 0)) - (b.seq !== undefined && b.seq !== null ? b.seq : (b.no || b.id || 0)));

  // 2. Kumpulkan grup produksi aktual dari spkRealtimeDataMap (terfilter jendela waktu acuan H+2)
  const dataMap = spkStore.spkRealtimeDataMap || new Map();
  const actualRuns = [];

  for (const [spkKey, spkData] of dataMap.entries()) {
    const cleanKey = String(spkKey || '').trim();
    const canon = parseSpkCanonical(cleanKey);
    if (!cleanKey || !canon || cleanKey === '-' || cleanKey.toUpperCase() === 'UNKNOWN' || cleanKey.toUpperCase() === 'NULL' || cleanKey === '0') continue;

    if (spkData && spkData.totalRealRolls > 0) {
      let firstTime = Infinity;
      let lastTime = 0;
      let latestLot = '';
      let operator = '';
      for (const lt of spkData.lots.values()) {
        const t = lt.date ? new Date(lt.date).getTime() : 0;
        if (t > 0 && t < firstTime) firstTime = t;
        if (t > lastTime) {
          lastTime = t;
          latestLot = lt.lot;
          operator = lt.operator;
        }
      }
      actualRuns.push({
        spkNo: cleanKey,
        totalRealRolls: spkData.totalRealRolls,
        totalRealMeter: spkData.totalRealMeter,
        totalRealKg: spkData.totalRealKg,
        passCount: spkData.passCount,
        holdCount: spkData.holdCount,
        rejectCount: spkData.rejectCount,
        firstTime: firstTime === Infinity ? 0 : firstTime,
        lastTime,
        latestLot,
        operator,
        latestTimeFormatted: lastTime > 0 ? new Date(lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : ''
      });
    }
  }

  // Urutkan produksi aktual kronologis
  actualRuns.sort((a, b) => a.firstTime - b.firstTime);

  // Gunakan Canonical SPK Matcher terpadu
  const isMatch = (s1, s2) => isSpkMatch(s1, s2);

  // Zero seed fallback jika belum ada plan
  if (plannedList.length === 0) {
    const validActuals = actualRuns.filter(a => {
      const canon = parseSpkCanonical(a.spkNo);
      return canon !== '' && a.spkNo && a.spkNo !== '-' && a.spkNo.toUpperCase() !== 'UNKNOWN' && a.totalRealRolls > 0;
    });
    const sortedActuals = [...validActuals].sort((a, b) => b.lastTime - a.lastTime);
    return sortedActuals.map((act, idx) => {
      const plannedChildRolls = act.totalRealRolls;
      const actualChildRolls = act.totalRealRolls;
      const targetStatus = evaluateTargetStatus(actualChildRolls, plannedChildRolls, false);
      const startTimeFormatted = act.firstTime > 0
        ? new Date(act.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';
      const endTimeFormatted = act.lastTime > 0
        ? new Date(act.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';
      return {
        id: `fallback_${act.spkNo}_${idx}`,
        type: 'UNPLANNED',
        plan: null,
        actual: act,
        status: 'COMPLETED',
        spkNo: act.spkNo,
        startTimeFormatted,
        endTimeFormatted,
        targetStatus,
        achievementPercent: 100,
        plannedParentRolls: Math.max(1, Math.ceil(act.totalRealRolls / 2)),
        actualParentCut: Math.max(1, Math.ceil(act.totalRealRolls / 2)),
        diffParent: 0,
        plannedChildRolls,
        actualChildRolls,
        diffChild: 0,
        childAnalytics: [],
        chartingSummary: '',
        isChartingFullyMatched: true,
        chartingDeviationRolls: 0,
        chartingDeviationMessage: '',
        isBladeImbalance: false,
        bladeImbalanceMessage: '',
        ukuranJumbo: 'ORDER AKTUAL LAPANGAN',
        warning: 'Order Sisipan Lapangan',
        isCurrentlyRunning: idx === 0,
        isNextInQueue: false
      };
    });
  }

  const rows = [];
  const handledActualIndices = new Set();
  let timelineClock = new Date();
  if (actualRuns.length > 0 && actualRuns[0].firstTime > 0) {
    timelineClock = new Date(actualRuns[0].firstTime);
  }

  // Iterasi seluruh rencana SPK secara konsisten
  for (let pIdx = 0; pIdx < plannedList.length; pIdx++) {
    const plan = plannedList[pIdx];
    const planAnalytics = spkStore.getSpkRealtimeAnalytics(plan.spkNo, plan) || {};

    // Pasangkan dengan pengerjaan aktual jika ada
    let matchedActual = null;
    for (let aIdx = 0; aIdx < actualRuns.length; aIdx++) {
      if (handledActualIndices.has(aIdx)) continue;
      const act = actualRuns[aIdx];
      if (isMatch(act.spkNo, plan.spkNo)) {
        matchedActual = act;
        handledActualIndices.add(aIdx);
        break;
      }
    }

    const durMinutes = planAnalytics.totalMinutes || 45;
    const plannedTargetRolls = planAnalytics.plannedChildRolls || plan.totalPlannedRolls || (plan.jumlahJumbo * 2) || 2;

    let status = 'UPCOMING';
    let estStartTime = '';
    let estEndTime = '';
    let warning = '';

    if (matchedActual) {
      const isDone = matchedActual.totalRealRolls >= plannedTargetRolls;
      status = isDone ? 'COMPLETED' : 'IN_PROGRESS';

      if (matchedActual.firstTime > 0) {
        estStartTime = new Date(matchedActual.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      } else {
        estStartTime = timelineClock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
      }

      if (status === 'COMPLETED') {
        const finishTime = matchedActual.lastTime > 0 ? matchedActual.lastTime : (matchedActual.firstTime + durMinutes * 60000);
        estEndTime = new Date(finishTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        timelineClock = new Date(finishTime);
      } else {
        const rollsLeft = Math.max(1, plannedTargetRolls - matchedActual.totalRealRolls);
        const remainingFraction = Math.max(0.1, rollsLeft / plannedTargetRolls);
        const remainingMins = Math.round(durMinutes * remainingFraction);
        const projectedFinish = Date.now() + remainingMins * 60000;
        estEndTime = new Date(projectedFinish).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        timelineClock = new Date(projectedFinish);
      }
    } else {
      if (plan.status === 'SKIPPED' || plan.isSkipped) {
        status = 'SKIPPED';
        estStartTime = '-';
        estEndTime = '-';
        warning = 'Dilewati / Dilompati Sesuai Instruksi';
      } else {
        // Cek apakah urutan selanjutnya sudah ada yang mulai dikerjakan
        const subsequentPlans = plannedList.slice(pIdx + 1);
        const hasLaterStarted = subsequentPlans.some(sp => actualRuns.some(act => isMatch(act.spkNo, sp.spkNo)));

        status = 'UPCOMING';
        if (hasLaterStarted) {
          warning = 'Urutan Pengerjaan Terlewati (Menunggu Giliran)';
        }
        const startMs = timelineClock.getTime();
        const endMs = startMs + durMinutes * 60000;
        estStartTime = new Date(startMs).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        estEndTime = new Date(endMs).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        timelineClock = new Date(endMs);
      }
    }

    const actualChildRolls = matchedActual ? matchedActual.totalRealRolls : 0;
    const targetStatus = evaluateTargetStatus(actualChildRolls, plannedTargetRolls, status === 'SKIPPED');
    const startTimeFormatted = matchedActual && matchedActual.firstTime > 0
      ? new Date(matchedActual.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : (status === 'SKIPPED' ? '-' : (estStartTime || '-'));
    const endTimeFormatted = matchedActual && matchedActual.lastTime > 0
      ? new Date(matchedActual.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : (status === 'SKIPPED' ? '-' : (estEndTime || '-'));

    rows.push({
      id: `plan_${plan.id || pIdx}`,
      type: 'PLANNED',
      plan,
      actual: matchedActual,
      status,
      spkNo: plan.spkNo,
      formula: plan.formula || planAnalytics.formula || 'M01',
      thickness: plan.thickness || planAnalytics.thickness || 20,
      jenis: plan.jenis || 'CPP',
      customer: plan.customer || plan.namaCustomer || '-',
      planDurationMinutes: durMinutes,
      estStartTime,
      estEndTime,
      startTimeFormatted,
      endTimeFormatted,
      targetStatus,
      achievementPercent: planAnalytics.achievementPercent || 0,
      plannedParentRolls: planAnalytics.plannedParentRolls || plan.jumlahJumbo || 1,
      actualParentCut: planAnalytics.actualParentCut || 0,
      parentStatus: planAnalytics.parentStatus || null,
      parentAchievementPercent: planAnalytics.parentAchievementPercent || 0,
      ukuranJumbo: planAnalytics.ukuranJumbo || plan.ukuranJumbo || `${plan.jenis || 'CPP'} ${plan.formula || ''} ${plan.thickness || ''}μ x ${plan.lebarParent || ''}mm`,
      childAnalytics: planAnalytics.childAnalytics || [],
      chartingSummary: planAnalytics.chartingSummary || '',
      isChartingFullyMatched: planAnalytics.isChartingFullyMatched !== false,
      chartingDeviationRolls: planAnalytics.chartingDeviationRolls || 0,
      chartingDeviationMessage: planAnalytics.chartingDeviationMessage || '',
      isBladeImbalance: planAnalytics.isBladeImbalance || false,
      bladeImbalanceMessage: planAnalytics.bladeImbalanceMessage || '',
      diffParent: planAnalytics.diffParent || 0,
      plannedChildRolls: plannedTargetRolls,
      actualChildRolls,
      diffChild: planAnalytics.diffChild || 0,
      diffMeter: planAnalytics.diffMeter || 0,
      speed: planAnalytics.speed || 600,
      warning,
      isCurrentlyRunning: false,
      isNextInQueue: false
    });
  }

  // Tambahkan Order Sisipan Lapangan (aktual yang tidak cocok dengan plan manapun)
  for (let aIdx = 0; aIdx < actualRuns.length; aIdx++) {
    if (handledActualIndices.has(aIdx)) continue;
    const act = actualRuns[aIdx];
    const canon = parseSpkCanonical(act.spkNo);
    if (!act.spkNo || !canon || act.spkNo === '-' || act.spkNo.toUpperCase() === 'UNKNOWN' || act.spkNo.toUpperCase() === 'NULL' || act.spkNo === '0') continue;
    if (!act.totalRealRolls || act.totalRealRolls <= 0) continue;

    const actTargetStatus = evaluateTargetStatus(act.totalRealRolls, act.totalRealRolls, false);
    const actStartFormatted = act.firstTime > 0
      ? new Date(act.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '-';
    const actEndFormatted = act.lastTime > 0
      ? new Date(act.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '-';

    rows.push({
      id: `unplanned_${act.spkNo}_${aIdx}`,
      type: 'UNPLANNED',
      plan: null,
      actual: act,
      status: 'UNPLANNED',
      spkNo: act.spkNo,
      startTimeFormatted: actStartFormatted,
      endTimeFormatted: actEndFormatted,
      targetStatus: actTargetStatus,
      achievementPercent: 100,
      plannedParentRolls: Math.max(1, Math.ceil(act.totalRealRolls / 2)),
      actualParentCut: Math.max(1, Math.ceil(act.totalRealRolls / 2)),
      diffParent: 0,
      plannedChildRolls: act.totalRealRolls,
      actualChildRolls: act.totalRealRolls,
      diffChild: 0,
      childAnalytics: [],
      chartingSummary: '',
      isChartingFullyMatched: true,
      chartingDeviationRolls: 0,
      chartingDeviationMessage: '',
      isBladeImbalance: false,
      bladeImbalanceMessage: '',
      ukuranJumbo: 'ORDER SISIPAN LAPANGAN',
      warning: 'Order Sisipan Lapangan (Tidak Ada dalam Plan SPK)',
      isCurrentlyRunning: false,
      isNextInQueue: false
    });
    handledActualIndices.add(aIdx);
  }

  // Tentukan urutan mana yang saat ini sedang jalan di mesin Slitting
  let runningFound = false;
  for (const row of rows) {
    if (row.status === 'IN_PROGRESS') {
      row.isCurrentlyRunning = true;
      runningFound = true;
      break;
    }
  }
  // Jika tidak ada IN_PROGRESS, tandai urutan terdepan yang UPCOMING sebagai antrean berjalan
  if (!runningFound && rows.length > 0) {
    const firstUpcoming = rows.find(r => r.status === 'UPCOMING');
    if (firstUpcoming) {
      firstUpcoming.isCurrentlyRunning = true;
      firstUpcoming.isNextInQueue = true;
    }
  }

  return rows;
});

// Alias timelineSpkList untuk menjaga kompatibilitas komponen
const timelineSpkList = computed(() => {
  const rows = dashboardTimelineRows.value;
  if (!showAllTimelineSpk.value) {
    return rows.slice(0, 15);
  }
  return rows;
});

const totalTimelinePlansCount = computed(() => dashboardTimelineRows.value.length);

// Executive Summary Batch SPK di Dashboard
const timelineBatchSummary = computed(() => {
  const list = dashboardTimelineRows.value;
  let totalPlanRolls = 0;
  let totalActRolls = 0;
  let totalPlanMeters = 0;
  let totalActMeters = 0;
  let completedCount = 0;
  let runningCount = 0;
  let upcomingCount = 0;
  let skippedCount = 0;
  let unplannedCount = 0;

  for (const it of list) {
    totalPlanRolls += (it.plannedChildRolls || 0);
    totalActRolls += (it.actualChildRolls || (it.actual?.totalRealRolls || 0));
    totalPlanMeters += (it.plan?.totalPlannedMeter || (it.plan?.panjangParent * it.plannedParentRolls) || 0);
    totalActMeters += (it.actual?.totalRealMeter || 0);

    if (it.status === 'COMPLETED') completedCount++;
    else if (it.status === 'IN_PROGRESS') runningCount++;
    else if (it.status === 'SKIPPED') skippedCount++;
    else if (it.status === 'UNPLANNED') unplannedCount++;
    else upcomingCount++;
  }

  const rollPercent = totalPlanRolls > 0 ? Math.round((totalActRolls / totalPlanRolls) * 100) : (totalActRolls > 0 ? 100 : 0);
  const meterPercent = totalPlanMeters > 0 ? Math.round((totalActMeters / totalPlanMeters) * 100) : (totalActMeters > 0 ? 100 : 0);

  return {
    totalPlanRolls,
    totalActRolls,
    totalPlanMeters,
    totalActMeters,
    completedCount,
    runningCount,
    upcomingCount,
    skippedCount,
    unplannedCount,
    rollPercent,
    meterPercent
  };
});

// =========================================================================
// REKAP RINCIAN UKURAN FG SELESAI DIPROSES HARI INI (ROLL, METER, KG, STATUS)
// Format Deskripsi NAV: [JENIS] [KF] [THICK] MC X [WIDTH] MM
// =========================================================================
const fgStatusFilter = ref('ALL'); // 'ALL' | 'PASS' | 'HOLD' | 'REJECT'
const fgSearchQuery = ref('');
const fgSortBy = ref('NAV'); // 'NAV' (default) | 'ROLL' | 'KG' | 'METER'

const todayFgSizeSummary = computed(() => {
  const sourceRolls = filteredLabels.value || [];
  if (!sourceRolls || sourceRolls.length === 0) {
    return {
      groups: [],
      grandTotals: {
        totalRolls: 0,
        totalMeter: 0,
        totalKg: 0,
        passRolls: 0,
        passKg: 0,
        passMeter: 0,
        holdRolls: 0,
        holdKg: 0,
        holdMeter: 0,
        rejectRolls: 0,
        rejectKg: 0,
        rejectMeter: 0,
        passRate: 0,
        variantCount: 0
      }
    };
  }

  const groupMap = new Map();
  let grandRolls = 0;
  let grandMeter = 0;
  let grandKg = 0;
  let grandPassRolls = 0;
  let grandPassKg = 0;
  let grandPassMeter = 0;
  let grandHoldRolls = 0;
  let grandHoldKg = 0;
  let grandHoldMeter = 0;
  let grandRejectRolls = 0;
  let grandRejectKg = 0;
  let grandRejectMeter = 0;

  for (const it of sourceRolls) {
    // Saring agar hanya Finished Goods (FG) roll
    const jenisPrint = String(it.jenisPrint || '').toUpperCase();
    const tipe = String(it.tipe || it.tipe_roll || '').toUpperCase();
    const isWip = tipe.includes('WIP') || jenisPrint.includes('WIP') || String(it.mesin || '').toUpperCase().includes('CAST');
    if (isWip) continue;

    const jenis = String(it.jenisFilm || it.jenis_film || it.jenis || 'CPP').toUpperCase().trim();
    const formula = String(it.kodeFormula || it.kode_formula || it.formula || it.kode || (it.lot ? it.lot.slice(0, 3) : '') || '-').toUpperCase().trim();
    const thickness = parseFloat(it.thickness || it.tebal || it.thick || it.micron || 0) || 0;
    const width = parseFloat(it.width || it.lebar || 0) || 0;
    const length = parseFloat(it.length || it.panjang || it.meter || 0) || 0;

    const kg = parseFloat(it.netto || it.beratNetto || it.berat || 0) || 0;
    const m = length;

    // Format Deskripsi NAV resmi: [JENIS] [KF] [THICK] MC X [WIDTH] MM
    const navDescription = `${jenis} ${formula} ${thickness > 0 ? thickness + ' MC' : 'MC'} X ${width > 0 ? width + ' MM' : 'MM'}`.toUpperCase();

    // Normalisasi Status QC (PASS / HOLD / REJECT)
    const rawSt = String(it.qualityStatus || it.status || 'PASS').toUpperCase().trim();
    let normSt = 'PASS';
    if (rawSt === 'HOLD') normSt = 'HOLD';
    else if (rawSt === 'REJECT' || rawSt === 'NG') normSt = 'REJECT';
    else normSt = 'PASS';

    grandRolls++;
    grandMeter += m;
    grandKg += kg;

    if (normSt === 'PASS') {
      grandPassRolls++;
      grandPassKg += kg;
      grandPassMeter += m;
    } else if (normSt === 'HOLD') {
      grandHoldRolls++;
      grandHoldKg += kg;
      grandHoldMeter += m;
    } else {
      grandRejectRolls++;
      grandRejectKg += kg;
      grandRejectMeter += m;
    }

    if (!groupMap.has(navDescription)) {
      groupMap.set(navDescription, {
        navDescription,
        jenis,
        formula,
        thickness,
        width,
        length,
        totalRolls: 0,
        totalMeter: 0,
        totalKg: 0,
        passRolls: 0,
        passMeter: 0,
        passKg: 0,
        holdRolls: 0,
        holdMeter: 0,
        holdKg: 0,
        rejectRolls: 0,
        rejectMeter: 0,
        rejectKg: 0,
        machines: new Set(),
        shifts: new Set(),
        lots: new Set()
      });
    }

    const g = groupMap.get(navDescription);
    g.totalRolls++;
    g.totalMeter += m;
    g.totalKg += kg;

    if (normSt === 'PASS') {
      g.passRolls++;
      g.passMeter += m;
      g.passKg += kg;
    } else if (normSt === 'HOLD') {
      g.holdRolls++;
      g.holdMeter += m;
      g.holdKg += kg;
    } else {
      g.rejectRolls++;
      g.rejectMeter += m;
      g.rejectKg += kg;
    }

    if (it.mesin || it.machineName) g.machines.add(it.mesin || it.machineName);
    if (it.shift) g.shifts.add(`Shift ${it.shift}`);
    if (it.lot || it.no_lot) g.lots.add(it.lot || it.no_lot);
  }

  let list = Array.from(groupMap.values()).map(g => ({
    ...g,
    totalKg: Math.round(g.totalKg * 10) / 10,
    totalMeter: Math.round(g.totalMeter),
    passKg: Math.round(g.passKg * 10) / 10,
    passMeter: Math.round(g.passMeter),
    holdKg: Math.round(g.holdKg * 10) / 10,
    holdMeter: Math.round(g.holdMeter),
    rejectKg: Math.round(g.rejectKg * 10) / 10,
    rejectMeter: Math.round(g.rejectMeter),
    passRate: g.totalRolls > 0 ? Math.round((g.passRolls / g.totalRolls) * 100) : 0,
    machineList: Array.from(g.machines),
    shiftList: Array.from(g.shifts)
  }));

  // Filter Pencarian
  if (fgSearchQuery.value.trim()) {
    const q = fgSearchQuery.value.trim().toUpperCase();
    list = list.filter(item => 
      item.navDescription.includes(q) ||
      String(item.width).includes(q) ||
      String(item.thickness).includes(q) ||
      item.formula.includes(q)
    );
  }

  // Filter Kategori Mutu
  if (fgStatusFilter.value === 'PASS') {
    list = list.filter(item => item.passRolls > 0);
  } else if (fgStatusFilter.value === 'HOLD') {
    list = list.filter(item => item.holdRolls > 0);
  } else if (fgStatusFilter.value === 'REJECT') {
    list = list.filter(item => item.rejectRolls > 0);
  }

  // Sorting: Default SESUAI DESKRIPSI NAV (A-Z)
  if (fgSortBy.value === 'NAV') {
    list.sort((a, b) => a.navDescription.localeCompare(b.navDescription, undefined, { numeric: true, sensitivity: 'base' }));
  } else if (fgSortBy.value === 'ROLL') {
    list.sort((a, b) => b.totalRolls - a.totalRolls);
  } else if (fgSortBy.value === 'KG') {
    list.sort((a, b) => b.totalKg - a.totalKg);
  } else if (fgSortBy.value === 'METER') {
    list.sort((a, b) => b.totalMeter - a.totalMeter);
  }

  const grandPassRate = grandRolls > 0 ? Math.round((grandPassRolls / grandRolls) * 100) : 0;

  return {
    groups: list,
    grandTotals: {
      totalRolls: grandRolls,
      totalMeter: Math.round(grandMeter),
      totalKg: Math.round(grandKg * 10) / 10,
      passRolls: grandPassRolls,
      passKg: Math.round(grandPassKg * 10) / 10,
      passMeter: Math.round(grandPassMeter),
      holdRolls: grandHoldRolls,
      holdKg: Math.round(grandHoldKg * 10) / 10,
      holdMeter: Math.round(grandHoldMeter),
      rejectRolls: grandRejectRolls,
      rejectKg: Math.round(grandRejectKg * 10) / 10,
      rejectMeter: Math.round(grandRejectMeter),
      passRate: grandPassRate,
      variantCount: groupMap.size
    }
  };
});

// =========================================================================
// 7. BLOK KONDISI STOK IMS (3 KRITERIA: JENIS, FORMULA, MICRON & 3 SATUAN)
// =========================================================================
const stockScopeFilter = ref('ALL');
const selectedStockCriteria = ref('JENIS');
const selectedStockUnit = ref('ROLL');

const stockCriteriaOptions = [
  { key: 'JENIS', label: 'Jenis' },
  { key: 'FORMULA', label: 'Formula' },
  { key: 'MICRON', label: 'Micron' }
];

const stockUnitOptions = [
  { key: 'ROLL', label: 'By Roll' },
  { key: 'METER', label: 'By Meter' },
  { key: 'KG', label: 'By Berat' }
];

const unitSuffixLabel = computed(() => {
  if (selectedStockUnit.value === 'METER') return 'Meter';
  if (selectedStockUnit.value === 'KG') return 'Kg';
  return 'Roll';
});

const activeFgUpload = computed(() => inventoryStore.activeUpload);
const activeWipUpdate = computed(() => wipStore.activeUpdate);

const allStockItems = computed(() => {
  const fgStocks = (inventoryStore.currentStocks || []).map(s => {
    const totalRoll = Number(s.totalRoll) || 0;
    const length = Number(s.length) || 0;
    const totalPanjang = Number(s.totalPanjang) || (totalRoll * length);
    const totalKg = Number(s.totalKg) || 0;
    const j = String(s.jenis || 'VMCPP').toUpperCase().trim();
    const f = String(s.kodeFormula || 'M06').toUpperCase().trim();
    const t = String(s.thickness || '20').trim();
    const w = String(s.width || '1000').trim();
    const nav = s.descriptionNav || `${j} ${f} ${t} MC X ${w} MM`;

    return {
      id: s.id || `FG_${s.sourceNo || 'NA'}_${j}_${f}_${t}_${w}_${length}`,
      stockType: 'FG',
      isJumbo: false,
      jenis: j,
      formula: f,
      thick: t,
      width: w,
      length,
      descNav: nav,
      sourceNo: s.sourceNo || '-',
      totalRoll,
      totalPanjang,
      totalKg,
      listRak: s.listRak || '-'
    };
  });

  const wipStocks = (wipStore.activeWipRolls || []).map(j => {
    const length = Number(j.length || j.panjangAktual || j.panjang || 0) || 0;
    const kg = Number(j.beratAktual || j.berat || j.beratTeori || 0) || 0;
    const jenis = String(j.jenis || 'CPP').toUpperCase().trim();
    const formula = String(j.kodeFormula || j.formula || (j.lot ? j.lot.slice(0, 3) : '') || 'M07').toUpperCase().trim();
    const thick = String(j.thickness || j.thick || j.tebal || '20').trim();
    const width = String(j.width || j.lebar || '1000').trim();
    const nav = j.descriptionNav || `${jenis} ${formula} ${thick} MC X ${width} MM`;

    return {
      id: j.id || j.uuid || `JUMBO_${j.lot || 'NA'}_${jenis}_${formula}_${thick}_${width}`,
      stockType: 'JUMBO',
      isJumbo: true,
      jenis,
      formula,
      thick,
      width,
      length,
      descNav: nav,
      sourceNo: j.lot || j.rollNo || '-',
      totalRoll: 1,
      totalPanjang: length,
      totalKg: kg,
      listRak: j.lokasiAktif ? `${j.lokasiAktif} (${j.posisiAktif || 'BAWAH'})` : '-'
    };
  });

  if (stockScopeFilter.value === 'FG') return fgStocks;
  if (stockScopeFilter.value === 'JUMBO') return wipStocks;
  return [...fgStocks, ...wipStocks];
});

const stockGroupedByCriteria = computed(() => {
  const items = allStockItems.value;
  const groups = {};
  let grandTotalValue = 0;

  for (const it of items) {
    let key = it.jenis || 'LAINNYA';
    if (selectedStockCriteria.value === 'FORMULA') key = it.formula || 'NO_FORMULA';
    else if (selectedStockCriteria.value === 'MICRON') key = `${it.thick}μ`;

    if (!groups[key]) {
      groups[key] = {
        key,
        totalRolls: 0,
        totalMeters: 0,
        totalKg: 0,
        fgCount: 0,
        wipCount: 0,
        items: []
      };
    }

    const rolls = Number(it.totalRoll) || 0;
    const meters = Number(it.totalPanjang) || 0;
    const kg = Number(it.totalKg) || 0;

    groups[key].totalRolls += rolls;
    groups[key].totalMeters += meters;
    groups[key].totalKg += kg;

    if (it.stockType === 'FG') groups[key].fgCount += rolls;
    else groups[key].wipCount += rolls;

    groups[key].items.push(it);

    if (selectedStockUnit.value === 'METER') grandTotalValue += meters;
    else if (selectedStockUnit.value === 'KG') grandTotalValue += kg;
    else grandTotalValue += rolls;
  }

  const grandDivisor = grandTotalValue || 1;

  return Object.values(groups).map(g => {
    let displayValue = g.totalRolls;
    if (selectedStockUnit.value === 'METER') displayValue = Math.round(g.totalMeters);
    else if (selectedStockUnit.value === 'KG') displayValue = Math.round(g.totalKg);

    const percentShare = Math.min(100, Math.round((displayValue / grandDivisor) * 100));

    return {
      ...g,
      displayValue,
      percentShare
    };
  }).sort((a, b) => b.displayValue - a.displayValue);
});

// =========================================================================
// 8. MODAL DRILL-DOWN STOK IMS BERDASARKAN DESKRIPSI NAV
// =========================================================================
const showStockModal = ref(false);
const selectedStockCategory = ref(null);
const modalSearchQuery = ref('');

const openStockDetailModal = (category) => {
  selectedStockCategory.value = category;
  modalSearchQuery.value = '';
  showStockModal.value = true;
};

const groupedNavItems = computed(() => {
  if (!selectedStockCategory.value) return [];
  const items = selectedStockCategory.value.items || [];
  const term = modalSearchQuery.value.toLowerCase().trim();

  const navMap = {};

  for (const it of items) {
    const descNav = it.descNav || `${it.jenis} ${it.formula} ${it.thick} MC X ${it.width} MM`;

    if (term) {
      const matchNav = descNav.toLowerCase().includes(term);
      const matchSource = String(it.sourceNo || '').toLowerCase().includes(term);
      const matchFormula = String(it.formula || '').toLowerCase().includes(term);
      const matchRak = String(it.listRak || '').toLowerCase().includes(term);
      if (!matchNav && !matchSource && !matchFormula && !matchRak) continue;
    }

    if (!navMap[descNav]) {
      navMap[descNav] = {
        descNav,
        items: [],
        totalRolls: 0,
        totalMeters: 0,
        totalKg: 0
      };
    }

    navMap[descNav].items.push(it);
    navMap[descNav].totalRolls += (Number(it.totalRoll) || 0);
    navMap[descNav].totalMeters += (Number(it.totalPanjang) || 0);
    navMap[descNav].totalKg += (Number(it.totalKg) || 0);
  }

  return Object.values(navMap).map(n => ({
    ...n,
    totalMeters: Math.round(n.totalMeters),
    totalKg: Math.round(n.totalKg)
  })).sort((a, b) => b.totalRolls - a.totalRolls);
});

const formatNum = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('id-ID');
};

// =========================================================================
// 9. SCROLL ANIMATION (REPEATING ANIMATE IN & OUT)
// =========================================================================
let scrollObserver = null;
let block1Observer = null;

const initScrollAnimations = () => {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
  
  if (scrollObserver) {
    scrollObserver.disconnect();
  }
  if (block1Observer) {
    block1Observer.disconnect();
  }

  scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      // Efek in dan out yang terus berulang ketika scroll
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
      } else {
        entry.target.classList.remove('is-revealed');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  const targets = document.querySelectorAll('.reveal-on-scroll');
  targets.forEach((el) => scrollObserver.observe(el));

  // Observer khusus untuk Blok 1: Rolling Counting dipicu saat scroll kembali ke Blok 1
  if (block1Ref.value) {
    let hasLeftBlock1 = false;
    block1Observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (hasLeftBlock1) {
            runKpiCountAnimation();
          }
        } else {
          hasLeftBlock1 = true;
        }
      });
    }, {
      threshold: 0.15
    });
    block1Observer.observe(block1Ref.value);
  }
};

// =========================================================================
// 10. LIFECYCLE HOOKS
// =========================================================================
onMounted(async () => {
  updateLiveTime();
  liveTimer = setInterval(updateLiveTime, 1000);

  isDashboardLoading.value = true;
  try {
    await Promise.allSettled([
      configStore.loadAll(),
      inventoryStore.loadInventory(),
      wipStore.loadWipRolls(),
      labelStore.loadLabels(),
      dataRollStore.loadRolls(),
      spkStore.loadAll()
    ]);
  } catch (err) {
    console.error('Error loading dashboard data:', err);
  } finally {
    isDashboardLoading.value = false;
  }

  await nextTick();
  runKpiCountAnimation();
  initLineChart();
  initScrollAnimations();
});

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
  if (animFrameId) cancelAnimationFrame(animFrameId);
  if (lineComparisonChartInstance) lineComparisonChartInstance.destroy();
  if (scrollObserver) {
    scrollObserver.disconnect();
    scrollObserver = null;
  }
  if (block1Observer) {
    block1Observer.disconnect();
    block1Observer = null;
  }
});
</script>

<style scoped>
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientFlow {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

.anim-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}

.anim-enter-1 {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.anim-enter-2 {
  animation: slideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.anim-enter-3 {
  animation: slideUp 0.46s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.anim-enter-4 {
  animation: slideUp 0.54s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.anim-gradient-flow {
  animation: gradientFlow 4s ease infinite;
}

/* ========================================================================= */
/* EFEK ANIMATE IN & OUT BERULANG KETIKA SCROLL KE BAWAH / ATAS            */
/* ========================================================================= */
.reveal-on-scroll {
  opacity: 0;
  transform: translateY(22px) scale(0.99);
  transition: opacity 0.55s cubic-bezier(0.16, 1, 0.3, 1), transform 0.55s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: opacity, transform;
}

.reveal-on-scroll.is-revealed {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .reveal-on-scroll {
    opacity: 1 !important;
    transform: none !important;
    transition: none !important;
  }
}
</style>
