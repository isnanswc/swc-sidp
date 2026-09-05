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
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-zinc-100 text-zinc-800 border border-zinc-200">
            <span>⏱️ {{ liveTimeString }}</span>
          </span>

          <!-- Hari Kerja Produksi -->
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200" title="Hari Kerja Produksi pabrik (cut-off 07:00 pagi)">
            <span>🏭 Hari Kerja: <strong>{{ workDateLabel }}</strong></span>
          </span>

          <!-- Shift Aktif Badge -->
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{{ currentShift.definition.shortName }} (Grup {{ currentShift.group }})</span>
          </span>

          <!-- Total Database Roll Badge (Live Verification) -->
          <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200" title="Total seluruh roll tersimpan di IndexedDB">
            <span>💾 DB: <strong>{{ formatNum(allProductionRolls.length) }}</strong> Roll</span>
          </span>
        </div>

        <!-- Quick Navigation Actions (Compact) -->
        <div class="flex items-center gap-1.5">
          <router-link
            to="/label"
            class="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-[11px] font-mono flex items-center gap-1 transition-colors shadow-2xs"
            title="Cetak Label Roll Baru"
          >
            <span>🏷️ Label</span>
          </router-link>
          <router-link
            to="/spk"
            class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-[11px] font-mono flex items-center gap-1 transition-colors shadow-2xs"
            title="Buka Manajemen SPK"
          >
            <span>📑 SPK</span>
          </router-link>
          <router-link
            to="/inventory"
            class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-[11px] font-mono border border-zinc-200 flex items-center gap-1 transition-colors shadow-2xs"
            title="Buka Manajemen Stok Gudang IMS"
          >
            <span>📦 IMS</span>
          </router-link>
        </div>
      </div>

      <!-- Baris 2: Judul Dashboard & Filter Waktu + Stepper Hari Sebelumnya -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-black text-zinc-950 tracking-tight">
              DASHBOARD PRODUKSI & STOK FILM
            </h1>
            <span class="px-2 py-0.2 rounded bg-zinc-900 text-white font-mono text-[9px] font-black uppercase tracking-wider">
              COCKPIT
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium mt-0.5">
            Monitoring terpusat hasil konversi slitting, rewind, kendali mutu QC, dan inventaris stok.
          </p>
        </div>

        <!-- Frequency Selector + Stepper Hari Sebelumnya (Previous Multi-Times) -->
        <div class="flex flex-wrap items-center gap-2">
          
          <!-- Stepper Tombol Hari Sebelumnya / Berikutnya -->
          <div class="bg-zinc-100 p-1 rounded-xl border border-zinc-200 flex items-center gap-1 text-xs font-mono font-bold">
            <button
              @click="stepPrevDay"
              class="px-2.5 py-1 rounded-lg bg-white hover:bg-zinc-200 text-zinc-850 border border-zinc-300 shadow-2xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
              title="Lihat data hari sebelumnya (bisa diklik berkali-kali untuk mundur ke H-1, H-2, H-3, dst.)"
            >
              <span>◀</span>
              <span>Hari Sebelumnya</span>
            </button>

            <!-- Active Target Date Display Badge -->
            <div
              :class="[
                'px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5',
                dayOffset === 0
                  ? 'bg-zinc-200/70 text-zinc-800'
                  : 'bg-red-50 text-red-700 border border-red-200 font-black'
              ]"
            >
              <span>📅</span>
              <span>{{ activeTargetDateDisplay }}</span>
            </div>

            <!-- Tombol Hari Berikutnya -->
            <button
              @click="stepNextDay"
              :disabled="dayOffset >= 0"
              :class="[
                'px-2.5 py-1 rounded-lg transition-all flex items-center gap-1',
                dayOffset < 0
                  ? 'bg-white hover:bg-zinc-200 text-zinc-800 border border-zinc-300 shadow-2xs cursor-pointer active:scale-95'
                  : 'bg-zinc-200/40 text-zinc-400 cursor-not-allowed border border-zinc-200'
              ]"
              title="Lihat data hari berikutnya"
            >
              <span>Berikutnya</span>
              <span>▶</span>
            </button>

            <!-- Tombol Reset ke Hari Ini -->
            <button
              v-if="dayOffset !== 0"
              @click="resetToToday"
              class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white text-[11px] transition-all cursor-pointer shadow-2xs font-black"
              title="Kembali ke Hari Ini"
            >
              ↺ Hari Ini
            </button>
          </div>

          <!-- Pilihan Rentang Waktu (Hari, Minggu, Bulan, 3 Bulan, 6 Bulan, Tahun, Custom) -->
          <div class="bg-zinc-100 p-1 rounded-xl border border-zinc-200 flex flex-wrap items-center gap-0.5 text-xs font-mono font-bold">
            <button
              v-for="freq in frequencyOptions"
              :key="freq.key"
              @click="setFrequency(freq.key)"
              :class="[
                'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-center text-[11px]',
                selectedFrequency === freq.key && (freq.key === 'CUSTOM' || dayOffset === 0)
                  ? 'bg-zinc-950 text-white shadow-xs font-black'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/70'
              ]"
            >
              {{ freq.label }}
            </button>
          </div>

          <!-- Input Rentang Custom (Mulai & Selesai) -->
          <div v-if="selectedFrequency === 'CUSTOM'" class="bg-white p-1 rounded-xl border border-zinc-300 shadow-2xs flex items-center gap-1.5 text-xs font-mono">
            <span class="text-zinc-500 pl-1 text-[10.5px] font-bold">Dari:</span>
            <input
              type="date"
              v-model="customStartDate"
              @change="onCustomDateChange"
              class="px-2 py-0.5 rounded-lg border border-zinc-200 text-zinc-800 text-xs outline-none focus:border-red-500 font-mono"
            />
            <span class="text-zinc-500 text-[10.5px] font-bold">s/d</span>
            <input
              type="date"
              v-model="customEndDate"
              @change="onCustomDateChange"
              class="px-2 py-0.5 rounded-lg border border-zinc-200 text-zinc-800 text-xs outline-none focus:border-red-500 font-mono"
            />
          </div>

          <!-- Informasi Rentang Tanggal Jelas -->
          <div class="px-2.5 py-1 rounded-xl bg-red-50 border border-red-200 text-red-900 text-[11px] font-mono font-bold flex items-center gap-1 shadow-2xs">
            <span>🗓️</span>
            <span>{{ activePeriodSubtitle }}</span>
          </div>

        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. KPI SUMMARY METRIC CARDS (4 KARTU PADAT & MODERN)                      -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 anim-enter-2">
      <!-- CARD 1: OUTPUT PRODUKSI ROLL -->
      <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-[10.5px] font-black text-zinc-400 uppercase tracking-wider font-mono">
            Output Roll ({{ activePeriodSubtitle }})
          </span>
          <div class="w-8 h-8 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
            🏷️
          </div>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-zinc-950 font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{{ formatNum(kpiMetrics.totalRolls) }}</span>
            <span class="text-xs font-bold text-zinc-500 font-sans">Roll</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500 font-medium font-mono">
            <span class="text-zinc-900 font-bold">Slit: {{ formatNum(kpiMetrics.slittingRolls) }}</span>
            <span class="text-zinc-300">•</span>
            <span class="text-zinc-900 font-bold">Rwd: {{ formatNum(kpiMetrics.rewindRolls) }}</span>
            <span class="text-zinc-300">•</span>
            <span class="text-zinc-900 font-bold">Cast: {{ formatNum(kpiMetrics.smlRolls) }}</span>
          </div>
        </div>
      </div>

      <!-- CARD 2: TONASE BERAT BERSIH -->
      <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs hover:border-zinc-400 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-[10.5px] font-black text-zinc-400 uppercase tracking-wider font-mono">
            Tonase Bersih
          </span>
          <div class="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
            ⚖️
          </div>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-zinc-950 font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{{ formatNum(kpiMetrics.totalBeratKg) }}</span>
            <span class="text-xs font-bold text-zinc-500 font-sans">Kg</span>
          </div>
          <div class="text-[11px] text-zinc-500 mt-1 font-medium font-mono">
            Total <strong>{{ (kpiMetrics.totalBeratKg / 1000).toFixed(2) }} Ton</strong> • {{ formatNum(kpiMetrics.totalMeter) }} Meter
          </div>
        </div>
      </div>

      <!-- CARD 3: YIELD KUALITAS QC (% PASS) -->
      <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs hover:border-emerald-300 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-[10.5px] font-black text-zinc-400 uppercase tracking-wider font-mono">
            Yield Rate (Mutu QC)
          </span>
          <div class="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
            🎯
          </div>
        </div>
        <div class="mt-2">
          <div class="text-2xl font-black text-emerald-600 font-mono tracking-tight flex items-baseline gap-1.5">
            <span>{{ kpiMetrics.yieldPassRate }}%</span>
            <span class="text-[10.5px] font-bold text-emerald-700 font-sans">PASS RATE</span>
          </div>
          <div class="flex items-center gap-1.5 mt-1 text-[11px] font-mono font-bold">
            <span class="text-emerald-700">{{ formatNum(kpiMetrics.passCount) }} Pass</span>
            <span class="text-zinc-300">•</span>
            <span class="text-amber-600">{{ formatNum(kpiMetrics.holdCount) }} Hold</span>
            <span class="text-zinc-300">•</span>
            <span class="text-red-600">{{ formatNum(kpiMetrics.rejectCount) }} Rej</span>
          </div>
        </div>
      </div>

      <!-- CARD 4: SHIFT BERJALAN & GROUP -->
      <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs hover:border-blue-300 transition-all group">
        <div class="flex items-center justify-between">
          <span class="text-[10.5px] font-black text-zinc-400 uppercase tracking-wider font-mono">
            Shift Aktif Saat Ini
          </span>
          <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-sm group-hover:scale-105 transition-transform">
            🔄
          </div>
        </div>
        <div class="mt-2">
          <div class="text-xl font-black text-zinc-950 font-mono tracking-tight truncate">
            {{ currentShift.definition.shortName }}
            <span class="text-[10.5px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 ml-1 font-sans">Grup {{ currentShift.group }}</span>
          </div>
          <div class="mt-1 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>{{ currentShift.definition.startTime }} - {{ currentShift.definition.endTime }}</span>
            <span class="font-bold text-zinc-800">{{ shiftElapsedPercent }}% Berjalan</span>
          </div>
          <!-- Live Shift Progress Bar -->
          <div class="w-full bg-zinc-100 h-1.5 rounded-full mt-1 overflow-hidden">
            <div
              class="bg-blue-600 h-full rounded-full transition-all duration-500"
              :style="{ width: `${shiftElapsedPercent}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Banner Pemberitahuan Status Hari Ini / Tanggal Target (Berdasarkan Tanggal Aktual Produksi) -->
    <div
      v-if="kpiMetrics.totalRolls === 0 && selectedFrequency === 'DAY'"
      class="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs anim-enter-2"
    >
      <div class="flex items-start gap-2.5">
        <span class="text-xl">ℹ️</span>
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
        @click="stepPrevDay"
        class="shrink-0 px-3 py-1.5 bg-amber-200/90 hover:bg-amber-300 text-amber-950 border border-amber-300/80 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs active:scale-95"
      >
        <span>◀</span>
        <span>Cek Produksi Sebelumnya</span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- 3. ROW TENGAH: DIAGRAM GARIS MULTI-METRIK & TAB MESIN / DONAT OPERATOR   -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 anim-enter-3">
      
      <!-- KIRI: DIAGRAM GARIS (TOTAL ROLL, PASS, HOLD, REJECT) - SPAN 7 KOLOM -->
      <div class="lg:col-span-7 bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <!-- Header Diagram Garis -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="text-sm sm:text-base font-black text-zinc-950">TREN KOMPARASI HASIL PRODUKSI</span>
                <span class="px-2 py-0.5 rounded-md text-[9.5px] font-black bg-zinc-900 text-white font-mono uppercase">
                  {{ activePeriodSubtitle }}
                </span>
              </div>
              <p class="text-[11px] text-zinc-500 font-medium mt-0.5">
                Perbandingan volume total roll, mutu PASS, karantina HOLD, dan afval REJECT.
              </p>
            </div>

            <!-- Custom Legend Badges (Click to Toggle On / Off) -->
            <div class="flex items-center gap-1.5 sm:gap-2 text-[11px] font-mono font-bold flex-wrap">
              <button
                @click="toggleDataset('total')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none',
                  chartVisibility.total
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through opacity-60'
                ]"
                title="Klik untuk tampilkan / sembunyikan grafik Total"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.total ? 'bg-white' : 'bg-zinc-400'"></span>
                <span>Total</span>
              </button>
              <button
                @click="toggleDataset('pass')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none',
                  chartVisibility.pass
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through opacity-60'
                ]"
                title="Klik untuk tampilkan / sembunyikan grafik Pass"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.pass ? 'bg-emerald-500' : 'bg-zinc-400'"></span>
                <span>Pass</span>
              </button>
              <button
                @click="toggleDataset('hold')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none',
                  chartVisibility.hold
                    ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through opacity-60'
                ]"
                title="Klik untuk tampilkan / sembunyikan grafik Hold"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.hold ? 'bg-amber-500' : 'bg-zinc-400'"></span>
                <span>Hold</span>
              </button>
              <button
                @click="toggleDataset('reject')"
                type="button"
                :class="[
                  'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer select-none',
                  chartVisibility.reject
                    ? 'bg-red-50 text-red-800 border-red-300 shadow-2xs'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-200 line-through opacity-60'
                ]"
                title="Klik untuk tampilkan / sembunyikan grafik Reject"
              >
                <span class="w-2 h-2 rounded-full" :class="chartVisibility.reject ? 'bg-red-500' : 'bg-zinc-400'"></span>
                <span>Reject</span>
              </button>
            </div>
          </div>

          <!-- Quick Metric Highlights on Top of Chart (Also Clickable) -->
          <div class="grid grid-cols-4 gap-2 my-3 text-center font-mono">
            <div
              @click="toggleDataset('total')"
              class="p-2 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] select-none"
              :class="chartVisibility.total ? 'bg-zinc-50 border-zinc-300 shadow-2xs' : 'bg-zinc-100/50 border-zinc-200 opacity-50'"
              title="Klik untuk on/off garis Total"
            >
              <span class="text-[9.5px] text-zinc-500 block font-bold uppercase">Total</span>
              <span class="text-base font-black text-zinc-950">{{ formatNum(kpiMetrics.totalRolls) }}</span>
            </div>
            <div
              @click="toggleDataset('pass')"
              class="p-2 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] select-none"
              :class="chartVisibility.pass ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs' : 'bg-zinc-100/50 border-zinc-200 opacity-50'"
              title="Klik untuk on/off garis Pass"
            >
              <span class="text-[9.5px] text-emerald-700 block font-bold uppercase">Pass</span>
              <span class="text-base font-black text-emerald-800">{{ formatNum(kpiMetrics.passCount) }}</span>
            </div>
            <div
              @click="toggleDataset('hold')"
              class="p-2 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] select-none"
              :class="chartVisibility.hold ? 'bg-amber-50/70 border-amber-300 shadow-2xs' : 'bg-zinc-100/50 border-zinc-200 opacity-50'"
              title="Klik untuk on/off garis Hold"
            >
              <span class="text-[9.5px] text-amber-700 block font-bold uppercase">Hold</span>
              <span class="text-base font-black text-amber-800">{{ formatNum(kpiMetrics.holdCount) }}</span>
            </div>
            <div
              @click="toggleDataset('reject')"
              class="p-2 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] select-none"
              :class="chartVisibility.reject ? 'bg-red-50/70 border-red-300 shadow-2xs' : 'bg-zinc-100/50 border-zinc-200 opacity-50'"
              title="Klik untuk on/off garis Reject"
            >
              <span class="text-[9.5px] text-red-700 block font-bold uppercase">Reject</span>
              <span class="text-base font-black text-red-800">{{ formatNum(kpiMetrics.rejectCount) }}</span>
            </div>
          </div>

          <!-- Canvas Chart -->
          <div class="h-60 sm:h-68 relative w-full mt-1">
            <canvas ref="lineComparisonChartCanvas"></canvas>
          </div>
        </div>

        <div class="pt-2.5 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <span>* Periode ditampilkan: <strong>{{ activePeriodSubtitle }}</strong></span>
          <span class="text-zinc-600 font-bold">Sinkronisasi Otomatis</span>
        </div>
      </div>

      <!-- KANAN: TAB MESIN & DIAGRAM DONAT OPERATOR - SPAN 5 KOLOM -->
      <div class="lg:col-span-5 bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col justify-between">
        <div>
          <!-- Header & Machine Tabs -->
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 pb-3">
            <div>
              <h2 class="text-sm sm:text-base font-black text-zinc-950">MUTU & HASIL PER OPERATOR</h2>
              <p class="text-[11px] text-zinc-500 font-medium">Distribusi persen Pass, Hold, dan Reject.</p>
            </div>

            <!-- Machine Tab Buttons (Slitting, Rewind, Casting) -->
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
                <span>{{ tab.icon }}</span>
                <span>{{ tab.label }}</span>
              </button>
            </div>
          </div>

          <!-- Operator Donut Cards List -->
          <div class="mt-3 space-y-3 max-h-[320px] overflow-y-auto pr-1">
            <div
              v-for="op in operatorQualityStats"
              :key="op.name"
              class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200/90 hover:border-zinc-300 transition-all flex items-center justify-between gap-3"
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
              <div class="text-sm text-zinc-600 font-bold">🏭 Tidak ada output produksi mesin {{ selectedMachineTab }} pada {{ activePeriodSubtitle }}.</div>
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
                    <span>👤</span>
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

    <!-- ========================================================================= -->
    <!-- 4. BLOK MEMANJANG: TIMELINE SPK (ATAS: REALISASI, BAWAH: PLANNING)       -->
    <!-- ========================================================================= -->
    <div class="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-3 anim-enter-4">
      
      <!-- Header Timeline -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-zinc-100 pb-3">
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <span class="text-sm sm:text-base font-black text-zinc-950">TIMELINE PELACAKAN SPK (REALISASI & PLANNING)</span>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 font-mono">
              {{ timelineSpkList.length }} SPK TERJADWAL
            </span>
            <div v-if="spkStore.activeBatch" class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[10.5px] font-black">
              <span class="relative flex h-2 w-2">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span>ACUAN: {{ spkStore.activeBatch.batchName }}</span>
            </div>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium mt-0.5">
            Bagian atas: <strong>Realisasi Aktual</strong> • Bagian bawah: <strong>Target Planning</strong>. Klik kartu untuk melihat modal informasi lengkap.
          </p>
        </div>

        <router-link
          to="/spk"
          class="px-3 py-1 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-mono font-bold text-xs flex items-center gap-1 transition-colors"
        >
          <span>Buka Manajemen SPK ➔</span>
        </router-link>
      </div>

      <!-- Horizontal Connecting Timeline Flow (Atas: Realisasi, Tengah: Line & Node, Bawah: Planning) -->
      <div class="relative overflow-x-auto py-2 px-3 scrollbar-thin">
        <div class="min-w-[940px] flex items-center justify-between relative py-2">
          
          <!-- Background Center Track Line (Runs horizontally between nodes, z-0) -->
          <div class="absolute top-1/2 left-12 right-12 -translate-y-1/2 h-1 bg-zinc-200 z-0"></div>
          <!-- Active Progress Line with Looping Gradient Flow -->
          <div class="absolute top-1/2 left-12 right-1/4 -translate-y-1/2 h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-400 z-0 anim-gradient-flow"></div>

          <!-- Nodes Loop -->
          <div
            v-for="(spk, idx) in timelineSpkList"
            :key="spk.spkNo"
            class="relative z-10 flex flex-col items-center w-48 sm:w-56 px-2"
          >
            <!-- ═══════════════════════════════════════════════ -->
            <!-- 1. BAGIAN ATAS: REALISASI (AKTUAL OUTPUT)     -->
            <!-- ═══════════════════════════════════════════════ -->
            <div
              @click="openSpkModal(spk, 'REALISASI')"
              class="w-full bg-white hover:bg-emerald-50/60 p-2.5 rounded-xl border border-zinc-200 hover:border-emerald-400 shadow-2xs hover:shadow-md transition-all cursor-pointer text-center relative z-10 group/top"
              :class="spk.targetStatus ? spk.targetStatus.borderClass : ''"
              title="Klik untuk info realisasi"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <span
                  v-if="spk.targetStatus"
                  class="px-1.5 py-0.2 rounded text-[8.5px] font-black uppercase font-mono border"
                  :class="spk.targetStatus.badgeClass"
                >
                  {{ spk.targetStatus.icon }} {{ spk.targetStatus.label }}
                </span>
                <span v-else class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono bg-emerald-100 text-emerald-800">
                  ⚡ REALISASI
                </span>
                <span :class="[
                  'px-1.5 py-0.2 rounded text-[9.5px] font-bold font-mono',
                  spk.status === 'DONE' ? 'text-emerald-700 font-black' :
                  spk.status === 'RUNNING' ? 'text-blue-700 font-black' : 'text-zinc-500'
                ]">
                  {{ spk.percent }}%
                </span>
              </div>
              <div class="text-xs font-black font-mono text-zinc-900 truncate">
                {{ formatNum(spk.actualRoll) }} Roll Selesai
              </div>
              <div class="text-[10px] text-zinc-500 font-mono mt-0.5">
                {{ formatNum(spk.actualMeter) }} m • {{ formatNum(spk.actualKg) }} kg
              </div>
              <!-- Tanggal & Jam Mulai / Selesai -->
              <div class="text-[9px] text-zinc-500 font-mono mt-1 pt-1 border-t border-zinc-100 flex items-center justify-center gap-1 truncate">
                <span title="Waktu Mulai">🕒 {{ spk.startTimeFormatted || '-' }}</span>
                <span class="text-zinc-300">➔</span>
                <span title="Waktu Selesai">🏁 {{ spk.endTimeFormatted || '-' }}</span>
              </div>
            </div>

            <!-- Vertical Connector Atas ke Tengah (Line) -->
            <div class="w-0.5 h-3 bg-zinc-300 transition-colors z-0"></div>

            <!-- ═══════════════════════════════════════════════ -->
            <!-- 2. BAGIAN TENGAH: NODE CIRCLE (MARKER)        -->
            <!-- ═══════════════════════════════════════════════ -->
            <div
              @click="openSpkModal(spk, 'ALL')"
              :class="[
                'w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono font-black text-[11px] transition-all shadow-sm hover:scale-110 z-10 cursor-pointer',
                spk.status === 'DONE' ? 'bg-emerald-500 border-white text-white ring-4 ring-emerald-100' :
                spk.status === 'RUNNING' ? 'bg-blue-600 border-white text-white ring-4 ring-blue-100 animate-pulse' :
                spk.status === 'WARNING' ? 'bg-amber-500 border-white text-white ring-4 ring-amber-100' :
                'bg-white border-zinc-300 text-zinc-600 ring-4 ring-zinc-50'
              ]"
              :title="'Klik untuk detail SPK: ' + spk.spkNo"
            >
              <span v-if="spk.status === 'DONE'">✓</span>
              <span v-else-if="spk.status === 'RUNNING'">▶</span>
              <span v-else>{{ idx + 1 }}</span>
            </div>

            <!-- Vertical Connector Tengah ke Bawah (Line) -->
            <div class="w-0.5 h-3 bg-zinc-300 transition-colors z-0"></div>

            <!-- ═══════════════════════════════════════════════ -->
            <!-- 3. BAGIAN BAWAH: PLANNING (RENCANA TARGET)    -->
            <!-- ═══════════════════════════════════════════════ -->
            <div
              @click="openSpkModal(spk, 'PLANNING')"
              class="w-full bg-white hover:bg-amber-50/60 p-2.5 rounded-xl border border-zinc-200 hover:border-amber-400 shadow-2xs hover:shadow-md transition-all cursor-pointer text-center relative z-10 group/bottom"
              title="Klik untuk info planning"
            >
              <div class="flex items-center justify-between gap-1 mb-1">
                <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase font-mono bg-amber-100 text-amber-900">
                  📋 PLANNING
                </span>
                <span class="text-[9.5px] font-mono text-zinc-500 font-bold">
                  {{ spk.formula }} ({{ spk.thickness }}μ)
                </span>
              </div>
              <div class="text-xs font-black font-mono text-zinc-900 truncate" :title="spk.spkNo">
                {{ spk.spkNo }}
              </div>
              <div class="text-[10px] text-zinc-500 font-mono mt-0.5">
                Target: <strong>{{ formatNum(spk.planRoll) }} Roll</strong> ({{ formatNum(spk.planMeter) }} m)
              </div>
            </div>

          </div>

          <!-- Empty Timeline State -->
          <div v-if="timelineSpkList.length === 0" class="w-full text-center py-6 text-zinc-400 text-xs font-mono">
            Belum ada SPK aktif yang terdata pada jadwal kerja saat ini.
          </div>

        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 5. BLOK KONDISI STOK IMS: 3 KRITERIA & 3 SATUAN KUANTITAS                 -->
    <!-- ========================================================================= -->
    <div class="bg-white border border-zinc-200 rounded-3xl p-4 sm:p-5 shadow-xs space-y-4 anim-enter-4">
      
      <!-- Header Stok & Filter Kriteria & Satuan -->
      <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3 border-b border-zinc-100 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-sm sm:text-base font-black text-zinc-950">KONDISI STOK GUDANG (ACUAN MENU IMS)</span>
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
          <span>📦 Kelola di Menu IMS ➔</span>
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

    <!-- ========================================================================= -->
    <!-- 6. MODAL KECIL INFORMASI SPK (PLANNING VS REALISASI)                      -->
    <!-- ========================================================================= -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition duration-100 ease-in"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showSpkModal && selectedSpkModal"
          class="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans"
          @click.self="showSpkModal = false"
        >
          <div class="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="p-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-red-600 text-white">
                    DETAIL SPK
                  </span>
                  <h3 class="text-sm sm:text-base font-black font-mono tracking-tight">{{ selectedSpkModal.spkNo }}</h3>
                </div>
                <p class="text-[11px] text-zinc-400 mt-0.5 font-mono">
                  Formula: {{ selectedSpkModal.formula }} ({{ selectedSpkModal.thickness }}μ) • Dokumen: {{ selectedSpkModal.docNo || '3B-PROD' }}
                </p>
              </div>

              <button
                @click="showSpkModal = false"
                class="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Modal Body: 2 Columns (Planning vs Realisasi) -->
            <div class="p-4 space-y-3">
              
              <!-- Status Target & Waktu Pengerjaan -->
              <div
                v-if="selectedSpkModal.targetStatus"
                class="p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono font-bold"
                :class="[selectedSpkModal.targetStatus.badgeClass, selectedSpkModal.targetStatus.borderClass]"
              >
                <div class="flex items-center gap-1.5">
                  <span class="text-base">{{ selectedSpkModal.targetStatus.icon }}</span>
                  <span>Status: {{ selectedSpkModal.targetStatus.label }}</span>
                </div>
                <div class="text-[11px] font-normal flex items-center gap-3">
                  <span>🕒 Mulai: <strong class="font-bold">{{ selectedSpkModal.startTimeFormatted || '-' }}</strong></span>
                  <span>🏁 Selesai: <strong class="font-bold">{{ selectedSpkModal.endTimeFormatted || '-' }}</strong></span>
                </div>
              </div>

              <!-- Status & Achievement Bar -->
              <div class="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
                <div class="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span class="font-bold text-zinc-600">Pencapaian SPK:</span>
                  <span :class="[
                    'font-black px-2 py-0.5 rounded text-[10.5px]',
                    selectedSpkModal.status === 'DONE' ? 'bg-emerald-100 text-emerald-800' :
                    selectedSpkModal.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' : 'bg-zinc-200 text-zinc-700'
                  ]">
                    {{ selectedSpkModal.percent }}% ({{ selectedSpkModal.status }})
                  </span>
                </div>
                <div class="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                  <div
                    :class="[
                      'h-full rounded-full transition-all duration-500',
                      selectedSpkModal.status === 'DONE' ? 'bg-emerald-500' : 'bg-blue-600'
                    ]"
                    :style="{ width: `${selectedSpkModal.percent}%` }"
                  ></div>
                </div>
              </div>

              <!-- 2 Cards Grid -->
              <div class="grid grid-cols-2 gap-3 text-xs font-mono">
                
                <!-- Kiri: PLANNING -->
                <div class="p-3 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div class="font-black text-amber-900 border-b border-amber-200/70 pb-1 flex items-center justify-between">
                    <span>📋 PLANNING</span>
                    <span class="text-[10px] text-amber-700">TARGET</span>
                  </div>
                  <div class="space-y-1 text-zinc-700 text-[11px]">
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Target Roll:</span>
                      <strong class="text-zinc-900">{{ formatNum(selectedSpkModal.planRoll) }} Roll</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Target Meter:</span>
                      <strong class="text-zinc-900">{{ formatNum(selectedSpkModal.planMeter) }} m</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Jumbo Roll:</span>
                      <strong class="text-zinc-900">{{ selectedSpkModal.planJumbo }} JR</strong>
                    </div>
                  </div>
                </div>

                <!-- Kanan: REALISASI -->
                <div class="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2">
                  <div class="font-black text-emerald-900 border-b border-emerald-200/70 pb-1 flex items-center justify-between">
                    <span>⚡ REALISASI</span>
                    <span class="text-[10px] text-emerald-700">AKTUAL</span>
                  </div>
                  <div class="space-y-1 text-zinc-700 text-[11px]">
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Roll Jadi:</span>
                      <strong class="text-emerald-800 font-black">{{ formatNum(selectedSpkModal.actualRoll) }} Roll</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Meter Aktual:</span>
                      <strong class="text-zinc-900">{{ formatNum(selectedSpkModal.actualMeter) }} m</strong>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-zinc-500">Berat Aktual:</span>
                      <strong class="text-zinc-900">{{ formatNum(selectedSpkModal.actualKg) }} kg</strong>
                    </div>
                  </div>
                </div>

              </div>

              <!-- QC Mutu Rincian -->
              <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px] font-mono">
                <span class="text-zinc-500 font-bold">Kualitas Hasil (QC):</span>
                <div class="flex items-center gap-2 font-bold">
                  <span class="text-emerald-700">{{ selectedSpkModal.passCount }} Pass</span>
                  <span>•</span>
                  <span class="text-amber-700">{{ selectedSpkModal.holdCount }} Hold</span>
                  <span>•</span>
                  <span class="text-red-700">{{ selectedSpkModal.rejectCount }} Rej</span>
                </div>
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="p-3 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <router-link
                to="/spk"
                class="text-xs font-mono font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <span>Buka di Menu SPK ➔</span>
              </router-link>
              <button
                @click="showSpkModal = false"
                class="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-black text-white font-mono font-bold text-xs cursor-pointer"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- ========================================================================= -->
    <!-- 7. MODAL INTERAKTIF: DRILL-DOWN RINCIAN STOK DESKRIPSI NAV               -->
    <!-- ========================================================================= -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="showStockModal"
          class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none font-sans"
          @click.self="showStockModal = false"
        >
          <div class="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded-lg bg-red-600 text-white font-mono font-black text-xs">
                    {{ selectedStockCategory?.key || 'DETAIL STOK' }}
                  </span>
                  <h2 class="text-base sm:text-lg font-black text-zinc-950">
                    DETAIL STOK IMS BERDASARKAN DESKRIPSI NAV
                  </h2>
                </div>
                <p class="text-xs text-zinc-500 font-medium mt-0.5">
                  Dikelompokkan otomatis berdasarkan spesifikasi resmi Deskripsi NAV dari sesi aktif menu Stok Gudang (IMS).
                </p>
              </div>

              <button
                @click="showStockModal = false"
                class="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center font-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Modal Search Bar -->
            <div class="p-3.5 border-b border-zinc-100 bg-white flex items-center justify-between gap-3">
              <div class="relative flex-1">
                <span class="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
                <input
                  v-model="modalSearchQuery"
                  type="text"
                  placeholder="Cari deskripsi NAV, formula, source no, rak penyimpanan..."
                  class="w-full pl-8 pr-4 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <!-- Modal Table -->
            <div class="p-4 overflow-y-auto max-h-[58vh] space-y-3">
              <div
                v-for="group in groupedNavItems"
                :key="group.descNav"
                class="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
              >
                <div class="p-2.5 bg-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
                  <span class="font-black text-xs font-mono text-zinc-900">{{ group.descNav }}</span>
                  <span class="font-bold text-xs font-mono text-emerald-800">{{ formatNum(group.totalRolls) }} Roll • {{ formatNum(group.totalKg) }} kg</span>
                </div>
                <table class="w-full text-left text-[11px] font-mono">
                  <thead class="bg-zinc-100/50 text-[9.5px] text-zinc-500 uppercase">
                    <tr>
                      <th class="p-2">Tipe</th>
                      <th class="p-2">Source / Roll No</th>
                      <th class="p-2">Dimensi</th>
                      <th class="p-2 text-right">Kuantitas Roll</th>
                      <th class="p-2 text-right">Panjang (m)</th>
                      <th class="p-2 text-right">Berat (kg)</th>
                      <th class="p-2">Lokasi Rak</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-100">
                    <tr v-for="it in group.items" :key="it.id" class="hover:bg-zinc-50">
                      <td class="p-2">
                        <span :class="['px-1.5 py-0.2 rounded text-[9px] font-bold', it.stockType === 'FG' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800']">
                          {{ it.stockType === 'FG' ? 'FG IMS' : 'JUMBO WIP' }}
                        </span>
                      </td>
                      <td class="p-2 font-bold text-zinc-900">{{ it.sourceNo }}</td>
                      <td class="p-2">{{ it.thick }}μ × {{ it.width }} mm</td>
                      <td class="p-2 text-right font-black">{{ formatNum(it.totalRoll) }}</td>
                      <td class="p-2 text-right">{{ formatNum(it.totalPanjang) }}</td>
                      <td class="p-2 text-right font-bold text-red-600">{{ formatNum(it.totalKg) }}</td>
                      <td class="p-2">{{ it.listRak || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Modal Footer -->
            <div class="p-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span class="text-[11px] text-zinc-400 font-mono">PT. Saptawarna Cemerlang — Inventory Control</span>
              <button
                @click="showStockModal = false"
                class="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-bold text-xs cursor-pointer"
              >
                Tutup Jendela
              </button>
            </div>

          </div>
        </div>
      </Transition>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useConfigStore } from '@/stores/configStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useSpkStore, evaluateTargetStatus } from '@/stores/spkStore';
import { useWipStore } from '@/stores/wipStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import { parseDateToIso, extractDateFromLot } from '@/services/dataRollParserService';
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
  { key: 'ALL', label: '🌐 Semua' },
  { key: 'CUSTOM', label: '📅 Custom' }
];

