<template>
  <div class="space-y-6">
    <!-- STICKY / FROZEN TOP CONTROL BAR (SWC Corporate Theme: Red, White, Onyx Black) -->
    <div ref="controlBarRef" class="sticky top-16 z-30 bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-md shadow-zinc-900/5 space-y-3 transition-colors">
      
      <!-- ══════ SHEET MESIN TABS BAR ══════ -->
      <div class="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-zinc-200/80">
        <button
          v-for="sheet in machineSheets"
          :key="sheet.id"
          @click="selectMachineSheet(sheet.id)"
          :class="[
            'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0 border select-none',
            labelStore.filterMesin === sheet.id
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
              labelStore.filterMesin === sheet.id
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
          <!-- Tambah Data Button (SWC Red, Machine-Aware) -->
          <button
            @click="openModal(-1)"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/25 transition-all flex items-center gap-1.5 shrink-0"
            :title="labelStore.filterMesin !== 'ALL' ? `Tambah data label baru khusus mesin ${labelStore.filterMesin}` : 'Tambah data label baru'"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
            </svg>
            <span>Tambah Data {{ labelStore.filterMesin !== 'ALL' ? `(${labelStore.filterMesin})` : '' }}</span>
          </button>

          <!-- Bulk Action Buttons (Visible when checkboxes are checked) -->
          <div v-if="selectedIds.length > 0" class="flex items-center gap-1.5 bg-red-50 border border-red-200 px-2.5 py-1 rounded-xl animate-fade-in text-xs shrink-0">
            <span class="font-black text-red-900">{{ selectedIds.length }} dipilih:</span>
            <button
              @click="previewSelected"
              class="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-red-600 hover:bg-red-700 text-white transition-all flex items-center gap-1 shadow-xs"
              title="Cetak label yang dipilih"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18,3H6V7H18M19,12A1,1 0 0,1 18,11A1,1 0 0,1 19,10A1,1 0 0,1 20,11A1,1 0 0,1 19,12M16,19H8V14H16M19,8H5A3,3 0 0,0 2,11V17H6V21H18V17H22V11A3,3 0 0,0 19,8Z" />
              </svg>
              <span>🖨️ Cetak</span>
            </button>
            <button
              @click="deleteSelected"
              class="px-2 py-1 rounded-lg text-[11px] font-bold bg-zinc-200 hover:bg-red-100 hover:text-red-700 text-zinc-700 transition-all flex items-center gap-1"
              title="Hapus data yang dipilih"
            >
              🗑️ Hapus
            </button>
            <button
              @click="selectedIds = []"
              class="px-1.5 py-1 rounded-lg text-[11px] font-bold text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-all"
              title="Batalkan pilihan"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- Center: Minimalist Search Input Bar -->
        <div class="flex-1 min-w-[180px] sm:min-w-[220px] relative">
          <input
            v-model="labelStore.searchTerm"
            type="text"
            placeholder="Cari SPK, Lot, Turunan, Operator..."
            class="w-full pl-7 pr-6 py-1 text-xs border border-zinc-200 rounded-lg focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none bg-white font-medium placeholder-zinc-400 h-8"
          />
          <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <button
            v-if="labelStore.searchTerm"
            @click="labelStore.searchTerm = ''"
            class="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 font-bold text-xs"
            title="Hapus pencarian"
          >
            ✕
          </button>
        </div>

        <!-- Right: Filters, View Mode Toggle, and Actions -->
        <div class="flex items-center flex-wrap gap-1.5">
          <!-- Filter Mesin -->
          <select
            v-model="labelStore.filterMesin"
            class="px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none bg-white font-bold text-zinc-700 hover:border-zinc-300 focus:ring-1 focus:ring-red-500 h-8"
            title="Filter Mesin"
          >
            <option value="ALL">Semua Mesin</option>
            <option v-for="m in mesinOptions" :key="m" :value="m">{{ m }}</option>
          </select>

          <!-- Filter Status -->
          <select
            v-model="labelStore.filterStatus"
            class="px-2 py-1 text-xs border border-zinc-200 rounded-lg outline-none bg-white font-bold text-zinc-700 hover:border-zinc-300 focus:ring-1 focus:ring-red-500 h-8"
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
              v-model="labelStore.sortBy"
              class="px-2 py-1 text-xs outline-none bg-transparent font-semibold text-zinc-700 cursor-pointer"
            >
              <option value="hierarki">🎯 Hierarki Slitting (Alur Produksi)</option>
              <option value="id">Terbaru (ID)</option>
              <option value="tanggal">Tanggal</option>
              <option value="lot">No Lot & Turunan</option>
              <option value="kodePack">Kode Pack</option>
              <option value="spk">SPK</option>
              <option value="netto">Netto</option>
            </select>
            <button
              type="button"
              @click="toggleSortOrder"
              class="px-2 py-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-700 font-bold text-[10px] border-l border-zinc-200"
              :title="labelStore.sortOrder === 'asc' ? 'ASC' : 'DESC'"
            >
              {{ labelStore.sortOrder === 'asc' ? '↑' : '↓' }}
            </button>
          </div>

          <!-- View Mode Switcher (Tabel Flat vs Parent-Child) -->
          <div class="flex items-center rounded-lg border border-zinc-200 bg-zinc-100 p-0.5 text-xs font-bold shrink-0 h-8">
            <button
              type="button"
              @click="viewMode = 'table'"
              :class="[
                'px-2 py-0.5 rounded-md transition-all flex items-center gap-1 text-xs',
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
              @click="viewMode = 'hierarchy'"
              :class="[
                'px-2 py-0.5 rounded-md transition-all flex items-center gap-1 text-xs',
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
            @click="toggleAllHierarchy"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 flex items-center gap-1.5 h-8 transition-colors shrink-0"
            :title="isAllHierarchyExpanded ? 'Tutup Seluruh Parent' : 'Buka Seluruh Parent'"
          >
            <span>{{ isAllHierarchyExpanded ? '▸ Tutup Semua' : '▾ Buka Semua' }}</span>
          </button>

          <!-- Kolom Settings Button (Only in Table Mode) -->
          <button
            v-if="viewMode === 'table'"
            @click="openColumnModal"
            class="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-all flex items-center gap-1 shrink-0 h-8"
            title="Atur kolom tabel"
          >
            <span>⚙️ Kolom</span>
          </button>

          <!-- Export Excel Button -->
          <button
            @click="labelStore.exportToExcel()"
            class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-all flex items-center gap-1.5 border border-zinc-800 shrink-0 h-8"
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
          Sheet: {{ labelStore.filterMesin === 'ALL' ? 'Semua Mesin' : `Mesin ${labelStore.filterMesin}` }}
        </span>
        <span class="text-xs text-zinc-400 font-medium font-mono">({{ labelStore.filteredLabels.length }} Label)</span>
      </div>
      <span v-if="viewMode === 'table'" class="text-[11px] text-zinc-400 font-medium">
        Halaman {{ labelStore.currentPage }} dari {{ labelStore.totalPages || 1 }}
      </span>
    </div>

    <!-- Data Table Container (MODE 1: FLAT TABLE) -->
    <div v-if="viewMode === 'table'" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead @contextmenu.prevent="openColumnModal" title="Klik kanan untuk atur kolom tabel">
            <tr class="bg-zinc-100/90 text-zinc-800 border-b border-zinc-200 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap select-none">
              <th class="py-3 px-3 w-10 text-center">
                <button
                  type="button"
                  @click="toggleAll"
                  class="w-4 h-4 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                  :class="isAllSelected ? 'bg-red-600 border-red-600 text-white shadow-2xs' : 'border-zinc-400 bg-white hover:border-red-500'"
                  :title="isAllSelected ? 'Batalkan pilihan semua' : 'Pilih semua di halaman ini'"
                >
                  <svg v-if="isAllSelected" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </th>
              
              <!-- NO / ID -->
              <th v-if="visibleColumns.id" class="py-3 px-3 text-center cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('id')">
                <div class="flex items-center justify-center gap-1">
                  <span>No</span>
                  <span v-if="labelStore.sortBy === 'id'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- UNIQ ID -->
              <th v-if="visibleColumns.uniqId" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('uniqId')">
                <div class="flex items-center gap-1">
                  <span>UNIQ ID</span>
                  <span v-if="labelStore.sortBy === 'uniqId'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- TANGGAL -->
              <th v-if="visibleColumns.tanggal" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('tanggal')">
                <div class="flex items-center gap-1">
                  <span>Tanggal</span>
                  <span v-if="labelStore.sortBy === 'tanggal'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- MESIN -->
              <th v-if="visibleColumns.mesin" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('mesin')">
                <div class="flex items-center gap-1">
                  <span>Mesin</span>
                  <span v-if="labelStore.sortBy === 'mesin'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- OPERATOR -->
              <th v-if="visibleColumns.operator" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('operator')">
                <div class="flex items-center gap-1">
                  <span>Operator</span>
                  <span v-if="labelStore.sortBy === 'operator'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- SUPPLIER -->
              <th v-if="visibleColumns.supplier" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('supplier')">
                <div class="flex items-center gap-1">
                  <span>Supplier</span>
                  <span v-if="labelStore.sortBy === 'supplier'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- SPK -->
              <th v-if="visibleColumns.spk" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('spk')">
                <div class="flex items-center gap-1">
                  <span>SPK</span>
                  <span v-if="labelStore.sortBy === 'spk'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- NO LOT AKHIR -->
              <th v-if="visibleColumns.lot" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('lot')">
                <div class="flex items-center gap-1">
                  <span>No Lot Akhir</span>
                  <span v-if="labelStore.sortBy === 'lot'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- DIMENSI -->
              <th v-if="visibleColumns.dimensi" class="py-3 px-4 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('netto')">
                <div class="flex items-center gap-1">
                  <span>Dimensi & Berat</span>
                  <span v-if="labelStore.sortBy === 'netto'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- KODE PACK -->
              <th v-if="visibleColumns.kodePack" class="py-3 px-3 cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('kodePack')">
                <div class="flex items-center gap-1">
                  <span>Kode Pack</span>
                  <span v-if="labelStore.sortBy === 'kodePack'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- STATUS -->
              <th v-if="visibleColumns.status" class="py-3 px-3 text-center cursor-pointer hover:bg-zinc-200/70 transition-colors" @click="sortByColumn('status')">
                <div class="flex items-center justify-center gap-1">
                  <span>Status</span>
                  <span v-if="labelStore.sortBy === 'status'" class="text-red-600 font-black">{{ labelStore.sortOrder === 'asc' ? '▲' : '▼' }}</span>
                </div>
              </th>

              <!-- BULAN -->
              <th v-if="visibleColumns.bulan" class="py-3 px-3">Bulan</th>

              <!-- AKSI -->
              <th v-if="visibleColumns.aksi" class="py-3 px-3 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 text-zinc-700">
            <tr
              v-for="(item, idx) in labelStore.paginatedLabels"
              :key="item.id"
              @contextmenu.prevent="openRowActionModal(item)"
              :class="[
                'hover:bg-red-50/30 transition-colors cursor-pointer select-none',
                selectedIds.includes(item.id) ? 'bg-red-50/50' : ''
              ]"
              title="Klik kanan pada baris ini untuk membuka Menu Aksi"
            >
              <!-- Checkbox Row -->
              <td class="py-2.5 px-3 text-center whitespace-nowrap" @click.stop>
                <button
                  type="button"
                  @click="toggleSelectItem(item.id)"
                  class="w-4 h-4 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                  :class="selectedIds.includes(item.id) ? 'bg-red-600 border-red-600 text-white shadow-2xs' : 'border-zinc-300 bg-white hover:border-red-500'"
                  :title="selectedIds.includes(item.id) ? 'Batalkan pilihan' : 'Pilih data ini untuk cetak'"
                >
                  <svg v-if="selectedIds.includes(item.id)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </button>
              </td>

              <!-- No / ID Record -->
              <td v-if="visibleColumns.id" class="py-2.5 px-3 font-mono text-zinc-600 font-bold text-center whitespace-nowrap">
                #{{ item.id }}
              </td>

              <!-- UNIQ ID -->
              <td v-if="visibleColumns.uniqId" class="py-2.5 px-3 font-mono text-[11px] text-zinc-500 font-bold whitespace-nowrap">
                {{ item.uniqId || '-' }}
              </td>

              <!-- Tanggal -->
              <td v-if="visibleColumns.tanggal" class="py-2.5 px-3 whitespace-nowrap font-medium text-zinc-900">
                {{ formatTanggalIndonesia(item.tanggal) }}
              </td>

              <!-- Mesin -->
              <td v-if="visibleColumns.mesin" class="py-2.5 px-3 whitespace-nowrap">
                <span :class="[
                  'px-2 py-0.5 rounded text-[10px] font-bold border uppercase',
                  item.mesin === 'CASTING' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  item.mesin === 'METALIZE' ? 'bg-sky-100 text-sky-900 border-sky-300' :
                  item.mesin === 'REWIND' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                  'bg-emerald-100 text-emerald-900 border-emerald-300'
                ]">
                  {{ item.mesin }}
                </span>
              </td>

              <!-- Operator (Database Resolved) -->
              <td v-if="visibleColumns.operator" class="py-2.5 px-3 whitespace-nowrap">
                <div class="flex items-center gap-2">
                  <span class="w-6 h-6 rounded-full bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black shrink-0 shadow-2xs border border-zinc-700">
                    {{ getOperatorInitial(item) }}
                  </span>
                  <div class="flex flex-col text-left leading-tight">
                    <div class="flex items-center gap-1.5">
                      <span class="font-bold text-zinc-900 text-xs">{{ getOperatorDisplayName(item) }}</span>
                      <span v-if="getOperatorCode(item)" class="px-1 py-0.2 rounded bg-zinc-100 text-zinc-700 font-mono text-[9px] font-black border border-zinc-300">
                        {{ getOperatorCode(item) }}
                      </span>
                    </div>
                    <span v-if="getOperatorGroup(item)" class="text-[9.5px] text-zinc-400 font-medium">
                      Grup {{ getOperatorGroup(item) }} • {{ item.mesin || 'SLITTING' }}
                    </span>
                  </div>
                </div>
              </td>

              <!-- Supplier -->
              <td v-if="visibleColumns.supplier" class="py-2.5 px-3 font-semibold text-zinc-600 whitespace-nowrap">
                {{ item.supplier || 'INHOUSE' }}
              </td>

              <!-- SPK -->
              <td v-if="visibleColumns.spk" class="py-2.5 px-3 font-bold text-zinc-800 whitespace-nowrap font-mono">
                {{ item.spk }}
              </td>

              <!-- No Lot Akhir (Clear Distinction: Parent Lot vs Child Turunan) -->
              <td v-if="visibleColumns.lot" class="py-2.5 px-3 whitespace-nowrap font-mono">
                <div class="flex items-center gap-1.5 text-xs">
                  <span class="text-zinc-600 font-semibold tracking-tight" :title="`No. Lot Induk (Parent): ${formatLotTable(item).parentLot}`">
                    {{ formatLotTable(item).parentLot }}
                  </span>
                  <span v-if="formatLotTable(item).childTurunan || item.turunan" class="text-zinc-400 font-bold">/</span>
                  <span
                    v-if="formatLotTable(item).childTurunan || item.turunan"
                    class="px-2 py-0.5 rounded-md font-black bg-red-100 text-red-700 border border-red-200 shadow-2xs text-[11px]"
                    :title="`Turunan / Child Roll: ${formatLotTable(item).childTurunan || item.turunan}`"
                  >
                    {{ formatLotTable(item).childTurunan || item.turunan }}
                  </span>
                </div>
              </td>

              <!-- Dimensi (NO WRAP) -->
              <td v-if="visibleColumns.dimensi" class="py-2.5 px-4 whitespace-nowrap font-medium text-zinc-700">
                {{ item.jenis }} <span class="text-red-600 font-bold">{{ item.kode }}</span> {{ item.thickness }} MC × {{ item.width }} MM = {{ item.length }}
              </td>

              <!-- Kode Pack (Red highlight if DUPLICATE) -->
              <td v-if="visibleColumns.kodePack" class="py-2.5 px-3 whitespace-nowrap">
                <div v-if="isDuplicateKodePack(item)" class="inline-flex items-center px-2 py-0.5 rounded bg-red-600 text-yellow-300 font-bold font-mono text-[11px] shadow-xs" title="Duplikasi Kode Pack Terdeteksi!">
                  {{ item.kodePack }}{{ item.subKode }}
                </div>
                <div v-else class="font-mono">
                  <span>{{ item.kodePack }}</span>
                  <span class="text-red-600 font-bold">{{ item.subKode }}</span>
                </div>
              </td>

              <!-- Status Badge (Hijau = PASS, Kuning = HOLD, Merah = REJECT) -->
              <td v-if="visibleColumns.status" class="py-2.5 px-3 text-center whitespace-nowrap">
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border inline-block tracking-wider',
                  item.status === 'PASS' || item.status === 'OK'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  item.status === 'HOLD'
                    ? 'bg-amber-100 text-amber-800 border-amber-300' :
                    'bg-red-100 text-red-800 border-red-300'
                ]">
                  {{ item.status }}
                </span>
              </td>

              <!-- Bulan -->
              <td v-if="visibleColumns.bulan" class="py-2.5 px-3 text-zinc-500 whitespace-nowrap">
                {{ getMonthName(item.tanggal) }}
              </td>

              <!-- Aksi Buttons (MINIMALIST ICON BUTTONS) -->
              <td v-if="visibleColumns.aksi" class="py-2.5 px-3 text-center whitespace-nowrap" @click.stop>
                <div class="flex items-center justify-center gap-1">
                  <!-- Single Preview Icon Button -->
                  <button
                    @click="previewSingle(item)"
                    class="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 hover:text-indigo-800 transition-colors"
                    title="Pratinjau Label"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>

                  <!-- Edit Icon Button -->
                  <button
                    v-if="!isLockedForUser(item)"
                    @click="openModal(item)"
                    class="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-800 transition-colors"
                    title="Edit Data"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <span
                    v-else
                    class="p-1.5 inline-flex items-center text-amber-500 cursor-not-allowed"
                    title="🔒 Terkunci: Label telah diapprove oleh Admin di DE Report. Hanya level Admin yang dapat mengedit."
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>

                  <!-- Duplikat Icon Button -->
                  <button
                    @click="duplicateData(item)"
                    class="p-1.5 rounded-lg text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
                    title="Duplikat Data"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <!-- Hapus Icon Button -->
                  <button
                    v-if="!isLockedForUser(item)"
                    @click="deleteData(item)"
                    class="p-1.5 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-800 transition-colors"
                    title="Hapus Data"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <span
                    v-else
                    class="p-1.5 inline-flex items-center text-zinc-300 cursor-not-allowed"
                    title="🔒 Terkunci: Label telah diapprove oleh Admin di DE Report."
                  >
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </span>
                </div>
              </td>
            </tr>

            <tr v-if="labelStore.paginatedLabels.length === 0">
              <td :colspan="activeColumnCount + 1" class="py-12 text-center text-zinc-400">
                <div class="text-3xl mb-2">🏷️</div>
                <p class="font-bold text-sm text-zinc-800">Tidak ada data label yang ditemukan.</p>
                <p class="text-xs text-zinc-400 mt-1 mb-4">Database label saat ini kosong atau filter aktif tidak menemukan kecocokan.</p>
                <div class="flex items-center justify-center gap-2">
                  <button
                    v-if="labelStore.filterMesin !== 'ALL' || labelStore.searchTerm || labelStore.filterStatus !== 'ALL'"
                    @click="selectMachineSheet('ALL')"
                    class="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    Reset Filter (Tampilkan Semua Mesin)
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination Footer (STICKY / FROZEN DI BAWAH HALAMAN) -->
      <div class="sticky bottom-0 z-10 bg-white/95 backdrop-blur-md p-3 sm:p-4 border-t border-zinc-200 shadow-md shadow-zinc-900/5 flex flex-col xl:flex-row items-center justify-between gap-3 text-xs text-zinc-600">
        <!-- Info Left -->
        <div class="flex items-center gap-2">
          <span class="text-zinc-500">Halaman</span>
          <span class="font-black text-zinc-900 bg-zinc-100 px-2.5 py-0.5 rounded-md border border-zinc-200">{{ labelPagination.current }}</span>
          <span class="text-zinc-500">dari <strong class="text-zinc-900">{{ labelPagination.total }}</strong></span>
          <span class="text-zinc-300">•</span>
          <span class="text-zinc-500">Total <strong class="text-red-600">{{ labelStore.filteredLabels.length }}</strong> label</span>
          
          <!-- Rows Per Page Selector -->
          <div class="flex items-center gap-1.5 ml-3">
            <span class="text-[11px] text-zinc-400 font-semibold">Tampil:</span>
            <select
              v-model.number="labelStore.rowsPerPage"
              class="px-2 py-1 text-xs border border-zinc-300 rounded-lg outline-none bg-white font-bold text-zinc-700 cursor-pointer"
            >
              <option :value="10">10 / hal</option>
              <option :value="25">25 / hal</option>
              <option :value="50">50 / hal</option>
              <option :value="100">100 / hal</option>
              <option :value="250">250 / hal</option>
            </select>
          </div>
        </div>

        <!-- Buttons Center/Right -->
        <div class="flex flex-wrap items-center gap-1">
          <!-- First Page -->
          <button
            :disabled="labelPagination.current <= 1"
            @click="labelStore.currentPage = 1"
            class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
            title="Halaman Pertama (First)"
          >
            ⏮ First
          </button>

          <!-- Prev Page -->
          <button
            :disabled="labelPagination.current <= 1"
            @click="labelStore.currentPage--"
            class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
            title="Halaman Sebelumnya (Prev)"
          >
            ◀ Prev
          </button>

          <!-- Page 1 if start > 1 -->
          <button
            v-if="labelPagination.showFirst"
            @click="labelStore.currentPage = 1"
            class="min-w-[30px] px-2 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 text-zinc-700 cursor-pointer text-xs"
          >
            1
          </button>

          <span v-if="labelPagination.hasFirstEllipsis" class="px-1 text-zinc-400 font-bold">...</span>

          <!-- Direct Page Numbers (±5 range) -->
          <button
            v-for="p in labelPagination.pages"
            :key="p"
            @click="labelStore.currentPage = p"
            :class="[
              'min-w-[30px] px-2 py-1 rounded-lg font-black transition-all cursor-pointer text-xs',
              p === labelPagination.current
                ? 'bg-red-600 text-white shadow-xs'
                : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
            ]"
          >
            {{ p }}
          </button>

          <span v-if="labelPagination.hasLastEllipsis" class="px-1 text-zinc-400 font-bold">...</span>

          <!-- Last Page if end < total -->
          <button
            v-if="labelPagination.showLast"
            @click="labelStore.currentPage = labelPagination.total"
            class="min-w-[30px] px-2 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 text-zinc-700 cursor-pointer text-xs"
          >
            {{ labelPagination.total }}
          </button>

          <!-- Next Page -->
          <button
            :disabled="labelPagination.current >= labelPagination.total"
            @click="labelStore.currentPage++"
            class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
            title="Halaman Selanjutnya (Next)"
          >
            Next ▶
          </button>

          <!-- Last Page -->
          <button
            :disabled="labelPagination.current >= labelPagination.total"
            @click="labelStore.currentPage = labelPagination.total"
            class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
            title="Halaman Terakhir (Last)"
          >
            Last ⏭
          </button>

          <!-- Jump to Page Input -->
          <div class="flex items-center gap-1 ml-2 pl-2 border-l border-zinc-300">
            <span class="text-[11px] text-zinc-500 font-semibold whitespace-nowrap">Lompat:</span>
            <input
              type="number"
              min="1"
              :max="labelPagination.total"
              v-model="jumpPageInput"
              @keyup.enter="jumpToPage"
              placeholder="Hal..."
              class="w-14 px-2 py-1 text-xs border border-zinc-300 rounded-lg outline-none text-center font-bold text-zinc-800 focus:border-red-500"
            />
            <button
              @click="jumpToPage"
              class="px-2 py-1 bg-zinc-800 hover:bg-zinc-900 text-white rounded-lg font-bold text-xs cursor-pointer"
            >
              Go
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════ MODE 2: PARENT-CHILD HIERARCHY TREE VIEW (STABLE & ALIGNED 4-LEVEL) ══════ -->
    <div v-else-if="viewMode === 'hierarchy'" class="space-y-4 animate-fade-in">
      <!-- Empty State -->
      <div v-if="hierarchyTree.length === 0" class="bg-white p-10 rounded-2xl border border-zinc-200 text-center text-zinc-400">
        <div class="text-3xl mb-2">📦</div>
        <p class="font-bold text-sm text-zinc-800">Tidak ada data label yang sesuai filter</p>
        <p class="text-xs text-zinc-400 mt-1 mb-4">Database label saat ini kosong atau filter aktif tidak menemukan kecocokan.</p>
        <div class="flex items-center justify-center gap-2">
          <button
            v-if="labelStore.filterMesin !== 'ALL' || labelStore.searchTerm || labelStore.filterStatus !== 'ALL'"
            @click="selectMachineSheet('ALL')"
            class="px-3 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-all cursor-pointer"
          >
            Reset Filter (Tampilkan Semua Mesin)
          </button>
        </div>
      </div>

      <!-- Hierarchy Date Pagination Bar (Top) -->
      <div v-if="allHierarchyDates.length > 0" class="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs">
        <div class="flex items-center gap-2 text-xs text-zinc-600">
          <span class="font-bold text-zinc-800">📅 Tanggal Produksi:</span>
          <span>Menampilkan <strong>{{ hierarchyTree.length }}</strong> dari total <strong>{{ allHierarchyDates.length }}</strong> tanggal</span>
          <span class="text-zinc-300">•</span>
          <span>Halaman <strong>{{ hierarchyPage }}</strong> dari <strong>{{ totalHierarchyPages }}</strong></span>
        </div>

        <div class="flex items-center gap-2">
          <!-- Pilihan jumlah tanggal per halaman -->
          <div class="flex items-center gap-1.5 text-xs text-zinc-500 mr-2">
            <span class="text-[11px]">Tampil:</span>
            <select
              v-model="hierarchyDatesPerPage"
              @change="hierarchyPage = 1"
              class="px-2 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 outline-none"
            >
              <option :value="5">5 Tanggal</option>
              <option :value="7">7 Tanggal (1 Minggu)</option>
              <option :value="14">14 Tanggal (2 Minggu)</option>
              <option :value="30">30 Tanggal (1 Bulan)</option>
            </select>
          </div>

          <!-- Tombol Prev / Next -->
          <button
            type="button"
            :disabled="hierarchyPage <= 1"
            @click="hierarchyPage--"
            class="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-zinc-700 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>◀</span> <span>Sebelumnya</span>
          </button>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs">
            {{ hierarchyPage }} / {{ totalHierarchyPages }}
          </span>
          <button
            type="button"
            :disabled="hierarchyPage >= totalHierarchyPages"
            @click="hierarchyPage++"
            class="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-zinc-700 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>Berikutnya</span> <span>▶</span>
          </button>
        </div>
      </div>

      <!-- LEVEL 1: TANGGAL NODES (Monochromatic: Subtle Light Zinc) -->
      <div
        v-for="dateNode in hierarchyTree"
        :key="dateNode.date"
        class="bg-white rounded-2xl border border-zinc-200/90 shadow-2xs overflow-hidden transition-all mb-3.5"
      >
        <!-- Tanggal Header (Level 1 Master Parent) -->
        <div
          @click="toggleDateExpand(dateNode.date)"
          class="px-4 py-2.5 bg-zinc-100/90 hover:bg-zinc-200/70 cursor-pointer flex items-center justify-between text-zinc-900 select-none transition-colors border-b border-zinc-200"
          title="Klik untuk buka/tutup seluruh shift pada tanggal ini"
        >
          <div class="flex items-center gap-2.5 min-w-0">
            <!-- Circular Checkbox Level 1 (Tanggal) -->
            <button
              type="button"
              @click.stop="toggleSelectDate(dateNode)"
              class="w-4 h-4 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer select-none"
              :class="[
                isDateAllSelected(dateNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                isDateSomeSelected(dateNode) ? 'bg-red-500 border-red-400 text-white' :
                'border-zinc-400 bg-white hover:border-red-500'
              ]"
              :title="isDateAllSelected(dateNode) ? 'Batalkan pilihan tanggal ini' : 'Pilih seluruh label tanggal ini'"
            >
              <svg v-if="isDateAllSelected(dateNode)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span v-else-if="isDateSomeSelected(dateNode)" class="w-1.5 h-1.5 rounded-full bg-white"></span>
            </button>

            <span class="w-5 h-5 rounded bg-white text-zinc-700 flex items-center justify-center text-[10px] font-black shrink-0 border border-zinc-300 shadow-2xs">
              {{ isDateExpanded(dateNode.date) ? '▾' : '▸' }}
            </span>
            <span class="text-xs sm:text-sm font-black tracking-tight text-zinc-900 flex items-center gap-1.5">
              <span>📅</span> {{ dateNode.displayDate }}
            </span>
            <span class="text-[11px] font-mono text-zinc-500">({{ dateNode.date }})</span>
          </div>

          <!-- Badges Summary per Tanggal (Minimalis & Ringkas) -->
          <div class="flex items-center gap-2 text-xs whitespace-nowrap">
            <span class="text-[11px] text-zinc-500 font-semibold hidden sm:inline">
              {{ dateNode.totalShifts }} Shift • {{ dateNode.totalLots }} Lot
            </span>
            <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-white text-zinc-800 border border-zinc-200 font-mono shadow-2xs" title="Total Roll Terpotong">
              {{ dateNode.totalRolls }} Roll
            </span>
            <span class="px-2.5 py-0.5 rounded text-[11px] font-black bg-zinc-900 text-white font-mono shadow-2xs" title="Total Netto Bersih">
              {{ dateNode.totalNetto }} kg
            </span>
            <span v-if="dateNode.totalWaste > 0" class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-rose-50 text-rose-700 border border-rose-200 font-mono" title="Total Waste">
              Waste: {{ dateNode.totalWaste }} kg
            </span>
            <div v-if="dateNode.passCount || dateNode.holdCount || dateNode.rejectCount" class="hidden md:flex items-center gap-1 text-[10px] font-bold ml-1">
              <span v-if="dateNode.passCount" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200" title="Roll PASS"><span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>{{ dateNode.passCount }}</span>
              <span v-if="dateNode.holdCount" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200" title="Roll HOLD"><span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>{{ dateNode.holdCount }}</span>
              <span v-if="dateNode.rejectCount" class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200" title="Roll REJECT"><span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>{{ dateNode.rejectCount }}</span>
            </div>
          </div>
        </div>

        <!-- Tanggal Content (LEVEL 2: OPERATOR / SHIFT LIST) -->
        <div v-if="isDateExpanded(dateNode.date)" class="p-2 sm:p-3 space-y-2.5 bg-white">
          <div
            v-for="shiftNode in dateNode.shifts"
            :key="shiftNode.uniqueKey"
            class="ml-2 sm:ml-4 pl-2.5 sm:pl-3 border-l-2 border-slate-300"
          >
            <!-- Shift Header (Level 2 Sub-Parent - Monochromatic: Cool Slate Tint) -->
            <div
              @click="toggleShiftExpand(shiftNode.uniqueKey)"
              @contextmenu.prevent="openShiftModal(shiftNode)"
              class="px-3 py-2 bg-slate-50/80 hover:bg-slate-100/90 border border-slate-200/80 rounded-xl cursor-pointer flex items-center justify-between select-none transition-colors shadow-2xs"
              title="Klik untuk buka/tutup lot di shift ini, atau Klik Kanan untuk Edit Shift & Waste"
            >
              <div class="flex items-center gap-2 min-w-0">
                <!-- Circular Checkbox Level 2 (Shift) -->
                <button
                  type="button"
                  @click.stop="toggleSelectShift(shiftNode)"
                  class="w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer select-none"
                  :class="[
                    isShiftAllSelected(shiftNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                    isShiftSomeSelected(shiftNode) ? 'bg-red-50 border-red-500 text-red-600' :
                    'border-zinc-300 bg-white hover:border-red-500'
                  ]"
                  :title="isShiftAllSelected(shiftNode) ? 'Batalkan pilihan shift ini' : 'Pilih seluruh roll di shift ini'"
                >
                  <svg v-if="isShiftAllSelected(shiftNode)" class="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                  <span v-else-if="isShiftSomeSelected(shiftNode)" class="w-1 h-1 rounded-full bg-red-600"></span>
                </button>

                <span class="w-4 h-4 rounded bg-slate-200 text-slate-700 flex items-center justify-center text-[9px] font-black shrink-0 border border-slate-300">
                  {{ isShiftExpanded(shiftNode.uniqueKey) ? '▾' : '▸' }}
                </span>

                <!-- Shift Badge & Operator -->
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-slate-200/80 text-slate-800 tracking-wide uppercase border border-slate-300/80">
                  Shift {{ shiftNode.shiftNum }}
                </span>
                <span class="text-xs font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
                  <span class="text-slate-500">👤</span> {{ shiftNode.operator }}
                </span>
              </div>

              <!-- Shift Right Badges & Edit Button -->
              <div class="flex items-center gap-2 text-[11px] whitespace-nowrap">
                <span class="text-zinc-400 font-semibold hidden sm:inline">{{ shiftNode.totalLots }} Lot</span>
                <span class="px-2 py-0.5 rounded bg-white text-zinc-700 font-bold border border-zinc-200 font-mono shadow-2xs">
                  {{ shiftNode.totalRolls }} Roll
                </span>
                <span class="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono font-bold">
                  {{ shiftNode.totalNetto }} kg
                </span>

                <!-- Waste Shift Badge (if set) -->
                <span
                  v-if="shiftNode.shiftWaste > 0"
                  class="px-2 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-mono font-bold text-[10.5px]"
                  :title="`Waste Shift: ${shiftNode.shiftWaste} kg`"
                >
                  🗑️ {{ shiftNode.shiftWaste }} kg
                </span>

                <!-- Edit Shift Button (Ghost Style) -->
                <button
                  @click.stop="openShiftModal(shiftNode)"
                  class="px-2 py-0.5 rounded text-[10px] font-bold bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 transition-all flex items-center gap-1 shrink-0 ml-0.5 shadow-2xs cursor-pointer"
                  title="Edit Data Shift & Input Waste Operator"
                >
                  <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                  <span class="hidden sm:inline">Edit Shift</span>
                </button>
              </div>
            </div>

            <!-- Shift Content (LEVEL 3: NO LOT INDUK LIST) -->
            <div v-if="isShiftExpanded(shiftNode.uniqueKey)" class="mt-2 space-y-2">
              <div
                v-for="lotNode in shiftNode.lots"
                :key="lotNode.uniqueKey"
                class="ml-3 sm:ml-5 pl-2.5 sm:pl-3 border-l-2 border-zinc-300"
              >
                <!-- Lot Header (Level 3 Sub-Parent - Monochromatic: Warm Stone Tint) -->
                <div
                  @click="toggleLotExpand(lotNode.uniqueKey)"
                  @contextmenu.prevent="openParentLotModal(lotNode)"
                  class="px-3 py-2 bg-stone-50/90 hover:bg-stone-100/90 border border-stone-200/80 rounded-xl cursor-pointer flex items-center justify-between select-none transition-colors shadow-2xs"
                  title="Klik untuk buka/tutup roll, atau Klik Kanan untuk Edit Data Parent Lot"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <!-- Circular Checkbox Level 3 (Lot) -->
                    <button
                      type="button"
                      @click.stop="toggleSelectLot(lotNode)"
                      class="w-3.5 h-3.5 rounded-full border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer select-none"
                      :class="[
                        isLotAllSelected(lotNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                        isLotSomeSelected(lotNode) ? 'bg-red-50 border-red-500 text-red-600' :
                        'border-zinc-300 bg-white hover:border-red-500'
                      ]"
                      :title="isLotAllSelected(lotNode) ? 'Batalkan pilihan lot ini' : 'Pilih seluruh roll di lot ini'"
                    >
                      <svg v-if="isLotAllSelected(lotNode)" class="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      <span v-else-if="isLotSomeSelected(lotNode)" class="w-1 h-1 rounded-full bg-red-600"></span>
                    </button>

                    <span class="w-4 h-4 rounded bg-stone-200 text-stone-700 flex items-center justify-center text-[9px] font-black shrink-0 border border-stone-300">
                      {{ isLotExpanded(lotNode.uniqueKey) ? '▾' : '▸' }}
                    </span>
                    <span class="text-xs font-black text-zinc-900 font-mono tracking-wide uppercase">
                      🏷️ {{ lotNode.lot }}
                    </span>
                    <span class="px-1.5 py-0.2 rounded text-[9.5px] font-black border uppercase bg-zinc-100 text-zinc-700 border-zinc-300">
                      {{ lotNode.mesin }}
                    </span>
                    <span class="text-[11px] font-mono text-zinc-500 font-bold hidden sm:inline">
                      SPK: <strong class="text-zinc-800">{{ lotNode.spk }}</strong>
                    </span>

                    <!-- Subtitle Dimensi Induk (Muted & Clean) -->
                    <span class="text-[11px] font-bold text-zinc-500 truncate hidden md:inline font-mono" title="Dimensi Induk Jumbo Roll">
                      • {{ [lotNode.jenis, lotNode.kode, `${lotNode.thickness}MC × ${lotNode.parentWidth || lotNode.width}MM`].filter(Boolean).join(' ') }}
                    </span>
                  </div>

                  <!-- Lot Right Badges & Edit Button -->
                  <div class="flex items-center gap-1.5 text-[11px] whitespace-nowrap">
                    <!-- Berat Teori Parent Badge -->
                    <span v-if="lotNode.parentBeratTeori" class="px-1.5 py-0.5 rounded bg-white border border-zinc-200 text-zinc-600 font-mono text-[10px] hidden lg:inline" title="Berat Teori Parent">
                      Teori: {{ lotNode.parentBeratTeori }} kg
                    </span>

                    <!-- Total Netto Child Badge -->
                    <span class="px-2 py-0.5 rounded bg-zinc-800 text-white font-mono font-bold text-[10.5px]" title="Total Netto Aktual Anak/Child">
                      {{ lotNode.totalNetto }} kg
                    </span>

                    <!-- Sisa Jumbo Badge (if any) -->
                    <span
                      v-if="lotNode.parentSisaKg > 0"
                      class="px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-300 font-mono font-bold text-[10px]"
                      :title="`Sisa Jumbo: ${lotNode.parentSisaMeter} Meter (${lotNode.parentSisaKg} kg)`"
                    >
                      Sisa: {{ lotNode.parentSisaKg }} kg
                    </span>

                    <!-- Selisih Berat & Toleransi Badge -->
                    <span
                      v-if="lotNode.diffNetto !== null"
                      :class="[
                        'px-1.5 py-0.5 rounded text-[10px] font-mono font-black border',
                        lotNode.diffStatus === 'OK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        lotNode.diffStatus === 'WARNING' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                        'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                      ]"
                      :title="`Selisih: ${lotNode.diffNetto >= 0 ? '+' : ''}${lotNode.diffNetto} kg (${lotNode.diffPercent}%)`"
                    >
                      {{ lotNode.diffNetto >= 0 ? '+' : '' }}{{ lotNode.diffNetto }} kg
                      <span class="opacity-75 hidden sm:inline">({{ lotNode.diffPercent }}%)</span>
                    </span>

                    <span class="px-1.5 py-0.5 rounded bg-white text-zinc-600 font-bold text-[10.5px] border border-zinc-200 font-mono">
                      {{ lotNode.totalItems }} Roll
                    </span>

                    <!-- Edit Parent Lot Button -->
                    <button
                      @click.stop="openParentLotModal(lotNode)"
                      class="px-2 py-0.5 rounded text-[10px] font-bold bg-white hover:bg-stone-200 border border-stone-300 text-zinc-700 transition-all flex items-center gap-1 shrink-0 ml-0.5 shadow-2xs cursor-pointer"
                      title="Edit Data Parent Lot"
                    >
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      <span class="hidden sm:inline">Edit Lot</span>
                    </button>
                  </div>
                </div>

                <!-- LEVEL 4: DAFTAR TURUNAN (MICRO-TABLE - Pure White & Spacious) -->
                <div v-if="isLotExpanded(lotNode.uniqueKey)" class="my-2 ml-3 sm:ml-5 pl-2 sm:pl-3 border-l-2 border-emerald-400/60">
                  <div class="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs">
                    <div class="overflow-x-auto">
                      <table class="w-full text-left text-xs border-collapse">
                        <thead class="bg-zinc-50/90 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border-b border-zinc-200 select-none">
                          <tr>
                            <th class="py-2 px-3 w-10 text-center">
                              <!-- Circular Checkbox Header -->
                              <button
                                type="button"
                                @click.stop="toggleSelectLot(lotNode)"
                                class="w-3.5 h-3.5 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                                :class="[
                                  isLotAllSelected(lotNode) ? 'bg-red-600 border-red-600 text-white shadow-2xs' :
                                  isLotSomeSelected(lotNode) ? 'bg-red-50 border-red-500 text-red-600' :
                                  'border-zinc-300 bg-white hover:border-red-500'
                                ]"
                                :title="isLotAllSelected(lotNode) ? 'Batalkan pilihan semua' : 'Pilih semua roll di tabel ini'"
                              >
                                <svg v-if="isLotAllSelected(lotNode)" class="w-2 h-2 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                                <span v-else-if="isLotSomeSelected(lotNode)" class="w-1 h-1 rounded-full bg-red-600"></span>
                              </button>
                            </th>
                            <th class="py-2 px-3 font-mono">Turunan</th>
                            <th class="py-2 px-3 font-mono">Kode Pack</th>
                            <th class="py-2 px-3">Ukuran & Panjang</th>
                            <th class="py-2 px-3 text-right">Netto</th>
                            <th class="py-2 px-3 text-center">Status</th>
                            <th class="py-2 px-3 text-center w-24">Aksi</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100 text-zinc-700 font-medium text-xs">
                          <tr
                            v-for="item in lotNode.items"
                            :key="item.id"
                            @contextmenu.prevent="openRowActionModal(item)"
                            :class="[
                              'transition-colors',
                              selectedIds.includes(item.id) ? 'bg-red-50/60' : 'hover:bg-zinc-50/70'
                            ]"
                          >
                            <!-- Circular Checkbox Cell -->
                            <td class="py-2 px-3 text-center whitespace-nowrap" @click.stop>
                              <button
                                type="button"
                                @click="toggleSelectItem(item.id)"
                                class="w-4 h-4 mx-auto rounded-full border-2 transition-all flex items-center justify-center cursor-pointer select-none"
                                :class="selectedIds.includes(item.id) ? 'bg-red-600 border-red-600 text-white shadow-2xs' : 'border-zinc-300 bg-white hover:border-red-500'"
                                :title="selectedIds.includes(item.id) ? 'Batalkan pilihan' : 'Pilih roll ini untuk cetak'"
                              >
                                <svg v-if="selectedIds.includes(item.id)" class="w-2.5 h-2.5 stroke-[3.5]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                              </button>
                            </td>
                            
                            <!-- Turunan -->
                            <td class="py-2 px-3 font-mono font-black whitespace-nowrap">
                              <span class="text-red-600 bg-red-50/80 px-1.5 py-0.5 rounded border border-red-200/80 uppercase text-[11px]">
                                {{ item.turunan }}
                              </span>
                            </td>

                            <!-- Kode Pack -->
                            <td class="py-2 px-3 font-mono whitespace-nowrap text-xs">
                              <span class="text-zinc-800">{{ item.kodePack }}</span><span class="text-red-600 font-bold">{{ item.subKode }}</span>
                            </td>

                            <!-- Ukuran & Panjang -->
                            <td class="py-2 px-3 whitespace-nowrap text-zinc-600 text-xs font-mono">
                              {{ item.width }} mm × {{ item.length || item.meter }} m
                              <span v-if="item.joint && item.joint > 0" class="text-amber-600 font-bold ml-1 text-[10px]">(J: {{ item.joint }})</span>
                            </td>

                            <!-- Netto -->
                            <td class="py-2 px-3 font-mono font-bold text-zinc-900 text-right whitespace-nowrap text-xs">
                              {{ item.netto }} kg
                            </td>

                            <!-- Status -->
                            <td class="py-2 px-3 text-center whitespace-nowrap">
                              <span :class="[
                                'px-2 py-0.5 rounded text-[9.5px] font-black border uppercase inline-block tracking-wider',
                                item.status === 'PASS' || item.status === 'OK' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                item.status === 'HOLD' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-rose-50 text-rose-700 border-rose-200'
                              ]">
                                {{ item.status }}
                              </span>
                            </td>

                            <!-- Aksi Buttons -->
                            <td class="py-2 px-3 text-center whitespace-nowrap" @click.stop>
                              <div class="flex items-center justify-center gap-1">
                                <button
                                  @click="previewSingle(item)"
                                  class="p-1 rounded text-zinc-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                                  title="Pratinjau"
                                >
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                </button>
                                <button
                                  v-if="!isLockedForUser(item)"
                                  @click="openModal(item)"
                                  class="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                  title="Edit"
                                >
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                </button>
                                <span
                                  v-else
                                  class="p-1 inline-flex items-center text-amber-500 cursor-not-allowed"
                                  title="🔒 Terkunci: Label telah diapprove Admin."
                                >
                                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                                </span>
                                <button
                                  @click="duplicateData(item)"
                                  class="p-1 rounded text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                                  title="Duplikat"
                                >
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                                <button
                                  v-if="!isLockedForUser(item)"
                                  @click="deleteData(item)"
                                  class="p-1 rounded text-zinc-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Hapus"
                                >
                                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                </button>
                                <span
                                  v-else
                                  class="p-1 inline-flex items-center text-zinc-300 cursor-not-allowed"
                                  title="🔒 Terkunci"
                                >
                                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                                </span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Hierarchy Date Pagination Bar (Bottom) -->
      <div v-if="allHierarchyDates.length > hierarchyDatesPerPage" class="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs mt-4">
        <div class="flex items-center gap-2 text-xs text-zinc-600">
          <span>Halaman <strong>{{ hierarchyPage }}</strong> dari <strong>{{ totalHierarchyPages }}</strong> (Total {{ allHierarchyDates.length }} tanggal)</span>
        </div>

        <div class="flex items-center gap-2">
          <button
            type="button"
            :disabled="hierarchyPage <= 1"
            @click="hierarchyPage--"
            class="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-zinc-700 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>◀</span> <span>Sebelumnya</span>
          </button>
          <span class="px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs">
            {{ hierarchyPage }} / {{ totalHierarchyPages }}
          </span>
          <button
            type="button"
            :disabled="hierarchyPage >= totalHierarchyPages"
            @click="hierarchyPage++"
            class="px-3 py-1.5 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold text-zinc-700 flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>Berikutnya</span> <span>▶</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ══════ MODAL EDIT DATA SHIFT & WASTE OPERATOR (LEVEL 2) ══════ -->
    <div
      v-if="showShiftModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in"
      @click.self="showShiftModal = false"
    >
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col">
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-slate-50/90 sticky top-0 z-10 backdrop-blur-md">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-sm text-sm">
              👤
            </div>
            <div>
              <h3 class="text-sm font-black text-zinc-900 uppercase tracking-tight">Edit Shift & Input Waste Operator</h3>
              <p class="text-[11px] text-zinc-500 font-mono">
                Shift: <strong class="text-blue-600">{{ shiftForm.oldShift }}</strong> • Operator: <strong class="text-zinc-800">{{ shiftForm.oldOperator }}</strong> • {{ currentEditingShiftNode?.items?.length || 0 }} Roll Terpotong
              </p>
            </div>
          </div>
          <button
            @click="showShiftModal = false"
            class="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- Modal Form Body -->
        <form @submit.prevent="saveShiftData" class="p-5 space-y-4 text-xs">
          <!-- INFO ALERT: SHIFT & WASTE -->
          <div class="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-1 text-zinc-700">
            <div class="font-black text-blue-900 flex items-center gap-1.5">
              <span>ℹ️ Tanggung Jawab Waste & Loss Material Shift:</span>
            </div>
            <p class="text-[11px] text-zinc-600">
              Limbah operasional (*Shift Waste*) dan akumulasi defisit material dari seluruh lot induk dipertanggungjawabkan pada shift kerja operator terkait.
            </p>
          </div>

          <!-- GRID INPUT SHIFT & OPERATOR -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <!-- PILIH SHIFT -->
            <div>
              <label class="block font-bold text-zinc-700 mb-1">
                Pilih Shift Kerja <span class="text-red-600">*</span>
              </label>
              <select
                v-model="shiftForm.shift"
                required
                class="w-full px-3 py-2 border border-zinc-300 rounded-lg font-black text-zinc-900 bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
              >
                <option value="1">Shift 1 (Pagi / 07:00 - 15:00)</option>
                <option value="2">Shift 2 (Sore / 15:00 - 23:00)</option>
                <option value="3">Shift 3 (Malam / 23:00 - 07:00)</option>
              </select>
            </div>

            <!-- NAMA OPERATOR -->
            <div>
              <label class="block font-bold text-zinc-700 mb-1">
                Nama / Kode Operator <span class="text-red-600">*</span>
              </label>
              <input
                v-model="shiftForm.operator"
                type="text"
                list="operatorShiftSuggestions"
                required
                class="w-full px-3 py-2 border border-zinc-300 rounded-lg font-bold text-zinc-900 uppercase bg-white focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Contoh: AGUS, HENDRA..."
              />
              <datalist id="operatorShiftSuggestions">
                <option v-for="op in configStore.operatorList" :key="op.kodeOperator" :value="op.nama">
                  {{ op.nama }} ({{ op.kodeOperator }}) - {{ op.mesin }}
                </option>
              </datalist>
            </div>
          </div>

          <!-- SECTION INPUT WASTE -->
          <div class="p-3.5 bg-rose-50/70 border border-rose-200 rounded-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-bold text-rose-950 text-xs flex items-center gap-1.5">
                <span>🗑️ Input Waste Manual Shift (Timbangan Fisik):</span>
              </span>
              <span class="text-[10px] text-rose-800 font-mono font-bold">Satuan KG</span>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- BERAT WASTE (KG) -->
              <div>
                <label class="block font-bold text-rose-900 mb-1 flex items-center justify-between">
                  <span>Berat Waste Fisik (kg)</span>
                  <span class="text-[10px] text-rose-700 font-mono font-bold">Kilogram</span>
                </label>
                <div class="relative">
                  <input
                    v-model="shiftForm.shiftWaste"
                    type="number"
                    step="0.01"
                    min="0"
                    class="w-full px-3 py-1.5 border border-rose-300 rounded-lg font-mono font-black text-rose-950 bg-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none pr-10"
                    placeholder="0.00"
                  />
                  <span class="absolute right-3 top-1.5 text-rose-600 font-bold font-mono">kg</span>
                </div>
                <p class="text-[10px] text-rose-800 mt-0.5">Total buangan fisik yang ditimbang manual.</p>
              </div>

              <!-- KETERANGAN WASTE -->
              <div>
                <label class="block font-bold text-rose-900 mb-1">
                  Keterangan / Rincian Waste
                </label>
                <input
                  v-model="shiftForm.shiftWasteNote"
                  type="text"
                  list="wasteSuggestionsShift"
                  class="w-full px-3 py-1.5 border border-rose-300 rounded-lg font-bold text-zinc-900 bg-white focus:ring-1 focus:ring-rose-500 focus:border-rose-500 outline-none"
                  placeholder="Contoh: Trim Sisi, Setting, Kerut, Core..."
                />
                <datalist id="wasteSuggestionsShift">
                  <option value="Trim Pisau Sisi"></option>
                  <option value="Setting / Start-up Mesin"></option>
                  <option value="Kerut / Gelombang"></option>
                  <option value="Core / Sisa Pipa Jumbo"></option>
                  <option value="Sambungan Roll"></option>
                  <option value="Terkontaminasi / Kotor"></option>
                </datalist>
                <p class="text-[10px] text-rose-800 mt-0.5">Alasan/rincian buangan selama shift.</p>
              </div>
            </div>
          </div>

          <!-- AKUMULASI DEFISIT LOT PADA SHIFT INI -->
          <div v-if="currentEditingShiftNode?.shiftUnaccountedDeficit > 0" class="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-amber-950">
            <div class="flex items-center gap-2">
              <span class="text-base">⚠️</span>
              <div>
                <div class="font-black text-xs">Akumulasi Defisit Berat Lot Induk:</div>
                <div class="text-[11px] text-amber-800">Terdapat akumulasi selisih kurang material dari seluruh lot pada shift ini.</div>
              </div>
            </div>
            <div class="text-right">
              <span class="px-2 py-1 rounded bg-amber-200/80 font-mono font-black text-xs text-amber-900">
                +{{ currentEditingShiftNode.shiftUnaccountedDeficit }} kg Loss
              </span>
            </div>
          </div>

          <!-- RINGKASAN EFISIENSI & OUTPUT SHIFT -->
          <div class="p-3.5 bg-zinc-900 text-white rounded-xl space-y-2.5 shadow-md">
            <div class="flex items-center justify-between border-b border-zinc-800 pb-1.5">
              <span class="font-black text-xs uppercase tracking-wider text-blue-400">📊 Neraca Bahan & Akuntabilitas Shift</span>
              <span class="text-[10px] font-mono text-zinc-400">Total Material = Netto + Sisa + Waste</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
              <div class="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/80">
                <div class="text-[9.5px] text-zinc-400 uppercase font-bold">Netto Roll</div>
                <div class="text-sm font-black font-mono text-emerald-400 mt-0.5">
                  {{ parseFloat(currentEditingShiftNode?.totalNetto || 0).toFixed(2) }} <span class="text-[10px]">kg</span>
                </div>
              </div>

              <div class="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/80">
                <div class="text-[9.5px] text-zinc-400 uppercase font-bold">Sisa Jumbo</div>
                <div class="text-sm font-black font-mono text-cyan-400 mt-0.5">
                  {{ (currentEditingShiftNode?.totalShiftSisaJumboKg || 0).toFixed(2) }} <span class="text-[10px]">kg</span>
                </div>
              </div>

              <div class="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/80">
                <div class="text-[9.5px] text-zinc-400 uppercase font-bold">Total Waste</div>
                <div class="text-sm font-black font-mono text-rose-400 mt-0.5">
                  {{ ((parseFloat(shiftForm.shiftWaste) || 0) + (currentEditingShiftNode?.shiftUnaccountedDeficit || 0)).toFixed(2) }} <span class="text-[10px]">kg</span>
                </div>
              </div>

              <div class="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/80">
                <div class="text-[9.5px] text-zinc-400 uppercase font-bold">Rasio Waste</div>
                <div class="text-sm font-black font-mono mt-0.5" :class="computedShiftWasteRatio <= 5 ? 'text-emerald-400' : 'text-amber-400'">
                  {{ computedShiftWasteRatio.toFixed(2) }}%
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200">
            <button
              type="button"
              @click="showShiftModal = false"
              class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-5 py-2 rounded-xl text-xs font-black text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>
              <span>Simpan Data Shift & Waste</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ══════ MODAL EDIT DATA PARENT LOT (LEVEL 3) ══════ -->
    <div
      v-if="showParentLotModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-zinc-950/65 backdrop-blur-xs animate-fade-in"
      @click.self="showParentLotModal = false"
    >
      <div class="bg-white rounded-2xl border border-zinc-200/90 shadow-2xl w-full max-w-5xl xl:max-w-6xl max-h-[94vh] overflow-y-auto flex flex-col">
        <!-- Modal Header -->
        <div class="px-6 py-4 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/80 sticky top-0 z-20 backdrop-blur-md">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <h3 class="text-sm font-black text-zinc-900 tracking-tight uppercase">Rekonsiliasi Material & Parent Lot</h3>
                <span class="px-2 py-0.5 rounded-md text-[10.5px] font-mono font-bold bg-zinc-900 text-white">
                  {{ parentLotForm.oldLot }}
                </span>
                <span class="px-2 py-0.5 rounded-md text-[10.5px] font-bold border uppercase" :class="[
                  parentLotForm.mesin === 'CASTING' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                  parentLotForm.mesin === 'METALIZE' ? 'bg-sky-100 text-sky-900 border-sky-300' :
                  parentLotForm.mesin === 'REWIND' ? 'bg-purple-100 text-purple-900 border-purple-300' :
                  'bg-emerald-100 text-emerald-900 border-emerald-300'
                ]">
                  {{ parentLotForm.mesin }}
                </span>
              </div>
              <p class="text-[11px] text-zinc-500 font-mono mt-0.5">
                SPK: <strong class="text-zinc-700">{{ parentLotForm.spk || '-' }}</strong> • {{ currentEditingLotNode?.items?.length || 0 }} Roll Terhubung
              </p>
            </div>
          </div>

          <button
            @click="showParentLotModal = false"
            class="p-2 rounded-xl text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 transition-colors cursor-pointer"
            title="Tutup Modal"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <!-- KPI Quick Bar (4 Stat Cards) -->
        <div class="px-6 py-3 bg-zinc-900 text-white border-b border-zinc-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div class="border-r border-zinc-800 pr-2">
            <div class="text-[10px] text-zinc-400 uppercase font-sans font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400"></span>
              <span>1. Material Masuk</span>
            </div>
            <div class="text-sm font-bold text-amber-300 mt-0.5">
              {{ computedParentBeratTeori.toFixed(2) }} <span class="text-[10px] text-zinc-400">kg</span>
            </div>
          </div>

          <div class="border-r border-zinc-800 pr-2">
            <div class="text-[10px] text-zinc-400 uppercase font-sans font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>2. Output Hasil</span>
            </div>
            <div class="text-sm font-bold text-emerald-300 mt-0.5">
              {{ currentLotChildNettoSum.toFixed(2) }} <span class="text-[10px] text-zinc-400">kg</span>
            </div>
          </div>

          <div class="border-r border-zinc-800 pr-2">
            <div class="text-[10px] text-zinc-400 uppercase font-sans font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-cyan-400"></span>
              <span>3. Sisa Jumbo</span>
            </div>
            <div class="text-sm font-bold text-cyan-300 mt-0.5">
              {{ computedBeratSisaJumbo.toFixed(2) }} <span class="text-[10px] text-zinc-400">kg</span>
              <span v-if="parentLotForm.sisaMeter > 0" class="text-[10px] text-zinc-400 ml-1">({{ parentLotForm.sisaMeter }}M)</span>
            </div>
          </div>

          <div>
            <div class="text-[10px] text-zinc-400 uppercase font-sans font-bold flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full" :class="toleranceStatus.level === 'OK' ? 'bg-emerald-400' : toleranceStatus.level === 'WARNING' ? 'bg-amber-400' : 'bg-red-400'"></span>
              <span>4. Selisih (Loss)</span>
            </div>
            <div class="text-sm font-bold mt-0.5 flex items-center gap-1.5" :class="toleranceStatus.color">
              <span>{{ weightDiffSign }}{{ Math.abs(computedWeightDiff).toFixed(2) }} kg</span>
              <span class="text-[10px] opacity-80">({{ computedWeightDiffPercent.toFixed(1) }}%)</span>
            </div>
          </div>
        </div>

        <!-- Modal Form Body -->
        <form @submit.prevent="saveParentLotData" class="p-6 space-y-5 text-xs">
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            <!-- ══════ LEFT COLUMN (SPAN 7): MATERIAL INPUT & MASTER SPECS ══════ -->
            <div class="lg:col-span-7 space-y-4">
              
              <!-- Card: Master Film Specifications -->
              <div class="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span class="font-bold text-zinc-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    <span>Spesifikasi Master & Identitas Parent Lot</span>
                  </span>
                  <span class="text-[10px] text-zinc-400 font-mono">Diterapkan ke seluruh roll child</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <!-- NO LOT INDUK -->
                  <div class="sm:col-span-2">
                    <label class="block font-bold text-zinc-700 mb-1">
                      No Lot Induk Aktif <span class="text-red-500">*</span>
                    </label>
                    <input
                      v-model="parentLotForm.newLot"
                      type="text"
                      required
                      class="w-full px-3 py-1.5 border border-zinc-300 rounded-lg font-mono font-black text-zinc-900 uppercase focus:ring-1 focus:ring-zinc-900 outline-none bg-white"
                      placeholder="No Lot Induk"
                    />
                  </div>

                  <!-- NO SPK -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">No SPK</label>
                    <input
                      v-model="parentLotForm.spk"
                      type="text"
                      class="w-full px-3 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900 uppercase focus:ring-1 focus:ring-zinc-900 outline-none bg-white"
                      placeholder="SPK"
                    />
                  </div>

                  <!-- JENIS FILM -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">Jenis Film <span class="text-red-500">*</span></label>
                    <select
                      v-model="parentLotForm.jenis"
                      @change="onParentJenisChange"
                      required
                      class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-bold text-zinc-900 bg-white focus:ring-1 focus:ring-zinc-900 outline-none"
                    >
                      <option v-for="j in jenisOptions" :key="j" :value="j">{{ j }}</option>
                    </select>
                  </div>

                  <!-- KODE FORMULA -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">Kode / Tipe</label>
                    <input
                      v-model="parentLotForm.kode"
                      type="text"
                      class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900 uppercase focus:ring-1 focus:ring-zinc-900 outline-none bg-white"
                      placeholder="Contoh: L01"
                    />
                  </div>

                  <!-- THICKNESS -->
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1">Thickness (MC) <span class="text-red-500">*</span></label>
                    <div class="relative">
                      <input
                        v-model="parentLotForm.thickness"
                        type="number"
                        step="any"
                        required
                        class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-black text-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none bg-white pr-8"
                        placeholder="20"
                      />
                      <span class="absolute right-2.5 top-1.5 text-zinc-400 font-bold font-mono text-[10px]">MC</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ══════ KASUS 1: MESIN REWIND / MULTI-PARENT JOINT ROLLS ══════ -->
              <div v-if="parentLotForm.mesin === 'REWIND' || parentLotForm.isMultiParent" class="p-4 bg-indigo-50/50 border border-indigo-200/80 rounded-xl space-y-3">
                <div class="flex items-center justify-between border-b border-indigo-200/70 pb-2">
                  <div>
                    <span class="font-bold text-indigo-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-indigo-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                      <span>Sambungan Multi-Parent Roll (Joint 2-3 Roll)</span>
                    </span>
                    <p class="text-[10px] text-indigo-800 mt-0.5">Pilih radio button untuk menentukan nomor lot induk aktif yang digunakan (default: roll terakhir).</p>
                  </div>

                  <button
                    type="button"
                    @click="addMultiParentRoll"
                    class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Tambah Roll Sambungan</span>
                  </button>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(pRoll, pIdx) in parentLotForm.multiParents"
                    :key="pIdx"
                    class="p-3 bg-white border rounded-xl transition-all"
                    :class="selectedActiveParentLotIndex === pIdx ? 'border-indigo-500 shadow-xs ring-1 ring-indigo-500/20' : 'border-zinc-200'"
                  >
                    <div class="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100">
                      <!-- Radio Button Selector for Active Parent Lot -->
                      <label class="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="radio"
                          name="activeParentRoll"
                          :checked="selectedActiveParentLotIndex === pIdx"
                          @change="onSelectActiveParentLot(pIdx)"
                          class="w-3.5 h-3.5 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span class="font-bold text-xs" :class="selectedActiveParentLotIndex === pIdx ? 'text-indigo-900' : 'text-zinc-600'">
                          Roll Sambungan #{{ pIdx + 1 }}
                        </span>
                        <span v-if="selectedActiveParentLotIndex === pIdx" class="px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-indigo-100 text-indigo-800">
                          Lot Induk Aktif
                        </span>
                      </label>

                      <div class="flex items-center gap-2">
                        <span class="text-[10.5px] font-mono text-zinc-500">
                          Teori: <strong class="text-zinc-800">{{ calculateBeratTeori(pRoll.thickness || parentLotForm.thickness, pRoll.width || parentLotForm.parentWidth, pRoll.meter, parentLotForm.parentDensity).toFixed(2) }} kg</strong>
                        </span>
                        <button
                          type="button"
                          @click="removeMultiParentRoll(pIdx)"
                          class="p-1 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus roll sambungan ini"
                        >
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                      </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 text-xs">
                      <div>
                        <label class="text-[10px] font-bold text-zinc-500">No Lot Induk</label>
                        <input
                          v-model="pRoll.lotNo"
                          @input="onMultiParentLotChange(pIdx)"
                          type="text"
                          class="w-full px-2 py-1 border border-zinc-300 rounded font-mono font-bold uppercase text-zinc-900 bg-zinc-50 focus:bg-white"
                          placeholder="No Lot"
                        />
                      </div>
                      <div>
                        <label class="text-[10px] font-bold text-zinc-500">Lebar (mm)</label>
                        <input v-model="pRoll.width" type="number" class="w-full px-2 py-1 border border-zinc-300 rounded font-mono text-zinc-900" placeholder="Width" />
                      </div>
                      <div>
                        <label class="text-[10px] font-bold text-zinc-500">Panjang (M)</label>
                        <input v-model="pRoll.meter" type="number" class="w-full px-2 py-1 border border-zinc-300 rounded font-mono text-zinc-900" placeholder="Meter" />
                      </div>
                      <div>
                        <label class="text-[10px] font-bold text-zinc-500">Keterangan Joint</label>
                        <input v-model="pRoll.note" type="text" class="w-full px-2 py-1 border border-zinc-300 rounded text-[11px]" placeholder="Misal: Roll Awal / Sambungan" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ══════ KASUS 2: MESIN CASTING / RESIN CONSUMPTION RECIPE ══════ -->
              <div v-else-if="parentLotForm.mesin === 'CASTING' || parentLotForm.isResinMode" class="p-4 bg-amber-50/50 border border-amber-200/80 rounded-xl space-y-3">
                <div class="flex items-center justify-between border-b border-amber-200/70 pb-2">
                  <div>
                    <span class="font-bold text-amber-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                      <svg class="w-3.5 h-3.5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31L4.69 18.5a2 2 0 0 0 1.71 3h11.2a2 2 0 0 0 1.71-3L14 9.31V2"></path></svg>
                      <span>Resep & Konsumsi Biji Plastik (Resin Batch)</span>
                    </span>
                    <p class="text-[10px] text-amber-800 mt-0.5">Catat seluruh konsumsi bahan baku per layer (Core, Skin, MB, Regrind).</p>
                  </div>

                  <button
                    type="button"
                    @click="addResinItem"
                    class="px-2.5 py-1 rounded-lg text-[10.5px] font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-2xs cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span>Tambah Komponen Resin</span>
                  </button>
                </div>

                <div class="space-y-2">
                  <div
                    v-for="(rItem, rIdx) in parentLotForm.resinConsumptions"
                    :key="rIdx"
                    class="p-2.5 bg-white border border-amber-200 rounded-lg grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                  >
                    <div>
                      <label class="text-[10px] font-bold text-zinc-500">Nama Resin / Layer</label>
                      <input v-model="rItem.name" type="text" class="w-full px-2 py-1 border border-zinc-300 rounded font-bold text-zinc-900" placeholder="PP Core Layer" />
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-zinc-500">Kode / Lot Resin</label>
                      <input v-model="rItem.lot" type="text" class="w-full px-2 py-1 border border-zinc-300 rounded font-mono uppercase text-zinc-900" placeholder="Lot Resin" />
                    </div>
                    <div>
                      <label class="text-[10px] font-bold text-zinc-500">Berat Masuk (kg)</label>
                      <input v-model="rItem.weight" type="number" step="0.1" class="w-full px-2 py-1 border border-zinc-300 rounded font-mono font-bold text-zinc-900" placeholder="Kg" />
                    </div>
                    <div class="flex items-center justify-end pt-3 sm:pt-0">
                      <button type="button" @click="removeResinItem(rIdx)" class="p-1 text-zinc-400 hover:text-red-600 rounded transition-colors" title="Hapus">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                    </div>
                  </div>

                  <div class="text-right text-xs font-bold text-amber-900 pt-1">
                    Total Resin Terpakai: <span class="font-mono text-sm font-black text-amber-950">{{ totalResinWeight.toFixed(2) }} kg</span>
                  </div>
                </div>
              </div>

              <!-- ══════ KASUS STANDAR: SLITTING DIMENSIONS & SISA JUMBO ══════ -->
              <div v-else class="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-3">
                <div class="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span class="font-bold text-zinc-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                    <span>Dimensi Induk Slitting & Sisa Jumbo</span>
                  </span>
                  <span class="text-[10.5px] font-mono text-zinc-500">
                    Lebar = {{ parentLotForm.chartinganBaseWidth }} + {{ parentLotForm.trim || 0 }} = <strong>{{ parentLotForm.parentWidth }} mm</strong>
                  </span>
                </div>

                <!-- Breakdown Positions & Sequences -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div class="p-2.5 bg-white rounded-lg border border-zinc-200 space-y-1">
                    <div class="font-bold text-zinc-700 text-[10.5px]">Posisi Charting (Lebar Sisi):</div>
                    <div class="text-zinc-600 font-mono text-[10.5px]">
                      {{ parentLotForm.uniqueChartList.map(c => `${c.chartingan}: ${c.width}mm`).join(' • ') || '-' }}
                    </div>
                  </div>

                  <div class="p-2.5 bg-white rounded-lg border border-zinc-200 space-y-1">
                    <div class="font-bold text-zinc-700 text-[10.5px]">Urutan Putaran Potong (Panjang):</div>
                    <div class="text-zinc-600 font-mono text-[10.5px]">
                      {{ parentLotForm.uniqueSeqList.map(s => `#${String(s.noUrut).padStart(2, '0')}: ${s.length}M`).join(' • ') || '-' }}
                    </div>
                  </div>
                </div>

                <!-- Inputs: Trim, Width, Length, Sisa Jumbo -->
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-zinc-200">
                  <div>
                    <label class="block font-bold text-zinc-700 mb-1 text-[10.5px]">Trim Sisi (mm)</label>
                    <input
                      v-model="parentLotForm.trim"
                      @input="onTrimChange"
                      type="number"
                      step="any"
                      class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold text-zinc-900 bg-white outline-none focus:ring-1 focus:ring-zinc-900"
                      placeholder="20"
                    />
                  </div>

                  <div>
                    <label class="block font-bold text-zinc-700 mb-1 text-[10.5px]">Lebar Parent (mm)</label>
                    <input
                      v-model="parentLotForm.parentWidth"
                      @input="onParentWidthChange"
                      type="number"
                      step="any"
                      required
                      class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-black text-zinc-900 bg-zinc-100/80 outline-none"
                      placeholder="2220"
                    />
                  </div>

                  <div>
                    <label class="block font-bold text-zinc-700 mb-1 text-[10.5px]">Panjang Parent (M)</label>
                    <input
                      v-model="parentLotForm.parentMeter"
                      type="number"
                      step="any"
                      required
                      class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-black text-zinc-900 bg-zinc-100/80 outline-none"
                      placeholder="2500"
                    />
                  </div>

                  <div>
                    <label class="block font-bold text-blue-900 mb-1 text-[10.5px] flex items-center justify-between">
                      <span>Sisa Jumbo (M)</span>
                      <span class="text-[9.5px] font-mono text-blue-700 font-bold">{{ computedBeratSisaJumbo.toFixed(1) }} kg</span>
                    </label>
                    <input
                      v-model="parentLotForm.sisaMeter"
                      type="number"
                      step="any"
                      min="0"
                      class="w-full px-2.5 py-1.5 border border-blue-300 rounded-lg font-mono font-black text-blue-900 bg-blue-50/50 focus:ring-1 focus:ring-blue-500 outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

            </div>

            <!-- ══════ RIGHT COLUMN (SPAN 5): VISUAL DIAGRAM & FINISHED OUTPUT ══════ -->
            <div class="lg:col-span-5 space-y-4">
              
              <!-- Card: Visual Material Balance Diagram -->
              <div class="p-4 bg-zinc-900 text-white rounded-xl space-y-3.5 shadow-sm">
                <div class="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <span class="font-bold text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                    <span>Diagram Keseimbangan Bahan</span>
                  </span>
                  <span class="text-[10px] font-mono text-zinc-400">Total Material In = 100%</span>
                </div>

                <!-- Multi-Segment Visual Stacked Progress Bar -->
                <div class="space-y-1.5">
                  <div class="h-4 w-full bg-zinc-800 rounded-md overflow-hidden flex shadow-inner border border-zinc-700/50">
                    <!-- Segment 1: Child Netto Yield (Emerald) -->
                    <div
                      :style="{ width: `${chartYieldChildPct}%` }"
                      class="bg-emerald-500 hover:bg-emerald-400 transition-all duration-300 relative group"
                      :title="`Output Child: ${currentLotChildNettoSum.toFixed(2)} kg (${chartYieldChildPct.toFixed(1)}%)`"
                    ></div>

                    <!-- Segment 2: Sisa Jumbo Residual (Cyan) -->
                    <div
                      :style="{ width: `${chartYieldSisaPct}%` }"
                      class="bg-cyan-500 hover:bg-cyan-400 transition-all duration-300 relative group"
                      :title="`Sisa Jumbo: ${computedBeratSisaJumbo.toFixed(2)} kg (${chartYieldSisaPct.toFixed(1)}%)`"
                    ></div>

                    <!-- Segment 3: Loss / Defisit (Rose) -->
                    <div
                      v-if="computedWeightDiff > 0"
                      :style="{ width: `${chartYieldLossPct}%` }"
                      class="bg-rose-500 hover:bg-rose-400 transition-all duration-300 relative group"
                      :title="`Loss / Selisih Kurang: ${computedWeightDiff.toFixed(2)} kg (${chartYieldLossPct.toFixed(1)}%)`"
                    ></div>

                    <!-- Segment 4: Surplus (Purple) -->
                    <div
                      v-else-if="computedWeightDiff < 0"
                      :style="{ width: `${chartYieldSurplusPct}%` }"
                      class="bg-purple-500 hover:bg-purple-400 transition-all duration-300 relative group"
                      :title="`Surplus / Lebih: ${Math.abs(computedWeightDiff).toFixed(2)} kg (${chartYieldSurplusPct.toFixed(1)}%)`"
                    ></div>
                  </div>

                  <!-- Bar Legend Labels -->
                  <div class="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-0.5">
                    <span class="flex items-center gap-1">
                      <span class="w-2 h-2 rounded-xs bg-emerald-500"></span>
                      <span>Output {{ chartYieldChildPct.toFixed(1) }}%</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="w-2 h-2 rounded-xs bg-cyan-500"></span>
                      <span>Sisa {{ chartYieldSisaPct.toFixed(1) }}%</span>
                    </span>
                    <span class="flex items-center gap-1">
                      <span class="w-2 h-2 rounded-xs" :class="computedWeightDiff >= 0 ? 'bg-rose-500' : 'bg-purple-500'"></span>
                      <span>{{ computedWeightDiff >= 0 ? 'Loss' : 'Surplus' }} {{ Math.abs(computedWeightDiffPercent).toFixed(1) }}%</span>
                    </span>
                  </div>
                </div>

                <!-- Balance Comparative Stat Box -->
                <div class="grid grid-cols-2 gap-2 text-center pt-2 border-t border-zinc-800">
                  <div class="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/60">
                    <div class="text-[9.5px] text-zinc-400 uppercase font-bold">Total Terdata</div>
                    <div class="text-sm font-bold font-mono text-cyan-300 mt-0.5">
                      {{ computedTotalOutputTerdata.toFixed(2) }} <span class="text-[10px]">kg</span>
                    </div>
                    <div class="text-[9px] text-zinc-500 font-mono">Netto + Sisa</div>
                  </div>

                  <div class="bg-zinc-800/80 p-2 rounded-lg border border-zinc-700/60">
                    <div class="text-[9.5px] text-zinc-400 uppercase font-bold">Selisih Material</div>
                    <div class="text-sm font-bold font-mono mt-0.5" :class="toleranceStatus.color">
                      {{ weightDiffSign }}{{ Math.abs(computedWeightDiff).toFixed(2) }} <span class="text-[10px]">kg</span>
                    </div>
                    <div class="text-[9px] font-mono" :class="toleranceStatus.color">
                      {{ computedWeightDiffPercent.toFixed(1) }}% Deviasi
                    </div>
                  </div>
                </div>

                <!-- Tolerance Alert Box (Clean Minimalist) -->
                <div
                  class="p-2.5 rounded-lg border flex items-start gap-2.5 text-[11px] transition-all"
                  :class="toleranceStatus.alertBg"
                >
                  <div class="shrink-0 mt-0.5">
                    <svg v-if="toleranceStatus.icon === 'check'" class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    <svg v-else-if="toleranceStatus.icon === 'alert'" class="w-4 h-4 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                    <svg v-else class="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                  </div>
                  <div>
                    <div class="font-bold uppercase tracking-tight">{{ toleranceStatus.label }}</div>
                    <p class="text-[10px] opacity-90 mt-0.5 leading-relaxed">{{ toleranceStatus.description }}</p>
                  </div>
                </div>
              </div>

              <!-- Card: Finished Child Rolls Output List -->
              <div class="p-4 bg-zinc-50/70 border border-zinc-200/80 rounded-xl space-y-2.5">
                <div class="flex items-center justify-between border-b border-zinc-200 pb-2">
                  <span class="font-bold text-zinc-800 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                    <svg class="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    <span>Daftar Roll Hasil (Output Child)</span>
                  </span>
                  <span class="text-[10.5px] font-bold text-zinc-600 font-mono">
                    {{ currentEditingLotNode?.items?.length || 0 }} Roll
                  </span>
                </div>

                <!-- Child Roll Compact List -->
                <div class="max-h-48 overflow-y-auto space-y-1 pr-1">
                  <div
                    v-for="ch in currentEditingLotNode?.items || []"
                    :key="ch.id || ch.uniqId || ch.lotAkhir"
                    class="px-2.5 py-1.5 bg-white border border-zinc-200 rounded-lg flex items-center justify-between text-xs hover:border-zinc-300 transition-colors"
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span class="w-5 h-5 rounded bg-zinc-100 font-mono font-black text-[10px] text-zinc-800 flex items-center justify-center shrink-0">
                        {{ ch.turunan || '-' }}
                      </span>
                      <div class="truncate">
                        <span class="font-mono font-bold text-zinc-900 text-[11px]">{{ ch.lotAkhir || ch.lot }}</span>
                        <span class="text-[10px] text-zinc-400 font-mono ml-1.5">{{ ch.width }}mm × {{ ch.length }}M</span>
                      </div>
                    </div>

                    <div class="flex items-center gap-2 shrink-0">
                      <span class="font-mono font-black text-zinc-900 text-xs">{{ parseFloat(ch.netto || ch.berat || 0).toFixed(2) }} kg</span>
                      <span class="px-1.5 py-0.2 rounded text-[9px] font-bold" :class="[
                        ch.status === 'PASS' || ch.status === 'OK' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        ch.status === 'HOLD' ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                        'bg-red-50 text-red-700 border border-red-200'
                      ]">
                        {{ ch.status || 'PASS' }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Footer Child Sum -->
                <div class="pt-2 border-t border-zinc-200 flex items-center justify-between text-xs font-mono font-bold text-zinc-700">
                  <span>Total Netto Aktual:</span>
                  <span class="text-sm font-black text-emerald-600">{{ currentLotChildNettoSum.toFixed(2) }} kg</span>
                </div>
              </div>

            </div>

          </div>

          <!-- Modal Footer Action Buttons -->
          <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-zinc-200">
            <button
              type="button"
              @click="showParentLotModal = false"
              class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-2 rounded-xl text-xs font-black text-white bg-zinc-900 hover:bg-zinc-800 shadow-md shadow-zinc-900/10 transition-all flex items-center gap-2 cursor-pointer"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
              <span>Simpan Perubahan Parent Lot</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- MODAL ATUR KOLOM TABEL (COLUMN VISIBILITY SETTINGS) -->
    <div v-if="showColumnModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/60 backdrop-blur-xs animate-fade-in" @click="showColumnModal = false">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 flex flex-col max-h-[90vh]" @click.stop>
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">⚙️</span>
            <div>
              <h3 class="text-base font-black text-zinc-900">Atur Kolom Tampilan Tabel</h3>
              <p class="text-[11px] text-zinc-500 font-medium">Centang kolom yang ingin ditampilkan pada layar</p>
            </div>
          </div>
          <button @click="showColumnModal = false" class="text-zinc-400 hover:text-zinc-600 font-bold text-xl p-1">✕</button>
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

    <!-- MODAL MENU AKSI BARIS (MINIMALIST SLEEK CONTEXT CARD) -->
    <div v-if="showRowActionModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 bg-zinc-950/50 backdrop-blur-xs animate-fade-in" @click="showRowActionModal = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-[340px] p-4 border border-zinc-200 space-y-3" @click.stop>
        
        <!-- Header: Dense Info & Badges -->
        <div class="pb-2.5 border-b border-zinc-100">
          <div class="flex items-center justify-between gap-1.5 mb-1">
            <div class="flex items-center gap-1.5 overflow-hidden">
              <span class="text-[11px] font-black text-white bg-red-600 px-2 py-0.5 rounded-md font-mono shadow-xs">
                #{{ selectedRowItem?.id }}
              </span>
              <span class="text-[11px] font-bold text-zinc-700 font-mono truncate" :title="selectedRowItem?.uniqId">
                {{ selectedRowItem?.uniqId }}
              </span>
            </div>
            
            <span :class="[
              'text-[9px] font-black px-2 py-0.5 rounded-md border shrink-0',
              selectedRowItem?.status === 'PASS' || selectedRowItem?.status === 'OK' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
              selectedRowItem?.status === 'HOLD' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
            ]">
              {{ selectedRowItem?.status }}
            </span>
          </div>

          <!-- Lot, Turunan, SPK -->
          <div class="flex items-center justify-between text-xs font-bold text-zinc-900 mt-1">
            <div class="truncate font-mono">
              <span class="text-zinc-900 uppercase">{{ selectedRowItem?.lot }}</span><span v-if="selectedRowItem?.turunan" class="text-zinc-400 font-bold">/</span><span v-if="selectedRowItem?.turunan" class="text-red-600 uppercase">{{ selectedRowItem?.turunan }}</span>
            </div>
            <span class="text-[10px] text-zinc-400 font-mono">SPK: {{ selectedRowItem?.spk }}</span>
          </div>

          <!-- Dimensi & Mesin -->
          <p class="text-[11px] text-zinc-500 font-medium mt-0.5 truncate">
            {{ selectedRowItem?.jenis }} {{ selectedRowItem?.thickness }}MC × {{ selectedRowItem?.width }}MM • {{ selectedRowItem?.mesin }}
          </p>
        </div>

        <!-- 4 Aesthetic Action Buttons (Vertical Stack Minimalist) -->
        <div class="space-y-1.5">
          <!-- 1. Preview & Cetak -->
          <button
            @click="handleRowAction('preview')"
            class="w-full px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-zinc-900 border border-zinc-200/80 transition-all flex items-center justify-between group shadow-xs"
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
            @click="handleRowAction('edit')"
            class="w-full px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-red-600 border border-zinc-200/80 transition-all flex items-center justify-between group shadow-xs"
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
            @click="handleRowAction('duplicate')"
            class="w-full px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:text-white bg-zinc-50 hover:bg-zinc-800 border border-zinc-200/80 transition-all flex items-center justify-between group shadow-xs"
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
            @click="handleRowAction('delete')"
            class="w-full px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:text-white bg-red-50/70 hover:bg-red-600 border border-red-200 transition-all flex items-center justify-between group shadow-xs"
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
            @click="showRowActionModal = false"
            class="w-full py-1.5 rounded-xl text-[11px] font-bold text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
          >
            Batal
          </button>
        </div>
      </div>
    </div>

    <!-- COMPACT & ORGANIZED MODAL: Form Tambah / Edit Label -->
    <teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-3 bg-slate-900/65 backdrop-blur-xs font-sans select-none">
        <div class="bg-white rounded-2xl shadow-2xl max-w-5xl w-full p-3 sm:p-4 flex flex-col max-h-[98vh] border border-slate-200">
          <!-- Modal Header (Compact) -->
          <div class="flex items-center justify-between pb-2 border-b border-slate-100 shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-base">🏷️</span>
              <h3 class="text-sm sm:text-base font-black text-slate-900">
                {{ isEditing ? 'Edit Data Label' : 'Tambah Data Label' }}
              </h3>
            </div>
            <button @click="closeModal" class="text-slate-400 hover:text-slate-700 font-bold text-base p-1 cursor-pointer">✕</button>
          </div>

          <!-- Modal Form Body (Ultra-Compact 4-Zone Color Palette, Zero-Scroll on Standard Displays) -->
          <form @submit.prevent="handleFormSubmit" class="mt-2 space-y-2 overflow-y-auto pr-0.5 flex-1 text-xs">
            
            <!-- 1. MASTER LOT & SPESIFIKASI BAHAN (SOFT SKY BLUE PALETTE) -->
            <div class="p-2 sm:p-2.5 bg-sky-50/75 rounded-xl border border-sky-200/80 shadow-2xs space-y-1.5">
              <div class="flex items-center justify-between pb-1 border-b border-sky-200/60">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-sky-600 text-white font-black text-[9px] flex items-center justify-center">1</span>
                  <h4 class="font-extrabold text-sky-950 uppercase tracking-wide text-[11px]">Master Lot & Identitas Bahan</h4>
                </div>
                <span class="text-[9.5px] text-sky-700 font-medium">Acuan Stok WIP Jumbo</span>
              </div>

              <!-- Baris No Lot Utama & Rekomendasi WIP -->
              <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                <div class="md:col-span-6 relative">
                  <div class="flex items-center justify-between mb-1 gap-1 flex-wrap">
                    <label class="block font-bold text-sky-950 text-[11px]">
                      {{ lotSearchSource === 'DATA_ROLL' ? 'No Lot Data Roll' : 'No Lot WIP' }} <span class="text-red-500">*</span>
                    </label>
                    <div class="flex items-center gap-1.5">
                      <!-- Toggle Mode Pencarian No Lot: WIP vs Data Roll -->
                      <div class="inline-flex items-center bg-sky-100/90 p-0.5 rounded-lg border border-sky-300 text-[9.5px]">
                        <button
                          type="button"
                          @click="setLotSearchSource('WIP')"
                          :class="[
                            'px-2 py-0.5 rounded-md font-extrabold transition-all cursor-pointer flex items-center gap-1',
                            lotSearchSource === 'WIP'
                              ? 'bg-blue-600 text-white shadow-2xs'
                              : 'text-sky-900 hover:text-black hover:bg-sky-200/60'
                          ]"
                          title="Mode Pencarian: Stok WIP Jumbo (Default Slitting)"
                        >
                          <span>🏭 WIP Jumbo</span>
                        </button>
                        <button
                          type="button"
                          @click="setLotSearchSource('DATA_ROLL')"
                          :class="[
                            'px-2 py-0.5 rounded-md font-extrabold transition-all cursor-pointer flex items-center gap-1',
                            lotSearchSource === 'DATA_ROLL'
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'text-indigo-900 hover:text-black hover:bg-indigo-200/60'
                          ]"
                          title="Mode Pencarian: Identitas Data Roll (Default Rewind)"
                        >
                          <span>📊 Data Roll</span>
                        </button>
                      </div>

                      <!-- Tombol Buka Rekomendasi Langsung -->
                      <button
                        type="button"
                        @click="openRecommendationModal"
                        class="text-[9.5px] font-bold px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 cursor-pointer shadow-2xs flex items-center gap-1 transition-all"
                        :title="`Cari / Buka seluruh daftar rekomendasi ${lotSearchSource === 'DATA_ROLL' ? 'Data Roll' : 'WIP'}`"
                      >
                        <span>🔍</span> Cari
                      </button>
                    </div>
                  </div>

                  <div class="relative">
                    <input
                      v-model="form.lot"
                      @input="handleLotInput"
                      required
                      :placeholder="lotSearchSource === 'DATA_ROLL' ? 'Contoh: M07210726A210/D108/J101' : 'Contoh: M01240826C101'"
                      :class="[
                        'w-full px-2.5 py-1 text-xs border rounded-lg bg-white font-mono font-bold outline-none uppercase shadow-2xs transition-all',
                        lotMismatch ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-sky-300 focus:border-sky-500 focus:ring-1 focus:ring-sky-500'
                      ]"
                    />
                    <button
                      v-if="form.lot"
                      type="button"
                      @click="form.lot = ''; selectedWipRoll = null"
                      class="absolute right-2 top-1.5 text-zinc-400 hover:text-zinc-700 text-xs font-bold cursor-pointer"
                      title="Hapus input lot"
                    >
                      ✕
                    </button>
                  </div>

                  <!-- Visual Format Preview (Print Preview Formatted Lot) -->
                  <div v-if="form.lot" class="mt-1 flex items-center gap-1.5 flex-wrap">
                    <span class="text-[9.5px] text-sky-800 font-bold">Visual Label:</span>
                    <span class="font-mono font-bold text-[10px] bg-white text-sky-950 px-1.5 py-0.2 rounded border border-sky-300 shadow-2xs">
                      {{ formatLotVisual(form.lot, form.supplier) }}
                    </span>
                  </div>

                  <!-- Tombol Rekomendasi (HANYA MUNCUL JIKA LOT TERDAFTAR / COCOK) -->
                  <div v-if="hasRecommendations" class="mt-1 flex items-center justify-between gap-1 flex-wrap animate-fade-in">
                    <button
                      type="button"
                      @click="openRecommendationModal"
                      :class="[
                        'w-full text-[10.5px] font-black px-2 py-0.5 rounded-lg flex items-center justify-between transition-all cursor-pointer shadow-xs border',
                        lotSearchSource === 'DATA_ROLL'
                          ? 'text-indigo-900 hover:text-white bg-indigo-100 hover:bg-indigo-600 border-indigo-300 hover:border-indigo-700'
                          : 'text-sky-900 hover:text-white bg-sky-100 hover:bg-sky-600 border-sky-300 hover:border-sky-700'
                      ]"
                      :title="`Klik untuk membuka tabel rekomendasi ${lotSearchSource === 'DATA_ROLL' ? 'Data Roll' : 'roll WIP'} yang cocok`"
                    >
                      <span class="flex items-center gap-1">
                        <span>💡</span>
                        <span>Rekomendasi {{ lotSearchSource === 'DATA_ROLL' ? 'Data Roll' : 'WIP' }} (<strong>{{ activeMatchedRolls.length }} Roll</strong>)</span>
                      </span>
                      <span :class="[
                        'text-[9.5px] font-mono px-1 py-0.2 rounded font-bold',
                        lotSearchSource === 'DATA_ROLL' ? 'bg-indigo-200 text-indigo-950' : 'bg-sky-200 text-sky-950'
                      ]">Buka Tabel ➔</span>
                    </button>
                  </div>

                  <!-- Warning Kecil Jika No Lot Tidak Terdaftar -->
                  <p
                    v-if="isLotUnregistered"
                    class="text-[10px] text-amber-800 font-semibold mt-0.5 bg-amber-50 border border-amber-300 px-1.5 py-0.5 rounded flex items-start gap-1 leading-tight animate-fade-in"
                  >
                    <span class="text-[11px] shrink-0">⚠️</span>
                    <span>No. Lot <strong>{{ form.lot }}</strong> tidak terdaftar di {{ lotSearchSource === 'DATA_ROLL' ? 'Identitas Data Roll' : 'Stok WIP Jumbo Aktif' }}.</span>
                  </p>

                  <p v-if="lotMismatch" class="text-[9.5px] text-red-600 mt-0.5 leading-tight font-medium">
                    3 huruf awal (<strong>{{ form.lot.substring(0, 3) }}</strong>) ≠ formula (Khusus INHOUSE).
                  </p>
                </div>

                <div class="md:col-span-3">
                  <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Formula (Kode Film) <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.kode"
                    @input="handleFormulaInput"
                    required
                    placeholder="M01"
                    :class="[
                      'w-full px-2 py-1 text-xs border rounded-lg bg-white font-mono font-bold outline-none uppercase shadow-2xs',
                      lotMismatch ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' : 'border-sky-300 focus:ring-1 focus:ring-sky-500'
                    ]"
                  />
                  <div v-if="selectedKodeInfo" class="mt-0.5 px-1 py-0.2 bg-white border border-sky-200 rounded flex items-center justify-between gap-1">
                    <span class="text-[9px] text-sky-800 font-medium truncate">{{ selectedKodeInfo.keterangan || selectedKodeInfo.tipeBahan }}</span>
                    <span class="text-[9px] font-black text-sky-950 shrink-0">ρ {{ selectedKodeInfo.density }}</span>
                  </div>
                </div>

                <div class="md:col-span-3">
                  <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">No. SPK <span class="text-red-500">*</span></label>
                  <input
                    v-model="form.spk"
                    required
                    placeholder="No. SPK"
                    class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-mono font-semibold focus:ring-1 focus:ring-sky-500 shadow-2xs"
                  />
                </div>
              </div>

              <!-- Baris Supplier, Jenis, Type -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 pt-0.5">
                <div>
                  <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Supplier <span class="text-slate-400 font-normal">(Tanpa Spasi)</span></label>
                  <input
                    v-model="form.supplier"
                    @input="form.supplier = (form.supplier || '').replace(/\s+/g, '').toUpperCase(); syncFormulaConfigs()"
                    placeholder="INHOUSE / Vendor..."
                    class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-medium focus:ring-1 focus:ring-sky-500 font-mono uppercase"
                  />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-0.5">
                    <label class="block font-bold text-sky-950 text-[11px]">Jenis Film <span class="text-red-500">*</span></label>
                    <label class="inline-flex items-center gap-1 cursor-pointer select-none text-[10px] font-bold text-sky-900" title="Gunakan nama alias film pada preview dan cetak label">
                      <input
                        type="checkbox"
                        v-model="useFilmAlias"
                        class="w-3.5 h-3.5 text-sky-600 rounded cursor-pointer accent-sky-600"
                      />
                      <span>Gunakan Alias</span>
                    </label>
                  </div>
                  <select v-model="form.jenisKey" @change="handleJenisKeyChange" required class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-bold">
                    <option value="">— Pilih Jenis —</option>
                    <option v-for="opt in jenisDisplayOptions" :key="opt.key" :value="opt.key">{{ opt.label }}</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-sky-950 mb-0.5 text-[11px]">Type <span class="text-red-500">*</span></label>
                  <select v-model="form.type" @change="handleTypeChange" required class="w-full px-2 py-1 text-xs border border-sky-300 rounded-lg outline-none bg-white font-medium">
                    <option v-for="jb in jenisBahanOptions" :key="jb" :value="jb.toUpperCase()">{{ jb.toUpperCase() }}</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 2. OPERASIONAL MESIN & TURUNAN (SOFT INDIGO PALETTE) -->
            <div class="p-2 sm:p-2.5 bg-indigo-50/75 rounded-xl border border-indigo-200/80 shadow-2xs space-y-1.5">
              <div class="flex items-center justify-between pb-1 border-b border-indigo-200/60">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-indigo-600 text-white font-black text-[9px] flex items-center justify-center">2</span>
                  <h4 class="font-extrabold text-indigo-950 uppercase tracking-wide text-[11px]">Operasional Mesin & Turunan</h4>
                </div>
                <span class="text-[9.5px] text-indigo-700 font-medium">Pelaksana & Pisau Slitting</span>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
                <!-- Mesin -->
                <div>
                  <label class="block font-bold text-indigo-950 mb-0.5 text-[11px]">Mesin Produksi <span class="text-red-500">*</span></label>
                  <select v-model="form.mesin" @change="updateAutoFields" required class="w-full px-2 py-1 text-xs border border-indigo-300 rounded-lg outline-none bg-white font-bold text-indigo-900">
                    <option v-for="m in mesinOptions" :key="m" :value="m">{{ m }}</option>
                  </select>
                </div>

                <!-- Turunan dengan Chartingan ABCD -->
                <div>
                  <div class="flex items-center justify-between mb-0.5">
                    <label class="font-bold text-indigo-950 text-[11px]">Turunan <span class="text-red-500">*</span></label>
                    <div class="flex items-center gap-0.5 text-[9.5px]">
                      <button
                        v-for="ch in activeChartinganList"
                        :key="ch"
                        type="button"
                        @click="applyChartinganToForm(ch)"
                        :class="[
                          'px-1.5 py-0.2 rounded font-mono font-bold text-[9.5px] transition-colors uppercase cursor-pointer shadow-2xs',
                          parseTurunan(form.turunan).chartingan === ch
                            ? 'bg-red-600 text-white shadow-xs'
                            : 'bg-white hover:bg-zinc-200 text-zinc-700 border border-indigo-200'
                        ]"
                        :title="`Ubah chartingan ke ${ch}`"
                      >
                        {{ ch }}
                      </button>
                      <button
                        type="button"
                        @click="advanceFormTurunan"
                        class="px-1.5 py-0.2 rounded bg-zinc-900 hover:bg-black text-white text-[9px] font-bold cursor-pointer"
                        title="Auto-complete ke no urut berikutnya"
                      >
                        ➔
                      </button>
                    </div>
                  </div>

                  <input
                    v-model="form.turunan"
                    @input="form.turunan = form.turunan.toUpperCase()"
                    required
                    placeholder="HA01"
                    class="w-full px-2 py-1 text-xs border border-indigo-300 rounded-lg bg-white font-mono font-bold text-red-600 outline-none uppercase focus:ring-1 focus:ring-red-500"
                  />

                  <div v-if="previousInfo.turunan" class="text-[9.5px] text-zinc-500 italic mt-0.5 flex items-center justify-between">
                    <span>Sebelumnya: <strong class="font-mono text-zinc-800 not-italic">{{ previousInfo.turunan }}</strong></span>
                    <span v-if="form.turunan !== previousInfo.initialSuggestedTurunan" class="text-[9px] text-amber-600 font-bold not-italic">✏️ Diubah</span>
                  </div>
                </div>

                <!-- Operator -->
                <div>
                  <div class="flex items-center justify-between mb-0.5">
                    <label class="font-bold text-indigo-950 text-[11px]">Operator</label>
                    <span
                      v-if="detectedOperator"
                      class="text-[9px] font-black px-1.5 rounded uppercase"
                      :class="detectedOperator.active !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'"
                    >
                      {{ detectedOperator.nama }}
                    </span>
                  </div>

                  <select
                    :value="selectedOperatorId"
                    @change="handleOperatorSelect($event.target.value)"
                    class="w-full px-2 py-1 text-xs border border-indigo-300 rounded-lg font-bold text-zinc-800 bg-white focus:ring-1 focus:ring-indigo-500 outline-none"
                  >
                    <option value="" disabled>-- Operator {{ form.mesin }} --</option>
                    <option
                      v-for="op in machineOperators"
                      :key="op.id"
                      :value="op.id"
                    >
                      [{{ op.kodeOperator }}] {{ op.nama }} {{ op.active === false ? '(Non-aktif)' : '' }}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 3. DIMENSI, PANJANG & KONDISI JOIN (SOFT EMERALD PALETTE) -->
            <div class="p-2 sm:p-2.5 bg-emerald-50/75 rounded-xl border border-emerald-200/80 shadow-2xs space-y-1.5">
              <div class="flex items-center justify-between pb-1 border-b border-emerald-200/60">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-emerald-600 text-white font-black text-[9px] flex items-center justify-center">3</span>
                  <h4 class="font-extrabold text-emerald-950 uppercase tracking-wide text-[11px]">Dimensi, Panjang & Kondisi Join</h4>
                </div>
                <span class="text-[9.5px] text-emerald-700 font-medium">Panjang & Sambungan (Tab Keyboard)</span>
              </div>

              <!-- Baris 1: Dimensi & Panjang + Join Terpadu -->
              <div class="grid grid-cols-1 md:grid-cols-5 gap-2">
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]">Thickness (MC) <span class="text-red-500">*</span></label>
                  <input v-model="form.thickness" @input="updateAutoFields" required placeholder="18" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold" />
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]">Width (MM) <span class="text-red-500">*</span></label>
                  <input ref="widthInputRef" v-model="form.width" @input="updateAutoFields" required placeholder="1000" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold" />
                </div>
                <div>
                  <div class="flex items-center justify-between mb-0.5">
                    <label class="block font-bold text-emerald-950 text-[11px]" title="Quantity / Panjang Total Roll">
                      Length (m) <span class="text-red-500">*</span>
                    </label>
                    <span v-if="standardLengthInfo" class="text-[9.5px] font-mono font-bold" :class="isLengthExceedingStandard ? 'text-amber-600 animate-pulse' : 'text-emerald-700'" :title="`Maks Standard: FG=${Number(standardLengthInfo.maxPanjangFg).toLocaleString('id-ID')}m, Jumbo=${Number(standardLengthInfo.maxPanjangJumbo).toLocaleString('id-ID')}m`">
                      Maks: {{ Number(['CASTING', 'METALIZE'].includes(form.mesin) ? standardLengthInfo.maxPanjangJumbo : standardLengthInfo.maxPanjangFg).toLocaleString('id-ID') }}m
                    </span>
                  </div>
                  <input
                    v-model="form.length"
                    @input="updateAutoFields"
                    required
                    placeholder="3000"
                    :class="[
                      'w-full px-2 py-1 text-xs border rounded-lg outline-none bg-white font-bold',
                      isLengthExceedingStandard ? 'border-amber-400 text-amber-900 bg-amber-50/50 focus:ring-1 focus:ring-amber-500' : 'border-emerald-400 text-emerald-900 focus:ring-1 focus:ring-emerald-600'
                    ]"
                  />
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]" title="Jumlah sambungan join: 0, 1, 2...">
                    Joint (Jml) <span class="text-[9px] font-normal text-zinc-400">(Opsional)</span>
                  </label>
                  <input v-model="form.joint" placeholder="0" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold text-center" />
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[11px]" title="Posisi meteran join: misal 5000 atau 3000, 8000">
                    Meter Join <span class="text-[9px] font-normal text-zinc-400">(Opsional)</span>
                  </label>
                  <input v-model="form.meter" placeholder="5000 / 3000, 8000" class="w-full px-2 py-1 text-xs border border-emerald-300 rounded-lg outline-none bg-white font-semibold" />
                </div>
              </div>

              <!-- Baris 2: Hasil Auto Netto, Core, PaperCore, Treatment, OD, Jenis Print -->
              <div class="grid grid-cols-2 md:grid-cols-6 gap-1.5 pt-0.5 border-t border-emerald-200/50">
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Netto (kg)</label>
                  <input :value="form.netto" readonly placeholder="0.00" class="w-full px-1.5 py-0.5 text-xs border border-emerald-200 rounded-lg bg-emerald-100/60 font-bold text-emerald-950" />
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Core</label>
                  <select
                    v-model.number="form.diameterCore"
                    @change="updateAutoFields"
                    class="w-full px-1.5 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-bold text-slate-800"
                  >
                    <option :value="6">6" Standar</option>
                    <option :value="3">3" Kecil</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Paper Core</label>
                  <input :value="form.paperCore" readonly placeholder="0.00" class="w-full px-1.5 py-0.5 text-xs border border-emerald-200 rounded-lg bg-white font-bold text-slate-800" />
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Treatment</label>
                  <select v-model="form.treatment" class="w-full px-1 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-semibold text-zinc-900">
                    <option value="INSIDE">INSIDE</option>
                    <option value="OUTSIDE">OUTSIDE</option>
                    <option value="BOTHSIDE">BOTHSIDE</option>
                    <option value="NON-TREATMENT">NON-TREATMENT</option>
                  </select>
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">OD + Plasma</label>
                  <input v-model="form.od" :placeholder="form.type === 'METALIZED' ? 'OD2.4+PLASMA' : '-'" class="w-full px-1.5 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-mono text-red-600 font-bold" />
                </div>
                <div>
                  <label class="block font-bold text-emerald-950 mb-0.5 text-[10.5px]">Jenis Print</label>
                  <select v-model="form.jenisPrint" class="w-full px-1 py-0.5 text-xs border border-emerald-300 rounded-lg bg-white font-semibold">
                    <option value="FINISH GOODS">FINISH GOODS</option>
                    <option value="B-GRADE">B-GRADE</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- 4. IDENTITAS PACK & KETERANGAN / REKOMENDASI AI (SOFT AMBER PALETTE) -->
            <div class="p-2 sm:p-2.5 bg-amber-50/75 rounded-xl border border-amber-200/80 shadow-2xs space-y-1.5">
              <div class="flex items-center justify-between pb-1 border-b border-amber-200/60">
                <div class="flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-amber-600 text-white font-black text-[9px] flex items-center justify-center">4</span>
                  <h4 class="font-extrabold text-amber-950 uppercase tracking-wide text-[11px]">Identitas Pack & Keterangan</h4>
                </div>
                <span class="text-[9.5px] text-amber-800 font-medium">Validasi Unik & Alasan Hold/Reject</span>
              </div>

              <!-- Baris 1: Tgl Shift, Manual, Shift, Kode Pack, Sub Kode Pack -->
              <div class="grid grid-cols-1 md:grid-cols-12 gap-2 items-start">
                <div class="md:col-span-2">
                  <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Tgl Shift (07:00)</label>
                  <input :value="form.tanggalShift" readonly class="w-full px-1.5 py-0.5 text-[11px] border border-amber-200 rounded-lg bg-white font-medium" />
                </div>
                <div class="md:col-span-2">
                  <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Tgl Manual</label>
                  <input v-model="form.tanggalManual" type="date" @change="updateAutoFields" class="w-full px-1 py-0.5 text-[11px] border border-amber-300 rounded-lg bg-white" />
                </div>
                <div class="md:col-span-2">
                  <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Shift</label>
                  <select v-model="form.shift" class="w-full px-1 py-0.5 text-[11px] border border-amber-300 rounded-lg bg-white font-bold text-zinc-800 outline-none">
                    <option value="1">Shift 1</option>
                    <option value="2">Shift 2</option>
                    <option value="3">Shift 3</option>
                    <option value="LS1">LS 1 (Siang)</option>
                    <option value="LS2">LS 2 (Malam)</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Kode Pack</label>
                  <input :value="form.kodePack" readonly class="w-full px-1.5 py-0.5 text-xs border border-amber-200 rounded-lg bg-white font-mono font-bold text-zinc-800" />
                </div>

                <!-- Sub Kode Pack -->
                <div class="md:col-span-4">
                  <label class="block font-bold text-amber-950 mb-0.5 text-[10.5px]">Status & Sub Kode Pack</label>
                  <div class="flex items-center gap-1.5 pt-0.2 flex-wrap">
                    <label class="inline-flex items-center gap-1 cursor-pointer bg-white px-1.5 py-0.5 border border-amber-300 rounded-lg shadow-2xs">
                      <input type="radio" value="numeric" v-model="form.subKodeType" @change="handleSubKode" />
                      <span class="font-bold text-emerald-700 text-[11px]">PASS:</span>
                      <input
                        v-model="form.subKodeNumeric"
                        @input="handleSubKode"
                        :required="form.subKodeType === 'numeric'"
                        maxlength="4"
                        placeholder="0001"
                        :class="[
                          'w-14 px-1 py-0.2 border rounded text-xs text-center font-mono font-bold outline-none shadow-inner',
                          subKodeValidation.isDuplicate ? 'border-red-500 bg-red-50 text-red-700 ring-1 ring-red-500' :
                          subKodeValidation.isSkipped ? 'border-amber-400 bg-amber-50 text-amber-900 ring-1 ring-amber-400' :
                          'border-slate-300'
                        ]"
                      />
                    </label>
                    <label class="inline-flex items-center gap-1 cursor-pointer bg-white px-2 py-1 border border-amber-300 rounded-lg shadow-2xs">
                      <input type="radio" value="hold" v-model="form.subKodeType" @change="handleSubKode" />
                      <span class="text-amber-700 font-bold text-[11px]">HOLD</span>
                    </label>
                    <label class="inline-flex items-center gap-1 cursor-pointer bg-white px-2 py-1 border border-amber-300 rounded-lg shadow-2xs">
                      <input type="radio" value="reject" v-model="form.subKodeType" @change="handleSubKode" />
                      <span class="text-red-600 font-bold text-[11px]">REJECT</span>
                    </label>
                  </div>

                  <!-- Warning Double / Lompat -->
                  <p
                    v-if="subKodeValidation.isDuplicate"
                    class="text-[9.5px] font-bold text-red-600 mt-0.5 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded leading-tight animate-fade-in"
                  >
                    {{ subKodeValidation.message }}
                  </p>
                  <p
                    v-else-if="subKodeValidation.isSkipped"
                    class="text-[9.5px] font-bold text-amber-800 mt-0.5 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded leading-tight animate-fade-in"
                  >
                    {{ subKodeValidation.message }}
                  </p>
                </div>
              </div>

              <!-- Baris 2: Keterangan Cerdas / Alasan Hold/Reject + Dynamic AI Quick Tags -->
              <div class="pt-0.5">
                <div class="flex items-center justify-between mb-0.5">
                  <label class="font-bold flex items-center gap-1.5 text-[11px] text-amber-950">
                    <span>Keterangan / Alasan Defect:</span>
                    <span
                      v-if="form.subKodeType === 'hold'"
                      class="px-1.5 py-0.2 rounded-full bg-amber-100 border border-amber-300 text-amber-800 font-black text-[9.5px] animate-pulse"
                    >
                      ⚠️ Alasan HOLD Diperlukan
                    </span>
                    <span
                      v-else-if="form.subKodeType === 'reject'"
                      class="px-1.5 py-0.2 rounded-full bg-red-100 border border-red-300 text-red-800 font-black text-[9.5px] animate-pulse"
                    >
                      ⚠️ Alasan REJECT Diperlukan
                    </span>
                  </label>

                  <span class="text-[9.5px] text-amber-800 font-medium hidden md:inline">
                    🤖 Rekomendasi Tag Cepat AI (Klik untuk isi otomatis):
                  </span>
                </div>

                <input
                  v-model="form.keterangan"
                  :placeholder="
                    form.subKodeType === 'hold' ? 'Masukkan alasan HOLD (contoh: Kerut, Bintik, Tebal Tidak Rata, Test Lab)...' :
                    form.subKodeType === 'reject' ? 'Masukkan alasan REJECT (contoh: Putus Terus, Sobek Parah, Garis Pisau)...' :
                    'Catatan opsional...'
                  "
                  :class="[
                    'w-full px-2.5 py-1 text-xs border rounded-lg outline-none transition-all shadow-2xs',
                    form.subKodeType === 'hold' ? 'border-amber-400 bg-white text-amber-950 focus:ring-1 focus:ring-amber-500 font-medium' :
                    form.subKodeType === 'reject' ? 'border-red-400 bg-white text-red-950 focus:ring-1 focus:ring-red-500 font-medium' :
                    'border-amber-300 bg-white focus:ring-1 focus:ring-blue-500'
                  ]"
                />

                <!-- Dynamic AI Quick Tag Chips -->
                <div class="flex items-center gap-1 mt-1 flex-wrap">
                  <span class="text-[9.5px] text-amber-900 font-bold">Tag AI:</span>
                  <button
                    v-for="tag in quickTags"
                    :key="tag"
                    type="button"
                    @click="addQuickTag(tag)"
                    class="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                  >
                    + {{ tag }}
                  </button>
                </div>
              </div>
            </div>

            <!-- Form Buttons (Always Visible at Bottom) -->
            <div class="flex items-center justify-end gap-2 pt-1.5 border-t border-slate-100 shrink-0">
              <button type="button" @click="closeModal" class="px-4 py-1 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer">
                Batal
              </button>
              <button type="submit" class="px-6 py-1 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-all cursor-pointer">
                Simpan
              </button>
            </div>
          </form>
        </div>
      </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL BESAR: REKOMENDASI DATA WIP JUMBO (BENTUK LIST TABEL)       -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div
        v-if="showWipModal"
        class="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-black/75 backdrop-blur-xs animate-fade-in font-sans"
        @click.self="closeWipModal"
      >
        <div
          class="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-5xl w-full flex flex-col max-h-[92vh] overflow-hidden"
          @click.stop
        >
          <!-- Modal Header -->
          <div class="px-6 py-4 border-b border-slate-200 bg-slate-50/95 flex items-start justify-between gap-3 shrink-0">
            <div>
              <div class="flex items-center gap-2 flex-wrap">
                <span :class="[
                  'px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border',
                  lotSearchSource === 'DATA_ROLL'
                    ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                    : 'bg-blue-100 text-blue-900 border-blue-300'
                ]">
                  {{ lotSearchSource === 'DATA_ROLL' ? '📊 Rekomendasi Data Roll (FG)' : '🏭 Rekomendasi WIP Jumbo' }}
                </span>
                <span class="text-xs font-bold text-slate-400">•</span>
                <span class="text-xs font-semibold text-slate-600">
                  Kata Kunci: <strong class="font-mono text-blue-700 font-black">{{ activeQuery || '(Semua Roll)' }}</strong>
                </span>
              </div>
              <h3 class="text-base font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
                <span>🔍</span> Rekomendasi {{ lotSearchSource === 'DATA_ROLL' ? 'Data Roll' : 'Roll WIP Jumbo' }} yang Cocok
              </h3>

              <!-- Input Filter Pencarian Cepat Langsung di Dalam Modal -->
              <div class="mt-2 flex items-center gap-2 flex-wrap">
                <div class="relative w-72">
                  <span class="absolute left-2.5 top-1.5 text-slate-400 text-xs">🔍</span>
                  <input
                    v-model="modalSearchQuery"
                    @input="modalDisplayLimit = 100"
                    placeholder="Cari No Lot / Turunan / SPK..."
                    class="w-full pl-7 pr-7 py-1 text-xs border border-slate-300 rounded-lg bg-white font-mono font-bold uppercase focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none shadow-2xs"
                  />
                  <button
                    v-if="modalSearchQuery"
                    type="button"
                    @click="modalSearchQuery = ''; modalDisplayLimit = 100"
                    class="absolute right-2 top-1.5 text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
                    title="Bersihkan filter"
                  >
                    ✕
                  </button>
                </div>
                <span class="text-[11px] text-slate-500 font-medium">
                  Total Ditemukan: <strong class="text-indigo-700 font-black">{{ activeMatchedRolls.length }}</strong> roll (Tampil {{ paginatedMatchedRolls.length }})
                </span>
              </div>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <!-- Switch Mode Langsung di Dalam Modal -->
              <div class="inline-flex items-center bg-slate-200/80 p-0.5 rounded-xl border border-slate-300 text-[10px]">
                <button
                  type="button"
                  @click="setLotSearchSource('WIP'); modalDisplayLimit = 100"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1',
                    lotSearchSource === 'WIP'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  ]"
                >
                  <span>🏭</span> WIP Jumbo
                </button>
                <button
                  type="button"
                  @click="setLotSearchSource('DATA_ROLL'); modalDisplayLimit = 100"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1',
                    lotSearchSource === 'DATA_ROLL'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  ]"
                >
                  <span>📊</span> Data Roll
                </button>
              </div>

              <button
                type="button"
                @click="closeWipModal"
                class="p-2 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                title="Abaikan & Tutup Rekomendasi"
              >
                <span class="text-base font-black">✕</span>
              </button>
            </div>
          </div>

          <!-- BANNER PERINGATAN WAJIB VERIFIKASI DATA AKTUAL -->
          <div class="mx-4 sm:mx-6 mt-3 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-2.5 text-amber-950 shadow-xs shrink-0 animate-fade-in">
            <span class="text-xl shrink-0 mt-0.5">⚠️</span>
            <div class="text-xs leading-relaxed">
              <strong class="font-black text-amber-950 uppercase tracking-wide flex items-center gap-1.5">
                <span>Perhatian: Verifikasi Data Aktual Secara Teliti!</span>
              </strong>
              <p class="text-amber-900 font-medium mt-0.5">
                Meskipun nomor lot memiliki persentase kemiripan tinggi (bahkan hingga 100%), <strong>wajib selalu memeriksa fisik roll dan data aktual dengan teliti</strong> sebelum memilih guna menghindari salah ketik nomor lot atau tertukar roll.
              </p>
            </div>
          </div>

          <!-- Table Body -->
          <div class="p-4 overflow-y-auto flex-1 bg-white space-y-3">
            <div class="overflow-x-auto rounded-2xl border border-slate-200 shadow-xs">
              <!-- TABEL MODE 1: DATA ROLL -->
              <table v-if="lotSearchSource === 'DATA_ROLL'" class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-indigo-50/80 text-indigo-950 font-black text-[11px] uppercase tracking-wider border-b border-indigo-100">
                    <th class="py-2.5 px-3 text-center w-10">#</th>
                    <th class="py-2.5 px-3">No. Lot & Turunan</th>
                    <th class="py-2.5 px-3">Kemiripan No Lot</th>
                    <th class="py-2.5 px-3">No. SPK</th>
                    <th class="py-2.5 px-3">Formula / Spesifikasi</th>
                    <th class="py-2.5 px-3 text-right">Ukuran & Meter</th>
                    <th class="py-2.5 px-3 text-right">Berat (Kg)</th>
                    <th class="py-2.5 px-3 text-center">Mesin</th>
                    <th class="py-2.5 px-3 text-center">Status</th>
                    <th class="py-2.5 px-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(item, idx) in paginatedMatchedRolls"
                    :key="item.roll.id || item.roll.uuid || idx"
                    @click="selectDataRoll(item.roll)"
                    class="hover:bg-indigo-50/70 transition-colors cursor-pointer group"
                  >
                    <td class="py-2.5 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                      {{ idx + 1 }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="flex flex-col">
                        <span class="font-mono font-black text-xs text-indigo-800 group-hover:text-indigo-950">{{ extractCleanParentLot(item.roll.lot, item.roll.turunan) }}</span>
                        <span v-if="item.roll.turunan" class="text-[10px] font-mono text-slate-500">Turunan: {{ item.roll.turunan }}</span>
                      </div>
                    </td>
                    <!-- Kemiripan No Lot dengan Persentase & Warna -->
                    <td class="py-2.5 px-3">
                      <div class="flex flex-col gap-1 items-start">
                        <span :class="['px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1', getSimilarityBadge(item.similarityPct).badgeClass]">
                          <span v-if="item.similarityPct === 100">✨</span>
                          <span>{{ getSimilarityBadge(item.similarityPct).text }}</span>
                        </span>
                        <div class="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div :class="['h-full rounded-full transition-all', getSimilarityBadge(item.similarityPct).barClass]" :style="{ width: `${item.similarityPct}%` }"></div>
                        </div>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {{ item.roll.spk || '-' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-mono font-bold text-slate-800 text-[11px] leading-tight">
                        {{ getDataRollDesc(item.roll) }}
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-semibold text-slate-700">
                      {{ item.roll.width ? `${item.roll.width} mm` : '' }} {{ (item.roll.length || item.roll.meter) ? `(${item.roll.length || item.roll.meter} m)` : '' }}
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                      {{ formatNumber(item.roll.netto || item.roll.berat || 0) }}
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span class="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 font-bold text-[10px] border border-slate-200 uppercase">
                        {{ item.roll.machineName || item.roll.mesin || 'FG' }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <span :class="[
                        'px-2 py-0.5 rounded-full text-[10px] font-black border uppercase',
                        String(item.roll.qualityStatus || item.roll.status || 'PASS').toUpperCase() === 'PASS' ? 'bg-emerald-100 text-emerald-900 border-emerald-300' :
                        String(item.roll.qualityStatus || item.roll.status || '').toUpperCase() === 'HOLD' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                        'bg-red-100 text-red-900 border-red-300'
                      ]">
                        {{ item.roll.qualityStatus || item.roll.status || 'PASS' }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center" @click.stop>
                      <button
                        type="button"
                        @click="selectDataRoll(item.roll)"
                        class="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-black text-[11px] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1 justify-center mx-auto"
                      >
                        <span>✓ Pilih</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>

              <!-- TABEL MODE 2: WIP JUMBO -->
              <table v-else class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="bg-slate-100/90 text-slate-700 font-black text-[11px] uppercase tracking-wider border-b border-slate-200">
                    <th class="py-2.5 px-3 text-center w-10">#</th>
                    <th class="py-2.5 px-3">No. Lot WIP</th>
                    <th class="py-2.5 px-3">Kemiripan No Lot</th>
                    <th class="py-2.5 px-3">No. SPK</th>
                    <th class="py-2.5 px-3">Deskripsi Excel (Lengkap)</th>
                    <th class="py-2.5 px-3 text-right">Berat Aktual</th>
                    <th class="py-2.5 px-3">Lokasi / Rak</th>
                    <th class="py-2.5 px-3 text-center">Status Aging</th>
                    <th class="py-2.5 px-3 text-center w-24">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100">
                  <tr
                    v-for="(item, idx) in paginatedMatchedRolls"
                    :key="item.roll.id || item.roll.uuid || idx"
                    @click="selectWipRoll(item.roll)"
                    class="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                  >
                    <td class="py-2.5 px-3 text-center font-bold text-slate-400 font-mono text-[11px]">
                      {{ idx + 1 }}
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="font-mono font-black text-xs text-blue-700 group-hover:text-blue-900">{{ item.roll.lot }}</span>
                    </td>
                    <!-- Kemiripan No Lot dengan Persentase & Warna -->
                    <td class="py-2.5 px-3">
                      <div class="flex flex-col gap-1 items-start">
                        <span :class="['px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1', getSimilarityBadge(item.similarityPct).badgeClass]">
                          <span v-if="item.similarityPct === 100">✨</span>
                          <span>{{ getSimilarityBadge(item.similarityPct).text }}</span>
                        </span>
                        <div class="w-20 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                          <div :class="['h-full rounded-full transition-all', getSimilarityBadge(item.similarityPct).barClass]" :style="{ width: `${item.similarityPct}%` }"></div>
                        </div>
                      </div>
                    </td>
                    <td class="py-2.5 px-3 font-mono font-bold text-slate-700">
                      {{ item.roll.spk || '-' }}
                    </td>
                    <td class="py-2.5 px-3">
                      <div class="font-mono font-bold text-slate-800 text-[11.5px] leading-tight">
                        {{ getWipExcelDesc(item.roll) }}
                      </div>
                    </td>
                    <td class="py-2.5 px-3 text-right font-mono font-black text-emerald-800">
                      {{ formatNumber(item.roll.beratAktual || item.roll.beratTeori) }} kg
                    </td>
                    <td class="py-2.5 px-3">
                      <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 font-bold text-[10px] border border-blue-200">
                        📍 {{ item.roll.lokasiAktif || 'STAGING' }} {{ item.roll.posisiAktif ? `(${item.roll.posisiAktif})` : '' }}
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center">
                      <div v-if="getWipAgingInfo(item.roll).isAging" class="flex flex-col items-center gap-0.5">
                        <span class="px-2 py-0.5 rounded-full text-[9.5px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                          ⏳ {{ getWipAgingInfo(item.roll).remainingFormatted }}
                        </span>
                        <span class="text-[8.5px] text-zinc-400 font-mono">Target: {{ getWipAgingInfo(item.roll).targetDateFormatted }}</span>
                      </div>
                      <span
                        v-else
                        class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300"
                      >
                        ✅ Siap Pakai
                      </span>
                    </td>
                    <td class="py-2.5 px-3 text-center" @click.stop>
                      <button
                        type="button"
                        @click="selectWipRoll(item.roll)"
                        class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-black text-[11px] shadow-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1 justify-center mx-auto"
                      >
                        <span>✓ Pilih</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Tombol Muat 100 Data Lagi (Load More) -->
            <div v-if="activeMatchedRolls.length > modalDisplayLimit" class="py-3 text-center bg-slate-50/80 rounded-2xl border border-slate-200">
              <button
                type="button"
                @click="loadMoreRolls"
                class="px-6 py-2 rounded-xl text-xs font-black bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs hover:shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
              >
                <span>⬇️ Muat 100 Data Berikutnya</span>
                <span class="text-[10px] bg-indigo-800 text-white px-2 py-0.5 rounded-full font-mono font-bold">
                  {{ paginatedMatchedRolls.length }} / {{ activeMatchedRolls.length }} Roll
                </span>
              </button>
            </div>

            <!-- Empty State jika tidak ada yang cocok -->
            <div v-if="activeMatchedRolls.length === 0" class="py-12 text-center text-slate-400">
              <div class="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-xl">📦</div>
              <p class="font-bold text-slate-700 text-sm">
                Tidak Ada Roll di {{ lotSearchSource === 'DATA_ROLL' ? 'Data Roll' : 'WIP Jumbo' }} yang Cocok dengan "{{ activeQuery }}"
              </p>
              
              <!-- Saran Beralih Sumber jika ditemukan di sumber sebelah -->
              <div v-if="lotSearchSource === 'DATA_ROLL' && wipMatchedRolls.length > 0" class="mt-3">
                <button
                  type="button"
                  @click="setLotSearchSource('WIP'); modalDisplayLimit = 100"
                  class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-all"
                >
                  <span>🏭 Ditemukan {{ wipMatchedRolls.length }} Roll di WIP Jumbo! Beralih ke WIP Jumbo ➔</span>
                </button>
              </div>
              <div v-else-if="lotSearchSource === 'WIP' && dataRollMatchedRolls.length > 0" class="mt-3">
                <button
                  type="button"
                  @click="setLotSearchSource('DATA_ROLL'); modalDisplayLimit = 100"
                  class="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer inline-flex items-center gap-1.5 transition-all"
                >
                  <span>📊 Ditemukan {{ dataRollMatchedRolls.length }} Roll di Data Roll! Beralih ke Data Roll ➔</span>
                </button>
              </div>
              <p v-else class="text-xs text-slate-400 mt-1">
                Pastikan kata kunci atau nomor lot yang Anda ketik sudah sesuai.
              </p>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="px-6 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2 shrink-0">
            <span class="text-xs text-slate-500 font-medium">
              Menampilkan <strong>{{ paginatedMatchedRolls.length }}</strong> dari <strong>{{ activeMatchedRolls.length }}</strong> roll {{ lotSearchSource === 'DATA_ROLL' ? 'Data Roll' : 'WIP' }} yang cocok.
            </span>

            <div class="flex items-center gap-2">
              <button
                type="button"
                @click="closeWipModal"
                class="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
              >
                Abaikan & Lanjut Manual
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

    <!-- EXACT STANDARDIZED PREVIEW MODAL (ON SCREEN) -->
    <div v-if="showPreviewModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div class="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-4 sm:p-6 max-h-[95vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <h3 class="text-base font-black text-slate-900">
              Pratinjau Cetak Label ({{ previewItems.length }} Label / {{ previewPages.length }} Lembar Halaman)
            </h3>
          </div>
          <button @click="showPreviewModal = false" class="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>

        <!-- SCREEN PREVIEW DISPLAY -->
        <div class="my-4 space-y-6">
          <div
            v-for="(page, pageIdx) in previewPages"
            :key="pageIdx"
            class="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-4"
          >
            <div class="text-[11px] font-bold text-blue-800 pb-1 border-b border-slate-200 flex items-center justify-between">
              <span>📄 Lembar Halaman Ke-{{ pageIdx + 1 }}</span>
              <span>{{ page.length }} Label</span>
            </div>

            <div
              v-for="(item, itemIdx) in page"
              :key="item.id"
              class="label-item-wrapper"
            >
              <div class="label-preview-content bg-white shadow-xs">
                <table class="label-table">
                  <tbody>
                    <!-- ROW 1: Header Brand, Date, QR -->
                    <tr>
                      <td v-if="getLabelSign(item)" :style="{ backgroundColor: getLabelSign(item).bgColor + ' !important', color: (getLabelSign(item).textColor || '#ffffff') + ' !important' }" class="dynamic-corner-sign">
                        {{ getLabelSign(item).badgeText }}
                      </td>
                      <td v-else style="width: 10px;"></td>

                      <td colspan="4" style="padding: 1px; text-align: center;">
                        <span style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 18px; color: #d61c1c; letter-spacing: 0.5px; display: block; line-height: 1.1;">
                          PT. SAPTAWARNA CEMERLANG
                        </span>
                      </td>

                      <td style="padding: 1px; font-size: 11px; font-weight: bold; white-space: nowrap; text-align: center;">
                        {{ formatTanggalIndonesia(item.tanggal) }}
                      </td>

                      <td style="width: 52px; padding: 1px; text-align: center;">
                        <img
                          :src="`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                            `${getDisplayJenis(item)} ${item.kode} ${item.thickness} MC X ${item.width} MM = ${item.length}|${item.lot}${item.turunan}|${item.kodePack}${item.subKode}`
                          )}`"
                          alt="QR"
                          style="width: 44px; height: 44px; margin: 0 auto; display: block;"
                        />
                      </td>
                    </tr>

                    <!-- ROW 2: Film Type & SPK & Month Image (Center) -->
                    <tr>
                      <td colspan="5" style="padding: 1px; font-weight: bold; font-size: 15px; text-align: center;">
                        {{ getDisplayJenis(item) }}({{ item.type }}) <span style="color: red;">{{ item.kode }}</span>
                      </td>
                      <td style="padding: 1px; font-weight: bold; font-size: 11px; text-align: center;">
                        {{ item.spk }}
                      </td>
                      <td rowspan="7" style="text-align: center; vertical-align: middle; padding: 1px; width: 48px;">
                        <img
                          :src="`./gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                          :alt="getMonthName(item.tanggal)"
                          style="max-height: 75px; max-width: 38px; margin: 0 auto; display: block;"
                          @error="(e) => e.target.src = `https://isnanswc.github.io/gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                        />
                      </td>
                    </tr>

                    <!-- ROW 3: Thick, Netto, Treatment (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Thick</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.thickness }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MC</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Netto</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.netto }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Treatment</strong></td>
                      <td style="padding: 1px; color: red; font-weight: bold; font-size: 9.5px; text-align: center;">{{ item.treatment }}</td>
                    </tr>

                    <!-- ROW 4: Width, Paper Core, OD+Plasma (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Width</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.width }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MM</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Paper Core</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; text-align: center;">
                        <span>{{ item.paperCore }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>OD+Plasma</strong></td>
                      <td style="padding: 1px; color: red; font-weight: bold; font-size: 10.5px; text-align: center; word-break: break-all;">
                        {{ item.od }}
                      </td>
                    </tr>

                    <!-- ROW 5: Length, Joint, Meter (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Length</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                        <span>{{ item.length }}</span>
                        <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Joint</strong></td>
                      <td style="padding: 0.5px; font-size: 15px; text-align: center;">
                        {{ item.joint !== undefined && item.joint !== '' ? item.joint : '0' }}
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Meter</strong></td>
                      <td style="position: relative; padding: 0.5px; font-size: 13.5px; text-align: center;">
                        <span>{{ (item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '') ? item.meter : '-' }}</span>
                        <span v-if="item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '' && item.meter !== '-'" style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                      </td>
                    </tr>

                    <!-- ROW 6: Supplier, Lot, Turunan (All Center) -->
                    <tr>
                      <td style="padding: 1px; background-color: #f0f0f0; font-size: 9.5px; text-align: center;"><strong>{{ item.supplier || '-' }}</strong></td>
                      <td colspan="4" style="padding: 1px; font-size: 15px; font-weight: bold; text-align: center;">{{ formatLotVisual(item.lot, item.supplier) }}</td>
                      <td style="padding: 1px; font-size: 12px; font-weight: bold; text-align: center;">{{ item.turunan }}</td>
                    </tr>

                    <!-- ROW 7: Code Pack & Status (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Code Pack:</strong></td>
                      <td colspan="3" style="padding: 1px; font-size: 13.5px; text-align: center;">
                        <strong>{{ item.kodePack }}<span style="color: red;">{{ item.subKode }}</span></strong>
                      </td>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>STATUS</strong></td>
                      <td :class="item.status === 'HOLD' ? 'label-fail' : item.status === 'REJECT' ? 'label-reject' : 'label-pass'" style="font-size: 9.5px; text-align: center;">
                        {{ item.status }}
                      </td>
                    </tr>

                    <!-- ROW 8: Keterangan (All Center) -->
                    <tr>
                      <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Ket:</strong></td>
                      <td colspan="5" style="padding: 1px; font-size: 9.5px; text-align: center;">{{ item.keterangan || '-' }}</td>
                    </tr>
                  </tbody>
                </table>

                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; font-size: 6.5px; font-family: monospace; color: #475569; line-height: 1; padding: 0.5px 2px 0 2px; margin: 0; height: 7.5px; box-sizing: border-box;">
                  <span>{{ item.uniqId }}</span>
                  <span>{{ currentDateTimeString }}</span>
                </div>
              </div>

              <!-- Garis Bantu Putus-Putus dengan Icon Gunting Minimalis & Estetik (Hanya hilang di label ke-4 / akhir halaman) -->
              <div
                v-if="(itemIdx + 1) % 4 !== 0"
                class="cut-line"
              >
                <svg class="cut-scissor-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="6" cy="6" r="3" />
                  <circle cx="6" cy="18" r="3" />
                  <line x1="20" y1="4" x2="8.12" y2="15.88" />
                  <line x1="14.47" y1="14.48" x2="20" y2="20" />
                  <line x1="8.12" y1="8.12" x2="12" y2="12" />
                </svg>
                <span class="cut-dash"></span>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Footer -->
        <div class="flex items-center justify-end gap-3 pt-3 border-t border-zinc-100">
          <button @click="showPreviewModal = false" class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700">
            Tutup
          </button>
          <button @click="triggerPrint" class="px-6 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/25 flex items-center gap-2">
            🖨️ Cetak {{ previewItems.length }} Label ({{ previewPages.length }} Halaman)
          </button>
        </div>
      </div>
    </div>

    <!-- DEDICATED TELEPORTED PRINT CONTAINER (ONLY VISIBLE DURING BROWSER PRINT) -->
    <teleport to="body">
      <div v-if="showPreviewModal" id="printOnlyArea">
        <div
          v-for="(page, pageIdx) in previewPages"
          :key="pageIdx"
          class="print-page"
        >
          <div
            v-for="(item, itemIdx) in page"
            :key="item.id"
            class="label-item-wrapper"
          >
            <div class="label-preview-content">
              <table class="label-table">
                <tbody>
                  <!-- ROW 1: Header Brand, Date, QR -->
                  <tr>
                    <td v-if="getLabelSign(item)" :style="{ backgroundColor: getLabelSign(item).bgColor + ' !important', color: (getLabelSign(item).textColor || '#ffffff') + ' !important' }" class="dynamic-corner-sign">
                      {{ getLabelSign(item).badgeText }}
                    </td>
                    <td v-else style="width: 10px;"></td>

                    <td colspan="4" style="padding: 1px; text-align: center;">
                      <span style="font-family: 'Impact', 'Arial Black', sans-serif; font-size: 18px; color: #d61c1c; letter-spacing: 0.5px; display: block; line-height: 1.1;">
                        PT. SAPTAWARNA CEMERLANG
                      </span>
                    </td>

                    <td style="padding: 1px; font-size: 11px; font-weight: bold; white-space: nowrap; text-align: center;">
                      {{ formatTanggalIndonesia(item.tanggal) }}
                    </td>

                    <td style="width: 52px; padding: 1px; text-align: center;">
                      <img
                        :src="`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${encodeURIComponent(
                          `${getDisplayJenis(item)} ${item.kode} ${item.thickness} MC X ${item.width} MM = ${item.length}|${item.lot}${item.turunan}|${item.kodePack}${item.subKode}`
                        )}`"
                        alt="QR"
                        style="width: 44px; height: 44px; margin: 0 auto; display: block;"
                      />
                    </td>
                  </tr>

                  <!-- ROW 2: Film Type & SPK & Month Image (Center) -->
                  <tr>
                    <td colspan="5" style="padding: 1px; font-weight: bold; font-size: 15px; text-align: center;">
                      {{ getDisplayJenis(item) }}({{ item.type }}) <span style="color: red;">{{ item.kode }}</span>
                    </td>
                    <td style="padding: 1px; font-weight: bold; font-size: 11px; text-align: center;">
                      {{ item.spk }}
                    </td>
                    <td rowspan="7" style="text-align: center; vertical-align: middle; padding: 1px; width: 48px;">
                      <img
                        :src="`./gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                        :alt="getMonthName(item.tanggal)"
                        style="max-height: 75px; max-width: 38px; margin: 0 auto; display: block;"
                        @error="(e) => e.target.src = `https://isnanswc.github.io/gambar/${getMonthName(item.tanggal).toLowerCase()}.png`"
                      />
                    </td>
                  </tr>

                  <!-- ROW 3: Thick, Netto, Treatment (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Thick</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.thickness }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MC</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Netto</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.netto }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Treatment</strong></td>
                    <td style="padding: 1px; color: red; font-weight: bold; font-size: 9.5px; text-align: center;">{{ item.treatment }}</td>
                  </tr>

                  <!-- ROW 4: Width, Paper Core, OD+Plasma (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Width</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.width }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">MM</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Paper Core</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; text-align: center;">
                      <span>{{ item.paperCore }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">KG</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>OD+Plasma</strong></td>
                    <td style="padding: 1px; color: red; font-weight: bold; font-size: 10.5px; text-align: center; word-break: break-all;">
                      {{ item.od }}
                    </td>
                  </tr>

                  <!-- ROW 5: Length, Joint, Meter (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Length</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 15px; font-weight: bold; text-align: center;">
                      <span>{{ item.length }}</span>
                      <span style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Joint</strong></td>
                    <td style="padding: 0.5px; font-size: 15px; text-align: center;">
                      {{ item.joint !== undefined && item.joint !== '' ? item.joint : '0' }}
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Meter</strong></td>
                    <td style="position: relative; padding: 0.5px; font-size: 13.5px; text-align: center;">
                      <span>{{ (item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '') ? item.meter : '-' }}</span>
                      <span v-if="item.meter && String(item.meter) !== String(item.length) && String(item.meter).trim() !== '' && item.meter !== '-'" style="position: absolute; top: 1px; right: 2px; font-size: 7px; font-weight: bold; color: #4b5563; line-height: 1;">M</span>
                    </td>
                  </tr>

                  <!-- ROW 6: Supplier, Lot, Turunan (All Center) -->
                  <tr>
                    <td style="padding: 1px; background-color: #f0f0f0; font-size: 9.5px; text-align: center;"><strong>{{ item.supplier || '-' }}</strong></td>
                    <td colspan="4" style="padding: 1px; font-size: 15px; font-weight: bold; text-align: center;">{{ formatLotVisual(item.lot, item.supplier) }}</td>
                    <td style="padding: 1px; font-size: 12px; font-weight: bold; text-align: center;">{{ item.turunan }}</td>
                  </tr>

                  <!-- ROW 7: Code Pack & Status (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Code Pack:</strong></td>
                    <td colspan="3" style="padding: 1px; font-size: 13.5px; text-align: center;">
                      <strong>{{ item.kodePack }}<span style="color: red;">{{ item.subKode }}</span></strong>
                    </td>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>STATUS</strong></td>
                    <td :class="item.status === 'HOLD' ? 'label-fail' : item.status === 'REJECT' ? 'label-reject' : 'label-pass'" style="font-size: 9.5px; text-align: center;">
                      {{ item.status }}
                    </td>
                  </tr>

                  <!-- ROW 8: Keterangan (All Center) -->
                  <tr>
                    <td style="padding: 1px; font-size: 9.5px; text-align: center;"><strong>Ket:</strong></td>
                    <td colspan="5" style="padding: 1px; font-size: 9.5px; text-align: center;">{{ item.keterangan || '-' }}</td>
                  </tr>
                </tbody>
              </table>

              <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-top: 3px; padding-bottom: 2px; box-sizing: border-box; line-height: 1.2;">
                <strong><span style="font-size: 8px; font-family: monospace; letter-spacing: 0.2px; color: #000;">{{ item.uniqId }}</span></strong>
                <span style="font-size: 8px; font-family: Arial, sans-serif; color: #1f2937;">{{ currentDateTimeString }}</span>
              </div>
            </div>

            <!-- Garis Bantu Putus-Putus dengan Icon Gunting Minimalis & Estetik (Hanya hilang di label ke-4 / akhir halaman) -->
            <div
              v-if="(itemIdx + 1) % 4 !== 0"
              class="cut-line"
            >
              <svg class="cut-scissor-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="6" cy="6" r="3" />
                <circle cx="6" cy="18" r="3" />
                <line x1="20" y1="4" x2="8.12" y2="15.88" />
                <line x1="14.47" y1="14.48" x2="20" y2="20" />
                <line x1="8.12" y1="8.12" x2="12" y2="12" />
              </svg>
              <span class="cut-dash"></span>
            </div>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useLabelStore } from '@/stores/labelStore';
import { useConfigStore, getDefaultFilmAlias } from '@/stores/configStore';
import { useAuthStore } from '@/stores/authStore';
import { useWipStore } from '@/stores/wipStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { saveSetting, getSetting } from '@/db';
import { getActiveQuickTags, checkAndRunScheduledAutomation, DEFAULT_DEFECT_TAGS, formatLotVisual, formatInhouseLotInput } from '@/services/aiAutomationService';
import { getAgingCountdownInfo } from '@/services/wipParserService';
import { parseContinuousLot, detectSupplier, extractCleanParentLot } from '@/services/dataRollParserService';

const labelStore = useLabelStore();
const configStore = useConfigStore();
const authStore = useAuthStore();
const wipStore = useWipStore();
const dataRollStore = useDataRollStore();
const scheduleStore = useScheduleStore();

// Mode Pencarian No Lot: 'WIP' (WIP Jumbo) vs 'DATA_ROLL' (Data Roll FG)
const lotSearchSource = ref('WIP');
const setLotSearchSource = async (source) => {
  lotSearchSource.value = source;
  if (source === 'DATA_ROLL') {
    if (!dataRollStore.rolls || dataRollStore.rolls.length === 0) {
      try {
        await dataRollStore.loadRolls();
      } catch (e) {
        console.error('Gagal memuat dataRollStore:', e);
      }
    }
  } else {
    if (!wipStore.wipRolls || wipStore.wipRolls.length === 0) {
      try {
        await wipStore.loadWipRolls();
      } catch (e) {
        console.error('Gagal memuat wipStore:', e);
      }
    }
  }
};

// WIP Jumbo & Data Roll Smart Recommendation & Selection Modal State
const showWipModal = ref(false);
const userDismissedWipModal = ref(false);
const wipSearchQuery = ref('');
const wipFilterJenis = ref('');
const wipFilterLokasi = ref('');
const selectedWipRoll = ref(null);
const widthInputRef = ref(null);

const getWipAgingInfo = (roll) => {
  if (!roll) return { isAging: false, remainingFormatted: 'Siap Pakai', targetDateFormatted: '—' };
  return getAgingCountdownInfo(roll.estimasiWaktuAgingRaw || roll.estimasiWaktuAging, roll.waktuAgingRaw || roll.waktuAging);
};

const uniqueWipLocations = computed(() => {
  const list = (wipStore.activeWipRolls && wipStore.activeWipRolls.length > 0)
    ? wipStore.activeWipRolls
    : (wipStore.wipRolls || []);
  const locs = new Set(list.map(r => r.lokasiAktif).filter(Boolean));
  return Array.from(locs).sort();
});

const filteredWipModalRolls = computed(() => {
  let list = (wipStore.activeWipRolls && wipStore.activeWipRolls.length > 0)
    ? wipStore.activeWipRolls
    : (wipStore.wipRolls || []);
  
  if (wipFilterJenis.value) {
    list = list.filter(r => r.jenis === wipFilterJenis.value);
  }
  if (wipFilterLokasi.value) {
    list = list.filter(r => (r.lokasiAktif || '').toUpperCase().includes(wipFilterLokasi.value.toUpperCase()));
  }
  if (wipSearchQuery.value.trim()) {
    const q = wipSearchQuery.value.toLowerCase().trim();
    list = list.filter(r =>
      (r.lot || '').toLowerCase().includes(q) ||
      (r.spk || '').toLowerCase().includes(q) ||
      (r.kodeFormula || '').toLowerCase().includes(q) ||
      (r.jenis || '').toLowerCase().includes(q) ||
      (r.lokasiAktif || '').toLowerCase().includes(q)
    );
  }
  return list;
});

// Algoritma Kemiripan No Lot Persentase Cepat (0% - 100%)
function computeLotSimilarityPct(query, target) {
  if (!query || !target) return 0;
  const q = String(query).trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
  const t = String(target).trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
  if (!q || !t) return 0;
  if (q === t) return 100;

  // Cek Cepat O(N) Substring & Prefix
  if (t.startsWith(q)) {
    return Math.min(99, Math.max(80, Math.round(75 + (q.length / t.length) * 24)));
  }
  if (t.includes(q)) {
    return Math.min(95, Math.max(65, Math.round(60 + (q.length / t.length) * 35)));
  }
  if (q.startsWith(t)) {
    return Math.min(90, Math.max(60, Math.round(50 + (t.length / q.length) * 40)));
  }

  // Prefix matching length
  let prefixMatchLen = 0;
  while (prefixMatchLen < q.length && prefixMatchLen < t.length && q[prefixMatchLen] === t[prefixMatchLen]) {
    prefixMatchLen++;
  }

  // Hitung Levenshtein HANYA jika selisih panjang <= 4 untuk menjaga performa tinggi (hemat CPU)
  if (Math.abs(q.length - t.length) <= 4 && q.length <= 35 && t.length <= 35) {
    const matrix = Array.from({ length: q.length + 1 }, () => Array(t.length + 1).fill(0));
    for (let i = 0; i <= q.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= t.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= q.length; i++) {
      for (let j = 1; j <= t.length; j++) {
        const cost = q[i - 1] === t[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + cost
        );
      }
    }
    const dist = matrix[q.length][t.length];
    const maxLen = Math.max(q.length, t.length);
    const levRatio = Math.max(0, 1 - (dist / maxLen));
    const prefixRatio = prefixMatchLen / Math.max(1, q.length);
    const combined = (prefixRatio * 0.45) + (levRatio * 0.55);
    return Math.min(100, Math.max(0, Math.round(combined * 100)));
  }

  const prefixRatio = prefixMatchLen / Math.max(1, q.length);
  return Math.min(60, Math.max(0, Math.round(prefixRatio * 60)));
}

function getSimilarityBadge(pct) {
  const p = Math.max(0, Math.min(100, Math.round(pct || 0)));
  if (p === 100) {
    return {
      text: '100% Mirip (Cocok Persis)',
      badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300 font-black',
      barClass: 'bg-emerald-500'
    };
  }
  if (p >= 80) {
    return {
      text: `${p}% Mirip`,
      badgeClass: 'bg-teal-100 text-teal-900 border border-teal-300 font-bold',
      barClass: 'bg-teal-500'
    };
  }
  if (p >= 60) {
    return {
      text: `${p}% Mirip`,
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300 font-bold',
      barClass: 'bg-amber-500'
    };
  }
  if (p >= 40) {
    return {
      text: `${p}% Mirip`,
      badgeClass: 'bg-orange-100 text-orange-900 border border-orange-300 font-semibold',
      barClass: 'bg-orange-500'
    };
  }
  return {
    text: `${p}% Mirip`,
    badgeClass: 'bg-slate-100 text-slate-700 border border-slate-300 font-medium',
    barClass: 'bg-slate-400'
  };
}

const getWipExcelDesc = (wip) => {
  if (!wip) return '-';
  if (wip.descriptionExcel && wip.descriptionExcel.trim()) return wip.descriptionExcel.trim();
  if (wip.descExcel && wip.descExcel.trim()) return wip.descExcel.trim();
  const j = (wip.jenis || '').trim().toUpperCase();
  const f = (wip.kodeFormula || '').trim().toUpperCase();
  const t = (wip.thickness !== undefined && wip.thickness !== null ? String(wip.thickness) : '').trim();
  const w = (wip.width !== undefined && wip.width !== null ? String(wip.width) : '').trim();
  const l = (wip.length !== undefined && wip.length !== null ? String(wip.length) : '').trim();
  const c = (wip.core !== undefined && wip.core !== null && String(wip.core).trim() ? String(wip.core).trim() : '6');
  const rawOd = (wip.od || '').trim();
  const odVal = rawOd ? rawOd : '0';
  const tandaVal = (wip.tanda || '').trim();
  let desc = `${j} ${f} ${t} MC X ${w} MM = ${l} , ${c} INCHI ${odVal}`;
  if (tandaVal) desc += ` ${tandaVal}`;
  return desc.trim();
};

const getDataRollDesc = (r) => {
  if (!r) return '-';
  if (r.descriptionExcel && r.descriptionExcel.trim()) return r.descriptionExcel.trim();
  const j = (r.jenis || '').trim().toUpperCase();
  const f = (r.kodeFormula || r.kodeFg || '').trim().toUpperCase();
  const t = (r.thickness !== undefined && r.thickness !== null ? String(r.thickness) : '').trim();
  const w = (r.width !== undefined && r.width !== null ? String(r.width) : '').trim();
  const l = (r.length !== undefined && r.length !== null ? String(r.length) : (r.meter || '')).trim();
  return `${j} ${f} ${t ? t + ' MC' : ''} ${w ? 'X ' + w + ' MM' : ''} ${l ? '= ' + l + ' M' : ''}`.trim() || '-';
};

// Modal dedicated search query state
const modalSearchQuery = ref('');
const activeQuery = computed(() => {
  if (showWipModal.value) {
    return (modalSearchQuery.value !== '' ? modalSearchQuery.value : (form.lot || '')).trim().toUpperCase();
  }
  return (form.lot || '').trim().toUpperCase();
});

// Matched rolls from WIP Jumbo (Pencarian menyeluruh di seluruh database)
const wipMatchedRolls = computed(() => {
  const allRolls = (wipStore.activeWipRolls && wipStore.activeWipRolls.length > 0)
    ? wipStore.activeWipRolls
    : (wipStore.wipRolls || []);
  const rawQ = activeQuery.value;
  if (!rawQ) {
    return allRolls.slice(0, 100).map(r => ({ roll: r, similarityPct: 100 }));
  }
  const q = rawQ.replace(/[\/\.\-\s]/g, '');
  if (!q) {
    return allRolls.slice(0, 100).map(r => ({ roll: r, similarityPct: 100 }));
  }

  // Tahap 1: Pencarian langsung kata kunci (Exact, Prefix, Substring) ke seluruh 30rb data
  const directMatches = [];
  for (let i = 0; i < allRolls.length; i++) {
    const r = allRolls[i];
    const lotRaw = (r.lot || '').trim().toUpperCase();
    const lotClean = lotRaw.replace(/[\/\.\-\s]/g, '');
    const spkClean = (r.spk || '').trim().toUpperCase().replace(/[\/\.\-\s]/g, '');

    let score = 0;
    if (q === lotClean || (spkClean && q === spkClean)) {
      score = 100;
    } else if (lotClean.startsWith(q)) {
      score = 95;
    } else if (lotClean.includes(q)) {
      score = 88;
    } else if (spkClean && spkClean.includes(q)) {
      score = 80;
    }

    if (score > 0) {
      directMatches.push({ roll: r, similarityPct: score });
    }
  }

  if (directMatches.length > 0) {
    directMatches.sort((a, b) => b.similarityPct - a.similarityPct);
    return directMatches;
  }

  // Tahap 2: Jika tidak ada kecocokan teks sama sekali dan q >= 4, lakukan pencarian kemiripan typo (Fuzzy)
  if (q.length >= 4) {
    const fuzzyMatches = [];
    for (let i = 0; i < allRolls.length; i++) {
      const r = allRolls[i];
      const lotRaw = (r.lot || '').trim().toUpperCase();
      const pct = computeLotSimilarityPct(q, lotRaw);
      if (pct >= 50) {
        fuzzyMatches.push({ roll: r, similarityPct: pct });
      }
    }
    fuzzyMatches.sort((a, b) => b.similarityPct - a.similarityPct);
    return fuzzyMatches;
  }

  return [];
});

// Matched rolls from Data Roll (Pencarian menyeluruh di seluruh 30rb+ data roll)
const dataRollMatchedRolls = computed(() => {
  const allRolls = dataRollStore.rolls || [];
  const rawQ = activeQuery.value;
  if (!rawQ) {
    return allRolls.slice(0, 100).map(r => ({ roll: r, similarityPct: 100 }));
  }
  const q = rawQ.replace(/[\/\.\-\s]/g, '');
  if (!q) {
    return allRolls.slice(0, 100).map(r => ({ roll: r, similarityPct: 100 }));
  }

  // Tahap 1: Pencarian langsung kata kunci (Exact, StartsWith, Contains) ke seluruh database roll
  const directMatches = [];
  for (let i = 0; i < allRolls.length; i++) {
    const r = allRolls[i];
    const lotRaw = (r.lot || '').trim().toUpperCase();
    const lotClean = lotRaw.replace(/[\/\.\-\s]/g, '');
    const turunanRaw = (r.turunan || '').trim().toUpperCase();
    const turunanClean = turunanRaw.replace(/[\/\.\-\s]/g, '');
    const fullLotClean = lotClean + turunanClean;
    const kodeFgClean = (r.kodeFg || '').trim().toUpperCase().replace(/[\/\.\-\s]/g, '');
    const spkClean = (r.spk || '').trim().toUpperCase().replace(/[\/\.\-\s]/g, '');

    let score = 0;
    if (q === fullLotClean || q === lotClean || (turunanClean && q === turunanClean) || (spkClean && q === spkClean)) {
      score = 100;
    } else if (fullLotClean.startsWith(q) || lotClean.startsWith(q)) {
      score = 95;
    } else if (turunanClean && turunanClean.startsWith(q)) {
      score = 92;
    } else if (fullLotClean.includes(q) || lotClean.includes(q)) {
      score = 88;
    } else if (turunanClean && turunanClean.includes(q)) {
      score = 85;
    } else if (spkClean && spkClean.includes(q)) {
      score = 80;
    } else if (kodeFgClean && kodeFgClean.includes(q)) {
      score = 75;
    }

    if (score > 0) {
      directMatches.push({ roll: r, similarityPct: score });
    }
  }

  if (directMatches.length > 0) {
    directMatches.sort((a, b) => b.similarityPct - a.similarityPct);
    return directMatches;
  }

  // Tahap 2: Jika tidak ada kecocokan langsung dan kata kunci >= 4 karakter, cari dengan toleransi kemiripan typo (Fuzzy)
  if (q.length >= 4) {
    const fuzzyMatches = [];
    for (let i = 0; i < allRolls.length; i++) {
      const r = allRolls[i];
      const lotRaw = (r.lot || '').trim().toUpperCase();
      const pct = computeLotSimilarityPct(q, lotRaw);
      if (pct >= 50) {
        fuzzyMatches.push({ roll: r, similarityPct: pct });
      }
    }
    fuzzyMatches.sort((a, b) => b.similarityPct - a.similarityPct);
    return fuzzyMatches;
  }

  return [];
});

// Active matched list according to toggle
const activeMatchedRolls = computed(() => {
  return lotSearchSource.value === 'DATA_ROLL' ? dataRollMatchedRolls.value : wipMatchedRolls.value;
});

// PAGINATION & VIRTUAL SLICING: Tampilkan 100 teratas saja, bisa muat 100 lagi untuk hemat memori & rendering cepat
const modalDisplayLimit = ref(100);
const paginatedMatchedRolls = computed(() => {
  return activeMatchedRolls.value.slice(0, modalDisplayLimit.value);
});

const loadMoreRolls = () => {
  modalDisplayLimit.value += 100;
};

const matchedWipRoll = computed(() => {
  if (!form.lot || form.lot.trim().length < 3) return null;
  const q = form.lot.trim().toUpperCase().replace(/[\/\.\s]/g, '');
  const list = (wipStore.activeWipRolls && wipStore.activeWipRolls.length > 0)
    ? wipStore.activeWipRolls
    : (wipStore.wipRolls || []);
  return list.find(r => (r.lot || '').trim().toUpperCase().replace(/[\/\.\s]/g, '') === q);
});

// Tombol rekomendasi muncul jika lot terdaftar / ada yang cocok
const hasRecommendations = computed(() => {
  return form.lot && form.lot.trim().length >= 1 && activeMatchedRolls.value.length > 0;
});

// Warning kecil jika tidak terdaftar
const isLotUnregistered = computed(() => {
  if (!form.lot || form.lot.trim().length < 2) return false;
  return activeMatchedRolls.value.length === 0;
});

const openRecommendationModal = async () => {
  modalSearchQuery.value = form.lot ? form.lot.trim() : '';
  modalDisplayLimit.value = 100;
  if (lotSearchSource.value === 'DATA_ROLL') {
    if (!dataRollStore.rolls || dataRollStore.rolls.length === 0) {
      try {
        await dataRollStore.loadRolls();
      } catch (e) {
        console.error(e);
      }
    }
  } else {
    if (!wipStore.wipRolls || wipStore.wipRolls.length === 0) {
      try {
        await wipStore.loadWipRolls();
      } catch (e) {
        console.error(e);
      }
    }
  }
  showWipModal.value = true;
};

const closeWipModal = () => {
  showWipModal.value = false;
  modalDisplayLimit.value = 100;
};

const handleLotInput = () => {
  form.lot = formatInhouseLotInput(form.lot);
  if (selectedWipRoll.value && selectedWipRoll.value.lot !== form.lot) {
    selectedWipRoll.value = null;
  }
};

const selectWipRoll = (roll) => {
  if (!roll) return;
  form.lot = (roll.lot || form.lot || '').replace(/\s+/g, '').toUpperCase();
  modalSearchQuery.value = form.lot;
  if (roll.spk) form.spk = roll.spk;
  if (roll.kodeFormula) form.kode = roll.kodeFormula;
  if (roll.jenis) form.jenis = roll.jenis;
  if (roll.thickness) form.thickness = String(roll.thickness);
  form.supplier = (roll.supplier || '').replace(/\s+/g, '').toUpperCase();
  
  syncFormulaConfigs();
  selectedWipRoll.value = roll;
  showWipModal.value = false;
  userDismissedWipModal.value = true;
  updateAutoFields();

  nextTick(() => {
    if (widthInputRef.value) {
      widthInputRef.value.focus?.();
      widthInputRef.value.select?.();
    }
  });
};

const selectDataRoll = (roll) => {
  const cleanLot = extractCleanParentLot(roll.lot, roll.turunan);
  form.lot = (cleanLot || roll.lot || form.lot || '').replace(/\s+/g, '').toUpperCase();
  modalSearchQuery.value = form.lot;
  if (roll.spk) form.spk = roll.spk;
  if (roll.kodeFormula || roll.kodeFg) form.kode = roll.kodeFormula || roll.kodeFg;
  if (roll.jenis) form.jenis = roll.jenis;
  if (roll.thickness) form.thickness = String(roll.thickness);
  if (roll.width) form.width = String(roll.width);
  if (roll.length || roll.meter) form.length = String(roll.length || roll.meter);
  if (roll.supplier) form.supplier = (roll.supplier || '').replace(/\s+/g, '').toUpperCase();
  if (roll.qualityStatus || roll.status) form.status = String(roll.qualityStatus || roll.status).toUpperCase();
  if (roll.turunan) form.turunan = roll.turunan;
  if (roll.netto || roll.berat) form.berat = roll.netto || roll.berat;
  if (roll.operator || roll.kodeOperator) {
    form.operator = roll.operator || form.operator;
    form.kodeOperator = roll.kodeOperator || form.kodeOperator;
  }
  
  syncFormulaConfigs();
  selectedWipRoll.value = roll;
  showWipModal.value = false;
  userDismissedWipModal.value = true;
  updateAutoFields();

  nextTick(() => {
    if (widthInputRef.value) {
      widthInputRef.value.focus?.();
      widthInputRef.value.select?.();
    }
  });
};

const formatNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0' : num.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

// Role-Based Locking: Verified labels are locked for Operator, editable only by Admin
const isLockedForUser = (item) => {
  if (!item) return false;
  return Boolean((item.verified === 1 || item.verified === true) && authStore.isOperator);
};

// Dynamic sticky top offset for Parent-Child rows below the control bar
const controlBarRef = ref(null);
const controlBarBottom = ref(172);

const updateControlBarOffset = () => {
  if (controlBarRef.value) {
    const rect = controlBarRef.value.getBoundingClientRect();
    // Navbar height is 64px (top-16). Control bar sits at 64px.
    // Dempet 100% tanpa celah (flush seamless stack):
    controlBarBottom.value = Math.round(64 + rect.height);
  }
};

// Column Visibility Management (Defaults clean and uncluttered)
const defaultColumns = {
  id: true,
  uniqId: false,
  tanggal: true,
  mesin: true,
  operator: true,
  supplier: false,
  spk: true,
  lot: true,
  dimensi: true,
  kodePack: true,
  status: true,
  bulan: false,
  aksi: true
};

const visibleColumns = reactive({ ...defaultColumns });
const showColumnModal = ref(false);

const columnList = [
  { key: 'id', label: 'No / ID Record' },
  { key: 'uniqId', label: 'UNIQ ID' },
  { key: 'tanggal', label: 'Tanggal' },
  { key: 'mesin', label: 'Mesin' },
  { key: 'operator', label: 'Operator' },
  { key: 'supplier', label: 'Supplier' },
  { key: 'spk', label: 'No. SPK' },
  { key: 'lot', label: 'No Lot Akhir' },
  { key: 'dimensi', label: 'Dimensi & Berat' },
  { key: 'kodePack', label: 'Kode Pack' },
  { key: 'status', label: 'Status QC' },
  { key: 'bulan', label: 'Bulan' },
  { key: 'aksi', label: 'Tombol Aksi Cepat' }
];

const activeColumnCount = computed(() => {
  return Object.values(visibleColumns).filter(Boolean).length;
});

const openColumnModal = () => {
  showColumnModal.value = true;
};

const saveColumnSettings = async () => {
  await saveSetting('visible_columns', { ...visibleColumns });
  showColumnModal.value = false;
};

const resetColumns = async () => {
  Object.assign(visibleColumns, defaultColumns);
  await saveSetting('visible_columns', { ...defaultColumns });
};

const toggleAllColumns = (val) => {
  columnList.forEach(c => {
    visibleColumns[c.key] = val;
  });
};

// Row Action Context Modal
const showRowActionModal = ref(false);
const selectedRowItem = ref(null);

const openRowActionModal = (item) => {
  selectedRowItem.value = item;
  showRowActionModal.value = true;
};

const handleRowAction = (action) => {
  if (!selectedRowItem.value) return;
  const item = selectedRowItem.value;
  showRowActionModal.value = false;

  if (action === 'preview') {
    previewSingle(item);
  } else if (action === 'edit') {
    if (isLockedForUser(item)) {
      alert('🔒 Perhatian: Data label ini telah diapprove oleh Admin di DE Report dan TERKUNCI untuk Operator.\n\nBeralih ke Role Admin di Navbar jika Anda memiliki wewenang untuk mengubah data ini.');
      return;
    }
    openModal(item);
  } else if (action === 'duplicate') {
    duplicateData(item);
  } else if (action === 'delete') {
    if (isLockedForUser(item)) {
      alert('🔒 Perhatian: Data label ini telah diapprove oleh Admin di DE Report dan TERKUNCI untuk Operator.\n\nBeralih ke Role Admin di Navbar jika Anda ingin menghapus data ini.');
      return;
    }
    deleteData(item);
  }
};

const selectedIds = ref([]);
const showModal = ref(false);
const showPreviewModal = ref(false);
const isEditing = ref(false);
const previewItems = ref([]);

const toggleSortOrder = () => {
  labelStore.sortOrder = labelStore.sortOrder === 'asc' ? 'desc' : 'asc';
};

const sortByColumn = (col) => {
  if (labelStore.sortBy === col) {
    labelStore.sortOrder = labelStore.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    labelStore.sortBy = col;
    labelStore.sortOrder = (col === 'tanggal' || col === 'id' || col === 'netto') ? 'desc' : 'asc';
  }
};

const previewPages = computed(() => {
  const pages = [];
  for (let i = 0; i < previewItems.value.length; i += 4) {
    pages.push(previewItems.value.slice(i, i + 4));
  }
  return pages;
});

// ── HIERARCHY / PARENT-CHILD VIEW STATE & LOGIC ─────────────────────────────
const viewMode = ref('table'); // 'table' | 'hierarchy'
const expandedDates = reactive({});
const expandedShifts = reactive({});
const expandedLots = reactive({});

// Pagination Khusus Mode Hierarki (Mencegah browser freeze saat ribuan data/ratusan tanggal)
const hierarchyPage = ref(1);
const hierarchyDatesPerPage = ref(5); // Default 5 tanggal per halaman agar sangat cepat & enteng

// Reset halaman hierarki saat search query atau filter berubah
watch([() => labelStore.searchTerm, () => labelStore.filterMesin, () => labelStore.filterStatus], () => {
  hierarchyPage.value = 1;
});

// Daftar seluruh tanggal unik yang cocok dengan filter aktif
const allHierarchyDates = computed(() => {
  const items = labelStore.filteredLabels;
  if (!items || items.length === 0) return [];
  const dateSet = new Set();
  items.forEach(item => {
    dateSet.add(item.tanggal || 'Tanpa Tanggal');
  });
  return Array.from(dateSet).sort((a, b) => {
    if (a === 'Tanpa Tanggal') return 1;
    if (b === 'Tanpa Tanggal') return -1;
    return new Date(b).getTime() - new Date(a).getTime();
  });
});

const totalHierarchyPages = computed(() => {
  return Math.ceil(allHierarchyDates.value.length / hierarchyDatesPerPage.value) || 1;
});

const paginatedHierarchyDates = computed(() => {
  const start = (hierarchyPage.value - 1) * hierarchyDatesPerPage.value;
  return allHierarchyDates.value.slice(start, start + hierarchyDatesPerPage.value);
});

const isDateExpanded = (dateKey) => {
  if (expandedDates[dateKey] !== undefined) {
    return expandedDates[dateKey];
  }
  // Jika sedang mencari kata kunci, otomatis buka tanggal yang cocok
  if (labelStore.searchTerm) return true;
  // Default: Hanya tanggal pertama di halaman yang terbuka
  const firstDate = paginatedHierarchyDates.value[0];
  return dateKey === firstDate;
};

const isShiftExpanded = (uniqueKey) => {
  if (expandedShifts[uniqueKey] !== undefined) {
    return expandedShifts[uniqueKey];
  }
  if (labelStore.searchTerm) return true;
  const firstDate = paginatedHierarchyDates.value[0];
  return Boolean(firstDate && uniqueKey.startsWith(firstDate + '_'));
};

const isLotExpanded = (uniqueKey) => {
  if (expandedLots[uniqueKey] !== undefined) {
    return expandedLots[uniqueKey];
  }
  if (labelStore.searchTerm) return true;
  const firstDate = paginatedHierarchyDates.value[0];
  return Boolean(firstDate && uniqueKey.startsWith(firstDate + '_'));
};

const toggleDateExpand = (dateKey) => {
  expandedDates[dateKey] = !isDateExpanded(dateKey);
};

const toggleShiftExpand = (uniqueKey) => {
  expandedShifts[uniqueKey] = !isShiftExpanded(uniqueKey);
};

const toggleLotExpand = (uniqueKey) => {
  expandedLots[uniqueKey] = !isLotExpanded(uniqueKey);
};

const expandAllHierarchy = () => {
  hierarchyTree.value.forEach(d => {
    expandedDates[d.date] = true;
    (d.shifts || []).forEach(s => {
      expandedShifts[s.uniqueKey] = true;
      (s.lots || []).forEach(l => {
        expandedLots[l.uniqueKey] = true;
      });
    });
  });
};

const collapseAllHierarchy = () => {
  hierarchyTree.value.forEach(d => {
    expandedDates[d.date] = false;
    (d.shifts || []).forEach(s => {
      expandedShifts[s.uniqueKey] = false;
      (s.lots || []).forEach(l => {
        expandedLots[l.uniqueKey] = false;
      });
    });
  });
};

const isAllHierarchyExpanded = computed(() => {
  if (!hierarchyTree.value || hierarchyTree.value.length === 0) return false;
  return hierarchyTree.value.every(d => {
    if (!isDateExpanded(d.date)) return false;
    return (d.shifts || []).every(s => {
      if (!isShiftExpanded(s.uniqueKey)) return false;
      return (s.lots || []).every(l => isLotExpanded(l.uniqueKey));
    });
  });
});

const toggleAllHierarchy = () => {
  if (isAllHierarchyExpanded.value) {
    collapseAllHierarchy();
  } else {
    expandAllHierarchy();
  }
};

const handleReseed100Dummy = async () => {
  if (confirm('Hapus seluruh data label dan buat ulang 100 data simulasi standar sesuai aturan sistem (Kode Pack, Turunan, Operator, dsb)?')) {
    await labelStore.reseed100DummyLabels();
  }
};

// ── HIERARCHY CIRCULAR CHECKBOX SELECTION HELPERS ─────────────────────────────
const toggleSelectItem = (id) => {
  const idx = selectedIds.value.indexOf(id);
  if (idx !== -1) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(id);
  }
};

const isLotAllSelected = (lotNode) => {
  if (!lotNode || !lotNode.items || lotNode.items.length === 0) return false;
  return lotNode.items.every(item => selectedIds.value.includes(item.id));
};

const isLotSomeSelected = (lotNode) => {
  if (!lotNode || !lotNode.items || lotNode.items.length === 0) return false;
  const count = lotNode.items.filter(item => selectedIds.value.includes(item.id)).length;
  return count > 0 && count < lotNode.items.length;
};

const toggleSelectLot = (lotNode) => {
  if (!lotNode || !lotNode.items) return;
  const lotItemIds = lotNode.items.map(i => i.id);
  const allSelected = isLotAllSelected(lotNode);
  if (allSelected) {
    selectedIds.value = selectedIds.value.filter(id => !lotItemIds.includes(id));
  } else {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...lotItemIds]));
  }
};

