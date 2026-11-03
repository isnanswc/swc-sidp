<template>
  <div class="space-y-4">
    <!-- PAGE HEADER -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200">
      <div>
        <div class="flex items-center gap-2">
          <span class="text-xl">🏷️</span>
          <h1 class="text-lg sm:text-xl font-extrabold text-zinc-900 tracking-tight">
            Manajemen Label Export
          </h1>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-200 uppercase">
            Trivesta
          </span>
        </div>
        <p class="text-xs text-zinc-500 mt-0.5">
          Sistem label mandiri standar ekspor Trivesta Packaging (3 stiker/roll, 6 stiker/lembar) dengan penarikan Code Pack.
        </p>
      </div>

      <!-- Quick KPI Stats Counter -->
      <div class="flex items-center gap-2">
        <div class="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs text-right">
          <div class="text-[9.5px] font-bold text-zinc-400 uppercase">Total Data Roll</div>
          <div class="text-sm font-black text-blue-900">{{ store.totalRolls }} <span class="text-[10px] font-normal text-zinc-500">Roll</span></div>
        </div>
        <div class="px-3 py-1.5 rounded-xl bg-white border border-zinc-200 shadow-2xs text-right">
          <div class="text-[9.5px] font-bold text-zinc-400 uppercase">Total Netto</div>
          <div class="text-sm font-black text-emerald-900">{{ store.totalNettoKg }} <span class="text-[10px] font-normal text-zinc-500">KG</span></div>
        </div>
      </div>
    </div>

    <!-- TOOLBAR CONTROLS -->
    <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
      <!-- Search & Filters (Left) -->
      <div class="flex flex-1 flex-wrap items-center gap-2">
        <!-- Search Input -->
        <div class="relative flex-1 min-w-[200px] max-w-md">
          <span class="absolute left-2.5 top-2 text-zinc-400 text-xs">🔍</span>
          <input
            v-model="store.searchQuery"
            placeholder="Cari Code Pack, Nomor OK, Type, KF..."
            class="w-full pl-7 pr-3 py-1.5 text-xs rounded-xl border border-zinc-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none bg-zinc-50 focus:bg-white transition-all shadow-2xs font-medium"
          />
          <button
            v-if="store.searchQuery"
            @click="store.searchQuery = ''"
            class="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>

        <!-- Filter Jenis Film -->
        <div class="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            @click="store.filterJenis = 'ALL'"
            :class="[
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
              store.filterJenis === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-900'
            ]"
          >
            Semua
          </button>
          <button
            @click="store.filterJenis = 'VMCPP'"
            :class="[
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
              store.filterJenis === 'VMCPP' ? 'bg-white text-blue-700 shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-900'
            ]"
          >
            VMCPP (MET)
          </button>
          <button
            @click="store.filterJenis = 'CPP'"
            :class="[
              'px-2.5 py-1 rounded-lg transition-all cursor-pointer',
              store.filterJenis === 'CPP' ? 'bg-white text-emerald-700 shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-900'
            ]"
          >
            CPP (CLEAR)
          </button>
        </div>
      </div>

      <!-- Action Buttons (Right) -->
      <div class="flex items-center gap-2 flex-wrap">
        <!-- Cetak Terpilih (Batch Print) -->
        <button
          v-if="store.selectedIds.length > 0"
          @click="handlePrintSelected"
          class="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer transition-all animate-fade-in"
        >
          <span>🖨️ Cetak Terpilih ({{ store.selectedIds.length }})</span>
        </button>

        <!-- Hapus Terpilih -->
        <button
          v-if="store.selectedIds.length > 0"
          @click="handleDeleteSelected"
          class="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-bold cursor-pointer transition-all animate-fade-in"
        >
          <span>🗑️ Hapus ({{ store.selectedIds.length }})</span>
        </button>

        <!-- Cloud Sync Button -->
        <button
          @click="handleManualSync"
          :disabled="isSyncing"
          class="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-60 text-zinc-700 rounded-xl text-xs font-bold border border-zinc-300 flex items-center gap-1.5 cursor-pointer transition-all"
          title="Sinkronkan data label export dengan cloud database"
        >
          <span :class="['w-2 h-2 rounded-full', isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500']"></span>
          <span>{{ isSyncing ? 'Sinkron...' : 'Sync Cloud' }}</span>
        </button>

        <!-- Export Excel -->
        <button
          @click="handleExportExcel"
          :disabled="store.items.length === 0"
          class="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-50 text-zinc-700 rounded-xl text-xs font-bold border border-zinc-300 flex items-center gap-1 cursor-pointer transition-all"
          title="Unduh rekap excel data label export"
        >
          <span>📊 Excel</span>
        </button>

        <!-- Tambah Label Export -->
        <button
          @click="store.openCreateModal"
          class="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md shadow-blue-600/25 flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <span>➕ Tambah Label Export</span>
        </button>
      </div>
    </div>

    <!-- DATA TABLE CONTAINER -->
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
      <!-- Loading Skeleton / Indicator -->
      <div v-if="store.loading" class="p-8 text-center text-zinc-400 text-xs">
        <span class="animate-spin inline-block mr-2">⏳</span> Memuat data label export...
      </div>

      <!-- Empty State -->
      <div v-else-if="store.filteredItems.length === 0" class="p-12 text-center space-y-3">
        <div class="text-4xl">🏷️</div>
        <div class="text-sm font-bold text-zinc-800">Belum Ada Data Label Export</div>
        <p class="text-xs text-zinc-500 max-w-md mx-auto">
          {{ store.searchQuery ? 'Tidak ada label yang cocok dengan pencarian.' : 'Klik tombol Tambah Label Export untuk membuat stiker label baru atau salin dari Code Pack label biasa.' }}
        </p>
        <button
          v-if="!store.searchQuery"
          @click="store.openCreateModal"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 cursor-pointer"
        >
          ➕ Buat Label Pertama
        </button>
      </div>

      <!-- Table View -->
      <div v-else class="overflow-x-auto custom-scrollbar">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-zinc-50/80 text-zinc-600 border-b border-zinc-200 text-[11px] uppercase tracking-wider font-extrabold select-none">
              <!-- Select All Checkbox -->
              <th class="p-3 w-10 text-center">
                <input
                  type="checkbox"
                  :checked="store.selectedIds.length > 0 && store.selectedIds.length === store.filteredItems.length"
                  :indeterminate="store.selectedIds.length > 0 && store.selectedIds.length < store.filteredItems.length"
                  @change="store.selectAllFiltered"
                  class="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </th>
              <th class="p-3">Code Pack (Roll ID)</th>
              <th class="p-3">Nomor OK (Order Kerja)</th>
              <th class="p-3">Jenis Film & Judul</th>
              <th class="p-3">Type (KF)</th>
              <th class="p-3">Ukuran (Thick × W × L)</th>
              <th class="p-3 text-center">Treatment</th>
              <th class="p-3 text-right">Netto (kg)</th>
              <th class="p-3 text-right">Core (kg)</th>
              <th class="p-3 text-center">Join (m)</th>
              <th class="p-3 text-center w-28">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr
              v-for="item in store.filteredItems"
              :key="item.id"
              :class="[
                'hover:bg-blue-50/40 transition-colors',
                store.selectedIds.includes(item.id) ? 'bg-blue-50/70' : ''
              ]"
            >
              <!-- Checkbox -->
              <td class="p-3 text-center">
                <input
                  type="checkbox"
                  :checked="store.selectedIds.includes(item.id)"
                  @change="store.toggleSelect(item.id)"
                  class="rounded text-blue-600 cursor-pointer w-3.5 h-3.5"
                />
              </td>

              <!-- Code Pack / Roll ID -->
              <td class="p-3 font-mono font-bold text-blue-950">
                <div class="flex items-center gap-1.5">
                  <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                  <span>{{ item.codePack }}</span>
                </div>
              </td>

              <!-- Nomor OK -->
              <td class="p-3 font-mono font-semibold text-zinc-800">
                {{ item.nomorOk || '-' }}
              </td>

              <!-- Jenis Film & Judul -->
              <td class="p-3">
                <div class="font-bold text-zinc-900">{{ item.jenisDisplay }}</div>
                <div class="text-[10px] text-zinc-400 font-mono">{{ item.jenis }}</div>
              </td>

              <!-- Type (KF) -->
              <td class="p-3">
                <span class="px-2 py-0.5 rounded font-mono font-bold text-purple-900 bg-purple-50 border border-purple-200">
                  {{ item.type }}
                </span>
              </td>

              <!-- Dimensi (Thick x Width x Length) -->
              <td class="p-3 font-mono">
                <span class="font-bold text-zinc-900">{{ item.thickness }}</span>mc × 
                <span class="font-bold text-zinc-900">{{ item.width }}</span>mm × 
                <span class="font-bold text-zinc-900">{{ formatCommas(item.length) }}</span>m
              </td>

              <!-- Treatment -->
              <td class="p-3 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-[10px] font-extrabold uppercase font-mono',
                    item.treatment === 'INSIDE' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-zinc-100 text-zinc-700'
                  ]"
                >
                  {{ item.treatment }}
                </span>
              </td>

              <!-- Netto -->
              <td class="p-3 text-right font-mono font-bold text-emerald-800">
                {{ item.netto }}
              </td>

              <!-- Core -->
              <td class="p-3 text-right font-mono text-zinc-700">
                {{ item.core }}
              </td>

              <!-- Join Meter -->
              <td class="p-3 text-center font-mono">
                <span :class="item.join && item.join !== '0' ? 'font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200' : 'text-zinc-400'">
                  {{ item.join || '0' }}
                </span>
              </td>

              <!-- Actions -->
              <td class="p-3 text-center">
                <div class="flex items-center justify-center gap-1">
                  <!-- Print 1 Roll (3 Stickers) -->
                  <button
                    @click="handlePrintSingle(item)"
                    class="p-1 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors cursor-pointer"
                    title="Cetak 3 Stiker untuk Roll ini"
                  >
                    🖨️
                  </button>

                  <!-- Edit -->
                  <button
                    @click="store.openEditModal(item)"
                    class="p-1 rounded-lg text-zinc-600 hover:bg-zinc-100 transition-colors cursor-pointer"
                    title="Edit Data Label"
                  >
                    ✏️
                  </button>

                  <!-- Delete -->
                  <button
                    @click="handleDeleteSingle(item)"
                    class="p-1 rounded-lg text-red-600 hover:bg-red-100 transition-colors cursor-pointer"
                    title="Hapus Label Export"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- MODAL FORM (TAMBAH / EDIT) -->
    <LabelExportModalForm />

    <!-- MODAL CETAK & PRINT ENGINE (6 STIKER PER LEMBAR) -->
    <LabelExportPrintModal />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as XLSX from 'xlsx';
