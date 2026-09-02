<template>
  <div
    v-if="modelValue"
    class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-zinc-950/50 backdrop-blur-xs animate-fade-in"
    @click="close"
  >
    <div
      class="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] p-4 border border-zinc-200 space-y-3"
      @click.stop
    >
      <!-- Header: Dense Info & Badges -->
      <div class="pb-2.5 border-b border-zinc-100">
        <div class="flex items-center justify-between gap-1.5 mb-1">
          <div class="flex items-center gap-1.5 overflow-hidden">
            <span class="text-[11px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md font-mono shadow-xs">
              #{{ item?.id }}
            </span>
            <span class="text-[11px] font-bold text-zinc-700 font-mono truncate" :title="item?.uniqId">
              {{ item?.uniqId }}
            </span>
          </div>
          
          <span :class="[
            'text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0',
            item?.status === 'PASS' || item?.status === 'OK' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
            item?.status === 'HOLD' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
          ]">
            {{ item?.status }}
          </span>
        </div>

        <!-- Lot, Turunan, SPK -->
        <div class="flex items-center justify-between text-xs font-bold text-zinc-900 mt-1">
          <div class="truncate font-mono">
            <span class="text-zinc-900 uppercase">{{ item?.lot }}</span>
            <span v-if="item?.turunan" class="text-zinc-400 font-bold">/</span>
            <span v-if="item?.turunan" class="text-red-600 uppercase">{{ item?.turunan }}</span>
          </div>
          <span class="text-[10px] text-zinc-400 font-mono">SPK: {{ item?.spk }}</span>
        </div>

        <!-- Dimensi & Mesin -->
        <p class="text-[11px] text-zinc-500 font-medium mt-0.5 truncate">
          {{ item?.jenis }} {{ item?.thickness }}MC × {{ item?.width }}MM • {{ item?.mesin }}
        </p>
      </div>

      <!-- 4 Action Buttons -->
      <div class="space-y-1.5">
        <!-- 1. Preview & Cetak -->
        <button
          @click="handleAction('preview')"
          class="w-full px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-zinc-900 border border-zinc-200/80 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-zinc-200 group-hover:bg-zinc-800 flex items-center justify-center text-zinc-700 group-hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="leading-tight">Pratinjau & Cetak</p>
              <p class="text-[10px] text-zinc-400 group-hover:text-zinc-300 font-normal">Tampilkan label 1 lembar</p>
            </div>
          </div>
          <span class="text-zinc-400 group-hover:text-white text-sm">→</span>
        </button>

        <!-- 2. Edit Data -->
        <button
          @click="handleAction('edit')"
          class="w-full px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-red-600 border border-zinc-200/80 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-red-100 group-hover:bg-red-700 flex items-center justify-center text-red-600 group-hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="leading-tight">Edit Data Roll</p>
              <p class="text-[10px] text-zinc-400 group-hover:text-red-100 font-normal">Ubah detail dimensi/lot</p>
            </div>
          </div>
          <span class="text-zinc-400 group-hover:text-white text-sm">→</span>
        </button>

        <!-- 3. Duplikat Data -->
        <button
          @click="handleAction('duplicate')"
          class="w-full px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-zinc-800 border border-zinc-200/80 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-zinc-200 group-hover:bg-zinc-700 flex items-center justify-center text-zinc-700 group-hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <div class="text-left">
              <p class="leading-tight">Duplikat Data</p>
              <p class="text-[10px] text-zinc-400 group-hover:text-zinc-300 font-normal">Gandakan ke ID baru</p>
            </div>
          </div>
          <span class="text-zinc-400 group-hover:text-white text-sm">→</span>
        </button>

        <!-- 4. Hapus Data -->
        <button
          @click="handleAction('delete')"
          class="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:text-white bg-red-50/70 hover:bg-red-600 border border-red-200 transition-all flex items-center justify-between group shadow-xs cursor-pointer"
        >
          <div class="flex items-center gap-2.5">
            <div class="w-7 h-7 rounded-lg bg-red-200 group-hover:bg-red-700 flex items-center justify-center text-red-700 group-hover:text-white transition-colors">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <div class="text-left">
              <p class="leading-tight">Hapus Data</p>
              <p class="text-[10px] text-red-400 group-hover:text-red-100 font-normal">Hapus permanen roll ini</p>
            </div>
          </div>
          <span class="text-red-400 group-hover:text-white text-sm">✕</span>
        </button>
      </div>

      <!-- Close / Cancel Button -->
      <div class="pt-1">
        <button
          @click="close"
          class="w-full py-1.5 rounded-xl text-[11px] font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  item: { type: Object, default: null }
});

const emit = defineEmits(['update:modelValue', 'action']);

const close = () => {
  emit('update:modelValue', false);
};

const handleAction = (type) => {
  emit('action', { type, item: props.item });
  close();
};
</script>