const isShiftAllSelected = (shiftNode) => {
  if (!shiftNode || !shiftNode.items || shiftNode.items.length === 0) return false;
  return shiftNode.items.every(item => selectedIds.value.includes(item.id));
};

const isShiftSomeSelected = (shiftNode) => {
  if (!shiftNode || !shiftNode.items || shiftNode.items.length === 0) return false;
  const count = shiftNode.items.filter(item => selectedIds.value.includes(item.id)).length;
  return count > 0 && count < shiftNode.items.length;
};

const toggleSelectShift = (shiftNode) => {
  if (!shiftNode || !shiftNode.items) return;
  const shiftItemIds = shiftNode.items.map(i => i.id);
  const allSelected = isShiftAllSelected(shiftNode);
  if (allSelected) {
    selectedIds.value = selectedIds.value.filter(id => !shiftItemIds.includes(id));
  } else {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...shiftItemIds]));
  }
};

const getDateItemIds = (dateNode) => {
  if (!dateNode || !dateNode.shifts) return [];
  const ids = [];
  dateNode.shifts.forEach(shift => {
    if (shift.items) {
      shift.items.forEach(item => ids.push(item.id));
    }
  });
  return ids;
};

const isDateAllSelected = (dateNode) => {
  const ids = getDateItemIds(dateNode);
  if (ids.length === 0) return false;
  return ids.every(id => selectedIds.value.includes(id));
};

