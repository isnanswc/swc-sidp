<template>
  <div class="space-y-3 select-none font-sans" @mouseup="handleGlobalMouseUp" @keydown="handleSpreadsheetKeydown">
    <!-- TOP HEADER & SHEET TABS BAR (SWC Corporate Theme: White, SWC Red #dc2626, Onyx Black) -->
    <div class="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <!-- Minimalist Vector Logo Badge -->
        <div class="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-sm border border-zinc-800 shrink-0">
          <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <line x1="3" y1="9" x2="21" y2="9" />
            <line x1="3" y1="15" x2="21" y2="15" />
            <line x1="9" y1="3" x2="9" y2="21" />
            <line x1="15" y1="3" x2="15" y2="21" />
          </svg>
        </div>

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight">DE REPORT (VERIFIKASI LAPORAN DATA ENTRY)</h1>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-50 text-red-600 border border-red-200">
              Verifikasi Laporan Produksi
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Pilih mesin pada daftar sesi harian di bawah untuk langsung membuka lembar verifikasi interaktif.
          </p>
        </div>
      </div>

      <!-- EXCEL SHEET TABS (MINIMALIS: DAFTAR SESI & TABEL REPORT) -->
      <div class="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200 gap-1 text-xs">
        <!-- Tab 1: Portal Sesi (Per Hari & Mesin) -->
        <button
          @click="activeTab = 'dashboard'; isViewingVerifiedBatch = false; selectedVerifiedBatch = null;"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer',
            activeTab === 'dashboard'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
          ]"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>1. Daftar Sesi Laporan</span>
          <span
            v-if="totalGlobalUnverifiedCount > 0"
            class="px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono bg-red-600 text-white ml-0.5"
          >
            {{ totalGlobalUnverifiedCount }}
          </span>
        </button>

        <!-- Tab 2: Tabel Report (Arsip Terverifikasi) -->
        <button
          @click="activeTab = 'report'; isViewingVerifiedBatch = false; selectedVerifiedBatch = null;"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 cursor-pointer',
            activeTab === 'report'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/50'
          ]"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          <span>2. Tabel Report (Arsip Batch Terverifikasi)</span>
          <span
            v-if="verifiedBatches.length > 0"
            class="px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono bg-zinc-700 text-white"
          >
            {{ verifiedBatches.length }} Batch
          </span>
        </button>

        <!-- Tab Active Sheet Indicator (When inside Excel Spreadsheet) -->
        <button
          v-if="activeTab === 'verifikasi'"
          @click="activeTab = 'verifikasi'"
          class="px-3.5 py-1.5 rounded-lg font-black transition-all flex items-center gap-1.5 bg-emerald-700 text-white shadow-xs cursor-pointer"
        >
          <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
          <span>{{ isViewingVerifiedBatch ? `📄 Batch: ${selectedVerifiedBatch?.batchName || selectedVerifiedBatch?.fileName || 'Terverifikasi'}` : `✏️ Lembar Verifikasi: ${selectedMachine}` }}</span>
        </button>
      </div>
    </div>

    <!-- TAB 1: PORTAL SESI (TABEL DROPDOWN MINIMALIS PER HARI & PER MESIN) -->
    <div v-if="activeTab === 'dashboard'" class="space-y-4 animate-fade-in">
      
      <!-- Portal Filter & Search Toolbar (Spacious, Clean & Minimalist) -->
      <div class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center flex-wrap gap-2.5">
          <!-- Search Input -->
          <div class="relative w-64 sm:w-80">
            <input
              v-model="portalSearch"
              type="text"
              placeholder="Cari tanggal, mesin, operator, SPK, lot..."
              class="w-full pl-8 pr-6 py-2 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none bg-zinc-50/50 font-medium"
            />
            <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button v-if="portalSearch" @click="portalSearch = ''" class="absolute right-2.5 top-2 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
          </div>

          <!-- Filter Sumber Data Buttons (Data Label vs Export Excel Data Roll) -->
          <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
            <span class="text-[11px] font-bold text-zinc-500 px-1.5">Sumber:</span>
            <button
              @click="portalSourceFilter = 'MANUAL'"
              :class="[
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                portalSourceFilter === 'MANUAL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              Data Label
            </button>
            <button
              @click="portalSourceFilter = 'DATA_ROLL'"
              :class="[
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                portalSourceFilter === 'DATA_ROLL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              Export Excel Data Roll
            </button>
            <button
              @click="portalSourceFilter = 'ALL'"
              :class="[
                'px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                portalSourceFilter === 'ALL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              Semua
            </button>
          </div>

          <!-- Filter Mesin Buttons -->
          <div class="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200 text-xs">
            <span class="text-[11px] font-bold text-zinc-500 px-1.5">Mesin:</span>
            <button
              v-for="m in ['ALL', 'SLITTING', 'REWIND', 'CASTING', 'METALIZE', 'SML']"
              :key="m"
              @click="portalMachineFilter = m"
              :class="[
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                portalMachineFilter === m ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              {{ m === 'ALL' ? 'Semua' : m }}
            </button>
          </div>
        </div>

        <!-- Filter Status Verifikasi (Clean Monochrome) -->
        <div class="flex items-center gap-1.5 text-xs">
          <button
            @click="portalStatusFilter = 'ALL'"
            :class="[
              'px-3 py-1.5 rounded-xl font-bold text-xs transition-all border cursor-pointer',
              portalStatusFilter === 'ALL' ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-300 hover:bg-zinc-50'
            ]"
          >
            Semua Status
          </button>
          <button
            @click="portalStatusFilter = 'PENDING'"
            :class="[
              'px-3 py-1.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1.5 cursor-pointer',
              portalStatusFilter === 'PENDING' ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Belum Verifikasi</span>
          </button>
          <button
            @click="portalStatusFilter = 'VERIFIED'"
            :class="[
              'px-3 py-1.5 rounded-xl font-bold text-xs transition-all border flex items-center gap-1.5 cursor-pointer',
              portalStatusFilter === 'VERIFIED' ? 'bg-zinc-800 text-white border-zinc-800' : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-50'
            ]"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Selesai</span>
          </button>
        </div>
      </div>

      <!-- TABEL DROPDOWN MINIMALIS PER HARI & PER MESIN -->
      <div v-if="groupedSessions.length > 0" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-3.5 border-b border-zinc-200 bg-zinc-50 flex items-center justify-between flex-wrap gap-2">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black text-zinc-900 uppercase tracking-wider">Tabel Sesi Laporan Harian</span>
            <span class="text-[11px] text-zinc-500 font-medium">({{ groupedSessions.length }} Hari Terdata)</span>
          </div>
          <div class="flex items-center gap-2 text-xs">
            <button
              @click="expandAllDates"
              class="px-2.5 py-1 rounded-lg font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 transition-all text-[11px] cursor-pointer"
            >
              Buka Semua
            </button>
            <button
              @click="collapseAllDates"
              class="px-2.5 py-1 rounded-lg font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60 transition-all text-[11px] cursor-pointer"
            >
              Tutup Semua
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-zinc-100 text-zinc-600 font-bold border-b border-zinc-200 select-none text-[11.5px]">
              <tr>
                <th class="w-10 py-2.5 px-3 text-center"></th>
                <th class="py-2.5 px-3">Tanggal Produksi</th>
                <th class="py-2.5 px-3">Mesin Aktif</th>
                <th class="py-2.5 px-3 text-center">Total Roll</th>
                <th class="py-2.5 px-3 min-w-[140px]">Progres Verifikasi</th>
                <th class="py-2.5 px-3 text-right">Total Berat</th>
                <th class="py-2.5 px-3 text-center">Status</th>
                <th class="py-2.5 px-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200">
              <template v-for="group in paginatedGroupedSessions" :key="group.date">
                <!-- Baris Induk: Tanggal (Clickable to Toggle Dropdown) -->
                <tr
                  @click="toggleDateExpand(group.date)"
                  class="hover:bg-zinc-50/80 cursor-pointer transition-colors font-medium bg-white"
                  :class="isDateExpanded(group.date) ? 'bg-zinc-50/60' : ''"
                >
                  <!-- Toggle Icon -->
                  <td class="py-3 px-3 text-center text-zinc-400">
                    <svg
                      class="w-4 h-4 transition-transform duration-200 mx-auto"
                      :class="isDateExpanded(group.date) ? 'rotate-90 text-zinc-900' : 'text-zinc-400'"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </td>

                  <!-- Tanggal -->
                  <td class="py-3 px-3 font-black text-zinc-900">
                    <div class="flex items-center gap-2">
                      <span>{{ formatDateNice(group.date) }}</span>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-zinc-100 text-zinc-600 border border-zinc-200">
                        {{ group.date }}
                      </span>
                    </div>
                  </td>

                  <!-- Mesin Aktif Badges (Minimalist Monochrome) -->
                  <td class="py-3 px-3">
                    <div class="flex items-center gap-1.5 flex-wrap">
                      <span
                        v-for="m in group.machinesList"
                        :key="m.mesin"
                        class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 font-mono"
                      >
                        {{ m.mesin }} ({{ m.totalRolls }})
                      </span>
                    </div>
                  </td>

                  <!-- Total Roll -->
                  <td class="py-3 px-3 text-center font-mono font-bold text-zinc-900">
                    {{ group.totalRolls }} Roll
                  </td>

                  <!-- Progres Verifikasi -->
                  <td class="py-3 px-3 min-w-[140px]">
                    <div class="space-y-1">
                      <div class="flex justify-between text-[11px] font-bold">
                        <span class="text-zinc-500">{{ group.verifiedCount }}/{{ group.totalRolls }} Roll</span>
                        <span :class="group.unverifiedCount === 0 ? 'text-zinc-900 font-black' : 'text-zinc-600'">
                          {{ group.totalRolls > 0 ? Math.round((group.verifiedCount / group.totalRolls) * 100) : 0 }}%
                        </span>
                      </div>
                      <div class="w-full bg-zinc-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-300"
                          :class="group.unverifiedCount === 0 ? 'bg-zinc-900' : 'bg-zinc-500'"
                          :style="{ width: `${group.totalRolls > 0 ? (group.verifiedCount / group.totalRolls) * 100 : 0}%` }"
                        ></div>
                      </div>
                    </div>
                  </td>

                  <!-- Total Berat -->
                  <td class="py-3 px-3 text-right font-mono font-bold text-zinc-900">
                    {{ group.totalKg.toLocaleString('id-ID') }} kg
                  </td>

                  <!-- Status Badge -->
                  <td class="py-3 px-3 text-center">
                    <span
                      v-if="group.unverifiedCount === 0"
                      class="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 inline-block"
                    >
                      Selesai
                    </span>
                    <span
                      v-else
                      class="px-2.5 py-0.5 rounded text-[10.5px] font-bold bg-zinc-900 text-white inline-block"
                    >
                      {{ group.unverifiedCount }} Belum Verifikasi
                    </span>
                  </td>

                  <!-- Aksi Toggle Button -->
                  <td class="py-3 px-3 text-center">
                    <button
                      class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 transition-all cursor-pointer"
                    >
                      {{ isDateExpanded(group.date) ? '▲ Tutup Mesin' : '▼ Lihat Mesin' }}
                    </button>
                  </td>
                </tr>

                <!-- Baris Anak: Dropdown Sub-Tabel Daftar Mesin -->
                <tr v-if="isDateExpanded(group.date)" class="bg-zinc-50/80">
                  <td colspan="8" class="p-3 pl-8 pr-6 border-b border-zinc-200">
                    <div class="bg-white rounded-xl border border-zinc-300 shadow-xs overflow-hidden">
                      <div class="bg-zinc-100/90 px-3.5 py-2 text-[11px] font-bold text-zinc-700 border-b border-zinc-200 flex items-center justify-between flex-wrap gap-2">
                        <span class="flex items-center gap-1.5">
                          <span class="text-zinc-500 font-mono text-[10.5px]">DAFTAR MESIN:</span>
                          <strong class="text-zinc-900">{{ formatDateNice(group.date) }}</strong>
                        </span>
                        <span class="text-zinc-500 text-[10.5px]">Klik baris mesin di bawah untuk langsung membuka lembar verifikasi</span>
                      </div>
                      <table class="w-full text-left text-xs border-collapse">
                        <thead class="text-zinc-500 font-bold border-b border-zinc-100 text-[11px] bg-zinc-50">
                          <tr>
                            <th class="py-2 px-3">Mesin</th>
                            <th class="py-2 px-3">Operator Shift</th>
                            <th class="py-2 px-3 text-center">Total Roll</th>
                            <th class="py-2 px-3 text-center">QC Status</th>
                            <th class="py-2 px-3 text-right">Total Berat</th>
                            <th class="py-2 px-3 text-center">Status Verifikasi</th>
                            <th class="py-2 px-3 text-center">Aksi</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-zinc-100">
                          <tr
                            v-for="m in group.machinesList"
                            :key="m.mesin"
                            @click.stop="openVerificationForSession(group.date, m.mesin)"
                            class="hover:bg-zinc-50 transition-colors cursor-pointer"
                          >
                            <td class="py-2.5 px-3 font-bold text-zinc-900">
                              <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-200 font-mono">
                                MESIN {{ m.mesin }}
                              </span>
                            </td>
                            <td class="py-2.5 px-3 text-zinc-600 text-[11.5px]">
                              {{ m.operatorsList.length ? m.operatorsList.join(', ') : 'Operator Shift' }}
                            </td>
                            <td class="py-2.5 px-3 text-center font-mono font-bold text-zinc-900">
                              {{ m.totalRolls }} Roll
                            </td>
                            <td class="py-2.5 px-3 text-center font-mono text-[11px]">
                              <span class="text-zinc-800 font-bold">{{ m.passCount }} PASS</span>
                              <span v-if="m.holdCount > 0" class="text-zinc-500 font-bold ml-1.5">• {{ m.holdCount }} HOLD</span>
                              <span v-if="m.rejectCount > 0" class="text-zinc-500 font-bold ml-1.5">• {{ m.rejectCount }} REJ</span>
                            </td>
                            <td class="py-2.5 px-3 text-right font-mono font-bold text-zinc-900">
                              {{ m.totalKg.toLocaleString('id-ID') }} kg
                            </td>
                            <td class="py-2.5 px-3 text-center">
                              <span
                                v-if="m.unverifiedCount === 0"
                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200"
                              >
                                Selesai ({{ m.verifiedCount }})
                              </span>
                              <span
                                v-else
                                class="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-900 text-white"
                              >
                                {{ m.unverifiedCount }} Belum Verifikasi
                              </span>
                            </td>
                            <td class="py-2.5 px-3 text-center">
                              <button
                                @click.stop="openVerificationForSession(group.date, m.mesin)"
                                class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer mx-auto bg-zinc-900 hover:bg-black text-white shadow-xs"
                              >
                                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 11l3 3L22 4" /><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" /></svg>
                                <span>{{ m.unverifiedCount > 0 ? `Verifikasi (${m.unverifiedCount})` : 'Buka Lembar' }}</span>
                              </button>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <!-- Portal Sesi Pagination Bar -->
        <div class="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 text-zinc-600 font-medium">
            <span>Menampilkan <strong class="text-zinc-900 font-bold font-mono">{{ portalStartGroup }} – {{ portalEndGroup }}</strong> dari <strong class="text-zinc-900 font-bold font-mono">{{ groupedSessions.length }}</strong> hari tanggal</span>
            <div class="flex items-center gap-1.5 ml-2 border-l border-zinc-300 pl-3">
              <span class="text-zinc-500 text-[11px]">Tampilkan:</span>
              <select
                v-model.number="portalPageSize"
                class="bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer"
              >
                <option :value="5">5 Hari</option>
                <option :value="7">7 Hari (1 Minggu)</option>
                <option :value="10">10 Hari</option>
                <option :value="14">14 Hari (2 Minggu)</option>
                <option :value="-1">Semua</option>
              </select>
            </div>
          </div>

          <div v-if="portalTotalPages > 1" class="flex items-center gap-1.5 flex-wrap">
            <!-- First & Prev -->
            <button
              :disabled="portalPage === 1"
              @click="changePortalPage(1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Pertama"
            >
              «
            </button>
            <button
              :disabled="portalPage === 1"
              @click="changePortalPage(portalPage - 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Sebelumnya"
            >
              ‹
            </button>

            <!-- Page Number Buttons -->
            <template v-for="(p, pIdx) in portalVisiblePages" :key="pIdx">
              <span v-if="p === '...'" class="px-1.5 py-1 text-zinc-400 font-bold">...</span>
              <button
                v-else
                @click="changePortalPage(p)"
                :class="[
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
                  portalPage === p
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                ]"
              >
                {{ p }}
              </button>
            </template>

            <!-- Next & Last -->
            <button
              :disabled="portalPage === portalTotalPages"
              @click="changePortalPage(portalPage + 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Selanjutnya"
            >
              ›
            </button>
            <button
              :disabled="portalPage === portalTotalPages"
              @click="changePortalPage(portalTotalPages)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Terakhir"
            >
              »
            </button>

            <!-- Quick Jump Input -->
            <div class="flex items-center gap-1 ml-2 border-l border-zinc-300 pl-2">
              <span class="text-zinc-500 text-[11px]">Ke:</span>
              <input
                v-model="jumpToPortalPage"
                @keyup.enter="handleJumpPortalPage"
                type="number"
                min="1"
                :max="portalTotalPages"
                placeholder="#"
                class="w-12 px-1.5 py-0.5 text-center text-xs border border-zinc-300 rounded-lg outline-none bg-white font-mono"
              />
              <button
                @click="handleJumpPortalPage"
                class="px-2 py-0.5 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State jika tidak ada data yang cocok dengan filter -->
      <div v-else class="bg-white rounded-2xl border border-zinc-200 p-12 text-center text-zinc-400 space-y-3">
        <div class="w-14 h-14 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        </div>
        <h3 class="text-base font-black text-zinc-800">Tidak ada sesi laporan yang cocok</h3>
        <p class="text-xs text-zinc-500 max-w-sm mx-auto">
          Coba ubah kata kunci pencarian atau ganti filter mesin dan status di bagian atas.
        </p>
        <button
          @click="portalSearch = ''; portalMachineFilter = 'ALL'; portalStatusFilter = 'ALL'"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 transition-colors"
        >
          Reset Filter
        </button>
      </div>
    </div>

    <!-- TAB 2: VERIFIKASI SLITTING (EXCEL SPREADSHEET ENGINE WITH 5-GROUP SLITTING COLUMNS & RESIZABLE WIDTHS) -->
    <div v-if="activeTab === 'verifikasi'" class="space-y-2 animate-fade-in">
      
      <!-- VERIFIED BATCH BANNER (WHEN VIEWING VERIFIED BATCH FROM TAB 2) -->
      <div
        v-if="isViewingVerifiedBatch && selectedVerifiedBatch"
        class="bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 p-3.5 rounded-2xl border border-zinc-700 text-white shadow-md flex flex-wrap items-center justify-between gap-3"
      >
        <div class="flex items-center gap-3 flex-wrap">
          <button
            @click="closeVerifiedBatchView"
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Kembali ke Tabel Report / Arsip Batch"
          >
            <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            <span>Kembali ke Arsip Batch</span>
          </button>

          <span class="text-zinc-700">|</span>

          <div class="flex items-center gap-2">
            <span class="px-2 py-0.5 rounded text-[10.5px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 font-mono">
              ✓ BATCH TERVERIFIKASI
            </span>
            <h2 class="text-sm font-black text-white">
              {{ selectedVerifiedBatch.batchName || selectedVerifiedBatch.fileName }}
            </h2>
            <span class="text-xs text-zinc-400 font-mono hidden sm:inline">
              ({{ selectedVerifiedBatch.tanggal || formatDateOnly(selectedVerifiedBatch.uploadDate || selectedVerifiedBatch.createdAt) }} • {{ selectedVerifiedBatch.machine || selectedVerifiedBatch.mesin || 'SLITTING' }})
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Mini KPI Stats -->
          <div class="flex items-center gap-2 text-xs font-mono bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-700">
            <span class="text-zinc-400">Total:</span>
            <strong class="text-white">{{ activeSpreadsheetList.length }} Roll</strong>
            <span class="text-zinc-600">|</span>
            <strong class="text-white">{{ batchDetailTotalKg }} kg</strong>
            <span class="text-zinc-600">|</span>
            <span class="text-emerald-400 font-bold">{{ batchDetailPassCount }} PASS</span>
            <span v-if="batchDetailHoldCount > 0" class="text-amber-400 font-bold">• {{ batchDetailHoldCount }} HOLD</span>
            <span v-if="batchDetailRejectCount > 0" class="text-red-400 font-bold">• {{ batchDetailRejectCount }} REJ</span>
          </div>

          <!-- Download Excel -->
          <button
            @click="exportSingleBatch(selectedVerifiedBatch)"
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-600 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Download File Excel Resmi untuk Batch Ini"
          >
            <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>Download Excel</span>
          </button>

          <!-- Buka Kunci Batch (Revisi) -->
          <button
            @click="unverifyBatch(selectedVerifiedBatch)"
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-red-600 hover:bg-red-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
            title="Buka kunci batch ini dan kembalikan ke lembar verifikasi untuk revisi / koreksi"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 9.9-1" />
            </svg>
            <span>Buka Kunci Batch (Revisi)</span>
          </button>
        </div>
      </div>

      <!-- ACTIVE SESSION CONTEXT BAR (NAVIGASI & QUICK SWITCHER FOR UNVERIFIED SESSIONS) -->
      <div
        v-else
        class="bg-gradient-to-r from-zinc-900 via-zinc-850 to-zinc-900 p-3 rounded-2xl border border-zinc-800 text-white shadow-md flex flex-wrap items-center justify-between gap-3"
      >
        <div class="flex items-center gap-2.5 flex-wrap">
          <!-- Back to Sessions Portal Button -->
          <button
            @click="activeTab = 'dashboard'"
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            title="Kembali ke Daftar Pengelompokan Hari & Mesin"
          >
            <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6" /></svg>
            <span>Daftar Sesi</span>
          </button>

          <span class="text-zinc-600">|</span>

          <!-- Quick Date Selector -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-zinc-400 font-bold flex items-center gap-1">📅 Tanggal:</span>
            <select
              v-model="selectedDate"
              class="bg-zinc-800 text-white text-xs font-bold px-2.5 py-1 rounded-xl border border-zinc-700 outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              <option value="ALL">Semua Tanggal (All)</option>
              <option v-for="d in availableDates" :key="d" :value="d">
                {{ formatDateNice(d) }} ({{ d }})
              </option>
            </select>
          </div>

          <!-- Quick Machine Selector -->
          <div class="flex items-center gap-1.5">
            <span class="text-xs text-zinc-400 font-bold flex items-center gap-1">⚙️ Mesin:</span>
            <select
              v-model="selectedMachine"
              class="bg-zinc-800 text-white text-xs font-bold px-2.5 py-1 rounded-xl border border-zinc-700 outline-none focus:ring-1 focus:ring-red-500 cursor-pointer"
            >
              <option value="ALL">Semua Mesin (All)</option>
              <option v-for="m in availableMachines" :key="m" :value="m">
                Mesin {{ m }}
              </option>
            </select>
          </div>
        </div>

        <!-- Session Status & Batch Approval Action (1-Click Batch Verification) -->
        <div class="flex items-center gap-2 flex-wrap">
          <!-- Session Badge Info -->
          <div class="flex items-center gap-1.5 text-xs font-mono bg-zinc-800/80 px-2.5 py-1 rounded-xl border border-zinc-700">
            <span class="text-zinc-400">Total:</span>
            <strong class="text-white">{{ activeDateMachineStats.total }} Roll</strong>
            <span class="text-zinc-600">|</span>
            <span class="text-amber-400 font-bold">{{ activeDateMachineStats.unverified }} Belum</span>
            <span class="text-zinc-600">|</span>
            <span class="text-emerald-400 font-bold">{{ activeDateMachineStats.verified }} Selesai</span>
          </div>

          <!-- Approve All in this Session Button -->
          <button
            v-if="filteredUnverifiedList.length > 0"
            @click="approveCurrentSessionBatch"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/20 cursor-pointer"
            :title="`Approve seluruh ${filteredUnverifiedList.length} roll untuk sesi ini`"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12" /></svg>
            <span>Approve Semua Sesi Ini ({{ filteredUnverifiedList.length }})</span>
          </button>
        </div>
      </div>
      
      <!-- SUB-SHEET TABS & DENSITY SELECTOR -->
      <div class="flex items-center justify-between flex-wrap gap-2">
        <div class="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <div class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-zinc-900 text-white border border-zinc-900 shadow-xs flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="6" cy="6" r="3" />
              <circle cx="6" cy="18" r="3" />
              <line x1="20" y1="4" x2="8.12" y2="15.88" />
              <line x1="14.47" y1="14.48" x2="20" y2="20" />
            </svg>
            <span>LEMBAR {{ isViewingVerifiedBatch ? (selectedVerifiedBatch?.batchName || selectedMachine) : (selectedMachine === 'ALL' ? 'SEMUA MESIN' : selectedMachine) }}</span>
            <span class="px-1.5 py-0.2 rounded-full text-[9px] font-black font-mono bg-red-600 text-white ml-1">
              {{ activeSpreadsheetList.length }}
            </span>
          </div>
        </div>

        <!-- Density / Lebar Cell Mode Selector -->
        <div class="flex items-center bg-white p-1 rounded-xl border border-zinc-300 gap-1 text-xs shadow-xs">
          <span class="text-[11px] font-bold text-zinc-400 px-2 flex items-center gap-1">
            <svg class="w-3 h-3 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
            <span>Lebar:</span>
          </span>
          <button
            @click="densityMode = 'compact'"
            :class="[
              'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
              densityMode === 'compact' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            ]"
            title="Tampilan Padat / Rapat"
          >
            Padat
          </button>
          <button
            @click="densityMode = 'normal'"
            :class="[
              'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
              densityMode === 'normal' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
            ]"
            title="Tampilan Sedang"
          >
            Normal
          </button>
          <button
            @click="densityMode = 'comfortable'"
            :class="[
              'px-2.5 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer',
              densityMode === 'comfortable' ? 'bg-blue-600 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-100'
            ]"
            title="Tampilan Lebar & Leluasa (Auto Expand)"
          >
            ↔️ Leluasa / Auto
          </button>
          <button
            @click="resetColWidths"
            class="px-2 py-1 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-[11px] font-bold cursor-pointer"
            title="Reset Lebar Seluruh Kolom ke Default"
          >
            Reset
          </button>
        </div>
      </div>

      <!-- Action Ribbon / Toolbar -->
      <div class="bg-white p-2.5 rounded-2xl border border-zinc-300 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <!-- Left Tools -->
        <div class="flex items-center flex-wrap gap-1.5">
          <!-- Locked Batch Indicator when in verified mode -->
          <div
            v-if="isViewingVerifiedBatch"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-zinc-100 text-zinc-800 border border-zinc-300 flex items-center gap-1.5"
          >
            <svg class="w-3.5 h-3.5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Mode Baca Batch Terverifikasi (Terkunci)</span>
          </div>

          <!-- Unverified Mode Editing Tools -->
          <template v-else>
            <!-- Tombol Import / Paste Excel Modal -->
            <button
              @click="showImportModal = true"
              class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Import File Excel atau Paste Data Report Slitting langsung dengan Auto Forward-Fill"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              <span>📥 Import / Paste Slitting</span>
            </button>

            <!-- Tombol Approve Semua Sesi (Batch Verification) -->
            <button
              v-if="filteredUnverifiedList.length > 0"
              @click="approveCurrentSessionBatch"
              class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all flex items-center gap-1 cursor-pointer shadow-xs"
              title="Approve seluruh data di sub-sheet ini"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Approve Semua ({{ filteredUnverifiedList.length }})</span>
            </button>
          </template>

          <span class="text-zinc-300">|</span>

          <!-- Copy Cells (Ctrl + C - Available in both unverified and verified batch modes) -->
          <button
            @click="handleCopySelection"
            class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
            title="Copy cell / range yang dipilih (Shortcut: Ctrl + C)"
          >
            <svg class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copy</span>
            <kbd class="px-1 py-0.2 text-[9px] bg-zinc-200 text-zinc-600 rounded font-mono">Ctrl+C</kbd>
          </button>

          <!-- Editing tools available only when NOT in locked verified mode -->
          <template v-if="!isViewingVerifiedBatch">
            <!-- Paste Cells (Ctrl + V) -->
            <button
              @click="handlePasteSelection"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Paste nilai clipboard ke cell (Shortcut: Ctrl + V)"
            >
              <svg class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
              </svg>
              <span>Paste</span>
              <kbd class="px-1 py-0.2 text-[9px] bg-zinc-200 text-zinc-600 rounded font-mono">Ctrl+V</kbd>
            </button>

            <!-- Undo Button (Ctrl+Z) -->
            <button
              :disabled="undoStack.length === 0"
              @click="handleUndo"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Undo (Ctrl + Z)"
            >
              <svg class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="1 4 1 10 7 10" />
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
              </svg>
              <span>Undo</span>
            </button>

            <!-- Redo Button (Ctrl+Y) -->
            <button
              :disabled="redoStack.length === 0"
              @click="handleRedo"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed text-zinc-800 border border-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Redo (Ctrl + Y)"
            >
              <svg class="w-3.5 h-3.5 text-zinc-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>Redo</span>
            </button>

            <!-- Add Blank Row -->
            <button
              @click="addNewBlankRow"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Tambah baris baru di bawah"
            >
              <svg class="w-3.5 h-3.5 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>+ Baris Baru</span>
            </button>
          </template>

          <!-- Download Template Excel -->
          <button
            @click="downloadSlittingTemplate"
            class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 transition-all flex items-center gap-1"
            title="Download Template Format Excel DE Report Slitting"
          >
            <svg class="w-3.5 h-3.5 text-emerald-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>Template</span>
          </button>

          <!-- Export Excel (Tabel Ctrl+T dengan Format Warna Pembeda) -->
          <button
            @click="exportVerificationExcel"
            class="px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-700 hover:bg-emerald-600 text-white shadow-sm shadow-emerald-700/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export lembar verifikasi ini langsung dalam bentuk Tabel Excel resmi (Ctrl+T) dengan warna pembeda"
          >
            <svg class="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>📊 Export Excel (Ctrl+T)</span>
          </button>
        </div>

        <!-- Right Tools: Search in Sheet -->
        <div class="flex items-center gap-2">
          <div class="relative w-48 sm:w-56">
            <input
              v-model="verifySearch"
              type="text"
              placeholder="Cari SPK, Lot, Shift/Op..."
              class="w-full pl-7 pr-6 py-1.5 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 outline-none bg-white font-medium"
            />
            <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button v-if="verifySearch" @click="verifySearch = ''" class="absolute right-2 top-1.5 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
          </div>

          <!-- Refresh Button -->
          <button
            @click="refreshData"
            class="p-1.5 rounded-xl border border-zinc-300 hover:bg-zinc-100 text-zinc-600 transition-colors"
            title="Refresh Data"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <!-- SPREADSHEET FORMULA BAR & CELL ADDRESS (EXCEL LOOK & FEEL) -->
      <div class="bg-white rounded-xl border border-zinc-300 shadow-xs overflow-hidden">
        <!-- Excel Formula Bar -->
        <div class="bg-[#f3f4f6] px-2.5 py-1.5 border-b border-zinc-300 flex items-center gap-2 text-xs select-none">
          <!-- Excel Name Box (Cell Address / Range) -->
          <div class="px-2.5 py-0.5 bg-white rounded border border-zinc-300 font-mono font-bold text-zinc-900 shadow-2xs min-w-[75px] text-center text-[11.5px]">
            {{ selectedRangeLabel }}
          </div>

          <!-- Formula Bar Buttons: Cancel & Accept -->
          <div class="flex items-center gap-0.5 border-r border-zinc-300 pr-1.5">
            <button
              type="button"
              @click="cancelCellEdit"
              class="w-5 h-5 rounded hover:bg-zinc-200 text-zinc-500 hover:text-red-600 flex items-center justify-center font-bold text-[11px] cursor-pointer"
              title="Batalkan (Esc)"
            >
              ✕
            </button>
            <button
              type="button"
              @click="commitCellEdit"
              class="w-5 h-5 rounded hover:bg-zinc-200 text-zinc-500 hover:text-emerald-700 flex items-center justify-center font-black text-[12px] cursor-pointer"
              title="Simpan / Terapkan (Enter)"
            >
              ✓
            </button>
          </div>

          <!-- fx Symbol -->
          <span class="text-zinc-500 font-bold font-serif italic text-xs px-0.5">fx</span>

          <!-- Live Formula Input -->
          <div class="flex-1">
            <input
              v-model="activeCellValue"
              @input="onFormulaBarInput"
              type="text"
              placeholder="Masukkan nilai cell..."
              class="w-full px-2 py-0.5 text-xs border border-zinc-300 rounded bg-white outline-none font-sans text-zinc-900 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div class="text-[11px] font-sans text-zinc-500 hidden md:flex items-center gap-2">
            <span><strong>⠿</strong> Tarik Baris</span>
            <span>•</span>
            <span><strong>Ctrl+D</strong> Fill Down</span>
            <span>•</span>
            <span><strong>Ctrl+Z</strong> Undo</span>
          </div>
        </div>

        <!-- EXCEL SHEET GRID TABLE (AUTHENTIC MICROSOFT EXCEL LOOK & FEEL) -->
        <div
          class="overflow-auto max-h-[68vh] relative bg-white focus:outline-none scrollbar-thin excel-grid-container"
          ref="spreadsheetContainer"
          tabindex="0"
        >
          <table class="excel-table text-left border-collapse border-spacing-0 min-w-max font-sans select-none">
            
            <!-- 2-TIER COLUMN HEADERS (TIER 1: GROUPS, TIER 2: EXCEL COLUMNS A, B, C...) -->
            <thead class="sticky top-0 z-20 font-sans shadow-2xs">
              <!-- TIER 1: 5 FUNCTIONAL GROUPS (SLITTING VS REWIND) -->
              <tr class="text-white font-bold uppercase tracking-wider text-[10px] select-none">
                <!-- Select All Corner Box -->
                <th class="w-12 text-center bg-[#217346] border border-[#1b5e39] py-1" rowspan="2" title="Pilih Semua (Ctrl+A)">
                  <div class="flex items-center justify-center">
                    <span class="w-2.5 h-2.5 border-r-2 border-b-2 border-white/70 rotate-45 transform translate-y-[-1px]"></span>
                  </div>
                </th>
                <!-- REWIND 23-COLUMN GROUPS -->
                <template v-if="isRewindSession">
                  <!-- Group 1: Identitas & Proses (5 Kolom: Tanggal, Grup Shift, Jenis Proses, No SPK, No Lot) -->
                  <th colspan="5" class="text-center py-1 bg-[#1e40af] border border-[#1d4ed8]">
                    1. IDENTITAS & PROSES
                  </th>
                  <!-- Group 2: Spesifikasi & Dimensi (6 Kolom: Jenis, Kode Formula, Thickness, Width, Length, Weight) -->
                  <th colspan="6" class="text-center py-1 bg-[#0369a1] border border-[#0284c7]">
                    2. SPESIFIKASI & DIMENSI BAHAN
                  </th>
                  <!-- Group 3: Hasil & Quality (4 Kolom: Turunan, Pack, Quality Status, Reason Of Deffect) -->
                  <th colspan="4" class="text-center py-1 bg-[#15803d] border border-[#16a34a]">
                    3. HASIL REWIND & QUALITY
                  </th>
                  <!-- Group 4: Keterangan & Waste (4 Kolom: Keterangan Bahan, Keterangan Hasil, Length Waste, Weight Waste) -->
                  <th colspan="4" class="text-center py-1 bg-[#c2410c] border border-[#ea580c]">
                    4. KETERANGAN & WASTE
                  </th>
                  <!-- Group 5: Atribut & Core (4 Kolom: Core, Tanda, Bahan, Input Atribut metalize) -->
                  <th colspan="4" class="text-center py-1 bg-[#334155] border border-[#475569]">
                    5. ATRIBUT & CORE
                  </th>
                </template>
                <!-- SLITTING 31-COLUMN GROUPS -->
                <template v-else>
                  <!-- Group 1: Shift & Parent Material (Deep Blue) -->
                  <th colspan="11" class="text-center py-1 bg-[#1e40af] border border-[#1d4ed8]">
                    1. IDENTITAS SHIFT & PARENT MATERIAL INDUK
                  </th>
                  <!-- Group 2: Output Child Slitting (Cyan/Slate) -->
                  <th colspan="11" class="text-center py-1 bg-[#0369a1] border border-[#0284c7]">
                    2. OUTPUT CHILD ROLL HASIL SLITTING
                  </th>
                  <!-- Group 3: QC & Defect (Emerald Green) -->
                  <th colspan="2" class="text-center py-1 bg-[#15803d] border border-[#16a34a]">
                    3. QUALITY CONTROL & DEFECT
                  </th>
                  <!-- Group 4: Jumbo Sisa (Purple) -->
                  <th colspan="3" class="text-center py-1 bg-[#6b21a8] border border-[#7e22ce]">
                    4. JUMBO SISA
                  </th>
                  <!-- Group 5: Waste & Note (Amber) -->
                  <th colspan="4" class="text-center py-1 bg-[#c2410c] border border-[#ea580c]">
                    5. WASTE SHIFT & CATATAN
                  </th>
                </template>
              </tr>

              <!-- TIER 2: AUTHENTIC EXCEL COLUMN HEADERS (A, B, C...) -->
              <tr class="bg-[#f3f4f6] text-zinc-700 text-[11px]">
                <th
                  v-for="(col, cIdx) in columns"
                  :key="col.key"
                  :style="{ width: getColumnWidth(col.key) + 'px', minWidth: getColumnWidth(col.key) + 'px', maxWidth: getColumnWidth(col.key) + 'px' }"
                  :class="[
                    'border border-[#d4d4d8] px-1.5 py-1 text-center font-bold relative transition-colors select-none group',
                    isColInSelection(cIdx)
                      ? 'bg-[#e2e8f0] text-emerald-950 border-b-2 border-b-emerald-700 font-black'
                      : 'bg-[#f3f4f6] hover:bg-[#e5e7eb]'
                  ]"
                >
                  <div class="flex flex-col items-center justify-center gap-0.5">
                    <span class="text-[10px] text-zinc-500 font-mono font-bold leading-tight">{{ col.letter }}</span>
                    <span class="text-[11px] font-bold text-zinc-900 leading-tight whitespace-nowrap overflow-hidden text-ellipsis">{{ col.name }}</span>
                  </div>

                  <!-- Excel Column Resize Handle -->
                  <div
                    class="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hover:bg-emerald-600 active:bg-emerald-700 z-30 transition-colors"
                    @mousedown.stop="startColResize(col.key, $event)"
                    @dblclick.stop="autoFitCol(col.key)"
                    title="Tarik untuk ubah lebar kolom / Klik ganda untuk Auto-Fit"
                  ></div>
                </th>
              </tr>
            </thead>

            <!-- EXCEL ROWS (AUTHENTIC GRID CELLS) -->
            <tbody class="text-[11.5px] text-zinc-900">
              <tr
                v-for="(item, rIdx) in paginatedSpreadsheetList"
                :key="item.id || item.uniqId"
                :class="[
                  getRowClass(item, rIdx),
                  isNewParentStart(rIdx) ? 'border-t-2 border-zinc-900' : ''
                ]"
                @dragover.prevent="onRowDragOver(rIdx, $event)"
                @dragleave="onRowDragLeave"
                @drop="onRowDrop(rIdx)"
              >
                <!-- Authentic Excel Row Number Header (1, 2, 3...) -->
                <td
                  :class="[
                    'text-center border border-[#d4d4d8] font-bold py-0.5 px-1 transition-colors select-none text-[11px] font-mono',
                    isRowInSelection(rIdx)
                      ? 'bg-[#e2e8f0] text-emerald-950 border-r-2 border-r-emerald-700 font-black'
                      : (item.status === 'HOLD' ? 'bg-amber-100 text-amber-900' : (item.status === 'REJECT' ? 'bg-red-100 text-red-900' : 'bg-[#f3f4f6] text-zinc-600 hover:bg-[#e5e7eb]'))
                  ]"
                >
                  <div class="flex items-center justify-between gap-1 w-full">
                    <span
                      class="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-900 px-0.5 rounded text-[10px] leading-none select-none transition-colors"
                      draggable="true"
                      @dragstart="onRowDragStart(rIdx, $event)"
                      @dragend="onRowDragEnd"
                      @mousedown.stop
                      title="Tarik untuk memindahkan baris"
                    >⠿</span>
                    <span
                      class="cursor-pointer hover:underline flex-1 text-center"
                      @mousedown="handleRowHeaderMouseDown(rIdx, $event)"
                      @mouseenter="handleRowHeaderMouseEnter(rIdx)"
                    >{{ (unverifiedPageSize === -1 ? 0 : (unverifiedPage - 1) * unverifiedPageSize) + rIdx + 1 }}</span>
                  </div>
                </td>

                <!-- AUTHENTIC EXCEL CELLS -->
                <td
                  v-for="(col, cIdx) in columns"
                  :key="col.key"
                  :style="{ width: getColumnWidth(col.key) + 'px', minWidth: getColumnWidth(col.key) + 'px', maxWidth: getColumnWidth(col.key) + 'px' }"
                  :class="[
                    'border border-[#d4d4d8] relative cursor-cell transition-colors whitespace-nowrap overflow-hidden text-ellipsis',
                    col.align === 'center' ? 'text-center' : (col.align === 'right' ? 'text-right font-mono' : 'text-left'),
                    densityMode === 'compact' ? 'px-1.5 py-0.5 h-6' : (densityMode === 'normal' ? 'px-2 py-1 h-7' : 'px-2.5 py-1.5 h-8'),
                    getCellClass(item, rIdx, cIdx),
                    isParentSparseColumn(col.key) && !isFirstRowOfParent(rIdx) ? 'bg-zinc-50/40 text-zinc-300' : ''
                  ]"
                  @mousedown="handleCellMouseDown(rIdx, cIdx, $event)"
                  @mouseenter="handleCellMouseEnter(rIdx, cIdx)"
                  @dblclick="enterEditMode(rIdx, cIdx)"
                >
                  <!-- In-Cell Live Input (When in Edit Mode) -->
                  <input
                    v-if="isEditing(rIdx, cIdx)"
                    v-model="editInputValue"
                    type="text"
                    :class="[
                      'absolute inset-0 w-full h-full px-2 py-0 text-[11.5px] border-2 border-emerald-600 bg-white outline-none z-30 shadow-md font-sans text-zinc-900',
                      col.align === 'right' ? 'text-right font-mono' : (col.align === 'center' ? 'text-center' : 'text-left')
                    ]"
                    @blur="commitCellEdit"
                    @keydown.enter.prevent="commitEditAndMove(1, 0)"
                    @keydown.tab.prevent="commitEditAndMove(0, $event.shiftKey ? -1 : 1)"
                    @keydown.esc.prevent="cancelCellEdit"
                    @keydown.up.prevent="commitEditAndMove(-1, 0)"
                    @keydown.down.prevent="commitEditAndMove(1, 0)"
                    v-focus
                  />

                  <!-- Cell Value Display with Excel High-Precision Typography -->
                  <span v-else class="block whitespace-nowrap overflow-hidden text-ellipsis leading-tight">
                    <!-- No Lot Column (In Rewind, HASIL row is highlighted pink/red matching screenshot) -->
                    <template v-if="col.key === 'lot' && isRewindSession && item.jenisProses === 'HASIL'">
                      <span class="bg-[#fca5a5] text-red-950 font-bold px-1.5 py-0.5 rounded shadow-2xs block truncate">
                        {{ formatCellValue(item.lot, 'lot', item, rIdx) }}
                      </span>
                    </template>

                    <!-- Jenis Proses Column (BAHAN vs HASIL) -->
                    <template v-else-if="col.key === 'jenisProses'">
                      <span :class="item.jenisProses === 'HASIL' ? 'text-blue-700 font-black' : 'text-zinc-600 font-bold'">
                        {{ item.jenisProses || 'BAHAN' }}
                      </span>
                    </template>

                    <!-- Shift Kolom (Kombinasi Kode Operator + Shift, misal G1, H3, W2) -->
                    <template v-else-if="col.key === 'shiftCombined'">
                      <span class="font-bold text-zinc-950 font-mono tracking-tight">{{ getShiftCombined(item) }}</span>
                    </template>

                    <!-- Core Roll Diameter (Ukuran: 6" atau 3") -->
                    <template v-else-if="col.key === 'paperCore'">
                      <span class="text-zinc-800 font-semibold font-mono">{{ getCoreSizeText(item) }}</span>
                    </template>

                    <!-- Packing (Hanya nomor/angka akhir KodePack, misal 25) -->
                    <template v-else-if="col.key === 'packing'">
                      <span class="font-mono font-bold text-zinc-800">{{ getPackingEndNumber(item) }}</span>
                    </template>

                    <!-- Calculated Selisih Berat Column Highlight -->
                    <template v-else-if="col.key === 'selisihBerat'">
                      <span
                        v-if="getSelisih(item) !== null"
                        :class="[
                          'px-1 py-0.2 rounded font-bold font-mono inline-block',
                          getSelisih(item) < -2 || getSelisih(item) > 2 ? 'bg-red-600 text-white font-black' : 'text-zinc-800'
                        ]"
                      >
                        {{ getSelisih(item) > 0 ? '+' : '' }}{{ getSelisih(item) }}
                      </span>
                      <span v-else class="text-zinc-400">-</span>
                    </template>

                    <!-- Calculated Child Berat Teori -->
                    <template v-else-if="col.key === 'childBeratTeori'">
                      <span class="text-zinc-700 font-mono">{{ getChildTeori(item) }}</span>
                    </template>

                    <!-- Quality Status Badge -->
                    <template v-else-if="col.key === 'status'">
                      <span
                        :class="[
                          'px-1.5 py-0.2 rounded text-[10px] font-black inline-block',
                          item.status === 'PASS' ? 'bg-[#86efac] text-emerald-950 border border-emerald-400' :
                          (item.status === 'REJECT' ? 'bg-[#ef4444] text-white font-black' :
                          (item.status === 'HOLD' ? 'bg-amber-600 text-white' :
                          'bg-zinc-100 text-zinc-700 border border-zinc-300'))
                        ]"
                      >
                        {{ item.status || (item.jenisProses === 'BAHAN' ? 'SORTIR' : 'PASS') }}
                      </span>
                    </template>

                    <!-- Reason of Defect (Auto switch dari Keterangan Hasil jika HOLD/REJECT) -->
                    <template v-else-if="col.key === 'reasonDefect'">
                      <span :class="item.status === 'HOLD' || item.status === 'REJECT' ? 'text-red-700 font-bold' : 'text-zinc-600'">
                        {{ getReasonDefectText(item) }}
                      </span>
                    </template>

                    <!-- Grade Sisa (Default B-GRADE) -->
                    <template v-else-if="col.key === 'gradeSisa'">
                      <span v-if="item.gradeSisa || item.kodeSisa" class="px-1.5 py-0.2 rounded bg-purple-100 text-purple-900 font-bold text-[10px]">
                        {{ item.gradeSisa || item.kodeSisa }}
                      </span>
                      <span v-else class="text-zinc-400">-</span>
                    </template>

                    <!-- Default Cell Formatter (Dengan aturan Sparse Parent & Format Excel) -->
                    <template v-else>
                      {{ formatCellValue(item[col.key], col.key, item, rIdx) }}
                    </template>
                  </span>

                  <!-- Excel Fill Handle (Small Square on Bottom-Right of Active Cell) -->
                  <div
                    v-if="isActiveCell(rIdx, cIdx) && !isEditing(rIdx, cIdx)"
                    class="excel-fill-handle"
                    title="Fill Handle (Tarik atau tekan Ctrl+D)"
                  ></div>
                </td>
              </tr>

              <!-- Empty State -->
              <tr v-if="activeSpreadsheetList.length === 0">
                <td :colspan="columns.length + 1" class="p-12 text-center text-zinc-400 font-sans bg-white">
                  <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <polyline points="22 4 12 14.01 9 11.01" />
                    </svg>
                  </div>
                  <p class="font-bold text-sm text-zinc-700">
                    {{ isViewingVerifiedBatch ? 'Tidak ada data dalam batch ini.' : 'Semua data label pada sesi ini telah terverifikasi!' }}
                  </p>
                  <p class="text-xs text-zinc-400 mt-0.5">
                    {{ isViewingVerifiedBatch ? 'Silakan kembali ke Arsip Batch Terverifikasi.' : 'Silakan gunakan tombol 📥 Import / Paste Slitting untuk memasukkan data baru.' }}
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Excel Status Bar (Bottom) -->
        <div class="bg-[#f3f4f6] px-3 py-1.5 border-t border-zinc-300 flex items-center justify-between text-xs text-zinc-600 font-mono">
          <div>
            SHEET: <strong class="text-zinc-900">SLITTING ({{ isViewingVerifiedBatch ? 'BATCH TERVERIFIKASI' : 'VERIFIKASI' }})</strong> ({{ activeSpreadsheetList.length }} baris)
            <span class="mx-2 text-zinc-300">•</span>
            CELL: <strong class="text-blue-700 font-bold">{{ selectedRangeLabel }}</strong>
            <span v-if="rangeCellCount > 1" class="ml-1 text-zinc-500 font-normal">
              ({{ rangeCellCount }} cell dipilih)
            </span>
          </div>

          <div class="flex items-center gap-3 font-sans text-[11px]">
            <span class="text-zinc-500">
              💡 <strong>Geser Garis Kolom</strong> untuk memperlebar • <strong>Ctrl+D</strong> (Fill Down) • <strong>Ctrl+Z</strong> (Undo)
            </span>
          </div>
        </div>

        <!-- SPREADSHEET FULL-FEATURED PAGINATION BAR -->
        <div class="bg-white px-4 py-2.5 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 text-zinc-600 font-medium">
            <span>Menampilkan baris <strong class="text-zinc-900 font-bold font-mono">{{ unverifiedStartRow }} – {{ unverifiedEndRow }}</strong> dari <strong class="text-zinc-900 font-bold font-mono">{{ activeSpreadsheetList.length }}</strong> roll ({{ selectedMachine }})</span>
            <div class="flex items-center gap-1.5 ml-2 border-l border-zinc-300 pl-3">
              <span class="text-zinc-500 text-[11px]">Baris per hal:</span>
              <select
                v-model.number="unverifiedPageSize"
                class="bg-white border border-zinc-300 rounded-lg px-2 py-0.5 text-xs font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-emerald-700 cursor-pointer font-mono"
              >
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="100">100</option>
                <option :value="200">200</option>
                <option :value="-1">Semua</option>
              </select>
            </div>
          </div>

          <div v-if="unverifiedTotalPages > 1" class="flex items-center gap-1.5 flex-wrap">
            <button
              :disabled="unverifiedPage === 1"
              @click="changeUnverifiedPage(1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Pertama"
            >
              «
            </button>
            <button
              :disabled="unverifiedPage === 1"
              @click="changeUnverifiedPage(unverifiedPage - 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Sebelumnya"
            >
              ‹
            </button>

            <template v-for="(p, pIdx) in unverifiedVisiblePages" :key="pIdx">
              <span v-if="p === '...'" class="px-1.5 py-1 text-zinc-400 font-bold">...</span>
              <button
                v-else
                @click="changeUnverifiedPage(p)"
                :class="[
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer font-mono text-xs',
                  unverifiedPage === p
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                ]"
              >
                {{ p }}
              </button>
            </template>

            <button
              :disabled="unverifiedPage === unverifiedTotalPages"
              @click="changeUnverifiedPage(unverifiedPage + 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Selanjutnya"
            >
              ›
            </button>
            <button
              :disabled="unverifiedPage === unverifiedTotalPages"
              @click="changeUnverifiedPage(unverifiedTotalPages)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Terakhir"
            >
              »
            </button>

            <div class="flex items-center gap-1 ml-2 border-l border-zinc-300 pl-2">
              <span class="text-zinc-500 text-[11px]">Ke:</span>
              <input
                v-model="jumpToUnverifiedPage"
                @keyup.enter="handleJumpUnverifiedPage"
                type="number"
                min="1"
                :max="unverifiedTotalPages"
                placeholder="#"
                class="w-12 px-1.5 py-0.5 text-center text-xs border border-zinc-300 rounded-lg outline-none bg-white font-mono"
              />
              <button
                @click="handleJumpUnverifiedPage"
                class="px-2 py-0.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Go
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: TABEL REPORT (ARSIP BATCH TERVERIFIKASI) -->
    <div v-if="activeTab === 'report'" class="space-y-3 animate-fade-in">
      <div class="bg-white p-3 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h3 class="text-sm font-black text-zinc-900">Arsip Batch Terverifikasi</h3>
            <p class="text-xs text-zinc-500 font-medium">Daftar batch verifikasi DE dan ekspor/impor Data Roll yang telah disetujui</p>
          </div>
        </div>

        <div class="flex items-center flex-wrap gap-2">
          <!-- Filter Search Batch -->
          <div class="relative w-48 sm:w-64">
            <input
              v-model="batchReportSearch"
              type="text"
              placeholder="Cari nama batch, tanggal, mesin, verifier..."
              class="w-full pl-7 pr-6 py-1.5 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-zinc-900 outline-none bg-white font-medium"
            />
            <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button v-if="batchReportSearch" @click="batchReportSearch = ''" class="absolute right-2 top-1.5 text-xs text-zinc-400 hover:text-zinc-600 font-bold">✕</button>
          </div>

          <!-- Filter Sumber Data for Batches -->
          <div class="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs">
            <span class="text-[11px] font-bold text-zinc-500 px-1.5">Sumber:</span>
            <button
              @click="batchSourceFilter = 'MANUAL'"
              :class="[
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                batchSourceFilter === 'MANUAL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              Data Label
            </button>
            <button
              @click="batchSourceFilter = 'DATA_ROLL'"
              :class="[
                'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                batchSourceFilter === 'DATA_ROLL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              Export Excel Data Roll
            </button>
            <button
              @click="batchSourceFilter = 'ALL'"
              :class="[
                'px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                batchSourceFilter === 'ALL' ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              Semua
            </button>
          </div>

          <!-- Machine Filter for Batches -->
          <div class="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-xl border border-zinc-200 text-xs">
            <button
              v-for="m in ['ALL', 'SLITTING', 'REWIND', 'CASTING', 'SML']"
              :key="m"
              @click="batchMachineFilter = m"
              :class="[
                'px-2 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer',
                batchMachineFilter === m ? 'bg-zinc-900 text-white shadow-xs' : 'text-zinc-600 hover:bg-zinc-200/60'
              ]"
            >
              {{ m === 'ALL' ? 'Semua' : m }}
            </button>
          </div>

          <!-- Export All Button -->
          <button
            @click="exportAllVerifiedBatchesExcel"
            class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-zinc-900 hover:bg-black text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Download Semua Data Terverifikasi ke Excel"
          >
            <svg class="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
            </svg>
            <span>Export Semua (.xlsx)</span>
          </button>
        </div>
      </div>

      <!-- Tabel Batch List -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-zinc-50 border-b border-zinc-200 text-[11px] font-black text-zinc-600 uppercase tracking-wider">
                <th class="py-3 px-3 text-center w-12">No</th>
                <th class="py-3 px-3">Nama Batch / Dokumen</th>
                <th class="py-3 px-3">Asal Sumber</th>
                <th class="py-3 px-3 text-center">Tanggal & Mesin</th>
                <th class="py-3 px-3 text-center">Waktu Verifikasi / Selesai</th>
                <th class="py-3 px-3 text-center">Total Roll</th>
                <th class="py-3 px-3 text-right">Total Berat (Kg)</th>
                <th class="py-3 px-3 text-center">Quality Breakdown</th>
                <th class="py-3 px-3 text-center">Petugas / Verifier</th>
                <th class="py-3 px-3 text-center w-36">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200/70">
              <tr v-if="filteredVerifiedBatches.length === 0" class="text-center py-10">
                <td colspan="10" class="py-12 text-zinc-400">
                  <div class="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-400 flex items-center justify-center mx-auto mb-2">
                    <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="M7 15h0M2 9.5h20" />
                    </svg>
                  </div>
                  <p class="font-bold text-sm text-zinc-700">Belum ada batch terverifikasi.</p>
                  <p class="text-xs text-zinc-400 mt-0.5">Lakukan verifikasi sesi di Sheet Verifikasi atau ekspor data roll untuk mencatat batch.</p>
                </td>
              </tr>

              <tr
                v-for="(batch, bIdx) in paginatedVerifiedBatches"
                :key="batch.id || batch.uuid || bIdx"
                @click="openBatchDetail(batch)"
                class="hover:bg-zinc-50 transition-colors cursor-pointer group"
              >
                <!-- No -->
                <td class="py-3 px-3 text-center text-zinc-400 font-mono text-[11px]">
                  {{ (batchPageSize === -1 ? 0 : (batchPage - 1) * batchPageSize) + bIdx + 1 }}
                </td>

                <!-- Nama Batch & File -->
                <td class="py-3 px-3">
                  <div class="font-bold text-zinc-900 group-hover:text-red-700 transition-colors">
                    {{ batch.batchName || batch.fileName }}
                  </div>
                  <div v-if="batch.fileName && batch.batchName !== batch.fileName" class="text-[10.5px] text-zinc-400 font-mono mt-0.5">
                    File: {{ batch.fileName }}
                  </div>
                </td>

                <!-- Asal Sumber Badge -->
                <td class="py-3 px-3 whitespace-nowrap">
                  <span
                    v-if="batch.source && (batch.source.includes('Verifikasi') || batch.source.includes('DE'))"
                    class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 inline-block"
                  >
                    Verifikasi Sesi DE
                  </span>
                  <span
                    v-else-if="batch.source && batch.source.includes('Export')"
                    class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-800 border border-zinc-300 inline-block"
                  >
                    Export Data Roll
                  </span>
                  <span
                    v-else
                    class="px-2.5 py-0.5 rounded text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200 inline-block"
                  >
                    {{ batch.source || 'Upload Data Roll' }}
                  </span>
                </td>

                <!-- Tanggal & Mesin -->
                <td class="py-3 px-3 text-center whitespace-nowrap">
                  <div class="font-mono text-xs font-bold text-zinc-800">{{ batch.tanggal || formatDateOnly(batch.uploadDate || batch.createdAt) }}</div>
                  <span class="inline-block px-1.5 py-0.2 rounded text-[9.5px] font-bold bg-zinc-100 text-zinc-600 border border-zinc-200 mt-0.5">
                    {{ batch.machine || batch.mesin || 'ALL' }}
                  </span>
                </td>

                <!-- Waktu Verifikasi -->
                <td class="py-3 px-3 text-center whitespace-nowrap font-mono text-[11px] text-zinc-600">
                  {{ formatHistoryTimestamp(batch.verifiedAt || batch.uploadDate || batch.createdAt) }}
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
                  <span class="text-zinc-800 font-bold">{{ batch.passCount || 0 }} PASS</span>
                  <span v-if="batch.holdCount > 0" class="text-zinc-500 font-bold ml-1.5">• {{ batch.holdCount }} HOLD</span>
                  <span v-if="batch.rejectCount > 0" class="text-zinc-500 font-bold ml-1.5">• {{ batch.rejectCount }} REJ</span>
                </td>

                <!-- Uploader / Verifier -->
                <td class="py-3 px-3 text-center text-zinc-600 whitespace-nowrap text-[11px]">
                  {{ batch.verifiedBy || batch.uploadedBy || 'Data Entry' }}
                </td>

                <!-- Aksi Buttons -->
                <td class="py-3 px-3 text-center whitespace-nowrap" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      @click="openBatchDetail(batch)"
                      class="px-2.5 py-1 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-colors cursor-pointer flex items-center gap-1"
                      title="Lihat Data Roll dalam Batch ini"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      <span>Lihat Roll</span>
                    </button>
                    <button
                      @click="exportSingleBatch(batch)"
                      class="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border border-zinc-200 transition-colors cursor-pointer"
                      title="Export Batch ke Excel"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </button>
                    <button
                      @click="unverifyBatch(batch)"
                      class="p-1.5 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-50 border border-zinc-200 transition-colors cursor-pointer"
                      title="Batalkan Verifikasi Batch (Kembalikan ke Lembar Verifikasi)"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="1 4 1 10 7 10" />
                        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Batch Pagination Bar -->
        <div class="bg-zinc-50 px-4 py-3 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-3 text-zinc-600 font-medium">
            <span>Menampilkan batch <strong class="text-zinc-900 font-bold font-mono">{{ batchStartRow }} – {{ batchEndRow }}</strong> dari <strong class="text-zinc-900 font-bold font-mono">{{ filteredVerifiedBatches.length }}</strong> batch</span>
            <div class="flex items-center gap-1.5 ml-2 border-l border-zinc-300 pl-3">
              <span class="text-zinc-500 text-[11px]">Batch per hal:</span>
              <select
                v-model.number="batchPageSize"
                class="bg-white border border-zinc-300 rounded-lg px-2 py-1 text-xs font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-zinc-900 cursor-pointer font-mono"
              >
                <option :value="10">10</option>
                <option :value="25">25</option>
                <option :value="50">50</option>
                <option :value="-1">Semua</option>
              </select>
            </div>
          </div>

          <div v-if="batchTotalPages > 1" class="flex items-center gap-1.5 flex-wrap">
            <button
              :disabled="batchPage === 1"
              @click="changeBatchPage(1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Pertama"
            >
              «
            </button>
            <button
              :disabled="batchPage === 1"
              @click="changeBatchPage(batchPage - 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Sebelumnya"
            >
              ‹
            </button>

            <template v-for="(p, pIdx) in batchVisiblePages" :key="pIdx">
              <span v-if="p === '...'" class="px-1.5 py-1 text-zinc-400 font-bold">...</span>
              <button
                v-else
                @click="changeBatchPage(p)"
                :class="[
                  'px-3 py-1 rounded-lg font-bold transition-all cursor-pointer font-mono text-xs',
                  batchPage === p
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-white border border-zinc-300 text-zinc-700 hover:bg-zinc-100'
                ]"
              >
                {{ p }}
              </button>
            </template>

            <button
              :disabled="batchPage === batchTotalPages"
              @click="changeBatchPage(batchPage + 1)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Selanjutnya"
            >
              ›
            </button>
            <button
              :disabled="batchPage === batchTotalPages"
              @click="changeBatchPage(batchTotalPages)"
              class="px-2.5 py-1 rounded-lg border border-zinc-300 bg-white font-bold text-zinc-700 hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              title="Halaman Terakhir"
            >
              »
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL: IMPORT EXCEL / PASTE SPREADSHEET (AUTO FORWARD-FILL PARSER KHUSUS SLITTING) -->
    <div
      v-if="showImportModal"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      @click.self="showImportModal = false"
    >
      <div class="bg-white rounded-2xl border border-zinc-300 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        <!-- Modal Header -->
        <div class="px-5 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </div>
            <div>
              <h3 class="text-sm font-black text-zinc-900">Import & Paste DE Report Slitting</h3>
              <p class="text-xs text-zinc-500 font-medium">
                Parent Induk (No Lot/Panjang/Berat) 1x per lot • Lebar Parent di setiap roll • Waste Polos/Metal (kg) 1x per shift
              </p>
            </div>
          </div>
          <button
            @click="showImportModal = false"
            class="p-1.5 rounded-xl hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 transition-colors"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-5 space-y-4 overflow-y-auto flex-1">
          <!-- Opsi 1: Upload File Excel -->
          <div class="space-y-1.5">
            <label class="text-xs font-black text-zinc-800">Opsi A: Upload File Excel (.xlsx / .xls / .csv)</label>
            <div
              class="border-2 border-dashed border-zinc-300 hover:border-blue-500 rounded-xl p-4 text-center cursor-pointer transition-colors bg-zinc-50/50"
              @click="$refs.excelFileInput.click()"
            >
              <input
                ref="excelFileInput"
                type="file"
                accept=".xlsx, .xls, .csv"
                class="hidden"
                @change="handleFileUpload"
              />
              <svg class="w-8 h-8 text-blue-600 mx-auto mb-1.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" />
                <line x1="9" y1="15" x2="12" y2="12" />
                <line x1="15" y1="15" x2="12" y2="12" />
              </svg>
              <p class="text-xs font-bold text-zinc-800">Klik untuk upload file Excel DE Report Slitting</p>
              <p class="text-[11px] text-zinc-400 mt-0.5">Mendukung format kolom standar slitting sheet</p>
            </div>
          </div>

          <!-- Opsi 2: Paste Langsung dari Excel (Ctrl+V) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-black text-zinc-800">Opsi B: Paste Langsung dari Excel / Google Sheets (Ctrl + V)</label>
              <div class="flex items-center gap-2">
                <button
                  type="button"
                  @click="handlePasteFromClipboard"
                  class="px-2.5 py-1 text-[11px] font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Ambil isi clipboard dan proses otomatis"
                >
                  <span>📋 Paste Clipboard</span>
                </button>
                <button
                  type="button"
                  @click="parsePastedText"
                  class="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                  title="Ekstrak data dari teks di bawah"
                >
                  <span>⚡ Ekstrak Data</span>
                </button>
                <button
                  v-if="pasteRawText"
                  type="button"
                  @click="clearPasteText"
                  class="px-2 py-1 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-lg transition-colors cursor-pointer"
                  title="Hapus teks"
                >
                  <span>🗑️ Hapus</span>
                </button>
              </div>
            </div>
            <textarea
              v-model="pasteRawText"
              @input="parsePastedText"
              @paste="onPasteEvent"
              rows="6"
              placeholder="Paste baris tabel Excel di sini (tekan Ctrl+V)... Format kolom standar: Tanggal | Operator | Shift | SPK | Parent Lot | Jenis | Kode | Thick | Lebar Induk | Panjang Induk | Berat Induk | Lebar Hasil | Panjang Hasil | Netto | ..."
              class="w-full p-3 text-xs border border-zinc-300 rounded-xl font-mono focus:ring-2 focus:ring-blue-500 outline-none bg-zinc-50/30"
            ></textarea>

            <!-- Status Banner Hasil Parsing -->
            <div
              v-if="pasteRawText.trim() && parsedImportRows.length === 0"
              class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2 animate-fade-in"
            >
              <span class="text-base">⚠️</span>
              <div>
                <strong class="font-bold">Belum ada baris data yang berhasil diekstrak.</strong>
                <p class="text-[11px] text-amber-700 mt-0.5">
                  Pastikan Anda meng-copy baris data tabel slitting dari Excel (bukan hanya header kosong). Klik tombol <strong>⚡ Ekstrak Data</strong> di atas jika tidak langsung terproses.
                </p>
              </div>
            </div>

            <div
              v-if="parsedImportRows.length > 0"
              class="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between animate-fade-in"
            >
              <div class="flex items-center gap-2">
                <span class="text-base">✅</span>
                <span class="font-bold">Berhasil mengekstrak <strong>{{ parsedImportRows.length }} Roll</strong> ({{ parsedParentCount }} Parent Lot).</span>
              </div>
              <span class="text-[11px] font-bold text-emerald-700">Siap dimasukkan! Klik tombol simpan di bawah.</span>
            </div>
          </div>

          <!-- PREVIEW HASIL PARSING & FORWARD-FILL -->
          <div v-if="parsedImportRows.length > 0" class="space-y-2 border-t border-zinc-200 pt-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs font-black text-zinc-900">Pratinjau Hasil Parsing:</span>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-blue-100 text-blue-800 font-mono">
                  {{ parsedImportRows.length }} Roll
                </span>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-purple-100 text-purple-800 font-mono">
                  {{ parsedParentCount }} Parent Lot
                </span>
                <span class="px-2 py-0.5 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 font-mono">
                  Waste: {{ parsedTotalWaste.toFixed(1) }} kg
                </span>
              </div>
              <span class="text-[11px] text-emerald-600 font-bold">✓ Forward-Fill Aktif</span>
            </div>

            <!-- Preview Mini Table -->
            <div class="overflow-x-auto max-h-56 border border-zinc-300 rounded-xl">
              <table class="w-full text-left text-[11px] font-mono border-collapse bg-white">
                <thead class="bg-zinc-100 text-zinc-700 sticky top-0 font-bold border-b border-zinc-300">
                  <tr>
                    <th class="p-1.5 text-center">#</th>
                    <th class="p-1.5">Tanggal</th>
                    <th class="p-1.5">Shift</th>
                    <th class="p-1.5">SPK</th>
                    <th class="p-1.5">Parent Lot</th>
                    <th class="p-1.5">Lebar Induk</th>
                    <th class="p-1.5">Turunan</th>
                    <th class="p-1.5">Dim. Hasil</th>
                    <th class="p-1.5 text-right">Netto</th>
                    <th class="p-1.5 text-center">Packing</th>
                    <th class="p-1.5 text-center">Status</th>
                    <th class="p-1.5">Defect / Ket. Hasil</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-200">
                  <tr
                    v-for="(row, idx) in parsedImportRows"
                    :key="idx"
                    :class="[
                      row.status === 'HOLD' ? 'bg-amber-50' : (row.status === 'REJECT' ? 'bg-red-50' : 'hover:bg-zinc-50')
                    ]"
                  >
                    <td class="p-1.5 text-center font-bold text-zinc-500">{{ idx + 1 }}</td>
                    <td class="p-1.5">{{ row.tanggal }}</td>
                    <td class="p-1.5 font-bold">{{ row.shiftCombined }}</td>
                    <td class="p-1.5">{{ row.spk }}</td>
                    <td class="p-1.5 font-bold text-zinc-900">{{ row.lot }}</td>
                    <td class="p-1.5 text-zinc-600">{{ row.parentWidth }} MM</td>
                    <td class="p-1.5 font-black text-red-600">{{ row.turunan }}</td>
                    <td class="p-1.5">{{ row.width }} × {{ row.length }}</td>
                    <td class="p-1.5 text-right font-bold text-zinc-900">{{ row.netto }}</td>
                    <td class="p-1.5 text-center font-mono">{{ row.packing }}</td>
                    <td class="p-1.5 text-center">
                      <span
                        :class="[
                          'px-1.5 py-0.2 rounded text-[9px] font-black',
                          row.status === 'HOLD' ? 'bg-amber-500 text-white' : (row.status === 'REJECT' ? 'bg-red-500 text-white' : 'bg-emerald-100 text-emerald-800')
                        ]"
                      >
                        {{ row.status }}
                      </span>
                    </td>
                    <td class="p-1.5 text-zinc-500 truncate max-w-[150px]">{{ row.reasonDefect || row.keterangan || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="px-5 py-3.5 border-t border-zinc-200 bg-zinc-50 flex items-center justify-between">
          <button
            @click="showImportModal = false"
            class="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200 transition-colors"
          >
            Batal
          </button>

          <div class="flex items-center gap-2">
            <button
              :disabled="parsedImportRows.length === 0"
              @click="commitImportedRows"
              class="px-5 py-2 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              <span>Impor & Masukkan ke Sheet Slitting ({{ parsedImportRows.length }} Roll)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue';
import { useLabelStore } from '@/stores/labelStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useConfigStore } from '@/stores/configStore';
import { db, generateUniqID } from '@/db';
import { parseDateToIso, parseDataRollRow } from '@/services/dataRollParserService';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';

const labelStore = useLabelStore();
const dataRollStore = useDataRollStore();
const configStore = useConfigStore();

// Main Sheet Tabs & Verified Batch Unified View State
const activeTab = ref('dashboard'); // Start on Dashboard / Sesi Portal
const isViewingVerifiedBatch = ref(false);
const selectedVerifiedBatch = ref(null);

// Sesi Filter: Tanggal & Mesin Aktif
const selectedDate = ref('ALL');
const selectedMachine = ref('ALL');

// Sumber Data Batch Filter: 'MANUAL' (Default) | 'DATA_ROLL' | 'ALL'
const portalSourceFilter = ref('MANUAL');

// Batch Archive Filters
const batchSourceFilter = ref('MANUAL'); // 'MANUAL' (Default) | 'DATA_ROLL' | 'ALL'

// Accordion Dropdown State for Minimal Daily Table
const expandedDates = ref(new Set());

const toggleDateExpand = (date) => {
  if (expandedDates.value.has(date)) {
    expandedDates.value.delete(date);
  } else {
    expandedDates.value.add(date);
  }
};

const isDateExpanded = (date) => {
  return expandedDates.value.has(date);
};

const expandAllDates = () => {
  availableDates.value.forEach(d => expandedDates.value.add(d));
};

const collapseAllDates = () => {
  expandedDates.value.clear();
};

// Search States with Debouncing (Optimasi Performa 10K+ Data)
const portalSearch = ref('');
const debouncedPortalSearch = ref('');
let portalSearchTimer = null;
watch(portalSearch, (val) => {
  clearTimeout(portalSearchTimer);
  portalSearchTimer = setTimeout(() => {
    debouncedPortalSearch.value = val;
  }, 250);
});

const portalStatusFilter = ref('PENDING'); // Default 'PENDING' (Belum Verifikasi)
const portalMachineFilter = ref('ALL');

const verifySearch = ref('');
const debouncedVerifySearch = ref('');
let verifySearchTimer = null;
watch(verifySearch, (val) => {
  clearTimeout(verifySearchTimer);
  verifySearchTimer = setTimeout(() => {
    debouncedVerifySearch.value = val;
  }, 250);
});

const reportSearch = ref('');
const debouncedReportSearch = ref('');
let reportSearchTimer = null;
watch(reportSearch, (val) => {
  clearTimeout(reportSearchTimer);
  reportSearchTimer = setTimeout(() => {
    debouncedReportSearch.value = val;
  }, 250);
});

// Helper: Format Tanggal Ramah Indonesia
const formatDateNice = (dateStr) => {
  if (!dateStr || dateStr === 'Tanpa Tanggal') return 'Tanpa Tanggal';
  try {
    const s = String(dateStr).trim();
    // If it's already a formatted string like "03 Januari 2026" or contains month names, return directly
    if (/[a-zA-Z]/.test(s)) return s;
    const d = new Date(s);
    if (isNaN(d.getTime())) return s;
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch (e) {
    return String(dateStr);
  }
};

// =========================================================================
// UNIFIED DATA SOURCES WITH CLEAN BATCH SEPARATION
// =========================================================================
const allSourceItems = computed(() => {
  const manualItems = (labelStore.labels || []).map(l => ({
    ...l,
    sourceType: 'MANUAL',
    sourceLabel: 'Data Label (Input Manual)',
    batchTitle: l.batchName || `DE Report ${l.mesin || 'SLITTING'} (${l.tanggal || 'Harian'})`
  }));

  const dataRollItems = (dataRollStore.rolls || [])
    .filter(r => !String(r.id || '').startsWith('de_label') && !r.originalLabelId)
    .map(r => ({
      ...r,
      sourceType: 'DATA_ROLL',
      sourceLabel: 'Export Excel Data Roll',
      batchTitle: r.uploadId || `Upload Excel ${r.machineName || 'SLITTING'} (${r.tanggal || 'Harian'})`,
      mesin: r.machineName || (r.slitting ? 'SLITTING' : (r.rewind ? 'REWIND' : 'CASTING'))
    }));

  if (portalSourceFilter.value === 'MANUAL') {
    return manualItems;
  } else if (portalSourceFilter.value === 'DATA_ROLL') {
    return dataRollItems;
  } else {
    return [...manualItems, ...dataRollItems];
  }
});

// Available Dates & Machines
const availableDates = computed(() => {
  const dates = new Set();
  allSourceItems.value.forEach(l => {
    if (l && l.tanggal) dates.add(String(l.tanggal).trim());
  });
  return Array.from(dates).sort((a, b) => {
    const tA = new Date(a).getTime();
    const tB = new Date(b).getTime();
    if (isNaN(tA) || isNaN(tB)) return String(b).localeCompare(String(a));
    return tB - tA;
  });
});

const availableMachines = computed(() => {
  const machines = new Set(['SLITTING', 'REWIND', 'CASTING', 'METALIZE', 'SML']);
  allSourceItems.value.forEach(l => {
    if (l.mesin) machines.add(l.mesin.toUpperCase());
  });
  return Array.from(machines);
});

// Global Summary Counts (Optimasi 1-Pass Loop untuk 10K+ Data)
const globalSummary = computed(() => {
  let unverified = 0;
  let verified = 0;
  let totalWeight = 0;
  const items = allSourceItems.value;
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (item.verified === 1) {
      verified++;
    } else {
      unverified++;
    }
    totalWeight += (parseFloat(item.netto || item.berat || 0) || 0);
  }
  return {
    unverified,
    verified,
    totalWeight: parseFloat(totalWeight.toFixed(2))
  };
});
const totalGlobalUnverifiedCount = computed(() => globalSummary.value.unverified);
const totalGlobalVerifiedCount = computed(() => globalSummary.value.verified);
const totalGlobalWeightKg = computed(() => globalSummary.value.totalWeight);

// Grouped Sessions: Tanggal ➔ Mesin
const groupedSessions = computed(() => {
  const groups = {};

  allSourceItems.value.forEach((label) => {
    const rawDate = label.tanggal || 'Tanpa Tanggal';
    const mesin = (label.mesin || 'SLITTING').toUpperCase();

    if (!groups[rawDate]) {
      groups[rawDate] = {
        date: rawDate,
        totalRolls: 0,
        unverifiedCount: 0,
        verifiedCount: 0,
        totalKg: 0,
        machines: {}
      };
    }

    if (!groups[rawDate].machines[mesin]) {
      groups[rawDate].machines[mesin] = {
        mesin,
        rolls: [],
        totalRolls: 0,
        totalKg: 0,
        unverifiedCount: 0,
        verifiedCount: 0,
        passCount: 0,
        holdCount: 0,
        rejectCount: 0,
        sourceType: label.sourceType || 'EXCEL',
        sourceLabel: label.sourceLabel || 'Verifikasi Excel',
        operators: new Set()
      };
    }

    const m = groups[rawDate].machines[mesin];
    m.rolls.push(label);
    m.totalRolls++;
    const berat = parseFloat(label.netto || label.berat || 0) || 0;
    m.totalKg += berat;
    groups[rawDate].totalKg += berat;
    groups[rawDate].totalRolls++;

    if (label.operator) {
      const comb = getShiftCombined(label);
      m.operators.add(`${label.operator} (${comb})`);
    }

    if (label.verified === 1) {
      m.verifiedCount++;
      groups[rawDate].verifiedCount++;
    } else {
      m.unverifiedCount++;
      groups[rawDate].unverifiedCount++;
    }

    if (label.status === 'HOLD') m.holdCount++;
    else if (label.status === 'REJECT') m.rejectCount++;
    else m.passCount++;
  });

  let result = Object.values(groups).map(g => ({
    ...g,
    totalKg: parseFloat(g.totalKg.toFixed(2)),
    machinesList: Object.values(g.machines).map(m => ({
      ...m,
      totalKg: parseFloat(m.totalKg.toFixed(2)),
      operatorsList: Array.from(m.operators)
    }))
  })).sort((a, b) => {
    if (a.date === 'Tanpa Tanggal') return 1;
    if (b.date === 'Tanpa Tanggal') return -1;
    return new Date(b.date) - new Date(a.date);
  });

  // Apply filters in portal (Menggunakan debounced search agar tidak lag)
  const term = debouncedPortalSearch.value.toLowerCase().trim();
  if (term || portalMachineFilter.value !== 'ALL' || portalStatusFilter.value !== 'ALL') {
    result = result.map(g => {
      let filteredMachines = g.machinesList;
      if (portalMachineFilter.value !== 'ALL') {
        filteredMachines = filteredMachines.filter(m => m.mesin === portalMachineFilter.value);
      }
      if (portalStatusFilter.value === 'PENDING') {
        filteredMachines = filteredMachines.filter(m => m.unverifiedCount > 0);
      } else if (portalStatusFilter.value === 'VERIFIED') {
        filteredMachines = filteredMachines.filter(m => m.unverifiedCount === 0);
      }

      if (term) {
        filteredMachines = filteredMachines.filter(m => {
          const matchMesin = m.mesin.toLowerCase().includes(term);
          const matchDate = g.date.toLowerCase().includes(term);
          const matchOp = m.operatorsList.some(op => op.toLowerCase().includes(term));
          const matchRoll = m.rolls.some(r => 
            (r.spk && r.spk.toLowerCase().includes(term)) ||
            (r.lot && r.lot.toLowerCase().includes(term)) ||
            (r.turunan && r.turunan.toLowerCase().includes(term))
          );
          return matchMesin || matchDate || matchOp || matchRoll;
        });
      }

      return {
        ...g,
        machinesList: filteredMachines
      };
    }).filter(g => g.machinesList.length > 0);
  }

  return result;
});

// Portal Sessions Pagination States
const portalPage = ref(1);
const portalPageSize = ref(7); // Default 7 hari (1 minggu) per halaman
const jumpToPortalPage = ref('');

const paginatedGroupedSessions = computed(() => {
  if (portalPageSize.value === -1) return groupedSessions.value;
  const start = (portalPage.value - 1) * portalPageSize.value;
  return groupedSessions.value.slice(start, start + portalPageSize.value);
});

const portalTotalPages = computed(() => {
  if (portalPageSize.value === -1 || groupedSessions.value.length === 0) return 1;
  return Math.ceil(groupedSessions.value.length / portalPageSize.value);
});

const portalStartGroup = computed(() => {
  if (groupedSessions.value.length === 0) return 0;
  if (portalPageSize.value === -1) return 1;
  return (portalPage.value - 1) * portalPageSize.value + 1;
});

const portalEndGroup = computed(() => {
  if (groupedSessions.value.length === 0) return 0;
  if (portalPageSize.value === -1) return groupedSessions.value.length;
  return Math.min(portalPage.value * portalPageSize.value, groupedSessions.value.length);
});

const portalVisiblePages = computed(() => {
  const total = portalTotalPages.value;
  const current = portalPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const changePortalPage = (p) => {
  if (p < 1 || p > portalTotalPages.value) return;
  portalPage.value = p;
};

const handleJumpPortalPage = () => {
  const p = parseInt(jumpToPortalPage.value, 10);
  if (!isNaN(p) && p >= 1 && p <= portalTotalPages.value) {
    changePortalPage(p);
  }
  jumpToPortalPage.value = '';
};

watch([portalSearch, portalMachineFilter, portalStatusFilter, portalSourceFilter, portalPageSize], () => {
  portalPage.value = 1;
});

// Active Date & Machine Stats for Session Context Bar
const activeDateMachineStats = computed(() => {
  const list = allSourceItems.value.filter(l => {
    const matchDate = selectedDate.value === 'ALL' || l.tanggal === selectedDate.value;
    const matchMesin = selectedMachine.value === 'ALL' || l.mesin === selectedMachine.value || (!l.mesin && selectedMachine.value === 'SLITTING');
    return matchDate && matchMesin;
  });

  const total = list.length;
  const verified = list.filter(l => l.verified === 1).length;
  const unverified = list.filter(l => !l.verified || l.verified === 0).length;
  const totalKg = list.reduce((sum, item) => sum + (parseFloat(item.netto || item.berat || 0) || 0), 0);

  return {
    total,
    verified,
    unverified,
    totalKg: parseFloat(totalKg.toFixed(2))
  };
});

// Open Verification for Specific Date + Machine
const openVerificationForSession = (date, mesin) => {
  selectedDate.value = date;
  selectedMachine.value = mesin;
  verifySearch.value = '';
  activeTab.value = 'verifikasi';
  selectionStart.r = 0;
  selectionStart.c = 0;
  selectionEnd.r = 0;
  selectionEnd.c = 0;
};

// Batch Approve for Current Session (Date + Machine)
const approveCurrentSessionBatch = async () => {
  const items = filteredUnverifiedList.value;
  if (items.length === 0) return;
  const dateText = selectedDate.value === 'ALL' ? 'Semua Tanggal' : formatDateNice(selectedDate.value);
  const machineText = selectedMachine.value === 'ALL' ? 'Semua Mesin' : `Mesin ${selectedMachine.value}`;
  if (confirm(`Approve seluruh ${items.length} roll untuk ${dateText} (${machineText}) ke Tabel Report?`)) {
    const labelIds = items
      .filter(i => i.sourceType === 'MANUAL' || i.sourceType === 'EXCEL' || !i.sourceType || (!i.isDataRoll && !String(i.id).startsWith('roll_')))
      .map(i => typeof i.id === 'string' && /^\d+$/.test(i.id) ? parseInt(i.id, 10) : i.id);
    const dataRollItems = items.filter(i => i.sourceType === 'DATA_ROLL' || i.isDataRoll || String(i.id).startsWith('roll_'));

    if (labelIds.length > 0) {
      await labelStore.verifyLabels(labelIds);
    }
    if (dataRollItems.length > 0) {
      const now = new Date().toISOString();
      for (const item of dataRollItems) {
        const id = item.originalDataRollId || item.id;
        if (id) {
          await db.data_rolls.update(id, { verified: 1, verifiedAt: now, verifiedBy: 'Data Entry' });
        }
      }
      await dataRollStore.loadRolls();
      await dataRollStore.syncVerifiedDeBatches();
    }
    await labelStore.loadLabels();
    alert(`Berhasil memverifikasi ${items.length} roll untuk ${dateText} (${machineText}).`);
  }
};

// DENSITY & WIDTH CONTROLS (Compact, Normal, Comfortable)
const densityMode = ref('comfortable');

// DEFAULT COLUMN WIDTH SPECIFICATIONS (Pixels)
const defaultColWidths = {
  tanggal: 120,
  operator: 110,
  shiftCombined: 75,
  spk: 165,
  lot: 185,
  jenis: 90,
  kode: 115,
  thickness: 80,
  parentWidth: 115,
  parentMeter: 125,
  parentBeratTeori: 115,
  width: 110,
  length: 115,
  netto: 115,
  childBeratTeori: 115,
  selisihBerat: 95,
  paperCore: 90,
  od: 135,
  turunan: 90,
  packing: 95,
  keteranganBahan: 140,
  keterangan: 150,
  status: 115,
  reasonDefect: 230,
  gradeSisa: 110,
  sisaMeter: 120,
  keteranganSisa: 150,
  wastePolos: 115,
  wasteMetal: 115,
  keteranganWaste: 135,
  noteOperator: 190
};

// Active Machine Detection: Mesin Rewind vs Slitting/Casting
const isRewindSession = computed(() => {
  if (isViewingVerifiedBatch.value && selectedVerifiedBatch.value) {
    const m = String(selectedVerifiedBatch.value.machine || selectedVerifiedBatch.value.mesin || '').toUpperCase();
    return m === 'REWIND';
  }
  return String(selectedMachine.value).toUpperCase() === 'REWIND';
});

// DEFAULT COLUMN WIDTH SPECIFICATIONS FOR REWIND (23 Kolom)
const defaultRewindColWidths = {
  tanggal: 125,
  shiftCombined: 80,
  jenisProses: 95,
  spk: 165,
  lot: 235,
  jenis: 85,
  kode: 105,
  thickness: 75,
  width: 75,
  length: 85,
  netto: 75,
  turunan: 80,
  packing: 75,
  status: 105,
  reasonDefect: 185,
  keteranganBahan: 120,
  keterangan: 120,
  lengthWaste: 95,
  weightWaste: 95,
  paperCore: 65,
  tanda: 65,
  bahan: 85,
  od: 135
};

// Reactive custom column widths
const customColWidths = reactive({ ...defaultColWidths });

const getColumnWidth = (key) => {
  const fallback = isRewindSession.value ? (defaultRewindColWidths[key] || 100) : (defaultColWidths[key] || 110);
  const base = customColWidths[key] || fallback;
  if (densityMode.value === 'compact') return Math.max(55, Math.round(base * 0.75));
  if (densityMode.value === 'normal') return Math.max(70, Math.round(base * 0.9));
  return Math.round(base * 1.05); // Comfortable / Leluasa
};

const resetColWidths = () => {
  const defaults = isRewindSession.value ? defaultRewindColWidths : defaultColWidths;
  Object.assign(customColWidths, defaults);
  densityMode.value = 'comfortable';
};

// ═════════════════════════════════════════════════════════════════════════
// 1. FORMAT REWIND RESMI (23 KOLOM BERBASIS EVENT VERTIKAL BAHAN VS HASIL)
// ═════════════════════════════════════════════════════════════════════════
const rewindColumns = [
  // GROUP 1: IDENTITAS & PROSES (Biru Tua)
  { key: 'tanggal', name: 'Tanggal', letter: 'A', group: 'identitas', align: 'center' },
  { key: 'shiftCombined', name: 'Grup Shift', letter: 'B', group: 'identitas', align: 'center' },
  { key: 'jenisProses', name: 'Jenis Proses', letter: 'C', group: 'identitas', align: 'center' },
  { key: 'spk', name: 'No SPK', letter: 'D', group: 'identitas', align: 'left' },
  { key: 'lot', name: 'No Lot', letter: 'E', group: 'identitas', align: 'left' },

  // GROUP 2: SPESIFIKASI & DIMENSI BAHAN (Sky Blue)
  { key: 'jenis', name: 'Jenis', letter: 'F', group: 'spesifikasi', align: 'center' },
  { key: 'kode', name: 'Kode Formula', letter: 'G', group: 'spesifikasi', align: 'center' },
  { key: 'thickness', name: 'Thickness', letter: 'H', group: 'spesifikasi', align: 'right' },
  { key: 'width', name: 'Width', letter: 'I', group: 'spesifikasi', align: 'right' },
  { key: 'length', name: 'Length', letter: 'J', group: 'spesifikasi', align: 'right' },
  { key: 'netto', name: 'Weight', letter: 'K', group: 'spesifikasi', align: 'right' },

  // GROUP 3: HASIL REWIND & QUALITY (Green)
  { key: 'turunan', name: 'Turunan', letter: 'L', group: 'hasil', align: 'center' },
  { key: 'packing', name: 'Pack', letter: 'M', group: 'hasil', align: 'center' },
  { key: 'status', name: 'Quality Status', letter: 'N', group: 'hasil', align: 'center' },
  { key: 'reasonDefect', name: 'Reason Of Deffect', letter: 'O', group: 'hasil', align: 'left' },

  // GROUP 4: KETERANGAN & WASTE (Amber / Orange)
  { key: 'keteranganBahan', name: 'Keterangan Bahan', letter: 'P', group: 'keterangan', align: 'left' },
  { key: 'keterangan', name: 'Keterangan Hasil', letter: 'Q', group: 'keterangan', align: 'left' },
  { key: 'lengthWaste', name: 'Length Waste', letter: 'R', group: 'keterangan', align: 'right' },
  { key: 'weightWaste', name: 'Weight Waste', letter: 'S', group: 'keterangan', align: 'right' },

  // GROUP 5: ATRIBUT & CORE (Slate / Grey)
  { key: 'paperCore', name: 'Core', letter: 'T', group: 'atribut', align: 'center' },
  { key: 'tanda', name: 'Tanda', letter: 'U', group: 'atribut', align: 'center' },
  { key: 'bahan', name: 'Bahan', letter: 'V', group: 'atribut', align: 'left' },
  { key: 'od', name: 'Input Atribut metalize', letter: 'W', group: 'atribut', align: 'center' }
];

// ═════════════════════════════════════════════════════════════════════════
// 2. FORMAT SLITTING RESMI (31 KOLOM 5-GROUP PARENT-CHILD HORIZONTAL)
// ═════════════════════════════════════════════════════════════════════════
const slittingColumns = [
  // GROUP 1: IDENTITAS SHIFT & PARENT MATERIAL (Biru)
  { key: 'tanggal', name: 'Tanggal', letter: 'A', group: 'parent', align: 'center' },
  { key: 'operator', name: 'Operator', letter: 'B', group: 'parent', align: 'left' },
  { key: 'shiftCombined', name: 'Shift', letter: 'C', group: 'parent', align: 'center' }, // G1, H3, W2
  { key: 'spk', name: 'SPK', letter: 'D', group: 'parent', align: 'left' },
  { key: 'lot', name: 'Lot No.', letter: 'E', group: 'parent', sparseParent: true, align: 'left' },
  { key: 'jenis', name: 'Jenis', letter: 'F', group: 'parent', align: 'center' },
  { key: 'kode', name: 'Kode Formula', letter: 'G', group: 'parent', align: 'center' },
  { key: 'thickness', name: 'Thick', letter: 'H', group: 'parent', align: 'right' },
  { key: 'parentWidth', name: 'Lebar Bahan', letter: 'I', group: 'parent', align: 'right' }, // Muncul di setiap child
  { key: 'parentMeter', name: 'Panjang Bahan', letter: 'J', group: 'parent', sparseParent: true, align: 'right' },
  { key: 'parentBeratTeori', name: 'Berat Bahan', letter: 'K', group: 'parent', sparseParent: true, align: 'right' },

  // GROUP 2: OUTPUT CHILD SLITTING (Sky / Cyan)
  { key: 'width', name: 'Lebar Hasil', letter: 'L', group: 'child', align: 'right' },
  { key: 'length', name: 'Panjang Hasil', letter: 'M', group: 'child', align: 'right' },
  { key: 'netto', name: 'Berat Aktual', letter: 'N', group: 'child', align: 'right' },
  { key: 'childBeratTeori', name: 'Berat Teori', letter: 'O', group: 'child', readonly: true, align: 'right' },
  { key: 'selisihBerat', name: 'Selisih', letter: 'P', group: 'child', readonly: true, align: 'right' },
  { key: 'paperCore', name: 'Core Roll', letter: 'Q', group: 'child', align: 'center' }, // Diameter Core (Default 6")
  { key: 'od', name: 'OD/Treat', letter: 'R', group: 'child', align: 'center' },
  { key: 'turunan', name: 'Turunan', letter: 'S', group: 'child', align: 'center' },
  { key: 'packing', name: 'Packing', letter: 'T', group: 'child', align: 'center' }, // Angka akhir kode pack
  { key: 'keteranganBahan', name: 'Ket. Bahan', letter: 'U', group: 'child', align: 'left' }, // Keterangan dari parent
  { key: 'keterangan', name: 'Ket. Hasil', letter: 'V', group: 'child', align: 'left' }, // Keterangan per roll child

  // GROUP 3: QUALITY CONTROL & DEFECT (Green)
  { key: 'status', name: 'Quality Status', letter: 'W', group: 'qc', align: 'center' },
  { key: 'reasonDefect', name: 'Reason Of Defect', letter: 'X', group: 'qc', align: 'left' }, // Pindah dari Ket Hasil jika HOLD/REJECT

  // GROUP 4: JUMBO SISA (Purple)
  { key: 'gradeSisa', name: 'Grade', letter: 'Y', group: 'sisa', align: 'center' }, // B-GRADE
  { key: 'sisaMeter', name: 'Panjang Sisa', letter: 'Z', group: 'sisa', align: 'right' },
  { key: 'keteranganSisa', name: 'Ket. Sisa', letter: 'AA', group: 'sisa', align: 'left' },

  // GROUP 5: WASTE & CATATAN OPERATOR (Amber / Orange)
  { key: 'wastePolos', name: 'Waste Polos (kg)', letter: 'AB', group: 'waste', sparseShift: true, align: 'right' },
  { key: 'wasteMetal', name: 'Waste Metal (kg)', letter: 'AC', group: 'waste', sparseShift: true, align: 'right' },
  { key: 'keteranganWaste', name: 'Ket. Waste', letter: 'AD', group: 'waste', sparseShift: true, align: 'left' },
  { key: 'noteOperator', name: 'Note Operator', letter: 'AE', group: 'waste', sparseShift: true, align: 'left' }
];

// Active Columns Computed (Dynamic Switching between Rewind & Slitting)
const columns = computed(() => isRewindSession.value ? rewindColumns : slittingColumns);

// COLUMN DRAG RESIZING LOGIC
const resizingCol = ref(null);
const startX = ref(0);
const startWidth = ref(0);

const startColResize = (key, e) => {
  resizingCol.value = key;
  startX.value = e.clientX;
  startWidth.value = getColumnWidth(key);
  document.addEventListener('mousemove', onColResizeMove);
  document.addEventListener('mouseup', stopColResize);
};

const onColResizeMove = (e) => {
  if (!resizingCol.value) return;
  const delta = e.clientX - startX.value;
  const newW = Math.max(50, startWidth.value + delta);
  customColWidths[resizingCol.value] = newW;
};

const stopColResize = () => {
  resizingCol.value = null;
  document.removeEventListener('mousemove', onColResizeMove);
  document.removeEventListener('mouseup', stopColResize);
};

const autoFitCol = (key) => {
  const items = paginatedSpreadsheetList.value;
  let maxChars = (columns.value.find(c => c.key === key)?.name || '').length;
  for (const item of items) {
    const val = String(item[key] || '');
    if (val.length > maxChars) maxChars = val.length;
  }
  customColWidths[key] = Math.max(65, maxChars * 10 + 35);
};

// SPREADSHEET CELL SELECTION STATE
const selectionStart = reactive({ r: 0, c: 0 });
const selectionEnd = reactive({ r: 0, c: 0 });
const isDragging = ref(false);

const spreadsheetContainer = ref(null);

const scrollActiveCellIntoView = () => {
  nextTick(() => {
    if (!spreadsheetContainer.value) return;
    const activeEl = spreadsheetContainer.value.querySelector('.active-excel-cell');
    if (activeEl) {
      activeEl.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'nearest'
      });
    }
  });
};

const draggedRowIndex = ref(null);
const dragOverRowIndex = ref(null);

const editingCell = reactive({ r: null, c: null });
const editInputValue = ref('');

// STORE DATA COMPUTED (Berdasarkan Tanggal & Mesin Terpilih & Sumber Batch)
const unverifiedList = computed(() => {
  return allSourceItems.value.filter(l => (!l.verified || l.verified === 0) && (
    (selectedDate.value === 'ALL' || l.tanggal === selectedDate.value) &&
    (selectedMachine.value === 'ALL' || l.mesin === selectedMachine.value || (!l.mesin && selectedMachine.value === 'SLITTING'))
  ));
});

const verifiedList = computed(() => {
  return allSourceItems.value.filter(l => l.verified === 1 && (
    (selectedDate.value === 'ALL' || l.tanggal === selectedDate.value) &&
    (selectedMachine.value === 'ALL' || l.mesin === selectedMachine.value || (!l.mesin && selectedMachine.value === 'SLITTING'))
  ));
});

const totalWasteUnverified = computed(() => {
  return unverifiedList.value.reduce((sum, item) => {
    const p = parseFloat(item.wastePolos) || 0;
    const m = parseFloat(item.wasteMetal) || 0;
    return sum + p + m;
  }, 0);
});

const filteredUnverifiedList = computed(() => {
  let list = unverifiedList.value;
  const term = debouncedVerifySearch.value.toLowerCase().trim();
  if (!term) return list;

  return list.filter(item => {
    return (
      (item.spk && item.spk.toLowerCase().includes(term)) ||
      (item.lot && item.lot.toLowerCase().includes(term)) ||
      (item.turunan && item.turunan.toLowerCase().includes(term)) ||
      (item.jenis && item.jenis.toLowerCase().includes(term)) ||
      (item.kode && item.kode.toLowerCase().includes(term)) ||
      (item.operator && item.operator.toLowerCase().includes(term)) ||
      (getShiftCombined(item).toLowerCase().includes(term))
    );
  });
});

const filteredVerifiedList = computed(() => {
  const term = debouncedReportSearch.value.toLowerCase().trim();
  if (!term) return verifiedList.value;
  return verifiedList.value.filter(item => {
    return (
      (item.spk && item.spk.toLowerCase().includes(term)) ||
      (item.lot && item.lot.toLowerCase().includes(term)) ||
      (item.turunan && item.turunan.toLowerCase().includes(term)) ||
      (item.jenis && item.jenis.toLowerCase().includes(term)) ||
      (item.kodePack && item.kodePack.toLowerCase().includes(term)) ||
      (getShiftCombined(item).toLowerCase().includes(term))
    );
  });
});

// =========================================================================
// 1. SPREADSHEET VERIFIKASI & BATCH PAGINATION ENGINE
// =========================================================================
const unverifiedPage = ref(1);
const unverifiedPageSize = ref(50); // Default 50 baris per halaman untuk performa kilat
const jumpToUnverifiedPage = ref('');

// Active list switches dynamically between unverified session queue and locked verified batch
const activeSpreadsheetList = computed(() => {
  let list = [];
  if (isViewingVerifiedBatch.value) {
    list = selectedBatchRolls.value || [];
    const term = debouncedVerifySearch.value.toLowerCase().trim();
    if (term) {
      list = list.filter(item => {
        return (
          (item.spk && item.spk.toLowerCase().includes(term)) ||
          (item.lot && item.lot.toLowerCase().includes(term)) ||
          (item.turunan && item.turunan.toLowerCase().includes(term)) ||
          (item.jenis && item.jenis.toLowerCase().includes(term)) ||
          (item.kode && item.kode.toLowerCase().includes(term)) ||
          (item.operator && item.operator.toLowerCase().includes(term)) ||
          (getShiftCombined(item).toLowerCase().includes(term)) ||
          (item.status && item.status.toLowerCase().includes(term))
        );
      });
    }
  } else {
    list = filteredUnverifiedList.value || [];
  }

  // If in Rewind mode, transform into Bahan & Hasil vertical pair rows if they are raw single roll records
  if (isRewindSession.value) {
    const rewindRows = [];
    for (let idx = 0; idx < list.length; idx++) {
      const item = list[idx];
      if (item.jenisProses) {
        // Already a formatted rewind row
        rewindRows.push(item);
      } else {
        // Convert single label record into Paired BAHAN + HASIL rows
        // 1. BAHAN (Input roll)
        rewindRows.push({
          ...item,
          id: `${item.id}_bahan`,
          originalId: item.id,
          isBahanRow: true,
          jenisProses: 'BAHAN',
          turunan: '',
          packing: '',
          status: 'SORTIR',
          reasonDefect: '',
          length: item.parentMeter || item.length,
          netto: item.parentBeratTeori || item.netto,
          lengthWaste: '',
          weightWaste: '',
          paperCore: item.paperCore ? String(item.paperCore).replace(/[^0-9]/g, '') : '6',
          tanda: '',
          bahan: '',
          od: item.od || 'OD2.4+PLASMA'
        });

        // 2. HASIL (Output roll)
        const pMeter = parseFloat(item.parentMeter) || 0;
        const hMeter = parseFloat(item.length) || 0;
        const calcLengthWaste = (pMeter > hMeter) ? (pMeter - hMeter) : '';

        const pBerat = parseFloat(item.parentBeratTeori) || 0;
        const hBerat = parseFloat(item.netto || item.berat) || 0;
        const calcWeightWaste = (pBerat > hBerat) ? parseFloat((pBerat - hBerat).toFixed(1)) : '';

        rewindRows.push({
          ...item,
          originalId: item.id,
          isHasilRow: true,
          jenisProses: 'HASIL',
          status: item.status || 'PASS',
          length: item.length,
          netto: item.netto || item.berat,
          lengthWaste: item.lengthWaste !== undefined ? item.lengthWaste : (item.sisaMeter || calcLengthWaste),
          weightWaste: item.weightWaste !== undefined ? item.weightWaste : ((parseFloat(item.wastePolos || 0) + parseFloat(item.wasteMetal || 0)) || calcWeightWaste),
          paperCore: item.paperCore ? String(item.paperCore).replace(/[^0-9]/g, '') : '6',
          tanda: '',
          bahan: '',
          od: item.od || 'OD2.4+PLASMA'
        });
      }
    }
    return rewindRows;
  }

  return list;
});

const paginatedSpreadsheetList = computed(() => {
  if (unverifiedPageSize.value === -1) return activeSpreadsheetList.value;
  const start = (unverifiedPage.value - 1) * unverifiedPageSize.value;
  return activeSpreadsheetList.value.slice(start, start + unverifiedPageSize.value);
});

// Alias for backwards compatibility
const paginatedUnverifiedList = paginatedSpreadsheetList;

const unverifiedTotalPages = computed(() => {
  if (unverifiedPageSize.value === -1 || activeSpreadsheetList.value.length === 0) return 1;
  return Math.ceil(activeSpreadsheetList.value.length / unverifiedPageSize.value);
});

const unverifiedStartRow = computed(() => {
  if (activeSpreadsheetList.value.length === 0) return 0;
  if (unverifiedPageSize.value === -1) return 1;
  return (unverifiedPage.value - 1) * unverifiedPageSize.value + 1;
});

const unverifiedEndRow = computed(() => {
  if (activeSpreadsheetList.value.length === 0) return 0;
  if (unverifiedPageSize.value === -1) return activeSpreadsheetList.value.length;
  return Math.min(unverifiedPage.value * unverifiedPageSize.value, activeSpreadsheetList.value.length);
});

const unverifiedVisiblePages = computed(() => {
  const total = unverifiedTotalPages.value;
  const current = unverifiedPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const changeUnverifiedPage = (p) => {
  if (p < 1 || p > unverifiedTotalPages.value) return;
  unverifiedPage.value = p;
  editingCell.r = null;
  editingCell.c = null;
  selectionStart.r = 0;
  selectionEnd.r = 0;
  scrollActiveCellIntoView();
};

const handleJumpUnverifiedPage = () => {
  const p = parseInt(jumpToUnverifiedPage.value, 10);
  if (!isNaN(p) && p >= 1 && p <= unverifiedTotalPages.value) {
    changeUnverifiedPage(p);
  }
  jumpToUnverifiedPage.value = '';
};

watch([selectedDate, selectedMachine, portalSourceFilter, verifySearch, unverifiedPageSize, isViewingVerifiedBatch], () => {
  unverifiedPage.value = 1;
});

// =========================================================================
// 2. VERIFIED REPORT BATCH LIST & DETAIL MODAL ENGINE
// =========================================================================
const batchReportSearch = ref('');
const batchMachineFilter = ref('ALL');
const batchPage = ref(1);
const batchPageSize = ref(10);

const showBatchDetailModal = ref(false);
const selectedBatch = ref(null);
const batchDetailSearchQuery = ref('');
const batchDetailModalPage = ref(1);
const batchDetailModalPageSize = ref(50);

// Helper for date formatting
const formatDateOnly = (dateStr) => {
  if (!dateStr) return '-';
  try {
    return String(dateStr).slice(0, 10);
  } catch {
    return String(dateStr);
  }
};

const formatHistoryTimestamp = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${day}/${m}/${y} ${hh}:${mm}`;
  } catch {
    return String(dateStr);
  }
};

// Verified Batches Collection (From dataRollStore.uploadHistory & verified labels)
const verifiedBatches = computed(() => {
  let list = [...(dataRollStore.uploadHistory || [])];

  // Also build batches from verified labels in labelStore.labels to ensure nothing is missed
  const verifiedLabels = (labelStore.labels || []).filter(l => l.verified === 1);
  if (verifiedLabels.length > 0) {
    const map = {};
    for (const l of verifiedLabels) {
      const date = l.tanggal || 'Tanpa Tanggal';
      const machine = (l.mesin || 'SLITTING').toUpperCase();
      const key = `de_${date}_${machine}`;
      if (!map[key]) {
        map[key] = {
          uuid: key,
          batchName: `Batch Verifikasi DE - ${date} (${machine})`,
          source: 'Verifikasi DE Report',
          fileName: `DE_Report_${machine}_${date}.xlsx`,
          machine: machine,
          tanggal: date,
          uploadDate: l.verifiedAt || l.updatedAt || new Date().toISOString(),
          verifiedAt: l.verifiedAt || l.updatedAt || new Date().toISOString(),
          verifiedBy: l.verifiedBy || 'Data Entry',
          totalRolls: 0,
          totalKg: 0,
          passCount: 0,
          holdCount: 0,
          rejectCount: 0,
          status: 'VERIFIED',
          rolls: []
        };
      }
      map[key].rolls.push(l);
      map[key].totalRolls++;
      map[key].totalKg += (parseFloat(l.netto || l.berat || 0) || 0);
      const st = (l.status || 'PASS').toUpperCase();
      if (st === 'HOLD') map[key].holdCount++;
      else if (st === 'REJECT') map[key].rejectCount++;
      else map[key].passCount++;
    }

    const existingKeys = new Set(list.map(h => h.uuid || h.batchName));
    for (const key of Object.keys(map)) {
      if (!existingKeys.has(key)) {
        const item = map[key];
        list.push({
          ...item,
          totalKg: parseFloat(item.totalKg.toFixed(2)),
          rollsJson: JSON.stringify(item.rolls)
        });
      }
    }
  }

  return list.sort((a, b) => {
    const tA = new Date(a.verifiedAt || a.uploadDate || a.createdAt || 0).getTime();
    const tB = new Date(b.verifiedAt || b.uploadDate || b.createdAt || 0).getTime();
    return tB - tA;
  });
});

const filteredVerifiedBatches = computed(() => {
  let list = verifiedBatches.value;

  if (batchSourceFilter.value !== 'ALL') {
    list = list.filter(b => {
      const isManual = b.uuid?.startsWith('de_') || b.source?.includes('DE') || b.source === 'Verifikasi DE Report';
      if (batchSourceFilter.value === 'MANUAL') return isManual;
      if (batchSourceFilter.value === 'DATA_ROLL') return !isManual;
      return true;
    });
  }

  if (batchMachineFilter.value !== 'ALL') {
    list = list.filter(b => (b.machine || b.mesin || '').toUpperCase() === batchMachineFilter.value);
  }

  const q = batchReportSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(b =>
      (b.batchName || '').toLowerCase().includes(q) ||
      (b.fileName || '').toLowerCase().includes(q) ||
      (b.source || '').toLowerCase().includes(q) ||
      (b.tanggal || '').toLowerCase().includes(q) ||
      (b.machine || b.mesin || '').toLowerCase().includes(q) ||
      (b.verifiedBy || b.uploadedBy || '').toLowerCase().includes(q)
    );
  }

  return list;
});

const paginatedVerifiedBatches = computed(() => {
  if (batchPageSize.value === -1) return filteredVerifiedBatches.value;
  const start = (batchPage.value - 1) * batchPageSize.value;
  return filteredVerifiedBatches.value.slice(start, start + batchPageSize.value);
});

const batchTotalPages = computed(() => {
  if (batchPageSize.value === -1 || filteredVerifiedBatches.value.length === 0) return 1;
  return Math.ceil(filteredVerifiedBatches.value.length / batchPageSize.value);
});

const batchStartRow = computed(() => {
  if (filteredVerifiedBatches.value.length === 0) return 0;
  if (batchPageSize.value === -1) return 1;
  return (batchPage.value - 1) * batchPageSize.value + 1;
});

const batchEndRow = computed(() => {
  if (filteredVerifiedBatches.value.length === 0) return 0;
  if (batchPageSize.value === -1) return filteredVerifiedBatches.value.length;
  return Math.min(batchPage.value * batchPageSize.value, filteredVerifiedBatches.value.length);
});

const batchVisiblePages = computed(() => {
  const total = batchTotalPages.value;
  const current = batchPage.value;
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '...', total];
  if (current >= total - 3) return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '...', current - 1, current, current + 1, '...', total];
});

const changeBatchPage = (p) => {
  if (p < 1 || p > batchTotalPages.value) return;
  batchPage.value = p;
};

watch([batchReportSearch, batchMachineFilter, batchSourceFilter, batchPageSize], () => {
  batchPage.value = 1;
});

// Modal / Unified View for Clicked Batch
const openBatchDetail = (batch) => {
  selectedBatch.value = batch;
  selectedVerifiedBatch.value = batch;
  isViewingVerifiedBatch.value = true;
  selectedDate.value = batch.tanggal || 'ALL';
  selectedMachine.value = batch.machine || batch.mesin || 'ALL';
  verifySearch.value = '';
  unverifiedPage.value = 1;
  activeTab.value = 'verifikasi';
  selectionStart.r = 0;
  selectionStart.c = 0;
  selectionEnd.r = 0;
  selectionEnd.c = 0;
};

const closeVerifiedBatchView = () => {
  isViewingVerifiedBatch.value = false;
  selectedVerifiedBatch.value = null;
  activeTab.value = 'report';
};

const selectedBatchRolls = computed(() => {
  if (!selectedBatch.value) return [];
  try {
    const parsed = JSON.parse(selectedBatch.value.rollsJson || '[]');
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch (e) {
    console.error('Failed to parse rollsJson:', e);
  }
  // Fallback: match from labelStore.labels
  const bDate = selectedBatch.value.tanggal || (selectedBatch.value.uploadDate ? selectedBatch.value.uploadDate.slice(0, 10) : '');
  const bMach = (selectedBatch.value.machine || selectedBatch.value.mesin || '').toUpperCase();
  return (labelStore.labels || []).filter(l => 
    l.verified === 1 && 
    (!bDate || l.tanggal === bDate) && 
    (!bMach || bMach === 'ALL' || (l.mesin || 'SLITTING').toUpperCase() === bMach)
  );
});

const batchDetailRollsCount = computed(() => selectedBatchRolls.value.length);
const batchDetailTotalKg = computed(() => {
  return parseFloat(selectedBatchRolls.value.reduce((sum, r) => sum + (parseFloat(r.netto || r.berat || 0) || 0), 0).toFixed(2));
});
const batchDetailPassCount = computed(() => selectedBatchRolls.value.filter(r => (r.qualityStatus || r.status || 'PASS').toUpperCase() === 'PASS').length);
const batchDetailHoldCount = computed(() => selectedBatchRolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'HOLD').length);
const batchDetailRejectCount = computed(() => selectedBatchRolls.value.filter(r => (r.qualityStatus || r.status || '').toUpperCase() === 'REJECT').length);

const filteredBatchDetailRolls = computed(() => {
  let list = selectedBatchRolls.value;
  const q = batchDetailSearchQuery.value.trim().toLowerCase();
  if (!q) return list;
  return list.filter(r =>
    (r.spk && r.spk.toLowerCase().includes(q)) ||
    (r.lot && r.lot.toLowerCase().includes(q)) ||
    (r.turunan && r.turunan.toLowerCase().includes(q)) ||
    (r.kodeFg && r.kodeFg.toLowerCase().includes(q)) ||
    (r.operator && r.operator.toLowerCase().includes(q)) ||
    (r.status && r.status.toLowerCase().includes(q))
  );
});

const batchDetailTotalPages = computed(() => {
  return Math.ceil(filteredBatchDetailRolls.value.length / batchDetailModalPageSize.value) || 1;
});

const paginatedBatchDetailRolls = computed(() => {
  const start = (batchDetailModalPage.value - 1) * batchDetailModalPageSize.value;
  return filteredBatchDetailRolls.value.slice(start, start + batchDetailModalPageSize.value);
});

const batchDetailStartRow = computed(() => {
  if (filteredBatchDetailRolls.value.length === 0) return 0;
  return (batchDetailModalPage.value - 1) * batchDetailModalPageSize.value + 1;
});

const batchDetailEndRow = computed(() => {
  if (filteredBatchDetailRolls.value.length === 0) return 0;
  return Math.min(batchDetailModalPage.value * batchDetailModalPageSize.value, filteredBatchDetailRolls.value.length);
});

const exportSingleBatch = (batch) => {
  if (!batch) return;
  let rolls = [];
  try {
    if (batch.rollsJson) {
      rolls = JSON.parse(batch.rollsJson);
    }
  } catch (e) {}
  if (!rolls || rolls.length === 0) {
    rolls = selectedBatchRolls.value;
  }
  if (!rolls || rolls.length === 0) {
    alert('Tidak ada data roll dalam batch ini.');
    return;
  }
  const isRewind = (batch.machine || batch.mesin || '').toUpperCase().includes('REWIND') ||
                   rolls.some(r => (r.mesin || '').toUpperCase().includes('REWIND') || r.rewind === 1);
  const safeName = (batch.fileName || batch.batchName || 'Batch_Report').replace(/[^a-zA-Z0-9_-]/g, '_');

  if (isRewind) {
    exportRewindExcel(rolls, `${safeName}.xlsx`);
  } else {
    dataRollStore.exportToExcel(rolls, `${safeName}.xlsx`);
  }
};

const unverifyBatch = async (batch) => {
  if (!batch) return;
  const countStr = batch.totalRolls ? ` (${batch.totalRolls} roll)` : '';
  if (confirm(`Batalkan verifikasi untuk batch "${batch.batchName || batch.fileName}"${countStr}?\n\nSemua data roll di dalamnya akan dikembalikan ke lembar verifikasi untuk diedit kembali.`)) {
    const rolls = selectedBatchRolls.value;
    const labelIds = [];
    for (const r of rolls) {
      if (r.id && typeof r.id === 'number') labelIds.push(r.id);
      else if (r.originalLabelId) labelIds.push(r.originalLabelId);
    }
    if (labelIds.length === 0 && batch.tanggal && batch.machine) {
      const matched = (labelStore.labels || []).filter(l => 
        l.tanggal === batch.tanggal && 
        (l.mesin || 'SLITTING').toUpperCase() === String(batch.machine).toUpperCase()
      );
      labelIds.push(...matched.map(m => m.id));
    }

    if (labelIds.length > 0) {
      await labelStore.unverifyLabels(labelIds);
    }

    if (db.data_roll_uploads) {
      if (batch.id) {
        await db.data_roll_uploads.delete(batch.id);
      } else if (batch.uuid) {
        await db.data_roll_uploads.where('uuid').equals(batch.uuid).delete();
      }
    }

    isViewingVerifiedBatch.value = false;
    selectedVerifiedBatch.value = null;
    selectedDate.value = batch.tanggal || 'ALL';
    selectedMachine.value = batch.machine || batch.mesin || 'ALL';
    activeTab.value = 'verifikasi';
    unverifiedPage.value = 1;

    await labelStore.loadLabels();
    await dataRollStore.loadUploadHistory();
    await dataRollStore.syncVerifiedDeBatches();
  }
};

const exportAllVerifiedBatchesExcel = () => {
  const allVerifiedRolls = (labelStore.labels || []).filter(l => l.verified === 1);
  if (allVerifiedRolls.length === 0) {
    alert('Tidak ada data roll terverifikasi untuk diekspor.');
    return;
  }
  dataRollStore.exportToExcel(allVerifiedRolls, `Rekap_Semua_Batch_Terverifikasi_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// SELECTION BOUNDS (Operates on Paginated Unverified Grid)
const minRow = computed(() => Math.min(selectionStart.r, selectionEnd.r));
const maxRow = computed(() => Math.min(Math.max(selectionStart.r, selectionEnd.r), Math.max(0, paginatedUnverifiedList.value.length - 1)));
const minCol = computed(() => Math.min(selectionStart.c, selectionEnd.c));
const maxCol = computed(() => Math.max(selectionStart.c, selectionEnd.c));

const selectedRowCount = computed(() => {
  if (paginatedUnverifiedList.value.length === 0) return 0;
  return maxRow.value - minRow.value + 1;
});

const rangeCellCount = computed(() => {
  return (maxRow.value - minRow.value + 1) * (maxCol.value - minCol.value + 1);
});

const selectedRangeLabel = computed(() => {
  if (paginatedUnverifiedList.value.length === 0) return 'A1';
  const startColLetter = columns.value[selectionStart.c]?.letter || 'A';
  const startRowNum = selectionStart.r + 1;
  
  if (selectionStart.r === selectionEnd.r && selectionStart.c === selectionEnd.c) {
    return `${startColLetter}${startRowNum}`;
  }

  const minColLetter = columns.value[minCol.value]?.letter || 'A';
  const maxColLetter = columns.value[maxCol.value]?.letter || 'A';
  return `${minColLetter}${minRow.value + 1}:${maxColLetter}${maxRow.value + 1}`;
});

// ----------------------------------------------------
// DENSITY & CALCULATION HELPERS
// ----------------------------------------------------
const getDensity = (jenis, kode) => {
  const cleanJenis = String(jenis || '').toUpperCase().trim();
  const cleanKode = String(kode || '').toUpperCase().trim();

  // 1. ConfigStore lookup
  if (configStore?.filmConfigs?.length) {
    const matched = configStore.filmConfigs.find(r => 
      String(r.jenis || '').toUpperCase().trim() === cleanJenis && 
      String(r.kodeFormula || '').toUpperCase().trim() === cleanKode
    );
    if (matched && matched.density) return parseFloat(matched.density);

    const byJenis = configStore.filmConfigs.find(r => 
      String(r.jenis || '').toUpperCase().trim() === cleanJenis
    );
    if (byJenis && byJenis.density) return parseFloat(byJenis.density);
  }

  // 2. Direct Polymer Density Heuristics
  if (cleanJenis.includes('PET') || cleanJenis.includes('VMPET')) return 1.40;
  if (cleanJenis.includes('LLDPE') || cleanJenis.includes('LDPE') || cleanJenis.includes('PE')) return 0.92;
  if (cleanJenis.includes('CPP') || cleanJenis.includes('VMCPP') || cleanJenis.includes('BOPP') || cleanJenis.includes('PP')) return 0.91;
  if (cleanJenis.includes('NYLON') || cleanJenis.includes('BOPA')) return 1.15;

  return 0.91; // Default Standard Polypropylene Density
};

// Helper: Format Ukuran Core Roll (3" atau 6")
const getCoreSizeText = (item) => {
  if (!item) return '6"';
  
  // 1. Cek properti core, paperCore, coreRoll
  const raw = String(item.core || item.coreRoll || item.paperCore || item.coreDiameter || '').trim();
  
  // Jika bernilai 3 atau mengandung 3 (misal: "3", "3\"", "3 inch", "3INCH")
  if (/^3(\"|inch|in)?$/i.test(raw) || raw === '3') return '3"';
  // Jika bernilai 6 atau mengandung 6 (misal: "6", "6\"", "6 inch", "6INCH")
  if (/^6(\"|inch|in)?$/i.test(raw) || raw === '6') return '6"';
  
  // 2. Cek apakah ada di deskripsi atau OD
  const desc = `${item.descriptionExcel || ''} ${item.descriptionNav || ''} ${item.od || ''} ${item.jenis || ''}`;
  if (desc.includes('3"') || desc.toLowerCase().includes('3 inch') || desc.toLowerCase().includes('3inch')) {
    return '3"';
  }
  if (desc.includes('6"') || desc.toLowerCase().includes('6 inch') || desc.toLowerCase().includes('6inch')) {
    return '6"';
  }

  // 3. Fallback default slitting standard
  return '6"';
};

// Auto-Calculate Parent Lot Info (Lebar Bahan, Panjang Bahan, Berat Bahan) from Child Roll Chartings
const getParentLotInfo = (lotNo) => {
  if (!lotNo) return { parentWidth: 0, parentMeter: 0, parentBeratTeori: 0 };
  
  const allLotItems = labelStore.labels.filter(l => l.lot === lotNo);
  if (!allLotItems.length) return { parentWidth: 0, parentMeter: 0, parentBeratTeori: 0 };
  
  const first = allLotItems[0];
  
  // 1. Parent Width (Lebar Bahan)
  let parentWidth = parseFloat(first.parentWidth) || 0;
  if (!parentWidth) {
    const chartMap = new Map();
    allLotItems.forEach(item => {
      const turunanStr = String(item.turunan || '').trim().toUpperCase();
      const match = turunanStr.match(/^[A-Z]([A-Z])\d+/);
      const ch = match ? match[1] : (turunanStr.charAt(1) || 'A');
      const w = parseFloat(item.width || item.lebar) || 0;
      if (!chartMap.has(ch) && w > 0) {
        chartMap.set(ch, w);
      }
    });
    const sumWidth = Array.from(chartMap.values()).reduce((acc, w) => acc + w, 0);
    parentWidth = sumWidth > 0 ? sumWidth : (parseFloat(first.width || first.lebar) || 1000) * 2;
  }

  // 2. Parent Meter (Panjang Bahan)
  let parentMeter = parseFloat(first.parentMeter) || 0;
  if (!parentMeter) {
    const seqMap = new Map();
    allLotItems.forEach(item => {
      const turunanStr = String(item.turunan || '').trim().toUpperCase();
      const match = turunanStr.match(/^[A-Z][A-Z](\d+)/);
      const seq = match ? match[1] : '01';
      const len = parseFloat(item.meter || item.length || item.panjang) || 0;
      if (!seqMap.has(seq) && len > 0) {
        seqMap.set(seq, len);
      }
    });
    const sumLen = Array.from(seqMap.values()).reduce((acc, l) => acc + l, 0);
    parentMeter = sumLen > 0 ? sumLen : (parseFloat(first.meter || first.length || first.panjang) || 0);
  }

  // 3. Parent Berat Teori (Berat Bahan Induk)
  const density = getDensity(first.jenis, first.kode);
  const thick = parseFloat(first.thickness || first.tebal || first.thick || first.ketebalan) || 0;
  let parentBeratTeori = parseFloat(first.parentBeratTeori) || 0;
  if (!parentBeratTeori && thick && parentWidth && parentMeter && density) {
    parentBeratTeori = parseFloat(((thick * parentWidth * parentMeter * density) / 1000000).toFixed(2));
  }

  return {
    parentWidth,
    parentMeter,
    parentBeratTeori
  };
};

const getParentWidth = (item) => {
  if (!item) return '';
  if (item.parentWidth && parseFloat(item.parentWidth) > 0) return String(item.parentWidth);
  const info = getParentLotInfo(item.lot);
  return info.parentWidth > 0 ? String(info.parentWidth) : String(item.width || item.lebar || '');
};

const getParentMeter = (item) => {
  if (!item) return '';
  if (item.parentMeter && parseFloat(item.parentMeter) > 0) return String(item.parentMeter);
  const info = getParentLotInfo(item.lot);
  return info.parentMeter > 0 ? String(info.parentMeter) : String(item.meter || item.length || item.panjang || '');
};

const getParentBeratTeori = (item) => {
  if (!item) return '';
  if (item.parentBeratTeori && parseFloat(item.parentBeratTeori) > 0) return String(item.parentBeratTeori);
  const info = getParentLotInfo(item.lot);
  return info.parentBeratTeori > 0 ? String(info.parentBeratTeori) : '';
};

// Helper: Get item thickness, looking up parent lot if needed
const getItemThickness = (item) => {
  if (!item) return 20;
  let t = parseFloat(String(item.thickness || item.tebal || item.thick || item.ketebalan || '').replace(',', '.').replace(/[^\d.]/g, ''));
  if (!isNaN(t) && t > 0) return t;
  if (item.lot) {
    const parent = labelStore.labels.find(l => l.lot === item.lot && (l.thickness || l.tebal || l.thick || l.ketebalan));
    if (parent) {
      t = parseFloat(String(parent.thickness || parent.tebal || parent.thick || parent.ketebalan).replace(',', '.').replace(/[^\d.]/g, ''));
      if (!isNaN(t) && t > 0) return t;
    }
  }
  return 20;
};

const getItemJenis = (item) => {
  if (!item) return 'VMCPP';
  if (item.jenis) return item.jenis;
  if (item.lot) {
    const parent = labelStore.labels.find(l => l.lot === item.lot && l.jenis);
    if (parent) return parent.jenis;
  }
  return 'VMCPP';
};

const getItemKode = (item) => {
  if (!item) return 'M06';
  if (item.kode) return item.kode;
  if (item.lot) {
    const parent = labelStore.labels.find(l => l.lot === item.lot && l.kode);
    if (parent) return parent.kode;
  }
  return 'M06';
};

// Child Berat Teori: (Thick * Width * Length * Density) / 1,000,000
const getChildTeori = (item) => {
  if (!item) return '-';
  const thick = getItemThickness(item);
  const width = parseFloat(String(item.width || item.lebar || '').replace(',', '.').replace(/[^\d.]/g, ''));
  const length = parseFloat(String(item.length || item.meter || item.panjang || '').replace(',', '.').replace(/[^\d.]/g, ''));
  
  if (isNaN(width) || isNaN(length) || width <= 0 || length <= 0) {
    if (item.childBeratTeori && !isNaN(parseFloat(String(item.childBeratTeori).replace(',', '.')))) {
      return parseFloat(String(item.childBeratTeori).replace(',', '.')).toFixed(2);
    }
    if (item.beratTeori && !isNaN(parseFloat(String(item.beratTeori).replace(',', '.')))) {
      return parseFloat(String(item.beratTeori).replace(',', '.')).toFixed(2);
    }
    return '-';
  }
  
  const jenis = getItemJenis(item);
  const kode = getItemKode(item);
  const density = getDensity(jenis, kode);
  return ((thick * width * length * density) / 1000000).toFixed(2);
};

// Selisih Berat: Netto Aktual - Berat Teori
const getSelisih = (item) => {
  if (!item) return null;
  const nettoStr = String(item.netto ?? item.berat ?? item.beratNetto ?? item.weight ?? '').replace(',', '.').replace(/[^\d.-]/g, '');
  const netto = parseFloat(nettoStr);
  const teoriStr = String(getChildTeori(item)).replace(',', '.').replace(/[^\d.-]/g, '');
  const teori = parseFloat(teoriStr);
  if (isNaN(netto) || isNaN(teori)) return null;
  return parseFloat((netto - teori).toFixed(2));
};

// Helper: Get Operator Code (e.g. GUNAWAN -> G, HENDRA -> H, WAHYU -> W, SUDARMAJI -> A/S)
const getOperatorCode = (item) => {
  if (!item) return 'G';

  // 1. Jika sudah ada kodeOperator spesifik pada item
  if (item.kodeOperator && typeof item.kodeOperator === 'string' && item.kodeOperator.trim()) {
    return item.kodeOperator.trim().toUpperCase();
  }

  // 2. Lookup dari nama operator di master configStore
  const opRaw = String(item.operator || item.op || item.operatorName || '').trim();
  if (opRaw) {
    const opUpper = opRaw.toUpperCase();
    const matched = configStore?.operatorList?.find(o => 
      (o.nama && o.nama.toUpperCase() === opUpper) || 
      (o.kodeOperator && o.kodeOperator.toUpperCase() === opUpper)
    );
    if (matched && matched.kodeOperator) {
      return matched.kodeOperator.toUpperCase();
    }
    // Jika operator berisi 1 huruf langsung (misal "G", "H", "W")
    if (opUpper.length === 1 && /[A-Z]/.test(opUpper)) {
      return opUpper;
    }
    // Default ambil huruf depan alfabet
    const matchAlpha = opUpper.match(/[A-Z]/);
    if (matchAlpha) {
      return matchAlpha[0];
    }
  }

  // 3. Ekstrak huruf dari shiftCombined jika ada (misal "G1" -> "G", "H3" -> "H")
  if (item.shiftCombined) {
    const matchPrefix = String(item.shiftCombined).trim().toUpperCase().match(/^([A-Z]+)/);
    if (matchPrefix) {
      return matchPrefix[1];
    }
  }

  return 'G'; // Fallback standar slitting
};

// Helper: Get Shift Number (1, 2, 3)
const getShiftNumber = (item) => {
  if (!item) return '1';
  const rawShift = String(item.shift || '').replace(/\D/g, '');
  if (rawShift) return rawShift;
  if (item.shiftCombined) {
    const numMatch = String(item.shiftCombined).match(/\d+/);
    if (numMatch) return numMatch[0];
  }
  return '1';
};

// Shift combined (Operator Code + Shift, e.g. G1, H3, W2)
const getShiftCombined = (item) => {
  if (!item) return 'G1';
  const opCode = getOperatorCode(item);
  const shiftNum = getShiftNumber(item);
  return `${opCode}${shiftNum}`;
};

// Packing (Hanya nomor akhir kode pack, misal 25)
const getPackingEndNumber = (item) => {
  if (!item) return '';
  if (item.packing && String(item.packing).length <= 4 && !isNaN(item.packing)) {
    return parseInt(item.packing, 10);
  }
  if (item.subKode && !isNaN(item.subKode)) {
    return parseInt(item.subKode, 10);
  }
  return '25';
};

// Reason of Defect: Jika HOLD/REJECT dan belum diisi, otomatis mengambil dari Keterangan Hasil
const getReasonDefectText = (item) => {
  if (!item) return '-';
  if (item.reasonDefect) return item.reasonDefect;
  if (item.status === 'HOLD' || item.status === 'REJECT') {
    return item.keterangan || item.keteranganRoll || '-';
  }
  return '-';
};

// ----------------------------------------------------
// SPARSE DISPLAY & PARENT DELIMITER LOGIC
// ----------------------------------------------------
const isFirstRowOfParent = (rIdx) => {
  if (rIdx === 0) return true;
  const list = filteredUnverifiedList.value;
  const current = list[rIdx];
  const prev = list[rIdx - 1];
  if (!current || !prev) return false;
  return current.lot !== prev.lot || current.spk !== prev.spk;
};

const isNewParentStart = (rIdx) => {
  if (isRewindSession.value) {
    const list = paginatedSpreadsheetList.value;
    return list[rIdx]?.jenisProses === 'BAHAN';
  }
  return isFirstRowOfParent(rIdx);
};

const isParentSparseColumn = (key) => {
  if (isRewindSession.value) return false;
  return ['lot', 'parentMeter', 'parentBeratTeori'].includes(key);
};

// Format Cell Value with Single/Sparse Parent Rule and Rewind Schema
const formatCellValue = (val, key, item, rIdx) => {
  if (!item) return '';

  // REWIND 23-COLUMN SPECIAL FORMATTING
  if (isRewindSession.value) {
    if (key === 'jenisProses') return item.jenisProses || 'BAHAN';
    if (key === 'shiftCombined') return getShiftCombined(item);
    if (key === 'status') return item.status || (item.jenisProses === 'BAHAN' ? 'SORTIR' : 'PASS');
    if (key === 'packing') return item.jenisProses === 'BAHAN' ? '' : String(getPackingEndNumber(item) || item.packing || item.subKode || '');
    if (key === 'turunan') return item.jenisProses === 'BAHAN' ? '' : (item.turunan || '');
    if (key === 'reasonDefect') return item.reasonDefect || (item.status === 'REJECT' ? (item.keterangan || '') : '');
    if (key === 'lengthWaste') return item.lengthWaste !== undefined ? String(item.lengthWaste) : '';
    if (key === 'weightWaste') return item.weightWaste !== undefined ? String(item.weightWaste) : '';
    if (key === 'paperCore') return item.paperCore ? String(item.paperCore).replace(/[^0-9]/g, '') : '6';
    if (key === 'od') return item.od || item.treatment || 'OD2.4+PLASMA';
    if (key === 'tanda') return item.tanda || '';
    if (key === 'bahan') return item.bahan || '';
    if (key === 'keteranganBahan') return item.keteranganBahan || '';
    if (key === 'keterangan') return item.keterangan || '';
    if (key === 'netto') return String(item.netto || item.berat || '');
    if (key === 'length') return String(item.length || item.meter || '');
    if (key === 'width') return String(item.width || item.lebar || '');
    if (key === 'thickness') return String(item.thickness || item.tebal || '');
    if (key === 'kode') return item.kode || item.kodeFormula || '';
    if (key === 'spk') return String(item.spk || item.noSpk || '');
    if (key === 'lot') return String(item.lot || item.noLot || '');
    if (key === 'tanggal') return String(item.tanggal || '');
    if (key === 'jenis') return String(item.jenis || 'VMCPP');
    return item[key] !== undefined ? String(item[key]) : '';
  }

  // 1. Handlers Khusus Kolom Terkalkulasi (Slitting)
  if (key === 'paperCore') {
    return getCoreSizeText(item);
  }
  if (key === 'shiftCombined') {
    return getShiftCombined(item);
  }
  if (key === 'childBeratTeori') {
    return getChildTeori(item);
  }
  if (key === 'selisihBerat') {
    const sel = getSelisih(item);
    return sel !== null ? (sel > 0 ? `+${sel}` : String(sel)) : '-';
  }
  if (key === 'packing') {
    return String(getPackingEndNumber(item));
  }
  if (key === 'reasonDefect') {
    return getReasonDefectText(item);
  }

  // 2. Kolom Bahan Induk (Parent Material Slitting)
  if (key === 'parentWidth') {
    return getParentWidth(item);
  }
  if (key === 'parentMeter') {
    return isFirstRowOfParent(rIdx) ? getParentMeter(item) : '';
  }
  if (key === 'parentBeratTeori') {
    return isFirstRowOfParent(rIdx) ? getParentBeratTeori(item) : '';
  }

  // 3. Aturan Sparse Parent: No Lot hanya muncul 1x di baris pertama parent
  if (isParentSparseColumn(key)) {
    if (!isFirstRowOfParent(rIdx)) {
      return ''; // Blank visual untuk child baris ke-2, 3, dst
    }
  }

  // 4. Aturan Sparse Shift Waste: Waste Polos & Metal hanya muncul 1x per shift
  if (key === 'wastePolos' || key === 'wasteMetal' || key === 'keteranganWaste' || key === 'noteOperator') {
    if (rIdx > 0) {
      const prev = filteredUnverifiedList.value[rIdx - 1];
      if (prev && getShiftCombined(prev) === getShiftCombined(item) && prev.tanggal === item.tanggal) {
        if (!val || val === prev[key]) return '';
      }
    }
  }

  if (val === undefined || val === null || val === '') {
    if (key === 'netto') return String(item.netto || item.berat || item.beratNetto || '');
    if (key === 'thickness') return String(item.thickness || item.tebal || item.thick || '');
    if (key === 'width') return String(item.width || item.lebar || '');
    if (key === 'length') return String(item.length || item.meter || item.panjang || '');
    if (key === 'spk') return String(item.spk || item.noSpk || '');
    if (key === 'lot') return String(item.lot || item.noLot || '');
    if (key === 'status') return String(item.status || 'PASS');
    return '';
  }
  return String(val);
};

// ACTIVE CELL VALUE FOR FORMULA BAR
const activeCellValue = computed({
  get() {
    const item = paginatedSpreadsheetList.value[selectionStart.r];
    if (!item) return '';
    const colKey = columns.value[selectionStart.c]?.key;
    if (colKey === 'shiftCombined') return getShiftCombined(item);
    if (colKey === 'parentWidth') return getParentWidth(item);
    if (colKey === 'parentMeter') return getParentMeter(item);
    if (colKey === 'parentBeratTeori') return getParentBeratTeori(item);
    if (colKey === 'childBeratTeori') return getChildTeori(item);
    if (colKey === 'selisihBerat') return String(getSelisih(item) ?? '');
    if (colKey === 'paperCore') return getCoreSizeText(item);
    if (colKey === 'packing') return String(getPackingEndNumber(item));
    if (colKey === 'reasonDefect') return getReasonDefectText(item);
    if (colKey === 'thickness') return String(item.thickness || item.tebal || item.thick || '');
    if (colKey === 'width') return String(item.width || item.lebar || '');
    if (colKey === 'length') return String(item.length || item.meter || item.panjang || '');
    if (colKey === 'netto') return String(item.netto || item.berat || '');
    return item[colKey] !== undefined ? String(item[colKey]) : '';
  },
  set(val) {
    const item = paginatedSpreadsheetList.value[selectionStart.r];
    if (!item) return;
    const col = columns.value[selectionStart.c];
    if (col && !col.readonly) {
      const colKey = col.key;
      const oldVal = item[colKey] !== undefined ? item[colKey] : '';
      if (oldVal !== val) {
        recordHistory(`Edit Cell ${col.letter}${selectionStart.r + 1}`, [
          { id: item.id, field: colKey, oldVal, newVal: val }
        ]);
        saveCellUpdate(item, colKey, val);
      }
    }
  }
});

const onFormulaBarInput = (e) => {
  activeCellValue.value = e.target.value;
};

// CHECK CELL STATE
const isCellInSelection = (r, c) => {
  return r >= minRow.value && r <= maxRow.value && c >= minCol.value && c <= maxCol.value;
};

const isActiveCell = (r, c) => {
  return selectionStart.r === r && selectionStart.c === c;
};

const isRowInSelection = (r) => {
  return r >= minRow.value && r <= maxRow.value;
};

const isColInSelection = (c) => {
  return c >= minCol.value && c <= maxCol.value;
};

const isEditing = (r, c) => {
  return editingCell.r === r && editingCell.c === c;
};

// ROW STATUS TINT
const getRowClass = (item, rIdx) => {
  const classes = ['transition-all'];
  if (dragOverRowIndex.value === rIdx) {
    classes.push('border-t-4 border-blue-600 bg-blue-50/80 shadow-md');
  } else if (draggedRowIndex.value === rIdx) {
    classes.push('opacity-40 bg-zinc-200');
  } else {
    if (item.status === 'HOLD') {
      classes.push('bg-amber-100/70 hover:bg-amber-100/90 text-amber-950');
    } else if (item.status === 'REJECT') {
      classes.push('bg-red-100/70 hover:bg-red-100/90 text-red-950');
    } else {
      classes.push('hover:bg-zinc-50/60');
    }
  }
  return classes.join(' ');
};

// CELL STYLING WITH ACTIVE, SELECTION & STATUS TINT (AUTHENTIC EXCEL LOOK)
const getCellClass = (item, rIdx, c) => {
  const classes = [];
  if (isActiveCell(rIdx, c)) {
    classes.push('active-excel-cell bg-white z-20 font-medium');
  } else if (isCellInSelection(rIdx, c)) {
    classes.push('bg-[#107c41]/10 text-emerald-950');
  } else if (item.status === 'HOLD') {
    classes.push('bg-amber-50/80 text-amber-950');
  } else if (item.status === 'REJECT') {
    classes.push('bg-red-50/80 text-red-950');
  } else {
    classes.push('bg-white hover:bg-zinc-50/60');
  }
  return classes.join(' ');
};

// MOUSE SELECTION HANDLING
const handleCellMouseDown = (r, c, event) => {
  if (isEditing(r, c)) return;

  if (event.shiftKey) {
    selectionEnd.r = r;
    selectionEnd.c = c;
  } else {
    selectionStart.r = r;
    selectionStart.c = c;
    selectionEnd.r = r;
    selectionEnd.c = c;
    isDragging.value = true;
  }
};

const handleCellMouseEnter = (r, c) => {
  if (isDragging.value) {
    selectionEnd.r = r;
    selectionEnd.c = c;
  }
};

const handleGlobalMouseUp = () => {
  isDragging.value = false;
  if (resizingCol.value) {
    stopColResize();
  }
};

// ROW HEADER SELECTION
const handleRowHeaderMouseDown = (rIdx, event) => {
  if (event.shiftKey) {
    selectionEnd.r = rIdx;
    selectionStart.c = 0;
    selectionEnd.c = columns.value.length - 1;
  } else {
    selectionStart.r = rIdx;
    selectionEnd.r = rIdx;
    selectionStart.c = 0;
    selectionEnd.c = columns.value.length - 1;
    isDragging.value = true;
  }
};

const handleRowHeaderMouseEnter = (rIdx) => {
  if (isDragging.value) {
    selectionEnd.r = rIdx;
    selectionStart.c = 0;
    selectionEnd.c = columns.value.length - 1;
  }
};

// DRAG AND DROP ROWS
const onRowDragStart = (rIdx, e) => {
  if (rIdx < minRow.value || rIdx > maxRow.value) {
    selectionStart.r = rIdx;
    selectionEnd.r = rIdx;
    selectionStart.c = 0;
    selectionEnd.c = columns.value.length - 1;
  }

  draggedRowIndex.value = rIdx;
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', JSON.stringify({
    start: minRow.value,
    end: maxRow.value
  }));
};

const onRowDragOver = (rIdx, e) => {
  if (draggedRowIndex.value !== null) {
    e.dataTransfer.dropEffect = 'move';
    dragOverRowIndex.value = rIdx;
  }
};

const onRowDragLeave = () => {
  dragOverRowIndex.value = null;
};

const onRowDragEnd = () => {
  draggedRowIndex.value = null;
  dragOverRowIndex.value = null;
};

const onRowDrop = (targetIdx) => {
  const rStart = minRow.value;
  const rEnd = maxRow.value;
  draggedRowIndex.value = null;
  dragOverRowIndex.value = null;

  if (targetIdx >= rStart && targetIdx <= rEnd) return;

  const currentList = filteredUnverifiedList.value;
  if (!currentList || targetIdx < 0 || targetIdx >= currentList.length) return;

  const itemsToMove = currentList.slice(rStart, rEnd + 1);
  if (itemsToMove.length === 0) return;

  const targetItem = currentList[targetIdx];
  if (!targetItem) return;

  const oldOrder = labelStore.labels.map(l => l.id);
  const oldSel = { startR: rStart, endR: rEnd };

  const moveIds = new Set(itemsToMove.map(i => i.id));
  const fullList = [...labelStore.labels];

  const extracted = [];
  const remaining = [];
  for (const item of fullList) {
    if (moveIds.has(item.id)) {
      extracted.push(item);
    } else {
      remaining.push(item);
    }
  }

  let insertIdx = remaining.findIndex(item => item.id === targetItem.id);
  if (insertIdx === -1) insertIdx = remaining.length;

  if (targetIdx > rEnd) {
    insertIdx += 1;
  }

  remaining.splice(insertIdx, 0, ...extracted);
  labelStore.labels = [...remaining];

  const newOrder = labelStore.labels.map(l => l.id);

  const newFiltered = filteredUnverifiedList.value;
  const newStartIdx = newFiltered.findIndex(i => i.id === extracted[0].id);
  let newSel = null;
  if (newStartIdx !== -1) {
    const newEndIdx = newStartIdx + extracted.length - 1;
    selectionStart.r = newStartIdx;
    selectionEnd.r = newEndIdx;
    selectionStart.c = 0;
    selectionEnd.c = columns.value.length - 1;
    newSel = { startR: newStartIdx, endR: newEndIdx };
  }

  recordRowReorder(`Move ${extracted.length} Baris`, oldOrder, newOrder, oldSel, newSel);
};

// UNDO & REDO ENGINE
const undoStack = ref([]);
const redoStack = ref([]);
const maxHistory = 50;

const recordHistory = (description, changes) => {
  if (!changes || changes.length === 0) return;
  undoStack.value.push({ type: 'cell', description, changes });
  if (undoStack.value.length > maxHistory) {
    undoStack.value.shift();
  }
  redoStack.value = [];
};

const recordRowReorder = (description, oldOrder, newOrder, oldSel, newSel) => {
  undoStack.value.push({
    type: 'reorder',
    description,
    oldOrder,
    newOrder,
    oldSel,
    newSel
  });
  if (undoStack.value.length > maxHistory) {
    undoStack.value.shift();
  }
  redoStack.value = [];
};

const handleUndo = async () => {
  if (undoStack.value.length === 0) return;
  const action = undoStack.value.pop();

  if (action.type === 'reorder') {
    const map = new Map(labelStore.labels.map(l => [l.id, l]));
    labelStore.labels = action.oldOrder.map(id => map.get(id)).filter(Boolean);
    if (action.oldSel) {
      selectionStart.r = action.oldSel.startR;
      selectionEnd.r = action.oldSel.endR;
      selectionStart.c = 0;
      selectionEnd.c = columns.value.length - 1;
    }
  } else {
    for (const ch of action.changes) {
      const item = labelStore.labels.find(l => l.id === ch.id);
      if (item) {
        item[ch.field] = ch.oldVal;
        await labelStore.updateLabelCell(ch.id, ch.field, ch.oldVal);
      }
    }
  }

  redoStack.value.push(action);
};

const handleRedo = async () => {
  if (redoStack.value.length === 0) return;
  const action = redoStack.value.pop();

  if (action.type === 'reorder') {
    const map = new Map(labelStore.labels.map(l => [l.id, l]));
    labelStore.labels = action.newOrder.map(id => map.get(id)).filter(Boolean);
    if (action.newSel) {
      selectionStart.r = action.newSel.startR;
      selectionEnd.r = action.newSel.endR;
      selectionStart.c = 0;
      selectionEnd.c = columns.value.length - 1;
    }
  } else {
    for (const ch of action.changes) {
      const item = labelStore.labels.find(l => l.id === ch.id);
      if (item) {
        item[ch.field] = ch.newVal;
        await labelStore.updateLabelCell(ch.id, ch.field, ch.newVal);
      }
    }
  }

  undoStack.value.push(action);
};

// CELL EDITING
const enterEditMode = (r, c, initialChar = null) => {
  if (isViewingVerifiedBatch.value) return; // Locked in verified batch mode
  const col = columns.value[c];
  if (!col || col.readonly) return;
  const item = paginatedSpreadsheetList.value[r];
  if (!item) return;

  editingCell.r = r;
  editingCell.c = c;
  if (initialChar !== null) {
    editInputValue.value = initialChar;
  } else if (col.key === 'shiftCombined') {
    editInputValue.value = getShiftCombined(item);
  } else {
    editInputValue.value = item[col.key] !== undefined ? String(item[col.key]) : '';
  }
};

const focusSpreadsheet = () => {
  nextTick(() => {
    spreadsheetContainer.value?.focus();
  });
};

const saveCellUpdate = async (item, field, val) => {
  item[field] = val;
  const targetId = item.originalId || (typeof item.id === 'string' && item.id.includes('_bahan') ? parseInt(item.id, 10) : item.id);

  let dbField = field;
  if (item.isBahanRow) {
    if (field === 'length') dbField = 'parentMeter';
    if (field === 'netto') dbField = 'parentBeratTeori';
    if (field === 'status') return;
  }
  if (item.isHasilRow) {
    if (field === 'lengthWaste') dbField = 'sisaMeter';
    if (field === 'weightWaste') dbField = 'wasteMetal';
  }

  if (item.sourceType === 'DATA_ROLL') {
    const id = item.originalDataRollId || targetId;
    if (id) {
      await db.data_rolls.update(id, { [dbField]: val, updatedAt: new Date().toISOString() });
    }
  } else if (targetId) {
    await labelStore.updateLabelCell(targetId, dbField, val);
  }
};

const commitCellEdit = async () => {
  if (editingCell.r === null || editingCell.c === null) return;
  if (isViewingVerifiedBatch.value) {
    editingCell.r = null;
    editingCell.c = null;
    return;
  }
  const r = editingCell.r;
  const c = editingCell.c;
  const item = paginatedSpreadsheetList.value[r];
  const col = columns.value[c];
  if (item && col && !col.readonly) {
    const oldVal = item[col.key] !== undefined ? item[col.key] : '';
    const newVal = String(editInputValue.value || '').trim();
    if (oldVal !== newVal) {
      if (col.key === 'shiftCombined') {
        const upper = newVal.toUpperCase();
        const codeMatch = upper.match(/^([A-Z]+)(\d+)/);
        if (codeMatch) {
          const opLetter = codeMatch[1];
          const shiftDigit = codeMatch[2];
          item.shiftCombined = `${opLetter}${shiftDigit}`;
          item.shift = shiftDigit;
          const matchedOp = configStore?.operatorList?.find(o => 
            (o.kodeOperator && o.kodeOperator.toUpperCase() === opLetter)
          );
          if (matchedOp && matchedOp.nama) {
            item.operator = matchedOp.nama;
            await saveCellUpdate(item, 'operator', matchedOp.nama);
          }
          await saveCellUpdate(item, 'shift', shiftDigit);
          await saveCellUpdate(item, 'shiftCombined', item.shiftCombined);
        } else if (/^\d+$/.test(upper)) {
          const opCode = getOperatorCode(item);
          item.shift = upper;
          item.shiftCombined = `${opCode}${upper}`;
          await saveCellUpdate(item, 'shift', upper);
          await saveCellUpdate(item, 'shiftCombined', item.shiftCombined);
        } else {
          item.shiftCombined = upper;
          await saveCellUpdate(item, 'shiftCombined', upper);
        }
        recordHistory(`Edit Cell ${col.letter}${r + 1}`, [
          { id: item.id, field: col.key, oldVal, newVal: item.shiftCombined }
        ]);
      } else {
        recordHistory(`Edit Cell ${col.letter}${r + 1}`, [
          { id: item.id, field: col.key, oldVal, newVal }
        ]);
        await saveCellUpdate(item, col.key, newVal);

        if (col.key === 'operator') {
          const newComb = getShiftCombined(item);
          item.shiftCombined = newComb;
          await saveCellUpdate(item, 'shiftCombined', newComb);
        }
      }
    }
  }
  editingCell.r = null;
  editingCell.c = null;
  focusSpreadsheet();
};

const cancelCellEdit = () => {
  editingCell.r = null;
  editingCell.c = null;
  focusSpreadsheet();
};

const commitEditAndMove = async (rowDelta, colDelta) => {
  await commitCellEdit();
  moveActiveCell(rowDelta, colDelta, false, false);
  focusSpreadsheet();
};

// NAVIGATION & FAST JUMP (CTRL + ARROWS)
const moveActiveCell = (rowDelta, colDelta, isShift = false, isJump = false) => {
  const maxR = Math.max(0, paginatedSpreadsheetList.value.length - 1);
  const maxC = columns.value.length - 1;

  let targetR = selectionStart.r;
  let targetC = selectionStart.c;

  if (isJump) {
    if (rowDelta < 0) targetR = 0;
    else if (rowDelta > 0) targetR = maxR;
    if (colDelta < 0) targetC = 0;
    else if (colDelta > 0) targetC = maxC;
  } else {
    targetR = Math.max(0, Math.min(maxR, selectionStart.r + rowDelta));
    targetC = Math.max(0, Math.min(maxC, selectionStart.c + colDelta));
  }

  if (isShift) {
    if (isJump) {
      if (rowDelta < 0) selectionEnd.r = 0;
      else if (rowDelta > 0) selectionEnd.r = maxR;
      if (colDelta < 0) selectionEnd.c = 0;
      else if (colDelta > 0) selectionEnd.c = maxC;
    } else {
      selectionEnd.r = Math.max(0, Math.min(maxR, selectionEnd.r + rowDelta));
      selectionEnd.c = Math.max(0, Math.min(maxC, selectionEnd.c + colDelta));
    }
  } else {
    selectionStart.r = targetR;
    selectionStart.c = targetC;
    selectionEnd.r = targetR;
    selectionEnd.c = targetC;
  }
  scrollActiveCellIntoView();
};

// TRUE EXCEL FILL DOWN (CTRL + D)
const handleFillDown = async () => {
  if (isViewingVerifiedBatch.value) return;
  const items = paginatedSpreadsheetList.value;
  if (!items.length) return;

  const minR = minRow.value;
  const maxR = maxRow.value;
  const minC = minCol.value;
  const maxC = maxCol.value;

  const changes = [];

  if (minR < maxR) {
    for (let c = minC; c <= maxC; c++) {
      const col = columns.value[c];
      if (!col || col.readonly) continue;
      const sourceVal = items[minR][col.key];

      for (let r = minR + 1; r <= maxR; r++) {
        const targetItem = items[r];
        if (targetItem) {
          const oldVal = targetItem[col.key] !== undefined ? targetItem[col.key] : '';
          if (oldVal !== sourceVal) {
            changes.push({ id: targetItem.id, field: col.key, oldVal, newVal: sourceVal });
            targetItem[col.key] = sourceVal;
            await saveCellUpdate(targetItem, col.key, sourceVal);
            if (col.key === 'shiftCombined') {
              const num = String(sourceVal).replace(/\D/g, '');
              if (num) {
                targetItem.shift = num;
                await saveCellUpdate(targetItem, 'shift', num);
              }
            }
          }
        }
      }
    }
  } else if (minR > 0) {
    for (let c = minC; c <= maxC; c++) {
      const col = columns.value[c];
      if (!col || col.readonly) continue;
      const sourceVal = items[minR - 1][col.key];
      const targetItem = items[minR];
      if (targetItem) {
        const oldVal = targetItem[col.key] !== undefined ? targetItem[col.key] : '';
        if (oldVal !== sourceVal) {
          changes.push({ id: targetItem.id, field: col.key, oldVal, newVal: sourceVal });
          targetItem[col.key] = sourceVal;
          await saveCellUpdate(targetItem, col.key, sourceVal);
          if (col.key === 'shiftCombined') {
            const num = String(sourceVal).replace(/\D/g, '');
            if (num) {
              targetItem.shift = num;
              await saveCellUpdate(targetItem, 'shift', num);
            }
          }
        }
      }
    }
  }

  if (changes.length > 0) {
    recordHistory('Fill Down (Ctrl+D)', changes);
  }
};

// TRUE EXCEL FILL RIGHT (CTRL + R)
const handleFillRight = async () => {
  if (isViewingVerifiedBatch.value) return;
  const items = paginatedSpreadsheetList.value;
  if (!items.length) return;

  const minR = minRow.value;
  const maxR = maxRow.value;
  const minC = minCol.value;
  const maxC = maxCol.value;

  const changes = [];

  if (minC < maxC) {
    for (let r = minR; r <= maxR; r++) {
      const targetItem = items[r];
      if (!targetItem) continue;
      const sourceCol = columns.value[minC];
      const sourceVal = targetItem[sourceCol.key] !== undefined ? targetItem[sourceCol.key] : '';

      for (let c = minC + 1; c <= maxC; c++) {
        const targetCol = columns.value[c];
        if (!targetCol || targetCol.readonly) continue;
        const oldVal = targetItem[targetCol.key] !== undefined ? targetItem[targetCol.key] : '';
        if (oldVal !== sourceVal) {
          changes.push({ id: targetItem.id, field: targetCol.key, oldVal, newVal: sourceVal });
          targetItem[targetCol.key] = sourceVal;
          await saveCellUpdate(targetItem, targetCol.key, sourceVal);
          if (targetCol.key === 'shiftCombined') {
            const num = String(sourceVal).replace(/\D/g, '');
            if (num) {
              targetItem.shift = num;
              await saveCellUpdate(targetItem, 'shift', num);
            }
          }
        }
      }
    }
  } else if (minC > 0) {
    // Single cell selected: copy from left column
    const sourceCol = columns.value[minC - 1];
    const targetCol = columns.value[minC];
    if (targetCol && !targetCol.readonly) {
      for (let r = minR; r <= maxR; r++) {
        const targetItem = items[r];
        if (!targetItem) continue;
        const sourceVal = targetItem[sourceCol.key] !== undefined ? targetItem[sourceCol.key] : '';
        const oldVal = targetItem[targetCol.key] !== undefined ? targetItem[targetCol.key] : '';
        if (oldVal !== sourceVal) {
          changes.push({ id: targetItem.id, field: targetCol.key, oldVal, newVal: sourceVal });
          targetItem[targetCol.key] = sourceVal;
          await saveCellUpdate(targetItem, targetCol.key, sourceVal);
        }
      }
    }
  }

  if (changes.length > 0) {
    recordHistory('Fill Right (Ctrl+R)', changes);
  }
};

// COPY SELECTED CELLS TO CLIPBOARD (EXCEL TSV)
const handleCopySelection = async () => {
  const items = paginatedSpreadsheetList.value;
  if (!items.length) return;

  const minR = minRow.value;
  const maxR = maxRow.value;
  const minC = minCol.value;
  const maxC = maxCol.value;

  const rows = [];
  for (let r = minR; r <= maxR; r++) {
    const item = items[r];
    if (!item) continue;
    const rowVals = [];
    for (let c = minC; c <= maxC; c++) {
      const col = columns.value[c];
      if (!col) continue;
      const val = formatCellValue(item[col.key], col.key, item, r);
      rowVals.push(val !== undefined && val !== null ? String(val) : '');
    }
    rows.push(rowVals.join('\t'));
  }

  const tsv = rows.join('\n');
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(tsv);
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = tsv;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  } catch (err) {
    console.error('Gagal copy clipboard:', err);
  }
};

// PASTE CLIPBOARD GRID INTO SPREADSHEET CELLS
const handlePasteSelection = async () => {
  if (isViewingVerifiedBatch.value) return;
  let clipboardText = '';
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      clipboardText = await navigator.clipboard.readText();
    }
  } catch (err) {
    console.warn('Clipboard read error:', err);
  }

  if (!clipboardText || !clipboardText.trim()) return;

  const items = paginatedSpreadsheetList.value;
  if (!items.length) return;

  const rawLines = clipboardText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const pasteGrid = rawLines.filter(l => l.length > 0).map(l => l.split('\t'));
  if (pasteGrid.length === 0) return;

  const startR = selectionStart.r;
  const startC = selectionStart.c;
  const minR = minRow.value;
  const maxR = maxRow.value;
  const minC = minCol.value;
  const maxC = maxCol.value;

  const changes = [];

  // Case A: Single cell in clipboard, multi-cell selected in grid (Fill selection)
  if (pasteGrid.length === 1 && pasteGrid[0].length === 1 && (minR < maxR || minC < maxC)) {
    const pasteVal = cleanCell(pasteGrid[0][0]);
    for (let r = minR; r <= maxR; r++) {
      const targetItem = items[r];
      if (!targetItem) continue;
      for (let c = minC; c <= maxC; c++) {
        const targetCol = columns.value[c];
        if (!targetCol || targetCol.readonly) continue;
        const oldVal = targetItem[targetCol.key] !== undefined ? targetItem[targetCol.key] : '';
        if (oldVal !== pasteVal) {
          changes.push({ id: targetItem.id, field: targetCol.key, oldVal, newVal: pasteVal });
          targetItem[targetCol.key] = pasteVal;
          await saveCellUpdate(targetItem, targetCol.key, pasteVal);
          if (targetCol.key === 'shiftCombined') {
            const shiftNum = pasteVal.replace(/\D/g, '');
            if (shiftNum) {
              targetItem.shift = shiftNum;
              await saveCellUpdate(targetItem, 'shift', shiftNum);
            }
          }
        }
      }
    }
  } else {
    // Case B: Grid paste starting at startR, startC
    for (let rOffset = 0; rOffset < pasteGrid.length; rOffset++) {
      const r = startR + rOffset;
      if (r >= items.length) break;
      const targetItem = items[r];
      if (!targetItem) continue;

      const rowCells = pasteGrid[rOffset];
      for (let cOffset = 0; cOffset < rowCells.length; cOffset++) {
        const c = startC + cOffset;
        if (c >= columns.value.length) break;
        const targetCol = columns.value[c];
        if (!targetCol || targetCol.readonly) continue;

        const pasteVal = cleanCell(rowCells[cOffset]);
        const oldVal = targetItem[targetCol.key] !== undefined ? targetItem[targetCol.key] : '';
        if (oldVal !== pasteVal) {
          changes.push({ id: targetItem.id, field: targetCol.key, oldVal, newVal: pasteVal });
          targetItem[targetCol.key] = pasteVal;
          await saveCellUpdate(targetItem, targetCol.key, pasteVal);
          if (targetCol.key === 'shiftCombined') {
            const shiftNum = pasteVal.replace(/\D/g, '');
            if (shiftNum) {
              targetItem.shift = shiftNum;
              await saveCellUpdate(targetItem, 'shift', shiftNum);
            }
          }
        }
      }
    }
  }

  if (changes.length > 0) {
    recordHistory('Paste Cells (Ctrl+V)', changes);
  }
};

// CLEAR SELECTED CELLS (DELETE / BACKSPACE)
const clearSelectedCells = async () => {
  if (isViewingVerifiedBatch.value) return;
  const items = paginatedSpreadsheetList.value;
  if (!items.length) return;
  const minR = minRow.value;
  const maxR = maxRow.value;
  const minC = minCol.value;
  const maxC = maxCol.value;
  const changes = [];
  for (let r = minR; r <= maxR; r++) {
    const item = items[r];
    if (!item) continue;
    for (let c = minC; c <= maxC; c++) {
      const col = columns.value[c];
      if (!col || col.readonly) continue;
      const oldVal = item[col.key] !== undefined ? item[col.key] : '';
      if (oldVal !== '') {
        changes.push({ id: item.id, field: col.key, oldVal, newVal: '' });
        item[col.key] = '';
        await saveCellUpdate(item, col.key, '');
      }
    }
  }
  if (changes.length > 0) {
    recordHistory('Clear Cells (Delete)', changes);
  }
};

// KEYBOARD DISPATCHER
const handleSpreadsheetKeydown = async (e) => {
  if (activeTab.value !== 'verifikasi') return;

  // Ignore keystrokes if focused inside a modal or external form input
  const targetTag = e.target?.tagName;
  const isTargetInCell = e.target?.classList?.contains('absolute') || e.target?.closest?.('.excel-table');
  if ((targetTag === 'INPUT' || targetTag === 'TEXTAREA' || targetTag === 'SELECT') && !isTargetInCell) {
    return;
  }

  // Undo (Ctrl+Z)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'z' || e.key === 'Z') && !e.shiftKey) {
    e.preventDefault();
    await handleUndo();
    return;
  }

  // Redo (Ctrl+Y or Ctrl+Shift+Z)
  if (((e.ctrlKey || e.metaKey) && (e.key === 'y' || e.key === 'Y')) ||
      ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z'))) {
    e.preventDefault();
    await handleRedo();
    return;
  }

  // Fill Down (Ctrl+D)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault();
    await handleFillDown();
    return;
  }

  // Fill Right (Ctrl+R)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R')) {
    e.preventDefault();
    await handleFillRight();
    return;
  }

  // Copy (Ctrl+C)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'c' || e.key === 'C') && editingCell.r === null) {
    e.preventDefault();
    await handleCopySelection();
    return;
  }

  // Paste (Ctrl+V)
  if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V') && editingCell.r === null) {
    e.preventDefault();
    await handlePasteSelection();
    return;
  }

  if (editingCell.r !== null && editingCell.c !== null) {
    return;
  }

  const isCtrl = e.ctrlKey || e.metaKey;
  const isShift = e.shiftKey;

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    moveActiveCell(-1, 0, isShift, isCtrl);
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    moveActiveCell(1, 0, isShift, isCtrl);
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    moveActiveCell(0, -1, isShift, isCtrl);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    moveActiveCell(0, 1, isShift, isCtrl);
  } else if (e.key === 'Tab') {
    e.preventDefault();
    moveActiveCell(0, isShift ? -1 : 1, false, false);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    enterEditMode(selectionStart.r, selectionStart.c);
  } else if (e.key === 'F2') {
    e.preventDefault();
    enterEditMode(selectionStart.r, selectionStart.c);
  } else if (e.key === 'Delete' || e.key === 'Backspace') {
    e.preventDefault();
    await clearSelectedCells();
  } else if (!isCtrl && !e.altKey && e.key.length === 1) {
    const col = columns.value[selectionStart.c];
    if (col && !col.readonly) {
      e.preventDefault();
      enterEditMode(selectionStart.r, selectionStart.c, e.key);
    }
  }
};