import { useLabelExportStore } from '@/stores/labelExportStore';
import LabelExportModalForm from '@/components/labelExport/LabelExportModalForm.vue';
import LabelExportPrintModal from '@/components/labelExport/LabelExportPrintModal.vue';

const store = useLabelExportStore();
const isSyncing = ref(false);
let removeSyncListener = null;

onMounted(async () => {
  await store.loadExportLabels();

  const handleSyncEvent = () => {
    store.loadExportLabels(false);
  };
  window.addEventListener('sync:export-labels-updated', handleSyncEvent);
  removeSyncListener = () => {
    window.removeEventListener('sync:export-labels-updated', handleSyncEvent);
  };
});

onUnmounted(() => {
  if (removeSyncListener) removeSyncListener();
});

const handleManualSync = async () => {
  isSyncing.value = true;
  try {
    await store.syncToCloud();
    await store.pullFromCloud();
  } finally {
    isSyncing.value = false;
  }
};

const formatCommas = (val) => {
  if (!val && val !== 0) return '0';
  return Number(val).toLocaleString('en-US');
};

const handlePrintSingle = (item) => {
  store.openPrintModal([item]);
};

const handlePrintSelected = () => {
  const selectedItems = store.items.filter(i => store.selectedIds.includes(i.id));
  if (selectedItems.length > 0) {
    store.openPrintModal(selectedItems);
  }
};