const selectedFrequency = ref('DAY');
const dayOffset = ref(0); // 0 = Hari ini, -1 = Kemarin (H-1), -2 = 2 hari lalu (H-2), dst.
const customStartDate = ref('');
const customEndDate = ref('');
const isDashboardLoading = ref(true);

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
  updateLineChart();
};

const onCustomDateChange = () => {
  updateLineChart();
};

// Stepper mundur ke hari sebelumnya berkali-kali
const stepPrevDay = () => {
  dayOffset.value--;
  selectedFrequency.value = 'DAY';
  updateLineChart();
};

// Stepper maju ke hari berikutnya
const stepNextDay = () => {
  if (dayOffset.value < 0) {
    dayOffset.value++;
    selectedFrequency.value = 'DAY';
    updateLineChart();
  }
};

// Reset kembali ke Hari Ini
const resetToToday = () => {
  dayOffset.value = 0;
  selectedFrequency.value = 'DAY';
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

const activePeriodSubtitle = computed(() => {
  const targetIso = activeTargetDateIso.value; // YYYY-MM-DD
  const cur = new Date(targetIso);

  if (selectedFrequency.value === 'DAY') {
    return activeTargetDateDisplay.value;
  } else if (selectedFrequency.value === 'WEEK') {
    const start = new Date(cur);
    start.setDate(cur.getDate() - 7);
    return `Minggu Ini (${formatDateIndo(start)} - ${formatDateIndo(cur)})`;
  } else if (selectedFrequency.value === 'MONTH') {
    const start = new Date(cur.getFullYear(), cur.getMonth(), 1);
    const end = new Date(cur.getFullYear(), cur.getMonth() + 1, 0);
    return `Bulan Ini (${formatDateIndo(start)} - ${formatDateIndo(end)})`;
  } else if (selectedFrequency.value === '3MONTH') {
    const start = new Date(cur);
    start.setMonth(cur.getMonth() - 3);
    return `3 Bulan (${formatDateIndo(start)} - ${formatDateIndo(cur)})`;
  } else if (selectedFrequency.value === '6MONTH') {
    const start = new Date(cur);
    start.setMonth(cur.getMonth() - 6);
    return `6 Bulan (${formatDateIndo(start)} - ${formatDateIndo(cur)})`;
  } else if (selectedFrequency.value === 'YEAR') {
    const start = new Date(cur);
    start.setFullYear(cur.getFullYear() - 1);
    return `1 Tahun Terakhir (${formatDateIndo(start)} - ${formatDateIndo(cur)})`;
  } else if (selectedFrequency.value === 'ALL') {
    return `Semua Periode (${formatNum(filteredLabels.value.length)} Roll Terdata)`;
  } else if (selectedFrequency.value === 'CUSTOM') {
    if (customStartDate.value && customEndDate.value) {
      return `Custom (${formatDateIndo(customStartDate.value)} s/d ${formatDateIndo(customEndDate.value)})`;
    } else if (customStartDate.value) {
      return `Custom (Mulai ${formatDateIndo(customStartDate.value)})`;
    } else if (customEndDate.value) {
      return `Custom (Sampai ${formatDateIndo(customEndDate.value)})`;
    }
    return 'Custom (Tentukan Rentang Tanggal)';
  }
  const found = frequencyOptions.find(f => f.key === selectedFrequency.value);
  return found ? found.label : 'Periode';
});

// Gabungan seluruh roll produksi (baik dari Data Roll Excel yang di-upload maupun dari DE Report & Label)
const allProductionRolls = computed(() => {
  // dataRollStore.rolls sudah menggabungkan explicitRolls (Excel) dan deRolls (DE Report / Label)
  if (dataRollStore.rolls && dataRollStore.rolls.length > 0) {
    return dataRollStore.rolls;
  }
  return labelStore.labels || [];
});

// Helper: Mengambil tanggal nyata barang diproduksi (BUKAN tanggal upload file / createdAt)
const getRealProductionDate = (item) => {
  if (!item) return '';

  // 1. Cek tanggalFormatted / tanggal eksplisit dari file Excel atau input produksi
  const rawTanggal = item.tanggalFormatted || item.tanggal || item.date || item.tgl;
  if (rawTanggal) {
    if (typeof rawTanggal === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawTanggal.trim())) {
      return rawTanggal.trim();
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
    const iso = parseDateToIso(ts);
    if (iso && /^\d{4}-\d{2}-\d{2}/.test(iso)) {
      return String(iso).slice(0, 10);
    }
  }

  return '';
};

// Helper penentuan apakah rekaman berada dalam rentang frekuensi / tanggal target
const isDateInFrequency = (prodDateStr) => {
  if (selectedFrequency.value === 'ALL') {
    return true; // Tampilkan seluruh roll tanpa filter tanggal!
  }

  if (!prodDateStr) return false;
  try {
    const targetIso = activeTargetDateIso.value; // Format YYYY-MM-DD
    const itemIso = String(prodDateStr).slice(0, 10);

    if (selectedFrequency.value === 'DAY') {
      return itemIso === targetIso;
    } else if (selectedFrequency.value === 'WEEK') {
      const now = new Date(targetIso);
      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);
      const itemDate = new Date(itemIso);
      return itemDate >= oneWeekAgo && itemDate <= now;
    } else if (selectedFrequency.value === 'MONTH') {
      const parts = targetIso.split('-');
      const itemParts = itemIso.split('-');
      return itemParts[0] === parts[0] && itemParts[1] === parts[1];
    } else if (selectedFrequency.value === '3MONTH') {
      const cur = new Date(targetIso);
      const threeMonthsAgo = new Date(cur);
      threeMonthsAgo.setMonth(cur.getMonth() - 3);
      const itemDate = new Date(itemIso);
      return itemDate >= threeMonthsAgo && itemDate <= cur;
    } else if (selectedFrequency.value === '6MONTH') {
      const cur = new Date(targetIso);
      const sixMonthsAgo = new Date(cur);
      sixMonthsAgo.setMonth(cur.getMonth() - 6);
      const itemDate = new Date(itemIso);
      return itemDate >= sixMonthsAgo && itemDate <= cur;
    } else if (selectedFrequency.value === 'YEAR') {
      const cur = new Date(targetIso);
      const oneYearAgo = new Date(cur);
      oneYearAgo.setFullYear(cur.getFullYear() - 1);
      const itemDate = new Date(itemIso);
      const parts = targetIso.split('-');
      const itemParts = itemIso.split('-');
      return itemParts[0] === parts[0] || (itemDate >= oneYearAgo && itemDate <= cur);
    } else if (selectedFrequency.value === 'CUSTOM') {
      if (!customStartDate.value && !customEndDate.value) return true;
      if (customStartDate.value && itemIso < customStartDate.value) return false;
      if (customEndDate.value && itemIso > customEndDate.value) return false;
      return true;
    }
  } catch (_) {
    return false;
  }
  return false;
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
// 4. DIAGRAM GARIS: KOMPARASI TOTAL ROLL, PASS, HOLD, REJECT
// =========================================================================
const lineComparisonChartCanvas = ref(null);
let lineComparisonChartInstance = null;

const generateLineChartData = () => {
  const list = filteredLabels.value;
  let labels = [];
  let totalData = [];
  let passData = [];
  let holdData = [];
  let rejectData = [];

  if (selectedFrequency.value === 'DAY') {
    // 2-Hourly Intervals of production day (07:00 to 05:00)
    labels = ['07:00', '09:00', '11:00', '13:00', '15:00', '17:00', '19:00', '21:00', '23:00', '01:00', '03:00', '05:00'];
    const buckets = labels.map(() => ({ total: 0, pass: 0, hold: 0, reject: 0 }));

    for (const item of list) {
      const timeStr = item.verifiedAt || item.createdAt;
      let hour = 9;
      if (timeStr) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
          hour = d.getHours();
        }
      }
      let bucketIdx = Math.floor(((hour - 7 + 24) % 24) / 2);
      if (bucketIdx < 0 || bucketIdx >= 12) bucketIdx = 0;
      buckets[bucketIdx].total++;
      const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
      if (st === 'HOLD') buckets[bucketIdx].hold++;
      else if (st === 'REJECT' || st === 'NG') buckets[bucketIdx].reject++;
      else buckets[bucketIdx].pass++;
    }

    totalData = buckets.map(b => b.total);
    passData = buckets.map(b => b.pass);
    holdData = buckets.map(b => b.hold);
    rejectData = buckets.map(b => b.reject);

  } else if (selectedFrequency.value === 'WEEK') {
    labels = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
    const buckets = labels.map(() => ({ total: 0, pass: 0, hold: 0, reject: 0 }));

    for (const item of list) {
      const prodDate = getRealProductionDate(item);
      if (prodDate) {
        const d = new Date(prodDate);
        if (!isNaN(d.getTime())) {
          const dayIdx = (d.getDay() + 6) % 7;
          buckets[dayIdx].total++;
          const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
          if (st === 'HOLD') buckets[dayIdx].hold++;
          else if (st === 'REJECT' || st === 'NG') buckets[dayIdx].reject++;
          else buckets[dayIdx].pass++;
        }
      }
    }

    totalData = buckets.map(b => b.total);
    passData = buckets.map(b => b.pass);
    holdData = buckets.map(b => b.hold);
    rejectData = buckets.map(b => b.reject);

  } else if (selectedFrequency.value === 'CUSTOM') {
    // Custom date interval breakdown
    const startStr = customStartDate.value || (list.length > 0 ? getRealProductionDate(list[0]) : '');
    const endStr = customEndDate.value || (list.length > 0 ? getRealProductionDate(list[list.length - 1]) : '');

    let startDate = startStr ? new Date(startStr) : new Date();
    let endDate = endStr ? new Date(endStr) : new Date();
    if (startDate > endDate) {
      const temp = startDate;
      startDate = endDate;
      endDate = temp;
    }

    const diffDays = Math.max(1, Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    if (diffDays <= 14) {
      labels = [];
      const buckets = [];
      const cur = new Date(startDate);
      while (cur <= endDate) {
        const yr = cur.getFullYear();
        const mo = String(cur.getMonth() + 1).padStart(2, '0');
        const da = String(cur.getDate()).padStart(2, '0');
        const iso = `${yr}-${mo}-${da}`;
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        const dayLabel = `${cur.getDate()} ${months[cur.getMonth()]}`;
        labels.push(dayLabel);
        buckets.push({ iso, total: 0, pass: 0, hold: 0, reject: 0 });
        cur.setDate(cur.getDate() + 1);
      }

      for (const item of list) {
        const prodDate = getRealProductionDate(item);
        const b = buckets.find(bk => bk.iso === prodDate);
        if (b) {
          b.total++;
          const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
          if (st === 'HOLD') b.hold++;
          else if (st === 'REJECT' || st === 'NG') b.reject++;
          else b.pass++;
        }
      }

      totalData = buckets.map(b => b.total);
      passData = buckets.map(b => b.pass);
      holdData = buckets.map(b => b.hold);
      rejectData = buckets.map(b => b.reject);
    } else {
      const numBuckets = Math.min(diffDays, 8);
      labels = [];
      const buckets = [];
      const interval = Math.ceil(diffDays / numBuckets);

      for (let i = 0; i < numBuckets; i++) {
        const bStart = new Date(startDate);
        bStart.setDate(startDate.getDate() + i * interval);
        const bEnd = new Date(bStart);
        bEnd.setDate(bStart.getDate() + interval - 1);
        if (bEnd > endDate) bEnd.setTime(endDate.getTime());
        const label = `${bStart.getDate()}/${bStart.getMonth() + 1} - ${bEnd.getDate()}/${bEnd.getMonth() + 1}`;
        labels.push(label);
        buckets.push({
          startMs: bStart.getTime(),
          endMs: bEnd.getTime() + 86400000,
          total: 0,
          pass: 0,
          hold: 0,
          reject: 0
        });
      }

      for (const item of list) {
        const prodDate = getRealProductionDate(item);
        if (prodDate) {
          const t = new Date(prodDate).getTime();
          const b = buckets.find(bk => t >= bk.startMs && t < bk.endMs);
          if (b) {
            b.total++;
            const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
            if (st === 'HOLD') b.hold++;
            else if (st === 'REJECT' || st === 'NG') b.reject++;
            else b.pass++;
          }
        }
      }

      totalData = buckets.map(b => b.total);
      passData = buckets.map(b => b.pass);
      holdData = buckets.map(b => b.hold);
      rejectData = buckets.map(b => b.reject);
    }

  } else {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const curMonth = new Date().getMonth();
    const curYear = new Date().getFullYear();

    let targetMonthDefs = []; // Array of { label, year, month }

    if (selectedFrequency.value === '3MONTH') {
      for (let i = 2; i >= 0; i--) {
        const d = new Date(curYear, curMonth - i, 1);
        targetMonthDefs.push({
          label: monthNames[d.getMonth()],
          year: d.getFullYear(),
          month: d.getMonth()
        });
      }
    } else if (selectedFrequency.value === '6MONTH') {
      for (let i = 5; i >= 0; i--) {
        const d = new Date(curYear, curMonth - i, 1);
        targetMonthDefs.push({
          label: monthNames[d.getMonth()],
          year: d.getFullYear(),
          month: d.getMonth()
        });
      }
    } else if (selectedFrequency.value === 'MONTH') {
      labels = ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4', 'Mgg 5'];
    } else if (selectedFrequency.value === 'ALL') {
      // Group distinct YYYY-MM in dataset or last 12 months
      const distinctYm = [...new Set(list.map(it => {
        const p = getRealProductionDate(it);
        return p && /^\d{4}-\d{2}/.test(p) ? p.slice(0, 7) : null;
      }).filter(Boolean))].sort();

      if (distinctYm.length > 0) {
        const sliceYm = distinctYm.length > 12 ? distinctYm.slice(-12) : distinctYm;
        for (const ym of sliceYm) {
          const [y, m] = ym.split('-').map(Number);
          targetMonthDefs.push({
            label: `${monthNames[m - 1]} '${String(y).slice(2)}`,
            year: y,
            month: m - 1
          });
        }
      } else {
        targetMonthDefs = monthNames.map((m, idx) => ({ label: m, year: curYear, month: idx }));
      }
    } else {
      // 1 YEAR (12 Months rolling)
      for (let i = 11; i >= 0; i--) {
        const d = new Date(curYear, curMonth - i, 1);
        targetMonthDefs.push({
          label: monthNames[d.getMonth()],
          year: d.getFullYear(),
          month: d.getMonth()
        });
      }
    }

    if (targetMonthDefs.length > 0) {
      labels = targetMonthDefs.map(t => t.label);
    } else if (labels.length === 0) {
      labels = monthNames;
    }

    const buckets = labels.map(() => ({ total: 0, pass: 0, hold: 0, reject: 0 }));

    for (const item of list) {
      const prodDate = getRealProductionDate(item);
      if (prodDate) {
        const d = new Date(prodDate);
        if (!isNaN(d.getTime())) {
          let bIdx = -1;
          if (selectedFrequency.value === 'MONTH') {
            bIdx = Math.min(4, Math.floor((d.getDate() - 1) / 7));
          } else if (targetMonthDefs.length > 0) {
            bIdx = targetMonthDefs.findIndex(t => t.month === d.getMonth() && (selectedFrequency.value === 'ALL' || t.year === d.getFullYear()));
            if (bIdx === -1) {
              bIdx = targetMonthDefs.findIndex(t => t.month === d.getMonth());
            }
          } else {
            bIdx = d.getMonth() % labels.length;
          }

          if (bIdx >= 0 && bIdx < buckets.length) {
            buckets[bIdx].total++;
            const st = String(item.qualityStatus || item.status || 'PASS').toUpperCase();
            if (st === 'HOLD') buckets[bIdx].hold++;
            else if (st === 'REJECT' || st === 'NG') buckets[bIdx].reject++;
            else buckets[bIdx].pass++;
          }
        }
      }
    }

    totalData = buckets.map(b => b.total);
    passData = buckets.map(b => b.pass);
    holdData = buckets.map(b => b.hold);
    rejectData = buckets.map(b => b.reject);
  }

  return { labels, totalData, passData, holdData, rejectData };
};

