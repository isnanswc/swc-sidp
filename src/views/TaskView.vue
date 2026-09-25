<template>
  <div class="space-y-5 font-sans select-none pb-16">
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODE 1: DAFTAR MANAJEMEN TUGAS (MAIN LIST TABLE VIEW)             -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-if="viewMode === 'list'" class="space-y-4 animate-fade-in">
      <!-- Header & Top Action Bar -->
      <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-zinc-950 text-white flex items-center justify-center shadow-xs border border-zinc-800 shrink-0">
            <svg class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h1 class="text-base sm:text-lg font-black text-zinc-900 tracking-tight">MANAJEMEN TUGAS</h1>
            <p class="text-xs text-zinc-500 font-medium">Kelola penugasan, instruksi picking roll, pengiriman, dan verifikasi QR scan</p>
          </div>
        </div>

        <div class="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <!-- Tombol Export Excel Rekap List Tugas -->
          <button
            type="button"
            @click="exportTasksList"
            class="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-100 active:bg-zinc-200 text-zinc-700 border border-zinc-200 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            title="Export Daftar Tugas ke Excel"
          >
            <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <span>Export Excel</span>
          </button>

          <!-- Tombol Tambah Tugas Baru -->
          <button
            type="button"
            @click="openAddTaskModal"
            class="flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 active:bg-red-700 text-white shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4" />
            </svg>
            <span>+ Tambah Tugas</span>
          </button>
        </div>
      </div>

      <!-- Filters, Search & Summary Stats Bar -->
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-3">
        <!-- Search & Filters -->
        <div class="lg:col-span-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-zinc-200 shadow-xs flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5">
          <div class="flex-1 min-w-0 relative">
            <input
              v-model="taskStore.searchTerm"
              type="text"
              placeholder="Cari tugas, kode, PIC, kategori..."
              class="w-full pl-8 pr-7 py-2 sm:py-1.5 text-xs border border-zinc-300 rounded-xl focus:ring-1 focus:ring-red-500 focus:border-red-500 outline-none bg-zinc-50/50"
            />
            <svg class="w-4 h-4 text-zinc-400 absolute left-2.5 top-2.5 sm:top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              v-if="taskStore.searchTerm"
              @click="taskStore.searchTerm = ''"
              class="absolute right-2.5 top-2 sm:top-1.5 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          <!-- Dropdowns: 3 columns on mobile, flex on desktop -->
          <div class="grid grid-cols-3 sm:flex items-center gap-1.5 sm:gap-2">
            <!-- Filter Status -->
            <select
              v-model="taskStore.filterStatus"
              class="w-full sm:w-auto px-2 py-2 sm:py-1.5 text-[11px] sm:text-xs border border-zinc-300 rounded-xl outline-none bg-white font-bold text-zinc-700 truncate"
            >
              <option value="ALL">Semua Status</option>
              <option value="In Progress">Berjalan</option>
              <option value="Completed">Selesai</option>
            </select>

            <!-- Filter Kategori -->
            <select
              v-model="taskStore.filterCategory"
              class="w-full sm:w-auto px-2 py-2 sm:py-1.5 text-[11px] sm:text-xs border border-zinc-300 rounded-xl outline-none bg-white font-bold text-zinc-700 truncate"
            >
              <option value="ALL">Kategori</option>
              <option value="Picking WIP">Picking WIP</option>
              <option value="Pengiriman FG">Pengiriman FG</option>
              <option value="Verifikasi QC">Verifikasi QC</option>
              <option value="Palletizing">Palletizing</option>
              <option value="Retur / Relokasi">Retur</option>
            </select>

            <!-- Sort -->
            <select
              v-model="taskStore.sortBy"
              class="w-full sm:w-auto px-2 py-2 sm:py-1.5 text-[11px] sm:text-xs border border-zinc-300 rounded-xl outline-none bg-white font-bold text-zinc-700 truncate"
            >
              <option value="newest">Terbaru</option>
              <option value="oldest">Terlama</option>
              <option value="title">A-Z</option>
            </select>
          </div>
        </div>

        <!-- Quick Summary Stats -->
        <div class="bg-white p-3 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-around text-center">
          <div>
            <p class="text-[9.5px] uppercase font-bold text-zinc-400">Total</p>
            <p class="text-base sm:text-lg font-black text-zinc-900">{{ taskStore.totalTasks }}</p>
          </div>
          <div class="h-7 w-px bg-zinc-200"></div>
          <div>
            <p class="text-[9.5px] uppercase font-bold text-amber-600">Berjalan</p>
            <p class="text-base sm:text-lg font-black text-amber-600">{{ taskStore.inProgressTasks }}</p>
          </div>
          <div class="h-7 w-px bg-zinc-200"></div>
          <div>
            <p class="text-[9.5px] uppercase font-bold text-emerald-600">Selesai</p>
            <p class="text-base sm:text-lg font-black text-emerald-600">{{ taskStore.completedTasks }}</p>
          </div>
        </div>
      </div>

      <!-- MOBILE VIEW: LIST TUGAS BENTUK CARD (Layar HP < md) -->
      <div class="block md:hidden space-y-2.5">
        <div
          v-for="(task, idx) in taskStore.filteredTasks"
          :key="'mob-task-' + task.id"
          @click="openTaskDetail(task)"
          class="bg-white p-3.5 rounded-2xl border border-zinc-200 shadow-xs active:bg-red-50/20 transition-all cursor-pointer space-y-2.5"
        >
          <!-- Top Row: Kode Tugas, Status & Tombol Hapus -->
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5 flex-wrap">
              <span class="font-mono font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-xs">
                {{ task.taskCode }}
              </span>
              <span
                :class="[
                  'px-2 py-0.5 rounded-full text-[10px] font-black border uppercase tracking-wider',
                  task.status === 'Completed'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-amber-50 text-amber-700 border-amber-300'
                ]"
              >
                {{ task.status === 'Completed' ? '✓ Selesai' : '⏳ Berjalan' }}
              </span>
            </div>

            <button
              type="button"
              @click.stop="handleDeleteTask(task.id)"
              class="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 active:bg-red-50 transition-colors"
              title="Hapus Tugas"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <!-- Middle Row: Judul Tugas & Catatan -->
          <div>
            <h3 class="font-black text-zinc-900 text-sm leading-snug">{{ task.title }}</h3>
            <p v-if="task.notes" class="text-[11px] text-zinc-400 line-clamp-2 mt-0.5">{{ task.notes }}</p>
          </div>

          <!-- Meta Info: Tanggal, User, Kategori -->
          <div class="flex items-center gap-2 text-[11px] text-zinc-500 font-medium flex-wrap pt-0.5 border-t border-zinc-100">
            <span>📅 {{ task.tanggal }}</span>
            <span>•</span>
            <span>👤 <strong class="text-zinc-800">{{ task.user || task.assignee || 'Operator' }}</strong></span>
            <span>•</span>
            <span class="px-1.5 py-0.2 rounded text-[10px] bg-zinc-100 text-zinc-700 border border-zinc-200">
              {{ task.category || 'Picking WIP' }}
            </span>
          </div>

          <!-- Bottom Action Row: Total Roll & Tombol Buka -->
          <div class="flex items-center justify-between pt-1">
            <span class="px-2.5 py-1 rounded-xl text-xs font-mono font-black bg-blue-50 text-blue-900 border border-blue-200">
              📦 {{ Array.isArray(task.items) ? task.items.length : 0 }} Roll
            </span>

            <button
              type="button"
              @click.stop="openTaskDetail(task)"
              class="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-zinc-900 active:bg-black text-white flex items-center gap-1.5 shadow-2xs"
            >
              <span>Buka Tugas</span>
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Mobile Empty State -->
        <div v-if="taskStore.filteredTasks.length === 0" class="bg-white p-8 rounded-2xl border border-zinc-200 text-center text-zinc-400 space-y-1">
          <div class="text-3xl mb-1">📋</div>
          <p class="font-bold text-xs text-zinc-700">Belum ada tugas ditemukan</p>
          <p class="text-[11px] text-zinc-400">Tekan tombol "+ Tambah Tugas" di atas untuk membuat tugas baru.</p>
        </div>
      </div>

      <!-- DESKTOP VIEW: TABEL DAFTAR TUGAS (Layar Tablet/Desktop >= md) -->
      <div class="hidden md:block bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-zinc-100/90 text-zinc-800 border-b border-zinc-200 font-bold uppercase tracking-wider text-[11px] whitespace-nowrap">
                <th class="py-3 px-4 w-12 text-center">No</th>
                <th class="py-3 px-4">Kode Tugas</th>
                <th class="py-3 px-4">Nama Tugas</th>
                <th class="py-3 px-4">Tanggal</th>
                <th class="py-3 px-4">User / PIC</th>
                <th class="py-3 px-4">Kategori</th>
                <th class="py-3 px-4 text-center">Total Roll Scan</th>
                <th class="py-3 px-4 text-center">Status</th>
                <th class="py-3 px-4 text-center w-28">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 text-zinc-700">
              <tr
                v-for="(task, idx) in taskStore.filteredTasks"
                :key="task.id"
                @click="openTaskDetail(task)"
                class="hover:bg-red-50/30 transition-colors cursor-pointer group"
              >
                <td class="py-3 px-4 font-mono text-zinc-400 font-bold text-center">
                  {{ idx + 1 }}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="font-mono font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg text-xs">
                    {{ task.taskCode }}
                  </span>
                </td>
                <td class="py-3 px-4">
                  <div class="font-black text-zinc-900 group-hover:text-red-600 transition-colors">{{ task.title }}</div>
                  <div v-if="task.notes" class="text-[10.5px] text-zinc-400 truncate max-w-xs">{{ task.notes }}</div>
                </td>
                <td class="py-3 px-4 whitespace-nowrap font-medium text-zinc-600">
                  {{ task.tanggal }}
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="font-bold text-zinc-800">{{ task.user || task.assignee || 'Operator' }}</span>
                </td>
                <td class="py-3 px-4 whitespace-nowrap">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 border border-zinc-200">
                    {{ task.category || 'Picking WIP' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span class="px-2.5 py-0.5 rounded-full text-xs font-mono font-black bg-blue-50 text-blue-800 border border-blue-200">
                    {{ Array.isArray(task.items) ? task.items.length : 0 }} Roll
                  </span>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap">
                  <span
                    :class="[
                      'px-2.5 py-0.5 rounded-full text-[10.5px] font-black border uppercase tracking-wider',
                      task.status === 'Completed'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : 'bg-amber-50 text-amber-700 border-amber-300'
                    ]"
                  >
                    {{ task.status === 'Completed' ? '✓ Selesai' : '⏳ Berjalan' }}
                  </span>
                </td>
                <td class="py-3 px-4 text-center whitespace-nowrap" @click.stop>
                  <div class="flex items-center justify-center gap-1.5">
                    <button
                      type="button"
                      @click="openTaskDetail(task)"
                      class="px-2 py-1 rounded-lg text-xs font-bold bg-zinc-900 hover:bg-black text-white transition-colors flex items-center gap-1 cursor-pointer"
                      title="Buka Detail Tugas"
                    >
                      <span>Buka</span>
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      @click="handleDeleteTask(task.id)"
                      class="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Hapus Tugas"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>

              <!-- Empty state -->
              <tr v-if="taskStore.filteredTasks.length === 0">
                <td colspan="9" class="py-12 text-center text-zinc-400">
                  <div class="text-3xl mb-2">📋</div>
                  <p class="font-bold text-sm text-zinc-700">Belum ada tugas ditemukan</p>
                  <p class="text-xs text-zinc-400 mt-0.5">Klik tombol "+ Tambah Tugas" untuk membuat lembar tugas baru.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODE 2: HALAMAN DETAIL TUGAS & SCANNER VIEW                        -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div v-else-if="viewMode === 'detail' && activeTask" class="space-y-4 animate-fade-in">
      <!-- Top Action Navigation Bar -->
      <div class="bg-white p-3.5 sm:p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
        <!-- Baris Atas: Back button, Kode, Status & Judul -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div class="flex items-start sm:items-center gap-2.5 min-w-0">
            <button
              type="button"
              @click="backToList"
              class="px-2.5 py-1.5 rounded-xl border border-zinc-300 bg-zinc-50 active:bg-zinc-100 text-zinc-800 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs shrink-0"
            >
              <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              <span>Daftar</span>
            </button>

            <div class="min-w-0">
              <div class="flex items-center gap-1.5 flex-wrap">
                <span class="font-mono font-black text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                  {{ activeTask.taskCode }}
                </span>
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10px] font-black border uppercase',
                    activeTask.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-amber-50 text-amber-800 border-amber-300'
                  ]"
                >
                  {{ activeTask.status === 'Completed' ? '✓ Selesai' : '⏳ Berjalan' }}
                </span>
              </div>
              <h2 class="text-sm sm:text-lg font-black text-zinc-900 tracking-tight leading-snug mt-0.5">{{ activeTask.title }}</h2>
              <div class="flex items-center gap-1.5 text-[10.5px] sm:text-xs text-zinc-500 font-medium flex-wrap mt-0.5">
                <span>📅 {{ activeTask.tanggal }}</span>
                <span>•</span>
                <span>👤 <strong class="text-zinc-800">{{ activeTask.user || activeTask.assignee }}</strong></span>
                <span>•</span>
                <span>🏷️ {{ activeTask.category || 'Picking WIP' }}</span>
                <span v-if="activeTask.notes">• {{ activeTask.notes }}</span>
              </div>
            </div>
          </div>

          <!-- Status chip Scanner Gun (layar >= sm) -->
          <div class="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-950 text-white text-[11px] font-bold border border-zinc-800 shadow-2xs shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Scanner Gun Siap</span>
          </div>
        </div>

        <!-- Baris Tombol Aksi di Mobile & Desktop -->
        <div class="pt-2 border-t border-zinc-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
          <!-- Tombol Scanner Kamera di Mobile & Desktop -->
          <button
            type="button"
            @click="openScannerModal"
            :disabled="activeTask.status === 'Completed'"
            :class="[
              'w-full sm:w-auto px-4 py-2.5 sm:py-1.5 rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer',
              activeTask.status === 'Completed'
                ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed border border-zinc-300 shadow-none'
                : 'bg-red-600 hover:bg-red-500 active:scale-98 text-white shadow-red-600/30'
            ]"
            title="Buka Kamera Scanner QR Code"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2" />
              <rect x="7" y="7" width="10" height="10" rx="2" stroke-width="2" />
              <line x1="7" y1="12" x2="17" y2="12" stroke-dasharray="2 1.5" />
            </svg>
            <span>Buka Scanner QR</span>
          </button>

          <div class="grid grid-cols-2 gap-2 sm:flex sm:items-center">
            <!-- Tombol Export Excel Detail -->
            <button
              type="button"
              @click="exportTaskDetail"
              class="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold bg-zinc-100 active:bg-zinc-200 text-zinc-700 border border-zinc-200 shadow-2xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              title="Download Excel Rincian & Summary Tugas Ini"
            >
              <svg class="w-4 h-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <span>Export Excel</span>
            </button>

            <!-- Toggle Status Selesai / Aktif -->
            <button
              type="button"
              @click="toggleTaskStatus"
              :class="[
                'w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs border',
                activeTask.status === 'Completed'
                  ? 'bg-amber-50 active:bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-emerald-600 hover:bg-emerald-500 active:scale-98 text-white border-emerald-600 shadow-emerald-600/20'
              ]"
            >
              <span>{{ activeTask.status === 'Completed' ? '🔓 Buka' : '✓ Selesai' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Scan Alert Banner (Feedback Terakhir) -->
      <transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 -translate-y-2" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-2">
        <div
          v-if="taskStore.lastScanAlert"
          :class="[
            'p-3 rounded-2xl border flex items-center justify-between gap-3 text-xs font-bold shadow-xs',
            taskStore.lastScanAlert.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-950' :
            taskStore.lastScanAlert.type === 'warning' ? 'bg-amber-50 border-amber-300 text-amber-950' :
            'bg-red-50 border-red-300 text-red-950'
          ]"
        >
          <div class="flex items-center gap-2">
            <span class="text-base">{{ taskStore.lastScanAlert.type === 'success' ? '✅' : taskStore.lastScanAlert.type === 'warning' ? '⚠️' : '❌' }}</span>
            <span>{{ taskStore.lastScanAlert.message }}</span>
          </div>
          <button @click="taskStore.lastScanAlert = null" class="text-zinc-400 hover:text-zinc-700 text-sm font-bold">✕</button>
        </div>
      </transition>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- SECTION 1 (BAGIAN ATAS): SUMMARY LIST ACCORDION (FORMAT NAV)     -->
      <!-- Format: [jenis] [kf] [thick] MC X [width] MM                    -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <!-- Summary Header with Grand Totals (3 Satuan: Roll, Meter, Berat Teori) -->
        <div class="p-4 bg-zinc-950 text-white flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">📊</span>
            <div>
              <h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-zinc-100">
                Rangkuman Item Hasil Scan (Parent Accordion)
              </h3>
              <p class="text-[11px] text-zinc-400 font-mono">
                Format: [jenis] [kf] [thick] MC X [width] MM • Klik baris untuk melihat rincian panjang & jumlah roll
              </p>
            </div>
          </div>

          <!-- 3 Metrik Total Akumulasi -->
          <div class="grid grid-cols-3 gap-1.5 sm:flex sm:items-center sm:gap-3 w-full sm:w-auto">
            <div class="bg-zinc-800/80 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-700 text-center">
              <p class="text-[8.5px] sm:text-[9px] uppercase font-bold text-zinc-400">Total Roll</p>
              <p class="text-xs sm:text-sm font-black font-mono text-cyan-300">{{ taskSummary.grandTotalRoll }}</p>
            </div>
            <div class="bg-zinc-800/80 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-700 text-center min-w-0">
              <p class="text-[8.5px] sm:text-[9px] uppercase font-bold text-zinc-400">Total Meter</p>
              <p class="text-xs sm:text-sm font-black font-mono text-emerald-400 truncate">{{ taskSummary.grandTotalMeter.toLocaleString('id-ID') }} M</p>
            </div>
            <div class="bg-zinc-800/80 p-2 sm:px-3 sm:py-1.5 rounded-xl border border-zinc-700 text-center min-w-0">
              <p class="text-[8.5px] sm:text-[9px] uppercase font-bold text-zinc-400">Berat Teori</p>
              <p class="text-xs sm:text-sm font-black font-mono text-amber-300 truncate">{{ taskSummary.grandTotalBeratTeori.toLocaleString('id-ID') }} kg</p>
            </div>
          </div>
        </div>

        <!-- Accordion Groups List -->
        <div v-if="taskSummary.groups.length > 0" class="divide-y divide-zinc-200">
          <div
            v-for="grp in taskSummary.groups"
            :key="grp.key"
            class="transition-colors"
          >
            <!-- Parent Accordion Header Bar -->
            <div
              @click="toggleAccordion(grp.key)"
              class="p-3 sm:p-3.5 hover:bg-zinc-50 active:bg-zinc-100 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2 select-none"
            >
              <div class="flex items-center gap-2 min-w-0">
                <!-- Chevron Toggle -->
                <div
                  :class="[
                    'w-6 h-6 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs font-bold transition-transform duration-200 shrink-0',
                    isAccordionOpen(grp.key) ? 'rotate-90 bg-red-100 text-red-600' : ''
                  ]"
                >
                  ▶
                </div>

                <!-- Group Title in exact requested format: [jenis] [kf] [thick] MC X [width] MM -->
                <div class="min-w-0">
                  <div class="font-black text-xs sm:text-sm text-zinc-900 font-mono tracking-tight flex items-center gap-1.5 flex-wrap">
                    <span class="text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg truncate">
                      {{ grp.key }}
                    </span>
                    <span class="text-[10px] sm:text-[11px] font-bold text-zinc-500 font-sans">
                      ({{ grp.lengths.length }} variasi panjang)
                    </span>
                  </div>
                </div>
              </div>

              <!-- Group Totals Summary Chips -->
              <div class="flex items-center gap-1.5 pl-8 sm:pl-0 shrink-0 text-[10.5px] sm:text-xs font-mono font-bold">
                <span class="px-2 py-0.5 sm:py-1 rounded-lg bg-blue-50 text-blue-900 border border-blue-200">
                  {{ grp.totalRoll }} Roll
                </span>
                <span class="px-2 py-0.5 sm:py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200">
                  {{ grp.totalMeter.toLocaleString('id-ID') }} M
                </span>
                <span class="px-2 py-0.5 sm:py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200">
                  {{ grp.totalBeratTeori.toLocaleString('id-ID') }} kg
                </span>
              </div>
            </div>

            <!-- Accordion Expanded Content (Subgroup by Length) -->
            <div
              v-show="isAccordionOpen(grp.key)"
              class="px-4 pb-4 pt-1 bg-zinc-50/70 border-t border-zinc-100 space-y-2 animate-fade-in"
            >
              <div class="text-[11px] font-bold text-zinc-500 uppercase tracking-wide pt-1">
                Rincian Panjang & Jumlah Roll yang Diambil:
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                <div
                  v-for="lenItem in grp.lengths"
                  :key="lenItem.length"
                  class="p-3 bg-white border border-zinc-200 rounded-xl shadow-2xs flex flex-col justify-between"
                >
                  <div class="flex items-center justify-between border-b border-zinc-100 pb-1.5">
                    <span class="font-mono font-black text-sm text-indigo-700">
                      {{ lenItem.length.toLocaleString('id-ID') }} M
                    </span>
                    <span class="px-2 py-0.5 rounded-full text-xs font-black bg-blue-100 text-blue-900">
                      {{ lenItem.rollCount }} Roll
                    </span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                    <div>
                      <span class="text-zinc-400 block text-[9.5px]">Total Meter:</span>
                      <strong class="text-zinc-800">{{ lenItem.subTotalMeter.toLocaleString('id-ID') }} M</strong>
                    </div>
                    <div class="text-right">
                      <span class="text-zinc-400 block text-[9.5px]">Berat Teori:</span>
                      <strong class="text-emerald-700 font-bold">{{ lenItem.subTotalBeratTeori.toLocaleString('id-ID') }} kg</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State Summary -->
        <div v-else class="p-8 text-center text-zinc-400 space-y-2">
          <div class="text-3xl">📦</div>
          <p class="font-bold text-xs text-zinc-700">Belum ada item roll yang di-scan pada tugas ini</p>
          <p class="text-[11px] text-zinc-400">Klik tombol Scanner melayang di pojok kanan bawah atau tembak dengan barcode scanner gun untuk mulai.</p>
        </div>
      </div>

      <!-- ═════════════════════════════════════════════════════════════════ -->
      <!-- SECTION 2 (BAGIAN BAWAH): TABEL RINCIAN DATA ROLL HASIL SCAN     -->
      <!-- Ukuran, No Lot, Kode Pack, Tanggal Jam Scan                      -->
      <!-- ═════════════════════════════════════════════════════════════════ -->
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden space-y-3 p-4">
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 pb-3">
          <div>
            <h3 class="text-sm font-black text-zinc-900 tracking-tight flex items-center gap-2">
              <span>📋</span>
              <span>Rincian Data Roll yang Berhasil Di-scan</span>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-zinc-100 text-zinc-700">
                {{ (activeTask.items || []).length }} Roll
              </span>
            </h3>
            <p class="text-[11px] text-zinc-500 font-medium mt-0.5">Daftar individual roll fisik yang telah tercatat ke dalam tugas ini</p>
          </div>

          <!-- Fitur Tambahan No 5: Pencarian Cepat di Dalam Tabel Rincian Scan -->
          <div class="relative w-full sm:w-64">
            <input
              v-model="taskStore.scannedSearchTerm"
              type="text"
              placeholder="Cari No Lot, Turunan, Kode Pack..."
              class="w-full pl-7 pr-6 py-1.5 text-xs border border-zinc-300 rounded-xl outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 bg-zinc-50"
            />
            <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <button
              v-if="taskStore.scannedSearchTerm"
              @click="taskStore.scannedSearchTerm = ''"
              class="absolute right-2 top-1.5 text-zinc-400 hover:text-zinc-600 text-xs font-bold"
            >
              ✕
            </button>
          </div>
        </div>

        <!-- MOBILE VIEW: ROLL CARDS LIST (Layar HP < md) -->
        <div class="block md:hidden space-y-2.5">
          <div
            v-for="(item, sIdx) in taskStore.filteredScannedItems"
            :key="'mob-item-' + item.id"
            class="p-3 bg-white border border-zinc-200 rounded-xl shadow-2xs space-y-2"
          >
            <!-- Card Header: No, Lot, Turunan & Delete -->
            <div class="flex items-center justify-between gap-2 border-b border-zinc-100 pb-1.5">
              <div class="flex items-center gap-1.5 flex-wrap min-w-0">
                <span class="font-mono text-zinc-400 font-bold text-xs">#{{ sIdx + 1 }}</span>
                <span class="font-mono font-black text-xs text-zinc-900">Lot {{ item.lot }}</span>
                <span v-if="item.turunan" class="text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.2 rounded text-[10px] font-black">
                  {{ item.turunan }}
                </span>
                <!-- Notice jika pernah di tugas lain -->
                <span
                  v-if="item.otherTaskNotice"
                  class="text-amber-800 bg-amber-50 border border-amber-300 px-1.5 py-0.2 rounded text-[9.5px] font-bold"
                  :title="`Pernah discan di ${item.otherTaskNotice.taskCode}`"
                >
                  ⚠️ {{ item.otherTaskNotice.taskCode }}
                </span>
              </div>

              <!-- Delete Roll Button -->
              <button
                type="button"
                v-if="activeTask.status !== 'Completed'"
                @click="handleRemoveItem(item.id, item.lot)"
                class="p-1 rounded text-zinc-400 hover:text-red-600 active:bg-red-50 transition-colors cursor-pointer shrink-0"
                title="Hapus roll ini"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
              <span v-else class="text-zinc-300 text-xs">🔒</span>
            </div>

            <!-- Card Body: Spesifikasi Ukuran & Jenis -->
            <div>
              <div class="text-xs font-black text-zinc-800">
                {{ item.thickness }} MC × {{ item.width }} MM × {{ item.length }} M
              </div>
              <div class="text-[10.5px] text-zinc-400 font-mono">
                {{ item.jenis }} {{ item.kodeFormula }}
              </div>
            </div>

            <!-- Card Footer: Pack, Berat Teori, Waktu -->
            <div class="flex items-center justify-between text-[11px] font-mono bg-zinc-50 p-2 rounded-lg border border-zinc-100">
              <div>
                <span class="text-zinc-400 text-[9.5px] block">Kode Pack:</span>
                <span class="font-bold text-zinc-800">{{ item.kodePack }}</span>
                <span class="text-red-600 font-bold ml-0.5">{{ item.subKode }}</span>
              </div>
              <div class="text-center">
                <span class="text-zinc-400 text-[9.5px] block">Berat Teori:</span>
                <span class="font-black text-emerald-700">{{ item.beratTeori }} kg</span>
              </div>
              <div class="text-right">
                <span class="text-zinc-400 text-[9.5px] block">Waktu Scan:</span>
                <span class="text-zinc-600 text-[10px]">{{ item.scannedAt }}</span>
              </div>
            </div>
          </div>

          <!-- Empty search on mobile -->
          <div v-if="taskStore.filteredScannedItems.length === 0" class="py-6 text-center text-zinc-400 bg-zinc-50 rounded-xl">
            <p class="font-bold text-xs">Tidak ada roll yang cocok dengan pencarian</p>
          </div>
        </div>

        <!-- DESKTOP VIEW: TABEL RINCIAN ROLL LENGKAP (Layar >= md) -->
        <div class="hidden md:block overflow-x-auto rounded-xl border border-zinc-200">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-zinc-100/80 text-zinc-800 border-b border-zinc-200 font-bold uppercase tracking-wider text-[10.5px] whitespace-nowrap">
                <th class="py-2.5 px-3 text-center w-10">No</th>
                <th class="py-2.5 px-3">Ukuran (Thick × Width × Length)</th>
                <th class="py-2.5 px-3 font-mono">No Lot</th>
                <th class="py-2.5 px-3 font-mono">Turunan</th>
                <th class="py-2.5 px-3 font-mono">Kode Pack & SubKode</th>
                <th class="py-2.5 px-3 text-right">Berat Teori</th>
                <th class="py-2.5 px-3">Tanggal & Jam Scan</th>
                <th class="py-2.5 px-3 text-center w-16">Aksi</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-zinc-100 text-zinc-700">
              <tr
                v-for="(item, sIdx) in taskStore.filteredScannedItems"
                :key="item.id"
                class="hover:bg-red-50/20 transition-colors"
              >
                <td class="py-2.5 px-3 font-mono text-zinc-400 font-bold text-center">
                  {{ sIdx + 1 }}
                </td>
                <td class="py-2.5 px-3 whitespace-nowrap">
                  <span class="font-bold text-zinc-900">
                    {{ item.thickness }} MC × {{ item.width }} MM × {{ item.length }} M
                  </span>
                  <span class="text-[10px] text-zinc-400 block font-mono">
                    {{ item.jenis }} {{ item.kodeFormula }}
                  </span>
                </td>
                <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                  <div class="font-bold text-zinc-900">{{ item.lot }}</div>
                  <div
                    v-if="item.otherTaskNotice"
                    class="mt-0.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs"
                    :title="`Pernah discan di ${item.otherTaskNotice.taskCode} (${item.otherTaskNotice.title}) oleh ${item.otherTaskNotice.user} pada ${item.otherTaskNotice.scannedAt}`"
                  >
                    <span>⚠️</span>
                    <span>Pernah di {{ item.otherTaskNotice.taskCode }}</span>
                  </div>
                </td>
                <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                  <span v-if="item.turunan" class="text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded text-[11px] font-black">
                    {{ item.turunan }}
                  </span>
                  <span v-else class="text-zinc-400">-</span>
                </td>
                <td class="py-2.5 px-3 font-mono whitespace-nowrap">
                  <span class="font-bold text-zinc-800">{{ item.kodePack }}</span>
                  <span class="text-red-600 font-bold">{{ item.subKode }}</span>
                </td>
                <td class="py-2.5 px-3 font-mono font-black text-emerald-700 text-right whitespace-nowrap">
                  {{ item.beratTeori }} kg
                </td>
                <td class="py-2.5 px-3 font-mono text-[11px] text-zinc-500 whitespace-nowrap">
                  {{ item.scannedAt }}
                </td>
                <td class="py-2.5 px-3 text-center whitespace-nowrap" @click.stop>
                  <button
                    type="button"
                    v-if="activeTask.status !== 'Completed'"
                    @click="handleRemoveItem(item.id, item.lot)"
                    class="p-1 rounded text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Hapus roll ini dari tugas"
                  >
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                  <span v-else class="text-zinc-300 text-xs">🔒</span>
                </td>
              </tr>

              <tr v-if="taskStore.filteredScannedItems.length === 0">
                <td colspan="8" class="py-8 text-center text-zinc-400">
                  <p class="font-bold text-xs">Tidak ada roll yang cocok dengan pencarian</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL 1: FORM TAMBAH TUGAS BARU                                    -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="showAddModal"
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-zinc-950/65 backdrop-blur-xs animate-fade-in"
      @click.self="showAddModal = false"
    >
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-5 border border-zinc-200" @click.stop>
        <div class="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div class="flex items-center gap-2">
            <span class="text-lg">📋</span>
            <h3 class="text-base font-black text-zinc-900">Buat Lembar Tugas Baru</h3>
          </div>
          <button @click="showAddModal = false" class="text-zinc-400 hover:text-zinc-600 font-bold text-lg cursor-pointer">✕</button>
        </div>

        <form @submit.prevent="handleAddTaskSubmit" class="mt-4 space-y-3.5 text-xs">
          <!-- Nama Tugas -->
          <div>
            <label class="block font-bold text-zinc-700 mb-1">Nama Tugas <span class="text-red-500">*</span></label>
            <input
              v-model="newTaskForm.title"
              type="text"
              required
              placeholder="Contoh: Picking Roll Order SPK 1234..."
              class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none focus:ring-1 focus:ring-red-500 font-bold text-zinc-900"
              autofocus
            />
          </div>

          <!-- Tanggal & User (Keduanya AUTO-FILL) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-zinc-700 mb-1">Tanggal (Auto)</label>
              <input
                v-model="newTaskForm.tanggal"
                type="date"
                required
                class="w-full px-3 py-2 border border-zinc-200 bg-zinc-100 rounded-xl text-xs font-mono font-bold text-zinc-800 outline-none"
              />
            </div>
            <div>
              <label class="block font-bold text-zinc-700 mb-1">User / PIC (Auto)</label>
              <input
                v-model="newTaskForm.user"
                type="text"
                required
                class="w-full px-3 py-2 border border-zinc-200 bg-zinc-100 rounded-xl text-xs font-bold text-zinc-800 outline-none"
              />
            </div>
          </div>

          <!-- Kategori -->
          <div>
            <label class="block font-bold text-zinc-700 mb-1">Kategori Tugas</label>
            <select
              v-model="newTaskForm.category"
              class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none bg-white font-bold text-zinc-800"
            >
              <option value="Picking WIP">Picking WIP</option>
              <option value="Pengiriman FG">Pengiriman FG</option>
              <option value="Verifikasi QC">Verifikasi QC</option>
              <option value="Palletizing">Palletizing</option>
              <option value="Retur / Relokasi">Retur / Relokasi</option>
            </select>
          </div>

          <!-- Catatan -->
          <div>
            <label class="block font-bold text-zinc-700 mb-1">Catatan Tambahan (Opsional)</label>
            <textarea
              v-model="newTaskForm.notes"
              rows="2"
              placeholder="Instruksi kerja atau lokasi tujuan..."
              class="w-full px-3 py-2 border border-zinc-300 rounded-xl text-xs outline-none"
            ></textarea>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
            <button
              type="button"
              @click="showAddModal = false"
              class="flex-1 sm:flex-initial px-4 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-zinc-100 active:bg-zinc-200 text-zinc-700 cursor-pointer text-center"
            >
              Batal
            </button>
            <button
              type="submit"
              class="flex-1 sm:flex-initial px-5 py-2.5 sm:py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-500 active:bg-red-700 text-white shadow-md shadow-red-600/25 cursor-pointer text-center"
            >
              Simpan & Buka Tugas
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <!-- MODAL 2: CAMERA QR SCANNER & LIVE SCAN RESULTS (MOBILE-FIRST)       -->
    <!-- ═══════════════════════════════════════════════════════════════════ -->
    <div
      v-if="showScannerModal"
      class="fixed inset-0 z-50 flex flex-col bg-zinc-950 sm:bg-zinc-950/85 sm:backdrop-blur-md sm:p-4 sm:items-center sm:justify-center animate-fade-in"
      @click.self="closeScannerModal"
    >
      <div class="bg-white w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-4xl sm:rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden border border-zinc-700/60" @click.stop>
        
        <!-- KOLOM 1: KAMERA VIEWPORT & KONTROL FOKUS -->
        <div class="w-full md:w-1/2 flex flex-col bg-zinc-950 text-white relative shrink-0">
          <!-- Header Kamera Bar -->
          <div class="p-2.5 sm:p-3.5 bg-black/60 border-b border-zinc-800 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-base text-red-500">📷</span>
              <div>
                <h3 class="text-xs font-black uppercase tracking-wide text-zinc-100 flex items-center gap-1.5">
                  <span>Kamera Scanner QR</span>
                  <span class="px-1.5 py-0.2 rounded text-[9px] font-mono bg-red-600/30 text-red-300 border border-red-500/40">HD</span>
                </h3>
                <p class="text-[9.5px] text-zinc-400 font-mono">Fokus Otomatis • Mode Industri</p>
              </div>
            </div>

            <!-- Kontrol Kamera (Torch, Zoom, Close) -->
            <div class="flex items-center gap-1.5">
              <!-- Torch / Senter Toggle Button -->
              <button
                v-if="isTorchSupported"
                type="button"
                @click="toggleTorch"
                :class="[
                  'px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border',
                  isTorchOn
                    ? 'bg-amber-400 text-zinc-950 border-amber-300 shadow-md shadow-amber-400/30'
                    : 'bg-zinc-800 active:bg-zinc-700 text-zinc-300 border-zinc-700'
                ]"
                :title="isTorchOn ? 'Matikan Senter' : 'Nyalakan Senter'"
              >
                <span>{{ isTorchOn ? '🔦 Hidup' : '🔦 Senter' }}</span>
              </button>

              <!-- Zoom Toggle (1x, 2x) -->
              <div v-if="isZoomSupported" class="flex bg-zinc-800 rounded-lg p-0.5 border border-zinc-700">
                <button
                  type="button"
                  @click="setZoom(1)"
                  :class="[
                    'px-2 py-0.5 text-[10px] font-black rounded cursor-pointer transition-all',
                    currentZoom === 1 ? 'bg-red-600 text-white' : 'text-zinc-400 active:text-white'
                  ]"
                >
                  1x
                </button>
                <button
                  type="button"
                  @click="setZoom(2)"
                  :class="[
                    'px-2 py-0.5 text-[10px] font-black rounded cursor-pointer transition-all',
                    currentZoom >= 2 ? 'bg-red-600 text-white' : 'text-zinc-400 active:text-white'
                  ]"
                >
                  2x
                </button>
              </div>

              <!-- Tombol Tutup di Header Mobile -->
              <button
                type="button"
                @click="closeScannerModal"
                class="md:hidden w-7 h-7 rounded-lg bg-zinc-800 active:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer"
                title="Tutup Scanner"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Video Viewport Frame: di HP h-48 agar tidak memakan seluruh layar -->
          <div class="relative bg-black h-48 sm:h-64 md:h-auto md:flex-1 flex items-center justify-center overflow-hidden">
            <video ref="scannerVideoRef" class="w-full h-full object-cover" autoplay playsinline muted></video>

            <!-- Laser Viewfinder Target Frame -->
            <div class="absolute inset-4 sm:inset-8 border-2 border-red-500/80 rounded-2xl pointer-events-none flex flex-col justify-between p-2 shadow-2xl">
              <div class="flex justify-between">
                <span class="w-4 sm:w-5 h-4 sm:h-5 border-t-4 border-l-4 border-red-500 rounded-tl"></span>
                <span class="w-4 sm:w-5 h-4 sm:h-5 border-t-4 border-r-4 border-red-500 rounded-tr"></span>
              </div>

              <!-- Center Reticle / Crosshair -->
              <div class="flex items-center justify-center relative">
                <div class="w-7 sm:w-8 h-7 sm:h-8 rounded-full border border-red-400/50 flex items-center justify-center">
                  <div class="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                </div>
              </div>

              <!-- Moving Laser Animation -->
              <div class="w-full h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse shadow-sm"></div>

              <div class="flex justify-between">
                <span class="w-4 sm:w-5 h-4 sm:h-5 border-b-4 border-l-4 border-red-500 rounded-bl"></span>
                <span class="w-4 sm:w-5 h-4 sm:h-5 border-b-4 border-r-4 border-red-500 rounded-br"></span>
              </div>
            </div>

            <!-- Hint Watermark -->
            <div class="absolute bottom-2 inset-x-0 text-center pointer-events-none">
              <span class="bg-black/75 text-zinc-300 text-[9.5px] font-mono px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-white/10">
                Posisikan QR di dalam kotak merah
              </span>
            </div>

            <!-- Camera Loading Overlay -->
            <div v-if="cameraLoading" class="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-white text-xs gap-2">
              <svg class="w-7 h-7 animate-spin text-red-500" viewBox="0 0 24 24" fill="none">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <span>Menginisialisasi Kamera HD...</span>
            </div>

            <!-- Camera Error Overlay -->
            <div v-if="cameraError" class="absolute inset-0 bg-black/95 p-4 flex flex-col items-center justify-center text-center text-red-400 text-xs gap-2">
              <span class="text-2xl">⚠️</span>
              <p class="font-bold">{{ cameraError }}</p>
              <p class="text-[10px] text-zinc-400">Gunakan input barcode manual di bawah atau tembak langsung dengan Scanner Gun fisik.</p>
            </div>
          </div>

          <!-- Bottom Input Barcode Gun / Manual -->
          <div class="p-2.5 sm:p-3 bg-zinc-900 border-t border-zinc-800">
            <form @submit.prevent="handleManualScanSubmit" class="space-y-1">
              <div class="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                <span>Input String / Scanner Gun:</span>
                <span class="text-emerald-400 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ready
                </span>
              </div>
              <div class="flex gap-1.5">
                <input
                  ref="manualInputRef"
                  v-model="manualQrInput"
                  type="text"
                  placeholder="Ketik/tembak string QR di sini..."
                  class="flex-1 px-2.5 py-1 text-xs border border-zinc-700 rounded-xl font-mono outline-none focus:ring-1 focus:ring-red-500 bg-zinc-950 text-white"
                />
                <button
                  type="submit"
                  class="px-3 py-1 bg-red-600 active:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer shrink-0"
                >
                  + Catat
                </button>
              </div>
            </form>
          </div>
        </div>

        <!-- KOLOM 2: HASIL SCAN LIVE & RIWAYAT SESI -->
        <div class="w-full md:w-1/2 flex flex-col bg-zinc-50 border-t md:border-t-0 md:border-l border-zinc-200 overflow-hidden flex-1">
          <!-- Header Hasil Scan -->
          <div class="p-2.5 sm:p-3.5 bg-white border-b border-zinc-200 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2">
              <span class="text-base">📋</span>
              <div>
                <h3 class="text-xs font-black uppercase text-zinc-900">Hasil Scan & Riwayat</h3>
                <p class="text-[9.5px] text-zinc-500">Live Feedback & Anti-Duplikasi</p>
              </div>
            </div>

            <!-- Live Session Counters -->
            <div class="flex items-center gap-1.5">
              <span class="px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-mono font-black bg-blue-100 text-blue-900 border border-blue-200" title="Roll yang discan pada sesi ini">
                Sesi: {{ sessionScannedList.length }}
              </span>
              <span class="px-2 py-0.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold bg-zinc-100 text-zinc-800 border border-zinc-200" title="Total roll pada lembar tugas ini">
                Total: {{ (activeTask.items || []).length }}
              </span>
              <button
                type="button"
                @click="closeScannerModal"
                class="hidden md:flex ml-1 w-6 h-6 items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 font-bold text-sm cursor-pointer"
                title="Tutup Scanner"
              >
                ✕
              </button>
            </div>
          </div>

          <!-- Content Body (Scrollable di Layar HP) -->
          <div class="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5">
            
            <!-- KARTU INFORMASI HASIL SCAN TERAKHIR (LIVE CARD) -->
            <div>
              <p class="text-[9.5px] uppercase font-bold text-zinc-400 tracking-wider mb-1">Hasil Scan Terakhir:</p>

              <!-- State 1: Scan Berhasil -->
              <div
                v-if="lastScanResult && lastScanResult.success"
                class="p-2.5 sm:p-3 bg-emerald-50/90 border border-emerald-300 rounded-2xl shadow-xs space-y-1.5 animate-fade-in"
              >
                <div class="flex items-start justify-between gap-2 border-b border-emerald-200 pb-1">
                  <div class="flex items-center gap-1.5">
                    <span class="text-sm">✅</span>
                    <span class="font-black text-xs text-emerald-950">ROLL BERHASIL DICATAT</span>
                  </div>
                  <span class="text-[10px] font-mono text-emerald-800 font-bold">{{ lastScanResult.item.scannedAt }}</span>
                </div>

                <div class="space-y-1 text-xs">
                  <div class="font-mono font-black text-zinc-900 text-sm">
                    Lot: {{ lastScanResult.item.lot }}
                    <span v-if="lastScanResult.item.turunan" class="text-red-600 bg-red-100 px-1.5 py-0.2 rounded text-xs ml-1">
                      {{ lastScanResult.item.turunan }}
                    </span>
                  </div>
                  <div class="text-zinc-700 font-medium text-[11.5px]">
                    Ukuran: <strong>{{ lastScanResult.item.thickness }} MC × {{ lastScanResult.item.width }} MM × {{ lastScanResult.item.length }} M</strong>
                  </div>
                  <div class="flex items-center justify-between text-[10.5px] text-zinc-600 font-mono pt-0.5">
                    <span>Pack: <strong>{{ lastScanResult.item.kodePack }} {{ lastScanResult.item.subKode }}</strong></span>
                    <span>Berat: <strong class="text-emerald-800">{{ lastScanResult.item.beratTeori }} kg</strong></span>
                  </div>
                </div>

                <!-- Alert jika roll pernah ada di tugas lain -->
                <div
                  v-if="lastScanResult.otherNotice"
                  class="p-2 bg-amber-100/90 border border-amber-300 rounded-xl text-[10px] text-amber-950 font-medium space-y-0.5 mt-1"
                >
                  <div class="font-bold flex items-center gap-1 text-amber-900">
                    <span>⚠️</span>
                    <span>Pernah Di-scan di Tugas Lain!</span>
                  </div>
                  <p class="text-[9.5px] text-amber-900/90 leading-tight">
                    Roll ini pernah tercatat pada <strong>{{ lastScanResult.otherNotice.taskCode }}</strong> ({{ lastScanResult.otherNotice.title }}) oleh {{ lastScanResult.otherNotice.user }} pada {{ lastScanResult.otherNotice.scannedAt }}. Roll tetap disimpan ke tugas ini.
                  </p>
                </div>
              </div>

              <!-- State 2: Scan Ditolak Karena Duplikat Tugas Sama -->
              <div
                v-else-if="lastScanResult && lastScanResult.reason === 'DUPLICATE_SAME_TASK'"
                class="p-2.5 sm:p-3 bg-red-50 border-2 border-red-400 rounded-2xl shadow-xs space-y-1 animate-fade-in"
              >
                <div class="flex items-center gap-1.5 text-red-950 font-black text-xs">
                  <span class="text-sm">❌</span>
                  <span>DITOLAK: DUPLIKAT DI TUGAS INI</span>
                </div>
                <p class="text-xs font-bold text-red-900 leading-snug">
                  {{ lastScanResult.message }}
                </p>
                <p class="text-[9.5px] text-red-700 font-medium">
                  Item identik dalam satu tugas yang sama tidak disimpan ulang untuk mencegah data ganda.
                </p>
              </div>

              <!-- State 3: Gagal Scan / QR Tidak Valid -->
              <div
                v-else-if="lastScanResult && !lastScanResult.success"
                class="p-2.5 sm:p-3 bg-red-50 border border-red-300 rounded-2xl shadow-xs space-y-1 animate-fade-in"
              >
                <div class="flex items-center gap-1.5 text-red-950 font-black text-xs">
                  <span class="text-sm">❌</span>
                  <span>GAGAL MEMPROSES QR CODE</span>
                </div>
                <p class="text-xs font-bold text-red-800">{{ lastScanResult.message }}</p>
              </div>

              <!-- State 4: Belum Ada Scan -->
              <div
                v-else
                class="p-3 bg-white border border-dashed border-zinc-300 rounded-2xl text-center text-zinc-400 space-y-0.5"
              >
                <span class="text-xl">🎯</span>
                <p class="text-xs font-bold text-zinc-700">Siap Memindai QR Code</p>
                <p class="text-[10px] text-zinc-400">Arahkan kamera ke label atau gunakan barcode gun fisik. Hasil scan langsung tampil di sini.</p>
              </div>
            </div>

            <!-- LIST DAFTAR ITEM YANG BERHASIL DISCAN SESI INI -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between text-[10px] font-bold text-zinc-600">
                <span class="uppercase tracking-wider">Riwayat Scan Sesi Ini ({{ sessionScannedList.length }} Roll):</span>
                <span v-if="sessionScannedList.length > 0" class="text-zinc-400 text-[9px]">Terbaru di atas</span>
              </div>

              <div v-if="sessionScannedList.length > 0" class="space-y-1.5 max-h-44 sm:max-h-56 overflow-y-auto pr-1">
                <div
                  v-for="(sItem, idx) in sessionScannedList"
                  :key="sItem.id"
                  class="p-2 sm:p-2.5 bg-white border border-zinc-200 rounded-xl shadow-2xs hover:border-zinc-300 transition-all flex items-center justify-between gap-2"
                >
                  <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-1 flex-wrap">
                      <span class="text-[9.5px] font-mono font-bold text-zinc-400">#{{ sessionScannedList.length - idx }}</span>
                      <span class="font-mono font-black text-xs text-zinc-900">Lot {{ sItem.lot }}</span>
                      <span v-if="sItem.turunan" class="text-red-600 bg-red-50 border border-red-200 px-1 py-0.2 rounded text-[9.5px] font-bold">
                        {{ sItem.turunan }}
                      </span>
                      <span v-if="sItem.otherTaskNotice" class="text-amber-800 bg-amber-50 border border-amber-300 px-1 py-0.2 rounded text-[9px] font-bold">
                        ⚠️ {{ sItem.otherTaskNotice.taskCode }}
                      </span>
                    </div>
                    <div class="text-[10px] text-zinc-600 font-medium truncate mt-0.5">
                      {{ sItem.thickness }} MC × {{ sItem.width }} MM × {{ sItem.length }} M • Pack: {{ sItem.kodePack }}{{ sItem.subKode }}
                    </div>
                  </div>

                  <div class="text-right shrink-0">
                    <div class="font-mono font-black text-xs text-emerald-700">{{ sItem.beratTeori }} kg</div>
                    <div class="text-[9px] font-mono text-zinc-400">{{ sItem.scannedAt }}</div>
                  </div>

                  <!-- Quick Remove from Session Button -->
                  <button
                    type="button"
                    @click="handleRemoveSessionItem(sItem)"
                    class="p-1 text-zinc-300 hover:text-red-600 active:bg-red-50 rounded transition-colors cursor-pointer"
                    title="Batalkan roll ini"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>

              <div v-else class="p-2.5 bg-zinc-100/60 rounded-xl text-center text-zinc-400 text-xs">
                <span class="text-[10.5px]">Belum ada roll yang discan pada sesi jendela scanner ini.</span>
              </div>
            </div>

          </div>

          <!-- Footer Panel di Mobile & Desktop -->
          <div class="p-2.5 sm:p-3 bg-white border-t border-zinc-200 flex items-center justify-between gap-2 shrink-0">
            <span class="text-[10px] text-zinc-500 font-medium hidden sm:inline">Auto-sync Cloud & Dexie DB</span>
            <button
              type="button"
              @click="closeScannerModal"
              class="w-full sm:w-auto px-4 py-2 sm:py-1.5 rounded-xl font-bold bg-zinc-900 active:bg-black text-white text-xs cursor-pointer shadow-xs transition-all text-center"
            >
              Selesai & Tutup Scanner
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue';
import { useTaskStore } from '@/stores/taskStore';
import { useAuthStore } from '@/stores/authStore';
import { useConfigStore } from '@/stores/configStore';
import { playSuccessFeedback, playWarningFeedback } from '@/services/taskScannerService';

