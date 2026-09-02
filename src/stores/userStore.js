import { defineStore } from 'pinia';
import { ref } from 'vue';
import { db } from '@/db';
import {
  hashPassword,
  generateSalt,
  DEFAULT_SUPER_ADMIN
} from '@/services/authService';

export const useUserStore = defineStore('user', () => {
  const users = ref([]);
  const isLoading = ref(false);

  const fetchUsers = async () => {
    isLoading.value = true;
    try {
      const all = await db.users.toArray();
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
    const { username, name, email, password, role, permissions } = payload;

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
      permissionsJson: JSON.stringify(permissions || {}),
      active: true,
      lastLogin: null,
      createdAt: nowIso,
      updatedAt: nowIso
    };

    const id = await db.users.add(newUser);
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
    resetUserPassword
  };
});