// APPROVE ACTIONS
const approveSingle = async (item) => {
  const targetId = item.originalId || (typeof item.id === 'string' && item.id.includes('_bahan') ? parseInt(item.id, 10) : item.id);
  if (targetId) await labelStore.verifyLabels([targetId]);
};

const approveSelectedRange = async () => {
  const items = paginatedSpreadsheetList.value;
  if (!items.length) return;

  const idsToApprove = [];
  for (let r = minRow.value; r <= maxRow.value; r++) {
    const it = items[r];
    if (it) {
      const targetId = it.originalId || (typeof it.id === 'string' && it.id.includes('_bahan') ? parseInt(it.id, 10) : it.id);
      if (targetId) idsToApprove.push(targetId);
    }
  }

  const uniqueIds = [...new Set(idsToApprove)];
  if (uniqueIds.length > 0) {
    await labelStore.verifyLabels(uniqueIds);
  }
};

const approveAll = async () => {
  const ids = filteredUnverifiedList.value.map(i => i.id);
  if (ids.length === 0) return;
  if (confirm(`Approve seluruh ${ids.length} data label ke Tabel Report?`)) {
    await labelStore.verifyLabels(ids);
  }
};

const unverifySingle = async (item) => {
  if (confirm(`Batalkan status approve untuk Lot ${item.lot}? Data akan kembali ke Sheet Verifikasi.`)) {
    if (item.sourceType === 'DATA_ROLL') {
      const id = item.originalDataRollId || item.id;
      if (id) {
        await db.data_rolls.update(id, { verified: 0, verifiedAt: null, verifiedBy: null });
        await dataRollStore.loadRolls();
      }
    } else {
      await labelStore.unverifyLabels(item.id);
    }
  }
};

