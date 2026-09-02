import { db } from '@/db';

// Master Menus of the Application
export const APP_MENUS = [
  { key: 'dashboard', name: 'Dashboard Overview', path: '/', category: 'PRODUKSI & LAPORAN', icon: '📊' },
  { key: 'schedule', name: 'Operator Schedule', path: '/schedule', category: 'PRODUKSI & LAPORAN', icon: '📅' },
  { key: 'data_roll', name: 'Data Roll (Identitas)', path: '/data-roll', category: 'PRODUKSI & LAPORAN', icon: '🌀' },
  { key: 'label', name: 'Manajemen Label', path: '/label', category: 'PRODUKSI & LAPORAN', icon: '🏷️' },
  { key: 'scan_report', name: 'Scan Laporan AI', path: '/scan-report', category: 'PRODUKSI & LAPORAN', icon: '🤖' },
  { key: 'de_report', name: 'DE Report (Rekap)', path: '/de-report', category: 'PRODUKSI & LAPORAN', icon: '📋' },
  { key: 'tools', name: 'Tools & Konversi Lapangan', path: '/tools', category: 'PRODUKSI & LAPORAN', icon: '🛠️' },
  { key: 'tasks', name: 'Manajemen Tugas & QR', path: '/tasks', category: 'PRODUKSI & LAPORAN', icon: '✅' },
  { key: 'inventory', name: 'Roll & Inventory Management (IMS)', path: '/inventory', category: 'GUDANG & LOGISTIK', icon: '📦' },
  { key: 'opname', name: 'Stok Opname', path: '/opname', category: 'GUDANG & LOGISTIK', icon: '📝' },
  { key: 'data_config', name: 'Data Configuration', path: '/data-config', category: 'MASTER DATA & SISTEM', icon: '⚙️' },
  { key: 'settings', name: 'Pengaturan & AI', path: '/settings', category: 'MASTER DATA & SISTEM', icon: '🔧' },
  { key: 'users', name: 'Kelola Pengguna & Akses', path: '/users', category: 'MASTER DATA & SISTEM', icon: '👥' }
];

// Quick Role Presets Definition
export const ROLE_PRESETS = [
  {
    role: 'SUPER_ADMIN',
    title: 'Super Admin (Akses Penuh)',
    badgeColor: 'bg-red-600 text-white',
    description: 'Akses penuh seluruh menu, pengelolaan pengguna, pengaturan sistem, dan hak edit tak terbatas.'
  },
  {
    role: 'ADMIN_DE',
    title: 'Admin Data Entry (DE)',
    badgeColor: 'bg-purple-600 text-white',
    description: 'Input dan verifikasi data roll, DE report, upload excel, scan laporan, dan manajemen label.'
  },
  {
    role: 'OPERATOR',
    title: 'Operator Produksi',
    badgeColor: 'bg-blue-600 text-white',
    description: 'Input label produksi, cetak label, melihat jadwal kerja (schedule), dan kalkulator tools.'
  },
  {
    role: 'QC',
    title: 'QC Inspector',
    badgeColor: 'bg-amber-600 text-white',
    description: 'Inspeksi data roll, manajemen tugas QR QC, scan laporan, dan kalkulator toleransi timbangan.'
  },
  {
    role: 'GUDANG',
    title: 'Gudang & Logistik',
    badgeColor: 'bg-emerald-600 text-white',
    description: 'Akses sistem inventory (IMS), stok opname, dan cek data roll barang jadi.'
  },
  {
    role: 'CUSTOM',
    title: 'Kustom Mandiri',
    badgeColor: 'bg-zinc-600 text-white',
    description: 'Hak akses dikonfigurasi secara manual per menu dan per tingkat tindakan (Lihat/Edit).'
  }
];

// Helper to generate full permission object for a preset
export function generatePresetPermissions(role) {
  const permissions = {};
  
  APP_MENUS.forEach(menu => {
    let canView = false;
    let canEdit = false;

    if (role === 'SUPER_ADMIN') {
      canView = true;
      canEdit = true;
    } else if (role === 'ADMIN_DE') {
      if (['dashboard', 'schedule', 'data_roll', 'label', 'scan_report', 'de_report', 'tools'].includes(menu.key)) {
        canView = true;
        canEdit = true;
      }
    } else if (role === 'OPERATOR') {
      if (['dashboard', 'schedule', 'tools'].includes(menu.key)) {
        canView = true;
        canEdit = false;
      } else if (menu.key === 'label') {
        canView = true;
        canEdit = true;
      }
    } else if (role === 'QC') {
      if (['dashboard', 'scan_report', 'tools'].includes(menu.key)) {
        canView = true;
        canEdit = false;
      } else if (['tasks', 'data_roll'].includes(menu.key)) {
        canView = true;
        canEdit = true;
      }
    } else if (role === 'GUDANG') {
      if (['dashboard', 'data_roll'].includes(menu.key)) {
        canView = true;
        canEdit = false;
      } else if (['inventory', 'opname'].includes(menu.key)) {
        canView = true;
        canEdit = true;
      }
    }

    permissions[menu.key] = { view: canView, edit: canEdit };
  });

  return permissions;
}

