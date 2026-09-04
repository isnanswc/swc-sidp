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
        :style="{ backgroundColor: currentStep === 1 ? (previousShift.definition.color || '#4f46e5') : (upcomingShift.definition.color || '#059669') }"
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
                GRUP {{ currentStep === 1 ? previousShift.group : upcomingShift.group }}
              </span>
            </div>
            <h3 class="font-black text-lg text-white leading-tight mt-0.5">
              {{ currentStep === 1 ? previousShift.definition.name : upcomingShift.definition.name }}
              <span class="text-sm font-semibold opacity-90">({{ currentStep === 1 ? previousShift.definition.startTime : upcomingShift.definition.startTime }} - {{ currentStep === 1 ? previousShift.definition.endTime : upcomingShift.definition.endTime }})</span>
            </h3>
            <div class="text-[11px] text-white/80 font-mono mt-0.5 flex items-center gap-2">
              <span>📅 Tanggal Kerja: <strong>{{ currentStep === 1 ? previousShift.date : upcomingShift.date }}</strong></span>
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
                {{ currentMachineSummary.totalChild }} FG
              </span>
            </button>
          </div>

          <!-- Info Banner for Active Machine -->
          <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
            <span class="text-blue-600 text-lg shrink-0">ℹ️</span>
            <div class="text-xs text-blue-950 leading-relaxed">
              <p class="font-bold">Laporan Serah Terima Mesin {{ activeMachineTab }}</p>
              <p class="text-blue-800 text-[11px] mt-0.5">
                Rekapitulasi pengerjaan roll oleh <strong>Shift {{ previousShift.definition.shortName }} (Grup {{ previousShift.group }})</strong> pada mesin <strong>{{ activeMachineTab }}</strong>. Periksa rasio kualitas, rincian SPK, serta catatan reject/hold sebelum melanjutkan.
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

          <!-- 5. AI Handover Intelligence (Real Google Gemini AI) -->
          <div class="p-4 bg-gradient-to-br from-indigo-950 via-zinc-900 to-slate-900 rounded-2xl text-white shadow-md border border-indigo-500/20 space-y-3">
            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-2.5">
              <div class="flex items-center gap-2">
                <span class="text-lg">🤖</span>
                <div>
                  <div class="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                    <span>AI Handover Intelligence</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-500/30 text-indigo-300 border border-indigo-400/30">
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

            <!-- Loading State -->
            <div v-if="aiLoading[activeMachineTab]" class="py-6 flex flex-col items-center justify-center gap-2 text-indigo-200 text-xs">
              <div class="w-7 h-7 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="font-medium animate-pulse">Gemini AI sedang menganalisis data shift mesin {{ activeMachineTab }}...</p>
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
                <span>Status: Tersimpan Lokal (IndexedDB)</span>
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

          <!-- Machine Operator Assignment Cards -->
          <div class="space-y-2.5">
            <div class="text-xs font-black text-zinc-700 uppercase tracking-wider flex items-center justify-between">
              <span>Daftar Penugasan Operator per Mesin</span>
              <span class="text-[10px] text-zinc-400 font-semibold">Shift: {{ upcomingShift.definition.shortName }} (Grup {{ upcomingShift.group }})</span>
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
import { getResolvedGeminiApiKey } from '@/services/spkAiService';

const scheduleStore = useScheduleStore();
const configStore = useConfigStore();

// Step State: 1 = Laporan Shift Sebelumnya, 2 = Briefing Shift Selanjutnya
const currentStep = ref(1);

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

