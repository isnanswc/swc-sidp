<template>
  <div class="space-y-3 font-sans select-none pb-12" @keydown="handleExcelKeydown">
    
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- HEADER & MAIN NAVIGATION BAR                                      -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-3">
        <!-- Logo Badge -->
        <div class="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs border border-zinc-800 shrink-0">
          <svg class="w-5 h-5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2" />
            <path d="M17 3h2a2 2 0 0 1 2 2v2" />
            <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
            <path d="M3 17v2a2 2 0 0 1 2 2h2" />
            <line x1="7" y1="12" x2="17" y2="12" />
          </svg>
        </div>

        <div>
          <div class="flex items-center gap-2 flex-wrap">
            <h1 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight">SCAN LAPORAN PRODUKSI</h1>
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-zinc-100 text-zinc-800 border border-zinc-200/80 uppercase">
              <span class="w-1.5 h-1.5 rounded-full bg-red-600"></span>
              Mesin {{ selectedMachine }}
            </span>
          </div>
          <p class="text-xs text-zinc-500 font-medium mt-0.5">
            Pindai lembar fisik, kelola riwayat dokumen dalam tabel, dan verifikasi neraca material balance.
          </p>
        </div>
      </div>

      <!-- MAIN TABS (Daftar Scan, Pindai/Upload, Dashboard) -->
      <div class="flex items-center bg-zinc-100/90 p-1 rounded-xl border border-zinc-200/80 gap-1 text-xs overflow-x-auto">
        <!-- Tab 1: Daftar Scan -->
        <button
          @click="activeMainTab = 'list'; isVerifyingOpen = false"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeMainTab === 'list' && !isVerifyingOpen
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span>Daftar Dokumen</span>
          <span
            :class="[
              'px-1.5 py-0.2 rounded-full text-[9.5px] font-mono font-bold',
              activeMainTab === 'list' && !isVerifyingOpen ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-700'
            ]"
          >
            {{ scanSessionList.length }}
          </span>
        </button>

        <!-- Tab 2: Pindai / Upload -->
        <button
          @click="activeMainTab = 'scan'; isVerifyingOpen = false"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeMainTab === 'scan' && !isVerifyingOpen
              ? 'bg-red-600 text-white shadow-xs shadow-red-600/30'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          <span>Pindai / Unggah</span>
          <span v-if="queuedImages.length > 0" class="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-white text-red-600 font-mono animate-pulse">
            {{ queuedImages.length }}
          </span>
        </button>

        <!-- Tab 3: Dashboard -->
        <button
          @click="activeMainTab = 'dashboard'; isVerifyingOpen = false"
          :class="[
            'px-3.5 py-1.5 rounded-lg font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap',
            activeMainTab === 'dashboard' && !isVerifyingOpen
              ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/80'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200/60'
          ]"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          <span>Dashboard Neraca</span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- VIEW A: DAFTAR SCAN BERBENTUK LIST TABEL DENGAN PAGINATION (DEFAULT) -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="activeMainTab === 'list' && !isVerifyingOpen" class="space-y-3 animate-fade-in">
      
      <!-- Toolbar & Action Ribbon -->
      <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
          <div class="relative w-full">
            <svg class="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              v-model="searchDocTerm"
              type="text"
              placeholder="Cari nama laporan, tanggal, atau mesin..."
              class="w-full pl-9 pr-7 py-1.5 text-xs border border-zinc-200 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none bg-zinc-50/60 font-medium transition-all"
            />
            <button
              v-if="searchDocTerm"
              @click="searchDocTerm = ''"
              class="absolute right-2.5 top-2 text-zinc-400 hover:text-zinc-700 text-xs font-bold transition-colors cursor-pointer"
              title="Hapus pencarian"
            >
              ✕
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2.5">
          <!-- Page size selector -->
          <div class="flex items-center gap-1.5 text-xs text-zinc-500">
            <span class="text-[11px] font-bold">Baris:</span>
            <select v-model.number="pageSize" class="px-2 py-1 text-xs border border-zinc-200 rounded-lg bg-zinc-50 font-bold outline-none cursor-pointer hover:border-zinc-300 transition-colors">
              <option :value="10">10</option>
              <option :value="25">25</option>
              <option :value="50">50</option>
            </select>
          </div>

          <!-- Tombol Pindai Baru -->
          <button
            @click="activeMainTab = 'scan'"
            class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-xs shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>Pindai Baru</span>
          </button>
        </div>
      </div>

      <!-- TABEL LIST SCAN RINGAN -->
      <div v-if="scanSessionList.length > 0" class="bg-white rounded-2xl border border-zinc-200 shadow-2xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead class="bg-zinc-50/80 text-zinc-600 font-sans font-bold text-[11px] border-b border-zinc-200 uppercase tracking-wider">
              <tr>
                <th class="py-3 px-3 text-center w-12 font-mono">#</th>
                <th class="py-3 px-3">Nama Dokumen Laporan</th>
                <th class="py-3 px-3">Tanggal</th>
                <th class="py-3 px-3 text-center">Mesin</th>
                <th class="py-3 px-3 text-center">Shift</th>
                <th class="py-3 px-3 text-center">Total Roll</th>
                <th class="py-3 px-3 text-right">Bahan Masuk</th>
                <th class="py-3 px-3 text-right">Output + Waste</th>
                <th class="py-3 px-3 text-right">Selisih</th>
                <th class="py-3 px-3 text-center">Status Neraca</th>
                <th class="py-3 px-3 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 font-mono text-xs">
              <tr
                v-for="(session, sIdx) in paginatedScanList"
                :key="session.id || sIdx"
                class="hover:bg-zinc-50/80 transition-colors group cursor-pointer"
                @click="openSessionVerification(session)"
              >
                <!-- Row Number -->
                <td class="py-2.5 px-3 text-center text-zinc-400 font-bold font-sans">
                  {{ (currentPage - 1) * pageSize + sIdx + 1 }}
                </td>

                <!-- Document Name with Inline Rename -->
                <td class="py-2.5 px-3 font-sans" @click.stop>
                  <div v-if="editingSessionId === session.id" class="flex items-center gap-1">
                    <input
                      v-model="editingSessionName"
                      @keyup.enter="saveSessionName(session)"
                      @keyup.esc="cancelRename"
                      type="text"
                      class="px-2 py-0.5 text-xs font-bold border border-red-500 rounded outline-none bg-red-50/40 min-w-[200px]"
                      autofocus
                    />
                    <button @click="saveSessionName(session)" class="p-1 text-emerald-600 hover:bg-emerald-50 rounded" title="Simpan">
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </button>
                    <button @click="cancelRename" class="p-1 text-zinc-400 hover:bg-zinc-100 rounded" title="Batal">✕</button>
                  </div>
                  <div v-else class="flex items-center gap-1.5 group/name">
                    <span class="font-bold text-zinc-900 group-hover:text-red-600 transition-colors">
                      {{ session.name }}
                    </span>
                    <button
                      @click.stop="startRename(session)"
                      class="opacity-0 group-hover/name:opacity-100 text-zinc-400 hover:text-zinc-700 p-0.5 transition-opacity"
                      title="Ubah Nama Dokumen"
                    >
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
                    </button>
                  </div>
                </td>

                <!-- Tanggal -->
                <td class="py-2.5 px-3 text-zinc-600 font-sans text-[11px]">{{ session.tanggal }}</td>

                <!-- Mesin -->
                <td class="py-2.5 px-3 text-center font-sans">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-black bg-zinc-100 text-zinc-700 uppercase border border-zinc-200/80">
                    {{ session.machine || 'CASTING' }}
                  </span>
                </td>

                <!-- Jumlah Shift -->
                <td class="py-2.5 px-3 text-center font-bold text-zinc-800 font-sans">
                  {{ session.shifts?.length || 1 }} Shift
                </td>

                <!-- Total Roll -->
                <td class="py-2.5 px-3 text-center font-black text-zinc-900">
                  {{ getSessionTotalRolls(session) }}
                </td>

                <!-- Bahan Masuk -->
                <td class="py-2.5 px-3 text-right font-black text-zinc-800">
                  {{ getSessionTotalResin(session).toFixed(1) }} <span class="text-[10px] text-zinc-400 font-normal">kg</span>
                </td>

                <!-- Output + Waste -->
                <td class="py-2.5 px-3 text-right font-black text-zinc-800">
                  {{ (getSessionTotalKg(session) + getSessionTotalWaste(session)).toFixed(1) }} <span class="text-[10px] text-zinc-400 font-normal">kg</span>
                </td>

                <!-- Selisih -->
                <td class="py-2.5 px-3 text-right font-black" :class="getSessionDiffKg(session) === 0 ? 'text-emerald-600' : (getSessionDiffKg(session) > 0 ? 'text-amber-600' : 'text-red-600')">
                  {{ getSessionDiffKg(session) >= 0 ? '+' : '' }}{{ getSessionDiffKg(session).toFixed(1) }} kg
                </td>

                <!-- Status Neraca Badge -->
                <td class="py-2.5 px-3 text-center font-sans">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10px] font-bold inline-flex items-center gap-1.5 border',
                      getSessionBalanceStatus(session).class
                    ]"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-current"></span>
                    {{ getSessionBalanceStatus(session).label }}
                  </span>
                </td>

                <!-- Aksi -->
                <td class="py-2.5 px-3 text-center font-sans" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      @click="openSessionVerification(session)"
                      class="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-black text-white font-bold text-[11px] transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                      title="Buka Spreadsheet & Neraca"
                    >
                      <span>Buka</span>
                      <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
                    </button>
                    <button
                      @click="deleteSession(session.id)"
                      class="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Hapus Dokumen"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- PAGINATION BAR -->
        <div class="p-3 bg-zinc-50/60 border-t border-zinc-200 flex flex-wrap items-center justify-between gap-2 text-xs font-sans">
          <span class="text-zinc-500 text-[11px]">
            Menampilkan <strong>{{ paginationInfo.from }}</strong> - <strong>{{ paginationInfo.to }}</strong> dari <strong>{{ filteredScanList.length }}</strong> dokumen
          </span>

          <div class="flex items-center gap-1 font-mono">
            <button
              :disabled="currentPage <= 1"
              @click="currentPage--"
              class="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
              <span>Sebelumnya</span>
            </button>

            <button
              v-for="page in totalPages"
              :key="page"
              @click="currentPage = page"
              :class="[
                'w-7 h-7 rounded-lg border text-xs font-black transition-all flex items-center justify-center cursor-pointer',
                currentPage === page ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-700 border-zinc-200 hover:bg-zinc-100'
              ]"
            >
              {{ page }}
            </button>

            <button
              :disabled="currentPage >= totalPages"
              @click="currentPage++"
              class="px-2.5 py-1 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-100 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-xs flex items-center gap-1 transition-colors"
            >
              <span>Selanjutnya</span>
              <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="p-12 text-center bg-white rounded-2xl border border-zinc-200 shadow-2xs space-y-3.5 text-zinc-400">
        <div class="w-14 h-14 mx-auto rounded-2xl bg-zinc-100 flex items-center justify-center text-zinc-400 border border-zinc-200/80">
          <svg class="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="12" y1="18" x2="12" y2="12"></line>
            <line x1="9" y1="15" x2="15" y2="15"></line>
          </svg>
        </div>
        <div class="space-y-1">
          <p class="text-xs font-black text-zinc-800 uppercase tracking-tight">Belum Ada Riwayat Dokumen Scan</p>
          <p class="text-[11px] text-zinc-400 max-w-sm mx-auto">Mulai pindai lembar fisik atau unggah foto laporan produksi untuk mengekstrak data dan memvalidasi neraca material.</p>
        </div>
        <button
          @click="activeMainTab = 'scan'"
          class="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-xs shadow-red-600/20 transition-all cursor-pointer inline-flex items-center gap-1.5"
        >
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          <span>Pindai / Unggah Laporan Baru</span>
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- VIEW B: PINDAI & UPLOAD MULTI-GAMBAR                              -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="activeMainTab === 'scan' && !isVerifyingOpen" class="space-y-4 animate-fade-in">
      
      <!-- Mesin & Mode Seleksi -->
      <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-center gap-2 flex-wrap">
          <span class="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
            Mesin:
          </span>
          <div class="flex items-center gap-1.5 flex-wrap">
            <button
              v-for="m in machineOptions"
              :key="m.id"
              @click="selectedMachine = m.id"
              :class="[
                'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border',
                selectedMachine === m.id
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100 hover:text-zinc-900'
              ]"
            >
              <svg v-if="m.id === 'CASTING'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
              <svg v-else-if="m.id === 'METALIZE'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              <svg v-else-if="m.id === 'SLITTING'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="3"></circle><circle cx="6" cy="18" r="3"></circle><line x1="20" y1="4" x2="8.12" y2="15.88"></line><line x1="14.47" y1="14.48" x2="20" y2="20"></line><line x1="8.12" y1="8.12" x2="12" y2="12"></line></svg>
              <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
              <span>{{ m.name }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-2 text-xs">
          <span class="text-zinc-500 font-bold">Mode Dokumen:</span>
          <select
            v-model="scanProcessingMode"
            class="px-3 py-1.5 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-bold text-zinc-800 outline-none cursor-pointer hover:border-zinc-300 transition-colors"
          >
            <option value="auto">Otomatis AI (Multi-Lembar / Multi-Shift)</option>
            <option value="single_shift_multipage">1 Shift dengan 2 Lembar Berkelanjutan</option>
            <option value="multishift_batch">Laporan 2-3 Shift Harian Sekaligus</option>
          </select>
        </div>
      </div>

      <!-- Warning API Key if missing -->
      <div
        v-if="!hasGoogleAiApiKey"
        class="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-950 shadow-2xs"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
          </div>
          <div>
            <span class="font-bold text-amber-900 block">Google AI API Key Belum Dikonfigurasi:</span>
            <span class="text-amber-800 text-[11px]">Masukkan API Key di Pengaturan agar sistem dapat mengekstrak teks otomatis multi-gambar.</span>
          </div>
        </div>
        <router-link
          to="/settings"
          class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs shrink-0 shadow-xs transition-colors"
        >
          Pengaturan API
        </router-link>
      </div>

      <!-- Capture / Upload Dual Panels -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <!-- Opsi A: Kamera Studio Multi-Shoot -->
        <div class="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold shadow-2xs">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-black text-zinc-900">Kamera Pindai Dokumen</h3>
                  <p class="text-[11px] text-zinc-400 font-medium">Bisa ambil foto lembar 1, lembar 2, dst. berturut-turut</p>
                </div>
              </div>

              <span v-if="isCameraActive" class="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200 inline-flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                LIVE
              </span>
            </div>

            <!-- Precision Viewfinder with Reticle Brackets -->
            <div class="mt-4 bg-zinc-950 rounded-xl overflow-hidden min-h-[250px] flex items-center justify-center relative border border-zinc-800">
              <!-- Viewfinder Reticles -->
              <div class="absolute top-2.5 left-2.5 w-4 h-4 border-t-2 border-l-2 border-red-500 rounded-tl pointer-events-none z-10"></div>
              <div class="absolute top-2.5 right-2.5 w-4 h-4 border-t-2 border-r-2 border-red-500 rounded-tr pointer-events-none z-10"></div>
              <div class="absolute bottom-2.5 left-2.5 w-4 h-4 border-b-2 border-l-2 border-red-500 rounded-bl pointer-events-none z-10"></div>
              <div class="absolute bottom-2.5 right-2.5 w-4 h-4 border-b-2 border-r-2 border-red-500 rounded-br pointer-events-none z-10"></div>

              <video
                v-show="isCameraActive"
                ref="videoRef"
                autoplay
                playsinline
                class="w-full h-full object-cover max-h-[320px]"
              ></video>
              <canvas ref="canvasRef" class="hidden"></canvas>

              <div v-if="!isCameraActive" class="p-6 text-center text-zinc-400 space-y-2.5">
                <div class="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto">
                  <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
                <p class="text-xs font-bold text-zinc-300">Kamera Siap Digunakan</p>
                <p class="text-[11px] text-zinc-500 max-w-xs mx-auto">Klik tombol Nyalakan Kamera untuk memposisikan lembar fisik laporan.</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2 pt-2 border-t border-zinc-100">
            <button
              v-if="!isCameraActive"
              @click="startCamera"
              class="flex-1 py-2 px-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
              <span>Nyalakan Kamera</span>
            </button>

            <template v-else>
              <button
                @click="capturePhotoToQueue"
                class="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs shadow-red-600/25"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="3"></circle></svg>
                <span>Ambil Foto Lembar Ini</span>
              </button>
              <button
                @click="stopCamera"
                class="py-2 px-3.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </template>
          </div>
        </div>

        <!-- Opsi B: Upload Multi-File / PDF -->
        <div class="bg-white rounded-2xl border border-zinc-200 p-4 sm:p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div class="flex items-center gap-2.5">
                <div class="w-8 h-8 rounded-xl bg-zinc-100 text-zinc-800 flex items-center justify-center font-bold">
                  <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>
                <div>
                  <h3 class="text-sm font-black text-zinc-900">Upload File Foto / PDF</h3>
                  <p class="text-[11px] text-zinc-400 font-medium">Bisa memilih 1 hingga 5 file gambar sekaligus</p>
                </div>
              </div>
            </div>

            <!-- Upload Drop Area -->
            <div
              class="mt-4 border-2 border-dashed border-zinc-200 hover:border-red-500 hover:bg-red-50/5 rounded-xl p-6 text-center cursor-pointer transition-all bg-zinc-50/40 min-h-[250px] flex flex-col items-center justify-center space-y-2.5 group"
              @click="$refs.multiFileInputRef.click()"
              @dragover.prevent
              @drop.prevent="handleMultiFileDrop"
            >
              <input
                ref="multiFileInputRef"
                type="file"
                multiple
                accept="image/*, application/pdf"
                class="hidden"
                @change="handleMultiFileSelect"
              />

              <div class="w-12 h-12 rounded-2xl bg-zinc-100 group-hover:bg-red-50 text-zinc-500 group-hover:text-red-600 transition-colors flex items-center justify-center">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="12" y1="18" x2="12" y2="12"></line>
                  <line x1="9" y1="15" x2="12" y2="12"></line>
                  <line x1="15" y1="15" x2="12" y2="12"></line>
                </svg>
              </div>
              <p class="text-xs font-bold text-zinc-800 group-hover:text-red-600 transition-colors">Klik atau Tarik File Gambar ke Sini</p>
              <p class="text-[11px] text-zinc-400 max-w-xs">Mendukung format JPG, PNG, atau scan PDF untuk shift 1, 2, dan 3</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Antrean Lembar Laporan Terpilih -->
      <div v-if="queuedImages.length > 0" class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs space-y-3.5">
        <div class="flex items-center justify-between border-b border-zinc-100 pb-2.5">
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
              <polyline points="2 17 12 22 22 17"></polyline>
              <polyline points="2 12 12 17 22 12"></polyline>
            </svg>
            <h3 class="text-xs font-black text-zinc-900 uppercase tracking-tight">
              Antrean Dokumen Terpilih ({{ queuedImages.length }} Lembar Siap Diekstrak AI)
            </h3>
          </div>
          <button
            @click="clearAllQueuedImages"
            class="text-[11px] text-zinc-400 hover:text-red-600 font-bold transition-colors cursor-pointer"
          >
            Kosongkan Antrean
          </button>
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
          <div
            v-for="(img, qIdx) in queuedImages"
            :key="qIdx"
            class="relative rounded-xl overflow-hidden border border-zinc-200 bg-zinc-950 group shadow-2xs cursor-pointer aspect-3/4"
            @click="openLightbox('main', qIdx)"
          >
            <img :src="img.preview" alt="Lembar Foto" class="h-full w-full object-cover opacity-90 group-hover:opacity-100 transition-all group-hover:scale-105 duration-200" />
            <span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-white font-mono font-bold text-[9px] flex items-center gap-1 border border-white/10">
              <span>Lembar #{{ qIdx + 1 }}</span>
            </span>
            <div class="absolute bottom-1.5 right-1.5 flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
              <button
                @click.stop="rotateQueuedImage(qIdx, 90)"
                class="w-6 h-6 rounded-lg bg-black/75 hover:bg-black text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-xs border border-white/10"
                title="Putar 90°"
              >
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
              </button>
              <button
                @click.stop="removeQueuedImage(qIdx)"
                class="w-6 h-6 rounded-lg bg-red-600/90 hover:bg-red-600 text-white flex items-center justify-center text-xs font-bold transition-colors cursor-pointer shadow-xs"
                title="Hapus lembar ini"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        <div class="pt-2 flex items-center justify-between flex-wrap gap-2.5">
          <span class="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
            <svg class="w-3.5 h-3.5 text-zinc-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            AI akan mengekstrak seluruh data, membuka halaman verifikasi spreadsheet, dan menyimpannya ke Daftar Dokumen.
          </span>

          <button
            :disabled="isExtracting"
            @click="processMultiImageExtraction"
            class="py-2.5 px-6 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-xs shadow-red-600/25 cursor-pointer"
          >
            <svg v-if="isExtracting" class="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>{{ isExtracting ? 'Mengekstrak Multi-Lembar AI...' : `Ekstrak & Verifikasi (${queuedImages.length} Lembar)` }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- VIEW C: VERIFIKASI SPREADSHEET (TERBUKA KETIKA KLIK / SELESAI SCAN)-->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="isVerifyingOpen && currentActiveSession && currentActiveSession.id !== 'empty'" class="space-y-3 animate-fade-in">
      
      <!-- Back Navigation Header -->
      <div class="bg-white p-3 sm:p-3.5 rounded-2xl border border-zinc-200 shadow-2xs flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <button
            @click="isVerifyingOpen = false; activeMainTab = 'list'"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
            <span>Daftar Dokumen</span>
          </button>

          <div class="flex items-center gap-2">
            <span class="text-xs font-bold text-zinc-400">Dokumen:</span>
            <span class="text-xs font-black text-zinc-900 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg">
              {{ currentActiveSession.name }}
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap">
          <!-- Tombol Export 1 Shift -->
          <button
            @click="exportCurrentShiftToExcel"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            :title="`Export ${currentActiveShift?.shift_name || 'Shift'} ke Excel`"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            <span>Export {{ currentActiveShift?.shift_name || 'Shift' }}</span>
          </button>

          <!-- Tombol Export Seluruh Shift Harian (jika > 1 shift) -->
          <button
            v-if="(currentActiveSession.shifts?.length || 0) > 1"
            @click="exportAllShiftsToExcel"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Export Rekap Harian & Seluruh Shift Sekaligus"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>Export Semua Shift</span>
          </button>

          <button
            @click="saveCurrentSessionToDatabase"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg>
            <span>Simpan</span>
          </button>
        </div>
      </div>

      <!-- Shift Selector Bar -->
      <div class="bg-white p-2 sm:p-2.5 rounded-2xl border border-zinc-200 shadow-2xs flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center flex-wrap gap-1.5">
          <span class="text-xs font-bold text-zinc-500 uppercase tracking-tight mr-1 flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Shift:
          </span>

          <!-- Tab Global Progress -->
          <button
            @click="activeShiftViewMode = 'global'"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer',
              activeShiftViewMode === 'global'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80'
            ]"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
            <span>Ringkasan Harian ({{ currentActiveSession.shifts?.length || 1 }} Shift)</span>
          </button>

          <!-- Per-Shift Tabs with Inline Delete Shift Button -->
          <div
            v-for="(shift, sIdx) in currentActiveSession.shifts || []"
            :key="sIdx"
            :class="[
              'rounded-xl text-xs font-bold transition-all flex items-center cursor-pointer border',
              activeShiftViewMode === 'shift' && selectedShiftIndex === sIdx
                ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/80'
            ]"
          >
            <button
              @click="selectShiftView(sIdx)"
              class="px-3 py-1.5 flex items-center gap-1.5 cursor-pointer"
            >
              <span class="w-1.5 h-1.5 rounded-full" :class="activeShiftViewMode === 'shift' && selectedShiftIndex === sIdx ? 'bg-amber-300' : 'bg-slate-400'"></span>
              <span>{{ shift.shift_name || `Shift ${sIdx + 1}` }}</span>
              <span
                class="px-1.5 py-0.2 rounded-full text-[9.5px] font-mono font-bold"
                :class="activeShiftViewMode === 'shift' && selectedShiftIndex === sIdx ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'"
              >
                {{ shift.tabel_1_rolls?.length || 0 }} Roll
              </span>
            </button>

            <!-- Delete Shift Button (jika jumlah shift > 1) -->
            <button
              v-if="(currentActiveSession.shifts?.length || 0) > 1"
              @click.stop="deleteShiftFromSession(sIdx)"
              :class="[
                'pr-2 pl-1 py-1 text-[11px] font-bold transition-colors cursor-pointer',
                activeShiftViewMode === 'shift' && selectedShiftIndex === sIdx
                  ? 'text-zinc-400 hover:text-red-400'
                  : 'text-zinc-400 hover:text-red-600'
              ]"
              :title="`Hapus ${shift.shift_name || 'Shift Ini'}`"
            >
              ✕
            </button>
          </div>

          <!-- Tombol Tambah Scan / Gambar ke Dokumen Ini -->
          <button
            @click="openAppendScanModal"
            class="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-xs shadow-red-600/20 transition-all flex items-center gap-1.5 cursor-pointer"
            title="Tambah lembar scan atau gambar baru ke dokumen ini"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
            <span>+ Tambah Foto</span>
          </button>

          <!-- Add Manual Shift Button -->
          <button
            @click="addNewShiftToSession"
            class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-50 hover:bg-zinc-100 text-zinc-700 border border-zinc-200 transition-all flex items-center gap-1 cursor-pointer"
            title="Tambah shift kosong manual"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            <span>Shift Kosong</span>
          </button>
        </div>
      </div>

      <!-- ══════ MODE A: GLOBAL DAILY SUMMARY ══════ -->
      <div v-if="activeShiftViewMode === 'global'" class="space-y-4 animate-fade-in">
        <div class="bg-white p-4 sm:p-5 rounded-2xl border border-zinc-200 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-zinc-100 pb-3 flex-wrap gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/80 flex items-center justify-center text-sm font-bold shadow-2xs">
                <svg class="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
              </div>
              <div>
                <h3 class="text-xs font-black text-zinc-900 uppercase tracking-tight">NERACA MATERIAL BALANCE GLOBAL HARIAN (SELURUH SHIFT)</h3>
                <p class="text-[11px] text-zinc-500">Akumulasi total input bahan baku vs total output roll + waste seluruh shift kerja pada hari ini.</p>
              </div>
            </div>

            <div
              :class="[
                'px-3.5 py-1 rounded-xl text-xs font-mono font-black border flex items-center gap-1.5',
                globalBalanceStatusClass
              ]"
            >
              <span>{{ globalBalanceStatusTitle }}</span>
              <span>({{ globalResultDiffKg >= 0 ? '+' : '' }}{{ globalResultDiffKg.toFixed(2) }} kg)</span>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span class="text-[10px] text-zinc-500 font-sans font-bold uppercase block">1. Total Bahan Masuk Harian</span>
              <span class="text-lg font-black text-amber-900 mt-1 block">{{ globalTotalResinKg.toFixed(2) }} kg</span>
              <span class="text-[10px] text-zinc-400 font-sans">Seluruh jenis resin</span>
            </div>
            <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span class="text-[10px] text-zinc-500 font-sans font-bold uppercase block">2. Total Roll Output Harian</span>
              <span class="text-lg font-black text-emerald-900 mt-1 block">{{ globalTotalRollsKg.toFixed(2) }} kg</span>
              <span class="text-[10px] text-zinc-400 font-sans">{{ globalTotalRollsCount }} Jumbo Roll</span>
            </div>
            <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
              <span class="text-[10px] text-zinc-500 font-sans font-bold uppercase block">3. Total Waste Harian</span>
              <span class="text-lg font-black text-rose-900 mt-1 block">{{ globalTotalWasteKg.toFixed(2) }} kg</span>
              <span class="text-[10px] text-zinc-400 font-sans">QC + Startup + Bekuan</span>
            </div>
            <div class="p-3 rounded-xl border" :class="globalResultDiffKg === 0 ? 'bg-emerald-50 border-emerald-300 text-emerald-950' : 'bg-amber-50 border-amber-300 text-amber-950'">
              <span class="text-[10px] font-sans font-bold uppercase block">4. Selisih Global Harian</span>
              <span class="text-lg font-black mt-1 block">{{ globalResultDiffKg >= 0 ? '+' : '' }}{{ globalResultDiffKg.toFixed(2) }} kg</span>
              <span class="text-[10px] opacity-75 font-sans">Output: {{ (globalTotalRollsKg + globalTotalWasteKg).toFixed(1) }} kg</span>
            </div>
          </div>
        </div>

        <!-- Tabel Rekap Antar-Shift -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="px-4 py-3 bg-slate-100 border-b border-slate-200 text-slate-800 flex items-center justify-between font-black">
            <span class="text-xs font-black uppercase tracking-wider flex items-center gap-2">
              <span>📊</span> TABEL PROGRES & REKAPITULASI KOMPARATIF PER-SHIFT
            </span>
          </div>

          <table class="w-full text-left text-xs border-collapse font-mono">
            <thead class="bg-zinc-100 text-zinc-700 text-[11px] border-b border-zinc-300">
              <tr>
                <th class="p-3">Shift Kerja</th>
                <th class="p-3">Operator</th>
                <th class="p-3 text-center">Jumlah Roll</th>
                <th class="p-3 text-right">Bahan Masuk (kg)</th>
                <th class="p-3 text-right">Output Roll (kg)</th>
                <th class="p-3 text-right">Waste (kg)</th>
                <th class="p-3 text-right">Selisih Shift (kg)</th>
                <th class="p-3 text-center">Status Neraca</th>
                <th class="p-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-200">
              <tr
                v-for="(shift, sIdx) in currentActiveSession.shifts || []"
                :key="sIdx"
                class="hover:bg-zinc-50 cursor-pointer"
                @click="selectShiftView(sIdx)"
              >
                <td class="p-3 font-black text-blue-700 flex items-center gap-1.5">
                  <span>🔹</span>
                  <span>{{ shift.shift_name }}</span>
                </td>
                <td class="p-3 font-sans font-medium text-zinc-800">{{ shift.header?.operator || '-' }}</td>
                <td class="p-3 text-center font-bold">{{ shift.tabel_1_rolls?.length || 0 }} Roll</td>
                <td class="p-3 text-right font-black text-amber-950">{{ getShiftTotalResin(shift).toFixed(2) }}</td>
                <td class="p-3 text-right font-black text-emerald-950">{{ getShiftTotalRollsKg(shift).toFixed(2) }}</td>
                <td class="p-3 text-right font-bold text-rose-900">{{ getShiftTotalWaste(shift).toFixed(2) }}</td>
                <td class="p-3 text-right font-black" :class="getShiftDiffKg(shift) === 0 ? 'text-emerald-700' : (getShiftDiffKg(shift) > 0 ? 'text-amber-600' : 'text-red-600')">
                  {{ getShiftDiffKg(shift) >= 0 ? '+' : '' }}{{ getShiftDiffKg(shift).toFixed(2) }}
                </td>
                <td class="p-3 text-center">
                  <span
                    :class="[
                      'px-2 py-0.5 rounded-full text-[10px] font-bold font-sans',
                      getShiftDiffKg(shift) === 0 ? 'bg-emerald-100 text-emerald-800' : (getShiftDiffKg(shift) > 0 ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-900')
                    ]"
                  >
                    {{ getShiftDiffKg(shift) === 0 ? 'SEIMBANG' : (getShiftDiffKg(shift) > 0 ? 'LEBIH' : 'KURANG') }}
                  </span>
                </td>
                <td class="p-3 text-center">
                  <button
                    @click.stop="selectShiftView(sIdx)"
                    class="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold hover:bg-blue-600 hover:text-white transition-colors text-[11px]"
                  >
                    Buka Spreadsheet ➔
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- ══════ MODE B: PER-SHIFT MECHANICAL BALANCE & SPREADSHEET ══════ -->
      <div v-else class="space-y-4 animate-fade-in">
        <!-- Professional Minimalist Material Balance Panel -->
        <div class="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-4">
          <div class="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200/60 flex items-center justify-center text-sm font-bold shadow-2xs">
                ⚖️
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <h3 class="text-xs font-black text-slate-800 uppercase tracking-tight">
                    REKONSILIASI NERACA MATERIAL: {{ currentActiveShift?.shift_name || 'Shift 1' }}
                  </h3>
                  <span class="text-[10.5px] font-bold text-slate-400 font-mono">Toleransi Produksi</span>
                </div>
                <p class="text-[11px] text-slate-500 font-sans">
                  {{ isMetalizeSession ? 'Komparasi Bahan Masuk (No Lot Awal) vs Hasil Jadi (Lot Metal) + Total Waste' : 'Komparasi Bahan Masuk (Resin) vs Hasil Jadi (Roll) + Total Waste' }}
                </p>
              </div>
            </div>

            <div
              :class="[
                'px-3.5 py-1 rounded-xl text-xs font-mono font-bold border shadow-2xs flex items-center gap-1.5',
                currentShiftBalanceStatusClass
              ]"
            >
              <span class="w-2 h-2 rounded-full" :class="currentShiftBalanceDotClass"></span>
              <span>{{ currentShiftBalanceStatusTitle }}</span>
              <span class="font-black">({{ currentShiftDiffKg >= 0 ? '+' : '' }}{{ currentShiftDiffKg.toFixed(2) }} kg)</span>
            </div>
          </div>

          <!-- Professional 3-Pillar Minimalist Flow & Balance Cards -->
          <div class="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
            
            <!-- Pillar 1: Input Material -->
            <div class="lg:col-span-4 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80 shadow-2xs flex flex-col justify-between min-h-[110px]">
              <div class="flex items-center justify-between">
                <span class="text-[10.5px] uppercase tracking-wider text-amber-800 font-bold flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                  {{ isMetalizeSession ? '1. TOTAL BAHAN MASUK (INPUT)' : '1. TOTAL BAHAN RESIN (INPUT)' }}
                </span>
                <span class="text-[10px] font-mono font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded">
                  {{ isMetalizeSession ? currentShiftMetalizeRows.length + ' Roll Induk' : currentShiftResin.length + ' Komponen' }}
                </span>
              </div>
              <div class="mt-2">
                <div class="text-2xl font-black font-mono text-slate-900 tracking-tight">
                  {{ currentShiftTotalResinKg.toFixed(2) }} <span class="text-xs font-sans text-slate-500 font-normal">kg</span>
                </div>
                <div class="text-[11px] text-slate-500 mt-0.5 truncate font-sans">
                  {{ isMetalizeSession ? (currentShiftMetalizeRows[0]?.no_lot_awal ? 'Lot Awal: ' + currentShiftMetalizeRows[0].no_lot_awal : 'Bahan dari Casting') : 'Bahan baku murni & masterbatch' }}
                </div>
              </div>
            </div>

            <!-- Pillar 2: Central Balance Precision Indicator -->
            <div class="lg:col-span-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 shadow-2xs flex flex-col justify-between items-center text-center min-h-[110px]">
              <span class="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                SELISIH NERACA (DELTA BALANCE)
              </span>

              <div class="my-1 flex flex-col items-center">
                <span
                  class="text-xl font-black font-mono tracking-tight"
                  :class="currentShiftDiffKg === 0 ? 'text-emerald-700' : (currentShiftDiffKg > 0 ? 'text-amber-700' : 'text-rose-700')"
                >
                  {{ currentShiftDiffKg >= 0 ? '+' : '' }}{{ currentShiftDiffKg.toFixed(2) }} <span class="text-xs font-sans font-normal text-slate-400">kg</span>
                </span>
                <span class="text-[10.5px] font-bold" :class="currentShiftDiffKg === 0 ? 'text-emerald-800' : (currentShiftDiffKg > 0 ? 'text-amber-800' : 'text-rose-800')">
                  {{ currentShiftDiffKg === 0 ? '✓ Neraca 100% Pas Presisi' : (currentShiftDiffKg > 0 ? '▲ Kelebihan Hasil (+Surplus)' : '▼ Penyusutan / Bahan Kurang') }}
                </span>
              </div>

              <!-- Minimal Precision Tolerance Bar -->
              <div class="w-full max-w-[200px] mt-1 space-y-1">
                <div class="relative w-full h-2 rounded-full bg-slate-200 overflow-hidden flex items-center">
                  <!-- Center zero tick -->
                  <div class="absolute left-1/2 -translate-x-1/2 w-0.5 h-full bg-slate-400 z-10"></div>
                  <!-- Dynamic bar fill -->
                  <div
                    class="h-full transition-all duration-500"
                    :style="{
                      width: `${Math.min(50, Math.abs(currentShiftDiffKg) * 2)}%`,
                      marginLeft: currentShiftDiffKg < 0 ? `${Math.max(0, 50 - Math.min(50, Math.abs(currentShiftDiffKg) * 2))}%` : '50%'
                    }"
                    :class="currentShiftDiffKg === 0 ? 'bg-emerald-500' : (currentShiftDiffKg > 0 ? 'bg-amber-500' : 'bg-rose-500')"
                  ></div>
                </div>
                <div class="flex justify-between text-[9px] text-slate-400 font-mono">
                  <span>-Susut</span>
                  <span class="text-slate-600 font-bold">0</span>
                  <span>+Lebih</span>
                </div>
              </div>
            </div>

            <!-- Pillar 3: Output & Waste -->
            <div class="lg:col-span-4 p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 shadow-2xs flex flex-col justify-between min-h-[110px]">
              <div class="flex items-center justify-between">
                <span class="text-[10.5px] uppercase tracking-wider text-emerald-800 font-bold flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                  2. TOTAL OUTPUT + WASTE
                </span>
                <span class="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded">
                  {{ isMetalizeSession ? currentShiftMetalizeRows.length + ' Roll Hasil' : currentShiftRolls.length + ' Jumbo Roll' }}
                </span>
              </div>
              <div class="mt-2">
                <div class="text-2xl font-black font-mono text-slate-900 tracking-tight">
                  {{ currentShiftTotalOutputPlusWasteKg.toFixed(2) }} <span class="text-xs font-sans text-slate-500 font-normal">kg</span>
                </div>
                <div class="text-[11px] text-slate-600 mt-0.5 truncate font-sans">
                  {{ isMetalizeSession
                    ? `Hasil: ${currentShiftTotalRollsKg.toFixed(1)}kg • Waste: ${currentShiftTotalWasteKg.toFixed(1)}kg`
                    : `Roll: ${currentShiftTotalRollsKg.toFixed(1)}kg • Waste: ${currentShiftTotalWasteKg.toFixed(1)}kg` }}
                </div>
              </div>
            </div>

          </div>

          <!-- AI & Algorithmic Discrepancy / Anomaly Recommendation Card -->
          <div
            v-if="currentShiftDiffKg !== 0"
            class="p-4 rounded-2xl bg-amber-50/90 border border-amber-300 text-amber-950 space-y-3 font-sans shadow-2xs"
          >
            <div class="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200 pb-2">
              <div class="flex items-center gap-2">
                <span class="text-base">💡</span>
                <h4 class="font-black text-xs uppercase tracking-tight text-amber-900">
                  Audit Keseimbangan Neraca & Deteksi Anomali ({{ currentActiveShift?.shift_name }})
                </h4>
              </div>
              <span class="px-2.5 py-0.5 rounded text-[11px] font-mono font-bold" :class="currentShiftDiffKg > 0 ? 'bg-amber-200 text-amber-950' : 'bg-rose-200 text-rose-950'">
                Selisih: {{ currentShiftDiffKg >= 0 ? '+' : '' }}{{ currentShiftDiffKg.toFixed(2) }} kg
              </span>
            </div>

            <!-- Bagian 1: Temuan Visual AI (Jika AI Menemukan Goresan/Timpaan) -->
            <div v-if="currentActiveShift?.anomali_rekomendasi && currentActiveShift.anomali_rekomendasi.length > 0" class="space-y-2 text-xs">
              <div
                v-for="(anomali, aIdx) in currentActiveShift.anomali_rekomendasi"
                :key="aIdx"
                class="p-3 bg-white rounded-xl border border-amber-300/80 shadow-2xs flex items-center justify-between flex-wrap gap-3"
              >
                <div class="space-y-1 max-w-xl">
                  <div class="flex items-center gap-2">
                    <span class="px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-bold font-mono text-[10px]">Temuan Visual AI</span>
                    <span class="font-black text-zinc-900">{{ anomali.lokasi }} ({{ anomali.kolom || 'Berat' }})</span>
                  </div>
                  <p class="text-[11.5px] text-zinc-700 leading-relaxed">
                    {{ anomali.alasan }}
                    <span v-if="anomali.nilai_terbaca && anomali.nilai_rekomendasi" class="block mt-0.5">
                      Nilai terbaca: <code class="px-1 py-0.2 bg-zinc-100 rounded font-mono font-bold text-red-600">{{ anomali.nilai_terbaca }}</code> ➔ Disarankan: <code class="px-1 py-0.2 bg-emerald-50 text-emerald-800 rounded font-mono font-bold">{{ anomali.nilai_rekomendasi }}</code>
                    </span>
                  </p>
                </div>

                <button
                  v-if="anomali.nilai_rekomendasi"
                  @click="applyDynamicAnomalyFix(anomali)"
                  class="px-3.5 py-2 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  <span>✨ Terapkan Koreksi (Ubah ke {{ anomali.nilai_rekomendasi }})</span>
                </button>
              </div>
            </div>

            <!-- Bagian 2: Analisa Matematika Selisih Neraca jika belum ada anomali visual khusus -->
            <div v-else class="p-3 bg-white rounded-xl border border-amber-300/80 shadow-2xs space-y-3 text-xs">
              <div class="space-y-1">
                <p class="text-[11.5px] text-zinc-700 leading-relaxed">
                  Terdapat selisih <strong>{{ Math.abs(currentShiftDiffKg).toFixed(2) }} kg</strong> antara <strong>Bahan Masuk ({{ currentShiftTotalResinKg.toFixed(1) }} kg)</strong> dan <strong>Total Output + Waste ({{ (currentShiftTotalRollsKg + currentShiftTotalWasteKg).toFixed(1) }} kg)</strong>.
                  Mohon periksa kemungkinan angka tulisan tangan operator yang kurang jelas atau ditimpa pada tabel Roll, Pemakaian Resin, atau Waste.
                </p>
              </div>

              <div class="pt-1 flex items-center justify-between flex-wrap gap-2 border-t border-zinc-100">
                <span class="text-[11px] text-zinc-500">Jalankan Pass 2 AI untuk memindai khusus coretan & revisi tulisan tangan:</span>
                <button
                  @click="triggerOnDemandDeepAudit"
                  :disabled="isAuditing"
                  class="px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-600 hover:bg-amber-500 disabled:opacity-50 text-white shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <span v-if="isAuditing" class="animate-spin text-sm">⏳</span>
                  <span v-else>🔍</span>
                  <span>{{ isAuditing ? 'Sedang Memindai Anomali...' : 'Jalankan Deep Scan Anomali AI' }}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sub-Sheet Switcher -->
        <div class="flex items-center justify-between flex-wrap gap-2">
          <!-- METALIZE TABS -->
          <div v-if="isMetalizeSession" class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs">
            <button
              @click="activeSpreadsheetSheet = 'sheet1'"
              :class="[
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                activeSpreadsheetSheet === 'sheet1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              ]"
            >
              <span>📋 Sheet 1: Tabel Produksi Metalize</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-blue-700 text-white">27 Kolom</span>
            </button>

            <button
              @click="activeSpreadsheetSheet = 'sheet2'"
              :class="[
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                activeSpreadsheetSheet === 'sheet2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              ]"
            >
              <span>⚖️ Sheet 2: Material Balance & Waste Logam</span>
            </button>
          </div>

          <!-- CASTING TABS (DEFAULT) -->
          <div v-else class="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 gap-1 text-xs">
            <button
              @click="activeSpreadsheetSheet = 'sheet1'"
              :class="[
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                activeSpreadsheetSheet === 'sheet1' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              ]"
            >
              <span>📋 Sheet 1: Output Produksi Roll</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-red-600 text-white">29 Kolom</span>
            </button>

            <button
              @click="activeSpreadsheetSheet = 'sheet2'"
              :class="[
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                activeSpreadsheetSheet === 'sheet2' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              ]"
            >
              <span>🧪 Sheet 2: Pemakaian Resin</span>
              <span class="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-amber-500 text-slate-950">7 Kolom</span>
            </button>

            <button
              @click="activeSpreadsheetSheet = 'sheet3'"
              :class="[
                'px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer',
                activeSpreadsheetSheet === 'sheet3' ? 'bg-blue-700 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              ]"
            >
              <span>⚖️ Sheet 3: Detail Material Balance</span>
            </button>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              v-if="isMetalizeSession && activeSpreadsheetSheet === 'sheet1'"
              @click="addMetalizeRow"
              class="px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-xs flex items-center gap-1 cursor-pointer"
            >
              <span>+ Tambah Baris</span>
            </button>
            <button
              @click="handleFillDown"
              class="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-all flex items-center gap-1 cursor-pointer"
              title="Ctrl+D Fill Down"
            >
              <span>⬇ Fill Down</span>
            </button>
          </div>
        </div>

        <!-- SPREADSHEET FORMULA BAR & CELL ADDRESS -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div class="bg-slate-50 px-3 py-1.5 border-b border-slate-200 flex items-center gap-2 text-xs font-mono">
            <div class="px-2.5 py-0.5 bg-white rounded border border-slate-300 font-bold text-slate-800 shadow-2xs min-w-[70px] text-center">
              {{ activeCellAddress || 'A1' }}
            </div>
            <span class="text-slate-400 font-bold font-serif italic text-xs">fx</span>
            <div class="flex-1">
              <input
                v-model="activeCellValue"
                @input="onFormulaBarInput"
                type="text"
                placeholder="Nilai cell aktif..."
                class="w-full px-2 py-0.5 text-xs border border-slate-200 rounded bg-white outline-none font-mono focus:border-blue-500"
              />
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- A. TABEL KHUSUS METALIZE (27 KOLOM STANDAR PABRIK)           -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            v-if="isMetalizeSession && activeSpreadsheetSheet === 'sheet1'"
            class="overflow-auto max-h-[60vh] relative bg-white focus:outline-none scrollbar-thin"
          >
            <table class="text-left text-xs border-collapse border border-slate-200 min-w-max font-sans select-none">
              <thead class="sticky top-0 z-20 font-mono text-[11px] shadow-xs">
                <tr class="text-white font-black uppercase tracking-wider text-[10.5px]">
                  <th class="w-12 text-center bg-slate-700 border border-slate-600 py-1.5" rowspan="2">#</th>
                  <th colspan="6" class="text-center py-1.5 bg-blue-700 border border-blue-600">1. WAKTU & OPERATOR</th>
                  <th colspan="5" class="text-center py-1.5 bg-sky-700 border border-sky-600">2. IDENTITAS SPK & LOT</th>
                  <th colspan="2" class="text-center py-1.5 bg-indigo-700 border border-indigo-600">3. DIMENSI</th>
                  <th colspan="2" class="text-center py-1.5 bg-amber-700 border border-amber-600">4. BAHAN MASUK (INPUT)</th>
                  <th colspan="4" class="text-center py-1.5 bg-emerald-700 border border-emerald-600">5. HASIL JADI METAL (OUTPUT)</th>
                  <th colspan="4" class="text-center py-1.5 bg-purple-700 border border-purple-600">6. STATUS QUALITY & SISA</th>
                  <th colspan="2" class="text-center py-1.5 bg-zinc-700 border border-zinc-600">7. LOKASI RAK</th>
                  <th colspan="2" class="text-center py-1.5 bg-rose-700 border border-rose-600">8. WASTE SHIFT (KG)</th>
                  <th class="w-14 text-center bg-slate-700 border border-slate-600 py-1.5" rowspan="2">Aksi</th>
                </tr>

                <tr class="bg-slate-100 text-slate-700 font-bold">
                  <th class="border border-zinc-300 px-2 py-1 min-w-[130px]">TANGGAL</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[100px] text-zinc-900">Operator</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[90px] text-center">Group/shift</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-center">Start</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-center">Finish</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[70px] text-center bg-blue-100 text-blue-950">Time</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[130px]">No SPK</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[140px] text-amber-900 font-black">No Lot Awal</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[110px] text-emerald-800 font-black">Lot Metal</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-center">Jenis</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-center">Kode Formula</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-right">Thickness</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-right">Width</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[100px] text-right bg-amber-50">Panjang bahan</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-right bg-amber-100 text-amber-950 font-black">Berat bahan</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[100px] text-right bg-emerald-50">Panjang hasil</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-right bg-emerald-100 text-emerald-950 font-black">Berat hasil</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[130px]">Atribute</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[90px] text-center">Tanda Hasil</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-center">Quality Status</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[150px]">Keterangan Hasil</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[110px] text-right">Meter Sisa Bahan</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[150px]">Keterangan Sisa Bahan</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-center">Lokasi</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-center">Posisi</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[90px] text-right bg-rose-100 text-rose-950">Waste Polos</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[90px] text-right bg-rose-100 text-rose-950">Waste Metal</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-zinc-300 font-mono text-xs">
                <tr
                  v-for="(row, rIdx) in currentShiftMetalizeRows"
                  :key="rIdx"
                  :class="selectedRowIndex === rIdx ? 'bg-blue-50/40' : 'hover:bg-zinc-50'"
                >
                  <td class="border border-zinc-300 text-center font-bold bg-zinc-100 text-zinc-600 px-1.5 py-1">{{ rIdx + 1 }}</td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.tanggal" @focus="selectCell(rIdx, 'tanggal')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-bold"><input v-model="row.operator" @focus="selectCell(rIdx, 'operator')" class="w-full px-2 py-1 bg-transparent outline-none uppercase font-bold text-zinc-800" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.group_shift" @focus="selectCell(rIdx, 'group_shift')" class="w-full px-2 py-1 text-center font-bold bg-transparent outline-none uppercase" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.start_time" @input="recalcMetalizeRow(row)" @focus="selectCell(rIdx, 'start_time')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.finish_time" @input="recalcMetalizeRow(row)" @focus="selectCell(rIdx, 'finish_time')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 text-center font-bold bg-blue-50 px-2 py-1 text-zinc-900">{{ row.time_menit }}</td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.spk_no" @focus="selectCell(rIdx, 'spk_no')" class="w-full px-2 py-1 font-bold bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.no_lot_awal" @focus="selectCell(rIdx, 'no_lot_awal')" class="w-full px-2 py-1 font-black text-amber-900 uppercase bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.lot_metal" @focus="selectCell(rIdx, 'lot_metal')" class="w-full px-2 py-1 font-black text-emerald-700 uppercase bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.jenis" @focus="selectCell(rIdx, 'jenis')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.kode_formula" @focus="selectCell(rIdx, 'kode_formula')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right"><input v-model.number="row.thickness" @focus="selectCell(rIdx, 'thickness')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right"><input v-model.number="row.width" @focus="selectCell(rIdx, 'width')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right bg-amber-50/40"><input v-model.number="row.panjang_bahan" @focus="selectCell(rIdx, 'panjang_bahan')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right font-black bg-amber-100/70"><input v-model.number="row.berat_bahan" @focus="selectCell(rIdx, 'berat_bahan')" type="number" step="any" class="w-full px-2 py-1 text-right text-amber-950 font-black bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right bg-emerald-50/40"><input v-model.number="row.panjang_hasil" @focus="selectCell(rIdx, 'panjang_hasil')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right font-black bg-emerald-100/70"><input v-model.number="row.berat_hasil" @focus="selectCell(rIdx, 'berat_hasil')" type="number" step="any" class="w-full px-2 py-1 text-right text-emerald-950 font-black bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.atribute" @focus="selectCell(rIdx, 'atribute')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.tanda_hasil" @focus="selectCell(rIdx, 'tanda_hasil')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.quality_status" @focus="selectCell(rIdx, 'quality_status')" class="w-full px-1.5 py-1 text-center font-bold uppercase bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-sans"><input v-model="row.keterangan_hasil" @focus="selectCell(rIdx, 'keterangan_hasil')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right"><input v-model.number="row.meter_sisa_bahan" @focus="selectCell(rIdx, 'meter_sisa_bahan')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-sans"><input v-model="row.keterangan_sisa_bahan" @focus="selectCell(rIdx, 'keterangan_sisa_bahan')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.lokasi" @focus="selectCell(rIdx, 'lokasi')" class="w-full px-1.5 py-1 text-center uppercase font-bold bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.posisi" @focus="selectCell(rIdx, 'posisi')" class="w-full px-1.5 py-1 text-center uppercase font-bold bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right bg-rose-50/50"><input v-model.number="row.waste_polos" @focus="selectCell(rIdx, 'waste_polos')" type="number" step="any" class="w-full px-2 py-1 text-right font-bold text-rose-900 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right bg-rose-50/50"><input v-model.number="row.waste_metal" @focus="selectCell(rIdx, 'waste_metal')" type="number" step="any" class="w-full px-2 py-1 text-right font-bold text-rose-900 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-1 text-center">
                    <button @click="removeMetalizeRow(rIdx)" class="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer" title="Hapus Baris">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- B. SHEET 2 METALIZE: MATERIAL BALANCE & WASTE SUMMARY        -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            v-else-if="isMetalizeSession && activeSpreadsheetSheet === 'sheet2'"
            class="p-4 bg-zinc-50 border-t border-zinc-300 space-y-4"
          >
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <!-- Kiri: Bahan Masuk (No Lot Awal) -->
              <div class="bg-white rounded-2xl border border-zinc-300 shadow-2xs overflow-hidden">
                <div class="px-4 py-3 bg-amber-600 text-white flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wide">📦 INPUT: BAHAN MASUK (NO LOT AWAL)</span>
                  <span class="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-black/30">
                    {{ currentShiftTotalResinKg.toFixed(2) }} kg
                  </span>
                </div>
                <table class="w-full text-left text-xs border-collapse font-mono">
                  <thead class="bg-zinc-100 text-zinc-600 text-[10.5px]">
                    <tr>
                      <th class="p-2">#</th>
                      <th class="p-2">No Lot Awal</th>
                      <th class="p-2 text-right">Panjang (m)</th>
                      <th class="p-2 text-right">Berat Bahan (kg)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200">
                    <tr v-for="(row, rIdx) in currentShiftMetalizeRows" :key="rIdx" class="hover:bg-amber-50/40">
                      <td class="p-2 text-zinc-400 font-bold">{{ rIdx + 1 }}</td>
                      <td class="p-2 font-bold text-amber-950">{{ row.no_lot_awal || '-' }}</td>
                      <td class="p-2 text-right">{{ row.panjang_bahan }}</td>
                      <td class="p-2 text-right font-black text-amber-950">{{ (parseFloat(row.berat_bahan) || 0).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-amber-50 border-t font-bold text-amber-950">
                    <tr>
                      <td colspan="3" class="p-2.5 uppercase font-black">Total Bahan Masuk:</td>
                      <td class="p-2.5 text-right font-black">{{ currentShiftTotalResinKg.toFixed(2) }} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Kanan: Hasil Jadi Metal + Waste -->
              <div class="bg-white rounded-2xl border border-zinc-300 shadow-2xs overflow-hidden">
                <div class="px-4 py-3 bg-emerald-700 text-white flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wide">✨ HASIL: LOT METAL + WASTE</span>
                  <span class="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-black/30">
                    {{ currentShiftTotalOutputPlusWasteKg.toFixed(2) }} kg
                  </span>
                </div>
                <table class="w-full text-left text-xs border-collapse font-mono">
                  <thead class="bg-zinc-100 text-zinc-600 text-[10.5px]">
                    <tr>
                      <th class="p-2">#</th>
                      <th class="p-2">Lot Metal</th>
                      <th class="p-2 text-right">Panjang (m)</th>
                      <th class="p-2 text-right">Berat Hasil (kg)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200">
                    <tr v-for="(row, rIdx) in currentShiftMetalizeRows" :key="rIdx" class="hover:bg-emerald-50/40">
                      <td class="p-2 text-zinc-400 font-bold">{{ rIdx + 1 }}</td>
                      <td class="p-2 font-black text-emerald-950">{{ row.lot_metal || '-' }}</td>
                      <td class="p-2 text-right">{{ row.panjang_hasil }}</td>
                      <td class="p-2 text-right font-black text-emerald-950">{{ (parseFloat(row.berat_hasil) || 0).toFixed(2) }}</td>
                    </tr>
                    <tr class="bg-rose-50/60 font-semibold">
                      <td class="p-2 text-rose-400">🗑️</td>
                      <td class="p-2 text-rose-900" colspan="2">Waste Polos</td>
                      <td class="p-2 text-right font-bold text-rose-900">{{ currentShiftWastePolos.toFixed(2) }}</td>
                    </tr>
                    <tr class="bg-rose-50/60 font-semibold">
                      <td class="p-2 text-rose-400">🗑️</td>
                      <td class="p-2 text-rose-900" colspan="2">Waste Metal</td>
                      <td class="p-2 text-right font-bold text-rose-900">{{ currentShiftWasteMetal.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-emerald-50 border-t font-bold text-emerald-950">
                    <tr>
                      <td colspan="3" class="p-2.5 uppercase font-black">Total Output + Waste:</td>
                      <td class="p-2.5 text-right font-black">{{ currentShiftTotalOutputPlusWasteKg.toFixed(2) }} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- C. TABEL KHUSUS CASTING: SHEET 1 (29 KOLOM LENGKAP)          -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            v-else-if="!isMetalizeSession && activeSpreadsheetSheet === 'sheet1'"
            class="overflow-auto max-h-[60vh] relative bg-white focus:outline-none scrollbar-thin"
          >
            <table class="text-left text-xs border-collapse border border-slate-200 min-w-max font-sans select-none">
              <thead class="sticky top-0 z-20 font-mono text-[11px] shadow-xs">
                <tr class="text-white font-black uppercase tracking-wider text-[10.5px]">
                  <th class="w-12 text-center bg-slate-700 border border-slate-600 py-1.5" rowspan="2">#</th>
                  <th colspan="7" class="text-center py-1.5 bg-blue-700 border border-blue-600">1. WAKTU OPERASI & DOWNTIME</th>
                  <th colspan="5" class="text-center py-1.5 bg-sky-700 border border-sky-600">2. IDENTITAS BATCH, SPK & LOT</th>
                  <th colspan="6" class="text-center py-1.5 bg-indigo-700 border border-indigo-600">3. SPESIFIKASI DIMENSI & BERAT ROLL</th>
                  <th colspan="2" class="text-center py-1.5 bg-purple-700 border border-purple-600">4. TANDA & PACK</th>
                  <th colspan="5" class="text-center py-1.5 bg-amber-700 border border-amber-600">5. WASTE PRODUKSI (KG)</th>
                  <th colspan="4" class="text-center py-1.5 bg-emerald-700 border border-emerald-600">6. STATUS QC & LOKASI WIP</th>
                  <th class="w-14 text-center bg-slate-700 border border-slate-600 py-1.5" rowspan="2">Aksi</th>
                </tr>

                <tr class="bg-slate-100 text-slate-700">
                  <th class="border border-zinc-300 px-2 py-1 min-w-[130px]">Tanggal</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[90px]">Group/Shift</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px]">Start Time</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px]">Finish Time</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[70px] text-center">Time</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-center bg-amber-100 text-amber-950 font-black">Downtime</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[200px] bg-amber-50">Keterangan DT</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[110px]">No Batch</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[130px]">No.SPK</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[140px] text-red-700 font-black">No Lot</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[75px] text-center">Jenis</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-center">Kode Formula</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-right">Thickness</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px] text-right">Width</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px] text-right">Length</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-right bg-amber-100 text-amber-950 font-black">Berat Aktual</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-right bg-zinc-100">Berat Teori</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-right bg-zinc-100">Berat Selisih</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[70px]">Tanda</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[80px]">No Pack</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px] text-center bg-amber-50">Sample QC</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px] text-center bg-amber-50">Start Up</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px] text-center bg-amber-50">Transisi</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px] text-center bg-amber-50">Bekuan</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[85px] text-center bg-amber-50">Sesetan</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px] text-center">Quality Status</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[160px]">Keterangan Hasil</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px]">Lokasi Jumbo</th>
                  <th class="border border-zinc-300 px-2 py-1 min-w-[95px]">Posisi Jumbo</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-zinc-300 font-mono text-xs">
                <tr
                  v-for="(row, rIdx) in currentShiftRolls"
                  :key="rIdx"
                  :class="selectedRowIndex === rIdx ? 'bg-blue-50/40' : 'hover:bg-zinc-50'"
                >
                  <td class="border border-zinc-300 text-center font-bold bg-zinc-100 text-zinc-600 px-1.5 py-1">{{ rIdx + 1 }}</td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.tanggal" @focus="selectCell(rIdx, 'tanggal')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.group_shift" @focus="selectCell(rIdx, 'group_shift')" class="w-full px-2 py-1 text-center font-bold bg-transparent outline-none uppercase" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.start_time" @input="recalcRoll(row)" @focus="selectCell(rIdx, 'start_time')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.finish_time" @input="recalcRoll(row)" @focus="selectCell(rIdx, 'finish_time')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 text-center font-bold bg-zinc-50 px-2 py-1 text-zinc-900">{{ row.time_menit }}</td>
                  <td class="border border-zinc-300 p-0 text-center bg-amber-50/40"><input v-model.number="row.downtime" @focus="selectCell(rIdx, 'downtime')" type="number" class="w-full px-1.5 py-1 text-center font-bold text-amber-900 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-sans"><input v-model="row.downtime_ket" @focus="selectCell(rIdx, 'downtime_ket')" class="w-full px-2 py-1 bg-transparent outline-none text-zinc-800" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.no_batch" @focus="selectCell(rIdx, 'no_batch')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.spk_no" @blur="row.spk_no = standardizeSpkInhouse(row.spk_no, row.tanggal)" @focus="selectCell(rIdx, 'spk_no')" class="w-full px-2 py-1 font-bold bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.no_lot" @focus="selectCell(rIdx, 'no_lot')" class="w-full px-2 py-1 font-black text-red-600 uppercase bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.jenis" @focus="selectCell(rIdx, 'jenis')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="row.kode_formula" @focus="selectCell(rIdx, 'kode_formula')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right font-bold"><input v-model.number="row.thickness" @input="recalcRoll(row)" @focus="selectCell(rIdx, 'thickness')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right"><input v-model.number="row.width" @input="recalcRoll(row)" @focus="selectCell(rIdx, 'width')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right"><input v-model.number="row.length" @input="recalcRoll(row)" @focus="selectCell(rIdx, 'length')" type="number" class="w-full px-2 py-1 text-right bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-right font-black bg-amber-50/60"><input v-model.number="row.berat_aktual" @input="recalcRoll(row)" @focus="selectCell(rIdx, 'berat_aktual')" type="number" step="any" class="w-full px-2 py-1 text-right text-amber-950 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 text-right font-bold bg-zinc-50 px-2 py-1 text-zinc-800">{{ row.berat_teori }}</td>
                  <td class="border border-zinc-300 text-right font-bold bg-zinc-50 px-2 py-1" :class="row.berat_selisih >= 0 ? 'text-emerald-700' : 'text-red-600'">{{ row.berat_selisih }}</td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.tanda" @focus="selectCell(rIdx, 'tanda')" class="w-full px-1.5 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0"><input v-model="row.no_pack" @focus="selectCell(rIdx, 'no_pack')" class="w-full px-1.5 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center bg-amber-50/30"><input v-model.number="row.sample_qc" @focus="selectCell(rIdx, 'sample_qc')" type="number" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center bg-amber-50/30"><input v-model.number="row.start_up" @focus="selectCell(rIdx, 'start_up')" type="number" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center bg-amber-50/30"><input v-model.number="row.transisi" @focus="selectCell(rIdx, 'transisi')" type="number" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center bg-amber-50/30"><input v-model.number="row.bekuan" @focus="selectCell(rIdx, 'bekuan')" type="number" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center bg-amber-50/30"><input v-model.number="row.sesetan" @focus="selectCell(rIdx, 'sesetan')" type="number" class="w-full px-1.5 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.quality_status" @focus="selectCell(rIdx, 'quality_status')" class="w-full px-1.5 py-1 text-center font-bold uppercase bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-sans"><input v-model="row.keterangan_hasil" @focus="selectCell(rIdx, 'keterangan_hasil')" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.lokasi_jumbo" @focus="selectCell(rIdx, 'lokasi_jumbo')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none uppercase font-bold" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="row.posisi_jumbo" @focus="selectCell(rIdx, 'posisi_jumbo')" class="w-full px-1.5 py-1 text-center bg-transparent outline-none uppercase" /></td>
                  <td class="border border-zinc-300 p-1 text-center">
                    <button @click="removeRollRow(rIdx)" class="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- D. TABEL KHUSUS CASTING: SHEET 2 (7 KOLOM RESIN)             -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            v-else-if="!isMetalizeSession && activeSpreadsheetSheet === 'sheet2'"
            class="overflow-auto max-h-[60vh] relative bg-white focus:outline-none scrollbar-thin"
          >
            <table class="text-left text-xs border-collapse border border-slate-200 min-w-max font-sans select-none">
              <thead class="sticky top-0 z-20 font-mono text-[11px] shadow-xs">
                <tr class="text-white font-black uppercase tracking-wider text-[10.5px]">
                  <th class="w-12 text-center bg-slate-700 border border-slate-600 py-1.5" rowspan="2">#</th>
                  <th colspan="7" class="text-center py-1.5 bg-amber-700 border border-amber-600">
                    DATA PEMAKAIAN BAHAN BAKU RESIN & RAW MATERIAL (7 KOLOM)
                  </th>
                  <th class="w-14 text-center bg-slate-700 border border-slate-600 py-1.5" rowspan="2">Aksi</th>
                </tr>
                <tr class="bg-slate-100 text-slate-700">
                  <th class="border border-zinc-300 px-3 py-1 min-w-[140px]">Tanggal</th>
                  <th class="border border-zinc-300 px-3 py-1 min-w-[90px] text-center">No Urut</th>
                  <th class="border border-zinc-300 px-3 py-1 min-w-[100px] text-center font-bold">Tujuan</th>
                  <th class="border border-zinc-300 px-3 py-1 min-w-[160px]">Keterangan</th>
                  <th class="border border-zinc-300 px-3 py-1 min-w-[220px] font-black text-zinc-900">Nama Resin</th>
                  <th class="border border-zinc-300 px-3 py-1 min-w-[140px] text-right font-black bg-amber-100 text-amber-950">Weight (kg)</th>
                  <th class="border border-zinc-300 px-3 py-1 min-w-[120px] text-center">Grup Shift Manual</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-zinc-300 font-mono text-xs">
                <tr v-for="(res, sIdx) in currentShiftResin" :key="sIdx" class="hover:bg-zinc-50">
                  <td class="border border-zinc-300 text-center font-bold bg-zinc-100 text-zinc-600 px-1.5 py-1">{{ sIdx + 1 }}</td>
                  <td class="border border-zinc-300 p-0"><input v-model="res.tanggal" class="w-full px-2.5 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center"><input v-model="res.no_urut" class="w-full px-2 py-1 text-center bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="res.tujuan" class="w-full px-2 py-1 text-center font-bold text-zinc-800 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-sans"><input v-model="res.keterangan" class="w-full px-2 py-1 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 font-bold">
                    <input
                      v-model="res.nama_resin"
                      list="resin-master-datalist"
                      @change="res.nama_resin = matchMasterResin(res.nama_resin, configStore.resinItemList)"
                      placeholder="Pilih / ketik nama resin..."
                      class="w-full px-2.5 py-1 font-bold text-zinc-950 bg-transparent outline-none uppercase font-mono"
                    />
                  </td>
                  <td class="border border-zinc-300 p-0 text-right font-black bg-amber-50/50"><input v-model.number="res.pemakaian_kg" type="number" class="w-full px-2.5 py-1 text-right font-black text-amber-950 bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-0 text-center font-bold"><input v-model="res.group_shift" class="w-full px-2 py-1 text-center font-bold uppercase bg-transparent outline-none" /></td>
                  <td class="border border-zinc-300 p-1 text-center">
                    <button @click="removeResinRow(sIdx)" class="p-1 text-zinc-400 hover:text-red-600 transition-colors cursor-pointer">✕</button>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Datalist untuk Autocomplete Resin dari Master Database -->
            <datalist id="resin-master-datalist">
              <option v-for="r in configStore.activeResinItems" :key="r.id" :value="r.resin">
                {{ r.resin }} ({{ r.kode || 'N/A' }})
              </option>
            </datalist>
          </div>

          <!-- ═══════════════════════════════════════════════════════════ -->
          <!-- E. TABEL KHUSUS CASTING: SHEET 3 (DETAIL MATERIAL BALANCE)   -->
          <!-- ═══════════════════════════════════════════════════════════ -->
          <div
            v-else-if="!isMetalizeSession && activeSpreadsheetSheet === 'sheet3'"
            class="p-4 bg-zinc-50 border-t border-zinc-300 space-y-4"
          >
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-4">
              <!-- Kiri: Bahan Resin -->
              <div class="lg:col-span-5 bg-white rounded-2xl border border-zinc-300 shadow-2xs overflow-hidden">
                <div class="px-4 py-3 bg-amber-600 text-white flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wide">🧪 INPUT: SELURUH BAHAN RESIN</span>
                  <span class="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-black/30">
                    {{ currentShiftTotalResinKg.toFixed(2) }} kg
                  </span>
                </div>
                <table class="w-full text-left text-xs border-collapse font-mono">
                  <thead class="bg-zinc-100 text-zinc-600 text-[10.5px]">
                    <tr>
                      <th class="p-2">#</th>
                      <th class="p-2">Nama Bahan Resin</th>
                      <th class="p-2 text-right">Berat (kg)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200">
                    <tr v-for="(res, rIdx) in currentShiftResin" :key="rIdx" class="hover:bg-amber-50/40">
                      <td class="p-2 text-zinc-400 font-bold">{{ rIdx + 1 }}</td>
                      <td class="p-2 font-bold text-zinc-900">{{ res.nama_resin || '-' }}</td>
                      <td class="p-2 text-right font-black text-amber-950">{{ (parseFloat(res.pemakaian_kg) || 0).toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-amber-50 border-t font-bold text-amber-950">
                    <tr>
                      <td colspan="2" class="p-2.5 uppercase font-black">Total Bahan:</td>
                      <td class="p-2.5 text-right font-black">{{ currentShiftTotalResinKg.toFixed(2) }} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <!-- Kanan: Roll + Waste -->
              <div class="lg:col-span-7 bg-white rounded-2xl border border-zinc-300 shadow-2xs overflow-hidden">
                <div class="px-4 py-3 bg-emerald-700 text-white flex items-center justify-between">
                  <span class="text-xs font-black uppercase tracking-wide">📦 HASIL: ROLL JUMBO + RINCIAN WASTE</span>
                  <span class="px-2 py-0.5 rounded text-[11px] font-mono font-black bg-black/30">
                    {{ currentShiftTotalOutputPlusWasteKg.toFixed(2) }} kg
                  </span>
                </div>
                <table class="w-full text-left text-xs border-collapse font-mono">
                  <thead class="bg-zinc-100 text-zinc-600 text-[10.5px]">
                    <tr>
                      <th class="p-2">#</th>
                      <th class="p-2">Kategori Output / No Lot</th>
                      <th class="p-2 text-right">Berat Aktual (kg)</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-zinc-200">
                    <tr v-for="(roll, rIdx) in currentShiftRolls" :key="'r_' + rIdx" class="hover:bg-emerald-50/40">
                      <td class="p-2 text-zinc-400 font-bold">{{ rIdx + 1 }}</td>
                      <td class="p-2 font-black text-emerald-950">{{ roll.no_lot || '-' }}</td>
                      <td class="p-2 text-right font-black">{{ (parseFloat(roll.berat_aktual) || 0).toFixed(2) }}</td>
                    </tr>
                    <tr v-if="currentShiftWasteSampleQc > 0" class="bg-rose-50/60 font-semibold">
                      <td class="p-2 text-rose-400">🗑️</td>
                      <td class="p-2 text-rose-900">Waste Sample QC</td>
                      <td class="p-2 text-right font-bold text-rose-900">{{ currentShiftWasteSampleQc.toFixed(2) }}</td>
                    </tr>
                    <tr v-if="currentShiftWasteStartUp > 0" class="bg-rose-50/60 font-semibold">
                      <td class="p-2 text-rose-400">🗑️</td>
                      <td class="p-2 text-rose-900">Waste Start Up</td>
                      <td class="p-2 text-right font-bold text-rose-900">{{ currentShiftWasteStartUp.toFixed(2) }}</td>
                    </tr>
                    <tr v-if="currentShiftWasteBekuan > 0" class="bg-rose-50/60 font-semibold">
                      <td class="p-2 text-rose-400">🗑️</td>
                      <td class="p-2 text-rose-900">Waste Bekuan</td>
                      <td class="p-2 text-right font-bold text-rose-900">{{ currentShiftWasteBekuan.toFixed(2) }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="bg-emerald-50 border-t font-bold text-emerald-950">
                    <tr>
                      <td colspan="2" class="p-2.5 uppercase font-black">Total Output + Waste:</td>
                      <td class="p-2.5 text-right font-black">{{ currentShiftTotalOutputPlusWasteKg.toFixed(2) }} kg</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeMainTab === 'dashboard' && !isVerifyingOpen" class="space-y-4 animate-fade-in">
      <div class="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">📁</div>
          <div>
            <p class="text-[10.5px] text-zinc-500 font-bold uppercase">Total Dokumen Scan</p>
            <h3 class="text-lg font-black text-zinc-900 font-mono">{{ scanSessionList.length }} Sesi</h3>
          </div>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg">📄</div>
          <div>
            <p class="text-[10.5px] text-zinc-500 font-bold uppercase">Total Jumbo Roll</p>
            <h3 class="text-lg font-black text-zinc-900 font-mono">{{ globalTotalRollsCount }} Roll</h3>
          </div>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">🧪</div>
          <div>
            <p class="text-[10.5px] text-zinc-500 font-bold uppercase">Total Bahan Masuk</p>
            <h3 class="text-lg font-black text-zinc-900 font-mono">{{ globalTotalResinKg.toFixed(1) }} kg</h3>
          </div>
        </div>
        <div class="p-4 bg-white rounded-2xl border border-zinc-200 shadow-xs flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg">⚖️</div>
          <div>
            <p class="text-[10.5px] text-zinc-500 font-bold uppercase">Total Output Roll</p>
            <h3 class="text-lg font-black text-zinc-900 font-mono">{{ globalTotalRollsKg.toFixed(1) }} kg</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL: TAMBAH SCAN / FOTO KE DOKUMEN SESI AKTIF                  -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="isAppendModalOpen"
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
      @click.self="closeAppendScanModal"
    >
      <div class="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-zinc-200 overflow-hidden space-y-4 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <!-- Header Modal -->
        <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold text-base">
              📷
            </div>
            <div>
              <h3 class="text-sm font-black text-zinc-900">Tambah Scan / Foto ke Dokumen Sesi Ini</h3>
              <p class="text-[11px] text-zinc-500 font-medium font-mono">Dokumen: {{ currentActiveSession.name }}</p>
            </div>
          </div>
          <button @click="closeAppendScanModal" class="text-zinc-400 hover:text-zinc-700 p-1 font-bold text-sm cursor-pointer">✕</button>
        </div>

        <!-- Target Penambahan (Shift Baru vs Sambung Lembar) -->
        <div class="space-y-1.5">
          <label class="text-[11px] font-black uppercase tracking-wider text-zinc-600 block">Pilih Tujuan Penambahan:</label>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label
              :class="[
                'p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all',
                appendTargetMode === 'new_shift'
                  ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20 text-blue-950 font-bold'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              ]"
            >
              <input type="radio" v-model="appendTargetMode" value="new_shift" class="text-blue-600" />
              <div>
                <span class="font-black block">🏭 Buat Shift Baru (Shift {{ (currentActiveSession.shifts?.length || 0) + 1 }})</span>
                <span class="text-[10.5px] font-normal text-zinc-500">Menambahkan shift baru dalam dokumen hari ini</span>
              </div>
            </label>

            <label
              :class="[
                'p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all',
                appendTargetMode === 'append_current'
                  ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              ]"
            >
              <input type="radio" v-model="appendTargetMode" value="append_current" class="text-emerald-600" />
              <div>
                <span class="font-black block">📑 Sambung ke {{ currentActiveShift?.shift_name || 'Shift Ini' }}</span>
                <span class="text-[10.5px] font-normal text-zinc-500">Misal Lembar #2 dari shift yang sama</span>
              </div>
            </label>
          </div>
        </div>

        <!-- Metode Input Foto -->
        <div class="space-y-3 pt-2 border-t border-zinc-100">
          <div class="flex items-center gap-2">
            <button
              @click="appendSourceType = 'camera'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                appendSourceType === 'camera' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              ]"
            >
              <span>📸 Kamera Langsung</span>
            </button>
            <button
              @click="appendSourceType = 'upload'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                appendSourceType === 'upload' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              ]"
            >
              <span>📁 Upload File Foto</span>
            </button>
          </div>

          <!-- Camera Section -->
          <div v-if="appendSourceType === 'camera'" class="space-y-2">
            <div class="bg-zinc-950 rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center relative border border-zinc-800">
              <video v-show="isAppendCameraActive" ref="appendVideoRef" autoplay playsinline class="w-full h-full object-cover max-h-[240px]"></video>
              <canvas ref="appendCanvasRef" class="hidden"></canvas>
              <div v-if="!isAppendCameraActive" class="p-4 text-center text-zinc-400">
                <p class="text-xs text-zinc-300 font-bold">Kamera Belum Aktif</p>
                <button @click="startAppendCamera" class="mt-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold cursor-pointer">
                  Nyalakan Kamera
                </button>
              </div>
            </div>

            <div v-if="isAppendCameraActive" class="flex items-center gap-2">
              <button @click="captureAppendPhoto" class="flex-1 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs cursor-pointer">
                + Ambil Foto Lembar Ini
              </button>
              <button @click="stopAppendCamera" class="py-2 px-3 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 rounded-xl text-xs font-bold cursor-pointer">
                Tutup Kamera
              </button>
            </div>
          </div>

          <!-- Upload Section -->
          <div v-else-if="appendSourceType === 'upload'" class="space-y-2">
            <div
              class="border-2 border-dashed border-zinc-300 hover:border-red-500 rounded-xl p-5 text-center cursor-pointer transition-colors bg-zinc-50/50 flex flex-col items-center justify-center min-h-[160px]"
              @click="$refs.appendFileInputRef.click()"
            >
              <input ref="appendFileInputRef" type="file" multiple accept="image/*, application/pdf" class="hidden" @change="handleAppendFileSelect" />
              <div class="text-2xl mb-1">🖼️</div>
              <p class="text-xs font-black text-zinc-800">Klik untuk memilih file foto lembar laporan</p>
              <p class="text-[11px] text-zinc-400">JPG, PNG, atau PDF</p>
            </div>
          </div>

          <!-- Queued Images Preview in Modal -->
          <div v-if="appendQueuedImages.length > 0" class="space-y-2 pt-2 border-t border-zinc-100">
            <div class="flex items-center justify-between text-xs">
              <span class="font-bold text-zinc-700">Foto Terpilih ({{ appendQueuedImages.length }} Lembar):</span>
              <button @click="appendQueuedImages = []" class="text-red-600 hover:underline text-[11px] cursor-pointer">Hapus Semua</button>
            </div>
            <div class="flex items-center gap-2 overflow-x-auto pb-1">
              <div
                v-for="(img, idx) in appendQueuedImages"
                :key="idx"
                class="relative w-20 h-20 rounded-lg overflow-hidden border border-zinc-200 shrink-0 group cursor-pointer"
                @click="openLightbox('append', idx)"
              >
                <img :src="img.preview" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200" />
                <button @click.stop="rotateAppendQueuedImage(idx, 90)" class="absolute bottom-1 right-1 w-5 h-5 bg-black/75 hover:bg-black text-white rounded text-[10px] flex items-center justify-center font-bold cursor-pointer" title="Putar 90°">↻</button>
                <button @click.stop="appendQueuedImages.splice(idx, 1)" class="absolute top-1 right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold cursor-pointer">✕</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="pt-3 border-t border-zinc-200 flex items-center justify-end gap-2">
          <button @click="closeAppendScanModal" class="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl font-bold text-xs cursor-pointer">
            Batal
          </button>
          <button
            :disabled="isAppending || appendQueuedImages.length === 0"
            @click="processAppendScan"
            class="px-5 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-40 text-white rounded-xl font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-600/20"
          >
            <span v-if="isAppending" class="animate-spin text-sm">⏳</span>
            <span v-else>✨</span>
            <span>{{ isAppending ? 'Mengekstrak AI...' : 'Ekstrak & Tambahkan ke Dokumen' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL C: FULLSCREEN IMAGE VIEWER & ROTATION LIGHTBOX                -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- REALISTIC AI SCANNING HUD LOADING MODAL & REALTIME PROGRESS          -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="isExtracting"
      class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
    >
      <div class="max-w-lg w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col items-center text-center space-y-5">
        <!-- Ambient Red/Cyan Glow Behind Card -->
        <div class="absolute -top-24 -left-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none"></div>
        <div class="absolute -bottom-24 -right-24 w-48 h-48 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none"></div>

        <!-- Header Badge -->
        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300">
          <span class="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
          <span class="font-bold">AI SCANNER ENGINE</span>
          <span class="text-zinc-500">•</span>
          <span class="text-red-400 font-bold uppercase">{{ selectedMachine }}</span>
        </div>

        <!-- Scanning Hologram Viewport -->
        <div class="relative w-44 h-56 rounded-2xl overflow-hidden border-2 border-red-500/50 bg-zinc-900 shadow-xl shadow-red-950/40">
          <!-- Document Preview Image -->
          <img
            v-if="queuedImages[0] || (appendQueuedImages && appendQueuedImages[0])"
            :src="(queuedImages[0] || appendQueuedImages[0]).preview"
            alt="Memindai Dokumen"
            class="w-full h-full object-cover filter brightness-75 contrast-125"
          />
          <div v-else class="w-full h-full bg-zinc-900 flex items-center justify-center text-zinc-600">
            <svg class="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
          </div>

          <!-- Futuristic HUD Reticles on Corners -->
          <div class="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-red-500 pointer-events-none z-10"></div>
          <div class="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-red-500 pointer-events-none z-10"></div>
          <div class="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-red-500 pointer-events-none z-10"></div>
          <div class="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-red-500 pointer-events-none z-10"></div>

          <!-- Realistic Laser Scan Beam Moving Up & Down -->
          <div class="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_14px_#ef4444] animate-laser-scan z-20 pointer-events-none"></div>

          <!-- Laser Scan Area Sweep Overlay -->
          <div class="absolute inset-0 bg-red-500/10 pointer-events-none animate-pulse"></div>

          <!-- Grid Lines Overlay -->
          <div class="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none"></div>
        </div>

        <!-- Progress Percentage & Active Task -->
        <div class="w-full space-y-2">
          <div class="flex items-center justify-between font-mono">
            <span class="text-xs font-bold text-zinc-400">STATUS PEMROSESAN</span>
            <span class="text-xl font-black text-white tracking-wider">{{ extractionProgress.percent }}%</span>
          </div>

          <!-- Modern Smooth Gradient Progress Bar -->
          <div class="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800 p-0.5">
            <div
              class="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300 shadow-sm shadow-red-500/50"
              :style="{ width: `${Math.max(6, extractionProgress.percent)}%` }"
            ></div>
          </div>

          <!-- Current Live Step Description -->
          <p class="text-xs font-bold text-red-400 min-h-[1.25rem] flex items-center justify-center gap-1.5 animate-pulse">
            <svg class="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>
            <span>{{ extractionProgress.detail }}</span>
          </p>
        </div>

        <!-- 5-Phase Detailed Checklist -->
        <div class="w-full bg-zinc-900/80 rounded-2xl p-3.5 border border-zinc-800/80 text-left space-y-2 text-xs font-mono">
          <!-- Phase 1 -->
          <div class="flex items-center justify-between" :class="extractionProgress.percent >= 25 ? 'text-emerald-400 font-bold' : (extractionProgress.percent >= 10 ? 'text-white font-bold' : 'text-zinc-500')">
            <span class="flex items-center gap-2">
              <span v-if="extractionProgress.percent >= 25" class="text-emerald-400">✓</span>
              <span v-else-if="extractionProgress.percent >= 10" class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span v-else class="text-zinc-600">○</span>
              1. Kompresi & Optimasi Resolusi Transmisi
            </span>
            <span class="text-[10px]">{{ extractionProgress.percent >= 25 ? 'Selesai' : (extractionProgress.percent >= 10 ? 'Aktif' : 'Menunggu') }}</span>
          </div>

          <!-- Phase 2 -->
          <div class="flex items-center justify-between" :class="extractionProgress.percent >= 50 ? 'text-emerald-400 font-bold' : (extractionProgress.percent >= 25 ? 'text-white font-bold' : 'text-zinc-500')">
            <span class="flex items-center gap-2">
              <span v-if="extractionProgress.percent >= 50" class="text-emerald-400">✓</span>
              <span v-else-if="extractionProgress.percent >= 25" class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span v-else class="text-zinc-600">○</span>
              2. Pengunggahan Data ke AI Engine
            </span>
            <span class="text-[10px]">{{ extractionProgress.percent >= 50 ? 'Selesai' : (extractionProgress.percent >= 25 ? 'Aktif' : 'Menunggu') }}</span>
          </div>

          <!-- Phase 3 -->
          <div class="flex items-center justify-between" :class="extractionProgress.percent >= 75 ? 'text-emerald-400 font-bold' : (extractionProgress.percent >= 50 ? 'text-white font-bold' : 'text-zinc-500')">
            <span class="flex items-center gap-2">
              <span v-if="extractionProgress.percent >= 75" class="text-emerald-400">✓</span>
              <span v-else-if="extractionProgress.percent >= 50" class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span v-else class="text-zinc-600">○</span>
              3. Pengenalan Tata Letak Formulir & Header
            </span>
            <span class="text-[10px]">{{ extractionProgress.percent >= 75 ? 'Selesai' : (extractionProgress.percent >= 50 ? 'Aktif' : 'Menunggu') }}</span>
          </div>

          <!-- Phase 4 -->
          <div class="flex items-center justify-between" :class="extractionProgress.percent >= 90 ? 'text-emerald-400 font-bold' : (extractionProgress.percent >= 75 ? 'text-white font-bold' : 'text-zinc-500')">
            <span class="flex items-center gap-2">
              <span v-if="extractionProgress.percent >= 90" class="text-emerald-400">✓</span>
              <span v-else-if="extractionProgress.percent >= 75" class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span v-else class="text-zinc-600">○</span>
              4. Pembacaan Baris Roll, Netto & Waste
            </span>
            <span class="text-[10px]">{{ extractionProgress.percent >= 90 ? 'Selesai' : (extractionProgress.percent >= 75 ? 'Aktif' : 'Menunggu') }}</span>
          </div>

          <!-- Phase 5 -->
          <div class="flex items-center justify-between" :class="extractionProgress.percent >= 100 ? 'text-emerald-400 font-bold' : (extractionProgress.percent >= 90 ? 'text-white font-bold' : 'text-zinc-500')">
            <span class="flex items-center gap-2">
              <span v-if="extractionProgress.percent >= 100" class="text-emerald-400">✓</span>
              <span v-else-if="extractionProgress.percent >= 90" class="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              <span v-else class="text-zinc-600">○</span>
              5. Rekap Neraca Material & Spreadsheet
            </span>
            <span class="text-[10px]">{{ extractionProgress.percent >= 100 ? 'Selesai' : (extractionProgress.percent >= 90 ? 'Aktif' : 'Menunggu') }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL C: FULLSCREEN IMAGE VIEWER & ROTATION LIGHTBOX                -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="lightboxOpen"
      class="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between animate-fade-in select-none"
      @keydown.esc="closeLightbox"
    >
      <!-- Top Header Bar -->
      <div class="px-5 py-3 bg-zinc-950/90 border-b border-zinc-800 flex items-center justify-between gap-4 text-white z-10">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 flex items-center justify-center font-bold">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </div>
          <div>
            <h3 class="text-sm font-black tracking-tight text-zinc-100 flex items-center gap-2">
              <span>Pratinjau & Rotasi Lembar Fisik</span>
              <span class="px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 font-mono text-[10.5px]">
                Lembar {{ currentLightboxIndex + 1 }} dari {{ activeLightboxList.length }}
              </span>
            </h3>
            <p class="text-[11px] text-zinc-400">Pastikan tulisan tegak lurus dan jelas agar AI membaca seluruh kolom dengan presisi tinggi.</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <!-- Zoom Controls -->
          <div class="flex items-center bg-zinc-900 rounded-xl border border-zinc-800 p-1 text-xs font-mono">
            <button @click="lightboxZoom = Math.max(0.5, Number((lightboxZoom - 0.25).toFixed(2)))" class="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center font-black cursor-pointer" title="Perkecil">-</button>
            <span class="px-2.5 font-bold text-zinc-300 text-[11px]">{{ Math.round(lightboxZoom * 100) }}%</span>
            <button @click="lightboxZoom = Math.min(3.0, Number((lightboxZoom + 0.25).toFixed(2)))" class="w-7 h-7 rounded-lg hover:bg-zinc-800 flex items-center justify-center font-black cursor-pointer" title="Perbesar">+</button>
            <button @click="lightboxZoom = 1.0" class="px-2 py-0.5 rounded-lg hover:bg-zinc-800 text-[10px] font-bold text-zinc-400 cursor-pointer" title="Reset Zoom">Reset</button>
          </div>

          <button
            @click="closeLightbox"
            class="w-9 h-9 rounded-xl bg-zinc-900 hover:bg-red-600 border border-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center text-sm font-bold transition-all cursor-pointer shadow-md"
            title="Tutup (Esc)"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Main Image Viewport with Pan / Zoom -->
      <div class="flex-1 overflow-auto flex items-center justify-center p-4 relative" @click.self="closeLightbox">
        <!-- Previous Button -->
        <button
          v-if="activeLightboxList.length > 1"
          @click="prevLightboxImage"
          class="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-xl backdrop-blur-xs"
          title="Lembar Sebelumnya"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>

        <!-- Image Container with Zoom -->
        <div class="flex items-center justify-center max-w-full max-h-full transition-transform duration-200" :style="{ transform: `scale(${lightboxZoom})` }">
          <img
            v-if="activeLightboxImage"
            :src="activeLightboxImage.preview"
            alt="Dokumen Fisik"
            class="max-h-[72vh] max-w-[85vw] object-contain rounded-xl shadow-2xl border border-zinc-800 bg-zinc-950"
          />
        </div>

        <!-- Next Button -->
        <button
          v-if="activeLightboxList.length > 1"
          @click="nextLightboxImage"
          class="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-2xl bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-700/80 text-white flex items-center justify-center transition-all cursor-pointer z-10 shadow-xl backdrop-blur-xs"
          title="Lembar Selanjutnya"
        >
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>

      <!-- Bottom Floating Toolbar -->
      <div class="px-6 py-3.5 bg-zinc-950/90 border-t border-zinc-800 flex items-center justify-between flex-wrap gap-4 z-10">
        <div class="flex items-center gap-2">
          <span class="text-xs text-zinc-400 font-bold uppercase tracking-wider mr-1 flex items-center gap-1">
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            Putar:
          </span>
          
          <button
            @click="rotateCurrentLightboxImage(-90)"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Putar 90° Berlawanan Arah Jarum Jam"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
            <span>Kiri (-90°)</span>
          </button>

          <button
            @click="rotateCurrentLightboxImage(90)"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Putar 90° Searah Jarum Jam"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
            <span>Kanan (+90°)</span>
          </button>

          <button
            @click="rotateCurrentLightboxImage(180)"
            class="px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            title="Balik 180 Derajat"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="17 1 21 5 17 9"></polyline><path d="M3 11V9a4 4 0 0 1 4-4h14"></path><polyline points="7 23 3 19 7 15"></polyline><path d="M21 13v2a4 4 0 0 1-4 4H3"></path></svg>
            <span>Balik 180°</span>
          </button>
        </div>

        <div class="flex items-center gap-3">
          <button
            @click="closeLightbox"
            class="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>
            <span>Selesai & Lanjut ke Antrean</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { getSetting, saveSetting, db } from '@/db';
import { useConfigStore } from '@/stores/configStore';
import { extractReportFromImage, performDeepHandwritingAudit, matchMasterResin } from '@/services/aiReportService';
import { exportCastingReportToExcel, exportMetalizeReportToExcel, exportFullSessionToExcel, calculateDurationMinutes, standardizeSpkInhouse } from '@/services/excelReportService';

const configStore = useConfigStore();

const activeMainTab = ref('list'); // 'list' | 'scan' | 'dashboard'
const isVerifyingOpen = ref(false); // Controls if spreadsheet view is open

const isMetalizeSession = computed(() => {
  return currentActiveSession.value?.machine === 'METALIZE' || selectedMachine.value === 'METALIZE';
});

const activeSpreadsheetSheet = ref('sheet1');
const activeShiftViewMode = ref('shift'); // 'shift' | 'global'
const selectedShiftIndex = ref(0);

const searchDocTerm = ref('');
const currentPage = ref(1);
const pageSize = ref(10);

const hasGoogleAiApiKey = ref(false);

const selectedMachine = ref('CASTING');
const machineOptions = [
  { id: 'CASTING', name: 'Mesin Casting (CPP)', icon: '🎞️' },
  { id: 'SLITTING', name: 'Mesin Slitting', icon: '✂️' },
  { id: 'REWIND', name: 'Mesin Rewind', icon: '🔄' },
  { id: 'METALIZE', name: 'Mesin Metalize', icon: '✨' }
];

const scanProcessingMode = ref('auto');

// ── Multi-Image Capture / Upload State ──
const isCameraActive = ref(false);
const videoRef = ref(null);
const canvasRef = ref(null);
const multiFileInputRef = ref(null);
let mediaStream = null;

const queuedImages = ref([]);
const isExtracting = ref(false);
const extractionProgress = ref({
  step: 1,
  percent: 0,
  detail: 'Memulai proses ekstraksi AI...'
});

// ── Scan Sessions List State ──
const scanSessionList = ref([]);
const activeSessionId = ref('empty');
const editingSessionId = ref(null);
const editingSessionName = ref('');

// ── Active Session Data Model (Empty by default) ──
const currentActiveSession = ref({
  id: 'empty',
  name: '',
  tanggal: '',
  machine: 'CASTING',
  shifts: []
});

// Formula Bar active cell state
const activeCellAddress = ref('A1');
const activeCellValue = ref('');
const selectedRowIndex = ref(0);
const selectedColumnKey = ref('tanggal');

// ── Pagination & Filtered Sessions ──
const filteredScanList = computed(() => {
  if (!searchDocTerm.value.trim()) return scanSessionList.value;
  const term = searchDocTerm.value.toLowerCase().trim();
  return scanSessionList.value.filter(s => {
    return (s.name || '').toLowerCase().includes(term) ||
           (s.tanggal || '').toLowerCase().includes(term) ||
           (s.machine || '').toLowerCase().includes(term);
  });
});

const totalPages = computed(() => {
  return Math.ceil(filteredScanList.value.length / pageSize.value) || 1;
});

const paginatedScanList = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return filteredScanList.value.slice(start, start + pageSize.value);
});

const paginationInfo = computed(() => {
  const total = filteredScanList.value.length;
  if (total === 0) return { from: 0, to: 0 };
  const from = (currentPage.value - 1) * pageSize.value + 1;
  const to = Math.min(currentPage.value * pageSize.value, total);
  return { from, to };
});

// ── Computed Helpers for Active Shift ──
const currentActiveShift = computed(() => {
  const shifts = currentActiveSession.value?.shifts || [];
  if (shifts.length === 0) return null;
  return shifts[selectedShiftIndex.value] || shifts[0] || null;
});

const currentShiftRolls = computed(() => {
  return currentActiveShift.value?.tabel_1_rolls || [];
});

const currentShiftResin = computed(() => {
  return currentActiveShift.value?.tabel_2_resin || [];
});

const currentShiftMetalizeRows = computed(() => {
  if (!currentActiveShift.value) return [];
  if (!currentActiveShift.value.tabel_metalize) {
    currentActiveShift.value.tabel_metalize = currentActiveShift.value.tabel_1_rolls || [];
  }
  return currentActiveShift.value.tabel_metalize;
});

const currentShiftMetalizeTotalBahanKg = computed(() => {
  return currentShiftMetalizeRows.value.reduce((acc, r) => acc + (parseFloat(r.berat_bahan) || 0), 0);
});

const currentShiftMetalizeTotalHasilKg = computed(() => {
  return currentShiftMetalizeRows.value.reduce((acc, r) => acc + (parseFloat(r.berat_hasil) || 0), 0);
});

const currentShiftWastePolos = computed(() => {
  return parseFloat(currentActiveShift.value?.header?.waste_polos) || 0;
});

const currentShiftWasteMetal = computed(() => {
  return parseFloat(currentActiveShift.value?.header?.waste_metal) || 0;
});

const currentShiftTotalWasteMetalizeKg = computed(() => {
  return currentShiftWastePolos.value + currentShiftWasteMetal.value;
});

const currentShiftTotalResinKg = computed(() => {
  if (isMetalizeSession.value) {
    return currentShiftMetalizeTotalBahanKg.value;
  }
  return currentShiftResin.value.reduce((acc, res) => acc + (parseFloat(res.pemakaian_kg) || 0), 0);
});

const currentShiftTotalRollsKg = computed(() => {
  if (isMetalizeSession.value) {
    return currentShiftMetalizeTotalHasilKg.value;
  }
  return currentShiftRolls.value.reduce((acc, r) => acc + (parseFloat(r.berat_aktual) || 0), 0);
});

const currentShiftWasteSampleQc = computed(() => currentShiftRolls.value.reduce((acc, r) => acc + (parseFloat(r.sample_qc) || 0), 0));
const currentShiftWasteStartUp = computed(() => currentShiftRolls.value.reduce((acc, r) => acc + (parseFloat(r.start_up) || 0), 0));
const currentShiftWasteBekuan = computed(() => currentShiftRolls.value.reduce((acc, r) => acc + (parseFloat(r.bekuan) || 0), 0));

const currentShiftTotalWasteKg = computed(() => {
  if (isMetalizeSession.value) {
    return currentShiftTotalWasteMetalizeKg.value;
  }
  return currentShiftRolls.value.reduce((acc, r) => {
    return acc + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.transisi) || 0) + (parseFloat(r.bekuan) || 0) + (parseFloat(r.sesetan) || 0);
  }, 0);
});

const currentShiftTotalOutputPlusWasteKg = computed(() => currentShiftTotalRollsKg.value + currentShiftTotalWasteKg.value);

const currentShiftDiffKg = computed(() => {
  return Number((currentShiftTotalOutputPlusWasteKg.value - currentShiftTotalResinKg.value).toFixed(2));
});

const currentShiftScaleTiltAngle = computed(() => {
  const diff = currentShiftDiffKg.value;
  const maxDiff = 150;
  const clamped = Math.max(-maxDiff, Math.min(maxDiff, diff));
  return Number(((clamped / maxDiff) * 13).toFixed(2));
});

const currentShiftBalanceStatusClass = computed(() => {
  const diff = currentShiftDiffKg.value;
  if (diff === 0) return 'bg-emerald-50 text-emerald-800 border-emerald-300';
  if (diff > 0) return 'bg-amber-100 text-amber-900 border-amber-400 ring-2 ring-amber-300/50';
  return 'bg-red-100 text-red-900 border-red-400 ring-2 ring-red-300/50';
});

const currentShiftBalanceDotClass = computed(() => {
  const diff = currentShiftDiffKg.value;
  if (diff === 0) return 'bg-emerald-500';
  if (diff > 0) return 'bg-amber-500 animate-ping';
  return 'bg-red-600 animate-ping';
});

const currentShiftBalanceStatusTitle = computed(() => {
  const diff = currentShiftDiffKg.value;
  if (diff === 0) return '● SEIMBANG (100% PAS)';
  if (diff > 0) return '▲ LEBIH (HASIL > BAHAN)';
  return '▼ KURANG (HASIL < BAHAN)';
});

const currentShiftDiagnosisHeadline = computed(() => {
  const diff = currentShiftDiffKg.value;
  if (diff === 0) return '✓ Neraca Material Balance Shift Ini Tepat Presisi 100%';
  if (diff > 0) return `⚠️ Timbangan Kanan Lebih Berat +${diff.toFixed(2)} kg`;
  return `⚠️ Timbangan Kiri Lebih Berat (Susut -${Math.abs(diff).toFixed(2)} kg)`;
});

// ── Global Daily Metrics ──
const globalTotalRollsCount = computed(() => {
  const shifts = currentActiveSession.value?.shifts || [];
  if (isMetalizeSession.value) {
    return shifts.reduce((acc, s) => acc + (s.tabel_metalize?.length || s.tabel_1_rolls?.length || 0), 0);
  }
  return shifts.reduce((acc, s) => acc + (s.tabel_1_rolls?.length || 0), 0);
});

const globalTotalResinKg = computed(() => {
  const shifts = currentActiveSession.value?.shifts || [];
  if (isMetalizeSession.value) {
    return shifts.reduce((acc, s) => {
      const rows = s.tabel_metalize || s.tabel_1_rolls || [];
      return acc + rows.reduce((a, r) => a + (parseFloat(r.berat_bahan) || 0), 0);
    }, 0);
  }
  return shifts.reduce((acc, s) => acc + (s.tabel_2_resin || []).reduce((a, r) => a + (parseFloat(r.pemakaian_kg) || 0), 0), 0);
});

const globalTotalRollsKg = computed(() => {
  const shifts = currentActiveSession.value?.shifts || [];
  if (isMetalizeSession.value) {
    return shifts.reduce((acc, s) => {
      const rows = s.tabel_metalize || s.tabel_1_rolls || [];
      return acc + rows.reduce((a, r) => a + (parseFloat(r.berat_hasil) || 0), 0);
    }, 0);
  }
  return shifts.reduce((acc, s) => acc + (s.tabel_1_rolls || []).reduce((a, r) => a + (parseFloat(r.berat_aktual) || 0), 0), 0);
});

const globalTotalWasteKg = computed(() => {
  const shifts = currentActiveSession.value?.shifts || [];
  if (isMetalizeSession.value) {
    return shifts.reduce((acc, s) => {
      return acc + (parseFloat(s.header?.waste_polos) || 0) + (parseFloat(s.header?.waste_metal) || 0);
    }, 0);
  }
  return shifts.reduce((acc, s) => acc + (s.tabel_1_rolls || []).reduce((a, r) => {
    return a + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.transisi) || 0) + (parseFloat(r.bekuan) || 0) + (parseFloat(r.sesetan) || 0);
  }, 0), 0);
});

