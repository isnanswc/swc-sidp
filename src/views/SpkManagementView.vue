<template>
  <div class="space-y-4 font-sans select-none pb-12 animate-fade-in">
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- HEADER & MAIN NAVIGATION TABS (3 SHEETS)                           -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="bg-white p-3.5 sm:p-4 rounded-3xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3.5 sm:gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-xs border border-zinc-800 shrink-0">
          <svg class="w-5 h-5 sm:w-6 sm:h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div class="min-w-0">
          <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <h1 class="text-sm sm:text-lg font-black text-zinc-900 tracking-tight">MANAJEMEN SPK</h1>
            <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10.5px] font-black bg-red-50 text-red-700 border border-red-200 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              JADWAL SLITTING
            </span>
          </div>
          <p class="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5 line-clamp-1 sm:line-clamp-none">
            Monitoring rencana potong slitting, timeline realtime, & ekstraksi scan AI.
          </p>
        </div>
      </div>

      <!-- 3 SHEETS SWITCHER (RESPONSIVE ON MOBILE) -->
      <div class="flex items-center bg-zinc-100 p-1 sm:p-1.5 rounded-2xl border border-zinc-200/80 gap-1 sm:gap-1.5 text-xs overflow-x-auto custom-scrollbar-x w-full sm:w-auto shrink-0 select-none">
        <button
          @click="activeSheet = 'dashboard'"
          :class="[
            'px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0',
            activeSheet === 'dashboard'
              ? 'bg-zinc-900 text-white shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <span>📊</span>
          <span>1. Dashboard</span>
        </button>

        <button
          @click="activeSheet = 'planned'"
          :class="[
            'px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0',
            activeSheet === 'planned'
              ? 'bg-red-600 text-white shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <span>📝</span>
          <span>2. Planned SPK</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-white/20 text-white">
            {{ spkStore.plans.length }}
          </span>
        </button>

        <button
          @click="activeSheet = 'list'"
          :class="[
            'px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer whitespace-nowrap shrink-0',
            activeSheet === 'list'
              ? 'bg-zinc-900 text-white shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <span>📋</span>
          <span>3. List SPK</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-zinc-200 text-zinc-800">
            {{ allSpkList.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SHEET 1: DASHBOARD SPK (TIMELINE & ANALYTICS)                     -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="activeSheet === 'dashboard'" class="space-y-4 animate-fade-in">
      
      <!-- TOP KPI CARDS -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <!-- KPI 1: Planned vs Actual Meter -->
        <div class="p-3 sm:p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase font-mono truncate">Rencana Meter</span>
            <span class="px-1.5 sm:px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[9px] sm:text-[10px] font-mono font-black border border-blue-200 shrink-0 ml-1">SLIT</span>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black font-mono text-zinc-900">{{ formatNumber(totalPlannedMeterAll) }} <span class="text-xs text-zinc-400 font-normal">m</span></div>
            <div class="text-[10.5px] sm:text-xs text-zinc-500 mt-0.5 font-medium flex items-center justify-between">
              <span class="truncate">Aktual:</span>
              <strong class="font-mono text-emerald-700 ml-1 shrink-0">{{ formatNumber(totalRealizedMeterAll) }} m</strong>
            </div>
            <div class="w-full bg-zinc-100 rounded-full h-1.5 sm:h-2 mt-2 overflow-hidden">
              <div class="bg-blue-600 h-full rounded-full transition-all duration-500" :style="{ width: `${meterAchievementPercent}%` }"></div>
            </div>
          </div>
        </div>

        <!-- KPI 2: Estimasi Waktu & Downtime -->
        <div class="p-3 sm:p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase font-mono truncate">Est. Waktu</span>
            <span class="px-1.5 sm:px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[9px] sm:text-[10px] font-mono font-black border border-purple-200 shrink-0 ml-1">SPEED</span>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black font-mono text-purple-950">{{ formatMinutes(totalEstimatedMinutesAll) }}</div>
            <div class="text-[10.5px] sm:text-xs text-zinc-500 mt-0.5 font-medium space-y-0.5">
              <div class="flex justify-between">
                <span>Potong:</span>
                <strong class="font-mono text-zinc-700">{{ formatMinutes(totalCuttingMinutesAll) }}</strong>
              </div>
              <div class="flex justify-between text-amber-800 truncate">
                <span>CO (18m/JR):</span>
                <strong class="font-mono">{{ formatMinutes(totalChangeOverMinutesAll) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI 3: Estimasi Jam Selesai (ETC) -->
        <div class="p-3 sm:p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase font-mono truncate">Est. Selesai (ETC)</span>
            <span class="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[9px] sm:text-[10px] font-mono font-black border border-emerald-200 shrink-0 ml-1">LIVE</span>
          </div>
          <div class="mt-2">
            <div class="text-xl sm:text-2xl font-black font-mono text-emerald-800">{{ calculatedEtcTimeString }}</div>
            <p class="text-[10px] sm:text-xs text-zinc-500 mt-1 font-medium truncate">
              Speed: 600 m/m (Polos), 400 m/m (Metal)
            </p>
          </div>
        </div>

        <!-- KPI 4: Analisis Kualitas Roll -->
        <div class="p-3 sm:p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[10px] sm:text-[11px] font-bold text-zinc-500 uppercase font-mono truncate">Kualitas Hasil</span>
            <span class="px-1.5 sm:px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[9px] sm:text-[10px] font-mono font-black border border-zinc-200 shrink-0 ml-1">QC</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-1 sm:gap-1.5 text-center font-mono">
            <div class="p-1 sm:p-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
              <div class="text-[9px] sm:text-[9.5px] font-bold text-emerald-700">PASS</div>
              <div class="text-xs sm:text-sm font-black">{{ totalPassAll }}</div>
            </div>
            <div class="p-1 sm:p-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
              <div class="text-[9px] sm:text-[9.5px] font-bold text-amber-700">HOLD</div>
              <div class="text-xs sm:text-sm font-black">{{ totalHoldAll }}</div>
            </div>
            <div class="p-1 sm:p-1.5 rounded-lg bg-red-50 text-red-900 border border-red-200">
              <div class="text-[9px] sm:text-[9.5px] font-bold text-red-700">REJ</div>
              <div class="text-xs sm:text-sm font-black">{{ totalRejectAll }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TIMELINE GANTT: PLANNED VS REALTIME TRACKING (CENTRAL DUAL-SIDE TIMELINE) -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <!-- Header Timeline -->
        <div class="p-3.5 sm:p-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-lg sm:text-xl">⏱️</span>
              <h3 class="text-xs sm:text-base font-black text-white tracking-tight">Timeline Garis Waktu Produksi Slitting (Realtime)</h3>
              <span class="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                H+1
              </span>
            </div>
            <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">
              Sisi Kiri: <strong>Planned SPK</strong> • Sisi Kanan: <strong>Proses Aktual</strong> • Alur Atas ke Bawah
            </p>
          </div>

          <!-- Batch Selector & Date Window Badge -->
          <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto justify-between sm:justify-end">
            <div v-if="spkStore.activeDateWindow" class="px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-[10.5px] sm:text-[11px] border border-zinc-700">
              📅 <strong class="text-emerald-400">{{ spkStore.activeDateWindow.label }}</strong>
            </div>
            <div class="flex items-center gap-1.5 bg-zinc-800/90 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border border-zinc-700">
              <span class="relative flex h-2 sm:h-2.5 w-2 sm:w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2 sm:h-2.5 w-2 sm:w-2.5 bg-emerald-500"></span>
              </span>
              <span class="text-[10px] sm:text-[10.5px] font-bold text-emerald-400 font-mono">ACUAN:</span>
              <select
                v-if="(spkStore.batches || []).length > 0"
                v-model="spkStore.activeTimelineBatchUuid"
                @change="spkStore.setActiveReferenceBatch(spkStore.activeTimelineBatchUuid)"
                class="bg-transparent text-white text-xs font-bold font-mono border-0 outline-none cursor-pointer max-w-[140px] sm:max-w-none truncate"
              >
                <option v-for="b in spkStore.batches" :key="b.uuid" :value="b.uuid" class="bg-zinc-900 text-white">
                  {{ b.batchName }} ({{ b.tanggal }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Executive Realtime Batch Schedule Summary Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-zinc-900 to-slate-950 text-white p-3.5 sm:p-5 border-b border-zinc-800 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3.5 sm:gap-4 select-none">
          <!-- Left: Estimasi Selesai & Remaining Time -->
          <div class="space-y-1.5">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[10.5px] font-black uppercase tracking-wider"
                :class="batchScheduleSummary.isDelayed ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'">
                {{ batchScheduleSummary.isDelayed ? '⚠️ Potensi Terlambat' : '🟢 Sesuai Jadwal' }}
              </span>
              <span class="text-xs text-zinc-300 font-mono">
                Est. Selesai: <strong class="text-white text-sm font-bold">{{ batchScheduleSummary.estimatedCompletionTime }}</strong>
              </span>
            </div>
            <div class="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-zinc-400 font-mono flex-wrap">
              <span>Sisa: <strong class="text-amber-400 font-black">{{ formatMinutes(batchScheduleSummary.remainingMinutes) }}</strong></span>
              <span>•</span>
              <span>Selesai: <strong class="text-emerald-400 font-bold">{{ batchScheduleSummary.completedCount }}</strong> SPK</span>
              <span>•</span>
              <span>Antrean: <strong class="text-zinc-200 font-bold">{{ batchScheduleSummary.upcomingCount }}</strong> SPK</span>
              <span v-if="batchScheduleSummary.skippedCount > 0" class="text-amber-400 font-bold">• Dilewati: {{ batchScheduleSummary.skippedCount }} SPK</span>
            </div>
          </div>

          <!-- Right: Progress Meters & Rolls -->
          <div class="flex items-center gap-2.5 sm:gap-4 text-xs font-mono w-full lg:w-auto">
            <!-- Meter Progress -->
            <div class="bg-zinc-800/80 px-2.5 sm:px-3 py-2 rounded-xl border border-zinc-700 space-y-1 min-w-[110px] sm:min-w-[130px] flex-1 sm:flex-initial">
              <div class="flex justify-between text-[10.5px] sm:text-[11px] text-zinc-400">
                <span>Panjang Meter</span>
                <strong class="text-emerald-400">{{ batchScheduleSummary.meterPercent }}%</strong>
              </div>
              <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-emerald-500 h-full rounded-full transition-all duration-500" :style="{ width: `${batchScheduleSummary.meterPercent}%` }"></div>
              </div>
              <div class="text-[9.5px] sm:text-[10px] text-zinc-300 text-right truncate">
                {{ formatNumber(batchScheduleSummary.totalRealMeter) }} / {{ formatNumber(batchScheduleSummary.totalPlannedMeter) }} m
              </div>
            </div>

            <!-- Roll Progress -->
            <div class="bg-zinc-800/80 px-2.5 sm:px-3 py-2 rounded-xl border border-zinc-700 space-y-1 min-w-[110px] sm:min-w-[130px] flex-1 sm:flex-initial">
              <div class="flex justify-between text-[10.5px] sm:text-[11px] text-zinc-400">
                <span>Roll FG Jadi</span>
                <strong class="text-blue-400">{{ batchScheduleSummary.rollPercent }}%</strong>
              </div>
              <div class="w-full bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                <div class="bg-blue-500 h-full rounded-full transition-all duration-500" :style="{ width: `${batchScheduleSummary.rollPercent}%` }"></div>
              </div>
              <div class="text-[9.5px] sm:text-[10px] text-zinc-300 text-right truncate">
                {{ formatNumber(batchScheduleSummary.totalRealRolls) }} / {{ formatNumber(batchScheduleSummary.totalPlannedRolls) }} Roll
              </div>
            </div>
          </div>
        </div>

        <!-- Legend Bar -->
        <div class="bg-zinc-50 border-b border-zinc-200 px-3.5 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-xs flex-wrap gap-2 select-none">
          <div class="flex items-center gap-2.5 sm:gap-4 text-[10.5px] sm:text-[11px] font-bold flex-wrap">
            <span class="flex items-center gap-1.5 text-emerald-800"><span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-emerald-600"></span> Selesai Terpotong</span>
            <span class="flex items-center gap-1.5 text-blue-800"><span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-blue-600 animate-pulse"></span> Sedang Dikerjakan</span>
            <span class="flex items-center gap-1.5 text-zinc-600"><span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-zinc-300"></span> Antrean</span>
            <span class="flex items-center gap-1.5 text-amber-800"><span class="w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full bg-amber-500"></span> Order Sisipan</span>
          </div>
          <div class="text-[10px] sm:text-[11px] font-mono text-zinc-500">
            ⬇️ <strong>Alur: Atas ke Bawah</strong>
          </div>
        </div>

        <!-- Central Timeline Canvas Container -->
        <div class="p-2.5 sm:p-6 bg-zinc-100/50 min-h-[350px] overflow-x-auto custom-scrollbar-x">
          <div v-if="timelineRows.length === 0" class="py-16 text-center text-zinc-400 font-sans text-xs">
            Belum ada data rencana kerja SPK. Pindai dokumen jadwal atau buat batch baru di Sheet 3.
          </div>

          <div v-else class="relative max-w-5xl mx-auto min-w-[540px] sm:min-w-0">
            <!-- Mobile scroll hint -->
            <div class="sm:hidden text-[10px] text-zinc-500 text-center mb-2 font-medium bg-white/70 py-1 px-3 rounded-full border border-zinc-200 inline-block w-full">
              ↔️ Geser ke samping untuk melihat timeline lengkap
            </div>
            <!-- Center Vertical Line -->
            <div class="absolute left-1/2 top-7 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-zinc-300 -translate-x-1/2"></div>

            <!-- Column Headers -->
            <div class="grid grid-cols-2 gap-2 sm:gap-6 mb-4 sm:mb-6 text-[10px] sm:text-xs font-black uppercase tracking-wider text-zinc-500 select-none">
              <div class="text-right pr-2.5 sm:pr-6 flex items-center justify-end gap-1.5 text-zinc-700">
                <span class="truncate">📋 Rencana Kerja (Planned)</span>
              </div>
              <div class="text-left pl-2.5 sm:pl-6 flex items-center justify-start gap-1.5 text-zinc-700">
                <span class="truncate">🏭 Aktual Lapangan (Realtime)</span>
              </div>
            </div>

            <!-- Timeline Rows -->
            <div
              v-for="(row, rIdx) in timelineRows"
              :key="row.id || rIdx"
              class="relative flex items-center mb-8 last:mb-2 group"
            >
              <!-- LEFT COLUMN: PLANNED SPK -->
              <div class="w-1/2 pr-2.5 sm:pr-6 md:pr-8 flex justify-end">
                <!-- If Planned SPK exists -->
                <div
                  v-if="row.plan"
                  class="w-full max-w-md bg-white rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 shadow-xs hover:shadow-md transition-all text-right space-y-1.5 sm:space-y-2"
                  :class="[
                    row.status === 'COMPLETED' ? 'border-emerald-300 bg-emerald-50/20' : '',
                    row.status === 'IN_PROGRESS' ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-500/20' : '',
                    row.status === 'SKIPPED' ? 'border-amber-400 bg-amber-50/40 border-dashed ring-2 ring-amber-400/20' : '',
                    row.status === 'UPCOMING' ? 'border-zinc-200' : ''
                  ]"
                >
                  <div class="flex items-center justify-between flex-row-reverse gap-2">
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight"
                      :class="[
                        row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : '',
                        row.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse' : '',
                        row.status === 'SKIPPED' ? 'bg-amber-100 text-amber-900 border border-amber-300 font-bold' : '',
                        row.status === 'UPCOMING' ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' : ''
                      ]"
                    >
                      {{ row.status === 'COMPLETED' ? '✓ SELESAI' : (row.status === 'IN_PROGRESS' ? '⚙️ SEDANG BERJALAN' : (row.status === 'SKIPPED' ? '⏭️ DILEWATI (Dilompati)' : '⏱️ ANTREAN')) }}
                    </span>
                    <div class="flex items-center gap-1.5">
                      <span class="text-xs font-mono font-bold text-zinc-400">#{{ row.plan.seq || (rIdx + 1) }}</span>
                      <h4 class="font-black text-xs sm:text-sm font-mono text-zinc-900 truncate max-w-[95px] sm:max-w-none">{{ row.plan.spkNo }}</h4>
                    </div>
                  </div>

                  <div class="text-xs text-zinc-600 font-mono flex items-center justify-end gap-2 flex-wrap">
                    <span class="px-1.5 py-0.2 rounded bg-red-50 text-red-700 font-bold border border-red-200">
                      {{ row.plan.formula }} ({{ row.plan.thickness }}μ)
                    </span>
                    <span>Lebar JR: {{ formatNumber(row.plan.lebarParent) }} mm</span>
                    <span class="font-bold text-purple-900">{{ row.plan.jumlahJumbo }} JR ({{ row.totalUp }} UP)</span>
                  </div>

                  <div class="text-[11px] text-zinc-500 font-mono flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
                    <span>Target: <strong class="text-zinc-800">{{ formatNumber(row.plan.totalPlannedMeter) }} m</strong></span>
                    <span>•</span>
                    <span>Speed: {{ row.speed }} m/m</span>
                    <span>•</span>
                    <span class="font-bold text-purple-800">Est: {{ row.planDurationMinutes }} Mnt</span>
                  </div>

                  <div v-if="row.status === 'SKIPPED'" class="text-[10.5px] text-amber-800 font-bold bg-amber-100/70 p-1.5 rounded-lg text-center border border-amber-200">
                    ⚠️ Plan Dilompati: Operator langsung mengerjakan nomor SPK setelah ini.
                  </div>
                  <div v-else class="text-[10px] text-zinc-400 font-mono">
                    Perkiraan Waktu: Pukul <strong class="text-zinc-700">{{ row.estStartTime }}</strong> s/d <strong class="text-zinc-700">{{ row.estEndTime }}</strong>
                  </div>
                </div>

                <!-- If Unplanned SPK (Blank slot on the left) -->
                <div
                  v-else
                  class="w-full max-w-md bg-amber-50/40 border-2 border-dashed border-amber-300 rounded-2xl p-4 text-right space-y-1"
                >
                  <div class="flex items-center justify-end gap-1.5 text-amber-900 font-black text-xs">
                    <span>⚠️ Slot Kosong (Tanpa Planned SPK)</span>
                  </div>
                  <p class="text-[11px] text-amber-800/80 font-sans">
                    Pengerjaan aktual di lapangan ini merupakan order sisipan atau revisi langsung tanpa jadwal awal.
                  </p>
                </div>
              </div>

              <!-- CENTER NODE (ICON / STATUS) -->
              <div class="absolute left-1/2 -translate-x-1/2 z-10 flex items-center justify-center">
                <div
                  class="w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-mono font-black text-[10px] sm:text-xs shadow-md border-2 border-white transition-transform group-hover:scale-110"
                  :class="[
                    row.status === 'COMPLETED' ? 'bg-emerald-600 text-white shadow-emerald-200' : '',
                    row.status === 'IN_PROGRESS' ? 'bg-blue-600 text-white shadow-blue-200 animate-bounce' : '',
                    row.status === 'SKIPPED' ? 'bg-amber-500 text-white shadow-amber-200 ring-2 ring-amber-300' : '',
                    row.status === 'UPCOMING' ? 'bg-white text-zinc-600 border-zinc-300' : '',
                    row.status === 'UNPLANNED' ? 'bg-amber-500 text-white shadow-amber-200' : ''
                  ]"
                >
                  <span v-if="row.status === 'COMPLETED'">✓</span>
                  <span v-else-if="row.status === 'IN_PROGRESS'">⚙️</span>
                  <span v-else-if="row.status === 'SKIPPED'">⏭️</span>
                  <span v-else-if="row.status === 'UNPLANNED'">⚠️</span>
                  <span v-else>{{ rIdx + 1 }}</span>
                </div>
              </div>

              <!-- RIGHT COLUMN: ACTUAL REALTIME PRODUCTION -->
              <div class="w-1/2 pl-2.5 sm:pl-6 md:pl-8 flex justify-start">
                <!-- If Actual Production Exists -->
                <div
                  v-if="row.actual"
                  class="w-full max-w-md bg-white rounded-xl sm:rounded-2xl border p-2.5 sm:p-4 shadow-xs hover:shadow-md transition-all text-left space-y-1.5 sm:space-y-2"
                  :class="[
                    row.status === 'COMPLETED' ? 'border-emerald-300 bg-emerald-50/20' : '',
                    row.status === 'IN_PROGRESS' ? 'border-blue-400 bg-blue-50/30 ring-2 ring-blue-500/20' : '',
                    row.status === 'UNPLANNED' ? 'border-amber-400 bg-amber-50/30' : ''
                  ]"
                >
                  <div class="flex items-center justify-between gap-2">
                    <h4 class="font-black text-xs sm:text-sm font-mono text-zinc-900 truncate max-w-[95px] sm:max-w-none">{{ row.actual.spkNo }}</h4>
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-black font-mono"
                      :class="row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' : (row.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')"
                    >
                      {{ row.actual.totalRealRolls }} Roll Selesai
                    </span>
                  </div>

                  <!-- Precision Production Metrics Grid: Parent, Child & Variance -->
                  <div class="grid grid-cols-2 gap-1.5 p-2 bg-slate-50 rounded-xl border border-slate-200 text-[11px] font-mono">
                    <!-- Parent Cut vs Plan -->
                    <div class="flex flex-col">
                      <span class="text-[9px] text-zinc-400 uppercase font-semibold">Parent Cut</span>
                      <div class="flex items-center gap-1 font-bold text-zinc-800">
                        <span>{{ row.actualParentCut || 0 }} / {{ row.plannedParentRolls || 1 }} JR</span>
                        <span class="px-1 py-0.2 rounded text-[9px]" :class="(row.diffParent || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : ((row.diffParent || 0) > 0 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')">
                          {{ (row.diffParent || 0) > 0 ? `+${row.diffParent}` : (row.diffParent || 0) }}
                        </span>
                      </div>
                    </div>

                    <!-- Child Slit Roll FG vs Plan -->
                    <div class="flex flex-col">
                      <span class="text-[9px] text-zinc-400 uppercase font-semibold">Child Roll FG</span>
                      <div class="flex items-center gap-1 font-bold text-zinc-800">
                        <span>{{ row.actualChildRolls || 0 }} / {{ row.plannedChildRolls || 2 }} Roll</span>
                        <span class="px-1 py-0.2 rounded text-[9px]" :class="(row.diffChild || 0) === 0 ? 'bg-emerald-100 text-emerald-800' : ((row.diffChild || 0) > 0 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800')">
                          {{ (row.diffChild || 0) > 0 ? `+${row.diffChild}` : (row.diffChild || 0) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div class="text-xs font-mono text-zinc-700 flex items-center justify-between gap-2 flex-wrap">
                    <div>
                      <strong class="text-emerald-700 font-black">{{ formatNumber(row.actual.totalRealMeter) }} m</strong>
                      <span class="text-zinc-300 mx-1">•</span>
                      <strong class="text-zinc-900 font-bold">{{ formatNumber(row.actual.totalRealKg) }} kg</strong>
                    </div>
                    <span v-if="row.actual.operator" class="text-zinc-500 text-[10px] font-semibold">Op: {{ row.actual.operator }}</span>
                  </div>

                  <!-- Actual Duration vs Plan Target -->
                  <div class="text-[10px] font-mono flex items-center justify-between pt-1 border-t border-zinc-100 text-zinc-500">
                    <span>⏱️ Durasi: <strong class="text-zinc-800">{{ row.actualDurationMinutes }} Menit</strong></span>
                    <span class="text-[9.5px] font-semibold" :class="row.actualDurationMinutes <= row.planDurationMinutes ? 'text-emerald-700' : 'text-amber-700'">
                      (Plan: {{ row.planDurationMinutes }} Mnt{{ row.actualDurationMinutes > row.planDurationMinutes ? ` | +${row.actualDurationMinutes - row.planDurationMinutes} Mnt` : '' }})
                    </span>
                  </div>

                  <!-- Waktu Mulai & Selesai Realisasi -->
                  <div class="text-[10px] font-mono flex items-center justify-between pt-1 border-t border-zinc-100 text-zinc-600">
                    <div class="flex items-center gap-1">
                      <span>🕒 Mulai:</span>
                      <strong class="text-zinc-800">{{ row.startTimeFormatted || '-' }}</strong>
                    </div>
                    <div class="flex items-center gap-1">
                      <span>🏁 Selesai:</span>
                      <strong class="text-zinc-800">{{ row.endTimeFormatted || '-' }}</strong>
                    </div>
                  </div>

                  <!-- Target Status Badge (5 States) -->
                  <div
                    v-if="row.targetStatus"
                    class="flex items-center justify-between px-2.5 py-1 rounded-lg border text-[10.5px] font-mono font-bold"
                    :class="[row.targetStatus.badgeClass, row.targetStatus.borderClass]"
                  >
                    <div class="flex items-center gap-1.5">
                      <span>{{ row.targetStatus.icon }}</span>
                      <span>Status Target:</span>
                      <span>{{ row.targetStatus.label }}</span>
                    </div>
                    <span class="text-[9.5px]">{{ row.achievementPercent || 0 }}% Target</span>
                  </div>

                  <!-- QC Badges -->
                  <div class="flex items-center gap-1.5 text-[10.5px] font-mono font-bold pt-1 border-t border-zinc-100">
                    <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">Pass: {{ row.actual.passCount }}</span>
                    <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">Hold: {{ row.actual.holdCount }}</span>
                    <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-900">Reject: {{ row.actual.rejectCount }}</span>
                    <span v-if="row.actual.latestLot" class="text-zinc-400 text-[9.5px] ml-auto truncate max-w-[100px]">Lot: {{ row.actual.latestLot }}</span>
                  </div>
                </div>

                <!-- If Pending / Waiting for Machine (Right side blank) -->
                <div
                  v-else
                  class="w-full max-w-md bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl p-4 text-left flex items-center justify-center text-zinc-400 text-xs font-mono select-none"
                >
                  <span v-if="row.status === 'SKIPPED'" class="text-amber-600 font-bold">⏭️ Dilewati (Tidak Dikerjakan)</span>
                  <span v-else>⏱️ Menunggu giliran pemotongan mesin...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SHEET 3: LIST SPK (INHOUSE & EXTERNAL TABS, TIMELINE SORTED)       -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeSheet === 'list'" class="space-y-4 animate-fade-in">
      
      <!-- SUB-TABS: SPK NORMAL (INHOUSE) & SPK LAIN-LAIN (EXTERNAL) -->
      <div class="bg-white p-2.5 sm:p-3 rounded-3xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div class="flex items-center gap-1.5 p-1 bg-zinc-100 rounded-2xl border border-zinc-200/80 overflow-x-auto custom-scrollbar-x">
          <button
            @click="spkListTab = 'inhouse'"
            :class="[
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
              spkListTab === 'inhouse'
                ? 'bg-zinc-900 text-white shadow-xs font-black'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            ]"
          >
            <span>🏭</span>
            <span>SPK Normal (Inhouse)</span>
            <span :class="['px-2 py-0.5 rounded-full text-[10px] font-mono font-black', spkListTab === 'inhouse' ? 'bg-red-600 text-white' : 'bg-zinc-200 text-zinc-800']">
              {{ inhouseSpkList.length }}
            </span>
          </button>

          <button
            @click="spkListTab = 'external'"
            :class="[
              'px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
              spkListTab === 'external'
                ? 'bg-purple-900 text-white shadow-xs font-black'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
            ]"
          >
            <span>🌐</span>
            <span>SPK Lain-lain (External)</span>
            <span :class="['px-2 py-0.5 rounded-full text-[10px] font-mono font-black', spkListTab === 'external' ? 'bg-purple-600 text-white' : 'bg-zinc-200 text-zinc-800']">
              {{ externalSpkList.length }}
            </span>
          </button>
        </div>

        <!-- Quick Summary Metrics for Active Tab -->
        <div class="flex items-center gap-2.5 sm:gap-4 text-xs font-mono px-1 flex-wrap">
          <div class="text-zinc-500">
            Total: <strong class="text-zinc-900 font-bold font-mono">{{ currentTabSpkList.length }}</strong> SPK
          </div>
          <div class="text-zinc-300">•</div>
          <div class="text-zinc-500">
            Roll: <strong class="text-emerald-700 font-bold font-mono">{{ formatNumber(currentTabSpkList.reduce((acc, s) => acc + (s.totalRealRolls || 0), 0)) }}</strong>
          </div>
          <div class="text-zinc-300">•</div>
          <div class="text-zinc-500">
            Meter: <strong class="text-blue-700 font-bold font-mono">{{ formatNumber(currentTabSpkList.reduce((acc, s) => acc + (s.totalRealMeter || 0), 0)) }} m</strong>
          </div>
        </div>
      </div>

      <!-- Filters & Controls Bar -->
      <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 sm:gap-3">
        <!-- Search Input -->
        <div class="flex items-center gap-2 flex-1 min-w-[220px]">
          <div class="relative w-full">
            <input
              v-model="searchSpkQuery"
              :placeholder="spkListTab === 'inhouse' ? 'Cari SPK inhouse, no urut, formula, atau mesin...' : 'Cari SPK external, vendor (Panverta, Trias...), spek...'"
              class="w-full pl-8 pr-7 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono"
            />
            <span class="absolute left-2.5 top-2.5 text-zinc-400 text-xs">🔍</span>
            <button
              v-if="searchSpkQuery"
              @click="searchSpkQuery = ''"
              class="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 font-bold text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Filter Dropdowns & Sorting -->
        <div class="flex items-center gap-2 flex-wrap text-xs">
          <!-- Filter Tahun -->
          <div class="flex items-center gap-1">
            <span class="text-zinc-400 text-[11px] font-medium">Tahun:</span>
            <select v-model="spkFilterYear" class="p-1.5 border border-zinc-300 rounded-lg text-xs bg-white font-mono font-bold">
              <option value="ALL">Semua Tahun</option>
              <option v-for="y in availableSpkYears" :key="y" :value="y">{{ y }}</option>
            </select>
          </div>

          <!-- Filter Bulan -->
          <div class="flex items-center gap-1">
            <span class="text-zinc-400 text-[11px] font-medium">Bulan:</span>
            <select v-model="spkFilterMonth" class="p-1.5 border border-zinc-300 rounded-lg text-xs bg-white font-mono">
              <option v-for="m in availableSpkMonths" :key="m.val" :value="m.val">{{ m.label }}</option>
            </select>
          </div>

          <!-- Filter Mesin -->
          <div class="flex items-center gap-1">
            <span class="text-zinc-400 text-[11px] font-medium">Mesin:</span>
            <select v-model="spkFilterMachine" class="p-1.5 border border-zinc-300 rounded-lg text-xs bg-white font-mono">
              <option v-for="m in availableSpkMachines" :key="m" :value="m">{{ m === 'ALL' ? 'Semua Mesin' : m }}</option>
            </select>
          </div>

          <!-- Sort Direction Toggle -->
          <button
            @click="spkSortDirection = spkSortDirection === 'desc' ? 'asc' : 'desc'"
            class="px-2.5 py-1.5 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 font-mono font-bold flex items-center gap-1.5 text-zinc-700 cursor-pointer"
            :title="spkSortDirection === 'desc' ? 'Garis waktu terbaru dulu' : 'Garis waktu terlama dulu'"
          >
            <span>{{ spkSortDirection === 'desc' ? '⏳ Terbaru' : '⌛ Terlama' }}</span>
            <span class="text-[10px]">{{ spkSortDirection === 'desc' ? '↓' : '↑' }}</span>
          </button>
        </div>
      </div>

      <!-- SPK Summary Table -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto custom-scrollbar-x">
          <table class="w-full text-xs">
            <thead class="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-bold">
              <tr>
                <th class="px-4 py-3 text-left w-12 font-mono">#</th>
                <th class="px-4 py-3 text-left">Nomor SPK & Partner</th>
                <th class="px-4 py-3 text-left">Garis Waktu</th>
                <th class="px-4 py-3 text-left">Formula & Mesin</th>
                <th class="px-4 py-3 text-right">Hasil Aktual</th>
                <th class="px-4 py-3 text-center">Status Mutu (QC)</th>
                <th class="px-4 py-3 text-center">Alokasi / JR</th>
                <th class="px-4 py-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 font-mono">
              <tr v-if="filteredSpkList.length === 0">
                <td colspan="8" class="py-12 text-center text-zinc-400 font-sans text-xs">
                  Tidak ada data SPK {{ spkListTab === 'inhouse' ? 'Inhouse' : 'External' }} yang cocok dengan filter
                </td>
              </tr>
              <tr
                v-for="(item, idx) in paginatedActiveSpkList"
                :key="item.spkNo"
                class="hover:bg-blue-50/50 transition-colors cursor-pointer"
                @click="openQuickDrawer(item)"
              >
                <td class="px-4 py-3 text-zinc-400 font-bold">{{ (spkCurrentPage - 1) * spkPageSize + idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="font-black text-sm text-zinc-900 flex items-center gap-1.5 flex-wrap">
                    <span>{{ item.spkNo }}</span>
                    <span
                      :class="[
                        'text-[9.5px] px-1.5 py-0.2 rounded font-bold font-mono',
                        item.category === 'INHOUSE' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      ]"
                    >
                      {{ item.category === 'INHOUSE' ? 'INHOUSE' : item.vendor }}
                    </span>
                    <span v-if="item.isTrial" class="text-[9px] px-1.5 py-0.2 rounded font-bold bg-amber-100 text-amber-800 font-mono">
                      TRIAL
                    </span>
                  </div>
                  <div class="text-[10.5px] text-zinc-400 font-sans mt-0.5">
                    {{ item.plan ? `Rencana: ${item.plan.docNo || '3B-PROD'}` : 'Riwayat Data Roll' }}
                  </div>
                </td>
                <td class="px-4 py-3 text-zinc-700">
                  <div class="font-black font-mono text-zinc-900 flex items-center gap-1.5">
                    <span>{{ item.year }} • {{ item.monthName }}</span>
                    <span v-if="item.romanMonth" class="text-zinc-400 font-normal">({{ item.romanMonth }})</span>
                  </div>
                  <div class="text-[10.5px] text-zinc-500 font-sans mt-0.5 flex items-center gap-1">
                    <span v-if="item.noUrut !== null" class="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-800 font-mono font-bold text-[10px]">
                      No. Urut: {{ item.noUrut }}
                    </span>
                    <span v-else class="text-zinc-400 italic">Non-urutan</span>
                  </div>
                </td>
                <td class="px-4 py-3">
                  <div class="flex items-center gap-1 flex-wrap">
                    <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold text-[11px]">
                      {{ item.formula }} {{ item.thickness !== '-' ? `(${item.thickness}μ)` : '' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-zinc-500 mt-1 font-sans flex items-center gap-1 flex-wrap">
                    <span v-for="m in item.machines" :key="m" class="px-1.5 py-0.2 rounded bg-zinc-200/70 text-zinc-700 font-mono text-[9px] font-bold">
                      {{ m }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="font-black text-emerald-700 text-sm">{{ item.totalRealRolls }} Roll</div>
                  <div class="text-[10px] text-zinc-400 font-sans mt-0.5">
                    {{ formatNumber(item.totalRealMeter) }} m • {{ formatNumber(item.totalRealKg) }} kg
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1 text-[10px] font-bold font-mono">
                    <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800" title="Pass / OK">{{ item.passCount }} OK</span>
                    <span v-if="item.holdCount > 0" class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800" title="Hold">{{ item.holdCount }} H</span>
                    <span v-if="item.rejectCount > 0" class="px-1.5 py-0.2 rounded bg-red-100 text-red-800" title="Reject">{{ item.rejectCount }} R</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center font-bold text-zinc-700">
                  <div class="font-mono">{{ item.totalJumbo }} JR</div>
                  <div v-if="item.plan" class="text-[9.5px] font-sans text-emerald-700 font-bold">
                    {{ item.achievementPercent }}% Target
                  </div>
                </td>
                <td class="px-4 py-3 text-center" @click.stop>
                  <button
                    @click="openSpkDetailDrawer(item)"
                    class="px-3 py-1 bg-zinc-900 hover:bg-black text-white text-[10.5px] font-bold rounded-lg transition-colors cursor-pointer"
                  >
                    Detail SPK →
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION BAR -->
        <div class="p-3 sm:p-3.5 bg-zinc-50 border-t border-zinc-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div class="text-zinc-500 font-medium text-center sm:text-left">
            Menampilkan <strong class="text-zinc-900 font-bold font-mono">{{ ((spkCurrentPage - 1) * spkPageSize) + (filteredSpkList.length ? 1 : 0) }} – {{ Math.min(spkCurrentPage * spkPageSize, filteredSpkList.length) }}</strong> dari <strong class="text-zinc-900 font-bold font-mono">{{ filteredSpkList.length }}</strong> SPK
          </div>

          <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto flex-wrap">
            <div class="flex items-center gap-1.5">
              <span class="text-zinc-400 font-medium text-[11px]">Baris:</span>
              <select v-model.number="spkPageSize" class="p-1 border border-zinc-300 rounded-lg text-xs bg-white font-mono">
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
              </select>
            </div>

            <div class="flex items-center gap-1 font-mono">
              <button
                @click="spkCurrentPage = Math.max(1, spkCurrentPage - 1)"
                :disabled="spkCurrentPage <= 1"
                class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ‹ Sebelumnya
              </button>
              <span class="px-2 py-1 text-zinc-600 font-bold">
                {{ spkCurrentPage }} / {{ totalSpkPages }}
              </span>
              <button
                @click="spkCurrentPage = Math.min(totalSpkPages, spkCurrentPage + 1)"
                :disabled="spkCurrentPage >= totalSpkPages"
                class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                Selanjutnya ›
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- DEDICATED FULL PAGE VIEW: DETAIL SPK (BUKAN MODAL / SELESAI SESAK)-->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeSheet === 'detail' && selectedDetailSpk" class="space-y-4 animate-fade-in">
      
      <!-- Top Navigation & Action Bar -->
      <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-3">
          <button
            @click="activeSheet = 'list'"
            class="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <span>←</span>
            <span>Kembali ke List SPK Aktif</span>
          </button>
          <div class="h-6 w-px bg-zinc-200"></div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold">DETAIL SPK</span>
              <h2 class="text-lg font-black font-mono tracking-tight text-zinc-900">{{ selectedDetailSpk.spkNo }}</h2>
              <span
                :class="[
                  'text-[10px] px-2.5 py-0.5 rounded-full font-bold font-mono',
                  selectedDetailSpk.isSupplierInhouse !== false ? 'bg-blue-50 text-blue-800 border border-blue-200' : 'bg-purple-50 text-purple-800 border border-purple-200'
                ]"
              >
                {{ selectedDetailSpk.supplier }}
              </span>
              <span v-if="selectedDetailSpk.isCrossOrderWarning" class="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200 font-bold">
                ⚠️ Multi-Item SPK
              </span>
            </div>
            <p class="text-xs text-zinc-500 mt-0.5">Integrasi Data Terpadu: Dokumen SPK 3B-PROD, Management Label & Data Roll</p>
          </div>
        </div>

        <!-- Quick Metrics in Header -->
        <div class="flex items-center gap-3 font-mono text-xs">
          <div class="px-3.5 py-2 rounded-xl bg-zinc-50 border border-zinc-200 text-right">
            <div class="text-[10px] text-zinc-400 font-sans font-medium">Pencapaian Produksi</div>
            <div class="font-black text-sm text-zinc-900">{{ selectedDetailSpk.achievementPercent }}%</div>
          </div>
          <div class="px-3.5 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-right">
            <div class="text-[10px] text-emerald-700 font-sans font-medium">Hasil Jadi Fisik</div>
            <div class="font-black text-sm text-emerald-900">{{ selectedDetailSpk.totalRealRolls }} Roll</div>
          </div>
        </div>
      </div>

      <!-- KPI METRICS GRID (4 CARDS FULL WIDTH) -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs">
          <div class="text-xs font-bold text-zinc-400 mb-1">INFORMASI DASAR</div>
          <div class="font-black text-base text-zinc-900 font-mono">{{ selectedDetailSpk.year }} / {{ selectedDetailSpk.monthName }}</div>
          <div class="text-xs text-zinc-600 mt-1 font-sans">Formula: <strong class="text-purple-900 font-mono">{{ selectedDetailSpk.formula }} ({{ selectedDetailSpk.thickness }}μ)</strong></div>
          <div class="text-xs text-zinc-600 font-sans">Alokasi JR: <strong class="text-amber-900 font-mono">{{ selectedDetailSpk.totalJumbo }} JR</strong></div>
        </div>

        <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs">
          <div class="text-xs font-bold text-zinc-400 mb-1">TOTAL BERAT BERSIH</div>
          <div class="font-black text-xl text-emerald-800 font-mono">{{ formatNumber(selectedDetailSpk.totalRealKg) }} kg</div>
          <div class="text-xs text-zinc-600 mt-1 font-sans">Total Roll Fisik: <strong class="text-zinc-900 font-mono">{{ selectedDetailSpk.totalRealRolls }} Roll</strong></div>
          <div class="text-xs text-zinc-500 font-sans">Rata-rata: {{ selectedDetailSpk.totalRealRolls > 0 ? (selectedDetailSpk.totalRealKg / selectedDetailSpk.totalRealRolls).toFixed(1) : 0 }} kg/roll</div>
        </div>

        <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs">
          <div class="text-xs font-bold text-zinc-400 mb-1">TOTAL PANJANG AKTUAL</div>
          <div class="font-black text-xl text-purple-900 font-mono">{{ formatNumber(selectedDetailSpk.totalRealMeter) }} m</div>
          <div class="text-xs text-zinc-600 mt-1 font-sans">Speed Mesin: <strong class="text-zinc-900 font-mono">{{ selectedDetailSpk.speed }} m/menit</strong></div>
          <div class="text-xs text-zinc-500 font-sans">Estimasi Waktu: {{ selectedDetailSpk.totalMinutes }} menit</div>
        </div>

        <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-xs">
          <div class="text-xs font-bold text-zinc-400 mb-1">STATUS MUTU (QC)</div>
          <div class="grid grid-cols-3 gap-1.5 text-center font-mono font-bold mt-1.5">
            <div class="p-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300">
              <div class="text-[9.5px]">PASS</div>
              <div class="text-sm font-black">{{ selectedDetailSpk.passCount }}</div>
            </div>
            <div class="p-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300">
              <div class="text-[9.5px]">HOLD</div>
              <div class="text-sm font-black">{{ selectedDetailSpk.holdCount }}</div>
            </div>
            <div class="p-1.5 rounded-xl bg-red-100 text-red-900 border border-red-300">
              <div class="text-[9.5px]">REJECT</div>
              <div class="text-sm font-black">{{ selectedDetailSpk.rejectCount }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- SECTION 1: RINGKASAN HASIL PER UKURAN ROLL TURUNAN (TABEL LEGA & LEBAR) -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-zinc-200 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <span class="text-base">📐</span>
            <div>
              <h3 class="font-black text-sm text-zinc-900">Ringkasan Hasil per Ukuran Roll Turunan</h3>
              <p class="text-xs text-zinc-500">Breakdown roll jadi berdasarkan variasi ukuran lebar hasil pemotongan pisau slitting</p>
            </div>
          </div>
          <span class="px-3 py-1 rounded-full bg-zinc-100 font-mono font-bold text-xs text-zinc-700">
            {{ (selectedDetailSpk.widthSummaries || []).length }} Ukuran Teridentifikasi
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono">
            <thead class="bg-zinc-100/80 border-b border-zinc-200 text-zinc-700 font-bold">
              <tr>
                <th class="px-4 py-3 text-center w-12">No</th>
                <th class="px-4 py-3 text-left">Ukuran Lebar</th>
                <th class="px-4 py-3 text-center">Jumlah Roll Jadi</th>
                <th class="px-4 py-3 text-right">Total Meter Jalan</th>
                <th class="px-4 py-3 text-right">Total Berat Bersih (kg)</th>
                <th class="px-4 py-3 text-right">Rata-rata Berat / Roll</th>
                <th class="px-4 py-3 text-center font-sans">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200">
              <tr v-if="!selectedDetailSpk.widthSummaries || selectedDetailSpk.widthSummaries.length === 0">
                <td colspan="7" class="py-8 text-center text-zinc-400 font-sans">Belum ada data roll turunan untuk SPK ini</td>
              </tr>
              <tr
                v-for="(w, wIdx) in selectedDetailSpk.widthSummaries"
                :key="w.width"
                class="hover:bg-zinc-50"
              >
                <td class="px-4 py-3 text-center text-zinc-400 font-bold">{{ wIdx + 1 }}</td>
                <td class="px-4 py-3 font-black text-sm text-zinc-900">
                  {{ w.width }} mm
                </td>
                <td class="px-4 py-3 text-center font-black text-emerald-700 text-sm">
                  {{ w.totalRoll }} Roll
                </td>
                <td class="px-4 py-3 text-right font-bold text-purple-900">
                  {{ formatNumber(w.totalMeter) }} m
                </td>
                <td class="px-4 py-3 text-right font-bold text-zinc-900">
                  {{ formatNumber(w.totalKg) }} kg
                </td>
                <td class="px-4 py-3 text-right text-zinc-600">
                  {{ w.totalRoll > 0 ? (w.totalKg / w.totalRoll).toFixed(1) : 0 }} kg
                </td>
                <td class="px-4 py-3 text-center font-sans">
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Siap Kirim / Finishing
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- SECTION 2: DAFTAR NOMOR LOT FISIK TERDAFTAR (PAGINASI & SEARCH) -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-zinc-200 flex items-center justify-between flex-wrap gap-3">
          <div class="flex items-center gap-2">
            <span class="text-base">🏷️</span>
            <div>
              <h3 class="font-black text-sm text-zinc-900">Daftar Nomor Lot Fisik Terdaftar</h3>
              <p class="text-xs text-zinc-500">Seluruh roll yang terdata di Management Label / Data Roll untuk SPK ini</p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <input
              v-model="detailPageLotSearch"
              placeholder="Cari nomor lot, operator..."
              class="px-3 py-1.5 text-xs border border-zinc-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-red-500 w-64"
            />
            <span class="text-xs font-mono font-bold text-zinc-500">
              {{ filteredDetailPageLots.length }} / {{ (selectedDetailSpk.realLots || []).length }} Lot
            </span>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono">
            <thead class="bg-zinc-900 text-white font-bold">
              <tr>
                <th class="px-4 py-3 text-center w-12">No</th>
                <th class="px-4 py-3 text-left">Nomor Lot / Barcode</th>
                <th class="px-4 py-3 text-right">Ukuran (Lebar × Panjang)</th>
                <th class="px-4 py-3 text-right">Berat Netto</th>
                <th class="px-4 py-3 text-left">Operator / Mesin</th>
                <th class="px-4 py-3 text-center">Tanggal Produksi</th>
                <th class="px-4 py-3 text-center">Sumber</th>
                <th class="px-4 py-3 text-center">Status QC</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200">
              <tr v-if="filteredDetailPageLots.length === 0">
                <td colspan="8" class="py-12 text-center text-zinc-400 font-sans">
                  Tidak ada data nomor lot yang cocok
                </td>
              </tr>
              <tr
                v-for="(lot, lIdx) in paginatedDetailPageLots"
                :key="lot.id || (lot.lot + '_' + lIdx)"
                class="hover:bg-blue-50/30 transition-colors"
              >
                <td class="px-4 py-2.5 text-center text-zinc-400 font-bold">
                  {{ (detailPageLotCurrentPage - 1) * detailPageLotPageSize + lIdx + 1 }}
                </td>
                <td class="px-4 py-2.5 font-black text-zinc-900 text-sm">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span>{{ lot.lot }}</span>
                    <span v-if="lot.turunan && !lot.lot.includes(lot.turunan)" class="px-1.5 py-0.5 rounded text-[10.5px] font-mono font-bold bg-blue-100 text-blue-800">
                      {{ lot.turunan }}
                    </span>
                  </div>
                </td>
                <td class="px-4 py-2.5 text-right font-bold text-zinc-700">
                  {{ lot.width }} mm × {{ formatNumber(lot.length) }} m
                </td>
                <td class="px-4 py-2.5 text-right font-bold text-emerald-800">
                  {{ formatNumber(lot.weight) }} kg
                </td>
                <td class="px-4 py-2.5 text-zinc-600 font-sans">
                  {{ lot.operator || '-' }}
                </td>
                <td class="px-4 py-2.5 text-center text-zinc-500">
                  {{ lot.date ? String(lot.date).slice(0, 10) : '-' }}
                </td>
                <td class="px-4 py-2.5 text-center">
                  <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700">
                    {{ lot.source }}
                  </span>
                </td>
                <td class="px-4 py-2.5 text-center">
                  <span
                    :class="[
                      'px-2.5 py-1 rounded-full text-[10.5px] font-black',
                      lot.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : (lot.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
                    ]"
                  >
                    {{ lot.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- LOT PAGINATION BAR -->
        <div v-if="filteredDetailPageLots.length > detailPageLotPageSize" class="p-3 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between text-xs font-mono">
          <div class="text-zinc-500">
            Menampilkan {{ (detailPageLotCurrentPage - 1) * detailPageLotPageSize + 1 }} - {{ Math.min(detailPageLotCurrentPage * detailPageLotPageSize, filteredDetailPageLots.length) }} dari {{ filteredDetailPageLots.length }} Lot
          </div>
          <div class="flex items-center gap-1">
            <button
              @click="detailPageLotCurrentPage = Math.max(1, detailPageLotCurrentPage - 1)"
              :disabled="detailPageLotCurrentPage <= 1"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              ‹ Sebelumnya
            </button>
            <span class="px-2.5 py-1 text-zinc-600 font-bold">
              {{ detailPageLotCurrentPage }} / {{ totalDetailPageLotPages }}
            </span>
            <button
              @click="detailPageLotCurrentPage = Math.min(totalDetailPageLotPages, detailPageLotCurrentPage + 1)"
              :disabled="detailPageLotCurrentPage >= totalDetailPageLotPages"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              Selanjutnya ›
            </button>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SHEET 3: PLANNED SPK SLITTING & AI SCAN (BATCH HARIAN)            -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeSheet === 'planned'" class="space-y-4 animate-fade-in">
      
      <!-- Action Toolbar -->
      <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-black text-zinc-900">Jadwal Rencana Kerja per Batch Harian</h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 font-mono">
              1 Scan = 1 Batch
            </span>
          </div>
          <p class="text-[11px] sm:text-xs text-zinc-500 font-medium mt-0.5">
            Daftar sesi pemindaian SPK harian. Klik baris batch untuk melihat/menutup rincian planned SPK.
          </p>
        </div>

        <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <!-- Tombol AI Scan Kamera -->
          <button
            @click="triggerCameraScan"
            class="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>📷</span>
            <span>Scan AI Kamera</span>
          </button>

          <!-- Tombol Upload Dokumen SPK -->
          <label class="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer text-center">
            <span>📥</span>
            <span>Upload Berkas</span>
            <input type="file" accept="image/*,.pdf" @change="handleFileUploadScan" class="hidden" />
          </label>

          <!-- Input Manual Form -->
          <button
            @click="openManualPlanModal(null)"
            class="flex-1 sm:flex-initial justify-center px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
          >
            + Batch Manual
          </button>
        </div>
      </div>

      <!-- EMPTY STATE: JIKA BELUM ADA BATCH -->
      <div v-if="spkStore.batches.length === 0 && unassignedPlans.length === 0" class="bg-white rounded-3xl border border-zinc-200 p-12 text-center">
        <div class="w-14 h-14 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto text-2xl mb-3 shadow-2xs border border-red-100">
          📄
        </div>
        <h3 class="text-base font-black text-zinc-900">Belum Ada Batch Rencana SPK Slitting</h3>
        <p class="text-xs text-zinc-500 max-w-md mx-auto mt-1 font-medium">
          Gunakan tombol <strong>Scan AI Kamera</strong> atau <strong>Upload Berkas</strong> di atas untuk memindai dokumen fisik JADWAL SLITTING (3B-PROD) dan membuat batch baru.
        </p>
        <div class="mt-4 flex items-center justify-center gap-2">
          <button
            @click="triggerCameraScan"
            class="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black shadow-xs cursor-pointer"
          >
            📷 Mulai Scan Dokumen Sekarang
          </button>
        </div>
      </div>

      <!-- DAFTAR BATCH HARIAN (ACCORDION EXPANDABLE) -->
      <div v-else class="space-y-3">
        <div
          v-for="(batch, bIdx) in spkStore.batches"
          :key="batch.uuid"
          class="border border-zinc-200/90 rounded-2xl bg-white shadow-2xs overflow-hidden transition-all"
        >
          <!-- BATCH HEADER ROW: KLIK BARIS AKAN MENAMPILKAN/MENUTUP RINCIAN -->
          <div
            @click="toggleBatch(batch.uuid)"
            class="p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center justify-between cursor-pointer hover:bg-zinc-50/80 transition-colors select-none gap-3.5"
          >
            <div class="flex items-start gap-2.5 sm:gap-3 min-w-0 w-full lg:w-auto">
              <span class="text-xs font-mono font-bold text-zinc-400 mt-1">#{{ bIdx + 1 }}</span>
              <div
                class="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 transition-transform duration-200 shrink-0 mt-0.5"
                :class="{ 'rotate-90 text-red-600 bg-red-50': expandedBatchIds.has(batch.uuid) }"
              >
                ▶
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <h4 class="font-black text-sm text-zinc-900 font-mono tracking-tight">{{ batch.batchName }}</h4>
                  <span class="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                    📅 {{ batch.tanggal }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[9px] sm:text-[9.5px] font-black bg-zinc-100 text-zinc-700 uppercase">
                    {{ batch.source || 'AI_SCAN' }}
                  </span>
                  <!-- Indikator Lampu Hijau Berkedip untuk Batch Acuan Aktif -->
                  <div
                    v-if="spkStore.activeBatch?.uuid === batch.uuid"
                    class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-300 font-mono text-[9.5px] sm:text-[10px] font-black"
                  >
                    <span class="relative flex h-2 w-2">
                      <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                    </span>
                    <span>ACUAN MONITORING</span>
                  </div>
                </div>
                <p class="text-[10.5px] sm:text-[11px] text-zinc-500 font-sans mt-0.5">
                  {{ expandedBatchIds.has(batch.uuid) ? 'Tutup rincian' : 'Klik baris ini untuk melihat detail planned SPK' }}
                </p>
              </div>
            </div>

            <!-- Ringkasan Metrik & Aksi Batch -->
            <div class="flex flex-wrap items-center justify-between sm:justify-end gap-3 w-full lg:w-auto pt-2.5 lg:pt-0 border-t lg:border-t-0 border-zinc-100">
              <div class="flex items-center gap-3 sm:gap-4 text-xs font-mono">
                <div class="text-right">
                  <div class="font-black text-zinc-900">{{ getBatchPlans(batch.uuid).length || batch.totalItems }} Item</div>
                  <div class="text-[9.5px] sm:text-[10px] text-zinc-400 font-sans">Terjadwal</div>
                </div>
                <div class="text-right">
                  <div class="font-black text-purple-900">{{ getBatchTotalJumbo(batch.uuid) }} JR</div>
                  <div class="text-[9.5px] sm:text-[10px] text-zinc-400 font-sans">Jumbo Roll</div>
                </div>
                <div class="text-right">
                  <div class="font-black text-emerald-800">{{ formatNumber(getBatchTotalMeter(batch.uuid)) }} m</div>
                  <div class="text-[9.5px] sm:text-[10px] text-zinc-400 font-sans">Meter JR</div>
                </div>
              </div>

              <!-- Tombol Aksi Batch -->
              <div class="flex items-center gap-1.5 sm:pl-3 sm:border-l sm:border-zinc-200 font-sans" @click.stop>
                <!-- Tombol Jadikan Acuan -->
                <button
                  v-if="spkStore.activeBatch?.uuid !== batch.uuid"
                  @click="setAsActiveBatch(batch.uuid)"
                  class="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] sm:text-[10.5px] cursor-pointer flex items-center gap-1 transition-colors"
                  title="Jadikan batch ini sebagai acuan monitoring di Dashboard SPK & Dashboard Utama"
                >
                  <span>🎯</span>
                  <span>Acuan</span>
                </button>
                <button
                  @click="openAddRowToBatch(batch)"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[10px] sm:text-[10.5px] cursor-pointer"
                  title="Tambah baris SPK ke batch ini"
                >
                  + Item
                </button>
                <button
                  @click="confirmDeleteBatch(batch.uuid, batch.batchName)"
                  class="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 cursor-pointer"
                  title="Hapus batch ini"
                >
                  🗑️
                </button>
              </div>
            </div>
          </div>

          <!-- RINCIAN DETAIL PLANNED SPK (MUNCUL SAAT BARIS BATCH DI-KLIK) -->
          <div v-if="expandedBatchIds.has(batch.uuid)" class="p-4 bg-zinc-50/70 border-t border-zinc-200 animate-fade-in">
            <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
              <div class="p-3 bg-zinc-100/80 border-b border-zinc-200 flex items-center justify-between text-xs font-sans flex-wrap gap-2">
                <div class="flex items-center gap-2 font-bold text-zinc-700">
                  <span>📋 Rincian Jadwal Slitting:</span>
                  <span class="font-mono text-zinc-900 font-black">{{ batch.batchName }}</span>
                  <span class="text-zinc-400">({{ batch.docNo || '3B-PROD' }})</span>
                </div>
                <div class="flex items-center gap-3 text-zinc-500 font-mono text-[11px]">
                  <span class="bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-sans font-medium">
                    💡 Geser (Drag & Drop) baris untuk ubah urutan potong
                  </span>
                  <span>Total: <strong class="text-zinc-900">{{ getBatchPlans(batch.uuid).length }} Baris SPK</strong></span>
                </div>
              </div>

              <!-- HIERARCHICAL PLANNED SPK LIST (PARENT > CHILD ARCHITECTURE) -->
              <div class="p-3 space-y-3">
                <div v-if="getBatchPlans(batch.uuid).length === 0" class="py-10 text-center text-zinc-400 font-sans text-xs bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                  Belum ada item SPK pada batch ini. Klik tombol "+ Item" untuk menambahkan.
                </div>

                <div
                  v-for="(row, rIdx) in getBatchPlans(batch.uuid)"
                  :key="row.id || row.uuid || rIdx"
                  :draggable="true"
                  @dragstart="handlePlanDragStart($event, batch.uuid, rIdx)"
                  @dragenter.prevent="handlePlanDragOver($event, batch.uuid, rIdx)"
                  @dragover.prevent="handlePlanDragOver($event, batch.uuid, rIdx)"
                  @dragleave="handlePlanDragLeave"
                  @drop.prevent="handlePlanDrop($event, batch.uuid, rIdx)"
                  @dragend="handlePlanDragEnd"
                  class="border rounded-2xl bg-white shadow-2xs overflow-hidden transition-all group select-none"
                  :class="[
                    draggedBatchUuid === batch.uuid && draggedPlanIndex === rIdx ? 'opacity-30 bg-blue-100 ring-2 ring-blue-400' : 'hover:border-zinc-300',
                    draggedBatchUuid === batch.uuid && dragOverPlanIndex === rIdx && draggedPlanIndex !== rIdx ? 'border-t-4 border-t-blue-600 bg-blue-50/80 shadow-md ring-2 ring-blue-400/30' : 'border-zinc-200/90'
                  ]"
                >
                  <!-- ── TIER 1: PARENT JUMBO HEADER ROW ── -->
                  <div class="p-3 sm:p-3.5 bg-zinc-50/90 border-b border-zinc-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                    <!-- Left: Reorder Controls + Urut + SPK No + Ukuran Jumbo -->
                    <div class="flex items-center gap-2 sm:gap-3 flex-wrap min-w-0">
                      <!-- Quick Move ▲ / ▼ & Drag Handle -->
                      <div class="flex items-center gap-1 shrink-0 font-sans">
                        <div class="flex flex-col gap-0.5">
                          <button
                            type="button"
                            :disabled="rIdx === 0"
                            @click.stop="movePlanUp(batch.uuid, rIdx)"
                            class="w-4 h-3.5 flex items-center justify-center rounded text-[8px] font-black cursor-pointer transition-colors"
                            :class="rIdx === 0 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 active:bg-zinc-300'"
                            title="Pindah urutan ke atas"
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            :disabled="rIdx === getBatchPlans(batch.uuid).length - 1"
                            @click.stop="movePlanDown(batch.uuid, rIdx)"
                            class="w-4 h-3.5 flex items-center justify-center rounded text-[8px] font-black cursor-pointer transition-colors"
                            :class="rIdx === getBatchPlans(batch.uuid).length - 1 ? 'text-zinc-200 cursor-not-allowed' : 'text-zinc-500 hover:bg-zinc-200 hover:text-zinc-900 active:bg-zinc-300'"
                            title="Pindah urutan ke bawah"
                          >
                            ▼
                          </button>
                        </div>
                        <div
                          :draggable="true"
                          @dragstart.stop="handlePlanDragStart($event, batch.uuid, rIdx)"
                          @dragend="handlePlanDragEnd"
                          class="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 active:bg-blue-100 rounded cursor-grab active:cursor-grabbing transition-colors"
                          title="Klik tahan & geser (Drag & Drop) untuk ubah urutan"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <circle cx="7" cy="4" r="1.5" /><circle cx="13" cy="4" r="1.5" />
                            <circle cx="7" cy="10" r="1.5" /><circle cx="13" cy="10" r="1.5" />
                            <circle cx="7" cy="16" r="1.5" /><circle cx="13" cy="16" r="1.5" />
                          </svg>
                        </div>
                        <span class="px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-[11px] font-black">
                          #{{ rIdx + 1 }}
                        </span>
                      </div>

                      <!-- SPK Number Badge -->
                      <div class="flex items-center gap-1.5">
                        <span class="text-[10px] text-zinc-400 font-mono font-medium">SPK:</span>
                        <strong class="text-sm font-black font-mono text-zinc-900 tracking-tight">{{ row.spkNo }}</strong>
                      </div>

                      <!-- Ukuran Jumbo Baku: [JENIS] [KODE FORMULA] [MICRON] MC X [WIDTH] MM -->
                      <div class="px-2.5 py-1 rounded-xl bg-purple-50 text-purple-950 border border-purple-200 font-mono text-xs font-black flex items-center gap-1.5 shadow-2xs">
                        <span>📐</span>
                        <span>{{ row.ukuranJumbo || `${row.jenis || 'CPP'} ${row.formula || 'M01'} ${row.thickness || 25} MC X ${row.lebarParent || 0} MM`.toUpperCase() }}</span>
                      </div>
                    </div>

                    <!-- Right: Total Panjang Jumbo, Total JR, Status Parent, & Aksi -->
                    <div class="flex items-center gap-2.5 sm:gap-3.5 flex-wrap justify-between lg:justify-end">
                      <!-- Total Panjang & Roll Jumbo -->
                      <div class="flex items-center gap-2.5 text-xs font-mono">
                        <div class="text-right">
                          <div class="text-[9.5px] text-zinc-400 font-semibold uppercase">Total Panjang JR</div>
                          <div class="font-black text-emerald-800 text-xs sm:text-sm">
                            {{ formatNumber(row.panjangParent > 0 ? (row.panjangParent * (row.jumlahJumbo || 1)) : (row.totalPlannedMeter || 0)) }} m
                          </div>
                          <div class="text-[9px] text-zinc-400">@ {{ formatNumber(row.panjangParent || 0) }} m/JR</div>
                        </div>
                        <div class="h-7 w-px bg-zinc-200"></div>
                        <div class="text-center px-2 py-1 rounded-xl bg-zinc-100 border border-zinc-200/80">
                          <div class="text-[9px] text-zinc-500 font-bold uppercase">Total JR</div>
                          <div class="font-black text-purple-950 text-xs sm:text-sm">{{ row.jumlahJumbo || 1 }} JR</div>
                        </div>
                      </div>

                      <!-- Parent Status & Persentase Potong Realtime -->
                      <div
                        v-if="getPlanAnalytics(row).parentStatus"
                        class="px-2.5 py-1 rounded-xl border text-[11px] font-mono font-bold flex items-center gap-1.5"
                        :class="[getPlanAnalytics(row).parentStatus.badgeClass, getPlanAnalytics(row).parentStatus.borderClass]"
                        title="Realisasi pemotongan Jumbo Roll induk di lapangan"
                      >
                        <span>{{ getPlanAnalytics(row).parentStatus.icon }}</span>
                        <span>JR: <strong>{{ getPlanAnalytics(row).actualParentCut }} / {{ row.jumlahJumbo || 1 }}</strong></span>
                        <span class="text-[10px] opacity-80">({{ getPlanAnalytics(row).parentAchievementPercent }}%)</span>
                      </div>

                      <!-- Actions (Revisi / Hapus) -->
                      <div class="flex items-center gap-1 font-sans" @mousedown.stop @click.stop>
                        <button
                          @click="openEditPlanModal(row)"
                          class="px-2.5 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-lg font-bold text-xs cursor-pointer transition-colors"
                        >
                          Revisi
                        </button>
                        <button
                          @click="confirmDeletePlan(row.id, row.spkNo)"
                          class="p-1 text-zinc-400 hover:text-red-600 rounded cursor-pointer transition-colors"
                          title="Hapus baris SPK ini"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- ── TIER 2: CHILD / UKURAN YANG DIHASILKAN (SUB-TABLE) ── -->
                  <div class="p-3 sm:p-4 bg-white space-y-2.5">
                    <div class="flex items-center justify-between text-xs flex-wrap gap-2">
                      <div class="flex items-center gap-2">
                        <span class="text-blue-600 font-black">↳ 🔹</span>
                        <span class="font-black text-zinc-800 uppercase tracking-tight text-[11px]">
                          Ukuran Roll Jadi yang Dihasilkan (Child FG)
                        </span>
                        <span class="px-2 py-0.2 rounded-full bg-blue-50 text-blue-700 text-[10px] font-mono font-bold border border-blue-200">
                          {{ (getPlanAnalytics(row).childAnalytics || parseCharting(row.chartingJson)).length }} Variasi UP
                        </span>
                      </div>
                      <div class="text-[11px] font-mono text-zinc-500">
                        Standar Panjang Roll FG: <strong class="text-zinc-900 font-black">{{ formatNumber(row.panjangChild || getChildPanjang(row)) }} m</strong>
                      </div>
                    </div>

                    <!-- Child Items Sub-Table -->
                    <div class="overflow-x-auto rounded-xl border border-zinc-200/90 shadow-2xs">
                      <table class="w-full text-xs font-mono">
                        <thead class="bg-zinc-100/90 text-zinc-700 text-[10.5px] border-b border-zinc-200 font-bold">
                          <tr>
                            <th class="px-3 py-2 text-left w-14">Pisau</th>
                            <th class="px-3 py-2 text-left">Ukuran Jadi (Lebar × Panjang FG)</th>
                            <th class="px-3 py-2 text-center">Rasio / JR</th>
                            <th class="px-3 py-2 text-right">Target Roll FG</th>
                            <th class="px-3 py-2 text-right">Realisasi Label Aktual</th>
                            <th class="px-3 py-2 text-center">Hasil QC</th>
                            <th class="px-3 py-2 text-center">Status & Capaian Child</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-200 text-zinc-800">
                          <tr
                            v-for="(child, cIdx) in (getPlanAnalytics(row).childAnalytics || [])"
                            :key="cIdx"
                            class="hover:bg-blue-50/20 transition-colors"
                          >
                            <td class="px-3 py-2.5 font-black text-blue-900 text-xs">
                              UP {{ child.upNo }}
                            </td>
                            <td class="px-3 py-2.5 font-bold text-zinc-900 text-xs">
                              <span class="text-sm sm:text-base text-zinc-950 font-black">{{ child.lebar }}</span> mm × {{ formatNumber(child.panjang) }} m
                            </td>
                            <td class="px-3 py-2.5 text-center text-zinc-500 font-medium">
                              {{ child.rollsPerJumbo }} Roll / JR
                            </td>
                            <td class="px-3 py-2.5 text-right font-black text-purple-900">
                              {{ child.targetRolls }} Roll
                              <span class="text-[9.5px] text-zinc-400 block font-normal font-mono">({{ formatNumber(child.targetMeter) }} m)</span>
                            </td>
                            <td class="px-3 py-2.5 text-right">
                              <strong class="text-emerald-700 font-black text-xs sm:text-sm">{{ child.actualRolls }} Roll</strong>
                              <span class="text-[9.5px] text-zinc-500 block font-mono">
                                {{ formatNumber(child.actualMeter) }} m • {{ formatNumber(child.actualKg) }} kg
                              </span>
                            </td>
                            <td class="px-3 py-2.5 text-center">
                              <div class="inline-flex items-center gap-1 text-[9.5px] font-bold">
                                <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">P: {{ child.passCount }}</span>
                                <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">H: {{ child.holdCount }}</span>
                                <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-800">R: {{ child.rejectCount }}</span>
                              </div>
                            </td>
                            <td class="px-3 py-2.5 text-center">
                              <span
                                class="px-2 py-0.5 rounded-lg border text-[10px] font-bold inline-flex items-center gap-1"
                                :class="[child.status?.badgeClass || 'bg-zinc-100 text-zinc-600 border-zinc-200', child.status?.borderClass]"
                              >
                                <span>{{ child.status?.icon || '⏱️' }}</span>
                                <span>{{ child.percent }}% ({{ child.status?.label || 'Belum' }})</span>
                              </span>
                            </td>
                          </tr>

                          <!-- Fallback jika childAnalytics belum terkomputasi -->
                          <tr v-if="!getPlanAnalytics(row).childAnalytics || getPlanAnalytics(row).childAnalytics.length === 0">
                            <td colspan="7" class="py-3 text-center text-zinc-400 font-sans">
                              Spesifikasi Pisau:
                              UP1: {{ getUpCol(row, 1) }} mm | UP2: {{ getUpCol(row, 2) }} mm | UP3: {{ getUpCol(row, 3) }} mm | UP4: {{ getUpCol(row, 4) }} mm
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <!-- Footer Bar: Trim Buangan, Sisa Butt, Catatan Pisau -->
                    <div class="bg-zinc-50 p-2 sm:p-2.5 rounded-xl border border-zinc-200/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 text-[11px] font-mono text-zinc-600">
                      <div class="flex items-center gap-3 flex-wrap">
                        <div class="flex items-center gap-1">
                          <span>✂️ Trim Buangan:</span>
                          <strong class="text-red-600 font-bold">{{ row.trimAuto }} mm</strong>
                          <span class="text-zinc-400 text-[10px]">
                            ({{ row.lebarParent ? ((row.trimAuto / row.lebarParent) * 100).toFixed(1) : 0 }}%)
                          </span>
                        </div>
                        <div class="h-3.5 w-px bg-zinc-300"></div>
                        <div class="flex items-center gap-1">
                          <span>🔄 Estimasi Sisa Butt:</span>
                          <strong class="text-zinc-900 font-bold">
                            {{ formatNumber(getPlanAnalytics(row).sisaButtPerJumbo || 0) }} m / JR
                          </strong>
                        </div>
                      </div>
                      <div class="flex items-center gap-1.5 truncate">
                        <span class="text-zinc-400">📝 Keterangan:</span>
                        <strong class="text-zinc-800 font-sans truncate">{{ row.keterangan || '-' }}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Subtotal Batch Footer Card -->
                <div class="p-3 sm:p-4 bg-zinc-100 rounded-2xl border border-zinc-300/80 flex items-center justify-between font-mono text-xs font-bold text-zinc-900 select-none">
                  <div class="uppercase text-[11px] tracking-wide text-zinc-600">Subtotal Batch Ini:</div>
                  <div class="flex items-center gap-4 text-xs sm:text-sm">
                    <div>Total JR: <span class="text-purple-950 font-black">{{ getBatchTotalJumbo(batch.uuid) }} JR</span></div>
                    <div class="h-4 w-px bg-zinc-300"></div>
                    <div>Total Meter: <span class="text-emerald-900 font-black">{{ formatNumber(getBatchTotalMeter(batch.uuid)) }} m</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- JIKA ADA ITEM SPK TANPA BATCH (LEGACY/MANUAL) -->
        <div v-if="unassignedPlans.length > 0" class="border border-zinc-200 rounded-2xl bg-white shadow-2xs overflow-hidden">
          <div class="p-4 bg-amber-50/50 border-b border-amber-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base">📌</span>
              <div>
                <h4 class="font-black text-xs text-amber-900">Item Planned SPK Mandiri (Tanpa Batch)</h4>
                <p class="text-[11px] text-amber-700">Item yang diinput sebelum sistem batching diaktifkan</p>
              </div>
            </div>
            <span class="font-mono text-xs font-bold text-amber-900">{{ unassignedPlans.length }} Item</span>
          </div>
          <div class="p-3 space-y-3">
            <div
              v-for="(uRow, uIdx) in unassignedPlans"
              :key="uRow.id || uIdx"
              class="border border-zinc-200/90 rounded-2xl bg-white shadow-2xs overflow-hidden"
            >
              <!-- Parent Header -->
              <div class="p-3 bg-zinc-50 border-b border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 rounded-md bg-zinc-900 text-white font-mono text-[11px] font-black">#{{ uIdx + 1 }}</span>
                  <span class="text-[10px] text-zinc-400 font-mono">SPK:</span>
                  <strong class="font-mono text-zinc-900 font-black">{{ uRow.spkNo }}</strong>
                  <div class="px-2 py-0.5 rounded-lg bg-purple-50 text-purple-900 border border-purple-200 font-mono text-[11px] font-black">
                    {{ uRow.ukuranJumbo || `${uRow.jenis || 'CPP'} ${uRow.formula || 'M01'} ${uRow.thickness || 25} MC X ${uRow.lebarParent || 0} MM`.toUpperCase() }}
                  </div>
                </div>
                <div class="flex items-center gap-3">
                  <div class="text-xs font-mono text-right">
                    <span class="text-emerald-800 font-black">{{ formatNumber(uRow.panjangParent > 0 ? (uRow.panjangParent * (uRow.jumlahJumbo || 1)) : (uRow.totalPlannedMeter || 0)) }} m</span>
                    <span class="text-[10px] text-zinc-400 block font-normal">({{ uRow.jumlahJumbo || 1 }} JR)</span>
                  </div>
                  <button @click="openEditPlanModal(uRow)" class="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 rounded text-[10px] font-bold">Revisi</button>
                  <button @click="confirmDeletePlan(uRow.id, uRow.spkNo)" class="p-1 text-zinc-400 hover:text-red-600 rounded">🗑️</button>
                </div>
              </div>

              <!-- Child Items List -->
              <div class="p-3 text-xs font-mono space-y-1.5">
                <div
                  v-for="(child, cIdx) in (getPlanAnalytics(uRow).childAnalytics || [])"
                  :key="cIdx"
                  class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200/60"
                >
                  <div class="flex items-center gap-2">
                    <span class="font-black text-blue-900">UP {{ child.upNo }}:</span>
                    <strong class="text-zinc-900">{{ child.lebar }} mm × {{ formatNumber(child.panjang) }} m</strong>
                    <span class="text-zinc-400">({{ child.rollsPerJumbo }} Roll/JR)</span>
                  </div>
                  <div class="flex items-center gap-3">
                    <span>Target: <strong>{{ child.targetRolls }} Roll</strong></span>
                    <span>Aktual: <strong class="text-emerald-700">{{ child.actualRolls }} Roll</strong></span>
                    <span
                      class="px-2 py-0.5 rounded text-[10px] font-bold border"
                      :class="[child.status?.badgeClass || 'bg-zinc-100 text-zinc-600 border-zinc-200']"
                    >
                      {{ child.percent }}% ({{ child.status?.label || 'Belum' }})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- DRAWER / MODAL DETAIL SPK (BERBAGI DATA DENGAN LABEL / DATA ROLL)  -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="showDetailDrawer && selectedSpkAnalytics" class="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in" @click.self="showDetailDrawer = false">
      <div class="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden border-l border-zinc-200 animate-slide-left">
        
        <!-- Header Drawer -->
        <div class="p-4 sm:p-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-950 to-zinc-900 text-white flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold">DETAIL SPK</span>
              <h2 class="text-base sm:text-lg font-black font-mono tracking-tight">{{ selectedSpkAnalytics.spkNo }}</h2>
            </div>
            <p class="text-[11px] sm:text-xs text-zinc-400 mt-0.5">Integrasi Data Terpadu: Management Label & Data Roll</p>
          </div>
          <button @click="showDetailDrawer = false" class="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Drawer Body -->
        <div class="p-3.5 sm:p-5 overflow-y-auto space-y-3.5 sm:space-y-4 text-xs">
          
          <!-- Data Pokok SPK -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <h4 class="font-extrabold text-zinc-900 uppercase text-[11px] border-b border-zinc-200 pb-1.5 flex items-center justify-between">
              <span>📌 Informasi Dasar SPK</span>
              <span class="font-mono text-zinc-500 font-bold">{{ selectedSpkAnalytics.plan?.docNo || '3B-PROD' }}</span>
            </h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-zinc-700">
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Tahun / Periode Bulan</span>
                <span class="font-black text-zinc-900 text-sm font-mono">{{ selectedSpkAnalytics.year }} / {{ selectedSpkAnalytics.monthName }}</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Supplier Asal</span>
                <span class="font-black text-blue-900 text-sm">{{ selectedSpkAnalytics.supplier }}</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Formula & Spek Film</span>
                <span class="font-black text-purple-900 text-sm font-mono">{{ selectedSpkAnalytics.formula }} ({{ selectedSpkAnalytics.thickness }}μ)</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Total Jumbo Roll (JR)</span>
                <span class="font-black text-amber-900 text-sm font-mono">{{ selectedSpkAnalytics.totalJumbo }} JR</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Total Berat Bersih Roll</span>
                <span class="font-black text-emerald-800 text-sm font-mono">{{ formatNumber(selectedSpkAnalytics.totalRealKg) }} kg</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Total Panjang Aktual</span>
                <span class="font-black text-purple-900 text-sm font-mono">{{ formatNumber(selectedSpkAnalytics.totalRealMeter) }} m</span>
              </div>
            </div>
          </div>

          <!-- QC Mutu & Status Progress Bar -->
          <div class="p-3.5 sm:p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[11px]">📊 Status Kualitas Hasil (QC)</h4>
              <span class="text-xs font-mono font-black text-emerald-700">{{ selectedSpkAnalytics.totalRealRolls }} Total Roll</span>
            </div>
            <div class="grid grid-cols-3 gap-1.5 sm:gap-2 text-center font-mono">
              <div class="p-2 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                <div class="text-[10px]">PASS / OK</div>
                <div class="text-base font-black">{{ selectedSpkAnalytics.passCount }} Roll</div>
              </div>
              <div class="p-2 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                <div class="text-[10px]">HOLD</div>
                <div class="text-base font-black">{{ selectedSpkAnalytics.holdCount }} Roll</div>
              </div>
              <div class="p-2 rounded-xl bg-red-100 text-red-900 border border-red-300 font-bold">
                <div class="text-[10px]">REJECT / NG</div>
                <div class="text-base font-black">{{ selectedSpkAnalytics.rejectCount }} Roll</div>
              </div>
            </div>
          </div>

          <!-- RINGKASAN HASIL ROLL TURUNAN PER UKURAN LEBAR (SESUAI PERMINTAAN USER) -->
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[11px]">📐 Ringkasan Hasil per Ukuran Roll Turunan</h4>
              <span class="text-[10px] font-mono text-zinc-500 font-bold">{{ (selectedSpkAnalytics.widthSummaries || []).length }} Ukuran Teridentifikasi</span>
            </div>
            
            <div class="space-y-2 font-mono">
              <div
                v-for="w in (selectedSpkAnalytics.widthSummaries || [])"
                :key="w.width"
                class="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div class="text-sm font-black text-zinc-900">Ukuran {{ w.width }} mm</div>
                  <div class="text-[10.5px] text-zinc-500 font-sans mt-0.5">Roll Jadi Siap Kirim / Finishing</div>
                </div>
                <div class="text-right">
                  <div class="font-black text-sm text-emerald-700">{{ w.totalRoll }} Roll</div>
                  <div class="text-[10px] text-zinc-400">{{ formatNumber(w.totalMeter) }} m • {{ formatNumber(w.totalKg) }} kg</div>
                </div>
              </div>
              <div v-if="!selectedSpkAnalytics.widthSummaries || selectedSpkAnalytics.widthSummaries.length === 0" class="text-center py-4 text-zinc-400 font-sans">
                Belum ada roll turunan yang terdata
              </div>
            </div>
          </div>

          <!-- Daftar Nomor Lot Terdaftar -->
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[11px]">🏷️ Daftar Nomor Lot Terdaftar ({{ (selectedSpkAnalytics.realLots || []).length }})</h4>
              <input
                v-model="drawerLotSearch"
                placeholder="Cari lot..."
                class="px-2 py-0.5 text-[10px] border border-zinc-300 rounded font-mono bg-white"
              />
            </div>
            <div class="max-h-56 overflow-y-auto space-y-1 font-mono text-[11px]">
              <div
                v-for="(lot, lIdx) in filteredDrawerLots"
                :key="lot.id || (lot.lot + '_' + lIdx)"
                class="p-2 bg-white rounded-lg border border-zinc-200 flex items-center justify-between"
              >
                <div>
                  <strong class="text-zinc-900">{{ lot.lot }}</strong>
                  <span v-if="lot.turunan && !lot.lot.includes(lot.turunan)" class="ml-1 px-1.5 py-0.5 rounded text-[9.5px] font-mono font-bold bg-blue-100 text-blue-800">
                    {{ lot.turunan }}
                  </span>
                  <span class="text-zinc-400 text-[10px] ml-2 font-sans">({{ lot.width }} mm × {{ formatNumber(lot.length) }} m • {{ formatNumber(lot.weight) }} kg)</span>
                  <span v-if="lot.operator" class="text-zinc-500 text-[9.5px] block font-sans">Operator: {{ lot.operator }}</span>
                </div>
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-black',
                    lot.status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : (lot.status === 'HOLD' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800')
                  ]"
                >
                  {{ lot.status }}
                </span>
              </div>
              <div v-if="filteredDrawerLots.length === 0" class="text-center py-4 text-zinc-400 font-sans">
                Tidak ada data nomor lot
              </div>
            </div>
          </div>

        </div>

        <!-- Footer Drawer -->
        <div class="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            @click="showDetailDrawer = false; openSpkDetailDrawer(selectedSpkAnalytics)"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
          >
            <span>Buka Halaman Penuh</span>
            <span>→</span>
          </button>
          <button @click="showDetailDrawer = false" class="px-5 py-2 bg-zinc-900 hover:bg-black text-white rounded-xl font-bold cursor-pointer">
            Tutup
          </button>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL LEMBAR VERIFIKASI MANDIRI (TRUE EXCEL SPREADSHEET ENGINE)   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="showVerificationModal"
      class="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 backdrop-blur-xs p-2 sm:p-4 animate-fade-in select-none"
      @keydown="handleVerificationKeydown"
      tabindex="0"
    >
      <div class="bg-white w-full max-w-7xl h-[96vh] sm:h-[94vh] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden border border-zinc-300 flex flex-col justify-between">
        
        <!-- Header Verifikasi -->
        <div class="p-2.5 sm:p-3.5 border-b border-zinc-200 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div class="flex items-center gap-2">
            <span class="text-lg sm:text-xl">📊</span>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-xs sm:text-sm font-black text-white">LEMBAR VERIFIKASI SPREADSHEET EXCEL</h3>
                <span class="px-2 py-0.5 rounded-full text-[9.5px] sm:text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Interaktif Excel
                </span>
              </div>
              <p class="text-[10px] sm:text-[11px] text-zinc-400 mt-0.5 line-clamp-1 sm:line-clamp-none">Arah • Shift+Arah (Range) • Ctrl+D (Duplikat) • Ctrl+C/V • F2/Enter (Edit)</p>
            </div>
          </div>
          <div class="flex items-center gap-1.5 flex-wrap w-full md:w-auto justify-end">
            <button
              @click="standardizeAllStagingSpks"
              class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-200 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Ubah semua SPK ke format standar penuh [URUTAN]/[ROMAWI]/SPK/[TAHUN]"
            >
              <span>⚡</span>
              <span>Standar SPK</span>
            </button>
            <button
              @click="addVerificationRow"
              class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
              title="Tambah baris kosong"
            >
              + Baris
            </button>
            <button
              @click="deleteSelectedVerificationRows"
              class="px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-[11px] sm:text-xs font-bold transition-colors cursor-pointer"
              title="Hapus baris yang diseleksi"
            >
              🗑️ Hapus
            </button>
            <button @click="showVerificationModal = false" :disabled="isCommittingVerification" class="p-1 sm:p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer ml-1 disabled:opacity-40 disabled:cursor-not-allowed">
              ✕
            </button>
          </div>
        </div>

        <!-- BATCH METADATA CONTROLS & EXCEL FORMULA BAR -->
        <div class="bg-zinc-100 border-b border-zinc-300 p-2.5 space-y-2 text-xs">
          <div class="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div class="sm:col-span-4">
              <label class="block font-bold text-zinc-700 text-[11px] mb-0.5">Nama Batch Dokumen *</label>
              <input v-model="verificationBatchName" class="w-full p-1.5 bg-white border border-zinc-300 rounded-lg font-mono font-bold text-xs outline-none" placeholder="Mis: JADWAL SLITTING 5-7 Sep 2026" />
            </div>

            <!-- Toggle Tanggal Tunggal vs Rentang Beberapa Hari -->
            <div class="sm:col-span-5 flex items-end gap-2">
              <div class="flex-1">
                <div class="flex items-center justify-between mb-0.5">
                  <label class="block font-bold text-zinc-700 text-[11px]">
                    {{ isDateRangeMode ? 'Rentang Tanggal Jadwal *' : 'Tanggal Jadwal *' }}
                  </label>
                  <button
                    type="button"
                    @click="toggleDateRangeMode"
                    class="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    {{ isDateRangeMode ? 'Mode 1 Hari' : 'Mode Rentang Hari (Misal 5-7 Sep)' }}
                  </button>
                </div>

                <div v-if="isDateRangeMode" class="grid grid-cols-2 gap-1.5">
                  <input v-model="verificationBatchStartDate" type="date" @change="onDateRangeChanged" class="w-full p-1.5 bg-white border border-zinc-300 rounded-lg font-mono text-xs outline-none" />
                  <input v-model="verificationBatchEndDate" type="date" @change="onDateRangeChanged" class="w-full p-1.5 bg-white border border-zinc-300 rounded-lg font-mono text-xs outline-none" />
                </div>
                <input v-else v-model="verificationBatchDate" type="date" @change="onSingleDateChanged" class="w-full p-1.5 bg-white border border-zinc-300 rounded-lg font-mono text-xs outline-none" />
              </div>
            </div>

            <div class="sm:col-span-3">
              <div class="p-1.5 bg-blue-50 border border-blue-200 rounded-lg text-blue-900 font-mono text-[11px] flex items-center justify-between">
                <span>Total Item:</span>
                <strong class="text-sm font-black">{{ verificationStagingList.length }} SPK</strong>
              </div>
            </div>
          </div>

          <!-- EXCEL FORMULA & ACTIVE CELL BAR -->
          <div class="flex items-center gap-2 bg-white p-1 rounded-lg border border-zinc-300 font-mono text-xs">
            <div class="w-16 px-2 py-0.5 bg-zinc-100 rounded text-center font-black text-zinc-800 border border-zinc-200">
              {{ activeCellAddress }}
            </div>
            <div class="text-zinc-400 font-bold px-1 select-none">fx</div>
            <div class="flex-1 text-zinc-800 font-medium px-1 overflow-hidden truncate">
              {{ activeCellValue }}
            </div>
            <div class="text-[10px] text-zinc-400 font-sans pr-2">
              <span v-if="vMinR < vMaxR" class="font-bold text-blue-600">Range: {{ vMaxR - vMinR + 1 }} Baris (Tekan Ctrl+D untuk duplikat)</span>
              <span v-else>Tekan F2 atau Enter untuk edit</span>
            </div>
          </div>
        </div>

        <!-- TRUE EXCEL SPREADSHEET GRID -->
        <div
          class="overflow-auto flex-1 bg-zinc-200 font-mono text-xs relative"
          @mouseup="handleSpreadsheetMouseUp"
          @mouseleave="handleSpreadsheetMouseUp"
        >
          <table class="border-collapse bg-white w-full table-fixed text-[11.5px]">
            <!-- Excel Column Headers (Letters) -->
            <thead class="sticky top-0 z-20 bg-zinc-100 text-zinc-700 select-none shadow-2xs">
              <tr class="border-b border-zinc-300">
                <th class="w-10 border-r border-zinc-300 bg-zinc-200 text-center font-bold text-[10px] py-1 text-zinc-500"></th>
                <th
                  v-for="(col, cIdx) in vColumns"
                  :key="col.key"
                  class="border-r border-zinc-300 px-2 py-1 text-center font-bold text-[10.5px]"
                  :style="{ width: col.width }"
                  :class="{ 'bg-blue-100 text-blue-900': cIdx >= vMinC && cIdx <= vMaxC }"
                >
                  <div class="text-[10px] text-zinc-400">{{ col.colLetter }}</div>
                  <div>{{ col.label }}</div>
                </th>
              </tr>
            </thead>

            <!-- Excel Data Rows -->
            <tbody>
              <tr v-if="verificationStagingList.length === 0">
                <td :colspan="vColumns.length + 1" class="py-16 text-center text-zinc-400 font-sans">
                  Belum ada baris jadwal. Gunakan scan atau klik "+ Baris" untuk menambah manual.
                </td>
              </tr>
              <tr
                v-for="(row, rIdx) in verificationStagingList"
                :key="rIdx"
                class="border-b border-zinc-200 hover:bg-zinc-50/50"
              >
                <!-- Row Number Header -->
                <td
                  class="border-r border-zinc-300 bg-zinc-100 text-center font-bold text-[10.5px] text-zinc-500 select-none"
                  :class="{ 'bg-blue-100 text-blue-900 font-black': rIdx >= vMinR && rIdx <= vMaxR }"
                >
                  {{ rIdx + 1 }}
                </td>

                <!-- Cells -->
                <td
                  v-for="(col, cIdx) in vColumns"
                  :key="col.key"
                  class="border-r border-zinc-200 px-2 py-1 relative truncate outline-none select-none cursor-cell"
                  :class="[
                    col.align === 'right' ? 'text-right' : (col.align === 'center' ? 'text-center' : 'text-left'),
                    isCellSelected(rIdx, cIdx) ? 'bg-blue-100/70' : '',
                    isCellActive(rIdx, cIdx) ? 'ring-2 ring-blue-600 ring-inset z-10 font-bold bg-white' : '',
                    col.key === 'trimAuto' ? 'bg-red-50/60 font-black text-red-600' : '',
                    col.key === 'formula' ? 'font-black text-red-600' : '',
                    col.key === 'up1' || col.key === 'up2' || col.key === 'up3' || col.key === 'up4' ? 'font-bold text-blue-900' : ''
                  ]"
                  @mousedown="handleCellMouseDown(rIdx, cIdx, $event)"
                  @mouseover="handleCellMouseOver(rIdx, cIdx)"
                  @dblclick="enterCellEdit(rIdx, cIdx)"
                >
                  <!-- Edit Input Mode -->
                  <template v-if="editingCell.r === rIdx && editingCell.c === cIdx">
                    <input
                      ref="cellInputRef"
                      v-model="cellEditValue"
                      class="absolute inset-0 w-full h-full px-2 py-1 bg-white text-zinc-900 font-mono font-bold text-xs border-2 border-blue-600 outline-none z-30"
                      @keydown.enter.prevent="commitCellEdit(1, 0)"
                      @keydown.tab.prevent="commitCellEdit(0, $event.shiftKey ? -1 : 1)"
                      @keydown.esc.prevent="cancelCellEdit"
                      @keydown.up.prevent="commitCellEdit(-1, 0)"
                      @keydown.down.prevent="commitCellEdit(1, 0)"
                      @blur="commitCellEdit(0, 0)"
                    />
                  </template>

                  <!-- Normal Display Mode -->
                  <template v-else>
                    <span v-if="col.key === 'trimAuto'">{{ calculateRowTrim(row) }}</span>
                    <span v-else>{{ row[col.key] !== undefined && row[col.key] !== null ? row[col.key] : '-' }}</span>
                  </template>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Verifikasi -->
        <div class="p-2.5 sm:p-3.5 border-t border-zinc-300 bg-zinc-50 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div class="text-[11px] sm:text-xs text-zinc-600 font-medium text-center sm:text-left">
            Status: <strong class="text-zinc-900">{{ verificationStagingList.length }} baris</strong>
            <span class="mx-1.5 text-zinc-300">•</span>
            <span class="text-zinc-500 font-mono text-[10.5px] sm:text-[11px]"><strong>Ctrl+D</strong> duplikat ke bawah</span>
          </div>
          <div class="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            <button
              @click="showVerificationModal = false"
              :disabled="isCommittingVerification"
              class="flex-1 sm:flex-initial px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Batal
            </button>
            <button
              @click="commitVerificationToPlans"
              :disabled="verificationStagingList.length === 0 || isCommittingVerification"
              class="flex-1 sm:flex-initial px-4 sm:px-5 py-1.5 sm:py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer text-center disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <svg v-if="isCommittingVerification" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>{{ isCommittingVerification ? 'Menyimpan & Menyinkronkan ke Cloud...' : `✓ Simpan (${verificationStagingList.length})` }}</span>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL REVISI / MANUAL PLAN                                         -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="showManualModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden border border-zinc-200">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <h3 class="text-sm font-black text-zinc-900">{{ editingPlanId ? 'Revisi Planned SPK' : 'Tambah Planned SPK Baru' }}</h3>
          <button @click="showManualModal = false" :disabled="isSavingManualPlan" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">✕</button>
        </div>
        <div class="p-5 space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Nomor SPK *</label>
              <input v-model="manualForm.spkNo" class="w-full p-2 border border-zinc-300 rounded-xl font-mono font-bold uppercase" placeholder="Mis: 04/VIII" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Kode Formula *</label>
              <input v-model="manualForm.formula" class="w-full p-2 border border-zinc-300 rounded-xl font-mono font-bold uppercase" placeholder="Mis: M07" />
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Tebal (μ)</label>
              <input v-model.number="manualForm.thickness" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono text-center" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Lebar JR (mm)</label>
              <input v-model.number="manualForm.lebarParent" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono font-bold text-right" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">P. Jumbo (m)</label>
              <input v-model.number="manualForm.panjangParent" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono text-right" placeholder="Mis: 29300" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">P. Roll FG (m)</label>
              <input v-model.number="manualForm.panjangChild" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono text-right font-bold text-blue-900" placeholder="12000" />
            </div>
          </div>

          <!-- UP Charting Inputs -->
          <div class="p-3 bg-zinc-50 rounded-2xl border border-zinc-200 space-y-2">
            <div class="font-bold text-zinc-800 text-[11px] flex justify-between">
              <span>Charting UP (Potongan Child)</span>
              <span class="text-red-600 font-mono font-black">Trim: {{ calculateTrimInModal }} mm</span>
            </div>
            <div class="grid grid-cols-4 gap-2 font-mono">
              <div>
                <span class="text-[10px] text-zinc-400 block">UP 1</span>
                <input v-model.number="manualForm.up1" type="number" placeholder="mm" class="w-full p-1.5 border border-zinc-300 rounded-lg text-center font-bold" />
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">UP 2</span>
                <input v-model.number="manualForm.up2" type="number" placeholder="mm" class="w-full p-1.5 border border-zinc-300 rounded-lg text-center font-bold" />
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">UP 3</span>
                <input v-model.number="manualForm.up3" type="number" placeholder="mm" class="w-full p-1.5 border border-zinc-300 rounded-lg text-center font-bold" />
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block">UP 4</span>
                <input v-model.number="manualForm.up4" type="number" placeholder="mm" class="w-full p-1.5 border border-zinc-300 rounded-lg text-center font-bold" />
              </div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Jumlah Jumbo Roll</label>
              <input v-model.number="manualForm.jumlahJumbo" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono font-black text-purple-900" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Keterangan Mesin</label>
              <input v-model="manualForm.keterangan" class="w-full p-2 border border-zinc-300 rounded-xl" placeholder="Mis: C1 TENGAH" />
            </div>
          </div>

          <div v-if="editingPlanId">
            <label class="block font-bold text-amber-800 mb-1">Alasan Revisi Dokumen SPK *</label>
            <input v-model="manualForm.revisionReason" class="w-full p-2 border border-amber-300 rounded-xl bg-amber-50/50" placeholder="Mis: Perubahan lebar parent atau alokasi JR" />
          </div>
        </div>

        <div class="p-4 border-t border-zinc-100 bg-zinc-50 flex justify-end gap-2">
          <button
            @click="showManualModal = false"
            :disabled="isSavingManualPlan"
            class="px-4 py-2 font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Batal
          </button>
          <button
            @click="saveManualPlan"
            :disabled="isSavingManualPlan"
            class="px-5 py-2 font-black bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <svg v-if="isSavingManualPlan" class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <span>{{ isSavingManualPlan ? 'Menyimpan...' : (editingPlanId ? 'Simpan Revisi' : 'Tambahkan') }}</span>
          </button>
        </div>
      </div>
    </div>


    <!-- MODAL LOADING AKTUAL AI SCAN DOKUMEN SPK -->
    <div v-if="isAiScanning" class="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-zinc-200">
        <div class="relative w-20 h-20 mx-auto mb-5">
          <div class="absolute inset-0 rounded-full border-4 border-red-100"></div>
          <div class="absolute inset-0 rounded-full border-4 border-red-600 border-t-transparent animate-spin"></div>
          <div class="absolute inset-0 flex items-center justify-center text-2xl">
            📄
          </div>
        </div>

        <h3 class="text-base font-black text-zinc-900 mb-1">Memproses Dokumen SPK</h3>
        <p class="text-xs text-zinc-500 font-medium mb-5 min-h-[32px] flex items-center justify-center">
          {{ aiScanStage }}
        </p>

        <!-- Animated Progress Bar -->
        <div class="w-full bg-zinc-100 rounded-full h-2.5 overflow-hidden border border-zinc-200">
          <div
            class="bg-gradient-to-r from-red-600 to-amber-500 h-2.5 rounded-full transition-all duration-300 ease-out shadow-xs"
            :style="{ width: aiScanProgress + '%' }"
          ></div>
        </div>
        <div class="flex justify-between items-center text-[10px] text-zinc-400 font-mono mt-2">
          <span>AI VISION SCANNER</span>
          <span class="font-bold text-red-600">{{ aiScanProgress }}%</span>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { useSpkStore, evaluateTargetStatus, getFilmDensity, calculateBeratTeori } from '@/stores/spkStore';
import { useConfigStore } from '@/stores/configStore';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { parseSpkDocumentImage, normalizeSpkToFullStandard } from '@/services/spkAiService';

const spkStore = useSpkStore();
const configStore = useConfigStore();
const labelStore = useLabelStore();
const dataRollStore = useDataRollStore();

// Navigation Sheet State: 'dashboard' | 'list' | 'planned'
const activeSheet = ref('dashboard');

// Search & Filter
const searchSpkQuery = ref('');

// Drawer Detail SPK
const showDetailDrawer = ref(false);
const selectedSpkAnalytics = ref(null);

// Verification Modal State
const showVerificationModal = ref(false);
const isCommittingVerification = ref(false);
const verificationStagingList = ref([]);
// Batch & Expand State (1 Scan = 1 Batch)
const expandedBatchIds = ref(new Set());
const verificationBatchName = ref('');
const verificationBatchDate = ref(new Date().toISOString().slice(0, 10));
const targetBatchUuidForNewItem = ref(null);

const toggleBatch = (uuid) => {
  if (expandedBatchIds.value.has(uuid)) {
    expandedBatchIds.value.delete(uuid);
  } else {
    expandedBatchIds.value.add(uuid);
  }
};

const getBatchPlans = (batchUuid) => {
  return (spkStore.plans || [])
    .filter(p => p.batchId === batchUuid)
    .sort((a, b) => {
      const seqA = a.seq !== undefined && a.seq !== null ? a.seq : (a.no || a.id || 0);
      const seqB = b.seq !== undefined && b.seq !== null ? b.seq : (b.no || b.id || 0);
      return seqA - seqB;
    });
};

// Drag and drop cut order reordering state
const draggedPlanIndex = ref(null);
const draggedBatchUuid = ref(null);
const dragOverPlanIndex = ref(null);

const handlePlanDragStart = (event, batchUuid, rIdx) => {
  draggedPlanIndex.value = rIdx;
  draggedBatchUuid.value = batchUuid;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', String(rIdx));
    try {
      event.dataTransfer.setData('application/json', JSON.stringify({ batchUuid, rIdx }));
    } catch (e) {
      // ignore
    }
  }
};

const handlePlanDragOver = (event, batchUuid, rIdx) => {
  if (draggedBatchUuid.value && draggedBatchUuid.value !== batchUuid) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
  dragOverPlanIndex.value = rIdx;
};

const handlePlanDragLeave = () => {
  dragOverPlanIndex.value = null;
};

const handlePlanDrop = async (event, batchUuid, dropIdx) => {
  event.preventDefault();
  let fromIdx = draggedPlanIndex.value;
  let sourceBatch = draggedBatchUuid.value;

  if (event.dataTransfer) {
    try {
      const jsonStr = event.dataTransfer.getData('application/json');
      if (jsonStr) {
        const parsed = JSON.parse(jsonStr);
        if (parsed.batchUuid) sourceBatch = parsed.batchUuid;
        if (typeof parsed.rIdx === 'number') fromIdx = parsed.rIdx;
      } else {
        const plain = event.dataTransfer.getData('text/plain');
        if (plain !== '' && !isNaN(parseInt(plain, 10))) {
          fromIdx = parseInt(plain, 10);
        }
      }
    } catch (e) {
      // ignore
    }
  }

  if (sourceBatch && sourceBatch !== batchUuid) {
    draggedPlanIndex.value = null;
    draggedBatchUuid.value = null;
    dragOverPlanIndex.value = null;
    return;
  }

  if (fromIdx === null || fromIdx === undefined || fromIdx === dropIdx) {
    draggedPlanIndex.value = null;
    draggedBatchUuid.value = null;
    dragOverPlanIndex.value = null;
    return;
  }

  const batchPlans = [...getBatchPlans(batchUuid)];
  if (fromIdx < 0 || fromIdx >= batchPlans.length || dropIdx < 0 || dropIdx >= batchPlans.length) {
    draggedPlanIndex.value = null;
    draggedBatchUuid.value = null;
    dragOverPlanIndex.value = null;
    return;
  }

  const [movedItem] = batchPlans.splice(fromIdx, 1);
  batchPlans.splice(dropIdx, 0, movedItem);

  // Save reordered plans to IndexedDB and update Vue reactivity
  await spkStore.reorderBatchPlans(batchUuid, batchPlans);

  draggedPlanIndex.value = null;
  draggedBatchUuid.value = null;
  dragOverPlanIndex.value = null;
};

const handlePlanDragEnd = () => {
  draggedPlanIndex.value = null;
  draggedBatchUuid.value = null;
  dragOverPlanIndex.value = null;
};

// 1-Click Move Order Helpers (Garis urutan potong naik / turun)
const movePlanUp = async (batchUuid, rIdx) => {
  if (rIdx <= 0) return;
  const batchPlans = [...getBatchPlans(batchUuid)];
  const [movedItem] = batchPlans.splice(rIdx, 1);
  batchPlans.splice(rIdx - 1, 0, movedItem);
  await spkStore.reorderBatchPlans(batchUuid, batchPlans);
};

const movePlanDown = async (batchUuid, rIdx) => {
  const batchPlans = [...getBatchPlans(batchUuid)];
  if (rIdx >= batchPlans.length - 1) return;
  const [movedItem] = batchPlans.splice(rIdx, 1);
  batchPlans.splice(rIdx + 1, 0, movedItem);
  await spkStore.reorderBatchPlans(batchUuid, batchPlans);
};

const setAsActiveBatch = (batchUuid) => {
  spkStore.setActiveReferenceBatch(batchUuid);
};

const getBatchTotalJumbo = (batchUuid) => {
  return getBatchPlans(batchUuid).reduce((sum, p) => sum + (parseInt(p.jumlahJumbo, 10) || 1), 0);
};

const getBatchTotalMeter = (batchUuid) => {
  return getBatchPlans(batchUuid).reduce((sum, p) => sum + (parseFloat(p.totalPlannedMeter) || 0), 0);
};

const unassignedPlans = computed(() => {
  const batchUuids = new Set((spkStore.batches || []).map(b => b.uuid));
  return (spkStore.plans || []).filter(p => !p.batchId || !batchUuids.has(p.batchId));
});

const openAddRowToBatch = (batch) => {
  targetBatchUuidForNewItem.value = batch.uuid;
  editingPlanId.value = null;
  Object.assign(manualForm, {
    spkNo: '',
    formula: 'M07',
    thickness: 25,
    lebarParent: 2320,
    panjangParent: 12000,
    up1: 1145,
    up2: 1145,
    up3: null,
    up4: null,
    jumlahJumbo: 1,
    keterangan: ''
  });
  showManualModal.value = true;
};

const confirmDeleteBatch = async (batchUuid, batchName) => {
  if (confirm(`Hapus seluruh Batch "${batchName}" beserta seluruh baris SPK di dalamnya?`)) {
    await spkStore.deleteBatch(batchUuid);
  }
};


// Manual / Revision Modal State
const showManualModal = ref(false);
const isSavingManualPlan = ref(false);
const editingPlanId = ref(null);
const manualForm = reactive({
  spkNo: '',
  formula: 'M07',
  thickness: 25,
  lebarParent: 2320,
  panjangParent: 12000,
  up1: 1145,
  up2: 1145,
  up3: null,
  up4: null,
  jumlahJumbo: 1,
  keterangan: '',
  revisionReason: 'Revisi manual dokumen SPK'
});

// Lifecycle
const handleSpkUpdate = async () => {
  await spkStore.loadAll(true);
};

onMounted(async () => {
  window.addEventListener('sync:spk-plans-updated', handleSpkUpdate);
  await Promise.all([
    spkStore.loadAll(),
    configStore.loadAll(),
    labelStore.loadLabels(),
    dataRollStore.loadRolls()
  ]);
});

onUnmounted(() => {
  window.removeEventListener('sync:spk-plans-updated', handleSpkUpdate);
});

// Helpers Format
const formatNumber = (val) => {
  if (val === undefined || val === null || val === '') return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
};

const formatMinutes = (minutes) => {
  const m = parseInt(minutes, 10) || 0;
  if (m < 60) return `${m} Menit`;
  const hours = Math.floor(m / 60);
  const remaining = m % 60;
  return `${hours} Jam ${remaining} Mnt`;
};

// ── HIGH PERFORMANCE MEMOIZED SPK COMPUTED MAP (NO MAIN-THREAD BLOCK) ──

// Cache plan analytics in a single computed map (1x evaluation per tick instead of 500,000 nested loops)
// ── DUAL-SIDED CENTRAL TIMELINE ENGINE (WITH DYNAMIC RE-ESTIMATION & SKIPPED DETECTION) ──


const timelineRows = computed(() => {
  const batch = spkStore.activeBatch;
  const rawPlans = batch ? spkStore.plans.filter(p => p.batchId === batch.uuid) : spkStore.plans;
  
  // 1. Urutkan rencana strictly sesuai urutan pengerjaan (seq/no/id) dari atas ke bawah
  const plannedList = [...rawPlans].sort((a, b) => (a.seq || a.no || a.id) - (b.seq || b.no || b.id));

  // 2. Kumpulkan grup produksi aktual dari spkRealtimeDataMap (sudah terfilter jendela H+1)
  const dataMap = spkStore.spkRealtimeDataMap || new Map();
  const actualRuns = [];

  for (const [spkKey, spkData] of dataMap.entries()) {
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
        spkNo: spkKey,
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

  // Urutkan produksi aktual secara kronologis berdasarkan waktu pertama kali dipotong
  actualRuns.sort((a, b) => a.firstTime - b.firstTime);

  const cleanSpk = (s) => String(s || '').toUpperCase().replace(/[\s\-_/]/g, '');
  const isMatch = (s1, s2) => {
    const c1 = cleanSpk(s1);
    const c2 = cleanSpk(s2);
    if (!c1 || !c2) return false;
    return c1 === c2 || c1.includes(c2) || c2.includes(c1);
  };

  // Jika TIDAK ADA PLAN SPK TERDAFTAR (ZERO SEED POLICY):
  // Tampilkan pengerjaan input data label per SPK selama 2 hari kebelakang berjalan
  if (plannedList.length === 0) {
    const sortedActuals = [...actualRuns].sort((a, b) => b.lastTime - a.lastTime);
    return sortedActuals.map((act, idx) => {
      const plannedChildRolls = act.totalRealRolls;
      const actualChildRolls = act.totalRealRolls;
      const targetStatus = evaluateTargetStatus(actualChildRolls, plannedChildRolls, false);
      const startTimeFormatted = act.firstTime > 0
        ? new Date(act.firstTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(act.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';
      const endTimeFormatted = act.lastTime > 0
        ? new Date(act.lastTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(act.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';
      return {
        id: `fallback_${act.spkNo}_${idx}`,
        type: 'UNPLANNED',
        plan: null,
        actual: act,
        status: 'COMPLETED',
        speed: 600,
        planDurationMinutes: 45,
        actualDurationMinutes: (act.lastTime > 0 && act.firstTime > 0) ? Math.max(1, Math.round((act.lastTime - act.firstTime) / 60000)) : 30,
        estStartTime: act.latestTimeFormatted || '',
        estEndTime: act.latestTimeFormatted || '',
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
        diffMeter: 0,
        totalUp: 2,
        warning: 'Data Berjalan 2 Hari Kebelakang (Tanpa Planned SPK Terdaftar)'
      };
    });
  }

  // Cari index rencana terjauh yang sudah mulai/selesai dikerjakan (untuk mendeteksi SPK yang dilewati/dilompati)
  let maxActivePlanIdx = -1;
  for (let pIdx = 0; pIdx < plannedList.length; pIdx++) {
    const p = plannedList[pIdx];
    const hasActual = actualRuns.some(act => isMatch(act.spkNo, p.spkNo));
    if (hasActual) {
      maxActivePlanIdx = Math.max(maxActivePlanIdx, pIdx);
    }
  }

  const rows = [];
  const handledActualIndices = new Set();
  
  // Anchor waktu: mulai dari jam label pertama aktual jika ada, atau jam sekarang
  let timelineClock = new Date();
  if (actualRuns.length > 0 && actualRuns[0].firstTime > 0) {
    timelineClock = new Date(actualRuns[0].firstTime);
  }

  for (let pIdx = 0; pIdx < plannedList.length; pIdx++) {
    const plan = plannedList[pIdx];
    const planAnalytics = spkStore.getSpkRealtimeAnalytics(plan.spkNo, plan) || {};

    // A. Periksa apakah ada pengerjaan aktual yang TIDAK ADA DI PLAN (Order Sisipan)
    for (let aIdx = 0; aIdx < actualRuns.length; aIdx++) {
      if (handledActualIndices.has(aIdx)) continue;
      const act = actualRuns[aIdx];

      if (isMatch(act.spkNo, plan.spkNo)) {
        break; // Cocok dengan plan saat ini
      }

      const matchesFuture = plannedList.slice(pIdx + 1).some(fPlan => isMatch(act.spkNo, fPlan.spkNo));
      if (!matchesFuture) {
        const actTargetStatus = evaluateTargetStatus(act.totalRealRolls, act.totalRealRolls, false);
        const actStartFormatted = act.firstTime > 0
          ? new Date(act.firstTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(act.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-';
        const actEndFormatted = act.lastTime > 0
          ? new Date(act.lastTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(act.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
          : '-';

        rows.push({
          id: `unplanned_${act.spkNo}_${aIdx}`,
          type: 'UNPLANNED',
          plan: null,
          actual: act,
          status: 'UNPLANNED',
          startTimeFormatted: actStartFormatted,
          endTimeFormatted: actEndFormatted,
          targetStatus: actTargetStatus,
          warning: 'Order Sisipan / Revisi Lapangan (Tidak Ada dalam Planned SPK)'
        });
        handledActualIndices.add(aIdx);
      } else {
        break;
      }
    }

    // B. Pasangkan plan saat ini dengan pengerjaan aktual jika ada
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

    const speed = planAnalytics.speed || 600;
    const durMinutes = planAnalytics.totalMinutes || 45;
    const plannedTargetRolls = planAnalytics.plannedChildRolls || plan.totalPlannedRolls || (plan.jumlahJumbo * 2) || 2;

    let status = 'UPCOMING';
    let estStartTime = '';
    let estEndTime = '';
    let estEndTimestamp = 0;
    let actualDurationMinutes = planAnalytics.actualDurationMinutes || 0;

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
        estEndTimestamp = finishTime;
        actualDurationMinutes = Math.max(1, Math.round((finishTime - (matchedActual.firstTime || finishTime)) / 60000));
        // Update anchor waktu untuk SPK berikutnya ke jam selesai aktual SPK ini!
        timelineClock = new Date(finishTime);
      } else {
        // IN_PROGRESS: hitung sisa roll & sisa menit
        const rollsLeft = Math.max(1, plannedTargetRolls - matchedActual.totalRealRolls);
        const remainingFraction = Math.max(0.1, rollsLeft / plannedTargetRolls);
        const remainingMins = Math.round(durMinutes * remainingFraction);
        const projectedFinish = Date.now() + remainingMins * 60000;
        estEndTime = new Date(projectedFinish).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        estEndTimestamp = projectedFinish;
        actualDurationMinutes = Math.max(1, Math.round((Date.now() - (matchedActual.firstTime || Date.now())) / 60000));
        // Update anchor waktu untuk SPK berikutnya
        timelineClock = new Date(projectedFinish);
      }
    } else {
      // Belum ada data aktual
      if (pIdx < maxActivePlanIdx) {
        // DETEKSI SKIPPED: Plan ini berada sebelum plan yang sudah dikerjakan di lapangan!
        status = 'SKIPPED';
        estStartTime = '-';
        estEndTime = '-';
      } else {
        // Normal UPCOMING: waktu mulai dihitung dari jam selesai SPK sebelumnya!
        const startMs = timelineClock.getTime();
        const endMs = startMs + durMinutes * 60000;
        estStartTime = new Date(startMs).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        estEndTime = new Date(endMs).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        estEndTimestamp = endMs;
        timelineClock = new Date(endMs);
      }
    }

    const actualChildRolls = matchedActual ? matchedActual.totalRealRolls : 0;
    const targetStatus = evaluateTargetStatus(actualChildRolls, plannedTargetRolls, status === 'SKIPPED');
    const startTimeFormatted = matchedActual && matchedActual.firstTime > 0
      ? new Date(matchedActual.firstTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(matchedActual.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : (status === 'SKIPPED' ? '-' : (estStartTime || '-'));
    const endTimeFormatted = matchedActual && matchedActual.lastTime > 0
      ? new Date(matchedActual.lastTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(matchedActual.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : (status === 'SKIPPED' ? '-' : (estEndTime || '-'));

    rows.push({
      id: `plan_${plan.id || pIdx}`,
      type: 'PLANNED',
      plan,
      actual: matchedActual,
      status,
      speed,
      planDurationMinutes: durMinutes,
      actualDurationMinutes,
      estStartTime,
      estEndTime,
      estEndTimestamp,
      startTimeFormatted,
      endTimeFormatted,
      targetStatus,
      achievementPercent: planAnalytics.achievementPercent || 0,
      plannedParentRolls: planAnalytics.plannedParentRolls || 1,
      actualParentCut: planAnalytics.actualParentCut || 0,
      diffParent: planAnalytics.diffParent || 0,
      plannedChildRolls: plannedTargetRolls,
      actualChildRolls,
      diffChild: planAnalytics.diffChild || 0,
      diffMeter: planAnalytics.diffMeter || 0,
      totalUp: planAnalytics.totalUp || 2
    });
  }

  // C. Sisa pengerjaan aktual di akhir yang tidak ada dalam rencana
  for (let aIdx = 0; aIdx < actualRuns.length; aIdx++) {
    if (!handledActualIndices.has(aIdx)) {
      const act = actualRuns[aIdx];
      const actTargetStatus = evaluateTargetStatus(act.totalRealRolls, act.totalRealRolls, false);
      const actStartFormatted = act.firstTime > 0
        ? new Date(act.firstTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(act.firstTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';
      const actEndFormatted = act.lastTime > 0
        ? new Date(act.lastTime).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }) + ' ' + new Date(act.lastTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
        : '-';

      rows.push({
        id: `unplanned_${act.spkNo}_${aIdx}`,
        type: 'UNPLANNED',
        plan: null,
        actual: act,
        status: 'UNPLANNED',
        startTimeFormatted: actStartFormatted,
        endTimeFormatted: actEndFormatted,
        targetStatus: actTargetStatus,
        warning: 'Order Sisipan / Revisi Lapangan (Tidak Ada dalam Planned SPK)'
      });
      handledActualIndices.add(aIdx);
    }
  }

  return rows;
});

const batchScheduleSummary = computed(() => {
  const rows = timelineRows.value || [];
  let totalPlannedRolls = 0;
  let totalRealRolls = 0;
  let totalPlannedMeter = 0;
  let totalRealMeter = 0;
  let completedCount = 0;
  let inProgressCount = 0;
  let skippedCount = 0;
  let upcomingCount = 0;
  let finalEndTimestamp = 0;
  let lastEndTimeFormatted = '';

  for (const r of rows) {
    if (r.plan) {
      totalPlannedRolls += (r.plannedChildRolls || 0);
      totalPlannedMeter += (parseFloat(r.plan.totalPlannedMeter) || 0);
    }
    if (r.actual) {
      totalRealRolls += (r.actual.totalRealRolls || 0);
      totalRealMeter += (r.actual.totalRealMeter || 0);
    }
    if (r.status === 'COMPLETED') completedCount++;
    else if (r.status === 'IN_PROGRESS') inProgressCount++;
    else if (r.status === 'SKIPPED') skippedCount++;
    else if (r.status === 'UPCOMING') upcomingCount++;

    if (r.estEndTimestamp && r.estEndTimestamp > finalEndTimestamp) {
      finalEndTimestamp = r.estEndTimestamp;
      lastEndTimeFormatted = r.estEndTime;
    }
  }

  const remainingMinutes = finalEndTimestamp > 0 
    ? Math.max(0, Math.round((finalEndTimestamp - Date.now()) / 60000))
    : 0;

  const rollPercent = totalPlannedRolls > 0 ? Math.min(100, Math.round((totalRealRolls / totalPlannedRolls) * 100)) : 0;
  const meterPercent = totalPlannedMeter > 0 ? Math.min(100, Math.round((totalRealMeter / totalPlannedMeter) * 100)) : 0;

  return {
    totalPlannedRolls,
    totalRealRolls,
    totalPlannedMeter,
    totalRealMeter,
    completedCount,
    inProgressCount,
    skippedCount,
    upcomingCount,
    rollPercent,
    meterPercent,
    estimatedCompletionTime: lastEndTimeFormatted || 'Sesuai Jadwal',
    remainingMinutes,
    isDelayed: remainingMinutes > 0 && remainingMinutes > (upcomingCount * 45)
  };
});





const planAnalyticsMap = computed(() => {
  const res = {};
  for (const p of (spkStore.plans || [])) {
    res[p.id || p.spkNo] = spkStore.getSpkRealtimeAnalytics(p.spkNo, p) || {
      speed: 600,
      cuttingMinutes: 0,
      changeOverMinutes: 0,
      totalMinutes: 0,
      achievementPercent: 0,
      totalRealRolls: 0,
      totalRealMeter: 0,
      totalRealKg: 0,
      passCount: 0,
      holdCount: 0,
      rejectCount: 0,
      isCrossOrderWarning: false,
      warningMessage: ''
    };
  }
  return res;
});

const getPlanAnalytics = (plan) => {
  if (!plan) return {};
  return planAnalyticsMap.value[plan.id || plan.spkNo] || {
    speed: 600,
    cuttingMinutes: 0,
    changeOverMinutes: 0,
    totalMinutes: 0,
    achievementPercent: 0,
    totalRealRolls: 0,
    totalRealMeter: 0,
    totalRealKg: 0,
    passCount: 0,
    holdCount: 0,
    rejectCount: 0,
    isCrossOrderWarning: false,
    warningMessage: ''
  };
};

// ── SHEET 1 COMPUTED KPIS ──

const totalPlannedMeterAll = computed(() => {
  return (spkStore.plans || []).reduce((sum, p) => sum + (parseFloat(p.totalPlannedMeter) || 0), 0);
});

const totalJumboAll = computed(() => {
  return (spkStore.plans || []).reduce((sum, p) => sum + (parseInt(p.jumlahJumbo, 10) || 0), 0);
});

const totalRealizedMeterAll = computed(() => {
  let sum = 0;
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) sum += a.totalRealMeter;
  }
  return sum;
});

const meterAchievementPercent = computed(() => {
  const plan = totalPlannedMeterAll.value;
  if (plan === 0) return 0;
  return Math.min(100, Math.round((totalRealizedMeterAll.value / plan) * 100));
});

const totalCuttingMinutesAll = computed(() => {
  let sum = 0;
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) sum += a.cuttingMinutes;
  }
  return sum;
});

const totalChangeOverMinutesAll = computed(() => {
  let sum = 0;
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) sum += a.changeOverMinutes;
  }
  return sum;
});

const totalEstimatedMinutesAll = computed(() => {
  return totalCuttingMinutesAll.value + totalChangeOverMinutesAll.value;
});

const calculatedEtcTimeString = computed(() => {
  const mins = totalEstimatedMinutesAll.value;
  const finishDate = new Date(Date.now() + mins * 60000);
  return finishDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
});

const totalPassAll = computed(() => {
  let sum = 0;
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) sum += a.passCount;
  }
  return sum;
});

const totalHoldAll = computed(() => {
  let sum = 0;
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) sum += a.holdCount;
  }
  return sum;
});

const totalRejectAll = computed(() => {
  let sum = 0;
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) sum += a.rejectCount;
  }
  return sum;
});

const parseCharting = (jsonStr) => {
  try {
    return jsonStr ? JSON.parse(jsonStr) : [];
  } catch (e) {
    return [];
  }
};

const getUpCol = (row, upIndex) => {
  const ups = parseCharting(row.chartingJson);
  const found = ups.find(u => u.upNo === upIndex);
  return found ? found.lebar : '—';
};

const getChildPanjang = (row) => {
  const ups = parseCharting(row.chartingJson);
  return ups.length > 0 && ups[0].panjang ? ups[0].panjang : 12000;
};

// ── SHEET 3: ALL DATA ROLL SPK LIST (INHOUSE & EXTERNAL TABS, TIMELINE SORTED) ──
const spkListTab = ref('inhouse'); // 'inhouse' | 'external'
const spkFilterYear = ref('ALL');
const spkFilterMonth = ref('ALL');
const spkFilterMachine = ref('ALL');
const spkSortDirection = ref('desc'); // 'desc' | 'asc'
const spkCurrentPage = ref(1);
const spkPageSize = ref(10);
const drawerLotSearch = ref('');

// Total all unique SPKs from store
const allSpkList = computed(() => {
  return spkStore.allDataRollSpkList || [];
});

// Backward compatibility alias for any template/header count
const activeSpkList = allSpkList;

// Tab 1: SPK Normal (Inhouse SPK)
const inhouseSpkList = computed(() => {
  return allSpkList.value.filter(s => s.category === 'INHOUSE');
});

// Tab 2: SPK Lain-lain (External SPK)
const externalSpkList = computed(() => {
  return allSpkList.value.filter(s => s.category === 'EXTERNAL');
});

// List based on active tab
const currentTabSpkList = computed(() => {
  return spkListTab.value === 'inhouse' ? inhouseSpkList.value : externalSpkList.value;
});

// Available years for dropdown based on active tab
const availableSpkYears = computed(() => {
  const yrs = new Set();
  currentTabSpkList.value.forEach(s => {
    if (s.year) yrs.add(s.year);
  });
  return Array.from(yrs).sort((a, b) => b - a);
});

// Available months for dropdown
const availableSpkMonths = computed(() => [
  { val: 'ALL', label: 'Semua Bulan' },
  { val: 1, label: '01 - Januari' },
  { val: 2, label: '02 - Februari' },
  { val: 3, label: '03 - Maret' },
  { val: 4, label: '04 - April' },
  { val: 5, label: '05 - Mei' },
  { val: 6, label: '06 - Juni' },
  { val: 7, label: '07 - Juli' },
  { val: 8, label: '08 - Agustus' },
  { val: 9, label: '09 - September' },
  { val: 10, label: '10 - Oktober' },
  { val: 11, label: '11 - November' },
  { val: 12, label: '12 - Desember' }
]);

// Available machines for dropdown
const availableSpkMachines = computed(() => [
  'ALL', 'SLITTING', 'REWIND', 'CASTING', 'METALIZE'
]);

// Filtered and timeline sorted list
const filteredSpkList = computed(() => {
  const q = (searchSpkQuery.value || '').trim().toLowerCase();
  const yr = spkFilterYear.value;
  const mo = spkFilterMonth.value;
  const mach = spkFilterMachine.value;

  const filtered = currentTabSpkList.value.filter(item => {
    // Search query
    if (q) {
      const matchQuery =
        String(item.spkNo || '').toLowerCase().includes(q) ||
        String(item.vendor || '').toLowerCase().includes(q) ||
        String(item.formula || '').toLowerCase().includes(q) ||
        String(item.thickness || '').toLowerCase().includes(q) ||
        String(item.year || '').includes(q) ||
        String(item.monthName || '').toLowerCase().includes(q) ||
        (item.machines || []).some(m => String(m).toLowerCase().includes(q));
      if (!matchQuery) return false;
    }

    // Filter Year
    if (yr !== 'ALL' && Number(item.year) !== Number(yr)) {
      return false;
    }

    // Filter Month
    if (mo !== 'ALL' && Number(item.month) !== Number(mo)) {
      return false;
    }

    // Filter Machine
    if (mach !== 'ALL') {
      const hasMach = (item.machines || []).some(m => String(m).toUpperCase() === mach);
      if (!hasMach) return false;
    }

    return true;
  });

  // Timeline Sorting: Tahun -> Bulan -> No Urut / Timestamp -> SPK No
  const dir = spkSortDirection.value;
  return filtered.sort((a, b) => {
    // 1. Tahun
    if ((b.year || 0) !== (a.year || 0)) {
      return dir === 'desc' ? (b.year || 0) - (a.year || 0) : (a.year || 0) - (b.year || 0);
    }
    // 2. Bulan
    if ((b.month || 0) !== (a.month || 0)) {
      return dir === 'desc' ? (b.month || 0) - (a.month || 0) : (a.month || 0) - (b.month || 0);
    }
    // 3. No Urut (jika ada)
    if (a.noUrut !== null && b.noUrut !== null && a.noUrut !== b.noUrut) {
      return dir === 'desc' ? b.noUrut - a.noUrut : a.noUrut - b.noUrut;
    }
    if (a.noUrut !== null && b.noUrut === null) return dir === 'desc' ? -1 : 1;
    if (a.noUrut === null && b.noUrut !== null) return dir === 'desc' ? 1 : -1;
    // 4. Timestamp Produksi Aktual
    const timeA = a.latestTimestamp || 0;
    const timeB = b.latestTimestamp || 0;
    if (timeB !== timeA) {
      return dir === 'desc' ? timeB - timeA : timeA - timeB;
    }
    // 5. Alfabetis Nomor SPK
    return dir === 'desc'
      ? String(b.spkNo || '').localeCompare(String(a.spkNo || ''), undefined, { numeric: true, sensitivity: 'base' })
      : String(a.spkNo || '').localeCompare(String(b.spkNo || ''), undefined, { numeric: true, sensitivity: 'base' });
  });
});

// Backward compatibility alias
const filteredActiveSpkList = filteredSpkList;

const totalSpkPages = computed(() => {
  return Math.ceil(filteredSpkList.value.length / spkPageSize.value) || 1;
});

const paginatedActiveSpkList = computed(() => {
  const start = (spkCurrentPage.value - 1) * spkPageSize.value;
  return filteredSpkList.value.slice(start, start + spkPageSize.value);
});

// When changing tab, reset page to 1
watch(spkListTab, () => {
  spkCurrentPage.value = 1;
});
watch([spkFilterYear, spkFilterMonth, spkFilterMachine, searchSpkQuery], () => {
  spkCurrentPage.value = 1;
});

const filteredDrawerLots = computed(() => {
  const lots = selectedSpkAnalytics.value?.realLots || [];
  const q = (drawerLotSearch.value || '').trim().toLowerCase();
  if (!q) return lots;
  return lots.filter(l => 
    String(l.lot || '').toLowerCase().includes(q) || 
    String(l.turunan || '').toLowerCase().includes(q) || 
    String(l.operator || '').toLowerCase().includes(q)
  );
});

const selectedDetailSpk = ref(null);
const detailPageLotSearch = ref('');
const detailPageLotCurrentPage = ref(1);
const detailPageLotPageSize = ref(15);

const filteredDetailPageLots = computed(() => {
  const lots = selectedDetailSpk.value?.realLots || [];
  const q = (detailPageLotSearch.value || '').trim().toLowerCase();
  if (!q) return lots;
  return lots.filter(l => 
    String(l.lot || '').toLowerCase().includes(q) ||
    String(l.turunan || '').toLowerCase().includes(q) ||
    String(l.operator || '').toLowerCase().includes(q)
  );
});

const totalDetailPageLotPages = computed(() => {
  return Math.ceil(filteredDetailPageLots.value.length / detailPageLotPageSize.value) || 1;
});

watch(detailPageLotSearch, () => {
  detailPageLotCurrentPage.value = 1;
});

const paginatedDetailPageLots = computed(() => {
  const start = (detailPageLotCurrentPage.value - 1) * detailPageLotPageSize.value;
  return filteredDetailPageLots.value.slice(start, start + detailPageLotPageSize.value);
});

// Quick-view drawer: populates selectedSpkAnalytics and shows the overlay drawer
const openQuickDrawer = (item) => {
  if (!item) return;
  const density = getFilmDensity(item.material, item.formula, item.spkNo, configStore?.filmConfigs);
  const defThk = parseFloat(item.thickness) || 25;

  const realLots = (item.realLots || []).map(lt => {
    let wt = parseFloat(lt.weight) || 0;
    if (wt <= 0) {
      const thk = parseFloat(lt.thickness) || defThk;
      const w = parseFloat(lt.width) || 0;
      const m = parseFloat(lt.length) || 0;
      wt = calculateBeratTeori(thk, w, m, density);
    }
    return { ...lt, weight: wt };
  });

  const wMap = new Map();
  for (const lt of realLots) {
    const w = Math.round(parseFloat(lt.width) || 0);
    if (w > 0) {
      if (!wMap.has(w)) wMap.set(w, { width: w, totalRoll: 0, totalMeter: 0, totalKg: 0 });
      const wObj = wMap.get(w);
      wObj.totalRoll++;
      wObj.totalMeter += parseFloat(lt.length) || 0;
      wObj.totalKg += parseFloat(lt.weight) || 0;
    }
  }
  const widthSummaries = Array.from(wMap.values()).sort((a, b) => b.width - a.width);
  widthSummaries.forEach(w => { w.totalKg = Math.round(w.totalKg * 10) / 10; });

  selectedSpkAnalytics.value = {
    ...item,
    realLots,
    widthSummaries,
    totalRealKg: Math.round(widthSummaries.reduce((sum, w) => sum + (w.totalKg || 0), 0) * 10) / 10 || item.totalRealKg,
  };
  showDetailDrawer.value = true;
};

const openSpkDetailDrawer = (item) => {
  if (!item) return;
  const speed = item.speed || spkStore.getSlittingSpeed(item.formula);
  const timeEst = spkStore.calculateEstimateMinutes(item.totalRealMeter || 0, item.totalJumbo || 1, speed);

  const density = getFilmDensity(item.material, item.formula, item.spkNo, configStore?.filmConfigs);
  const defThk = parseFloat(item.thickness) || 25;

  // Ensure realLots have valid theoretical weight if missing
  const realLots = (item.realLots || []).map(lt => {
    let wt = parseFloat(lt.weight) || 0;
    if (wt <= 0) {
      const thk = parseFloat(lt.thickness) || defThk;
      const w = parseFloat(lt.width) || 0;
      const m = parseFloat(lt.length) || 0;
      wt = calculateBeratTeori(thk, w, m, density);
    }
    return { ...lt, weight: wt };
  });

  // Calculate widthSummaries with accurate totalKg and totalMeter
  const wMap = new Map();
  for (const lt of realLots) {
    const w = Math.round(parseFloat(lt.width) || 0);
    if (w > 0) {
      if (!wMap.has(w)) {
        wMap.set(w, { width: w, totalRoll: 0, totalMeter: 0, totalKg: 0 });
      }
      const wObj = wMap.get(w);
      wObj.totalRoll++;
      wObj.totalMeter += parseFloat(lt.length) || 0;
      wObj.totalKg += parseFloat(lt.weight) || 0;
    }
  }
  const widthSummaries = Array.from(wMap.values()).sort((a, b) => b.width - a.width);
  widthSummaries.forEach(w => {
    w.totalKg = Math.round(w.totalKg * 10) / 10;
  });

  const computedTotalKg = Math.round(widthSummaries.reduce((sum, w) => sum + (w.totalKg || 0), 0) * 10) / 10;
  const totalRealKg = (parseFloat(item.totalRealKg) > 0) ? parseFloat(item.totalRealKg) : computedTotalKg;

  selectedDetailSpk.value = {
    ...item,
    realLots,
    widthSummaries,
    totalRealKg,
    speed,
    totalMinutes: item.totalMinutes || timeEst.totalMinutes,
    cuttingMinutes: item.cuttingMinutes || timeEst.cuttingMinutes,
    changeOverMinutes: item.changeOverMinutes || timeEst.changeOverMinutes
  };
  detailPageLotSearch.value = '';
  detailPageLotCurrentPage.value = 1;
  activeSheet.value = 'detail';
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── SHEET 3: AI SCAN & VERIFIKASI MANDIRI ──

const triggerCameraScan = async () => {
  // Buka dialog input gambar via kamera perangkat
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.capture = 'environment'; // Buka kamera belakang jika di mobile / tablet
  input.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      await processImageScan(file);
    }
  };
  input.click();
};

const handleFileUploadScan = async (e) => {
  const file = e.target.files?.[0];
  if (file) {
    await processImageScan(file);
  }
};

const isAiScanning = ref(false);
const aiScanStage = ref('');
const aiScanProgress = ref(0);

const processImageScan = async (file) => {
  isAiScanning.value = true;
  aiScanStage.value = 'Membaca dan memproses citra dokumen fisik...';
  aiScanProgress.value = 25;

  try {
    aiScanStage.value = 'Menghubungi Google Gemini AI Engine...';
    aiScanProgress.value = 50;

    if (!configStore.filmConfigs || configStore.filmConfigs.length === 0) {
      await configStore.loadAll();
    }

    const extractedRows = await parseSpkDocumentImage(
      file,
      false,
      configStore.filmConfigs,
      null,
      (stage, pct, msg) => {
        if (pct) aiScanProgress.value = pct;
        if (msg) aiScanStage.value = msg;
      }
    );

    aiScanStage.value = 'Standarisasi format SPK & kalkulasi auto-trim...';
    aiScanProgress.value = 95;

    await new Promise(r => setTimeout(r, 400));

    if (extractedRows && extractedRows.length > 0) {
      const todayStr = new Date().toISOString().slice(0, 10);
      verificationBatchName.value = `JADWAL SLITTING ${todayStr}`;
      verificationBatchDate.value = todayStr;
      verificationStagingList.value = extractedRows;
      showVerificationModal.value = true;
    } else {
      alert('AI tidak menemukan data tabel jadwal potong pada dokumen ini.');
    }
  } catch (err) {
    console.error('Scan failed:', err);
    alert('Gagal memproses dokumen SPK: ' + err.message);
  } finally {
    isAiScanning.value = false;
    aiScanProgress.value = 0;
  }
};

const calculateRowTrim = (row) => {
  const parent = parseFloat(row.lebarParent) || 0;
  const up1 = parseFloat(row.up1) || 0;
  const up2 = parseFloat(row.up2) || 0;
  const up3 = parseFloat(row.up3) || 0;
  const up4 = parseFloat(row.up4) || 0;
  return Math.max(0, parent - (up1 + up2 + up3 + up4));
};

// ── DATE RANGE & FULL STANDARD SPK LOGIC ──

const isDateRangeMode = ref(false);
const todayIso = new Date().toISOString().slice(0, 10);
const verificationBatchStartDate = ref(todayIso);
const verificationBatchEndDate = ref(todayIso);
const verificationBatchDateLabel = ref('');

const monthNamesIndo = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

const formatRangeLabel = (startStr, endStr) => {
  if (!startStr) return '';
  const d1 = new Date(startStr);
  const d2 = endStr ? new Date(endStr) : d1;
  const m1 = monthNamesIndo[d1.getMonth() + 1] || 'Sep';
  const m2 = monthNamesIndo[d2.getMonth() + 1] || m1;
  const y1 = d1.getFullYear();
  const y2 = d2.getFullYear();

  if (startStr === endStr || !endStr) {
    return `${d1.getDate()} ${m1} ${y1}`;
  }
  if (m1 === m2 && y1 === y2) {
    return `${d1.getDate()}-${d2.getDate()} ${m1} ${y1}`;
  }
  return `${d1.getDate()} ${m1} - ${d2.getDate()} ${m2} ${y2}`;
};

const toggleDateRangeMode = () => {
  isDateRangeMode.value = !isDateRangeMode.value;
  if (isDateRangeMode.value) {
    onDateRangeChanged();
  } else {
    onSingleDateChanged();
  }
};

const onDateRangeChanged = () => {
  const lbl = formatRangeLabel(verificationBatchStartDate.value, verificationBatchEndDate.value);
  verificationBatchDateLabel.value = lbl;
  verificationBatchName.value = `JADWAL SLITTING ${lbl}`;
  standardizeAllStagingSpks();
};

const onSingleDateChanged = () => {
  const lbl = formatRangeLabel(verificationBatchDate.value, verificationBatchDate.value);
  verificationBatchDateLabel.value = lbl;
  verificationBatchName.value = `JADWAL SLITTING ${lbl}`;
  standardizeAllStagingSpks();
};

const standardizeAllStagingSpks = () => {
  const activeDate = isDateRangeMode.value ? verificationBatchStartDate.value : verificationBatchDate.value;
  verificationStagingList.value.forEach((item, idx) => {
    item.no = idx + 1;
    item.seq = idx + 1;
    item.urutanPengerjaan = idx + 1;
    item.spkNo = normalizeSpkToFullStandard(item.spkNo, idx + 1, activeDate, item.supplier, item.jenis || item.formula);
    recalcVerificationRow(item);
  });
};

// ── TRUE EXCEL SPREADSHEET ENGINE FOR SPK VERIFICATION ──

const vColumns = [
  { key: 'no', label: 'NO', colLetter: 'A', width: '45px', align: 'center', readonly: true },
  { key: 'spkNo', label: 'NOMOR SPK', colLetter: 'B', width: '160px', align: 'left' },
  { key: 'formula', label: 'TYPE', colLetter: 'C', width: '85px', align: 'left' },
  { key: 'thickness', label: 'TEBAL', colLetter: 'D', width: '65px', align: 'center' },
  { key: 'lebarParent', label: 'LEBAR JR', colLetter: 'E', width: '90px', align: 'right' },
  { key: 'panjangParent', label: 'P. JR', colLetter: 'F', width: '90px', align: 'right' },
  { key: 'up1', label: 'UP 1', colLetter: 'G', width: '80px', align: 'center' },
  { key: 'up2', label: 'UP 2', colLetter: 'H', width: '80px', align: 'center' },
  { key: 'up3', label: 'UP 3', colLetter: 'I', width: '80px', align: 'center' },
  { key: 'up4', label: 'UP 4', colLetter: 'J', width: '80px', align: 'center' },
  { key: 'panjangChild', label: 'P. CHILD', colLetter: 'K', width: '85px', align: 'right' },
  { key: 'jumlahJumbo', label: 'JML JR', colLetter: 'L', width: '70px', align: 'center' },
  { key: 'trimAuto', label: 'TRIM', colLetter: 'M', width: '70px', align: 'center', readonly: true },
  { key: 'keterangan', label: 'KETERANGAN', colLetter: 'N', width: '130px', align: 'left' },
  { key: 'supplier', label: 'SUPPLIER', colLetter: 'O', width: '130px', align: 'left' }
];

const selStart = ref({ r: 0, c: 1 });
const selEnd = ref({ r: 0, c: 1 });
const isSpreadsheetMouseDown = ref(false);
const editingCell = ref({ r: null, c: null });
const cellEditValue = ref('');
const cellInputRef = ref(null);

const vMinR = computed(() => Math.min(selStart.value.r, selEnd.value.r));
const vMaxR = computed(() => Math.max(selStart.value.r, selEnd.value.r));
const vMinC = computed(() => Math.min(selStart.value.c, selEnd.value.c));
const vMaxC = computed(() => Math.max(selStart.value.c, selEnd.value.c));

const activeCellAddress = computed(() => {
  const col = vColumns[selStart.value.c];
  if (!col) return 'A1';
  return `${col.colLetter}${selStart.value.r + 1}`;
});

const activeCellValue = computed(() => {
  const r = selStart.value.r;
  const c = selStart.value.c;
  const item = verificationStagingList.value[r];
  if (!item) return '';
  const col = vColumns[c];
  if (!col) return '';
  if (col.key === 'trimAuto') return calculateRowTrim(item);
  return item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '';
});

const isCellSelected = (r, c) => {
  return r >= vMinR.value && r <= vMaxR.value && c >= vMinC.value && c <= vMaxC.value;
};

const isCellActive = (r, c) => {
  return selStart.value.r === r && selStart.value.c === c;
};

const moveActiveCell = (dr, dc, isShift = false) => {
  const maxRows = Math.max(0, verificationStagingList.value.length - 1);
  const maxCols = vColumns.length - 1;

  if (isShift) {
    selEnd.value = {
      r: Math.max(0, Math.min(maxRows, selEnd.value.r + dr)),
      c: Math.max(1, Math.min(maxCols, selEnd.value.c + dc))
    };
  } else {
    const nextR = Math.max(0, Math.min(maxRows, selStart.value.r + dr));
    const nextC = Math.max(1, Math.min(maxCols, selStart.value.c + dc));
    selStart.value = { r: nextR, c: nextC };
    selEnd.value = { r: nextR, c: nextC };
  }
};

const handleCellMouseDown = (r, c, e) => {
  if (editingCell.value.r !== null) {
    commitCellEdit(0, 0);
  }
  if (e.shiftKey) {
    selEnd.value = { r, c };
  } else {
    selStart.value = { r, c };
    selEnd.value = { r, c };
    isSpreadsheetMouseDown.value = true;
  }
};

const handleCellMouseOver = (r, c) => {
  if (isSpreadsheetMouseDown.value) {
    selEnd.value = { r, c };
  }
};

const handleSpreadsheetMouseUp = () => {
  isSpreadsheetMouseDown.value = false;
};

const enterCellEdit = (r, c, initChar = null) => {
  const col = vColumns[c];
  if (!col || col.readonly) return;
  const item = verificationStagingList.value[r];
  if (!item) return;

  editingCell.value = { r, c };
  cellEditValue.value = initChar !== null ? initChar : (item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '');
  
  nextTick(() => {
    if (cellInputRef.value && cellInputRef.value[0]) {
      cellInputRef.value[0].focus();
      if (initChar === null) {
        cellInputRef.value[0].select();
      }
    }
  });
};

const commitCellEdit = (dr = 0, dc = 0) => {
  const r = editingCell.value.r;
  const c = editingCell.value.c;
  if (r === null || c === null) return;

  const item = verificationStagingList.value[r];
  const col = vColumns[c];

  if (item && col && !col.readonly) {
    let val = cellEditValue.value.trim();
    if (col.key === 'spkNo') {
      const activeDate = isDateRangeMode.value ? verificationBatchStartDate.value : verificationBatchDate.value;
      item.spkNo = normalizeSpkToFullStandard(val, r + 1, activeDate, item.supplier, item.jenis || item.formula);
    } else if (['thickness', 'lebarParent', 'panjangParent', 'up1', 'up2', 'up3', 'up4', 'panjangChild', 'jumlahJumbo'].includes(col.key)) {
      item[col.key] = val !== '' ? (parseFloat(val) || 0) : null;
    } else {
      item[col.key] = val;
    }
    recalcVerificationRow(item);
  }

  editingCell.value = { r: null, c: null };
  if (dr !== 0 || dc !== 0) {
    moveActiveCell(dr, dc, false);
  }
};

const cancelCellEdit = () => {
  editingCell.value = { r: null, c: null };
};

const recalcVerificationRow = (row) => {
  const lebar = parseFloat(row.lebarParent) || 0;
  const u1 = row.up1 !== null && row.up1 !== '' ? parseFloat(row.up1) : null;
  const u2 = row.up2 !== null && row.up2 !== '' ? parseFloat(row.up2) : null;
  const u3 = row.up3 !== null && row.up3 !== '' ? parseFloat(row.up3) : null;
  const u4 = row.up4 !== null && row.up4 !== '' ? parseFloat(row.up4) : null;

  // Domain rule: jika parent tidak memiliki UP atau chart pada plan, barang di-rewind dengan ukuran yang sama
  if (!u1 && !u2 && !u3 && !u4) {
    row.up1 = lebar;
    row.trimAuto = 0;
    if (!row.keterangan || row.keterangan === '-') row.keterangan = 'REWIND (UKURAN SAMA)';
  } else {
    const sumUp = (u1 || 0) + (u2 || 0) + (u3 || 0) + (u4 || 0);
    row.trimAuto = Math.max(0, lebar - sumUp);
  }
};

// EXCEL FILL DOWN (CTRL + D)
const handleExcelFillDown = () => {
  const items = verificationStagingList.value;
  if (!items.length) return;

  const minR = vMinR.value;
  const maxR = vMaxR.value;
  const minC = vMinC.value;
  const maxC = vMaxC.value;

  if (minR < maxR) {
    // Multi-row range: copy values from top row of selection downwards
    for (let c = minC; c <= maxC; c++) {
      const col = vColumns[c];
      if (col.readonly) continue;
      const topVal = items[minR][col.key];
      for (let r = minR + 1; r <= maxR; r++) {
        items[r][col.key] = topVal;
        recalcVerificationRow(items[r]);
      }
    }
  } else if (minR > 0) {
    // Single row: copy from cell above
    for (let c = minC; c <= maxC; c++) {
      const col = vColumns[c];
      if (col.readonly) continue;
      const aboveVal = items[minR - 1][col.key];
      items[minR][col.key] = aboveVal;
      recalcVerificationRow(items[minR]);
    }
  }
};

// EXCEL COPY (CTRL + C)
const handleExcelCopy = async () => {
  const items = verificationStagingList.value;
  if (!items.length) return;

  const minR = vMinR.value;
  const maxR = vMaxR.value;
  const minC = vMinC.value;
  const maxC = vMaxC.value;

  const lines = [];
  for (let r = minR; r <= maxR; r++) {
    const item = items[r];
    if (!item) continue;
    const rowVals = [];
    for (let c = minC; c <= maxC; c++) {
      const col = vColumns[c];
      const val = item[col.key] !== undefined && item[col.key] !== null ? String(item[col.key]) : '';
      rowVals.push(val);
    }
    lines.push(rowVals.join('\t'));
  }

  const tsv = lines.join('\n');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsv);
    }
  } catch (e) {
    console.warn('Clipboard copy error:', e);
  }
};

// EXCEL PASTE (CTRL + V)
const handleExcelPaste = async () => {
  let clipboardText = '';
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      clipboardText = await navigator.clipboard.readText();
    }
  } catch (e) {
    console.warn('Clipboard read error:', e);
  }

  if (!clipboardText || !clipboardText.trim()) return;

  const items = verificationStagingList.value;
  const lines = clipboardText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const pasteGrid = lines.filter(l => l.length > 0).map(l => l.split('\t'));
  if (pasteGrid.length === 0) return;

  const startR = selStart.value.r;
  const startC = selStart.value.c;

  // Single cell clipboard pasted into multi-cell selection
  if (pasteGrid.length === 1 && pasteGrid[0].length === 1 && (vMinR.value < vMaxR.value || vMinC.value < vMaxC.value)) {
    const pasteVal = pasteGrid[0][0].trim();
    for (let r = vMinR.value; r <= vMaxR.value; r++) {
      const targetItem = items[r];
      if (!targetItem) continue;
      for (let c = vMinC.value; c <= vMaxC.value; c++) {
        const col = vColumns[c];
        if (col.readonly) continue;
        targetItem[col.key] = pasteVal;
        recalcVerificationRow(targetItem);
      }
    }
  } else {
    // Standard block paste
    for (let rOff = 0; rOff < pasteGrid.length; rOff++) {
      const r = startR + rOff;
      if (r >= items.length) break;
      const targetItem = items[r];
      if (!targetItem) continue;

      const rowVals = pasteGrid[rOff];
      for (let cOff = 0; cOff < rowVals.length; cOff++) {
        const c = startC + cOff;
        if (c >= vColumns.length) break;
        const col = vColumns[c];
        if (col.readonly) continue;
        targetItem[col.key] = rowVals[cOff].trim();
        recalcVerificationRow(targetItem);
      }
    }
  }
};

