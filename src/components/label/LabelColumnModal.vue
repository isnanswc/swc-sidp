<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in"
    @click="close"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 flex flex-col max-h-[90vh]"
      @click.stop
    >
      <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
        <div class="flex items-center gap-2">
          <span class="text-lg">⚙️</span>
          <div>
            <h3 class="text-base font-black text-zinc-900">Atur Kolom Tampilan Tabel</h3>
            <p class="text-[11px] text-zinc-500 font-medium">Centang kolom yang ingin ditampilkan pada layar</p>
          </div>
        </div>
        <button
          @click="close"
          class="text-zinc-400 hover:text-zinc-600 font-bold text-xl p-1"
        >
          ✕
        </button>
      </div>

      <div class="my-4 overflow-y-auto pr-1 flex-1">
        <div class="grid grid-cols-2 gap-2 text-xs">
          <label
            v-for="col in columnList"
            :key="col.key"
            class="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-200 hover:bg-zinc-50 cursor-pointer transition-colors"
          >
            <input
              type="checkbox"
              v-model="visibleColumns[col.key]"
              class="rounded w-4 h-4 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span class="font-bold text-zinc-800">{{ col.label }}</span>
          </label>
        </div>
      </div>

      <div class="flex items-center justify-between pt-3 border-t border-zinc-100">
        <div class="flex items-center gap-2">
          <button
            @click="toggleAllColumns(true)"
            class="text-[11px] font-bold text-blue-600 hover:underline"
          >
            Pilih Semua
          </button>
          <span class="text-zinc-300">•</span>
          <button
            @click="resetColumns"
            class="text-[11px] font-bold text-zinc-500 hover:underline"
          >
            Reset Default
          </button>
        </div>

        <div class="flex items-center gap-2">
          <button
            @click="saveColumnSettings"
            class="px-5 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-all"
          >
            💾 Simpan ke Database
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  columnList: { type: Array, required: true },
  visibleColumns: { type: Object, required: true }
});

const emit = defineEmits(['update:modelValue', 'save', 'reset', 'toggle-all']);

const close = () => {
  emit('update:modelValue', false);
};

const toggleAllColumns = (val) => {
  emit('toggle-all', val);
};

const resetColumns = () => {
  emit('reset');
};

const saveColumnSettings = () => {
  emit('save');
  close();
};
</script>
