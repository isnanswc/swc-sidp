<template>
  <div class="space-y-6">
    <!-- Header & Action bar -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
      <div>
        <h2 class="text-base font-black text-zinc-900">Modul Stok Opname</h2>
        <p class="text-xs text-zinc-500 font-medium">Rekonsiliasi stok fisik roll film dengan sistem persediaan gudang</p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="opnameStore.exportToExcel()"
          class="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white shadow-xs transition-all flex items-center gap-1.5"
        >
          <svg class="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Export Laporan
        </button>

        <button
          @click="openAddModal"
          class="px-4 py-2 rounded-xl text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition-all flex items-center gap-2"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          + Tambah Item Opname
        </button>
      </div>
    </div>

    <!-- Filters & Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="md:col-span-2 bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-3">
        <input
          v-model="opnameStore.searchTerm"
          type="text"
          placeholder="Cari kode roll, nama material, lokasi rak..."
          class="flex-1 px-3 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none"
        />
        <select
          v-model="opnameStore.filterStatus"
          class="px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none bg-white font-semibold"
        >
          <option value="ALL">Semua Status</option>
          <option value="Match">Match (Sesuai)</option>
          <option value="Discrepancy">Selisih Fisik</option>
        </select>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-around text-center">
        <div>
          <p class="text-[10px] uppercase font-bold text-zinc-400">Total Item</p>
          <p class="text-xl font-black text-zinc-900">{{ opnameStore.totalItems }}</p>
        </div>
        <div class="h-8 w-px bg-zinc-200"></div>
        <div>
          <p class="text-[10px] uppercase font-bold text-emerald-600">Sesuai</p>
          <p class="text-xl font-black text-emerald-700">{{ opnameStore.matchItems }}</p>
        </div>
      </div>

      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-center text-center">
        <div>
          <p class="text-[10px] uppercase font-bold text-red-600">Selisih Stok</p>
          <p class="text-xl font-black text-red-600">{{ opnameStore.discrepancyItems }} Item</p>
        </div>
      </div>
    </div>

    <!-- Opname Table -->
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="bg-zinc-100/90 text-zinc-800 border-b border-zinc-200 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
              <th class="py-3 px-4">No</th>
              <th class="py-3 px-4">Kode Item</th>
              <th class="py-3 px-4">Nama Material / Roll</th>
              <th class="py-3 px-4">Kategori</th>
              <th class="py-3 px-4 text-center">Stok Sistem</th>
              <th class="py-3 px-4 text-center">Stok Fisik</th>
              <th class="py-3 px-4 text-center">Selisih</th>
              <th class="py-3 px-4">Lokasi</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 text-zinc-700">
            <tr
              v-for="(item, idx) in paginatedOpname"
              :key="item.id"
              class="hover:bg-red-50/30 transition-colors"
            >
              <td class="py-3 px-4 font-mono text-zinc-400 font-bold">{{ (opnamePage - 1) * opnamePageSize + idx + 1 }}</td>
              <td class="py-3 px-4">
                <div class="font-mono font-bold text-red-600">{{ item.itemCode }}</div>
                <div class="text-[10px] text-zinc-400">{{ item.unit }}</div>
              </td>
              <td class="py-3 px-4 font-bold text-zinc-900">{{ item.itemName }}</td>
              <td class="py-3 px-4">
                <span class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                  {{ item.category }}
                </span>
              </td>
              <td class="py-3 px-4 text-center font-bold text-zinc-800">{{ item.systemStock }}</td>
              <td class="py-3 px-4 text-center font-bold text-zinc-900 bg-zinc-50/80">{{ item.physicalStock }}</td>
              <td class="py-3 px-4 text-center font-bold">
                <span
                  v-if="item.difference === 0"
                  class="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg text-[11px]"
                >
                  Cocok
                </span>
                <span
                  v-else
                  :class="[
                    'px-2 py-0.5 rounded-lg text-[11px] font-bold border',
                    item.difference > 0 ? 'text-zinc-800 bg-zinc-100 border-zinc-300' : 'text-red-700 bg-red-50 border-red-200'
                  ]"
                >
                  {{ item.difference > 0 ? `+${item.difference}` : item.difference }}
                </span>
              </td>
              <td class="py-3 px-4 font-medium text-zinc-600">{{ item.location }}</td>
              <td class="py-3 px-4 text-center">
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-bold border',
                  item.status === 'Verified' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  item.status === 'Investigated' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                ]">
                  {{ item.status }}
                </span>
              </td>
              <td class="py-3 px-4 text-center whitespace-nowrap">
                <div class="flex items-center justify-center gap-1.5">
                  <button
                    @click="openEditModal(item)"
                    class="p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-100 hover:text-black transition-colors"
                    title="Edit Fisik"
                  >
                    ✏️
                  </button>
                  <button
                    @click="deleteItem(item.id)"
                    class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                    title="Hapus"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="opnameStore.filteredOpname.length === 0">
              <td colspan="10" class="py-12 text-center text-zinc-400">
                <div class="text-3xl mb-2">📦</div>
                <p class="font-bold text-sm">Tidak ada data stok opname ditemukan.</p>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination Bar -->
        <div class="px-4 py-3 border-t border-zinc-200 bg-zinc-50 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 text-zinc-600">
            <span>Menampilkan <strong>{{ paginatedOpname.length }}</strong> dari total <strong>{{ opnameStore.filteredOpname.length }}</strong> item opname</span>
            <span class="text-zinc-300">•</span>
            <span>Halaman <strong>{{ opnamePage }}</strong> dari <strong>{{ totalOpnamePages }}</strong></span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="opnamePage <= 1"
              @click="opnamePage--"
              class="px-3 py-1 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs cursor-pointer transition-all"
            >
              ◀ Prev
            </button>
            <span class="px-2.5 py-0.5 rounded bg-zinc-900 text-white font-mono font-bold text-xs">
              {{ opnamePage }} / {{ totalOpnamePages }}
            </span>
            <button
              type="button"
              :disabled="opnamePage >= totalOpnamePages"
              @click="opnamePage++"
              class="px-3 py-1 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs cursor-pointer transition-all"
            >
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Form Tambah / Edit Opname -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-xs">
      <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
          <h3 class="text-base font-black text-zinc-900">
            {{ isEditing ? 'Update Rekonsiliasi Fisik' : 'Tambah Item Opname' }}
          </h3>
          <button @click="showModal = false" class="text-zinc-400 hover:text-zinc-600 font-bold text-xl">✕</button>
        </div>

        <form @submit.prevent="handleSubmit" class="mt-4 space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-zinc-700 mb-1">Kode Item Roll / Material</label>
            <input v-model="formData.itemCode" type="text" required placeholder="Contoh: FG-VMCPP-18" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none font-mono" />
          </div>

          <div>
            <label class="block font-bold text-zinc-700 mb-1">Nama Material / Spesifikasi</label>
            <input v-model="formData.itemName" type="text" required placeholder="Contoh: Finished Roll VMCPP 18 Micron 1000mm" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Kategori</label>
              <select v-model="formData.category" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-white font-medium">
                <option value="Finished Goods">Finished Goods</option>
                <option value="Raw Material">Raw Material</option>
                <option value="Semi Finished">Semi Finished</option>
                <option value="Packaging Aux">Packaging Aux</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Satuan</label>
              <input v-model="formData.unit" type="text" required placeholder="Roll / Pcs" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Stok Sistem (SOP)</label>
              <input v-model.number="formData.systemStock" type="number" required class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-zinc-50 font-bold" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Stok Hitung Fisik</label>
              <input v-model.number="formData.physicalStock" type="number" required class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none font-bold text-red-600 focus:ring-2 focus:ring-red-500" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Lokasi Gudang / Rak</label>
              <input v-model="formData.location" type="text" required placeholder="Rak A-02" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none" />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Status Verifikasi</label>
              <select v-model="formData.status" class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-white font-medium">
                <option value="Verified">Verified (Cocok)</option>
                <option value="Investigated">Investigated (Dicek)</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-zinc-700 mb-1">Catatan</label>
            <input v-model="formData.notes" type="text" placeholder="Catatan kondisi fisik roll..." class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none" />
          </div>

          <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
            <button type="button" @click="showModal = false" class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700">
              Batal
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25">
              Simpan Opname
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useOpnameStore } from '@/stores/opnameStore';