// ADD BLANK ROW
const addNewBlankRow = async () => {
  if (isViewingVerifiedBatch.value) return;
  const targetDate = selectedDate.value !== 'ALL' ? selectedDate.value : new Date().toISOString().slice(0, 10);
  const targetMachine = selectedMachine.value !== 'ALL' ? selectedMachine.value : (isRewindSession.value ? 'REWIND' : 'SLITTING');

  const newRecord = {
    tanggal: targetDate,
    mesin: targetMachine,
    operator: '',
    shift: '1',
    shiftCombined: 'G1',
    spk: '',
    lot: '',
    jenis: 'VMCPP',
    type: 'METALIZED',
    kode: 'M06',
    thickness: '',
    parentWidth: '',
    parentMeter: '',
    parentBeratTeori: '',
    width: '',
    length: '',
    netto: '',
    childBeratTeori: '',
    selisihBerat: '',
    paperCore: '6"',
    od: '',
    turunan: '',
    packing: '',
    keteranganBahan: '',
    keterangan: '',
    status: 'PASS',
    reasonDefect: '',
    gradeSisa: '',
    sisaMeter: '',
    keteranganSisa: '',
    wastePolos: '',
    wasteMetal: '',
    keteranganWaste: '',
    noteOperator: '',
    kodePack: '',
    subKode: '',
    verified: 0
  };
  await labelStore.addLabel(newRecord);
};