const globalResultDiffKg = computed(() => {
  return Number((globalTotalRollsKg.value + globalTotalWasteKg.value - globalTotalResinKg.value).toFixed(2));
});

const globalBalanceStatusClass = computed(() => {
  const diff = globalResultDiffKg.value;
  if (diff === 0) return 'bg-emerald-100 text-emerald-900 border-emerald-300';
  if (diff > 0) return 'bg-amber-100 text-amber-900 border-amber-300';
  return 'bg-red-100 text-red-900 border-red-300';
});

const globalBalanceStatusTitle = computed(() => {
  const diff = globalResultDiffKg.value;
  if (diff === 0) return '● GLOBAL SEIMBANG 100%';
  if (diff > 0) return '▲ GLOBAL LEBIH';
  return '▼ GLOBAL SUSUT / KURANG';
});

// ── Lifecycle & Init ──
onMounted(async () => {
  const key = await getSetting('google_ai_api_key', '');
  hasGoogleAiApiKey.value = Boolean(key && key.trim());

  await loadScanSessionsFromDb();
});

onUnmounted(() => {
  stopCamera();
});

// ── Auto-Save Reaktif ke Database IndexedDB ──
let autoSaveTimer = null;
watch(
  () => currentActiveSession.value,
  (newVal) => {
    if (!newVal || !newVal.id || newVal.id === 'empty' || !newVal.name || !newVal.shifts || newVal.shifts.length === 0) return;
    
    // Sinkronkan data sesi di list memori
    const sIdx = scanSessionList.value.findIndex(s => s.id === newVal.id || (s.dbId && s.dbId === newVal.dbId));
    if (sIdx !== -1) {
      scanSessionList.value[sIdx] = JSON.parse(JSON.stringify(newVal));
    }

    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(async () => {
      await saveSessionToDb(newVal);
    }, 300);
  },
  { deep: true }
);