const taskStore = useTaskStore();
const authStore = useAuthStore();
const configStore = useConfigStore();

// View navigation state: 'list' | 'detail'
const viewMode = ref('list');

// Accordion open/close state tracking
const openAccordions = reactive({});

// Modals & Scanner Session State
const showAddModal = ref(false);
const showScannerModal = ref(false);
const manualInputRef = ref(null);
const manualQrInput = ref('');
const modalScanMessage = ref(null);

// Scanner Live Session & Feedback
const sessionScannedList = ref([]);
const lastScanResult = ref(null);

// Camera streaming & Hardware Capabilities
const scannerVideoRef = ref(null);
const cameraLoading = ref(false);
const cameraError = ref(null);
const isTorchSupported = ref(false);
const isTorchOn = ref(false);
const isZoomSupported = ref(false);
const minZoom = ref(1);
const maxZoom = ref(3);
const currentZoom = ref(1);
let mediaStream = null;
let animationFrameId = null;
let barcodeDetector = null;

// New Task Form State
const newTaskForm = reactive({
  title: '',
  tanggal: new Date().toISOString().slice(0, 10),
  user: '',
  category: 'Picking WIP',
  notes: ''
});

// Computed active task & summary
const activeTask = computed(() => taskStore.activeTask);
const taskSummary = computed(() => taskStore.activeTaskSummary);

