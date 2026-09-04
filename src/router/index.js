import { createRouter, createWebHashHistory } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
    meta: { title: 'Masuk ke Sistem', guestOnly: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { title: 'Dashboard & Ringkasan', menuKey: 'dashboard' }
  },
  {
    path: '/data-roll',
    name: 'DataRoll',
    component: () => import('@/views/DataRollView.vue'),
    meta: { title: 'Data Roll (Identitas Roll FG)', menuKey: 'data_roll' }
  },
  {
    path: '/schedule',
    name: 'OperatorSchedule',
    component: () => import('@/views/ScheduleView.vue'),
    meta: { title: 'Jadwal Kerja Operator (Schedule)', menuKey: 'schedule' }
  },
  {
    path: '/label',
    name: 'LabelManagement',
    component: () => import('@/views/LabelView.vue'),
    meta: { title: 'Manajemen Label', menuKey: 'label' }
  },
  {
    path: '/spk',
    name: 'SpkManagement',
    component: () => import('@/views/SpkManagementView.vue'),
    meta: { title: 'Manajemen SPK (Production Order)', menuKey: 'spk' }
  },
  {
    path: '/de-report',
    name: 'DeReport',
    component: () => import('@/views/DeReportView.vue'),
    meta: { title: 'DE Report (Laporan Data Entry)', menuKey: 'de_report' }
  },
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: () => import('@/views/InventoryView.vue'),
    meta: { title: 'Roll & Inventory Management (IMS)', menuKey: 'inventory' }
  },
  {
    path: '/wip',
    name: 'WipManagement',
    component: () => import('@/views/WipView.vue'),
    meta: { title: 'WIP Jumbo Management', menuKey: 'inventory' }
  },
  {
    path: '/scan-report',
    name: 'ScanReport',
    component: () => import('@/views/ScanReportView.vue'),
    meta: { title: 'Scan Laporan Produksi', menuKey: 'scan_report' }
  },
  {
    path: '/tools',
    name: 'ToolsEngineering',
    component: () => import('@/views/ToolsView.vue'),
    meta: { title: 'Tools & Kalkulator Lapangan', menuKey: 'tools' }
  },
  {
    path: '/tasks',
    name: 'TaskManagement',
    component: () => import('@/views/TaskView.vue'),
    meta: { title: 'Manajemen Tugas & QR', menuKey: 'tasks' }
  },
  {
    path: '/opname',
    name: 'StockOpname',
    component: () => import('@/views/OpnameView.vue'),
    meta: { title: 'Stok Opname', menuKey: 'opname' }
  },
  {
    path: '/data-config',
    name: 'DataConfig',
    component: () => import('@/views/DataConfigView.vue'),
    meta: { title: 'Data Configuration', menuKey: 'data_config' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/SettingsView.vue'),
    meta: { title: 'Pengaturan & AI', menuKey: 'settings' }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: () => import('@/views/UserManagementView.vue'),
    meta: { title: 'Kelola Pengguna & Hak Akses', menuKey: 'users' }
  }
];

const router = createRouter({
  history: createWebHashHistory(), // Hash history enables full compatibility with GitHub Pages
  routes
});

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();
  
  if (authStore.isInitializing) {
    await authStore.initAuth();
  }

  // 1. Not Authenticated User
  if (!authStore.isAuthenticated) {
    if (to.name === 'Login' || to.meta.guestOnly) {
      return next();
    }
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  }

  // 2. Authenticated User accessing Login
  if (to.name === 'Login' || to.meta.guestOnly) {
    return next('/');
  }

  // 3. Permission check for specific menu
  if (to.meta.menuKey && !authStore.hasPermission(to.meta.menuKey, 'view')) {
    if (to.path !== '/') {
      return next('/');
    }
  }

  next();
});

router.afterEach((to) => {
  document.title = `${to.meta.title || 'App'} - PT. Saptawarna Cemerlang`;
});

export default router;
