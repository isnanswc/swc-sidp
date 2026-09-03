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

      <!-- TIMELINE GANTT: PLANNED VS REALTIME TRACKING -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-zinc-100 flex items-center justify-between flex-wrap gap-2">
          <div>
            <h3 class="text-sm font-black text-zinc-900">Timeline Antrian Potong Slitting (Planned vs Realtime)</h3>
            <p class="text-xs text-zinc-500 font-medium">Visualisasi perbandingan volume rencana potong terhadap realisasi fisik data roll</p>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-xs bg-zinc-200 inline-block"></span>
              <span class="text-zinc-600 font-medium">Planned Volume</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-xs bg-emerald-600 inline-block"></span>
              <span class="text-zinc-600 font-medium">Aktual Selesai</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span>
              <span class="text-zinc-600 font-medium">Smart Match / Warning</span>
            </div>
          </div>
        </div>

        <div class="p-4 space-y-3.5">
          <div
            v-for="(plan, idx) in spkStore.plans"
            :key="plan.id || idx"
            class="p-3.5 rounded-2xl border border-zinc-200/80 hover:border-zinc-300 transition-all bg-zinc-50/40 space-y-2.5"
          >
            <div class="flex items-center justify-between flex-wrap gap-2 text-xs">
              <div class="flex items-center gap-2.5">
                <span class="w-6 h-6 rounded-full bg-zinc-900 text-white font-mono font-black text-[11px] flex items-center justify-center">
                  {{ idx + 1 }}
                </span>
                <span class="font-black text-sm text-zinc-900 font-mono tracking-tight">{{ plan.spkNo }}</span>
                <span class="px-2 py-0.5 rounded font-black text-[10px] font-mono bg-zinc-200 text-zinc-800">
                  {{ plan.formula }} ({{ plan.thickness }}μ)
                </span>
                <span class="text-zinc-500 font-mono text-[11px]">
                  Lebar: {{ plan.lebarParent }} mm • {{ plan.jumlahJumbo }} JR
                </span>
                
                <!-- Sign Warning Badge if Cross Order -->
                <span
                  v-if="getPlanAnalytics(plan).isCrossOrderWarning"
                  class="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10.5px] flex items-center gap-1"
                  :title="getPlanAnalytics(plan).warningMessage"
                >
                  <span>⚠️</span>
                  <span>Cross-Order Warning</span>
                </span>
              </div>

              <div class="flex items-center gap-3 font-mono text-xs">
                <span class="text-zinc-500">
                  Speed: <strong class="text-zinc-800">{{ getPlanAnalytics(plan).speed }} m/min</strong>
                </span>
                <span class="text-purple-800 font-bold">
                  Est: {{ formatMinutes(getPlanAnalytics(plan).totalMinutes) }}
                </span>
                <span class="font-black text-sm text-emerald-700">
                  {{ getPlanAnalytics(plan).totalRealRolls }} / {{ plan.totalPlannedRolls }} Roll ({{ getPlanAnalytics(plan).achievementPercent }}%)
                </span>
              </div>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-zinc-200 rounded-full h-3.5 overflow-hidden flex shadow-inner">
              <div
                class="bg-emerald-600 h-3.5 transition-all duration-500 text-[9px] text-white font-bold font-mono flex items-center justify-center"
                :style="{ width: `${Math.min(100, getPlanAnalytics(plan).achievementPercent)}%` }"
              >
                <span v-if="getPlanAnalytics(plan).achievementPercent > 15">{{ getPlanAnalytics(plan).achievementPercent }}%</span>
              </div>
            </div>

            <!-- Smart Charting UP Details & Trim Info -->
            <div class="flex items-center justify-between text-[11px] text-zinc-600 pt-1 border-t border-zinc-200/60 font-mono">
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-zinc-400 font-sans">Charting UP:</span>
                <span v-for="up in parseCharting(plan.chartingJson)" :key="up.upNo" class="px-1.5 py-0.2 rounded bg-zinc-200 font-bold text-zinc-800">
                  UP{{ up.upNo }}: {{ up.lebar }} mm ({{ up.panjang }} m)
                </span>
                <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-800 font-black border border-red-200">
                  Trim Auto: {{ plan.trimAuto }} mm
                </span>
              </div>
              <div v-if="plan.keterangan" class="text-zinc-500 italic">
                Ket: {{ plan.keterangan }}
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
                <th class="px-4 py-3 text-left">Dokumen / Tanggal</th>
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
                v-for="(item, idx) in filteredActiveSpkList"
                :key="item.spkNo"
                class="hover:bg-blue-50/40 transition-colors cursor-pointer"
                @click="openSpkDetailDrawer(item)"
              >
                <td class="px-4 py-3 text-zinc-400 font-bold">{{ idx + 1 }}</td>
                <td class="px-4 py-3">
                  <div class="font-black text-sm text-zinc-900 flex items-center gap-1.5">
                    <span>{{ item.spkNo }}</span>
                    <span v-if="item.isCrossOrderWarning" class="text-amber-500" title="Cross-order multi SPK">⚠️</span>
                  </div>
                  <div class="text-[10px] text-zinc-400 font-sans">{{ item.plan?.docNo || '3B-PROD' }}</div>
                </td>
                <td class="px-4 py-3 text-zinc-600">
                  <div>{{ item.plan?.tanggal || '3-Sep-26' }}</div>
                  <div class="text-[10px] text-zinc-400">Tahun: 2026 • Bulan: Sep</div>
                </td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold text-[11px]">
                    {{ item.plan?.formula || 'M07' }} - {{ item.plan?.thickness || 25 }}μ
                  </span>
                </td>
                <td class="px-4 py-3 text-center font-bold text-zinc-700">
                  {{ item.plan?.jumlahJumbo || 1 }} JR
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
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- SHEET 3: PLANNED SPK SLITTING & AI SCAN                           -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeSheet === 'planned'" class="space-y-4 animate-fade-in">
      
      <!-- Action Toolbar -->
      <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 class="text-sm font-black text-zinc-900">Jadwal Rencana Kerja (JADWAL SLITTING 3B-PROD)</h3>
          <p class="text-xs text-zinc-500 font-medium">Input mandiri atau scan dokumen fisik SPK menggunakan AI Kamera / Unggah Berkas</p>
        </div>

        <div class="flex items-center gap-2">
          <!-- Tombol AI Scan Kamera -->
          <button
            @click="triggerCameraScan"
            class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-black flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
          >
            <span>📷</span>
            <span>Scan SPK Kamera AI</span>
          </button>

          <!-- Tombol Upload Dokumen SPK -->
          <label class="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors cursor-pointer">
            <span>📥</span>
            <span>Upload Berkas SPK</span>
            <input type="file" accept="image/*,.pdf" @change="handleFileUploadScan" class="hidden" />
          </label>

          <!-- Input Manual Form -->
          <button
            @click="openManualPlanModal"
            class="px-3.5 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-colors cursor-pointer"
          >
            + Tambah Manual
          </button>
        </div>
      </div>

      <!-- TABLE PLANNED SPK (FORMAT ASLI 3B-PROD) -->
      <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-xs font-mono">
            <thead class="bg-zinc-900 text-white font-bold text-[11px]">
              <tr>
                <th class="px-3 py-3 text-center w-10">No</th>
                <th class="px-3 py-3 text-left">SPK</th>
                <th class="px-3 py-3 text-left">TYPE</th>
                <th class="px-3 py-3 text-center">TEBAL</th>
                <th class="px-3 py-3 text-right">LEBAR</th>
                <th class="px-3 py-3 text-right">PANJANG</th>
                <th class="px-2 py-3 text-center bg-zinc-800">UP 1</th>
                <th class="px-2 py-3 text-center bg-zinc-800">UP 2</th>
                <th class="px-2 py-3 text-center bg-zinc-800">UP 3</th>
                <th class="px-2 py-3 text-center bg-zinc-800">UP 4</th>
                <th class="px-3 py-3 text-right">P. CHILD</th>
                <th class="px-2 py-3 text-center">JR</th>
                <th class="px-2 py-3 text-center text-red-400">TRIM</th>
                <th class="px-3 py-3 text-left">KETERANGAN</th>
                <th class="px-3 py-3 text-right">Meter jr</th>
                <th class="px-3 py-3 text-center font-sans">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200 text-zinc-800">
              <tr v-if="spkStore.plans.length === 0">
                <td colspan="16" class="py-12 text-center text-zinc-400 font-sans text-xs">
                  Belum ada rencana SPK Slitting
                </td>
              </tr>
              <tr
                v-for="(row, idx) in spkStore.plans"
                :key="row.id || idx"
                class="hover:bg-amber-50/30 transition-colors"
              >
                <td class="px-3 py-2.5 text-center text-zinc-500 font-bold">{{ idx + 1 }}</td>
                <td class="px-3 py-2.5 font-black text-zinc-900 text-sm whitespace-nowrap">
                  {{ row.spkNo }}
                </td>
                <td class="px-3 py-2.5 font-black text-red-600 whitespace-nowrap">
                  {{ row.formula }}
                </td>
                <td class="px-3 py-2.5 text-center">{{ row.thickness }}</td>
                <td class="px-3 py-2.5 text-right font-bold">{{ formatNumber(row.lebarParent) }}</td>
                <td class="px-3 py-2.5 text-right">{{ formatNumber(row.panjangParent) }}</td>
                <td class="px-2 py-2.5 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 1) }}</td>
                <td class="px-2 py-2.5 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 2) }}</td>
                <td class="px-2 py-2.5 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 3) }}</td>
                <td class="px-2 py-2.5 text-center bg-zinc-50 font-bold text-blue-900">{{ getUpCol(row, 4) }}</td>
                <td class="px-3 py-2.5 text-right">{{ formatNumber(getChildPanjang(row)) }}</td>
                <td class="px-2 py-2.5 text-center font-black text-purple-900">{{ row.jumlahJumbo }}</td>
                <td class="px-2 py-2.5 text-center font-black text-red-600 bg-red-50/50">{{ row.trimAuto }}</td>
                <td class="px-3 py-2.5 text-zinc-500 text-[11px] whitespace-nowrap">{{ row.keterangan || '-' }}</td>
                <td class="px-3 py-2.5 text-right font-black text-emerald-800">{{ formatNumber(row.totalPlannedMeter) }}</td>
                <td class="px-3 py-2.5 text-center whitespace-nowrap font-sans">
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
                      title="Hapus"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
            <!-- Footer Akumulasi Asli Sesuai Dokumen -->
            <tfoot class="bg-zinc-100 font-bold border-t-2 border-zinc-300 text-zinc-900">
              <tr>
                <td colspan="11" class="px-4 py-2.5 text-right uppercase text-[11px]">Total Akumulasi:</td>
                <td class="px-2 py-2.5 text-center font-black text-purple-950 text-sm">{{ totalJumboAll }} JR</td>
                <td class="px-2 py-2.5 text-center text-red-600 font-mono">-</td>
                <td></td>
                <td class="px-3 py-2.5 text-right font-black text-emerald-900 text-sm">{{ formatNumber(totalPlannedMeterAll) }} m</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- DRAWER / MODAL DETAIL SPK (BERBAGI DATA DENGAN LABEL / DATA ROLL)  -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="showDetailDrawer && selectedSpkAnalytics" class="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs animate-fade-in">
      <div class="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        
        <!-- Header Drawer -->
        <div class="p-5 border-b border-zinc-200 bg-zinc-950 text-white flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs px-2 py-0.5 rounded bg-red-600 text-white font-mono font-bold">SPK DETAIL</span>
              <h2 class="text-lg font-black font-mono tracking-tight">{{ selectedSpkAnalytics.spkNo }}</h2>
            </div>
            <p class="text-xs text-zinc-400 mt-0.5">Integrasi Data Terpadu: Management Label & Data Roll</p>
          </div>
          <button @click="showDetailDrawer = false" class="p-2 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Drawer Body -->
        <div class="p-5 overflow-y-auto space-y-5 text-xs">
          
          <!-- Data Pokok SPK -->
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h4 class="font-extrabold text-zinc-900 uppercase text-[11px] border-b border-zinc-200 pb-1.5">📌 Informasi Dasar SPK</h4>
            <div class="grid grid-cols-2 gap-3 text-zinc-700">
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Tahun / Bulan</span>
                <span class="font-black text-zinc-900 text-sm font-mono">2026 / September</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Supplier Asal</span>
                <span class="font-black text-blue-900 text-sm">INHOUSE (PT. SWC)</span>
              </div>
              <div>
                <span class="text-[10px] text-zinc-400 block font-semibold">Total Berat Bersih</span>
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
            <h4 class="font-extrabold text-zinc-900 uppercase text-[11px] border-b border-zinc-200 pb-1.5">📊 Status Kualitas & Pencapaian</h4>
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

          <!-- RINGKASAN HASIL ROLL TURUNAN PER UKURAN LEBAR (SESUAI REQUEST USER) -->
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2.5">
            <div class="flex items-center justify-between border-b border-zinc-200 pb-1.5">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[11px]">📐 Ringkasan Hasil per Ukuran Roll Turunan</h4>
              <span class="text-[10px] font-mono text-zinc-500 font-bold">{{ selectedSpkAnalytics.widthSummaries.length }} Ukuran Teridentifikasi</span>
            </div>
            
            <div class="space-y-2 font-mono">
              <div
                v-for="w in selectedSpkAnalytics.widthSummaries"
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
              <div v-if="selectedSpkAnalytics.widthSummaries.length === 0" class="text-center py-4 text-zinc-400 font-sans">
                Belum ada roll turunan yang terdata
              </div>
            </div>
          </div>

          <!-- Daftar Nomor Lot Terkait -->
          <div class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
            <h4 class="font-extrabold text-zinc-900 uppercase text-[11px] border-b border-zinc-200 pb-1.5">🏷️ Daftar Nomor Lot Terdaftar ({{ selectedSpkAnalytics.realLots.length }})</h4>
            <div class="max-h-48 overflow-y-auto space-y-1 font-mono text-[11px]">
              <div
                v-for="lot in selectedSpkAnalytics.realLots"
                :key="lot.lot"
                class="p-2 bg-white rounded-lg border border-zinc-200 flex items-center justify-between"
              >
                <div>
                  <strong class="text-zinc-900">{{ lot.lot }}</strong>
                  <span class="text-zinc-400 text-[10px] ml-2">({{ lot.width }} mm × {{ lot.length }} m)</span>
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
    <!-- MODAL LEMBAR VERIFIKASI MANDIRI (ALA DE REPORT)                   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="showVerificationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden border border-zinc-300 max-h-[90vh] flex flex-col justify-between">
        
        <!-- Header Verifikasi -->
        <div class="p-4 border-b border-zinc-200 bg-gradient-to-r from-zinc-950 to-zinc-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-xl">🔍</span>
            <div>
              <h3 class="text-sm font-black text-white">LEMBAR VERIFIKASI HASIL SCAN SPK SLITTING (MANDIRI)</h3>
              <p class="text-xs text-zinc-400 mt-0.5">Periksa dan koreksi data sebelum disimpan secara permanen ke Rencana Kerja</p>
            </div>
          </div>
          <button @click="showVerificationModal = false" class="p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>

        <!-- Spreadsheet Verification Table (Editable Cells) -->
        <div class="p-4 overflow-y-auto flex-1 font-mono text-xs">
          <table class="w-full border-collapse border border-zinc-300">
            <thead class="bg-zinc-800 text-white text-[11px] font-bold">
              <tr>
                <th class="border border-zinc-600 p-2 text-center w-8">#</th>
                <th class="border border-zinc-600 p-2 text-left">Nomor SPK</th>
                <th class="border border-zinc-600 p-2 text-left">Formula</th>
                <th class="border border-zinc-600 p-2 text-center">Tebal</th>
                <th class="border border-zinc-600 p-2 text-right">Lebar JR</th>
                <th class="border border-zinc-600 p-2 text-right">P. JR</th>
                <th class="border border-zinc-600 p-2 text-center bg-zinc-700">UP 1</th>
                <th class="border border-zinc-600 p-2 text-center bg-zinc-700">UP 2</th>
                <th class="border border-zinc-600 p-2 text-center bg-zinc-700">UP 3</th>
                <th class="border border-zinc-600 p-2 text-center bg-zinc-700">UP 4</th>
                <th class="border border-zinc-600 p-2 text-center">Jml JR</th>
                <th class="border border-zinc-600 p-2 text-center text-red-400">Trim</th>
                <th class="border border-zinc-600 p-2 text-left">Ket</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(vRow, vIdx) in verificationStagingList" :key="vIdx" class="hover:bg-amber-50/50">
                <td class="border border-zinc-300 p-1.5 text-center text-zinc-500 font-bold">{{ vIdx + 1 }}</td>
                <td class="border border-zinc-300 p-1">
                  <input v-model="vRow.spkNo" class="w-full p-1 border border-zinc-300 rounded font-bold uppercase" />
                </td>
                <td class="border border-zinc-300 p-1">
                  <input v-model="vRow.formula" class="w-20 p-1 border border-zinc-300 rounded font-bold uppercase text-red-600" />
                </td>
                <td class="border border-zinc-300 p-1">
                  <input v-model.number="vRow.thickness" type="number" class="w-14 p-1 border border-zinc-300 rounded text-center" />
                </td>
                <td class="border border-zinc-300 p-1">
                  <input v-model.number="vRow.lebarParent" type="number" class="w-20 p-1 border border-zinc-300 rounded text-right font-bold" />
                </td>
                <td class="border border-zinc-300 p-1">
                  <input v-model.number="vRow.panjangParent" type="number" class="w-20 p-1 border border-zinc-300 rounded text-right" />
                </td>
                <td class="border border-zinc-300 p-1 bg-zinc-50">
                  <input v-model.number="vRow.up1" type="number" class="w-16 p-1 border border-zinc-300 rounded text-center font-bold text-blue-900" />
                </td>
                <td class="border border-zinc-300 p-1 bg-zinc-50">
                  <input v-model.number="vRow.up2" type="number" class="w-16 p-1 border border-zinc-300 rounded text-center font-bold text-blue-900" />
                </td>
                <td class="border border-zinc-300 p-1 bg-zinc-50">
                  <input v-model.number="vRow.up3" type="number" class="w-16 p-1 border border-zinc-300 rounded text-center font-bold text-blue-900" />
                </td>
                <td class="border border-zinc-300 p-1 bg-zinc-50">
                  <input v-model.number="vRow.up4" type="number" class="w-16 p-1 border border-zinc-300 rounded text-center font-bold text-blue-900" />
                </td>
                <td class="border border-zinc-300 p-1">
                  <input v-model.number="vRow.jumlahJumbo" type="number" class="w-12 p-1 border border-zinc-300 rounded text-center font-black text-purple-900" />
                </td>
                <td class="border border-zinc-300 p-1.5 text-center font-black text-red-600 bg-red-50">
                  {{ calculateRowTrim(vRow) }}
                </td>
                <td class="border border-zinc-300 p-1">
                  <input v-model="vRow.keterangan" class="w-full p-1 border border-zinc-300 rounded" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer Verifikasi -->
        <div class="p-4 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <div class="text-xs text-zinc-500 font-medium">
            Total Teridentifikasi: <strong class="text-zinc-900">{{ verificationStagingList.length }} Item SPK</strong>
          </div>
          <div class="flex items-center gap-2">
            <button @click="showVerificationModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer">
              Batal
            </button>
            <button @click="commitVerificationToPlans" class="px-5 py-2 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-xs transition-colors cursor-pointer">
              ✓ Simpan ke Rencana Kerja
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

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useSpkStore } from '@/stores/spkStore';
import { useConfigStore } from '@/stores/configStore';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { parseSpkDocumentImage } from '@/services/spkAiService';

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

