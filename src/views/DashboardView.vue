<template>
  <div class="space-y-6 animate-fade-in pb-12">
    
    <!-- ========================================================================= -->
    <!-- 1. DYNAMIC ROLE-BASED WELCOME & JOB BANNER -->
    <!-- ========================================================================= -->
    <div class="bg-gradient-to-r from-zinc-950 via-zinc-900 to-red-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-zinc-800 relative overflow-hidden">
      <!-- Ambient light effect -->
      <div class="absolute -right-20 -top-20 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      
      <div class="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div class="space-y-2">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/30 text-red-300 text-xs font-mono font-black border border-red-500/40">
              <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
              <span>PT. SAPTAWARNA CEMERLANG</span>
            </span>
            <span :class="['px-2.5 py-0.5 rounded-full text-xs font-black font-mono tracking-wide uppercase', currentRoleBadgeClass]">
              {{ currentRoleTitle }}
            </span>
          </div>

          <h1 class="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Selamat Datang, {{ authStore.currentUser?.name || 'Operator' }}!
          </h1>
          <p class="text-zinc-300 text-xs sm:text-sm max-w-2xl font-medium leading-relaxed">
            {{ currentRoleDescription }}
          </p>
        </div>

        <!-- Role-Tailored Quick Action Buttons -->
        <div class="flex flex-wrap items-center gap-2.5 shrink-0">
          
          <!-- Operator Actions -->
          <template v-if="userRole === 'OPERATOR'">
            <router-link
              v-if="can('label', 'edit')"
              to="/label"
              class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <span>🏷️</span>
              <span>Cetak Label Baru</span>
            </router-link>
            <router-link
              v-if="can('schedule', 'view')"
              to="/schedule"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>📅</span>
              <span>Jadwal Shift</span>
            </router-link>
            <router-link
              v-if="can('tools', 'view')"
              to="/tools"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>🛠️</span>
              <span>Kalkulator Roll</span>
            </router-link>
          </template>

          <!-- Admin DE Actions -->
          <template v-else-if="userRole === 'ADMIN_DE'">
            <router-link
              v-if="can('data_roll', 'edit')"
              to="/data-roll"
              class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <span>🌀</span>
              <span>Upload Batch Roll</span>
            </router-link>
            <router-link
              v-if="can('de_report', 'view')"
              to="/de-report"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>📋</span>
              <span>Laporan DE Report</span>
            </router-link>
            <router-link
              v-if="can('scan_report', 'view')"
              to="/scan-report"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>🤖</span>
              <span>Scan Laporan AI</span>
            </router-link>
          </template>

          <!-- QC Inspector Actions -->
          <template v-else-if="userRole === 'QC'">
            <router-link
              v-if="can('tasks', 'edit')"
              to="/tasks"
              class="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-black text-xs uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg shadow-amber-600/30 transition-all"
            >
              <span>✅</span>
              <span>Verifikasi Tugas QR</span>
            </router-link>
            <router-link
              v-if="can('data_roll', 'view')"
              to="/data-roll"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>🌀</span>
              <span>Inspeksi Data Roll</span>
            </router-link>
            <router-link
              v-if="can('tools', 'view')"
              to="/tools"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>🛠️</span>
              <span>Toleransi Berat QC</span>
            </router-link>
          </template>

          <!-- Gudang Actions -->
          <template v-else-if="userRole === 'GUDANG'">
            <router-link
              v-if="can('inventory', 'view')"
              to="/inventory"
              class="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
            >
              <span>📦</span>
              <span>Buka Gudang IMS</span>
            </router-link>
            <router-link
              v-if="can('opname', 'view')"
              to="/opname"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>📝</span>
              <span>Stok Opname</span>
            </router-link>
          </template>

          <!-- Super Admin / Default Actions -->
          <template v-else>
            <router-link
              to="/users"
              class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase font-mono tracking-wider flex items-center gap-2 shadow-lg shadow-red-600/30 transition-all"
            >
              <span>👥</span>
              <span>Kelola Pengguna</span>
            </router-link>
            <router-link
              to="/label"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>🏷️</span>
              <span>Input Label</span>
            </router-link>
            <router-link
              to="/data-config"
              class="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-sm transition-all"
            >
              <span>⚙️</span>
              <span>Data Config</span>
            </router-link>
          </template>

        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 2. ROLE-TAILORED KPI METRICS CARDS -->
    <!-- ========================================================================= -->
    
    <!-- CASE A: OPERATOR KPI CARDS -->
    <div v-if="userRole === 'OPERATOR'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Shift & Regu Aktif -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-blue-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Shift Berjalan</span>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg">
            ⏱️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-xl font-black text-zinc-900">{{ currentShift.definition.name }}</div>
          <div class="text-xs text-blue-700 font-bold mt-1">
            Grup {{ currentShift.group }} • {{ currentShift.definition.startTime }} - {{ currentShift.definition.endTime }}
          </div>
        </div>
      </div>

      <!-- Total Roll Dicetak -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Total Label Roll</span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            🏷️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ labelStats.total }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Tercetak di database</div>
        </div>
      </div>

      <!-- Akumulasi Netto Produksi -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Akumulasi Berat</span>
          <div class="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center font-bold text-lg">
            ⚖️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ labelStats.totalBerat }} <span class="text-sm font-bold text-zinc-500">Kg</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Berat bersih film FG</div>
        </div>
      </div>

      <!-- Status Kelulusan QC -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-emerald-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Kualitas Label</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
            ✅
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-emerald-700">{{ operatorPassPercent }}% <span class="text-xs font-bold text-zinc-500">PASS</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">{{ labelStats?.statusPass || 0 }} Pass • {{ labelStats?.statusHold || 0 }} Hold</div>
        </div>
      </div>
    </div>

    <!-- CASE B: ADMIN DATA ENTRY KPI CARDS -->
    <div v-else-if="userRole === 'ADMIN_DE'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Total Batch Roll Terdata -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Total Identitas Roll</span>
          <div class="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center font-bold text-lg">
            🌀
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ dataRollStore.totalRolls }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-purple-700 font-bold mt-1">Data Roll Identitas Aktif</div>
        </div>
      </div>

      <!-- Total Batch File Excel Terunggah -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-purple-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Batch Upload Excel</span>
          <div class="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center font-bold text-lg">
            📁
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ dataRollStore.uploadHistory.length }} <span class="text-sm font-bold text-zinc-500">Batch</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Riwayat impor berkas roll</div>
        </div>
      </div>

      <!-- Total Label Tercetak -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Label Tercetak</span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            🏷️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ labelStats.total }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">{{ labelStats.totalBerat }} Kg terverifikasi</div>
        </div>
      </div>

      <!-- Roll Menunggu Verifikasi -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-amber-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Roll Perlu Review</span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold text-lg">
            📋
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-amber-700">{{ unverifiedRollsCount }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Menunggu pencocokan DE</div>
        </div>
      </div>
    </div>

    <!-- CASE C: QC INSPECTOR KPI CARDS -->
    <div v-else-if="userRole === 'QC'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Pass Rate -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-emerald-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Kelulusan Mutu</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
            🎯
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-emerald-600">{{ qcPassRate }}%</div>
          <div class="text-xs text-emerald-700 font-bold mt-1">{{ labelStats?.statusPass || 0 }} Roll Lolos Uji</div>
        </div>
      </div>

      <!-- Karantina / HOLD -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-amber-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Status HOLD</span>
          <div class="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-amber-600">{{ labelStats?.statusHold || 0 }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Dalam peninjauan kualitas</div>
        </div>
      </div>

      <!-- REJECT -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Status REJECT</span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            🛑
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-red-600">{{ labelStats?.statusReject || 0 }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Gagal standar produksi</div>
        </div>
      </div>

      <!-- Tugas QC Pending -->
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-blue-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Tugas Pemeriksaan</span>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg">
            📝
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-blue-700">{{ taskStore.pendingTasks + taskStore.inProgressTasks }} <span class="text-sm font-bold text-zinc-500">Tugas</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">{{ taskStore.inProgressTasks }} Berjalan • {{ taskStore.pendingTasks }} Pending</div>
        </div>
      </div>
    </div>

    <!-- CASE D: GUDANG & LOGISTIK KPI CARDS -->
    <div v-else-if="userRole === 'GUDANG'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-emerald-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Item Master Opname</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
            📦
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ opnameStore.totalItems }} <span class="text-sm font-bold text-zinc-500">Item</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">SKU Bahan & Barang Jadi</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-emerald-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Stok Cocok</span>
          <div class="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center font-bold text-lg">
            ✓
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-emerald-600">{{ opnameStore.matchItems }} <span class="text-sm font-bold text-zinc-500">Item</span></div>
          <div class="text-xs text-emerald-700 font-bold mt-1">Sistem sama dengan fisik</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Stok Selisih</span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            ⚠️
          </div>
        </div>
        <div class="mt-3">
          <div :class="['text-2xl font-black', opnameStore.discrepancyItems > 0 ? 'text-red-600' : 'text-zinc-900']">
            {{ opnameStore.discrepancyItems }} <span class="text-sm font-bold text-zinc-500">Item</span>
          </div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Perlu penyesuaian fisik</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-blue-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Roll Identitas Masuk</span>
          <div class="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center font-bold text-lg">
            🌀
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ dataRollStore.totalRolls }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Tercatat siap masuk gudang</div>
        </div>
      </div>
    </div>

    <!-- CASE E: SUPER ADMIN / DEFAULT KPI CARDS -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Total Label</span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            🏷️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ labelStats.total }} <span class="text-sm font-bold text-zinc-500">Roll</span></div>
          <div class="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-semibold font-mono">
            <span class="text-emerald-700 font-bold">{{ labelStats?.statusPass || 0 }} PASS</span>
            <span>•</span>
            <span class="text-amber-700 font-bold">{{ labelStats?.statusHold || 0 }} HOLD</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Tonase Produksi</span>
          <div class="w-10 h-10 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-200 flex items-center justify-center font-bold text-lg">
            ⚖️
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ labelStats.totalBerat }} <span class="text-sm font-bold text-zinc-500">Kg</span></div>
          <div class="text-xs text-zinc-500 mt-1 font-medium">Akumulasi Berat Bersih Film</div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Tugas QC & QR</span>
          <div class="w-10 h-10 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center font-bold text-lg">
            📋
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ taskStore.totalTasks }} <span class="text-sm font-bold text-zinc-500">Tugas</span></div>
          <div class="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-semibold">
            <span class="text-red-600 font-bold">{{ taskStore.inProgressTasks }} Aktif</span>
            <span>•</span>
            <span class="text-zinc-600 font-bold">{{ taskStore.pendingTasks }} Pending</span>
          </div>
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs hover:border-red-300 transition-all">
        <div class="flex items-center justify-between">
          <span class="text-xs font-black text-zinc-500 uppercase tracking-wider font-mono">Stok Opname</span>
          <div class="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-lg">
            📦
          </div>
        </div>
        <div class="mt-3">
          <div class="text-2xl font-black text-zinc-900">{{ opnameStore.totalItems }} <span class="text-sm font-bold text-zinc-500">Item</span></div>
          <div class="flex items-center gap-2 mt-1 text-xs text-zinc-500 font-semibold">
            <span class="text-emerald-700 font-bold">{{ opnameStore.matchItems }} Sesuai</span>
            <span>•</span>
            <span :class="opnameStore.discrepancyItems > 0 ? 'text-red-600 font-bold' : 'text-zinc-500'">
              {{ opnameStore.discrepancyItems }} Selisih
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- 3. ROLE-SPECIFIC WORKSPACES & CONTENT PANELS -->
    <!-- ========================================================================= -->

    <!-- OPERATOR WORKSPACE: TOOLS SHORTCUTS & LIVE SHIFT -->
    <div v-if="userRole === 'OPERATOR'" class="space-y-6">
      
      <!-- Live Shift Handover Banner -->
      <div class="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <span class="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-xl shadow-xs">
            📢
          </span>
          <div>
            <h4 class="text-sm font-black text-blue-900">Serah Terima Shift & Roster Kerja</h4>
            <p class="text-xs text-blue-700">
              Shift aktif saat ini: <strong>{{ currentShift.definition.name }} (Grup {{ currentShift.group }})</strong>. Pastikan kebersihan mesin dan timbangan sebelum pergantian.
            </p>
          </div>
        </div>
        <button
          @click="scheduleStore.showShiftHandoverModal = true"
          class="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase font-mono shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          Buka Form Handover
        </button>
      </div>

      <!-- Fast Tools Cards for Operators -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <router-link
          to="/tools"
          class="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-2xl group-hover:scale-110 transition-transform">📐</span>
            <div>
              <h4 class="font-black text-xs text-zinc-900">Geometri Roll (Handymath)</h4>
              <p class="text-[11px] text-zinc-500">Hitung OD ke Meter atau Meter ke OD</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/tools"
          class="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-2xl group-hover:scale-110 transition-transform">⚖️</span>
            <div>
              <h4 class="font-black text-xs text-zinc-900">Berat Teori Standar QC</h4>
              <p class="text-[11px] text-zinc-500">Cek toleransi selisih netto roll film</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/tools"
          class="bg-white p-4 rounded-2xl border border-zinc-200 hover:border-red-300 hover:shadow-md transition-all group"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-2xl group-hover:scale-110 transition-transform">🔪</span>
            <div>
              <h4 class="font-black text-xs text-zinc-900">Susunan Pisau Slitting</h4>
              <p class="text-[11px] text-zinc-500">Optimasi pisau potong & trim waste</p>
            </div>
          </div>
        </router-link>
      </div>

    </div>

    <!-- CHARTS SECTION (VISIBLE FOR SUPER ADMIN, DE, QC) -->
    <div v-if="userRole !== 'GUDANG'" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Main Chart: Produksi per Mesin -->
      <div class="lg:col-span-2 bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-base font-black text-zinc-900">Distribusi Produksi per Mesin</h3>
            <p class="text-xs text-zinc-500 font-medium">Perbandingan jumlah roll yang diproses pada tiap unit mesin</p>
          </div>
          <span class="px-2.5 py-1 rounded-lg bg-red-50 text-red-700 text-xs font-bold border border-red-200 font-mono">Mesin</span>
        </div>
        <div class="h-64 relative">
          <canvas ref="machineChartCanvas"></canvas>
        </div>
      </div>

      <!-- Status Quality QC Chart -->
      <div class="bg-white p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-base font-black text-zinc-900">Status Kualitas QC</h3>
              <p class="text-xs text-zinc-500 font-medium">Rasio PASS, HOLD, & REJECT</p>
            </div>
            <span class="px-2.5 py-1 rounded-lg bg-zinc-100 text-zinc-800 text-xs font-bold border border-zinc-200 font-mono">QC</span>
          </div>
          <div class="h-52 relative">
            <canvas ref="statusChartCanvas"></canvas>
          </div>
        </div>

        <div class="mt-4 pt-4 border-t border-zinc-100 grid grid-cols-3 gap-2 text-center font-mono">
          <div class="p-2 bg-emerald-50 rounded-xl border border-emerald-200">
            <p class="text-[10px] text-emerald-800 font-bold">PASS</p>
            <p class="text-base font-black text-emerald-900">{{ labelStats?.statusPass || 0 }}</p>
          </div>
          <div class="p-2 bg-amber-50 rounded-xl border border-amber-200">
            <p class="text-[10px] text-amber-800 font-bold">HOLD</p>
            <p class="text-base font-black text-amber-900">{{ labelStats?.statusHold || 0 }}</p>
          </div>
          <div class="p-2 bg-red-50 rounded-xl border border-red-200">
            <p class="text-[10px] text-red-800 font-bold">REJECT</p>
            <p class="text-base font-black text-red-900">{{ labelStats?.statusReject || 0 }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- RECENT DATA SECTION -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      <!-- 1. Recent Labels Table (Permitted if has 'label' access or Admin) -->
      <div v-if="can('label', 'view')" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-zinc-900">Label Produksi Terakhir</h3>
            <p class="text-xs text-zinc-500 font-medium">Data roll label terbaru yang tercatat di sistem</p>
          </div>
          <router-link to="/label" class="text-xs font-black text-red-600 hover:text-red-800">
            Lihat Semua →
          </router-link>
        </div>
        <div class="divide-y divide-zinc-100">
          <div 
            v-for="item in recentLabels" 
            :key="item.id"
            class="p-4 hover:bg-red-50/30 transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-zinc-900 font-mono">{{ item.lot }}</span>
                <span class="text-red-600 font-bold text-xs font-mono">{{ item.turunan }}</span>
                <span :class="[
                  'text-[9.5px] font-extrabold px-2 py-0.5 rounded-full border font-mono',
                  item.status === 'PASS' || item.status === 'OK' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  item.status === 'HOLD' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                ]">
                  {{ item.status }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 mt-0.5 font-medium">
                SPK: <span class="font-bold text-zinc-800">{{ item.spk }}</span> • Mesin: {{ item.mesin }} • {{ item.jenis }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-sm font-black text-zinc-900 font-mono">{{ item.netto || item.berat || '-' }} kg</span>
              <p class="text-[10.5px] text-zinc-400 font-medium">{{ item.tanggal }}</p>
            </div>
          </div>
          <div v-if="recentLabels.length === 0" class="p-6 text-center text-xs text-zinc-400 font-medium">
            Belum ada data label tersimpan.
          </div>
        </div>
      </div>

      <!-- 2. Recent Tasks (Permitted if has 'tasks' access or QC) -->
      <div v-if="can('tasks', 'view')" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-zinc-900">Tugas QC & Maintenance</h3>
            <p class="text-xs text-zinc-500 font-medium">Tugas maintenance dan verifikasi QR terkini</p>
          </div>
          <router-link to="/tasks" class="text-xs font-black text-red-600 hover:text-red-800">
            Kelola Tugas →
          </router-link>
        </div>
        <div class="divide-y divide-zinc-100">
          <div 
            v-for="task in recentTasks" 
            :key="task.id"
            class="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-zinc-900">{{ task.title }}</span>
                <span :class="[
                  'text-[9.5px] font-bold px-2 py-0.5 rounded-full border font-mono',
                  task.status === 'Completed' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                  task.status === 'In Progress' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-amber-100 text-amber-800 border-amber-300'
                ]">
                  {{ task.status }}
                </span>
              </div>
              <p class="text-xs text-zinc-500 mt-0.5 font-medium">
                PIC: <span class="font-bold text-zinc-700">{{ task.assignee }}</span> • Prioritas: {{ task.priority }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <span class="text-xs font-mono font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg">
                {{ task.taskCode }}
              </span>
            </div>
          </div>
          <div v-if="recentTasks.length === 0" class="p-6 text-center text-xs text-zinc-400 font-medium">
            Tidak ada tugas aktif saat ini.
          </div>
        </div>
      </div>

      <!-- 3. Recent Upload History for Admin DE / Super Admin -->
      <div v-if="(userRole === 'ADMIN_DE' || userRole === 'SUPER_ADMIN') && can('data_roll', 'view')" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-zinc-900">Riwayat Impor Batch Excel</h3>
            <p class="text-xs text-zinc-500 font-medium">Daftar unggahan berkas identitas roll terakhir</p>
          </div>
          <router-link to="/data-roll" class="text-xs font-black text-red-600 hover:text-red-800">
            Buka Data Roll →
          </router-link>
        </div>
        <div class="divide-y divide-zinc-100">
          <div
            v-for="batch in recentBatches"
            :key="batch.id"
            class="p-4 hover:bg-zinc-50 transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div class="font-bold text-sm text-zinc-900 font-mono">{{ batch.batchName || batch.fileName }}</div>
              <p class="text-xs text-zinc-500 mt-0.5">
                Oleh: <strong class="text-zinc-700">{{ batch.uploadedBy || 'Admin' }}</strong> • Mesin: {{ batch.machine || 'ALL' }}
              </p>
            </div>
            <div class="text-right shrink-0 font-mono">
              <span class="text-sm font-black text-purple-700">{{ batch.totalRolls }} Roll</span>
              <p class="text-[10.5px] text-zinc-400">{{ batch.uploadDate }}</p>
            </div>
          </div>
          <div v-if="recentBatches.length === 0" class="p-6 text-center text-xs text-zinc-400 font-medium">
            Belum ada berkas Excel yang diunggah.
          </div>
        </div>
      </div>

      <!-- 4. Discrepancy Items for Gudang / Logistik -->
      <div v-if="(userRole === 'GUDANG' || userRole === 'SUPER_ADMIN') && can('opname', 'view')" class="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div class="p-5 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 class="text-base font-black text-zinc-900">Perhatian Selisih Opname</h3>
            <p class="text-xs text-zinc-500 font-medium">Item fisik yang berbeda dari data sistem</p>
          </div>
          <router-link to="/opname" class="text-xs font-black text-red-600 hover:text-red-800">
            Periksa Opname →
          </router-link>
        </div>
        <div class="divide-y divide-zinc-100">
          <div
            v-for="item in discrepancyList"
            :key="item.id"
            class="p-4 hover:bg-red-50/20 transition-colors flex items-center justify-between gap-4"
          >
            <div>
              <div class="font-bold text-sm text-zinc-900">{{ item.itemName }}</div>
              <p class="text-xs text-zinc-500 font-mono mt-0.5">
                Kode: {{ item.itemCode }} • Lokasi: {{ item.location || 'Gudang' }}
              </p>
            </div>
            <div class="text-right shrink-0 font-mono">
              <span class="text-xs font-black px-2 py-0.5 rounded bg-red-100 text-red-700">
                Selisih: {{ item.difference > 0 ? '+' : '' }}{{ item.difference }} {{ item.unit }}
              </span>
              <p class="text-[10px] text-zinc-400 mt-0.5">Fisik: {{ item.physicalStock }} / Sys: {{ item.systemStock }}</p>
            </div>
          </div>
          <div v-if="discrepancyList.length === 0" class="p-6 text-center text-xs text-emerald-600 font-bold">
            ✓ Seluruh stok opname fisik sesuai dengan sistem.
          </div>
        </div>
      </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useLabelStore } from '@/stores/labelStore';
import { useTaskStore } from '@/stores/taskStore';
import { useOpnameStore } from '@/stores/opnameStore';
import { useDataRollStore } from '@/stores/dataRollStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { ROLE_PRESETS } from '@/services/authService';
import Chart from 'chart.js/auto';

const authStore = useAuthStore();
const labelStore = useLabelStore();
const taskStore = useTaskStore();
const opnameStore = useOpnameStore();
const dataRollStore = useDataRollStore();
const scheduleStore = useScheduleStore();

// Current User Role
const userRole = computed(() => authStore.currentUser?.role || 'OPERATOR');

const currentRoleInfo = computed(() => {
  return ROLE_PRESETS.find(p => p.role === userRole.value) || {
    title: 'Pengguna Kustom',
    badgeColor: 'bg-zinc-700 text-white',
    description: 'Hak akses dikonfigurasi mandiri untuk operasional sistem label.'
  };
});

const currentRoleTitle = computed(() => currentRoleInfo.value.title);
const currentRoleBadgeClass = computed(() => currentRoleInfo.value.badgeColor);

const currentRoleDescription = computed(() => {
  if (userRole.value === 'SUPER_ADMIN') {
    return 'Pusat Kontrol Eksekutif: Monitoring terpusat kinerja mesin, hasil produksi, status kendali mutu, dan manajemen pengguna.';
  } else if (userRole.value === 'OPERATOR') {
    return 'Lantai Produksi & Mesin: Pantau shift kerja Anda saat ini, cetak label baru berstandar barcode, dan gunakan kalkulator konversi roll.';
  } else if (userRole.value === 'ADMIN_DE') {
    return 'Pusat Input & Rekapitulasi: Kelola identitas roll, upload berkas Excel, verifikasi batch DE, dan sinkronisasi laporan produksi.';
  } else if (userRole.value === 'QC') {
    return 'Kendali Mutu & Verifikasi: Evaluasi kesesuaian fisik roll film, pengawasan status PASS/HOLD/REJECT, dan audit tugas inspeksi QR.';
  } else if (userRole.value === 'GUDANG') {
    return 'Manajemen Material & Pergudangan: Pantau ketersediaan SKU, fisik roll di gudang (IMS), dan status stok opname aktual.';
  }
  return currentRoleInfo.value.description;
});

// Permission check helper
const can = (menuKey, action = 'view') => {
  return authStore.hasPermission(menuKey, action);
};

// Shift Info
const currentShift = computed(() => scheduleStore.getCurrentShiftInfo());

// Stats & Items (Guaranteed 100% Null-Safe against asynchronous store loads)
const labelStats = computed(() => {
  return labelStore.statistics || {
    total: 0,
    statusPass: 0,
    statusHold: 0,
    statusReject: 0,
    slitting: 0,
    rewind: 0,
    sml: 0,
    totalKg: 0
  };
});
const recentLabels = computed(() => (labelStore.labels || []).slice(0, 5));
const recentTasks = computed(() => (taskStore.tasks || []).slice(0, 5));
const recentBatches = computed(() => (dataRollStore.uploadHistory || []).slice(0, 5));

const unverifiedRollsCount = computed(() => {
  return (dataRollStore.rolls || []).filter(r => !r.verified).length;
});

const discrepancyList = computed(() => {
  return (opnameStore.items || []).filter(i => i.difference !== 0).slice(0, 5);
});

// QC Pass Rate calculation
const qcPassRate = computed(() => {
  const total = (labelStats.value?.total || 0);
  if (total === 0) return 100;
  const pass = (labelStats.value?.statusPass || 0);
  return Math.round((pass / total) * 100);
});

const operatorPassPercent = computed(() => {
  const total = (labelStats.value?.total || 0);
  if (total === 0) return 100;
  return Math.round(((labelStats.value?.statusPass || 0) / total) * 100);
});

// Charts
const machineChartCanvas = ref(null);
const statusChartCanvas = ref(null);
let machineChartInstance = null;
let statusChartInstance = null;

const initCharts = () => {
  if (machineChartCanvas.value) {
    if (machineChartInstance) machineChartInstance.destroy();
    machineChartInstance = new Chart(machineChartCanvas.value, {
      type: 'bar',
      data: {
        labels: ['SLITTING', 'REWIND', 'SML'],
        datasets: [{
          label: 'Jumlah Roll Label',
          data: [
            labelStats.value?.slitting || 0,
            labelStats.value?.rewind || 0,
            labelStats.value?.sml || 0
          ],
          backgroundColor: ['#dc2626', '#991b1b', '#18181b'],
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { precision: 0 }
          }
        }
      }
    });
  }

  if (statusChartCanvas.value) {
    if (statusChartInstance) statusChartInstance.destroy();
    statusChartInstance = new Chart(statusChartCanvas.value, {
      type: 'doughnut',
      data: {
        labels: ['PASS', 'HOLD', 'REJECT'],
        datasets: [{
          data: [
            labelStats.value.statusPass || 1,
            labelStats.value.statusHold || 0,
            labelStats.value.statusReject || 0
          ],
          backgroundColor: ['#16a34a', '#facc15', '#dc2626'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        cutout: '70%'
      }
    });
  }
};

watch(() => labelStats.value, () => {
  initCharts();
}, { deep: true });

onMounted(async () => {
  await Promise.all([
    labelStore.loadLabels(),
    taskStore.loadTasks(),
    opnameStore.loadOpname(),
    dataRollStore.loadRolls(),
    dataRollStore.loadUploadHistory(),
    scheduleStore.loadConfirmedRoster()
  ]);
  initCharts();
});
</script>