// Accordion toggle helpers
const isAccordionOpen = (key) => {
  return openAccordions[key] !== false; // default true
};

const toggleAccordion = (key) => {
  openAccordions[key] = !isAccordionOpen(key);
};

// ── TASK NAVIGATION ─────────────────────────────────────────────────────────

const openTaskDetail = (task) => {
  taskStore.setActiveTask(task.id);
  viewMode.value = 'detail';
  // Open all accordions by default
  const summary = taskStore.activeTaskSummary;
  if (summary && Array.isArray(summary.groups)) {
    summary.groups.forEach(g => {
      openAccordions[g.key] = true;
    });
  }
};

const backToList = () => {
  taskStore.clearActiveTask();
  viewMode.value = 'list';
};

// ── ADD TASK ────────────────────────────────────────────────────────────────

const openAddTaskModal = () => {
  const today = new Date().toISOString().slice(0, 10);
  const activeUser = authStore.currentUser?.name || authStore.currentUser?.username || 'Operator';

  newTaskForm.title = '';
  newTaskForm.tanggal = today;
  newTaskForm.user = activeUser;
  newTaskForm.category = 'Picking WIP';
  newTaskForm.notes = '';

  showAddModal.value = true;
};

const handleAddTaskSubmit = async () => {
  if (!newTaskForm.title.trim()) return;
  const created = await taskStore.addTask({ ...newTaskForm });
  showAddModal.value = false;
  if (created && created.id) {
    openTaskDetail(created);
  }
};

