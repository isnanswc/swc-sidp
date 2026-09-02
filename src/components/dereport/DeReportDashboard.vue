<template>
  <div class="space-y-4 animate-fade-in">
    <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
      <!-- Card 1: Perlu Verifikasi -->
      <div class="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Perlu Verifikasi</p>
          <h3 class="text-xl font-black text-amber-900 font-mono">{{ unverifiedCount }} Roll</h3>
        </div>
      </div>

      <!-- Card 2: Sudah Terverifikasi -->
      <div class="p-4 rounded-2xl bg-white border border-emerald-200/80 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Terverifikasi</p>
          <h3 class="text-xl font-black text-emerald-900 font-mono">{{ verifiedCount }} Roll</h3>
        </div>
      </div>

      <!-- Card 3: HOLD / QC Issue -->
      <div class="p-4 rounded-2xl bg-white border border-amber-200 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">HOLD / REJECT Defect</p>
          <h3 class="text-xl font-black text-amber-900 font-mono">
            {{ defectCount }} Roll
          </h3>
        </div>
      </div>

      <!-- Card 4: Total Waste Shift -->
      <div class="p-4 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-800 flex items-center justify-center shrink-0">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </div>
        <div>
          <p class="text-[11px] text-zinc-500 font-bold uppercase tracking-wider">Waste Shift (kg)</p>
          <h3 class="text-xl font-black text-zinc-900 font-mono">
            {{ totalWaste.toFixed(1) }} kg
          </h3>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl border border-zinc-200 p-8 text-center text-zinc-400 space-y-2">
      <div class="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-2">
        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <line x1="20" y1="4" x2="8.12" y2="15.88" />
          <line x1="14.47" y1="14.48" x2="20" y2="20" />
        </svg>
      </div>
      <h3 class="text-sm font-black text-zinc-800">Verifikasi Mesin Slitting</h3>
      <p class="text-xs text-zinc-400 max-w-md mx-auto">
        Format tabel disesuaikan khusus untuk alur produksi Mesin Slitting. Data induk (Lot/Panjang/Berat) tampil 1x di baris pertama parent dan lebar induk mengikuti seluruh child.
      </p>
      <div class="flex items-center justify-center gap-2 pt-2">
        <button
          @click="$emit('switch-tab', 'verifikasi')"
          class="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>Buka Sheet Verifikasi</span>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <button
          @click="$emit('open-import')"
          class="px-4 py-2 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-white shadow-sm transition-all inline-flex items-center gap-1.5 cursor-pointer"
        >
          <span>📥 Import / Paste Slitting</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  unverifiedCount: { type: Number, default: 0 },
  verifiedCount: { type: Number, default: 0 },
  defectCount: { type: Number, default: 0 },
  totalWaste: { type: Number, default: 0 }
});

defineEmits(['switch-tab', 'open-import']);
</script>