// SPREADSHEET GLOBAL KEYDOWN DISPATCHER
const handleVerificationKeydown = (e) => {
  if (!showVerificationModal.value) return;

  // If currently editing inside cell input, let input handle standard keystrokes
  if (editingCell.value.r !== null && editingCell.value.c !== null) {
    if (e.key === 'Escape') {
      e.preventDefault();
      cancelCellEdit();
    }
    return;
  }

  const isCtrl = e.ctrlKey || e.metaKey;
  const isShift = e.shiftKey;

  // Ctrl + D: Fill Down
  if (isCtrl && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault();
    handleExcelFillDown();
    return;
  }

  // Ctrl + C: Copy
  if (isCtrl && (e.key === 'c' || e.key === 'C')) {
    e.preventDefault();
    handleExcelCopy();
    return;
  }

  // Ctrl + V: Paste
  if (isCtrl && (e.key === 'v' || e.key === 'V')) {
    e.preventDefault();
    handleExcelPaste();
    return;
  }

  // Arrow Keys Navigation
  if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveActiveCell(-1, 0, isShift);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    moveActiveCell(1, 0, isShift);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveActiveCell(0, -1, isShift);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveActiveCell(0, 1, isShift);
  } else if (e.key === 'Tab') {
    e.preventDefault();
    moveActiveCell(0, isShift ? -1 : 1, false);
  } else if (e.key === 'Enter' || e.key === 'F2') {
    e.preventDefault();
    enterCellEdit(selStart.value.r, selStart.value.c);
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    const minR = vMinR.value;
    const maxR = vMaxR.value;
    const minC = vMinC.value;
    const maxC = vMaxC.value;

    for (let r = minR; r <= maxR; r++) {
      const row = verificationStagingList.value[r];
      if (!row) continue;
      let rowChanged = false;
      for (let c = minC; c <= maxC; c++) {
        const col = vColumns[c];
        if (col && !col.readonly) {
          row[col.key] = '';
          rowChanged = true;
        }
      }
      if (rowChanged) {
        recalcVerificationRow(row);
      }
    }
  } else if (!isCtrl && !e.altKey && e.key.length === 1) {
    const col = vColumns[selStart.value.c];
    if (col && !col.readonly) {
      e.preventDefault();
      enterCellEdit(selStart.value.r, selStart.value.c, e.key);
    }
  }
};

