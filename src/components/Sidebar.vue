<template>
  <aside 
    :class="[
      'bg-zinc-950 text-zinc-100 flex flex-col transition-all duration-300 z-50 shadow-2xl fixed md:sticky md:top-0 h-screen inset-y-0 left-0 border-r border-zinc-800/80 shrink-0 select-none',
      isMobile ? 'translate-x-0 w-64' : (isOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0 md:w-20')
    ]"
  >
    <!-- Brand Header (Official SWC Logo Styling) -->
    <div :class="['h-20 flex items-center border-b border-zinc-800/80 bg-black/60 transition-all', isOpen || isMobile ? 'justify-between px-4' : 'justify-center px-2']">
      
      <!-- Open State: Full SWC Logo Badge -->
      <div v-if="isOpen || isMobile" class="flex items-center gap-3 overflow-hidden">
        <!-- Logo Card (White Badge with Red SWC & Black Tagline) -->
        <div class="bg-white px-2.5 py-1 rounded-xl shadow-md flex flex-col items-center justify-center shrink-0 border border-zinc-200">
          <span class="font-black text-red-600 text-lg leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
            SWC
          </span>
          <span class="text-[6.5px] font-bold text-black leading-tight tracking-tight uppercase whitespace-nowrap mt-0.5">
            Rotogravure
          </span>
        </div>

        <div class="transition-opacity duration-200 overflow-hidden">
          <h1 class="font-black text-xs tracking-wider text-white uppercase truncate leading-tight">
            SAPTAWARNA
          </h1>
          <p class="text-[9px] text-zinc-400 font-semibold tracking-tight truncate">
            Flexible Packaging
          </p>
        </div>
      </div>

      <!-- Closed / Collapsed State: Perfectly Centered SWC Badge -->
      <div v-else class="flex items-center justify-center">
        <div class="w-11 h-11 bg-white rounded-xl shadow-md flex flex-col items-center justify-center border border-zinc-200 hover:scale-105 transition-transform" title="PT. Saptawarna Cemerlang (SWC)">
          <span class="font-black text-red-600 text-base leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
            SWC
          </span>
          <span class="text-[5.5px] font-black text-black leading-none tracking-tighter uppercase mt-0.5">
            PACKAGING
          </span>
        </div>
      </div>

      <!-- Mobile Close Button -->
      <button
        v-if="isMobile"
        @click="$emit('close-mobile')"
        class="md:hidden p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
        title="Tutup Menu"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Toggle Button (Visible when open on desktop) -->
      <button 
        v-else-if="isOpen"
        @click="$emit('toggle')" 
        class="hidden md:flex p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        title="Tutup Sidebar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Collapsed Expand Button Header Bar -->
    <div v-if="!isOpen && !isMobile" class="py-2 flex justify-center border-b border-zinc-900 bg-zinc-950">
      <button
        @click="$emit('toggle')"
        class="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Buka Sidebar"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Navigation Menu (Clean Professional Categorization) -->
    <div class="flex-1 py-3 px-2.5 space-y-3.5 overflow-y-auto custom-scrollbar">
      <div v-for="(cat, cIdx) in visibleNavCategories" :key="cIdx" class="space-y-1">
        <!-- Category Header (When Expanded or Mobile) -->
        <div v-show="isOpen || isMobile" class="px-2.5 pt-2 pb-1 text-[9.5px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
          <span>{{ cat.category }}</span>
          <span class="w-1.5 h-1.5 rounded-full bg-zinc-700"></span>
        </div>
        <div v-show="!isOpen && !isMobile" class="my-1.5 border-t border-zinc-800/80"></div>

        <!-- Links in Category -->
        <router-link
          v-for="item in cat.items"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all duration-200 group relative',
            !isOpen && !isMobile ? 'justify-center px-2' : '',
            isActive(item.path)
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
              : 'text-zinc-300 hover:bg-zinc-900/90 hover:text-white'
          ]"
          :title="!isOpen && !isMobile ? item.name : ''"
          @click="closeMobileNav"
        >
          <!-- Active Left Pill Indicator -->
          <span 
            v-if="isActive(item.path) && (isOpen || isMobile)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r bg-white"
          ></span>

          <!-- Icon with Smooth Minimalist Micro-Animation -->
          <span 
            class="shrink-0 flex items-center justify-center transition-all duration-300 group-hover:scale-115 group-hover:rotate-3 group-hover:text-red-400"
            :class="isActive(item.path) ? 'text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : 'text-zinc-400'"
            v-html="item.icon"
          ></span>

          <!-- Label (Simple, Clean, Professional) -->
          <span v-show="isOpen || isMobile" class="truncate tracking-tight font-medium" :class="isActive(item.path) ? 'font-bold' : ''">
            {{ item.name }}
          </span>

          <!-- Active Dot Indicator (Collapsed mode) -->
          <span 
            v-if="!isOpen && !isMobile && isActive(item.path)"
            class="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-zinc-950"
          ></span>

          <!-- Badge if any -->
          <span 
            v-if="item.badge && (isOpen || isMobile)"
            :class="[
              'ml-auto text-[9px] px-1.5 py-0.2 rounded-md font-extrabold border uppercase font-mono tracking-tight transition-colors',
              isActive(item.path) 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-zinc-800 text-zinc-400 border-zinc-700 group-hover:border-red-500/40 group-hover:text-red-300'
            ]"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Storage & Sync Status Card -->
    <div class="p-2.5 border-t border-zinc-800 bg-black/40">
      <div :class="['p-2 rounded-xl bg-zinc-900/80 border border-zinc-800', !isOpen && !isMobile ? 'text-center' : '']">
        <div :class="['flex items-center gap-1.5', !isOpen && !isMobile ? 'justify-center' : 'mb-0.5']">
          <span class="relative flex h-2 w-2 shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span v-show="isOpen || isMobile" class="text-[11px] font-black text-zinc-200">IndexedDB Aktif</span>
        </div>
        <p v-show="isOpen || isMobile" class="text-[9.5px] text-zinc-400 leading-tight">
          Client-Side Offline Ready
        </p>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  isMobile: { type: Boolean, default: false }
});

