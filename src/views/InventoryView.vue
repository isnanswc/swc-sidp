<template>
  <div class="space-y-4 pb-12 animate-fade-in font-sans select-none">
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- TOP HEADER: IMS UNIFIED MODULE SWITCHER (FG ROLL vs WIP JUMBO)     -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div class="flex items-center gap-2">
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wide uppercase bg-red-100 text-red-900 border border-red-300">
            IMS Warehouse System
          </span>
          <span class="text-zinc-400">•</span>
          <span class="text-xs font-semibold text-zinc-500">
            Finished Goods Roll Management & Racks
          </span>
        </div>
        <h1 class="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mt-0.5">
          Roll Management (Finished Goods)
        </h1>
        <p class="text-xs text-zinc-500 mt-0.5">
          Kelola data stok harian Roll FG (27 Kolom Lengkap), tetapkan 1 acuan stok aktif, dan pantau denah posisi rak FG.
        </p>
      </div>

      <!-- Module Selector Toggle -->
      <div class="flex items-center bg-zinc-950 p-1 rounded-xl border border-zinc-800 gap-1 text-xs shrink-0 shadow-md">
        <button
          class="px-4 py-2 rounded-lg font-black transition-all flex items-center gap-2 bg-red-600 text-white shadow-sm shadow-red-600/30"
        >
          <span>📦 1. Stok FG Roll</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-black/40 text-white">
            {{ inventoryStore.totalStockRolls }}
          </span>
        </button>

        <button
          @click="$router.push('/wip')"
          class="px-4 py-2 rounded-lg font-bold transition-all flex items-center gap-2 text-zinc-400 hover:text-white hover:bg-zinc-800 cursor-pointer"
        >
          <span>🛢️ 2. Stok WIP Jumbo ➔</span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ROLL MANAGEMENT (FINISHED GOODS)                                    -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="space-y-4 animate-fade-in">
      
      <!-- SUB-SHEET SWITCHER FOR FG ROLL -->
      <div class="bg-white p-1.5 rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
        <button
          @click="activeFgTab = 'stock'"
          :class="[
            'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
            activeFgTab === 'stock'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          ]"
        >
          <span>📦</span>
          <span>1. Stock Roll (Aktif)</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-red-600 text-white font-mono font-bold">
            {{ inventoryStore.totalStockRolls }} Roll
          </span>
        </button>

        <button
          @click="activeFgTab = 'updates'"
          :class="[
            'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
            activeFgTab === 'updates'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          ]"
        >
          <span>📑</span>
          <span>2. Riwayat Update Stok Roll</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-700 text-white font-mono font-bold">
            {{ inventoryStore.stockUploads.length }} Sesi
          </span>
        </button>

        <button
          @click="activeFgTab = 'location'"
          :class="[
            'px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shrink-0',
            activeFgTab === 'location'
              ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          ]"
        >
          <span>🗺️</span>
          <span>3. Roll Location (Denah & Posisi Rak FG)</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 text-blue-900 font-mono font-bold">
            {{ allOccupiedRacksCount }} Rak Terisi
          </span>
        </button>
      </div>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 1: STOCK ROLL FG (AKTIF)                                      -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <div v-if="activeFgTab === 'stock'" class="space-y-4 animate-fade-in">
        
        <!-- PROMINENT ACTIVE BATCH BANNER -->
        <div class="bg-emerald-50 border-2 border-emerald-400 p-3.5 sm:p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shrink-0">
              ✓
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white font-mono">
                  ★ ACUAN STOK SAAT INI
                </span>
                <span class="text-xs font-bold text-emerald-950">
                  {{ inventoryStore.activeUpload ? inventoryStore.activeUpload.fileName : 'Data Stok Aktif' }}
                </span>
              </div>
              <p class="text-xs text-emerald-800 font-medium mt-0.5">
                Tanggal: <strong>{{ inventoryStore.activeUpload ? inventoryStore.activeUpload.uploadDate : inventoryStore.lastUploadDate }}</strong> &nbsp;•&nbsp; 
                Total: <strong>{{ (inventoryStore.currentStocks || []).length }} SKU</strong> (<strong>{{ inventoryStore.totalStockRolls }} Roll</strong> / <strong>{{ formatNumber(inventoryStore.totalStockKg) }} kg</strong>) &nbsp;•&nbsp; 
                Pengunggah: {{ inventoryStore.activeUpload ? (inventoryStore.activeUpload.uploadedBy || 'Admin') : 'Admin' }}
              </p>
            </div>
          </div>

          <button
            @click="activeFgTab = 'updates'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-white text-emerald-900 hover:bg-emerald-100 border border-emerald-300 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <span>📑 Ganti Acuan Sesi ➔</span>
          </button>
        </div>

        <!-- Metrics Dashboard Mini Cards -->
        <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <!-- Card 1: Total Roll -->
          <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            <div class="flex items-center justify-between text-zinc-500 text-[11px] font-bold">
              <span>Total Roll FG</span>
              <span>📦</span>
            </div>
            <p class="text-xl font-black text-zinc-900 mt-1 font-mono">
              {{ formatNumber(inventoryStore.totalStockRolls) }} <span class="text-xs font-normal text-zinc-400 font-sans">Roll</span>
            </p>
          </div>

          <!-- Card 2: Total Berat -->
          <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            <div class="flex items-center justify-between text-blue-700 text-[11px] font-bold">
              <span>Total Berat FG</span>
              <span>⚖️</span>
            </div>
            <p class="text-xl font-black text-blue-800 mt-1 font-mono">
              {{ formatNumber(inventoryStore.totalStockKg) }} <span class="text-xs font-normal text-blue-600 font-sans">kg</span>
            </p>
          </div>

          <!-- Card 3: Total Panjang -->
          <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            <div class="flex items-center justify-between text-amber-700 text-[11px] font-bold">
              <span>Total Panjang</span>
              <span>📏</span>
            </div>
            <p class="text-xl font-black text-amber-800 mt-1 font-mono">
              {{ formatNumber(inventoryStore.totalStockPanjang) }} <span class="text-xs font-normal text-amber-600 font-sans">M</span>
            </p>
          </div>

          <!-- Card 4: Total di Rak FG -->
          <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs">
            <div class="flex items-center justify-between text-purple-700 text-[11px] font-bold">
              <span>Roll di Rak FG</span>
              <span>🏢</span>
            </div>
            <p class="text-xl font-black text-purple-800 mt-1 font-mono">
              {{ formatNumber(totalRollInRacks) }} <span class="text-xs font-normal text-purple-600 font-sans">Roll</span>
            </p>
          </div>

          <!-- Card 5: Sebaran Area A-E -->
          <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs col-span-2 sm:col-span-1">
            <div class="flex items-center justify-between text-emerald-700 text-[11px] font-bold">
              <span>Sebaran Area</span>
              <span>📍</span>
            </div>
            <p class="text-xs font-black text-zinc-800 mt-1.5 font-mono flex items-center justify-between">
              <span>A:{{ areaTotals.A }}</span>
              <span>B:{{ areaTotals.B }}</span>
              <span>C:{{ areaTotals.C }}</span>
              <span>D:{{ areaTotals.D }}</span>
              <span>E:{{ areaTotals.E }}</span>
            </p>
          </div>
        </div>

        <!-- Action & Multi-Criteria Filter Ribbon -->
        <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
          <!-- Row 1: Search, View Mode, Export, Column Setup -->
          <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            <div class="relative flex-1 max-w-lg">
              <input
                v-model="stockSearch"
                type="text"
                placeholder="Cari Description Excel, NAV, Source No, Formula, List Rak (e.g. J4, K4)..."
                class="w-full pl-8 pr-7 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none bg-zinc-50 font-medium"
              />
              <span class="absolute left-2.5 top-2.5 text-xs text-zinc-400">🔍</span>
              <button v-if="stockSearch" @click="stockSearch = ''" class="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
            </div>

            <div class="flex items-center gap-2 flex-wrap justify-end">
              <!-- Column Setup Dropdown -->
              <div class="relative">
                <button
                  @click="showColumnConfig = !showColumnConfig"
                  class="px-3 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Atur kolom tabel 27 kolom"
                >
                  <span>⚙️</span>
                  <span>Atur Kolom ({{ activeVisibleColsCount }}/27)</span>
                  <span class="text-[9px]">▼</span>
                </button>

                <div
                  v-if="showColumnConfig"
                  class="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-zinc-200 shadow-2xl p-3 z-50 space-y-2 text-xs animate-fade-in"
                >
                  <div class="flex items-center justify-between pb-1.5 border-b border-zinc-100 font-bold text-zinc-800">
                    <span>Tampilkan Kolom (27 Kolom)</span>
                    <button @click="resetColumnsToAll" class="text-[10px] text-blue-600 hover:underline cursor-pointer">Pilih Semua</button>
                  </div>
                  <div class="max-h-64 overflow-y-auto space-y-1 py-1">
                    <label
                      v-for="col in columnList"
                      :key="col.key"
                      class="flex items-center justify-between px-2 py-1 rounded-lg hover:bg-zinc-50 cursor-pointer select-none"
                    >
                      <span class="text-zinc-700 font-medium text-[11px]">{{ col.label }}</span>
                      <input
                        type="checkbox"
                        v-model="visibleCols[col.key]"
                        class="rounded text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <!-- Export to Excel Button -->
              <button
                @click="exportStockTersediaExcel"
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <span>Export Excel</span>
              </button>

              <!-- Quick Add / Update Stock Button -->
              <button
                @click="openUploadModal"
                class="px-3.5 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs font-black"
              >
                <span>+ Update Stok FG</span>
              </button>
            </div>
          </div>

          <!-- Row 2: Filters -->
          <div class="flex flex-wrap items-center gap-2 pt-2 border-t border-zinc-100 text-xs font-medium">
            <span class="text-[11px] font-bold text-zinc-400">Filter Cepat:</span>
            
            <!-- Filter Jenis Film -->
            <select
              v-model="filterJenis"
              class="px-2.5 py-1 border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-700 font-bold outline-none text-xs"
            >
              <option value="ALL">Semua Jenis Film</option>
              <option v-for="j in uniqueJenisList" :key="j" :value="j">{{ j }}</option>
            </select>

            <!-- Filter Area -->
            <select
              v-model="filterArea"
              class="px-2.5 py-1 border border-zinc-300 rounded-lg bg-zinc-50 text-zinc-700 font-bold outline-none text-xs"
            >
              <option value="ALL">Semua Area (A–E)</option>
              <option value="A">Ada di Area A</option>
              <option value="B">Ada di Area B</option>
              <option value="C">Ada di Area C</option>
              <option value="D">Ada di Area D</option>
              <option value="E">Ada di Area E</option>
              <option value="RAK">Khusus Berada di Rak FG</option>
            </select>
          </div>
        </div>

        <!-- ═══════════════════════════════════════════════════════════════ -->
        <!-- COMPLETE 27-COLUMN DATA TABLE WITH STICKY HEADERS               -->
        <!-- ═══════════════════════════════════════════════════════════════ -->
        <div class="bg-white rounded-2xl border border-zinc-300 shadow-xs overflow-hidden">
          <div class="p-2.5 bg-blue-50 border-b border-blue-200 text-xs flex items-center justify-between text-blue-950 font-medium">
            <div class="flex items-center gap-2">
              <span>📋 <strong>Tabel Stok Roll FG (27 Kolom Lengkap):</strong> Menampilkan data spesifikasi lengkap, sebaran area A–E, dan lokasi rak.</span>
            </div>
            <span class="text-[11px] text-blue-700 font-bold font-mono">Menampilkan {{ filteredCurrentStocks.length }} SKU</span>
          </div>

          <div class="overflow-x-auto max-h-[65vh]">
            <table class="w-full text-left text-xs border-collapse table-auto min-w-max">
              <thead class="bg-zinc-900 text-white sticky top-0 z-10 font-mono text-[10.5px]">
                <tr>
                  <th class="py-3 px-3 text-center w-10 border-r border-zinc-800 whitespace-nowrap sticky left-0 z-20 bg-zinc-900">#</th>
                  <th v-if="visibleCols.descExcel" class="py-3 px-4 border-r border-zinc-800 whitespace-nowrap sticky left-10 z-20 bg-zinc-900">
                    1. Description Excel
                  </th>
                  <th v-if="visibleCols.descNav" class="py-3 px-4 border-r border-zinc-800 whitespace-nowrap">2. Description NAV</th>
                  <th v-if="visibleCols.sourceNo" class="py-3 px-3 border-r border-zinc-800 whitespace-nowrap">3. Source No.</th>
                  <th v-if="visibleCols.jenis" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap">4. Jenis</th>
                  <th v-if="visibleCols.formula" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap">5. Formula</th>
                  <th v-if="visibleCols.thickness" class="py-3 px-3 border-r border-zinc-800 text-right whitespace-nowrap">6. Thick (μ)</th>
                  <th v-if="visibleCols.width" class="py-3 px-3 border-r border-zinc-800 text-right whitespace-nowrap">7. Width (mm)</th>
                  <th v-if="visibleCols.length" class="py-3 px-3 border-r border-zinc-800 text-right whitespace-nowrap">8. Length (m)</th>
                  <th v-if="visibleCols.core" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap">9. Core</th>
                  <th v-if="visibleCols.od" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap">10. OD</th>
                  <th v-if="visibleCols.tanda" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap">11. Tanda</th>
                  <th v-if="visibleCols.density" class="py-3 px-3 border-r border-zinc-800 text-right whitespace-nowrap">12. Density</th>
                  <th v-if="visibleCols.weight" class="py-3 px-3 border-r border-zinc-800 text-right whitespace-nowrap">13. Weight/Roll</th>
                  <th v-if="visibleCols.keterangan" class="py-3 px-3 border-r border-zinc-800 whitespace-nowrap">14. Keterangan</th>
                  <th v-if="visibleCols.lastProd" class="py-3 px-3 border-r border-zinc-800 whitespace-nowrap">15. Last Prod</th>
                  <th v-if="visibleCols.lastTransfer" class="py-3 px-3 border-r border-zinc-800 whitespace-nowrap">16. Last Transfer</th>
                  <th v-if="visibleCols.moving" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap">17. Moving</th>
                  <!-- 3 Quantity Columns -->
                  <th v-if="visibleCols.tPanjang" class="py-3 px-4 border-r border-zinc-800 text-right whitespace-nowrap bg-zinc-800/90 text-amber-300">
                    18. T.Panjang (M)
                  </th>
                  <th v-if="visibleCols.tBerat" class="py-3 px-4 border-r border-zinc-800 text-right whitespace-nowrap bg-zinc-800/90 text-blue-300">
                    19. T.Berat (kg)
                  </th>
                  <th v-if="visibleCols.tRoll" class="py-3 px-4 border-r border-zinc-800 text-right whitespace-nowrap bg-zinc-800/90 text-emerald-300 font-black">
                    20. T.Roll
                  </th>
                  <!-- Area Breakdown -->
                  <th v-if="visibleCols.areaA" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap bg-zinc-800">21. Area A</th>
                  <th v-if="visibleCols.areaB" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap bg-zinc-800">22. Area B</th>
                  <th v-if="visibleCols.areaC" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap bg-zinc-800">23. Area C</th>
                  <th v-if="visibleCols.areaD" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap bg-zinc-800">24. Area D</th>
                  <th v-if="visibleCols.areaE" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap bg-zinc-800">25. Area E</th>
                  <th v-if="visibleCols.qtyRak" class="py-3 px-3 border-r border-zinc-800 text-center whitespace-nowrap text-purple-300">26. Qty Rak</th>
                  <th v-if="visibleCols.listRak" class="py-3 px-3 whitespace-nowrap text-yellow-300">27. List Rak FG</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-200 text-zinc-800 text-[11px]">
                <tr
                  v-for="(stock, idx) in paginatedCurrentStocks"
                  :key="stock.id || idx"
                  class="hover:bg-blue-50/40 transition-colors font-medium"
                >
                  <!-- 0. Index -->
                  <td class="py-2.5 px-3 text-center font-mono font-bold text-zinc-500 bg-zinc-50/90 whitespace-nowrap sticky left-0 z-10">
                    {{ (stockPage - 1) * stockPageSize + idx + 1 }}
                  </td>
                  
                  <!-- 1. Description Excel -->
                  <td v-if="visibleCols.descExcel" class="py-2.5 px-4 font-bold text-zinc-900 whitespace-nowrap sticky left-10 z-10 bg-white shadow-2xs">
                    {{ stock.descriptionExcel }}
                  </td>

                  <!-- 2. Description NAV -->
                  <td v-if="visibleCols.descNav" class="py-2.5 px-4 text-blue-900 font-mono whitespace-nowrap">
                    {{ stock.descriptionNav || stock.descriptionExcel }}
                  </td>

                  <!-- 3. Source No -->
                  <td v-if="visibleCols.sourceNo" class="py-2.5 px-3 font-mono text-zinc-600 whitespace-nowrap">
                    {{ stock.sourceNo || '-' }}
                  </td>

                  <!-- 4. Jenis -->
                  <td v-if="visibleCols.jenis" class="py-2.5 px-3 text-center font-bold text-zinc-700 whitespace-nowrap">
                    <span class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 text-[10px]">
                      {{ stock.jenis || 'CPP' }}
                    </span>
                  </td>

                  <!-- 5. Kode Formula -->
                  <td v-if="visibleCols.formula" class="py-2.5 px-3 text-center font-bold text-zinc-800 whitespace-nowrap font-mono">
                    {{ stock.kodeFormula || '-' }}
                  </td>

                  <!-- 6. Thickness -->
                  <td v-if="visibleCols.thickness" class="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    {{ stock.thickness }}
                  </td>

                  <!-- 7. Width -->
                  <td v-if="visibleCols.width" class="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    {{ stock.width }}
                  </td>

                  <!-- 8. Length -->
                  <td v-if="visibleCols.length" class="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    {{ stock.length }}
                  </td>

                  <!-- 9. Core -->
                  <td v-if="visibleCols.core" class="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                    {{ stock.core }}"
                  </td>

                  <!-- 10. OD -->
                  <td v-if="visibleCols.od" class="py-2.5 px-3 text-center font-mono text-zinc-700 whitespace-nowrap">
                    {{ stock.od || '0' }}
                  </td>

                  <!-- 11. Tanda -->
                  <td v-if="visibleCols.tanda" class="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                    {{ stock.tanda || '-' }}
                  </td>

                  <!-- 12. Density -->
                  <td v-if="visibleCols.density" class="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    {{ stock.density }}
                  </td>

                  <!-- 13. Weight per roll -->
                  <td v-if="visibleCols.weight" class="py-2.5 px-3 text-right font-mono whitespace-nowrap">
                    {{ stock.weight }}
                  </td>

                  <!-- 14. Keterangan -->
                  <td v-if="visibleCols.keterangan" class="py-2.5 px-3 text-zinc-600 whitespace-nowrap">
                    {{ stock.keterangan || '-' }}
                  </td>

                  <!-- 15. Last Production -->
                  <td v-if="visibleCols.lastProd" class="py-2.5 px-3 font-mono text-zinc-600 whitespace-nowrap">
                    {{ stock.lastProduction || '-' }}
                  </td>

                  <!-- 16. Last Transfer -->
                  <td v-if="visibleCols.lastTransfer" class="py-2.5 px-3 font-mono text-zinc-600 whitespace-nowrap">
                    {{ stock.lastTransfer || '-' }}
                  </td>

                  <!-- 17. Moving -->
                  <td v-if="visibleCols.moving" class="py-2.5 px-3 text-center whitespace-nowrap">
                    <span
                      v-if="stock.moving"
                      :class="[
                        'px-1.5 py-0.5 rounded text-[10px] font-bold font-mono',
                        stock.moving.includes('FAST') ? 'bg-emerald-100 text-emerald-800' :
                        stock.moving.includes('SLOW') ? 'bg-amber-100 text-amber-800' :
                        'bg-zinc-100 text-zinc-700'
                      ]"
                    >
                      {{ stock.moving }}
                    </span>
                    <span v-else class="text-zinc-400">-</span>
                  </td>

                  <!-- 18. T.Panjang -->
                  <td v-if="visibleCols.tPanjang" class="py-2.5 px-4 text-right font-mono font-bold text-amber-700 whitespace-nowrap bg-amber-50/30">
                    {{ formatNumber(stock.totalPanjang) }}
                  </td>

                  <!-- 19. T.Berat -->
                  <td v-if="visibleCols.tBerat" class="py-2.5 px-4 text-right font-mono font-bold text-blue-800 whitespace-nowrap bg-blue-50/30">
                    {{ formatNumber(stock.totalKg) }}
                  </td>

                  <!-- 20. T.Roll -->
                  <td v-if="visibleCols.tRoll" class="py-2.5 px-4 text-right font-mono font-black text-sm text-emerald-800 whitespace-nowrap bg-emerald-50/30">
                    {{ stock.totalRoll }}
                  </td>

                  <!-- 21-25. Area A-E -->
                  <td v-if="visibleCols.areaA" class="py-2.5 px-3 text-center font-mono font-bold text-blue-700 bg-zinc-50/50 whitespace-nowrap">{{ stock.areaA || 0 }}</td>
                  <td v-if="visibleCols.areaB" class="py-2.5 px-3 text-center font-mono font-bold text-emerald-700 bg-zinc-50/50 whitespace-nowrap">{{ stock.areaB || 0 }}</td>
                  <td v-if="visibleCols.areaC" class="py-2.5 px-3 text-center font-mono font-bold text-amber-700 bg-zinc-50/50 whitespace-nowrap">{{ stock.areaC || 0 }}</td>
                  <td v-if="visibleCols.areaD" class="py-2.5 px-3 text-center font-mono font-bold text-purple-700 bg-zinc-50/50 whitespace-nowrap">{{ stock.areaD || 0 }}</td>
                  <td v-if="visibleCols.areaE" class="py-2.5 px-3 text-center font-mono font-bold text-rose-700 bg-zinc-50/50 whitespace-nowrap">{{ stock.areaE || 0 }}</td>

                  <!-- 26. Qty Rak -->
                  <td v-if="visibleCols.qtyRak" class="py-2.5 px-3 text-center font-mono font-black text-purple-800 whitespace-nowrap bg-purple-50/30">
                    {{ stock.qtyRak || 0 }}
                  </td>

                  <!-- 27. List Rak FG -->
                  <td v-if="visibleCols.listRak" class="py-2.5 px-3 whitespace-nowrap">
                    <div v-if="stock.listRak" class="flex flex-wrap items-center gap-1 max-w-[240px]">
                      <span
                        v-for="(rk, rkIdx) in String(stock.listRak).split(',').map(s => s.trim()).filter(Boolean)"
                        :key="rkIdx"
                        class="px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold font-mono text-[10px]"
                      >
                        {{ rk }}
                      </span>
                    </div>
                    <span v-else class="text-zinc-400 font-mono text-[11px]">—</span>
                  </td>
                </tr>

                <tr v-if="filteredCurrentStocks.length === 0">
                  <td colspan="28" class="p-10 text-center text-zinc-400">
                    <p class="font-bold text-sm text-zinc-700">Belum ada data stok Roll FG.</p>
                    <p class="text-xs text-zinc-400 mt-0.5">Silakan tambahkan data melalui tab <strong>2. Riwayat Update Stok Roll</strong>.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Footer Ringkasan & Pagination -->
          <div class="p-3 bg-zinc-50 border-t border-zinc-200 text-xs font-mono flex flex-wrap items-center justify-between gap-3 text-zinc-700">
            <div class="flex items-center gap-3">
              <div>TOTAL SKU: <strong class="text-zinc-900 font-bold">{{ filteredCurrentStocks.length }}</strong> Item</div>
              <span class="text-zinc-300">•</span>
              <div>Halaman: <strong class="text-zinc-900">{{ stockPage }} / {{ totalStockPages }}</strong></div>
            </div>

            <!-- Pagination Buttons -->
            <div class="flex items-center gap-1.5">
              <button
                type="button"
                :disabled="stockPage <= 1"
                @click="stockPage--"
                class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-sans font-bold text-xs cursor-pointer transition-all"
              >
                ◀ Prev
              </button>
              <span class="px-2.5 py-1 rounded-lg bg-zinc-900 text-white font-mono font-bold text-xs">
                {{ stockPage }} / {{ totalStockPages }}
              </span>
              <button
                type="button"
                :disabled="stockPage >= totalStockPages"
                @click="stockPage++"
                class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-sans font-bold text-xs cursor-pointer transition-all"
              >
                Next ▶
              </button>
            </div>

            <div class="flex items-center flex-wrap gap-4">
              <div>TOTAL T.PANJANG: <strong class="text-amber-700 text-sm font-black">{{ formatNumber(filteredTotalPanjang) }}</strong> M</div>
              <div>TOTAL T.BERAT: <strong class="text-blue-700 text-sm font-black">{{ formatNumber(filteredTotalKg) }}</strong> kg</div>
              <div>TOTAL T.ROL: <strong class="text-emerald-700 text-sm font-black">{{ formatNumber(filteredTotalRoll) }}</strong> Roll</div>
            </div>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 2: RIWAYAT UPDATE STOK ROLL FG (UPLOAD & COPAS 27 KOLOM)      -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <div v-if="activeFgTab === 'updates'" class="space-y-4 animate-fade-in">
        <!-- Header Banner & Action -->
        <div class="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h3 class="text-base font-black text-zinc-900">Riwayat Sesi Update Stok Roll FG</h3>
            <p class="text-xs text-zinc-500 mt-0.5">
              Setiap batch update tercatat di sini. Anda dapat mengubah sesi mana yang menjadi <strong>Acuan Stok Aktif</strong> kapan saja.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="downloadUploadTemplate"
              class="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>📥 Template 27 Kolom (.xlsx)</span>
            </button>

            <button
              @click="openUploadModal"
              class="px-4 py-2 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>+ Buat Update Stok Baru (27 Kolom)</span>
            </button>
          </div>
        </div>

        <!-- Log Table with Active Session Switcher -->
        <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-zinc-900 text-white font-bold text-[11px] uppercase font-mono">
                <tr>
                  <th class="p-3 text-center w-12">#</th>
                  <th class="p-3">Status Acuan</th>
                  <th class="p-3">Tanggal Upload</th>
                  <th class="p-3">Nama File / Keterangan Batch</th>
                  <th class="p-3 text-center">Jumlah SKU</th>
                  <th class="p-3 text-right">Total Roll</th>
                  <th class="p-3">Pengunggah</th>
                  <th class="p-3 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-100 font-medium">
                <tr
                  v-for="(u, idx) in inventoryStore.stockUploads"
                  :key="u.id"
                  :class="[
                    'transition-colors',
                    inventoryStore.activeUploadId === u.id
                      ? 'bg-emerald-50/60 font-bold border-l-4 border-emerald-500'
                      : 'hover:bg-zinc-50'
                  ]"
                >
                  <td class="p-3 text-center font-mono text-zinc-500">{{ idx + 1 }}</td>
                  
                  <!-- Status Acuan Badge -->
                  <td class="p-3">
                    <span
                      v-if="inventoryStore.activeUploadId === u.id"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white border border-emerald-700 shadow-xs flex items-center gap-1 w-max"
                    >
                      <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
                      <span>★ STOK ACUAN AKTIF</span>
                    </span>
                    <button
                      v-else
                      @click="inventoryStore.setActiveUpload(u.id)"
                      class="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-100 hover:bg-emerald-100 text-zinc-700 hover:text-emerald-800 border border-zinc-300 transition-colors cursor-pointer"
                    >
                      ☆ Jadikan Stok Aktif
                    </button>
                  </td>

                  <td class="p-3 font-mono font-bold text-zinc-900">{{ u.uploadDate }}</td>
                  <td class="p-3 font-bold text-blue-950">{{ u.fileName }}</td>
                  <td class="p-3 text-center font-mono font-bold">{{ u.totalSku }} SKU</td>
                  <td class="p-3 text-right font-mono font-black text-emerald-700 text-sm">{{ u.totalRoll }} Roll</td>
                  <td class="p-3 text-zinc-600">{{ u.uploadedBy || 'Admin' }}</td>
                  <td class="p-3 text-center">
                    <button
                      @click="deleteUpload(u)"
                      class="px-2.5 py-1 text-xs font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      Hapus
                    </button>
                  </td>
                </tr>

                <tr v-if="inventoryStore.stockUploads.length === 0">
                  <td colspan="8" class="p-10 text-center text-zinc-400">
                    <p class="font-bold text-sm text-zinc-700">Belum ada riwayat sesi update.</p>
                    <p class="text-xs text-zinc-400 mt-0.5">Klik tombol <strong>+ Buat Update Stok Baru</strong> untuk mulai memasukkan data 27 kolom.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- TAB 3: ROLL LOCATION (DENAH & STATUS RAK FG AREA A–E & DYNAMIC)   -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <div v-if="activeFgTab === 'location'" class="space-y-4 animate-fade-in">
        
        <!-- Header & Storage Type Filter -->
        <div class="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-900 border border-blue-200">
                  Denah Lokasi Gudang FG
                </span>
                <span class="text-zinc-400">•</span>
                <span class="text-xs font-semibold text-zinc-500">3 Tipe Penyimpanan Fisik Gudang</span>
              </div>
              <h3 class="text-base sm:text-lg font-black text-zinc-900 mt-0.5">
                Roll Location (Floor A–E, Rak FG A–M, & Rak Jumbo)
              </h3>
            </div>

            <!-- Filter Tipe Penyimpanan -->
            <div class="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 gap-1 text-xs font-bold flex-wrap">
              <button
                @click="filterStorageType = 'ALL'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black',
                  filterStorageType === 'ALL'
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                ]"
              >
                Semua Lokasi
              </button>
              <button
                @click="filterStorageType = 'FLOOR'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black',
                  filterStorageType === 'FLOOR'
                    ? 'bg-emerald-600 text-white shadow-xs shadow-emerald-600/30'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                ]"
              >
                🏢 1. Floor (Lantai A–E)
              </button>
              <button
                @click="filterStorageType = 'RAK_FG'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black',
                  filterStorageType === 'RAK_FG'
                    ? 'bg-blue-600 text-white shadow-xs shadow-blue-600/30'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                ]"
              >
                🧱 2. Rak FG (A–M Kolom 1–5)
              </button>
              <button
                @click="filterStorageType = 'RAK_JUMBO'"
                :class="[
                  'px-3 py-1.5 rounded-lg transition-all cursor-pointer font-black',
                  filterStorageType === 'RAK_JUMBO'
                    ? 'bg-amber-500 text-zinc-950 shadow-xs shadow-amber-500/30'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200'
                ]"
              >
                🏗️ 3. Rak Jumbo (Rel 4-Karakter)
              </button>
            </div>
          </div>

          <!-- Rule Box: Pembeda Fisik & Kapasitas Rak -->
          <div class="p-3.5 bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-200 rounded-xl text-xs flex items-start gap-3 text-blue-950">
            <span class="text-xl shrink-0">📐</span>
            <div class="space-y-1">
              <p class="font-black text-blue-900">Karakteristik & Aturan Dimensi Penyimpanan:</p>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] text-blue-900/90 pt-0.5">
                <div class="bg-white/80 p-2 rounded-lg border border-blue-100">
                  <strong>🏢 Area FLOOR (Lantai A - E):</strong>
                  <p class="text-zinc-600 mt-0.5">Lantai terbuka tanpa penomoran untuk transit & staging roll FG.</p>
                </div>
                <div class="bg-white/80 p-2 rounded-lg border border-blue-100">
                  <strong>🧱 RAK FG (Rak A - M Kolom 1 - 5):</strong>
                  <p class="text-zinc-600 mt-0.5">Khusus Roll FG (Max lebar 1.220 mm). Memanjang vertikal dari bawah ke atas.</p>
                </div>
                <div class="bg-white/80 p-2 rounded-lg border border-blue-100">
                  <strong>🏗️ RAK JUMBO (Rel 4-Char: A1A2..H3H4):</strong>
                  <p class="text-zinc-600 mt-0.5">Max lebar 2.500 mm. <strong>1 As Rak Jumbo dapat memuat hingga 2 Roll FG</strong>. WIP Jumbo tidak bisa masuk ke Rak FG.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═════════════════════════════════════════════════════════════ -->
        <!-- 1. PARENT 1: AREA FLOOR (LANTAI GUDANG A – E)                -->
        <!-- ═════════════════════════════════════════════════════════════ -->
        <div
          v-if="filterStorageType === 'ALL' || filterStorageType === 'FLOOR'"
          class="bg-white rounded-2xl border-2 border-emerald-200 shadow-xs overflow-hidden"
        >
          <!-- Level 1 Header: Floor Parent -->
          <div
            @click="expandedLocationParents.floor = !expandedLocationParents.floor"
            class="p-4 bg-gradient-to-r from-emerald-50/80 to-white hover:bg-emerald-50 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏢</span>
              <div>
                <h4 class="text-base font-black text-emerald-950 flex items-center gap-2">
                  <span>1. AREA FLOOR (Lantai Gudang Terbuka A – E)</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                    Lantai Terbuka
                  </span>
                </h4>
                <p class="text-xs text-emerald-800 mt-0.5">
                  Terbagi menjadi 5 Area (A, B, C, D, E) tanpa penomoran • Total di Lantai: <strong>{{ totalFloorRolls }} Roll</strong> (<strong>{{ formatNumber(totalFloorKg) }} kg</strong>)
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white font-mono shadow-xs">
                {{ totalFloorRolls }} Roll
              </span>
              <span class="text-emerald-700 font-bold text-sm transform transition-transform duration-200" :class="{ 'rotate-90': expandedLocationParents.floor }">
                ▶
              </span>
            </div>
          </div>

          <!-- Level 2 Content: Area A, B, C, D, E -->
          <div v-show="expandedLocationParents.floor" class="p-4 pt-2 border-t border-emerald-100 space-y-3 bg-emerald-50/20 animate-fade-in">
            <div
              v-for="letter in ['A', 'B', 'C', 'D', 'E']"
              :key="'floor_' + letter"
              class="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden"
            >
              <!-- Child Area Header -->
              <div
                @click="expandedFloorAreas[letter] = !expandedFloorAreas[letter]"
                class="p-3.5 hover:bg-emerald-50/40 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div class="flex items-center gap-2.5">
                  <span class="px-2.5 py-1 rounded-lg bg-emerald-900 text-white font-black font-mono text-xs">
                    Area {{ letter }}
                  </span>
                  <div>
                    <h5 class="text-xs font-black text-zinc-900">
                      Lantai Area {{ letter }}
                    </h5>
                    <p class="text-[11px] text-zinc-500 font-mono mt-0.2">
                      Terisi: <strong class="text-zinc-900">{{ getFloorSectorData(letter).totalRolls }} Roll</strong> ({{ formatNumber(getFloorSectorData(letter).totalKg) }} kg) • {{ getFloorSectorData(letter).items.length }} Jenis SKU
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded text-[10.5px] font-black font-mono',
                      getFloorSectorData(letter).totalRolls > 0 ? 'bg-emerald-100 text-emerald-900 border border-emerald-300' : 'bg-zinc-100 text-zinc-500'
                    ]"
                  >
                    {{ getFloorSectorData(letter).totalRolls }} Roll
                  </span>
                  <span class="text-zinc-400 font-bold text-xs transform transition-transform duration-200" :class="{ 'rotate-90': expandedFloorAreas[letter] }">
                    ▶
                  </span>
                </div>
              </div>

              <!-- Child Area Table List -->
              <div v-show="expandedFloorAreas[letter]" class="p-3 border-t border-zinc-100 bg-zinc-50/60 animate-fade-in overflow-x-auto">
                <table v-if="getFloorSectorData(letter).items.length > 0" class="w-full text-left text-[11px] font-mono border-collapse bg-white rounded-lg border border-zinc-200">
                  <thead class="bg-zinc-900 text-white text-[10px] font-bold">
                    <tr>
                      <th class="p-2 text-center w-8">#</th>
                      <th class="p-2 whitespace-nowrap">Description Excel</th>
                      <th class="p-2 whitespace-nowrap">Description NAV</th>
                      <th class="p-2 whitespace-nowrap">Source No</th>
                      <th class="p-2 text-center whitespace-nowrap">Spek (μ × W × L)</th>
                      <th class="p-2 text-right whitespace-nowrap text-emerald-300 font-black">Roll di Lantai</th>
                      <th class="p-2 text-right whitespace-nowrap text-blue-300">Total Berat</th>
                      <th class="p-2 whitespace-nowrap">Last Prod</th>
                      <th class="p-2 whitespace-nowrap">Moving</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200">
                    <tr
                      v-for="(itm, iIdx) in getFloorSectorData(letter).items"
                      :key="iIdx"
                      class="hover:bg-blue-50/40"
                    >
                      <td class="p-2 text-center text-zinc-500 font-bold">{{ iIdx + 1 }}</td>
                      <td class="p-2 font-bold text-zinc-900 whitespace-nowrap">{{ itm.item.descriptionExcel }}</td>
                      <td class="p-2 text-blue-900 whitespace-nowrap">{{ itm.item.descriptionNav || itm.item.descriptionExcel }}</td>
                      <td class="p-2 text-zinc-600 whitespace-nowrap">{{ itm.item.sourceNo || '-' }}</td>
                      <td class="p-2 text-center whitespace-nowrap">{{ itm.item.thickness }}μ × {{ itm.item.width }} × {{ itm.item.length }}</td>
                      <td class="p-2 text-right font-black text-emerald-700 whitespace-nowrap bg-emerald-50/50">{{ itm.rollCount }} Roll</td>
                      <td class="p-2 text-right font-bold text-blue-800 whitespace-nowrap">{{ formatNumber(itm.totalKg) }} kg</td>
                      <td class="p-2 text-zinc-600 whitespace-nowrap">{{ itm.item.lastProduction || '-' }}</td>
                      <td class="p-2 text-zinc-600 whitespace-nowrap">{{ itm.item.moving || '-' }}</td>
                    </tr>
                  </tbody>
                </table>
                <div v-else class="p-4 text-center text-xs text-zinc-400 italic">
                  Tidak ada roll FG yang disimpan di lantai Area {{ letter }}.
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═════════════════════════════════════════════════════════════ -->
        <!-- 2. PARENT 2: RAK FG (RAK A – M, KOLOM 1 – 5 VERTIKAL)        -->
        <!-- ═════════════════════════════════════════════════════════════ -->
        <div
          v-if="filterStorageType === 'ALL' || filterStorageType === 'RAK_FG'"
          class="bg-white rounded-2xl border-2 border-blue-200 shadow-xs overflow-hidden"
        >
          <!-- Level 1 Header: Rak FG Parent -->
          <div
            @click="expandedLocationParents.rakFg = !expandedLocationParents.rakFg"
            class="p-4 bg-gradient-to-r from-blue-50/80 to-white hover:bg-blue-50 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">🧱</span>
              <div>
                <h4 class="text-base font-black text-blue-950 flex items-center gap-2">
                  <span>2. RAK FG (Rak Khusus Finished Goods A – M)</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-900 border border-blue-300">
                    Max Lebar 1.220 mm
                  </span>
                </h4>
                <p class="text-xs text-blue-800 mt-0.5">
                  Rak A sampai Rak M • Kolom vertikal memanjang dari bawah ke atas (1 sampai 5) • Total di Rak FG: <strong>{{ totalFgRackRolls }} Roll</strong> (<strong>{{ formatNumber(totalFgRackKg) }} kg</strong>)
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-xs font-black bg-blue-600 text-white font-mono shadow-xs">
                {{ totalFgRackRolls }} Roll
              </span>
              <span class="text-blue-700 font-bold text-sm transform transition-transform duration-200" :class="{ 'rotate-90': expandedLocationParents.rakFg }">
                ▶
              </span>
            </div>
          </div>

          <!-- Level 2 Content: Rak A .. Rak M -->
          <div v-show="expandedLocationParents.rakFg" class="p-4 pt-2 border-t border-blue-100 space-y-3 bg-blue-50/20 animate-fade-in">
            <div
              v-for="rackLetter in fgRackLetterList"
              :key="'fg_rack_' + rackLetter"
              class="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden"
            >
              <!-- Child Rak Header -->
              <div
                @click="expandedFgRacks[rackLetter] = !expandedFgRacks[rackLetter]"
                class="p-3.5 hover:bg-blue-50/40 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
              >
                <div class="flex items-center gap-2.5">
                  <span class="px-2.5 py-1 rounded-lg bg-blue-900 text-white font-black font-mono text-xs">
                    Rak {{ rackLetter }}
                  </span>
                  <div>
                    <h5 class="text-xs font-black text-zinc-900">
                      Unit Rak {{ rackLetter }} (Kolom Vertikal {{ rackLetter }}1 s/d {{ rackLetter }}5)
                    </h5>
                    <p class="text-[11px] text-zinc-500 font-mono mt-0.2">
                      Terisi: <strong class="text-zinc-900">{{ getFgRackSummary(rackLetter).totalRolls }} Roll</strong> ({{ formatNumber(getFgRackSummary(rackLetter).totalKg) }} kg) di {{ getFgRackSummary(rackLetter).occupiedCols }} Kolom
                    </p>
                  </div>
                </div>

                <div class="flex items-center gap-2">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded text-[10.5px] font-black font-mono',
                      getFgRackSummary(rackLetter).totalRolls > 0 ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-zinc-100 text-zinc-500'
                    ]"
                  >
                    {{ getFgRackSummary(rackLetter).totalRolls }} Roll
                  </span>
                  <span class="text-zinc-400 font-bold text-xs transform transition-transform duration-200" :class="{ 'rotate-90': expandedFgRacks[rackLetter] }">
                    ▶
                  </span>
                </div>
              </div>

              <!-- Child Columns (A1 .. A5, K1 .. K5, etc.) -->
              <div v-show="expandedFgRacks[rackLetter]" class="p-3.5 border-t border-zinc-100 bg-zinc-50/60 animate-fade-in space-y-2.5">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
                  <div
                    v-for="colCode in getFgColumnsForRack(rackLetter)"
                    :key="colCode"
                    :class="[
                      'p-3 rounded-xl border transition-all',
                      getFgColumnData(colCode).totalRolls > 0
                        ? 'bg-white border-blue-300 ring-1 ring-blue-200 shadow-xs'
                        : 'bg-zinc-100/70 border-zinc-200 opacity-75'
                    ]"
                  >
                    <!-- Column Mini Header -->
                    <div class="flex items-center justify-between">
                      <span class="px-2 py-0.5 rounded bg-zinc-900 text-white font-mono font-black text-xs">
                        {{ colCode }}
                      </span>
                      <span
                        :class="[
                          'px-1.5 py-0.2 rounded text-[10px] font-bold',
                          getFgColumnData(colCode).totalRolls > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'
                        ]"
                      >
                        {{ getFgColumnData(colCode).totalRolls > 0 ? 'Terisi' : 'Kosong' }}
                      </span>
                    </div>

                    <!-- Column Summary -->
                    <div class="mt-2 text-xs">
                      <div class="flex items-center justify-between text-zinc-500 text-[11px]">
                        <span>Total:</span>
                        <strong class="font-mono text-zinc-900 text-xs">
                          {{ getFgColumnData(colCode).totalRolls }} Roll
                        </strong>
                      </div>

                      <!-- Stored Items in Column -->
                      <div v-if="getFgColumnData(colCode).items.length > 0" class="mt-1.5 pt-1 border-t border-zinc-100 space-y-1">
                        <div
                          v-for="(itm, cIdx) in getFgColumnData(colCode).items"
                          :key="cIdx"
                          class="p-1 rounded bg-zinc-50 border border-zinc-200 text-[10px] font-mono truncate"
                          :title="itm.descriptionExcel"
                        >
                          • {{ itm.descriptionExcel }} ({{ itm.totalRoll }} Roll)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ═════════════════════════════════════════════════════════════ -->
        <!-- 3. PARENT 3: RAK JUMBO (REL 4-CHAR DENGAN POSISI ATAS/TGH/BWH)-->
        <!-- ═════════════════════════════════════════════════════════════ -->
        <div
          v-if="filterStorageType === 'ALL' || filterStorageType === 'RAK_JUMBO'"
          class="bg-white rounded-2xl border-2 border-amber-300 shadow-xs overflow-hidden"
        >
          <!-- Level 1 Header: Rak Jumbo Parent -->
          <div
            @click="expandedLocationParents.rakJumbo = !expandedLocationParents.rakJumbo"
            class="p-4 bg-gradient-to-r from-amber-50/80 to-white hover:bg-amber-50 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
          >
            <div class="flex items-center gap-3">
              <span class="text-2xl">🏗️</span>
              <div>
                <h4 class="text-base font-black text-amber-950 flex items-center gap-2">
                  <span>3. RAK JUMBO (Rel 4-Karakter: A1A2, B3B4, H3H4 - Muat 2 Roll FG/As)</span>
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-400">
                    Max Lebar 2.500 mm (2 Roll FG/As)
                  </span>
                </h4>
                <p class="text-xs text-amber-900 mt-0.5">
                  Roll FG yang ditempatkan di rak jumbo berkapasitas 2 roll per as • Total FG di Rak Jumbo: <strong>{{ totalJumboFgRolls }} Roll</strong> (<strong>{{ formatNumber(totalJumboFgKg) }} kg</strong>)
                </p>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <span class="px-3 py-1 rounded-full text-xs font-black bg-amber-500 text-zinc-950 font-mono shadow-xs">
                {{ totalJumboFgRolls }} Roll
              </span>
              <span class="text-amber-800 font-bold text-sm transform transition-transform duration-200" :class="{ 'rotate-90': expandedLocationParents.rakJumbo }">
                ▶
              </span>
            </div>
          </div>

          <!-- Level 2 Content: Rak Jumbo Units -->
          <div v-show="expandedLocationParents.rakJumbo" class="p-4 pt-2 border-t border-amber-200 space-y-3 bg-amber-50/20 animate-fade-in">
            <div v-if="jumboRacksWithFg.length > 0" class="space-y-3">
              <div
                v-for="jumbo in jumboRacksWithFg"
                :key="'jumbo_' + jumbo.rackCode"
                class="bg-white rounded-xl border border-zinc-200 shadow-2xs overflow-hidden"
              >
                <!-- Child Jumbo Header -->
                <div
                  @click="expandedJumboRacks[jumbo.rackCode] = !expandedJumboRacks[jumbo.rackCode]"
                  class="p-3.5 hover:bg-amber-50/40 transition-colors cursor-pointer flex items-center justify-between gap-3 select-none"
                >
                  <div class="flex items-center gap-2.5">
                    <span class="px-2.5 py-1 rounded-lg bg-amber-500 text-zinc-950 font-black font-mono text-xs">
                      {{ jumbo.rackCode }}
                    </span>
                    <div>
                      <h5 class="text-xs font-black text-zinc-900">
                        Rak Jumbo {{ jumbo.rackCode }} (Posisi Bertingkat Rel)
                      </h5>
                      <p class="text-[11px] text-zinc-500 font-mono mt-0.2">
                        Terisi: <strong class="text-zinc-900">{{ jumbo.totalRolls }} Roll FG</strong> ({{ formatNumber(jumbo.totalKg) }} kg) • Kapasitas: 2 Roll FG per As
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded text-[10.5px] font-black font-mono bg-amber-100 text-amber-950 border border-amber-300">
                      {{ jumbo.totalRolls }} Roll FG
                    </span>
                    <span class="text-zinc-400 font-bold text-xs transform transition-transform duration-200" :class="{ 'rotate-90': expandedJumboRacks[jumbo.rackCode] }">
                      ▶
                    </span>
                  </div>
                </div>

                <!-- Child Jumbo Table List -->
                <div v-show="expandedJumboRacks[jumbo.rackCode]" class="p-3 border-t border-zinc-100 bg-zinc-50/60 animate-fade-in overflow-x-auto">
                  <table class="w-full text-left text-[11px] font-mono border-collapse bg-white rounded-lg border border-zinc-200">
                    <thead class="bg-zinc-900 text-white text-[10px] font-bold">
                      <tr>
                        <th class="p-2 text-center w-8">#</th>
                        <th class="p-2 whitespace-nowrap">Description Excel</th>
                        <th class="p-2 whitespace-nowrap">Description NAV</th>
                        <th class="p-2 text-center whitespace-nowrap">Spek (μ × W × L)</th>
                        <th class="p-2 text-center whitespace-nowrap text-amber-300">Muatan per As</th>
                        <th class="p-2 text-right whitespace-nowrap text-emerald-300 font-black">Total Roll FG</th>
                        <th class="p-2 text-right whitespace-nowrap text-blue-300">Total Berat</th>
                        <th class="p-2 whitespace-nowrap">List Rak Terkait</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-zinc-200">
                      <tr
                        v-for="(itm, jIdx) in jumbo.items"
                        :key="jIdx"
                        class="hover:bg-amber-50/30"
                      >
                        <td class="p-2 text-center text-zinc-500 font-bold">{{ jIdx + 1 }}</td>
                        <td class="p-2 font-bold text-zinc-900 whitespace-nowrap">{{ itm.descriptionExcel }}</td>
                        <td class="p-2 text-blue-900 whitespace-nowrap">{{ itm.descriptionNav || itm.descriptionExcel }}</td>
                        <td class="p-2 text-center whitespace-nowrap">{{ itm.thickness }}μ × {{ itm.width }} × {{ itm.length }}</td>
                        <td class="p-2 text-center whitespace-nowrap">
                          <span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold">
                            Max 2 Roll / As (Lebar {{ itm.width }} mm)
                          </span>
                        </td>
                        <td class="p-2 text-right font-black text-emerald-700 whitespace-nowrap bg-emerald-50/50">{{ itm.totalRoll }} Roll</td>
                        <td class="p-2 text-right font-bold text-blue-800 whitespace-nowrap">{{ formatNumber(itm.totalKg) }} kg</td>
                        <td class="p-2 text-zinc-600 whitespace-nowrap">{{ itm.listRak }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div v-else class="p-4 text-center text-xs text-zinc-400 italic bg-white rounded-xl border border-zinc-200">
              Saat ini tidak ada Roll FG yang ditempatkan di Rak Jumbo 4-Karakter.
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: UPLOAD & COPAS STOCK FG (27 KOLOM STANDAR)                   -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <teleport to="body">
      <div v-if="showUploadModal" class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/70 backdrop-blur-xs animate-fade-in">
        <div class="bg-white rounded-3xl border border-zinc-200 shadow-2xl max-w-5xl w-full p-5 sm:p-6 space-y-4 max-h-[90vh] overflow-y-auto">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-base font-black text-zinc-900 tracking-tight">
                📥 Update Saldo Stok Roll FG (27 Kolom Standar)
              </h3>
              <p class="text-xs text-zinc-500">
                Tempelkan baris dari Excel atau upload file <code>.xlsx</code> dengan 27 kolom lengkap.
              </p>
            </div>
            <button @click="showUploadModal = false" class="p-1 text-zinc-400 hover:text-zinc-700 font-bold text-base cursor-pointer">✕</button>
          </div>

          <!-- Parameters -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Tanggal Upload</label>
              <input v-model="stockUploadForm.date" type="date" class="w-full px-3 py-1.5 border border-zinc-300 rounded-xl font-mono outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Nama Sesi / File</label>
              <input v-model="stockUploadForm.fileName" type="text" placeholder="Saldo_FG_2026.xlsx" class="w-full px-3 py-1.5 border border-zinc-300 rounded-xl outline-none" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">User Pengunggah</label>
              <input v-model="stockUploadForm.uploadedBy" type="text" class="w-full px-3 py-1.5 border border-zinc-300 rounded-xl bg-zinc-50 outline-none" />
            </div>
          </div>

          <!-- Action Buttons above textarea -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-zinc-700">Paste / Tempel baris tabel Excel:</span>
              <div class="flex items-center gap-1.5">
                <button
                  type="button"
                  @click="handleFgPasteClipboard"
                  class="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-900 rounded-lg border border-blue-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>📋 Paste Clipboard</span>
                </button>
                <button
                  type="button"
                  @click="parseStockPaste"
                  class="px-2.5 py-1 text-[11px] font-black bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <span>⚡ Ekstrak Data</span>
                </button>
                <button
                  v-if="stockPasteRaw"
                  type="button"
                  @click="stockPasteRaw = ''; parsedStockRows = []"
                  class="px-2 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                >
                  <span>🗑️ Hapus</span>
                </button>
              </div>
            </div>
            <textarea
              v-model="stockPasteRaw"
              @input="parseStockPaste"
              rows="6"
              placeholder="Paste baris dari Excel (27 kolom tab-separated)..."
              class="w-full p-3 text-xs border border-zinc-300 rounded-xl font-mono outline-none focus:ring-1 focus:ring-blue-500 bg-zinc-50"
            ></textarea>
          </div>

          <!-- Preview Table with 27 Columns -->
          <div v-if="parsedStockRows.length > 0" class="space-y-2.5">
            <div class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between text-emerald-900 font-bold">
              <span>✓ Berhasil mengurai <strong>{{ parsedStockRows.length }}</strong> SKU</span>
              <span>Total: {{ totalParsedRolls }} Roll ({{ formatNumber(totalParsedKg) }} kg)</span>
            </div>

            <div class="overflow-x-auto max-h-60 border border-zinc-300 rounded-xl">
              <table class="w-full text-left text-[10.5px] font-mono border-collapse bg-white">
                <thead class="bg-zinc-900 text-white sticky top-0 font-bold text-[10px]">
                  <tr>
                    <th class="p-2 text-center">#</th>
                    <th class="p-2 whitespace-nowrap">Description Excel</th>
                    <th class="p-2 whitespace-nowrap">Description NAV</th>
                    <th class="p-2 whitespace-nowrap">Source No</th>
                    <th class="p-2 whitespace-nowrap">Jenis/Formula</th>
                    <th class="p-2 text-center whitespace-nowrap">Spek</th>
                    <th class="p-2 text-right whitespace-nowrap">T. Roll</th>
                    <th class="p-2 text-right whitespace-nowrap">T. Berat</th>
                    <th class="p-2 text-right whitespace-nowrap">T. Panjang</th>
                    <th class="p-2 text-center whitespace-nowrap">Area A–E</th>
                    <th class="p-2 text-center whitespace-nowrap">Qty Rak</th>
                    <th class="p-2 whitespace-nowrap">List Rak</th>
                    <th class="p-2 whitespace-nowrap">Last Prod</th>
                    <th class="p-2 whitespace-nowrap">Last Transfer</th>
                    <th class="p-2 whitespace-nowrap">Moving</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200">
                  <tr v-for="(r, idx) in parsedStockRows" :key="idx" class="hover:bg-blue-50/40">
                    <td class="p-2 text-center text-zinc-500">{{ idx + 1 }}</td>
                    <td class="p-2 font-bold text-zinc-900 whitespace-nowrap">{{ r.descriptionExcel }}</td>
                    <td class="p-2 text-blue-900 whitespace-nowrap">{{ r.descriptionNav }}</td>
                    <td class="p-2 font-mono whitespace-nowrap">{{ r.sourceNo }}</td>
                    <td class="p-2 whitespace-nowrap">{{ r.jenis }} / {{ r.kodeFormula }}</td>
                    <td class="p-2 text-center whitespace-nowrap">{{ r.thickness }}μ × {{ r.width }} × {{ r.length }}</td>
                    <td class="p-2 text-right font-black text-emerald-700 whitespace-nowrap">{{ r.totalRoll }} Roll</td>
                    <td class="p-2 text-right font-bold text-blue-800 whitespace-nowrap">{{ formatNumber(r.totalKg) }} kg</td>
                    <td class="p-2 text-right font-bold text-amber-700 whitespace-nowrap">{{ formatNumber(r.totalPanjang) }} M</td>
                    <td class="p-2 text-center font-bold whitespace-nowrap">{{ r.areaA }} | {{ r.areaB }} | {{ r.areaC }} | {{ r.areaD }} | {{ r.areaE }}</td>
                    <td class="p-2 text-center font-bold text-purple-800 whitespace-nowrap">{{ r.qtyRak || 0 }}</td>
                    <td class="p-2 whitespace-nowrap">
                      <span v-if="r.listRak" class="px-1.5 py-0.2 rounded bg-yellow-100 text-yellow-900 border border-yellow-300 font-bold text-[10px]">
                        {{ r.listRak }}
                      </span>
                      <span v-else class="text-zinc-400">—</span>
                    </td>
                    <td class="p-2 font-mono whitespace-nowrap">{{ r.lastProduction }}</td>
                    <td class="p-2 font-mono whitespace-nowrap">{{ r.lastTransfer }}</td>
                    <td class="p-2 whitespace-nowrap">{{ r.moving }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Dialog Actions -->
          <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button @click="showUploadModal = false" class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-100 cursor-pointer">
              Batal
            </button>
            <button
              @click="commitStockUpload"
              :disabled="parsedStockRows.length === 0"
              class="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-40 shadow-md shadow-blue-600/20 cursor-pointer transition-all"
            >
              ✓ Simpan & Jadikan Stok Aktif ({{ parsedStockRows.length }} Item)
            </button>
          </div>
        </div>
      </div>
    </teleport>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useInventoryStore, parseFg27ColRow } from '@/stores/inventoryStore';
import * as XLSX from 'xlsx';

const route = useRoute();
const router = useRouter();
const inventoryStore = useInventoryStore();

// Sub-Sheet Navigation Tabs for FG Roll: 'stock' | 'updates' | 'location'
const activeFgTab = ref('stock');

// Search & Filter States
const stockSearch = ref('');
const filterJenis = ref('ALL');
const filterArea = ref('ALL');
const selectedAreaTab = ref('A');

// Column Configurator
const showColumnConfig = ref(false);
const visibleCols = reactive({
  descExcel: true,
  descNav: true,
  sourceNo: true,
  jenis: true,
  formula: true,
  thickness: true,
  width: true,
  length: true,
  core: true,
  od: true,
  tanda: true,
  density: true,
  weight: true,
  keterangan: true,
  lastProd: true,
  lastTransfer: true,
  moving: true,
  tPanjang: true,
  tBerat: true,
  tRoll: true,
  areaA: true,
  areaB: true,
  areaC: true,
  areaD: true,
  areaE: true,
  qtyRak: true,
  listRak: true
});

const columnList = [
  { key: 'descExcel', label: '1. Description Excel' },
  { key: 'descNav', label: '2. Description NAV' },
  { key: 'sourceNo', label: '3. Source No.' },
  { key: 'jenis', label: '4. Jenis' },
  { key: 'formula', label: '5. Kode Formula' },
  { key: 'thickness', label: '6. Thickness (μ)' },
  { key: 'width', label: '7. Width (mm)' },
  { key: 'length', label: '8. Length (m)' },
  { key: 'core', label: '9. Core (Inch)' },
  { key: 'od', label: '10. OD' },
  { key: 'tanda', label: '11. Tanda' },
  { key: 'density', label: '12. Density' },
  { key: 'weight', label: '13. Weight / Roll (kg)' },
  { key: 'keterangan', label: '14. Keterangan' },
  { key: 'lastProd', label: '15. Last Production' },
  { key: 'lastTransfer', label: '16. Last Transfer' },
  { key: 'moving', label: '17. Moving' },
  { key: 'tPanjang', label: '18. T.Panjang (M)' },
  { key: 'tBerat', label: '19. T.Berat (kg)' },
  { key: 'tRoll', label: '20. T.Roll' },
  { key: 'areaA', label: '21. Area A' },
  { key: 'areaB', label: '22. Area B' },
  { key: 'areaC', label: '23. Area C' },
  { key: 'areaD', label: '24. Area D' },
  { key: 'areaE', label: '25. Area E' },
  { key: 'qtyRak', label: '26. Qty Rak' },
  { key: 'listRak', label: '27. List Rak FG' }
];

const activeVisibleColsCount = computed(() => {
  return Object.values(visibleCols).filter(Boolean).length;
});

const resetColumnsToAll = () => {
  for (const k in visibleCols) {
    visibleCols[k] = true;
  }
};

// Upload Modal & Form
const showUploadModal = ref(false);
const stockPasteRaw = ref('');
const parsedStockRows = ref([]);

const stockUploadForm = reactive({
  date: new Date().toISOString().slice(0, 10),
  fileName: `Saldo_FG_${new Date().toISOString().slice(0, 10)}.xlsx`,
  uploadedBy: 'Admin Inventory'
});

onMounted(async () => {
  await inventoryStore.loadInventory();
});

const formatNumber = (val) => {
  if (val === undefined || val === null || val === '') return '0';
  const num = parseFloat(val);
  if (isNaN(num)) return '0';
  return num.toLocaleString('id-ID');
};

// ----------------------------------------------------
// COMPUTED KPIS & FILTERED LISTS
// ----------------------------------------------------
const uniqueJenisList = computed(() => {
  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  const set = new Set(stocks.map(s => s && s.jenis).filter(Boolean));
  return Array.from(set);
});

const filteredCurrentStocks = computed(() => {
  let list = Array.isArray(inventoryStore.currentStocks) ? [...inventoryStore.currentStocks] : [];
  const term = (stockSearch.value || '').trim().toLowerCase();

  if (term) {
    list = list.filter(s => {
      if (!s) return false;
      const descEx = String(s.descriptionExcel || '').toLowerCase();
      const descNv = String(s.descriptionNav || '').toLowerCase();
      const srcNo = String(s.sourceNo || '').toLowerCase();
      const formula = String(s.kodeFormula || '').toLowerCase();
      const rak = String(s.listRak || '').toLowerCase();
      const ket = String(s.keterangan || '').toLowerCase();
      const jns = String(s.jenis || '').toLowerCase();
      return descEx.includes(term) || descNv.includes(term) || srcNo.includes(term) || formula.includes(term) || rak.includes(term) || ket.includes(term) || jns.includes(term);
    });
  }

  if (filterJenis.value && filterJenis.value !== 'ALL') {
    list = list.filter(s => s && String(s.jenis).toUpperCase() === filterJenis.value.toUpperCase());
  }

  if (filterArea.value === 'A') list = list.filter(s => (parseInt(s?.areaA, 10) || 0) > 0);
  else if (filterArea.value === 'B') list = list.filter(s => (parseInt(s?.areaB, 10) || 0) > 0);
  else if (filterArea.value === 'C') list = list.filter(s => (parseInt(s?.areaC, 10) || 0) > 0);
  else if (filterArea.value === 'D') list = list.filter(s => (parseInt(s?.areaD, 10) || 0) > 0);
  else if (filterArea.value === 'E') list = list.filter(s => (parseInt(s?.areaE, 10) || 0) > 0);
  else if (filterArea.value === 'RAK') list = list.filter(s => (parseInt(s?.qtyRak, 10) || 0) > 0);

  return list;
});

// Pagination untuk Tabel Stok Roll FG Aktif (Mencegah freeze pada ribuan SKU)
const stockPage = ref(1);
const stockPageSize = ref(50); // 50 SKU per halaman

const totalStockPages = computed(() => {
  return Math.ceil(filteredCurrentStocks.value.length / stockPageSize.value) || 1;
});

const paginatedCurrentStocks = computed(() => {
  const start = (stockPage.value - 1) * stockPageSize.value;
  return filteredCurrentStocks.value.slice(start, start + stockPageSize.value);
});

watch([stockSearch, filterJenis, filterArea], () => {
  stockPage.value = 1;
});

const filteredTotalRoll = computed(() => {
  return filteredCurrentStocks.value.reduce((sum, s) => sum + (parseInt(s?.totalRoll, 10) || 0), 0);
});

const filteredTotalKg = computed(() => {
  return filteredCurrentStocks.value.reduce((sum, s) => sum + (parseFloat(s?.totalKg) || 0), 0);
});

const filteredTotalPanjang = computed(() => {
  return filteredCurrentStocks.value.reduce((sum, s) => sum + (parseFloat(s?.totalPanjang) || 0), 0);
});

const totalRollInRacks = computed(() => {
  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  return stocks.reduce((sum, s) => sum + (parseInt(s.qtyRak, 10) || 0), 0);
});

const areaTotals = computed(() => {
  const totals = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  for (const s of stocks) {
    totals.A += parseInt(s.areaA, 10) || 0;
    totals.B += parseInt(s.areaB, 10) || 0;
    totals.C += parseInt(s.areaC, 10) || 0;
    totals.D += parseInt(s.areaD, 10) || 0;
    totals.E += parseInt(s.areaE, 10) || 0;
  }
  return totals;
});

const totalParsedRolls = computed(() => {
  const rows = Array.isArray(parsedStockRows.value) ? parsedStockRows.value : [];
  return rows.reduce((sum, r) => sum + (parseInt(r.totalRoll, 10) || 0), 0);
});

const totalParsedKg = computed(() => {
  const rows = Array.isArray(parsedStockRows.value) ? parsedStockRows.value : [];
  return rows.reduce((sum, r) => sum + (parseFloat(r.totalKg) || 0), 0);
});

// ----------------------------------------------------
// 3-TIER STORAGE HIERARCHY STATES & HELPERS
// ----------------------------------------------------
const filterStorageType = ref('ALL'); // 'ALL' | 'FLOOR' | 'RAK_FG' | 'RAK_JUMBO'

const expandedLocationParents = reactive({
  floor: true,
  rakFg: true,
  rakJumbo: true
});

const expandedFloorAreas = reactive({
  A: false,
  B: false,
  C: false,
  D: false,
  E: false
});

const expandedFgRacks = reactive({});
const expandedJumboRacks = reactive({});

// 1. FLOOR (Lantai A - E)
const getFloorSectorData = (letter) => {
  const char = String(letter || 'A').toUpperCase();
  const key = `area${char}`;
  const matched = [];
  let totalRolls = 0;
  let totalKg = 0;

  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  for (const s of stocks) {
    if (!s) continue;
    const count = parseInt(s[key], 10) || 0;
    if (count > 0) {
      const weightPerRoll = parseFloat(s.weight) || (parseFloat(s.totalKg) / (parseInt(s.totalRoll, 10) || 1)) || 0;
      const calculatedKg = count * weightPerRoll;
      matched.push({
        item: s,
        rollCount: count,
        totalKg: calculatedKg
      });
      totalRolls += count;
      totalKg += calculatedKg;
    }
  }

  return {
    letter: char,
    totalRolls,
    totalKg,
    items: matched
  };
};

const totalFloorRolls = computed(() => {
  return ['A', 'B', 'C', 'D', 'E'].reduce((sum, l) => sum + getFloorSectorData(l).totalRolls, 0);
});

const totalFloorKg = computed(() => {
  return ['A', 'B', 'C', 'D', 'E'].reduce((sum, l) => sum + getFloorSectorData(l).totalKg, 0);
});

// 2. RAK FG (Rak A - M, Kolom Vertikal 1..5)
const fgRackLetterList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M'];

const getFgColumnsForRack = (rackLetter) => {
  const letter = String(rackLetter || 'A').toUpperCase();
  const colSet = new Set();
  
  // Default columns 1..5 (vertical from bottom to top)
  for (let i = 1; i <= 5; i++) {
    colSet.add(`${letter}${i}`);
  }

  // Any other columns discovered from listRak (e.g. A6, J6)
  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  for (const s of stocks) {
    if (s && s.listRak) {
      const tokens = String(s.listRak).split(',').map(r => r.trim().toUpperCase()).filter(Boolean);
      for (const t of tokens) {
        if (/^[A-Z]\d+$/.test(t) && t.startsWith(letter)) {
          colSet.add(t);
        }
      }
    }
  }

  return Array.from(colSet).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 0;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 0;
    return numA - numB;
  });
};

