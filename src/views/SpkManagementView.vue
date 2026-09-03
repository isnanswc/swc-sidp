<template>
  <div class="space-y-4 font-sans select-none pb-12 animate-fade-in">
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- HEADER & MAIN NAVIGATION TABS (3 SHEETS)                           -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="bg-white p-4 rounded-3xl border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-2xl bg-zinc-950 text-white flex items-center justify-center shadow-xs border border-zinc-800 shrink-0">
          <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-lg font-black text-zinc-900 tracking-tight">MANAJEMEN SPK (SURAT PERINTAH KERJA)</h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10.5px] font-black bg-red-50 text-red-700 border border-red-200 font-mono">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse"></span>
              JADWAL SLITTING (3B-PROD)
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Monitoring rencana potong slitting, timeline realtime, ekstraksi scan AI, dan pelacakan hasil produksi.
          </p>
        </div>
      </div>

      <!-- 3 SHEETS SWITCHER -->
      <div class="flex items-center bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200/80 gap-1.5 text-xs overflow-x-auto">
        <button
          @click="activeSheet = 'dashboard'"
          :class="[
            'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeSheet === 'dashboard'
              ? 'bg-zinc-900 text-white shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <span>📊</span>
          <span>1. Dashboard SPK</span>
        </button>

        <button
          @click="activeSheet = 'list'"
          :class="[
            'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeSheet === 'list'
              ? 'bg-zinc-900 text-white shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <span>📋</span>
          <span>2. List SPK Aktif</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-zinc-200 text-zinc-800">
            {{ activeSpkList.length }}
          </span>
        </button>

        <button
          @click="activeSheet = 'planned'"
          :class="[
            'px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeSheet === 'planned'
              ? 'bg-red-600 text-white shadow-xs font-black'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <span>📝</span>
          <span>3. Planned SPK Slitting</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold bg-white/20 text-white">
            {{ spkStore.plans.length }}
          </span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SHEET 1: DASHBOARD SPK (TIMELINE & ANALYTICS)                     -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="activeSheet === 'dashboard'" class="space-y-4 animate-fade-in">
      
      <!-- TOP KPI CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        <!-- KPI 1: Planned vs Actual Meter -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-zinc-500 uppercase font-mono">Volume Rencana Meter</span>
            <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[10px] font-mono font-black border border-blue-200">SLITTING</span>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black font-mono text-zinc-900">{{ formatNumber(totalPlannedMeterAll) }} <span class="text-xs text-zinc-400 font-normal">m</span></div>
            <div class="text-xs text-zinc-500 mt-0.5 font-medium flex items-center justify-between">
              <span>Aktual Terpotong:</span>
              <strong class="font-mono text-emerald-700">{{ formatNumber(totalRealizedMeterAll) }} m</strong>
            </div>
            <div class="w-full bg-zinc-100 rounded-full h-2 mt-2 overflow-hidden">
              <div class="bg-blue-600 h-2 rounded-full transition-all duration-500" :style="{ width: `${meterAchievementPercent}%` }"></div>
            </div>
          </div>
        </div>

        <!-- KPI 2: Estimasi Waktu & Downtime -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-zinc-500 uppercase font-mono">Estimasi Waktu & Downtime</span>
            <span class="px-2 py-0.5 rounded bg-purple-50 text-purple-800 text-[10px] font-mono font-black border border-purple-200">SPEED</span>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black font-mono text-purple-950">{{ formatMinutes(totalEstimatedMinutesAll) }}</div>
            <div class="text-xs text-zinc-500 mt-0.5 font-medium space-y-0.5">
              <div class="flex justify-between">
                <span>Waktu Potong:</span>
                <strong class="font-mono text-zinc-700">{{ formatMinutes(totalCuttingMinutesAll) }}</strong>
              </div>
              <div class="flex justify-between text-amber-800">
                <span>Change Over (18m/JR):</span>
                <strong class="font-mono">{{ formatMinutes(totalChangeOverMinutesAll) }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- KPI 3: Estimasi Jam Selesai (ETC) -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-zinc-500 uppercase font-mono">Estimasi Selesai (ETC)</span>
            <span class="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-mono font-black border border-emerald-200">LIVE</span>
          </div>
          <div class="mt-2">
            <div class="text-2xl font-black font-mono text-emerald-800">{{ calculatedEtcTimeString }}</div>
            <p class="text-xs text-zinc-500 mt-1 font-medium">
              Berdasarkan speed <strong class="text-zinc-700">600 m/min (Polos)</strong> & <strong class="text-zinc-700">400 m/min (Metal)</strong>.
            </p>
          </div>
        </div>

        <!-- KPI 4: Analisis Kualitas Roll -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between">
            <span class="text-[11px] font-bold text-zinc-500 uppercase font-mono">Analisis Kualitas Hasil</span>
            <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[10px] font-mono font-black border border-zinc-200">QC</span>
          </div>
          <div class="mt-2 grid grid-cols-3 gap-1.5 text-center font-mono">
            <div class="p-1.5 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
              <div class="text-[9.5px] font-bold text-emerald-700">PASS</div>
              <div class="text-sm font-black">{{ totalPassAll }}</div>
            </div>
            <div class="p-1.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
              <div class="text-[9.5px] font-bold text-amber-700">HOLD</div>
              <div class="text-sm font-black">{{ totalHoldAll }}</div>
            </div>
            <div class="p-1.5 rounded-lg bg-red-50 text-red-900 border border-red-200">
              <div class="text-[9.5px] font-bold text-red-700">REJECT</div>
              <div class="text-sm font-black">{{ totalRejectAll }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TIMELINE GANTT: PLANNED VS REALTIME TRACKING (CENTRAL DUAL-SIDE TIMELINE) -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <!-- Header Timeline -->
        <div class="p-4 sm:p-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-900 via-zinc-950 to-zinc-900 text-white flex items-center justify-between flex-wrap gap-3">
          <div>
            <div class="flex items-center gap-2.5">
              <span class="text-xl">⏱️</span>
              <h3 class="text-sm sm:text-base font-black text-white tracking-tight">Timeline Garis Waktu Produksi Slitting (Realtime)</h3>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Pencocokan H+1
              </span>
            </div>
            <p class="text-xs text-zinc-400 mt-1">
              Sisi Kiri: <strong>Planned SPK</strong> • Sisi Kanan: <strong>Proses Aktual Lapangan</strong> • Urutan dari atas ke bawah
            </p>
          </div>

          <!-- Batch Selector & Date Window Badge -->
          <div class="flex items-center gap-2 flex-wrap">
            <div v-if="spkStore.activeDateWindow" class="px-3 py-1.5 rounded-xl bg-zinc-800 text-zinc-300 font-mono text-[11px] border border-zinc-700">
              📅 Jendela Valid: <strong class="text-emerald-400">{{ spkStore.activeDateWindow.label }}</strong>
            </div>
            <select
              v-if="(spkStore.batches || []).length > 1"
              v-model="spkStore.activeTimelineBatchUuid"
              class="px-3 py-1.5 bg-zinc-800 text-white text-xs rounded-xl font-bold font-mono border border-zinc-700 outline-none cursor-pointer"
            >
              <option v-for="b in spkStore.batches" :key="b.uuid" :value="b.uuid">
                {{ b.batchName }}
              </option>
            </select>
          </div>
        </div>

        <!-- Legend Bar -->
        <div class="bg-zinc-50 border-b border-zinc-200 px-4 py-2.5 flex items-center justify-between text-xs flex-wrap gap-2 select-none">
          <div class="flex items-center gap-4 text-[11px] font-bold">
            <span class="flex items-center gap-1.5 text-emerald-800"><span class="w-2.5 h-2.5 rounded-full bg-emerald-600"></span> Selesai Terpotong</span>
            <span class="flex items-center gap-1.5 text-blue-800"><span class="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span> Sedang Dikerjakan</span>
            <span class="flex items-center gap-1.5 text-zinc-600"><span class="w-2.5 h-2.5 rounded-full bg-zinc-300"></span> Antrean Akan Dikerjakan</span>
            <span class="flex items-center gap-1.5 text-amber-800"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Order Sisipan / Tanpa Plan</span>
          </div>
          <div class="text-[11px] font-mono text-zinc-500">
            ⬇️ <strong>Arah Alur Pengerjaan: Dari Atas ke Bawah</strong>
          </div>
        </div>

        <!-- Central Timeline Canvas Container -->
        <div class="p-4 sm:p-6 bg-zinc-100/50 min-h-[350px]">
          <div v-if="timelineRows.length === 0" class="py-16 text-center text-zinc-400 font-sans text-xs">
            Belum ada data rencana kerja SPK. Pindai dokumen jadwal atau buat batch baru di Sheet 3.
          </div>

          <div v-else class="relative max-w-5xl mx-auto">
            <!-- Center Vertical Line -->
            <div class="absolute left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-emerald-500 via-blue-500 to-zinc-300 -translate-x-1/2"></div>

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
                    row.status === 'UPCOMING' ? 'border-zinc-200' : ''
                  ]"
                >
                  <div class="flex items-center justify-between flex-row-reverse gap-2">
                    <span
                      class="px-2 py-0.5 rounded-full text-[10px] font-black font-mono tracking-tight"
                      :class="[
                        row.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : '',
                        row.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-900 border border-blue-300 animate-pulse' : '',
                        row.status === 'UPCOMING' ? 'bg-zinc-100 text-zinc-700 border border-zinc-300' : ''
                      ]"
                    >
                      {{ row.status === 'COMPLETED' ? '✓ SELESAI' : (row.status === 'IN_PROGRESS' ? '⚙️ SEDANG BERJALAN' : '⏱️ ANTREAN') }}
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
                    <span class="font-bold text-purple-900">{{ row.plan.jumlahJumbo }} JR</span>
                  </div>

                  <div class="text-[11px] text-zinc-500 font-mono flex items-center justify-end gap-2 pt-1 border-t border-zinc-100">
                    <span>Target: <strong class="text-zinc-800">{{ formatNumber(row.plan.totalPlannedMeter) }} m</strong></span>
                    <span>•</span>
                    <span>Speed: {{ row.speed }} m/m</span>
                    <span>•</span>
                    <span class="font-bold text-purple-800">Est: {{ row.planDurationMinutes }} Mnt</span>
                  </div>

                  <div class="text-[10px] text-zinc-400 font-mono">
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
                    row.status === 'UPCOMING' ? 'bg-white text-zinc-600 border-zinc-300' : '',
                    row.status === 'UNPLANNED' ? 'bg-amber-500 text-white shadow-amber-200' : ''
                  ]"
                >
                  <span v-if="row.status === 'COMPLETED'">✓</span>
                  <span v-else-if="row.status === 'IN_PROGRESS'">⚙️</span>
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

                  <div class="text-xs font-mono text-zinc-700 flex items-center gap-2 flex-wrap">
                    <strong class="text-emerald-700 font-black">{{ formatNumber(row.actual.totalRealMeter) }} m</strong>
                    <span class="text-zinc-300">•</span>
                    <strong class="text-zinc-900 font-bold">{{ formatNumber(row.actual.totalRealKg) }} kg</strong>
                    <span v-if="row.actual.operator" class="text-zinc-400 text-[10px]">Op: {{ row.actual.operator }}</span>
                  </div>

                  <!-- QC Badges -->
                  <div class="flex items-center gap-1.5 text-[10.5px] font-mono font-bold pt-1 border-t border-zinc-100">
                    <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900">Pass: {{ row.actual.passCount }}</span>
                    <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900">Hold: {{ row.actual.holdCount }}</span>
                    <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-900">Reject: {{ row.actual.rejectCount }}</span>
                    <span v-if="row.actual.latestLot" class="text-zinc-400 text-[9.5px] ml-auto">Lot: {{ row.actual.latestLot }}</span>
                  </div>
                </div>

                <!-- If Pending / Waiting for Machine (Right side blank) -->
                <div
                  v-else
                  class="w-full max-w-md bg-zinc-50/50 border border-dashed border-zinc-200 rounded-2xl p-4 text-left flex items-center justify-center text-zinc-400 text-xs font-mono select-none"
                >
                  <span>⏱️ Menunggu giliran pemotongan mesin...</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SHEET 2: LIST SPK (BERBAGI DATA TERPADU)                          -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeSheet === 'list'" class="space-y-4 animate-fade-in">
      
      <!-- Filter Bar -->
      <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div class="flex items-center gap-2.5 flex-1 max-w-md">
          <input
            v-model="searchSpkQuery"
            placeholder="Cari nomor SPK, lot, atau formula..."
            class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none font-mono"
          />
        </div>
        <div class="text-xs text-zinc-500 font-medium">
          Menampilkan <strong class="text-zinc-900 font-bold">{{ filteredActiveSpkList.length }}</strong> SPK aktif
        </div>
      </div>

      <!-- SPK Summary Table -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs">
            <thead class="bg-zinc-100/80 border-b border-zinc-200 text-zinc-600 font-bold">
              <tr>
                <th class="px-4 py-3 text-left w-12 font-mono">#</th>
                <th class="px-4 py-3 text-left">Nomor SPK</th>
                <th class="px-4 py-3 text-left">Tahun / Periode</th>
                <th class="px-4 py-3 text-left">Formula & Spek</th>
                <th class="px-4 py-3 text-center">Jumbo Roll (JR)</th>
                <th class="px-4 py-3 text-right">Hasil Aktual</th>
                <th class="px-4 py-3 text-center">QC Status</th>
                <th class="px-4 py-3 text-center">Progres</th>
                <th class="px-4 py-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 font-mono">
              <tr v-if="filteredActiveSpkList.length === 0">
                <td colspan="9" class="py-12 text-center text-zinc-400 font-sans text-xs">
                  Tidak ada data SPK aktif yang cocok
                </td>
              </tr>
              <tr
                v-for="(item, idx) in paginatedActiveSpkList"
                :key="item.spkNo"
                class="hover:bg-blue-50/50 transition-colors cursor-pointer"
                @click="openSpkDetailDrawer(item)"
              >
                <td class="px-4 py-3 text-zinc-400 font-bold">{{ (spkCurrentPage - 1) * spkPageSize + idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="font-black text-sm text-zinc-900 flex items-center gap-1.5">
                    <span>{{ item.spkNo }}</span>
                    <span v-if="item.isCrossOrderWarning" class="text-amber-500" title="Cross-order multi SPK">⚠️</span>
                  </div>
                  <div class="text-[10px] text-zinc-400 font-sans">{{ item.plan?.docNo || '3B-PROD' }}</div>
                </td>
                <td class="px-4 py-3 text-zinc-700">
                  <div class="font-bold font-mono">{{ item.year }} • {{ item.monthName }}</div>
                  <div class="text-[10px] text-zinc-400 font-sans">{{ item.supplier }}</div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold text-[11px]">
                    {{ item.formula }} - {{ item.thickness }}μ
                  </span>
                </td>
                <td class="px-4 py-3 text-center font-bold text-zinc-700">
                  {{ item.totalJumbo }} JR
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="font-black text-emerald-700">{{ item.totalRealRolls }} Roll</div>
                  <div class="text-[10px] text-zinc-400 font-sans">{{ formatNumber(item.totalRealKg) }} kg • {{ formatNumber(item.totalRealMeter) }} m</div>
                </td>
                <td class="px-4 py-3 text-center">
                  <div class="flex items-center justify-center gap-1 text-[10px] font-bold">
                    <span class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">{{ item.passCount }}P</span>
                    <span class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">{{ item.holdCount }}H</span>
                    <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-800">{{ item.rejectCount }}R</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-center">
                  <span class="px-2.5 py-1 rounded-full text-[10.5px] font-black bg-zinc-100 text-zinc-800">
                    {{ item.achievementPercent }}%
                  </span>
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

        <!-- PAGINATION & LAZY CONTROLS BAR (RINGAN & CEPAT) -->
        <div class="p-3.5 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between flex-wrap gap-3 text-xs">
          <div class="text-zinc-500 font-medium">
            Menampilkan <strong class="text-zinc-900 font-bold font-mono">{{ ((spkCurrentPage - 1) * spkPageSize) + (filteredActiveSpkList.length ? 1 : 0) }} – {{ Math.min(spkCurrentPage * spkPageSize, filteredActiveSpkList.length) }}</strong> dari <strong class="text-zinc-900 font-bold font-mono">{{ filteredActiveSpkList.length }}</strong> SPK
          </div>

          <div class="flex items-center gap-2">
            <span class="text-zinc-400 font-medium text-[11px]">Baris per halaman:</span>
            <select v-model.number="spkPageSize" class="p-1 border border-zinc-300 rounded-lg text-xs bg-white font-mono">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>

            <div class="flex items-center gap-1 font-mono ml-2">
              <button
                @click="spkCurrentPage = Math.max(1, spkCurrentPage - 1)"
                :disabled="spkCurrentPage <= 1"
                class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                ‹ Sebelumnya
              </button>
              <span class="px-2.5 py-1 text-zinc-600 font-bold">
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
                :key="lot.lot"
                class="hover:bg-blue-50/30 transition-colors"
              >
                <td class="px-4 py-2.5 text-center text-zinc-400 font-bold">
                  {{ (detailPageLotCurrentPage - 1) * detailPageLotPageSize + lIdx + 1 }}
                </td>
                <td class="px-4 py-2.5 font-black text-zinc-900 text-sm">
                  {{ lot.lot }}
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
      <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-black text-zinc-900">Jadwal Rencana Kerja per Batch Harian (JADWAL SLITTING)</h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 font-mono">
              1 Scan = 1 Batch Harian
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Daftar sesi pemindaian SPK harian. Klik baris batch untuk melihat atau menyembunyikan rincian planned SPK.
          </p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Tombol AI Scan Kamera -->
          <button
            @click="triggerCameraScan"
            class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>📷</span>
            <span>Scan SPK Kamera AI (Batch Baru)</span>
          </button>

          <!-- Tombol Upload Dokumen SPK -->
          <label class="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
            <span>📥</span>
            <span>Upload Berkas SPK</span>
            <input type="file" accept="image/*,.pdf" @change="handleFileUploadScan" class="hidden" />
          </label>

          <!-- Input Manual Form -->
          <button
            @click="openManualPlanModal(null)"
            class="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
          >
            + Buat Batch Manual
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
          Gunakan tombol <strong>Scan SPK Kamera AI</strong> atau <strong>Upload Berkas SPK</strong> di atas untuk memindai dokumen fisik JADWAL SLITTING (3B-PROD) dan membuat batch baru.
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
            class="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-50/80 transition-colors select-none flex-wrap gap-3"
          >
            <div class="flex items-center gap-3">
              <span class="text-xs font-mono font-bold text-zinc-400">#{{ bIdx + 1 }}</span>
              <div
                class="w-7 h-7 rounded-lg bg-zinc-100 flex items-center justify-center text-[10px] font-bold text-zinc-600 transition-transform duration-200"
                :class="{ 'rotate-90 text-red-600 bg-red-50': expandedBatchIds.has(batch.uuid) }"
              >
                ▶
              </div>
              <div>
                <div class="flex items-center gap-2 flex-wrap">
                  <h4 class="font-black text-sm text-zinc-900 font-mono tracking-tight">{{ batch.batchName }}</h4>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200 font-mono">
                    📅 {{ batch.tanggal }}
                  </span>
                  <span class="px-2 py-0.5 rounded text-[9.5px] font-black bg-zinc-100 text-zinc-700 uppercase">
                    {{ batch.source || 'AI_SCAN' }}
                  </span>
                </div>
                <p class="text-[11px] text-zinc-500 font-sans mt-0.5">
                  {{ expandedBatchIds.has(batch.uuid) ? 'Tutup rincian' : 'Klik baris ini untuk melihat detail planned SPK' }}
                </p>
              </div>
            </div>

            <!-- Ringkasan Metrik Batch -->
            <div class="flex items-center gap-4 text-xs font-mono">
              <div class="text-right">
                <div class="font-black text-zinc-900">{{ getBatchPlans(batch.uuid).length || batch.totalItems }} Item SPK</div>
                <div class="text-[10px] text-zinc-400 font-sans">Terjadwal</div>
              </div>
              <div class="text-right">
                <div class="font-black text-purple-900">{{ getBatchTotalJumbo(batch.uuid) }} JR</div>
                <div class="text-[10px] text-zinc-400 font-sans">Jumbo Roll</div>
              </div>
              <div class="text-right">
                <div class="font-black text-emerald-800">{{ formatNumber(getBatchTotalMeter(batch.uuid)) }} m</div>
                <div class="text-[10px] text-zinc-400 font-sans">Meter JR</div>
              </div>

              <!-- Tombol Aksi Batch -->
              <div class="flex items-center gap-1.5 pl-3 border-l border-zinc-200 font-sans" @click.stop>
                <button
                  @click="openAddRowToBatch(batch)"
                  class="px-2.5 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 font-bold text-[10.5px] cursor-pointer"
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
              <div class="p-3 bg-zinc-100/80 border-b border-zinc-200 flex items-center justify-between text-xs font-sans">
                <div class="flex items-center gap-2 font-bold text-zinc-700">
                  <span>📋 Rincian Jadwal Slitting:</span>
                  <span class="font-mono text-zinc-900 font-black">{{ batch.batchName }}</span>
                  <span class="text-zinc-400">({{ batch.docNo || '3B-PROD' }})</span>
                </div>
                <div class="text-zinc-500 font-mono text-[11px]">
                  Total: <strong class="text-zinc-900">{{ getBatchPlans(batch.uuid).length }} Baris SPK</strong>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-xs font-mono">
                  <thead class="bg-zinc-900 text-white font-bold text-[11px]">
                    <tr>
                      <th class="px-3 py-2.5 text-center w-8">No</th>
                      <th class="px-3 py-2.5 text-left">SPK</th>
                      <th class="px-3 py-2.5 text-left">TYPE</th>
                      <th class="px-2 py-2.5 text-center">TEBAL</th>
                      <th class="px-3 py-2.5 text-right">LEBAR</th>
                      <th class="px-3 py-2.5 text-right">PANJANG</th>
                      <th class="px-2 py-2.5 text-center bg-zinc-800">UP 1</th>
                      <th class="px-2 py-2.5 text-center bg-zinc-800">UP 2</th>
                      <th class="px-2 py-2.5 text-center bg-zinc-800">UP 3</th>
                      <th class="px-2 py-2.5 text-center bg-zinc-800">UP 4</th>
                      <th class="px-3 py-2.5 text-right">P. CHILD</th>
                      <th class="px-2 py-2.5 text-center">JR</th>
                      <th class="px-2 py-2.5 text-center text-red-400">TRIM</th>
                      <th class="px-3 py-2.5 text-left">KETERANGAN</th>
                      <th class="px-3 py-2.5 text-right">Meter jr</th>
                      <th class="px-3 py-2.5 text-center font-sans">Aksi</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200 text-zinc-800">
                    <tr v-if="getBatchPlans(batch.uuid).length === 0">
                      <td colspan="16" class="py-8 text-center text-zinc-400 font-sans text-xs">
                        Belum ada item SPK pada batch ini. Klik tombol "+ Item" untuk menambahkan.
                      </td>
                    </tr>
                    <tr
                      v-for="(row, rIdx) in getBatchPlans(batch.uuid)"
                      :key="row.id || rIdx"
                      class="hover:bg-amber-50/40 transition-colors"
                    >
                      <td class="px-3 py-2 text-center text-zinc-500 font-bold">{{ rIdx + 1 }}</td>
                      <td class="px-3 py-2 font-black text-zinc-900 text-sm whitespace-nowrap">{{ row.spkNo }}</td>
                      <td class="px-3 py-2 font-black text-red-600 whitespace-nowrap">{{ row.formula }}</td>
                      <td class="px-2 py-2 text-center">{{ row.thickness }}</td>
                      <td class="px-3 py-2 text-right font-bold">{{ formatNumber(row.lebarParent) }}</td>
                      <td class="px-3 py-2 text-right">{{ formatNumber(row.panjangParent) }}</td>
                      <td class="px-2 py-2 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 1) }}</td>
                      <td class="px-2 py-2 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 2) }}</td>
                      <td class="px-2 py-2 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 3) }}</td>
                      <td class="px-2 py-2 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 4) }}</td>
                      <td class="px-3 py-2 text-right">{{ formatNumber(getChildPanjang(row)) }}</td>
                      <td class="px-2 py-2 text-center font-black text-purple-900">{{ row.jumlahJumbo }}</td>
                      <td class="px-2 py-2 text-center font-black text-red-600 bg-red-50/50">{{ row.trimAuto }}</td>
                      <td class="px-3 py-2 text-zinc-500 text-[11px] whitespace-nowrap">{{ row.keterangan || '-' }}</td>
                      <td class="px-3 py-2 text-right font-black text-emerald-800">{{ formatNumber(row.totalPlannedMeter) }}</td>
                      <td class="px-3 py-2 text-center whitespace-nowrap font-sans">
                        <div class="flex items-center justify-center gap-1">
                          <button
                            @click="openEditPlanModal(row)"
                            class="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded font-bold text-[10px] cursor-pointer"
                          >
                            Revisi
                          </button>
                          <button
                            @click="confirmDeletePlan(row.id, row.spkNo)"
                            class="p-1 text-zinc-400 hover:text-red-600 rounded cursor-pointer"
                            title="Hapus baris ini"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                  <!-- Subtotal Batch Footer -->
                  <tfoot class="bg-zinc-100 font-bold border-t-2 border-zinc-300 text-zinc-900">
                    <tr>
                      <td colspan="11" class="px-4 py-2 text-right uppercase text-[10.5px]">Subtotal Batch Ini:</td>
                      <td class="px-2 py-2 text-center font-black text-purple-950 text-sm">{{ getBatchTotalJumbo(batch.uuid) }} JR</td>
                      <td class="px-2 py-2 text-center text-red-600 font-mono">-</td>
                      <td></td>
                      <td class="px-3 py-2 text-right font-black text-emerald-900 text-sm">{{ formatNumber(getBatchTotalMeter(batch.uuid)) }} m</td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
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
          <div class="overflow-x-auto p-4">
            <table class="w-full text-xs font-mono">
              <thead class="bg-zinc-800 text-white font-bold text-[11px]">
                <tr>
                  <th class="px-3 py-2 text-left">SPK</th>
                  <th class="px-3 py-2 text-left">TYPE</th>
                  <th class="px-3 py-2 text-right">LEBAR</th>
                  <th class="px-3 py-2 text-center">JR</th>
                  <th class="px-3 py-2 text-right">Meter jr</th>
                  <th class="px-3 py-2 text-center font-sans">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200">
                <tr v-for="uRow in unassignedPlans" :key="uRow.id">
                  <td class="px-3 py-2 font-bold">{{ uRow.spkNo }}</td>
                  <td class="px-3 py-2 text-red-600">{{ uRow.formula }}</td>
                  <td class="px-3 py-2 text-right">{{ formatNumber(uRow.lebarParent) }}</td>
                  <td class="px-3 py-2 text-center">{{ uRow.jumlahJumbo }}</td>
                  <td class="px-3 py-2 text-right text-emerald-800 font-bold">{{ formatNumber(uRow.totalPlannedMeter) }}</td>
                  <td class="px-3 py-2 text-center font-sans">
                    <button @click="openEditPlanModal(uRow)" class="px-2 py-1 bg-zinc-100 rounded text-[10px] font-bold">Revisi</button>
                    <button @click="confirmDeletePlan(uRow.id, uRow.spkNo)" class="p-1 text-red-600 ml-1">🗑️</button>
                  </td>
                </tr>
              </tbody>
            </table>
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
        <div class="p-5 border-b border-zinc-200 bg-gradient-to-r from-zinc-950 to-zinc-900 text-white flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2.5 py-0.5 rounded-full bg-red-600 text-white font-mono font-bold">DETAIL SPK</span>
              <h2 class="text-lg font-black font-mono tracking-tight">{{ selectedSpkAnalytics.spkNo }}</h2>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">Integrasi Data Terpadu: Management Label & Data Roll</p>
          </div>
          <button @click="showDetailDrawer = false" class="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Drawer Body -->
        <div class="p-5 overflow-y-auto space-y-4 text-xs">
          
          <!-- Data Pokok SPK -->
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <h4 class="font-extrabold text-zinc-900 uppercase text-[11px] border-b border-zinc-200 pb-1.5 flex items-center justify-between">
              <span>📌 Informasi Dasar SPK</span>
              <span class="font-mono text-zinc-500 font-bold">{{ selectedSpkAnalytics.plan?.docNo || '3B-PROD' }}</span>
            </h4>
            <div class="grid grid-cols-2 gap-3 text-zinc-700">
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
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[11px]">📊 Status Kualitas Hasil (QC)</h4>
              <span class="text-xs font-mono font-black text-emerald-700">{{ selectedSpkAnalytics.totalRealRolls }} Total Roll</span>
            </div>
            <div class="grid grid-cols-3 gap-2 text-center font-mono">
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
                v-for="lot in filteredDrawerLots"
                :key="lot.lot"
                class="p-2 bg-white rounded-lg border border-zinc-200 flex items-center justify-between"
              >
                <div>
                  <strong class="text-zinc-900">{{ lot.lot }}</strong>
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
        <div class="p-4 border-t border-zinc-200 bg-zinc-50 flex justify-end">
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
      <div class="bg-white w-full max-w-7xl h-[94vh] rounded-3xl shadow-2xl overflow-hidden border border-zinc-300 flex flex-col justify-between">
        
        <!-- Header Verifikasi -->
        <div class="p-3.5 border-b border-zinc-200 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">📊</span>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm font-black text-white">LEMBAR VERIFIKASI SPREADSHEET EXCEL (1 BATCH HARIAN)</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Mode Interaktif Excel
                </span>
              </div>
              <p class="text-[11px] text-zinc-400 mt-0.5">Navigasi Tombol Arah • Shift+Arah (Pilih Range) • Ctrl+D (Duplikat Bawah) • Ctrl+C/V • F2/Enter (Edit Cell)</p>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="standardizeAllStagingSpks"
              class="px-2.5 py-1.5 rounded-xl bg-purple-900 hover:bg-purple-800 text-purple-200 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              title="Ubah semua SPK ke format standar penuh [URUTAN]/[ROMAWI]/SPK/[TAHUN]"
            >
              <span>⚡</span>
              <span>Standar Penuh SPK</span>
            </button>
            <button
              @click="addVerificationRow"
              class="px-2.5 py-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold transition-colors cursor-pointer"
              title="Tambah baris kosong"
            >
              + Baris
            </button>
            <button
              @click="deleteSelectedVerificationRows"
              class="px-2.5 py-1.5 rounded-xl bg-red-950/60 hover:bg-red-900 text-red-300 text-xs font-bold transition-colors cursor-pointer"
              title="Hapus baris yang diseleksi"
            >
              🗑️ Hapus Baris
            </button>
            <button @click="showVerificationModal = false" class="p-1.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white cursor-pointer ml-1">
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
        <div class="p-3.5 border-t border-zinc-300 bg-zinc-50 flex items-center justify-between flex-wrap gap-3">
          <div class="text-xs text-zinc-600 font-medium">
            Status: <strong class="text-zinc-900">{{ verificationStagingList.length }} baris terverifikasi</strong>
            <span class="mx-2 text-zinc-300">•</span>
            <span class="text-zinc-500 font-mono text-[11px]">Gunakan <strong>Ctrl+D</strong> untuk duplikat ke bawah</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="showVerificationModal = false"
              class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer"
            >
              Batal
            </button>
            <button
              @click="commitVerificationToPlans"
              class="px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              ✓ Simpan {{ verificationStagingList.length }} Item ke Rencana Kerja
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
          <button @click="showManualModal = false" class="p-1 rounded-lg text-zinc-400 hover:text-zinc-800 cursor-pointer">✕</button>
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

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Tebal (μ)</label>
              <input v-model.number="manualForm.thickness" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Lebar JR (mm)</label>
              <input v-model.number="manualForm.lebarParent" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono font-bold" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Panjang JR (m)</label>
              <input v-model.number="manualForm.panjangParent" type="number" class="w-full p-2 border border-zinc-300 rounded-xl font-mono" />
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
          <button @click="showManualModal = false" class="px-4 py-2 font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer">Batal</button>
          <button @click="saveManualPlan" class="px-5 py-2 font-black bg-red-600 hover:bg-red-500 text-white rounded-xl cursor-pointer">
            {{ editingPlanId ? 'Simpan Revisi' : 'Tambahkan' }}
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
import { ref, computed, reactive, onMounted } from 'vue';
import { useSpkStore } from '@/stores/spkStore';
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
  return (spkStore.plans || []).filter(p => p.batchId === batchUuid);
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
onMounted(async () => {
  await Promise.all([
    spkStore.loadAll(),
    configStore.loadAll(),
    labelStore.loadLabels(),
    dataRollStore.loadRolls()
  ]);
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
// ── DUAL-SIDED CENTRAL TIMELINE ENGINE (WITH H+1 WINDOW & UNPLANNED SLOTS) ──

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

  const rows = [];
  const handledActualIndices = new Set();
  let cumulativeMinutes = 0;
  const baseDate = new Date();
  baseDate.setHours(8, 0, 0, 0); // Asumsi shift mulai pukul 08:00

  for (let pIdx = 0; pIdx < plannedList.length; pIdx++) {
    const plan = plannedList[pIdx];
    const planAnalytics = spkStore.getSpkRealtimeAnalytics(plan.spkNo, plan) || {};

    // A. Periksa apakah ada pengerjaan aktual yang TIDAK ADA DI PLAN (Order Sisipan seperti SPK 5)
    for (let aIdx = 0; aIdx < actualRuns.length; aIdx++) {
      if (handledActualIndices.has(aIdx)) continue;
      const act = actualRuns[aIdx];

      if (isMatch(act.spkNo, plan.spkNo)) {
        break; // Cocok dengan plan saat ini, akan dipasangkan di bawah
      }

      // Cek apakah actual ini cocok dengan plan MASA DEPAN
      const matchesFuture = plannedList.slice(pIdx + 1).some(fPlan => isMatch(act.spkNo, fPlan.spkNo));
      if (!matchesFuture) {
        // Ini adalah SPK Sisipan Tanpa Plan! (Sisi kiri KOSONG, Sisi kanan ADA)
        rows.push({
          id: `unplanned_${act.spkNo}_${aIdx}`,
          type: 'UNPLANNED',
          plan: null,
          actual: act,
          status: 'UNPLANNED',
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

    // Hitung estimasi waktu pengerjaan kumulatif
    const speed = planAnalytics.speed || 600;
    const durMinutes = planAnalytics.totalMinutes || 45;
    const startM = cumulativeMinutes;
    const endM = cumulativeMinutes + durMinutes;
    cumulativeMinutes = endM;

    const startClock = new Date(baseDate.getTime() + startM * 60000);
    const endClock = new Date(baseDate.getTime() + endM * 60000);
    const estStartTime = startClock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const estEndTime = endClock.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let status = 'UPCOMING';
    if (matchedActual) {
      const targetRolls = plan.totalPlannedRolls || 1;
      status = matchedActual.totalRealRolls >= targetRolls ? 'COMPLETED' : 'IN_PROGRESS';
    }

    rows.push({
      id: `plan_${plan.id || pIdx}`,
      type: 'PLANNED',
      plan,
      actual: matchedActual,
      status,
      speed,
      planDurationMinutes: durMinutes,
      estStartTime,
      estEndTime,
      achievementPercent: planAnalytics.achievementPercent || 0
    });
  }

  // C. Sisa pengerjaan aktual di akhir yang tidak ada dalam rencana
  for (let aIdx = 0; aIdx < actualRuns.length; aIdx++) {
    if (!handledActualIndices.has(aIdx)) {
      const act = actualRuns[aIdx];
      rows.push({
        id: `unplanned_${act.spkNo}_${aIdx}`,
        type: 'UNPLANNED',
        plan: null,
        actual: act,
        status: 'UNPLANNED',
        warning: 'Order Sisipan / Revisi Lapangan (Tidak Ada dalam Planned SPK)'
      });
      handledActualIndices.add(aIdx);
    }
  }

  return rows;
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

// ── SHEET 2: ACTIVE SPK LIST (SORTED BY YEAR, MONTH, SPK DESC & PAGINATED) ──

const spkCurrentPage = ref(1);
const spkPageSize = ref(10);
const drawerLotSearch = ref('');

const activeSpkList = computed(() => {
  const map = new Map();
  const dataMap = spkStore.spkRealtimeDataMap || new Map();

  // 1. Ambil dari spk plans
  for (const p of (spkStore.plans || [])) {
    const a = planAnalyticsMap.value[p.id || p.spkNo];
    if (a) map.set(p.spkNo, a);
  }

  // 2. Ambil dari dataMap keys yang belum ada di spk plans
  for (const spkKey of dataMap.keys()) {
    if (!map.has(spkKey)) {
      const a = spkStore.getSpkRealtimeAnalytics(spkKey, null);
      if (a) map.set(spkKey, a);
    }
  }

  // 3. Urutkan sesuai Tahun, Bulan, dan Waktu/Urutan SPK dari paling baru ke paling lama
  return Array.from(map.values()).sort((a, b) => {
    if ((b.year || 0) !== (a.year || 0)) {
      return (b.year || 0) - (a.year || 0);
    }
    if ((b.month || 0) !== (a.month || 0)) {
      return (b.month || 0) - (a.month || 0);
    }
    const timeA = a.timestamp || 0;
    const timeB = b.timestamp || 0;
    if (timeB !== timeA) {
      return timeB - timeA;
    }
    return String(b.spkNo || '').localeCompare(String(a.spkNo || ''), undefined, { numeric: true, sensitivity: 'base' });
  });
});

const filteredActiveSpkList = computed(() => {
  const q = (searchSpkQuery.value || '').trim().toLowerCase();
  if (!q) return activeSpkList.value;
  return activeSpkList.value.filter(item => {
    return String(item.spkNo || '').toLowerCase().includes(q) ||
      String(item.formula || '').toLowerCase().includes(q) ||
      String(item.year || '').includes(q) ||
      String(item.monthName || '').toLowerCase().includes(q);
  });
});

const totalSpkPages = computed(() => {
  return Math.ceil(filteredActiveSpkList.value.length / spkPageSize.value) || 1;
});

const paginatedActiveSpkList = computed(() => {
  const start = (spkCurrentPage.value - 1) * spkPageSize.value;
  return filteredActiveSpkList.value.slice(start, start + spkPageSize.value);
});

const filteredDrawerLots = computed(() => {
  const lots = selectedSpkAnalytics.value?.realLots || [];
  const q = (drawerLotSearch.value || '').trim().toLowerCase();
  if (!q) return lots;
  return lots.filter(l => String(l.lot || '').toLowerCase().includes(q) || String(l.operator || '').toLowerCase().includes(q));
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
    String(l.operator || '').toLowerCase().includes(q)
  );
});

const totalDetailPageLotPages = computed(() => {
  return Math.ceil(filteredDetailPageLots.value.length / detailPageLotPageSize.value) || 1;
});

const paginatedDetailPageLots = computed(() => {
  const start = (detailPageLotCurrentPage.value - 1) * detailPageLotPageSize.value;
  return filteredDetailPageLots.value.slice(start, start + detailPageLotPageSize.value);
});

const openSpkDetailDrawer = (item) => {
  selectedDetailSpk.value = item;
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

    aiScanStage.value = 'Menganalisis tabel formulir JADWAL SLITTING (3B-PROD)...';
    aiScanProgress.value = 75;

    const extractedRows = await parseSpkDocumentImage(file, false, configStore.filmConfigs);

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
const verificationBatchStartDate = ref('2026-09-05');
const verificationBatchEndDate = ref('2026-09-07');
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
    const r = selStart.value.r;
    const c = selStart.value.c;
    const col = vColumns[c];
    if (col && !col.readonly && verificationStagingList.value[r]) {
      verificationStagingList.value[r][col.key] = '';
      recalcVerificationRow(verificationStagingList.value[r]);
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
    const upList = [];
    if (row.up1) upList.push({ upNo: 1, lebar: parseFloat(row.up1), panjang: parseFloat(row.panjangChild) || 12000 });
    if (row.up2) upList.push({ upNo: 2, lebar: parseFloat(row.up2), panjang: parseFloat(row.panjangChild) || 12000 });
    if (row.up3) upList.push({ upNo: 3, lebar: parseFloat(row.up3), panjang: parseFloat(row.panjangChild) || 12000 });
    if (row.up4) upList.push({ upNo: 4, lebar: parseFloat(row.up4), panjang: parseFloat(row.panjangChild) || 12000 });

    return {
      spkNo: row.spkNo,
      docNo: '3B-PROD',
      formula: row.formula,
      thickness: row.thickness,
      lebarParent: row.lebarParent,
      panjangParent: row.panjangParent,
      jumlahJumbo: row.jumlahJumbo,
      totalPlannedMeter: row.totalPlannedMeter,
      upList,
      keterangan: row.keterangan,
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

const openEditPlanModal = (row) => {
  editingPlanId.value = row.id;
  const ups = parseCharting(row.chartingJson);
  Object.assign(manualForm, {
    spkNo: row.spkNo,
    formula: row.formula,
    thickness: row.thickness,
    lebarParent: row.lebarParent,
    panjangParent: row.panjangParent,
    up1: ups.find(u => u.upNo === 1)?.lebar || null,
    up2: ups.find(u => u.upNo === 2)?.lebar || null,
    up3: ups.find(u => u.upNo === 3)?.lebar || null,
    up4: ups.find(u => u.upNo === 4)?.lebar || null,
    jumlahJumbo: row.jumlahJumbo,
    keterangan: row.keterangan || '',
    revisionReason: 'Revisi manual dokumen SPK'
  });
  showManualModal.value = true;
};

const saveManualPlan = async () => {
  if (!manualForm.spkNo.trim()) return alert('Nomor SPK wajib diisi!');

  const upList = [];
  if (manualForm.up1) upList.push({ upNo: 1, lebar: parseFloat(manualForm.up1), panjang: 12000 });
  if (manualForm.up2) upList.push({ upNo: 2, lebar: parseFloat(manualForm.up2), panjang: 12000 });
  if (manualForm.up3) upList.push({ upNo: 3, lebar: parseFloat(manualForm.up3), panjang: 12000 });
  if (manualForm.up4) upList.push({ upNo: 4, lebar: parseFloat(manualForm.up4), panjang: 12000 });

  const payload = {
    spkNo: manualForm.spkNo.trim().toUpperCase(),
    formula: manualForm.formula.trim().toUpperCase(),
    thickness: parseFloat(manualForm.thickness) || 25,
    lebarParent: parseFloat(manualForm.lebarParent) || 0,
    panjangParent: parseFloat(manualForm.panjangParent) || 0,
    jumlahJumbo: parseInt(manualForm.jumlahJumbo, 10) || 1,
    upList,
    keterangan: manualForm.keterangan.trim(),
    totalPlannedMeter: (parseInt(manualForm.jumlahJumbo, 10) || 1) * 12000
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
};

const confirmDeletePlan = async (id, spkNo) => {
  if (confirm(`Hapus rencana SPK ${spkNo}?`)) {
    await spkStore.deletePlan(id);
  }
};
</script>