const emit = defineEmits(['toggle', 'close-mobile']);

const route = useRoute();

const isActive = (path) => {
  if (path === '/') return route.path === '/';
  return route.path.startsWith(path);
};

const closeMobileNav = () => {
  if (props.isMobile) {
    emit('close-mobile');
  }
};

const authStore = useAuthStore();

// Navigation Categories: Clean, simple, and professional
const navCategories = [
  {
    category: 'PRODUKSI & ALUR KERJA',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        menuKey: 'dashboard',
        badge: 'Live',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="8" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="11" width="7" height="10" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/></svg>`
      },
      {
        name: 'Jadwal Operator',
        path: '/schedule',
        menuKey: 'schedule',
        badge: 'Shift',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="2"/></svg>`
      },
      {
        name: 'Rencana SPK',
        path: '/spk',
        menuKey: 'spk',
        badge: 'Jadwal',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`
      },
      {
        name: 'Label Produksi',
        path: '/label',
        menuKey: 'label',
        badge: 'Label FG',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><circle cx="7" cy="7" r="1.5" fill="currentColor"/></svg>`
      },
      {
        name: 'Data Roll FG',
        path: '/data-roll',
        menuKey: 'data_roll',
        badge: 'Roll',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
      },
      {
        name: 'Laporan Harian',
        path: '/de-report',
        menuKey: 'de_report',
        badge: 'Rekap',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M8 17v-3"/><path d="M12 17v-6"/><path d="M16 17v-1"/></svg>`
      }
    ]
  },
  {
    category: 'INVENTARIS & QC',
    items: [
      {
        name: 'Stok Gudang',
        path: '/inventory',
        menuKey: 'inventory',
        badge: 'IMS',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`
      },
      {
        name: 'Stok Opname',
        path: '/opname',
        menuKey: 'opname',
        badge: 'Audit',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>`
      },
      {
        name: 'Inspeksi & Tugas',
        path: '/tasks',
        menuKey: 'tasks',
        badge: 'QC',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>`
      }
    ]
  },
  {
    category: 'ALAT & OTOMASI',
    items: [
      {
        name: 'Pindai AI',
        path: '/scan-report',
        menuKey: 'scan_report',
        badge: 'AI Scan',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 012-2h2"/><path d="M17 3h2a2 2 0 012 2v2"/><path d="M21 17v2a2 2 0 01-2 2h-2"/><path d="M7 21H5a2 2 0 01-2-2v-2"/><polyline points="7 12 12 12 17 12"/><path d="M12 8v8"/></svg>`
      },
      {
        name: 'Kalkulator Konversi',
        path: '/tools',
        menuKey: 'tools',
        badge: 'Tools',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="8" y1="6" x2="16" y2="6"/><line x1="8" y1="10" x2="8.01" y2="10"/><line x1="12" y1="10" x2="12.01" y2="10"/><line x1="16" y1="10" x2="16.01" y2="10"/><line x1="8" y1="14" x2="8.01" y2="14"/><line x1="12" y1="14" x2="12.01" y2="14"/><line x1="16" y1="14" x2="16.01" y2="14"/><line x1="8" y1="18" x2="8.01" y2="18"/><line x1="12" y1="18" x2="16" y2="18"/></svg>`
      }
    ]
  },
  {
    category: 'SISTEM & PENGATURAN',
    items: [
      {
        name: 'Konfigurasi Data',
        path: '/data-config',
        menuKey: 'data_config',
        badge: 'Master',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 12v7c0 1.66 4 3 9 3s9-1.34 9-3v-7"/><path d="M3 5v7"/></svg>`
      },
      {
        name: 'Manajemen Pengguna',
        path: '/users',
        menuKey: 'users',
        badge: 'Akses',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
      },
      {
        name: 'Pengaturan Sistem',
        path: '/settings',
        menuKey: 'settings',
        badge: 'Setup',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`
      }
    ]
  }
];

// Visible Nav Categories filtered by user permissions
const visibleNavCategories = computed(() => {
  return navCategories
    .map(cat => {
      const allowedItems = cat.items.filter(item => {
        if (!item.menuKey) return true;
        return authStore.hasPermission(item.menuKey, 'view');
      });
      return {
        ...cat,
        items: allowedItems
      };
    })
    .filter(cat => cat.items.length > 0);
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #3f3f46;
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #71717a;
}
</style>