const refreshData = async () => {
  await labelStore.loadLabels();
};

// ----------------------------------------------------
// SMART FORWARD-FILL PARSER & IMPORT MODAL (KHUSUS SLITTING)
// ----------------------------------------------------
const showImportModal = ref(false);
const pasteRawText = ref('');
const parsedImportRows = ref([]);

watch(pasteRawText, () => {
  parsePastedText();
});

const parsedParentCount = computed(() => {
  if (!parsedImportRows.value || !parsedImportRows.value.length) return 0;
  const set = new Set(parsedImportRows.value.map(r => r.lot).filter(Boolean));
  return set.size;
});

const parsedTotalWaste = computed(() => {
  if (!parsedImportRows.value || !parsedImportRows.value.length) return 0;
  return parsedImportRows.value.reduce((sum, r) => {
    const p = parseFloat(String(r.wastePolos || '').replace(',', '.')) || 0;
    const m = parseFloat(String(r.wasteMetal || '').replace(',', '.')) || 0;
    return sum + p + m;
  }, 0);
});

// Helper: Clean cell text from Excel clipboard wrapping
const cleanCell = (str) => {
  if (str === undefined || str === null) return '';
  let s = String(str).trim();
  if (s.startsWith('"') && s.endsWith('"')) {
    s = s.slice(1, -1).trim();
  }
  return s;
};