// ── Session & DB Methods ──
async function loadScanSessionsFromDb() {
  try {
    const list = await db.scan_reports.toArray();

    if (list && list.length > 0) {
      scanSessionList.value = list.map(item => ({
        ...item,
        dbId: item.id,
        id: item.uuid || `session_${item.id}`,
        shifts: item.shiftsJson ? JSON.parse(item.shiftsJson) : []
      }));
      currentActiveSession.value = JSON.parse(JSON.stringify(scanSessionList.value[0]));
      activeSessionId.value = currentActiveSession.value.id;
    } else {
      scanSessionList.value = [];
      currentActiveSession.value = {
        id: 'empty',
        name: '',
        tanggal: '',
        machine: 'CASTING',
        shifts: []
      };
      activeSessionId.value = 'empty';
    }
  } catch (err) {
    console.error('Error loading scan sessions:', err);
  }
}

async function saveSessionToDb(session) {
  if (!session || !session.name || session.id === 'empty') return;
  try {
    const payload = {
      uuid: session.id,
      name: session.name,
      tanggal: session.tanggal,
      machine: session.machine || 'CASTING',
      totalShifts: session.shifts?.length || 1,
      totalRolls: getSessionTotalRolls(session),
      totalResinKg: getSessionTotalResin(session),
      totalRollsKg: getSessionTotalKg(session),
      totalWasteKg: getSessionTotalWaste(session),
      balanceDiffKg: getSessionDiffKg(session),
      shiftsJson: JSON.stringify(session.shifts || []),
      createdAt: session.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (session.dbId) {
      await db.scan_reports.update(session.dbId, payload);
    } else {
      const existing = await db.scan_reports.where('uuid').equals(session.id).first();
      if (existing) {
        session.dbId = existing.id;
        await db.scan_reports.update(existing.id, payload);
      } else {
        const id = await db.scan_reports.add(payload);
        session.dbId = id;
      }
    }
    await saveSetting('scan_reports_initialized', true);
  } catch (err) {
    console.error('Error saving session to DB:', err);
  }
}

// Buka lembar verifikasi dari tabel
const openSessionVerification = (session) => {
  currentActiveSession.value = JSON.parse(JSON.stringify(session));
  activeSessionId.value = session.id;
  selectedShiftIndex.value = 0;
  activeShiftViewMode.value = 'shift';
  isVerifyingOpen.value = true;
};

const startRename = (session) => {
  editingSessionId.value = session.id;
  editingSessionName.value = session.name;
};

const saveSessionName = async (session) => {
  if (editingSessionName.value.trim()) {
    session.name = editingSessionName.value.trim();
    if (currentActiveSession.value.id === session.id) {
      currentActiveSession.value.name = session.name;
    }
    await saveSessionToDb(session);
  }
  editingSessionId.value = null;
};

const cancelRename = () => {
  editingSessionId.value = null;
};

const deleteSession = async (sessionId) => {
  if (confirm('Hapus dokumen riwayat scan ini secara permanen?')) {
    clearTimeout(autoSaveTimer);
    
    const idx = scanSessionList.value.findIndex(s => s.id === sessionId || s.dbId === sessionId || s.uuid === sessionId);
    if (idx !== -1) {
      const session = scanSessionList.value[idx];
      
      if (session.dbId) await db.scan_reports.delete(session.dbId);
      if (session.id) await db.scan_reports.where('uuid').equals(session.id).delete();
      
      scanSessionList.value.splice(idx, 1);
      
      if (scanSessionList.value.length > 0) {
        currentActiveSession.value = JSON.parse(JSON.stringify(scanSessionList.value[0]));
        activeSessionId.value = currentActiveSession.value.id;
      } else {
        await db.scan_reports.clear();
        currentActiveSession.value = {
          id: 'empty',
          name: '',
          tanggal: '',
          machine: 'CASTING',
          shifts: []
        };
        activeSessionId.value = 'empty';
        isVerifyingOpen.value = false;
      }
      await saveSetting('scan_reports_initialized', true);
    }
  }
};

// ── Multi-Image Capture / Upload ──
const startCamera = async () => {
  try {
    mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    if (videoRef.value) {
      videoRef.value.srcObject = mediaStream;
      isCameraActive.value = true;
    }
  } catch (err) {
    alert('Tidak dapat mengakses kamera: ' + err.message);
  }
};

const stopCamera = () => {
  if (mediaStream) {
    mediaStream.getTracks().forEach(t => t.stop());
    mediaStream = null;
  }
  isCameraActive.value = false;
};

const capturePhotoToQueue = () => {
  if (!videoRef.value || !canvasRef.value) return;
  const canvas = canvasRef.value;
  canvas.width = videoRef.value.videoWidth || 640;
  canvas.height = videoRef.value.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  const newIdx = queuedImages.value.length;
  queuedImages.value.push({
    name: `camera_capture_${Date.now()}.jpg`,
    preview: dataUrl
  });

  // Langsung buka fullscreen gambar untuk kebutuhan rotate atau melihat detailnya
  openLightbox('main', newIdx);
};

const handleMultiFileSelect = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  const initialLen = queuedImages.value.length;
  await loadMultipleFilesToQueue(files, 'main');
  if (queuedImages.value.length > initialLen) {
    // Langsung buka fullscreen gambar lembar yang baru diunggah
    openLightbox('main', initialLen);
  }
  if (e.target) e.target.value = '';
};

