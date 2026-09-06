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
import {
  registerDeviceSession,
  removeDeviceSession,
  startSessionHeartbeat,
  stopSessionHeartbeat,
  onSessionRevoked,
  initRealtimeSessionListener,
  cleanupRealtimeSessionListener,
  getCurrentSessionId
} from '@/services/sessionService';

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

          // Pastikan sesi perangkat terdaftar (auto-register untuk perangkat yang sudah login sebelumnya)
          const currentSessId = getCurrentSessionId();
          if (!currentSessId) {
            await registerDeviceSession(currentUser.value);
          } else {
            startSessionHeartbeat(currentSessId);
            initRealtimeSessionListener();
          }
        } else if (fresh && !fresh.active) {
          // User deactivated
          logout();
        }
      }

      // Listen for remote revocation event from Super Admin
      onSessionRevoked(async (reason) => {
        await forceRemoteLogout(reason || 'Sesi login perangkat Anda telah dihentikan oleh Super Admin.');
      });
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
    // Menu Bantuan & Dokumentasi dapat dilihat oleh semua pengguna yang sedang login
    if (menuKey === 'help' && action === 'view') return true;

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

  // Lock Screen States
  const isLocked = ref(false);
  const showProfileModal = ref(false);
  let idleTimer = null;

  // Setup Global Idle Detector
  const resetIdleTimer = () => {
    if (!currentUser.value || !currentUser.value.pinEnabled || isLocked.value) return;

    if (idleTimer) clearTimeout(idleTimer);

    const timeoutMinutes = currentUser.value.idleTimeoutMinutes !== undefined ? currentUser.value.idleTimeoutMinutes : 30;
    if (timeoutMinutes <= 0) return; // 0 = disabled

    idleTimer = setTimeout(() => {
      lockScreen();
    }, timeoutMinutes * 60 * 1000);
  };

  const lockScreen = () => {
    if (currentUser.value && currentUser.value.pinEnabled) {
      isLocked.value = true;
      localStorage.setItem('mlabel_screen_locked', 'true');
    }
  };

  const unlockScreen = async (pinInput) => {
    if (!currentUser.value) throw new Error('Sesi tidak ditemukan.');
    if (!pinInput || pinInput.length !== 4) {
      throw new Error('PIN harus terdiri dari 4 digit angka.');
    }

    const { hashPin } = await import('@/services/authService');
    const fresh = await db.users.get(currentUser.value.id);
    if (!fresh) throw new Error('Pengguna tidak ditemukan di database.');

    // Cek kecocokan lokal
    const hashedPin = await hashPin(pinInput, fresh.pinSalt || 'DEFAULT_PIN_SALT');
    let isMatch = hashedPin === fresh.pinCode;

    // Jika di lokal belum cocok, coba cek ke Cloud Supabase (misal PIN baru saja diubah di device lain)
    if (!isMatch) {
      try {
        const { supabase } = await import('@/services/supabaseClient');
        const { data: cloudRow } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'system_users_registry')
          .single();

        if (cloudRow && cloudRow.value) {
          const cloudUsers = typeof cloudRow.value === 'string' ? JSON.parse(cloudRow.value) : cloudRow.value;
          const cloudUser = cloudUsers.find(u => u.uuid === fresh.uuid || u.email === fresh.email);
          if (cloudUser && cloudUser.pinCode) {
            const cloudHashedPin = await hashPin(pinInput, cloudUser.pinSalt || 'DEFAULT_PIN_SALT');
            if (cloudHashedPin === cloudUser.pinCode) {
              isMatch = true;
              // Sinkronkan data PIN baru ke lokal
              await db.users.update(fresh.id, {
                pinCode: cloudUser.pinCode,
                pinSalt: cloudUser.pinSalt,
                pinEnabled: cloudUser.pinEnabled,
                updatedAt: cloudUser.updatedAt || new Date().toISOString()
              });
            }
          }
        }
      } catch (cloudPinErr) {
        console.warn('Cloud PIN check fallback error:', cloudPinErr);
      }
    }

    if (!isMatch) {
      throw new Error('PIN yang Anda masukkan salah. Coba lagi atau hubungi Super Admin.');
    }

    isLocked.value = false;
    localStorage.removeItem('mlabel_screen_locked');
    resetIdleTimer();
    return true;
  };

  // Login action dengan HYBRID MULTI-DEVICE SUPPORT
  // 1. Cek IndexedDB Lokal -> 2. Jika tidak cocok/tidak ada, otomatis cek ke Cloud Supabase -> 3. Auto-cache ke Lokal
  const login = async (usernameOrEmail, password) => {
    if (!usernameOrEmail || !password) {
      throw new Error('Username / Email dan kata sandi wajib diisi.');
    }

    const trimmed = usernameOrEmail.trim().toLowerCase();

    // 1. Cari user di IndexedDB lokal
    let user = await db.users.where('email').equalsIgnoreCase(trimmed).first();
    if (!user) {
      user = await db.users.where('username').equalsIgnoreCase(trimmed).first();
    }

    let passwordMatches = false;

    if (user) {
      const hashed = await hashPassword(password, user.salt);
      if (hashed === user.passwordHash) {
        passwordMatches = true;
      }
    }

    // 2. Jika pengguna belum ada di lokal ATAU password lokal tidak cocok (misal baru ganti sandi di Device A)
    if (!user || !passwordMatches) {
      try {
        const { supabase } = await import('@/services/supabaseClient');
        const { data: cloudRow, error: cloudErr } = await supabase
          .from('settings')
          .select('value')
          .eq('key', 'system_users_registry')
          .single();

        if (!cloudErr && cloudRow && cloudRow.value) {
          const cloudUsers = typeof cloudRow.value === 'string' ? JSON.parse(cloudRow.value) : cloudRow.value;
          const matchedCloudUser = (cloudUsers || []).find(cu => 
            (cu.email && cu.email.toLowerCase() === trimmed) ||
            (cu.username && cu.username.toLowerCase() === trimmed)
          );

          if (matchedCloudUser) {
            // Verifikasi password terhadap hash di Cloud
            const hashedAgainstCloud = await hashPassword(password, matchedCloudUser.salt);
            if (hashedAgainstCloud === matchedCloudUser.passwordHash) {
              passwordMatches = true;

              // Simpan / Perbarui data akun ke IndexedDB lokal (Auto-Healing Cache)
              const { id: _, ...cleanCloudUser } = matchedCloudUser;
              if (user) {
                await db.users.update(user.id, {
                  ...cleanCloudUser,
                  updatedAt: matchedCloudUser.updatedAt || new Date().toISOString()
                });
                user = await db.users.get(user.id);
              } else {
                const newLocalId = await db.users.add({
                  ...cleanCloudUser,
                  createdAt: matchedCloudUser.createdAt || new Date().toISOString(),
                  updatedAt: matchedCloudUser.updatedAt || new Date().toISOString()
                });
                user = await db.users.get(newLocalId);
              }
            }
          }
        }
      } catch (cloudSyncLoginErr) {
        console.warn('[HybridLogin] Cloud verification error:', cloudSyncLoginErr);
      }
    }

    if (!user) {
      throw new Error('Pengguna tidak ditemukan. Pastikan username atau email Anda benar.');
    }

    if (!user.active) {
      throw new Error('Akun Anda dinonaktifkan oleh administrator. Silakan hubungi Super Admin.');
    }

    if (!passwordMatches) {
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
      department: user.department || 'PRODUKSI_EXTRUSION',
      pinEnabled: Boolean(user.pinEnabled),
      idleTimeoutMinutes: user.idleTimeoutMinutes !== undefined ? user.idleTimeoutMinutes : 30,
      permissions: permissions,
      lastLogin: nowIso
    };

    currentUser.value = sessionData;
    localStorage.setItem('mlabel_session_user', JSON.stringify(sessionData));
    localStorage.setItem('mlabel_user_role', user.role);

    // Reset lock screen flag
    isLocked.value = false;
    localStorage.removeItem('mlabel_screen_locked');
    resetIdleTimer();

    // Register active device session to Supabase Cloud
    try {
      await registerDeviceSession(sessionData);
    } catch (e) {
      console.warn('Failed to register device session:', e);
    }

    return sessionData;
  };

  // Logout action
  const logout = async () => {
    try {
      await removeDeviceSession();
    } catch (e) {
      console.warn('Error removing device session:', e);
    }
    stopSessionHeartbeat();

    currentUser.value = null;
    isLocked.value = false;
    if (idleTimer) clearTimeout(idleTimer);
    localStorage.removeItem('mlabel_session_user');
    localStorage.removeItem('mlabel_user_role');
    localStorage.removeItem('mlabel_screen_locked');
  };

  // Remote Forced Logout action (triggered by Super Admin revoke)
  const forceRemoteLogout = async (reason = 'Sesi login perangkat Anda telah dihentikan oleh Super Admin.') => {
    try {
      await removeDeviceSession();
    } catch (e) {}

    stopSessionHeartbeat();
    cleanupRealtimeSessionListener();

    currentUser.value = null;
    isLocked.value = false;
    if (idleTimer) clearTimeout(idleTimer);

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('mlabel_session_user');
      localStorage.removeItem('mlabel_user_role');
      localStorage.removeItem('mlabel_screen_locked');
      localStorage.removeItem('mlabel_current_session_id');
    }

    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('mlabel_revoked_notice', reason);
    }

    // Hard redirect to login page immediately and reload to kill all components
    if (typeof window !== 'undefined') {
      window.location.href = window.location.origin + window.location.pathname + '#/login?revoked=1';
      window.location.reload();
    }
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

    // Sinkronkan data sandi baru ke Cloud Supabase seketika!
    try {
      const { useUserStore } = await import('@/stores/userStore');
      const userStore = useUserStore();
      await userStore.syncUsersToCloud();
    } catch (cloudErr) {
      console.warn('Cloud sync on password reset:', cloudErr);
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
    isLocked,
    showProfileModal,
    resetIdleTimer,
    lockScreen,
    unlockScreen,
    initAuth,
    login,
    logout,
    forceRemoteLogout,
    hasPermission,
    requestPasswordResetOtp,
    verifyOtpAndResetPassword
  };
});