const handleDeleteTask = async (id) => {
  if (confirm('Yakin ingin menghapus tugas ini? Seluruh riwayat scan di dalamnya akan terhapus.')) {
    await taskStore.deleteTask(id);
  }
};

const toggleTaskStatus = async () => {
  if (!activeTask.value) return;
  const newStatus = activeTask.value.status === 'Completed' ? 'In Progress' : 'Completed';
  await taskStore.updateTaskStatus(activeTask.value.id, newStatus);
};

const handleRemoveItem = async (itemId, lot) => {
  if (!activeTask.value) return;
  if (confirm(`Hapus roll Lot ${lot} dari tugas ini?`)) {
    await taskStore.removeScannedItem(activeTask.value.id, itemId);
  }
};

// ── EXPORT EXCEL ────────────────────────────────────────────────────────────

const exportTasksList = async () => {
  await taskStore.exportTasksListToExcel();
};

const exportTaskDetail = async () => {
  if (!activeTask.value) return;
  await taskStore.exportTaskDetailToExcel(activeTask.value.id);
};

// ── SCANNER MODAL & CAMERA LOGIC ────────────────────────────────────────────

const openScannerModal = async () => {
  modalScanMessage.value = null;
  manualQrInput.value = '';
  cameraError.value = null;
  lastScanResult.value = null;
  sessionScannedList.value = [];
  isTorchOn.value = false;
  currentZoom.value = 1;
  showScannerModal.value = true;
  await nextTick();
  startCamera();
};

