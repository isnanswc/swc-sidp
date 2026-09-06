<template>
  <aside 
    :class="[
      'bg-zinc-950 text-zinc-100 flex flex-col transition-all duration-300 z-50 shadow-2xl fixed md:sticky md:top-0 h-screen inset-y-0 left-0 border-r border-zinc-800/80 shrink-0 select-none',
      isMobile ? 'translate-x-0 w-60' : (isOpen ? 'translate-x-0 w-60' : '-translate-x-full md:translate-x-0 md:w-16')
    ]"
  >
    <!-- Brand Header (Official SWC Logo Styling - Compact & Aesthetic) -->
    <div :class="['h-14 flex items-center border-b border-zinc-800/80 bg-black/60 transition-all shrink-0', isOpen || isMobile ? 'justify-between px-3.5' : 'justify-center px-1.5']">
      
      <!-- Open State: Full SWC Logo Badge -->
      <div v-if="isOpen || isMobile" class="flex items-center gap-2.5 overflow-hidden">
        <!-- Logo Card (White Badge with Red SWC & Black Tagline) -->
        <div class="bg-white px-2 py-0.5 rounded-lg shadow-sm flex flex-col items-center justify-center shrink-0 border border-zinc-200">
          <span class="font-black text-red-600 text-sm leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
            SWC
          </span>
          <span class="text-[5.5px] font-bold text-black leading-tight tracking-tight uppercase whitespace-nowrap mt-0.5">
            Packaging
          </span>
        </div>

        <div class="transition-opacity duration-200 overflow-hidden">
          <h1 class="font-black text-[11px] tracking-wider text-white uppercase truncate leading-tight">
            SAPTAWARNA
          </h1>
          <p class="text-[8.5px] text-zinc-400 font-medium tracking-tight truncate">
            M-Label Inhouse
          </p>
        </div>
      </div>

      <!-- Closed / Collapsed State: Perfectly Centered SWC Badge -->
      <div v-else class="flex items-center justify-center">
        <div class="w-9 h-9 bg-white rounded-lg shadow-sm flex flex-col items-center justify-center border border-zinc-200 hover:scale-105 transition-transform" title="PT. Saptawarna Cemerlang (SWC)">
          <span class="font-black text-red-600 text-xs leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
            SWC
          </span>
          <span class="text-[5px] font-black text-black leading-none tracking-tighter uppercase mt-0.5">
            FILM
          </span>
        </div>
      </div>

      <!-- Mobile Close Button -->
      <button
        v-if="isMobile"
        @click="$emit('close-mobile')"
        class="md:hidden p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition-colors"
        title="Tutup Menu"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <!-- Toggle Button (Visible when open on desktop) -->
      <button 
        v-else-if="isOpen"
        @click="$emit('toggle')" 
        class="hidden md:flex p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
        title="Tutup Sidebar"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
        </svg>
      </button>
    </div>

    <!-- Collapsed Expand Button Header Bar -->
    <div v-if="!isOpen && !isMobile" class="py-1.5 flex justify-center border-b border-zinc-900 bg-zinc-950 shrink-0">
      <button
        @click="$emit('toggle')"
        class="p-1 rounded-md text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
        title="Buka Sidebar"
      >
        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Navigation Menu (Compact & Dense Professional Layout) -->
    <div class="flex-1 py-2 px-2 space-y-2 overflow-y-auto custom-scrollbar">
      <div v-for="(cat, cIdx) in visibleNavCategories" :key="cIdx" class="space-y-0.5">
        <!-- Category Header (When Expanded or Mobile) -->
        <div v-show="isOpen || isMobile" class="px-2 pt-1 pb-0.5 text-[8.5px] font-black text-zinc-500 uppercase tracking-widest flex items-center justify-between">
          <span>{{ cat.category }}</span>
          <span class="w-1 h-1 rounded-full bg-zinc-700"></span>
        </div>
        <div v-show="!isOpen && !isMobile" class="my-1 border-t border-zinc-800/80"></div>

        <!-- Links in Category -->
        <router-link
          v-for="item in cat.items"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-[11.5px] font-medium transition-all duration-150 group relative',
            !isOpen && !isMobile ? 'justify-center px-1.5' : '',
            isActive(item.path)
              ? 'bg-red-600 text-white shadow-md shadow-red-600/25 font-bold'
              : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
          ]"
          :title="!isOpen && !isMobile ? item.name : ''"
          @click="closeMobileNav"
        >
          <!-- Active Left Pill Indicator -->
          <span 
            v-if="isActive(item.path) && (isOpen || isMobile)"
            class="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-r bg-white"
          ></span>

          <!-- Icon with Smooth Micro-Animation -->
          <span 
            class="shrink-0 flex items-center justify-center transition-all duration-200 group-hover:scale-110 group-hover:text-red-400"
            :class="isActive(item.path) ? 'text-white' : 'text-zinc-400'"
            v-html="item.icon"
          ></span>

          <!-- Label (Simple, Clean, Compact) -->
          <span v-show="isOpen || isMobile" class="truncate tracking-tight" :class="isActive(item.path) ? 'font-bold text-white' : ''">
            {{ item.name }}
          </span>

          <!-- Active Dot Indicator (Collapsed mode) -->
          <span 
            v-if="!isOpen && !isMobile && isActive(item.path)"
            class="absolute right-1 top-1 w-1.5 h-1.5 rounded-full bg-red-400 ring-1 ring-zinc-950"
          ></span>

          <!-- Badge if any -->
          <span 
            v-if="item.badge && (isOpen || isMobile)"
            :class="[
              'ml-auto text-[8px] px-1.5 py-0.2 rounded font-black border uppercase font-mono tracking-tight shrink-0',
              isActive(item.path) 
                ? 'bg-white/25 text-white border-white/30' 
                : 'bg-zinc-900 text-zinc-400 border-zinc-700/80 group-hover:border-red-500/40 group-hover:text-red-300'
            ]"
          >
            {{ item.badge }}
          </span>
        </router-link>
      </div>
    </div>

    <!-- Storage & Sync Status Compact Bar -->
    <div class="p-2 border-t border-zinc-900 bg-black/50 shrink-0">
      <div :class="['px-2 py-1 rounded-lg bg-zinc-900/80 border border-zinc-800/80 flex items-center', !isOpen && !isMobile ? 'justify-center' : 'justify-between']">
        <div class="flex items-center gap-1.5">
          <span class="relative flex h-1.5 w-1.5 shrink-0">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <span v-show="isOpen || isMobile" class="text-[10px] font-bold text-zinc-300">IndexedDB</span>
        </div>
        <span v-show="isOpen || isMobile" class="text-[8.5px] font-mono text-zinc-500 uppercase">Offline Ready</span>
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

