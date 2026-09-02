<template>
  <div class="space-y-3">
    <!-- STICKY / FROZEN TOP CONTROL BAR (SWC Corporate Theme: Red, White, Onyx Black) -->
    <div class="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-md shadow-zinc-900/5 space-y-3 transition-colors">
      
      <!-- ══════ SHEET MESIN TABS BAR ══════ -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200/80">
        <button
          v-for="sheet in machineSheets"
          :key="sheet.id"
          @click="$emit('select-machine-sheet', sheet.id)"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border select-none cursor-pointer',
            filterMesin === sheet.id
              ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm shadow-zinc-900/20 scale-[1.02]'
              : 'bg-white text-zinc-600 border-zinc-200/80 hover:bg-zinc-50 hover:text-zinc-900 hover:border-zinc-300'
          ]"
        >
          <!-- Dynamic Machine Icon -->
          <svg v-if="sheet.id === 'ALL'" class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/>
          </svg>
          <svg v-else-if="sheet.id.includes('SLIT')" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="6" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <line x1="20" y1="4" x2="8.12" y2="15.88" />
            <line x1="14.47" y1="14.48" x2="20" y2="20" />
            <line x1="8.12" y1="8.12" x2="12" y2="12" />
          </svg>
          <svg v-else-if="sheet.id.includes('REWIND')" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>

          <span>{{ sheet.label }}</span>
          <span
            :class="[
              'px-1.5 py-0.2 rounded-full text-[9.5px] font-black font-mono',
              filterMesin === sheet.id
                ? 'bg-red-600 text-white'
                : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
            ]"
          >
            {{ getCountByMesin(sheet.id) }}
          </span>
        </button>
      </div>

      <!-- MAIN ROW: Action Buttons + Search + Filters + Sort + Export -->
      <div class="flex flex-wrap items-center justify-between gap-2.5">
        
        <!-- Left: Tambah Data + Bulk Selection Actions -->
        <div class="flex items-center flex-wrap gap-2">
          <!-- Tambah Data Button -->
          <button
            @click="$emit('open-modal', -1)"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
            :title="filterMesin !== 'ALL' ? `Tambah data label baru khusus mesin ${filterMesin}` : 'Tambah data label baru'"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <span>Tambah Data {{ filterMesin !== 'ALL' ? `(${filterMesin})` : '' }}</span>
          </button>

          <!-- Bulk Action Buttons -->
          <div v-if="selectedIds.length > 0" class="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-fade-in text-xs shrink-0">
            <span class="font-black text-red-900">{{ selectedIds.length }} dipilih:</span>
            <button
              @click="$emit('preview-selected')"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1 shadow-xs cursor-pointer"
              title="Cetak label yang dipilih"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
              </svg>
              <span>🖨️ Cetak</span>
            </button>
            <button
              @click="$emit('delete-selected')"
              class="px-2 py-1 rounded-lg text-[11px] font-bold bg-zinc-200 hover:bg-red-100 hover:text-red-700 text-zinc-700 transition-all flex items-center gap-1 cursor-pointer"
              title="Hapus data yang dipilih"
            >
              🗑️ Hapus
            </button>
            <button
              @click="$emit('clear-selection')"
              class="px-1.5 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all cursor-pointer"
              title="Batalkan pilihan"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Center: Search Input Bar -->
        <div class="flex-1 min-w-[180px] sm:min-w-[220px] relative">
          <input
            :value="searchTerm"
            @input="$emit('update:searchTerm', $event.target.value)"
            type="text"
            placeholder="Cari SPK, Lot, Turunan, Operator..."
            class="w-full pl-7 pr-6 py-1 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none bg-white font-medium placeholder-zinc-400 h-8"
          />
          <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            v-if="searchTerm"
            @click="$emit('update:searchTerm', '')"
            class="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 font-bold text-xs cursor-pointer"
            title="Hapus pencarian"
          >
            ✕
          </button>
        </div>

        <!-- Right: Filters, View Mode Toggle, and Actions -->
        <div class="flex items-center flex-wrap gap-1.5">
          <!-- Filter Mesin -->
          <select
            :value="filterMesin"
            @change="$emit('update:filterMesin', $event.target.value)"
            class="px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none bg-white font-bold text-zinc-700 hover:border-zinc-300 focus:ring-1 focus:ring-red-500 h-8 cursor-pointer"
            title="Filter Mesin"
          >
            <option value="ALL">Semua Mesin</option>
            <option v-for="m in mesinOptions" :key="m" :value="m">{{ m }}</option>
          </select>

          <!-- Filter Status -->
          <select
            :value="filterStatus"
            @change="$emit('update:filterStatus', $event.target.value)"
            class="px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none bg-white font-bold text-zinc-700 hover:border-zinc-300 focus:ring-1 focus:ring-red-500 h-8 cursor-pointer"
            title="Filter Status"
          >
            <option value="ALL">Status: Semua</option>
            <option value="PASS">PASS</option>
            <option value="HOLD">HOLD</option>
            <option value="REJECT">REJECT</option>
          </select>

          <!-- Sort Dropdown (Only in Table Mode) -->
          <div v-if="viewMode === 'table'" class="flex items-center rounded-lg border border-zinc-200 bg-white overflow-hidden h-8">
            <select
              :value="sortBy"
              @change="$emit('update:sortBy', $event.target.value)"
              class="px-2 py-1 text-xs outline-none bg-transparent font-semibold text-zinc-700 cursor-pointer"
            >
              <option value="id">Terbaru</option>
              <option value="tanggal">Tanggal</option>
              <option value="lot">No Lot</option>
              <option value="spk">SPK</option>
              <option value="netto">Netto</option>
            </select>
            <button
              type="button"
              @click="$emit('toggle-sort-order')"
              class="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-[10px] border-l border-zinc-200 cursor-pointer"
              :title="sortOrder === 'asc' ? 'ASC' : 'DESC'"
            >
              {{ sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>

          <!-- View Mode Switcher (Tabel Flat vs Parent-Child) -->
          <div class="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs font-bold shrink-0 h-8">
            <button
              type="button"
              @click="$emit('update:viewMode', 'table')"
              :class="[
                'px-2 py-0.5 rounded-md transition-all flex items-center gap-1 text-xs cursor-pointer',
                viewMode === 'table' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-800'
              ]"
              title="Tampilan Tabel Standar"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18" />
              </svg>
              <span class="hidden sm:inline">Tabel</span>
            </button>
            <button
              type="button"
              @click="$emit('update:viewMode', 'hierarchy')"
              :class="[
                'px-2 py-0.5 rounded-md transition-all flex items-center gap-1 text-xs cursor-pointer',
                viewMode === 'hierarchy' ? 'bg-white text-red-600 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-800'
              ]"
              title="Tampilan Hierarki Parent-Child (Tanggal > No Lot > Turunan)"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12H9M9 6v12M9 6l-5 6 5 6" />
              </svg>
              <span>Hierarki</span>
            </button>
          </div>

          <!-- Single Toggle Buka / Tutup Button in Toolbar (Mode Hierarki) -->
          <button
            v-if="viewMode === 'hierarchy'"
            type="button"
            @click="$emit('toggle-all-hierarchy')"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 flex items-center gap-1.5 h-8 transition-colors shrink-0 cursor-pointer"
            :title="isAllHierarchyExpanded ? 'Tutup Seluruh Parent' : 'Buka Seluruh Parent'"
          >
            <span>{{ isAllHierarchyExpanded ? '▸ Tutup Semua' : '▾ Buka Semua' }}</span>
          </button>

          <!-- Kolom Settings Button (Only in Table Mode) -->
          <button
            v-if="viewMode === 'table'"
            @click="$emit('open-column-modal')"
            class="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-all flex items-center gap-1 shrink-0 h-8 cursor-pointer"
            title="Atur kolom tabel"
          >
            <span>⚙️ Kolom</span>
          </button>

          <!-- Export Excel Button -->
          <button
            @click="$emit('export-excel')"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-all flex items-center gap-1.5 border border-zinc-800 shrink-0 h-8 cursor-pointer"
            title="Export data ke Excel"
          >
            <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span class="hidden sm:inline">Excel</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Sheet Context Banner -->
    <div class="flex items-center justify-between px-1">
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-red-600"></span>
        <span class="font-extrabold text-xs text-zinc-800 uppercase tracking-wider">
          Sheet: {{ filterMesin === 'ALL' ? 'Semua Mesin' : `Mesin ${filterMesin}` }}
        </span>
        <span class="text-xs text-zinc-400 font-medium font-mono">({{ totalFiltered }} Label)</span>
      </div>
      <span class="text-[11px] text-zinc-400 font-medium">
        Halaman {{ currentPage }} dari {{ totalPages || 1 }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  machineSheets: { type: Array, required: true },
  filterMesin: { type: String, default: 'ALL' },
  filterStatus: { type: String, default: 'ALL' },
  searchTerm: { type: String, default: '' },
  sortBy: { type: String, default: 'id' },
  sortOrder: { type: String, default: 'asc' },
  viewMode: { type: String, default: 'table' },
  selectedIds: { type: Array, default: () => [] },
  mesinOptions: { type: Array, default: () => [] },
  isAllHierarchyExpanded: { type: Boolean, default: false },
  totalFiltered: { type: Number, default: 0 },
  currentPage: { type: Number, default: 1 },
  totalPages: { type: Number, default: 1 },
  getCountByMesin: { type: Function, required: true }
});

defineEmits([
  'select-machine-sheet',
  'open-modal',
  'preview-selected',
  'delete-selected',
  'clear-selection',
  'update:searchTerm',
  'update:filterMesin',
  'update:filterStatus',
  'update:sortBy',
  'toggle-sort-order',
  'update:viewMode',
  'toggle-all-hierarchy',
  'open-column-modal',
  'export-excel'
]);
</script>