const initLineChart = () => {
  if (!lineComparisonChartCanvas.value) return;
  if (lineComparisonChartInstance) lineComparisonChartInstance.destroy();

  const { labels, totalData, passData, holdData, rejectData } = generateLineChartData();

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
          borderWidth: 2.5,
          pointRadius: 3.5,
          pointHoverRadius: 6
        },
        {
          label: 'PASS',
          data: passData,
          hidden: !chartVisibility.value.pass,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16, 185, 129, 0.04)',
          fill: false,
          tension: 0.35,
          borderWidth: 2.5,
          pointRadius: 3.5,
          pointHoverRadius: 6
        },
        {
          label: 'HOLD',
          data: holdData,
          hidden: !chartVisibility.value.hold,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'REJECT',
          data: rejectData,
          hidden: !chartVisibility.value.reject,
          borderColor: '#ef4444',
          backgroundColor: 'transparent',
          fill: false,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
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
          ticks: { font: { family: 'monospace', size: 9.5 } }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(24, 24, 27, 0.06)' },
          ticks: { precision: 0, font: { family: 'monospace', size: 9.5 } }
        }
      }
    }
  });
};

const updateLineChart = () => {
  if (!lineComparisonChartInstance) {
    initLineChart();
    return;
  }
  const { labels, totalData, passData, holdData, rejectData } = generateLineChartData();
  lineComparisonChartInstance.data.labels = labels;
  lineComparisonChartInstance.data.datasets[0].data = totalData;
  lineComparisonChartInstance.data.datasets[1].data = passData;
  lineComparisonChartInstance.data.datasets[2].data = holdData;
  lineComparisonChartInstance.data.datasets[3].data = rejectData;
  lineComparisonChartInstance.data.datasets[0].hidden = !chartVisibility.value.total;
  lineComparisonChartInstance.data.datasets[1].hidden = !chartVisibility.value.pass;
  lineComparisonChartInstance.data.datasets[2].hidden = !chartVisibility.value.hold;
  lineComparisonChartInstance.data.datasets[3].hidden = !chartVisibility.value.reject;
  lineComparisonChartInstance.update();
};