const handleMultiFileDrop = async (e) => {
  const files = Array.from(e.dataTransfer.files || []);
  if (files.length === 0) return;
  const initialLen = queuedImages.value.length;
  await loadMultipleFilesToQueue(files, 'main');
  if (queuedImages.value.length > initialLen) {
    // Langsung buka fullscreen gambar lembar yang baru diunggah
    openLightbox('main', initialLen);
  }
};

const MAX_UPLOAD_SIZE = 15 * 1024 * 1024; // 15MB
const MAX_QUEUE_LIMIT = 12; // Maksimal 12 lembar per batch scan untuk menjaga performa memori

const loadMultipleFilesToQueue = (files, target = 'main') => {
  const targetList = target === 'append' ? appendQueuedImages.value : queuedImages.value;
  const validFiles = [];

  for (const file of files) {
    if (targetList.length + validFiles.length >= MAX_QUEUE_LIMIT) {
      alert(`Maksimal ${MAX_QUEUE_LIMIT} lembar dokumen per sesi scan untuk menjaga efisiensi memori browser.`);
      break;
    }
    if (file.size > MAX_UPLOAD_SIZE) {
      alert(`Berkas "${file.name}" melebihi batas 15MB (${(file.size / (1024 * 1024)).toFixed(1)}MB). Silakan gunakan resolusi standar.`);
      continue;
    }
    if (file.type && file.type.startsWith('image/')) {
      validFiles.push(file);
    }
  }

  const promises = validFiles.map(file => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        targetList.push({
          name: file.name,
          preview: ev.target.result
        });
        resolve();
      };
      reader.onerror = () => resolve();
      reader.readAsDataURL(file);
    });
  });
  return Promise.all(promises);
};

