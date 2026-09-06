import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '@/db';
import {
  hashPassword,
  generateSalt,
  hashPin,
  DEFAULT_SUPER_ADMIN
} from '@/services/authService';
import { supabase } from '@/services/supabaseClient';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const isLoading = ref(false);

  // Sync users to Supabase settings key 'system_users_registry'
  const syncUsersToCloud = async () => {
    try {
      const allUsers = await db.users.toArray();
      const payload = {
        key: 'system_users_registry',
        value: JSON.stringify(allUsers),
        updated_at: new Date().toISOString()
      };
      await supabase.from('settings').upsert([payload], { onConflict: 'key' });
    } catch (e) {
      console.warn('[UserStore] Cloud sync notice:', e.message || e);
    }
  };

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      // 1. Ambil data lokal
      let all = await db.users.toArray();

      // 2. Jika lokal kosong atau saat online, coba cek cloud untuk data terbaru
      try {
        const { data: cloudRow } = await supabase
          .from('settings')
          .select('value, updated_at')
          .eq('key', 'system_users_registry')
          .single();

        if (cloudRow && cloudRow.value) {
          const cloudUsers = typeof cloudRow.value === 'string' ? JSON.parse(cloudRow.value) : cloudRow.value;
          if (Array.isArray(cloudUsers) && cloudUsers.length > 0) {
            // Merge cloud users ke local DB
            for (const cu of cloudUsers) {
              const exist = all.find(u => (u.uuid && u.uuid === cu.uuid) || u.username === cu.username || u.email === cu.email);
              if (!exist) {
                const { id, ...cleanCu } = cu;
                await db.users.add(cleanCu);
              } else if (new Date(cu.updatedAt || 0) > new Date(exist.updatedAt || 0)) {
                await db.users.update(exist.id, {
                  ...cu,
                  id: exist.id
                });
              }
            }
            all = await db.users.toArray();
          }
        }
      } catch (cloudErr) {
        console.warn('[UserStore] Cloud users fetch note:', cloudErr.message || cloudErr);
      }

      users.value = all.map(u => ({
        ...u,
        permissions: typeof u.permissionsJson === 'string' ? JSON.parse(u.permissionsJson) : u.permissionsJson
      }));
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      isLoading.value = false;
    }
  };

  const createUser = async (payload) => {
    const { username, name, email, password, role, permissions, department } = payload;

    const trimmedUsername = (username || '').trim().toLowerCase();
    const trimmedEmail = (email || '').trim().toLowerCase();

    if (!trimmedUsername || !name || !trimmedEmail || !password) {
      throw new Error('Semua bidang (Username, Nama, Email, dan Password) wajib diisi.');
    }

    // Check unique username
    const existUser = await db.users.where('username').equalsIgnoreCase(trimmedUsername).first();
    if (existUser) {
      throw new Error(`Username "${trimmedUsername}" sudah digunakan oleh pengguna lain.`);
    }

    // Check unique email
    const existEmail = await db.users.where('email').equalsIgnoreCase(trimmedEmail).first();
    if (existEmail) {
      throw new Error(`Email "${trimmedEmail}" sudah terdaftar pada pengguna lain.`);
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const nowIso = new Date().toISOString();

    const newUser = {
      uuid: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      username: trimmedUsername,
      name: name.trim(),
      email: trimmedEmail,
      passwordHash: passwordHash,
      salt: salt,
      role: role || 'OPERATOR',
      department: department || 'PRODUKSI_EXTRUSION',
      permissionsJson: JSON.stringify(permissions || {}),
      active: true,
      pinCode: null,
      pinSalt: null,
      pinEnabled: false,
      idleTimeoutMinutes: 30,
      lastLogin: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const id = await db.users.add(newUser);
    await syncUsersToCloud();
    await fetchUsers();
    return id;
  };

  const updateUser = async (id, payload) => {
    const user = await db.users.get(id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const trimmedUsername = (payload.username || '').trim().toLowerCase();
    const trimmedEmail = (payload.email || '').trim().toLowerCase();

    // Check duplicate username on other users
    const existingWithUsername = await db.users.where('username').equalsIgnoreCase(trimmedUsername).first();
    if (existingWithUsername && existingWithUsername.id !== id) {
      throw new Error(`Username "${trimmedUsername}" sudah dipakai pengguna lain.`);
    }

    // Check duplicate email on other users
    const existingWithEmail = await db.users.where('email').equalsIgnoreCase(trimmedEmail).first();
    if (existingWithEmail && existingWithEmail.id !== id) {
      throw new Error(`Email "${trimmedEmail}" sudah dipakai pengguna lain.`);
    }

    const updateObj = {
      username: trimmedUsername,
      name: payload.name.trim(),
      email: trimmedEmail,
      role: payload.role,
      department: payload.department || user.department || 'PRODUKSI_EXTRUSION',
      permissionsJson: JSON.stringify(payload.permissions || {}),
      updatedAt: new Date().toISOString()
    };

    // If new password is provided, rehash
    if (payload.password && payload.password.trim().length > 0) {
      const salt = generateSalt();
      updateObj.passwordHash = await hashPassword(payload.password.trim(), salt);
      updateObj.salt = salt;
    }

    await db.users.update(id, updateObj);
    await syncUsersToCloud();
    await fetchUsers();
  };

  const toggleUserStatus = async (id) => {
    const user = await db.users.get(id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    // Protect Super Admin from deactivation
    if (user.email.toLowerCase() === DEFAULT_SUPER_ADMIN.email.toLowerCase()) {
      throw new Error('Akun Super Admin utama tidak dapat dinonaktifkan.');
    }

    const newStatus = !user.active;
    await db.users.update(id, {
      active: newStatus,
      updatedAt: new Date().toISOString()
    });

    await syncUsersToCloud();
    await fetchUsers();
    return newStatus;
  };

  const deleteUser = async (id) => {
    const user = await db.users.get(id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    // Protect Super Admin from deletion
    if (user.email.toLowerCase() === DEFAULT_SUPER_ADMIN.email.toLowerCase()) {
      throw new Error('Akun Super Admin utama tidak dapat dihapus dari sistem.');
    }

    await db.users.delete(id);
    await syncUsersToCloud();
    await fetchUsers();
  };

  const resetUserPassword = async (id, newPassword) => {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password baru minimal 6 karakter.');
    }

    const salt = generateSalt();
    const passwordHash = await hashPassword(newPassword, salt);

    await db.users.update(id, {
      passwordHash: passwordHash,
      salt: salt,
      updatedAt: new Date().toISOString()
    });

    await syncUsersToCloud();
    await fetchUsers();
  };

  // Admin Reset PIN (Menonaktifkan PIN dan menghapus kode PIN pengguna)
  const resetUserPin = async (id) => {
    const user = await db.users.get(id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    await db.users.update(id, {
      pinCode: null,
      pinSalt: null,
      pinEnabled: false,
      updatedAt: new Date().toISOString()
    });

    await syncUsersToCloud();
    await fetchUsers();
  };

  // Admin Set or Update PIN directly
  const setUserPinByAdmin = async (id, pin, idleMinutes = 30) => {
    const user = await db.users.get(id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');
    if (!pin || pin.length !== 4 || !/^\d{4}$/.test(pin)) {
      throw new Error('PIN harus tepat berupa 4 digit angka (0-9).');
    }

    const salt = generateSalt();
    const pinHash = await hashPin(pin, salt);

    await db.users.update(id, {
      pinCode: pinHash,
      pinSalt: salt,
      pinEnabled: true,
      idleTimeoutMinutes: Number(idleMinutes) || 30,
      updatedAt: new Date().toISOString()
    });

    await syncUsersToCloud();
    await fetchUsers();
  };

  return {
    users,
    isLoading,
    fetchUsers,
    createUser,
    updateUser,
    toggleUserStatus,
    deleteUser,
    resetUserPassword,
    resetUserPin,
    setUserPinByAdmin,
    syncUsersToCloud
  };
});