// Helper: Safe number parser (handles "125,50" -> 125.5)
const parseNumSafe = (val, fallback = 0) => {
  if (val === undefined || val === null || val === '') return fallback;
  const s = String(val).replace(/,/g, '.').replace(/[^\d.-]/g, '');
  const num = parseFloat(s);
  return isNaN(num) ? fallback : num;
};

// Helper: Handle clipboard paste button
const handlePasteFromClipboard = async () => {
  try {
    if (navigator.clipboard && navigator.clipboard.readText) {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        pasteRawText.value = text;
        parsePastedText();
        return;
      }
    }
  } catch (err) {
    // Clipboard permission denied or browser restricted
  }
  alert('Silakan klik di kotak teks lalu tekan tombol keyboard Ctrl + V untuk menempelkan data.');
};

const onPasteEvent = () => {
  setTimeout(() => {
    parsePastedText();
  }, 50);
};

const clearPasteText = () => {
  pasteRawText.value = '';
  parsedImportRows.value = [];
};

// Parser for pasted text from Excel (Ctrl + V)
const parsePastedText = () => {
  if (!pasteRawText.value || !pasteRawText.value.trim()) {
    parsedImportRows.value = [];
    return;
  }

  const raw = pasteRawText.value.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const lines = raw.split('\n');
  const rows = [];

  let curShift = {
    tanggal: new Date().toISOString().slice(0, 10),
    operator: 'UMAR',
    shift: '1',
    shiftCombined: 'G1',
    spk: ''
  };

  let curParent = {
    lot: '',
    jenis: 'VMCPP',
    kode: 'M06',
    thickness: '20',
    parentWidth: '2165',
    parentMeter: '26000',
    parentBeratTeori: '1100',
    keteranganBahan: ''
  };

  let curRewindBahan = null;

  for (const rawLine of lines) {
    if (!rawLine || !rawLine.trim()) continue;

    // Detect column delimiter (Tab or Semicolon or Comma or Multiple Spaces)
    let cols = [];
    if (rawLine.includes('\t')) {
      cols = rawLine.split('\t').map(cleanCell);
    } else if (rawLine.includes(';')) {
      cols = rawLine.split(';').map(cleanCell);
    } else if (rawLine.includes(',')) {
      cols = rawLine.split(',').map(cleanCell);
    } else if (/\s{2,}/.test(rawLine.trim())) {
      cols = rawLine.trim().split(/\s{2,}/).map(cleanCell);
    } else {
      cols = [cleanCell(rawLine.trim())];
    }

    if (cols.length === 0) continue;

    // Check if line is a table header row (contains 2 or more header keywords)
    const combinedLower = cols.join(' ').toLowerCase();
    const isHeader = (
      (combinedLower.includes('tanggal') && (combinedLower.includes('operator') || combinedLower.includes('shift') || combinedLower.includes('spk') || combinedLower.includes('proses'))) ||
      (combinedLower.includes('jenis proses')) ||
      (combinedLower.includes('parent lot') || combinedLower.includes('no. lot') || combinedLower.includes('nomor lot') || combinedLower.includes('lot akhir') || combinedLower.includes('kode pack')) ||
      (combinedLower.includes('lebar') && combinedLower.includes('panjang')) ||
      (combinedLower.includes('berat aktual') || combinedLower.includes('berat netto') || combinedLower.includes('netto (kg)'))
    );
    if (isHeader) {
      continue;
    }

    // Strip leading row sequence number if present (e.g., column # is 1, 2, 3...)
    if (cols.length >= 4 && /^\d{1,4}$/.test(cols[0]) && (!cols[0].includes('-') && !cols[0].includes('/') && !cols[0].includes('M'))) {
      if (cols[1] && (cols[1].includes('-') || cols[1].includes('/') || cols[1].length >= 3)) {
        cols = cols.slice(1);
      }
    }

    // Handle FORMAT REWIND (23 Kolom: Tanggal, Grup Shift, Jenis Proses [BAHAN/HASIL], SPK, Lot, ...)
    const c2Upper = (cols[2] || '').toUpperCase().trim();
    const c1Upper = (cols[1] || '').toUpperCase().trim();
    const isRewindFormat = (c2Upper === 'BAHAN' || c2Upper === 'HASIL' || c1Upper === 'BAHAN' || c1Upper === 'HASIL');

    if (isRewindFormat) {
      const offset = (c1Upper === 'BAHAN' || c1Upper === 'HASIL') ? -1 : 0;
      const tglRaw = offset === 0 ? cols[0] : '';
      const shiftCombinedRaw = offset === 0 ? cols[1] : '';
      const jenisProses = (cols[2 + offset] || '').toUpperCase().trim();
      const spk = cols[3 + offset] || '';
      const lot = cols[4 + offset] || '';
      const jenis = cols[5 + offset] || 'VMCPP';
      const kode = cols[6 + offset] || 'M06';
      const thickness = cols[7 + offset] || '';
      const width = cols[8 + offset] || '';
      const length = cols[9 + offset] || '';
      const weight = cols[10 + offset] || '';
      const turunan = cols[11 + offset] || '';
      const pack = cols[12 + offset] || '';
      const statusRaw = cols[13 + offset] || (jenisProses === 'BAHAN' ? 'SORTIR' : 'PASS');
      const reasonDefect = cols[14 + offset] || '';
      const keteranganBahan = cols[15 + offset] || '';
      const keteranganHasil = cols[16 + offset] || '';
      const lengthWaste = cols[17 + offset] || '';
      const weightWaste = cols[18 + offset] || '';
      const core = cols[19 + offset] || '6';
      const od = cols[22 + offset] || 'OD2.4+PLASMA';

      if (tglRaw) curShift.tanggal = parseDateToIso(tglRaw);
      if (shiftCombinedRaw) curShift.shiftCombined = shiftCombinedRaw;

      if (jenisProses === 'BAHAN') {
        curRewindBahan = {
          tanggal: curShift.tanggal,
          shiftCombined: curShift.shiftCombined,
          spk,
          lot,
          jenis,
          kode,
          thickness,
          width,
          length,
          weight,
          core,
          od,
          status: statusRaw,
          keteranganBahan
        };
        continue;
      } else if (jenisProses === 'HASIL') {
        const finalTanggal = parseDateToIso(tglRaw || curRewindBahan?.tanggal || curShift.tanggal);
        const finalShift = shiftCombinedRaw || curRewindBahan?.shiftCombined || curShift.shiftCombined;
        const finalLot = lot || curRewindBahan?.lot || '';
        const finalSpk = spk || curRewindBahan?.spk || curShift.spk;
        const finalJenis = jenis || curRewindBahan?.jenis || 'VMCPP';
        const finalKode = kode || curRewindBahan?.kode || 'M06';
        const finalThick = thickness || curRewindBahan?.thickness || '';
        const parentW = curRewindBahan ? curRewindBahan.width : width;
        const parentMeter = curRewindBahan ? curRewindBahan.length : '';
        const parentBerat = curRewindBahan ? curRewindBahan.weight : '';

        const stUpper = statusRaw.toUpperCase();
        const finalStatus = stUpper.includes('REJECT') ? 'REJECT' : (stUpper.includes('HOLD') ? 'HOLD' : 'PASS');

        rows.push({
          tanggal: finalTanggal,
          operator: curShift.operator || '',
          shift: finalShift.replace(/\D/g, '') || '1',
          shiftCombined: finalShift,
          spk: finalSpk,
          lot: finalLot,
          jenis: finalJenis,
          kode: finalKode,
          thickness: finalThick,
          parentWidth: parentW,
          parentMeter: parentMeter,
          parentBeratTeori: parentBerat,
          width: width,
          length: length,
          netto: weight,
          childBeratTeori: '',
          selisihBerat: '',
          paperCore: core ? `${core}"` : '6"',
          od: od || curRewindBahan?.od || 'OD2.4+PLASMA',
          turunan: turunan,
          packing: pack ? (parseInt(pack, 10) || '') : '',
          keteranganBahan: keteranganBahan || curRewindBahan?.keteranganBahan || '',
          keterangan: keteranganHasil,
          status: finalStatus,
          reasonDefect: reasonDefect,
          gradeSisa: '',
          sisaMeter: lengthWaste,
          wasteMetal: weightWaste,
          wastePolos: '',
          keteranganWaste: '',
          noteOperator: '',
          mesin: 'REWIND',
          kodePack: '',
          subKode: pack ? String(pack).padStart(4, '0') : '',
          verified: 1
        });
        continue;
      }
    }

    // Handle FORMAT A: 3 to 8 Columns (e.g. Lot Akhir, Kode Pack, Tanggal or standard Data Roll)
    if (cols.length <= 8 && cols[0] && (cols[0].includes('/') || cols[0].startsWith('M') || cols[0].startsWith('L') || cols[0].length >= 8)) {
      const parsed = parseDataRollRow(cols);
      if (parsed) {
        const status = parsed.qualityStatus || (parsed.subKode === '0000' || parsed.subKode === '0' ? 'HOLD' : 'PASS');
        rows.push({
          tanggal: parsed.tanggalFormatted || parseDateToIso(cols[2] || curShift.tanggal || new Date().toISOString().slice(0, 10)),
          operator: curShift.operator || parsed.kodeOperator || '',
          shift: curShift.shift || parsed.shift || '1',
          shiftCombined: curShift.shiftCombined || (parsed.kodeOperator ? `${parsed.kodeOperator}${parsed.shift || '1'}` : 'G1'),
          spk: parsed.spk || curShift.spk || '',
          lot: parsed.lot || parsed.fullLot || cols[0].trim(),
          jenis: parsed.jenis || 'VMCPP',
          kode: parsed.kodeFormula || 'M07',
          thickness: parsed.thickness || '',
          parentWidth: '',
          parentMeter: '',
          parentBeratTeori: '',
          width: parsed.width || '',
          length: parsed.length || '',
          netto: '',
          childBeratTeori: '',
          selisihBerat: '',
          paperCore: parsed.core ? `${parsed.core}"` : '6"',
          od: parsed.od || '',
          turunan: parsed.turunan || '',
          packing: parsed.subKode ? (parseInt(parsed.subKode, 10) || '') : '',
          keteranganBahan: '',
          keterangan: status === 'HOLD' ? (parsed.reasonDefect || 'Hold') : '',
          status,
          reasonDefect: parsed.reasonDefect || (status === 'HOLD' ? 'Non-standard pack' : ''),
          gradeSisa: '',
          sisaMeter: '',
          keteranganSisa: '',
          wastePolos: '',
          wasteMetal: '',
          keteranganWaste: '',
          noteOperator: '',
          mesin: parsed.machineName || 'SLITTING',
          kodePack: parsed.kodePack || '',
          subKode: parsed.subKode || '',
          verified: 1
        });
        continue;
      }
    }

    // If still less than 2 columns, skip
    if (cols.length < 2) continue;

    // 1. Shift & Operator Context Forward-Fill
    if (cols[0] && cols[0].trim()) curShift.tanggal = parseDateToIso(cols[0].trim());
    if (cols[1] && cols[1].trim()) curShift.operator = cols[1].trim();
    if (cols[2] && cols[2].trim()) {
      const shiftRaw = cols[2].trim().toUpperCase();
      const codeMatch = shiftRaw.match(/^([A-Z]+)(\d+)/);
      if (codeMatch) {
        curShift.shiftCombined = `${codeMatch[1]}${codeMatch[2]}`;
        curShift.shift = codeMatch[2];
      } else {
        const shiftNum = shiftRaw.replace(/\D/g, '') || '1';
        curShift.shift = shiftNum;
        const tempItem = { operator: curShift.operator, shift: shiftNum };
        curShift.shiftCombined = getShiftCombined(tempItem);
      }
    } else if (cols[1] && cols[1].trim()) {
      const tempItem = { operator: curShift.operator, shift: curShift.shift };
      curShift.shiftCombined = getShiftCombined(tempItem);
    }
    if (cols[3] && cols[3].trim()) curShift.spk = cols[3].trim();

    // 2. Parent Context Forward-Fill (Triggers on new Lot No)
    if (cols[4] && cols[4].trim()) {
      curParent.lot = cols[4].trim();
      if (cols[5]) curParent.jenis = cols[5].trim();
      if (cols[6]) curParent.kode = cols[6].trim();
      if (cols[7]) curParent.thickness = cols[7].trim();
      if (cols[8]) curParent.parentWidth = cols[8].trim();
      if (cols[9]) curParent.parentMeter = cols[9].trim();
      if (cols[10]) curParent.parentBeratTeori = cols[10].trim();
    }

    // 3. Child Output Columns
    const parentWidth = cols[8] || curParent.parentWidth || '';
    const width = cols[11] || '';
    const length = cols[12] || '';
    const netto = cols[13] || '';
    const paperCore = cols[16] ? (cols[16].includes('3') ? '3"' : '6"') : '6"';
    const od = cols[17] || '';
    const turunan = cols[18] || '';
    const packingRaw = cols[19] || '';
    const packing = packingRaw ? String(parseInt(packingRaw, 10) || '') : '';
    const keteranganBahan = cols[20] || curParent.keteranganBahan || '';
    const keterangan = cols[21] || ''; // Ket Hasil per roll

    // 4. Quality Control & Reason Defect
    const statusRaw = String(cols[22] || 'PASS').toUpperCase();
    const status = statusRaw.includes('HOLD') ? 'HOLD' : (statusRaw.includes('REJECT') ? 'REJECT' : 'PASS');
    let reasonDefect = cols[23] || '';
    if ((status === 'HOLD' || status === 'REJECT') && !reasonDefect) {
      reasonDefect = keterangan; // Auto switch dari Ket Hasil
    }

    // 5. Jumbo Sisa
    const gradeSisa = cols[24] || '';
    const sisaMeter = cols[25] || '';
    const keteranganSisa = cols[26] || '';

    // 6. Waste Shift (Polos & Metal in kg)
    const wastePolos = cols[27] || '';
    const wasteMetal = cols[28] || '';
    const keteranganWaste = cols[29] || '';
    const noteOperator = cols[30] || '';

    // Calculate Child Teori & Selisih
    const density = getDensity(curParent.jenis, curParent.kode);
    const thickNum = parseNumSafe(curParent.thickness, 0);
    const widthNum = parseNumSafe(width, 0);
    const lenNum = parseNumSafe(length, 0);
    const nettoNum = parseNumSafe(netto, 0);

    const childBeratTeori = (thickNum > 0 && widthNum > 0 && lenNum > 0)
      ? ((thickNum * widthNum * lenNum * density) / 1000000).toFixed(2)
      : '';
    const childTeoriNum = parseFloat(childBeratTeori) || 0;
    const selisihBerat = (nettoNum > 0 && childTeoriNum > 0)
      ? (nettoNum - childTeoriNum).toFixed(2)
      : '';

    // Discard empty/ghost child rows
    if (!width && !length && !turunan && !netto && !cols[4]) {
      continue;
    }
    if (widthNum === 0 && lenNum === 0 && !turunan && !netto && !cols[4]) {
      continue;
    }

    rows.push({
      tanggal: curShift.tanggal || new Date().toISOString().slice(0, 10),
      operator: curShift.operator || '',
      shift: curShift.shift || '1',
      shiftCombined: curShift.shiftCombined || 'G1',
      spk: curShift.spk || '',
      lot: curParent.lot || '',
      jenis: curParent.jenis || 'VMCPP',
      kode: curParent.kode || 'M06',
      thickness: curParent.thickness || '',
      parentWidth: parentWidth,
      parentMeter: curParent.parentMeter || '',
      parentBeratTeori: curParent.parentBeratTeori || '',
      width,
      length,
      netto,
      childBeratTeori,
      selisihBerat,
      paperCore,
      od,
      turunan,
      packing,
      keteranganBahan,
      keterangan,
      status,
      reasonDefect,
      gradeSisa,
      sisaMeter,
      keteranganSisa,
      wastePolos,
      wasteMetal,
      keteranganWaste,
      noteOperator,
      mesin: 'SLITTING',
      kodePack: '',
      subKode: packing ? String(packing).padStart(4, '0') : '',
      verified: 1
    });
  }

  parsedImportRows.value = rows;
};