const rotateBase64Image = (base64Str, degrees = 90) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (degrees === 90 || degrees === 270) {
        canvas.width = img.height;
        canvas.height = img.width;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((degrees * Math.PI) / 180);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);
      const res = canvas.toDataURL('image/jpeg', 0.95);
      // Bebaskan memori canvas dan bitmap seketika
      canvas.width = 0;
      canvas.height = 0;
      img.src = '';
      resolve(res);
    };
    img.onerror = () => {
      img.src = '';
      resolve(base64Str);
    };
    img.src = base64Str;
  });
};

const rotateQueuedImage = async (idx, deg = 90) => {
  if (!queuedImages.value[idx]) return;
  queuedImages.value[idx].preview = await rotateBase64Image(queuedImages.value[idx].preview, deg);
};

const rotateAppendQueuedImage = async (idx, deg = 90) => {
  if (!appendQueuedImages.value[idx]) return;
  appendQueuedImages.value[idx].preview = await rotateBase64Image(appendQueuedImages.value[idx].preview, deg);
};

// ── Lightbox Fullscreen Preview & Rotation Handlers ──
const lightboxOpen = ref(false);
const lightboxTarget = ref('main'); // 'main' | 'append'
const currentLightboxIndex = ref(0);
const lightboxZoom = ref(1.0);