const closeScannerModal = () => {
  stopCamera();
  showScannerModal.value = false;
};

const inspectCameraCapabilities = (stream) => {
  try {
    const track = stream.getVideoTracks()[0];
    if (track && track.getCapabilities) {
      const caps = track.getCapabilities();
      isTorchSupported.value = Boolean(caps.torch);
      if (caps.zoom) {
        isZoomSupported.value = true;
        minZoom.value = caps.zoom.min || 1;
        maxZoom.value = caps.zoom.max || 3;
        currentZoom.value = caps.zoom.min || 1;
      } else {
        isZoomSupported.value = false;
      }
    }
  } catch (e) {
    console.warn('Cannot query camera capabilities:', e);
  }
};

const toggleTorch = async () => {
  if (!mediaStream) return;
  const track = mediaStream.getVideoTracks()[0];
  if (track && track.applyConstraints) {
    try {
      const nextTorch = !isTorchOn.value;
      await track.applyConstraints({
        advanced: [{ torch: nextTorch }]
      });
      isTorchOn.value = nextTorch;
    } catch (err) {
      console.warn('Torch failed:', err);
    }
  }
};

const setZoom = async (zoomValue) => {
  if (!mediaStream) return;
  const track = mediaStream.getVideoTracks()[0];
  if (track && track.applyConstraints) {
    try {
      const target = Math.min(Math.max(zoomValue, minZoom.value), maxZoom.value);
      await track.applyConstraints({
        advanced: [{ zoom: target }]
      });
      currentZoom.value = target;
    } catch (err) {
      console.warn('Zoom failed:', err);
    }
  }
};