const addVerificationRow = () => {
  const newRow = {
    no: verificationStagingList.value.length + 1,
    spkNo: '04/VIII',
    formula: 'M07',
    thickness: 25,
    lebarParent: 2320,
    panjangParent: 12000,
    up1: 1145,
    up2: 1145,
    up3: null,
    up4: null,
    panjangChild: 12000,
    jumlahJumbo: 1,
    trimAuto: 30,
    keterangan: '',
    supplier: 'INHOUSE (PT. SWC)'
  };
  verificationStagingList.value.push(newRow);
  selStart.value = { r: verificationStagingList.value.length - 1, c: 1 };
  selEnd.value = { r: verificationStagingList.value.length - 1, c: 1 };
};

const deleteSelectedVerificationRows = () => {
  const minR = vMinR.value;
  const maxR = vMaxR.value;
  if (confirm(`Hapus ${maxR - minR + 1} baris yang diseleksi?`)) {
    verificationStagingList.value.splice(minR, maxR - minR + 1);
    const nextR = Math.max(0, Math.min(verificationStagingList.value.length - 1, minR));
    selStart.value = { r: nextR, c: 1 };
    selEnd.value = { r: nextR, c: 1 };
  }
};


const commitVerificationToPlans = async () => {
  if (isCommittingVerification.value || verificationStagingList.value.length === 0) return;
  isCommittingVerification.value = true;

  try {
    const scheduleDateFinal = isDateRangeMode.value
      ? (verificationBatchDateLabel.value || `${verificationBatchStartDate.value} s/d ${verificationBatchEndDate.value}`)
      : (verificationBatchDateLabel.value || verificationBatchDate.value || new Date().toISOString().slice(0, 10));

    const batchMeta = {
      batchName: verificationBatchName.value || `JADWAL SLITTING ${scheduleDateFinal}`,
      docNo: '3B-PROD',
      tanggal: scheduleDateFinal,
      source: 'AI_SCAN'
    };

    const formattedItems = verificationStagingList.value.map(row => {
      const pParent = parseFloat(row.panjangParent) || 0;
      const pChild = parseFloat(row.panjangChild) || 12000;
      const jJumbo = parseInt(row.jumlahJumbo, 10) || 1;
      const rollsPerJumbo = (pParent > 0 && pChild > 0 && pParent >= pChild) ? Math.floor(pParent / pChild) : 1;
      const targetRollsPerUp = rollsPerJumbo * jJumbo;
      const totalPlannedMeter = pParent > 0 ? (pParent * jJumbo) : (parseFloat(row.totalPlannedMeter) || (pChild * jJumbo));

      const upList = [];
      if (row.up1 && parseFloat(row.up1) > 0) upList.push({ upNo: 1, lebar: parseFloat(row.up1), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });
      if (row.up2 && parseFloat(row.up2) > 0) upList.push({ upNo: 2, lebar: parseFloat(row.up2), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });
      if (row.up3 && parseFloat(row.up3) > 0) upList.push({ upNo: 3, lebar: parseFloat(row.up3), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });
      if (row.up4 && parseFloat(row.up4) > 0) upList.push({ upNo: 4, lebar: parseFloat(row.up4), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });

      const jenisFilm = String(row.jenis || 'CPP').toUpperCase().trim();
      const formulaCode = String(row.formula || 'M01').toUpperCase().trim();
      const thkVal = parseFloat(row.thickness) || 25;
      const lParent = parseFloat(row.lebarParent) || 0;
      const ukuranJumbo = row.ukuranJumbo || `${jenisFilm} ${formulaCode} ${thkVal} MC X ${lParent} MM`.toUpperCase();

      return {
        spkNo: row.spkNo,
        docNo: '3B-PROD',
        formula: formulaCode,
        jenis: jenisFilm,
        thickness: thkVal,
        ukuranJumbo,
        lebarParent: lParent,
        panjangParent: pParent,
        panjangChild: pChild,
        jumlahJumbo: jJumbo,
        totalPlannedMeter,
        rollsPerJumboPerUp: rollsPerJumbo,
        sisaButtMeter: (pParent > 0 && pChild > 0) ? Math.max(0, pParent - (rollsPerJumbo * pChild)) : 0,
        upList,
        keterangan: row.keterangan || '',
        status: 'PLANNED'
      };
    });

    const res = await spkStore.addBatchWithPlans(batchMeta, formattedItems);
    if (res && res.batch) {
      expandedBatchIds.value.add(res.batch.uuid);
    }
    showVerificationModal.value = false;
    activeSheet.value = 'planned';
    alert(`✓ Berhasil membuat Batch "${batchMeta.batchName}" dengan ${formattedItems.length} item SPK!`);
  } catch (err) {
    console.error('Failed to commit SPK verification:', err);
    alert(`Gagal menyimpan jadwal SPK: ${err.message || 'Terjadi kesalahan sistem'}`);
  } finally {
    isCommittingVerification.value = false;
  }
};

