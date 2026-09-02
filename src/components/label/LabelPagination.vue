<template>
  <div class="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md p-3 sm:p-4 border-t border-zinc-200 shadow-md shadow-zinc-900/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
    <div class="flex items-center gap-2">
      <span class="text-zinc-500">Halaman</span>
      <span class="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded-md border border-zinc-200">{{ currentPage }}</span>
      <span class="text-zinc-500">dari <strong class="text-zinc-900">{{ totalPages || 1 }}</strong></span>
      <span class="text-zinc-300">•</span>
      <span class="text-zinc-500">Total <strong class="text-red-600">{{ totalItems }}</strong> label</span>
    </div>

    <div class="flex items-center gap-2">
      <!-- Rows Per Page Selector -->
      <div class="flex items-center gap-1.5 mr-2">
        <span class="text-[11px] text-zinc-400 font-semibold">Tampil:</span>
        <select
          :value="rowsPerPage"
          @change="$emit('update:rowsPerPage', Number($event.target.value))"
          class="px-2 py-1 text-xs border border-zinc-300 rounded-lg outline-none bg-white font-bold text-zinc-700 cursor-pointer"
        >
          <option :value="10">10 / hal</option>
          <option :value="25">25 / hal</option>
          <option :value="50">50 / hal</option>
          <option :value="100">100 / hal</option>
        </select>
      </div>

      <button
        :disabled="currentPage <= 1"
        @click="$emit('update:currentPage', currentPage - 1)"
        class="px-3 py-1.5 rounded-xl border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer"
      >
        ← Previous
      </button>
      <button
        :disabled="currentPage >= totalPages"
        @click="$emit('update:currentPage', currentPage + 1)"
        class="px-3 py-1.5 rounded-xl border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer"
      >
        Next →
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  currentPage: { type: Number, required: true },
  totalPages: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  rowsPerPage: { type: Number, default: 25 }
});

defineEmits(['update:currentPage', 'update:rowsPerPage']);
</script>