const startCamera = async () => {
  cameraLoading.value = true;
  cameraError.value = null;

  try {
    // Check if BarcodeDetector is available natively
    if ('BarcodeDetector' in window) {
      try {
        const formats = await window.BarcodeDetector.getSupportedFormats();
        if (formats.includes('qr_code')) {
          barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code', 'code_128', 'data_matrix'] });
        }
      } catch (e) {
        barcodeDetector = null;
      }
    }

    // HD resolution constraints for sharp focus
    const constraints = {
      video: {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1920, min: 1280 },
        height: { ideal: 1080, min: 720 },
        focusMode: { ideal: 'continuous' }
      },
      audio: false
    };

    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    if (scannerVideoRef.value) {
      scannerVideoRef.value.srcObject = mediaStream;
      await scannerVideoRef.value.play();
      cameraLoading.value = false;
      inspectCameraCapabilities(mediaStream);
      requestScanFrame();
    }
  } catch (err) {
    console.warn('Camera error:', err);
    cameraLoading.value = false;
    cameraError.value = 'Tidak dapat mengakses kamera: ' + (err.message || 'Periksa izin kamera browser.');
  }
};

const stopCamera = () => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  if (mediaStream) {
    mediaStream.getTracks().forEach(track => {
      try {
        if (isTorchOn.value && track.applyConstraints) {
          track.applyConstraints({ advanced: [{ torch: false }] });
        }
      } catch (_) {}
      track.stop();
    });
    mediaStream = null;
  }
  isTorchOn.value = false;
};