const isDateSomeSelected = (dateNode) => {
  const ids = getDateItemIds(dateNode);
  if (ids.length === 0) return false;
  const count = ids.filter(id => selectedIds.value.includes(id)).length;
  return count > 0 && count < ids.length;
};

const toggleSelectDate = (dateNode) => {
  const ids = getDateItemIds(dateNode);
  if (ids.length === 0) return;
  const allSelected = isDateAllSelected(dateNode);
  if (allSelected) {
    selectedIds.value = selectedIds.value.filter(id => !ids.includes(id));
  } else {
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...ids]));
  }
};

function resolveOperator(item) {
  if (!item) return null;
  const list = configStore.operatorList || [];
  if (!list.length) return null;

  const rawOp = String(item.operator || '').trim();
  const rawCode = String(item.kodeOperator || '').trim();
  const machine = String(item.mesin || '').trim().toUpperCase();

  // 1. Direct match by kodeOperator & Machine
  if (rawCode) {
    const byCodeMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine && o.active !== false)
      || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
    if (byCodeMachine) return byCodeMachine;

    const byCode = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase() && o.active !== false)
      || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === rawCode.toUpperCase());
    if (byCode) return byCode;
  }

  // 2. Direct match by nama or code in item.operator
  if (rawOp) {
    let cleanedOp = rawOp;
    if (cleanedOp.toUpperCase().startsWith('OPERATOR ')) {
      cleanedOp = cleanedOp.substring(9).trim();
    } else if (cleanedOp.toUpperCase() === 'OPERATOR') {
      cleanedOp = '';
    }

    if (cleanedOp) {
      // Bracketed match e.g. "GUNAWAN (G)" or "GUNAWAN [G]"
      const bracketMatch = cleanedOp.match(/^(.+?)\s*[\(\[]([A-Za-z0-9]+)[\)\]]$/);
      if (bracketMatch) {
        const bName = bracketMatch[1].trim().toUpperCase();
        const bCode = bracketMatch[2].trim().toUpperCase();
        const byBracket = list.find(o => (o.kodeOperator && o.kodeOperator.toUpperCase() === bCode) || (o.nama && o.nama.toUpperCase() === bName));
        if (byBracket) return byBracket;
      }

      // Check if cleanedOp matches operator's nama
      const byNameMachine = list.find(o => o.nama && o.nama.toUpperCase() === cleanedOp.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
      if (byNameMachine) return byNameMachine;

      const byName = list.find(o => o.nama && o.nama.toUpperCase() === cleanedOp.toUpperCase());
      if (byName) return byName;

      // Check if cleanedOp matches operator's kodeOperator (e.g. "G", "H", "W")
      const byCodeMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === cleanedOp.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
      if (byCodeMachine) return byCodeMachine;

      const byCode = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === cleanedOp.toUpperCase());
      if (byCode) return byCode;
    }
  }

  // 3. Fallback: Parse from Turunan
  if (item.turunan) {
    const parsed = parseTurunan(item.turunan);
    if (parsed) {
      const opPrefix = (parsed.isCasting && parsed.op) ? parsed.op : parsed.prefix;
      if (opPrefix) {
        const byTurunanMachine = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine && o.active !== false)
          || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix.toUpperCase() && o.mesin && o.mesin.toUpperCase() === machine);
        if (byTurunanMachine) return byTurunanMachine;

        const byTurunan = list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix.toUpperCase() && o.active !== false)
          || list.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === opPrefix.toUpperCase());
        if (byTurunan) return byTurunan;
      }
    }
  }

  return null;
}