// Handle File Upload (.xlsx)
const handleFileUpload = (e) => {
  const file = e.target?.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawText = XLSX.utils.sheet_to_csv(worksheet, { FS: '\t' });
      pasteRawText.value = rawText;
      parsePastedText();
    } catch (err) {
      alert('Gagal membaca file Excel: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
};

// Commit parsed items to labelStore & auto-record as verified batch
const commitImportedRows = async () => {
  if (!parsedImportRows.value || parsedImportRows.value.length === 0) return;

  try {
    const now = new Date().toISOString();
    const recordsToInsert = parsedImportRows.value.map(row => ({
      ...row,
      uniqId: generateUniqID('LBL'),
      verified: 1,
      verifiedAt: now,
      verifiedBy: 'Import Excel',
      synced: 0,
      createdAt: now,
      updatedAt: now
    }));

    await db.labels.bulkAdd(recordsToInsert);
    await labelStore.loadLabels();

    const firstDate = recordsToInsert[0].tanggal || now.slice(0, 10);
    const firstMesin = (recordsToInsert[0].mesin || 'SLITTING').toUpperCase();
    const totalRolls = recordsToInsert.length;
    const totalKg = parseFloat(recordsToInsert.reduce((sum, r) => sum + (parseFloat(r.netto || r.berat || 0) || 0), 0).toFixed(2));
    const passCount = recordsToInsert.filter(r => (r.status || 'PASS').toUpperCase() === 'PASS').length;
    const holdCount = recordsToInsert.filter(r => (r.status || '').toUpperCase() === 'HOLD').length;
    const rejectCount = recordsToInsert.filter(r => (r.status || '').toUpperCase() === 'REJECT').length;

    const batchKey = `import_${firstDate}_${firstMesin}_${Date.now()}`;
    const newBatch = {
      uuid: batchKey,
      uploadDate: now,
      batchName: `Import Excel - ${firstDate} (${firstMesin})`,
      source: 'Import Excel Data Roll',
      fileName: `Import_${firstMesin}_${firstDate}.xlsx`,
      machine: firstMesin,
      tanggal: firstDate,
      totalRolls,
      totalKg,
      passCount,
      holdCount,
      rejectCount,
      uploadedBy: 'Import Excel',
      status: 'VERIFIED',
      verifiedAt: now,
      verifiedBy: 'Import Excel',
      rollsJson: JSON.stringify(recordsToInsert),
      createdAt: now,
      updatedAt: now
    };

    if (db.data_roll_uploads) {
      await db.data_roll_uploads.add(newBatch);
    }
    await dataRollStore.syncVerifiedDeBatches();
    await dataRollStore.loadUploadHistory();

    showImportModal.value = false;
    pasteRawText.value = '';
    parsedImportRows.value = [];

    // Directly open the imported verified batch in the Excel spreadsheet view!
    openBatchDetail(newBatch);
    alert(`Berhasil mengimpor ${recordsToInsert.length} roll. Data otomatis berstatus TERVERIFIKASI dan tersimpan dalam Batch Arsip.`);
  } catch (err) {
    console.error('Failed to commit imported rows:', err);
    alert('Terjadi kesalahan saat menyimpan data impor: ' + err.message);
  }
};

// DOWNLOAD TEMPLATE EXCEL (SLITTING VS REWIND)
const downloadSlittingTemplate = () => {
  if (isRewindSession.value) {
    const rewindHeaders = [
      [
        'Tanggal', 'Grup Shift', 'Jenis Proses', 'No SPK', 'No Lot', 'Jenis', 'Kode Formula', 'Thickness', 'Width', 'Length', 'Weight',
        'Turunan', 'Pack', 'Quality Status', 'Reason Of Deffect', 'Keterangan Bahan', 'Keterangan Hasil', 'Length Waste', 'Weight Waste',
        'Core', 'Tanda', 'Bahan', 'Input Atribut metalize'
      ],
      // Row 1: BAHAN (Input Roll, Status SORTIR)
      [
        '05 Januari 2026', 'K2', 'BAHAN', '04/XII/SPK/2025', 'M06211225C111/D1/05/GA06', 'VMCPP', 'M06', 35, 940, 11500, 338,
        '', '', 'SORTIR', '', '', '', '', '',
        6, '', '', 'OD2.4+PLASMA'
      ],
      // Row 2: HASIL (Output FG PASS, Turunan K201, Pack 0001, Waste 500m/10kg)
      [
        '05 Januari 2026', 'K2', 'HASIL', '04/XII/SPK/2025', 'M06211225C111/D1/05/GA06', 'VMCPP', 'M06', 35, 940, 11000, 328,
        'K201', '0001', 'PASS', '', '', '', 500, 10,
        6, '', '', 'OD2.4+PLASMA'
      ],
      // Row 3: BAHAN (Input Roll, Status SORTIR JOIN)
      [
        '05 Januari 2026', 'K2', 'BAHAN', '04/XII/SPK/2025', 'M06211225C108/D1/06/GA04', 'VMCPP', 'M06', 35, 940, 10600, 313,
        '', '', 'SORTIR JOIN', '', '', '', '', '',
        6, '', '', 'OD2.4+PLASMA'
      ],
      // Row 4: HASIL (Output REJECT, Reason: EX SORTIR LAP LAP BELANG)
      [
        '05 Januari 2026', 'K2', 'HASIL', '04/XII/SPK/2025', 'M06211225C108/D1/06/GA04', 'VMCPP', 'M06', 35, 940, 8530, 254,
        'K202', '', 'REJECT', 'EX SORTIR LAP LAP BELANG', '', '', 2070, 59,
        6, '', '', 'OD2.4+PLASMA'
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(rewindHeaders);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DE Report Rewind');
    XLSX.writeFile(wb, 'Template_DE_Report_Rewind.xlsx');
    return;
  }

  const headers = [
    [
      'Tanggal', 'Operator', 'Shift', 'SPK', 'Lot No.', 'Jenis', 'Kode Formula', 'Thickness', 'Lebar Bahan', 'Panjang Bahan', 'Berat Bahan',
      'Lebar Hasil', 'Panjang Hasil', 'Berat Aktual', 'Berat Teori', 'Selisih', 'Core Roll', 'OD / Treatment', 'Turunan', 'Packing', 'Keterangan Bahan', 'Keterangan Hasil',
      'Quality Status', 'Reason Of Defect',
      'Grade', 'Panjang Sisa (m)', 'Keterangan Sisa',
      'Waste Polos (kg)', 'Waste Metal (kg)', 'Keterangan Waste', 'Note Operator'
    ],
    // Baris 1 (Parent Baris Pertama): No Lot, Panjang Bahan, Berat Bahan terisi
    [
      '03 Januari 2026', 'UMAR', 'G1', '507358/SPK/2026', 'M0401032100470/01', 'VMCPP', 'M06', 20, 2165, 26000, 1100,
      1060, 6500, 125.0, 125.57, -0.57, 6, 'OD2.4+PLASMA', 'A01', 25, '', '',
      'PASS', '',
      '', '', '',
      '', '', '', ''
    ],
    // Baris 2 (Child ke-2): No Lot, Panjang & Berat Kosong, Lebar Bahan tetap 2165
    [
      '03 Januari 2026', 'UMAR', 'G1', '507358/SPK/2026', '', 'VMCPP', 'M06', 20, 2165, '', '',
      1060, 6500, 126.8, 125.57, 1.23, 6, 'OD2.4+PLASMA', 'A02', 26, '', '',
      'PASS', '',
      '', '', '',
      '', '', '', ''
    ],
    // Baris 3 (Child ke-3)
    [
      '03 Januari 2026', 'UMAR', 'G1', '507358/SPK/2026', '', 'VMCPP', 'M06', 20, 2165, '', '',
      1060, 6500, 127.5, 125.57, 1.93, 6, 'OD2.4+PLASMA', 'B01', 27, '', '',
      'PASS', '',
      '', '', '',
      '', '', '', ''
    ],
    // Baris 4 (Child ke-4): Sisa Jumbo Grade B-GRADE & Waste Shift terisi 1x di shift ini
    [
      '03 Januari 2026', 'UMAR', 'G1', '507358/SPK/2026', '', 'VMCPP', 'M06', 20, 2165, '', '',
      1060, 6500, 125.8, 125.57, 0.23, 6, 'OD2.4+PLASMA', 'B02', 28, '', 'TEBAL KULIT',
      'HOLD', 'TEBAL KULIT',
      'B-GRADE', 500, 'SISA UNTUK SPK BERIKUTNYA',
      48, 120, 'TRIM + SETTING', 'MESIN ERROR 1X'
    ]
  ];

  const ws = XLSX.utils.aoa_to_sheet(headers);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'DE Report Slitting');
  XLSX.writeFile(wb, 'Template_DE_Report_Slitting.xlsx');
};

// EXPORT VERIFICATION SPREADSHEET TO EXCEL TABLE (Ctrl+T) WITH GROUP COLORS
const exportVerificationExcel = async () => {
  const items = activeSpreadsheetList.value;
  if (!items || items.length === 0) {
    alert('Tidak ada data pada lembar verifikasi untuk diekspor.');
    return;
  }

  const isRewind = isRewindSession.value;
  const currentCols = columns.value;

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'M-Label PT Saptawarna Cemerlang';
  workbook.created = new Date();

  const sheetName = isRewind
    ? 'DE_Verifikasi_Rewind'
    : (selectedMachine.value === 'ALL' ? 'DE_Verifikasi_Semua' : `DE_Verifikasi_${selectedMachine.value}`);

  const ws = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ showGridLines: true }]
  });

  // Table Columns Definition for Excel Table (Ctrl+T)
  const tableColumns = currentCols.map(col => ({
    name: col.name,
    filterButton: true
  }));

  // Build rows array matching columns
  const tableRows = items.map((item, rIdx) => {
    return currentCols.map(col => {
      const val = formatCellValue(item[col.key], col.key, item, rIdx);
      if ([
        'netto', 'parentWidth', 'parentMeter', 'parentBeratTeori', 
        'childBeratTeori', 'selisihBerat', 'width', 'length', 
        'wastePolos', 'wasteMetal', 'sisaMeter', 'lengthWaste', 'weightWaste', 'thickness'
      ].includes(col.key)) {
        const num = parseFloat(val);
        return !isNaN(num) ? num : (val || '');
      }
      return val || '';
    });
  });

  // Add native Excel Table (Ctrl+T) with TableStyleMedium9
  const startRow = 1;
  const tableName = isRewind ? 'TabelVerifikasiRewind' : 'TabelVerifikasiSlitting';
  ws.addTable({
    name: tableName,
    ref: `A${startRow}`,
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium9',
      showRowStripes: true,
      showFirstColumn: false,
      showLastColumn: false
    },
    columns: tableColumns,
    rows: tableRows
  });

  // Group Header Colors
  const rewindGroupColors = {
    identitas: { bg: '1E40AF', text: 'FFFFFF' }, // Royal Blue (Identitas & Proses)
    dimensi: { bg: '0369A1', text: 'FFFFFF' },   // Ocean Blue (Dimensi Bahan)
    hasil: { bg: '15803D', text: 'FFFFFF' },     // Green (Hasil Rewind & Quality)
    keterangan: { bg: 'D97706', text: 'FFFFFF' },// Amber (Keterangan & Waste)
    atribut: { bg: '4F46E5', text: 'FFFFFF' }    // Indigo (Atribut & Core)
  };

  const slittingGroupColors = {
    parent: { bg: '1E3A8A', text: 'FFFFFF' }, // Biru Tua (Identitas Shift & Parent)
    child: { bg: '0284C7', text: 'FFFFFF' },  // Biru Muda / Cyan (Output Hasil Potong)
    qc: { bg: '15803D', text: 'FFFFFF' },     // Hijau (Quality Control & Defect)
    sisa: { bg: '7E22CE', text: 'FFFFFF' },   // Ungu (Jumbo Sisa)
    waste: { bg: 'D97706', text: 'FFFFFF' }   // Orange / Amber (Waste & Catatan)
  };

  const groupColors = isRewind ? rewindGroupColors : slittingGroupColors;

  const headerRow = ws.getRow(1);
  headerRow.height = 28;

  currentCols.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    const grp = groupColors[col.group] || { bg: '18181B', text: 'FFFFFF' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF' + grp.bg }
    };
    cell.font = {
      name: 'Segoe UI',
      size: 10,
      bold: true,
      color: { argb: 'FF' + grp.text }
    };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  // Auto-fit column widths
  currentCols.forEach((col, idx) => {
    const wsCol = ws.getColumn(idx + 1);
    let maxLen = col.name.length;
    items.forEach((item, rIdx) => {
      const v = String(formatCellValue(item[col.key], col.key, item, rIdx) || '');
      if (v.length > maxLen) maxLen = v.length;
    });
    wsCol.width = Math.max(12, Math.min(32, maxLen + 4));
  });

  // Conditional formatting:
  items.forEach((item, rIdx) => {
    const rowNum = rIdx + 2;
    const row = ws.getRow(rowNum);
    row.height = 20;

    if (isRewind) {
      // 1. Highlight No Lot in pink/light red on HASIL rows
      const lotIdx = currentCols.findIndex(c => c.key === 'lot') + 1;
      if (lotIdx > 0 && item.jenisProses === 'HASIL') {
        const lotCell = row.getCell(lotIdx);
        lotCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFCA5A5' } // Pink / Light Red
        };
        lotCell.font = {
          name: 'Segoe UI',
          size: 10,
          bold: true,
          color: { argb: 'FF7F1D1D' } // Dark Red
        };
      }

      // 2. Status badge formatting (PASS, REJECT, SORTIR)
      const stIdx = currentCols.findIndex(c => c.key === 'status') + 1;
      if (stIdx > 0) {
        const stCell = row.getCell(stIdx);
        const st = String(item.status || '').toUpperCase();
        if (st === 'PASS') {
          stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
          stCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF14532D' } };
        } else if (st === 'REJECT') {
          stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
          stCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } };
        }
      }

      // 3. Jenis Proses formatting (HASIL bold blue, BAHAN slate)
      const jpIdx = currentCols.findIndex(c => c.key === 'jenisProses') + 1;
      if (jpIdx > 0) {
        const jpCell = row.getCell(jpIdx);
        jpCell.font = {
          name: 'Segoe UI',
          size: 10,
          bold: true,
          color: { argb: item.jenisProses === 'HASIL' ? 'FF2563EB' : 'FF475569' }
        };
      }
    } else {
      // Slitting styling
      if (item.status === 'HOLD') {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' } // Light Amber
          };
        });
      } else if (item.status === 'REJECT') {
        row.eachCell({ includeEmpty: true }, (cell) => {
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEE2E2' } // Light Red
          };
        });
      }
    }
  });

  // Generate & Download File
  const dateStr = selectedDate.value === 'ALL' ? 'Semua_Tanggal' : selectedDate.value;
  const machineStr = isRewind ? 'REWIND' : (selectedMachine.value === 'ALL' ? 'Semua_Mesin' : selectedMachine.value);
  const fileName = `DE_Verifikasi_${machineStr}_${dateStr}_${new Date().toISOString().slice(0, 10)}.xlsx`;

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