let lastScannedRaw = '';
let scanCooldownTimer = null;

const requestScanFrame = () => {
  if (!scannerVideoRef.value || !mediaStream || !showScannerModal.value) return;

  if (barcodeDetector && scannerVideoRef.value.readyState >= 2) {
    barcodeDetector.detect(scannerVideoRef.value)
      .then(barcodes => {
        if (barcodes && barcodes.length > 0) {
          const raw = barcodes[0].rawValue;
          if (raw && raw !== lastScannedRaw) {
            lastScannedRaw = raw;
            clearTimeout(scanCooldownTimer);
            scanCooldownTimer = setTimeout(() => { lastScannedRaw = ''; }, 2000);
            processScannedQr(raw);
          }
        }
      })
      .catch(() => {});
  }

  animationFrameId = requestAnimationFrame(requestScanFrame);
};

// ── SCAN PROCESSING & LIVE FEEDBACK ─────────────────────────────────────────

const processScannedQr = async (rawCode) => {
  if (!activeTask.value || !rawCode.trim()) return;

  const activeUser = authStore.currentUser?.name || authStore.currentUser?.username || activeTask.value.user || 'Operator';
  const result = await taskStore.addScannedItem(activeTask.value.id, rawCode, activeUser);

  if (result.success) {
    lastScanResult.value = {
      success: true,
      reason: null,
      title: 'Roll Berhasil Dicatat',
      message: `Lot ${result.item.lot} ${result.item.turunan || ''} (${result.item.thickness} MC × ${result.item.width} MM × ${result.item.length} M)`,
      item: result.item,
      otherNotice: result.otherTaskNotice || null
    };
    // Prepend ke list riwayat scan sesi ini
    sessionScannedList.value.unshift(result.item);
    modalScanMessage.value = null;
  } else if (result.reason === 'DUPLICATE_SAME_TASK') {
    lastScanResult.value = {
      success: false,
      reason: 'DUPLICATE_SAME_TASK',
      title: 'Ditolak: Roll Duplikat!',
      message: result.message,
      item: result.item,
      otherNotice: null
    };
  } else {
    lastScanResult.value = {
      success: false,
      reason: result.reason || 'ERROR',
      title: 'Gagal Scan QR',
      message: result.message || 'QR Code tidak valid!',
      item: null,
      otherNotice: null
    };
  }
};