const getFgColumnData = (colCode) => {
  const code = String(colCode || '').toUpperCase().trim();
  const matched = [];
  let totalRolls = 0;
  let totalKg = 0;

  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  for (const s of stocks) {
    if (s && s.listRak) {
      const tokens = String(s.listRak).split(',').map(r => r.trim().toUpperCase()).filter(Boolean);
      if (tokens.includes(code)) {
        matched.push(s);
        const rollCount = parseInt(s.totalRoll, 10) || 0;
        totalRolls += rollCount;
        totalKg += parseFloat(s.totalKg) || 0;
      }
    }
  }

  return {
    code,
    totalRolls,
    totalKg,
    items: matched
  };
};

const getFgRackSummary = (rackLetter) => {
  const cols = getFgColumnsForRack(rackLetter);
  let totalRolls = 0;
  let totalKg = 0;
  let occupiedCols = 0;

  for (const col of cols) {
    const data = getFgColumnData(col);
    if (data.totalRolls > 0) {
      totalRolls += data.totalRolls;
      totalKg += data.totalKg;
      occupiedCols++;
    }
  }

  return {
    totalRolls,
    totalKg,
    occupiedCols,
    totalCols: cols.length
  };
};

const totalFgRackRolls = computed(() => {
  return fgRackLetterList.reduce((sum, l) => sum + getFgRackSummary(l).totalRolls, 0);
});

