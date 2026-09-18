<template>
  <header class="h-14 sm:h-16 bg-white border-b border-zinc-200/90 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
    <!-- Left Section: Mobile Menu Trigger & Page Title -->
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
      <button 
        @click="$emit('toggle-mobile-sidebar')" 
        class="md:hidden p-1.5 rounded-lg text-zinc-700 hover:bg-zinc-100 focus:outline-none shrink-0"
        aria-label="Open Sidebar"
      >
        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div class="min-w-0">
        <div class="hidden sm:flex items-center gap-2 leading-none mb-0.5">
          <span class="text-[10px] sm:text-xs font-black text-red-600 uppercase tracking-wider">
            PT. SAPTAWARNA CEMERLANG
          </span>
          <span class="text-zinc-300">•</span>
          <span class="text-[11px] font-semibold text-zinc-500">{{ currentRouteName }}</span>
        </div>
        <h2 class="text-sm sm:text-lg font-black text-zinc-900 leading-tight truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
          {{ pageTitle }}
        </h2>
      </div>
    </div>

    <!-- Right Section: Quick Status & Info -->
    <div class="flex items-center gap-1.5 sm:gap-3 shrink-0">
      <!-- Live Shift Badge (Click to open Handover Modal) -->
      <button
        @click="scheduleStore.showShiftHandoverModal = true"
        class="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
        title="Klik untuk melihat atau mengatur pergantian shift operator"
      >
        <span class="relative flex h-2 w-2 shrink-0">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div class="text-left leading-tight hidden sm:block">
          <p class="text-[9.5px] font-bold text-zinc-500 uppercase tracking-tight">Shift Aktif</p>
          <p class="text-xs font-black text-zinc-800">
            {{ currentShift.definition.shortName }} (Grup {{ currentShift.group }})
          </p>
        </div>
        <span class="sm:hidden text-[11px] font-black px-1.5 py-0.2 rounded bg-blue-50 text-blue-800 border border-blue-200/60">
          {{ currentShift.definition.shortName }}
        </span>
      </button>

      <!-- Cloud Supabase Sync Status Indicator -->
      <button
        @click="handleManualSync"
        :disabled="syncState.isSyncing"
        class="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs select-none"
        :class="[
          syncState.isSyncing ? 'bg-blue-50 border-blue-300 text-blue-800' :
          (!syncState.isOnline ? 'bg-amber-50 border-amber-300 text-amber-800' :
          'bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-300 border-zinc-200 text-zinc-700')
        ]"
        :title="syncState.isSyncing ? 'Sedang menyinkronkan data...' : (syncState.isOnline ? 'Terhubung ke Supabase Cloud (Klik untuk sinkronisasi cepat, Shift+Klik untuk sinkronisasi penuh)' : 'Mode Offline (Data tersimpan di lokal)')"
      >
        <span class="relative flex h-2 w-2 shrink-0">
          <span v-if="syncState.isSyncing" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span v-else-if="syncState.isOnline" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span
            class="relative inline-flex rounded-full h-2 w-2"
            :class="syncState.isSyncing ? 'bg-blue-500' : (syncState.isOnline ? 'bg-emerald-500' : 'bg-amber-500')"
          ></span>
        </span>
        <div class="text-left leading-tight hidden md:block">
          <p class="text-[9.5px] font-bold uppercase tracking-tight text-zinc-400">
            {{ syncState.isSyncing ? 'Sinkronisasi...' : (syncState.isOnline ? 'Cloud Supabase' : 'Offline Mode') }}
          </p>
          <p class="text-xs font-black" :class="syncState.isSyncing ? 'text-blue-700' : (syncState.isOnline ? 'text-zinc-800' : 'text-amber-700')">
            {{ syncState.isSyncing ? 'Mengunggah...' : (syncState.isOnline ? 'Tersinkron' : 'Lokal Aktif') }}
            <span v-if="syncState.unsyncedCount > 0" class="text-amber-600 font-normal">({{ syncState.unsyncedCount }})</span>
          </p>
        </div>
        <span class="md:hidden text-[11px] font-bold flex items-center gap-1">
          <span v-if="syncState.isSyncing">🔄</span>
          <span v-else>☁️</span>
          <span v-if="syncState.unsyncedCount > 0" class="text-[10px] text-amber-600 font-extrabold">{{ syncState.unsyncedCount }}</span>
        </span>
      </button>

      <!-- User Profile & Logout -->
      <div class="flex items-center gap-1.5 sm:gap-2 pl-1 sm:pl-2 border-l border-zinc-200 relative">
        <button
          type="button"
          @click="authStore.showProfileModal = true"
          class="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-zinc-50 hover:bg-zinc-100 hover:border-zinc-300 border border-zinc-200 transition-all cursor-pointer text-left shadow-2xs group"
          title="Klik untuk melihat Profil, Atur PIN & Ganti Kata Sandi"
        >
          <div
            :class="[
              'w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center text-[10px] sm:text-xs font-black uppercase text-white shadow-2xs transition-transform group-hover:scale-105',
              authStore.isSuperAdmin ? 'bg-red-600' : (authStore.isAdmin ? 'bg-purple-700' : 'bg-zinc-800')
            ]"
          >
            {{ (authStore.currentUser?.name || 'User').charAt(0) }}
          </div>

          <div class="hidden sm:block text-left">
            <div class="flex items-center gap-1.5 leading-tight">
              <p class="text-xs font-black text-zinc-900 truncate max-w-[130px] group-hover:text-red-600 transition-colors">
                {{ authStore.currentUser?.name || 'Pengguna' }}
              </p>
              <span
                :class="[
                  'text-[9.5px] font-black font-mono px-1.5 py-0.2 rounded',
                  authStore.isSuperAdmin
                    ? 'bg-red-100 text-red-700'
                    : (authStore.isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-zinc-200 text-zinc-700')
                ]"
              >
                {{ authStore.currentUser?.role === 'SUPER_ADMIN' ? 'SUPER' : (authStore.currentUser?.role || 'USER') }}
              </span>
            </div>
            <p class="text-[10px] text-zinc-400 font-mono leading-tight truncate max-w-[150px]">
              {{ authStore.currentUser?.email || '@' + (authStore.currentUser?.username || '') }}
            </p>
          </div>
        </button>

        <!-- Quick Lock Button (Visible if PIN enabled) -->
        <button
          v-if="authStore.currentUser?.pinEnabled"
          type="button"
          @click="authStore.lockScreen()"
          class="p-1.5 sm:p-2 rounded-xl bg-zinc-50 hover:bg-amber-50 hover:border-amber-300 border border-zinc-200 text-zinc-500 hover:text-amber-700 transition-all cursor-pointer shadow-2xs"
          title="Kunci Layar Sekarang (PIN 4-Digit)"
        >
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </button>

        <!-- Logout Action Button -->
        <button
          @click="handleLogout"
          class="p-1.5 sm:p-2 rounded-xl bg-zinc-50 hover:bg-red-50 hover:border-red-200 border border-zinc-200 text-zinc-500 hover:text-red-600 transition-all cursor-pointer shadow-2xs"
          title="Keluar dari Sistem (Logout)"
        >
          <svg class="w-3.5 h-3.5 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Global Shift Handover Modal Teleport -->
  <ShiftHandoverModal />

  <!-- Global Cloud Sync Control Modal -->
  <div v-if="showSyncModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-fade-in">
    <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
      <div class="px-5 py-3.5 bg-zinc-950 text-white flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-lg">☁️</span>
          <div>
            <h3 class="font-black text-sm text-white">Pusat Sinkronisasi Cloud</h3>
            <p class="text-[10px] text-zinc-400">Sinkronisasi Multi-Device (Kantor ⇄ Rumah)</p>
          </div>
        </div>
        <button @click="showSyncModal = false" class="text-zinc-400 hover:text-white cursor-pointer font-bold">✕</button>
      </div>

      <div class="p-4 sm:p-5 space-y-4 text-xs">
        <!-- Status Cards -->
        <div class="grid grid-cols-2 gap-2.5">
          <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Koneksi Cloud</span>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="w-2 h-2 rounded-full" :class="syncState.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'"></span>
              <span class="font-black text-zinc-800">{{ syncState.isOnline ? 'Terhubung (Online)' : 'Terputus (Offline)' }}</span>
            </div>
          </div>

          <div class="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <span class="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Sync Terakhir</span>
            <span class="font-mono font-bold text-zinc-800 block mt-1">
              {{ syncState.lastSyncTime || 'Belum tersinkron' }}
            </span>
          </div>
        </div>

        <div v-if="syncState.unsyncedCount > 0" class="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] flex items-center gap-2">
          <span>⚠️</span>
          <span>Terdapat <strong>{{ syncState.unsyncedCount }}</strong> data lokal yang belum diunggah ke cloud.</span>
        </div>

        <!-- Sync Action Options -->
        <div class="space-y-2.5 pt-1">
          <p class="font-black text-[11px] text-zinc-500 uppercase tracking-wider">Pilihan Metode Sinkronisasi:</p>

          <!-- Option 1: Full Sync (Disarankan) -->
          <button
            type="button"
            @click="triggerFullSync"
            :disabled="syncState.isSyncing"
            class="w-full text-left p-3 rounded-xl border border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100/70 transition-all cursor-pointer disabled:opacity-50 group"
          >
            <div class="flex items-center justify-between">
              <div class="font-black text-emerald-950 flex items-center gap-1.5">
                <span>🔄</span>
                <span>Tarik Ulang Penuh dari Cloud (Force Full Sync)</span>
              </div>
              <span class="text-[9.5px] font-black uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-2xs">Rekomendasi</span>
            </div>
            <p class="text-[11px] text-emerald-800 mt-1 leading-relaxed">
              Mengosongkan cache lama dan mengunduh 100% data segar dari Cloud Supabase. <strong>Gunakan ini jika di PC kantor baru saja melakukan reset/import ulang data.</strong>
            </p>
          </button>

          <!-- Option 2: Delta Sync (Cepat) -->
          <button
            type="button"
            @click="triggerDeltaSync"
            :disabled="syncState.isSyncing"
            class="w-full text-left p-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 transition-all cursor-pointer disabled:opacity-50 group"
          >
            <div class="font-black text-zinc-900 flex items-center gap-1.5">
              <span>⚡</span>
              <span>Sinkronisasi Cepat (Delta Sync)</span>
            </div>
            <p class="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
              Hanya menarik data yang baru ditambahkan atau diubah sejak sinkronisasi terakhir (hemat kuota).
            </p>
          </button>
        </div>

        <div v-if="syncState.isSyncing" class="p-3 bg-blue-50 border border-blue-200 rounded-xl text-center space-y-1 animate-fade-in">
          <div class="inline-block w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p class="text-[11px] font-bold text-blue-900">Sedang menyinkronkan data dengan Supabase Cloud...</p>
        </div>

        <div v-else-if="syncMessage" class="p-2.5 bg-zinc-900 text-white rounded-xl text-center text-xs font-bold animate-fade-in">
          {{ syncMessage }}
        </div>
      </div>

      <div class="px-5 py-3 border-t border-zinc-200 bg-zinc-50 flex items-center justify-end">
        <button
          @click="showSyncModal = false"
          class="px-4 py-1.5 text-xs font-bold text-zinc-600 hover:bg-zinc-200 rounded-xl cursor-pointer transition-colors"
        >
          Tutup
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { useConfigStore } from '@/stores/configStore';
import { syncState, syncAll, forceFullSync, countUnsynced, startRealtimeSync } from '@/services/syncService';
import ShiftHandoverModal from '@/components/schedule/ShiftHandoverModal.vue';