const opnameStore = useOpnameStore();

// Pagination State untuk Tabel Opname (Mencegah freeze pada ribuan item)
const opnamePage = ref(1);
const opnamePageSize = ref(25);

const totalOpnamePages = computed(() => {
  return Math.ceil(opnameStore.filteredOpname.length / opnamePageSize.value) || 1;
});

const paginatedOpname = computed(() => {
  const start = (opnamePage.value - 1) * opnamePageSize.value;
  return opnameStore.filteredOpname.slice(start, start + opnamePageSize.value);
});

watch([() => opnameStore.searchTerm, () => opnameStore.filterCategory, () => opnameStore.filterStatus], () => {
  opnamePage.value = 1;
});

const showModal = ref(false);
const isEditing = ref(false);
const editId = ref(null);

const formData = reactive({
  itemCode: '',
  itemName: '',
  category: 'Finished Goods',
  systemStock: 0,
  physicalStock: 0,
  unit: 'Roll',
  location: 'Gudang Utama',
  notes: '',
  status: 'Verified'
});

const openAddModal = () => {
  isEditing.value = false;
  editId.value = null;
  formData.itemCode = '';
  formData.itemName = '';
  formData.category = 'Finished Goods';
  formData.systemStock = 0;
  formData.physicalStock = 0;
  formData.unit = 'Roll';
  formData.location = 'Gudang Utama';
  formData.notes = '';
  formData.status = 'Verified';
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  editId.value = item.id;
  Object.assign(formData, item);
  showModal.value = true;
};

const handleSubmit = async () => {
  const difference = formData.physicalStock - formData.systemStock;
  const payload = { ...formData, difference };

  if (isEditing.value && editId.value) {
    await opnameStore.updateOpname(editId.value, payload);
  } else {
    await opnameStore.addOpname(payload);
  }
  showModal.value = false;
};

const deleteItem = async (id) => {
  if (confirm('Hapus item opname ini?')) {
    await opnameStore.deleteOpname(id);
  }
};

onMounted(async () => {
  await opnameStore.loadOpname();
});
</script>
