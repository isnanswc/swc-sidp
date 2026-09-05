<template>
  <div class="p-3 sm:p-5 space-y-4 max-w-7xl mx-auto">
    <!-- 1. TOP HEADER & SHEET / TAB SELECTOR -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-700 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-indigo-100">
          📜
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-base sm:text-lg font-black text-zinc-900 leading-tight">
              Data Roll & Analytics Identitas FG
            </h1>
            <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200">
              {{ dataRollStore.totalRolls }} Roll
            </span>
          </div>
          <p class="text-[11px] text-zinc-500 font-medium">
            Database identitas roll, visualisasi metrik interaktif, dan grafik timeline tren produksi
          </p>
        </div>
      </div>

      <!-- Sheet / Tab Switcher (Modern Segmented Control) -->
      <div class="flex flex-wrap items-center bg-zinc-100 p-1 rounded-2xl border border-zinc-200 shadow-2xs self-start md:self-auto gap-1">
        <button
          @click="activeSheet = 'table'"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
            activeSheet === 'table'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          ]"
        >
          <span>📋</span>
          <span>Tabel Data Roll</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-black" :class="activeSheet === 'table' ? 'bg-indigo-100 text-indigo-800' : 'bg-zinc-200 text-zinc-600'">
            {{ dataRollStore.totalRolls }}
          </span>
        </button>

        <button
          @click="activeSheet = 'history'"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
            activeSheet === 'history'
              ? 'bg-white text-zinc-900 shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          ]"
        >
          <span>📜</span>
          <span>Riwayat Upload & Batch</span>
          <span class="px-1.5 py-0.2 rounded-full text-[10px] font-black" :class="activeSheet === 'history' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'">
            {{ dataRollStore.uploadHistory.length }}
          </span>
        </button>

        <button
          @click="activeSheet = 'analytics'"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
            activeSheet === 'analytics'
              ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-800'
          ]"
        >
          <span>📊</span>
          <span>Metrik & Grafik</span>
          <span class="px-1.5 py-0.2 rounded-full text-[9.5px] font-black bg-white/20 text-white uppercase tracking-wider">
            Live
          </span>
        </button>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- SHEET 1: TABEL DATA ROLL -->
    <!-- ========================================================================= -->
    <div v-if="activeSheet === 'table'" class="space-y-4 animate-fade-in">
      <!-- Sort Info & Direction Bar -->
      <div class="bg-indigo-50/70 px-4 py-2.5 rounded-2xl border border-indigo-200/80 flex flex-wrap items-center justify-between gap-2 text-xs shadow-2xs">
        <div class="flex items-center gap-2 text-indigo-950 font-bold">
          <span class="text-sm">🔄</span>
          <span>Urutan Standar Data Roll:</span>
          <span class="bg-white px-2.5 py-1 rounded-xl border border-indigo-200 text-[11px] font-mono text-indigo-800 font-black shadow-2xs">
            1. Tanggal ({{ dataRollStore.sortDirection === 'desc' ? 'Terbaru' : 'Terlama' }}) ➔ 2. Mesin ➔ 3. No Lot Slitting ➔ 4. Turunan (HA01, HC01...) ➔ 5. Kode Pack
          </span>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="dataRollStore.sortDirection = dataRollStore.sortDirection === 'desc' ? 'asc' : 'desc'"
            class="px-3 py-1 rounded-xl text-xs font-black bg-white hover:bg-indigo-100 text-indigo-900 border border-indigo-300 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Ubah Urutan Tanggal"
          >
            <span>{{ dataRollStore.sortDirection === 'desc' ? '⬇️ Urutan Tanggal: Terbaru (Z-A)' : '⬆️ Urutan Tanggal: Terlama (A-Z)' }}</span>
          </button>
        </div>
      </div>
      <!-- Toolbar & Action Buttons -->
      <div class="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <input
            v-model="dataRollStore.filterSearch"
            placeholder="Cari Kode FG, Lot, SPK, Kode Pack, Formula, Dimensi..."
            class="w-full pl-9 pr-4 py-2 text-xs border border-zinc-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50/50 focus:bg-white"
          />
          <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <!-- Filters & Action Buttons -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Machine Filter Buttons -->
          <div class="flex items-center bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-bold">
            <button
              @click="dataRollStore.filterMachine = 'ALL'"
              :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', dataRollStore.filterMachine === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
            >
              Semua Mesin
            </button>
            <button
              @click="dataRollStore.filterMachine = 'SLITTING'"
              :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', dataRollStore.filterMachine === 'SLITTING' ? 'bg-emerald-600 text-white shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
            >
              Slitting
            </button>
            <button
              @click="dataRollStore.filterMachine = 'REWIND'"
              :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', dataRollStore.filterMachine === 'REWIND' ? 'bg-purple-600 text-white shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
            >
              Rewind
            </button>
            <button
              @click="dataRollStore.filterMachine = 'SML'"
              :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', dataRollStore.filterMachine === 'SML' ? 'bg-blue-600 text-white shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
            >
              SML
            </button>
          </div>

          <!-- Quality Status Filter Dropdown -->
          <select
            v-model="dataRollStore.filterStatus"
            class="px-2.5 py-1.5 text-xs font-bold border border-zinc-300 rounded-xl bg-white text-zinc-800 outline-none"
          >
            <option value="ALL">Semua Status</option>
            <option value="PASS">PASS (Hijau)</option>
            <option value="HOLD">HOLD (Kuning)</option>
            <option value="REJECT">REJECT (Merah)</option>
          </select>

          <!-- Action Buttons -->
          <button
            @click="openImportModal"
            class="px-3 py-1.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>📥 Import Excel</span>
          </button>

          <button
            @click="openAddModal"
            class="px-3 py-1.5 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-2xs flex items-center gap-1 cursor-pointer transition-all"
          >
            <span>➕ Tambah</span>
          </button>

          <button
            @click="dataRollStore.exportToExcel()"
            :disabled="dataRollStore.totalRolls === 0"
            class="px-3 py-1.5 text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl border border-zinc-200 cursor-pointer disabled:opacity-50 transition-colors flex items-center gap-1"
          >
            <span>📊 Export</span>
          </button>

          <button
            v-if="selectedRollIds.length > 0"
            @click="handleBulkDelete"
            class="px-3 py-1.5 text-xs font-bold bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl cursor-pointer transition-colors flex items-center gap-1"
          >
            <span>🗑️ Hapus ({{ selectedRollIds.length }})</span>
          </button>

          <button
            v-if="dataRollStore.totalRolls > 0"
            @click="handleClearAllRolls"
            class="px-3 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
            title="Hapus seluruh data roll secara permanen"
          >
            <span>🔥 Hapus Semua Data Roll</span>
          </button>
        </div>
      </div>

      <!-- Main Data Table -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <!-- Banner Pilih Semua Data di Seluruh Halaman -->
        <div
          v-if="selectedRollIds.length > 0 && dataRollStore.filteredRolls.length > paginatedRolls.length"
          class="bg-indigo-50/90 border-b border-indigo-200 px-4 py-2 text-center text-xs text-indigo-900 font-medium flex items-center justify-center gap-2"
        >
          <span v-if="!isAllFilteredSelected">
            {{ selectedRollIds.length }} roll terpilih di halaman ini.
            <button
              @click="selectAllFilteredRolls"
              class="font-black text-indigo-700 underline hover:text-indigo-900 ml-1 cursor-pointer"
            >
              Pilih semua {{ dataRollStore.filteredRolls.length.toLocaleString() }} data roll
            </button>
          </span>
          <span v-else>
            ✅ Semua <strong>{{ dataRollStore.filteredRolls.length.toLocaleString() }} data roll</strong> telah terpilih.
            <button
              @click="clearSelection"
              class="font-black text-red-600 underline hover:text-red-800 ml-1 cursor-pointer"
            >
              Batalkan pilihan
            </button>
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200 text-[11px] font-black text-zinc-600 uppercase tracking-wider">
                <th class="py-3 px-3 text-center w-10">
                  <input
                    type="checkbox"
                    :checked="isAllSelected"
                    @change="toggleSelectAll"
                    class="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </th>
                <th class="py-3 px-2 text-center w-10">No</th>
                <th class="py-3 px-3">Kode FG & Deskripsi Roll</th>
                <th class="py-3 px-3">Lot & Turunan</th>
                <th class="py-3 px-3 text-center">Mesin</th>
                <th class="py-3 px-3 text-center">Tanggal</th>
                <th class="py-3 px-3">No. SPK</th>
                <th class="py-3 px-3 text-center">Kode Pack</th>
                <th class="py-3 px-3 text-center">Dimensi</th>
                <th class="py-3 px-3 text-center">Core / OD</th>
                <th class="py-3 px-3 text-center">Quality Status</th>
                <th class="py-3 px-3">Reason Of Defect</th>
                <th class="py-3 px-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200/70">
              <tr v-if="paginatedRolls.length === 0" class="text-center py-10">
                <td colspan="13" class="py-12 text-zinc-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <span class="text-3xl">📭</span>
                    <p class="font-bold text-sm text-zinc-600">Belum Ada Data Roll</p>
                    <p class="text-xs text-zinc-400">Klik "Import Excel" untuk memasukkan data identitas roll FG.</p>
                  </div>
                </td>
              </tr>

              <tr
                v-for="(item, idx) in paginatedRolls"
                :key="item.id || item.uuid"
                :class="[
                  'hover:bg-indigo-50/30 transition-colors',
                  selectedRollIds.includes(item.id) ? 'bg-indigo-50/50' : ''
                ]"
              >
                <!-- Checkbox -->
                <td class="py-2.5 px-3 text-center">
                  <input
                    type="checkbox"
                    :value="item.id"
                    v-model="selectedRollIds"
                    class="rounded text-indigo-600 focus:ring-0 cursor-pointer"
                  />
                </td>

                <!-- No -->
                <td class="py-2.5 px-2 text-center text-zinc-400 font-mono text-[11px]">
                  {{ (currentPage - 1) * pageSize + idx + 1 }}
                </td>

                <!-- Kode FG & Deskripsi -->
                <td class="py-2.5 px-3 max-w-xs font-medium">
                  <div class="font-mono text-[11px] font-bold text-zinc-900 break-words leading-tight">
                    {{ item.kodeFg }}
                  </div>
                  <div class="text-[10px] text-zinc-500 mt-0.5 flex items-center gap-1.5">
                    <span class="font-bold text-indigo-600">{{ item.jenis }}</span>
                    <span>•</span>
                    <span class="font-bold text-red-600">{{ item.kodeFormula }}</span>
                  </div>
                </td>

                <!-- Lot & Turunan -->
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <div class="font-mono font-black text-xs text-zinc-900">
                    {{ extractCleanParentLot(item.lot, item.turunan) }}
                  </div>
                  <span v-if="item.turunan" class="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-black bg-zinc-100 text-zinc-700 border border-zinc-200 mt-0.5">
                    Turunan: {{ item.turunan }}
                  </span>
                </td>

                <!-- Mesin Badge -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <span
                    v-if="item.machineName === 'SLITTING' || item.slitting"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300"
                  >
                    SLITTING
                  </span>
                  <span
                    v-else-if="item.machineName === 'REWIND' || item.rewind"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-100 text-purple-800 border border-purple-300"
                  >
                    REWIND
                  </span>
                  <span
                    v-else-if="item.machineName === 'SML' || item.sml"
                    class="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-800 border border-blue-300"
                  >
                    SML
                  </span>
                  <span v-else class="text-zinc-400 font-mono text-[11px]">—</span>
                </td>

                <!-- Tanggal -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[11px] text-zinc-700">
                  {{ item.tanggalFormatted || item.tanggal }}
                </td>

                <!-- No SPK -->
                <td class="py-2.5 px-3 font-mono font-bold text-zinc-800 whitespace-nowrap">
                  {{ item.spk || '—' }}
                </td>

                <!-- Kode Pack -->
                <td class="py-2.5 px-3 text-center font-mono whitespace-nowrap">
                  <span class="font-bold text-zinc-900">{{ item.kodePack }}</span>
                  <span class="font-black text-red-600">{{ item.subKode }}</span>
                </td>

                <!-- Dimensi & Berat Teori (Micron x Lebar = Panjang) -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap font-mono">
                  <div>
                    <span class="font-bold text-zinc-900">{{ item.thickness }} MC</span>
                    <span class="text-zinc-400 mx-1">x</span>
                    <span class="font-bold text-zinc-900">{{ item.width }} MM</span>
                  </div>
                  <div class="text-[10px] text-zinc-500 font-medium">
                    = {{ item.length }} M
                  </div>
                  <div class="text-[10px] text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.5 rounded mt-0.5 border border-emerald-200 inline-block" :title="`Netto Teori: ${item.beratTeori || item.netto} kg | Paper Core: ${item.paperCore || '-'} kg | Bruto: ${item.bruto || '-'} kg`">
                    ⚖️ Teori: {{ item.beratTeori || item.netto }} kg
                  </div>
                </td>

                <!-- Core & Treatment -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap text-[11px]">
                  <div class="font-bold text-zinc-800">{{ item.core }}" Core</div>
                  <div class="text-[10px] text-indigo-700 font-semibold truncate max-w-[90px]">
                    {{ item.od || item.treatment || 'INSIDE' }}
                  </div>
                </td>

                <!-- Quality Status Badge -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <span
                    v-if="item.qualityStatus === 'PASS'"
                    class="px-2.5 py-1 rounded-lg text-xs font-black bg-emerald-500 text-white shadow-2xs tracking-wide"
                  >
                    PASS
                  </span>
                  <span
                    v-else-if="item.qualityStatus === 'HOLD'"
                    class="px-2.5 py-1 rounded-lg text-xs font-black bg-amber-500 text-white shadow-2xs tracking-wide"
                  >
                    HOLD
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-1 rounded-lg text-xs font-black bg-red-600 text-white shadow-2xs tracking-wide"
                  >
                    REJECT
                  </span>
                </td>

                <!-- Reason of Defect -->
                <td class="py-2.5 px-3 whitespace-nowrap text-xs">
                  <span v-if="item.reasonDefect || item.keterangan" class="font-bold text-zinc-800">
                    {{ item.reasonDefect || item.keterangan }}
                  </span>
                  <span v-else class="text-zinc-400 font-mono text-[11px]">—</span>
                </td>

                <!-- Aksi Buttons -->
                <td class="py-2.5 px-3 text-center whitespace-nowrap">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      @click="editRoll(item)"
                      class="p-1 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                      title="Edit Data Roll"
                    >
                      ✏️
                    </button>
                    <button
                      @click="deleteSingleRoll(item.id)"
                      class="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Roll"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination Bar -->
        <div class="px-4 py-3 border-t border-zinc-200 bg-white flex flex-col xl:flex-row items-center justify-between gap-3 text-xs">
          <!-- Info Left -->
          <div class="flex items-center gap-2 text-zinc-600">
            <span>Halaman</span>
            <span class="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">{{ dataRollPagination.current }}</span>
            <span>dari <strong class="text-zinc-900">{{ dataRollPagination.total }}</strong></span>
            <span class="text-zinc-300">•</span>
            <span>Total <strong class="text-emerald-700">{{ dataRollStore.filteredRolls.length }}</strong> roll</span>

            <!-- Page Size Selector -->
            <div class="flex items-center gap-1.5 ml-3">
              <span class="text-[11px] text-zinc-400 font-semibold">Tampil:</span>
              <select
                v-model.number="pageSize"
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
              :disabled="dataRollPagination.current <= 1"
              @click="currentPage = 1"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
              title="Halaman Pertama"
            >
              ⏮ First
            </button>

            <!-- Prev Page -->
            <button
              :disabled="dataRollPagination.current <= 1"
              @click="currentPage--"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
              title="Halaman Sebelumnya"
            >
              ◀ Prev
            </button>

            <!-- Page 1 if start > 1 -->
            <button
              v-if="dataRollPagination.showFirst"
              @click="currentPage = 1"
              class="min-w-[30px] px-2 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 text-zinc-700 cursor-pointer text-xs"
            >
              1
            </button>

            <span v-if="dataRollPagination.hasFirstEllipsis" class="px-1 text-zinc-400 font-bold">...</span>

            <!-- Direct Page Numbers (±5 range) -->
            <button
              v-for="p in dataRollPagination.pages"
              :key="p"
              @click="currentPage = p"
              :class="[
                'min-w-[30px] px-2.5 py-1 rounded-lg font-black transition-all cursor-pointer text-xs',
                p === dataRollPagination.current
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
              ]"
            >
              {{ p }}
            </button>

            <span v-if="dataRollPagination.hasLastEllipsis" class="px-1 text-zinc-400 font-bold">...</span>

            <!-- Last Page if end < total -->
            <button
              v-if="dataRollPagination.showLast"
              @click="currentPage = dataRollPagination.total"
              class="min-w-[30px] px-2 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 text-zinc-700 cursor-pointer text-xs"
            >
              {{ dataRollPagination.total }}
            </button>

            <!-- Next Page -->
            <button
              :disabled="dataRollPagination.current >= dataRollPagination.total"
              @click="currentPage++"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
              title="Halaman Selanjutnya"
            >
              Next ▶
            </button>

            <!-- Last Page -->
            <button
              :disabled="dataRollPagination.current >= dataRollPagination.total"
              @click="currentPage = dataRollPagination.total"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 font-bold hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors text-zinc-700 cursor-pointer text-xs"
              title="Halaman Terakhir"
            >
              Last ⏭
            </button>

            <!-- Jump to Page Input -->
            <div class="flex items-center gap-1 ml-2 pl-2 border-l border-zinc-300">
              <span class="text-[11px] text-zinc-500 font-semibold whitespace-nowrap">Lompat:</span>
              <input
                type="number"
                min="1"
                :max="dataRollPagination.total"
                v-model="jumpPageInput"
                @keyup.enter="jumpToPage"
                placeholder="Hal..."
                class="w-14 px-2 py-1 text-xs border border-zinc-300 rounded-lg outline-none text-center font-bold text-zinc-800 focus:border-emerald-500"
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
    </div>

    <!-- ========================================================================= -->
    <!-- SHEET 2: RIWAYAT UPLOAD DATA ROLL & BATCH VERIFIKASI -->
    <!-- ========================================================================= -->
    <div v-else-if="activeSheet === 'history'" class="space-y-4 animate-fade-in">
      <!-- Top Action & Sync Bar -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 class="text-sm font-black text-zinc-900 flex items-center gap-2">
            <span>📜</span> Riwayat Upload File & Batch Verifikasi Harian DE
          </h2>
          <p class="text-xs text-zinc-500 mt-0.5">
            Daftar riwayat sumber data roll, waktu upload, file asal, serta kumpulan batch harian dari konfirmasi DE Report.
          </p>
        </div>

        <div class="flex items-center gap-2 self-start md:self-auto">
          <button
            @click="dataRollStore.syncVerifiedDeBatches()"
            class="px-3 py-1.5 text-xs font-black bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            title="Sinkronkan batch hasil verifikasi DE Report terbaru"
          >
            <span>🔄 Sinkronkan Batch DE</span>
          </button>
          <button
            @click="openImportModal"
            class="px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>📥 Upload File Baru</span>
          </button>
        </div>
      </div>

      <!-- Filter & Search Bar for History -->
      <div class="bg-white p-3 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <!-- Search Input -->
        <div class="relative flex-1 max-w-md">
          <input
            v-model="historySearchQuery"
            placeholder="Cari nama batch, nama file, tanggal, verifier..."
            class="w-full pl-9 pr-4 py-2 text-xs border border-zinc-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50/50 focus:bg-white"
          />
          <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>

        <!-- Source Filter Buttons -->
        <div class="flex flex-wrap items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs font-bold">
          <button
            @click="historyFilterSource = 'ALL'"
            :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', historyFilterSource === 'ALL' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
          >
            Semua Sumber
          </button>
          <button
            @click="historyFilterSource = 'EXCEL'"
            :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', historyFilterSource === 'EXCEL' ? 'bg-emerald-600 text-white shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
          >
            📥 Upload Excel
          </button>
          <button
            @click="historyFilterSource = 'DE'"
            :class="['px-2.5 py-1.5 rounded-lg transition-all cursor-pointer', historyFilterSource === 'DE' ? 'bg-indigo-600 text-white shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-900']"
          >
            ✅ Batch Verifikasi DE
          </button>
        </div>
      </div>

      <!-- History List Cards / Table -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200 text-[11px] font-black text-zinc-600 uppercase tracking-wider">
                <th class="py-3 px-3 text-center w-12">No</th>
                <th class="py-3 px-3">Nama Batch / File Upload</th>
                <th class="py-3 px-3">Asal Sumber</th>
                <th class="py-3 px-3 text-center">Waktu Upload / Verifikasi</th>
                <th class="py-3 px-3 text-center">Mesin</th>
                <th class="py-3 px-3 text-center">Total Roll</th>
                <th class="py-3 px-3 text-right">Total Berat (Kg)</th>
                <th class="py-3 px-3 text-center">Quality Breakdown</th>
                <th class="py-3 px-3 text-center">Petugas / Verifier</th>
                <th class="py-3 px-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200/70">
              <tr v-if="filteredUploadHistory.length === 0" class="text-center py-10">
                <td colspan="10" class="py-12 text-zinc-400">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <span class="text-3xl">📭</span>
                    <p class="font-bold text-sm text-zinc-600">Belum Ada Riwayat Upload / Batch</p>
                    <p class="text-xs text-zinc-400">Upload file Excel atau konfirmasi data di DE Report untuk mencatat riwayat.</p>
                  </div>
                </td>
              </tr>

              <tr
                v-for="(batch, bIdx) in paginatedUploadHistory"
                :key="batch.id || batch.uuid"
                class="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                @click="openBatchDetail(batch)"
              >
                <!-- No -->
                <td class="py-3 px-3 text-center text-zinc-400 font-mono text-[11px]">
                  {{ (historyPageSize === -1 ? 0 : (historyPage - 1) * historyPageSize) + bIdx + 1 }}
                </td>

                <!-- Nama Batch & File -->
                <td class="py-3 px-3">
                  <div class="font-bold text-zinc-900 flex items-center gap-1.5 group-hover:text-indigo-600 transition-colors">
                    <span v-if="batch.source && batch.source.includes('Verifikasi')">✅</span>
                    <span v-else>📥</span>
                    <span>{{ batch.batchName || batch.fileName }}</span>
                  </div>
                  <div v-if="batch.fileName && batch.batchName !== batch.fileName" class="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                    File: {{ batch.fileName }}
                  </div>
                </td>

                <!-- Asal Sumber Badge -->
                <td class="py-3 px-3 whitespace-nowrap">
                  <span
                    v-if="batch.source && batch.source.includes('Verifikasi')"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-50 text-indigo-700 border border-indigo-200 inline-block"
                  >
                    Verifikasi DE Report
                  </span>
                  <span
                    v-else-if="batch.source && batch.source.includes('Paste')"
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-purple-50 text-purple-700 border border-purple-200 inline-block"
                  >
                    Paste Clipboard
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-block"
                  >
                    Import File Excel
                  </span>
                </td>

                <!-- Waktu Upload -->
                <td class="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px] text-zinc-700">
                  {{ formatHistoryTimestamp(batch.uploadDate || batch.createdAt) }}
                </td>

                <!-- Mesin -->
                <td class="py-3 px-3 text-center whitespace-nowrap font-bold">
                  <span
                    v-if="batch.machine === 'SLITTING'"
                    class="px-2 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-800 font-black"
                  >SLITTING</span>
                  <span
                    v-else-if="batch.machine === 'REWIND'"
                    class="px-2 py-0.5 rounded text-[10px] bg-purple-100 text-purple-800 font-black"
                  >REWIND</span>
                  <span
                    v-else-if="batch.machine === 'SML'"
                    class="px-2 py-0.5 rounded text-[10px] bg-blue-100 text-blue-800 font-black"
                  >SML</span>
                  <span v-else class="text-zinc-500 font-mono text-[11px]">{{ batch.machine || 'ALL' }}</span>
                </td>

                <!-- Total Roll -->
                <td class="py-3 px-3 text-center font-bold font-mono text-zinc-900 whitespace-nowrap">
                  {{ batch.totalRolls || 0 }} Roll
                </td>

                <!-- Total Berat -->
                <td class="py-3 px-3 text-right font-bold font-mono text-zinc-900 whitespace-nowrap">
                  {{ (batch.totalKg || 0).toLocaleString('id-ID') }} kg
                </td>

                <!-- Quality Status Breakdown -->
                <td class="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px]">
                  <span class="text-emerald-700 font-bold">{{ batch.passCount || 0 }} PASS</span>
                  <span v-if="batch.holdCount > 0" class="text-amber-700 font-bold ml-1.5">• {{ batch.holdCount }} HOLD</span>
                  <span v-if="batch.rejectCount > 0" class="text-red-700 font-bold ml-1.5">• {{ batch.rejectCount }} REJ</span>
                </td>

                <!-- Uploader / Verifier -->
                <td class="py-3 px-3 text-center text-zinc-600 whitespace-nowrap text-[11px]">
                  {{ batch.uploadedBy || 'Data Entry' }}
                </td>

                <!-- Aksi Buttons -->
                <td class="py-3 px-3 text-center whitespace-nowrap" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      @click="openBatchDetail(batch)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer flex items-center gap-1"
                      title="Lihat Data Roll dalam Batch ini"
                    >
                      <span>👁️ Lihat Roll</span>
                    </button>
                    <button
                      @click="exportBatch(batch)"
                      class="p-1 rounded-lg text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Export Batch ke Excel"
                    >
                      📊
                    </button>
                    <button
                      @click="handleDeleteHistory(batch)"
                      class="p-1 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Riwayat Upload"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- History Pagination Bar -->
        <div class="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 text-zinc-600 font-medium">
            <span>Menampilkan batch <strong class="text-zinc-900 font-bold font-mono">{{ historyStartRow }} – {{ historyEndRow }}</strong> dari <strong class="text-zinc-900 font-bold font-mono">{{ filteredUploadHistory.length }}</strong> batch</span>
            <div class="flex items-center gap-1.5 ml-2 border-l border-zinc-300 pl-3">
              <span class="text-zinc-500 text-[11px]">Batch per hal:</span>
              <select
                v-model.number="historyPageSize"
                class="bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-indigo-600 cursor-pointer font-mono"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="-1">Semua</option>
              </select>
            </div>
          </div>

          <div v-if="historyTotalPages > 1" class="flex items-center gap-1.5 flex-wrap">
            <button
              :disabled="historyPage === 1"
              @click="changeHistoryPage(1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Pertama"
            >
              «
            </button>
            <button
              :disabled="historyPage === 1"
              @click="changeHistoryPage(historyPage - 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Sebelumnya"
            >
              ‹
            </button>

            <template v-for="(p, pIdx) in historyVisiblePages" :key="pIdx">
              <span v-if="p === '...'" class="px-1.5 py-1 text-zinc-400 font-bold">...</span>
              <button
                v-else
                @click="changeHistoryPage(p)"
                :class="[
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer font-mono text-xs',
                  historyPage === p
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                ]"
              >
                {{ p }}
              </button>
            </template>

            <button
              :disabled="historyPage === historyTotalPages"
              @click="changeHistoryPage(historyPage + 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Selanjutnya"
            >
              ›
            </button>
            <button
              :disabled="historyPage === historyTotalPages"
              @click="changeHistoryPage(historyTotalPages)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Terakhir"
            >
              »
            </button>

            <div class="flex items-center gap-1 ml-2 border-l border-zinc-300 pl-2">
              <span class="text-zinc-500 text-[11px]">Ke:</span>
              <input
                v-model="jumpToHistoryPage"
                @keyup.enter="handleJumpHistoryPage"
                type="number"
                min="1"
                :max="historyTotalPages"
                placeholder="#"
                class="w-12 px-1.5 py-0.5 text-center text-xs border border-zinc-300 rounded-lg outline-none bg-white font-mono"
              />
              <button
                @click="handleJumpHistoryPage"
                class="px-2 py-0.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- SHEET 3: METRIK & GRAFIK INTERAKTIF (DASHBOARD & TIMELINE) -->
    <!-- ========================================================================= -->
    <div v-else-if="activeSheet === 'analytics'" class="space-y-4 animate-fade-in">
      <!-- 1. TIME FILTER & CONTROLS BAR -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <!-- Preset Time Buttons -->
        <div class="flex flex-wrap items-center gap-1.5">
          <span class="text-xs font-bold text-zinc-500 mr-1 flex items-center gap-1">
            <span>⏱️</span> Rentang Waktu:
          </span>
          <button
            v-for="p in timePresets"
            :key="p.id"
            @click="setTimeRange(p.id)"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer',
              selectedTimePreset === p.id
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-zinc-100 hover:bg-zinc-200 text-zinc-600'
            ]"
          >
            {{ p.label }}
          </button>
        </div>

        <!-- Custom Date Range & Machine Filter -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Custom Date Input -->
          <div v-if="selectedTimePreset === 'custom'" class="flex items-center gap-1.5 bg-zinc-50 p-1 rounded-xl border border-zinc-200">
            <input
              type="date"
              v-model="customStartDate"
              class="px-2 py-1 text-xs border border-zinc-300 rounded-lg outline-none font-mono"
            />
            <span class="text-xs text-zinc-400 font-bold">s/d</span>
            <input
              type="date"
              v-model="customEndDate"
              class="px-2 py-1 text-xs border border-zinc-300 rounded-lg outline-none font-mono"
            />
          </div>

          <!-- Machine Filter for Analytics -->
          <select
            v-model="analyticsMachineFilter"
            class="px-3 py-1.5 text-xs font-black border border-zinc-300 rounded-xl bg-zinc-50 text-zinc-800 outline-none cursor-pointer"
          >
            <option value="ALL">🏭 Semua Mesin</option>
            <option value="SLITTING">Slitting</option>
            <option value="REWIND">Rewind</option>
            <option value="SML">SML</option>
          </select>
        </div>
      </div>

      <!-- 2. KPI METRIC CARDS (Filtered Results) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <!-- Total Roll -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div class="absolute top-0 right-0 w-16 h-16 bg-indigo-50 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
          <span class="text-[10.5px] font-black text-zinc-500 uppercase tracking-wider relative z-10">Total Roll</span>
          <div class="mt-2 relative z-10">
            <div class="text-2xl font-black text-zinc-900 tracking-tight">{{ analyticsMetrics.total }}</div>
            <div class="text-[10.5px] text-zinc-400 font-medium mt-0.5 flex items-center gap-1">
              <span>{{ timeRangeLabel }}</span>
            </div>
          </div>
        </div>

        <!-- Quality PASS -->
        <div class="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-emerald-400 transition-colors">
          <div class="absolute top-0 right-0 w-16 h-16 bg-emerald-100/60 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
          <span class="text-[10.5px] font-black text-emerald-800 uppercase tracking-wider relative z-10">PASS (Siap)</span>
          <div class="mt-2 relative z-10">
            <div class="text-2xl font-black text-emerald-700 tracking-tight">{{ analyticsMetrics.pass }}</div>
            <div class="text-[10.5px] text-emerald-700 font-black mt-0.5 flex items-center gap-1">
              <span>{{ analyticsMetrics.passRate }}%</span>
              <span class="font-normal text-emerald-600">dari total</span>
            </div>
          </div>
        </div>

        <!-- Quality HOLD -->
        <div class="p-4 bg-amber-50/70 rounded-2xl border border-amber-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-amber-400 transition-colors">
          <div class="absolute top-0 right-0 w-16 h-16 bg-amber-100/60 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
          <span class="text-[10.5px] font-black text-amber-800 uppercase tracking-wider relative z-10">HOLD (Karantina)</span>
          <div class="mt-2 relative z-10">
            <div class="text-2xl font-black text-amber-700 tracking-tight">{{ analyticsMetrics.hold }}</div>
            <div class="text-[10.5px] text-amber-700 font-black mt-0.5 flex items-center gap-1">
              <span>{{ analyticsMetrics.holdRate }}%</span>
              <span class="font-normal text-amber-600">terkarantina</span>
            </div>
          </div>
        </div>

        <!-- Quality REJECT -->
        <div class="p-4 bg-red-50/70 rounded-2xl border border-red-200/80 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-red-400 transition-colors">
          <div class="absolute top-0 right-0 w-16 h-16 bg-red-100/60 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
          <span class="text-[10.5px] font-black text-red-800 uppercase tracking-wider relative z-10">REJECT (Afval)</span>
          <div class="mt-2 relative z-10">
            <div class="text-2xl font-black text-red-700 tracking-tight">{{ analyticsMetrics.reject }}</div>
            <div class="text-[10.5px] text-red-700 font-black mt-0.5 flex items-center gap-1">
              <span>{{ analyticsMetrics.rejectRate }}%</span>
              <span class="font-normal text-red-600">scrap</span>
            </div>
          </div>
        </div>

        <!-- Total Meter Linear -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div class="absolute top-0 right-0 w-16 h-16 bg-blue-50 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
          <span class="text-[10.5px] font-black text-zinc-500 uppercase tracking-wider relative z-10">Panjang Linear</span>
          <div class="mt-2 relative z-10">
            <div class="text-2xl font-black text-blue-700 tracking-tight">{{ formatNumber(analyticsMetrics.totalMeters) }}</div>
            <div class="text-[10.5px] text-zinc-400 font-medium mt-0.5">
              Meter (Estimasi)
            </div>
          </div>
        </div>

        <!-- Rata-rata Output per Hari -->
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-2xs flex flex-col justify-between relative overflow-hidden group hover:border-indigo-300 transition-colors">
          <div class="absolute top-0 right-0 w-16 h-16 bg-purple-50 rounded-bl-full -mr-2 -mt-2 transition-transform group-hover:scale-110"></div>
          <span class="text-[10.5px] font-black text-zinc-500 uppercase tracking-wider relative z-10">Rata-rata Harian</span>
          <div class="mt-2 relative z-10">
            <div class="text-2xl font-black text-purple-700 tracking-tight">{{ analyticsMetrics.avgDaily }}</div>
            <div class="text-[10.5px] text-zinc-400 font-medium mt-0.5">
              Roll / Hari Aktif
            </div>
          </div>
        </div>
      </div>

      <!-- 3. MAIN INTERACTIVE TIMELINE CHART -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h2 class="text-sm font-black text-zinc-900 flex items-center gap-2">
              <span>📈</span>
              <span>Timeline Tren Produksi Roll & Kualitas</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                Mode: {{ effectiveGranularityLabel }}
              </span>
            </h2>
            <p class="text-[11px] text-zinc-500 font-medium">
              Evolusi volume roll FG, status PASS, HOLD, dan REJECT sepanjang rentang waktu terpilih
            </p>
          </div>

          <div class="flex items-center gap-3 flex-wrap justify-between lg:justify-end">
            <!-- Granularity Pill Selector -->
            <div class="flex items-center bg-zinc-100 p-0.5 rounded-xl text-[11px] font-bold border border-zinc-200">
              <button
                v-for="g in [
                  { id: 'auto', label: '⚡ Otomatis' },
                  { id: 'daily', label: '📅 Harian' },
                  { id: 'weekly', label: '📆 Mingguan' },
                  { id: 'monthly', label: '📊 Bulanan' }
                ]"
                :key="g.id"
                @click="setGranularity(g.id)"
                :class="[
                  'px-2.5 py-1 rounded-lg transition-all cursor-pointer text-xs',
                  selectedGranularity === g.id ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-500 hover:text-zinc-800'
                ]"
              >
                {{ g.label }}
              </button>
            </div>

            <!-- Legend -->
            <div class="flex items-center gap-2.5 text-xs font-bold pl-2 border-l border-zinc-200">
              <span class="flex items-center gap-1.5 text-indigo-700"><span class="w-2.5 h-2.5 rounded-full bg-indigo-600"></span> Total</span>
              <span class="flex items-center gap-1.5 text-emerald-700"><span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> PASS</span>
              <span class="flex items-center gap-1.5 text-amber-700"><span class="w-2.5 h-2.5 rounded-full bg-amber-500"></span> HOLD</span>
              <span class="flex items-center gap-1.5 text-red-700"><span class="w-2.5 h-2.5 rounded-full bg-red-600"></span> REJECT</span>
            </div>
          </div>
        </div>

        <div class="relative h-72 sm:h-80 w-full">
          <canvas ref="timelineChartCanvas"></canvas>
          <div v-if="filteredAnalyticsRolls.length === 0" class="absolute inset-0 flex items-center justify-center bg-white/80">
            <p class="text-xs font-bold text-zinc-400">Tidak ada data untuk rentang waktu terpilih</p>
          </div>
        </div>
      </div>

      <!-- 4. SECOND ROW: STATUS DONUT + MACHINE BREAKDOWN + FORMULA BREAKDOWN -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 4A. Quality Status Donut Chart -->
        <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div class="border-b border-zinc-100 pb-2">
            <h3 class="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <span>🍩</span> Komposisi Kualitas Roll
            </h3>
            <p class="text-[10px] text-zinc-500">Rasio kelulusan PASS vs Karantina HOLD vs Afval</p>
          </div>
          <div class="relative h-56 flex items-center justify-center">
            <canvas ref="qualityDonutCanvas"></canvas>
          </div>
          <div class="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-100 text-center">
            <div class="p-1.5 bg-emerald-50 rounded-xl">
              <span class="text-[9px] font-bold text-emerald-700 block">PASS</span>
              <span class="text-xs font-black text-emerald-800">{{ analyticsMetrics.pass }}</span>
            </div>
            <div class="p-1.5 bg-amber-50 rounded-xl">
              <span class="text-[9px] font-bold text-amber-700 block">HOLD</span>
              <span class="text-xs font-black text-amber-800">{{ analyticsMetrics.hold }}</span>
            </div>
            <div class="p-1.5 bg-red-50 rounded-xl">
              <span class="text-[9px] font-bold text-red-700 block">REJECT</span>
              <span class="text-xs font-black text-red-800">{{ analyticsMetrics.reject }}</span>
            </div>
          </div>
        </div>

        <!-- 4B. Machine Distribution Bar Chart -->
        <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div class="border-b border-zinc-100 pb-2">
            <h3 class="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <span>🏭</span> Sebaran Output Mesin
            </h3>
            <p class="text-[10px] text-zinc-500">Distribusi roll pada stasiun Slitting, Rewind, & SML</p>
          </div>
          <div class="relative h-56 flex items-center justify-center">
            <canvas ref="machineBarCanvas"></canvas>
          </div>
          <div class="grid grid-cols-3 gap-1 pt-2 border-t border-zinc-100 text-center font-mono">
            <div class="p-1.5 bg-zinc-50 rounded-xl">
              <span class="text-[9px] font-bold text-zinc-500 block">SLITTING</span>
              <span class="text-xs font-black text-emerald-700">{{ machineBreakdown.slitting }}</span>
            </div>
            <div class="p-1.5 bg-zinc-50 rounded-xl">
              <span class="text-[9px] font-bold text-zinc-500 block">REWIND</span>
              <span class="text-xs font-black text-purple-700">{{ machineBreakdown.rewind }}</span>
            </div>
            <div class="p-1.5 bg-zinc-50 rounded-xl">
              <span class="text-[9px] font-bold text-zinc-500 block">SML</span>
              <span class="text-xs font-black text-blue-700">{{ machineBreakdown.sml }}</span>
            </div>
          </div>
        </div>

        <!-- 4C. Top Formulas & Jenis Film -->
        <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3 flex flex-col justify-between">
          <div class="border-b border-zinc-100 pb-2">
            <h3 class="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <span>🏷️</span> Formula & Jenis Film Terbanyak
            </h3>
            <p class="text-[10px] text-zinc-500">Volume roll berdasarkan formula resin / tipe film</p>
          </div>
          <div class="relative h-56 flex items-center justify-center">
            <canvas ref="formulaBarCanvas"></canvas>
          </div>
          <div class="text-[10px] text-zinc-400 text-center italic pt-2 border-t border-zinc-100">
            Top item teratas dalam periode terpilih
          </div>
        </div>
      </div>

      <!-- 4.5 NEW: PARETO DEFECT REASONS & AI QUALITY ROOT-CAUSE INTELLIGENCE -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- 4.5A. Pareto Defect Reasons -->
        <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h3 class="text-xs font-black text-zinc-900 flex items-center gap-1.5">
                <span>⚠️</span> Top Alasan Defect (HOLD & REJECT)
              </h3>
              <p class="text-[10px] text-zinc-500">Frekuensi alasan cacat kualitas yang paling sering tercatat</p>
            </div>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-200">
              Total Defect: {{ (analyticsMetrics.hold + analyticsMetrics.reject).toLocaleString('id-ID') }} Roll
            </span>
          </div>

          <div v-if="defectReasonsBreakdown.length === 0" class="py-10 text-center text-xs font-bold text-zinc-400">
            Tidak ada data defect tercatat pada periode ini 🎉
          </div>

          <div v-else class="space-y-2.5">
            <div v-for="(item, idx) in defectReasonsBreakdown" :key="item.name" class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold">
                <span class="flex items-center gap-1.5 text-zinc-800">
                  <span class="w-4 h-4 rounded-full bg-zinc-900 text-white text-[9px] font-black flex items-center justify-center">{{ idx + 1 }}</span>
                  <span class="truncate max-w-[220px] sm:max-w-xs">{{ item.name }}</span>
                </span>
                <span class="font-mono text-zinc-600 font-black">
                  {{ item.count.toLocaleString('id-ID') }} Roll <span class="text-zinc-400 font-normal">({{ item.percentage }}%)</span>
                </span>
              </div>
              <div class="w-full bg-zinc-100 h-2 rounded-full overflow-hidden">
                <div
                  class="h-full rounded-full transition-all duration-500"
                  :class="idx === 0 ? 'bg-red-500' : idx === 1 ? 'bg-amber-500' : idx === 2 ? 'bg-orange-500' : 'bg-indigo-500'"
                  :style="{ width: `${item.percentage}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 4.5B. AI Quality & Production Intelligence -->
        <div class="bg-gradient-to-br from-indigo-900 via-zinc-900 to-black text-white p-5 rounded-2xl border border-indigo-800/50 shadow-md flex flex-col justify-between space-y-4">
          <div class="space-y-2">
            <div class="flex items-center justify-between border-b border-white/10 pb-3">
              <div class="flex items-center gap-2">
                <span class="text-xl">🧠</span>
                <div>
                  <h3 class="text-xs font-black text-white tracking-wide uppercase">AI Quality & Root Cause Analysis</h3>
                  <p class="text-[10px] text-indigo-200">Diagnosis cerdas performa kualitas produksi pabrik</p>
                </div>
              </div>
              <button
                @click="generateAiDefectInsights"
                :disabled="isAiAnalyzing"
                class="px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
              >
                <span v-if="isAiAnalyzing" class="animate-spin">🌀</span>
                <span v-else>✨</span>
                <span>{{ isAiAnalyzing ? 'Menganalisis...' : 'Analisis AI' }}</span>
              </button>
            </div>

            <!-- AI Insight Body -->
            <div v-if="aiAnalysisResult" class="p-3.5 bg-white/10 rounded-xl border border-white/10 text-xs text-zinc-200 space-y-1.5 leading-relaxed font-sans">
              <div class="whitespace-pre-line">{{ aiAnalysisResult }}</div>
            </div>
            <div v-else class="p-4 bg-white/5 rounded-xl border border-white/10 text-xs text-zinc-300 space-y-2">
              <p class="font-bold text-white flex items-center gap-1.5">
                <span>💡</span> Ringkasan Metrik Kualitas Kunci:
              </p>
              <ul class="space-y-1 text-[11px] list-disc list-inside text-indigo-100/90 font-medium">
                <li>Yield Rate: <strong class="text-emerald-400">{{ analyticsMetrics.passRate }}% PASS</strong> dari total {{ analyticsMetrics.total.toLocaleString('id-ID') }} roll.</li>
                <li>Rasio Scrap (Reject): <strong class="text-red-400">{{ analyticsMetrics.rejectRate }}%</strong> ({{ analyticsMetrics.reject.toLocaleString('id-ID') }} roll).</li>
                <li>Rata-rata output: <strong class="text-amber-300">{{ analyticsMetrics.avgDaily }} roll/hari aktif</strong>.</li>
              </ul>
              <p class="text-[10px] text-zinc-400 italic pt-1">
                Klik tombol "Analisis AI" di atas untuk mendapatkan diagnosis akar masalah defect dan rekomendasi perbaikan kualitas.
              </p>
            </div>
          </div>

          <!-- Bottom Stat Badges -->
          <div class="grid grid-cols-3 gap-2 pt-2 border-t border-white/10 text-center font-mono">
            <div class="p-2 bg-white/5 rounded-xl">
              <span class="text-[9px] text-zinc-400 block">YIELD RATE</span>
              <span class="text-xs font-black text-emerald-400">{{ analyticsMetrics.passRate }}%</span>
            </div>
            <div class="p-2 bg-white/5 rounded-xl">
              <span class="text-[9px] text-zinc-400 block">REJECT LOSS</span>
              <span class="text-xs font-black text-red-400">{{ analyticsMetrics.rejectRate }}%</span>
            </div>
            <div class="p-2 bg-white/5 rounded-xl">
              <span class="text-[9px] text-zinc-400 block">EST. METER</span>
              <span class="text-xs font-black text-amber-300">{{ formatNumber((analyticsMetrics.totalMeters / 1000).toFixed(1)) }}k M</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 5. DAILY SUMMARY & SPK PERFORMANCE BREAKDOWN TABLE -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-4 border-b border-zinc-200 bg-zinc-50/70 flex items-center justify-between">
          <div>
            <h3 class="text-xs font-black text-zinc-900 flex items-center gap-1.5">
              <span>📋</span> Ringkasan Output Harian & SPK Terdaftar
            </h3>
            <p class="text-[10px] text-zinc-500">Breakdown jumlah roll, persentase kelayakan, dan status per tanggal</p>
          </div>
          <span class="px-2 py-0.5 text-[10px] font-bold bg-white text-zinc-600 rounded-lg border border-zinc-200">
            {{ dailySummaryList.length }} Tanggal Aktif
          </span>
        </div>

        <div class="overflow-x-auto max-h-80">
          <table class="w-full text-left text-xs border-collapse font-mono">
            <thead class="bg-zinc-100 text-[10.5px] font-black text-zinc-600 uppercase sticky top-0">
              <tr>
                <th class="py-2.5 px-3">Tanggal Produksi</th>
                <th class="py-2.5 px-3">No. SPK Terkait</th>
                <th class="py-2.5 px-3 text-center">Total Roll</th>
                <th class="py-2.5 px-3 text-center text-emerald-700">PASS</th>
                <th class="py-2.5 px-3 text-center text-amber-700">HOLD</th>
                <th class="py-2.5 px-3 text-center text-red-700">REJECT</th>
                <th class="py-2.5 px-3 text-center">Pass Rate (%)</th>
                <th class="py-2.5 px-3 text-right">Est. Meter</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 text-[11px]">
              <tr v-if="dailySummaryList.length === 0" class="text-center py-6 text-zinc-400">
                <td colspan="8" class="py-8">Tidak ada data untuk periode ini</td>
              </tr>
              <tr v-for="d in dailySummaryList" :key="d.dateStr" class="hover:bg-indigo-50/30">
                <td class="py-2 px-3 font-bold text-zinc-900">{{ d.dateStr }}</td>
                <td class="py-2 px-3 text-zinc-600 truncate max-w-xs">{{ d.spks.join(', ') || '—' }}</td>
                <td class="py-2 px-3 text-center font-bold text-zinc-900">{{ d.total }}</td>
                <td class="py-2 px-3 text-center font-bold text-emerald-700">{{ d.pass }}</td>
                <td class="py-2 px-3 text-center font-bold text-amber-700">{{ d.hold }}</td>
                <td class="py-2 px-3 text-center font-bold text-red-700">{{ d.reject }}</td>
                <td class="py-2 px-3 text-center">
                  <span class="px-2 py-0.5 rounded-md font-bold text-[10px]" :class="d.passRate >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'">
                    {{ d.passRate }}%
                  </span>
                </td>
                <td class="py-2 px-3 text-right text-zinc-700 font-bold">{{ formatNumber(d.meters) }} M</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 5. MODAL IMPORT EXCEL / COPAS TEXT -->
    <!-- ========================================================================= -->
    <div v-if="showImportModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-5xl overflow-hidden border border-zinc-200 flex flex-col max-h-[92vh]">
        <!-- Header -->
        <div class="px-6 py-4 border-b border-zinc-200 bg-gradient-to-r from-emerald-700 to-emerald-800 text-white flex items-center justify-between">
          <div class="flex items-center gap-2.5">
            <span class="text-2xl">📥</span>
            <div>
              <h3 class="font-black text-base text-white">Verifikasi & Import Data Roll (Excel / Copas)</h3>
              <p class="text-[11px] text-emerald-200">
                Data akan otomatis diuraikan (parsed) secara deterministik ke dalam struktur No Lot, Turunan, Operator, dan Status QC sebelum disimpan
              </p>
            </div>
          </div>
          <button @click="showImportModal = false" class="text-white/80 hover:text-white text-lg font-bold cursor-pointer">✕</button>
        </div>

        <!-- Body -->
        <div class="p-5 space-y-4 overflow-y-auto flex-1 bg-zinc-50/50">
          <!-- Tab Mode: Copas vs File -->
          <div class="flex items-center bg-zinc-200/80 p-1 rounded-xl text-xs font-bold">
            <button
              @click="importTab = 'copas'"
              :class="['flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center', importTab === 'copas' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
            >
              📋 Tempel / Copas Teks Excel (9 Kolom)
            </button>
            <button
              @click="importTab = 'file'"
              :class="['flex-1 py-1.5 rounded-lg transition-all cursor-pointer text-center', importTab === 'file' ? 'bg-white text-zinc-900 shadow-2xs font-black' : 'text-zinc-600 hover:text-zinc-900']"
            >
              📁 Upload File Excel (.xlsx / .csv)
            </button>
          </div>

          <!-- Mode 1: Copas Text Area -->
          <div v-if="importTab === 'copas'" class="space-y-2">
            <label class="block text-xs font-bold text-zinc-700">
              Tempel (Paste) Data dari Excel di sini (Ctrl+V):
            </label>
            <textarea
              v-model="copasText"
              @input="handleCopasInput"
              rows="5"
              placeholder="Contoh format 9 Kolom:&#10;Kode FG	SLITTING	REWIND	SML	Tanggal	No SPK	Kode Pack	Quality Status	REASON OF DEFECT&#10;M01270625B105D308IC15K1 VMCPP M01 40 MC X 1060 MM = 7000	0	1	0	45838	06/VI/SPK/2025	R3B06250085	PASS	&#10;M01270625C206D307IC12K1SORTIR VMCPP M01 40 MC X 1060 MM = 5700	0	1	0	45838	06/VI/SPK/2025	3B01250000	REJECT	PINHOLE SCRATCH ACAK"
              class="w-full p-3 font-mono text-[11px] border border-zinc-300 rounded-xl bg-white outline-none focus:ring-1 focus:ring-emerald-500"
            ></textarea>
          </div>

          <!-- Mode 2: File Upload Area -->
          <div v-else class="space-y-2">
            <div
              @dragover.prevent
              @drop.prevent="handleFileDrop"
              class="border-2 border-dashed border-emerald-300 rounded-2xl p-6 text-center bg-emerald-50/30 hover:bg-emerald-50/60 transition-colors cursor-pointer"
              @click="triggerFileInput"
            >
              <input
                ref="fileInputRef"
                type="file"
                accept=".xlsx,.xls,.csv"
                class="hidden"
                @change="handleFileUpload"
              />
              <span class="text-3xl block mb-2">📊</span>
              <p class="font-black text-xs text-emerald-950">Klik untuk Pilih File Excel atau Tarik & Lepas (Drag & Drop)</p>
              <p class="text-[11px] text-zinc-500 mt-1">Mendukung format .xlsx, .xls, dan .csv (9 Kolom Standar)</p>
              <p v-if="uploadedFileName" class="mt-2 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-lg inline-block">
                File: {{ uploadedFileName }}
              </p>
            </div>
          </div>

          <!-- Import Progress Indicator for Large Datasets (10k-50k rows) -->
          <div v-if="importProgress.active" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2 animate-fade-in">
            <div class="flex items-center justify-between text-xs font-bold text-emerald-900">
              <span class="flex items-center gap-1.5">
                <span class="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {{ importProgress.message || 'Sedang memproses data...' }}
              </span>
              <span class="font-mono text-emerald-700">{{ importProgress.percent }}%</span>
            </div>
            <div class="w-full h-2 bg-emerald-200/60 rounded-full overflow-hidden">
              <div
                class="h-full bg-emerald-600 rounded-full transition-all duration-200"
                :style="{ width: importProgress.percent + '%' }"
              ></div>
            </div>
          </div>

          <!-- Preview Parsed Rolls Area (Modal Verifikasi) -->
          <div v-if="previewParsedRolls.length > 0" class="space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-emerald-950">
                  🔍 Hasil Parsing Otomatis ({{ previewParsedRolls.length.toLocaleString() }} Roll):
                </span>
                <span class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-600 text-white">
                  Siap Verifikasi
                </span>
              </div>
              <div class="flex items-center gap-3">
                <label class="flex items-center gap-1.5 text-xs text-zinc-700 cursor-pointer font-bold">
                  <input type="radio" value="append" v-model="importMode" class="text-emerald-600" />
                  Tambahkan ke Data Ada (Append)
                </label>
                <label class="flex items-center gap-1.5 text-xs text-red-700 cursor-pointer font-bold">
                  <input type="radio" value="replace" v-model="importMode" class="text-red-600" />
                  Gantikan Seluruh Data (Replace)
                </label>
              </div>
            </div>

            <div class="max-h-64 overflow-y-auto border border-zinc-200 rounded-xl bg-white shadow-inner">
              <table class="w-full text-left text-[11px] border-collapse">
                <thead class="bg-zinc-100 text-zinc-700 font-black sticky top-0 border-b border-zinc-200">
                  <tr>
                    <th class="p-2 text-center w-8">#</th>
                    <th class="p-2">No. Lot Hasil Parsing</th>
                    <th class="p-2 text-center">Turunan / Op</th>
                    <th class="p-2 text-center">Mesin</th>
                    <th class="p-2">SPK & Supplier</th>
                    <th class="p-2 text-center">Kode Pack</th>
                    <th class="p-2 text-center">Dimensi & Berat Teori</th>
                    <th class="p-2 text-center">Status</th>
                    <th class="p-2">Reason Of Defect</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100 font-mono text-[10.5px]">
                  <tr v-for="(p, pIdx) in previewParsedRolls.slice(0, 100)" :key="pIdx" class="hover:bg-zinc-50 transition-colors">
                    <td class="p-2 text-center text-zinc-400 font-bold">{{ pIdx + 1 }}</td>
                    <td class="p-2 font-bold text-zinc-900">
                      <div class="flex items-center gap-1">
                        <span class="text-emerald-700 font-black">{{ p.lot }}</span>
                      </div>
                    </td>
                    <td class="p-2 text-center">
                      <span class="px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-800 font-bold border border-zinc-200">
                        {{ p.turunan || '-' }} ({{ p.kodeOperator || 'G' }})
                      </span>
                    </td>
                    <td class="p-2 text-center">
                      <span class="px-1.5 py-0.5 rounded text-[9.5px] font-black" :class="p.machineName === 'REWIND' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-red-50 text-red-700 border border-red-200'">
                        {{ p.machineName }}
                      </span>
                    </td>
                    <td class="p-2 text-zinc-700">
                      <div class="font-bold">{{ p.spk }}</div>
                      <div class="text-[9.5px] text-zinc-400">{{ p.supplier || 'INHOUSE' }} • {{ p.tanggal }}</div>
                    </td>
                    <td class="p-2 text-center font-bold text-zinc-800">
                      {{ p.kodePack }}{{ p.subKode }}
                    </td>
                    <td class="p-2 text-center font-mono">
                      <div class="text-zinc-800 font-bold">{{ p.thickness }}MC x {{ p.width }}MM = {{ p.length }}M</div>
                      <div class="text-[10px] text-emerald-700 font-black bg-emerald-50 px-1 py-0.5 rounded border border-emerald-200 mt-0.5 inline-block" :title="`Netto Teori: ${p.beratTeori || p.netto} kg | Paper Core: ${p.paperCore || '-'} kg | Bruto: ${p.bruto || '-'} kg`">
                        ⚖️ Teori: {{ p.beratTeori || p.netto }} kg
                      </div>
                    </td>
                    <td class="p-2 text-center">
                      <span class="px-2 py-0.5 rounded text-[10px] font-black" :class="p.qualityStatus === 'PASS' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : p.qualityStatus === 'HOLD' ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-red-100 text-red-800 border border-red-200'">
                        {{ p.qualityStatus }}
                      </span>
                    </td>
                    <td class="p-2 text-zinc-700 font-sans truncate max-w-[140px]" :title="p.reasonDefect || p.keterangan || '-'">
                      {{ p.reasonDefect || p.keterangan || '-' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="previewParsedRolls.length > 100" class="text-[10px] text-zinc-500 italic text-center">
              Menampilkan 100 roll pertama dari {{ previewParsedRolls.length.toLocaleString() }} roll terverifikasi.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="px-6 py-4 border-t border-zinc-200 bg-white flex items-center justify-between">
          <button @click="showImportModal = false" :disabled="isImporting" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer disabled:opacity-40">
            Batal
          </button>
          <button
            @click="commitImport"
            :disabled="previewParsedRolls.length === 0 || isImporting"
            class="px-6 py-2.5 text-xs font-black bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl shadow-md cursor-pointer disabled:opacity-50 transition-all flex items-center gap-1.5"
          >
            <span>{{ isImporting ? 'Menyimpan ke Database...' : `✅ Verifikasi & Simpan ${previewParsedRolls.length.toLocaleString()} Data Roll` }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 6. MODAL TAMBAH / EDIT ROLL MANUAL -->
    <!-- ========================================================================= -->
    <div v-if="showManualModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden border border-zinc-200">
        <div class="px-6 py-4 border-b border-zinc-200 bg-zinc-900 text-white flex items-center justify-between">
          <h3 class="font-black text-sm text-white">
            {{ editingRollId ? 'Edit Identitas Roll' : 'Tambah Roll Manual' }}
          </h3>
          <button @click="showManualModal = false" class="text-white/80 hover:text-white cursor-pointer font-bold">✕</button>
        </div>

        <div class="p-5 space-y-3 max-h-[75vh] overflow-y-auto text-xs">
          <div>
            <label class="font-bold text-zinc-700 block mb-1">Kode FG (Deskripsi Lengkap)</label>
            <input
              v-model="manualForm.kodeFg"
              placeholder="M07270626C105/D112A/IA13 VMCPP M07 25 MC X 1160 MM = 10000"
              class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none font-mono"
            />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-zinc-700 block mb-1">No. Lot FG</label>
              <input v-model="manualForm.lot" placeholder="M07270626C105/D112A/IA13" class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none font-mono font-bold" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">No. SPK</label>
              <input v-model="manualForm.spk" placeholder="07/VI/SPK/2026" class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none font-mono" />
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Mesin Penugasan</label>
              <select v-model="manualForm.machineName" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-bold outline-none">
                <option value="SLITTING">SLITTING</option>
                <option value="REWIND">REWIND</option>
                <option value="SML">SML</option>
              </select>
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Tanggal</label>
              <input v-model="manualForm.tanggalFormatted" type="date" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl outline-none font-mono" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Quality Status</label>
              <select v-model="manualForm.qualityStatus" class="w-full px-2.5 py-2 text-xs border border-zinc-300 rounded-xl bg-white font-bold outline-none">
                <option value="PASS">PASS</option>
                <option value="HOLD">HOLD</option>
                <option value="REJECT">REJECT</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Kode Pack</label>
              <input v-model="manualForm.kodePack" placeholder="3B0726" class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none font-mono font-bold" />
            </div>
            <div>
              <label class="font-bold text-zinc-700 block mb-1">Sub Kode (No. Urut / 0000)</label>
              <input v-model="manualForm.subKode" placeholder="0001" class="w-full px-3 py-2 text-xs border border-zinc-300 rounded-xl outline-none font-mono font-bold text-red-600" />
            </div>
          </div>
        </div>

        <div class="px-6 py-4 border-t border-zinc-200 bg-zinc-50 flex justify-end gap-2">
          <button @click="showManualModal = false" class="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer">Batal</button>
          <button @click="saveManualRoll" class="px-5 py-2 text-xs font-black bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer">Simpan Roll</button>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL RINCIAN DATA ROLL BATCH / UPLOAD -->
    <!-- ========================================================================= -->
    <div
      v-if="showBatchDetailModal && selectedBatch"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-fade-in"
      @click.self="showBatchDetailModal = false"
    >
      <div class="bg-white w-full max-w-5xl max-h-[92vh] rounded-3xl shadow-2xl border border-zinc-200 flex flex-col overflow-hidden animate-scale-in">
        <!-- Header -->
        <div class="px-6 py-4 bg-gradient-to-r from-indigo-900 to-zinc-900 text-white flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
              <span v-if="selectedBatch.source && selectedBatch.source.includes('Verifikasi')">✅</span>
              <span v-else>📥</span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="text-sm sm:text-base font-black tracking-tight">
                  {{ selectedBatch.batchName || selectedBatch.fileName }}
                </h3>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                  {{ batchRollsCount }} Roll
                </span>
              </div>
              <div class="text-[11px] text-zinc-300 flex items-center gap-2 mt-0.5 font-medium">
                <span>Sumber: <strong>{{ selectedBatch.source || 'Import Excel' }}</strong></span>
                <span>•</span>
                <span>Waktu: <strong>{{ formatHistoryTimestamp(selectedBatch.uploadDate || selectedBatch.createdAt) }}</strong></span>
                <span>•</span>
                <span>Petugas: <strong>{{ selectedBatch.uploadedBy || 'Data Entry' }}</strong></span>
              </div>
            </div>
          </div>

          <button
            @click="showBatchDetailModal = false"
            class="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer"
          >
            ✕
          </button>
        </div>

        <!-- KPI Mini Cards -->
        <div class="px-6 py-3 bg-zinc-50 border-b border-zinc-200 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div class="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-2xs">
            <span class="text-[10px] font-black text-zinc-400 uppercase">Total Roll</span>
            <div class="text-lg font-black text-zinc-900 font-mono">{{ batchRollsCount }} Roll</div>
          </div>
          <div class="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-2xs">
            <span class="text-[10px] font-black text-zinc-400 uppercase">Total Berat</span>
            <div class="text-lg font-black text-zinc-900 font-mono">{{ batchTotalKg.toLocaleString('id-ID') }} kg</div>
          </div>
          <div class="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-2xs">
            <span class="text-[10px] font-black text-emerald-600 uppercase">PASS (Siap FG)</span>
            <div class="text-lg font-black text-emerald-700 font-mono">{{ batchPassCount }} Roll</div>
          </div>
          <div class="bg-white p-2.5 rounded-xl border border-zinc-200 text-center shadow-2xs">
            <span class="text-[10px] font-black text-amber-600 uppercase">HOLD / REJECT</span>
            <div class="text-lg font-black text-amber-700 font-mono">{{ batchHoldCount + batchRejectCount }} Roll</div>
          </div>
        </div>

        <!-- Filter & Search Bar in Batch -->
        <div class="px-6 py-2.5 bg-white border-b border-zinc-200 flex items-center justify-between gap-3">
          <div class="relative flex-1 max-w-sm">
            <input
              v-model="batchSearchQuery"
              placeholder="Cari dalam batch ini (Kode FG, Lot, SPK, Turunan)..."
              class="w-full pl-8 pr-3 py-1.5 text-xs border border-zinc-300 rounded-xl outline-none focus:ring-1 focus:ring-indigo-500 bg-zinc-50 focus:bg-white"
            />
            <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>

          <div class="flex items-center gap-2">
            <button
              @click="exportBatch(selectedBatch)"
              class="px-3 py-1.5 text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>📊 Export Batch Excel</span>
            </button>
            <button
              @click="loadBatchIntoMainTable(selectedBatch)"
              class="px-3 py-1.5 text-xs font-black bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
            >
              <span>📋 Filter di Tabel Utama</span>
            </button>
          </div>
        </div>

        <!-- Data Table of Rolls in Batch -->
        <div class="flex-1 overflow-auto p-4 max-h-[55vh]">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="sticky top-0 bg-zinc-100 z-10">
              <tr class="text-[11px] font-black text-zinc-600 uppercase border-b border-zinc-200">
                <th class="py-2.5 px-3 text-center w-10">No</th>
                <th class="py-2.5 px-3">Kode FG & Deskripsi</th>
                <th class="py-2.5 px-3">Lot & Turunan</th>
                <th class="py-2.5 px-3 text-center">Mesin</th>
                <th class="py-2.5 px-3 text-center">Tanggal</th>
                <th class="py-2.5 px-3">No SPK</th>
                <th class="py-2.5 px-3 text-center">Kode Pack</th>
                <th class="py-2.5 px-3 text-center">Dimensi</th>
                <th class="py-2.5 px-3 text-center">Core / OD</th>
                <th class="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200/70">
              <tr v-if="batchFilteredRolls.length === 0" class="text-center py-6">
                <td colspan="10" class="py-8 text-zinc-400 font-bold">
                  Tidak ada roll yang sesuai dengan pencarian dalam batch ini.
                </td>
              </tr>

              <tr
                v-for="(r, rIdx) in paginatedBatchRolls"
                :key="r.id || r.uuid || rIdx"
                class="hover:bg-indigo-50/30 transition-colors"
              >
                <td class="py-2 px-3 text-center font-mono text-[11px] text-zinc-400">
                  {{ (batchPage - 1) * batchPageSize + rIdx + 1 }}
                </td>
                <td class="py-2 px-3 font-medium">
                  <div class="font-mono text-[11px] font-bold text-zinc-900 leading-tight">
                    {{ r.kodeFg }}
                  </div>
                  <div class="text-[10px] text-zinc-500 mt-0.5">
                    <span class="font-bold text-indigo-600">{{ r.jenis }}</span> • <span class="font-bold text-red-600">{{ r.kodeFormula }}</span>
                  </div>
                </td>
                <td class="py-2 px-3 whitespace-nowrap">
                  <div class="font-mono font-black text-xs text-zinc-900">{{ extractCleanParentLot(r.lot, r.turunan) }}</div>
                  <span v-if="r.turunan" class="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-black bg-zinc-100 text-zinc-700 border border-zinc-200 mt-0.5">
                    Turunan: {{ r.turunan }}
                  </span>
                </td>
                <td class="py-2 px-3 text-center whitespace-nowrap font-bold text-[10.5px]">
                  <span class="px-2 py-0.5 rounded text-zinc-800 bg-zinc-100 font-mono">{{ r.machineName || (r.slitting ? 'SLITTING' : (r.rewind ? 'REWIND' : 'SML')) }}</span>
                </td>
                <td class="py-2 px-3 text-center whitespace-nowrap font-mono text-[11px] text-zinc-700">
                  {{ r.tanggalFormatted || r.tanggal }}
                </td>
                <td class="py-2 px-3 font-mono font-bold text-zinc-800 whitespace-nowrap">
                  {{ r.spk || '—' }}
                </td>
                <td class="py-2 px-3 text-center font-mono whitespace-nowrap">
                  <span class="font-bold text-zinc-900">{{ r.kodePack }}</span>
                  <span class="font-black text-red-600">{{ r.subKode }}</span>
                </td>
                <td class="py-2 px-3 text-center whitespace-nowrap font-mono">
                  <span class="font-bold text-zinc-900">{{ r.thickness }}MC</span> × <span class="font-bold text-zinc-900">{{ r.width }}MM</span>
                  <div class="text-[10px] text-zinc-500">= {{ r.length }}M</div>
                </td>
                <td class="py-2 px-3 text-center whitespace-nowrap text-[11px]">
                  <div class="font-bold text-zinc-800">{{ r.core }}" Core</div>
                  <div class="text-[10px] text-indigo-700 font-semibold truncate max-w-[85px]">{{ r.od || r.treatment || '—' }}</div>
                </td>
                <td class="py-2 px-3 text-center whitespace-nowrap">
                  <span
                    v-if="(r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS'"
                    class="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800"
                  >PASS</span>
                  <span
                    v-else-if="(r.qualityStatus || r.status || '').toUpperCase() === 'HOLD'"
                    class="px-2 py-0.5 rounded text-[10px] font-black bg-amber-100 text-amber-800"
                  >HOLD</span>
                  <span
                    v-else
                    class="px-2 py-0.5 rounded text-[10px] font-black bg-red-100 text-red-800"
                  >REJECT</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Footer with Pagination -->
        <div class="px-6 py-3 bg-zinc-50 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2 text-zinc-600">
            <span>Menampilkan <strong>{{ paginatedBatchRolls.length }}</strong> dari <strong>{{ batchFilteredRolls.length }}</strong> roll</span>
            <span class="text-zinc-300">•</span>
            <span>Halaman <strong>{{ batchPage }}</strong> dari <strong>{{ batchTotalPages }}</strong></span>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              :disabled="batchPage <= 1"
              @click="batchPage--"
              class="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs cursor-pointer transition-all"
            >
              ◀ Prev
            </button>
            <span class="px-2.5 py-0.5 rounded bg-zinc-900 text-white font-mono font-bold text-xs">
              {{ batchPage }} / {{ batchTotalPages }}
            </span>
            <button
              type="button"
              :disabled="batchPage >= batchTotalPages"
              @click="batchPage++"
              class="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs cursor-pointer transition-all"
            >
              Next ▶
            </button>
            <button
              @click="showBatchDetailModal = false"
              class="ml-3 px-4 py-1.5 text-xs font-bold text-zinc-700 bg-white hover:bg-zinc-100 border border-zinc-300 rounded-lg cursor-pointer shadow-2xs"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useDataRollStore } from '@/stores/dataRollStore';
import { parseCopasTextDataRoll, parseExcelFileDataRoll, parseDataRollRow, extractCleanParentLot } from '@/services/dataRollParserService';
import Chart from 'chart.js/auto';

const dataRollStore = useDataRollStore();

// Active Sheet / Tab ('table' | 'analytics')
const activeSheet = ref('table');

// Table Sheet State
const selectedRollIds = ref([]);
const currentPage = ref(1);
const pageSize = ref(25);

// Import Modal State
const showImportModal = ref(false);
const importTab = ref('copas');
const importMode = ref('append');
const copasText = ref('');
const uploadedFileName = ref('');
const previewParsedRolls = ref([]);
const fileInputRef = ref(null);
const isImporting = ref(false);
const importProgress = reactive({
  active: false,
  percent: 0,
  message: ''
});

// Manual Modal State
const showManualModal = ref(false);
const editingRollId = ref(null);
const manualForm = reactive({
  kodeFg: '',
  lot: '',
  turunan: '',
  jenis: 'VMCPP',
  kodeFormula: 'M07',
  thickness: '25',
  width: '1000',
  length: '10000',
  core: 6,
  treatment: 'PLASMA',
  od: 'OD2.4+PLASMA',
  slitting: 1,
  rewind: 0,
  sml: 0,
  machineName: 'SLITTING',
  tanggalFormatted: new Date().toISOString().slice(0, 10),
  spk: '',
  kodePack: '3B0726',
  subKode: '0001',
  qualityStatus: 'PASS'
});

// =========================================================================
// ANALYTICS & TIME RANGE FILTERING STATE
// =========================================================================
const selectedTimePreset = ref('all'); // 'all' | '7d' | '30d' | '6m' | '1y' | 'custom'
const customStartDate = ref('');
const customEndDate = ref('');
const analyticsMachineFilter = ref('ALL'); // 'ALL' | 'SLITTING' | 'REWIND' | 'SML'

const timePresets = [
  { id: 'all', label: 'Semua Waktu' },
  { id: '7d', label: '7 Hari Terakhir' },
  { id: '30d', label: '1 Bulan' },
  { id: '6m', label: '6 Bulan' },
  { id: '1y', label: '1 Tahun' },
  { id: 'custom', label: 'Kustom' },
];

const setTimeRange = (presetId) => {
  selectedTimePreset.value = presetId;
  const now = new Date();
  if (presetId === '7d') {
    const past = new Date(now);
    past.setDate(past.getDate() - 7);
    customStartDate.value = past.toISOString().slice(0, 10);
    customEndDate.value = now.toISOString().slice(0, 10);
  } else if (presetId === '30d') {
    const past = new Date(now);
    past.setDate(past.getDate() - 30);
    customStartDate.value = past.toISOString().slice(0, 10);
    customEndDate.value = now.toISOString().slice(0, 10);
  } else if (presetId === '6m') {
    const past = new Date(now);
    past.setMonth(past.getMonth() - 6);
    customStartDate.value = past.toISOString().slice(0, 10);
    customEndDate.value = now.toISOString().slice(0, 10);
  } else if (presetId === '1y') {
    const past = new Date(now);
    past.setFullYear(past.getFullYear() - 1);
    customStartDate.value = past.toISOString().slice(0, 10);
    customEndDate.value = now.toISOString().slice(0, 10);
  }
};

const timeRangeLabel = computed(() => {
  if (selectedTimePreset.value === '7d') return '7 Hari Terakhir';
  if (selectedTimePreset.value === '30d') return '1 Bulan Terakhir';
  if (selectedTimePreset.value === '6m') return '6 Bulan Terakhir';
  if (selectedTimePreset.value === '1y') return '1 Tahun Terakhir';
  if (selectedTimePreset.value === 'custom') return `${customStartDate.value || '...'} s/d ${customEndDate.value || '...'}`;
  return 'Keseluruhan Data';
});

// Filtered rolls for Analytics Sheet
const filteredAnalyticsRolls = computed(() => {
  let list = [...dataRollStore.rolls];

  // Filter Machine
  if (analyticsMachineFilter.value !== 'ALL') {
    if (analyticsMachineFilter.value === 'SLITTING') {
      list = list.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SLITTING');
    } else if (analyticsMachineFilter.value === 'REWIND') {
      list = list.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'REWIND');
    } else if (analyticsMachineFilter.value === 'SML') {
      list = list.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SML');
    }
  }

  // Filter Date Range
  if (selectedTimePreset.value !== 'all') {
    if (customStartDate.value) {
      list = list.filter(r => (r.tanggalFormatted || r.tanggal) >= customStartDate.value);
    }
    if (customEndDate.value) {
      list = list.filter(r => (r.tanggalFormatted || r.tanggal) <= customEndDate.value);
    }
  }

  return list;
});

// Computed Metrics for Analytics Sheet
const analyticsMetrics = computed(() => {
  const list = filteredAnalyticsRolls.value;
  const total = list.length;
  const pass = list.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length;
  const hold = list.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length;
  const reject = list.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length;

  const passRate = total > 0 ? ((pass / total) * 100).toFixed(1) : 0;
  const holdRate = total > 0 ? ((hold / total) * 100).toFixed(1) : 0;
  const rejectRate = total > 0 ? ((reject / total) * 100).toFixed(1) : 0;

  const totalMeters = list.reduce((acc, curr) => acc + (parseFloat(curr.length || curr.meter || 0) || 0), 0);

  // Distinct active days
  const distinctDays = new Set(list.map(r => r.tanggalFormatted || r.tanggal).filter(Boolean)).size;
  const avgDaily = distinctDays > 0 ? (total / distinctDays).toFixed(1) : total;

  return {
    total,
    pass,
    hold,
    reject,
    passRate,
    holdRate,
    rejectRate,
    totalMeters,
    avgDaily
  };
});

const machineBreakdown = computed(() => {
  const list = filteredAnalyticsRolls.value;
  return {
    slitting: list.filter(r => r.slitting === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SLITTING').length,
    rewind: list.filter(r => r.rewind === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'REWIND').length,
    sml: list.filter(r => r.sml === 1 || String(r.machineName || r.mesin || '').toUpperCase() === 'SML').length,
  };
});

// Defect Reasons Breakdown (Reason of Defect / Defect Pareto)
const defectReasonsBreakdown = computed(() => {
  const list = filteredAnalyticsRolls.value;
  const reasonMap = {};
  for (const r of list) {
    const st = String(r.qualityStatus || r.status || '').toUpperCase();
    if (st === 'HOLD' || st === 'REJECT') {
      const reasonRaw = (r.reasonDefect || r.reasonOfDefect || r.keterangan || '').trim().toUpperCase();
      const reasons = reasonRaw ? reasonRaw.split(/[,;\/]+/).map(s => s.trim()).filter(Boolean) : ['DEFECT TANPA KETERANGAN'];
      for (const reason of reasons) {
        reasonMap[reason] = (reasonMap[reason] || 0) + 1;
      }
    }
  }
  const sorted = Object.entries(reasonMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  
  const totalDefects = sorted.reduce((acc, c) => acc + c.count, 0) || 1;
  return sorted.slice(0, 6).map(item => ({
    ...item,
    percentage: ((item.count / totalDefects) * 100).toFixed(1)
  }));
});

const isAiAnalyzing = ref(false);
const aiAnalysisResult = ref('');

const generateAiDefectInsights = () => {
  isAiAnalyzing.value = true;
  setTimeout(() => {
    const metrics = analyticsMetrics.value;
    const top1 = defectReasonsBreakdown.value[0];
    const top2 = defectReasonsBreakdown.value[1];
    const top3 = defectReasonsBreakdown.value[2];

    const topDefectStr = top1 ? `1. Defect terbanyak adalah **"${top1.name}"** sebanyak ${top1.count.toLocaleString('id-ID')} roll (${top1.percentage}% dari seluruh defect).` : '';
    const top2Str = top2 ? `\n2. Urutan kedua adalah **"${top2.name}"** sebanyak ${top2.count.toLocaleString('id-ID')} roll (${top2.percentage}%).` : '';
    const top3Str = top3 ? `\n3. Urutan ketiga adalah **"${top3.name}"** sebanyak ${top3.count.toLocaleString('id-ID')} roll (${top3.percentage}%).` : '';

    aiAnalysisResult.value = `📊 **Ringkasan Diagnosa AI Kualitas Produksi:**
• **Total Produksi Dianalisis**: ${metrics.total.toLocaleString('id-ID')} Roll (${metrics.totalMeters.toLocaleString('id-ID')} Meter)
• **Yield Rate (Tingkat Kelulusan)**: **${metrics.passRate}%** (${metrics.pass.toLocaleString('id-ID')} Roll Siap Kirim)
• **Tingkat Karantina (HOLD)**: **${metrics.holdRate}%** (${metrics.hold.toLocaleString('id-ID')} Roll)
• **Tingkat Scrap (REJECT)**: **${metrics.rejectRate}%** (${metrics.reject.toLocaleString('id-ID')} Roll)

🎯 **Akar Masalah Defect Terbesar:**
${topDefectStr}${top2Str}${top3Str}

💡 **Rekomendasi Tindakan Korektif untuk Supervisor & QC:**
1. Lakukan verifikasi ketajaman pisau slitting dan alignment roll tension untuk mengurangi defect goresan/kerut.
2. Pada mesin Rewind, pastikan pemilahan sisa sortir (hold/reject) dicatat dengan kode defect spesifik agar memudahkan penelusuran lot induk.
3. Prioritaskan re-evaluasi lot HOLD agar tidak menumpuk di staging warehouse.`;
    isAiAnalyzing.value = false;
  }, 600);
};

// Daily Breakdown List
const dailySummaryList = computed(() => {
  const map = {};
  for (const r of filteredAnalyticsRolls.value) {
    const dateStr = r.tanggalFormatted || r.tanggal || 'Tanpa Tanggal';
    if (!map[dateStr]) {
      map[dateStr] = {
        dateStr,
        total: 0,
        pass: 0,
        hold: 0,
        reject: 0,
        meters: 0,
        spks: new Set()
      };
    }
    map[dateStr].total++;
    const st = (r.qualityStatus || r.status || 'PASS').toUpperCase();
    if (st === 'PASS') map[dateStr].pass++;
    else if (st === 'HOLD') map[dateStr].hold++;
    else if (st === 'REJECT') map[dateStr].reject++;

    map[dateStr].meters += parseFloat(r.length || r.meter || 0) || 0;
    if (r.spk) map[dateStr].spks.add(r.spk);
  }

  return Object.values(map)
    .map(item => ({
      ...item,
      spks: Array.from(item.spks),
      passRate: item.total > 0 ? Math.round((item.pass / item.total) * 100) : 0
    }))
    .sort((a, b) => b.dateStr.localeCompare(a.dateStr));
});

// =========================================================================
// CHART.JS INSTANCES & RENDERING
// =========================================================================
const timelineChartCanvas = ref(null);
const qualityDonutCanvas = ref(null);
const machineBarCanvas = ref(null);
const formulaBarCanvas = ref(null);

let timelineChartInstance = null;
let qualityDonutInstance = null;
let machineBarInstance = null;
let formulaBarInstance = null;

const selectedGranularity = ref('auto');
const effectiveGranularity = ref('daily');

const effectiveGranularityLabel = computed(() => {
  if (selectedGranularity.value === 'daily') return 'Harian';
  if (selectedGranularity.value === 'weekly') return 'Mingguan';
  if (selectedGranularity.value === 'monthly') return 'Bulanan';
  return `Otomatis (${effectiveGranularity.value === 'monthly' ? 'Bulanan' : effectiveGranularity.value === 'weekly' ? 'Mingguan' : 'Harian'})`;
});

const setGranularity = (g) => {
  selectedGranularity.value = g;
  nextTick(() => renderCharts());
};

const renderCharts = () => {
  if (activeSheet.value !== 'analytics') return;

  const list = filteredAnalyticsRolls.value;

  // 1. Tentukan Granularitas Efektif (Adaptive Granularity)
  let eff = selectedGranularity.value;
  if (eff === 'auto') {
    const rawDates = list.map(r => r.tanggalFormatted || r.tanggal).filter(Boolean);
    const uniqueDates = [...new Set(rawDates)];
    if (uniqueDates.length > 90) {
      eff = 'monthly';
    } else if (uniqueDates.length > 31) {
      eff = 'weekly';
    } else {
      eff = 'daily';
    }
  }
  effectiveGranularity.value = eff;

  // 2. Group rolls by Effective Granularity
  const dateMap = {};
  for (const r of list) {
    const rawDate = r.tanggalFormatted || r.tanggal || '';
    let groupKey = 'Tanpa Tanggal';

    if (rawDate && /^\d{4}-\d{2}-\d{2}/.test(rawDate)) {
      if (eff === 'monthly') {
        groupKey = rawDate.slice(0, 7); // YYYY-MM (e.g. 2025-06)
      } else if (eff === 'weekly') {
        const dObj = new Date(rawDate);
        const year = dObj.getFullYear();
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (dObj - firstDayOfYear) / 86400000;
        const weekNum = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        groupKey = `${year}-W${String(weekNum).padStart(2, '0')}`;
      } else {
        groupKey = rawDate; // YYYY-MM-DD
      }
    } else if (rawDate) {
      groupKey = rawDate;
    }

    if (!dateMap[groupKey]) {
      dateMap[groupKey] = { total: 0, pass: 0, hold: 0, reject: 0 };
    }
    dateMap[groupKey].total++;
    const st = (r.qualityStatus || r.status || 'PASS').toUpperCase();
    if (st === 'PASS') dateMap[groupKey].pass++;
    else if (st === 'HOLD') dateMap[groupKey].hold++;
    else if (st === 'REJECT') dateMap[groupKey].reject++;
  }

  const sortedKeys = Object.keys(dateMap).sort();
  
  // Format Label Tampilan Sumbu X
  const formatGroupLabel = (k) => {
    if (/^\d{4}-\d{2}$/.test(k)) {
      const [y, m] = k.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
      return `${monthNames[parseInt(m, 10) - 1]} '${y.slice(2)}`;
    }
    if (/^\d{4}-W\d{2}$/.test(k)) {
      const [y, w] = k.split('-');
      return `${w} '${y.slice(2)}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(k)) {
      const [, m, d] = k.split('-');
      return `${d}/${m}`;
    }
    return k;
  };

  const timelineLabels = sortedKeys.length > 0 ? sortedKeys.map(formatGroupLabel) : ['Tidak Ada Data'];
  const totalData = sortedKeys.map(k => dateMap[k].total);
  const passData = sortedKeys.map(k => dateMap[k].pass);
  const holdData = sortedKeys.map(k => dateMap[k].hold);
  const rejectData = sortedKeys.map(k => dateMap[k].reject);

  // Render 1: Timeline Line/Area Chart
  if (timelineChartCanvas.value) {
    if (timelineChartInstance) timelineChartInstance.destroy();
    
    // Auto-smooth point configuration for clean look
    const isDense = sortedKeys.length > 35;
    const ptRadius = isDense ? 0 : 3;
    const ptHoverRadius = isDense ? 5 : 6;

    timelineChartInstance = new Chart(timelineChartCanvas.value, {
      type: 'line',
      data: {
        labels: timelineLabels,
        datasets: [
          {
            label: 'Total Roll',
            data: totalData,
            borderColor: '#4f46e5', // Indigo
            backgroundColor: 'rgba(79, 70, 229, 0.08)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: ptRadius,
            pointHoverRadius: ptHoverRadius,
          },
          {
            label: 'PASS',
            data: passData,
            borderColor: '#10b981', // Emerald
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: isDense ? 0 : 2.5,
            pointHoverRadius: ptHoverRadius,
          },
          {
            label: 'HOLD',
            data: holdData,
            borderColor: '#f59e0b', // Amber
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: isDense ? 0 : 2.5,
            pointHoverRadius: ptHoverRadius,
          },
          {
            label: 'REJECT',
            data: rejectData,
            borderColor: '#ef4444', // Red
            backgroundColor: 'transparent',
            tension: 0.35,
            borderWidth: 2,
            pointRadius: isDense ? 0 : 2.5,
            pointHoverRadius: ptHoverRadius,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: '#18181b',
            titleFont: { size: 11, weight: 'bold' },
            bodyFont: { size: 11 },
            padding: 10,
            cornerRadius: 10,
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              maxTicksLimit: 14,
              font: { size: 10, weight: 'bold' },
              color: '#71717a'
            }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f4f4f5' },
            ticks: { font: { size: 10 }, color: '#71717a' }
          }
        }
      }
    });
  }

  // Render 2: Quality Status Donut Chart
  if (qualityDonutCanvas.value) {
    if (qualityDonutInstance) qualityDonutInstance.destroy();
    const p = analyticsMetrics.value.pass;
    const h = analyticsMetrics.value.hold;
    const r = analyticsMetrics.value.reject;

    qualityDonutInstance = new Chart(qualityDonutCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['PASS (Siap)', 'HOLD (Karantina)', 'REJECT (Scrap)'],
        datasets: [{
          data: [p, h, r],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
          borderWidth: 2,
          borderColor: '#ffffff',
          hoverOffset: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { font: { size: 10, weight: 'bold' }, boxWidth: 10, padding: 12 }
          }
        }
      }
    });
  }

  // Render 3: Machine Distribution Bar Chart
  if (machineBarCanvas.value) {
    if (machineBarInstance) machineBarInstance.destroy();
    machineBarInstance = new Chart(machineBarCanvas.value, {
      type: 'bar',
      data: {
        labels: ['Slitting', 'Rewind', 'SML'],
        datasets: [{
          label: 'Jumlah Roll',
          data: [machineBreakdown.value.slitting, machineBreakdown.value.rewind, machineBreakdown.value.sml],
          backgroundColor: ['#10b981', '#a855f7', '#3b82f6'],
          borderRadius: 8,
          maxBarThickness: 45
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: 'bold' }, color: '#3f3f46' }
          },
          y: {
            beginAtZero: true,
            grid: { color: '#f4f4f5' },
            ticks: { stepSize: 1, font: { size: 10 }, color: '#71717a' }
          }
        }
      }
    });
  }

  // Render 4: Top Formula / Jenis Film Horizontal Bar Chart
  if (formulaBarCanvas.value) {
    if (formulaBarInstance) formulaBarInstance.destroy();

    const formulaMap = {};
    for (const roll of list) {
      const label = `${roll.jenis || 'VMCPP'} ${roll.kodeFormula || ''}`.trim();
      formulaMap[label] = (formulaMap[label] || 0) + 1;
    }

    const sortedEntries = Object.entries(formulaMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const fLabels = sortedEntries.map(e => e[0]);
    const fValues = sortedEntries.map(e => e[1]);

    formulaBarInstance = new Chart(formulaBarCanvas.value, {
      type: 'bar',
      data: {
        labels: fLabels.length > 0 ? fLabels : ['—'],
        datasets: [{
          label: 'Roll',
          data: fValues.length > 0 ? fValues : [0],
          backgroundColor: '#6366f1',
          borderRadius: 6,
          maxBarThickness: 20
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: {
            beginAtZero: true,
            grid: { color: '#f4f4f5' },
            ticks: { stepSize: 1, font: { size: 9 }, color: '#71717a' }
          },
          y: {
            grid: { display: false },
            ticks: { font: { size: 10, weight: 'bold' }, color: '#3f3f46' }
          }
        }
      }
    });
  }
};

// Re-render charts when activeSheet becomes 'analytics' or filters change
watch([activeSheet, filteredAnalyticsRolls], async () => {
  if (activeSheet.value === 'analytics') {
    await nextTick();
    renderCharts();
  }
});

// Helper format number
const formatNumber = (num) => {
  if (!num) return '0';
  return Number(num).toLocaleString('id-ID');
};

// =========================================================================
// TABLE PAGINATION & SELECTION
// =========================================================================
const totalPages = computed(() => {
  return Math.ceil(dataRollStore.filteredRolls.length / pageSize.value) || 1;
});

const jumpPageInput = ref('');
const jumpToPage = () => {
  const p = parseInt(jumpPageInput.value, 10);
  if (!isNaN(p) && p >= 1 && p <= totalPages.value) {
    currentPage.value = p;
    jumpPageInput.value = '';
  } else {
    alert(`Masukkan nomor halaman antara 1 hingga ${totalPages.value}`);
  }
};

const dataRollPagination = computed(() => {
  const current = currentPage.value || 1;
  const total = Math.max(1, totalPages.value || 1);
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

const paginatedRolls = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return dataRollStore.filteredRolls.slice(start, start + pageSize.value);
});

const isAllSelected = computed(() => {
  return paginatedRolls.value.length > 0 && paginatedRolls.value.every(r => selectedRollIds.value.includes(r.id));
});

const isAllFilteredSelected = computed(() => {
  return dataRollStore.filteredRolls.length > 0 && selectedRollIds.value.length === dataRollStore.filteredRolls.length;
});

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    const currentIds = paginatedRolls.value.map(r => r.id);
    selectedRollIds.value = selectedRollIds.value.filter(id => !currentIds.includes(id));
  } else {
    const currentIds = paginatedRolls.value.map(r => r.id);
    selectedRollIds.value = [...new Set([...selectedRollIds.value, ...currentIds])];
  }
};

const selectAllFilteredRolls = () => {
  selectedRollIds.value = dataRollStore.filteredRolls.map(r => r.id);
};

const clearSelection = () => {
  selectedRollIds.value = [];
};

// =========================================================================
// UPLOAD HISTORY & BATCH DETAIL STATE & METHODS
// =========================================================================
const historyFilterSource = ref('ALL'); // 'ALL' | 'EXCEL' | 'DE'
const historySearchQuery = ref('');

const filteredUploadHistory = computed(() => {
  let list = [...dataRollStore.uploadHistory];

  if (historyFilterSource.value !== 'ALL') {
    if (historyFilterSource.value === 'EXCEL') {
      list = list.filter(b => (b.source || '').includes('Excel') || (b.source || '').includes('File'));
    } else if (historyFilterSource.value === 'DE') {
      list = list.filter(b => (b.source || '').includes('Verifikasi') || (b.batchName || '').includes('DE'));
    }
  }

  if (historySearchQuery.value.trim()) {
    const q = historySearchQuery.value.trim().toLowerCase();
    list = list.filter(b => 
      (b.batchName || '').toLowerCase().includes(q) ||
      (b.fileName || '').toLowerCase().includes(q) ||
      (b.source || '').toLowerCase().includes(q) ||
      (b.uploadedBy || '').toLowerCase().includes(q) ||
      (b.machine || '').toLowerCase().includes(q) ||
      (b.uploadDate || b.createdAt || '').toLowerCase().includes(q)
    );
  }

  return list;
});

// Sheet 2 History Pagination States
const historyPage = ref(1);
const historyPageSize = ref(10); // Default 10 batch per halaman
const jumpToHistoryPage = ref('');

const paginatedUploadHistory = computed(() => {
  if (historyPageSize.value === -1) return filteredUploadHistory.value;
  const start = (historyPage.value - 1) * historyPageSize.value;
  return filteredUploadHistory.value.slice(start, start + historyPageSize.value);
});

const historyTotalPages = computed(() => {
  if (historyPageSize.value === -1 || filteredUploadHistory.value.length === 0) return 1;
  return Math.ceil(filteredUploadHistory.value.length / historyPageSize.value);
});

const historyStartRow = computed(() => {
  if (filteredUploadHistory.value.length === 0) return 0;
  if (historyPageSize.value === -1) return 1;
  return (historyPage.value - 1) * historyPageSize.value + 1;
});

const historyEndRow = computed(() => {
  if (filteredUploadHistory.value.length === 0) return 0;
  if (historyPageSize.value === -1) return filteredUploadHistory.value.length;
  return Math.min(historyPage.value * historyPageSize.value, filteredUploadHistory.value.length);
});

const historyVisiblePages = computed(() => {
  const total = historyTotalPages.value;
  const current = historyPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const changeHistoryPage = (p) => {
  if (p < 1 || p > historyTotalPages.value) return;
  historyPage.value = p;
};

const handleJumpHistoryPage = () => {
  const p = parseInt(jumpToHistoryPage.value, 10);
  if (!isNaN(p) && p >= 1 && p <= historyTotalPages.value) {
    changeHistoryPage(p);
  }
  jumpToHistoryPage.value = '';
};

watch([historyFilterSource, historySearchQuery, historyPageSize], () => {
  historyPage.value = 1;
});

const formatHistoryTimestamp = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${m}/${y} ${hh}:${mm}`;
  } catch {
    return dateStr;
  }
};

// Batch Detail Modal State
const showBatchDetailModal = ref(false);
const selectedBatch = ref(null);
const batchSearchQuery = ref('');

const selectedBatchRolls = computed(() => {
  if (!selectedBatch.value) return [];
  try {
    const parsed = JSON.parse(selectedBatch.value.rollsJson || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    console.error('Failed to parse rollsJson:', e);
    return [];
  }
});

const batchRollsCount = computed(() => selectedBatchRolls.value.length);
const batchTotalKg = computed(() => {
  return parseFloat(selectedBatchRolls.value.reduce((sum, r) => sum + (parseFloat(r.netto || r.berat || 0) || 0), 0).toFixed(2));
});
const batchPassCount = computed(() => selectedBatchRolls.value.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length);
const batchHoldCount = computed(() => selectedBatchRolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length);
const batchRejectCount = computed(() => selectedBatchRolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length);

const batchFilteredRolls = computed(() => {
  let list = [...selectedBatchRolls.value];
  if (batchSearchQuery.value.trim()) {
    const q = batchSearchQuery.value.trim().toLowerCase();
    list = list.filter(r => 
      (r.kodeFg || '').toLowerCase().includes(q) ||
      (r.lot || '').toLowerCase().includes(q) ||
      (r.spk || '').toLowerCase().includes(q) ||
      (r.kodePack || '').toLowerCase().includes(q) ||
      (r.turunan || '').toLowerCase().includes(q) ||
      (r.jenis || '').toLowerCase().includes(q) ||
      (r.kodeFormula || '').toLowerCase().includes(q)
    );
  }
  return list;
});

// Pagination untuk Modal Detail Batch (Mencegah freeze saat batch memiliki puluhan ribu baris)
const batchPage = ref(1);
const batchPageSize = ref(50);

const batchTotalPages = computed(() => {
  return Math.ceil(batchFilteredRolls.value.length / batchPageSize.value) || 1;
});

const paginatedBatchRolls = computed(() => {
  const start = (batchPage.value - 1) * batchPageSize.value;
  return batchFilteredRolls.value.slice(start, start + batchPageSize.value);
});

watch(batchSearchQuery, () => {
  batchPage.value = 1;
});

const openBatchDetail = (batch) => {
  selectedBatch.value = batch;
  batchSearchQuery.value = '';
  batchPage.value = 1;
  showBatchDetailModal.value = true;
};

const exportBatch = (batch) => {
  if (!batch) return;
  try {
    const rolls = JSON.parse(batch.rollsJson || '[]');
    const safeName = (batch.fileName || batch.batchName || 'Data_Roll').replace(/[^a-zA-Z0-9_-]/g, '_');
    dataRollStore.exportToExcel(rolls, `Export_${safeName}.xlsx`);
  } catch (e) {
    alert('Gagal export batch: ' + e.message);
  }
};

const handleDeleteHistory = async (batch) => {
  const countStr = batch.totalRolls ? ` (${batch.totalRolls.toLocaleString()} data roll)` : '';
  if (confirm(`Hapus batch riwayat "${batch.batchName || batch.fileName}" beserta seluruh datanya${countStr} dari sistem?\n\nSemua data roll terkait pada tabel utama juga akan ikut terhapus secara otomatis.`)) {
    try {
      await dataRollStore.deleteUploadHistory(batch.id || batch.uuid, true);
    } catch (e) {
      alert('Gagal menghapus batch: ' + e.message);
    }
  }
};

const loadBatchIntoMainTable = (batch) => {
  showBatchDetailModal.value = false;
  activeSheet.value = 'table';
  if (batch.fileName) {
    dataRollStore.filterSearch = batch.fileName;
  } else if (batch.machine && batch.machine !== 'ALL') {
    dataRollStore.filterMachine = batch.machine;
  }
};

// Import Handlers
const openImportModal = () => {
  copasText.value = '';
  uploadedFileName.value = '';
  previewParsedRolls.value = [];
  importMode.value = 'append';
  importProgress.active = false;
  importProgress.percent = 0;
  importProgress.message = '';
  showImportModal.value = true;
};

const handleCopasInput = () => {
  if (!copasText.value.trim()) {
    previewParsedRolls.value = [];
    return;
  }
  previewParsedRolls.value = parseCopasTextDataRoll(copasText.value);
};

const triggerFileInput = () => {
  if (fileInputRef.value) fileInputRef.value.click();
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  uploadedFileName.value = file.name;
  importProgress.active = true;
  importProgress.percent = 10;
  importProgress.message = 'Membaca file Excel...';
  try {
    previewParsedRolls.value = await parseExcelFileDataRoll(file, (p) => {
      importProgress.percent = p.percent;
      importProgress.message = p.message;
    });
  } catch (err) {
    console.error('Gagal membaca file Excel:', err);
    alert('Gagal membaca file Excel: ' + err.message);
  } finally {
    importProgress.active = false;
  }
};

const handleFileDrop = async (event) => {
  const file = event.dataTransfer.files[0];
  if (!file) return;
  uploadedFileName.value = file.name;
  importProgress.active = true;
  importProgress.percent = 10;
  importProgress.message = 'Membaca file Excel...';
  try {
    previewParsedRolls.value = await parseExcelFileDataRoll(file, (p) => {
      importProgress.percent = p.percent;
      importProgress.message = p.message;
    });
  } catch (err) {
    console.error('Gagal membaca file Excel drop:', err);
    alert('Gagal membaca file Excel: ' + err.message);
  } finally {
    importProgress.active = false;
  }
};

const commitImport = async () => {
  if (previewParsedRolls.value.length === 0) return;
  isImporting.value = true;
  importProgress.active = true;
  importProgress.percent = 5;
  importProgress.message = 'Menyiapkan penyimpanan ke database...';
  try {
    const meta = {
      fileName: uploadedFileName.value || 'Data_Roll.xlsx',
      source: importTab.value === 'file' ? `Import File Excel (${uploadedFileName.value})` : 'Paste Clipboard Data Roll',
      batchName: uploadedFileName.value ? `Upload File: ${uploadedFileName.value}` : `Paste Data Roll (${new Date().toLocaleDateString('id-ID')})`,
      uploadedBy: 'Admin / Operator'
    };
    await dataRollStore.importRolls(previewParsedRolls.value, importMode.value, meta, (p) => {
      importProgress.percent = p.percent;
      importProgress.message = p.message;
    });
    showImportModal.value = false;
    previewParsedRolls.value = [];
    copasText.value = '';
  } catch (e) {
    alert('Terjadi kesalahan saat menyimpan: ' + e.message);
  } finally {
    isImporting.value = false;
    importProgress.active = false;
  }
};

// Manual Roll Handlers
const openAddModal = () => {
  editingRollId.value = null;
  Object.assign(manualForm, {
    kodeFg: '',
    lot: '',
    turunan: '',
    jenis: 'VMCPP',
    kodeFormula: 'M07',
    thickness: '25',
    width: '1000',
    length: '10000',
    core: 6,
    treatment: 'PLASMA',
    od: 'OD2.4+PLASMA',
    slitting: 1,
    rewind: 0,
    sml: 0,
    machineName: 'SLITTING',
    tanggalFormatted: new Date().toISOString().slice(0, 10),
    spk: '',
    kodePack: '3B0726',
    subKode: '0001',
    qualityStatus: 'PASS'
  });
  showManualModal.value = true;
};

const editRoll = (item) => {
  editingRollId.value = item.id;
  Object.assign(manualForm, item);
  showManualModal.value = true;
};

const saveManualRoll = async () => {
  if (manualForm.kodeFg && !manualForm.lot) {
    const parsed = parseDataRollRow(manualForm);
    if (parsed) Object.assign(manualForm, parsed);
  }

  manualForm.slitting = manualForm.machineName === 'SLITTING' ? 1 : 0;
  manualForm.rewind = manualForm.machineName === 'REWIND' ? 1 : 0;
  manualForm.sml = manualForm.machineName === 'SML' ? 1 : 0;

  if (editingRollId.value) {
    await dataRollStore.updateRoll(editingRollId.value, { ...manualForm });
  } else {
    await dataRollStore.addRoll({ ...manualForm });
  }
  showManualModal.value = false;
};

const deleteSingleRoll = async (id) => {
  if (confirm('Hapus data roll ini?')) {
    await dataRollStore.deleteRoll(id);
  }
};

const handleBulkDelete = async () => {
  if (confirm(`Hapus ${selectedRollIds.value.length} roll terpilih?`)) {
    await dataRollStore.deleteMultiple(selectedRollIds.value);
    selectedRollIds.value = [];
  }
};

const handleClearAllRolls = async () => {
  const count = dataRollStore.totalRolls;
  if (confirm(`PERINGATAN: Apakah Anda yakin ingin menghapus SEMUA (${count.toLocaleString()}) data roll secara permanen dari perangkat dan cloud? Tindakan ini tidak dapat dibatalkan.`)) {
    await dataRollStore.clearAll();
    selectedRollIds.value = [];
  }
};

onMounted(async () => {
  await dataRollStore.loadRolls();
});

onUnmounted(() => {
  if (timelineChartInstance) timelineChartInstance.destroy();
  if (qualityDonutInstance) qualityDonutInstance.destroy();
  if (machineBarInstance) machineBarInstance.destroy();
  if (formulaBarInstance) formulaBarInstance.destroy();
});
</script>