function getOperatorDisplayName(item) {
  if (!item) return '—';
  const op = resolveOperator(item);
  if (op && op.nama) {
    return op.nama.toUpperCase();
  }
  const rawOp = (item.operator || '').trim();
  if (rawOp && rawOp.toUpperCase() !== 'OPERATOR' && !rawOp.toUpperCase().startsWith('OPERATOR ')) {
    return rawOp.toUpperCase();
  }
  if (item.turunan) {
    const fromTurunan = getOperatorFromTurunan(item.turunan, item.mesin);
    if (fromTurunan) return fromTurunan.toUpperCase();
  }
  return rawOp ? rawOp.toUpperCase() : '—';
}

function getOperatorCode(item) {
  if (!item) return '';
  const op = resolveOperator(item);
  if (op && op.kodeOperator) return op.kodeOperator.toUpperCase();
  if (item.kodeOperator) return item.kodeOperator.toUpperCase();
  if (item.turunan) {
    const parsed = parseTurunan(item.turunan);
    if (parsed) {
      if (parsed.isCasting && parsed.op) return parsed.op.toUpperCase();
      if (parsed.prefix) return parsed.prefix.toUpperCase();
    }
  }
  return '';
}

function getOperatorInitial(item) {
  const name = getOperatorDisplayName(item);
  if (name && name !== '—' && name !== 'OPERATOR' && !name.startsWith('OPERATOR ')) {
    return name.charAt(0).toUpperCase();
  }
  const code = getOperatorCode(item);
  if (code) return code.charAt(0).toUpperCase();
  return 'O';
}

