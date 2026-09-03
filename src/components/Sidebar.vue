<template>
  <aside 
    :class="[
      'bg-zinc-950 text-zinc-100 flex flex-col transition-all duration-300 z-50 shadow-2xl fixed md:sticky md:top-0 h-screen inset-y-0 left-0 border-r border-zinc-800/80 shrink-0',
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

    <!-- Navigation Menu (Categorized Toolbox) -->
    <div class="flex-1 py-3 px-2.5 space-y-3 overflow-y-auto">
      <div v-for="(cat, cIdx) in visibleNavCategories" :key="cIdx" class="space-y-1">
        <!-- Category Header (When Expanded or Mobile) -->
        <div v-show="isOpen || isMobile" class="px-2.5 pt-1.5 pb-0.5 text-[9px] font-black text-zinc-500 uppercase tracking-wider flex items-center justify-between">
          <span>{{ cat.category }}</span>
        </div>
        <div v-show="!isOpen && !isMobile" class="my-1 border-t border-zinc-800/80"></div>

        <!-- Links in Category -->
        <router-link
          v-for="item in cat.items"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-xs transition-all group relative',
            !isOpen && !isMobile ? 'justify-center px-2' : '',
            isActive(item.path)
              ? 'bg-red-600 text-white shadow-lg shadow-red-600/30 font-bold'
              : 'text-zinc-300 hover:bg-zinc-900 hover:text-white'
          ]"
          :title="!isOpen && !isMobile ? item.name : ''"
          @click="closeMobileNav"
        >
          <!-- Icon -->
          <span class="shrink-0 flex items-center justify-center" v-html="item.icon"></span>

          <!-- Label -->
          <span v-show="isOpen || isMobile" class="truncate">{{ item.name }}</span>

          <!-- Active Indicator Dot (Collapsed mode) -->
          <span 
            v-if="!isOpen && !isMobile && isActive(item.path)"
            class="absolute right-1.5 top-1.5 w-2 h-2 rounded-full bg-red-400 ring-2 ring-zinc-950"
          ></span>

          <!-- Badge if any -->
          <span 
            v-if="item.badge && (isOpen || isMobile)"
            :class="[
              'ml-auto text-[9px] px-1.5 py-0.2 rounded-md font-extrabold border uppercase font-mono',
              isActive(item.path) 
                ? 'bg-white/20 text-white border-white/30' 
                : 'bg-red-500/20 text-red-300 border-red-500/30'
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

const navCategories = [
  {
    category: 'PRODUKSI & LAPORAN',
    items: [
      {
        name: 'Dashboard Overview',
        path: '/',
        menuKey: 'dashboard',
        badge: 'Live',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></svg>`
      },
      {
        name: 'Operator Schedule',
        path: '/schedule',
        menuKey: 'schedule',
        badge: 'Shift',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/><circle cx="12" cy="15" r="2"/></svg>`
      },
      {
        name: 'Data Roll (Identitas)',
        path: '/data-roll',
        menuKey: 'data_roll',
        badge: 'Roll FG',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`
      },
      {
        name: 'Manajemen Label',
        path: '/label',
        menuKey: 'label',
        badge: 'Produksi',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>`
      },
      {
        name: 'Manajemen SPK',
        path: '/spk',
        menuKey: 'spk',
        badge: 'Order',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`
      },
      {
        name: 'Scan Laporan AI',
        path: '/scan-report',
        menuKey: 'scan_report',
        badge: 'AI Scan',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7V5a2 2 0 012-2h2m10 0h2a2 2 0 012 2v2m0 10v2a2 2 0 01-2 2h-2M4 17v2a2 2 0 002 2h2"/><path d="M9 10h6M9 14h4"/></svg>`
      },
      {
        name: 'DE Report (Rekap)',
        path: '/de-report',
        menuKey: 'de_report',
        badge: 'Data Entry',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="13" width="3.5" height="7" rx="0.5"/><rect x="10.25" y="9" width="3.5" height="11" rx="0.5"/><rect x="15.5" y="4" width="3.5" height="16" rx="0.5"/></svg>`
      },
      {
        name: 'Tools & Konversi Lapangan',
        path: '/tools',
        menuKey: 'tools',
        badge: 'Tools',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`
      },
      {
        name: 'Manajemen Tugas & QR',
        path: '/tasks',
        menuKey: 'tasks',
        badge: 'QC',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>`
      }
    ]
  },
  {
    category: 'GUDANG & LOGISTIK',
    items: [
      {
        name: 'Roll & Inventory Management (IMS)',
        path: '/inventory',
        menuKey: 'inventory',
        badge: 'IMS',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96L12 12.01l8.73-5.05"/><path d="M12 22.08V12"/></svg>`
      },
      {
        name: 'Stok Opname',
        path: '/opname',
        menuKey: 'opname',
        badge: 'Gudang',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`
      }
    ]
  },
  {
    category: 'MASTER DATA & SISTEM',
    items: [
      {
        name: 'Data Configuration',
        path: '/data-config',
        menuKey: 'data_config',
        badge: 'Master',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round"><path d="M4 21v-7m0-4V3m8 18v-9m0-4V3m8 18v-5m0-4V3"/><circle cx="4" cy="14" r="2"/><circle cx="12" cy="8" r="2"/><circle cx="20" cy="16" r="2"/></svg>`
      },
      {
        name: 'Pengaturan & AI',
        path: '/settings',
        menuKey: 'settings',
        badge: 'AI Key',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 00-2 2v.18a2 2 0 01-1 1.73l-.43.25a2 2 0 01-2 0l-.15-.08a2 2 0 00-2.73.73l-.22.38a2 2 0 00.73 2.73l.15.1a2 2 0 011 1.72v.51a2 2 0 01-1 1.74l-.15.09a2 2 0 00-.73 2.73l.22.38a2 2 0 002.73.73l.15-.08a2 2 0 012 0l.43.25a2 2 0 011 1.73V20a2 2 0 002 2h.44a2 2 0 002-2v-.18a2 2 0 011-1.73l.43-.25a2 2 0 012 0l.15.08a2 2 0 002.73-.73l.22-.39a2 2 0 00-.73-2.73l-.15-.08a2 2 0 01-1-1.74v-.5a2 2 0 011-1.74l.15-.09a2 2 0 00.73-2.73l-.22-.38a2 2 0 00-2.73-.73l-.15.08a2 2 0 01-2 0l-.43-.25a2 2 0 01-1-1.73V4a2 2 0 00-2-2z"/><circle cx="12" cy="12" r="3"/></svg>`
      },
      {
        name: 'Kelola Pengguna & Akses',
        path: '/users',
        menuKey: 'users',
        badge: 'RBAC',
        icon: `<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="1.8" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
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
