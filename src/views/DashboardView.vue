<template>
  <div class="space-y-6 animate-fade-in pb-12 font-sans select-none text-zinc-900">
    
    <!-- ========================================================================= -->
    <!-- 1. TOP HEADER & OPERATIONAL COCKPIT CONTROL BAR -->
    <!-- ========================================================================= -->
    <div class="bg-white border border-zinc-200/90 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
      <!-- Top Subtle Red Line Accent -->
      <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-zinc-900"></div>

      <div class="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
        <!-- Left: Plant Info & Live Clock -->
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 text-red-600 text-[11px] font-mono font-black border border-red-200 shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span>PT. SAPTAWARNA CEMERLANG</span>
            </span>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
              <span>⏱️ {{ liveTimeString }}</span>
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              <span>Shift: {{ currentShift.definition.name }} (Grup {{ currentShift.group }})</span>
            </span>
          </div>

          <div class="flex items-center gap-3">
            <h1 class="text-xl sm:text-2xl font-black text-zinc-950 tracking-tight">
              DASHBOARD PRODUKSI & STOK FILM
            </h1>
            <span class="hidden sm:inline-block px-2 py-0.5 rounded bg-zinc-900 text-white font-mono text-[10px] font-black tracking-wider uppercase">
              M-LABEL COCKPIT
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium">
            Monitoring terpusat hasil konversi film slitting, rewind, kendali mutu QC, dan inventaris stok.
          </p>
        </div>

        <!-- Right: Dynamic Frequency Switcher (Hari, Minggu, Bulan, Tahun) -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-stretch lg:self-auto shrink-0">
          <div class="bg-zinc-100 p-1 rounded-2xl border border-zinc-200 flex items-center gap-1 text-xs font-mono font-bold w-full sm:w-auto">
            <button
              v-for="freq in frequencyOptions"
              :key="freq.key"
              @click="setFrequency(freq.key)"
              :class="[
                'flex-1 sm:flex-none px-3.5 py-1.5 rounded-xl transition-all cursor-pointer text-center',
                selectedFrequency === freq.key
                  ? 'bg-zinc-950 text-white shadow-xs font-black'
                  : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60'
              ]"
            >
              {{ freq.label }}
            </button>
          </div>

          <!-- Quick Navigation Actions -->
          <div class="flex items-center gap-2">
            <router-link
              to="/label"
              class="px-3.5 py-2 rounded-xl bg-zinc-950 hover:bg-red-600 text-white font-bold text-xs font-mono flex items-center gap-1.5 shadow-xs transition-colors"
              title="Cetak Label Roll Baru"
            >
              <span>🏷️</span>
              <span class="hidden sm:inline">Cetak Label</span>
            </router-link>
            <router-link
              to="/de-report"
              class="px-3.5 py-2 rounded-xl bg-white hover:bg-zinc-100 text-zinc-800 font-bold text-xs font-mono border border-zinc-200 flex items-center gap-1.5 shadow-xs transition-colors"
              title="Buka Verifikasi DE Report"
            >
              <span>📋</span>
              <span class="hidden sm:inline">DE Report</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. 4 DYNAMIC KPI METRICS CARDS (BERDASARKAN FREKUENSI TERPILIH) -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- CARD 1: OUTPUT PRODUKSI ROLL -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">
            Output Roll ({{ frequencyLabel }})
          </span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            🏷️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {{ formatNum(kpiMetrics.totalRolls) }}
            <span class="text-xs font-bold text-zinc-500 font-sans">Roll</span>
          </div>
          <div class="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 font-medium font-mono">
            <span class="text-zinc-800 font-bold">Slit: {{ formatNum(kpiMetrics.slittingRolls) }}</span>
            <span>•</span>
            <span class="text-zinc-800 font-bold">Rwd: {{ formatNum(kpiMetrics.rewindRolls) }}</span>
          </div>
        </div>
      </div>

      <!-- CARD 2: TONASE BERAT BERSIH -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">
            Tonase Bersih ({{ frequencyLabel }})
          </span>
          <div class="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-900 border border-zinc-200 flex items-center justify-center font-bold text-lg">
            ⚖️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {{ formatNum(kpiMetrics.totalBeratKg) }}
            <span class="text-xs font-bold text-zinc-500 font-sans">Kg</span>
          </div>
          <div class="text-xs text-zinc-500 mt-1.5 font-medium font-mono">
            Estimasi <strong>{{ (kpiMetrics.totalBeratKg / 1000).toFixed(2) }} Ton</strong> film diproses
          </div>
        </div>
      </div>

      <!-- CARD 3: YIELD KUALITAS QC (% PASS) -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-emerald-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">
            Mutu QC Yield Rate
          </span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
            🎯
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-black text-emerald-700 font-mono tracking-tight">
            {{ kpiMetrics.yieldPassRate }}%
            <span class="text-xs font-bold text-zinc-500 font-sans">PASS</span>
          </div>
          <div class="flex items-center gap-2 mt-1.5 text-xs font-mono font-bold">
            <span class="text-emerald-700">{{ formatNum(kpiMetrics.passCount) }} Pass</span>
            <span class="text-zinc-300">•</span>
            <span class="text-amber-600">{{ formatNum(kpiMetrics.holdCount) }} Hold</span>
            <span class="text-zinc-300">•</span>
            <span class="text-red-600">{{ formatNum(kpiMetrics.rejectCount) }} Rej</span>
          </div>
        </div>
      </div>

      <!-- CARD 4: ANTRIAN VERIFIKASI DE REPORT -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-amber-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">
            Antrian Verifikasi DE
          </span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center font-bold text-lg">
            📋
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl sm:text-3xl font-black text-zinc-950 font-mono tracking-tight">
            {{ formatNum(unverifiedCount) }}
            <span class="text-xs font-bold text-zinc-500 font-sans">Roll Menunggu</span>
          </div>
          <div class="mt-1.5">
            <router-link
              to="/de-report"
              class="inline-flex items-center gap-1 text-xs font-mono font-bold text-red-600 hover:text-red-700"
            >
              <span>Verifikasi Sekarang</span>
              <span>➔</span>
            </router-link>
          </div>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 3. MODUL KONDISI STOK TERPADU (ROLL FG & JUMBO WIP) DARI MENU IMS       -->
    <!-- ========================================================================= -->
    <div class="bg-white border border-zinc-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      
      <!-- Stock Header & Scope Filter -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-zinc-100 pb-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="text-base font-black text-zinc-950">KONDISI STOK GUDANG (ACUAN MENU IMS)</span>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white font-mono">
              IMS LIVE DATA
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Data stok aktual diambil langsung dari sesi aktif menu Stok Gudang (IMS) & WIP. Diperbarui setiap hari oleh user.
          </p>
        </div>

        <!-- Filter Tipe Stok: Semua vs Roll FG vs Jumbo WIP -->
        <div class="bg-zinc-100 p-1 rounded-2xl border border-zinc-200 flex items-center gap-1 text-xs font-mono font-bold shrink-0">
          <button
            @click="stockScopeFilter = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer',
              stockScopeFilter === 'ALL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            ]"
          >
            Semua Stok
          </button>
          <button
            @click="stockScopeFilter = 'FG'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1',
              stockScopeFilter === 'FG' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            ]"
          >
            <span>Roll FG</span>
          </button>
          <button
            @click="stockScopeFilter = 'JUMBO'"
            :class="[
              'px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1',
              stockScopeFilter === 'JUMBO' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:text-zinc-900'
            ]"
          >
            <span>Jumbo WIP</span>
          </button>
        </div>
      </div>

      <!-- IMS Active Session Indicator Banner -->
      <div class="bg-emerald-50/80 border border-emerald-300 p-3 sm:p-3.5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-3 sm:gap-4">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span class="font-bold text-emerald-950 font-mono text-[11px]">Sesi Aktif FG (IMS):</span>
            <span class="px-2 py-0.5 rounded bg-white border border-emerald-300 text-emerald-900 font-mono font-black text-[11px]">
              {{ activeFgUpload ? activeFgUpload.fileName : 'Data Stok FG Aktif' }}
            </span>
            <span class="text-emerald-700 font-mono text-[11px]">
              Tgl: <strong>{{ activeFgUpload ? activeFgUpload.uploadDate : inventoryStore.lastUploadDate }}</strong> ({{ inventoryStore.currentStocks?.length || 0 }} SKU)
            </span>
          </div>

          <span class="text-emerald-300 hidden md:inline">|</span>

          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
            <span class="font-bold text-emerald-950 font-mono text-[11px]">Sesi Aktif Jumbo WIP:</span>
            <span class="px-2 py-0.5 rounded bg-white border border-blue-300 text-blue-900 font-mono font-black text-[11px]">
              {{ activeWipUpdate ? (activeWipUpdate.title || activeWipUpdate.fileName) : 'Sesi WIP Aktif' }}
            </span>
            <span class="text-emerald-700 font-mono text-[11px]">
              Tgl: <strong>{{ activeWipUpdate ? activeWipUpdate.tanggal : '-' }}</strong> ({{ wipStore.activeWipRolls?.length || 0 }} Jumbo)
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0">
          <router-link
            to="/inventory"
            class="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-mono font-bold text-[11px] transition-colors flex items-center gap-1 shadow-2xs"
            title="Kelola Sesi Stok Gudang di Menu IMS"
          >
            <span>📦 Kelola di Menu IMS ➔</span>
          </router-link>
        </div>
      </div>

      <!-- Global Stock Summary Bar -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-zinc-50 border border-zinc-200/80 font-mono">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-800 shadow-2xs">
            📦
          </div>
          <div>
            <div class="text-[11px] text-zinc-500 font-bold uppercase">Total Populasi Stok</div>
            <div class="text-lg font-black text-zinc-950">
              {{ formatNum(globalStockSummary.totalRolls) }} Roll
              <small class="text-[10.5px] font-normal text-zinc-500 block">
                ({{ formatNum(globalStockSummary.totalFgRolls) }} FG • {{ formatNum(globalStockSummary.totalWipRolls) }} WIP)
              </small>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-800 shadow-2xs">
            📏
          </div>
          <div>
            <div class="text-[11px] text-zinc-500 font-bold uppercase">Akumulasi Panjang</div>
            <div class="text-lg font-black text-zinc-950">{{ formatNum(globalStockSummary.totalMeters) }} Meter</div>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white border border-zinc-200 flex items-center justify-center font-bold text-zinc-800 shadow-2xs">
            ⚖️
          </div>
          <div>
            <div class="text-[11px] text-zinc-500 font-bold uppercase">Total Berat Fisik</div>
            <div class="text-lg font-black text-red-600">{{ formatNum(globalStockSummary.totalKg) }} Kg ({{ (globalStockSummary.totalKg / 1000).toFixed(2) }} Ton)</div>
          </div>
        </div>
      </div>

      <!-- Stock Material Breakdown Grid (Cards per Jenis Film) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <div
          v-for="cat in stockByCategory"
          :key="cat.jenis"
          @click="openStockDetailModal(cat)"
          class="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-red-500 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden flex flex-col justify-between"
        >
          <!-- Accent Pill & Material Badge -->
          <div>
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-1.5">
                <span class="px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono font-black text-xs tracking-wider">
                  {{ cat.jenis }}
                </span>
                <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-600 border border-zinc-200">
                  {{ formatNum(cat.fgRolls) }} FG • {{ formatNum(cat.wipRolls) }} WIP
                </span>
              </div>
              <span class="text-[11px] font-mono text-zinc-400 group-hover:text-red-600 flex items-center gap-1 font-bold">
                <span>Rincian</span>
                <span>➔</span>
              </span>
            </div>

            <!-- Quantitative Stats -->
            <div class="space-y-1">
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-zinc-500 font-medium">Jumlah Roll:</span>
                <span class="text-base font-black text-zinc-900 font-mono">{{ formatNum(cat.totalRolls) }} <small class="font-normal text-xs text-zinc-400">roll</small></span>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-zinc-500 font-medium">Total Meter:</span>
                <span class="text-sm font-bold text-zinc-800 font-mono">{{ formatNum(cat.totalMeters) }} <small class="font-normal text-[10px] text-zinc-400">m</small></span>
              </div>
              <div class="flex items-baseline justify-between">
                <span class="text-xs text-zinc-500 font-medium">Total Berat:</span>
                <span class="text-sm font-black text-red-600 font-mono">{{ formatNum(cat.totalKg) }} <small class="font-normal text-[10px] text-red-400">kg</small></span>
              </div>
            </div>
          </div>

          <!-- Progress / Proportional Share Bar -->
          <div class="mt-4 pt-3 border-t border-zinc-100">
            <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 mb-1">
              <span>Porsi Stok</span>
              <span class="font-bold text-zinc-700">{{ cat.percentShare }}%</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-zinc-100 overflow-hidden">
              <div class="h-full bg-red-600 rounded-full" :style="{ width: `${cat.percentShare}%` }"></div>
            </div>
          </div>
        </div>

        <!-- Empty Stock Fallback -->
        <div
          v-if="stockByCategory.length === 0"
          class="col-span-full p-8 text-center bg-zinc-50 border border-dashed border-zinc-200 rounded-2xl text-xs text-zinc-400 font-medium"
        >
          Belum ada data stok roll terdaftar pada sesi aktif IMS saat ini. Silakan buka menu IMS untuk memperbarui stok harian.
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 4. VISUAL METRICS: DISTRIBUSI MESIN & KUALITAS QC & WIDGET SPK PIPELINE -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      <!-- Chart 1: Distribusi Produksi Mesin (Slitting vs Rewind vs SML) -->
      <div class="lg:col-span-5 bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-black text-zinc-950">DISTRIBUSI PRODUKSI PER MESIN</h3>
              <p class="text-xs text-zinc-500 font-medium">Volume roll berdasarkan unit mesin ({{ frequencyLabel }})</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-mono font-bold border border-zinc-200">
              Mesin
            </span>
          </div>
          <div class="h-56 relative">
            <canvas ref="machineChartCanvas"></canvas>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center font-mono">
          <div class="p-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <span class="text-[10px] text-zinc-500 font-bold block">SLITTING</span>
            <span class="text-base font-black text-zinc-950">{{ formatNum(kpiMetrics.slittingRolls) }}</span>
          </div>
          <div class="p-2 rounded-xl bg-red-50 border border-red-200">
            <span class="text-[10px] text-red-600 font-bold block">REWIND</span>
            <span class="text-base font-black text-red-700">{{ formatNum(kpiMetrics.rewindRolls) }}</span>
          </div>
          <div class="p-2 rounded-xl bg-zinc-50 border border-zinc-200">
            <span class="text-[10px] text-zinc-500 font-bold block">SML / OTHER</span>
            <span class="text-base font-black text-zinc-950">{{ formatNum(kpiMetrics.smlRolls) }}</span>
          </div>
        </div>
      </div>

      <!-- Chart 2: Status Kualitas QC (Donut Pass/Hold/Reject) -->
      <div class="lg:col-span-3 bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-black text-zinc-950">STATUS MUTU QC</h3>
              <p class="text-xs text-zinc-500 font-medium">Rasio kelulusan inspeksi</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-mono font-bold border border-zinc-200">
              QC
            </span>
          </div>
          <div class="h-44 relative">
            <canvas ref="statusChartCanvas"></canvas>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-zinc-100 space-y-1.5 font-mono text-xs">
          <div class="flex items-center justify-between text-emerald-700 font-bold">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-600"></span> PASS
            </span>
            <span>{{ formatNum(kpiMetrics.passCount) }} roll</span>
          </div>
          <div class="flex items-center justify-between text-amber-600 font-bold">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span> HOLD
            </span>
            <span>{{ formatNum(kpiMetrics.holdCount) }} roll</span>
          </div>
          <div class="flex items-center justify-between text-red-600 font-bold">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-red-600"></span> REJECT
            </span>
            <span>{{ formatNum(kpiMetrics.rejectCount) }} roll</span>
          </div>
        </div>
      </div>

      <!-- Widget 3: SPK Production Pipeline Status -->
      <div class="lg:col-span-4 bg-white p-5 sm:p-6 rounded-3xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-3">
            <div>
              <h3 class="text-base font-black text-zinc-950">RENCANA POTONG SPK</h3>
              <p class="text-xs text-zinc-500 font-medium">Batch kerja produksi aktif</p>
            </div>
            <router-link to="/spk" class="text-xs font-black text-red-600 hover:underline font-mono">
              Buka SPK ➔
            </router-link>
          </div>

          <!-- Active Batch Card -->
          <div v-if="activeSpkBatch" class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div class="flex items-center justify-between">
              <span class="font-mono font-black text-sm text-zinc-900">{{ activeSpkBatch.batchName || activeSpkBatch.fileName }}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {{ activeSpkBatch.machine || 'SLITTING' }}
              </span>
            </div>
            <p class="text-[11px] text-zinc-500 font-mono">
              Tgl: <strong>{{ activeSpkBatch.tanggal || '-' }}</strong> • Oleh: {{ activeSpkBatch.uploader || 'Admin' }}
            </p>
            <div class="grid grid-cols-2 gap-2 pt-1 border-t border-zinc-200/60 font-mono text-xs">
              <div>
                <span class="text-[10px] text-zinc-400 block">Jml Item SPK</span>
                <span class="font-black text-zinc-900">{{ spkStore.plans?.length || 0 }} Item</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">Total Jumbo SPK</span>
                <span class="font-black text-red-600">{{ activeSpkBatch.totalJumbo || '-' }} Roll</span>
              </div>
            </div>
          </div>
          <div v-else class="p-4 text-center rounded-2xl bg-zinc-50 border border-dashed border-zinc-200 text-xs text-zinc-400">
            Tidak ada batch SPK aktif saat ini.
          </div>
        </div>

        <!-- Quick SPK Metrics Footer -->
        <div class="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between text-xs font-mono text-zinc-500">
          <span>Batch Terdaftar: <strong>{{ spkStore.batches?.length || 0 }}</strong></span>
          <router-link to="/spk" class="text-zinc-800 hover:text-red-600 font-bold">
            Detail Charting →
          </router-link>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 5. RECENT ACTIVITY FEED: 5 ROLL TERAKHIR & 5 TUGAS PEMERIKSAAN -->
    <!-- ========================================================================= -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- 5 Roll Terakhir -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-zinc-950">ROLL PRODUKSI TERAKHIR</h3>
            <p class="text-xs text-zinc-500 font-medium">5 transaksi roll terbaru yang tersimpan</p>
          </div>
          <router-link to="/label" class="text-xs font-black text-red-600 hover:underline font-mono">
            Lihat Semua ➔
          </router-link>
        </div>

        <div class="divide-y divide-zinc-100">
          <div
            v-for="item in recentLabels"
            :key="item.id"
            class="p-4 hover:bg-zinc-50/70 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-black text-sm text-zinc-900 font-mono">{{ item.lot }}</span>
                <span class="text-red-600 font-bold text-xs font-mono">{{ item.turunan }}</span>
                <span :class="[
                  'text-[9px] font-black px-1.5 py-0.2 rounded font-mono',
                  item.status === 'PASS' || item.status === 'OK' ? 'bg-emerald-100 text-emerald-800' :
                  item.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                ]">
                  {{ item.status }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 mt-0.5 font-medium font-mono">
                SPK: <strong class="text-zinc-800">{{ item.spk }}</strong> • {{ item.jenis }} • {{ item.mesin }}
              </p>
            </div>
            <div class="text-right shrink-0 font-mono">
              <span class="text-sm font-black text-zinc-900">{{ item.netto || item.berat || '-' }} kg</span>
              <p class="text-[10.5px] text-zinc-400">{{ item.tanggal }}</p>
            </div>
          </div>
          <div v-if="recentLabels.length === 0" class="p-6 text-center text-xs text-zinc-400">
            Belum ada catatan roll tersimpan.
          </div>
        </div>
      </div>

      <!-- 5 Tugas QC & Pemeriksaan Terkini -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-zinc-950">TUGAS QC & PEMERIKSAAN</h3>
            <p class="text-xs text-zinc-500 font-medium">Tugas audit dan verifikasi QR terkini</p>
          </div>
          <router-link to="/tasks" class="text-xs font-black text-red-600 hover:underline font-mono">
            Kelola Tugas ➔
          </router-link>
        </div>

        <div class="divide-y divide-zinc-100">
          <div
            v-for="task in recentTasks"
            :key="task.id"
            class="p-4 hover:bg-zinc-50/70 transition-colors flex items-center justify-between gap-3"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-zinc-900">{{ task.title }}</span>
                <span :class="[
                  'text-[9.5px] font-bold px-2 py-0.5 rounded-full border font-mono',
                  task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  task.status === 'In Progress' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                ]">
                  {{ task.status }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 mt-0.5 font-medium">
                PIC: <strong class="text-zinc-700">{{ task.assignee }}</strong> • Prioritas: {{ task.priority }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                {{ task.taskCode }}
              </span>
            </div>
          </div>
          <div v-if="recentTasks.length === 0" class="p-6 text-center text-xs text-zinc-400">
            Tidak ada tugas audit aktif saat ini.
          </div>
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- 6. MODAL INTERAKTIF: DRILL-DOWN RINCIAN STOK BERDASARKAN DESKRIPSI NAV -->
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
          class="fixed inset-0 z-999 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none font-sans"
          @click.self="showStockModal = false"
        >
          <div class="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            
            <!-- Modal Header -->
            <div class="p-5 sm:p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
              <div>
                <div class="flex items-center gap-2.5">
                  <span class="px-2.5 py-1 rounded-lg bg-red-600 text-white font-mono font-black text-xs">
                    {{ selectedStockCategory?.jenis || 'MATERIAL' }}
                  </span>
                  <h2 class="text-lg font-black text-zinc-950">
                    DETAIL STOK IMS BERDASARKAN DESKRIPSI NAV
                  </h2>
                </div>
                <p class="text-xs text-zinc-500 font-medium mt-1">
                  Dikelompokkan otomatis berdasarkan spesifikasi resmi Deskripsi NAV dari sesi aktif menu Stok Gudang (IMS).
                  <span v-if="activeFgUpload" class="text-zinc-700 font-bold">
                    • Sesi Acuan: {{ activeFgUpload.fileName }} ({{ activeFgUpload.uploadDate }})
                  </span>
                </p>
              </div>

              <button
                @click="showStockModal = false"
                class="w-9 h-9 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center font-black transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <!-- Modal Search & Filter Bar -->
            <div class="p-4 border-b border-zinc-100 bg-white flex flex-wrap items-center justify-between gap-3">
              <div class="relative flex-1 min-w-[240px]">
                <span class="absolute left-3.5 top-2.5 text-zinc-400 text-sm">🔍</span>
                <input
                  v-model="modalSearchQuery"
                  type="text"
                  placeholder="Cari Deskripsi NAV, Source No, Formula, atau Lokasi Rak..."
                  class="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono focus:bg-white focus:border-red-600 outline-none"
                />
              </div>

              <!-- Quick Subtotal Counter -->
              <div class="flex items-center gap-3 text-xs font-mono">
                <span class="text-zinc-500">Group NAV: <strong>{{ groupedNavItems.length }}</strong></span>
                <span class="text-zinc-500">Total Roll: <strong class="text-zinc-900">{{ formatNum(modalFilteredRollsCount) }}</strong></span>
                <span class="text-zinc-500">Total Berat: <strong class="text-red-600">{{ formatNum(modalFilteredWeightKg) }} kg</strong></span>
              </div>
            </div>

            <!-- Modal Content Body: Grouped by Description NAV -->
            <div class="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
              
              <div
                v-for="grp in groupedNavItems"
                :key="grp.descNav"
                class="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs"
              >
                <!-- Group Header (Deskripsi NAV Card) -->
                <div class="bg-zinc-100/80 p-3.5 sm:p-4 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-2">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full bg-red-600"></span>
                    <span class="font-mono font-black text-sm text-zinc-950 tracking-tight">{{ grp.descNav }}</span>
                  </div>

                  <div class="flex items-center gap-3 font-mono text-xs">
                    <span class="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-800 font-bold">
                      {{ formatNum(grp.totalRolls) }} Roll
                    </span>
                    <span class="px-2 py-0.5 rounded bg-white border border-zinc-200 text-zinc-800 font-bold">
                      {{ formatNum(grp.totalMeters) }} m
                    </span>
                    <span class="px-2 py-0.5 rounded bg-red-50 border border-red-200 text-red-700 font-black">
                      {{ formatNum(grp.totalKg) }} kg
                    </span>
                  </div>
                </div>

                <!-- Roll Itemized Table inside Deskripsi NAV -->
                <div class="overflow-x-auto">
                  <table class="w-full text-[11.5px] text-left border-collapse font-mono">
                    <thead class="bg-zinc-50 text-zinc-500 border-b border-zinc-200 text-[10.5px]">
                      <tr>
                        <th class="py-2 px-3">NO</th>
                        <th class="py-2 px-3">TIPE</th>
                        <th class="py-2 px-3">ITEM / SOURCE NO</th>
                        <th class="py-2 px-3">SPESIFIKASI</th>
                        <th class="py-2 px-3 text-right">JUMLAH ROLL</th>
                        <th class="py-2 px-3 text-right">TOTAL PANJANG</th>
                        <th class="py-2 px-3 text-right">TOTAL BERAT</th>
                        <th class="py-2 px-3 text-center">CORE</th>
                        <th class="py-2 px-3">LOKASI RAK</th>
                        <th class="py-2 px-3 text-center">TGL UPDATE</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-100">
                      <tr
                        v-for="(it, itIdx) in grp.items"
                        :key="it.id || itIdx"
                        class="hover:bg-zinc-50 transition-colors"
                      >
                        <td class="py-2 px-3 text-zinc-400">{{ itIdx + 1 }}</td>
                        <td class="py-2 px-3">
                          <span
                            :class="[
                              'px-1.5 py-0.5 rounded text-[9px] font-black font-mono uppercase tracking-tight',
                              it.stockType === 'FG'
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-blue-100 text-blue-800 border border-blue-300'
                            ]"
                          >
                            {{ it.stockType === 'FG' ? 'FG IMS' : 'JUMBO WIP' }}
                          </span>
                        </td>
                        <td class="py-2 px-3 font-bold text-zinc-900">
                          {{ it.sourceNo || '-' }}
                          <small v-if="it.formula" class="text-zinc-500 block text-[10px]">
                            Formula: {{ it.formula }}
                          </small>
                        </td>
                        <td class="py-2 px-3 text-zinc-700">
                          {{ it.thick }} mc x {{ it.width }} mm
                          <span v-if="it.length" class="text-zinc-400 text-[10px]">
                            x {{ formatNum(it.length) }} m
                          </span>
                        </td>
                        <td class="py-2 px-3 text-right font-black text-zinc-900">
                          {{ formatNum(it.totalRoll) }} <small class="text-zinc-400 font-normal">roll</small>
                        </td>
                        <td class="py-2 px-3 text-right text-zinc-800 font-medium">
                          {{ formatNum(it.totalPanjang) }} m
                        </td>
                        <td class="py-2 px-3 text-right font-black text-red-600">
                          {{ formatNum(it.totalKg) }} kg
                        </td>
                        <td class="py-2 px-3 text-center text-zinc-600">
                          {{ it.core ? `${it.core}"` : '6"' }}
                        </td>
                        <td class="py-2 px-3 text-zinc-700">
                          <span v-if="it.listRak" class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-mono text-[10.5px]">
                            {{ it.listRak }}
                          </span>
                          <span v-else class="text-zinc-400">-</span>
                        </td>
                        <td class="py-2 px-3 text-center text-zinc-500 text-[10.5px]">
                          {{ it.lastUploadDate || it.lastProduction || '-' }}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Empty Filtered Results -->
              <div
                v-if="groupedNavItems.length === 0"
                class="p-12 text-center text-xs text-zinc-400 font-medium"
              >
                Tidak ada data roll yang cocok dengan pencarian "{{ modalSearchQuery }}".
              </div>

            </div>

            <!-- Modal Footer -->
            <div class="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span class="text-xs text-zinc-400 font-mono">
                PT. Saptawarna Cemerlang — Inventory Control
              </span>
              <button
                @click="showStockModal = false"
                class="px-5 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-bold text-xs cursor-pointer transition-colors"
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
import { ref, reactive, computed, watch, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useLabelStore } from '@/stores/labelStore';
import { useTaskStore } from '@/stores/taskStore';
import { useOpnameStore } from '@/stores/opnameStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useSpkStore } from '@/stores/spkStore';
import { useWipStore } from '@/stores/wipStore';
import { useInventoryStore } from '@/stores/inventoryStore';
import Chart from 'chart.js/auto';

const authStore = useAuthStore();
const labelStore = useLabelStore();
const taskStore = useTaskStore();
const opnameStore = useOpnameStore();
const dataRollStore = useDataRollStore();
const scheduleStore = useScheduleStore();
const spkStore = useSpkStore();
const wipStore = useWipStore();
const inventoryStore = useInventoryStore();

// =========================================================================
// 1. LIVE TIME & CURRENT SHIFT
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

// =========================================================================
// 2. DYNAMIC FREQUENCY SWITCHER (HARI, MINGGU, BULAN, TAHUN)
// =========================================================================
const frequencyOptions = [
  { key: 'DAY', label: 'Hari Ini' },
  { key: 'WEEK', label: 'Minggu Ini' },
  { key: 'MONTH', label: 'Bulan Ini' },
  { key: 'YEAR', label: 'Tahun Ini' }
];

const selectedFrequency = ref('DAY');

const setFrequency = (freqKey) => {
  selectedFrequency.value = freqKey;
  updateCharts();
};

const frequencyLabel = computed(() => {
  const found = frequencyOptions.find(f => f.key === selectedFrequency.value);
  return found ? found.label : 'Periode';
});

// Helper: Filter by Date Frequency
const isItemInFrequency = (dateStr) => {
  if (!dateStr || dateStr === 'Tanpa Tanggal') return true;
  try {
    const itemDate = new Date(dateStr);
    if (isNaN(itemDate.getTime())) return true;

    const now = new Date();
    
    if (selectedFrequency.value === 'DAY') {
      return itemDate.toDateString() === now.toDateString();
    } else if (selectedFrequency.value === 'WEEK') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(now.getDate() - 7);
      return itemDate >= oneWeekAgo && itemDate <= now;
    } else if (selectedFrequency.value === 'MONTH') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    } else if (selectedFrequency.value === 'YEAR') {
      return itemDate.getFullYear() === now.getFullYear();
    }
  } catch (e) {
    return true;
  }
  return true;
};