function getOperatorGroup(item) {
  const op = resolveOperator(item);
  return op && op.kodeGrup ? op.kodeGrup.toUpperCase() : '';
}

function resolveOperatorName(item) {
  if (!item) return 'OPERATOR';
  const op = resolveOperator(item);
  if (op && op.nama) {
    return `${op.nama} (${op.kodeOperator})`.toUpperCase();
  }
  const name = getOperatorDisplayName(item);
  const code = getOperatorCode(item);
  if (code && name !== '—' && !name.includes(code)) {
    return `${name} (${code})`.toUpperCase();
  }
  return name !== '—' ? name.toUpperCase() : 'OPERATOR';
}

function getOperatorFromTurunan(turunanVal, mesinVal) {
  if (!turunanVal) return '';
  const parsed = parseTurunan(turunanVal);
  if (!parsed) return '';
  const opPrefix = (parsed.isCasting && parsed.op) ? parsed.op : parsed.prefix;
  if (!opPrefix) return '';
  const list = configStore.operatorList || [];
  const op = list.find(o => o.kodeOperator === opPrefix && (!mesinVal || !o.mesin || o.mesin.toUpperCase() === mesinVal.toUpperCase()))
    || list.find(o => o.kodeOperator === opPrefix);
  return op ? `${op.nama} (${op.kodeOperator})` : `OPERATOR ${opPrefix}`;
}