// ── MANUAL / REVISI MODAL ──

const calculateTrimInModal = computed(() => {
  const parent = parseFloat(manualForm.lebarParent) || 0;
  const up1 = parseFloat(manualForm.up1) || 0;
  const up2 = parseFloat(manualForm.up2) || 0;
  const up3 = parseFloat(manualForm.up3) || 0;
  const up4 = parseFloat(manualForm.up4) || 0;
  return Math.max(0, parent - (up1 + up2 + up3 + up4));
});

const openManualPlanModal = () => {
  editingPlanId.value = null;
  Object.assign(manualForm, {
    spkNo: '',
    formula: 'M07',
    thickness: 25,
    lebarParent: 2320,
    panjangParent: 29300,
    panjangChild: 12000,
    up1: 1145,
    up2: 1145,
    up3: null,
    up4: null,
    jumlahJumbo: 1,
    keterangan: ''
  });
  showManualModal.value = true;
};

const openEditPlanModal = (row) => {
  editingPlanId.value = row.id;
  const ups = parseCharting(row.chartingJson);
  Object.assign(manualForm, {
    spkNo: row.spkNo,
    formula: row.formula,
    thickness: row.thickness,
    lebarParent: row.lebarParent,
    panjangParent: row.panjangParent || 29300,
    panjangChild: row.panjangChild || getChildPanjang(row) || 12000,
    up1: ups.find(u => u.upNo === 1)?.lebar || null,
    up2: ups.find(u => u.upNo === 2)?.lebar || null,
    up3: ups.find(u => u.upNo === 3)?.lebar || null,
    up4: ups.find(u => u.upNo === 4)?.lebar || null,
    jumlahJumbo: row.jumlahJumbo || 1,
    keterangan: row.keterangan || '',
    revisionReason: 'Revisi manual dokumen SPK'
  });
  showManualModal.value = true;
};