// All labels filtered by current frequency
const frequencyLabels = computed(() => {
  const all = labelStore.labels || [];
  // If in 'DAY' mode and no labels match today's exact date, fallback to last active batch to avoid blank screen
  const filtered = all.filter(l => isItemInFrequency(l.tanggal || l.createdAt));
  if (selectedFrequency.value === 'DAY' && filtered.length === 0 && all.length > 0) {
    // Return all or latest available batch so user always sees data
    return all.slice(0, 500);
  }
  return filtered;
});

// =========================================================================
// 3. KPI METRICS (DERIVED FROM SELECTED FREQUENCY)
// =========================================================================
const kpiMetrics = computed(() => {
  const list = frequencyLabels.value;
  let totalRolls = list.length;
  let totalBeratKg = 0;
  let slittingRolls = 0;
  let rewindRolls = 0;
  let smlRolls = 0;
  let passCount = 0;
  let holdCount = 0;
  let rejectCount = 0;

  for (let i = 0; i < list.length; i++) {
    const item = list[i];
    const berat = parseFloat(item.netto || item.berat || 0) || 0;
    totalBeratKg += berat;

    const mesin = String(item.mesin || '').toUpperCase();
    if (mesin.includes('REWIND')) {
      rewindRolls++;
    } else if (mesin.includes('SML')) {
      smlRolls++;
    } else {
      slittingRolls++;
    }

    const st = String(item.status || '').toUpperCase();
    if (st === 'HOLD') {
      holdCount++;
    } else if (st === 'REJECT') {
      rejectCount++;
    } else {
      passCount++;
    }
  }

  const yieldPassRate = totalRolls > 0 ? Math.round((passCount / totalRolls) * 100) : 100;

  return {
    totalRolls,
    totalBeratKg: Math.round(totalBeratKg),
    slittingRolls,
    rewindRolls,
    smlRolls,
    passCount,
    holdCount,
    rejectCount,
    yieldPassRate
  };
});

