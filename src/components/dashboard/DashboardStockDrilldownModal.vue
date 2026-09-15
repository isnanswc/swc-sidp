<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 select-none font-sans"
        @click.self="close"
      >
        <div class="bg-white border border-zinc-200 rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          <!-- Modal Header -->
          <div class="p-4 sm:p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/70">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-lg bg-red-600 text-white font-mono font-black text-xs">
                  {{ selectedStockCategory?.key || 'DETAIL STOK' }}
                </span>
                <h2 class="text-base sm:text-lg font-black text-zinc-950">
                  DETAIL STOK IMS BERDASARKAN DESKRIPSI NAV
                </h2>
              </div>
              <p class="text-xs text-zinc-500 font-medium mt-0.5">
                Dikelompokkan otomatis berdasarkan spesifikasi resmi Deskripsi NAV dari sesi aktif menu Stok Gudang (IMS).
              </p>
            </div>

            <button
              @click="close"
              class="w-8 h-8 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 flex items-center justify-center font-black transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <!-- Modal Search Bar -->
          <div class="p-3.5 border-b border-zinc-100 bg-white flex items-center justify-between gap-3">
            <div class="relative flex-1">
              <span class="absolute left-3 top-2.5 text-zinc-400 text-xs">🔍</span>
              <input
                :value="searchQuery"
                @input="$emit('update:searchQuery', $event.target.value)"
                type="text"
                placeholder="Cari deskripsi NAV, formula, source no, rak penyimpanan..."
                class="w-full pl-8 pr-4 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 text-xs font-mono focus:outline-none focus:border-red-500"
              />
            </div>
          </div>

          <!-- Modal Table -->
          <div class="p-4 overflow-y-auto max-h-[58vh] space-y-3">
            <div
              v-for="group in groupedNavItems"
              :key="group.descNav"
              class="border border-zinc-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
            >
              <div class="p-2.5 bg-zinc-50 border-b border-zinc-200/80 flex items-center justify-between">
                <span class="font-black text-xs font-mono text-zinc-900">{{ group.descNav }}</span>
                <span class="font-bold text-xs font-mono text-emerald-800">{{ formatNum(group.totalRolls) }} Roll • {{ formatNum(group.totalKg) }} kg</span>
              </div>
              <table class="w-full text-left text-[11px] font-mono">
                <thead class="bg-zinc-100/50 text-[9.5px] text-zinc-500 uppercase">
                  <tr>
                    <th class="p-2">Tipe</th>
                    <th class="p-2">Source / Roll No</th>
                    <th class="p-2">Dimensi</th>
                    <th class="p-2 text-right">Kuantitas Roll</th>
                    <th class="p-2 text-right">Panjang (m)</th>
                    <th class="p-2 text-right">Berat (kg)</th>
                    <th class="p-2">Lokasi Rak</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <tr v-for="it in group.items" :key="it.id" class="hover:bg-zinc-50">
                    <td class="p-2">
                      <span :class="['px-1.5 py-0.2 rounded text-[9px] font-bold', it.stockType === 'FG' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800']">
                        {{ it.stockType === 'FG' ? 'FG IMS' : 'JUMBO WIP' }}
                      </span>
                    </td>
                    <td class="p-2 font-bold text-zinc-900">{{ it.sourceNo }}</td>
                    <td class="p-2">{{ it.thick }}μ × {{ it.width }} mm</td>
                    <td class="p-2 text-right font-black">{{ formatNum(it.totalRoll) }}</td>
                    <td class="p-2 text-right">{{ formatNum(it.totalPanjang) }}</td>
                    <td class="p-2 text-right font-bold text-red-600">{{ formatNum(it.totalKg) }}</td>
                    <td class="p-2">{{ it.listRak || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="p-3.5 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
            <span class="text-[11px] text-zinc-400 font-mono">PT. Saptawarna Cemerlang — Inventory Control</span>
            <button
              @click="close"
              class="px-4 py-1.5 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white font-mono font-bold text-xs cursor-pointer"
            >
              Tutup Jendela
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
  selectedStockCategory: { type: Object, default: null },
  groupedNavItems: { type: Array, default: () => [] },
  searchQuery: { type: String, default: '' },
  formatNum: { type: Function, default: (val) => val ?? 0 }
});

const emit = defineEmits(['update:modelValue', 'update:searchQuery']);

const close = () => {
  emit('update:modelValue', false);
};
</script>