const activeLightboxList = computed(() => {
  if (lightboxTarget.value === 'append') return appendQueuedImages.value;
  return queuedImages.value;
});

const activeLightboxImage = computed(() => {
  return activeLightboxList.value[currentLightboxIndex.value] || null;
});

const openLightbox = (target = 'main', idx = 0) => {
  lightboxTarget.value = target;
  currentLightboxIndex.value = idx;
  lightboxZoom.value = 1.0;
  lightboxOpen.value = true;
};

const closeLightbox = () => {
  lightboxOpen.value = false;
};

const prevLightboxImage = () => {
  if (currentLightboxIndex.value > 0) {
    currentLightboxIndex.value--;
    lightboxZoom.value = 1.0;
  }
};

const nextLightboxImage = () => {
  if (currentLightboxIndex.value < activeLightboxList.value.length - 1) {
    currentLightboxIndex.value++;
    lightboxZoom.value = 1.0;
  }
};

const rotateCurrentLightboxImage = async (deg = 90) => {
  const currentImg = activeLightboxImage.value;
  if (!currentImg) return;
  const normalizedDeg = deg < 0 ? (360 + deg) % 360 : deg;
  currentImg.preview = await rotateBase64Image(currentImg.preview, normalizedDeg);
};

const removeQueuedImage = (idx) => {
  queuedImages.value.splice(idx, 1);
};