const totalFgRackKg = computed(() => {
  return fgRackLetterList.reduce((sum, l) => sum + getFgRackSummary(l).totalKg, 0);
});

// 3. RAK JUMBO (Rel 4-Karakter: A1A2, B3B4, H3H4, dll yang terisi Roll FG)
const jumboRacksWithFg = computed(() => {
  const map = new Map();
  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];

  for (const s of stocks) {
    if (s && s.listRak) {
      const tokens = String(s.listRak).split(',').map(r => r.trim().toUpperCase()).filter(Boolean);
      for (const t of tokens) {
        // Match 4-character rack codes like A1A2, B3B4, H3H4
        if (/^[A-Z]\d[A-Z]\d$/.test(t)) {
          if (!map.has(t)) {
            map.set(t, {
              rackCode: t,
              totalRolls: 0,
              totalKg: 0,
              items: []
            });
          }
          const rackObj = map.get(t);
          if (!rackObj.items.some(it => it.id === s.id && it.descriptionExcel === s.descriptionExcel)) {
            rackObj.items.push(s);
            rackObj.totalRolls += parseInt(s.totalRoll, 10) || 0;
            rackObj.totalKg += parseFloat(s.totalKg) || 0;
          }
        }
      }
    }
  }

  return Array.from(map.values()).sort((a, b) => a.rackCode.localeCompare(b.rackCode));
});

