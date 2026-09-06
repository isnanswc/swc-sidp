import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { db } from '@/db';
import {
  hashPassword,
  generateSalt,
  seedDefaultSuperAdmin,
  generatePresetPermissions,
  DEFAULT_SUPER_ADMIN
} from '@/services/authService';

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref(null);
  const isInitializing = ref(true);

  // Restore session from localStorage on startup
  const restoreSession = () => {
    try {
      const saved = localStorage.getItem('mlabel_session_user');
      if (saved) {
        currentUser.value = JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to restore auth session:', e);
      localStorage.removeItem('mlabel_session_user');
    }
  };

  // Initialize DB seed & session
  const initAuth = async () => {
    isInitializing.value = true;
    try {
      await seedDefaultSuperAdmin();
      restoreSession();

      // If session exists, refresh data from DB to get latest status/permissions
      if (currentUser.value?.id) {
        const fresh = await db.users.get(currentUser.value.id);
        if (fresh && fresh.active) {
          currentUser.value = {
            id: fresh.id,
            uuid: fresh.uuid,
            username: fresh.username,
            name: fresh.name,
            email: fresh.email,
            role: fresh.role,
            permissions: typeof fresh.permissionsJson === 'string' ? JSON.parse(fresh.permissionsJson) : fresh.permissionsJson
          };
          localStorage.setItem('mlabel_session_user', JSON.stringify(currentUser.value));
        } else if (fresh && !fresh.active) {
          // User deactivated
          logout();
        }
      }
    } catch (err) {
      console.error('Error during initAuth:', err);
    } finally {
      isInitializing.value = false;
    }
  };

  const isAuthenticated = computed(() => !!currentUser.value);
  const isSuperAdmin = computed(() => currentUser.value?.role === 'SUPER_ADMIN');
  const isAdmin = computed(() => currentUser.value?.role === 'SUPER_ADMIN' || currentUser.value?.role === 'ADMIN_DE');
  const isOperator = computed(() => currentUser.value?.role === 'OPERATOR');
  const currentRole = computed(() => currentUser.value?.role || 'GUEST');

  // Permission check helper
  const hasPermission = (menuKey, action = 'view') => {
    if (!currentUser.value) return false;
    if (currentUser.value.role === 'SUPER_ADMIN') return true;

    const perms = currentUser.value.permissions;
    if (!perms || !perms[menuKey]) return false;

    if (action === 'edit') {
      return !!perms[menuKey].edit;
    }
    return !!perms[menuKey].view;
  };

  // Feature permission check helper (e.g. AI Chat Float)
  const canUseAiChat = computed(() => {
    if (!currentUser.value) return false;
    if (currentUser.value.role === 'SUPER_ADMIN') return true;

    const perms = currentUser.value.permissions;
    if (perms?.features?.aiChat !== undefined) {
      return !!perms.features.aiChat;
    }
    // Fallback based on default role
    return ['ADMIN_DE', 'PPIC'].includes(currentUser.value.role);
  });

  // Login action
  const login = async (usernameOrEmail, password) => {
    if (!usernameOrEmail || !password) {
      throw new Error('Username / Email dan kata sandi wajib diisi.');
    }

    const trimmed = usernameOrEmail.trim().toLowerCase();

    // Find user by email or username
    let user = await db.users.where('email').equalsIgnoreCase(trimmed).first();
    if (!user) {
      user = await db.users.where('username').equalsIgnoreCase(trimmed).first();
    }

    if (!user) {
      throw new Error('Pengguna tidak ditemukan. Periksa kembali username atau email Anda.');
    }

    if (!user.active) {
      throw new Error('Akun Anda dinonaktifkan oleh administrator. Silakan hubungi Super Admin.');
    }

    // Verify Password Hash
    const hashed = await hashPassword(password, user.salt);
    if (hashed !== user.passwordHash) {
      throw new Error('Kata sandi yang Anda masukkan salah.');
    }

    // Parse permissions
    const permissions = typeof user.permissionsJson === 'string'
      ? JSON.parse(user.permissionsJson)
      : user.permissionsJson;

    // Update last login
    const nowIso = new Date().toISOString();
    await db.users.update(user.id, { lastLogin: nowIso, updatedAt: nowIso });

    const sessionData = {
      id: user.id,
      uuid: user.uuid,
      username: user.username,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissions,
      lastLogin: nowIso
    };

    currentUser.value = sessionData;
    localStorage.setItem('mlabel_session_user', JSON.stringify(sessionData));
    localStorage.setItem('mlabel_user_role', user.role);

    return sessionData;
  };

  // Logout action
  const logout = () => {
    currentUser.value = null;
    localStorage.removeItem('mlabel_session_user');
    localStorage.removeItem('mlabel_user_role');
  };

  // Password Reset / OTP Flow for Super Admin & Users (via EmailJS)
  const requestPasswordResetOtp = async (emailInput) => {
    const trimmed = (emailInput || '').trim().toLowerCase();
    if (!trimmed) throw new Error('Silakan masukkan alamat email yang terdaftar.');

    const user = await db.users.where('email').equalsIgnoreCase(trimmed).first();
    if (!user) {
      throw new Error(`Email "${trimmed}" tidak terdaftar di sistem PT. Saptawarna Cemerlang.`);
    }

    // Keamanan Khusus: Reset mandiri via email diprioritaskan dan dikhususkan untuk Super Admin
    if (user.role !== 'SUPER_ADMIN') {
      throw new Error('Fitur pemulihan kata sandi mandiri via email dikhususkan untuk Super Admin. Pengguna operasional (Operator/QC/Gudang/PPIC) silakan hubungi Administrator untuk reset sandi.');
    }

    // Generate 6-digit numeric OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

    const resetPayload = {
      email: user.email,
      userId: user.id,
      code: otpCode,
      expiry: expiry
    };

    localStorage.setItem('mlabel_pwd_reset', JSON.stringify(resetPayload));

    // Kirim email via EmailJS Service
    let emailResult = { success: true, simulated: true };
    try {
      const { sendEmailViaEmailJS } = await import('@/services/emailService');
      emailResult = await sendEmailViaEmailJS({
        toEmail: user.email,
        toName: user.name || 'Super Admin',
        subject: `[M-Label] Kode Verifikasi OTP Pemulihan Kata Sandi: ${otpCode}`,
        otpCode: otpCode,
        message: `Anda baru saja meminta pemulihan kata sandi akun Super Admin pada sistem M-Label PT. Saptawarna Cemerlang. Masukkan kode verifikasi 6-digit berikut: ${otpCode}. Kode ini berlaku selama 15 menit. Jika ini bukan Anda, segera amankan akses database.`,
        type: 'PASSWORD_RESET_OTP'
      });
    } catch (mailErr) {
      console.error('Gagal mengirim email verifikasi:', mailErr);
      // Jika gagal kirim via internet/EmailJS, kita lempar error yang jelas
      throw new Error(`Gagal mengirim email verifikasi ke ${user.email}. Alasan: ${mailErr.message || mailErr}`);
    }

    // Masked email for security display (e.g., is***wc@gmail.com)
    const parts = user.email.split('@');
    const namePart = parts[0];
    const masked = namePart.length > 3
      ? namePart.slice(0, 2) + '*'.repeat(namePart.length - 4) + namePart.slice(-2) + '@' + parts[1]
      : user.email;

    return {
      success: true,
      email: user.email,
      maskedEmail: masked,
      simulated: emailResult.simulated,
      otpCode: emailResult.simulated ? otpCode : null // Tampilkan hanya jika mode simulasi (karena belum setup API Key)
    };
  };

  const verifyOtpAndResetPassword = async (email, otpCode, newPassword) => {
    const rawReset = localStorage.getItem('mlabel_pwd_reset');
    if (!rawReset) {
      throw new Error('Permintaan reset password kedaluwarsa. Silakan ajukan kembali.');
    }

    const resetData = JSON.parse(rawReset);
    if (resetData.email.toLowerCase() !== email.trim().toLowerCase()) {
      throw new Error('Alamat email tidak sesuai dengan permohonan reset.');
    }

    if (Date.now() > resetData.expiry) {
      localStorage.removeItem('mlabel_pwd_reset');
      throw new Error('Kode verifikasi telah kedaluwarsa. Silakan ajukan kode baru.');
    }

    if (resetData.code !== otpCode.trim()) {
      throw new Error('Kode verifikasi OTP salah. Mohon periksa kembali.');
    }

    if (!newPassword || newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }

    // Hash new password and update user in DB
    const newSalt = generateSalt();
    const newHash = await hashPassword(newPassword, newSalt);

    await db.users.update(resetData.userId, {
      passwordHash: newHash,
      salt: newSalt,
      updatedAt: new Date().toISOString()
    });

    localStorage.removeItem('mlabel_pwd_reset');

    // Kirim notifikasi konfirmasi sukses ganti sandi ke email Super Admin
    try {
      const { sendEmailViaEmailJS } = await import('@/services/emailService');
      await sendEmailViaEmailJS({
        toEmail: resetData.email,
        toName: 'Super Admin',
        subject: '🔒 Pemberitahuan: Kata Sandi Super Admin Berhasil Diperbarui',
        otpCode: 'BERHASIL',
        message: 'Kata sandi akun Super Admin M-Label Anda baru saja berhasil diperbarui. Jika Anda tidak merasa melakukan tindakan ini, segera hubungi tim IT Security.',
        type: 'PASSWORD_RESET_SUCCESS'
      });
    } catch (e) {
      console.warn('Gagal mengirim konfirmasi perubahan sandi:', e);
    }

    return { success: true, message: 'Kata sandi berhasil diperbarui. Silakan login kembali.' };
  };

  return {
    currentUser,
    isInitializing,
    isAuthenticated,
    isSuperAdmin,
    isAdmin,
    isOperator,
    currentRole,
    canUseAiChat,
    initAuth,
    login,
    logout,
    hasPermission,
    requestPasswordResetOtp,
    verifyOtpAndResetPassword
  };
});