defineEmits(['toggle-mobile-sidebar']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const scheduleStore = useScheduleStore();
const configStore = useConfigStore();

const showSyncModal = ref(false);
const syncMessage = ref('');

const handleLogout = async () => {
  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
    await authStore.logout();
  }
};

const handleManualSync = async (event) => {
  if (event && (event.shiftKey || event.altKey)) {
    await triggerFullSync();
  } else {
    showSyncModal.value = true;
  }
};

const triggerFullSync = async () => {
  syncMessage.value = '';
  try {
    await forceFullSync();
    await configStore.loadAll();
    syncMessage.value = '✅ Sinkronisasi Penuh Berhasil! Data lokal telah diperbarui 100% dari Cloud.';
    setTimeout(() => { syncMessage.value = ''; }, 4000);
  } catch (err) {
    syncMessage.value = '❌ Gagal sinkronisasi: ' + (err.message || err);
  }
};

const triggerDeltaSync = async () => {
  syncMessage.value = '';
  try {
    await syncAll(false);
    await configStore.loadAll();
    syncMessage.value = '✅ Sinkronisasi Cepat Selesai.';
    setTimeout(() => { syncMessage.value = ''; }, 3000);
  } catch (err) {
    syncMessage.value = '❌ Gagal sinkronisasi: ' + (err.message || err);
  }
};