const totalJumboFgRolls = computed(() => {
  return jumboRacksWithFg.value.reduce((sum, j) => sum + j.totalRolls, 0);
});

const totalJumboFgKg = computed(() => {
  return jumboRacksWithFg.value.reduce((sum, j) => sum + j.totalKg, 0);
});

const allOccupiedRacksCount = computed(() => {
  const rackSet = new Set();
  const stocks = Array.isArray(inventoryStore.currentStocks) ? inventoryStore.currentStocks : [];
  for (const stock of stocks) {
    if (stock && stock.listRak) {
      const tokens = String(stock.listRak).split(',').map(r => r.trim().toUpperCase()).filter(Boolean);
      tokens.forEach(t => rackSet.add(t));
    }
  }
  return rackSet.size;
});

// ----------------------------------------------------
// UPLOAD / COPAS METHODS
// ----------------------------------------------------
const openUploadModal = () => {
  stockPasteRaw.value = '';
  parsedStockRows.value = [];
  stockUploadForm.date = new Date().toISOString().slice(0, 10);
  stockUploadForm.fileName = `Saldo_FG_${new Date().toISOString().slice(0, 10)}.xlsx`;
  showUploadModal.value = true;
};

const handleFgPasteClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        stockPasteRaw.value = text;
        parseStockPaste();
        return;
      }
    }
  } catch (err) {}
  alert('Silakan klik di dalam kotak teks lalu tekan Ctrl + V pada keyboard.');
};