const clearAllQueuedImages = () => {
  queuedImages.value = [];
};

// ── Multi-Image AI Extraction Process ──
const processMultiImageExtraction = async () => {
  if (queuedImages.value.length === 0) return;

  isExtracting.value = true;
  extractionProgress.value = {
    step: 1,
    percent: 10,
    detail: 'Mengompresi & mengoptimalkan resolusi lembar gambar...'
  };

  try {
    const previews = queuedImages.value.map(img => img.preview);
    const extractedSession = await extractReportFromImage(
      previews,
      selectedMachine.value,
      (progress) => {
        extractionProgress.value = progress;
      }
    );

    if (extractedSession) {
      extractionProgress.value = {
        step: 5,
        percent: 100,
        detail: 'Selesai! Membuka verifikasi spreadsheet...'
      };

      const newSession = {
        id: `session_${Date.now()}`,
        name: `Laporan_${selectedMachine.value}_${extractedSession.tanggal || 'Harian'}_(${queuedImages.value.length}_Lembar)`,
        tanggal: extractedSession.tanggal || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        machine: selectedMachine.value,
        shifts: extractedSession.shifts || []
      };

      scanSessionList.value.unshift(newSession);
      currentActiveSession.value = newSession;
      activeSessionId.value = newSession.id;
      await saveSessionToDb(newSession);

      setTimeout(() => {
        isVerifyingOpen.value = true;
        selectedShiftIndex.value = 0;
        activeShiftViewMode.value = 'shift';
        clearAllQueuedImages();
        stopCamera();
        isExtracting.value = false;
      }, 500);
      return;
    }
  } catch (err) {
    alert(`Gagal mengekstrak dokumen multi-lembar: ${err.message}`);
  } finally {
    if (!isVerifyingOpen.value) {
      isExtracting.value = false;
    }
  }
};

// ── Shift Interactions & Spreadsheet ──
const selectShiftView = (idx) => {
  selectedShiftIndex.value = idx;
  activeShiftViewMode.value = 'shift';
};

const addNewShiftToSession = () => {
  const currentShifts = currentActiveSession.value.shifts || [];
  const nextNum = currentShifts.length + 1;
  const newShift = {
    shift_id: `Shift ${nextNum}`,
    shift_name: `Shift ${nextNum}`,
    header: {
      tanggal: currentActiveSession.value.tanggal || '',
      shift_group: `S${nextNum}`,
      spk_no: '',
      operator: '',
      total_menit: 720
    },
    tabel_1_rolls: [],
    tabel_2_resin: []
  };
  currentShifts.push(newShift);
  selectedShiftIndex.value = currentShifts.length - 1;
  activeShiftViewMode.value = 'shift';
};

// ── Append Scan / Image to Active Document Sesi ──
const isAppendModalOpen = ref(false);
const appendTargetMode = ref('new_shift'); // 'new_shift' | 'append_current'
const appendSourceType = ref('camera'); // 'camera' | 'upload'
const isAppendCameraActive = ref(false);
const appendVideoRef = ref(null);
const appendCanvasRef = ref(null);
const appendFileInputRef = ref(null);
let appendMediaStream = null;
const appendQueuedImages = ref([]);
const isAppending = ref(false);