const formatLotTable = (item) => {
  if (!item) return { parentLot: '', childTurunan: '' };
  let lotStr = (item.lot || '').trim();
  let turunanStr = (item.turunan || '').trim().toUpperCase();

  // 1. Jika item memiliki turunan eksplisit (dari input form manual atau parsing)
  if (turunanStr) {
    const upperLot = lotStr.toUpperCase();
    if (upperLot.endsWith('/' + turunanStr)) {
      const parent = lotStr.slice(0, -(turunanStr.length + 1)).trim();
      return {
        parentLot: parent.split('/').map(s => s.trim()).join(' / '),
        childTurunan: turunanStr
      };
    } else if (upperLot.endsWith(turunanStr) && upperLot.length > turunanStr.length && !upperLot.endsWith('0' + turunanStr)) {
      const parent = lotStr.slice(0, -turunanStr.length).trim();
      return {
        parentLot: parent.split('/').map(s => s.trim()).join(' / '),
        childTurunan: turunanStr
      };
    } else {
      return {
        parentLot: lotStr.split('/').map(s => s.trim()).join(' / '),
        childTurunan: turunanStr
      };
    }
  }

  // 2. Jika item tidak memiliki turunan eksplisit, periksa apakah bagian akhir lot adalah turunan slitting
  if (lotStr.includes('/')) {
    const parts = lotStr.split('/').map(s => s.trim()).filter(Boolean);
    if (parts.length >= 2) {
      const lastPart = parts[parts.length - 1];
      // Turunan slitting umumnya berupa format 1-2 huruf + 1-2 angka (misal HA01, A01, GA02)
      if (/^[A-Za-z]{1,2}\d{1,2}$/.test(lastPart)) {
        return {
          parentLot: parts.slice(0, -1).join(' / '),
          childTurunan: lastPart
        };
      }
    }
  }

  // 3. Fallback continuous lot parser
  const parsed = parseContinuousLot(lotStr, item.mesin || 'SLITTING', item.supplier || 'INHOUSE');
  if (parsed && parsed.baseLot && parsed.turunan && parsed.baseLot !== parsed.turunan) {
    return {
      parentLot: parsed.baseLot.split('/').map(s => s.trim()).join(' / '),
      childTurunan: parsed.turunan
    };
  }

  return {
    parentLot: lotStr,
    childTurunan: turunanStr || ''
  };
};

const labelPagination = computed(() => {
  const current = labelStore.currentPage || 1;
  const total = Math.max(1, labelStore.totalPages || 1);
  const windowSize = 5;

  let start = Math.max(1, current - windowSize);
  let end = Math.min(total, current + windowSize);

  const pages = [];
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return {
    current,
    total,
    pages,
    showFirst: start > 1,
    hasFirstEllipsis: start > 2,
    showLast: end < total,
    hasLastEllipsis: end < total - 1
  };
});

const jumpPageInput = ref('');
const jumpToPage = () => {
  const p = parseInt(jumpPageInput.value, 10);
  if (!isNaN(p) && p >= 1 && p <= (labelStore.totalPages || 1)) {
    labelStore.currentPage = p;
    jumpPageInput.value = '';
  } else {
    alert(`Masukkan nomor halaman antara 1 hingga ${labelStore.totalPages || 1}`);
  }
};

const getDensityForJenis = (jenis, kodeFormula = '') => {
  if (!jenis) return 0.91;
  const matched = configStore.filmConfigs.find(r => r.jenis === jenis && r.kodeFormula === kodeFormula);
  if (matched && matched.density) return parseFloat(matched.density);
  const byJenis = configStore.filmConfigs.find(r => r.jenis === jenis);
  if (byJenis && byJenis.density) return parseFloat(byJenis.density);
  return ['VMPET', 'PET'].includes(jenis) ? 1.4 : 0.91;
};

const calculateBeratTeori = (thick, width, meter, density) => {
  const t = parseFloat(thick) || 0;
  const w = parseFloat(width) || 0;
  const m = parseFloat(meter) || 0;
  const d = parseFloat(density) || 0.91;
  if (!t || !w || !m || !d) return 0;
  return (t * w * m * d) / 1000000;
};

const calculateChartinganWidthSummary = (items) => {
  const chartinganMap = new Map();
  (items || []).forEach(item => {
    const parsed = parseTurunan(item.turunan);
    const ch = parsed.chartingan || 'A';
    const w = parseFloat(item.width) || 0;
    if (!chartinganMap.has(ch)) {
      chartinganMap.set(ch, { chartingan: ch, width: w, rollCount: 1 });
    } else {
      chartinganMap.get(ch).rollCount++;
    }
  });

  const uniquePositions = Array.from(chartinganMap.values()).sort((a, b) => a.chartingan.localeCompare(b.chartingan));
  const baseChartWidth = uniquePositions.reduce((acc, pos) => acc + pos.width, 0);

  return {
    uniquePositions,
    baseChartWidth
  };
};

const calculateSequenceLengthSummary = (items) => {
  const sequenceMap = new Map();
  (items || []).forEach(item => {
    const parsed = parseTurunan(item.turunan);
    const seq = parsed.noUrut || 1;
    const len = parseFloat(item.meter || item.length) || 0;
    if (!sequenceMap.has(seq)) {
      sequenceMap.set(seq, { noUrut: seq, length: len, rolls: [item] });
    } else {
      const existing = sequenceMap.get(seq);
      existing.rolls.push(item);
      if (len > existing.length) {
        existing.length = len;
      }
    }
  });

  const uniqueSequences = Array.from(sequenceMap.values()).sort((a, b) => a.noUrut - b.noUrut);
  const totalParentLength = uniqueSequences.reduce((acc, s) => acc + s.length, 0);

  return {
    uniqueSequences,
    totalParentLength
  };
};

const hierarchyTree = computed(() => {
  // Hanya proses jika mode hierarki sedang aktif, untuk menghemat CPU & memori saat mode tabel
  if (viewMode.value !== 'hierarchy') return [];
  const items = labelStore.filteredLabels;
  if (!items || items.length === 0) return [];

  const targetDateSet = new Set(paginatedHierarchyDates.value);
  if (targetDateSet.size === 0) return [];

  // Group Level 1: Tanggal (HANYA proses item yang ada di halaman tanggal aktif)
  const dateMap = new Map();
  items.forEach(item => {
    const dateKey = item.tanggal || 'Tanpa Tanggal';
    if (targetDateSet.has(dateKey)) {
      if (!dateMap.has(dateKey)) {
        dateMap.set(dateKey, []);
      }
      dateMap.get(dateKey).push(item);
    }
  });

  // Urutan tanggal sesuai paginatedHierarchyDates
  const sortedDates = paginatedHierarchyDates.value.filter(d => dateMap.has(d));

  const tree = [];

  sortedDates.forEach(dateKey => {
    const dateItems = dateMap.get(dateKey);

    // Group Level 2: Shift & Operator
    const shiftMap = new Map();
    dateItems.forEach(item => {
      const shiftNum = String(item.shift || '1');
      const opName = resolveOperatorName(item);
      const shiftKey = `Shift ${shiftNum} • ${opName}`;
      if (!shiftMap.has(shiftKey)) {
        shiftMap.set(shiftKey, { shiftNum, opName, items: [] });
      }
      shiftMap.get(shiftKey).items.push(item);
    });

    const sortedShiftKeys = Array.from(shiftMap.keys()).sort();

    const shifts = [];
    let dateTotalNetto = 0;
    let dateTotalWaste = 0;
    let datePassCount = 0;
    let dateHoldCount = 0;
    let dateRejectCount = 0;

    sortedShiftKeys.forEach(shiftKey => {
      const shiftData = shiftMap.get(shiftKey);
      const shiftItems = shiftData.items;

      // Group Level 3: No Lot Induk Murni (Bukan Lot Akhir)
      const lotMap = new Map();
      shiftItems.forEach(item => {
        let parentLot = (item.lot || 'TANPA-LOT').trim().toUpperCase();
        if (parentLot.includes('/')) {
          const parts = parentLot.split('/').filter(Boolean);
          if (parts.length >= 3) {
            parentLot = parts.slice(0, -1).join('/');
          } else if (parts.length === 2 && !parts[1].match(/^[A-Za-z]{2}\d{2}/)) {
            parentLot = parts[0];
          }
        } else {
          const parsed = parseContinuousLot(parentLot, item.mesin || 'SLITTING', item.supplier || 'INHOUSE');
          if (parsed && parsed.baseLot) {
            parentLot = parsed.baseLot;
          }
        }

        if (!lotMap.has(parentLot)) {
          lotMap.set(parentLot, []);
        }
        lotMap.get(parentLot).push(item);
      });

      const lots = [];
      let shiftTotalNetto = 0;
      let shiftPassCount = 0;
      let shiftHoldCount = 0;
      let shiftRejectCount = 0;

      const firstShiftItem = shiftItems[0] || {};
      const shiftWaste = parseFloat(firstShiftItem.shiftWaste || firstShiftItem.parentWaste || 0) || 0;
      const shiftWasteNote = firstShiftItem.shiftWasteNote || firstShiftItem.parentWasteNote || '';

      lotMap.forEach((lotItems, pureLot) => {
        // Group Level 4: Urutkan Turunan Berdasarkan No Urut dan Chartingan
        const sortedTurunan = [...lotItems].sort((a, b) => {
          const parsedA = parseTurunan(a.turunan);
          const parsedB = parseTurunan(b.turunan);
          if (parsedA.noUrut !== parsedB.noUrut) {
            return parsedA.noUrut - parsedB.noUrut;
          }
          return (parsedA.chartingan || '').localeCompare(parsedB.chartingan || '');
        });

        let lotTotalNetto = 0;
        sortedTurunan.forEach(t => {
          const n = parseFloat(t.netto || t.berat || 0) || 0;
          lotTotalNetto += n;
          shiftTotalNetto += n;
          dateTotalNetto += n;
          if (t.status === 'PASS' || t.status === 'OK') { shiftPassCount++; datePassCount++; }
          else if (t.status === 'HOLD') { shiftHoldCount++; dateHoldCount++; }
          else if (t.status === 'REJECT') { shiftRejectCount++; dateRejectCount++; }
        });

        const firstItem = sortedTurunan[0] || {};
        const uniqueKey = `${dateKey}_${shiftData.shiftNum}_${shiftData.opName}_${pureLot}`;

        const sumChart = calculateChartinganWidthSummary(sortedTurunan);
        const seqSummary = calculateSequenceLengthSummary(sortedTurunan);
        const sumChildWidth = sumChart.baseChartWidth;
        const parentTrim = firstItem.parentTrim !== undefined ? parseFloat(firstItem.parentTrim) : 0;
        const parentWidth = firstItem.parentWidth ? parseFloat(firstItem.parentWidth) : (sumChart.baseChartWidth + parentTrim);
        const parentMeter = firstItem.parentMeter ? parseFloat(firstItem.parentMeter) : (seqSummary.totalParentLength || parseFloat(firstItem.length) || 0);
        const parentDensity = firstItem.parentDensity || getDensityForJenis(firstItem.jenis, firstItem.kode) || 0.91;
        const parentBeratTeori = firstItem.parentBeratTeori ? parseFloat(firstItem.parentBeratTeori) : calculateBeratTeori(firstItem.thickness, parentWidth, parentMeter, parentDensity);
        
        // Sisa Panjang Jumbo Induk (Meter & Kg)
        const parentSisaMeter = firstItem.parentSisaMeter !== undefined ? parseFloat(firstItem.parentSisaMeter) : 0;
        const parentSisaKg = parentSisaMeter > 0 ? calculateBeratTeori(firstItem.thickness, parentWidth, parentSisaMeter, parentDensity) : 0;

        // Total Output Terdata = Sum Netto Child + Sisa Jumbo (Kg)
        const totalOutputTerdata = lotTotalNetto + parentSisaKg;
        const diffNetto = parentBeratTeori > 0 ? (parentBeratTeori - totalOutputTerdata) : null;
        const diffPercent = (parentBeratTeori > 0 && diffNetto !== null) ? ((diffNetto / parentBeratTeori) * 100) : 0;
        const absDiffPct = Math.abs(diffPercent);
        const diffStatus = absDiffPct <= 2.0 ? 'OK' : absDiffPct <= 5.0 ? 'WARNING' : 'DANGER';

        lots.push({
          lotKey: pureLot,
          uniqueKey,
          lot: pureLot,
          spk: firstItem.spk || '-',
          mesin: firstItem.mesin || '-',
          jenis: firstItem.jenis || '',
          kode: firstItem.kode || '',
          thickness: firstItem.thickness || '',
          width: firstItem.width || '',
          length: firstItem.length || '',
          parentWidth,
          parentMeter,
          parentSisaMeter,
          parentSisaKg: parentSisaKg > 0 ? parseFloat(parentSisaKg.toFixed(2)) : 0,
          parentDensity,
          parentBeratTeori: parentBeratTeori > 0 ? parseFloat(parentBeratTeori.toFixed(2)) : null,
          sumChildWidth,
          totalOutputTerdata: parseFloat(totalOutputTerdata.toFixed(2)),
          diffNetto: diffNetto !== null ? parseFloat(diffNetto.toFixed(2)) : null,
          diffPercent: parseFloat(diffPercent.toFixed(1)),
          diffStatus,
          supplier: firstItem.supplier || 'INHOUSE',
          operator: firstItem.operator || shiftData.opName,
          shift: firstItem.shift || shiftData.shiftNum,
          totalNetto: lotTotalNetto.toFixed(2),
          totalItems: sortedTurunan.length,
          items: sortedTurunan
        });
      });

      const shiftUniqueKey = `${dateKey}_${shiftData.shiftNum}_${shiftData.opName}`;
      dateTotalWaste += shiftWaste;

      // Akumulasi defisit/loss material unrecorded dari seluruh lot di shift ini
      const shiftUnaccountedDeficit = lots.reduce((acc, l) => acc + (l.diffNetto && l.diffNetto > 0 ? l.diffNetto : 0), 0);
      const totalShiftSisaJumboKg = lots.reduce((acc, l) => acc + (l.parentSisaKg || 0), 0);

      shifts.push({
        shiftKey,
        uniqueKey: shiftUniqueKey,
        shiftNum: shiftData.shiftNum,
        operator: shiftData.opName,
        totalLots: lots.length,
        totalRolls: shiftItems.length,
        totalNetto: shiftTotalNetto.toFixed(2),
        shiftWaste,
        shiftWasteNote,
        shiftUnaccountedDeficit: parseFloat(shiftUnaccountedDeficit.toFixed(2)),
        totalShiftSisaJumboKg: parseFloat(totalShiftSisaJumboKg.toFixed(2)),
        passCount: shiftPassCount,
        holdCount: shiftHoldCount,
        rejectCount: shiftRejectCount,
        items: shiftItems,
        lots
      });
    });

    tree.push({
      date: dateKey,
      displayDate: formatTanggalIndonesia(dateKey),
      totalShifts: shifts.length,
      totalLots: shifts.reduce((acc, s) => acc + s.totalLots, 0),
      totalRolls: dateItems.length,
      totalNetto: dateTotalNetto.toFixed(2),
      totalWaste: dateTotalWaste.toFixed(2),
      passCount: datePassCount,
      holdCount: dateHoldCount,
      rejectCount: dateRejectCount,
      shifts
    });
  });

  return tree;
});

// ── SHIFT & WASTE EDIT MODAL STATE & HANDLERS ────────────────────────────────
const showShiftModal = ref(false);
const currentEditingShiftNode = ref(null);
const shiftForm = reactive({
  oldShift: '1',
  oldOperator: '',
  shift: '1',
  operator: '',
  shiftWaste: '',
  shiftWasteNote: ''
});

const openShiftModal = (shiftNode) => {
  currentEditingShiftNode.value = shiftNode;
  const items = shiftNode.items || [];
  const first = items[0] || {};

  shiftForm.oldShift = String(shiftNode.shiftNum || first.shift || '1');
  shiftForm.oldOperator = shiftNode.operator || first.operator || '';
  shiftForm.shift = String(shiftNode.shiftNum || first.shift || '1');
  shiftForm.operator = shiftNode.operator || first.operator || '';
  shiftForm.shiftWaste = shiftNode.shiftWaste !== undefined && shiftNode.shiftWaste > 0 ? shiftNode.shiftWaste : (first.shiftWaste || first.parentWaste || '');
  shiftForm.shiftWasteNote = shiftNode.shiftWasteNote || first.shiftWasteNote || first.parentWasteNote || '';

  showShiftModal.value = true;
};

const computedShiftTotalOutput = computed(() => {
  if (!currentEditingShiftNode.value) return 0;
  const netto = parseFloat(currentEditingShiftNode.value.totalNetto) || 0;
  const waste = parseFloat(shiftForm.shiftWaste) || 0;
  return netto + waste;
});

const computedShiftWasteRatio = computed(() => {
  const total = computedShiftTotalOutput.value;
  if (total === 0) return 0;
  const waste = parseFloat(shiftForm.shiftWaste) || 0;
  return (waste / total) * 100;
});

const saveShiftData = async () => {
  if (!currentEditingShiftNode.value || !currentEditingShiftNode.value.items) return;

  const items = currentEditingShiftNode.value.items;
  const newShift = String(shiftForm.shift || '1').trim();
  const newOperator = (shiftForm.operator || '').trim().toUpperCase();
  const wasteKg = parseFloat(shiftForm.shiftWaste) || 0;
  const wasteNote = (shiftForm.shiftWasteNote || '').trim();

  for (const item of items) {
    const updated = { ...item };
    if (newShift) updated.shift = newShift;
    if (newOperator) updated.operator = newOperator;
    updated.shiftWaste = wasteKg;
    updated.shiftWasteNote = wasteNote;
    await db.labels.put(updated);
  }

  await labelStore.loadLabels();
  showShiftModal.value = false;
};