const parseStockPaste = () => {
  if (!stockPasteRaw.value || !stockPasteRaw.value.trim()) {
    parsedStockRows.value = [];
    return;
  }
  const raw = stockPasteRaw.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = raw.split('\n');
  const rows = [];

  for (const line of lines) {
    if (!line || !line.trim()) continue;
    let cols = [];
    if (line.includes('\t')) {
      cols = line.split('\t');
    } else if (line.includes(';')) {
      cols = line.split(';');
    } else if (line.includes(',')) {
      cols = line.split(',');
    } else {
      cols = [line];
    }

    const parsed = parseFg27ColRow(cols);
    if (parsed) {
      rows.push(parsed);
    }
  }
  parsedStockRows.value = rows;
};

const commitStockUpload = async () => {
  if (parsedStockRows.value.length === 0) return;

  await inventoryStore.processStockUpload({
    uploadDate: stockUploadForm.date,
    fileName: stockUploadForm.fileName,
    uploadedBy: stockUploadForm.uploadedBy,
    items: parsedStockRows.value
  });

  showUploadModal.value = false;
  stockPasteRaw.value = '';
  parsedStockRows.value = [];
  alert(`⚡ Sukses: Berhasil memperbarui stok gudang Roll FG (${inventoryStore.currentStocks.length} SKU).`);
  activeFgTab.value = 'stock';
};