// EXPORT REWIND BATCH TO OFFICIAL 23-COLUMN EXCEL
const exportRewindExcel = async (rolls, customFileName) => {
  if (!rolls || rolls.length === 0) return;

  const rewindRows = [];
  for (const item of rolls) {
    if (item.jenisProses) {
      rewindRows.push(item);
    } else {
      // 1. BAHAN
      rewindRows.push({
        ...item,
        isBahanRow: true,
        jenisProses: 'BAHAN',
        turunan: '',
        packing: '',
        status: 'SORTIR',
        reasonDefect: '',
        length: item.parentMeter || item.length,
        netto: item.parentBeratTeori || item.netto,
        lengthWaste: '',
        weightWaste: '',
        paperCore: item.paperCore ? String(item.paperCore).replace(/[^0-9]/g, '') : '6',
        tanda: '',
        bahan: '',
        od: item.od || 'OD2.4+PLASMA'
      });

      // 2. HASIL
      const pMeter = parseFloat(item.parentMeter) || 0;
      const hMeter = parseFloat(item.length) || 0;
      const calcLengthWaste = (pMeter > hMeter) ? (pMeter - hMeter) : '';

      const pBerat = parseFloat(item.parentBeratTeori) || 0;
      const hBerat = parseFloat(item.netto || item.berat) || 0;
      const calcWeightWaste = (pBerat > hBerat) ? parseFloat((pBerat - hBerat).toFixed(1)) : '';

      rewindRows.push({
        ...item,
        isHasilRow: true,
        jenisProses: 'HASIL',
        status: item.status || 'PASS',
        length: item.length,
        netto: item.netto || item.berat,
        lengthWaste: item.lengthWaste !== undefined ? item.lengthWaste : (item.sisaMeter || calcLengthWaste),
        weightWaste: item.weightWaste !== undefined ? item.weightWaste : ((parseFloat(item.wastePolos || 0) + parseFloat(item.wasteMetal || 0)) || calcWeightWaste),
        paperCore: item.paperCore ? String(item.paperCore).replace(/[^0-9]/g, '') : '6',
        tanda: '',
        bahan: '',
        od: item.od || 'OD2.4+PLASMA'
      });
    }
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'M-Label PT Saptawarna Cemerlang';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('DE_Report_Rewind', {
    views: [{ showGridLines: true }]
  });

  const cols = rewindColumns;
  const tableColumns = cols.map(c => ({ name: c.name, filterButton: true }));

  const tableRows = rewindRows.map((item, rIdx) => {
    return cols.map(col => {
      const val = formatCellValue(item[col.key], col.key, item, rIdx);
      if (['netto', 'width', 'length', 'lengthWaste', 'weightWaste', 'thickness'].includes(col.key)) {
        const num = parseFloat(val);
        return !isNaN(num) ? num : (val || '');
      }
      return val || '';
    });
  });

  ws.addTable({
    name: 'TabelReportRewind',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium9',
      showRowStripes: true,
      showFirstColumn: false,
      showLastColumn: false
    },
    columns: tableColumns,
    rows: tableRows
  });

  const rewindGroupColors = {
    identitas: { bg: '1E40AF', text: 'FFFFFF' },
    dimensi: { bg: '0369A1', text: 'FFFFFF' },
    hasil: { bg: '15803D', text: 'FFFFFF' },
    keterangan: { bg: 'D97706', text: 'FFFFFF' },
    atribut: { bg: '4F46E5', text: 'FFFFFF' }
  };

  const headerRow = ws.getRow(1);
  headerRow.height = 28;
  cols.forEach((col, idx) => {
    const cell = headerRow.getCell(idx + 1);
    const grp = rewindGroupColors[col.group] || { bg: '18181B', text: 'FFFFFF' };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF' + grp.bg } };
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF' + grp.text } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  cols.forEach((col, idx) => {
    const wsCol = ws.getColumn(idx + 1);
    let maxLen = col.name.length;
    rewindRows.forEach((item, rIdx) => {
      const v = String(formatCellValue(item[col.key], col.key, item, rIdx) || '');
      if (v.length > maxLen) maxLen = v.length;
    });
    wsCol.width = Math.max(12, Math.min(32, maxLen + 4));
  });

  rewindRows.forEach((item, rIdx) => {
    const row = ws.getRow(rIdx + 2);
    row.height = 20;

    const lotIdx = cols.findIndex(c => c.key === 'lot') + 1;
    if (lotIdx > 0 && item.jenisProses === 'HASIL') {
      const lotCell = row.getCell(lotIdx);
      lotCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFCA5A5' } };
      lotCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF7F1D1D' } };
    }

    const stIdx = cols.findIndex(c => c.key === 'status') + 1;
    if (stIdx > 0) {
      const stCell = row.getCell(stIdx);
      const st = String(item.status || '').toUpperCase();
      if (st === 'PASS') {
        stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } };
        stCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF14532D' } };
      } else if (st === 'REJECT') {
        stCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
        stCell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FF991B1B' } };
      }
    }

    const jpIdx = cols.findIndex(c => c.key === 'jenisProses') + 1;
    if (jpIdx > 0) {
      const jpCell = row.getCell(jpIdx);
      jpCell.font = {
        name: 'Segoe UI',
        size: 10,
        bold: true,
        color: { argb: item.jenisProses === 'HASIL' ? 'FF2563EB' : 'FF475569' }
      };
    }
  });

  const fileName = customFileName || `Batch_Rewind_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

// EXPORT REPORT TO EXCEL TABLE (Ctrl+T)
const exportVerifiedExcel = async () => {
  if (verifiedList.value.length === 0) {
    alert('Tidak ada data terverifikasi untuk diekspor.');
    return;
  }

  const items = filteredVerifiedList.value;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'M-Label PT Saptawarna Cemerlang';
  workbook.created = new Date();

  const ws = workbook.addWorksheet('DE_Report_Terverifikasi', {
    views: [{ showGridLines: true }]
  });

  const reportColumns = [
    { name: 'No', filterButton: true },
    { name: 'Waktu Verifikasi', filterButton: true },
    { name: 'Verifier', filterButton: true },
    { name: 'Tanggal', filterButton: true },
    { name: 'Operator', filterButton: true },
    { name: 'Shift', filterButton: true },
    { name: 'Mesin', filterButton: true },
    { name: 'SPK', filterButton: true },
    { name: 'No Lot Induk', filterButton: true },
    { name: 'Lebar Induk', filterButton: true },
    { name: 'Panjang Induk', filterButton: true },
    { name: 'Berat Induk', filterButton: true },
    { name: 'Turunan', filterButton: true },
    { name: 'Dimensi Hasil', filterButton: true },
    { name: 'Berat Aktual', filterButton: true },
    { name: 'Packing', filterButton: true },
    { name: 'Ket. Bahan', filterButton: true },
    { name: 'Ket. Hasil', filterButton: true },
    { name: 'Quality Status', filterButton: true },
    { name: 'Reason Defect', filterButton: true },
    { name: 'Grade Sisa', filterButton: true },
    { name: 'Sisa Meter', filterButton: true },
    { name: 'Waste Polos (kg)', filterButton: true },
    { name: 'Waste Metal (kg)', filterButton: true },
    { name: 'Note Operator', filterButton: true }
  ];

  const reportRows = items.map((item, idx) => [
    idx + 1,
    item.verifiedAt || '',
    item.verifiedBy || 'Data Entry',
    item.tanggal || '',
    item.operator || '-',
    getShiftCombined(item),
    item.mesin || 'SLITTING',
    item.spk || '',
    item.lot || '',
    parseFloat(getParentWidth(item)) || getParentWidth(item),
    parseFloat(getParentMeter(item)) || getParentMeter(item),
    parseFloat(getParentBeratTeori(item)) || getParentBeratTeori(item),
    item.turunan || '',
    `${item.width}MM × ${item.length}M`,
    parseFloat(item.netto) || 0,
    getPackingEndNumber(item),
    item.keteranganBahan || '',
    item.keterangan || '',
    item.status || 'PASS',
    getReasonDefectText(item),
    item.gradeSisa || '',
    parseFloat(item.sisaMeter) || '',
    parseFloat(item.wastePolos) || '',
    parseFloat(item.wasteMetal) || '',
    item.noteOperator || ''
  ]);

  ws.addTable({
    name: 'TabelReportTerverifikasi',
    ref: 'A1',
    headerRow: true,
    totalsRow: false,
    style: {
      theme: 'TableStyleMedium2', // Darker elegant table style with alternating row colors
      showRowStripes: true
    },
    columns: reportColumns,
    rows: reportRows
  });

  const headerRow = ws.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E293B' } // Slate 800
    };
    cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  reportColumns.forEach((col, idx) => {
    const wsCol = ws.getColumn(idx + 1);
    wsCol.width = Math.max(12, col.name.length + 4);
  });

  const fileName = `DE_Report_Slitting_Terverifikasi_${new Date().toISOString().slice(0, 10)}.xlsx`;
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
};

// AUTO FOCUS DIRECTIVE
const vFocus = {
  mounted: (el) => el.focus()
};

onMounted(async () => {
  window.addEventListener('keydown', handleSpreadsheetKeydown);
  await Promise.all([
    labelStore.loadLabels(),
    dataRollStore.loadRolls(),
    dataRollStore.loadUploadHistory(),
    configStore.loadAll()
  ]);

  // One-time cleanup for any lingering phantom dummy/ghost records (Disimpan di localStorage agar tidak scan 10K data tiap kali mount)
  if (!localStorage.getItem('de_phantom_cleaned_v1')) {
    try {
      const dummyLabels = await db.labels.filter(l => {
        const lot = String(l.lot || '').trim();
        const spk = String(l.spk || '').trim();
        const w = parseFloat(l.width || 0);
        const len = parseFloat(l.length || l.meter || 0);
        const isBlank = (!lot || lot === '0' || lot === '-') && (!spk || spk === '0' || spk === '-');
        const isZeroDim = (!lot || lot === '0') && w === 0 && len === 0;
        const isDummyTest = (l.spk === '07/VI/SPK/2026' && String(l.length) === '4000') ||
          (l.operator === 'Gunawan' && String(l.length) === '4000' && String(l.width) === '1000');
        return isBlank || isZeroDim || isDummyTest;
      }).toArray();
      if (dummyLabels.length > 0) {
        const dummyIds = dummyLabels.map(d => d.id).filter(Boolean);
        await db.labels.bulkDelete(dummyIds);
        await labelStore.loadLabels(true);
      }
      localStorage.setItem('de_phantom_cleaned_v1', '1');
    } catch (e) {
      console.warn('Cleanup dummy labels failed:', e);
    }
  }

  // Optimasi kecepatan: Hanya buka tanggal pertama/terbaru secara default agar load seketika & ringan
  if (availableDates.value.length > 0) {
    expandedDates.value.add(availableDates.value[0]);
  }
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleSpreadsheetKeydown);
  document.removeEventListener('mousemove', onColResizeMove);
  document.removeEventListener('mouseup', stopColResize);
});
</script>

<style scoped>
.excel-table {
  border-collapse: collapse;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  letter-spacing: -0.01em;
}

.excel-table th,
.excel-table td {
  border: 1px solid #d4d4d8;
}

/* Active Excel Cell Border */
.active-excel-cell {
  position: relative;
  outline: 2px solid #107c41 !important;
  outline-offset: -1px;
  z-index: 20;
}

/* Excel Fill Handle Square */
.excel-fill-handle {
  position: absolute;
  bottom: -3px;
  right: -3px;
  width: 6px;
  height: 6px;
  background-color: #107c41;
  border: 1px solid #ffffff;
  z-index: 25;
  cursor: crosshair;
}

.excel-grid-container {
  scrollbar-width: thin;
  scrollbar-color: #cbd5e1 #f1f5f9;
}

.excel-grid-container::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.excel-grid-container::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.excel-grid-container::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.excel-grid-container::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