const currentShift = computed(() => scheduleStore.currentShift);

let shiftCheckTimer = null;
let lastKnownShiftCode = null;

const checkShiftTransition = () => {
  const shift = scheduleStore.currentShift;
  if (lastKnownShiftCode && lastKnownShiftCode !== shift.shiftCode) {
    // New shift has started -> trigger handover popup!
    scheduleStore.showShiftHandoverModal = true;
  }
  lastKnownShiftCode = shift.shiftCode;
};

onMounted(async () => {
  await scheduleStore.loadConfirmedRoster();
  lastKnownShiftCode = scheduleStore.getCurrentShiftInfo().shiftCode;
  // Check every 60 seconds
  shiftCheckTimer = setInterval(checkShiftTransition, 60000);

  // Initialize Supabase Sync & Realtime
  countUnsynced();
  startRealtimeSync();
  syncAll().then(async () => {
    await configStore.loadAll();
  }).catch(err => console.warn('Auto sync on load:', err));
});

onUnmounted(() => {
  if (shiftCheckTimer) clearInterval(shiftCheckTimer);
});

const pageTitle = computed(() => {
  return route.meta.title || 'Sistem Produksi';
});

const currentRouteName = computed(() => {
  if (route.path === '/') return 'Dashboard';
  if (route.path.startsWith('/data-roll')) return 'Data Roll';
  if (route.path.startsWith('/schedule')) return 'Operator Schedule';
  if (route.path.startsWith('/label')) return 'Manajemen Label';
  if (route.path.startsWith('/de-report')) return 'DE Report';
  if (route.path.startsWith('/inventory')) return 'Inventory (IMS)';
  if (route.path.startsWith('/wip')) return 'WIP Management';
  if (route.path.startsWith('/tasks')) return 'Tugas & QR';
  if (route.path.startsWith('/opname')) return 'Stok Opname';
  if (route.path.startsWith('/data-config')) return 'Data Config';
  return 'Aplikasi';
});
</script>