const deleteUpload = async (upload) => {
  if (confirm(`Hapus catatan riwayat upload "${upload.fileName}" (${upload.uploadDate})?`)) {
    await inventoryStore.deleteUploadRecord(upload.id);
  }
};

const downloadUploadTemplate = () => {
  const data = [
    {
      'Description Excel': 'VMCPP M06 20 MC X 1060 MM = 6500 , 6 INCHI OD2.4+PLASMA A',
      'Description NAV': 'VMCPP M06 20 MC X 1060 MM',
      'Source No.': 'ITM-00124',
      'Jenis': 'VMCPP',
      'Kode Formula': 'M06',
      'Thickness': 20,
      'Width': 1060,
      'Length': 6500,
      'Core': 6,
      'OD': 'OD2.4+PLASMA',
      'Tanda': 'A',
      'Density': 0.91,
      'Weight': 125.3,
      'Keterangan': 'OK STANDARD',
      'Last Production': new Date().toISOString().slice(0, 10),
      'Last Transfer': new Date().toISOString().slice(0, 10),
      'Moving': 'FAST',
      'T. Panjang': 312000,
      'T. Berat': 6014.4,
      'T. Roll': 48,
      'A': 10,
      'B': 10,
      'C': 10,
      'D': 10,
      'E': 8,
      'Qty Rak': 24,
      'List Rak': 'A1, E3, J4'
    }
  ];
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Upload Stock FG 27 Kolom');
  XLSX.writeFile(wb, 'Template_Upload_Stock_FG_27_Kolom.xlsx');
};