const handleDeleteSingle = async (item) => {
  if (confirm(`Hapus label export dengan Code Pack "${item.codePack}"?`)) {
    await store.deleteExportLabel(item.id);
  }
};

const handleDeleteSelected = async () => {
  const count = store.selectedIds.length;
  if (count === 0) return;
  if (confirm(`Yakin ingin menghapus ${count} label export terpilih?`)) {
    await store.deleteMultipleExportLabels(store.selectedIds);
  }
};

const handleExportExcel = () => {
  if (store.items.length === 0) return;

  const exportData = store.items.map((it, idx) => ({
    'No': idx + 1,
    'Code Pack': it.codePack,
    'Nomor OK': it.nomorOk,
    'Jenis Film': it.jenis,
    'Judul Label': it.jenisDisplay,
    'Kode Formula': it.kodeFormula,
    'Type': it.type,
    'Thickness (mc)': it.thickness,
    'Width (mm)': it.width,
    'Length (m)': it.length,
    'Treatment': it.treatment,
    'Netto (kg)': it.netto,
    'Core (kg)': it.core,
    'Join (m)': it.join,
    'Tanggal Dibuat': it.createdAt ? new Date(it.createdAt).toLocaleString('id-ID') : '-'
  }));

  const ws = XLSX.utils.json_to_sheet(exportData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Label Export');
  const filename = `Label_Export_Trivesta_${new Date().toISOString().slice(0, 10)}.xlsx`;
  XLSX.writeFile(wb, filename);
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 9999px;
}
</style>