const unverifiedCount = computed(() => {
  const all = labelStore.labels || [];
  return all.filter(l => !l.verified || l.verified === 0).length;
});

// =========================================================================
// 4. KONDISI STOK TERPADU (ROLL FG & JUMBO WIP) DARI SESI AKTIF MENU IMS
// =========================================================================
const stockScopeFilter = ref('ALL'); // 'ALL' | 'FG' | 'JUMBO'

// Sesi Aktif dari Menu IMS & WIP
const activeFgUpload = computed(() => inventoryStore.activeUpload);
const activeWipUpdate = computed(() => wipStore.activeUpdate);

// Unified Raw Stock Items from IMS & WIP Active Sessions
const allStockItems = computed(() => {
  // 1. Roll FG: Diambil dari Sesi Aktif Menu IMS (inventoryStore.currentStocks)
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
      id: s.id || s.itemKey || Math.random().toString(),
      stockType: 'FG',
      isJumbo: false,
      jenis: j,
      formula: f,
      thick: t,
      width: w,
      length,
      core: s.core || '6',
      descNav: nav,
      descExcel: s.descriptionExcel || '',
      sourceNo: s.sourceNo || '-',
      totalRoll,
      totalPanjang,
      totalKg,
      listRak: s.listRak || (s.qtyRak ? `${s.qtyRak} Rak` : '-'),
      qtyRak: s.qtyRak || 0,
      lastProduction: s.lastProduction || '-',
      lastTransfer: s.lastTransfer || '-',
      lastUploadDate: s.lastUploadDate || inventoryStore.lastUploadDate || '-'
    };
  });

  // 2. Jumbo WIP: Diambil dari Sesi Aktif Menu WIP (wipStore.activeWipRolls)
  const wipStocks = (wipStore.activeWipRolls || []).map(j => {
    const length = Number(j.panjangAktual || j.panjang || j.length || 0) || 0;
    const kg = Number(j.beratAktual || j.berat || j.netto || j.beratTeori || 0) || 0;
    const jenis = String(j.jenis || 'CPP').toUpperCase().trim();
    const formula = String(j.formula || j.kodeFormula || 'G01').toUpperCase().trim();
    const thick = String(j.thick || j.tebal || j.thickness || '20').trim();
    const width = String(j.width || j.lebar || '1000').trim();
    const nav = j.descriptionNav || wipStore.generateDescNav(jenis, formula, thick, width);

    return {
      id: j.id || j.uuid || Math.random().toString(),
      stockType: 'JUMBO',
      isJumbo: true,
      jenis,
      formula,
      thick,
      width,
      length,
      core: j.core || '6',
      descNav: nav,
      descExcel: j.descriptionExcel || '',
      sourceNo: j.rollNo || j.noRoll || j.rollId || '-',
      totalRoll: 1,
      totalPanjang: length,
      totalKg: kg,
      listRak: j.lokasiAktif ? `${j.lokasiAktif} (${j.posisiAktif || 'BAWAH'})` : '-',
      qtyRak: j.lokasiAktif ? 1 : 0,
      status: j.status || 'PASS',
      lastProduction: j.tglProduksi || j.tanggal || '-',
      lastTransfer: '-',
      lastUploadDate: wipStore.activeUpdate?.tanggal || '-'
    };
  });

  if (stockScopeFilter.value === 'FG') return fgStocks;
  if (stockScopeFilter.value === 'JUMBO') return wipStocks;
  return [...fgStocks, ...wipStocks];
});

