<template>
  <div v-if="scheduleStore.showShiftHandoverModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-zinc-200 flex flex-col max-h-[94vh]">
      
      <!-- Top Step Indicator Header -->
      <div class="px-5 py-2.5 bg-zinc-900 text-white flex items-center justify-between border-b border-zinc-800 select-none">
        <div class="flex items-center gap-2 sm:gap-3 text-xs font-bold">
          <!-- Step 1 Tab Indicator -->
          <button 
            @click="currentStep = 1"
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer"
            :class="currentStep === 1 ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'"
          >
            <span class="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center font-mono">1</span>
            <span>Laporan Shift Sebelumnya</span>
          </button>

          <span class="text-zinc-600 font-mono">➔</span>

          <!-- Step 2 Tab Indicator -->
          <button 
            @click="currentStep = 2"
            class="flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer"
            :class="currentStep === 2 ? 'bg-emerald-600 text-white shadow-xs font-black' : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'"
          >
            <span class="w-4 h-4 rounded-full bg-white/20 text-center text-[10px] flex items-center justify-center font-mono">2</span>
            <span>Shift Yang Akan Bekerja</span>
          </button>
        </div>

        <button 
          @click="scheduleStore.showShiftHandoverModal = false" 
          class="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Tutup Modal"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18" stroke-width="2" stroke-linecap="round"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Banner Dynamic Color per Active Step -->
      <div 
        class="px-6 py-3.5 border-b flex items-center justify-between text-white transition-colors shadow-xs"
        :style="{ backgroundColor: currentStep === 1 ? (previousShift?.definition?.color || '#4f46e5') : (upcomingShift?.definition?.color || '#059669') }"
      >
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner">
            {{ currentStep === 1 ? '📋' : '🚀' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25">
                {{ currentStep === 1 ? 'HASIL KERJA SHIFT SEBELUMNYA' : 'PENUGASAN SHIFT BERIKUTNYA' }}
              </span>
              <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white text-zinc-900 shadow-2xs">
                GRUP {{ currentStep === 1 ? (previousShift?.group || '-') : (upcomingShift?.group || '-') }}
              </span>
            </div>
            <h3 class="font-black text-lg text-white leading-tight mt-0.5">
              {{ currentStep === 1 ? (previousShift?.definition?.name || 'Shift Sebelumnya') : (upcomingShift?.definition?.name || 'Shift Berikutnya') }}
              <span class="text-sm font-semibold opacity-90">({{ currentStep === 1 ? previousShift?.definition?.startTime : upcomingShift?.definition?.startTime }} - {{ currentStep === 1 ? previousShift?.definition?.endTime : upcomingShift?.definition?.endTime }})</span>
            </h3>
            <div class="text-[11px] text-white/80 font-mono mt-0.5 flex items-center gap-2">
              <span>📅 Tanggal Kerja: <strong>{{ currentStep === 1 ? (previousShift?.date || '-') : (upcomingShift?.date || '-') }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Body (Step 1 vs Step 2) -->
      <div class="p-4 sm:p-5 space-y-4 overflow-y-auto bg-zinc-50/50 flex-1">
        
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- STEP 1: PROGRESS DARI SHIFT SEBELUMNYA (PER MESIN TABS)       -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
          
          <!-- Machine Sheets / Tabs Bar -->
          <div class="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200">
            <button
              v-for="tab in machineTabs"
              :key="tab.id"
              @click="switchMachineTab(tab.id)"
              class="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer transition-all shrink-0"
              :class="activeMachineTab === tab.id 
                ? 'bg-zinc-900 text-white shadow-sm ring-2 ring-zinc-900/20' 
                : 'bg-white text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 border border-zinc-200'"
            >
              <span>{{ tab.icon }}</span>
              <span>MESIN {{ tab.name }}</span>
              <span 
                class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold"
                :class="activeMachineTab === tab.id ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'"
              >
                {{ machineSummaries[tab.id]?.totalChild || 0 }} FG
              </span>
            </button>
          </div>

          <!-- Info Banner for Active Machine -->
          <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
            <span class="text-blue-600 text-lg shrink-0">ℹ️</span>
            <div class="text-xs text-blue-950 leading-relaxed">
              <p class="font-bold">Laporan Serah Terima Mesin {{ activeMachineTab }}</p>
              <p class="text-blue-800 text-[11px] mt-0.5">
                Rekapitulasi pengerjaan roll oleh <strong>Shift {{ previousShift?.definition?.shortName || '-' }} (Grup {{ previousShift?.group || '-' }})</strong> pada mesin <strong>{{ activeMachineTab }}</strong>. Periksa rasio kualitas, rincian SPK, serta catatan reject/hold sebelum melanjutkan.
              </p>
            </div>
          </div>

          <!-- 1. Ringkasan Parent, Child, Berat, dan Panjang -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Parent (Jumbo)</span>
                <span>📦</span>
              </div>
              <div class="text-xl font-black text-indigo-600 font-mono mt-1">
                {{ currentMachineSummary.totalParent }} <span class="text-xs text-zinc-400 font-sans font-bold">Jumbo</span>
              </div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Lot induk diproses</div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Child (FG)</span>
                <span>🎯</span>
              </div>
              <div class="text-xl font-black text-zinc-900 font-mono mt-1">
                {{ currentMachineSummary.totalChild }} <span class="text-xs text-zinc-400 font-sans font-bold">Roll</span>
              </div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Roll turunan jadi</div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Berat (Netto)</span>
                <span>⚖️</span>
              </div>
              <div class="text-xl font-black text-emerald-600 font-mono mt-1">
                {{ formatNumber(currentMachineSummary.totalNetto) }} <span class="text-xs text-zinc-400 font-sans font-bold">kg</span>
              </div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Berat netto selesai</div>
            </div>

            <div class="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                <span>Total Panjang</span>
                <span>📏</span>
              </div>
              <div class="text-xl font-black text-blue-600 font-mono mt-1">
                {{ formatNumber(currentMachineSummary.totalMeter) }} <span class="text-xs text-zinc-400 font-sans font-bold">M</span>
              </div>
              <div class="text-[10px] text-zinc-400 mt-0.5">Panjang meter linear</div>
            </div>
          </div>

          <!-- 2. Rasio Kualitas: PASS, HOLD, REJECT (Grafik Angka & Persen) -->
          <div class="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📊</span> Rasio Kualitas Mesin {{ activeMachineTab }}
              </span>
              <span class="text-[11px] font-mono font-bold text-zinc-500">
                Total Output: {{ currentMachineSummary.totalChild }} Roll
              </span>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex shadow-inner">
              <div 
                class="bg-emerald-500 transition-all duration-500" 
                :style="{ width: `${currentMachineSummary.passPercent}%` }"
                :title="`PASS: ${currentMachineSummary.passCount} roll (${currentMachineSummary.passPercent}%)`"
              ></div>
              <div 
                class="bg-amber-500 transition-all duration-500" 
                :style="{ width: `${currentMachineSummary.holdPercent}%` }"
                :title="`HOLD: ${currentMachineSummary.holdCount} roll (${currentMachineSummary.holdPercent}%)`"
              ></div>
              <div 
                class="bg-rose-600 transition-all duration-500" 
                :style="{ width: `${currentMachineSummary.rejectPercent}%` }"
                :title="`REJECT: ${currentMachineSummary.rejectCount} roll (${currentMachineSummary.rejectPercent}%)`"
              ></div>
            </div>

            <!-- Quality Cards Breakdown (Grafik Angka & Persen) -->
            <div class="grid grid-cols-3 gap-3 text-center text-xs">
              <div class="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div class="font-black text-emerald-800 flex items-center justify-center gap-1">
                  <span>✓</span> PASS
                </div>
                <div class="text-lg font-black text-emerald-700 font-mono mt-0.5">
                  {{ currentMachineSummary.passPercent }}%
                </div>
                <div class="text-[11px] text-emerald-600 font-bold">
                  {{ currentMachineSummary.passCount }} Roll
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200">
                <div class="font-black text-amber-800 flex items-center justify-center gap-1">
                  <span>⚠️</span> HOLD
                </div>
                <div class="text-lg font-black text-amber-700 font-mono mt-0.5">
                  {{ currentMachineSummary.holdPercent }}%
                </div>
                <div class="text-[11px] text-amber-600 font-bold">
                  {{ currentMachineSummary.holdCount }} Roll
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200">
                <div class="font-black text-rose-800 flex items-center justify-center gap-1">
                  <span>✕</span> REJECT
                </div>
                <div class="text-lg font-black text-rose-700 font-mono mt-0.5">
                  {{ currentMachineSummary.rejectPercent }}%
                </div>
                <div class="text-[11px] text-rose-600 font-bold">
                  {{ currentMachineSummary.rejectCount }} Roll
                </div>
              </div>
            </div>
          </div>

          <!-- 3. List Data SPK Yang Dikerjakan di Mesin Ini -->
          <div class="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between text-xs border-b border-zinc-100 pb-2">
              <span class="font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>📑</span> Daftar SPK Dikerjakan di Mesin {{ activeMachineTab }}
              </span>
              <span class="text-[11px] font-mono font-bold text-zinc-500">
                Total: {{ currentMachineSummary.spkList.length }} SPK
              </span>
            </div>

            <div v-if="currentMachineSummary.spkList.length > 0" class="overflow-x-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-zinc-100/80 text-zinc-700 uppercase text-[10px] font-black border-b border-zinc-200">
                    <th class="py-2 px-2.5">No. SPK</th>
                    <th class="py-2 px-2.5 text-center">Jml Jumbo</th>
                    <th class="py-2 px-2.5 text-center">Hasil FG</th>
                    <th class="py-2 px-2.5 text-right">Total Meter</th>
                    <th class="py-2 px-2.5 text-right">Berat Hasil</th>
                    <th class="py-2 px-2.5 text-center">Status & Rasio Kualitas</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100 text-zinc-800">
                  <tr v-for="spk in currentMachineSummary.spkList" :key="spk.spk" class="hover:bg-zinc-50/70 transition-colors">
                    <td class="py-2 px-2.5">
                      <div class="font-mono font-black text-zinc-900 text-xs">{{ spk.spk }}</div>
                      <div v-if="spk.jenis" class="text-[10px] text-zinc-500">
                        {{ spk.jenis }} {{ spk.thickness ? spk.thickness + 'MC' : '' }}
                      </div>
                    </td>
                    <td class="py-2 px-2.5 text-center font-mono font-bold text-indigo-700">
                      {{ spk.parentCount }}
                    </td>
                    <td class="py-2 px-2.5 text-center font-mono font-black text-zinc-900">
                      {{ spk.childCount }}
                    </td>
                    <td class="py-2 px-2.5 text-right font-mono text-blue-700">
                      {{ formatNumber(spk.meter) }} M
                    </td>
                    <td class="py-2 px-2.5 text-right font-mono font-bold text-emerald-700">
                      {{ formatNumber(spk.netto) }} kg
                    </td>
                    <td class="py-2 px-2.5">
                      <div class="flex items-center justify-center gap-1 text-[10px] font-bold font-mono">
                        <span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800" :title="`${spk.pass} roll`">
                          ✓ {{ spk.passPercent }}%
                        </span>
                        <span v-if="spk.hold > 0" class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800" :title="`${spk.hold} roll`">
                          ⚠️ {{ spk.holdPercent }}% ({{ spk.hold }})
                        </span>
                        <span v-if="spk.reject > 0" class="px-1.5 py-0.5 rounded bg-rose-100 text-rose-800" :title="`${spk.reject} roll`">
                          ✕ {{ spk.rejectPercent }}% ({{ spk.reject }})
                        </span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div v-else class="text-center py-5 text-xs text-zinc-400 bg-zinc-50 rounded-xl border border-zinc-200">
              Tidak ada SPK yang dikerjakan di mesin {{ activeMachineTab }} pada shift ini.
            </div>
          </div>

          <!-- 4. Rincian Keterangan Defect (DIPISAH: REJECT & HOLD) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Kolom REJECT -->
            <div class="p-3.5 bg-rose-50/50 rounded-xl border border-rose-200 shadow-2xs space-y-2.5">
              <div class="flex items-center justify-between border-b border-rose-200 pb-1.5">
                <span class="text-xs font-black text-rose-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>🛑</span> Keterangan Roll REJECT
                </span>
                <span class="text-[10px] font-mono font-black bg-rose-600 text-white px-2 py-0.5 rounded-full">
                  {{ currentMachineSummary.rejectCount }} Roll
                </span>
              </div>

              <div v-if="currentMachineSummary.rejectBreakdown.length > 0" class="space-y-2">
                <div 
                  v-for="(item, rIdx) in currentMachineSummary.rejectBreakdown" 
                  :key="rIdx"
                  class="p-2.5 bg-white rounded-lg border border-rose-200 text-xs space-y-1"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-black text-rose-900">{{ item.reason }}</span>
                    <span class="font-mono font-black text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 text-[10px]">
                      {{ item.count }} roll
                    </span>
                  </div>
                  <div class="text-[11px] text-zinc-600 flex flex-wrap gap-1">
                    <span class="font-semibold text-zinc-500">SPK Terkait:</span>
                    <span v-for="s in item.spks" :key="s" class="font-mono font-bold bg-zinc-100 px-1 rounded text-zinc-800">
                      {{ s }}
                    </span>
                  </div>
                  <div v-if="item.lots && item.lots.length > 0" class="text-[10px] text-zinc-400 truncate">
                    Lot: {{ item.lots.join(', ') }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-xs text-emerald-700 font-bold bg-emerald-50/50 rounded-lg border border-emerald-200">
                🎉 Bersih! Tidak ada roll Reject di mesin ini.
              </div>
            </div>

            <!-- Kolom HOLD -->
            <div class="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200 shadow-2xs space-y-2.5">
              <div class="flex items-center justify-between border-b border-amber-200 pb-1.5">
                <span class="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️</span> Keterangan Roll HOLD
                </span>
                <span class="text-[10px] font-mono font-black bg-amber-500 text-white px-2 py-0.5 rounded-full">
                  {{ currentMachineSummary.holdCount }} Roll
                </span>
              </div>

              <div v-if="currentMachineSummary.holdBreakdown.length > 0" class="space-y-2">
                <div 
                  v-for="(item, hIdx) in currentMachineSummary.holdBreakdown" 
                  :key="hIdx"
                  class="p-2.5 bg-white rounded-lg border border-amber-200 text-xs space-y-1"
                >
                  <div class="flex items-center justify-between">
                    <span class="font-black text-amber-900">{{ item.reason }}</span>
                    <span class="font-mono font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[10px]">
                      {{ item.count }} roll
                    </span>
                  </div>
                  <div class="text-[11px] text-zinc-600 flex flex-wrap gap-1">
                    <span class="font-semibold text-zinc-500">SPK Terkait:</span>
                    <span v-for="s in item.spks" :key="s" class="font-mono font-bold bg-zinc-100 px-1 rounded text-zinc-800">
                      {{ s }}
                    </span>
                  </div>
                  <div v-if="item.lots && item.lots.length > 0" class="text-[10px] text-zinc-400 truncate">
                    Lot: {{ item.lots.join(', ') }}
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-4 text-xs text-emerald-700 font-bold bg-emerald-50/50 rounded-lg border border-emerald-200">
                ✓ Aman! Tidak ada roll Hold yang tertahan di mesin ini.
              </div>
            </div>
          </div>

          <!-- 5. AI Handover Intelligence (Google Gemini AI & AI Fallback) -->
          <div class="p-4 bg-gradient-to-br from-indigo-950 via-zinc-900 to-slate-900 rounded-2xl text-white shadow-md border border-indigo-500/20 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">🤖</span>
                <div>
                  <div class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>AI Handover Intelligence</span>
                    <span 
                      class="px-1.5 py-0.2 rounded text-[9px] font-mono"
                      :class="currentAiData?.isFallback ? 'bg-amber-500/30 text-amber-300 border border-amber-400/30' : 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/30'"
                    >
                      {{ currentAiData?.model || 'Gemini' }}
                    </span>
                  </div>
                  <div class="text-[10px] text-zinc-400">
                    Analisis cerdas serah terima khusus Mesin {{ activeMachineTab }}
                  </div>
                </div>
              </div>

              <!-- Button Generate Ulang AI -->
              <button
                @click="generateAiHandover(activeMachineTab, true)"
                :disabled="aiLoading[activeMachineTab]"
                class="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <span :class="{ 'animate-spin': aiLoading[activeMachineTab] }">🔄</span>
                <span>{{ aiLoading[activeMachineTab] ? 'Menganalisis...' : 'Generate Ulang AI' }}</span>
              </button>
            </div>

            <!-- Fallback Alert Banner jika mode fallback aktif -->
            <div v-if="currentAiData?.isFallback && !aiLoading[activeMachineTab]" class="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-[11px] text-amber-200 flex items-start gap-2">
              <span class="text-sm">💡</span>
              <div class="flex-1 leading-relaxed">
                <span class="font-bold">Mode AI Fallback Aktif (Analisis Cerdas Lokal):</span> 
                Sistem menghasilkan laporan operasional presisi tinggi berbasis data aktual pabrik PT SWC. Klik tombol <strong>Generate Ulang AI</strong> jika ingin mencoba menghubungkan ulang ke Gemini cloud.
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="aiLoading[activeMachineTab]" class="py-6 flex flex-col items-center justify-center gap-2 text-indigo-200 text-xs">
              <div class="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="font-medium animate-pulse">Sedang menganalisis data shift mesin {{ activeMachineTab }}...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="aiError[activeMachineTab]" class="p-3 bg-red-950/40 border border-red-500/30 rounded-xl text-xs text-red-300 flex items-start gap-2">
              <span class="text-base">⚠️</span>
              <div class="flex-1">
                <div class="font-bold">Gagal Menghasilkan Analisis AI</div>
                <div class="text-[11px] text-red-300/80 mt-0.5">{{ aiError[activeMachineTab] }}</div>
                <button 
                  @click="generateAiHandover(activeMachineTab, true)" 
                  class="mt-2 px-2.5 py-1 bg-red-600/50 hover:bg-red-600 text-white rounded text-[10px] font-bold cursor-pointer"
                >
                  Coba Lagi
                </button>
              </div>
            </div>

            <!-- AI Content Output -->
            <div v-else-if="currentAiData?.content" class="space-y-2">
              <div 
                class="text-xs text-zinc-200 leading-relaxed space-y-1.5 prose-sm max-w-none text-left"
                v-html="renderMarkdown(currentAiData.content)"
              ></div>
              
              <div class="text-[10px] text-zinc-400/70 pt-2 border-t border-white/10 flex items-center justify-between">
                <span>Dianalisis pada: {{ currentAiData.generatedAt }}</span>
                <span>{{ currentAiData.isFallback ? 'Metode: AI Fallback Lokal' : 'Metode: Google Gemini Cloud AI' }} (Tersimpan IndexedDB)</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="py-4 text-center text-xs text-zinc-400">
              Belum ada analisis AI untuk mesin {{ activeMachineTab }}. Klik tombol di atas untuk memulai analisis.
            </div>
          </div>

        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- STEP 2: BRIEFING SHIFT YANG AKAN BEKERJA                      -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div v-else-if="currentStep === 2" class="space-y-4 animate-fade-in">
          <!-- Notification Info Banner -->
          <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <span class="text-emerald-600 text-lg shrink-0">🚀</span>
            <div class="text-xs text-emerald-950 leading-relaxed">
              <p class="font-bold">Penugasan & Roster Shift Yang Akan Bekerja</p>
              <p class="text-emerald-800 text-[11px] mt-0.5">
                Anda bertugas pada <strong>{{ upcomingShift.definition.name }} (Grup {{ upcomingShift.group }})</strong>. Periksa daftar operator yang bertugas di setiap stasiun mesin. Jika ada operator yang izin, sakit, atau digantikan, silakan ubah pada kartu masing-masing mesin sebelum menekan tombol Mulai Bekerja.
              </p>
            </div>
          </div>

          <!-- Shift Duration Mode Selector (8 Jam vs 12 Jam) -->
          <div class="p-3.5 bg-gradient-to-r from-zinc-50 to-zinc-100 border border-zinc-200 rounded-xl space-y-2.5">
            <div class="flex items-center justify-between flex-wrap gap-2">
              <div>
                <span class="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                  <span>⏱️</span>
                  <span>Durasi & Mode Shift Kerja:</span>
                </span>
                <p class="text-[11px] text-zinc-500">
                  Pilih durasi shift untuk seluruh mesin atau atur secara spesifik per stasiun mesin di bawah.
                </p>
              </div>

              <div class="flex items-center gap-1.5 flex-wrap">
                <div class="flex items-center gap-1 bg-white p-1 rounded-xl border border-zinc-200 shadow-2xs">
                  <button
                    type="button"
                    @click="setAllMachinesDuration(false)"
                    :class="['px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer', !isAnyMachineLongShift ? 'bg-blue-600 text-white shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
                  >
                    ⏱️ Semua 8 Jam
                  </button>
                  <button
                    type="button"
                    @click="setAllMachinesDuration(true)"
                    :class="['px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer', isAllMachinesLongShift ? 'bg-purple-600 text-white shadow-xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
                  >
                    ⚡ Semua 12 Jam
                  </button>
                </div>

                <span 
                  v-if="isPartialLongShift"
                  class="px-2.5 py-1 text-xs font-bold rounded-xl bg-amber-100 text-amber-800 border border-amber-300"
                >
                  ⚡ Parsial: {{ longShiftMachineNames.join(', ') }} (12 Jam)
                </span>
              </div>
            </div>

            <div v-if="isAnyMachineLongShift" class="p-2.5 bg-purple-50 border border-purple-200 rounded-lg text-xs text-purple-900 flex items-start gap-2">
              <span class="text-purple-600 text-base">⚡</span>
              <div class="space-y-1 w-full">
                <div class="font-bold">
                  Mode Shift Panjang (12 Jam) Aktif {{ isPartialLongShift ? `(Hanya Mesin: ${longShiftMachineNames.join(', ')})` : '(Semua Mesin)' }}
                </div>
                <p class="text-[11px] text-purple-800 leading-relaxed">
                  Mesin bertanda ⚡ 12 Jam akan mencetak shift LS1/LS2 (07:00-19:00 / 19:00-07:00). Mesin lainnya tetap beroperasi shift normal 8 jam.
                </p>
                <input
                  v-model="handoverLongShiftNote"
                  placeholder="Keterangan shift panjang (misal: Operator Slitting sakit, cover 12 jam)..."
                  class="w-full px-2.5 py-1 text-xs bg-white border border-purple-200 rounded-md text-zinc-800 outline-none focus:ring-1 focus:ring-purple-400"
                />
              </div>
            </div>
          </div>

          <!-- Machine Operator Assignment Cards -->
          <div class="space-y-2.5">
            <div class="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center justify-between">
              <span>Daftar Penugasan Operator per Mesin</span>
              <span class="text-[10px] text-zinc-400 font-semibold">Shift: {{ upcomingShift?.definition?.shortName || '-' }} (Grup {{ upcomingShift?.group || '-' }})</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div 
                v-for="station in stations" 
                :key="station.machine"
                class="p-3 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-2 hover:border-zinc-300 transition-colors"
              >
                <div class="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs">{{ station.icon }}</span>
                    <span class="font-black text-xs text-zinc-900 uppercase">Mesin {{ station.machine }}</span>
                  </div>

                  <div class="flex items-center gap-1.5">
                    <!-- Per-machine shift duration toggle button -->
                    <button
                      type="button"
                      @click="toggleStationShiftDuration(station.machine)"
                      class="text-[10px] font-black px-2 py-0.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1"
                      :class="rosterForm[station.machine]?.isLongShift ? 'bg-purple-100 text-purple-800 border-purple-300 shadow-2xs' : 'bg-zinc-100 text-zinc-600 border-zinc-200 hover:bg-zinc-200'"
                      :title="`Ubah mode shift mesin ${station.machine} (8 Jam vs 12 Jam)`"
                    >
                      <span>{{ rosterForm[station.machine]?.isLongShift ? '⚡ 12 Jam' : '⏱️ 8 Jam' }}</span>
                    </button>

                    <span 
                      v-if="rosterForm[station.machine]?.isSubstituted"
                      class="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-300"
                    >
                      ✏️ Digantikan
                    </span>
                    <span 
                      v-else-if="rosterForm[station.machine]?.operator"
                      class="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300"
                    >
                      ✓ Terjadwal
                    </span>
                    <span 
                      v-else
                      class="text-[9.5px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500"
                    >
                      Belum Diatur
                    </span>
                  </div>
                </div>

                <div>
                  <label class="block text-[10px] font-bold text-zinc-500 mb-0.5">Operator Bertugas:</label>
                  <select 
                    v-model="rosterForm[station.machine].operatorId"
                    @change="onOperatorChange(station.machine)"
                    class="w-full px-2.5 py-1.5 text-xs font-bold text-zinc-800 border border-zinc-300 rounded-lg bg-white outline-none focus:ring-1 focus:ring-emerald-500"
                  >
                    <option value="">-- Kosong / Non-Aktif --</option>
                    <option 
                      v-for="op in getOperatorsForMachine(station.machine)" 
                      :key="op.id" 
                      :value="op.id"
                    >
                      [{{ op.kodeOperator }}] {{ op.nama }} (Grup {{ op.kodeGrup || '—' }})
                    </option>
                  </select>
                </div>

                <!-- Note if substituted -->
                <div v-if="rosterForm[station.machine]?.isSubstituted">
                  <input 
                    v-model="rosterForm[station.machine].note" 
                    placeholder="Keterangan penggantian (mis: Izin / Tukar Shift)..." 
                    class="w-full px-2 py-1 text-[11px] border border-amber-200 rounded-md bg-amber-50/50 outline-none text-zinc-700"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Footer Action Buttons -->
      <div class="px-6 py-3.5 border-t border-zinc-200 bg-white flex items-center justify-between">
        <!-- Step 1 Footer -->
        <template v-if="currentStep === 1">
          <button 
            @click="scheduleStore.showShiftHandoverModal = false"
            class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer transition-colors"
          >
            Tutup
          </button>
          
          <button 
            @click="currentStep = 2"
            class="px-6 py-2.5 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 cursor-pointer transition-all flex items-center gap-2"
          >
            <span>Lanjut ke Shift Selanjutnya (Paham & Siap Kerja)</span>
            <span class="text-sm">➔</span>
          </button>
        </template>

        <!-- Step 2 Footer -->
        <template v-else>
          <button 
            @click="currentStep = 1"
            class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <span>⬅️</span>
            <span>Kembali ke Laporan Shift Sebelumnya</span>
          </button>

          <button 
            @click="handleConfirmRoster"
            class="px-6 py-2.5 text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 rounded-xl shadow-md shadow-emerald-600/20 cursor-pointer transition-all flex items-center gap-2"
          >
            <span>🚀 Konfirmasi & Mulai Shift Sekarang</span>
          </button>
        </template>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useConfigStore } from '@/stores/configStore';
import { db, getSetting, saveSetting } from '@/db';
import { getAiConfig, getAiModelCandidates, recordModelSuccess, recordModelFailure } from '@/services/geminiService';
import { getResolvedGeminiApiKey } from '@/services/spkAiService';

const scheduleStore = useScheduleStore();
const configStore = useConfigStore();

// Step State: 1 = Laporan Shift Sebelumnya, 2 = Briefing Shift Selanjutnya
const currentStep = ref(1);

// Mode Shift Panjang (12 Jam) state
const isHandoverLongShift = ref(false);
const handoverLongShiftNote = ref('');

// Urutan Sheet per Mesin sesuai instruksi: SLITTING, REWIND, CASTING, METALIZE
const machineTabs = [
  { id: 'SLITTING', name: 'SLITTING', icon: '✂️' },
  { id: 'REWIND', name: 'REWIND', icon: '🔄' },
  { id: 'CASTING', name: 'CASTING', icon: '🏭' },
  { id: 'METALIZE', name: 'METALIZE', icon: '✨' },
];

const activeMachineTab = ref('SLITTING');

const stations = [
  { machine: 'CASTING', icon: '🏭' },
  { machine: 'METALIZE', icon: '✨' },
  { machine: 'SLITTING', icon: '✂️' },
  { machine: 'REWIND', icon: '🔄' },
];

// Pasangan Shift Serah Terima (Handover):
const handoverShifts = computed(() => scheduleStore.currentHandoverShifts);
const previousShift = computed(() => handoverShifts.value?.previousShift);
const upcomingShift = computed(() => handoverShifts.value?.upcomingShift);

// Summary Data per Machine Sheet
const emptyMachineSummary = () => ({
  totalParent: 0,
  totalChild: 0,
  totalNetto: 0,
  totalMeter: 0,
  passCount: 0,
  holdCount: 0,
  rejectCount: 0,
  passPercent: 0,
  holdPercent: 0,
  rejectPercent: 0,
  spkList: [],
  rejectBreakdown: [],
  holdBreakdown: []
});

const machineSummaries = reactive({
  SLITTING: emptyMachineSummary(),
  REWIND: emptyMachineSummary(),
  CASTING: emptyMachineSummary(),
  METALIZE: emptyMachineSummary(),
});

const currentMachineSummary = computed(() => {
  return machineSummaries[activeMachineTab.value] || emptyMachineSummary();
});

// AI State per Machine
const aiSummaries = reactive({
  SLITTING: null,
  REWIND: null,
  CASTING: null,
  METALIZE: null,
});

const aiLoading = reactive({
  SLITTING: false,
  REWIND: false,
  CASTING: false,
  METALIZE: false,
});

const aiError = reactive({
  SLITTING: '',
  REWIND: '',
  CASTING: '',
  METALIZE: '',
});

const currentAiData = computed(() => {
  return aiSummaries[activeMachineTab.value];
});

const formatNumber = (val) => {
  if (!val) return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
};

const switchMachineTab = (tabId) => {
  activeMachineTab.value = tabId;
  loadOrGenerateAiSummary(tabId);
};

// Helper normalisasi tanggal & shift
const normalizeDateStr = (raw) => {
  if (!raw) return '';
  const s = String(raw).trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const parts = s.split(/[\/\-\.]/);
  if (parts.length === 3) {
    if (parts[0].length === 4) {
      return `${parts[0]}-${parts[1].padStart(2, '0')}-${parts[2].padStart(2, '0')}`;
    } else if (parts[2].length === 4) {
      return `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
    }
  }
  return s;
};

const resolveItemShift = (item) => {
  const rawShift = String(item.shift || item.shiftCode || '').toUpperCase().trim();
  if (rawShift) {
    if (rawShift.includes('LS1') || rawShift.includes('LONG SHIFT 1') || rawShift.includes('LONGSHIFT 1')) return 'LS1';
    if (rawShift.includes('LS2') || rawShift.includes('LONG SHIFT 2') || rawShift.includes('LONGSHIFT 2')) return 'LS2';
    if (rawShift.includes('1')) return '1';
    if (rawShift.includes('2')) return '2';
    if (rawShift.includes('3')) return '3';
  }
  
  // Fallback ke jam pembuatan jika field shift kosong
  const timeStr = item.createdAt || item.verifiedAt || item.updatedAt || '';
  if (timeStr && timeStr.includes('T')) {
    try {
      const hour = new Date(timeStr).getHours();
      if (hour >= 7 && hour < 15) return '1';
      if (hour >= 15 && hour < 23) return '2';
      return '3';
    } catch (e) {}
  }
  return '1';
};

const isItemInTargetShift = (item, targetDate, targetCode) => {
  const rawD = item.tanggalFormatted || item.tanggal || (item.verifiedAt ? item.verifiedAt.slice(0, 10) : (item.createdAt ? item.createdAt.slice(0, 10) : ''));
  const d = normalizeDateStr(rawD);
  const targetNorm = normalizeDateStr(targetDate);
  if (d !== targetNorm) return false;

  const itemShift = resolveItemShift(item);
  if (targetCode === 'LS1') return itemShift === '1' || itemShift === 'LS1';
  if (targetCode === 'LS2') return itemShift === '2' || itemShift === '3' || itemShift === 'LS2';
  if (targetCode === '1') return itemShift === '1' || itemShift === 'LS1';
  if (targetCode === '2') return itemShift === '2' || itemShift === 'LS2';
  if (targetCode === '3') return itemShift === '3' || itemShift === 'LS2';
  return itemShift === targetCode;
};

// Helper matching mesin yang lengkap (mencakup SLT, SML, REW, CST, MET, dll)
const isMatchingMachine = (item, machineKey) => {
  const m = String(item.mesin || item.machineName || item.station || item.slitting || item.rewind || '').toUpperCase().trim();
  if (machineKey === 'SLITTING') {
    return m.includes('SLIT') || m.includes('SLT') || m.includes('SML') || (!m && true); // default ke SLITTING jika tidak tercatat
  }
  if (machineKey === 'REWIND') {
    return m.includes('REWIND') || m.includes('REW') || m.includes('RWD');
  }
  if (machineKey === 'CASTING') {
    return m.includes('CASTING') || m.includes('CAST') || m.includes('CST') || m.includes('CPP');
  }
  if (machineKey === 'METALIZE') {
    return m.includes('METALIZE') || m.includes('MET') || m.includes('MTL');
  }
  return false;
};

const loadShiftSummary = async () => {
  const pShift = previousShift.value;
  if (!pShift) return;

  const targetDate = pShift.date;
  const targetCode = String(pShift.shiftCode);

  let items = [];

  try {
    // 1. Ambil dari db.labels
    if (db.labels) {
      const allLabels = await db.labels.toArray();
      const matched = allLabels.filter(l => isItemInTargetShift(l, targetDate, targetCode));
      items.push(...matched);
    }

    // 2. Ambil dari db.data_rolls jika ada
    if (db.data_rolls) {
      const allRolls = await db.data_rolls.toArray();
      const matchedRolls = allRolls.filter(r => isItemInTargetShift(r, targetDate, targetCode));

      for (const r of matchedRolls) {
        const isDuplicate = items.some(it => {
          if (it.uuid && r.uuid && it.uuid === r.uuid) return true;
          if (it.id && r.id && it.id === r.id) return true;
          return it.lot && r.lot && it.lot === r.lot && String(it.turunan || '') === String(r.turunan || '');
        });
        if (!isDuplicate) {
          items.push(r);
        }
      }
    }
  } catch (e) {
    console.error('Error loading shift summary:', e);
  }

  // Proses summary untuk setiap mesin
  for (const tab of machineTabs) {
    const mKey = tab.id;
    const mItems = items.filter(it => isMatchingMachine(it, mKey));

    const childCount = mItems.length;
    let netto = 0;
    let meter = 0;
    let pass = 0;
    let hold = 0;
    let reject = 0;

    const parentSet = new Set();
    const spkMap = {};
    const rejectReasons = {};
    const holdReasons = {};

    mItems.forEach(i => {
      // Parent lot identification
      const rawParent = (i.parentLot || i.lotInduk || i.lot || '').toString().trim();
      const parentLotClean = rawParent.split('/')[0].trim().toUpperCase();
      if (parentLotClean) {
        parentSet.add(parentLotClean);
      }

      netto += parseFloat(i.netto || i.berat || 0) || 0;
      meter += parseFloat(i.length || i.meter || 0) || 0;

      const st = String(i.qualityStatus || i.status || 'PASS').toUpperCase();
      if (st === 'PASS' || st === 'OK') {
        pass++;
      } else if (st === 'HOLD') {
        hold++;
      } else if (st === 'REJECT') {
        reject++;
      } else {
        pass++;
      }

      // SPK aggregation
      const spkName = (i.spk || 'Tanpa SPK').trim().toUpperCase();
      if (!spkMap[spkName]) {
        spkMap[spkName] = {
          spk: spkName,
          childCount: 0,
          parentLots: new Set(),
          netto: 0,
          meter: 0,
          pass: 0,
          hold: 0,
          reject: 0,
          jenis: i.jenis || '',
          thickness: i.thickness || ''
        };
      }
      spkMap[spkName].childCount++;
      if (parentLotClean) spkMap[spkName].parentLots.add(parentLotClean);
      spkMap[spkName].netto += parseFloat(i.netto || i.berat || 0) || 0;
      spkMap[spkName].meter += parseFloat(i.length || i.meter || 0) || 0;

      if (st === 'PASS' || st === 'OK') spkMap[spkName].pass++;
      else if (st === 'HOLD') spkMap[spkName].hold++;
      else if (st === 'REJECT') spkMap[spkName].reject++;

      // Defect Reason Aggregation
      const reasonRaw = (i.reasonDefect || i.keterangan || '').trim();
      if (st === 'REJECT') {
        const rName = reasonRaw || 'REJECT PRODUKSI';
        if (!rejectReasons[rName]) {
          rejectReasons[rName] = { reason: rName, count: 0, spks: new Set(), lots: [] };
        }
        rejectReasons[rName].count++;
        if (spkName) rejectReasons[rName].spks.add(spkName);
        if (i.lot && rejectReasons[rName].lots.length < 5) rejectReasons[rName].lots.push(i.lot + (i.turunan ? `/${i.turunan}` : ''));
      } else if (st === 'HOLD') {
        const hName = reasonRaw || 'HOLD QC';
        if (!holdReasons[hName]) {
          holdReasons[hName] = { reason: hName, count: 0, spks: new Set(), lots: [] };
        }
        holdReasons[hName].count++;
        if (spkName) holdReasons[hName].spks.add(spkName);
        if (i.lot && holdReasons[hName].lots.length < 5) holdReasons[hName].lots.push(i.lot + (i.turunan ? `/${i.turunan}` : ''));
      }
    });

    const spkList = Object.values(spkMap).map(s => {
      const tot = s.childCount || 1;
      return {
        ...s,
        parentCount: s.parentLots.size || (s.childCount > 0 ? 1 : 0),
        netto: Math.round(s.netto * 100) / 100,
        meter: Math.round(s.meter),
        passPercent: Math.round((s.pass / tot) * 100),
        holdPercent: Math.round((s.hold / tot) * 100),
        rejectPercent: Math.round((s.reject / tot) * 100),
      };
    });

    machineSummaries[mKey] = {
      totalParent: parentSet.size,
      totalChild: childCount,
      totalNetto: Math.round(netto * 100) / 100,
      totalMeter: Math.round(meter),
      passCount: pass,
      holdCount: hold,
      rejectCount: reject,
      passPercent: childCount > 0 ? Math.round((pass / childCount) * 100) : 0,
      holdPercent: childCount > 0 ? Math.round((hold / childCount) * 100) : 0,
      rejectPercent: childCount > 0 ? Math.round((reject / childCount) * 100) : 0,
      spkList,
      rejectBreakdown: Object.values(rejectReasons).map(r => ({ ...r, spks: Array.from(r.spks) })),
      holdBreakdown: Object.values(holdReasons).map(h => ({ ...h, spks: Array.from(h.spks) })),
    };
  }

  // Muat atau generate AI untuk tab aktif
  loadOrGenerateAiSummary(activeMachineTab.value);
};

// Markdown Renderer Safe for AI Output
const escapeHtml = (text) => {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

const renderMarkdown = (content) => {
  if (!content) return '';
  const lines = content.split('\n');
  let html = '';
  let inList = false;

  for (let line of lines) {
    line = escapeHtml(line);
    line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
    line = line.replace(/`(.*?)`/g, '<code class="bg-white/10 px-1 py-0.5 rounded text-amber-300 font-mono text-[11px]">$1</code>');

    if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h4 class="font-black text-indigo-200 text-xs mt-2 mb-1">${line.substring(4)}</h4>`;
    } else if (line.startsWith('## ') || line.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 class="font-black text-white text-sm mt-2.5 mb-1">${line.replace(/^#+\s*/, '')}</h3>`;
    } else if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
      if (!inList) { html += '<ul class="list-disc list-inside space-y-1 my-1 text-zinc-200">'; inList = true; }
      html += `<li>${line.trim().substring(2)}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (line.trim().length > 0) {
        html += `<p class="my-1 text-zinc-200 leading-relaxed">${line}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';
  return html;
};

// AI Handover Generation & Cache Logic
const getCacheKey = (machineKey) => {
  const pShift = previousShift.value;
  if (!pShift) return null;
  return `handover_ai_${pShift.date}_${pShift.shiftCode}_${machineKey}`;
};

const loadOrGenerateAiSummary = async (machineKey) => {
  const cacheKey = getCacheKey(machineKey);
  if (!cacheKey) return;

  try {
    const cached = await getSetting(cacheKey);
    if (cached && cached.content) {
      aiSummaries[machineKey] = cached;
      return;
    }
  } catch (e) {
    console.warn('Failed reading handover cache:', e);
  }

  // Jika belum ada di cache, jalankan generasi AI otomatis
  generateAiHandover(machineKey, false);
};

// AI Fallback Engine: Ringkasan Analisis Operasional Cerdas Berbasis Data Aktual Pabrik PT SWC
const generateLocalHandoverSummary = (machineKey, summary, pShift, uShift) => {
  const pName = pShift?.definition?.name || 'Shift Sebelumnya';
  const pGroup = pShift?.group ? `Grup ${pShift.group}` : '';
  const uName = uShift?.definition?.name || 'Shift Berikutnya';
  const uGroup = uShift?.group ? `Grup ${uShift.group}` : 'berikutnya';
  const workDate = pShift?.date || new Date().toISOString().slice(0, 10);

  const totalChild = summary.totalChild || 0;
  const totalParent = summary.totalParent || 0;
  const totalNetto = summary.totalNetto || 0;
  const totalMeter = summary.totalMeter || 0;
  const passCount = summary.passCount || 0;
  const holdCount = summary.holdCount || 0;
  const rejectCount = summary.rejectCount || 0;
  const passPercent = summary.passPercent || (totalChild > 0 ? Math.round((passCount / totalChild) * 100) : 100);
  const holdPercent = summary.holdPercent || 0;
  const rejectPercent = summary.rejectPercent || 0;

  let outText = `### 📋 LAPORAN OPERASIONAL SERAH TERIMA MESIN ${machineKey}\n`;
  outText += `**PT SAPTAWARNA CEMERLANG (PT SWC)**\n\n`;
  outText += `* **Shift Selesai:** ${pName} (${pGroup}), Tanggal Kerja: \`${workDate}\`\n`;
  outText += `* **Shift Bertugas:** ${uName} (${uGroup})\n\n`;

  // 1. Ringkasan Output & Pencapaian
  outText += `#### 1. Ringkasan Output & Pencapaian\n`;
  if (totalChild === 0) {
    outText += `* **Status Produksi:** Belum ada rekaman roll FG yang selesai/terverifikasi di mesin ${machineKey} pada shift ini (kemungkinan mesin dalam proses setup roll jumbo, pemanasan, atau maintenance).\n`;
  } else {
    outText += `* **Volume Hasil:** Memproses **${totalParent} Jumbo (Parent)** menjadi **${totalChild} Roll FG** dengan total berat bersih **${formatNumber(totalNetto)} kg** dan akumulasi panjang **${formatNumber(totalMeter)} M**.\n`;
    outText += `* **Distribusi Kualitas Output:**\n`;
    outText += `  - ✅ **PASS:** ${passCount} roll (${passPercent}%)\n`;
    outText += `  - ⚠️ **HOLD:** ${holdCount} roll (${holdPercent}%)\n`;
    outText += `  - 🛑 **REJECT:** ${rejectCount} roll (${rejectPercent}%)\n`;

    if (passPercent >= 98 && rejectCount === 0) {
      outText += `* **Yield & Efisiensi:** Kualitas prima mencapai target standar pabrik (PASS ${passPercent}% tanpa cacat reject).\n`;
    } else if (rejectCount > 0) {
      outText += `* **Tingkat Cacat:** Terdata reject sebesar **${rejectPercent}% (${rejectCount} roll)**. Perhatikan pencegahan akar masalah pada shift berikutnya.\n`;
    }
  }

  // Rincian SPK
  if (summary.spkList && summary.spkList.length > 0) {
    outText += `\n**Rincian SPK Yang Dikerjakan:**\n`;
    summary.spkList.forEach(s => {
      outText += `* **SPK ${s.spk}** ${s.jenis ? `(${s.jenis} ${s.thickness ? s.thickness + 'MC' : ''})` : ''}: ${s.childCount} roll FG (${formatNumber(s.netto)} kg / ${formatNumber(s.meter)} M) — PASS: ${s.passPercent}%, HOLD: ${s.hold}, REJECT: ${s.reject}\n`;
    });
  }

  // 2. Sorotan Masalah & Defect
  outText += `\n#### 2. Sorotan Masalah & Defect\n`;
  const hasRejects = summary.rejectBreakdown && summary.rejectBreakdown.length > 0;
  const hasHolds = summary.holdBreakdown && summary.holdBreakdown.length > 0;

  if (!hasRejects && !hasHolds) {
    outText += `* **Zero Defect:** Tidak tercatat adanya roll REJECT maupun HOLD pada mesin ${machineKey} selama shift berlangsung. Parameter mesin berjalan prima dan stabil.\n`;
  } else {
    if (hasRejects) {
      outText += `* **Roll Cacat REJECT (${rejectCount} roll):**\n`;
      summary.rejectBreakdown.forEach(r => {
        outText += `  - 🛑 **${r.reason}** sejumlah ${r.count} roll (SPK: ${r.spks.join(', ') || '-'})\n`;
      });
    }
    if (hasHolds) {
      outText += `* **Roll Tertahan HOLD QC (${holdCount} roll):**\n`;
      summary.holdBreakdown.forEach(h => {
        outText += `  - ⚠️ **${h.reason}** sejumlah ${h.count} roll (SPK: ${h.spks.join(', ') || '-'}). Menunggu rilis atau rekomendasi disposisi dari tim QC.\n`;
      });
    }
  }

  // 3. Instruksi Prioritas Shift Baru
  outText += `\n#### 3. Instruksi Prioritas Shift Baru (${uGroup})\n`;
  if (machineKey === 'SLITTING') {
    outText += `1. **Cek Pisau Potong & Lebar Trim:** Periksa ketajaman slitter blades. Pastikan sisa trim kedua sisi simetris dan tidak melebihi batas toleransi standar pabrik (maksimal 30 mm) agar berat waste terkendali.\n`;
    outText += `2. **Tension Gulungan & Edge Guiding:** Lakukan fine-tuning sensor web guide pada awal running jumbo untuk mencegah resiko telescoping atau pinggiran roll bergelombang.\n`;
    outText += `3. **Pembersihan Poros & Core:** Bersihkan debu film dan residu perekat pada area shaft/core chuck sebelum memasang core baru.\n`;
  } else if (machineKey === 'REWIND') {
    outText += `1. **Web Guiding & Alignment:** Pastikan posisi roll yang di-rewind sejajar presisi dengan sumbu core untuk menghindari offset tepi.\n`;
    outText += `2. **Inspeksi Sambungan (Splice):** Pastikan penandaan bendera cacat (flagging) terpasang jelas untuk memudahkan inspeksi saat proses pengemasan.\n`;
    outText += `3. **Kontrol Tekanan Lay-on Roller:** Sesuaikan tekanan lay-on roll agar kekencangan gulungan padat merata tanpa gelembung udara.\n`;
  } else if (machineKey === 'CASTING') {
    outText += `1. **Pemeriksaan Die Lip & Suhu Zona:** Pastikan tidak ada partikel terdegradasi pada celah bibir cetakan (die line). Pantau kestabilan temperatur barrel tiap zona.\n`;
    outText += `2. **Chill Roll & Ketebalan Film:** Amati keseragaman pendinginan chill roll dan verifikasi profil ketebalan (thickness profile) melintang.\n`;
    outText += `3. **Corona Treater:** Uji dyne level permukaan film secara berkala sesuai ketentuan SPK untuk menjaga daya rekat permukaan.\n`;
  } else if (machineKey === 'METALIZE') {
    outText += `1. **Vakum Chamber & Wire Feeding:** Monitor derajat kevakuman ruang metalizing dan laju pengumpanan kawat aluminium.\n`;
    outText += `2. **Optical Density (OD):** Pastikan pembacaan sensor densitas optik lapisan aluminium stabil di sepanjang lintasan web.\n`;
    outText += `3. **Inspeksi Pinhole:** Pantau ada tidaknya pinhole atau goresan garis pada roll hasil pelapisan metalik.\n`;
  } else {
    outText += `1. **Inspeksi Awal:** Lakukan briefing 5S dan pemeriksaan parameter mesin sebelum memulai produksi.\n`;
    outText += `2. **Verifikasi SPK:** Pastikan spesifikasi bahan dan ukuran sesuai kartu instruksi kerja.\n`;
  }

  if (hasHolds) {
    outText += `4. **Koordinasi Kualitas:** Segera tindak lanjuti ${holdCount} roll berstatus HOLD dengan Quality Control shift berikutnya.\n`;
  }

  return outText;
};

const generateAiHandover = async (machineKey, forceRegenerate = false) => {
  const pShift = previousShift.value;
  const uShift = upcomingShift.value;
  if (!pShift) return;

  const cacheKey = getCacheKey(machineKey);
  if (!forceRegenerate && cacheKey) {
    try {
      const cached = await getSetting(cacheKey);
      if (cached && cached.content) {
        aiSummaries[machineKey] = cached;
        return;
      }
    } catch (e) {}
  }

  aiLoading[machineKey] = true;
  aiError[machineKey] = '';

  const summary = machineSummaries[machineKey] || emptyMachineSummary();

  const aiCfg = await getAiConfig();
  const apiKey = aiCfg.apiKey || (await getResolvedGeminiApiKey());
  
  // Jika API Key tidak ada, otomatis aktifkan AI Fallback lokal
  if (!apiKey) {
    const fallbackText = generateLocalHandoverSummary(machineKey, summary, pShift, uShift);
    const resultObj = {
      content: fallbackText,
      model: 'AI Fallback (Analisis Cerdas Lokal)',
      isFallback: true,
      generatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    aiSummaries[machineKey] = resultObj;
    aiLoading[machineKey] = false;
    aiError[machineKey] = '';
    if (cacheKey) {
      await saveSetting(cacheKey, resultObj).catch(() => {});
    }
    return;
  }

  const spkLines = summary.spkList.map(s => 
    `- SPK: ${s.spk} | Parent: ${s.parentCount} jumbo | FG: ${s.childCount} roll | Netto: ${s.netto} kg | Meter: ${s.meter} m | Pass: ${s.passPercent}% | Hold: ${s.hold} roll | Reject: ${s.reject} roll`
  ).join('\n') || '- Tidak ada SPK dikerjakan.';

  const rejectLines = summary.rejectBreakdown.map(r => 
    `- Alasan: ${r.reason} (${r.count} roll) | SPK: ${r.spks.join(', ')} | Lot: ${r.lots.join(', ')}`
  ).join('\n') || '- Tidak ada reject.';

  const holdLines = summary.holdBreakdown.map(h => 
    `- Alasan: ${h.reason} (${h.count} roll) | SPK: ${h.spks.join(', ')} | Lot: ${h.lots.join(', ')}`
  ).join('\n') || '- Tidak ada hold.';

  const prompt = `Anda adalah Asisten Supervisor AI Pabrik Manufaktur Flexible Packaging di PT SAPTAWARNA CEMERLANG (PT SWC).
IDENTITAS PERUSAHAAN WAJIB & MUTLAK:
Nama perusahaan adalah PT SAPTAWARNA CEMERLANG (disingkat PT SWC).
DILARANG KERAS memplesetkan atau mengubah nama perusahaan menjadi nama lain (seperti "Sumber Waras" atau nama fiktif lainnya).

PEDOMAN ANTI-HALUSINASI MUTLAK:
1. Hanya gunakan data aktual mesin, nomor SPK, dan daftar defect yang tercantum di bawah ini.
2. DILARANG KERAS mengarang nomor lot, nama operator, atau angka produksi yang tidak ada pada data. Jika data tertentu kosong atau nihil, sebutkan apa adanya (misal: "Tidak ada roll hold/reject").
3. Berikan analisis operasional yang logis berdasarkan parameter teknis flexible packaging (tension, suhu, keausan pisau, corona treater, dll).

Buat ringkasan serah terima (shift handover summary) yang tajam, profesional, dan actionable untuk:
- MESIN: ${machineKey}
- Shift Selesai: ${pShift.definition?.name || 'Shift Sebelumnya'} (Grup ${pShift.group}), Tanggal Kerja: ${pShift.date}
- Shift Baru Masuk: ${uShift?.definition?.name || 'Shift Berikutnya'} (Grup ${uShift?.group || '-'}), Tanggal: ${uShift?.date || pShift.date}

DATA AKTUAL PRODUKSI MESIN ${machineKey}:
- Total Parent (Jumbo): ${summary.totalParent} roll
- Total Child (FG): ${summary.totalChild} roll
- Total Berat Netto: ${summary.totalNetto} kg
- Total Panjang Meter: ${summary.totalMeter} M
- Rasio Kualitas: PASS ${summary.passCount} roll (${summary.passPercent}%), HOLD ${summary.holdCount} roll (${summary.holdPercent}%), REJECT ${summary.rejectCount} roll (${summary.rejectPercent}%)

DATA SPK DIKERJAKAN:
${spkLines}

KETERANGAN ROLL REJECT:
${rejectLines}

KETERANGAN ROLL HOLD:
${holdLines}

INSTRUKSI FORMAT OUTPUT:
Gunakan format Markdown terstruktur, profesional, dan lengkap tanpa terpotong:
1. **Ringkasan Output & Pencapaian**: Evaluasi performa output mesin dan rasio kualitas secara mendalam.
2. **Sorotan Masalah & Defect**: Analisis defect/hold kritis yang terjadi pada SPK/lot tertentu dan potensi akar masalahnya.
3. **Instruksi Prioritas Shift Baru**: Instruksi operasional konkret untuk Grup ${uShift?.group || 'berikutnya'} saat mengoperasikan mesin ${machineKey} (misal: kalibrasi pisau, cek tension roll, penanganan roll hold/reject).
Gunakan bahasa Indonesia baku pabrik industri yang lugas, jelas, dan tuntas. Berikan analisis menyeluruh tanpa memotong teks di tengah jalan.`;

  let rawCandidates = await getAiModelCandidates();
  const validKnownModels = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-pro-exp-02-05'];
  let modelCandidates = (rawCandidates || []).filter(m => validKnownModels.includes(m));
  if (modelCandidates.length === 0) {
    modelCandidates = ['gemini-2.0-flash', 'gemini-2.0-flash-lite', 'gemini-2.0-pro-exp-02-05'];
  }

  let success = false;
  let lastErrMsg = '';

  for (const model of modelCandidates) {
    const abortCtrl = new AbortController();
    const timeoutId = setTimeout(() => abortCtrl.abort(), 15000);

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
      
      const basePayload = {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.25,
          maxOutputTokens: 8192
        }
      };

      let res = await fetch(url, {
        method: 'POST',
        signal: abortCtrl.signal,
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey.trim()
        },
        body: JSON.stringify(basePayload)
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const errMsg = errJson?.error?.message || `HTTP ${res.status}`;
        recordModelFailure(model, errMsg, res.status).catch(() => {});
        throw new Error(errMsg);
      }

      const data = await res.json();
      let generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        recordModelSuccess(model).catch(() => {});

        const resultObj = {
          content: generatedText,
          model,
          isFallback: false,
          generatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        };
        aiSummaries[machineKey] = resultObj;
        if (cacheKey) {
          await saveSetting(cacheKey, resultObj);
        }
        success = true;
        break;
      }
    } catch (err) {
      clearTimeout(timeoutId);
      lastErrMsg = err.message;
      const isTimeout = err.name === 'AbortError';
      const reason = isTimeout ? 'Timeout (>15s)' : (err.message || 'Error');
      recordModelFailure(model, reason, isTimeout ? 408 : null).catch(() => {});
      console.warn(`[Handover AI] Model ${model} gagal (${reason}). Beralih ke model berikutnya...`);
    }
  }

  // JIKA SEMUA MODEL GEMINI GAGAL / LIMIT / OFFLINE -> OTOMATIS AKTIFKAN AI FALLBACK LOKAL!
  if (!success) {
    console.warn(`[Handover AI] Semua model Gemini gagal (${lastErrMsg}). Mengaktifkan AI Fallback lokal...`);
    const fallbackText = generateLocalHandoverSummary(machineKey, summary, pShift, uShift);
    const resultObj = {
      content: fallbackText,
      model: 'AI Fallback (Analisis Cerdas Lokal)',
      isFallback: true,
      generatedAt: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    aiSummaries[machineKey] = resultObj;
    aiError[machineKey] = '';
    if (cacheKey) {
      await saveSetting(cacheKey, resultObj).catch(() => {});
    }
  }

  aiLoading[machineKey] = false;
};

const rosterForm = reactive({
  CASTING: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, isLongShift: false, note: '' },
  METALIZE: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, isLongShift: false, note: '' },
  SLITTING: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, isLongShift: false, note: '' },
  REWIND: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, isLongShift: false, note: '' },
});

const isAnyMachineLongShift = computed(() => {
  return stations.some(s => Boolean(rosterForm[s.machine]?.isLongShift));
});

const isAllMachinesLongShift = computed(() => {
  return stations.length > 0 && stations.every(s => Boolean(rosterForm[s.machine]?.isLongShift));
});

const isPartialLongShift = computed(() => {
  return isAnyMachineLongShift.value && !isAllMachinesLongShift.value;
});

const longShiftMachineNames = computed(() => {
  return stations.filter(s => Boolean(rosterForm[s.machine]?.isLongShift)).map(s => s.machine);
});

const setAllMachinesDuration = (isLong) => {
  for (const s of stations) {
    if (rosterForm[s.machine]) {
      rosterForm[s.machine].isLongShift = Boolean(isLong);
    }
  }
  isHandoverLongShift.value = Boolean(isLong);
};

const toggleStationShiftDuration = (machineName) => {
  if (rosterForm[machineName]) {
    rosterForm[machineName].isLongShift = !rosterForm[machineName].isLongShift;
    isHandoverLongShift.value = isAnyMachineLongShift.value;
  }
};

const getOperatorsForMachine = (machineName) => {
  const list = (configStore.operatorList || []).filter(o => o.active !== false);
  const byMachine = list.filter(o => o.mesin && o.mesin.toUpperCase() === machineName.toUpperCase());
  return byMachine.length > 0 ? byMachine : list;
};

// Inisialisasi roster penugasan untuk Shift Yang AKAN Bekerja (Upcoming Shift)
const initRosterFromSchedule = async () => {
  // 1. Pastikan daftar master operator termuat
  if (!configStore.operatorList || configStore.operatorList.length === 0) {
    await configStore.loadAll();
  }

  const shift = upcomingShift.value;
  if (!shift) return;
  const scheduled = scheduleStore.getScheduledOperators(shift.date, shift.shiftCode, shift.group);

  const cleanGroup = (val) => String(val || '').toUpperCase().replace(/[^A-Z0-9]/g, '').replace(/^GR(O)?UP/, '').trim();

  for (const station of stations) {
    const m = station.machine;
    const scheduledOp = scheduled.roster[m];
    const isStationLong = scheduleStore.isDateLongShift(shift.date, m);

    // Cek apakah ada confirmedRoster yang VALID untuk shift dan tanggal ini
    const existing = (scheduleStore.confirmedRoster && scheduleStore.confirmedRoster[m]?.operatorId)
      ? scheduleStore.confirmedRoster[m]
      : null;

    const isConfirmedForCurrentShift = existing &&
      scheduleStore.confirmedRosterShift === shift.shiftCode &&
      scheduleStore.confirmedRosterDate === shift.date;

    if (isConfirmedForCurrentShift) {
      rosterForm[m] = { ...existing, isLongShift: existing.isLongShift ?? isStationLong };
    } else if (scheduledOp) {
      // Prioritas 1: Otomatis isi operator TERJADWAL dari jadwal shift
      rosterForm[m] = {
        operatorId: scheduledOp.id,
        operator: scheduledOp.nama,
        kodeOperator: scheduledOp.kodeOperator,
        group: scheduledOp.kodeGrup,
        isSubstituted: false,
        isLongShift: isStationLong,
        note: ''
      };
    } else {
      // Prioritas 2: Cari operator yang cocok dengan mesin ini dan grup shift aktif
      const targetGroup = cleanGroup(shift.group);
      const ops = (configStore.operatorList || []).filter(o => {
        if (o.active === false) return false;
        const opM = String(o.mesin || '').toUpperCase();
        const machMatch = opM === m || opM.includes(m) || m.includes(opM);
        return machMatch && cleanGroup(o.kodeGrup) === targetGroup;
      });

      if (ops.length > 0) {
        rosterForm[m] = {
          operatorId: ops[0].id,
          operator: ops[0].nama,
          kodeOperator: ops[0].kodeOperator,
          group: ops[0].kodeGrup,
          isSubstituted: false,
          isLongShift: isStationLong,
          note: ''
        };
      } else {
        // Fallback: Operator mesin tersebut (ditandai substitusi jika bukan grupnya)
        const machineOps = getOperatorsForMachine(m);
        if (machineOps.length > 0) {
          rosterForm[m] = {
            operatorId: machineOps[0].id,
            operator: machineOps[0].nama,
            kodeOperator: machineOps[0].kodeOperator,
            group: machineOps[0].kodeGrup,
            isSubstituted: cleanGroup(machineOps[0].kodeGrup) !== targetGroup,
            isLongShift: isStationLong,
            note: ''
          };
        } else {
          rosterForm[m] = { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, isLongShift: isStationLong, note: '' };
        }
      }
    }
  }
};

watch(() => scheduleStore.showShiftHandoverModal, async (newVal) => {
  if (newVal) {
    scheduleStore.tickLiveClock();
    currentStep.value = 1; // Selalu mulai dari Step 1 (Laporan Shift Sebelumnya)
    activeMachineTab.value = 'SLITTING'; // Mesin pertama slitting sesuai instruksi
    await configStore.loadAll();
    loadShiftSummary();
    await initRosterFromSchedule();

    const targetDate = upcomingShift.value?.date || scheduleStore.getWorkDate();
    isHandoverLongShift.value = scheduleStore.isDateLongShift(targetDate);
    const existingOverride = scheduleStore.dailyShiftOverrides && scheduleStore.dailyShiftOverrides[targetDate];
    handoverLongShiftNote.value = existingOverride?.note || '';
  }
});

// Otomatis muat ulang data jika transisi shift terjadi saat modal sedang dibuka
watch(() => upcomingShift.value?.shiftCode, async () => {
  if (scheduleStore.showShiftHandoverModal) {
    await configStore.loadAll();
    loadShiftSummary();
    await initRosterFromSchedule();
  }
});

const onOperatorChange = (machineName) => {
  const opId = rosterForm[machineName].operatorId;
  const op = configStore.operatorList.find(o => String(o.id) === String(opId));
  const shift = upcomingShift.value;

  if (op) {
    const isNormalGroup = String(op.kodeGrup || '').toUpperCase() === shift.group || String(op.kodeGrup || '').toUpperCase() === `GRUP ${shift.group}`;
    rosterForm[machineName].operator = op.nama;
    rosterForm[machineName].kodeOperator = op.kodeOperator;
    rosterForm[machineName].group = op.kodeGrup;
    rosterForm[machineName].isSubstituted = !isNormalGroup;
  } else {
    rosterForm[machineName].operator = '';
    rosterForm[machineName].kodeOperator = '';
    rosterForm[machineName].group = '';
    rosterForm[machineName].isSubstituted = false;
  }
};

const handleConfirmRoster = () => {
  const machineShiftMap = {
    CASTING: Boolean(rosterForm.CASTING?.isLongShift),
    METALIZE: Boolean(rosterForm.METALIZE?.isLongShift),
    SLITTING: Boolean(rosterForm.SLITTING?.isLongShift),
    REWIND: Boolean(rosterForm.REWIND?.isLongShift),
  };
  const anyLong = Object.values(machineShiftMap).some(Boolean);
  const activeLongNames = Object.keys(machineShiftMap).filter(k => machineShiftMap[k]);

  scheduleStore.confirmShiftHandover(rosterForm, {
    isLongShift: anyLong,
    machines: machineShiftMap,
    note: handoverLongShiftNote.value || (anyLong ? `Shift 12 Jam (${activeLongNames.join(', ')}) diaktifkan saat serah terima` : '')
  });
};

onMounted(async () => {
  await configStore.loadAll();
  loadShiftSummary();
  await initRosterFromSchedule();
});
</script>

