<template>
  <div v-if="scheduleStore.showShiftHandoverModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden border border-zinc-200 flex flex-col max-h-[92vh]">
      
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
              <span>📅 Tanggal: <strong>{{ currentStep === 1 ? previousShift.date : upcomingShift.date }}</strong></span>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal Body (Step 1 vs Step 2) -->
      <div class="p-5 space-y-4 overflow-y-auto bg-zinc-50/50 flex-1">
        
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- STEP 1: PROGRESS DARI SHIFT SEBELUMNYA                        -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div v-if="currentStep === 1" class="space-y-4 animate-fade-in">
          <!-- Info Banner -->
          <div class="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl flex items-start gap-3">
            <span class="text-blue-600 text-lg shrink-0">ℹ️</span>
            <div class="text-xs text-blue-950 leading-relaxed">
              <p class="font-bold">Laporan Serah Terima dari Shift Sebelumnya</p>
              <p class="text-blue-800 text-[11px] mt-0.5">
                Berikut adalah rekapitulasi pekerjaan yang telah diselesaikan oleh <strong>Shift {{ previousShift.definition.shortName }} (Grup {{ previousShift.group }})</strong>. Periksa persentase kualitas, alasan defect, dan perhatian khusus pada SPK terkait sebelum shift Anda dimulai.
              </p>
            </div>
          </div>

          <!-- 1. Ringkasan Output Produksi -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Roll Output</div>
              <div class="text-xl font-black text-zinc-900 font-mono mt-1">
                {{ shiftSummary.totalRolls }} <span class="text-xs text-zinc-400 font-sans font-bold">Roll</span>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Netto Bersih</div>
              <div class="text-xl font-black text-emerald-600 font-mono mt-1">
                {{ formatNumber(shiftSummary.totalNetto) }} <span class="text-xs text-zinc-400 font-sans font-bold">kg</span>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Total Panjang</div>
              <div class="text-xl font-black text-blue-600 font-mono mt-1">
                {{ formatNumber(shiftSummary.totalMeter) }} <span class="text-xs text-zinc-400 font-sans font-bold">M</span>
              </div>
            </div>

            <div class="p-3.5 bg-white rounded-xl border border-zinc-200 shadow-2xs">
              <div class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">SPK Dikerjakan</div>
              <div class="text-xl font-black text-purple-600 font-mono mt-1">
                {{ shiftSummary.spkList.length }} <span class="text-xs text-zinc-400 font-sans font-bold">SPK</span>
              </div>
            </div>
          </div>

          <!-- 2. Persentase Kualitas: PASS, HOLD, REJECT -->
          <div class="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-3">
            <div class="flex items-center justify-between text-xs">
              <span class="font-black text-zinc-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🎯</span> Persentase Kualitas Shift Sebelumnya
              </span>
              <span class="text-[11px] font-mono font-bold text-zinc-500">
                Total Evaluasi: {{ shiftSummary.totalRolls }} Roll
              </span>
            </div>

            <!-- Segmented Progress Bar -->
            <div class="h-4 w-full bg-zinc-100 rounded-full overflow-hidden flex shadow-inner">
              <div 
                class="bg-emerald-500 transition-all duration-500" 
                :style="{ width: `${shiftSummary.passPercent}%` }"
                :title="`PASS: ${shiftSummary.passCount} roll (${shiftSummary.passPercent}%)`"
              ></div>
              <div 
                class="bg-amber-500 transition-all duration-500" 
                :style="{ width: `${shiftSummary.holdPercent}%` }"
                :title="`HOLD: ${shiftSummary.holdCount} roll (${shiftSummary.holdPercent}%)`"
              ></div>
              <div 
                class="bg-red-600 transition-all duration-500" 
                :style="{ width: `${shiftSummary.rejectPercent}%` }"
                :title="`REJECT: ${shiftSummary.rejectCount} roll (${shiftSummary.rejectPercent}%)`"
              ></div>
            </div>

            <!-- Quality Cards Breakdown -->
            <div class="grid grid-cols-3 gap-3 text-center text-xs">
              <div class="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                <div class="font-black text-emerald-800 flex items-center justify-center gap-1">
                  <span>✓</span> PASS
                </div>
                <div class="text-base font-black text-emerald-700 font-mono mt-0.5">
                  {{ shiftSummary.passPercent }}%
                </div>
                <div class="text-[10px] text-emerald-600 font-medium">
                  {{ shiftSummary.passCount }} Roll
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <div class="font-black text-amber-800 flex items-center justify-center gap-1">
                  <span>⚠️</span> HOLD
                </div>
                <div class="text-base font-black text-amber-700 font-mono mt-0.5">
                  {{ shiftSummary.holdPercent }}%
                </div>
                <div class="text-[10px] text-amber-600 font-medium">
                  {{ shiftSummary.holdCount }} Roll
                </div>
              </div>

              <div class="p-2.5 rounded-xl bg-red-50 border border-red-200">
                <div class="font-black text-red-800 flex items-center justify-center gap-1">
                  <span>✕</span> REJECT
                </div>
                <div class="text-base font-black text-red-700 font-mono mt-0.5">
                  {{ shiftSummary.rejectPercent }}%
                </div>
                <div class="text-[10px] text-red-600 font-medium">
                  {{ shiftSummary.rejectCount }} Roll
                </div>
              </div>
            </div>
          </div>

          <!-- 3. Analisis Defect: Terbanyak & Terakhir -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <!-- Defect Terbanyak -->
            <div class="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-2.5">
              <div class="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <span class="flex items-center gap-1.5"><span>📊</span> Defect Terbanyak (Top 3)</span>
                <span class="text-[10px] text-zinc-400 font-normal">Shift {{ previousShift.definition.shortName }}</span>
              </div>

              <div v-if="shiftSummary.topDefects.length > 0" class="space-y-1.5">
                <div 
                  v-for="(def, dIdx) in shiftSummary.topDefects" 
                  :key="def.name"
                  class="flex items-center justify-between p-2 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                >
                  <div class="flex items-center gap-2">
                    <span class="w-4 h-4 rounded-full bg-zinc-200 text-zinc-700 text-[10px] font-black flex items-center justify-center">
                      {{ dIdx + 1 }}
                    </span>
                    <span class="font-bold text-zinc-800 truncate max-w-[160px]">{{ def.name }}</span>
                  </div>
                  <span class="font-mono font-black text-red-600 bg-red-50 px-2 py-0.5 rounded text-[11px] border border-red-100 shrink-0">
                    {{ def.count }} roll
                  </span>
                </div>
              </div>
              <div v-else class="text-center py-4 text-xs text-emerald-600 font-bold bg-emerald-50/50 rounded-lg border border-emerald-100">
                🎉 Tidak ada defect tercatat pada shift ini!
              </div>
            </div>

            <!-- Defect Terakhir -->
            <div class="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-2.5">
              <div class="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
                <span class="flex items-center gap-1.5"><span>⏱️</span> Defect Terakhir Terjadi</span>
                <span class="text-[10px] text-zinc-400 font-normal">Roll Terbaru</span>
              </div>

              <div v-if="shiftSummary.latestDefect" class="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 text-xs space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-black text-amber-900 truncate max-w-[170px]">{{ shiftSummary.latestDefect.reason }}</span>
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-black" :class="shiftSummary.latestDefect.status === 'REJECT' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'">
                    {{ shiftSummary.latestDefect.status }}
                  </span>
                </div>
                <div class="text-[11px] text-zinc-600 font-mono">
                  Lot: <strong class="text-zinc-900">{{ shiftSummary.latestDefect.lot }}</strong>
                  <span v-if="shiftSummary.latestDefect.turunan" class="text-zinc-500 ml-1">/ {{ shiftSummary.latestDefect.turunan }}</span>
                </div>
                <div class="text-[10px] text-zinc-500">
                  SPK: <strong class="text-zinc-700">{{ shiftSummary.latestDefect.spk || '—' }}</strong> • Mesin: {{ shiftSummary.latestDefect.mesin }}
                </div>
              </div>
              <div v-else class="text-center py-4 text-xs text-emerald-600 font-bold bg-emerald-50/50 rounded-lg border border-emerald-100">
                ✓ Bersih dari cacat di akhir shift.
              </div>
            </div>
          </div>

          <!-- 4. SPK DENGAN PERHATIAN KHUSUS (KARENA REJECT ATAU HOLD) -->
          <div class="p-4 bg-white rounded-xl border border-zinc-200 shadow-2xs space-y-3">
            <div class="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center justify-between border-b border-zinc-100 pb-1.5">
              <span class="flex items-center gap-1.5 text-rose-700">
                <span>⚠️</span> SPK dengan Perhatian Khusus (Ada Reject / Hold)
              </span>
              <span class="text-[10px] text-zinc-500 font-mono">Wajib Diwaspadai Shift Baru</span>
            </div>

            <div v-if="shiftSummary.attentionSpks.length > 0" class="space-y-2">
              <div 
                v-for="spk in shiftSummary.attentionSpks" 
                :key="spk.spk"
                class="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs space-y-1.5"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-mono font-black text-rose-950 text-sm">{{ spk.spk }}</span>
                    <span v-if="spk.jenis" class="text-[10px] px-1.5 py-0.5 rounded bg-white text-zinc-700 font-bold border border-rose-200">
                      {{ spk.jenis }} {{ spk.thickness ? spk.thickness + 'MC' : '' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5">
                    <span v-if="spk.reject > 0" class="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[10px]">
                      {{ spk.reject }} REJECT
                    </span>
                    <span v-if="spk.hold > 0" class="px-2 py-0.5 rounded bg-amber-500 text-white font-black text-[10px]">
                      {{ spk.hold }} HOLD
                    </span>
                  </div>
                </div>

                <div class="text-[11px] text-rose-900">
                  <strong>Penyebab Cacat:</strong> {{ spk.defectList.join(', ') || 'Cacat produksi/hold QC' }}
                </div>

                <div class="p-2 rounded-lg bg-white/80 border border-rose-200 text-[10.5px] text-rose-800 leading-snug">
                  📌 <strong>Pesan untuk Shift Berikutnya:</strong> Harap cek kembali pengaturan mesin (tension, pisau, suhu, dan roll guide) sebelum memotong sisa lot pada SPK ini.
                </div>
              </div>
            </div>

            <div v-else class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
              <span class="text-base">✅</span>
              <div>
                <strong>Seluruh SPK Berjalan Normal!</strong> Tidak ada SPK yang mengalami status Reject atau Hold pada shift sebelumnya.
              </div>
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
import { db } from '@/db';

const scheduleStore = useScheduleStore();
const configStore = useConfigStore();

// Step State: 1 = Laporan Shift Sebelumnya, 2 = Briefing Shift Selanjutnya
const currentStep = ref(1);

const stations = [
  { machine: 'CASTING', icon: '🏭' },
  { machine: 'METALIZE', icon: '✨' },
  { machine: 'SLITTING', icon: '✂️' },
  { machine: 'REWIND', icon: '🔄' },
];

// Pasangan Shift Serah Terima (Handover):
// previousShift: Shift yang telah bekerja / baru saja selesai
// upcomingShift: Shift yang AKAN bekerja / bertugas berikutnya
const handoverShifts = computed(() => scheduleStore.currentHandoverShifts);
const previousShift = computed(() => handoverShifts.value?.previousShift);
const upcomingShift = computed(() => handoverShifts.value?.upcomingShift);

// Summary Data Shift Sebelumnya
const shiftSummary = reactive({
  totalRolls: 0,
  totalNetto: 0,
  totalMeter: 0,
  passCount: 0,
  holdCount: 0,
  rejectCount: 0,
  passPercent: 0,
  holdPercent: 0,
  rejectPercent: 0,
  topDefects: [],
  latestDefect: null,
  spkList: [],
  attentionSpks: []
});

const formatNumber = (val) => {
  if (!val) return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
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

  // Hitung metrik ringkasan
  const total = items.length;
  let netto = 0;
  let meter = 0;
  let pass = 0;
  let hold = 0;
  let reject = 0;
  const defectCounts = {};
  let lastDefect = null;
  const spkMap = {};

  items.forEach(i => {
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

    // SPK tracking
    const spkName = (i.spk || 'Tanpa SPK').trim().toUpperCase();
    if (!spkMap[spkName]) {
      spkMap[spkName] = {
        spk: spkName,
        total: 0,
        pass: 0,
        hold: 0,
        reject: 0,
        defects: new Set(),
        jenis: i.jenis || '',
        thickness: i.thickness || ''
      };
    }
    spkMap[spkName].total++;
    if (st === 'PASS' || st === 'OK') spkMap[spkName].pass++;
    else if (st === 'HOLD') spkMap[spkName].hold++;
    else if (st === 'REJECT') spkMap[spkName].reject++;

    // Defect tracking
    const reason = (i.reasonDefect || i.keterangan || '').trim();
    if (st === 'HOLD' || st === 'REJECT' || (reason && !reason.toUpperCase().includes('PASS'))) {
      const defName = reason || (st === 'HOLD' ? 'HOLD QC' : 'REJECT PRODUKSI');
      defectCounts[defName] = (defectCounts[defName] || 0) + 1;
      spkMap[spkName].defects.add(defName);
      lastDefect = {
        reason: defName,
        status: st,
        lot: i.lot || '—',
        turunan: i.turunan || '',
        spk: i.spk || '',
        mesin: i.mesin || i.machineName || 'SLITTING'
      };
    }
  });

  shiftSummary.totalRolls = total;
  shiftSummary.totalNetto = Math.round(netto * 100) / 100;
  shiftSummary.totalMeter = Math.round(meter);
  shiftSummary.passCount = pass;
  shiftSummary.holdCount = hold;
  shiftSummary.rejectCount = reject;
  shiftSummary.passPercent = total > 0 ? Math.round((pass / total) * 100) : 0;
  shiftSummary.holdPercent = total > 0 ? Math.round((hold / total) * 100) : 0;
  shiftSummary.rejectPercent = total > 0 ? Math.round((reject / total) * 100) : 0;

  shiftSummary.topDefects = Object.entries(defectCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 3);

  shiftSummary.latestDefect = lastDefect;
  shiftSummary.spkList = Object.keys(spkMap);

  shiftSummary.attentionSpks = Object.values(spkMap)
    .filter(s => s.hold > 0 || s.reject > 0)
    .map(s => ({ ...s, defectList: Array.from(s.defects) }));
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
