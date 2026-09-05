<template>
  <header class="h-16 bg-white border-b border-zinc-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
    <!-- Left Section: Mobile Menu Trigger & Page Title -->
    <div class="flex items-center gap-3">
      <button 
        @click="$emit('toggle-mobile-sidebar')" 
        class="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 focus:outline-none"
        aria-label="Open Sidebar"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div>
        <div class="flex items-center gap-2">
          <span class="text-xs font-black text-red-600 uppercase tracking-wider hidden sm:inline-block">
            PT. SAPTAWARNA CEMERLANG
          </span>
          <span class="text-zinc-300 hidden sm:inline-block">•</span>
          <span class="text-xs font-semibold text-zinc-500">{{ currentRouteName }}</span>
        </div>
        <h2 class="text-lg font-black text-zinc-900 leading-tight">
          {{ pageTitle }}
        </h2>
      </div>
    </div>

    <!-- Right Section: Quick Status & Info -->
    <div class="flex items-center gap-2 sm:gap-3">
      <!-- Live Shift Badge (Click to open Handover Modal) -->
      <button
        @click="scheduleStore.showShiftHandoverModal = true"
        class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-blue-50/60 hover:border-blue-300 transition-all cursor-pointer shadow-2xs"
        title="Klik untuk melihat atau mengatur pergantian shift operator"
      >
        <span class="relative flex h-2 w-2">
          <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div class="text-left leading-tight hidden xs:block">
          <p class="text-[9.5px] font-bold text-zinc-500 uppercase tracking-tight">Shift Aktif</p>
          <p class="text-xs font-black text-zinc-800">
            {{ currentShift.definition.shortName }} (Grup {{ currentShift.group }})
          </p>
        </div>
        <span class="xs:hidden text-xs font-black px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
          {{ currentShift.definition.shortName }}
        </span>
      </button>

      <!-- Cloud Supabase Sync Status Indicator -->
      <button
        @click="handleManualSync"
        :disabled="syncState.isSyncing"
        class="flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs select-none"
        :class="[
          syncState.isSyncing ? 'bg-blue-50 border-blue-300 text-blue-800' :
          (!syncState.isOnline ? 'bg-amber-50 border-amber-300 text-amber-800' :
          'bg-zinc-50 hover:bg-emerald-50 hover:border-emerald-300 border-zinc-200 text-zinc-700')
        ]"
        :title="syncState.isSyncing ? 'Sedang menyinkronkan data...' : (syncState.isOnline ? 'Terhubung ke Supabase Cloud (Klik untuk sinkronkan sekarang)' : 'Mode Offline (Data tersimpan di lokal)')"
      >
        <span class="relative flex h-2 w-2">
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
        <span class="md:hidden text-xs">☁️</span>
      </button>

      <!-- User Profile & Logout -->
      <div class="flex items-center gap-2 pl-2 border-l border-zinc-200 relative">
        <div class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200">
          <div
            :class="[
              'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black uppercase text-white shadow-2xs',
              authStore.isSuperAdmin ? 'bg-red-600' : (authStore.isAdmin ? 'bg-purple-700' : 'bg-zinc-800')
            ]"
          >
            {{ (authStore.currentUser?.name || 'User').charAt(0) }}
          </div>

          <div class="hidden sm:block text-left">
            <div class="flex items-center gap-1.5 leading-tight">
              <p class="text-xs font-black text-zinc-900 truncate max-w-[130px]">
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
        </div>

        <!-- Logout Action Button -->
        <button
          @click="handleLogout"
          class="p-2 rounded-xl bg-zinc-50 hover:bg-red-50 hover:border-red-200 border border-zinc-200 text-zinc-500 hover:text-red-600 transition-all cursor-pointer shadow-2xs"
          title="Keluar dari Sistem (Logout)"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>
      </div>
    </div>
  </header>

  <!-- Global Shift Handover Modal Teleport -->
  <ShiftHandoverModal />
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { useScheduleStore } from '@/stores/scheduleStore';
import { syncState, syncAll, countUnsynced, startRealtimeSync } from '@/services/syncService';
import ShiftHandoverModal from '@/components/schedule/ShiftHandoverModal.vue';

defineEmits(['toggle-mobile-sidebar']);

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const scheduleStore = useScheduleStore();

const handleLogout = () => {
  if (confirm('Apakah Anda yakin ingin keluar dari sistem?')) {
    authStore.logout();
    router.push('/login');
  }
};

const handleManualSync = async () => {
  await syncAll();
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
  syncAll().catch(err => console.warn('Auto sync on load:', err));
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
