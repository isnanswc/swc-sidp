<template>
  <div
    v-if="authStore.showProfileModal"
    class="fixed inset-0 z-50 bg-zinc-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-fade-in"
    @click.self="authStore.showProfileModal = false"
  >
    <div class="w-full max-w-lg bg-white rounded-3xl border border-zinc-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
      
      <!-- Modal Header -->
      <div class="bg-zinc-900 text-white p-5 sm:p-6 flex items-center justify-between relative">
        <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-zinc-900"></div>
        <div class="flex items-center gap-3">
          <div
            :class="[
              'w-10 h-10 rounded-2xl font-black font-mono flex items-center justify-center text-sm shadow-md',
              authStore.isSuperAdmin ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'
            ]"
          >
            {{ (authStore.currentUser?.name || 'U').charAt(0).toUpperCase() }}
          </div>
          <div>
            <h2 class="text-base font-black tracking-tight text-white leading-tight">
              {{ authStore.currentUser?.name || 'Profil Pengguna' }}
            </h2>
            <p class="text-xs text-zinc-400 font-mono">
              @{{ authStore.currentUser?.username }} • {{ authStore.currentUser?.role }}
            </p>
          </div>
        </div>

        <button
          @click="authStore.showProfileModal = false"
          class="w-8 h-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white flex items-center justify-center text-sm font-mono cursor-pointer transition-colors"
        >
          ✕
        </button>
      </div>

      <!-- Tab Navigation -->
      <div class="flex border-b border-zinc-200 bg-zinc-50 px-4 sm:px-6 gap-2 text-xs font-mono font-bold">
        <button
          type="button"
          @click="activeTab = 'info'"
          :class="[
            'py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'info' ? 'border-red-600 text-red-600 bg-white shadow-2xs font-black' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          ]"
        >
          <span>👤</span>
          <span>Info Akun</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'pin'"
          :class="[
            'py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'pin' ? 'border-red-600 text-red-600 bg-white shadow-2xs font-black' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          ]"
        >
          <span>🔒</span>
          <span>Kunci Layar (PIN)</span>
        </button>
        <button
          type="button"
          @click="activeTab = 'password'"
          :class="[
            'py-3 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5',
            activeTab === 'password' ? 'border-red-600 text-red-600 bg-white shadow-2xs font-black' : 'border-transparent text-zinc-500 hover:text-zinc-800'
          ]"
        >
          <span>🔑</span>
          <span>Ganti Sandi</span>
        </button>
      </div>

      <!-- Modal Body (Scrollable) -->
      <div class="p-5 sm:p-6 overflow-y-auto space-y-4 text-xs">
        
        <!-- Alerts -->
        <div v-if="successMsg" class="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 flex items-center gap-2">
          <span>✅</span>
          <span class="font-bold">{{ successMsg }}</span>
        </div>
        <div v-if="errorMsg" class="p-3 bg-red-50 border border-red-200 rounded-2xl text-red-800 flex items-center gap-2">
          <span>⚠️</span>
          <span class="font-semibold">{{ errorMsg }}</span>
        </div>

        <!-- TAB 1: INFO AKUN -->
        <div v-if="activeTab === 'info'" class="space-y-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
              <span class="text-[10.5px] font-mono text-zinc-400 uppercase">Nama Lengkap</span>
              <div class="font-bold text-zinc-900 mt-0.5 text-sm">{{ authStore.currentUser?.name }}</div>
            </div>
            <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
              <span class="text-[10.5px] font-mono text-zinc-400 uppercase">Username</span>
              <div class="font-bold text-zinc-900 mt-0.5 font-mono">@{{ authStore.currentUser?.username }}</div>
            </div>
            <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
              <span class="text-[10.5px] font-mono text-zinc-400 uppercase">Alamat Email</span>
              <div class="font-bold text-zinc-900 mt-0.5 font-mono truncate">{{ authStore.currentUser?.email }}</div>
            </div>
            <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80">
              <span class="text-[10.5px] font-mono text-zinc-400 uppercase">Peran (Role)</span>
              <div class="mt-1">
                <span class="px-2 py-0.5 rounded-md text-[10px] font-black font-mono uppercase bg-zinc-900 text-white">
                  {{ authStore.currentUser?.role }}
                </span>
              </div>
            </div>
          </div>

          <!-- Departemen Aktif -->
          <div class="bg-zinc-50 p-3.5 rounded-2xl border border-zinc-200/80 flex items-center justify-between">
            <div>
              <span class="text-[10.5px] font-mono text-zinc-400 uppercase">Departemen / Unit Kerja</span>
              <div class="font-bold text-zinc-800 mt-0.5">
                {{ currentDepartmentName }}
              </div>
            </div>
            <span class="text-xl">🏭</span>
          </div>

          <!-- Quick Action: Lock Now -->
          <div v-if="authStore.currentUser?.pinEnabled" class="p-4 rounded-2xl bg-zinc-900 text-white flex items-center justify-between">
            <div class="space-y-0.5">
              <div class="font-black text-xs">Tinggalkan Meja Kerja?</div>
              <div class="text-[11px] text-zinc-400">Kunci layar sekarang untuk mengamankan data produksi.</div>
            </div>
            <button
              type="button"
              @click="handleLockNow"
              class="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs font-mono uppercase cursor-pointer transition-all shadow-md"
            >
              🔒 KUNCI SEKARANG
            </button>
          </div>
        </div>

        <!-- TAB 2: KEAMANAN PIN 4-DIGIT & AUTO-LOCK SCREEN -->
        <div v-else-if="activeTab === 'pin'" class="space-y-4">
          <!-- Toggle Switch PIN -->
          <div class="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 border border-zinc-200">
            <div class="space-y-0.5">
              <div class="font-black text-zinc-900 text-xs">Aktifkan Kunci Layar (PIN 4-Digit)</div>
              <div class="text-[11px] text-zinc-500 leading-tight">
                Layar otomatis terkunci saat tidak ada aktivitas pengguna.
              </div>
            </div>
            <label class="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                v-model="pinForm.enabled"
                class="sr-only peer"
              />
              <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          <!-- Configuration Fields (Visible if PIN enabled) -->
          <div v-if="pinForm.enabled" class="space-y-3.5 border-t border-zinc-100 pt-3">
            <!-- Idle Timeout Selection -->
            <div class="space-y-1">
              <label class="font-bold text-zinc-800">
                ⏱️ Waktu Tunggu Otomatis (Idle Timeout):
              </label>
              <select
                v-model.number="pinForm.idleMinutes"
                class="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:border-red-600"
              >
                <option :value="5">5 Menit (Keamanan Tinggi)</option>
                <option :value="10">10 Menit</option>
                <option :value="15">15 Menit</option>
                <option :value="30">30 Menit (Standar Pabrik)</option>
                <option :value="60">60 Menit (1 Jam)</option>
              </select>
              <p class="text-[10.5px] text-zinc-400">Layar akan terkunci jika tidak ada gerakan mouse/keyboard selama waktu ini.</p>
            </div>

            <!-- Set / Change PIN Input -->
            <div class="space-y-1.5 pt-1">
              <label class="font-bold text-zinc-800">
                🔢 {{ hasExistingPin ? 'Ubah PIN 4-Digit Baru (Kosongkan jika tetap):' : 'Atur PIN 4-Digit Anda:' }}
              </label>
              <div class="flex items-center gap-2">
                <input
                  v-model="pinForm.pin"
                  type="password"
                  maxlength="4"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  placeholder="Contoh: 1234"
                  class="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-center text-base font-black font-mono tracking-widest text-zinc-900 outline-none focus:border-red-600"
                />
                <input
                  v-if="pinForm.pin"
                  v-model="pinForm.pinConfirm"
                  type="password"
                  maxlength="4"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  placeholder="Ulangi PIN"
                  class="flex-1 bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-center text-base font-black font-mono tracking-widest text-zinc-900 outline-none focus:border-red-600"
                />
              </div>
            </div>

            <div class="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-[11px] leading-relaxed">
              💡 <strong>Catatan Keamanan:</strong> Jangan gunakan PIN yang mudah ditebak seperti 1111 atau 1234. Jika Anda lupa PIN di kemudian hari, Super Admin dapat mereset PIN akun Anda melalui menu Kelola Pengguna.
            </div>
          </div>

          <div class="pt-2">
            <button
              type="button"
              @click="handleSavePinSettings"
              :disabled="isSaving"
              class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {{ isSaving ? 'MENYIMPAN...' : 'SIMPAN PENGATURAN PIN' }}
            </button>
          </div>
        </div>

        <!-- TAB 3: GANTI KATA SANDI MANDIRI -->
        <div v-else-if="activeTab === 'password'" class="space-y-3.5">
          <div class="space-y-1">
            <label class="font-bold text-zinc-800 uppercase font-mono text-[10.5px]">Kata Sandi Lama</label>
            <input
              v-model="pwdForm.oldPassword"
              type="password"
              placeholder="Masukkan kata sandi saat ini"
              class="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-zinc-800 uppercase font-mono text-[10.5px]">Kata Sandi Baru</label>
            <input
              v-model="pwdForm.newPassword"
              type="password"
              placeholder="Minimal 6 karakter"
              class="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
            />
          </div>

          <div class="space-y-1">
            <label class="font-bold text-zinc-800 uppercase font-mono text-[10.5px]">Konfirmasi Kata Sandi Baru</label>
            <input
              v-model="pwdForm.confirmPassword"
              type="password"
              placeholder="Ulangi kata sandi baru"
              class="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-mono outline-none focus:border-red-600"
            />
          </div>

          <div class="pt-2">
            <button
              type="button"
              @click="handleChangePassword"
              :disabled="isSaving"
              class="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-black text-xs font-mono uppercase tracking-wider transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {{ isSaving ? 'MEMPERBARUI SANDI...' : 'SIMPAN KATA SANDI BARU' }}
            </button>
          </div>
        </div>

      </div>

      <!-- Modal Footer -->
      <div class="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
        <span class="text-[10px] font-mono text-zinc-400">
          M-Label Security System • Multi-Device Synced
        </span>
        <button
          type="button"
          @click="authStore.showProfileModal = false"
          class="px-4 py-2 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 font-bold text-xs font-mono cursor-pointer transition-colors"
        >
          TUTUP
        </button>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useUserStore } from '@/stores/userStore';