// Global Stock Summary
const globalStockSummary = computed(() => {
  const items = allStockItems.value;
  let totalRolls = 0;
  let totalMeters = 0;
  let totalKg = 0;
  let totalFgRolls = 0;
  let totalWipRolls = 0;

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const r = Number(it.totalRoll) || 0;
    totalRolls += r;
    totalMeters += (Number(it.totalPanjang) || 0);
    totalKg += (Number(it.totalKg) || 0);

    if (it.stockType === 'FG') {
      totalFgRolls += r;
    } else {
      totalWipRolls += r;
    }
  }

  return {
    totalRolls,
    totalMeters: Math.round(totalMeters),
    totalKg: Math.round(totalKg),
    totalFgRolls,
    totalWipRolls
  };
});

// Grouped by Jenis Film (VMCPP, CPP, VMPET, PET, etc.)
const stockByCategory = computed(() => {
  const items = allStockItems.value;
  const groups = {};

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const j = it.jenis || 'VMCPP';
    if (!groups[j]) {
      groups[j] = {
        jenis: j,
        totalRolls: 0,
        totalMeters: 0,
        totalKg: 0,
        fgRolls: 0,
        wipRolls: 0,
        items: []
      };
    }
    const r = Number(it.totalRoll) || 0;
    groups[j].totalRolls += r;
    groups[j].totalMeters += (Number(it.totalPanjang) || 0);
    groups[j].totalKg += (Number(it.totalKg) || 0);

    if (it.stockType === 'FG') {
      groups[j].fgRolls += r;
    } else {
      groups[j].wipRolls += r;
    }

    groups[j].items.push(it);
  }

  const grandTotal = globalStockSummary.value.totalRolls || 1;

  return Object.values(groups).map(g => ({
    ...g,
    totalMeters: Math.round(g.totalMeters),
    totalKg: Math.round(g.totalKg),
    percentShare: Math.min(100, Math.round((g.totalRolls / grandTotal) * 100))
  })).sort((a, b) => b.totalRolls - a.totalRolls);
});