// ── SHEET 2: ACTIVE SPK LIST (FAST O(1) LOOKUP) ──

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

  return Array.from(map.values());
});

const filteredActiveSpkList = computed(() => {
  const q = (searchSpkQuery.value || '').trim().toLowerCase();
  if (!q) return activeSpkList.value;
  return activeSpkList.value.filter(item => {
    return String(item.spkNo).toLowerCase().includes(q) ||
      (item.plan && String(item.plan.formula).toLowerCase().includes(q));
  });
});

const openSpkDetailDrawer = (item) => {
  selectedSpkAnalytics.value = item;
  showDetailDrawer.value = true;
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

const processImageScan = async (file) => {
  try {
    const extractedRows = await parseSpkDocumentImage(file);
    if (extractedRows && extractedRows.length > 0) {
      verificationStagingList.value = extractedRows;
      showVerificationModal.value = true;
    } else {
      alert('AI tidak menemukan data tabel jadwal potong pada dokumen ini.');
    }
  } catch (err) {
    console.error('Scan failed:', err);
    alert('Gagal memproses dokumen SPK: ' + err.message);
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

const commitVerificationToPlans = async () => {
  for (const row of verificationStagingList.value) {
    const upList = [];
    if (row.up1) upList.push({ upNo: 1, lebar: parseFloat(row.up1), panjang: parseFloat(row.panjangChild) || 12000 });
    if (row.up2) upList.push({ upNo: 2, lebar: parseFloat(row.up2), panjang: parseFloat(row.panjangChild) || 12000 });
    if (row.up3) upList.push({ upNo: 3, lebar: parseFloat(row.up3), panjang: parseFloat(row.panjangChild) || 12000 });
    if (row.up4) upList.push({ upNo: 4, lebar: parseFloat(row.up4), panjang: parseFloat(row.panjangChild) || 12000 });

    await spkStore.addPlan({
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
      source: 'AI_SCAN'
    });
  }
  showVerificationModal.value = false;
  activeSheet.value = 'planned';
  alert(`✓ Berhasil menambahkan ${verificationStagingList.value.length} item SPK ke Rencana Kerja!`);
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
    await spkStore.addPlan(payload);
  }

  showManualModal.value = false;
};

const confirmDeletePlan = async (id, spkNo) => {
  if (confirm(`Hapus rencana SPK ${spkNo}?`)) {
    await spkStore.deletePlan(id);
  }
};
</script>