// Reaktif re-render diagram garis saat data roll / label selesai dimuat dari IndexedDB
watch(filteredLabels, () => {
  nextTick(() => {
    if (!lineComparisonChartInstance) {
      initLineChart();
    } else {
      updateLineChart();
    }
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
  const dbOps = configStore.operatorList || [];

  // 1. Cari exact match by Nama Operator di Master Database
  let matched = dbOps.find(o => o.nama && o.nama.toUpperCase() === rawOp.toUpperCase());

  // 2. Cari by Kode Operator & Mesin
  if (!matched && rawCode) {
    matched = dbOps.find(o => 
      o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode &&
      (!o.mesin || o.mesin.toUpperCase().includes(targetMachine) || targetMachine.includes(o.mesin.toUpperCase()))
    );
  }

  // 3. Cari by Kode Operator saja
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

const openSpkModal = (spk, activeView = 'ALL') => {
  selectedSpkModal.value = { ...spk, activeView };
  showSpkModal.value = true;
};

const timelineSpkList = computed(() => {
  let plans = spkStore.plans || [];
  
  // Prioritaskan baris SPK dari batch yang aktif sebagai acuan monitoring
  if (spkStore.activeBatch && spkStore.activeBatch.uuid) {
    const batchPlans = plans
      .filter(p => p.batchId === spkStore.activeBatch.uuid)
      .sort((a, b) => {
        const seqA = a.seq !== undefined && a.seq !== null ? a.seq : (a.no || a.id || 0);
        const seqB = b.seq !== undefined && b.seq !== null ? b.seq : (b.no || b.id || 0);
        return seqA - seqB;
      });
    if (batchPlans.length > 0) {
      plans = batchPlans;
    }
  }

  const list = [];

  if (plans.length > 0) {
    for (let i = 0; i < Math.min(10, plans.length); i++) {
      const p = plans[i];
      const analytics = spkStore.getSpkRealtimeAnalytics(p.spkNo, p) || {};
      const planRoll = analytics.plannedChildRolls || (p.jumlahJumbo ? p.jumlahJumbo * 2 : 4);
      const planMeter = analytics.plannedMeter || (p.totalPlannedMeter || (p.panjangParent * (p.jumlahJumbo || 1))) || 24000;
      const actualRoll = analytics.totalRealRolls || 0;
      const actualMeter = analytics.totalRealMeter || 0;
      const actualKg = analytics.totalRealKg || 0;
      const percent = planRoll > 0 ? Math.min(100, Math.round((actualRoll / planRoll) * 100)) : 0;

      let status = 'SCHEDULED';
      if (percent >= 100) status = 'DONE';
      else if (actualRoll > 0) status = 'RUNNING';

      const targetStatus = analytics.targetStatus || evaluateTargetStatus(actualRoll, planRoll, p.status === 'SKIPPED');

      list.push({
        spkNo: p.spkNo,
        docNo: p.docNo || '3B-PROD',
        formula: p.formula || analytics.formula || 'CPP',
        thickness: p.thickness || analytics.thickness || 20,
        jenis: p.jenis || 'CPP',
        customer: p.customer || p.namaCustomer || '-',
        planRoll,
        planMeter,
        planJumbo: p.jumlahJumbo || 1,
        speed: analytics.speed || 600,
        actualRoll,
        actualMeter,
        actualKg,
        actualJumbo: analytics.actualParentCut || 0,
        passCount: analytics.passCount || 0,
        holdCount: analytics.holdCount || 0,
        rejectCount: analytics.rejectCount || 0,
        percent,
        status,
        startTimeFormatted: analytics.startTimeFormatted || '-',
        endTimeFormatted: analytics.endTimeFormatted || '-',
        targetStatus,
        diffRoll: actualRoll - planRoll,
        diffMeter: Math.round(actualMeter - planMeter)
      });
    }
  }

  // ZERO DUMMY POLICY: Jika tidak ada plan SPK terdaftar, ambil rekaman aktual input label 2 hari kebelakang berjalan
  if (list.length === 0) {
    const allRolls = allProductionRolls.value || [];
    
    // Cari 2 tanggal produksi berjalan terakhir (termasuk hari ini dan kemarin)
    const distinctDates = Array.from(
      new Set(allRolls.map(r => getRealProductionDate(r)).filter(Boolean))
    ).sort().reverse();

    const targetDates = distinctDates.slice(0, 2);

    const spkGroups = new Map();

    for (const r of allRolls) {
      const pDate = getRealProductionDate(r);
      if (targetDates.length > 0 && !targetDates.includes(pDate)) continue;

      const rawSpk = String(r.spk || '').trim().toUpperCase();
      if (!rawSpk || rawSpk === '-' || rawSpk === 'DEFAULT') continue;

      if (!spkGroups.has(rawSpk)) {
        spkGroups.set(rawSpk, {
          spkNo: rawSpk,
          docNo: '3B-PROD',
          formula: r.kodeFormula || r.formula || 'CPP',
          thickness: parseFloat(r.thickness) || 20,
          jenis: r.jenis || 'CPP',
          customer: r.customer || '-',
          actualRoll: 0,
          actualMeter: 0,
          actualKg: 0,
          passCount: 0,
          holdCount: 0,
          rejectCount: 0,
          firstTime: Infinity,
          lastTime: 0
        });
      }

      const entry = spkGroups.get(rawSpk);
      entry.actualRoll++;
      entry.actualMeter += parseFloat(r.meter || r.length || r.panjang || 0) || 0;
      entry.actualKg += parseFloat(r.netto || r.beratNetto || r.berat || 0) || 0;

      const st = String(r.qualityStatus || r.status || 'PASS').toUpperCase();
      if (st === 'HOLD') entry.holdCount++;
      else if (st === 'REJECT' || st === 'NG') entry.rejectCount++;
      else entry.passCount++;

      const rTime = r.verifiedAt || r.createdAt || r.tanggal;
      if (rTime) {
        const t = new Date(rTime).getTime();
        if (t > 0 && t < entry.firstTime) entry.firstTime = t;
        if (t > entry.lastTime) entry.lastTime = t;
      }
    }

    // Convert map to list sorted by last production time
    const dynamicSpkList = Array.from(spkGroups.values())
      .sort((a, b) => b.lastTime - a.lastTime)
      .slice(0, 10);

    for (const dSpk of dynamicSpkList) {
      const startTimeFormatted = dSpk.firstTime !== Infinity && dSpk.firstTime > 0
        ? new Date(dSpk.firstTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(dSpk.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';
      const endTimeFormatted = dSpk.lastTime > 0
        ? new Date(dSpk.lastTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(dSpk.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';

      const targetStatus = evaluateTargetStatus(dSpk.actualRoll, dSpk.actualRoll, false);

      list.push({
        spkNo: dSpk.spkNo,
        docNo: dSpk.docNo,
        formula: dSpk.formula,
        thickness: dSpk.thickness,
        jenis: dSpk.jenis,
        customer: dSpk.customer,
        planRoll: dSpk.actualRoll,
        planMeter: Math.round(dSpk.actualMeter),
        planJumbo: Math.max(1, Math.ceil(dSpk.actualRoll / 2)),
        speed: 600,
        actualRoll: dSpk.actualRoll,
        actualMeter: Math.round(dSpk.actualMeter),
        actualKg: Math.round(dSpk.actualKg),
        actualJumbo: Math.max(1, Math.ceil(dSpk.actualRoll / 2)),
        passCount: dSpk.passCount,
        holdCount: dSpk.holdCount,
        rejectCount: dSpk.rejectCount,
        percent: 100,
        status: 'DONE',
        startTimeFormatted,
        endTimeFormatted,
        targetStatus,
        diffRoll: 0,
        diffMeter: 0,
        isTwoDayFallback: true
      });
    }
  }

  return list;
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
      id: s.id || Math.random().toString(),
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
    const length = Number(j.panjangAktual || j.panjang || 0) || 0;
    const kg = Number(j.beratAktual || j.berat || 0) || 0;
    const jenis = String(j.jenis || 'CPP').toUpperCase().trim();
    const formula = String(j.formula || j.kodeFormula || 'G01').toUpperCase().trim();
    const thick = String(j.thick || j.tebal || '20').trim();
    const width = String(j.width || j.lebar || '1000').trim();
    const nav = j.descriptionNav || `${jenis} ${formula} ${thick} MC X ${width} MM`;

    return {
      id: j.id || Math.random().toString(),
      stockType: 'JUMBO',
      isJumbo: true,
      jenis,
      formula,
      thick,
      width,
      length,
      descNav: nav,
      sourceNo: j.rollNo || '-',
      totalRoll: 1,
      totalPanjang: length,
      totalKg: kg,
      listRak: j.lokasiAktif || '-'
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
// 9. LIFECYCLE HOOKS
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
  initLineChart();
});

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
  if (lineComparisonChartInstance) lineComparisonChartInstance.destroy();
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
</style>