const exportStockTersediaExcel = () => {
  const data = filteredCurrentStocks.value.map((s, idx) => ({
    No: idx + 1,
    'Description Excel': s.descriptionExcel,
    'Description NAV': s.descriptionNav,
    'Source No.': s.sourceNo,
    'Jenis': s.jenis,
    'Kode Formula': s.kodeFormula,
    'Thickness': s.thickness,
    'Width': s.width,
    'Length': s.length,
    'Core': s.core,
    'OD': s.od,
    'Tanda': s.tanda,
    'Density': s.density,
    'Weight': s.weight,
    'Keterangan': s.keterangan,
    'Last Production': s.lastProduction,
    'Last Transfer': s.lastTransfer,
    'Moving': s.moving,
    'T. Panjang': s.totalPanjang,
    'T. Berat': s.totalKg,
    'T. Roll': s.totalRoll,
    'A': s.areaA,
    'B': s.areaB,
    'C': s.areaC,
    'D': s.areaD,
    'E': s.areaE,
    'Qty Rak': s.qtyRak,
    'List Rak': s.listRak,
    'Tanggal Update': s.lastUploadDate
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Stock Roll FG');
  XLSX.writeFile(wb, `Stock_Roll_FG_${new Date().toISOString().slice(0, 10)}.xlsx`);
};
</script>