// ── PARENT LOT EDIT MODAL STATE & HANDLERS ────────────────────────────────────
const showParentLotModal = ref(false);
const currentEditingLotNode = ref(null);
const parentLotForm = reactive({
  oldLot: '',
  newLot: '',
  spk: '',
  mesin: '',
  jenis: '',
  kode: '',
  thickness: '',
  parentWidth: '',
  parentMeter: '',
  sisaMeter: 0,
  parentDensity: 0.91,
  chartinganBaseWidth: 0,
  uniqueChartList: [],
  trim: 0,
  sequenceLengthBase: 0,
  uniqueSeqList: [],

  // Multi-parent Joint for REWIND / Doctoring
  isMultiParent: false,
  multiParents: [],

  // Resin batch consumption for CASTING
  isResinMode: false,
  resinConsumptions: []
});

const selectedActiveParentLotIndex = ref(0);

const onTrimChange = () => {
  const base = parseFloat(parentLotForm.chartinganBaseWidth) || 0;
  const trimVal = parseFloat(parentLotForm.trim) || 0;
  parentLotForm.parentWidth = (base + trimVal).toFixed(0);
};

const onParentWidthChange = () => {
  const base = parseFloat(parentLotForm.chartinganBaseWidth) || 0;
  const pWidth = parseFloat(parentLotForm.parentWidth) || 0;
  parentLotForm.trim = Math.max(0, pWidth - base);
};

const onSelectActiveParentLot = (idx) => {
  selectedActiveParentLotIndex.value = idx;
  if (parentLotForm.multiParents[idx] && parentLotForm.multiParents[idx].lotNo) {
    parentLotForm.newLot = parentLotForm.multiParents[idx].lotNo.trim().toUpperCase();
  }
};

const onMultiParentLotChange = (idx) => {
  if (selectedActiveParentLotIndex.value === idx && parentLotForm.multiParents[idx]) {
    parentLotForm.newLot = (parentLotForm.multiParents[idx].lotNo || '').trim().toUpperCase();
  }
};

const addMultiParentRoll = () => {
  const newIdx = parentLotForm.multiParents.length;
  const newRollLot = `${parentLotForm.oldLot || 'LOT'}-P${newIdx + 1}`;
  parentLotForm.multiParents.push({
    lotNo: newRollLot,
    thickness: parentLotForm.thickness || 20,
    width: parentLotForm.parentWidth || 1000,
    meter: 1000,
    note: `Roll Sambungan #${newIdx + 1}`
  });
  // Default: jadikan roll terakhir sebagai parent lot aktif
  selectedActiveParentLotIndex.value = newIdx;
  parentLotForm.newLot = newRollLot;
};

const removeMultiParentRoll = (idx) => {
  parentLotForm.multiParents.splice(idx, 1);
  if (selectedActiveParentLotIndex.value >= parentLotForm.multiParents.length) {
    selectedActiveParentLotIndex.value = Math.max(0, parentLotForm.multiParents.length - 1);
  }
  if (parentLotForm.multiParents[selectedActiveParentLotIndex.value]) {
    parentLotForm.newLot = parentLotForm.multiParents[selectedActiveParentLotIndex.value].lotNo;
  }
};

const addResinItem = () => {
  parentLotForm.resinConsumptions.push({
    name: 'Homopolymer PP',
    code: 'HP-01',
    lot: 'RSN-001',
    weight: 100
  });
};

const removeResinItem = (idx) => {
  parentLotForm.resinConsumptions.splice(idx, 1);
};

const totalResinWeight = computed(() => {
  return (parentLotForm.resinConsumptions || []).reduce((acc, r) => acc + (parseFloat(r.weight) || 0), 0);
});

const computedBeratSisaJumbo = computed(() => {
  const sisa = parseFloat(parentLotForm.sisaMeter) || 0;
  if (sisa <= 0) return 0;
  return calculateBeratTeori(
    parentLotForm.thickness,
    parentLotForm.parentWidth,
    sisa,
    parentLotForm.parentDensity
  );
});

const computedParentBeratTeori = computed(() => {
  if (parentLotForm.isResinMode && parentLotForm.mesin === 'CASTING' && parentLotForm.resinConsumptions.length > 0) {
    return totalResinWeight.value;
  }
  if (parentLotForm.isMultiParent && parentLotForm.multiParents.length > 0) {
    return parentLotForm.multiParents.reduce((acc, p) => {
      const th = parseFloat(p.thickness) || parseFloat(parentLotForm.thickness) || 20;
      const w = parseFloat(p.width) || parseFloat(parentLotForm.parentWidth) || 1000;
      const m = parseFloat(p.meter) || 0;
      return acc + calculateBeratTeori(th, w, m, parentLotForm.parentDensity);
    }, 0);
  }
  return calculateBeratTeori(
    parentLotForm.thickness,
    parentLotForm.parentWidth,
    parentLotForm.parentMeter,
    parentLotForm.parentDensity
  );
});

const currentLotChildNettoSum = computed(() => {
  if (!currentEditingLotNode.value || !currentEditingLotNode.value.items) return 0;
  return currentEditingLotNode.value.items.reduce((acc, it) => acc + (parseFloat(it.netto || it.berat || 0) || 0), 0);
});

const currentLotChildWidthSum = computed(() => {
  if (!currentEditingLotNode.value || !currentEditingLotNode.value.items) return 0;
  return currentEditingLotNode.value.items.reduce((acc, it) => acc + (parseFloat(it.width) || 0), 0);
});

const computedTotalOutputTerdata = computed(() => {
  return currentLotChildNettoSum.value + computedBeratSisaJumbo.value;
});

const computedWeightDiff = computed(() => {
  return computedParentBeratTeori.value - computedTotalOutputTerdata.value;
});

const weightDiffSign = computed(() => {
  if (computedWeightDiff.value >= 0) return '+';
  return '-';
});

const computedWeightDiffPercent = computed(() => {
  if (computedParentBeratTeori.value === 0) return 0;
  return (computedWeightDiff.value / computedParentBeratTeori.value) * 100;
});

// Diagram Perbandingan Hasil (Yields & Breakdown)
const chartYieldChildPct = computed(() => {
  const teori = computedParentBeratTeori.value;
  if (teori <= 0) return 0;
  return Math.min(100, Math.max(0, (currentLotChildNettoSum.value / teori) * 100));
});

const chartYieldSisaPct = computed(() => {
  const teori = computedParentBeratTeori.value;
  if (teori <= 0) return 0;
  return Math.min(100, Math.max(0, (computedBeratSisaJumbo.value / teori) * 100));
});

const chartYieldLossPct = computed(() => {
  const teori = computedParentBeratTeori.value;
  if (teori <= 0 || computedWeightDiff.value <= 0) return 0;
  return Math.min(100, Math.max(0, (computedWeightDiff.value / teori) * 100));
});

const chartYieldSurplusPct = computed(() => {
  const teori = computedParentBeratTeori.value;
  if (teori <= 0 || computedWeightDiff.value >= 0) return 0;
  return Math.min(100, Math.max(0, (Math.abs(computedWeightDiff.value) / teori) * 100));
});

const toleranceStatus = computed(() => {
  const absPct = Math.abs(computedWeightDiffPercent.value);
  if (absPct <= 2.0) {
    return {
      level: 'OK',
      label: 'NORMAL (TOLERANSI STANDAR ±2%)',
      color: 'text-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      alertBg: 'bg-emerald-50/80 border-emerald-200 text-emerald-900',
      icon: 'check',
      description: 'Keseimbangan material berada dalam batas toleransi standar variasi mikron dan densitas film.'
    };
  }
  if (absPct <= 5.0) {
    return {
      level: 'WARNING',
      label: 'PERHATIAN: DEVIASI ±2% s/d ±5%',
      color: 'text-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-300',
      alertBg: 'bg-amber-50/80 border-amber-200 text-amber-900',
      icon: 'alert',
      description: 'Selisih berat melebihi toleransi standar. Periksa ketebalan aktual mikron, sisa meter jumbo, atau akurasi timbangan netto.'
    };
  }
  return {
    level: 'DANGER',
    label: 'PERINGATAN: SELISIH > ±5%',
    color: 'text-red-500',
    badgeBg: 'bg-red-50 text-red-700 border-red-300 font-bold',
    alertBg: 'bg-red-50/80 border-red-200 text-red-900',
    icon: 'danger',
    description: 'Deviasi material signifikan! Jika defisit (kurang), kehilangan berat ini otomatis dialirkan ke akumulasi loss waste shift.'
  };
});

const onParentJenisChange = () => {
  parentLotForm.parentDensity = getDensityForJenis(parentLotForm.jenis, parentLotForm.kode);
};

const openParentLotModal = (lotNode) => {
  currentEditingLotNode.value = lotNode;
  const items = lotNode.items || [];
  const first = items[0] || {};

  const chartSummary = calculateChartinganWidthSummary(items);
  parentLotForm.uniqueChartList = chartSummary.uniquePositions;
  parentLotForm.chartinganBaseWidth = chartSummary.baseChartWidth;

  const seqSummary = calculateSequenceLengthSummary(items);
  parentLotForm.uniqueSeqList = seqSummary.uniqueSequences;
  parentLotForm.sequenceLengthBase = seqSummary.totalParentLength;

  const existingTrim = first.parentTrim !== undefined ? parseFloat(first.parentTrim) : 0;
  parentLotForm.trim = existingTrim;

  parentLotForm.oldLot = lotNode.lot || '';
  parentLotForm.newLot = lotNode.lot || '';
  parentLotForm.spk = lotNode.spk !== '-' ? lotNode.spk : (first.spk || '');
  parentLotForm.mesin = lotNode.mesin !== '-' ? lotNode.mesin : (first.mesin || '');
  parentLotForm.jenis = lotNode.jenis || first.jenis || 'CPP';
  parentLotForm.kode = lotNode.kode || first.kode || '';
  parentLotForm.thickness = lotNode.thickness || first.thickness || '';
  
  if (first.parentWidth) {
    parentLotForm.parentWidth = parseFloat(first.parentWidth);
  } else {
    parentLotForm.parentWidth = (chartSummary.baseChartWidth + existingTrim).toFixed(0);
  }

  if (first.parentMeter) {
    parentLotForm.parentMeter = parseFloat(first.parentMeter);
  } else {
    parentLotForm.parentMeter = seqSummary.totalParentLength || first.length || '';
  }

  parentLotForm.sisaMeter = first.parentSisaMeter !== undefined ? parseFloat(first.parentSisaMeter) : 0;
  parentLotForm.parentDensity = lotNode.parentDensity || getDensityForJenis(parentLotForm.jenis, parentLotForm.kode);

  // Multi-parent Joint for REWIND
  parentLotForm.isMultiParent = Array.isArray(first.parentRollsJoint) && first.parentRollsJoint.length > 0;
  parentLotForm.multiParents = parentLotForm.isMultiParent
    ? JSON.parse(JSON.stringify(first.parentRollsJoint))
    : (parentLotForm.mesin === 'REWIND' ? [
        { lotNo: `${lotNode.lot}-P1`, thickness: parentLotForm.thickness, width: parentLotForm.parentWidth, meter: 1500, note: 'Roll 1 (Awal)' },
        { lotNo: `${lotNode.lot}-P2`, thickness: parentLotForm.thickness, width: parentLotForm.parentWidth, meter: 1000, note: 'Roll 2 (Sambung)' }
      ] : []);

  // Set default active parent lot: roll terakhir
  if (parentLotForm.multiParents.length > 0) {
    selectedActiveParentLotIndex.value = parentLotForm.multiParents.length - 1;
    if (parentLotForm.mesin === 'REWIND') {
      const activeRoll = parentLotForm.multiParents[selectedActiveParentLotIndex.value];
      if (activeRoll && activeRoll.lotNo) {
        parentLotForm.newLot = activeRoll.lotNo.trim().toUpperCase();
      }
    }
  }

  // Resin for CASTING
  parentLotForm.isResinMode = parentLotForm.mesin === 'CASTING' || (Array.isArray(first.resinConsumptions) && first.resinConsumptions.length > 0);
  parentLotForm.resinConsumptions = parentLotForm.isResinMode && Array.isArray(first.resinConsumptions) && first.resinConsumptions.length > 0
    ? JSON.parse(JSON.stringify(first.resinConsumptions))
    : (parentLotForm.mesin === 'CASTING' ? [
        { name: 'Homopolymer PP (Core)', code: 'HP-01', lot: 'RSN-PP-01', weight: 650 },
        { name: 'Copolymer PP (Skin)', code: 'CP-02', lot: 'RSN-CP-02', weight: 250 },
        { name: 'Slip Masterbatch', code: 'MB-01', lot: 'RSN-MB-01', weight: 50 },
        { name: 'Regrind / Recycle', code: 'RG-01', lot: 'CRUSH-01', weight: 50 }
      ] : []);

  showParentLotModal.value = true;
};

const saveParentLotData = async () => {
  if (!currentEditingLotNode.value || !currentEditingLotNode.value.items) return;

  const newLot = (parentLotForm.newLot || '').trim().toUpperCase();
  if (!newLot) {
    alert('No Lot Induk tidak boleh kosong!');
    return;
  }

  const items = currentEditingLotNode.value.items;
  const beratTeori = computedParentBeratTeori.value;
  const sisaMeterVal = parseFloat(parentLotForm.sisaMeter) || 0;
  const sisaKgVal = parseFloat(computedBeratSisaJumbo.value.toFixed(2));

  for (const item of items) {
    const updated = { ...item };
    
    // Update Lot & Lot Akhir
    updated.lot = newLot;
    const turunan = (updated.turunan || '').trim().toUpperCase();
    updated.lotAkhir = turunan ? `${newLot}/${turunan}` : newLot;

    // Update SPK, Jenis, Kode, Thickness across children
    if (parentLotForm.spk) updated.spk = parentLotForm.spk;
    if (parentLotForm.jenis) updated.jenis = parentLotForm.jenis;
    if (parentLotForm.kode !== undefined) updated.kode = parentLotForm.kode;
    if (parentLotForm.thickness) updated.thickness = parentLotForm.thickness;

    // Save Parent Metadata on Child Record
    updated.parentWidth = parseFloat(parentLotForm.parentWidth) || '';
    updated.parentTrim = parseFloat(parentLotForm.trim) || 0;
    updated.parentMeter = parseFloat(parentLotForm.parentMeter) || '';
    updated.parentSisaMeter = sisaMeterVal;
    updated.parentSisaKg = sisaKgVal;
    updated.parentDensity = parseFloat(parentLotForm.parentDensity) || 0.91;
    updated.parentBeratTeori = parseFloat(beratTeori.toFixed(2));

    // Save Multi-parent / Resin metadata
    if (parentLotForm.isMultiParent) {
      updated.parentRollsJoint = JSON.parse(JSON.stringify(parentLotForm.multiParents));
    } else {
      delete updated.parentRollsJoint;
    }

    if (parentLotForm.isResinMode) {
      updated.resinConsumptions = JSON.parse(JSON.stringify(parentLotForm.resinConsumptions));
    } else {
      delete updated.resinConsumptions;
    }

    await db.labels.put(updated);
  }

  await labelStore.loadLabels();
  showParentLotModal.value = false;
};

const form = reactive({
  id: null,
  uniqId: '',
  supplier: 'INHOUSE',
  spk: '',
  tanggal: '',
  tanggalManual: '',
  tanggalShift: '',
  shift: '',
  mesin: 'SLITTING',
  jenis: '',
  alias: '',
  jenisKey: '',
  type: 'TRANSPARENT',
  thickness: '',
  width: '',
  length: '',
  meter: '',
  joint: '',
  netto: '',
  diameterCore: 6,
  paperCore: '',
  kodePack: '',
  subKodeType: 'numeric',
  subKodeNumeric: '',
  subKode: '0000',
  status: 'PASS',
  treatment: 'INSIDE',
  od: '',
  lot: '',
  turunan: '',
  operator: '',
  kodeOperator: '',
  kode: '',
  keterangan: '',
  jenisPrint: 'FINISH GOODS'
});

const lotMismatch = computed(() => {
  // Hanya berlaku jika supplier adalah INHOUSE (case-insensitive)
  const supplier = (form.supplier || '').trim().toUpperCase();
  if (supplier !== 'INHOUSE') return false;

  const lot = (form.lot || '').trim().toUpperCase();
  const kode = (form.kode || '').trim().toUpperCase();
  if (lot.length >= 3 && kode.length >= 3) {
    return lot.substring(0, 3) !== kode.substring(0, 3);
  }
  return false;
});

const isAllSelected = computed(() => {
  const currentItems = labelStore.paginatedLabels;
  return currentItems.length > 0 && currentItems.every(item => selectedIds.value.includes(item.id));
});

const toggleAll = (e) => {
  const currentItems = labelStore.paginatedLabels;
  if (e.target.checked) {
    const idsToAdd = currentItems.map(i => i.id);
    selectedIds.value = Array.from(new Set([...selectedIds.value, ...idsToAdd]));
  } else {
    const currentIds = currentItems.map(i => i.id);
    selectedIds.value = selectedIds.value.filter(id => !currentIds.includes(id));
  }
};