// Navigation Categories: Clean, simple, and professional with DISTINCT icons
const navCategories = [
  {
    category: 'PRODUKSI & ALUR KERJA',
    items: [
      {
        name: 'Dashboard',
        path: '/',
        menuKey: 'dashboard',
        badge: 'Live',
        // Speedometer Gauge with needle (Monitoring/Dashboard)
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 118-8 8 8 0 01-8 8z"/><path d="M12 7v5l3 3"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>`
      },
      {
        name: 'Jadwal Operator',
        path: '/schedule',
        menuKey: 'schedule',
        badge: 'Shift',
        // Shift Schedule Timeline & Clock Calendar
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><path d="M8 14h3m2 0h3m-5 4h5"/></svg>`
      },
      {
        name: 'Rencana SPK',
        path: '/spk',
        menuKey: 'spk',
        badge: 'Jadwal',
        // Work Order Checklist Clipboard
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 12l2 2 4-4"/><path d="M9 17h6"/></svg>`
      },
      {
        name: 'Label Produksi',
        path: '/label',
        menuKey: 'label',
        badge: 'Label FG',
        // Roll Barcode Tag with Perforated Label Edge
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="7" y1="9" x2="7" y2="15"/><line x1="10" y1="9" x2="10" y2="15" stroke-width="2.5"/><line x1="14" y1="9" x2="14" y2="15"/><line x1="17" y1="9" x2="17" y2="15" stroke-width="2"/></svg>`
      },
      {
        name: 'Data Roll FG',
        path: '/data-roll',
        menuKey: 'data_roll',
        badge: 'Roll',
        // Film Roll Bobbin with Unwinding Core & Sheet
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="6" cy="12" rx="3" ry="7"/><path d="M6 5h12c1.66 0 3 3.13 3 7s-1.34 7-3 7H6"/><circle cx="6" cy="12" r="1.5" fill="currentColor"/><path d="M6 19c6 0 12 2 15 2"/></svg>`
      },
      {
        name: 'Laporan Harian',
        path: '/de-report',
        menuKey: 'de_report',
        badge: 'Rekap',
        // Statistical Analytical Column Chart
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="9"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`
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
        // Warehouse Isometric Pallet / Crate
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>`
      },
      {
        name: 'Stok Opname',
        path: '/opname',
        menuKey: 'opname',
        badge: 'Audit',
        // Audit Magnifying Glass with Check Tally
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><circle cx="10" cy="10" r="7"/><line x1="21" y1="21" x2="15" y2="15"/><path d="M8 10h4"/><path d="M10 8v4"/></svg>`
      },
      {
        name: 'Inspeksi & Tugas',
        path: '/tasks',
        menuKey: 'tasks',
        badge: 'QC',
        // Quality Assurance Shield Badge
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
        // AI OCR Camera Viewfinder with Laser Crosshair
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2m-10 0H5a2 2 0 01-2-2v-2"/><circle cx="12" cy="12" r="2.5"/><line x1="6" y1="12" x2="18" y2="12" stroke-dasharray="2 1.5"/></svg>`
      },
      {
        name: 'Kalkulator Konversi',
        path: '/tools',
        menuKey: 'tools',
        badge: 'Tools',
        // Engineering Slitting Matrix Calculator
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
        // Master Data Sliders / Control Matrix (distinct from database cylinder)
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>`
      },
      {
        name: 'Manajemen Pengguna',
        path: '/users',
        menuKey: 'users',
        badge: 'Akses',
        // Users Team Identity & Access
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>`
      },
      {
        name: 'Pengaturan Sistem',
        path: '/settings',
        menuKey: 'settings',
        badge: 'Setup',
        // Precision Mechanical Cogwheel
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