// Password Hashing with Web Crypto API
export async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt + 'SWC_MLABEL_SECRET_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export function generateSalt() {
  const arr = new Uint8Array(16);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

// Auto-generate strong random password
export function generateRandomPassword(length = 12) {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnopqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  
  const all = upper + lower + numbers + symbols;
  let pwd = '';
  
  // Ensure at least one of each
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += numbers[Math.floor(Math.random() * numbers.length)];
  pwd += symbols[Math.floor(Math.random() * symbols.length)];
  
  for (let i = 4; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  
  // Shuffle characters
  return pwd.split('').sort(() => 0.5 - Math.random()).join('');
}

// Evaluate password strength
export function evaluatePasswordStrength(password) {
  if (!password) {
    return { score: 0, label: 'Kosong', color: 'bg-zinc-200 text-zinc-600', pct: 0, feedback: 'Ketik kata sandi' };
  }
  
  let score = 0;
  const checks = {
    length: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
    long: password.length >= 12
  };
  
  if (checks.length) score += 1;
  if (checks.hasUpper && checks.hasLower) score += 1;
  if (checks.hasNumber) score += 1;
  if (checks.hasSymbol) score += 1;
  if (checks.long) score += 1;

  if (score <= 1) {
    return { score: 1, label: 'Sangat Lemah', color: 'bg-red-500 text-white', pct: 20, feedback: 'Gunakan minimal 8 karakter dengan campuran angka' };
  } else if (score === 2) {
    return { score: 2, label: 'Lemah', color: 'bg-orange-500 text-white', pct: 40, feedback: 'Tambahkan huruf besar dan simbol unik' };
  } else if (score === 3) {
    return { score: 3, label: 'Sedang', color: 'bg-amber-500 text-white', pct: 65, feedback: 'Kata sandi cukup baik untuk standar kerja' };
  } else if (score === 4) {
    return { score: 4, label: 'Kuat', color: 'bg-emerald-600 text-white', pct: 85, feedback: 'Kuat! Kombinasi huruf, angka, dan simbol terpenuhi' };
  } else {
    return { score: 5, label: 'Sangat Kuat (Proteksi Tinggi)', color: 'bg-green-600 text-white', pct: 100, feedback: 'Sangat aman! Standar keamanan industri optimal' };
  }
}

// Super Admin Initial Seed
export const DEFAULT_SUPER_ADMIN = {
  username: 'admin',
  name: 'Super Admin SWC',
  email: 'isnanswc@gmail.com',
  defaultPassword: 'Admin@SWC2026!'
};

export async function seedDefaultSuperAdmin() {
  try {
    const existing = await db.users.where('email').equalsIgnoreCase(DEFAULT_SUPER_ADMIN.email).first();
    if (!existing) {
      const altAdmin = await db.users.where('username').equalsIgnoreCase(DEFAULT_SUPER_ADMIN.username).first();
      if (!altAdmin) {
        const salt = generateSalt();
        const hash = await hashPassword(DEFAULT_SUPER_ADMIN.defaultPassword, salt);
        const fullPermissions = generatePresetPermissions('SUPER_ADMIN');

        await db.users.add({
          uuid: 'usr_super_admin_001',
          username: DEFAULT_SUPER_ADMIN.username,
          name: DEFAULT_SUPER_ADMIN.name,
          email: DEFAULT_SUPER_ADMIN.email,
          passwordHash: hash,
          salt: salt,
          role: 'SUPER_ADMIN',
          permissionsJson: JSON.stringify(fullPermissions),
          active: true,
          lastLogin: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
        console.log('✅ Super Admin (isnanswc@gmail.com) berhasil di-seed.');
      }
    }
  } catch (err) {
    console.error('Failed to seed super admin:', err);
  }
}