import { db } from '@/db';
import { DEPARTMENTS, hashPassword, generateSalt, hashPin } from '@/services/authService';

const authStore = useAuthStore();
const userStore = useUserStore();

const activeTab = ref('info');
const isSaving = ref(false);
const successMsg = ref('');
const errorMsg = ref('');
const hasExistingPin = ref(false);

const pinForm = reactive({
  enabled: false,
  idleMinutes: 30,
  pin: '',
  pinConfirm: ''
});

const pwdForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const currentDepartmentName = computed(() => {
  const deptKey = authStore.currentUser?.department;
  const found = DEPARTMENTS.find(d => d.key === deptKey);
  return found ? found.name : 'Produksi - Extrusion Film';
});

const loadInitialSettings = async () => {
  if (!authStore.currentUser?.id) return;
  const user = await db.users.get(authStore.currentUser.id);
  if (user) {
    pinForm.enabled = Boolean(user.pinEnabled);
    pinForm.idleMinutes = user.idleTimeoutMinutes !== undefined ? user.idleTimeoutMinutes : 30;
    hasExistingPin.value = Boolean(user.pinCode);
  }
};

const handleLockNow = () => {
  authStore.showProfileModal = false;
  authStore.lockScreen();
};

const handleSavePinSettings = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  isSaving.value = true;

  try {
    const user = await db.users.get(authStore.currentUser.id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const updatePayload = {
      pinEnabled: pinForm.enabled,
      idleTimeoutMinutes: pinForm.idleMinutes,
      updatedAt: new Date().toISOString()
    };

    // If enabling PIN for first time or updating PIN
    if (pinForm.enabled && pinForm.pin) {
      if (pinForm.pin.length !== 4 || !/^\d{4}$/.test(pinForm.pin)) {
        throw new Error('PIN harus tepat berupa 4 digit angka (0-9).');
      }
      if (pinForm.pin !== pinForm.pinConfirm) {
        throw new Error('Konfirmasi PIN tidak cocok dengan PIN baru.');
      }

      const salt = generateSalt();
      updatePayload.pinCode = await hashPin(pinForm.pin, salt);
      updatePayload.pinSalt = salt;
    } else if (pinForm.enabled && !hasExistingPin.value && !pinForm.pin) {
      throw new Error('Silakan buat PIN 4-digit terlebih dahulu untuk mengaktifkan kunci layar.');
    }

    await db.users.update(user.id, updatePayload);

    // Update currentUser state
    authStore.currentUser.pinEnabled = pinForm.enabled;
    authStore.currentUser.idleTimeoutMinutes = pinForm.idleMinutes;
    localStorage.setItem('mlabel_session_user', JSON.stringify(authStore.currentUser));

    // Sinkronkan ke Cloud Supabase
    await userStore.syncUsersToCloud();

    hasExistingPin.value = Boolean(updatePayload.pinCode || hasExistingPin.value);
    pinForm.pin = '';
    pinForm.pinConfirm = '';
    authStore.resetIdleTimer();

    successMsg.value = 'Pengaturan PIN & Layar Terkunci berhasil disimpan dan disinkronkan ke Cloud!';
    setTimeout(() => { successMsg.value = ''; }, 4000);
  } catch (err) {
    errorMsg.value = err.message || 'Gagal menyimpan pengaturan PIN.';
  } finally {
    isSaving.value = false;
  }
};