// Helper matching mesin
const isMatchingMachine = (item, machineKey) => {
  const m = String(item.mesin || item.machineName || item.station || '').toUpperCase().trim();
  if (machineKey === 'SLITTING') {
    return m.includes('SLIT') || m.includes('SML') || (!m && true); // default ke SLITTING jika tidak tercatat
  }
  if (machineKey === 'REWIND') {
    return m.includes('REWIND') || m.includes('RWD');
  }
  if (machineKey === 'CASTING') {
    return m.includes('CASTING') || m.includes('CST');
  }
  if (machineKey === 'METALIZE') {
    return m.includes('METALIZE') || m.includes('MET');
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
      const matched = allLabels.filter(l => {
        const d = l.tanggal || (l.verifiedAt ? l.verifiedAt.slice(0, 10) : (l.createdAt ? l.createdAt.slice(0, 10) : ''));
        if (d !== targetDate) return false;
        const s = String(l.shift || '1').toUpperCase();
        if (targetCode === 'LS1') return s === '1' || s === 'LS1';
        if (targetCode === 'LS2') return s === '2' || s === '3' || s === 'LS2';
        return s === targetCode;
      });
      items.push(...matched);
    }

    // 2. Ambil dari db.data_rolls jika ada
    if (db.data_rolls) {
      const allRolls = await db.data_rolls.toArray();
      const matchedRolls = allRolls.filter(r => {
        const d = r.tanggalFormatted || r.tanggal;
        if (d !== targetDate) return false;
        const s = String(r.shift || '1').toUpperCase();
        if (targetCode === 'LS1') return s === '1' || s === 'LS1';
        if (targetCode === 'LS2') return s === '2' || s === '3' || s === 'LS2';
        return s === targetCode;
      });

      for (const r of matchedRolls) {
        if (!items.some(it => it.lot === r.lot && it.turunan === r.turunan)) {
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

  const apiKey = await getResolvedGeminiApiKey();
  if (!apiKey) {
    aiError[machineKey] = 'API Key Google AI / Gemini belum dikonfigurasi di Pengaturan.';
    return;
  }

  aiLoading[machineKey] = true;
  aiError[machineKey] = '';

  const summary = machineSummaries[machineKey] || emptyMachineSummary();

  const spkLines = summary.spkList.map(s => 
    `- SPK: ${s.spk} | Parent: ${s.parentCount} jumbo | FG: ${s.childCount} roll | Netto: ${s.netto} kg | Meter: ${s.meter} m | Pass: ${s.passPercent}% | Hold: ${s.hold} roll | Reject: ${s.reject} roll`
  ).join('\n') || '- Tidak ada SPK dikerjakan.';

  const rejectLines = summary.rejectBreakdown.map(r => 
    `- Alasan: ${r.reason} (${r.count} roll) | SPK: ${r.spks.join(', ')} | Lot: ${r.lots.join(', ')}`
  ).join('\n') || '- Tidak ada reject.';

  const holdLines = summary.holdBreakdown.map(h => 
    `- Alasan: ${h.reason} (${h.count} roll) | SPK: ${h.spks.join(', ')} | Lot: ${h.lots.join(', ')}`
  ).join('\n') || '- Tidak ada hold.';

  const prompt = `Anda adalah Asisten Supervisor AI Pabrik Manufaktur Plastik Film/Packaging (PT Sumber Waras Cemerlang).
Buat ringkasan serah terima (shift handover summary) yang tajam, profesional, dan actionable untuk:
- MESIN: ${machineKey}
- Shift Selesai: ${pShift.definition.name} (Grup ${pShift.group}), Tanggal Kerja: ${pShift.date}
- Shift Baru Masuk: ${uShift?.definition.name || 'Shift Berikutnya'} (Grup ${uShift?.group || '-'}), Tanggal: ${uShift?.date || pShift.date}

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
Gunakan format Markdown ringkas & padat dengan poin-poin terstruktur:
1. **Ringkasan Output & Pencapaian**: Evaluasi performa output mesin dan rasio kualitas.
2. **Sorotan Masalah & Defect**: Sebutkan defect/hold kritis yang terjadi pada SPK/lot tertentu dan potensi akar masalahnya.
3. **Instruksi Prioritas Shift Baru**: Instruksi operasional konkret untuk Grup ${uShift?.group || 'berikutnya'} saat mengoperasikan mesin ${machineKey} (misal: kalibrasi pisau, cek tension roll, follow-up lot hold).
Gunakan bahasa Indonesia baku pabrik industri yang lugas dan informatif.`;

  const modelCandidates = [
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-pro'
  ];

  let success = false;
  let lastErrMsg = '';

  for (const model of modelCandidates) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800
          }
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (generatedText) {
        const resultObj = {
          content: generatedText,
          model,
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
      lastErrMsg = err.message;
      console.warn(`Gemini handover attempt with model ${model} failed:`, err);
    }
  }

  aiLoading[machineKey] = false;
  if (!success) {
    aiError[machineKey] = lastErrMsg || 'Gagal menghubungi layanan Google Gemini AI.';
  }
};

const rosterForm = reactive({
  CASTING: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, note: '' },
  METALIZE: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, note: '' },
  SLITTING: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, note: '' },
  REWIND: { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, note: '' },
});

const getOperatorsForMachine = (machineName) => {
  const list = (configStore.operatorList || []).filter(o => o.active !== false);
  const byMachine = list.filter(o => o.mesin && o.mesin.toUpperCase() === machineName.toUpperCase());
  return byMachine.length > 0 ? byMachine : list;
};

// Inisialisasi roster penugasan untuk Shift Yang AKAN Bekerja (Upcoming Shift)
const initRosterFromSchedule = () => {
  const shift = upcomingShift.value;
  if (!shift) return;
  const scheduled = scheduleStore.getScheduledOperators(shift.date, shift.shiftCode, shift.group);

  for (const station of stations) {
    const m = station.machine;
    const scheduledOp = scheduled.roster[m];

    if (scheduleStore.confirmedRoster && scheduleStore.confirmedRoster[m]) {
      const existing = scheduleStore.confirmedRoster[m];
      rosterForm[m] = { ...existing };
    } else if (scheduledOp) {
      rosterForm[m] = {
        operatorId: scheduledOp.id,
        operator: scheduledOp.nama,
        kodeOperator: scheduledOp.kodeOperator,
        group: scheduledOp.kodeGrup,
        isSubstituted: false,
        note: ''
      };
    } else {
      const ops = getOperatorsForMachine(m);
      if (ops.length > 0) {
        rosterForm[m] = {
          operatorId: ops[0].id,
          operator: ops[0].nama,
          kodeOperator: ops[0].kodeOperator,
          group: ops[0].kodeGrup,
          isSubstituted: false,
          note: ''
        };
      } else {
        rosterForm[m] = { operatorId: '', operator: '', kodeOperator: '', group: '', isSubstituted: false, note: '' };
      }
    }
  }
};

watch(() => scheduleStore.showShiftHandoverModal, (newVal) => {
  if (newVal) {
    scheduleStore.tickLiveClock();
    currentStep.value = 1; // Selalu mulai dari Step 1 (Laporan Shift Sebelumnya)
    activeMachineTab.value = 'SLITTING'; // Mesin pertama slitting sesuai instruksi
    loadShiftSummary();
    initRosterFromSchedule();
  }
});

// Otomatis muat ulang data jika transisi shift terjadi saat modal sedang dibuka
watch(() => upcomingShift.value?.shiftCode, () => {
  if (scheduleStore.showShiftHandoverModal) {
    loadShiftSummary();
    initRosterFromSchedule();
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
  scheduleStore.confirmShiftHandover(rosterForm);
};

onMounted(() => {
  loadShiftSummary();
  initRosterFromSchedule();
});
</script>

