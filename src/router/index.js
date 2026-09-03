import { createRouter, createWebHashHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import LabelView from '@/views/LabelView.vue';
import ScheduleView from '@/views/ScheduleView.vue';
import DataRollView from '@/views/DataRollView.vue';
import DeReportView from '@/views/DeReportView.vue';
import InventoryView from '@/views/InventoryView.vue';
import WipView from '@/views/WipView.vue';
import ScanReportView from '@/views/ScanReportView.vue';
import TaskView from '@/views/TaskView.vue';
import OpnameView from '@/views/OpnameView.vue';
import DataConfigView from '@/views/DataConfigView.vue';
import SettingsView from '@/views/SettingsView.vue';
import ToolsView from '@/views/ToolsView.vue';
import LoginView from '@/views/LoginView.vue';
import UserManagementView from '@/views/UserManagementView.vue';
import SpkManagementView from '@/views/SpkManagementView.vue';
import { useAuthStore } from '@/stores/authStore';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { title: 'Masuk ke Sistem', guestOnly: true }
  },
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView,
    meta: { title: 'Dashboard & Ringkasan', menuKey: 'dashboard' }
  },
  {
    path: '/data-roll',
    name: 'DataRoll',
    component: DataRollView,
    meta: { title: 'Data Roll (Identitas Roll FG)', menuKey: 'data_roll' }
  },
  {
    path: '/schedule',
    name: 'OperatorSchedule',
    component: ScheduleView,
    meta: { title: 'Jadwal Kerja Operator (Schedule)', menuKey: 'schedule' }
  },
  {
    path: '/label',
    name: 'LabelManagement',
    component: LabelView,
    meta: { title: 'Manajemen Label', menuKey: 'label' }
  },
  {
    path: '/spk',
    name: 'SpkManagement',
    component: SpkManagementView,
    meta: { title: 'Manajemen SPK (Production Order)', menuKey: 'spk' }
  },
  {
    path: '/de-report',
    name: 'DeReport',
    component: DeReportView,
    meta: { title: 'DE Report (Laporan Data Entry)', menuKey: 'de_report' }
  },
  {
    path: '/inventory',
    name: 'InventoryManagement',
    component: InventoryView,
    meta: { title: 'Roll & Inventory Management (IMS)', menuKey: 'inventory' }
  },
  {
    path: '/wip',
    name: 'WipManagement',
    component: WipView,
    meta: { title: 'WIP Jumbo Management', menuKey: 'inventory' }
  },
  {
    path: '/scan-report',
    name: 'ScanReport',
    component: ScanReportView,
    meta: { title: 'Scan Laporan Produksi', menuKey: 'scan_report' }
  },
  {
    path: '/tools',
    name: 'ToolsEngineering',
    component: ToolsView,
    meta: { title: 'Tools & Kalkulator Lapangan', menuKey: 'tools' }
  },
  {
    path: '/tasks',
    name: 'TaskManagement',
    component: TaskView,
    meta: { title: 'Manajemen Tugas & QR', menuKey: 'tasks' }
  },
  {
    path: '/opname',
    name: 'StockOpname',
    component: OpnameView,
    meta: { title: 'Stok Opname', menuKey: 'opname' }
  },
  {
    path: '/data-config',
    name: 'DataConfig',
    component: DataConfigView,
    meta: { title: 'Data Configuration', menuKey: 'data_config' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: SettingsView,
    meta: { title: 'Pengaturan & AI', menuKey: 'settings' }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagementView,
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