const saveManualPlan = async () => {
  if (isSavingManualPlan.value) return;
  if (!manualForm.spkNo.trim()) return alert('Nomor SPK wajib diisi!');
  isSavingManualPlan.value = true;

  try {
    const pParent = parseFloat(manualForm.panjangParent) || 0;
    const pChild = parseFloat(manualForm.panjangChild) || 12000;
    const jJumbo = parseInt(manualForm.jumlahJumbo, 10) || 1;
    const rollsPerJumbo = (pParent > 0 && pChild > 0 && pParent >= pChild) ? Math.floor(pParent / pChild) : 1;
    const targetRollsPerUp = rollsPerJumbo * jJumbo;
    const totalPlannedMeter = pParent > 0 ? (pParent * jJumbo) : (pChild * jJumbo);

    const upList = [];
    if (manualForm.up1) upList.push({ upNo: 1, lebar: parseFloat(manualForm.up1), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });
    if (manualForm.up2) upList.push({ upNo: 2, lebar: parseFloat(manualForm.up2), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });
    if (manualForm.up3) upList.push({ upNo: 3, lebar: parseFloat(manualForm.up3), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });
    if (manualForm.up4) upList.push({ upNo: 4, lebar: parseFloat(manualForm.up4), panjang: pChild, rollsPerJumbo, targetRolls: targetRollsPerUp });

    const formulaCode = manualForm.formula.trim().toUpperCase();
    const thkVal = parseFloat(manualForm.thickness) || 25;
    const lParent = parseFloat(manualForm.lebarParent) || 0;
    const jenisFilm = 'CPP';
    const ukuranJumbo = `${jenisFilm} ${formulaCode} ${thkVal} MC X ${lParent} MM`.toUpperCase();

    const payload = {
      spkNo: manualForm.spkNo.trim().toUpperCase(),
      formula: formulaCode,
      jenis: jenisFilm,
      thickness: thkVal,
      ukuranJumbo,
      lebarParent: lParent,
      panjangParent: pParent,
      panjangChild: pChild,
      jumlahJumbo: jJumbo,
      upList,
      keterangan: manualForm.keterangan.trim(),
      totalPlannedMeter,
      rollsPerJumboPerUp: rollsPerJumbo,
      sisaButtMeter: (pParent > 0 && pChild > 0) ? Math.max(0, pParent - (rollsPerJumbo * pChild)) : 0
    };

    if (editingPlanId.value) {
      await spkStore.updatePlan(editingPlanId.value, payload, manualForm.revisionReason || 'Revisi SPK', 'Admin');
    } else {
      if (targetBatchUuidForNewItem.value) {
        payload.batchId = targetBatchUuidForNewItem.value;
        await spkStore.addPlan(payload);
        expandedBatchIds.value.add(targetBatchUuidForNewItem.value);
      } else {
        // Buat batch manual baru
        const todayStr = new Date().toISOString().slice(0, 10);
        const res = await spkStore.addBatchWithPlans({
          batchName: `Jadwal Slitting Manual ${todayStr}`,
          tanggal: todayStr,
          source: 'MANUAL'
        }, [payload]);
        if (res && res.batch) {
          expandedBatchIds.value.add(res.batch.uuid);
        }
      }
    }

    showManualModal.value = false;
  } catch (err) {
    console.error('Failed to save manual plan:', err);
    alert(`Gagal menyimpan data SPK: ${err.message || 'Terjadi kesalahan sistem'}`);
  } finally {
    isSavingManualPlan.value = false;
  }
};

const confirmDeletePlan = async (id, spkNo) => {
  if (confirm(`Hapus rencana SPK ${spkNo}?`)) {
    await spkStore.deletePlan(id);
  }
};
</script>