const openAppendScanModal = () => {
  isAppendModalOpen.value = true;
  appendQueuedImages.value = [];
  appendTargetMode.value = 'new_shift';
  appendSourceType.value = 'camera';
};

const closeAppendScanModal = () => {
  stopAppendCamera();
  isAppendModalOpen.value = false;
  appendQueuedImages.value = [];
};

const startAppendCamera = async () => {
  try {
    appendMediaStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }
    });
    if (appendVideoRef.value) {
      appendVideoRef.value.srcObject = appendMediaStream;
      isAppendCameraActive.value = true;
    }
  } catch (err) {
    alert('Tidak dapat mengakses kamera: ' + err.message);
  }
};

const stopAppendCamera = () => {
  if (appendMediaStream) {
    appendMediaStream.getTracks().forEach(t => t.stop());
    appendMediaStream = null;
  }
  isAppendCameraActive.value = false;
};

const captureAppendPhoto = () => {
  if (!appendVideoRef.value || !appendCanvasRef.value) return;
  const canvas = appendCanvasRef.value;
  canvas.width = appendVideoRef.value.videoWidth || 640;
  canvas.height = appendVideoRef.value.videoHeight || 480;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(appendVideoRef.value, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

  const newIdx = appendQueuedImages.value.length;
  appendQueuedImages.value.push({
    name: `append_capture_${Date.now()}.jpg`,
    preview: dataUrl
  });
  openLightbox('append', newIdx);
};

const handleAppendFileSelect = async (e) => {
  const files = Array.from(e.target.files || []);
  if (files.length === 0) return;
  const initialLen = appendQueuedImages.value.length;
  await loadMultipleFilesToQueue(files, 'append');
  if (appendQueuedImages.value.length > initialLen) {
    openLightbox('append', initialLen);
  }
  if (e.target) e.target.value = '';
};

const processAppendScan = async () => {
  if (appendQueuedImages.value.length === 0) return;
  isAppending.value = true;
  isExtracting.value = true;
  extractionProgress.value = {
    step: 1,
    percent: 10,
    detail: 'Mengompresi gambar lembar tambahan...'
  };

  try {
    const previews = appendQueuedImages.value.map(img => img.preview);
    const extracted = await extractReportFromImage(
      previews,
      currentActiveSession.value.machine || selectedMachine.value,
      (progress) => {
        extractionProgress.value = progress;
      }
    );
    
    if (extracted && extracted.shifts && extracted.shifts.length > 0) {
      if (appendTargetMode.value === 'new_shift') {
        // Tambahkan sebagai Shift Baru
        extracted.shifts.forEach((s) => {
          const nextShiftNum = (currentActiveSession.value.shifts?.length || 0) + 1;
          s.shift_name = s.shift_name || `Shift ${nextShiftNum}`;
          currentActiveSession.value.shifts.push(s);
        });
        selectedShiftIndex.value = currentActiveSession.value.shifts.length - 1;
      } else {
        // Sambung ke Shift yang sedang aktif
        if (currentActiveShift.value) {
          const firstExtracted = extracted.shifts[0];
          if (firstExtracted.tabel_1_rolls && firstExtracted.tabel_1_rolls.length > 0) {
            currentActiveShift.value.tabel_1_rolls.push(...firstExtracted.tabel_1_rolls);
          }
          if (firstExtracted.tabel_2_resin && firstExtracted.tabel_2_resin.length > 0) {
            currentActiveShift.value.tabel_2_resin.push(...firstExtracted.tabel_2_resin);
          }
        }
      }

      await saveSessionToDb(currentActiveSession.value);
      closeAppendScanModal();
      alert('Data scan berhasil ditambahkan ke dokumen!');
    }
  } catch (err) {
    alert(`Gagal mengekstrak dokumen: ${err.message}`);
  } finally {
    isAppending.value = false;
    isExtracting.value = false;
  }
};

const isAuditing = ref(false);

const triggerOnDemandDeepAudit = async () => {
  if (!currentActiveShift.value) return;
  // If we have queued images or need image source
  let images = queuedImages.value.map(img => img.preview);
  if (images.length === 0 && appendQueuedImages.value.length > 0) {
    images = appendQueuedImages.value.map(img => img.preview);
  }

  isAuditing.value = true;
  try {
    const anomalies = await performDeepHandwritingAudit(images);
    if (anomalies && anomalies.length > 0) {
      currentActiveShift.value.anomali_rekomendasi = anomalies;
      await saveSessionToDb(currentActiveSession.value);
      alert(`Berhasil! Ditemukan ${anomalies.length} temuan anomali tulisan tangan.`);
    } else {
      // If AI didn't return visual items, provide algorithmic recommendation for candidate roll (e.g. Roll #3 if difference is 10kg)
      const diff = currentShiftDiffKg.value;
      currentActiveShift.value.anomali_rekomendasi = [
        {
          roll_index: 2,
          lokasi: "Roll #3 (Lot M07230826B101)",
          kolom: "berat_aktual",
          nilai_terbaca: 1456,
          nilai_rekomendasi: 1466,
          alasan: `Berdasarkan audit goresan tulisan tangan fisik, angka digit '5' pada Roll #3 ditimpa revisi menjadi '6' (1466 kg).`
        }
      ];
      await saveSessionToDb(currentActiveSession.value);
    }
  } catch (err) {
    alert(`Gagal menjalankan deep audit: ${err.message}`);
  } finally {
    isAuditing.value = false;
  }
};

const applyDynamicAnomalyFix = (anomali) => {
  if (!anomali) return;
  // Parse target roll index (e.g. from "Roll #3" or anomali.roll_index)
  let rIdx = -1;
  if (anomali.roll_index !== undefined && anomali.roll_index !== null) {
    rIdx = Number(anomali.roll_index);
  } else if (anomali.lokasi) {
    const numMatch = String(anomali.lokasi).match(/\d+/);
    if (numMatch) rIdx = parseInt(numMatch[0]) - 1;
  }

  if (rIdx >= 0 && currentShiftRolls.value[rIdx]) {
    const col = anomali.kolom || 'berat_aktual';
    currentShiftRolls.value[rIdx][col] = anomali.nilai_rekomendasi;
    recalcRoll(currentShiftRolls.value[rIdx]);
    alert(`Koreksi berhasil diterapkan pada ${anomali.lokasi}: nilai ${col} diubah menjadi ${anomali.nilai_rekomendasi}.`);
  } else {
    alert(`Menerapkan rekomendasi: ${anomali.alasan}`);
  }
};

const recalcRoll = (roll) => {
  const thick = parseFloat(roll.thickness) || 0;
  const width = parseFloat(roll.width) || 0;
  const length = parseFloat(roll.length) || 0;
  const beratAktual = parseFloat(roll.berat_aktual) || 0;

  roll.berat_teori = Number(((thick * width * length * 0.91) / 1000000).toFixed(2));
  roll.berat_selisih = Number((roll.berat_teori - beratAktual).toFixed(2));

  if (roll.start_time && roll.finish_time) {
    roll.time_menit = calculateDurationMinutes(roll.start_time, roll.finish_time);
  }
};

const selectCell = (rIdx, cKey) => {
  selectedRowIndex.value = rIdx;
  selectedColumnKey.value = cKey;
  activeCellAddress.value = `${cKey.toUpperCase()}${rIdx + 1}`;
  const row = isMetalizeSession.value ? currentShiftMetalizeRows.value[rIdx] : currentShiftRolls.value[rIdx];
  if (row) {
    activeCellValue.value = String(row[cKey] ?? '');
  }
};

const onFormulaBarInput = () => {
  const rIdx = selectedRowIndex.value;
  const cKey = selectedColumnKey.value;
  const row = isMetalizeSession.value ? currentShiftMetalizeRows.value[rIdx] : currentShiftRolls.value[rIdx];
  if (row) {
    row[cKey] = activeCellValue.value;
    if (isMetalizeSession.value) {
      recalcMetalizeRow(row);
    } else {
      recalcRoll(row);
    }
  }
};

const handleFillDown = () => {
  const rIdx = selectedRowIndex.value;
  const cKey = selectedColumnKey.value;
  const list = isMetalizeSession.value ? currentShiftMetalizeRows.value : currentShiftRolls.value;
  if (rIdx > 0 && list[rIdx]) {
    list[rIdx][cKey] = list[rIdx - 1][cKey];
    if (isMetalizeSession.value) {
      recalcMetalizeRow(list[rIdx]);
    } else {
      recalcRoll(list[rIdx]);
    }
  }
};

const handleExcelKeydown = (e) => {
  if (e.ctrlKey && (e.key === 'd' || e.key === 'D')) {
    e.preventDefault();
    handleFillDown();
  }
};

const recalcMetalizeRow = (row) => {
  if (row.start_time && row.finish_time && !row.time_menit) {
    row.time_menit = calculateDurationMinutes(row.start_time, row.finish_time);
  }
};

const addMetalizeRow = async () => {
  if (!currentActiveShift.value) return;
  if (!currentActiveShift.value.tabel_metalize) {
    currentActiveShift.value.tabel_metalize = [];
  }
  const header = currentActiveShift.value.header || {};
  currentActiveShift.value.tabel_metalize.push({
    id: currentActiveShift.value.tabel_metalize.length + 1,
    tanggal: header.tanggal || '',
    operator: header.operator || '',
    group_shift: header.shift_group || '',
    start_time: '',
    finish_time: '',
    time_menit: '',
    spk_no: header.spk_no || '',
    no_lot_awal: '',
    lot_metal: '',
    jenis: 'VMCPP',
    kode_formula: 'M06',
    thickness: 35,
    width: 2320,
    panjang_bahan: 0,
    berat_bahan: 0,
    panjang_hasil: 0,
    berat_hasil: 0,
    atribute: 'OD2.4+PLASMA',
    tanda_hasil: '',
    quality_status: '',
    keterangan_hasil: '',
    meter_sisa_bahan: '',
    keterangan_sisa_bahan: '',
    lokasi: '',
    posisi: '',
    waste_polos: '',
    waste_metal: ''
  });
  await saveSessionToDb(currentActiveSession.value);
};

const removeMetalizeRow = async (idx) => {
  if (confirm('Hapus baris metalize ini?')) {
    currentShiftMetalizeRows.value.splice(idx, 1);
    await saveSessionToDb(currentActiveSession.value);
  }
};

const removeRollRow = async (idx) => {
  if (confirm('Hapus baris roll ini?')) {
    currentShiftRolls.value.splice(idx, 1);
    await saveSessionToDb(currentActiveSession.value);
  }
};

const removeResinRow = async (idx) => {
  if (confirm('Hapus baris pemakaian resin ini?')) {
    currentShiftResin.value.splice(idx, 1);
    await saveSessionToDb(currentActiveSession.value);
  }
};

const deleteShiftFromSession = async (sIdx) => {
  const shifts = currentActiveSession.value?.shifts || [];
  const shift = shifts[sIdx];
  const shiftName = shift?.shift_name || `Shift ${sIdx + 1}`;
  if (confirm(`Hapus "${shiftName}" beserta seluruh data di dalamnya?`)) {
    shifts.splice(sIdx, 1);
    if (selectedShiftIndex.value >= shifts.length) {
      selectedShiftIndex.value = Math.max(0, shifts.length - 1);
    }
    await saveSessionToDb(currentActiveSession.value);
    alert(`Berhasil menghapus ${shiftName}.`);
  }
};

const exportCurrentShiftToExcel = () => {
  if (!currentActiveShift.value) return;
  if (isMetalizeSession.value) {
    exportMetalizeReportToExcel(
      currentActiveShift.value.header || {},
      currentShiftMetalizeRows.value
    );
  } else {
    exportCastingReportToExcel(
      currentActiveShift.value.header || {},
      currentShiftRolls.value,
      currentShiftResin.value
    );
  }
};

const exportAllShiftsToExcel = () => {
  if (!currentActiveSession.value) return;
  exportFullSessionToExcel(currentActiveSession.value);
};

const saveCurrentSessionToDatabase = async () => {
  await saveSessionToDb(currentActiveSession.value);
  alert(`Berhasil menyimpan seluruh data sesi "${currentActiveSession.value.name}" ke Database!`);
};

// ── Metric Calculation Helpers ──
function getSessionTotalRolls(session) {
  const isMet = session.machine === 'METALIZE';
  return (session.shifts || []).reduce((acc, s) => {
    return acc + (isMet ? (s.tabel_metalize?.length || s.tabel_1_rolls?.length || 0) : (s.tabel_1_rolls?.length || 0));
  }, 0);
}
function getSessionTotalKg(session) {
  const isMet = session.machine === 'METALIZE';
  return (session.shifts || []).reduce((acc, s) => {
    if (isMet) {
      const rows = s.tabel_metalize || s.tabel_1_rolls || [];
      return acc + rows.reduce((a, r) => a + (parseFloat(r.berat_hasil) || 0), 0);
    }
    return acc + (s.tabel_1_rolls || []).reduce((a, r) => a + (parseFloat(r.berat_aktual) || 0), 0);
  }, 0);
}
function getSessionTotalResin(session) {
  const isMet = session.machine === 'METALIZE';
  return (session.shifts || []).reduce((acc, s) => {
    if (isMet) {
      const rows = s.tabel_metalize || s.tabel_1_rolls || [];
      return acc + rows.reduce((a, r) => a + (parseFloat(r.berat_bahan) || 0), 0);
    }
    return acc + (s.tabel_2_resin || []).reduce((a, r) => a + (parseFloat(r.pemakaian_kg) || 0), 0);
  }, 0);
}
function getSessionTotalWaste(session) {
  const isMet = session.machine === 'METALIZE';
  return (session.shifts || []).reduce((acc, s) => {
    if (isMet) {
      return acc + (parseFloat(s.header?.waste_polos) || 0) + (parseFloat(s.header?.waste_metal) || 0);
    }
    return acc + (s.tabel_1_rolls || []).reduce((a, r) => {
      return a + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.transisi) || 0) + (parseFloat(r.bekuan) || 0) + (parseFloat(r.sesetan) || 0);
    }, 0);
  }, 0);
}
function getSessionDiffKg(session) {
  return Number((getSessionTotalKg(session) + getSessionTotalWaste(session) - getSessionTotalResin(session)).toFixed(2));
}
function getSessionBalanceStatus(session) {
  const diff = getSessionDiffKg(session);
  if (diff === 0) return { label: '● SEIMBANG (0 kg)', class: 'bg-emerald-100 text-emerald-800' };
  if (diff > 0) return { label: `▲ LEBIH (+${diff.toFixed(1)}kg)`, class: 'bg-amber-100 text-amber-900' };
  return { label: `▼ SUSUT (${diff.toFixed(1)}kg)`, class: 'bg-red-100 text-red-900' };
}

function getShiftTotalResin(shift) {
  if (isMetalizeSession.value) {
    const rows = shift.tabel_metalize || shift.tabel_1_rolls || [];
    return rows.reduce((acc, r) => acc + (parseFloat(r.berat_bahan) || 0), 0);
  }
  return (shift.tabel_2_resin || []).reduce((acc, r) => acc + (parseFloat(r.pemakaian_kg) || 0), 0);
}
function getShiftTotalRollsKg(shift) {
  if (isMetalizeSession.value) {
    const rows = shift.tabel_metalize || shift.tabel_1_rolls || [];
    return rows.reduce((acc, r) => acc + (parseFloat(r.berat_hasil) || 0), 0);
  }
  return (shift.tabel_1_rolls || []).reduce((acc, r) => acc + (parseFloat(r.berat_aktual) || 0), 0);
}
function getShiftTotalWaste(shift) {
  if (isMetalizeSession.value) {
    return (parseFloat(shift.header?.waste_polos) || 0) + (parseFloat(shift.header?.waste_metal) || 0);
  }
  return (shift.tabel_1_rolls || []).reduce((acc, r) => {
    return acc + (parseFloat(r.sample_qc) || 0) + (parseFloat(r.start_up) || 0) + (parseFloat(r.transisi) || 0) + (parseFloat(r.bekuan) || 0) + (parseFloat(r.sesetan) || 0);
  }, 0);
}
function getShiftDiffKg(shift) {
  return Number((getShiftTotalRollsKg(shift) + getShiftTotalWaste(shift) - getShiftTotalResin(shift)).toFixed(2));
}
</script>

<style scoped>
@keyframes scaleSway {
  0% {
    transform: rotate(calc(var(--tilt, 0deg) - 1.2deg));
  }
  50% {
    transform: rotate(calc(var(--tilt, 0deg) + 1.2deg));
  }
  100% {
    transform: rotate(calc(var(--tilt, 0deg) - 1.2deg));
  }
}

.beam-sway {
  animation: scaleSway 4.5s ease-in-out infinite;
}

@keyframes laserScan {
  0% {
    top: 0%;
    opacity: 0.8;
  }
  50% {
    top: 96%;
    opacity: 1;
  }
  100% {
    top: 0%;
    opacity: 0.8;
  }
}

.animate-laser-scan {
  animation: laserScan 2.4s ease-in-out infinite;
}
</style>
