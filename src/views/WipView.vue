<template>
  <div class="space-y-4 pb-12 animate-fade-in font-sans">
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TOP HEADER & SUB-SHEET NAVIGATION (TABS)                           -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-amber-100 text-amber-900 border border-amber-300">
            Warehouse Tools
          </span>
          <span class="text-zinc-400">•</span>
          <span class="text-xs font-semibold text-zinc-500">WIP Jumbo Roll & Rack Visual System</span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mt-0.5">
          WIP Management & Denah Lokasi
        </h1>
        <p class="text-xs text-zinc-500 mt-0.5">
          Kelola data stok harian Roll Jumbo WIP, tetapkan 1 acuan stok aktif, dan pantau denah visual posisi rak penyimpanan.
        </p>
      </div>

      <!-- Module Selector Toggle -->
      <div class="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1 text-xs shrink-0 shadow-md">
        <button
          @click="$router.push('/inventory')"
          class="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
        >
          <span>📦 1. Stok FG Roll ➔</span>
        </button>

        <button
          class="px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2 bg-amber-500 text-zinc-950 shadow-sm shadow-amber-500/30"
        >
          <span>🛢️ 2. Stok WIP Jumbo</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-black/20 text-zinc-950">
            {{ wipStore.activeWipRolls ? wipStore.activeWipRolls.length : 0 }}
          </span>
        </button>
      </div>
    </div>

    <!-- SUB-SHEET SWITCHER (TABS) -->
    <div class="bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
      <button
        @click="activeWipTab = 'stock'"
        :class="[
          'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeWipTab === 'stock'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
        ]"
      >
        <span>📦</span>
        <span>1. Stock WIP (Aktif)</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-mono font-bold">
          {{ wipStore.activeWipRolls ? wipStore.activeWipRolls.length : 0 }}
        </span>
      </button>

      <button
        @click="activeWipTab = 'updates'; isDetailViewOpen = false"
        :class="[
          'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeWipTab === 'updates'
            ? 'bg-zinc-900 text-white shadow-xs'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
        ]"
      >
        <span>📑</span>
        <span>2. Riwayat Update Stok WIP</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-700 text-white font-mono">
          {{ wipStore.wipUpdates.length }}
        </span>
      </button>

      <button
        @click="activeWipTab = 'location'"
        :class="[
          'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
          activeWipTab === 'location'
            ? 'bg-amber-500 text-zinc-950 shadow-xs shadow-amber-500/30'
            : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
        ]"
      >
        <span>🗺️</span>
        <span>3. WIP Location (Denah & Posisi Rak)</span>
        <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-200 text-amber-950 font-mono font-bold">
          {{ wipLocationCards.length }} Rak
        </span>
      </button>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TAB 1: STOCK WIP (LIST LENGKAP STOK AKTIF + STICKY HEADER)         -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="activeWipTab === 'stock'" class="space-y-4 animate-fade-in">
      
      <!-- Metrics Dashboard Mini Cards -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
          <div class="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
            <span>Total Roll Aktif</span>
            <span>📦</span>
          </div>
          <p class="text-xl font-black text-zinc-900 mt-1 font-mono">
            {{ formatNumber(filteredStockRolls.length) }} <span class="text-xs font-normal text-zinc-400 font-sans">Roll</span>
          </p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
          <div class="flex items-center justify-between text-emerald-700 text-[11px] font-bold">
            <span>Total Berat Aktual</span>
            <span>⚖️</span>
          </div>
          <p class="text-xl font-black text-emerald-800 mt-1 font-mono">
            {{ formatNumber(stockTotalBeratAktual) }} <span class="text-xs font-normal text-emerald-600 font-sans">kg</span>
          </p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
          <div class="flex items-center justify-between text-emerald-700 text-[11px] font-bold">
            <span>Siap Pakai / Ready</span>
            <span>✅</span>
          </div>
          <p class="text-xl font-black text-emerald-700 mt-1 font-mono">
            {{ stockReadyRollsCount }} <span class="text-xs font-normal text-zinc-400 font-sans">Roll</span>
          </p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
          <div class="flex items-center justify-between text-amber-700 text-[11px] font-bold">
            <span>Sedang Aging</span>
            <span>⏳</span>
          </div>
          <p class="text-xl font-black text-amber-700 mt-1 font-mono">
            {{ stockAgingRollsCount }} <span class="text-xs font-normal text-zinc-400 font-sans">Roll</span>
          </p>
        </div>

        <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs col-span-2 sm:col-span-1">
          <div class="flex items-center justify-between text-blue-700 text-[11px] font-bold">
            <span>Lokasi Rak Terisi</span>
            <span>🏢</span>
          </div>
          <p class="text-xl font-black text-blue-900 mt-1 font-mono">
            {{ stockOccupiedRacksCount }} <span class="text-xs font-normal text-zinc-400 font-sans">Lokasi</span>
          </p>
        </div>
      </div>

      <!-- Action & Multi-Criteria Filter Ribbon -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <!-- Row 1: Search, Export & Column Config Buttons -->
        <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div class="relative flex-1 max-w-lg">
            <input
              v-model="stockSearchQuery"
              type="text"
              placeholder="Cari No. Lot, No. SPK, Formula, Jenis, Lokasi, Keterangan..."
              class="w-full pl-8 pr-7 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none bg-zinc-50 font-medium"
            />
            <span class="absolute left-2.5 top-2.5 text-xs text-zinc-400">🔍</span>
            <button v-if="stockSearchQuery" @click="stockSearchQuery = ''" class="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
          </div>

          <div class="flex items-center gap-2 flex-wrap justify-end">
            <!-- Column Visibility Toggle Dropdown -->
            <div class="relative">
              <button
                @click="showColumnConfigDropdown = !showColumnConfigDropdown"
                class="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Atur kolom yang ditampilkan pada tabel"
              >
                <span>⚙️</span>
                <span>Atur Kolom</span>
                <span class="px-1.5 py-0.2 rounded bg-zinc-200 text-zinc-700 text-[10px] font-mono font-bold">
                  {{ activeVisibleColumnCount }}/{{ columnDefinitions.length }}
                </span>
                <span class="text-[9px]">▼</span>
              </button>

              <!-- Dropdown Menu -->
              <div
                v-if="showColumnConfigDropdown"
                class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-zinc-200 shadow-2xl p-3 z-50 space-y-2 text-xs animate-fade-in"
              >
                <div class="flex items-center justify-between pb-1.5 border-b border-zinc-100 font-bold text-zinc-800">
                  <span>Tampilkan Kolom</span>
                  <button @click="resetColumnsToDefault" class="text-[10px] text-blue-600 hover:underline cursor-pointer">Reset Default</button>
                </div>
                <div class="max-h-60 overflow-y-auto space-y-1 py-1">
                  <label
                    v-for="col in columnDefinitions"
                    :key="col.key"
                    :class="[
                      'flex items-center justify-between px-2 py-1 rounded-lg hover:bg-zinc-50 cursor-pointer select-none',
                      col.fixed ? 'opacity-50 cursor-not-allowed' : ''
                    ]"
                  >
                    <span class="text-zinc-700 font-medium">{{ col.label }}</span>
                    <input
                      type="checkbox"
                      :checked="visibleColumns[col.key]"
                      :disabled="col.fixed"
                      @change="toggleColumn(col.key)"
                      class="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
                <div class="pt-1.5 border-t border-zinc-100 flex justify-end">
                  <button @click="showColumnConfigDropdown = false" class="px-3 py-1 rounded-lg bg-zinc-900 text-white font-bold text-[11px] cursor-pointer">
                    Selesai
                  </button>
                </div>
              </div>
            </div>

            <!-- Export to Excel -->
            <button
              @click="exportStockToExcel"
              class="px-3 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download data tabel ke Excel"
            >
              <span>📊</span>
              <span>Export Excel</span>
            </button>

            <!-- Upload / Import -->
            <button
              @click="openImportModal"
              class="px-3.5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span>
              <span>Upload WIP</span>
            </button>

            <!-- Input Manual -->
            <button
              @click="openSingleRollModal(null)"
              class="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-all flex items-center gap-1 cursor-pointer shadow-xs"
            >
              <span>+ Input</span>
            </button>
          </div>
        </div>

        <!-- Row 2: Multi-Criteria Filter Selects -->
        <div class="flex items-center gap-2 flex-wrap text-xs pt-1 border-t border-zinc-100">
          <!-- Filter Jenis -->
          <select v-model="stockFilterJenis" class="px-2.5 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="">Semua Jenis Film</option>
            <option v-for="j in stockAvailableJenisList" :key="j" :value="j">{{ j }}</option>
          </select>

          <!-- Filter Formula -->
          <select v-model="stockFilterFormula" class="px-2.5 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="">Semua Formula</option>
            <option v-for="f in stockAvailableFormulaList" :key="f" :value="f">{{ f }}</option>
          </select>

          <!-- Filter Lokasi Rak -->
          <select v-model="stockFilterLokasi" class="px-2.5 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="">Semua Lokasi Rak</option>
            <option v-for="loc in stockAvailableLokasiList" :key="loc" :value="loc">{{ loc }}</option>
          </select>

          <!-- Filter Posisi -->
          <select v-model="stockFilterPosisi" class="px-2.5 py-1.5 border border-zinc-300 rounded-lg bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="">Semua Posisi Tingkat</option>
            <option value="ATAS">ATAS</option>
            <option value="TENGAH">TENGAH</option>
            <option value="BAWAH">BAWAH</option>
          </select>

          <!-- Filter Kesiapan Aging -->
          <select v-model="stockFilterAging" class="px-2.5 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="">Semua Kesiapan Aging</option>
            <option value="READY">✅ Siap Pakai / Ready</option>
            <option value="AGING">⏳ Sedang Proses Aging</option>
          </select>

          <!-- Filter Thickness -->
          <select v-model="stockFilterThick" class="px-2.5 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="">Semua Ketebalan</option>
            <option v-for="t in stockAvailableThicknessList" :key="t" :value="t">{{ t }} μ</option>
          </select>

          <!-- Sort Select -->
          <select v-model="stockSortBy" class="px-2.5 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
            <option value="default">Urutan Standar</option>
            <option value="aging_first">⏳ Sedang Aging Dulu</option>
            <option value="fifo_oldest">📦 Umur Stok Terlama (FIFO)</option>
            <option value="lot_asc">No Lot (A-Z)</option>
            <option value="lot_desc">No Lot (Z-A)</option>
            <option value="weight_desc">Berat Aktual (Terberat)</option>
            <option value="weight_asc">Berat Aktual (Teringan)</option>
            <option value="thick_asc">Ketebalan (Tipis ke Tebal)</option>
          </select>

          <!-- Reset Filter Button -->
          <button
            v-if="stockSearchQuery || stockFilterJenis || stockFilterFormula || stockFilterLokasi || stockFilterPosisi || stockFilterAging || stockFilterThick || stockSortBy !== 'default'"
            @click="resetStockFilters"
            class="px-2.5 py-1.5 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer transition-all"
          >
            ✕ Reset Filter
          </button>
        </div>
      </div>

      <!-- MAIN STOCK TABLE (WITH STICKY HEADER & CLICKABLE ROW DETAIL) -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        
        <!-- Table Scroll Container with Sticky Header -->
        <div class="overflow-x-auto max-h-[calc(100vh-320px)] overflow-y-auto relative">
          <table class="w-full text-left border-collapse text-xs">
            
            <!-- STICKY HEADER -->
            <thead class="sticky top-0 z-20 bg-zinc-100/95 backdrop-blur-md text-zinc-800 font-mono text-[11px] border-b border-zinc-300 shadow-2xs select-none">
              <tr>
                <th v-if="visibleColumns.index" class="py-2.5 px-2 text-center w-10 font-sans font-bold">#</th>
                
                <th
                  v-if="visibleColumns.lot"
                  @click="toggleHeaderSort('lot')"
                  class="py-2.5 px-2.5 cursor-pointer hover:bg-zinc-200/80 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    <span>No Lot</span>
                    <span v-if="stockSortField === 'lot'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th
                  v-if="visibleColumns.spk"
                  @click="toggleHeaderSort('spk')"
                  class="py-2.5 px-2.5 cursor-pointer hover:bg-zinc-200/80 transition-colors"
                >
                  <div class="flex items-center gap-1">
                    <span>No SPK</span>
                    <span v-if="stockSortField === 'spk'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th v-if="visibleColumns.jenis" class="py-2.5 px-2 text-center">Jenis</th>
                <th v-if="visibleColumns.formula" class="py-2.5 px-2 text-center">Formula</th>

                <th v-if="visibleColumns.dimensions" class="py-2.5 px-2 text-right">Dimensi (MC x W x L)</th>

                <th v-if="visibleColumns.thickness" @click="toggleHeaderSort('thickness')" class="py-2.5 px-2 text-right cursor-pointer hover:bg-zinc-200/80">
                  <div class="flex items-center justify-end gap-1">
                    <span>Thick (μ)</span>
                    <span v-if="stockSortField === 'thickness'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th v-if="visibleColumns.width" @click="toggleHeaderSort('width')" class="py-2.5 px-2 text-right cursor-pointer hover:bg-zinc-200/80">
                  <div class="flex items-center justify-end gap-1">
                    <span>Width (mm)</span>
                    <span v-if="stockSortField === 'width'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th v-if="visibleColumns.length" @click="toggleHeaderSort('length')" class="py-2.5 px-2 text-right cursor-pointer hover:bg-zinc-200/80">
                  <div class="flex items-center justify-end gap-1">
                    <span>Length (m)</span>
                    <span v-if="stockSortField === 'length'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th v-if="visibleColumns.core" class="py-2.5 px-2 text-center">Core</th>
                <th v-if="visibleColumns.diameter" class="py-2.5 px-2 text-center font-bold">Diameter Ø</th>

                <th
                  v-if="visibleColumns.beratAktual"
                  @click="toggleHeaderSort('beratAktual')"
                  class="py-2.5 px-2.5 text-right cursor-pointer hover:bg-zinc-200/80 transition-colors"
                >
                  <div class="flex items-center justify-end gap-1">
                    <span>Berat Aktual</span>
                    <span v-if="stockSortField === 'beratAktual'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th v-if="visibleColumns.beratTeori" class="py-2.5 px-2.5 text-right">Berat Teori</th>
                <th v-if="visibleColumns.lokasi" class="py-2.5 px-2.5 text-center">Lokasi Rak</th>
                <th v-if="visibleColumns.posisi" class="py-2.5 px-2 text-center">Posisi</th>

                <th
                  v-if="visibleColumns.tanggalMasuk"
                  @click="toggleHeaderSort('tanggalMasuk')"
                  class="py-2.5 px-2.5 text-center cursor-pointer hover:bg-zinc-200/80 transition-colors"
                >
                  <div class="flex items-center justify-center gap-1">
                    <span>Tgl Masuk (FIFO)</span>
                    <span v-if="stockSortField === 'tanggalMasuk'" class="text-[10px] text-amber-700 font-bold">{{ stockSortDir === 'asc' ? '▲' : '▼' }}</span>
                  </div>
                </th>

                <th v-if="visibleColumns.aging" class="py-2.5 px-2.5 text-center">Kesiapan Aging & Countdown</th>
                <th v-if="visibleColumns.keterangan" class="py-2.5 px-3">Keterangan</th>
                <th v-if="visibleColumns.descExcel" class="py-2.5 px-3">Deskripsi Excel</th>
                <th v-if="visibleColumns.descNav" class="py-2.5 px-3">Deskripsi NAV</th>
                <th v-if="visibleColumns.actions" class="py-2.5 px-2 text-center w-24 font-sans font-bold">Aksi</th>
              </tr>
            </thead>

            <!-- TABLE BODY (ROWS) -->
            <tbody class="divide-y divide-zinc-100 font-mono text-xs">
              <tr
                v-for="(roll, rIdx) in paginatedStockRolls"
                :key="roll.id || roll.uuid"
                @click="openRollDetailModal(roll)"
                class="hover:bg-amber-50/60 transition-colors cursor-pointer group"
                title="Klik untuk melihat detail lengkap roll ini"
              >
                <!-- # Index -->
                <td v-if="visibleColumns.index" class="py-2.5 px-2 text-center text-zinc-400 font-bold font-sans">
                  {{ (stockCurrentPage - 1) * stockPageSize + rIdx + 1 }}
                </td>

                <!-- No Lot -->
                <td v-if="visibleColumns.lot" class="py-2.5 px-2.5 font-black text-zinc-900">
                  <div class="flex items-center gap-1.5">
                    <span class="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200 group-hover:bg-amber-100 group-hover:border-amber-300 transition-colors">
                      {{ roll.lot }}
                    </span>
                  </div>
                </td>

                <!-- No SPK -->
                <td v-if="visibleColumns.spk" class="py-2.5 px-2.5 text-zinc-700 font-semibold">
                  {{ roll.spk || '—' }}
                </td>

                <!-- Jenis Film -->
                <td v-if="visibleColumns.jenis" class="py-2.5 px-2 text-center font-bold text-zinc-800">
                  {{ roll.jenis }}
                </td>

                <!-- Formula -->
                <td v-if="visibleColumns.formula" class="py-2.5 px-2 text-center font-bold text-red-600">
                  {{ roll.kodeFormula }}
                </td>

                <!-- Combined Dimensions -->
                <td v-if="visibleColumns.dimensions" class="py-2.5 px-2 text-right font-medium">
                  <span class="font-bold text-zinc-800">{{ roll.thickness }}μ</span> × {{ roll.width }}mm = {{ roll.length }}m
                </td>

                <!-- Thickness -->
                <td v-if="visibleColumns.thickness" class="py-2.5 px-2 text-right font-medium text-zinc-700">
                  {{ roll.thickness }} μ
                </td>

                <!-- Width -->
                <td v-if="visibleColumns.width" class="py-2.5 px-2 text-right font-medium text-zinc-700">
                  {{ roll.width }} mm
                </td>

                <!-- Length -->
                <td v-if="visibleColumns.length" class="py-2.5 px-2 text-right font-medium text-zinc-700">
                  {{ roll.length }} m
                </td>

                <!-- Core -->
                <td v-if="visibleColumns.core" class="py-2.5 px-2 text-center font-bold text-zinc-700">
                  {{ roll.core || 6 }}"
                </td>

                <!-- Diameter -->
                <td v-if="visibleColumns.diameter" class="py-2.5 px-2 text-center font-mono font-bold text-blue-900">
                  Ø {{ calculateRollDiameterCm(roll.thickness, roll.length, roll.core) }} cm
                </td>

                <!-- Berat Aktual -->
                <td v-if="visibleColumns.beratAktual" class="py-2.5 px-2.5 text-right font-black text-emerald-800">
                  {{ formatNumber(roll.beratAktual) }} <span class="text-[10px] text-zinc-400 font-normal">kg</span>
                </td>

                <!-- Berat Teori -->
                <td v-if="visibleColumns.beratTeori" class="py-2.5 px-2.5 text-right text-zinc-600 font-medium">
                  {{ formatNumber(roll.beratTeori) }}
                </td>

                <!-- Lokasi Rak -->
                <td v-if="visibleColumns.lokasi" class="py-2.5 px-2.5 text-center font-sans font-bold">
                  <span class="px-2 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10.5px]">
                    📍 {{ roll.lokasiAktif || 'STAGING' }}
                  </span>
                </td>

                <!-- Posisi Rak -->
                <td v-if="visibleColumns.posisi" class="py-2.5 px-2 text-center font-sans font-semibold text-zinc-700 text-[11px]">
                  {{ roll.posisiAktif || 'BAWAH' }}
                </td>

                <!-- Tanggal Masuk (FIFO) -->
                <td v-if="visibleColumns.tanggalMasuk" class="py-2.5 px-2.5 text-center font-sans">
                  <div class="flex flex-col items-center gap-0.5">
                    <span class="font-bold text-zinc-800 text-[11px]">{{ roll.tanggalMasukFormatted || formatExcelDate(roll.tanggalMasukStokRaw) }}</span>
                    <span v-if="getRollStockAge(roll) !== null" class="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 text-[9px] font-mono">
                      {{ getRollStockAge(roll) }} Hari
                    </span>
                  </div>
                </td>

                <!-- Aging Kesiapan & Live Countdown -->
                <td v-if="visibleColumns.aging" class="py-2.5 px-2.5 text-center font-sans">
                  <div v-if="getRollAgingInfo(roll).isAging" class="flex flex-col items-center gap-1">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                      ⏳ {{ getRollAgingInfo(roll).remainingFormatted }}
                    </span>
                    <div class="w-24 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                      <div class="bg-amber-500 h-1.5 rounded-full transition-all" :style="{ width: `${getRollAgingInfo(roll).progressPercent}%` }"></div>
                    </div>
                    <span class="text-[9px] text-zinc-500 font-mono">Target: {{ getRollAgingInfo(roll).targetDateFormatted }}</span>
                  </div>
                  <div v-else class="flex items-center justify-center">
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                      ✅ Siap Pakai
                    </span>
                  </div>
                </td>

                <!-- Keterangan -->
                <td v-if="visibleColumns.keterangan" class="py-2.5 px-3 text-zinc-600 text-[11px]">
                  <span v-if="roll.keterangan" class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold truncate max-w-[150px] inline-block">
                    {{ roll.keterangan }}
                  </span>
                  <span v-else class="text-zinc-300">—</span>
                </td>

                <!-- Description Excel -->
                <td v-if="visibleColumns.descExcel" class="py-2.5 px-3 text-zinc-500 text-[11px] truncate max-w-[180px]" :title="roll.descriptionExcel">
                  {{ roll.descriptionExcel }}
                </td>

                <!-- Description NAV -->
                <td v-if="visibleColumns.descNav" class="py-2.5 px-3 text-zinc-500 text-[11px] truncate max-w-[180px]" :title="roll.descriptionNav">
                  {{ roll.descriptionNav }}
                </td>

                <!-- Actions -->
                <td v-if="visibleColumns.actions" class="py-2.5 px-2 text-center font-sans" @click.stop>
                  <div class="flex items-center justify-center gap-1">
                    <button
                      @click="openRollDetailModal(roll)"
                      class="p-1 rounded text-zinc-500 hover:text-blue-700 hover:bg-blue-50 cursor-pointer"
                      title="Lihat Detail Lengkap"
                    >
                      👁️
                    </button>
                    <button
                      @click="openSingleRollModal(roll)"
                      class="p-1 rounded text-zinc-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer"
                      title="Edit Roll"
                    >
                      ✏️
                    </button>
                    <button
                      @click="openMoveLocationModal(roll)"
                      class="p-1 rounded text-zinc-500 hover:text-blue-600 hover:bg-blue-50 cursor-pointer"
                      title="Pindahkan Lokasi Rak"
                    >
                      📍
                    </button>
                    <button
                      @click="handleDeleteRoll(roll)"
                      class="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Hapus Roll"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="filteredStockRolls.length === 0">
                <td :colspan="activeVisibleColumnCount" class="py-16 text-center text-zinc-400 font-sans">
                  <div class="flex flex-col items-center gap-2">
                    <span class="text-3xl">📦</span>
                    <p class="font-bold text-zinc-600">Tidak ada roll WIP yang cocok dengan kriteria pencarian / filter.</p>
                    <button @click="resetStockFilters" class="px-3 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs font-bold rounded-lg cursor-pointer">
                      Reset Semua Filter
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sticky Footer Pagination -->
        <div class="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <span class="text-zinc-500 text-[11px]">
            Menampilkan <strong>{{ stockPaginationInfo.from }}</strong> - <strong>{{ stockPaginationInfo.to }}</strong> dari <strong>{{ filteredStockRolls.length }}</strong> roll aktif
          </span>
          <div class="flex items-center gap-1">
            <button :disabled="stockCurrentPage <= 1" @click="stockCurrentPage--" class="px-2.5 py-1 rounded border border-zinc-300 bg-white disabled:opacity-40 font-bold cursor-pointer">
              ◀ Prev
            </button>
            <span class="px-2.5 text-zinc-600 font-bold font-mono">{{ stockCurrentPage }} / {{ stockTotalPages }}</span>
            <button :disabled="stockCurrentPage >= stockTotalPages" @click="stockCurrentPage++" class="px-2.5 py-1 rounded border border-zinc-300 bg-white disabled:opacity-40 font-bold cursor-pointer">
              Next ▶
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TAB 2: RIWAYAT UPDATE STOK WIP (MASTER-DETAIL)                    -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeWipTab === 'updates'">
      
      <!-- LEVEL 1: DAFTAR SESI UPDATE MASTER -->
      <div v-if="!isDetailViewOpen" class="space-y-4">
        <!-- Action Ribbon & Search Toolbar -->
        <div class="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div class="relative w-full">
              <input
                v-model="searchUpdateTerm"
                type="text"
                placeholder="Cari nama batch, tanggal, atau file..."
                class="w-full pl-8 pr-6 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-amber-500 outline-none bg-zinc-50 font-medium"
              />
              <span class="absolute left-2.5 top-2.5 text-xs text-zinc-400">🔍</span>
              <button v-if="searchUpdateTerm" @click="searchUpdateTerm = ''" class="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button
              @click="openImportModal"
              class="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥</span>
              <span>Upload / Import Update WIP</span>
            </button>

            <button
              @click="openSingleRollModal(null)"
              class="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
            >
              <span>+ Input Manual</span>
            </button>
          </div>
        </div>

        <!-- Master Table of Update Sessions -->
        <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-zinc-100/80 text-zinc-700 font-mono text-[11px] border-b border-zinc-200">
                <tr>
                  <th class="py-3 px-3 text-center w-12 font-sans font-bold">#</th>
                  <th class="py-3 px-3 text-center font-sans font-bold w-36">Status Stok</th>
                  <th class="py-3 px-3 font-sans font-bold">Nama / Judul Update WIP</th>
                  <th class="py-3 px-3">Tanggal Stok</th>
                  <th class="py-3 px-3">Sumber / File</th>
                  <th class="py-3 px-3 text-center">Jumlah Roll</th>
                  <th class="py-3 px-3 text-right">Total Berat (kg)</th>
                  <th class="py-3 px-3 text-center w-48 font-sans font-bold">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 font-mono text-xs">
                <tr
                  v-for="(update, idx) in filteredUpdates"
                  :key="update.id || update.uuid"
                  :class="[
                    'hover:bg-amber-50/40 transition-colors group cursor-pointer',
                    update.isActive ? 'bg-amber-50/20' : ''
                  ]"
                  @click="openDetailView(update)"
                >
                  <td class="py-3 px-3 text-center text-zinc-400 font-bold font-sans">{{ idx + 1 }}</td>
                  <td class="py-3 px-3 text-center font-sans" @click.stop>
                    <span
                      v-if="update.isActive"
                      class="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300 inline-flex items-center gap-1 shadow-xs"
                      title="Data WIP ini aktif sebagai acuan utama stok dan validasi nomor lot label"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>🟢 ACUAN UTAMA</span>
                    </span>
                    <button
                      v-else
                      @click="makeActiveUpdate(update)"
                      class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-zinc-100 hover:bg-emerald-600 text-zinc-600 hover:text-white border border-zinc-200 transition-all inline-flex items-center gap-1 cursor-pointer"
                      title="Klik untuk mengaktifkan update ini sebagai acuan stok utama"
                    >
                      <span>📁 Arsip (Aktifkan ➔)</span>
                    </button>
                  </td>

                  <td class="py-3 px-3 font-sans" @click.stop>
                    <div v-if="editingUpdateId === (update.id || update.uuid)" class="flex items-center gap-1">
                      <input
                        v-model="editingUpdateTitle"
                        @keyup.enter="saveUpdateTitle(update)"
                        @keyup.esc="editingUpdateId = null"
                        type="text"
                        class="px-2 py-0.5 text-xs font-bold border border-amber-500 rounded outline-none bg-amber-50/50 min-w-[220px]"
                        autofocus
                      />
                      <button @click="saveUpdateTitle(update)" class="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Simpan">✓</button>
                      <button @click="editingUpdateId = null" class="p-1 text-zinc-400 hover:bg-zinc-100 rounded" title="Batal">✕</button>
                    </div>
                    <div v-else class="flex items-center gap-1.5 group/name">
                      <span class="font-black text-zinc-900 group-hover:text-amber-700 transition-colors">{{ update.title }}</span>
                      <button @click.stop="startRenameUpdate(update)" class="opacity-0 group-hover/name:opacity-100 text-zinc-400 hover:text-zinc-700 p-0.5 text-[11px] transition-opacity" title="Ubah Nama">✏️</button>
                    </div>
                  </td>

                  <td class="py-3 px-3 text-zinc-600 font-sans font-medium">{{ formatDateIndo(update.tanggal) }}</td>
                  <td class="py-3 px-3 text-zinc-500 truncate max-w-[160px]" :title="update.fileName">📄 {{ update.fileName || 'Manual / Copas' }}</td>
                  <td class="py-3 px-3 text-center font-black text-zinc-900">{{ getBatchRollCount(update) }} Roll</td>
                  <td class="py-3 px-3 text-right font-black text-zinc-900">{{ formatNumber(getBatchTotalKg(update)) }} <span class="text-[10px] text-zinc-400 font-normal">kg</span></td>

                  <td class="py-3 px-3 text-center font-sans" @click.stop>
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openDetailView(update)" class="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-500 text-amber-950 font-black text-[11px] transition-all flex items-center gap-1 cursor-pointer">
                        <span>Buka Detail</span><span>➔</span>
                      </button>
                      <button @click="exportBatchToExcel(update)" class="p-1.5 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer" title="Download Excel">📥</button>
                      <button @click="handleDeleteUpdate(update)" class="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" title="Hapus Data Update">✕</button>
                    </div>
                  </td>
                </tr>

                <tr v-if="filteredUpdates.length === 0">
                  <td colspan="8" class="py-12 text-center text-zinc-400 font-sans">
                    <div class="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-2 text-xl">📦</div>
                    <p class="font-bold text-zinc-600 text-sm">Belum Ada Riwayat Update Data WIP</p>
                    <p class="text-xs text-zinc-400 mt-0.5">Klik tombol "Upload / Import Data WIP Baru" untuk memasukkan stok harian.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- LEVEL 2: DETAIL DATA BARIS ROLL WIP -->
      <div v-else class="space-y-4 animate-fade-in">
        <div class="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <button @click="isDetailViewOpen = false" class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer">
              <span>← Kembali ke Daftar Update WIP</span>
            </button>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="text-xs font-bold text-zinc-400">Batch:</span>
              <span class="text-xs font-black text-zinc-900 bg-amber-50 text-amber-900 border border-amber-200 px-2.5 py-1 rounded-lg">{{ currentDetailBatch?.title }}</span>
              <span v-if="currentDetailBatch?.isActive" class="px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">🟢 ACUAN UTAMA STOK</span>
              <span v-else class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">📁 STATUS: ARSIP</span>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <button v-if="!currentDetailBatch?.isActive" @click="makeActiveUpdate(currentDetailBatch)" class="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-1 cursor-pointer">
              <span>✓ Jadikan Acuan Utama Stok</span>
            </button>
            <button @click="openSingleRollModal(null)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-all flex items-center gap-1 cursor-pointer">
              <span>+ Tambah Roll</span>
            </button>
            <button @click="exportBatchToExcel(currentDetailBatch)" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white transition-all flex items-center gap-1 cursor-pointer">
              <span>📥 Export Excel (.xlsx)</span>
            </button>
          </div>
        </div>

        <!-- Summary KPI Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
            <span class="text-[10.5px] font-bold text-zinc-500 uppercase">Total Roll</span>
            <div class="text-xl font-black text-zinc-900 mt-0.5">{{ currentBatchRolls.length }} Roll</div>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
            <span class="text-[10.5px] font-bold text-zinc-500 uppercase">Total Berat Aktual</span>
            <div class="text-xl font-black text-emerald-700 mt-0.5">{{ formatNumber(detailTotalBeratAktual) }} kg</div>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
            <span class="text-[10.5px] font-bold text-zinc-500 uppercase">Total Berat Teori</span>
            <div class="text-xl font-black text-zinc-700 mt-0.5">{{ formatNumber(detailTotalBeratTeori) }} kg</div>
          </div>
          <div class="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-xs">
            <span class="text-[10.5px] font-bold text-zinc-500 uppercase">Selisih Aktual - Teori</span>
            <div :class="['text-xl font-black mt-0.5', detailSelisihKg >= 0 ? 'text-amber-700' : 'text-red-700']">
              {{ detailSelisihKg >= 0 ? '+' : '' }}{{ formatNumber(detailSelisihKg) }} kg
            </div>
          </div>
        </div>

        <!-- Filter Toolbar -->
        <div class="bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-2.5">
          <div class="flex items-center gap-2 flex-1 min-w-[200px] max-w-sm">
            <div class="relative w-full">
              <input v-model="searchRollTerm" type="text" placeholder="Cari No Lot, SPK, Formula, Lokasi..." class="w-full pl-8 pr-6 py-1.5 text-xs border border-zinc-300 rounded-lg focus:ring-1 focus:ring-amber-500 outline-none bg-zinc-50 font-medium" />
              <span class="absolute left-2.5 top-2 text-xs text-zinc-400">🔍</span>
              <button v-if="searchRollTerm" @click="searchRollTerm = ''" class="absolute right-2.5 top-1.5 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>
          </div>

          <div class="flex items-center gap-2 flex-wrap text-xs">
            <select v-model="filterJenis" class="px-2 py-1 border border-zinc-300 rounded-lg bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
              <option value="">Semua Jenis</option>
              <option v-for="j in availableJenisList" :key="j" :value="j">{{ j }}</option>
            </select>
            <select v-model="filterFormula" class="px-2 py-1 border border-zinc-300 rounded-lg bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
              <option value="">Semua Formula</option>
              <option v-for="f in availableFormulaList" :key="f" :value="f">{{ f }}</option>
            </select>
            <select v-model="filterAging" class="px-2 py-1 border border-zinc-300 rounded-lg bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
              <option value="">Semua Kesiapan Aging</option>
              <option value="READY">✅ Siap Pakai / Ready</option>
              <option value="AGING">⏳ Sedang Proses Aging</option>
            </select>
            <select v-model="sortRollBy" class="px-2 py-1 border border-zinc-300 rounded-lg bg-zinc-50 font-bold text-zinc-700 outline-none cursor-pointer">
              <option value="default">Urutan Bawaan</option>
              <option value="aging_first">⏳ Sedang Aging Dulu</option>
              <option value="fifo_oldest">📦 Umur Stok Terlama (FIFO)</option>
              <option value="lot_asc">No Lot (A-Z)</option>
              <option value="lot_desc">No Lot (Z-A)</option>
              <option value="weight_desc">Berat Aktual (Terberat)</option>
              <option value="weight_asc">Berat Aktual (Teringan)</option>
              <option value="thick_asc">Ketebalan (Tipis ke Tebal)</option>
            </select>
            <button v-if="searchRollTerm || filterJenis || filterFormula || filterAging || sortRollBy !== 'default'" @click="resetRollFilters" class="px-2 py-1 rounded-lg text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 cursor-pointer">
              Reset Filter
            </button>
          </div>
        </div>

        <!-- Table Rolls -->
        <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto max-h-[650px] overflow-y-auto">
            <table class="w-full text-left border-collapse text-xs">
              <thead class="bg-zinc-100 text-zinc-800 font-mono text-[11px] border-b border-zinc-300 sticky top-0 z-10 shadow-xs">
                <tr>
                  <th class="py-2.5 px-2 text-center w-10">#</th>
                  <th class="py-2.5 px-2.5">No Lot</th>
                  <th class="py-2.5 px-2.5">No SPK</th>
                  <th class="py-2.5 px-2 text-center">Jenis</th>
                  <th class="py-2.5 px-2 text-center">Formula</th>
                  <th class="py-2.5 px-2 text-right">Dimensi (MC x W x L)</th>
                  <th class="py-2.5 px-2.5 text-right">Berat Aktual</th>
                  <th class="py-2.5 px-2.5 text-center">Lokasi & Posisi</th>
                  <th class="py-2.5 px-2.5 text-center">Tgl Masuk (FIFO)</th>
                  <th class="py-2.5 px-2.5 text-center">Kesiapan & Aging Countdown</th>
                  <th class="py-2.5 px-3">Keterangan</th>
                  <th class="py-2.5 px-2 text-center w-20">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 font-mono text-xs">
                <tr v-for="(roll, rIdx) in paginatedRolls" :key="roll.id || roll.uuid" class="hover:bg-amber-50/40 transition-colors">
                  <td class="py-2 px-2 text-center text-zinc-400 font-bold font-sans">{{ (currentRollPage - 1) * rollPageSize + rIdx + 1 }}</td>
                  <td class="py-2 px-2.5 font-black text-zinc-900">
                    <span class="px-1.5 py-0.5 rounded bg-zinc-100 border border-zinc-200">{{ roll.lot }}</span>
                  </td>
                  <td class="py-2 px-2.5 text-zinc-700 font-semibold">{{ roll.spk || '—' }}</td>
                  <td class="py-2 px-2 text-center font-bold text-zinc-800">{{ roll.jenis }}</td>
                  <td class="py-2 px-2 text-center font-bold text-red-600">{{ roll.kodeFormula }}</td>
                  <td class="py-2 px-2 text-right font-medium">
                    <span class="font-bold text-zinc-800">{{ roll.thickness }}μ</span> × {{ roll.width }}mm = {{ roll.length }}m
                  </td>
                  <td class="py-2 px-2.5 text-right font-black text-emerald-800">
                    {{ formatNumber(roll.beratAktual) }} <span class="text-[10px] text-zinc-400 font-normal">kg</span>
                  </td>
                  <td class="py-2 px-2.5 text-center font-sans font-bold">
                    <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 text-[10px]">
                      📍 {{ roll.lokasiAktif || 'STAGING' }} - {{ roll.posisiAktif || 'BAWAH' }}
                    </span>
                  </td>
                  <td class="py-2 px-2.5 text-center font-sans">
                    <div class="flex flex-col items-center gap-0.5">
                      <span class="font-bold text-zinc-800 text-[11px]">{{ roll.tanggalMasukFormatted || formatExcelDate(roll.tanggalMasukStokRaw) }}</span>
                      <span v-if="getRollStockAge(roll) !== null" class="px-1.5 py-0.2 rounded bg-zinc-100 text-zinc-600 border border-zinc-200 text-[9px] font-mono">
                        {{ getRollStockAge(roll) }} Hari di Gudang
                      </span>
                    </div>
                  </td>
                  <td class="py-2 px-2.5 text-center font-sans">
                    <div v-if="getRollAgingInfo(roll).isAging" class="flex flex-col items-center gap-1">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        ⏳ {{ getRollAgingInfo(roll).remainingFormatted }}
                      </span>
                      <div class="w-24 bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                        <div class="bg-amber-500 h-1.5 rounded-full transition-all" :style="{ width: `${getRollAgingInfo(roll).progressPercent}%` }"></div>
                      </div>
                      <span class="text-[9px] text-zinc-500 font-mono">Target: {{ getRollAgingInfo(roll).targetDateFormatted }}</span>
                    </div>
                    <div v-else class="flex items-center justify-center">
                      <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                        ✅ Siap Pakai
                      </span>
                    </div>
                  </td>
                  <td class="py-2 px-3 text-zinc-600 text-[11px]">
                    <span v-if="roll.keterangan" class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 border border-zinc-200 font-semibold">
                      {{ roll.keterangan }}
                    </span>
                    <span v-else class="text-zinc-300">—</span>
                  </td>
                  <td class="py-2 px-2 text-center font-sans">
                    <div class="flex items-center justify-center gap-1">
                      <button @click="openSingleRollModal(roll)" class="p-1 rounded text-zinc-500 hover:text-amber-700 hover:bg-amber-50 cursor-pointer" title="Edit Roll">✏️</button>
                      <button @click="handleDeleteRoll(roll)" class="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 cursor-pointer" title="Hapus Roll">✕</button>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredRolls.length === 0">
                  <td colspan="12" class="py-12 text-center text-zinc-400 font-sans">Tidak ada baris roll yang cocok dengan kriteria pencarian / filter.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="p-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
            <span class="text-zinc-500 text-[11px]">Menampilkan <strong>{{ rollPaginationInfo.from }}</strong> - <strong>{{ rollPaginationInfo.to }}</strong> dari <strong>{{ filteredRolls.length }}</strong> roll</span>
            <div class="flex items-center gap-1">
              <button :disabled="currentRollPage <= 1" @click="currentRollPage--" class="px-2 py-1 rounded border border-zinc-300 bg-white disabled:opacity-40 font-bold">◀ Prev</button>
              <span class="px-2 text-zinc-600 font-bold font-mono">{{ currentRollPage }} / {{ rollTotalPages }}</span>
              <button :disabled="currentRollPage >= rollTotalPages" @click="currentRollPage++" class="px-2 py-1 rounded border border-zinc-300 bg-white disabled:opacity-40 font-bold">Next ▶</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TAB 2: WIP LOCATION (DENAH & POSISI RAK VISUAL)                   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="activeWipTab === 'location'" class="space-y-4 animate-fade-in">
      
      <!-- Location Header Bar & Expand/Collapse Controls -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 class="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
            <span>🗺️</span> Denah Hierarki Rak Penyimpanan Roll Jumbo WIP
          </h2>
          <p class="text-xs text-zinc-500 mt-0.5">
            Struktur hierarki: <strong>Blok Grup</strong> ➔ <strong>Unit Rak</strong> ➔ <strong>Posisi Tingkat</strong> ➔ <strong>Daftar Roll</strong>. (Default tertutup, klik baris untuk membuka).
          </p>
        </div>

        <!-- Controls: Expand All / Collapse All & Search -->
        <div class="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            @click="expandAllHierarchy"
            class="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span>➕</span> Buka Semua
          </button>
          <button
            @click="collapseAllHierarchy"
            class="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
          >
            <span>➖</span> Tutup Semua
          </button>

          <div class="relative flex-1 sm:w-60">
            <input
              v-model="searchRackTerm"
              type="text"
              placeholder="Cari blok / rak / no lot..."
              class="w-full pl-8 pr-6 py-1.5 text-xs border border-zinc-300 rounded-xl bg-zinc-50 outline-none focus:ring-1 focus:ring-amber-500"
            />
            <span class="absolute left-2.5 top-2 text-xs text-zinc-400">🔍</span>
          </div>
        </div>
      </div>

      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <!-- LEVEL 1: BLOK GRUP ACCORDION (BLOK A, B, C, D, G, H, STAGING)      -->
      <!-- ═══════════════════════════════════════════════════════════════════ -->
      <div class="space-y-3">
        <div
          v-for="block in filteredHierarchyBlocks"
          :key="block.key"
          class="bg-white rounded-2xl border-2 border-zinc-200 shadow-xs overflow-hidden transition-all"
        >
          <!-- LEVEL 1 HEADER: BLOK GRUP (Click to Toggle) -->
          <div
            @click="toggleBlock(block.key)"
            class="p-4 bg-gradient-to-r from-zinc-50 to-white hover:from-amber-50/50 hover:to-white transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">
                {{ block.isStaging ? '🚚' : '🏢' }}
              </span>
              <div>
                <h3 class="text-base font-black text-zinc-950 tracking-tight flex items-center gap-2">
                  <span>{{ block.title }}</span>
                  <span v-if="block.isStaging" class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                    Kapasitas Dinamis / Bebas
                  </span>
                </h3>
                <p class="text-xs text-zinc-500 font-mono mt-0.5">
                  <span v-if="!block.isStaging">{{ block.racks.length }} Unit Rak</span>
                  <span v-else>Area Transit, Lantai & Gudang</span>
                  • Total Terisi: <strong class="text-zinc-900">{{ block.totalRolls }} Roll</strong> ({{ formatNumber(block.totalKg) }} kg)
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span
                :class="[
                  'px-3 py-1 rounded-full text-xs font-black',
                  block.totalRolls > 0 ? 'bg-amber-100 text-amber-950 border border-amber-300' : 'bg-zinc-100 text-zinc-500 border border-zinc-200'
                ]"
              >
                {{ block.totalRolls }} Roll
              </span>
              <span class="text-zinc-400 font-bold text-sm transform transition-transform duration-200" :class="{ 'rotate-90': expandedBlocks[block.key] }">
                ▶
              </span>
            </div>
          </div>

          <!-- LEVEL 2 CONTAINER: UNIT RAK (Inside Block) -->
          <div v-show="expandedBlocks[block.key]" class="p-4 pt-1 border-t border-zinc-100 space-y-3 bg-zinc-50/40 animate-fade-in">
            
            <div
              v-for="rack in block.racks"
              :key="rack.rackName"
              class="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden"
            >
              <!-- LEVEL 2 HEADER: UNIT RAK (Click to Toggle) -->
              <div
                @click="toggleRack(rack.rackName)"
                class="p-3.5 hover:bg-amber-50/40 transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-3 select-none"
              >
                <div class="flex items-center gap-2.5">
                  <span class="text-base">📍</span>
                  <div>
                    <h4 class="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-2">
                      <span>{{ rack.title }}</span>
                      <span v-if="!rack.isStaging" class="text-[10px] text-zinc-500 font-mono font-normal">
                        (Kapasitas Acuan: 36 Roll / 32.83 Meter)
                      </span>
                    </h4>
                    
                    <!-- Rack Subtitle Metrics -->
                    <div v-if="!rack.isStaging" class="flex flex-wrap items-center gap-2 text-[11px] text-zinc-600 font-mono mt-0.5">
                      <span>Terisi: <strong class="text-zinc-900">{{ rack.rolls.length }} Roll</strong> ({{ formatNumber(rack.totalKg) }} kg)</span>
                      <span>•</span>
                      <span>Panjang Terpakai: <strong class="text-zinc-900">{{ rack.linearAnalysis.totalUsedSpanMeter }} m</strong> / 32.83 m ({{ rack.linearAnalysis.totalOccupancyPercent }}%)</span>
                      <span>•</span>
                      <div class="flex items-center gap-1.5">
                        <span class="text-emerald-700 font-bold">Sisa: {{ rack.linearAnalysis.totalRemainingSpanMeter }} m</span>
                        <button
                          @click.stop="openCapacitySimModal(rack.title, rack.linearAnalysis.totalRemainingSpanMeter * 100, rack.linearAnalysis.totalRemainingSpanMeter, rack.linearAnalysis.totalOccupancyPercent, true)"
                          class="px-2 py-0.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black transition-colors cursor-pointer border border-emerald-300 flex items-center gap-1 shadow-2xs"
                          title="Lihat rincian simulasi muatan sisa rak per micron"
                        >
                          <span>💡 Simulasi Micron</span>
                        </button>
                      </div>
                    </div>
                    <div v-else class="text-[11px] text-zinc-600 font-mono mt-0.5">
                      Total: <strong class="text-zinc-900">{{ rack.rolls.length }} Roll</strong> ({{ formatNumber(rack.totalKg) }} kg) di {{ rack.positions.length }} Posisi
                    </div>
                  </div>
                </div>

                <div class="flex items-center gap-2.5">
                  <span
                    v-if="!rack.isStaging"
                    :class="[
                      'px-2.5 py-0.5 rounded-md text-[10.5px] font-black',
                      rack.linearAnalysis.totalOccupancyPercent >= 100 ? 'bg-red-100 text-red-900 border border-red-300' :
                      rack.linearAnalysis.totalOccupancyPercent >= 75 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    ]"
                  >
                    {{ rack.linearAnalysis.totalOccupancyPercent }}% Penuh
                  </span>
                  <span class="text-zinc-400 font-bold text-xs transform transition-transform duration-200" :class="{ 'rotate-90': expandedRacks[rack.rackName] }">
                    ▶
                  </span>
                </div>
              </div>

              <!-- LEVEL 3 CONTAINER: POSISI TINGKAT (Inside Rack) -->
              <div v-show="expandedRacks[rack.rackName]" class="p-3.5 pt-1 border-t border-zinc-100 space-y-2.5 bg-zinc-50/70 animate-fade-in">
                
                <div
                  v-for="pos in rack.positions"
                  :key="pos.key || pos.name"
                  class="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden"
                >
                  <!-- LEVEL 3 HEADER: POSISI TINGKAT (Click to Toggle) -->
                  <div
                    @click="toggleLevel(`${rack.rackName}_${pos.key || pos.name}`)"
                    class="p-3 hover:bg-amber-50/50 transition-colors cursor-pointer flex flex-wrap items-center justify-between gap-2 select-none"
                  >
                    <div class="flex items-center gap-2">
                      <span class="text-sm">
                        {{ pos.key === 'ATAS' ? '🔼' : pos.key === 'TENGAH' ? '⏸️' : pos.key === 'BAWAH' ? '🔽' : '📦' }}
                      </span>
                      <div>
                        <h5 class="text-xs font-black text-zinc-900 uppercase tracking-wide">
                          {{ pos.name }}
                        </h5>
                        <p v-if="!rack.isStaging" class="text-[10px] text-zinc-500 font-mono">
                          Maks {{ pos.maxRolls }} Roll ({{ pos.maxSpanM }} m) • Terisi: <strong class="text-zinc-900">{{ pos.analysis.rollsCount }} Roll</strong> ({{ pos.analysis.usedSpanMeter }} m) • <strong class="text-emerald-700">Sisa: {{ pos.analysis.remainingSpanMeter }} m</strong>
                        </p>
                        <p v-else class="text-[10px] text-zinc-500 font-mono">
                          Terisi: <strong class="text-zinc-900">{{ pos.rolls.length }} Roll</strong> ({{ formatNumber(pos.totalKg) }} kg) • Kapasitas Bebas
                        </p>
                      </div>
                    </div>

                    <div class="flex items-center gap-2">
                      <!-- Badge Sisa / Roll Count -->
                      <span
                        v-if="!rack.isStaging"
                        :class="[
                          'px-2 py-0.5 rounded text-[10px] font-black',
                          pos.analysis.occupancyPercent >= 100 ? 'bg-red-100 text-red-900' :
                          pos.analysis.occupancyPercent >= 75 ? 'bg-amber-100 text-amber-900' :
                          'bg-emerald-100 text-emerald-900'
                        ]"
                      >
                        {{ pos.analysis.rollsCount }}/{{ pos.maxRolls }} Roll ({{ pos.analysis.occupancyPercent }}%)
                      </span>
                      <span v-else class="px-2 py-0.5 rounded text-[10px] font-black bg-blue-100 text-blue-900">
                        {{ pos.rolls.length }} Roll
                      </span>

                      <span class="text-zinc-400 font-bold text-xs transform transition-transform duration-200" :class="{ 'rotate-90': expandedLevels[`${rack.rackName}_${pos.key || pos.name}`] }">
                        ▶
                      </span>
                    </div>
                  </div>

                  <!-- LEVEL 4 CONTAINER: DAFTAR ROLL DI TINGKAT INI -->
                  <div v-show="expandedLevels[`${rack.rackName}_${pos.key || pos.name}`]" class="p-3.5 border-t border-zinc-100 space-y-3 bg-zinc-50/50 animate-fade-in">
                    
                    <!-- Smart Space Estimator for Standard Rack Levels -->
                    <div v-if="!rack.isStaging" class="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div class="flex items-center gap-2">
                        <span class="text-base">💡</span>
                        <div>
                          <div class="flex items-center gap-1.5">
                            <span class="font-bold text-emerald-950 text-xs">Sisa Ruang Kosong:</span>
                            <span class="font-mono font-black text-emerald-800 text-xs">{{ pos.analysis.remainingSpanMeter }} Meter</span>
                            <span class="text-[10px] text-zinc-500 font-mono">({{ 100 - pos.analysis.occupancyPercent }}% Bebas)</span>
                          </div>
                        </div>
                      </div>

                      <!-- Dynamic Micron Chips according to master standard lengths -->
                      <div class="flex flex-wrap items-center gap-1 text-[10px]">
                        <span class="text-zinc-600 font-bold text-[10px]">Dapat Muat:</span>
                        <div
                          v-for="est in (pos.analysis.estimatesByThicknessJumbo || []).slice(0, 5)"
                          :key="est.thickness"
                          class="px-1.5 py-0.5 rounded bg-white border border-emerald-300 font-mono text-[10px] font-bold text-emerald-900 shadow-2xs cursor-pointer hover:border-emerald-500 transition-colors"
                          :title="`${est.thickness} MC (Panjang Std: ${est.standardLengthFormatted} m, Ø: ${est.diameterCm} cm) -> Estimasi Muat: ~${est.rollsCanFit} Roll`"
                          @click="openCapacitySimModal(`${rack.title} - ${pos.name}`, pos.analysis.remainingSpanCm, pos.analysis.remainingSpanMeter, pos.analysis.occupancyPercent, true)"
                        >
                          <span class="text-emerald-700 font-black">+{{ est.rollsCanFit }}</span>
                          <span class="text-zinc-500 text-[9px]"> ({{ est.thickness }}u)</span>
                        </div>
                        <button
                          @click.stop="openCapacitySimModal(`${rack.title} - ${pos.name}`, pos.analysis.remainingSpanCm, pos.analysis.remainingSpanMeter, pos.analysis.occupancyPercent, true)"
                          class="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-colors cursor-pointer ml-1 shadow-2xs flex items-center gap-1"
                        >
                          <span>Semua Micron</span>
                          <span>↗</span>
                        </button>
                      </div>
                    </div>

                    <!-- Roll Cards Grid -->
                    <div
                      v-if="(!rack.isStaging && pos.analysis.rolls.length > 0) || (rack.isStaging && pos.rolls.length > 0)"
                      class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5"
                    >
                      <div
                        v-for="(roll, rIdx) in (!rack.isStaging ? pos.analysis.rolls : pos.rolls)"
                        :key="roll.id || roll.uuid || rIdx"
                        class="bg-white hover:bg-amber-50/40 rounded-xl border border-zinc-200 hover:border-amber-400 p-3 space-y-2 transition-all shadow-2xs relative"
                      >
                        <!-- Roll Header -->
                        <div class="flex items-center justify-between">
                          <div class="flex items-center gap-1.5">
                            <span class="w-5 h-5 rounded-md bg-zinc-900 text-white font-mono font-bold text-[10px] flex items-center justify-center">
                              {{ rIdx + 1 }}
                            </span>
                            <span class="font-mono font-black text-xs text-zinc-950">
                              {{ formatLotVisual(roll.lot) }}
                            </span>
                          </div>

                          <!-- Diameter Badge -->
                          <span class="px-1.5 py-0.5 rounded bg-blue-50 text-blue-900 border border-blue-200 font-mono font-bold text-[10px]">
                            Ø {{ roll.diameterCm }} cm
                          </span>
                        </div>

                        <!-- Spec Details -->
                        <div class="p-2 rounded-lg bg-zinc-50 border border-zinc-100 text-xs space-y-0.5 text-zinc-600">
                          <div class="flex items-center justify-between">
                            <span>Formula:</span>
                            <span class="font-bold text-zinc-900">{{ roll.jenis }} <strong class="text-red-600">{{ roll.kodeFormula }}</strong></span>
                          </div>
                          <div class="flex items-center justify-between">
                            <span>Dimensi:</span>
                            <span class="font-mono font-bold text-zinc-800">{{ roll.thickness }}μ × {{ roll.width }}mm = {{ roll.length }}m</span>
                          </div>
                          <div class="flex items-center justify-between pt-0.5 border-t border-zinc-200/50">
                            <span>Berat Aktual:</span>
                            <span class="font-mono font-black text-emerald-800">{{ formatNumber(roll.beratAktual) }} kg</span>
                          </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex items-center justify-between pt-0.5">
                          <button
                            @click="openMoveLocationModal(roll)"
                            class="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <span>🚚 Pindah Rak</span>
                          </button>

                          <div class="flex items-center gap-1">
                            <button
                              @click="openRollDetailModal(roll)"
                              class="text-zinc-500 hover:text-blue-700 text-xs font-bold cursor-pointer"
                              title="Lihat Detail"
                            >
                              👁️
                            </button>
                            <button
                              @click="openSingleRollModal(roll)"
                              class="text-zinc-400 hover:text-zinc-700 text-xs font-bold cursor-pointer"
                              title="Edit Data"
                            >
                              ✏️
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State for Position -->
                    <div
                      v-else
                      class="border border-dashed border-zinc-200 rounded-xl p-4 text-center text-zinc-400 text-xs flex flex-col items-center justify-center min-h-[70px]"
                    >
                      <span class="text-base opacity-40 mb-0.5">📦</span>
                      <span class="font-semibold text-zinc-500">Posisi ini belum terisi roll WIP.</span>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: ESTIMASI KAPASITAS SISA RAK PER MICRON (STANDARD LENGTH)     -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showCapacitySimModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-zinc-100 pb-3.5">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
                  Simulasi Daya Tampung Sisa Rak
                </span>
                <span class="text-xs font-bold text-zinc-400">•</span>
                <span class="text-xs font-semibold text-zinc-500 font-mono">{{ 100 - capacitySimData.occupancyPercent }}% Sisa Kapasitas Bebas</span>
              </div>
              <h3 class="text-lg font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
                <span>📊</span> {{ capacitySimData.title }}
              </h3>
              <p class="text-xs text-zinc-500 mt-0.5">
                Sisa Panjang Rel Kosong: <strong class="text-emerald-700 font-mono text-sm">{{ capacitySimData.remainingSpanMeter }} Meter</strong> ({{ capacitySimData.remainingSpanCm }} cm)
              </p>
            </div>
            <button @click="showCapacitySimModal = false" class="p-1 text-zinc-400 hover:text-zinc-700 font-bold text-lg cursor-pointer">✕</button>
          </div>

          <!-- Switcher Mode: Jumbo Roll vs Finish Goods -->
          <div class="flex items-center justify-between bg-zinc-100 p-1.5 rounded-2xl">
            <div class="text-xs font-bold text-zinc-700 pl-2">Acuan Tipe Produk:</div>
            <div class="flex items-center gap-1">
              <button
                @click="capacitySimData.isJumboMode = true"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                  capacitySimData.isJumboMode ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                ]"
              >
                <span>📦 Jumbo Roll</span>
                <span class="text-[10px] px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded font-mono">WIP Jumbo</span>
              </button>
              <button
                @click="capacitySimData.isJumboMode = false"
                :class="[
                  'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                  !capacitySimData.isJumboMode ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-900'
                ]"
              >
                <span>🏷️ Finish Goods (FG)</span>
                <span class="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-700 rounded font-mono">Roll FG</span>
              </button>
            </div>
          </div>

          <!-- Simulation Table per Micron -->
          <div class="border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
            <table class="w-full text-xs">
              <thead class="bg-zinc-100 border-b border-zinc-200 text-zinc-600 font-bold">
                <tr>
                  <th class="px-3.5 py-2.5 text-left">Thickness (Micron)</th>
                  <th class="px-3 py-2.5 text-left">Panjang Standard</th>
                  <th class="px-3 py-2.5 text-center">Diameter Roll (Ø)</th>
                  <th class="px-3.5 py-2.5 text-center bg-emerald-50 text-emerald-900">Dapat Muat</th>
                  <th class="px-3 py-2.5 text-right">Sisa Rel Setelah Terisi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100">
                <tr
                  v-for="sim in capacitySimList"
                  :key="sim.thickness"
                  class="hover:bg-emerald-50/30 transition-colors"
                >
                  <td class="px-3.5 py-2.5">
                    <span class="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-mono font-black text-xs border border-sky-200">
                      {{ sim.thickness }} MC
                    </span>
                  </td>
                  <td class="px-3 py-2.5 font-mono font-bold text-zinc-700">
                    {{ sim.standardLengthFormatted }} Meter
                  </td>
                  <td class="px-3 py-2.5 text-center font-mono text-zinc-600">
                    Ø {{ sim.diameterCm }} cm <span class="text-[10px] text-zinc-400">({{ sim.diameterMeter }}m)</span>
                  </td>
                  <td class="px-3.5 py-2.5 text-center bg-emerald-50/50">
                    <div class="inline-flex flex-col items-center">
                      <span
                        :class="[
                          'inline-flex items-center gap-1 px-3 py-1 rounded-lg font-mono font-black text-xs border shadow-2xs',
                          sim.rollsCanFit > 0
                            ? 'bg-emerald-600 text-white border-emerald-700'
                            : 'bg-zinc-100 text-zinc-400 border-zinc-200'
                        ]"
                      >
                        <span>{{ sim.rollsCanFit > 0 ? `+${sim.rollsCanFit} Roll` : '0 Roll (Penuh)' }}</span>
                      </span>
                      <span v-if="!capacitySimData.isJumboMode && sim.rollsCanFit > 0" class="text-[9.5px] font-mono text-emerald-800 font-bold mt-0.5">
                        ({{ sim.asCanFit }} AS × 2 FG)
                      </span>
                    </div>
                  </td>
                  <td class="px-3 py-2.5 text-right font-mono text-zinc-500">
                    {{ sim.spaceLeftAfterMeter }} m
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Calculation Rationale Note -->
          <div class="bg-amber-50/70 border border-amber-200 rounded-2xl p-3 text-[11px] text-amber-950 flex items-start gap-2">
            <span class="text-base leading-none">💡</span>
            <div>
              <p class="font-bold">Kalkulasi Otomatis Berdasarkan Ketebalan, Diameter & Kapasitas per AS:</p>
              <p class="text-amber-900 mt-0.5">
                • <strong>Roll Jumbo:</strong> 1 AS rak menampung 1 Roll Jumbo.<br/>
                • <strong>Roll FG di Rak Jumbo:</strong> 1 AS rak dapat menampung <strong>2 Roll FG</strong> bersebelahan (<code class="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold">Total Roll = Jumlah AS × 2</code>).<br/>
                • <strong>Formula Diameter:</strong> <code class="bg-amber-100 px-1 py-0.2 rounded font-mono font-bold">OD = √(Core² + (4 × Panjang × Tebal) / π)</code>.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end pt-2 border-t border-zinc-100">
            <button
              @click="showCapacitySimModal = false"
              class="px-5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white cursor-pointer transition-all"
            >
              Tutup Simulasi
            </button>
          </div>

        </div>
      </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: INTERACTIVE 3-TIER RACK SLOTS & SMART SPACE ESTIMATOR      -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showRackSlotsModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-5xl w-full p-5 sm:p-6 space-y-5 max-h-[94vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-zinc-100 pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                  Denah Visual & Estimasi Sisa Ruang
                </span>
                <span class="text-xs font-bold text-zinc-400">•</span>
                <span class="text-xs font-semibold text-zinc-500">Stok WIP Aktif</span>
              </div>
              <h3 class="text-xl font-black text-zinc-900 tracking-tight mt-1 flex items-center gap-2">
                <span>🏢</span> {{ selectedRack?.nama }}
              </h3>
              <p class="text-xs text-zinc-500 mt-0.5">
                Kapasitas Acuan: <strong>{{ selectedRack?.kapasitas }} Roll</strong> | Terisi: <strong>{{ selectedRack?.rolls.length }} Roll</strong> ({{ formatNumber(selectedRack?.totalKg) }} kg)
                • Panjang Rel: <strong>{{ selectedRack?.linearAnalysis?.totalUsedSpanMeter }} m / {{ selectedRack?.linearAnalysis?.totalMaxSpanMeter }} m</strong> (Sisa: <strong class="text-emerald-700">{{ selectedRack?.linearAnalysis?.totalRemainingSpanMeter }} m</strong>)
              </p>
            </div>
            <button @click="showRackSlotsModal = false" class="p-1 text-zinc-400 hover:text-zinc-700 font-bold text-lg cursor-pointer">✕</button>
          </div>

          <!-- 3-TIER SHELVES VISUALIZATION (ATAS -> TENGAH -> BAWAH) -->
          <div class="space-y-6">
            
            <!-- LOOP OVER 3 LEVELS: ATAS, TENGAH, BAWAH -->
            <div
              v-for="levelKey in ['ATAS', 'TENGAH', 'BAWAH']"
              :key="levelKey"
              class="border-2 border-zinc-200 rounded-3xl p-4 sm:p-5 bg-zinc-50/50 space-y-3.5 relative overflow-hidden"
            >
              <!-- Level Header & Linear Bar -->
              <div class="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/80 pb-3">
                <div class="flex items-center gap-2">
                  <span class="text-lg">
                    {{ levelKey === 'ATAS' ? '🔼' : levelKey === 'TENGAH' ? '⏸️' : '🔽' }}
                  </span>
                  <div>
                    <h4 class="text-sm font-black text-zinc-900 uppercase tracking-wide">
                      TINGKAT {{ levelKey }}
                      <span class="text-xs font-normal text-zinc-500 lowercase ml-1">
                        (maks {{ levelKey === 'ATAS' ? '9' : levelKey === 'TENGAH' ? '12' : '15' }} roll acuan / {{ selectedRack?.linearAnalysis?.levels[levelKey]?.maxSpanMeter }} meter)
                      </span>
                    </h4>
                  </div>
                </div>

                <div class="flex items-center gap-3">
                  <span class="text-xs font-mono font-bold text-zinc-700">
                    Terpakai: <strong class="text-zinc-900">{{ selectedRack?.linearAnalysis?.levels[levelKey]?.usedSpanMeter }} m</strong> / {{ selectedRack?.linearAnalysis?.levels[levelKey]?.maxSpanMeter }} m
                  </span>
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-black',
                      selectedRack?.linearAnalysis?.levels[levelKey]?.occupancyPercent >= 100 ? 'bg-red-100 text-red-900 border border-red-300' :
                      selectedRack?.linearAnalysis?.levels[levelKey]?.occupancyPercent >= 75 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                      'bg-emerald-100 text-emerald-900 border border-emerald-300'
                    ]"
                  >
                    {{ selectedRack?.linearAnalysis?.levels[levelKey]?.occupancyPercent }}% Penuh
                  </span>
                </div>
              </div>

              <!-- Smart Space Estimator Recommendation Box -->
              <div class="bg-gradient-to-r from-emerald-50/90 to-teal-50/90 border border-emerald-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2">
                  <span class="text-base">💡</span>
                  <div>
                    <span class="font-bold text-emerald-950">Sisa Ruang Kosong Tingkat {{ levelKey }}:</span>
                    <span class="font-mono font-black text-emerald-800 text-sm ml-1.5">{{ selectedRack?.linearAnalysis?.levels[levelKey]?.remainingSpanMeter }} Meter</span>
                  </div>
                </div>

                <!-- Estimasi Tambahan Badges -->
                <div class="flex flex-wrap items-center gap-1.5 text-[10.5px]">
                  <span class="text-zinc-600 font-medium">Bisa memuat tambahan:</span>
                  <span class="px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-bold text-emerald-900 shadow-2xs">
                    ~{{ selectedRack?.linearAnalysis?.levels[levelKey]?.estimates.superJumbo_18k }} Super Jumbo (18rb m)
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-bold text-emerald-900 shadow-2xs">
                    ~{{ selectedRack?.linearAnalysis?.levels[levelKey]?.estimates.standar_8k }} Standar (8.3rb m)
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-bold text-emerald-900 shadow-2xs">
                    ~{{ selectedRack?.linearAnalysis?.levels[levelKey]?.estimates.ramping_6k }} Ramping (6.3rb m)
                  </span>
                  <span class="px-2 py-0.5 rounded-md bg-white border border-emerald-300 font-bold text-emerald-900 shadow-2xs">
                    ~{{ selectedRack?.linearAnalysis?.levels[levelKey]?.estimates.sisa_1k5 }} Sisa (1.5rb m)
                  </span>
                </div>
              </div>

              <!-- Roll Grid for This Level -->
              <div v-if="selectedRack?.linearAnalysis?.levels[levelKey]?.rolls.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div
                  v-for="(roll, sIdx) in selectedRack?.linearAnalysis?.levels[levelKey]?.rolls"
                  :key="roll.id || roll.uuid || sIdx"
                  class="bg-white hover:bg-amber-50/40 rounded-2xl border border-zinc-200 hover:border-amber-400 p-3.5 space-y-2.5 transition-all shadow-2xs relative"
                >
                  <!-- Roll Card Header -->
                  <div class="flex items-center justify-between">
                    <div class="flex items-center gap-1.5">
                      <span class="w-6 h-6 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs flex items-center justify-center">
                        {{ sIdx + 1 }}
                      </span>
                      <span class="font-mono font-black text-xs text-zinc-900">
                        {{ formatLotVisual(roll.lot) }}
                      </span>
                    </div>

                    <!-- Diameter Badge -->
                    <span class="px-2 py-0.5 rounded-md bg-blue-50 text-blue-900 border border-blue-200 font-mono font-bold text-[10.5px]">
                      Ø {{ roll.diameterCm }} cm
                    </span>
                  </div>

                  <!-- Spec Details -->
                  <div class="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs space-y-1">
                    <div class="flex items-center justify-between text-zinc-600">
                      <span>Formula:</span>
                      <span class="font-bold text-zinc-900">{{ roll.jenis }} <strong class="text-red-600">{{ roll.kodeFormula }}</strong></span>
                    </div>
                    <div class="flex items-center justify-between text-zinc-600">
                      <span>Dimensi:</span>
                      <span class="font-mono font-bold text-zinc-800">{{ roll.thickness }}μ × {{ roll.width }}mm = {{ roll.length }}m</span>
                    </div>
                    <div class="flex items-center justify-between text-zinc-600 pt-0.5 border-t border-zinc-200/50">
                      <span>Berat Aktual:</span>
                      <span class="font-mono font-black text-emerald-800">{{ formatNumber(roll.beratAktual) }} kg</span>
                    </div>
                  </div>

                  <!-- Quick Action Buttons -->
                  <div class="flex items-center justify-between pt-1">
                    <button
                      @click="openMoveLocationModal(roll)"
                      class="px-2.5 py-1 rounded-xl text-[10.5px] font-bold bg-amber-100 hover:bg-amber-200 text-amber-950 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>🚚 Pindah Rak / Tingkat</span>
                    </button>

                    <button
                      @click="openSingleRollModal(roll)"
                      class="text-zinc-400 hover:text-zinc-700 text-xs font-bold"
                    >
                      ✏️ Edit
                    </button>
                  </div>
                </div>
              </div>

              <!-- Empty State for Level -->
              <div
                v-else
                class="border-2 border-dashed border-zinc-200 rounded-2xl p-6 text-center text-zinc-400 text-xs flex flex-col items-center justify-center min-h-[100px]"
              >
                <span class="text-xl opacity-40 mb-1">📦</span>
                <span class="font-bold text-zinc-500">Tingkat {{ levelKey }} Belum Terisi Roll</span>
                <span class="text-[10.5px] text-zinc-400 mt-0.5">Sisa ruang penuh {{ selectedRack?.linearAnalysis?.levels[levelKey]?.maxSpanMeter }} meter siap digunakan</span>
              </div>
            </div>

          </div>

          <!-- Footer -->
          <div class="flex items-center justify-end pt-3 border-t border-zinc-100">
            <button @click="showRackSlotsModal = false" class="px-6 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white cursor-pointer transition-all">
              Tutup Denah Rak
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: PINDAH RAK / LOKASI ROLL                                   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showMoveLocationModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-md w-full p-5 sm:p-6 space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 class="text-base font-black text-zinc-900 tracking-tight flex items-center gap-1.5">
              <span>🚚</span> Pindahkan Roll ke Rak Lain
            </h3>
            <button @click="showMoveLocationModal = false" class="p-1 text-zinc-400 hover:text-zinc-700 font-bold text-base cursor-pointer">✕</button>
          </div>

          <div class="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs space-y-1">
            <div class="font-bold text-amber-950">No. Lot: <span class="font-mono">{{ movingRoll?.lot }}</span></div>
            <div class="text-amber-900 text-[11px]">Lokasi Saat Ini: <strong>{{ movingRoll?.lokasiAktif }}</strong> (Posisi: {{ movingRoll?.posisiAktif || 'R-1' }})</div>
          </div>

          <div class="space-y-3 text-xs font-sans">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Pilih Rak Tujuan</label>
              <select v-model="moveTargetLocation" class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-bold outline-none">
                <option v-for="loc in availableWipRacks" :key="loc.nama" :value="loc.nama">
                  {{ loc.nama }} ({{ loc.alias ? `Alias: ${loc.alias}` : '' }})
                </option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-zinc-700 mb-1">Posisi / Slot di Rak Tujuan</label>
              <input
                v-model="moveTargetPosition"
                type="text"
                placeholder="Mis: R-1, R-2, Posisi 1"
                class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-mono font-bold outline-none uppercase"
              />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button @click="showMoveLocationModal = false" class="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">Batal</button>
            <button @click="executeMoveLocation" class="px-5 py-1.5 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-xs cursor-pointer">Simpan Perpindahan</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: UPLOAD / IMPORT DATA WIP BARU                               -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-base font-black text-zinc-900 tracking-tight flex items-center gap-2">
                <span>📥</span> Upload / Import Data Stok WIP Harian
              </h3>
              <p class="text-xs text-zinc-500 mt-0.5">
                Setiap upload akan membentuk 1 Sesi Update baru dan dapat langsung dijadikan Acuan Utama Stok.
              </p>
            </div>
            <button @click="showImportModal = false" class="p-1 text-zinc-400 hover:text-zinc-700 font-bold text-base cursor-pointer">✕</button>
          </div>

          <!-- Import Metadata Settings -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200 text-xs">
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Nama / Judul Sesi Update</label>
              <input
                v-model="importTitle"
                type="text"
                placeholder="Contoh: Stok WIP 27 Agustus 2026 Shift 1"
                class="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-xl bg-white font-semibold outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Tanggal Stok</label>
              <input
                v-model="importTanggal"
                type="date"
                class="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-xl bg-white font-semibold outline-none"
              />
            </div>
            <div class="sm:col-span-2 pt-1 flex items-center gap-2">
              <input
                id="makeActiveCheckbox"
                v-model="importMakeActive"
                type="checkbox"
                class="w-4 h-4 text-emerald-600 rounded cursor-pointer"
              />
              <label for="makeActiveCheckbox" class="text-xs font-bold text-zinc-800 cursor-pointer">
                ✓ Langsung aktifkan batch ini sebagai <span class="text-emerald-700 font-black">Acuan Utama Stok Aktif</span> (Update lama jadi arsip)
              </label>
            </div>
          </div>

          <!-- Upload Modes Switcher (File vs Copas) -->
          <div class="flex items-center gap-2 border-b border-zinc-200 pb-2 text-xs font-bold">
            <button
              @click="importMode = 'file'"
              :class="['px-3 py-1.5 rounded-lg transition-colors cursor-pointer', importMode === 'file' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100']"
            >
              📁 Upload File Excel (.xlsx / .csv)
            </button>
            <button
              @click="importMode = 'copas'"
              :class="['px-3 py-1.5 rounded-lg transition-colors cursor-pointer', importMode === 'copas' ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-100']"
            >
              📋 Copas dari Excel (Tabel Text)
            </button>
          </div>

          <!-- Mode 1: File Dropzone -->
          <div v-if="importMode === 'file'" class="space-y-3">
            <div
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              @click="$refs.fileInputRef.click()"
              class="border-2 border-dashed border-zinc-300 hover:border-amber-500 bg-zinc-50 hover:bg-amber-50/30 rounded-2xl p-8 text-center cursor-pointer transition-all"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".xlsx, .xls, .csv"
                class="hidden"
                @change="handleFileChange"
              />
              <div class="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                📄
              </div>
              <p class="font-bold text-zinc-800 text-xs sm:text-sm">
                {{ uploadedFileName || 'Klik atau Tarik File Excel WIP (.xlsx / .csv) ke Sini' }}
              </p>
              <p class="text-[11px] text-zinc-400 mt-1">
                Mendukung normalisasi otomatis: Lokasi A1 / A2 otomatis dipetakan ke <strong>RAK A1A2</strong>.
              </p>
            </div>
          </div>

          <!-- Mode 2: Copas Excel Text Area -->
          <div v-else class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-zinc-700">Paste / Tempel baris tabel dari Excel:</span>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="handleWipPasteClipboard"
                  class="px-2.5 py-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-lg border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Ambil isi clipboard dan proses otomatis"
                >
                  <span>📋 Paste Clipboard</span>
                </button>
                <button
                  type="button"
                  @click="parseCopasTextNow"
                  class="px-2.5 py-1 text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-zinc-950 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs font-black"
                  title="Ekstrak data dari teks di bawah"
                >
                  <span>⚡ Ekstrak Data</span>
                </button>
                <button
                  v-if="copasText"
                  type="button"
                  @click="copasText = ''; parsedPreviewRolls = []"
                  class="px-2 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                  title="Hapus teks"
                >
                  <span>🗑️ Hapus</span>
                </button>
              </div>
            </div>
            <textarea
              v-model="copasText"
              rows="8"
              placeholder="Paste / Tempel baris tabel dari Excel ke sini (10 Kolom Tab-Separated)...&#10;Contoh Baris:&#10;L03280826A201 CPP L03 40 MC X 2100 MM = 12300 , 6 INCHI 0	06/VIII/SPK/2026	888	H4	BAWAH	0	46262	PROSES AGING	0,027553704	46263,54375"
              class="w-full p-3 text-xs border border-zinc-300 rounded-xl bg-zinc-50 font-mono outline-none focus:ring-1 focus:ring-amber-500"
            ></textarea>
            <p class="text-[10px] text-zinc-400">
              Format Kolom: <strong>CODE</strong> (No Lot + Deskripsi) | <strong>No. SPK</strong> | <strong>Berat Aktual</strong> | <strong>Lokasi</strong> | <strong>Posisi</strong> | <strong>Keterangan</strong> | <strong>Tgl Masuk</strong> | <strong>Aging</strong> | <strong>Waktu Aging</strong> | <strong>Estimasi Selesai</strong>
            </p>
          </div>

          <!-- Preview Count & Table if parsed -->
          <div v-if="parsedPreviewRolls.length > 0" class="space-y-2.5">
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900 font-bold">
              <span>✓ Berhasil mengurai <strong>{{ parsedPreviewRolls.length }}</strong> baris roll siap import</span>
              <span>Total: {{ formatNumber(previewTotalKg) }} kg</span>
            </div>

            <!-- Preview Data Sample Table (Max 5 rows) -->
            <div class="overflow-x-auto rounded-xl border border-zinc-200 shadow-2xs max-h-48 overflow-y-auto">
              <table class="w-full text-left text-[10.5px] border-collapse font-mono">
                <thead class="bg-zinc-100 text-zinc-700 font-bold border-b border-zinc-200 sticky top-0">
                  <tr>
                    <th class="py-1.5 px-2">No Lot</th>
                    <th class="py-1.5 px-2">SPK</th>
                    <th class="py-1.5 px-2">Dimensi (MC x W x L)</th>
                    <th class="py-1.5 px-2 text-right">Berat</th>
                    <th class="py-1.5 px-2 text-center">Lokasi/Pos</th>
                    <th class="py-1.5 px-2 text-center">Tgl Masuk</th>
                    <th class="py-1.5 px-2 text-center">Status Aging</th>
                    <th class="py-1.5 px-2">Keterangan</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <tr v-for="(pr, pIdx) in parsedPreviewRolls.slice(0, 5)" :key="pIdx" class="hover:bg-amber-50/50">
                    <td class="py-1 px-2 font-black text-blue-700">{{ pr.lot }}</td>
                    <td class="py-1 px-2 text-zinc-700">{{ pr.spk || '—' }}</td>
                    <td class="py-1 px-2 text-zinc-800">{{ pr.thickness }}μ × {{ pr.width }}mm = {{ pr.length }}m</td>
                    <td class="py-1 px-2 text-right font-black text-emerald-800">{{ formatNumber(pr.beratAktual) }} kg</td>
                    <td class="py-1 px-2 text-center font-bold text-zinc-700">{{ pr.lokasiAktif }} ({{ pr.posisiAktif }})</td>
                    <td class="py-1 px-2 text-center text-zinc-600">{{ pr.tanggalMasukFormatted }}</td>
                    <td class="py-1 px-2 text-center">
                      <span v-if="pr.isAging" class="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[9.5px] font-black">
                        ⏳ {{ pr.agingRemainingFormatted }}
                      </span>
                      <span v-else class="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9.5px] font-black">
                        ✅ Siap Pakai
                      </span>
                    </td>
                    <td class="py-1 px-2 text-zinc-500 truncate max-w-[120px]">{{ pr.keterangan || '—' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- New Location Discovery Notice -->
            <div v-if="discoveredNewRacks.length > 0" class="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs flex items-start gap-2 text-amber-950 font-bold">
              <span class="text-base">💡</span>
              <div>
                <span>Terdeteksi {{ discoveredNewRacks.length }} Lokasi Rak Baru: <strong class="font-mono text-amber-900">{{ discoveredNewRacks.join(', ') }}</strong></span>
                <p class="text-[11px] font-normal text-amber-800 mt-0.5">
                  Sistem akan <strong>mendaftarkan lokasi baru ini secara otomatis</strong> ke Master Data Configuration saat data disimpan.
                </p>
              </div>
            </div>
          </div>

          <!-- Dialog Action Buttons -->
          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button
              @click="showImportModal = false"
              class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer"
            >
              Batal
            </button>
            <button
              @click="executeImportWip"
              :disabled="parsedPreviewRolls.length === 0"
              class="px-5 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-zinc-950 disabled:opacity-40 shadow-md shadow-amber-500/20 cursor-pointer transition-all"
            >
              ✓ Simpan & Buat Update Baru ({{ parsedPreviewRolls.length }} Roll)
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: INPUT / EDIT SINGLE ROLL                                   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showSingleRollModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <h3 class="text-base font-black text-zinc-900 tracking-tight">
              {{ editingRollId ? '✏️ Edit Data Roll WIP' : '+ Tambah Data Roll WIP' }}
            </h3>
            <button @click="showSingleRollModal = false" class="p-1 text-zinc-400 hover:text-zinc-700 font-bold text-base cursor-pointer">✕</button>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label class="font-bold text-zinc-700 block mb-1">No. Lot</label>
              <input v-model="rollForm.lot" @input="rollForm.lot = formatInhouseLotInput(rollForm.lot)" required placeholder="M07240826B101" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold uppercase outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">No. SPK</label>
              <input v-model="rollForm.spk" placeholder="SPK240801" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold uppercase outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Jenis Film</label>
              <select v-model="rollForm.jenis" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-bold outline-none bg-white">
                <option value="CPP">CPP</option>
                <option value="VMCPP">VMCPP</option>
                <option value="PET">PET</option>
                <option value="VMPET">VMPET</option>
                <option value="BOPP">BOPP</option>
                <option value="LLDPE">LLDPE</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Kode Formula</label>
              <input v-model="rollForm.kodeFormula" required placeholder="M07" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold uppercase outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Thickness (μ)</label>
              <input v-model.number="rollForm.thickness" type="number" step="any" placeholder="20" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Width (mm)</label>
              <input v-model.number="rollForm.width" type="number" step="any" placeholder="1000" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Length (m)</label>
              <input v-model.number="rollForm.length" type="number" step="any" placeholder="6000" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Berat Aktual (kg)</label>
              <input v-model.number="rollForm.beratAktual" type="number" step="any" placeholder="1092.5" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-mono font-bold text-emerald-700 outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Lokasi Rak</label>
              <select v-model="rollForm.lokasiAktif" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-bold bg-white outline-none">
                <option v-for="loc in availableWipRacks" :key="loc.nama" :value="loc.nama">{{ loc.nama }}</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Posisi Rak</label>
              <input v-model="rollForm.posisiAktif" placeholder="R-1" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-bold uppercase outline-none" />
            </div>
            <div class="sm:col-span-2">
              <label class="font-bold text-zinc-700 block mb-1">Status</label>
              <select v-model="rollForm.status" class="w-full px-2.5 py-1.5 border border-zinc-300 rounded-lg font-bold outline-none bg-white">
                <option value="AVAILABLE">AVAILABLE (Tersedia)</option>
                <option value="USED">USED (Sudah Dipakai)</option>
                <option value="HOLD">HOLD (Karantina QC)</option>
                <option value="REJECT">REJECT (Ditolak)</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
            <button @click="showSingleRollModal = false" class="px-4 py-1.5 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">Batal</button>
            <button @click="saveSingleRoll" class="px-5 py-1.5 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-white shadow-xs cursor-pointer">Simpan</button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: DETAIL LENGKAP ROLL WIP JUMBO                               -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showRollDetailModal && selectedDetailRoll" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/75 backdrop-blur-xs animate-fade-in font-sans">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 max-h-[92vh] overflow-y-auto">
          
          <!-- Header -->
          <div class="flex items-start justify-between border-b border-zinc-100 pb-3 gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-900 border border-blue-300">
                  WIP Jumbo Roll Detail
                </span>
                <span class="text-zinc-400">•</span>
                <span class="text-xs font-bold text-zinc-500 font-mono">ID: {{ selectedDetailRoll.uuid || selectedDetailRoll.id || 'WIP' }}</span>
              </div>
              <h2 class="text-lg sm:text-xl font-black text-zinc-900 tracking-tight mt-1 font-mono flex items-center gap-2">
                <span>{{ formatLotVisual(selectedDetailRoll.lot) }}</span>
              </h2>
            </div>
            <button @click="showRollDetailModal = false" class="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 font-black text-lg cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Live Aging / Ready Banner Card -->
          <div
            v-if="getRollAgingInfo(selectedDetailRoll).isAging"
            class="p-4 rounded-2xl bg-amber-50 border border-amber-300 shadow-xs space-y-2 text-amber-950 animate-pulse"
          >
            <div class="flex items-center justify-between">
              <span class="font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <span>⏳</span> PROSES AGING SEDANG BERJALAN
              </span>
              <span class="px-2 py-0.5 rounded-md bg-amber-200 text-amber-900 font-mono font-black text-[11px]">
                {{ getRollAgingInfo(selectedDetailRoll).remainingFormatted }}
              </span>
            </div>
            <div class="w-full bg-amber-200/80 rounded-full h-2 overflow-hidden">
              <div class="bg-amber-600 h-2 rounded-full transition-all" :style="{ width: `${getRollAgingInfo(selectedDetailRoll).progressPercent}%` }"></div>
            </div>
            <div class="flex items-center justify-between text-[11px] font-mono text-amber-900 pt-0.5">
              <span>Target Selesai: <strong>{{ getRollAgingInfo(selectedDetailRoll).targetDateFormatted }}</strong></span>
              <span>Durasi Total: <strong>{{ selectedDetailRoll.waktuAgingFormatted || formatAgingDuration(selectedDetailRoll.waktuAgingRaw) }}</strong></span>
            </div>
          </div>
          <div
            v-else
            class="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-xs flex items-center justify-between text-emerald-950"
          >
            <div class="flex items-center gap-2">
              <span class="text-xl">✅</span>
              <div>
                <h4 class="font-black text-xs uppercase tracking-wider text-emerald-900">Bahan Siap Pakai / Ready Slitting</h4>
                <p class="text-[11px] text-emerald-700">Roll ini sudah siap diproses potong atau digunakan pada mesin slitting/rewind.</p>
              </div>
            </div>
            <span class="px-2.5 py-1 rounded-full bg-emerald-200 text-emerald-900 font-black text-[10px]">
              READY
            </span>
          </div>

          <!-- 2-Column Information Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            <!-- Card 1: Spesifikasi Roll -->
            <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[10.5px] tracking-wider border-b border-zinc-200 pb-1 flex items-center gap-1.5">
                <span>📐</span> Spesifikasi & Dimensi Roll
              </h4>
              <div class="grid grid-cols-2 gap-2 text-zinc-700">
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Jenis Film</span>
                  <span class="font-black text-zinc-900 text-sm">{{ selectedDetailRoll.jenis }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Kode Formula</span>
                  <span class="font-black text-red-600 text-sm">{{ selectedDetailRoll.kodeFormula }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Ketebalan (Micron)</span>
                  <span class="font-black text-zinc-900 text-sm font-mono">{{ selectedDetailRoll.thickness }} μ</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Lebar (Width)</span>
                  <span class="font-black text-zinc-900 text-sm font-mono">{{ selectedDetailRoll.width }} mm</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Panjang Total</span>
                  <span class="font-black text-zinc-900 text-sm font-mono">{{ selectedDetailRoll.length }} m</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Core / OD Metalize</span>
                  <span class="font-bold text-zinc-800 font-mono">{{ selectedDetailRoll.core || 6 }}" / {{ selectedDetailRoll.od || 0 }}</span>
                </div>
                <div class="col-span-2 pt-1 border-t border-zinc-200/60 flex items-center justify-between">
                  <span class="text-[10.5px] text-zinc-500 font-bold">Diameter Luar Fisik (Ø OD):</span>
                  <span class="font-black text-blue-950 text-xs font-mono bg-blue-100/70 text-blue-900 px-2 py-0.5 rounded-lg border border-blue-200">
                    Ø {{ calculateRollDiameterCm(selectedDetailRoll.thickness, selectedDetailRoll.length, selectedDetailRoll.core) }} cm
                  </span>
                </div>
              </div>
            </div>

            <!-- Card 2: Berat & Yield Analysis -->
            <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[10.5px] tracking-wider border-b border-zinc-200 pb-1 flex items-center gap-1.5">
                <span>⚖️</span> Timbangan & Analisis Berat
              </h4>
              <div class="grid grid-cols-2 gap-2 text-zinc-700">
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Berat Aktual Timbangan</span>
                  <span class="font-black text-emerald-800 text-base font-mono">{{ formatNumber(selectedDetailRoll.beratAktual) }} kg</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Berat Teori Standar</span>
                  <span class="font-bold text-zinc-700 text-base font-mono">{{ formatNumber(selectedDetailRoll.beratTeori) }} kg</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Selisih Berat</span>
                  <span
                    :class="[
                      'font-black font-mono text-xs',
                      (selectedDetailRoll.beratAktual - selectedDetailRoll.beratTeori) >= 0 ? 'text-blue-700' : 'text-amber-700'
                    ]"
                  >
                    {{ (selectedDetailRoll.beratAktual - selectedDetailRoll.beratTeori) >= 0 ? '+' : '' }}{{ formatNumber(selectedDetailRoll.beratAktual - selectedDetailRoll.beratTeori) }} kg
                  </span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">No. SPK Produksi</span>
                  <span class="font-bold text-zinc-900 font-mono">{{ selectedDetailRoll.spk || '—' }}</span>
                </div>
              </div>
            </div>

            <!-- Card 3: Lokasi Rak & Gudang -->
            <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[10.5px] tracking-wider border-b border-zinc-200 pb-1 flex items-center gap-1.5">
                <span>🏢</span> Lokasi & Posisi Rak
              </h4>
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Nama Rak</span>
                  <span class="font-black text-blue-900 text-sm">📍 {{ selectedDetailRoll.lokasiAktif || 'STAGING' }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Tingkat / Posisi</span>
                  <span class="font-bold text-zinc-800 text-sm font-mono">{{ selectedDetailRoll.posisiAktif || 'BAWAH' }}</span>
                </div>
              </div>
            </div>

            <!-- Card 4: Umur Simpan (FIFO) & Keterangan -->
            <div class="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-2">
              <h4 class="font-extrabold text-zinc-900 uppercase text-[10.5px] tracking-wider border-b border-zinc-200 pb-1 flex items-center gap-1.5">
                <span>📅</span> Tanggal Masuk & Umur Simpan
              </h4>
              <div class="flex items-center justify-between">
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Tanggal Masuk Stok</span>
                  <span class="font-bold text-zinc-900 font-mono">{{ selectedDetailRoll.tanggalMasukFormatted || formatExcelDate(selectedDetailRoll.tanggalMasukStokRaw) }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-zinc-400 block font-semibold">Umur Simpan (FIFO)</span>
                  <span class="px-2 py-0.5 rounded-md bg-zinc-200 text-zinc-800 font-black font-mono text-[10.5px]">
                    {{ getRollStockAge(selectedDetailRoll) !== null ? `${getRollStockAge(selectedDetailRoll)} Hari` : '—' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Keterangan Khusus Banner (if any) -->
          <div v-if="selectedDetailRoll.keterangan" class="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <span class="font-bold block text-[10px] uppercase text-amber-700 mb-0.5">Catatan / Keterangan Khusus:</span>
            <p class="font-semibold">{{ selectedDetailRoll.keterangan }}</p>
          </div>

          <!-- Deskripsi Standar Produksi -->
          <div class="p-3 rounded-xl bg-zinc-100 border border-zinc-200 space-y-1.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-bold text-zinc-600 text-[10px] uppercase">Deskripsi Excel (Lengkap):</span>
              <button @click="copyToClipboard(selectedDetailRoll.descriptionExcel)" class="text-[10px] text-blue-600 font-bold hover:underline cursor-pointer">
                Salin Deskripsi
              </button>
            </div>
            <p class="font-mono text-zinc-900 font-bold text-[11px] select-all bg-white p-2 rounded-lg border border-zinc-200">
              {{ selectedDetailRoll.descriptionExcel || '—' }}
            </p>
          </div>

          <!-- Modal Action Footer -->
          <div class="flex items-center justify-between pt-2 border-t border-zinc-100 flex-wrap gap-2 text-xs">
            <div class="flex items-center gap-2">
              <button
                @click="copyToClipboard(selectedDetailRoll.lot)"
                class="px-3 py-1.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 font-bold text-zinc-700 cursor-pointer transition-all"
              >
                📋 Salin No. Lot
              </button>
              <button
                @click="showRollDetailModal = false; openMoveLocationModal(selectedDetailRoll)"
                class="px-3 py-1.5 rounded-xl border border-blue-300 bg-blue-50 hover:bg-blue-100 font-bold text-blue-800 cursor-pointer transition-all"
              >
                📍 Pindah Rak
              </button>
            </div>

            <div class="flex items-center gap-2">
              <button
                @click="showRollDetailModal = false; openSingleRollModal(selectedDetailRoll)"
                class="px-4 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black cursor-pointer shadow-xs transition-all"
              >
                ✏️ Edit Data
              </button>
              <button
                @click="showRollDetailModal = false"
                class="px-4 py-1.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold cursor-pointer transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, watch } from 'vue';
import { useWipStore } from '@/stores/wipStore';
import { useConfigStore } from '@/stores/configStore';
import { 
  parseWipRowData, 
  formatExcelDate, 
  formatAgingDuration, 
  getAgingCountdownInfo, 
  calculateStockAgeDays,
  calculateRollDiameterCm,
  calculateCapacityEstimatesByThickness,
  getRackLevelLinearAnalysis,
  getRackTotalLinearAnalysis,
  RACK_LEVEL_SPECS,
  RACK_TOTAL_MAX_SPAN_M
} from '@/services/wipParserService';
import { formatLotVisual, formatInhouseLotInput } from '@/services/aiAutomationService';
import * as XLSX from 'xlsx';

const wipStore = useWipStore();
const configStore = useConfigStore();

// Main Sub-Tab Switcher: 'stock' | 'updates' | 'location'
const activeWipTab = ref('stock');

// Navigation & View States for Updates Sheet
const isDetailViewOpen = ref(false);
const currentDetailBatch = ref(null);
const editingUpdateId = ref(null);
const editingUpdateTitle = ref('');

// Filter & Search Master Updates
const searchUpdateTerm = ref('');

// Filter & Search Detail Rolls in Updates Sheet
const searchRollTerm = ref('');
const filterJenis = ref('');
const filterFormula = ref('');
const filterStatus = ref('');
const filterAging = ref(''); // '' | 'READY' | 'AGING'
const sortRollBy = ref('default');

const currentRollPage = ref(1);
const rollPageSize = ref(25);

// ── STOCK WIP SHEET STATES & COLUMN VISIBILITY ──

const stockSearchQuery = ref('');
const stockFilterJenis = ref('');
const stockFilterFormula = ref('');
const stockFilterLokasi = ref('');
const stockFilterPosisi = ref('');
const stockFilterAging = ref('');
const stockFilterThick = ref('');
const stockSortBy = ref('default');
const stockSortField = ref('');
const stockSortDir = ref('asc');
const stockCurrentPage = ref(1);
const stockPageSize = ref(25);

// Roll Detail Modal State
const showRollDetailModal = ref(false);
const selectedDetailRoll = ref(null);

const openRollDetailModal = (roll) => {
  if (!roll) return;
  selectedDetailRoll.value = roll;
  showRollDetailModal.value = true;
};

// Column Visibility Manager
const showColumnConfigDropdown = ref(false);

const columnDefinitions = [
  { key: 'index', label: '#', fixed: true },
  { key: 'lot', label: 'No. Lot', fixed: true },
  { key: 'spk', label: 'No. SPK' },
  { key: 'jenis', label: 'Jenis Film' },
  { key: 'formula', label: 'Kode Formula' },
  { key: 'dimensions', label: 'Dimensi (MC x W x L)' },
  { key: 'thickness', label: 'Thickness (μ)' },
  { key: 'width', label: 'Width (mm)' },
  { key: 'length', label: 'Length (m)' },
  { key: 'core', label: 'Core Size' },
  { key: 'diameter', label: 'Diameter Ø (cm)' },
  { key: 'beratAktual', label: 'Berat Aktual (kg)' },
  { key: 'beratTeori', label: 'Berat Teori (kg)' },
  { key: 'lokasi', label: 'Lokasi Rak' },
  { key: 'posisi', label: 'Posisi Tingkat' },
  { key: 'tanggalMasuk', label: 'Tgl Masuk (FIFO)' },
  { key: 'aging', label: 'Kesiapan Aging' },
  { key: 'keterangan', label: 'Keterangan' },
  { key: 'descExcel', label: 'Deskripsi Excel' },
  { key: 'descNav', label: 'Deskripsi NAV' },
  { key: 'actions', label: 'Aksi', fixed: true }
];

const defaultVisibleColumns = {
  index: true,
  lot: true,
  spk: true,
  jenis: true,
  formula: true,
  dimensions: true,
  thickness: false,
  width: false,
  length: false,
  core: false,
  diameter: false,
  beratAktual: true,
  beratTeori: false,
  lokasi: true,
  posisi: true,
  tanggalMasuk: true,
  aging: true,
  keterangan: true,
  descExcel: false,
  descNav: false,
  actions: true
};

const visibleColumns = ref({ ...defaultVisibleColumns });

const loadColumnPreferences = () => {
  try {
    const saved = localStorage.getItem('mlabel_wip_stock_columns');
    if (saved) {
      visibleColumns.value = { ...defaultVisibleColumns, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error(e);
  }
};

const toggleColumn = (key) => {
  visibleColumns.value[key] = !visibleColumns.value[key];
  try {
    localStorage.setItem('mlabel_wip_stock_columns', JSON.stringify(visibleColumns.value));
  } catch (e) {
    console.error(e);
  }
};

const resetColumnsToDefault = () => {
  visibleColumns.value = { ...defaultVisibleColumns };
  try {
    localStorage.setItem('mlabel_wip_stock_columns', JSON.stringify(visibleColumns.value));
  } catch (e) {
    console.error(e);
  }
};

const activeVisibleColumnCount = computed(() => {
  return Object.values(visibleColumns.value).filter(Boolean).length;
});

const toggleHeaderSort = (field) => {
  if (stockSortField.value === field) {
    if (stockSortDir.value === 'asc') {
      stockSortDir.value = 'desc';
    } else {
      stockSortField.value = '';
      stockSortDir.value = 'asc';
    }
  } else {
    stockSortField.value = field;
    stockSortDir.value = 'asc';
  }
};

const resetStockFilters = () => {
  stockSearchQuery.value = '';
  stockFilterJenis.value = '';
  stockFilterFormula.value = '';
  stockFilterLokasi.value = '';
  stockFilterPosisi.value = '';
  stockFilterAging.value = '';
  stockFilterThick.value = '';
  stockSortBy.value = 'default';
  stockSortField.value = '';
  stockSortDir.value = 'asc';
  stockCurrentPage.value = 1;
};

// Reactive timer ticker for live aging countdown
const nowTime = ref(Date.now());
let timerInterval = null;

// Location Sub-Tab State
const searchRackTerm = ref('');
const showRackSlotsModal = ref(false);
const selectedRack = ref(null);

// Move Location State
const showMoveLocationModal = ref(false);
const movingRoll = ref(null);
const moveTargetLocation = ref('RAK A1A2');
const moveTargetPosition = ref('BAWAH');

// Import Modal State
const showImportModal = ref(false);
const importMode = ref('file');
const importTitle = ref('');
const importTanggal = ref(new Date().toISOString().slice(0, 10));
const importMakeActive = ref(true);
const uploadedFileName = ref('');
const copasText = ref('');
const parsedPreviewRolls = ref([]);
const fileInputRef = ref(null);

// Single Roll Modal
const showSingleRollModal = ref(false);
const editingRollId = ref(null);
const rollForm = reactive({
  lot: '',
  spk: '',
  jenis: 'CPP',
  kodeFormula: 'M07',
  thickness: 20,
  width: 1000,
  length: 6000,
  core: 6,
  od: '',
  tanda: '',
  beratAktual: 0,
  lokasiAktif: 'RAK A1A2',
  posisiAktif: 'BAWAH',
  status: 'AVAILABLE',
  keterangan: ''
});

// Helper for live roll aging info
const getRollAgingInfo = (roll) => {
  const _ = nowTime.value; // react to timer ticks
  return getAgingCountdownInfo(roll.estimasiWaktuAgingRaw || roll.estimasiWaktuAging, roll.waktuAgingRaw || roll.waktuAging);
};

const getRollStockAge = (roll) => {
  if (roll.stockAgeDays !== undefined && roll.stockAgeDays !== null) return roll.stockAgeDays;
  return calculateStockAgeDays(roll.tanggalMasukStokRaw || roll.tanggalMasuk);
};

const copyToClipboard = (text) => {
  if (!text) return;
  navigator.clipboard.writeText(text);
  alert(`📋 Tersalin: "${text}"`);
};

// Lifecycle
onMounted(async () => {
  loadColumnPreferences();
  await Promise.all([
    wipStore.loadWipRolls(),
    configStore.loadAll()
  ]);

  timerInterval = setInterval(() => {
    nowTime.value = Date.now();
  }, 15000); // Tick every 15s for live countdown
});

onUnmounted(() => {
  if (timerInterval) clearInterval(timerInterval);
});

// ── STOCK WIP COMPUTED PROPERTIES ──

const stockAvailableJenisList = computed(() => {
  const set = new Set((wipStore.activeWipRolls || []).map(r => r.jenis).filter(Boolean));
  return Array.from(set).sort();
});

const stockAvailableFormulaList = computed(() => {
  const set = new Set((wipStore.activeWipRolls || []).map(r => r.kodeFormula).filter(Boolean));
  return Array.from(set).sort();
});

const stockAvailableLokasiList = computed(() => {
  const set = new Set((wipStore.activeWipRolls || []).map(r => r.lokasiAktif).filter(Boolean));
  return Array.from(set).sort();
});

const stockAvailableThicknessList = computed(() => {
  const set = new Set((wipStore.activeWipRolls || []).map(r => r.thickness).filter(Boolean));
  return Array.from(set).sort((a, b) => Number(a) - Number(b));
});

const filteredStockRolls = computed(() => {
  let list = [...(wipStore.activeWipRolls || [])];

  // 1. Search Query
  if (stockSearchQuery.value.trim()) {
    const q = stockSearchQuery.value.toLowerCase().trim();
    list = list.filter(r => {
      return (r.lot || '').toLowerCase().includes(q) ||
             (r.spk || '').toLowerCase().includes(q) ||
             (r.kodeFormula || '').toLowerCase().includes(q) ||
             (r.jenis || '').toLowerCase().includes(q) ||
             (r.lokasiAktif || '').toLowerCase().includes(q) ||
             (r.posisiAktif || '').toLowerCase().includes(q) ||
             (r.keterangan || '').toLowerCase().includes(q) ||
             (r.descriptionExcel || '').toLowerCase().includes(q) ||
             (r.descriptionNav || '').toLowerCase().includes(q);
    });
  }

  // 2. Multi-Criteria Filters
  if (stockFilterJenis.value) list = list.filter(r => r.jenis === stockFilterJenis.value);
  if (stockFilterFormula.value) list = list.filter(r => r.kodeFormula === stockFilterFormula.value);
  if (stockFilterLokasi.value) list = list.filter(r => r.lokasiAktif === stockFilterLokasi.value);
  if (stockFilterPosisi.value) list = list.filter(r => r.posisiAktif === stockFilterPosisi.value);
  if (stockFilterThick.value) list = list.filter(r => String(r.thickness) === String(stockFilterThick.value));

  if (stockFilterAging.value === 'READY') {
    list = list.filter(r => getRollAgingInfo(r).isReady);
  } else if (stockFilterAging.value === 'AGING') {
    list = list.filter(r => getRollAgingInfo(r).isAging);
  }

  // 3. Header Click Sorting
  if (stockSortField.value) {
    const f = stockSortField.value;
    const isAsc = stockSortDir.value === 'asc';
    list.sort((a, b) => {
      let valA = a[f];
      let valB = b[f];

      if (f === 'beratAktual' || f === 'thickness' || f === 'width' || f === 'length') {
        valA = parseFloat(valA) || 0;
        valB = parseFloat(valB) || 0;
        return isAsc ? valA - valB : valB - valA;
      }
      if (f === 'tanggalMasuk') {
        valA = getRollStockAge(a) || 0;
        valB = getRollStockAge(b) || 0;
        return isAsc ? valA - valB : valB - valA;
      }

      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
      return isAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
    });
  } else {
    // 4. Dropdown Sort
    if (stockSortBy.value === 'aging_first') {
      list.sort((a, b) => {
        const aAging = getRollAgingInfo(a).isAging ? 1 : 0;
        const bAging = getRollAgingInfo(b).isAging ? 1 : 0;
        return bAging - aAging;
      });
    } else if (stockSortBy.value === 'fifo_oldest') {
      list.sort((a, b) => (getRollStockAge(b) || 0) - (getRollStockAge(a) || 0));
    } else if (stockSortBy.value === 'lot_asc') {
      list.sort((a, b) => (a.lot || '').localeCompare(b.lot || ''));
    } else if (stockSortBy.value === 'lot_desc') {
      list.sort((a, b) => (b.lot || '').localeCompare(a.lot || ''));
    } else if (stockSortBy.value === 'weight_desc') {
      list.sort((a, b) => (parseFloat(b.beratAktual) || 0) - (parseFloat(a.beratAktual) || 0));
    } else if (stockSortBy.value === 'weight_asc') {
      list.sort((a, b) => (parseFloat(a.beratAktual) || 0) - (parseFloat(b.beratAktual) || 0));
    } else if (stockSortBy.value === 'thick_asc') {
      list.sort((a, b) => (parseFloat(a.thickness) || 0) - (parseFloat(b.thickness) || 0));
    }
  }

  return list;
});

const stockTotalBeratAktual = computed(() => {
  return filteredStockRolls.value.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);
});

const stockReadyRollsCount = computed(() => {
  return filteredStockRolls.value.filter(r => getRollAgingInfo(r).isReady).length;
});

const stockAgingRollsCount = computed(() => {
  return filteredStockRolls.value.filter(r => getRollAgingInfo(r).isAging).length;
});

const stockOccupiedRacksCount = computed(() => {
  const set = new Set(filteredStockRolls.value.map(r => r.lokasiAktif).filter(Boolean));
  return set.size;
});

const stockTotalPages = computed(() => {
  return Math.ceil(filteredStockRolls.value.length / stockPageSize.value) || 1;
});

const paginatedStockRolls = computed(() => {
  const start = (stockCurrentPage.value - 1) * stockPageSize.value;
  return filteredStockRolls.value.slice(start, start + stockPageSize.value);
});

const stockPaginationInfo = computed(() => {
  const total = filteredStockRolls.value.length;
  if (total === 0) return { from: 0, to: 0 };
  const from = (stockCurrentPage.value - 1) * stockPageSize.value + 1;
  const to = Math.min(stockCurrentPage.value * stockPageSize.value, total);
  return { from, to };
});

const exportStockToExcel = () => {
  const dataToExport = filteredStockRolls.value.map(r => {
    const agingInfo = getRollAgingInfo(r);
    return {
      'No. Lot': r.lot,
      'No. SPK': r.spk || '',
      'Jenis Film': r.jenis,
      'Kode Formula': r.kodeFormula,
      'Thickness (μ)': r.thickness,
      'Width (mm)': r.width,
      'Length (m)': r.length,
      'Core (Inch)': r.core || 6,
      'Berat Aktual (kg)': r.beratAktual,
      'Berat Teori (kg)': r.beratTeori,
      'Lokasi Rak': r.lokasiAktif,
      'Posisi Rak': r.posisiAktif,
      'Tanggal Masuk': r.tanggalMasukFormatted || formatExcelDate(r.tanggalMasukStokRaw),
      'Umur Stok (Hari)': getRollStockAge(r) !== null ? getRollStockAge(r) : '',
      'Status Aging': agingInfo.statusText,
      'Sisa Waktu Aging': agingInfo.isAging ? agingInfo.remainingFormatted : 'Siap Pakai',
      'Target Selesai Aging': agingInfo.targetDateFormatted,
      'Keterangan': r.keterangan || '',
      'Deskripsi Excel': r.descriptionExcel || '',
      'Deskripsi NAV': r.descriptionNav || ''
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Stock_WIP_Aktif');
  XLSX.writeFile(workbook, `Stock_WIP_Aktif_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// ── COMPUTED PROPERTIES (UPDATES & DETAIL) ──

const activeStockTotalKg = computed(() => {
  return wipStore.activeWipRolls.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);
});

const filteredUpdates = computed(() => {
  let list = wipStore.wipUpdates || [];
  if (searchUpdateTerm.value.trim()) {
    const q = searchUpdateTerm.value.toLowerCase().trim();
    list = list.filter(u => {
      return (u.title || '').toLowerCase().includes(q) ||
             (u.tanggal || '').toLowerCase().includes(q) ||
             (u.fileName || '').toLowerCase().includes(q);
    });
  }
  return list;
});

const currentBatchRolls = computed(() => {
  if (!currentDetailBatch.value) return [];
  const bId = currentDetailBatch.value.uuid || currentDetailBatch.value.id;
  return wipStore.wipRolls.filter(r => r.updateId === bId || String(r.updateId) === String(currentDetailBatch.value.id));
});

const detailTotalBeratAktual = computed(() => {
  return currentBatchRolls.value.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);
});

const detailTotalBeratTeori = computed(() => {
  return currentBatchRolls.value.reduce((acc, r) => acc + (parseFloat(r.beratTeori) || 0), 0);
});

const detailSelisihKg = computed(() => {
  return Number((detailTotalBeratAktual.value - detailTotalBeratTeori.value).toFixed(2));
});

const availableJenisList = computed(() => {
  const set = new Set(currentBatchRolls.value.map(r => r.jenis).filter(Boolean));
  return Array.from(set).sort();
});

const availableFormulaList = computed(() => {
  const set = new Set(currentBatchRolls.value.map(r => r.kodeFormula).filter(Boolean));
  return Array.from(set).sort();
});

const filteredRolls = computed(() => {
  let list = [...currentBatchRolls.value];

  if (searchRollTerm.value.trim()) {
    const q = searchRollTerm.value.toLowerCase().trim();
    list = list.filter(r => {
      return (r.lot || '').toLowerCase().includes(q) ||
             (r.spk || '').toLowerCase().includes(q) ||
             (r.kodeFormula || '').toLowerCase().includes(q) ||
             (r.jenis || '').toLowerCase().includes(q) ||
             (r.lokasiAktif || '').toLowerCase().includes(q) ||
             (r.keterangan || '').toLowerCase().includes(q) ||
             (r.descriptionNav || '').toLowerCase().includes(q);
    });
  }

  if (filterJenis.value) list = list.filter(r => r.jenis === filterJenis.value);
  if (filterFormula.value) list = list.filter(r => r.kodeFormula === filterFormula.value);
  if (filterStatus.value) list = list.filter(r => r.status === filterStatus.value);
  
  if (filterAging.value === 'READY') {
    list = list.filter(r => getRollAgingInfo(r).isReady);
  } else if (filterAging.value === 'AGING') {
    list = list.filter(r => getRollAgingInfo(r).isAging);
  }

  if (sortRollBy.value === 'aging_first') {
    list.sort((a, b) => {
      const aAging = getRollAgingInfo(a).isAging ? 1 : 0;
      const bAging = getRollAgingInfo(b).isAging ? 1 : 0;
      return bAging - aAging;
    });
  } else if (sortRollBy.value === 'fifo_oldest') {
    list.sort((a, b) => (getRollStockAge(b) || 0) - (getRollStockAge(a) || 0));
  } else if (sortRollBy.value === 'lot_asc') {
    list.sort((a, b) => (a.lot || '').localeCompare(b.lot || ''));
  } else if (sortRollBy.value === 'lot_desc') {
    list.sort((a, b) => (b.lot || '').localeCompare(a.lot || ''));
  } else if (sortRollBy.value === 'weight_desc') {
    list.sort((a, b) => (parseFloat(b.beratAktual) || 0) - (parseFloat(a.beratAktual) || 0));
  } else if (sortRollBy.value === 'weight_asc') {
    list.sort((a, b) => (parseFloat(a.beratAktual) || 0) - (parseFloat(b.beratAktual) || 0));
  } else if (sortRollBy.value === 'thick_asc') {
    list.sort((a, b) => (parseFloat(a.thickness) || 0) - (parseFloat(b.thickness) || 0));
  }

  return list;
});

const rollTotalPages = computed(() => {
  return Math.ceil(filteredRolls.value.length / rollPageSize.value) || 1;
});

const paginatedRolls = computed(() => {
  const start = (currentRollPage.value - 1) * rollPageSize.value;
  return filteredRolls.value.slice(start, start + rollPageSize.value);
});

const rollPaginationInfo = computed(() => {
  const total = filteredRolls.value.length;
  if (total === 0) return { from: 0, to: 0 };
  const from = (currentRollPage.value - 1) * rollPageSize.value + 1;
  const to = Math.min(currentRollPage.value * rollPageSize.value, total);
  return { from, to };
});

const previewTotalKg = computed(() => {
  return parsedPreviewRolls.value.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);
});

const discoveredNewRacks = computed(() => {
  if (!parsedPreviewRolls.value || parsedPreviewRolls.value.length === 0) return [];
  const knownLocations = new Set(configStore.locationList.map(l => (l.nama || '').toUpperCase()));
  const uniqueInPreview = [...new Set(parsedPreviewRolls.value.map(r => (r.lokasiAktif || '').toUpperCase()).filter(Boolean))];
  return uniqueInPreview.filter(loc => !knownLocations.has(loc) && loc !== 'STAGING');
});

// ── COMPUTED PROPERTIES (WIP LOCATION / RACKS) ──

const availableWipRacks = computed(() => {
  const masterRacks = configStore.locationList.filter(l => {
    if (l.active === false || l.jenis !== 'WIP JUMBO') return false;
    const upper = (l.nama || '').toUpperCase();
    if (upper.includes('*') || upper === 'RAK 0' || upper === '0' || upper === 'RAK *0') return false;
    if (/^(RAK\s+)?(A1|A2|A3|A4|B1|B2|B3|B4|C1|C2|C3|C4|D1|D2|D3|D4|G1|G2|G3|G4|H1|H2|H3|H4)$/i.test(upper)) return false;
    return true;
  });
  if (masterRacks.length > 0) {
    return [...masterRacks].sort((a, b) => {
      if (a.nama === 'STAGING') return 1;
      if (b.nama === 'STAGING') return -1;
      return (a.nama || '').localeCompare(b.nama || '', undefined, { numeric: true, sensitivity: 'base' });
    });
  }
  return [
    { nama: 'RAK A1A2', alias: 'A1, A2, A1A2', kapasitas: 12 },
    { nama: 'RAK A3A4', alias: 'A3, A4, A3A4', kapasitas: 12 },
    { nama: 'RAK B1B2', alias: 'B1, B2, B1B2', kapasitas: 12 },
    { nama: 'RAK B3B4', alias: 'B3, B4, B3B4', kapasitas: 12 },
    { nama: 'RAK C1C2', alias: 'C1, C2, C1C2', kapasitas: 12 },
    { nama: 'RAK C3C4', alias: 'C3, C4, C3C4', kapasitas: 12 },
    { nama: 'RAK D1D2', alias: 'D1, D2, D1D2', kapasitas: 12 },
    { nama: 'RAK D3D4', alias: 'D3, D4, D3D4', kapasitas: 12 },
    { nama: 'RAK G1G2', alias: 'G1, G2, G1G2', kapasitas: 12 },
    { nama: 'RAK G3G4', alias: 'G3, G4, G3G4', kapasitas: 12 },
    { nama: 'RAK H1H2', alias: 'H1, H2, H1H2', kapasitas: 12 },
    { nama: 'RAK H3H4', alias: 'H3, H4, H3H4', kapasitas: 12 },
    { nama: 'STAGING', alias: 'STAGING', kapasitas: 20 },
  ];
});

const wipLocationCards = computed(() => {
  const activeRolls = wipStore.activeWipRolls || [];
  const racks = availableWipRacks.value;

  return racks.map(rack => {
    // Match rolls that belong to this rack or its aliases
    const aliases = (rack.alias || '').split(',').map(a => a.trim().toUpperCase()).filter(Boolean);
    aliases.push(rack.nama.toUpperCase());

    const rollsInRack = activeRolls.filter(r => {
      const loc = (r.lokasiAktif || 'STAGING').toUpperCase();
      return aliases.includes(loc) || configStore.normalizeLocation(loc, 'WIP JUMBO') === rack.nama;
    });

    const linearAnalysis = getRackTotalLinearAnalysis(rollsInRack, configStore.standardLengthList);
    const kapasitas = rack.nama === 'STAGING' ? 20 : 36; // 36 roll standard untuk rak bertingkat 3
    const occupancyPercent = linearAnalysis.totalOccupancyPercent;
    const totalKg = rollsInRack.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);

    // Formula summary
    const formulaMap = {};
    rollsInRack.forEach(r => {
      const f = r.kodeFormula || 'M07';
      formulaMap[f] = (formulaMap[f] || 0) + 1;
    });
    const formulaSummary = Object.entries(formulaMap).map(([formula, count]) => ({ formula, count }));

    return {
      ...rack,
      kapasitas,
      rolls: rollsInRack,
      occupancyPercent,
      totalKg,
      formulaSummary,
      linearAnalysis
    };
  });
});

// ── SIMULASI KAPASITAS SISA RAK PER MICRON (STANDARD LENGTH) ──
const showCapacitySimModal = ref(false);
const capacitySimData = reactive({
  title: '',
  subtitle: '',
  remainingSpanMeter: '0.00',
  remainingSpanCm: 0,
  occupancyPercent: 0,
  isJumboMode: true
});

const openCapacitySimModal = (title, remainingSpanCm, remainingSpanMeter, occupancyPercent = 0, isJumboDefault = true) => {
  capacitySimData.title = title || 'Rak Jumbo';
  capacitySimData.remainingSpanCm = parseFloat(remainingSpanCm) || 0;
  capacitySimData.remainingSpanMeter = remainingSpanMeter !== undefined ? String(remainingSpanMeter) : ((parseFloat(remainingSpanCm) || 0) / 100).toFixed(2);
  capacitySimData.occupancyPercent = Math.round(occupancyPercent) || 0;
  capacitySimData.isJumboMode = isJumboDefault;
  showCapacitySimModal.value = true;
};

const capacitySimList = computed(() => {
  return calculateCapacityEstimatesByThickness(
    capacitySimData.remainingSpanCm,
    configStore.standardLengthList,
    capacitySimData.isJumboMode
  );
});

// ── WIP HIERARCHY TREE ACCORDION STATES & COMPUTED ──
const expandedBlocks = ref({});
const expandedRacks = ref({});
const expandedLevels = ref({});

const toggleBlock = (blockKey) => {
  expandedBlocks.value[blockKey] = !expandedBlocks.value[blockKey];
};

const toggleRack = (rackKey) => {
  expandedRacks.value[rackKey] = !expandedRacks.value[rackKey];
};

const toggleLevel = (levelKey) => {
  expandedLevels.value[levelKey] = !expandedLevels.value[levelKey];
};

const expandAllHierarchy = () => {
  wipHierarchyBlocks.value.forEach(b => {
    expandedBlocks.value[b.key] = true;
    b.racks.forEach(r => {
      expandedRacks.value[r.rackName] = true;
      r.positions.forEach(p => {
        expandedLevels.value[`${r.rackName}_${p.key || p.name}`] = true;
      });
    });
  });
};

const collapseAllHierarchy = () => {
  expandedBlocks.value = {};
  expandedRacks.value = {};
  expandedLevels.value = {};
};

const wipHierarchyBlocks = computed(() => {
  const activeRolls = wipStore.activeWipRolls || [];
  
  const blockDefs = [
    { key: 'A', title: 'BLOK A (RAK JUMBO A)', rackNames: ['RAK A1A2', 'RAK A3A4'], isStaging: false },
    { key: 'B', title: 'BLOK B (RAK JUMBO B)', rackNames: ['RAK B1B2', 'RAK B3B4'], isStaging: false },
    { key: 'C', title: 'BLOK C (RAK JUMBO C)', rackNames: ['RAK C1C2', 'RAK C3C4'], isStaging: false },
    { key: 'D', title: 'BLOK D (RAK JUMBO D)', rackNames: ['RAK D1D2', 'RAK D3D4'], isStaging: false },
    { key: 'G', title: 'BLOK G (RAK JUMBO G)', rackNames: ['RAK G1G2', 'RAK G3G4'], isStaging: false },
    { key: 'H', title: 'BLOK H (RAK JUMBO H)', rackNames: ['RAK H1H2', 'RAK H3H4'], isStaging: false },
    { key: 'STAGING', title: 'AREA STAGING & TRANSIT (FLOOR / GUDANG)', rackNames: ['STAGING'], isStaging: true },
  ];

  return blockDefs.map(bDef => {
    let blockRolls = [];
    let blockTotalKg = 0;

    const racks = bDef.rackNames.map(rackName => {
      // Filter rolls for this rack
      const rackRolls = activeRolls.filter(r => {
        const norm = configStore.normalizeLocation(r.lokasiAktif, 'WIP JUMBO');
        return norm === rackName || (bDef.isStaging && (norm === 'STAGING' || !norm));
      });

      blockRolls.push(...rackRolls);
      const rackTotalKg = rackRolls.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);
      blockTotalKg += rackTotalKg;

      if (bDef.isStaging) {
        // STAGING: Group by dynamic sub-positions (FLOOR, GUDANG, LANTAI, BAWAH, etc.)
        // No maximum limits!
        const positionGroups = {};
        rackRolls.forEach(r => {
          const rawPos = (r.posisiAktif || 'FLOOR').trim().toUpperCase();
          const posName = rawPos === '0' || rawPos === 'BAWAH' ? 'FLOOR (LANTAI)' : rawPos;
          if (!positionGroups[posName]) {
            positionGroups[posName] = {
              key: posName,
              name: posName,
              isStaging: true,
              rolls: [],
              totalKg: 0,
              totalMeter: 0
            };
          }
          const dCm = calculateRollDiameterCm(r.thickness, r.length, r.core);
          positionGroups[posName].rolls.push({
            ...r,
            diameterCm: dCm,
            diameterMeter: (dCm / 100).toFixed(2)
          });
          positionGroups[posName].totalKg += (parseFloat(r.beratAktual) || 0);
          positionGroups[posName].totalMeter += (dCm / 100);
        });

        // Default empty position if no rolls
        if (Object.keys(positionGroups).length === 0) {
          positionGroups['FLOOR (LANTAI)'] = {
            key: 'FLOOR (LANTAI)',
            name: 'FLOOR (LANTAI)',
            isStaging: true,
            rolls: [],
            totalKg: 0,
            totalMeter: 0
          };
        }

        const positions = Object.values(positionGroups);

        return {
          rackName: 'STAGING',
          title: 'AREA STAGING (TRANSIT)',
          isStaging: true,
          rolls: rackRolls,
          totalKg: rackTotalKg,
          positions
        };
      }

      // STANDARD JUMBO RACK: 3 Levels (ATAS, TENGAH, BAWAH) with linear analysis
      const linearAnalysis = getRackTotalLinearAnalysis(rackRolls, configStore.standardLengthList);

      const positions = [
        {
          key: 'ATAS',
          name: 'TINGKAT ATAS (Level 3)',
          levelKey: 'ATAS',
          isStaging: false,
          maxRolls: 9,
          maxSpanM: 8.21,
          analysis: linearAnalysis.levels.ATAS
        },
        {
          key: 'TENGAH',
          name: 'TINGKAT TENGAH (Level 2)',
          levelKey: 'TENGAH',
          isStaging: false,
          maxRolls: 12,
          maxSpanM: 10.94,
          analysis: linearAnalysis.levels.TENGAH
        },
        {
          key: 'BAWAH',
          name: 'TINGKAT BAWAH (Level 1)',
          levelKey: 'BAWAH',
          isStaging: false,
          maxRolls: 15,
          maxSpanM: 13.68,
          analysis: linearAnalysis.levels.BAWAH
        }
      ];

      return {
        rackName,
        title: rackName,
        isStaging: false,
        rolls: rackRolls,
        totalKg: rackTotalKg,
        linearAnalysis,
        positions
      };
    });

    return {
      key: bDef.key,
      title: bDef.title,
      isStaging: bDef.isStaging,
      totalRolls: blockRolls.length,
      totalKg: blockTotalKg,
      racks
    };
  });
});

const filteredHierarchyBlocks = computed(() => {
  let blocks = wipHierarchyBlocks.value;
  if (searchRackTerm.value.trim()) {
    const q = searchRackTerm.value.toLowerCase().trim();
    return blocks.map(block => {
      const filteredRacks = block.racks.map(rack => {
        const filteredPositions = rack.positions.map(pos => {
          const rollsList = !rack.isStaging ? (pos.analysis?.rolls || []) : (pos.rolls || []);
          const matchingRolls = rollsList.filter(r => 
            (r.lot || '').toLowerCase().includes(q) || 
            (r.spk || '').toLowerCase().includes(q) || 
            (r.kodeFormula || '').toLowerCase().includes(q) ||
            (r.jenis || '').toLowerCase().includes(q) ||
            (r.posisiAktif || '').toLowerCase().includes(q) ||
            (r.lokasiAktif || '').toLowerCase().includes(q)
          );

          return {
            ...pos,
            matchingRolls,
            hasMatch: matchingRolls.length > 0 || (pos.name || '').toLowerCase().includes(q)
          };
        }).filter(pos => pos.hasMatch || rack.rackName.toLowerCase().includes(q) || block.title.toLowerCase().includes(q));

        return {
          ...rack,
          positions: filteredPositions,
          hasMatch: filteredPositions.length > 0 || rack.rackName.toLowerCase().includes(q)
        };
      }).filter(r => r.hasMatch || block.title.toLowerCase().includes(q));

      return {
        ...block,
        racks: filteredRacks,
        hasMatch: filteredRacks.length > 0 || block.title.toLowerCase().includes(q)
      };
    }).filter(b => b.hasMatch);
  }
  return blocks;
});

// ── BATCH METHODS ──

const getBatchRollCount = (update) => {
  if (update.totalRolls !== undefined) return update.totalRolls;
  const bId = update.uuid || update.id;
  return wipStore.wipRolls.filter(r => r.updateId === bId || String(r.updateId) === String(update.id)).length;
};

const getBatchTotalKg = (update) => {
  if (update.totalKg !== undefined) return update.totalKg;
  const bId = update.uuid || update.id;
  const rolls = wipStore.wipRolls.filter(r => r.updateId === bId || String(r.updateId) === String(update.id));
  return rolls.reduce((acc, r) => acc + (parseFloat(r.beratAktual) || 0), 0);
};

const openDetailView = (update) => {
  currentDetailBatch.value = update;
  wipStore.selectedUpdateId = update.uuid || update.id;
  resetRollFilters();
  isDetailViewOpen.value = true;
};

const makeActiveUpdate = async (update) => {
  await wipStore.setActiveUpdate(update);
  if (currentDetailBatch.value && (currentDetailBatch.value.id === update.id || currentDetailBatch.value.uuid === update.uuid)) {
    currentDetailBatch.value.isActive = 1;
  }
};

const startRenameUpdate = (update) => {
  editingUpdateId.value = update.id || update.uuid;
  editingUpdateTitle.value = update.title;
};

const saveUpdateTitle = async (update) => {
  if (editingUpdateTitle.value.trim()) {
    await wipStore.renameWipUpdate(update.id || update.uuid, editingUpdateTitle.value);
  }
  editingUpdateId.value = null;
};

const handleDeleteUpdate = async (update) => {
  if (confirm(`Hapus seluruh data sesi update "${update.title}" (${getBatchRollCount(update)} roll) secara permanen?`)) {
    await wipStore.deleteWipUpdate(update.id || update.uuid);
    if (currentDetailBatch.value && (currentDetailBatch.value.id === update.id || currentDetailBatch.value.uuid === update.uuid)) {
      isDetailViewOpen.value = false;
    }
  }
};

const resetRollFilters = () => {
  searchRollTerm.value = '';
  filterJenis.value = '';
  filterFormula.value = '';
  filterStatus.value = '';
  filterAging.value = '';
  sortRollBy.value = 'default';
  currentRollPage.value = 1;
};

// ── RACK SLOTS & MOVE LOCATION METHODS ──

const openRackSlotsModal = (rack) => {
  selectedRack.value = rack;
  showRackSlotsModal.value = true;
};

const openMoveLocationModal = (roll) => {
  movingRoll.value = roll;
  moveTargetLocation.value = roll.lokasiAktif || 'RAK A1A2';
  moveTargetPosition.value = roll.posisiAktif || 'BAWAH';
  showMoveLocationModal.value = true;
};

const executeMoveLocation = async () => {
  if (!movingRoll.value) return;
  const rollId = movingRoll.value.id;
  await wipStore.updateWipRoll(rollId, {
    lokasiAktif: moveTargetLocation.value,
    posisiAktif: moveTargetPosition.value
  });
  showMoveLocationModal.value = false;

  // Refresh selected rack if open
  if (selectedRack.value) {
    const updated = wipLocationCards.value.find(r => r.nama === selectedRack.value.nama);
    if (updated) selectedRack.value = updated;
  }
};

// ── IMPORT & UPLOAD METHODS ──

const openImportModal = () => {
  importTitle.value = `Update Stok WIP ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  importTanggal.value = new Date().toISOString().slice(0, 10);
  importMakeActive.value = true;
  uploadedFileName.value = '';
  copasText.value = '';
  parsedPreviewRolls.value = [];
  showImportModal.value = true;
};

const handleFileChange = async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  uploadedFileName.value = file.name;
  await parseExcelFile(file);
};

const handleFileDrop = async (e) => {
  const file = e.dataTransfer.files?.[0];
  if (!file) return;
  uploadedFileName.value = file.name;
  await parseExcelFile(file);
};

const parseExcelFile = async (file) => {
  try {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: 'array' });
    
    let parsed = [];
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      // 1. Try array of rows
      const rawJson = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      if (rawJson && rawJson.length > 0) {
        for (const row of rawJson) {
          if (!row || !Array.isArray(row) || row.length === 0) continue;
          const roll = parseWipRowData(row);
          if (roll && roll.lot) {
            roll.lokasiAktif = configStore.normalizeLocation(roll.lokasiAktif, 'WIP JUMBO');
            parsed.push(roll);
          }
        }
      }

      // 2. If nothing parsed, try object rows
      if (parsed.length === 0) {
        const rowObjects = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        for (const obj of rowObjects) {
          const roll = parseWipRowData(obj);
          if (roll && roll.lot) {
            roll.lokasiAktif = configStore.normalizeLocation(roll.lokasiAktif, 'WIP JUMBO');
            parsed.push(roll);
          }
        }
      }

      if (parsed.length > 0) break;
    }

    if (parsed.length === 0) {
      alert('Tidak ada baris data WIP yang berhasil diekstrak. Pastikan file Excel berisi kolom Lot/Code atau spesifikasi WIP.');
    }

    parsedPreviewRolls.value = parsed;
  } catch (err) {
    alert('Gagal membaca file Excel: ' + err.message);
  }
};

const handleWipPasteClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        copasText.value = text;
        parseCopasTextNow();
        return;
      }
    }
  } catch (err) {
    //
  }
  alert('Silakan klik di dalam kotak teks lalu tekan Ctrl + V pada keyboard.');
};

const parseCopasTextNow = () => {
  const text = copasText.value;
  if (!text || !text.trim()) {
    parsedPreviewRolls.value = [];
    return;
  }

  const raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = raw.split('\n');
  const parsed = [];

  for (const line of lines) {
    if (!line || !line.trim()) continue;

    let cols = [];
    if (line.includes('\t')) {
      cols = line.split('\t').map(c => c.trim());
    } else if (line.includes(';')) {
      cols = line.split(';').map(c => c.trim());
    } else if (line.includes(',')) {
      cols = line.split(',').map(c => c.trim());
    } else if (/\s{2,}/.test(line.trim())) {
      cols = line.trim().split(/\s{2,}/).map(c => c.trim());
    } else {
      cols = [line.trim()];
    }

    if (cols.length === 0 || !cols[0]) continue;

    const roll = parseWipRowData(cols);
    if (roll && roll.lot) {
      roll.lokasiAktif = configStore.normalizeLocation(roll.lokasiAktif, 'WIP JUMBO');
      parsed.push(roll);
    }
  }

  parsedPreviewRolls.value = parsed;
};

watch(copasText, () => {
  parseCopasTextNow();
});

const executeImportWip = async () => {
  if (parsedPreviewRolls.value.length === 0) return;

  try {
    // 1. Auto-register any new locations to Data Configuration
    const uniqueLocations = [...new Set(parsedPreviewRolls.value.map(r => r.lokasiAktif).filter(Boolean))];
    await configStore.autoRegisterDiscoveredLocations(uniqueLocations, 'WIP JUMBO');

    const newBatch = await wipStore.createWipUpdate({
      title: importTitle.value.trim() || `Update Stok WIP ${new Date().toLocaleDateString('id-ID')}`,
      tanggal: importTanggal.value,
      fileName: uploadedFileName.value || (importMode.value === 'copas' ? 'Copas_Excel_Table' : 'Upload_WIP.xlsx'),
      rawRollsList: parsedPreviewRolls.value,
      makeActive: importMakeActive.value
    });

    showImportModal.value = false;
    alert(`⚡ Sukses: Berhasil membuat sesi update "${newBatch.title}" berisi ${newBatch.totalRolls} roll.`);
  } catch (err) {
    alert('Gagal menyimpan import WIP: ' + err.message);
  }
};

// ── SINGLE ROLL METHODS ──

const openSingleRollModal = (roll = null) => {
  if (roll) {
    editingRollId.value = roll.id;
    Object.assign(rollForm, roll);
  } else {
    editingRollId.value = null;
    rollForm.lot = '';
    rollForm.spk = '';
    rollForm.jenis = 'CPP';
    rollForm.kodeFormula = 'M07';
    rollForm.thickness = 20;
    rollForm.width = 1000;
    rollForm.length = 6000;
    rollForm.core = 6;
    rollForm.od = '';
    rollForm.tanda = '';
    rollForm.beratAktual = 0;
    rollForm.lokasiAktif = 'RAK A1A2';
    rollForm.posisiAktif = 'R-1';
    rollForm.status = 'AVAILABLE';
    rollForm.keterangan = '';
  }
  showSingleRollModal.value = true;
};

const saveSingleRoll = async () => {
  if (!rollForm.lot.trim()) {
    alert('No Lot wajib diisi!');
    return;
  }

  // Normalize location & ensure exists in master
  const rawLoc = rollForm.lokasiAktif || 'STAGING';
  const cleanLoc = await configStore.ensureLocationExists(rawLoc, 'WIP JUMBO');
  rollForm.lokasiAktif = cleanLoc;

  if (editingRollId.value) {
    await wipStore.updateWipRoll(editingRollId.value, { ...rollForm });
  } else {
    const targetUpdateId = currentDetailBatch.value ? (currentDetailBatch.value.uuid || currentDetailBatch.value.id) : null;
    await wipStore.addWipRoll({ ...rollForm }, targetUpdateId);
  }

  showSingleRollModal.value = false;
};

const handleDeleteRoll = async (roll) => {
  if (confirm(`Hapus data roll No Lot ${roll.lot}?`)) {
    await wipStore.deleteWipRoll(roll.id);
  }
};

// ── EXPORT EXCEL ──

const exportBatchToExcel = (batch) => {
  if (!batch) return;
  const bId = batch.uuid || batch.id;
  const rolls = wipStore.wipRolls.filter(r => r.updateId === bId || String(r.updateId) === String(batch.id));

  if (rolls.length === 0) {
    alert('Tidak ada data roll pada batch ini untuk diexport.');
    return;
  }

  const exportData = rolls.map((r, i) => ({
    No: i + 1,
    'No SPK': r.spk || '',
    'No Lot': r.lot || '',
    Jenis: r.jenis || '',
    Formula: r.kodeFormula || '',
    'Thickness (mic)': r.thickness,
    'Width (mm)': r.width,
    'Length (m)': r.length,
    'Core (inch)': r.core || 6,
    'Berat Aktual (kg)': r.beratAktual,
    'Berat Teori (kg)': r.beratTeori,
    Lokasi: r.lokasiAktif || 'STAGING',
    Posisi: r.posisiAktif || 'R-1',
    Status: r.status || 'AVAILABLE',
    'Description NAV': r.descriptionNav || '',
    'Description Excel': r.descriptionExcel || '',
    Keterangan: r.keterangan || ''
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'WIP_Stock');
  XLSX.writeFile(workbook, `${batch.title.replace(/[\/\s:]/g, '_')}.xlsx`);
};

const formatNumber = (val) => {
  const num = parseFloat(val);
  return isNaN(num) ? '0' : num.toLocaleString('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
};

const formatDateIndo = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};
</script>
