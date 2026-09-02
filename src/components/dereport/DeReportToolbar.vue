<template>
  <div class="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3 select-none font-sans">
    <div class="flex items-center gap-3">
      <!-- Vector Logo Badge -->
      <div class="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-sm border border-zinc-800 shrink-0">
        <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <line x1="3" y1="9" x2="21" y2="9" />
          <line x1="3" y1="15" x2="21" y2="15" />
          <line x1="9" y1="3" x2="9" y2="21" />
          <line x1="15" y1="3" x2="15" y2="21" />
        </svg>
      </div>

      <div>
        <div class="flex items-center gap-2">
          <h1 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight">DE REPORT SLITTING</h1>
          <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-50 text-red-600 border border-red-200">
            Verifikasi Khusus Mesin Slitting
          </span>
        </div>
        <p class="text-xs text-zinc-500 font-medium mt-0.5">
          Pola data slitting: Parent tunggal (No Lot/Panjang/Berat), Lebar Parent per child, Core 6", Packing akhir, Keterangan Bahan/Hasil & Waste kg
        </p>
      </div>
    </div>

    <!-- EXCEL SHEET TABS -->
    <div class="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 gap-1 text-xs">
      <!-- Tab 1: Dashboard -->
      <button
        @click="$emit('update:activeTab', 'dashboard')"
        :class="[
          'px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer',
          activeTab === 'dashboard'
            ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
        ]"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 20V10M12 20V4M6 20v-6" />
        </svg>
        <span>1. Dashboard</span>
      </button>

      <!-- Tab 2: Verifikasi Slitting -->
      <button
        @click="$emit('update:activeTab', 'verifikasi')"
        :class="[
          'px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 relative cursor-pointer',
          activeTab === 'verifikasi'
            ? 'bg-red-600 text-white shadow-xs shadow-red-600/30'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
        ]"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
        </svg>
        <span>2. Verifikasi Slitting</span>
        <span
          v-if="unverifiedCount > 0"
          :class="[
            'px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono',
            activeTab === 'verifikasi' ? 'bg-white text-red-600' : 'bg-red-500 text-white'
          ]"
        >
          {{ unverifiedCount }}
        </span>
      </button>

      <!-- Tab 3: Tabel Report -->
      <button
        @click="$emit('update:activeTab', 'report')"
        :class="[
          'px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer',
          activeTab === 'report'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
        ]"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
        <span>3. Tabel Report</span>
        <span
          v-if="verifiedCount > 0"
          class="px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono bg-zinc-700 text-white"
        >
          {{ verifiedCount }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  activeTab: { type: String, default: 'verifikasi' },
  unverifiedCount: { type: Number, default: 0 },
  verifiedCount: { type: Number, default: 0 }
});

defineEmits(['update:activeTab']);
</script>