const currentDateTimeString = computed(() => {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${dd}/${mm}/${yy}, ${hh}:${min}:${ss}`;
});

function calculateShiftDate() {
  if (scheduleStore && typeof scheduleStore.getWorkDate === 'function') {
    return scheduleStore.getWorkDate(new Date());
  }
  const now = new Date();
  const currentHour = now.getHours();
  const shiftDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (currentHour < 7) {
    shiftDate.setDate(shiftDate.getDate() - 1);
  }
  const year = shiftDate.getFullYear();
  const month = (shiftDate.getMonth() + 1).toString().padStart(2, '0');
  const day = shiftDate.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getMonthName(dateStr) {
  if (!dateStr) return '';
  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", 
                 "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
  const date = new Date(dateStr);
  return months[date.getMonth()] || '';
}

function formatTanggalIndonesia(dateString) {
  if (!dateString) return '';
  const bulan = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  return `${date.getDate()} ${bulan[date.getMonth()]} ${date.getFullYear()}`;
}

function generateKodePack(tanggal, mesin) {
  const d = new Date(tanggal);
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const tahun = String(d.getFullYear()).slice(-2);
  let prefix = '';
  // Lookup custom praKodePack dari configStore.mesinList
  const matchedMesin = configStore.mesinList.find(m => m.nama === mesin);
  if (matchedMesin && matchedMesin.praKodePack !== undefined && matchedMesin.praKodePack !== null && matchedMesin.praKodePack !== '') {
    prefix = matchedMesin.praKodePack;
  } else {
    // Fallback default
    if (mesin === 'REWIND') prefix = 'R';
    if (mesin === 'SML') prefix = 'S';
  }
  return `${prefix}3B${bulan}${tahun}`;
}

function getLabelSign(item) {
  if (!item) return null;
  const activeRules = configStore.labelSignList.filter(r => r.active !== false);
  for (const rule of activeRules) {
    const rawVal = (rule.triggerValue || '').toUpperCase();
    const vals = rawVal.split(',').map(s => s.trim()).filter(Boolean);

    if (rule.triggerType === 'custom_bgrade') {
      const isBGrade = item.jenisPrint === 'B-GRADE' ||
        (item.kode || '').toUpperCase() === 'B-GRADE' ||
        (item.jenis || '').toUpperCase() === 'B-GRADE' ||
        (item.type || '').toUpperCase() === 'B-GRADE';
      if (isBGrade) return rule;
    } else if (rule.triggerType === 'mesin') {
      const mesinUpper = (item.mesin || '').toUpperCase();
      if (vals.some(v => mesinUpper === v || mesinUpper.includes(v))) {
        return rule;
      }
    } else if (rule.triggerType === 'jenis') {
      const jenisUpper = (item.jenis || '').toUpperCase();
      if (vals.some(v => jenisUpper === v)) {
        return rule;
      }
    } else if (rule.triggerType === 'kode') {
      const kodeUpper = (item.kode || '').toUpperCase();
      if (vals.some(v => kodeUpper === v)) {
        return rule;
      }
    } else if (rule.triggerType === 'status') {
      const statusUpper = (item.status || '').toUpperCase();
      if (vals.some(v => statusUpper === v)) {
        return rule;
      }
    }
  }

  // Fallbacks if no rule matched
  if (item.jenisPrint === 'B-GRADE' || (item.kode || '').toUpperCase() === 'B-GRADE') {
    return { badgeText: 'B-GRADE', textColor: '#ffffff', bgColor: '#4c1d95' };
  }
  if (item.mesin === 'SML' || item.mesin === 'CASTING') {
    return { badgeText: 'INLINE SML', textColor: '#ffffff', bgColor: '#15803d' };
  }
  return null;
}

function calculateNetto(thick, width, length, jenis, kode) {
  if (!thick || !width || !length) return '';
  // Lookup density dari configStore berdasarkan jenis + kode
  let faktor = 0.91;
  const matched = configStore.filmConfigs.find(r => r.jenis === jenis && r.kodeFormula === kode);
  if (matched) {
    faktor = matched.density;
  } else {
    const byJenis = configStore.filmConfigs.find(r => r.jenis === jenis);
    faktor = byJenis ? byJenis.density : (['VMPET', 'PET'].includes(jenis) ? 1.4 : 0.91);
  }
  return ((parseFloat(thick || 0) * parseFloat(width || 0) * parseFloat(length || 0) * faktor) / 1000000).toFixed(2);
}

function calculatePaperCore(width, diameterCore = 6) {
  if (!width) return '';
  const d = parseFloat(diameterCore) || 6;
  const base6Inch = 0.003077 * parseFloat(width || 0) + 3.01532;
  return ((base6Inch * d) / 6).toFixed(2);
}

function isDuplicateKodePack(item) {
  const key = (item.kodePack || '') + (item.subKode || '');
  return labelStore.duplicateKodePacks.has(key);
}

const syncFormulaConfigs = () => {
  if (!form.jenis && !form.kode) return;

  // Cari konfigurasi film dengan acuan kode formula dulu baru jenis
  let matched = null;
  if (form.kode && form.jenis) {
    matched = configStore.filmConfigs.find(
      r => r.kodeFormula?.toUpperCase() === form.kode?.toUpperCase() && r.jenis?.toUpperCase() === form.jenis?.toUpperCase()
    );
  }
  if (!matched && form.kode) {
    matched = configStore.filmConfigs.find(
      r => r.kodeFormula?.toUpperCase() === form.kode?.toUpperCase()
    );
  }
  if (!matched && form.jenis) {
    matched = configStore.filmConfigs.find(
      r => r.jenis?.toUpperCase() === form.jenis?.toUpperCase()
    );
  }

  if (matched) {
    if (matched.alias) {
      form.alias = matched.alias;
    } else {
      form.alias = getDefaultFilmAlias(form.jenis || matched.jenis, form.kode || matched.kodeFormula);
    }
    // 1. Auto-fill Supplier berdasarkan konfigurasi formula
    if (matched.supplier) {
      form.supplier = matched.supplier;
    }
    // 2. Auto-fill Type berdasarkan konfigurasi formula
    if (matched.jenisBahan) {
      form.type = matched.jenisBahan.toUpperCase();
      handleTypeChange();
    }
  } else if (form.jenis) {
    form.alias = getDefaultFilmAlias(form.jenis, form.kode || '');
  }
  updateJenisKey();
};

const syncTypeFromFormula = syncFormulaConfigs;

const handleFormulaInput = () => {
  form.kode = (form.kode || '').toUpperCase();
  syncFormulaConfigs();
  updateAutoFields();
};

const handleJenisChange = () => {
  syncFormulaConfigs();
  updateAutoFields();
};

const handleTypeChange = () => {
  if (form.type === "METALIZED") {
    form.od = form.jenis === 'VMPET' ? "OD3.2+PLASMA" : "OD2.4+PLASMA";
  } else {
    form.od = "";
  }
};

const handleSubKode = () => {
  if (form.subKodeType === 'numeric') {
    const raw = String(form.subKodeNumeric || '').replace(/[^0-9]/g, '');
    form.subKode = raw ? raw.padStart(4, '0') : '0000';
    form.status = form.subKode === '0000' ? 'HOLD' : 'PASS';
  } else if (form.subKodeType === 'reject') {
    form.subKode = 'REJECT';
    form.status = 'REJECT';
  } else if (form.subKodeType === 'hold') {
    form.subKode = '0000';
    form.status = 'HOLD';
  }
};

const subKodeValidation = computed(() => {
  if (form.subKodeType !== 'numeric' || !form.subKodeNumeric) {
    return { isDuplicate: false, isSkipped: false, message: '' };
  }

  const rawNum = parseInt(form.subKodeNumeric, 10);
  if (isNaN(rawNum) || rawNum <= 0) {
    return { isDuplicate: false, isSkipped: false, message: '' };
  }

  // Toleransi kode khusus kepala 5*** sampai 9*** (5000 s/d 9999)
  if (rawNum >= 5000 && rawNum <= 9999) {
    return { isDuplicate: false, isSkipped: false, message: '' };
  }

  const targetKodePack = (form.kodePack || '').trim().toUpperCase();
  const targetMesin = (form.mesin || '').trim().toUpperCase();
  const currentId = form.id;

  // Filter label lain di database untuk mesin / kode pack yang sama
  const otherLabels = labelStore.labels.filter(l => {
    if (currentId && l.id === currentId) return false;
    const lKodePack = (l.kodePack || '').trim().toUpperCase();
    const lMesin = (l.mesin || '').trim().toUpperCase();
    if (targetKodePack && lKodePack) return lKodePack === targetKodePack;
    if (targetMesin && lMesin) return lMesin === targetMesin;
    return true;
  });

  // 1. Cek DUPLIKAT (Double)
  const isDuplicate = otherLabels.some(l => {
    if (l.status === 'HOLD' || l.status === 'REJECT') return false;
    const lNum = parseInt(l.subKodeNumeric || l.subKode, 10);
    return !isNaN(lNum) && lNum === rawNum;
  });

  if (isDuplicate) {
    return {
      isDuplicate: true,
      isSkipped: false,
      message: `⚠️ No. Pack ${form.kodePack}${String(rawNum).padStart(4, '0')} sudah terdaftar di mesin ini (Double)!`
    };
  }

  // 2. Cek LOMPAT (Skip Sequence) di bawah kepala 5 (< 5000)
  let maxRegular = 0;
  for (const l of otherLabels) {
    if (l.status === 'HOLD' || l.status === 'REJECT') continue;
    const lNum = parseInt(l.subKodeNumeric || l.subKode, 10);
    if (!isNaN(lNum) && lNum > 0 && lNum < 5000) {
      if (lNum > maxRegular) maxRegular = lNum;
    }
  }

  const expectedNext = maxRegular > 0 ? maxRegular + 1 : 1;
  if (maxRegular > 0 && rawNum > expectedNext) {
    return {
      isDuplicate: false,
      isSkipped: true,
      message: `⚠️ No. Pack lompat! (Kode Pack terbesar saat ini: ${String(maxRegular).padStart(4, '0')}, Urutan berikutnya yang seharusnya: ${String(expectedNext).padStart(4, '0')})`
    };
  }

  return { isDuplicate: false, isSkipped: false, message: '' };
});

const quickTags = ref([...DEFAULT_DEFECT_TAGS]);

const refreshQuickTags = async () => {
  try {
    const tags = await getActiveQuickTags();
    if (Array.isArray(tags) && tags.length > 0) {
      quickTags.value = tags;
    }
  } catch (e) {
    console.warn('Gagal memuat quickTags:', e);
  }
};

const addQuickTag = (tag) => {
  if (!form.keterangan || form.keterangan.trim() === '') {
    form.keterangan = tag;
  } else if (!form.keterangan.includes(tag)) {
    form.keterangan = `${form.keterangan}, ${tag}`;
  }
};

const updateAutoFields = () => {
  if (isEditing.value) {
    // Pada mode EDIT: JANGAN menimpa tanggal atau kodePack historis yang sudah ada!
    form.paperCore = calculatePaperCore(form.width, form.diameterCore || 6);
    form.netto = calculateNetto(form.thickness, form.width, form.length, form.jenis, form.kode);
    handleSubKode();
    return;
  }
  const tglShift = calculateShiftDate();
  form.tanggalShift = tglShift;
  const finalDate = form.tanggalManual || tglShift;
  form.tanggal = finalDate;
  form.kodePack = generateKodePack(finalDate, form.mesin);
  form.paperCore = calculatePaperCore(form.width, form.diameterCore || 6);
  form.netto = calculateNetto(form.thickness, form.width, form.length, form.jenis, form.kode);
  if (!form.shift) {
    const shiftInfo = scheduleStore.getCurrentShiftInfo();
    form.shift = shiftInfo.shiftCode;
  }
  handleSubKode();
};

// ── TURUNAN & CHARTINGAN AUTO-COMPLETE (KHUSUS SLITTING) ─────────────────────
const previousInfo = reactive({
  turunan: '',
  initialSuggestedTurunan: '',
  kodePack: '',
  subKode: '',
  initialSuggestedSubKode: ''
});

const clearPreviousInfo = () => {
  previousInfo.turunan = '';
  previousInfo.initialSuggestedTurunan = '';
  previousInfo.kodePack = '';
  previousInfo.subKode = '';
  previousInfo.initialSuggestedSubKode = '';
};

// Setting Chartingan untuk Slitting (Default 4 Chartingan A, B, C, D atau A, C dll)
const activeChartinganPreset = ref('A, B, C, D');

const activeChartinganList = computed(() => {
  const list = (activeChartinganPreset.value || '').split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
  return list.length > 0 ? list : ['A', 'B', 'C', 'D'];
});

function parseTurunan(turunanStr) {
  if (!turunanStr) return { prefix: 'H', chartingan: 'A', noUrut: 1, numDigits: 2 };
  const str = String(turunanStr).trim();

  // 1. Pola Khusus Mesin Casting:
  // [formula 3 digit][tanggal bulan tahun 2 digit][kode operator][shift 1/2/3][chartingan][turunan 1-2 digit]
  // Contoh: L04270826B1A27, L01050125C2A1, L01050125A3B20
  const matchCasting = str.match(/^([A-Za-z]\d{2})(\d{6})([A-Za-z])([1-3])([A-Za-z])(\d{1,2})$/);
  if (matchCasting) {
    const formula = matchCasting[1].toUpperCase();
    const date = matchCasting[2];
    const op = matchCasting[3].toUpperCase();
    const sh = matchCasting[4];
    const chart = matchCasting[5].toUpperCase();
    const num = parseInt(matchCasting[6], 10);
    const digits = matchCasting[6].length;
    return {
      isCasting: true,
      formula,
      date,
      op,
      shift: sh,
      prefix: `${formula}${date}${op}${sh}`,
      chartingan: chart,
      noUrut: num,
      numDigits: digits
    };
  }

  // 2. Pola Standar Slitting/Rewind: Kode Operator/Prefix + 1 Huruf Chartingan + Angka No Urut (contoh: HA01, HB02, GC01)
  const match = str.match(/^([A-Za-z]+?)([A-Za-z])(\d+)$/);
  if (match) {
    return {
      prefix: match[1].toUpperCase(),
      chartingan: match[2].toUpperCase(),
      noUrut: parseInt(match[3], 10),
      numDigits: match[3].length
    };
  }
  const matchSimple = str.match(/^([A-Za-z]+)(\d+)$/);
  if (matchSimple) {
    const letters = matchSimple[1].toUpperCase();
    const num = parseInt(matchSimple[2], 10);
    const digits = matchSimple[2].length;
    if (letters.length >= 2) {
      return {
        prefix: letters.substring(0, letters.length - 1),
        chartingan: letters.substring(letters.length - 1),
        noUrut: num,
        numDigits: digits
      };
    }
    return { prefix: letters, chartingan: 'A', noUrut: num, numDigits: digits };
  }
  return { prefix: 'H', chartingan: 'A', noUrut: 1, numDigits: 2 };
}

function getNextTurunan(prevTurunan, lot = '') {
  const parsed = parseTurunan(prevTurunan);
  const prefix = parsed.prefix;
  const chartingan = parsed.chartingan;

  // Kasus Khusus: Casting Turunan Format (e.g. L04270826B1A27 -> L04270826B1A28)
  if (parsed.isCasting) {
    let maxUrut = parsed.noUrut;
    const relatedLabels = labelStore.labels.filter(l => {
      if (!l.turunan) return false;
      const p = parseTurunan(l.turunan);
      return p.isCasting && p.prefix === prefix && p.chartingan === chartingan;
    });
    for (const l of relatedLabels) {
      const p = parseTurunan(l.turunan);
      if (p.noUrut > maxUrut) maxUrut = p.noUrut;
    }
    const nextNo = maxUrut + 1;
    const formatted = String(nextNo).padStart(parsed.numDigits || 1, '0');
    return `${prefix}${chartingan}${formatted}`;
  }

  const isCustomUrut = parsed.noUrut >= 8000;

  // Filter labels matching the same lot (or all labels if lot is empty)
  const relatedLabels = labelStore.labels.filter(l => {
    if (lot && l.lot) return l.lot.trim().toUpperCase() === lot.trim().toUpperCase();
    return true;
  });

  if (isCustomUrut) {
    // Range 8000-8999 or 9000-9999
    const rangeMin = Math.floor(parsed.noUrut / 1000) * 1000;
    const rangeMax = rangeMin + 999;
    let maxCustom = parsed.noUrut;
    for (const l of relatedLabels) {
      const p = parseTurunan(l.turunan);
      if (p.prefix === prefix && p.chartingan === chartingan && p.noUrut >= rangeMin && p.noUrut <= rangeMax) {
        if (p.noUrut > maxCustom) maxCustom = p.noUrut;
      }
    }
    const formatted = String(maxCustom + 1).padStart(parsed.numDigits || 2, '0');
    return `${prefix}${chartingan}${formatted}`;
  }

  // Regular turunan (< 8000)
  let maxUrut = 0;
  for (const l of relatedLabels) {
    const p = parseTurunan(l.turunan);
    if (p.prefix === prefix && p.chartingan === chartingan && p.noUrut > 0 && p.noUrut < 8000) {
      if (p.noUrut > maxUrut) maxUrut = p.noUrut;
    }
  }

  const nextNoUrut = maxUrut > 0 ? maxUrut + 1 : parsed.noUrut + 1;
  const formattedNum = String(nextNoUrut).padStart(parsed.numDigits || 2, '0');
  return `${prefix}${chartingan}${formattedNum}`;
}

function getSmartNextSubKode(item, mesinOverride = '', kodePackOverride = '') {
  if (!item) return 1;
  const targetMesin = (mesinOverride || item.mesin || '').trim().toUpperCase();
  const targetKodePack = (kodePackOverride || item.kodePack || '').trim().toUpperCase();
  const rawCurrent = parseInt(item.subKodeNumeric || item.subKode || '0', 10);
  const isCustomCode = !isNaN(rawCurrent) && rawCurrent >= 5000 && rawCurrent <= 9999;

  // Filter SELURUH label berdasarkan Mesin dan/atau Kode Pack yang sama (Unik keseluruhan per mesin, bukan per lot)
  const relatedLabels = labelStore.labels.filter(l => {
    const lKodePack = (l.kodePack || '').trim().toUpperCase();
    const lMesin = (l.mesin || '').trim().toUpperCase();
    if (targetKodePack && lKodePack) {
      return lKodePack === targetKodePack;
    }
    if (targetMesin && lMesin) {
      return lMesin === targetMesin;
    }
    return true;
  });

  if (isCustomCode) {
    // Custom 5xxx s/d 9xxx bracket: increment within its own thousands bracket
    const rangeMin = Math.floor(rawCurrent / 1000) * 1000;
    const rangeMax = rangeMin + 999;
    let maxCustom = rawCurrent;
    for (const l of relatedLabels) {
      const num = parseInt(l.subKodeNumeric || l.subKode || '0', 10);
      if (!isNaN(num) && num >= rangeMin && num <= rangeMax) {
        if (num > maxCustom) maxCustom = num;
      }
    }
    return maxCustom + 1;
  }

  // Regular packs (< 5000, e.g. 1..4999): EXCLUDE ALL 5xxx to 9xxx codes!
  let maxRegular = 0;
  for (const l of relatedLabels) {
    const num = parseInt(l.subKodeNumeric || l.subKode || '0', 10);
    if (!isNaN(num) && num > 0 && num < 5000) {
      if (num > maxRegular) maxRegular = num;
    }
  }

  return maxRegular > 0 ? maxRegular + 1 : (!isNaN(rawCurrent) && rawCurrent > 0 ? rawCurrent + 1 : 1);
}

const applyChartinganToForm = (letter) => {
  const parsed = parseTurunan(form.turunan);
  const formattedNum = String(parsed.noUrut).padStart(parsed.numDigits || (parsed.isCasting ? 1 : 2), '0');
  form.turunan = `${parsed.prefix}${letter.toUpperCase()}${formattedNum}`;
};

const advanceFormTurunan = () => {
  form.turunan = getNextTurunan(form.turunan, form.lot);
};

// ── OPERATOR LOOKUP & TRACKING ────────────────────────────────────────────────
const detectedPrefix = computed(() => {
  const p = parseTurunan(form.turunan);
  if (p.isCasting) return p.op || '';
  return p.prefix || '';
});

const detectedOperator = computed(() => {
  if (form.operator) {
    const byName = configStore.operatorList.find(o => o.nama && o.nama.toUpperCase() === form.operator.toUpperCase());
    if (byName) return byName;
  }
  if (form.kodeOperator) {
    const byCode = configStore.operatorList.find(o => o.kodeOperator && o.kodeOperator.toUpperCase() === form.kodeOperator.toUpperCase());
    if (byCode) return byCode;
  }
  if (!detectedPrefix.value) return null;
  // Cari di configStore.operatorList berdasarkan kodeOperator dan mesin aktif di form
  if (form.mesin) {
    const byCodeAndMachine = configStore.operatorList.find(
      o => o.kodeOperator === detectedPrefix.value && o.mesin && o.mesin.toUpperCase() === form.mesin.toUpperCase() && o.active !== false
    );
    if (byCodeAndMachine) return byCodeAndMachine;
  }
  return configStore.operatorList.find(o => o.kodeOperator === detectedPrefix.value && o.active !== false)
    || configStore.operatorList.find(o => o.kodeOperator === detectedPrefix.value)
    || null;
});

// Daftar operator khusus untuk mesin yang sedang dipilih di form
const machineOperators = computed(() => {
  const list = configStore.operatorList.filter(o => o.active !== false);
  let matched = list;
  if (form.mesin) {
    const filtered = list.filter(o => o.mesin && o.mesin.toUpperCase() === form.mesin.toUpperCase());
    if (filtered.length > 0) matched = filtered;
  }
  return [...matched].sort((a, b) => (a.kodeOperator || '').localeCompare(b.kodeOperator || ''));
});

const selectedOperatorId = computed(() => {
  if (detectedOperator.value) return detectedOperator.value.id;
  if (form.operator) {
    const op = configStore.operatorList.find(o => o.nama && o.nama.toUpperCase() === form.operator.toUpperCase());
    if (op) return op.id;
  }
  return '';
});

const handleOperatorSelect = (opId) => {
  const op = configStore.operatorList.find(o => String(o.id) === String(opId));
  if (!op) return;
  form.operator = op.nama;
  form.kodeOperator = op.kodeOperator;
  // Ganti kode operator pada prefix turunan
  if (form.turunan) {
    const parsed = parseTurunan(form.turunan);
    const formattedNum = String(parsed.noUrut).padStart(parsed.numDigits || 2, '0');
    form.turunan = `${op.kodeOperator}${parsed.chartingan || 'A'}${formattedNum}`;
  } else {
    form.turunan = `${op.kodeOperator}A01`;
  }
  updateAutoFields();
};
const onSelectOperator = handleOperatorSelect;

// Sinkronisasi otomatis form.operator saat mengetik form.turunan pada mode input baru / duplicate
watch(() => form.turunan, () => {
  if (!isEditing.value || !form.operator) {
    if (detectedOperator.value) {
      form.operator = detectedOperator.value.nama;
      form.kodeOperator = detectedOperator.value.kodeOperator;
    }
  }
});

// Mendapatkan operator aktif untuk mesin tertentu dari jadwal shift / roster handover
const getActiveShiftOperator = (machineName) => {
  const m = (machineName || 'SLITTING').toUpperCase();
  // 1. Roster konfirmasi handover
  if (scheduleStore.confirmedRoster && scheduleStore.confirmedRoster[m] && scheduleStore.confirmedRoster[m].operator) {
    const r = scheduleStore.confirmedRoster[m];
    const op = configStore.operatorList.find(o => o.nama && o.nama.toUpperCase() === r.operator.toUpperCase());
    if (op) return op;
    return { id: r.operatorId || 'custom', nama: r.operator, kodeOperator: r.kodeOperator || 'H', mesin: m, kodeGrup: r.group || 'A' };
  }
  // 2. Roster terjadwal shift saat ini
  const shift = scheduleStore.getCurrentShiftInfo();
  const scheduled = scheduleStore.getScheduledOperators(shift.date, shift.shiftCode, shift.group);
  if (scheduled.roster && scheduled.roster[m]) {
    return scheduled.roster[m];
  }
  // 3. Fallback ke daftar master
  return configStore.operatorList.find(o => o.mesin && o.mesin.toUpperCase() === m && o.active !== false)
    || configStore.operatorList[0] || null;
};

// Saat operator mengubah pilihan mesin di form modal, sesuaikan operator & turunan ke operator aktif shift mesin tersebut
watch(() => form.mesin, (newMesin, oldMesin) => {
  if (newMesin && newMesin !== oldMesin) {
    updateAutoFields();
    if (newMesin === 'REWIND') {
      lotSearchSource.value = 'DATA_ROLL';
    } else if (newMesin === 'SLITTING') {
      lotSearchSource.value = 'WIP';
    }
    if (!isEditing.value) {
      const activeOp = getActiveShiftOperator(newMesin);
      if (activeOp) {
        form.operator = activeOp.nama;
        form.kodeOperator = activeOp.kodeOperator;
        const parsed = parseTurunan(form.turunan);
        const formattedNum = String(parsed.noUrut).padStart(parsed.numDigits || 2, '0');
        form.turunan = `${activeOp.kodeOperator}${parsed.chartingan || 'A'}${formattedNum}`;
      }
    }
  }
});

const resetFormToDefaults = () => {
  form.id = null;
  form.uniqId = '';
  form.supplier = 'INHOUSE';
  form.spk = '';
  form.tanggal = '';
  form.tanggalManual = '';
  form.tanggalShift = '';
  form.shift = '';
  form.mesin = 'SLITTING';
  form.jenis = '';
  form.alias = '';
  form.jenisKey = '';
  form.type = 'TRANSPARENT';
  form.thickness = '';
  form.width = '';
  form.length = '';
  form.meter = '';
  form.joint = '0';
  form.netto = '';
  form.diameterCore = 6;
  form.paperCore = '';
  form.kodePack = '';
  form.subKodeType = 'numeric';
  form.subKodeNumeric = '';
  form.subKode = '0000';
  form.status = 'PASS';
  form.treatment = 'INSIDE';
  form.od = '';
  form.lot = '';
  form.turunan = '';
  form.operator = '';
  form.kodeOperator = '';
  form.kode = '';
  form.keterangan = '';
  form.jenisPrint = 'FINISH GOODS';
};

const openModal = (item = -1) => {
  clearPreviousInfo();
  resetFormToDefaults();
  selectedWipRoll.value = null;
  showWipModal.value = false;
  userDismissedWipModal.value = false;
  wipSearchQuery.value = '';
  wipFilterJenis.value = '';
  wipFilterLokasi.value = '';

  if (item && (item.id || item.uniqId)) {
    // EDIT MODE: Deep copy clean object, pertahankan tanggal dan metadata historis!
    isEditing.value = true;
    const cloned = JSON.parse(JSON.stringify(item));
    Object.assign(form, cloned);
    if (form.mesin === 'REWIND') {
      lotSearchSource.value = 'DATA_ROLL';
    } else {
      lotSearchSource.value = 'WIP';
    }
    form.id = item.id;
    form.tanggal = item.tanggalFormatted || item.tanggal || form.tanggal;
    form.tanggalShift = item.tanggalShift || form.tanggal;
    form.shift = item.shift || scheduleStore.getCurrentShiftInfo().shiftCode;
    form.diameterCore = Number(item.diameterCore) || (parseFloat(item.paperCore) < 4.5 && parseFloat(item.paperCore) > 0 ? 3 : 6);
    form.treatment = item.treatment || 'INSIDE';
    form.operator = item.operator || getOperatorFromTurunan(item.turunan, item.mesin) || '';
    form.kodeOperator = item.kodeOperator || (item.turunan ? parseTurunan(item.turunan).prefix : '') || '';
    form.meter = item.meter !== undefined && item.meter !== null && String(item.meter) !== String(item.length) ? String(item.meter) : '';
    form.joint = item.joint !== undefined && item.joint !== null ? String(item.joint) : '0';

    const itemStatus = String(item.status || item.qualityStatus || '').toUpperCase();
    if (itemStatus === 'REJECT' || item.subKode === 'REJECT') {
      form.subKodeType = 'reject';
      form.status = 'REJECT';
      form.subKode = 'REJECT';
      form.subKodeNumeric = '';
    } else if (itemStatus === 'HOLD' || item.subKode === '0000') {
      form.subKodeType = 'hold';
      form.status = 'HOLD';
      form.subKode = '0000';
      form.subKodeNumeric = '';
    } else {
      form.subKodeType = 'numeric';
      form.status = 'PASS';
      form.subKodeNumeric = item.subKode && !['0000', 'REJECT'].includes(item.subKode) ? parseInt(item.subKode, 10).toString() : '';
      const raw = String(form.subKodeNumeric || '').replace(/[^0-9]/g, '');
      form.subKode = raw ? raw.padStart(4, '0') : '0000';
    }
  } else {
    // TAMBAH DATA (NEW RECORD): Clean standard state
    isEditing.value = false;
    // Otomatis pilih mesin sesuai sheet mesin yang sedang aktif
    const activeSheetMesin = (labelStore.filterMesin && labelStore.filterMesin !== 'ALL')
      ? labelStore.filterMesin
      : (mesinOptions.value[0] || 'SLITTING');
    form.mesin = activeSheetMesin;
    const currentShift = scheduleStore.getCurrentShiftInfo();
    form.shift = currentShift.shiftCode;
    // Ambil default operator aktif shift untuk mesin ini
    const activeOp = getActiveShiftOperator(form.mesin);
    const activeOpCode = activeOp ? activeOp.kodeOperator : 'H';
    form.operator = activeOp ? activeOp.nama : '';
    form.kodeOperator = activeOpCode;
    form.turunan = `${activeOpCode}A01`;
    if (form.mesin === 'REWIND') {
      lotSearchSource.value = 'DATA_ROLL';
    } else {
      lotSearchSource.value = 'WIP';
    }
    updateAutoFields();
  }
  if (!dataRollStore.rolls || dataRollStore.rolls.length === 0) {
    dataRollStore.loadRolls().catch(console.error);
  }
  if (!wipStore.wipRolls || wipStore.wipRolls.length === 0) {
    wipStore.loadWipRolls().catch(console.error);
  }
  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  showWipModal.value = false;
  userDismissedWipModal.value = false;
  selectedWipRoll.value = null;
  clearPreviousInfo();
};

const handleFormSubmit = async () => {
  // 1. Bersihkan spasi dari Lot dan Supplier (aktual tersimpan tanpa spasi)
  form.lot = (form.lot || '').replace(/\s+/g, '').toUpperCase();
  form.supplier = (form.supplier || '').replace(/\s+/g, '').toUpperCase();
  form.turunan = (form.turunan || '').trim().toUpperCase();
  form.kodeOperator = (form.kodeOperator || '').trim().toUpperCase();
  form.operator = (form.operator || '').trim().toUpperCase();

  // 2. Validasi: Jika status PASS (numeric), maka angka subKode wajib diisi
  if (form.subKodeType === 'numeric') {
    const rawNum = String(form.subKodeNumeric || '').trim();
    if (!rawNum) {
      alert('Nomor Sub Kode Pack untuk status PASS wajib diisi!');
      return;
    }
  }

  updateAutoFields();

  if (lotMismatch.value) {
    if (!confirm(`Peringatan: 3 karakter awal No. Lot (${form.lot.substring(0, 3)}) tidak sama dengan Kode Formula (${form.kode.substring(0, 3)}).\n\nApakah Anda yakin ingin tetap menyimpan?`)) {
      return;
    }
  }

  const payload = { ...form };
  if (!payload.shift) {
    payload.shift = scheduleStore.getCurrentShiftInfo().shiftCode;
  }
  if (isEditing.value && payload.id) {
    await labelStore.updateLabel(payload.id, payload);
  } else {
    delete payload.id;
    await labelStore.addLabel(payload);
  }
  closeModal();
};

const duplicateData = (item) => {
  if (!item) return;
  isEditing.value = false;

  // Clone seluruh data dari item
  Object.assign(form, item);
  form.id = null;
  form.uniqId = '';
  form.shift = item.shift || scheduleStore.getCurrentShiftInfo().shiftCode;

  // Hitung tanggal shift & kode pack otomatis terlebih dahulu
  const tglShift = calculateShiftDate();
  form.tanggalShift = tglShift;
  const finalDate = form.tanggalManual || tglShift;
  form.tanggal = finalDate;
  form.kodePack = generateKodePack(finalDate, form.mesin);

  // Auto-complete Turunan cerdas (mencari urutan tertinggi di lot tersebut, mengabaikan kode custom 8xxx/9xxx)
  const nextTurunanVal = getNextTurunan(item.turunan, item.lot);
  form.turunan = nextTurunanVal;

  // Untuk record baru duplikasi: cari operator master saat ini untuk kode operator tersebut (pengganti baru jika ada)
  const parsedNext = parseTurunan(nextTurunanVal);
  const prefix = parsedNext.isCasting ? (parsedNext.op || 'B') : parsedNext.prefix;
  const currentOp = configStore.operatorList.find(o => o.kodeOperator === prefix && (!item.mesin || o.mesin === item.mesin))
    || configStore.operatorList.find(o => o.kodeOperator === prefix);
  form.operator = currentOp ? currentOp.nama : (item.operator || '');
  form.kodeOperator = prefix;
  if (parsedNext.isCasting && parsedNext.shift) {
    form.shift = parsedNext.shift;
  }
  if (form.mesin === 'REWIND') {
    lotSearchSource.value = 'DATA_ROLL';
  } else {
    lotSearchSource.value = 'WIP';
  }

  // Auto-complete subKode / kodePack increment cerdas (KESELURUHAN per Mesin / Kode Pack, BUKAN per lot)
  let nextSubNum = 1;
  const itemStatus = String(item.status || item.qualityStatus || '').toUpperCase();
  if (itemStatus === 'REJECT' || item.subKode === 'REJECT') {
    form.subKodeType = 'reject';
    form.status = 'REJECT';
    form.subKode = 'REJECT';
    form.subKodeNumeric = '';
  } else if (itemStatus === 'HOLD' || item.subKode === '0000') {
    form.subKodeType = 'hold';
    form.status = 'HOLD';
    form.subKode = '0000';
    form.subKodeNumeric = '';
  } else {
    nextSubNum = getSmartNextSubKode(item, form.mesin, form.kodePack);
    form.subKodeType = 'numeric';
    form.subKodeNumeric = String(nextSubNum);
    form.subKode = String(nextSubNum).padStart(4, '0');
    form.status = 'PASS';
  }

  // Simpan info sebelumnya untuk indikator kecil di form
  previousInfo.turunan = item.turunan || '';
  previousInfo.initialSuggestedTurunan = nextTurunanVal;
  previousInfo.kodePack = item.kodePack || '';
  previousInfo.subKode = item.subKode || '';
  previousInfo.initialSuggestedSubKode = form.subKodeNumeric;

  updateAutoFields();
  if (form.subKodeType === 'numeric') {
    form.subKodeNumeric = String(nextSubNum);
    form.subKode = String(nextSubNum).padStart(4, '0');
    form.status = 'PASS';
  }
  showModal.value = true;
};

const deleteData = async (item) => {
  if (confirm(`Hapus label Lot ${item.lot}?`)) {
    await labelStore.deleteLabel(item.id);
  }
};

const deleteSelected = async () => {
  if (selectedIds.value.length === 0) return;
  if (confirm(`Hapus ${selectedIds.value.length} label terpilih?`)) {
    await labelStore.deleteSelectedLabels(selectedIds.value);
    selectedIds.value = [];
  }
};

const previewSingle = (item) => {
  previewItems.value = [item];
  showPreviewModal.value = true;
};

const previewSelected = () => {
  if (selectedIds.value.length === 0) return;
  previewItems.value = labelStore.labels.filter(l => selectedIds.value.includes(l.id));
  showPreviewModal.value = true;
};

const triggerPrint = () => {
  window.print();
};

onMounted(async () => {
  await Promise.all([
    labelStore.loadLabels(),
    configStore.loadAll(),
    wipStore.loadWipRolls(),
    dataRollStore.loadRolls(),
    refreshQuickTags()
  ]);
  checkAndRunScheduledAutomation().then(() => refreshQuickTags());
  const savedCols = await getSetting('visible_columns', null);
  if (savedCols) {
    Object.assign(visibleColumns, savedCols);
  }
  nextTick(() => {
    updateControlBarOffset();
    updateJenisKey();
  });
  window.addEventListener('resize', updateControlBarOffset);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateControlBarOffset);
});

// ── CONFIG-DRIVEN COMPUTED & MACHINE SHEETS ───────────────────────────────────

// Sub-sheets per Mesin
const machineSheets = computed(() => {
  const list = [{ id: 'ALL', label: 'SEMUA MESIN' }];
  const activeMesin = configStore.mesinList.filter(m => m.active !== false).map(m => m.nama);
  const defaultList = activeMesin.length > 0 ? activeMesin : ['CASTING', 'METALIZE', 'SLITTING', 'REWIND'];
  defaultList.forEach(m => {
    list.push({ id: m, label: m });
  });
  return list;
});

const selectMachineSheet = (sheetId) => {
  labelStore.filterMesin = sheetId;
  labelStore.currentPage = 1;
};

const getCountByMesin = (mesinId) => {
  if (mesinId === 'ALL') return labelStore.labels.length;
  return labelStore.labels.filter(l => l.mesin === mesinId).length;
};

// List mesin dari config (fallback statis)
const mesinOptions = computed(() => {
  const list = configStore.mesinList.filter(m => m.active).map(m => m.nama);
  return list.length ? list : ['CASTING', 'METALIZE', 'SLITTING', 'REWIND'];
});

// List jenis film dari config
const jenisOptions = computed(() => {
  const list = configStore.jenisList.filter(j => j.active).map(j => j.nama);
  return list.length ? list : ['VMCPP', 'CPP', 'VMPET', 'PET'];
});

// Pilihan Gunakan Alias untuk Label Film (Default: true)
const useFilmAlias = ref(localStorage.getItem('mlabel_use_film_alias') !== 'false');

watch(useFilmAlias, (val) => {
  localStorage.setItem('mlabel_use_film_alias', val ? 'true' : 'false');
  updateJenisKey();
});

// Dropdown pilihan jenis film (menampilkan Jenis(Alias) jika useFilmAlias aktif)
const jenisDisplayOptions = computed(() => {
  if (!useFilmAlias.value) {
    return jenisOptions.value.map(j => ({
      key: j,
      jenis: j,
      alias: '',
      label: j
    }));
  }

  const items = [];
  const registeredKeys = new Set();

  // 1. Ekstrak kombinasi jenis & alias unik dari filmConfigs
  for (const cfg of configStore.filmConfigs) {
    if (cfg.active === false) continue;
    const j = (cfg.jenis || '').trim().toUpperCase();
    const a = (cfg.alias || '').trim().toUpperCase();
    if (!j) continue;
    const key = a ? `${j}::${a}` : j;
    if (!registeredKeys.has(key)) {
      registeredKeys.add(key);
      items.push({
        key,
        jenis: j,
        alias: a,
        label: a ? `${j}(${a})` : j
      });
    }
  }

  // 2. Tambahkan jenis dari jenisList yang belum ada di list
  for (const j of jenisOptions.value) {
    const hasAny = items.some(it => it.jenis === j);
    if (!hasAny) {
      items.push({
        key: j,
        jenis: j,
        alias: '',
        label: j
      });
    }
  }

  return items;
});

const updateJenisKey = () => {
  if (!form.jenis) {
    form.jenisKey = '';
    return;
  }
  if (!useFilmAlias.value) {
    form.jenisKey = form.jenis;
    return;
  }

  let alias = form.alias;
  if (!alias && form.kode) {
    const matched = configStore.filmConfigs.find(
      r => r.jenis?.toUpperCase() === form.jenis?.toUpperCase() && r.kodeFormula?.toUpperCase() === form.kode?.toUpperCase()
    );
    if (matched && matched.alias) alias = matched.alias;
  }
  if (!alias) {
    const def = getDefaultFilmAlias(form.jenis, form.kode || '');
    if (def) alias = def;
  }
  if (alias) form.alias = alias;

  const targetKey = alias ? `${form.jenis}::${alias}` : form.jenis;
  const exists = jenisDisplayOptions.value.some(o => o.key === targetKey);
  if (exists) {
    form.jenisKey = targetKey;
  } else {
    const fallback = jenisDisplayOptions.value.find(o => o.jenis === form.jenis);
    form.jenisKey = fallback ? fallback.key : form.jenis;
  }
};

const handleJenisKeyChange = () => {
  const selected = jenisDisplayOptions.value.find(o => o.key === form.jenisKey);
  if (selected) {
    form.jenis = selected.jenis;
    form.alias = selected.alias;
  } else {
    form.jenis = form.jenisKey;
    form.alias = '';
  }
  handleJenisChange();
};

const getDisplayJenis = (item) => {
  if (!item) return '';
  if (useFilmAlias.value) {
    if (item.alias) return item.alias;
    const match = configStore.filmConfigs.find(
      r => r.jenis?.toUpperCase() === item.jenis?.toUpperCase() && r.kodeFormula?.toUpperCase() === item.kode?.toUpperCase()
    );
    if (match && match.alias) return match.alias;
    const byJenis = configStore.filmConfigs.find(
      r => r.jenis?.toUpperCase() === item.jenis?.toUpperCase() && r.alias
    );
    if (byJenis && byJenis.alias) return byJenis.alias;
    const def = getDefaultFilmAlias(item.jenis, item.kode);
    if (def) return def;
  }
  return item.jenis || '';
};

// Info Batas Panjang Standard berdasarkan Thickness
const standardLengthInfo = computed(() => {
  if (!form.thickness) return null;
  return configStore.getStandardLength(form.thickness);
});

const isLengthExceedingStandard = computed(() => {
  if (!standardLengthInfo.value || !form.length) return false;
  const len = parseFloat(form.length);
  if (isNaN(len) || len <= 0) return false;
  const isJumbo = ['CASTING', 'METALIZE'].includes(form.mesin);
  const maxLimit = isJumbo
    ? standardLengthInfo.value.maxPanjangJumbo
    : standardLengthInfo.value.maxPanjangFg;
  return maxLimit > 0 && len > maxLimit;
});

// Kode formula yang tersedia untuk jenis yang sedang dipilih
const kodeFormulaOptions = computed(() => {
  if (!form.jenis) return [];
  return configStore.filmConfigs
    .filter(r => r.jenis === form.jenis)
    .map(r => ({ kodeFormula: r.kodeFormula, keterangan: r.keterangan, density: r.density }));
});

// Jenis bahan pilihan dari config
const jenisBahanOptions = computed(() => {
  const list = configStore.jenisBahanList.filter(j => j.active).map(j => j.nama);
  return list.length ? list : ['Transparent', 'Matte', 'White', 'Glossy', 'Metalized'];
});

// Ambil density dari db sesuai jenis + kode formula yang dipilih
const currentDensity = computed(() => {
  if (!form.jenis) return 0.91;
  const matched = configStore.filmConfigs.find(
    r => r.jenis === form.jenis && r.kodeFormula === form.kode
  );
  if (matched) return matched.density;
  // Fallback: cari berdasarkan jenis saja (density default per jenis)
  const byJenis = configStore.filmConfigs.find(r => r.jenis === form.jenis);
  if (byJenis) return byJenis.density;
  // Hard fallback
  return ['VMPET', 'PET'].includes(form.jenis) ? 1.4 : 0.91;
});

// Info keterangan kode yang dipilih (tampilkan di form)
const selectedKodeInfo = computed(() => {
  if (!form.jenis || !form.kode) return null;
  return configStore.filmConfigs.find(
    r => r.jenis === form.jenis && r.kodeFormula === form.kode
  ) || null;
});

// Auto-reset kode formula ketika jenis berubah (kode lama tidak relevan)
watch(() => form.jenis, () => {
  // Hanya reset kalau kode sebelumnya tidak ada di list baru
  const available = kodeFormulaOptions.value.map(k => k.kodeFormula);
  if (form.kode && !available.includes(form.kode)) {
    form.kode = '';
  }
  syncFormulaConfigs();
  updateAutoFields();
});

// Recalculate netto & sync configs setiap kode formula berubah
watch(() => form.kode, () => {
  syncFormulaConfigs();
  updateAutoFields();
});
</script>

<style>
/* ON-SCREEN PREVIEW STYLES */
#printOnlyArea {
  display: none;
}

.label-item-wrapper {
  display: flex;
  flex-direction: column;
}

.label-preview-content {
  border: 1.5px solid black;
  padding: 2.5px 4px 1px 4px;
  background-color: white;
  color: black;
  font-family: Arial, Helvetica, sans-serif;
  box-sizing: border-box;
  width: 100%;
  min-height: 68.5mm;
  height: 68.5mm;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.label-table {
  width: 100%;
  height: calc(100% - 8.5px);
  flex: 1;
  border-collapse: collapse;
  font-size: 11px;
}

.label-table td, .label-table th {
  border: 1px solid black;
  padding: 2.5px 2px;
  vertical-align: middle;
  text-align: center;
}

.label-pass {
  background-color: #16a34a !important;
  color: #ffffff !important;
  font-weight: bold;
  padding: 0 5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.label-fail {
  background-color: #facc15 !important;
  color: #dc2626 !important;
  font-weight: bold;
  padding: 0 5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.label-reject {
  background-color: #dc2626 !important;
  color: #fef08a !important;
  font-weight: bold;
  padding: 0 5px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.dynamic-corner-sign {
  font-weight: bold;
  font-size: 8.5px;
  padding: 1px 4px;
  border-radius: 2px;
  text-align: center;
  white-space: nowrap;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.B-grade {
  background-color: #4c1d95 !important;
  color: #ffffff !important;
  font-weight: bold;
  font-size: 9px;
  padding: 1px 4px;
  border-radius: 2px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.machine-slitting {
  background-color: #059669 !important;
  color: #ffffff !important;
  font-weight: bold;
  font-size: 8.5px;
  padding: 1px 4px;
  border-radius: 2px;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Garis Bantu Putus-Putus dengan Ikon Gunting Minimalis & Estetik */
.cut-line {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
  color: #4b5563;
}

.cut-scissor-svg {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #4b5563;
}

.cut-dash {
  flex: 1;
  border-bottom: 1.5px dashed #4b5563;
}

/* DEDICATED PRINT STYLES: GUARANTEED ZERO DUPLICATION & PRECISE 4 LABELS PER SHEET */
@media print {
  @page {
    size: A4 portrait;
    margin: 3.5mm 5mm;
  }

  html, body {
    margin: 0 !important;
    padding: 0 !important;
    background: #ffffff !important;
    width: 100% !important;
    height: auto !important;
  }

  /* HIDE ENTIRE SPA UI */
  #app {
    display: none !important;
  }

  /* SHOW ONLY TELEPORTED PRINT CONTAINER */
  #printOnlyArea {
    display: block !important;
    position: static !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .print-page {
    display: block !important;
    box-sizing: border-box !important;
    margin: 0 !important;
    padding: 0 !important;
    page-break-after: always !important;
    break-after: page !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
  }

  .print-page:last-child {
    page-break-after: avoid !important;
    break-after: avoid !important;
  }

  .label-item-wrapper {
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    margin: 0 !important;
    padding: 0 !important;
  }

  .label-preview-content {
    border: 1.2px solid black !important;
    padding: 2px 3.5px 1px 3.5px !important;
    margin: 0 !important;
    height: 68.5mm !important;
    max-height: 68.8mm !important;
    box-sizing: border-box !important;
    page-break-inside: avoid !important;
    break-inside: avoid !important;
    display: flex !important;
    flex-direction: column !important;
    justify-content: space-between !important;
    overflow: hidden !important;
  }

  .label-table {
    width: 100% !important;
    height: calc(100% - 8.5px) !important;
    flex: 1 !important;
    display: table !important;
    border-collapse: collapse !important;
    font-size: 10.5px !important;
    line-height: 1.25 !important;
  }

  .label-table td, .label-table th {
    border: 1px solid black !important;
    padding: 2px 2px !important;
    vertical-align: middle !important;
    text-align: center !important;
    line-height: 1.25 !important;
  }

  .cut-line {
    display: flex !important;
    align-items: center !important;
    gap: 4px !important;
    height: 2.2mm !important;
    margin: 0.5mm 0 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    color: #374151 !important;
  }

  .cut-scissor-svg {
    width: 9px !important;
    height: 9px !important;
    flex-shrink: 0 !important;
    color: #1f2937 !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  .cut-dash {
    border-bottom: 1.2px dashed #4b5563 !important;
  }
}
</style>