const handleRemoveSessionItem = async (sItem) => {
  if (!activeTask.value) return;
  await taskStore.removeScannedItem(activeTask.value.id, sItem.id);
  sessionScannedList.value = sessionScannedList.value.filter(s => s.id !== sItem.id);
  if (lastScanResult.value?.item?.id === sItem.id) {
    lastScanResult.value = null;
  }
};

const handleManualScanSubmit = async () => {
  if (!manualQrInput.value.trim()) return;
  await processScannedQr(manualQrInput.value);
  manualQrInput.value = '';
  if (manualInputRef.value) manualInputRef.value.focus();
};

// ── HARDWARE BARCODE SCANNER GUN LISTENER ────────────────────────────────────
// Captures rapid keystrokes from USB / Bluetooth barcode scanners ending in Enter
let keyBuffer = '';
let lastKeyTime = 0;

const handleGlobalKeydown = (e) => {
  // Only listen when a task detail view is active and user is not typing in a normal text input
  if (viewMode.value !== 'detail' || !activeTask.value) return;

  const targetTag = (e.target.tagName || '').toLowerCase();
  const isInputTarget = targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select';

  // If focus is specifically in an input that isn't the scanner manual input, let standard typing work
  if (isInputTarget && e.target !== manualInputRef.value) {
    return;
  }

  const now = Date.now();
  if (now - lastKeyTime > 150) {
    keyBuffer = '';
  }
  lastKeyTime = now;

  if (e.key === 'Enter') {
    if (keyBuffer.length >= 4) {
      e.preventDefault();
      const codeToScan = keyBuffer.trim();
      keyBuffer = '';
      processScannedQr(codeToScan);
    }
  } else if (e.key.length === 1) {
    keyBuffer += e.key;
  }
};

// ── LIFECYCLE HOOKS ─────────────────────────────────────────────────────────

const handleTasksSyncEvent = async () => {
  await taskStore.loadTasks();
};

onMounted(async () => {
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('sync:tasks-updated', handleTasksSyncEvent);

  await Promise.all([
    taskStore.loadTasks(),
    configStore.loadAll().catch(() => {})
  ]);

  // Pull latest tasks from cloud on mount
  taskStore.pullTasksFromCloud().catch(console.warn);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('sync:tasks-updated', handleTasksSyncEvent);
  stopCamera();
});
</script>

<style scoped>
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.animate-pulse {
  animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.animate-fade-in {
  animation: fadeIn 0.18s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