const handleChangePassword = async () => {
  errorMsg.value = '';
  successMsg.value = '';
  isSaving.value = true;

  try {
    if (!pwdForm.oldPassword || !pwdForm.newPassword) {
      throw new Error('Kata sandi lama dan baru wajib diisi.');
    }
    if (pwdForm.newPassword.length < 6) {
      throw new Error('Kata sandi baru minimal 6 karakter.');
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      throw new Error('Konfirmasi kata sandi baru tidak cocok.');
    }

    const user = await db.users.get(authStore.currentUser.id);
    if (!user) throw new Error('Pengguna tidak ditemukan.');

    const oldHash = await hashPassword(pwdForm.oldPassword, user.salt);
    if (oldHash !== user.passwordHash) {
      throw new Error('Kata sandi lama yang Anda masukkan tidak sesuai.');
    }

    const newSalt = generateSalt();
    const newHash = await hashPassword(pwdForm.newPassword, newSalt);

    await db.users.update(user.id, {
      passwordHash: newHash,
      salt: newSalt,
      updatedAt: new Date().toISOString()
    });

    // Sinkronkan kata sandi baru ke Cloud Supabase seketika!
    await userStore.syncUsersToCloud();

    pwdForm.oldPassword = '';
    pwdForm.newPassword = '';
    pwdForm.confirmPassword = '';

    successMsg.value = 'Kata sandi berhasil diperbarui dan disinkronkan ke Cloud Supabase! Anda kini bisa login di perangkat lain dengan sandi baru ini.';
    setTimeout(() => { successMsg.value = ''; }, 5000);
  } catch (err) {
    errorMsg.value = err.message || 'Gagal mengubah kata sandi.';
  } finally {
    isSaving.value = false;
  }
};

onMounted(() => {
  loadInitialSettings();
});
</script>