// =========================================================================
// 5. MODAL DRILL-DOWN: DETAIL STOK BERDASARKAN DESKRIPSI NAV
// =========================================================================
const showStockModal = ref(false);
const selectedStockCategory = ref(null);
const modalSearchQuery = ref('');

const openStockDetailModal = (category) => {
  selectedStockCategory.value = category;
  modalSearchQuery.value = '';
  showStockModal.value = true;
};

// Group the category's stock items by Description NAV
const groupedNavItems = computed(() => {
  if (!selectedStockCategory.value) return [];
  const items = selectedStockCategory.value.items || [];
  const term = modalSearchQuery.value.toLowerCase().trim();

  const navMap = {};

  for (let i = 0; i < items.length; i++) {
    const it = items[i];
    const descNav = it.descNav || `${it.jenis} ${it.formula} ${it.thick} MC X ${it.width} MM`;

    if (term) {
      const matchNav = descNav.toLowerCase().includes(term);
      const matchSource = String(it.sourceNo || '').toLowerCase().includes(term);
      const matchFormula = String(it.formula || '').toLowerCase().includes(term);
      const matchRak = String(it.listRak || '').toLowerCase().includes(term);
      const matchDesc = String(it.descExcel || '').toLowerCase().includes(term);
      if (!matchNav && !matchSource && !matchFormula && !matchRak && !matchDesc) continue;
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

const modalFilteredRollsCount = computed(() => {
  return groupedNavItems.value.reduce((sum, g) => sum + g.totalRolls, 0);
});

const modalFilteredWeightKg = computed(() => {
  return groupedNavItems.value.reduce((sum, g) => sum + g.totalKg, 0);
});

// =========================================================================
// 6. SPK ACTIVE BATCH & PIPELINE
// =========================================================================
const activeSpkBatch = computed(() => {
  const list = spkStore.batches || [];
  return list[0] || null;
});

// Recent Labels & Tasks Feed
const recentLabels = computed(() => (labelStore.labels || []).slice(0, 5));
const recentTasks = computed(() => (taskStore.tasks || []).slice(0, 5));

// Helper: Format Number
const formatNum = (val) => {
  if (val === undefined || val === null || isNaN(val)) return '0';
  return Number(val).toLocaleString('id-ID');
};

// =========================================================================
// 7. CHART.JS INITIALIZATION & UPDATES
// =========================================================================
const machineChartCanvas = ref(null);
const statusChartCanvas = ref(null);
let machineChartInstance = null;
let statusChartInstance = null;

const initCharts = () => {
  if (machineChartCanvas.value) {
    if (machineChartInstance) machineChartInstance.destroy();
    machineChartInstance = new Chart(machineChartCanvas.value, {
      type: 'bar',
      data: {
        labels: ['SLITTING', 'REWIND', 'SML / LAINNYA'],
        datasets: [{
          label: 'Output Roll',
          data: [
            kpiMetrics.value.slittingRolls,
            kpiMetrics.value.rewindRolls,
            kpiMetrics.value.smlRolls
          ],
          backgroundColor: ['#18181b', '#dc2626', '#71717a'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false }
          },
          y: {
            beginAtZero: true,
            ticks: { precision: 0 },
            grid: { color: 'rgba(24, 24, 27, 0.05)' }
          }
        }
      }
    });
  }

  if (statusChartCanvas.value) {
    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(statusChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['PASS', 'HOLD', 'REJECT'],
        datasets: [{
          data: [
            kpiMetrics.value.passCount || 1,
            kpiMetrics.value.holdCount || 0,
            kpiMetrics.value.rejectCount || 0
          ],
          backgroundColor: ['#10b981', '#f59e0b', '#dc2626'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false }
        }
      }
    });
  }
};

const updateCharts = () => {
  if (machineChartInstance) {
    machineChartInstance.data.datasets[0].data = [
      kpiMetrics.value.slittingRolls,
      kpiMetrics.value.rewindRolls,
      kpiMetrics.value.smlRolls
    ];
    machineChartInstance.update();
  }

  if (statusChartInstance) {
    statusChartInstance.data.datasets[0].data = [
      kpiMetrics.value.passCount || 1,
      kpiMetrics.value.holdCount || 0,
      kpiMetrics.value.rejectCount || 0
    ];
    statusChartInstance.update();
  }
};

// =========================================================================
// 8. LIFECYCLE HOOKS
// =========================================================================
onMounted(async () => {
  updateLiveTime();
  liveTimer = setInterval(updateLiveTime, 1000);

  await Promise.all([
    inventoryStore.loadInventory(),
    wipStore.loadWipRolls(),
    labelStore.loadLabels(),
    dataRollStore.loadRolls(),
    spkStore.loadAll(),
    taskStore.loadTasks(),
    opnameStore.loadOpname()
  ]);

  initCharts();
});

onUnmounted(() => {
  if (liveTimer) clearInterval(liveTimer);
  if (machineChartInstance) machineChartInstance.destroy();
  if (statusChartInstance) statusChartInstance.destroy();
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in {
  animation: fadeIn 0.25s ease-out forwards;
}
</style>
