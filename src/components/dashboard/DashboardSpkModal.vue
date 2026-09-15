<template>
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
        v-if="modelValue && spk"
        class="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none font-sans"
        @click.self="close"
      >
        <div class="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <!-- Modal Header -->
          <div class="p-4 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 text-white flex items-center justify-between">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase font-mono bg-red-600 text-white">
                  DETAIL SPK
                </span>
                <h3 class="text-sm sm:text-base font-black font-mono tracking-tight">{{ spk.spkNo }}</h3>
              </div>
              <p class="text-[11px] text-zinc-400 mt-0.5 font-mono">
                Formula: {{ spk.formula }} ({{ spk.thickness }}μ) • Dokumen: {{ spk.docNo || '3B-PROD' }}
              </p>
            </div>

            <button
              @click="close"
              class="w-7 h-7 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Modal Body: 2 Columns (Planning vs Realisasi) -->
          <div class="p-4 space-y-3">
            <!-- Status Target & Waktu Pengerjaan -->
            <div
              v-if="spk.targetStatus"
              class="p-2.5 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono font-bold"
              :class="[spk.targetStatus.badgeClass, spk.targetStatus.borderClass]"
            >
              <div class="flex items-center gap-1.5">
                <span class="text-base">{{ spk.targetStatus.icon }}</span>
                <span>Status: {{ spk.targetStatus.label }}</span>
              </div>
              <div class="text-[11px] font-normal flex items-center gap-3">
                <span>🕒 Mulai: <strong class="font-bold">{{ spk.startTimeFormatted || '-' }}</strong></span>
                <span>🏁 Selesai: <strong class="font-bold">{{ spk.endTimeFormatted || '-' }}</strong></span>
              </div>
            </div>

            <!-- Status & Achievement Bar -->
            <div class="p-3 rounded-2xl bg-zinc-50 border border-zinc-200/80">
              <div class="flex items-center justify-between text-xs font-mono mb-1.5">
                <span class="font-bold text-zinc-600">Pencapaian SPK:</span>
                <span :class="[
                  'font-black px-2 py-0.5 rounded text-[10.5px]',
                  spk.status === 'DONE' ? 'bg-emerald-100 text-emerald-800' :
                  spk.status === 'RUNNING' ? 'bg-blue-100 text-blue-800' : 'bg-zinc-200 text-zinc-700'
                ]">
                  {{ spk.percent }}% ({{ spk.status }})
                </span>
              </div>
              <div class="w-full bg-zinc-200 h-2 rounded-full overflow-hidden">
                <div
                  :class="[
                    'h-full rounded-full transition-all duration-500',
                    spk.status === 'DONE' ? 'bg-emerald-500' : 'bg-blue-600'
                  ]"
                  :style="{ width: `${spk.percent}%` }"
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
                    <strong class="text-zinc-900">{{ formatNum(spk.planRoll) }} Roll</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-zinc-500">Target Meter:</span>
                    <strong class="text-zinc-900">{{ formatNum(spk.planMeter) }} m</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-zinc-500">Jumbo Roll:</span>
                    <strong class="text-zinc-900">{{ spk.planJumbo }} JR</strong>
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
                    <strong class="text-emerald-800 font-black">{{ formatNum(spk.actualRoll) }} Roll</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-zinc-500">Meter Aktual:</span>
                    <strong class="text-zinc-900">{{ formatNum(spk.actualMeter) }} m</strong>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-zinc-500">Berat Aktual:</span>
                    <strong class="text-zinc-900">{{ formatNum(spk.actualKg) }} kg</strong>
                  </div>
                </div>
              </div>
            </div>

            <!-- QC Mutu Rincian -->
            <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-[11px] font-mono">
              <span class="text-zinc-500 font-bold">Kualitas Hasil (QC):</span>
              <div class="flex items-center gap-2 font-bold">
                <span class="text-emerald-700">{{ spk.passCount }} Pass</span>
                <span>•</span>
                <span class="text-amber-700">{{ spk.holdCount }} Hold</span>
                <span>•</span>
                <span class="text-red-700">{{ spk.rejectCount }} Rej</span>
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
              @click="close"
              class="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-black text-white font-mono font-bold text-xs cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  spk: { type: Object, default: null },
  formatNum: { type: Function, default: (val) => val ?? 0 }
});

const emit = defineEmits(['update:modelValue']);

const close = () => {
  emit('update:modelValue', false);
};
</script>
