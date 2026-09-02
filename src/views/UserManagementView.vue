<template>
  <div class="space-y-6 animate-fade-in pb-12">
    
    <!-- Header Section -->
    <div class="bg-zinc-900 text-white rounded-3xl p-5 sm:p-7 border border-zinc-800 shadow-xl relative overflow-hidden">
      <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
      
      <div class="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div class="space-y-1.5">
          <div class="flex items-center gap-2.5">
            <span class="px-2.5 py-0.5 rounded-md text-[10px] font-black tracking-wider uppercase bg-red-600 text-white font-mono shadow-xs">
              SYSTEM SECURITY & RBAC
            </span>
            <span class="text-xs text-zinc-400 font-mono">• Manajemen Hak Akses Terpadu</span>
          </div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2.5">
            <svg class="w-6 h-6 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Kelola Pengguna & Hak Akses</span>
          </h1>
          <p class="text-xs sm:text-sm text-zinc-400 max-w-2xl leading-relaxed">
            Atur akun pengguna, kredensial sandi kuat, pembatasan menu granular (Lihat vs Edit), serta template hak akses cepat sesuai bagian operasional pabrik.
          </p>
        </div>

        <!-- Add User Button -->
        <button
          @click="openAddModal"
          class="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black text-xs uppercase tracking-wider font-mono shadow-lg shadow-red-600/30 transition-all cursor-pointer flex items-center gap-2 shrink-0"
        >
          <span class="text-base leading-none">+</span>
          <span>TAMBAH PENGGUNA</span>
        </button>
      </div>

      <!-- Quick Metrics Summary -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-zinc-800/80 font-mono text-xs">
        <div class="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
          <span class="text-zinc-500 text-[10.5px]">TOTAL PENGGUNA:</span>
          <div class="text-xl font-black text-white mt-0.5">{{ userStore.users.length }} Akun</div>
        </div>
        <div class="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
          <span class="text-zinc-500 text-[10.5px]">AKUN AKTIF:</span>
          <div class="text-xl font-black text-emerald-400 mt-0.5">{{ userStore.users.filter(u => u.active).length }} Aktif</div>
        </div>
        <div class="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
          <span class="text-zinc-500 text-[10.5px]">SUPER ADMIN:</span>
          <div class="text-xl font-black text-red-400 mt-0.5">{{ userStore.users.filter(u => u.role === 'SUPER_ADMIN').length }} Admin</div>
        </div>
        <div class="bg-zinc-950/60 p-3 rounded-2xl border border-zinc-800">
          <span class="text-zinc-500 text-[10.5px]">AKUN NONAKTIF:</span>
          <div class="text-xl font-black text-zinc-400 mt-0.5">{{ userStore.users.filter(u => !u.active).length }} Dikunci</div>
        </div>
      </div>
    </div>

    <!-- Search & Filter Bar -->
    <div class="bg-white p-4 rounded-2xl border border-zinc-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div class="relative flex-1 max-w-md">
        <span class="absolute left-3 top-2.5 text-zinc-400">🔍</span>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Cari nama, username, atau email..."
          class="w-full pl-9 pr-3.5 py-2 rounded-xl border border-zinc-300 text-xs font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-red-500"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap text-xs">
        <select
          v-model="filterRole"
          class="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
        >
          <option value="ALL">Semua Peran (Role)</option>
          <option v-for="r in ROLE_PRESETS" :key="r.role" :value="r.role">{{ r.title }}</option>
        </select>

        <select
          v-model="filterStatus"
          class="bg-white border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-800 outline-none focus:ring-1 focus:ring-red-600 cursor-pointer"
        >
          <option value="ALL">Semua Status</option>
          <option value="ACTIVE">Aktif Saja</option>
          <option value="INACTIVE">Nonaktif Saja</option>
        </select>
      </div>
    </div>

    <!-- Users Table Card -->
    <div class="bg-white rounded-3xl border border-zinc-200 shadow-xs overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse text-xs">
          <thead>
            <tr class="bg-zinc-50/90 border-b border-zinc-200 text-zinc-500 uppercase font-mono text-[10.5px]">
              <th class="py-3 px-4 text-center w-12">#</th>
              <th class="py-3 px-4">Pengguna</th>
              <th class="py-3 px-4">Email Terdaftar</th>
              <th class="py-3 px-4">Peran (Role)</th>
              <th class="py-3 px-4">Cakupan Akses</th>
              <th class="py-3 px-4 text-center">Status</th>
              <th class="py-3 px-4">Login Terakhir</th>
              <th class="py-3 px-4 text-center w-36">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="8" class="py-12 text-center text-zinc-400">
                <div class="text-3xl mb-2">👥</div>
                <div class="font-bold">Tidak ada data pengguna yang cocok</div>
              </td>
            </tr>

            <tr
              v-for="(user, idx) in filteredUsers"
              :key="user.id"
              class="hover:bg-zinc-50/80 transition-colors"
            >
              <!-- Index -->
              <td class="py-3.5 px-4 text-center font-mono text-zinc-400">
                {{ idx + 1 }}
              </td>

              <!-- Name & Username -->
              <td class="py-3.5 px-4">
                <div class="flex items-center gap-3">
                  <div
                    :class="[
                      'w-8 h-8 rounded-xl font-black font-mono flex items-center justify-center text-xs shrink-0 shadow-2xs',
                      user.role === 'SUPER_ADMIN' ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'
                    ]"
                  >
                    {{ user.name.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-black text-zinc-900 flex items-center gap-1.5">
                      <span>{{ user.name }}</span>
                      <span v-if="user.email === DEFAULT_SUPER_ADMIN.email" class="text-[10px] px-1.5 py-0.2 rounded bg-red-100 text-red-700 font-mono font-bold">
                        Utama
                      </span>
                    </div>
                    <div class="text-[11px] font-mono text-zinc-400">@{{ user.username }}</div>
                  </div>
                </div>
              </td>

              <!-- Email -->
              <td class="py-3.5 px-4 font-mono text-zinc-700">
                {{ user.email }}
              </td>

              <!-- Role Badge -->
              <td class="py-3.5 px-4">
                <span :class="['px-2.5 py-1 rounded-lg text-[10.5px] font-black font-mono uppercase tracking-tight', getRoleBadgeClass(user.role)]">
                  {{ getRoleTitle(user.role) }}
                </span>
              </td>

              <!-- Permissions Summary -->
              <td class="py-3.5 px-4">
                <span class="text-zinc-600 font-mono text-[11px]">
                  {{ getPermissionsSummary(user) }}
                </span>
              </td>

              <!-- Status Badge -->
              <td class="py-3.5 px-4 text-center">
                <span
                  :class="[
                    'px-2 py-0.5 rounded-full text-[10.5px] font-bold font-mono',
                    user.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-zinc-100 text-zinc-500 border border-zinc-300'
                  ]"
                >
                  {{ user.active ? '● Aktif' : '○ Dikunci' }}
                </span>
              </td>

              <!-- Last Login -->
              <td class="py-3.5 px-4 font-mono text-zinc-500 text-[11px]">
                {{ formatDateTime(user.lastLogin) }}
              </td>

              <!-- Action Buttons -->
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center gap-1.5">
                  <!-- Edit Button -->
                  <button
                    @click="openEditModal(user)"
                    class="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
                    title="Edit Profil & Hak Akses"
                  >
                    ✏️
                  </button>

                  <!-- Change Password -->
                  <button
                    @click="openPasswordModal(user)"
                    class="p-1.5 rounded-lg bg-zinc-100 hover:bg-amber-100 text-amber-700 transition-colors cursor-pointer"
                    title="Ganti Kata Sandi"
                  >
                    🔑
                  </button>

                  <!-- Toggle Active Status -->
                  <button
                    v-if="user.email !== DEFAULT_SUPER_ADMIN.email"
                    @click="handleToggleStatus(user)"
                    :class="[
                      'p-1.5 rounded-lg transition-colors cursor-pointer',
                      user.active ? 'bg-zinc-100 hover:bg-orange-100 text-orange-700' : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                    ]"
                    :title="user.active ? 'Kunci Akun' : 'Aktifkan Akun'"
                  >
                    {{ user.active ? '🔒' : '🔓' }}
                  </button>

                  <!-- Delete Button -->
                  <button
                    v-if="user.email !== DEFAULT_SUPER_ADMIN.email"
                    @click="handleDeleteUser(user)"
                    class="p-1.5 rounded-lg bg-zinc-100 hover:bg-red-100 text-red-700 transition-colors cursor-pointer"
                    title="Hapus Akun"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: TAMBAH / EDIT PENGGUNA & HAK AKSES -->
    <!-- ========================================================================= -->
    <div
      v-if="showUserModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-y-auto"
    >
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-zinc-200 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="flex items-center justify-between border-b border-zinc-100 pb-4">
          <div class="flex items-center gap-2.5">
            <span class="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center text-lg font-black">
              {{ isEditing ? '✏️' : '👤' }}
            </span>
            <div>
              <h3 class="text-base font-black text-zinc-900">
                {{ isEditing ? 'Edit Pengguna & Hak Akses' : 'Tambah Pengguna Baru' }}
              </h3>
              <p class="text-xs text-zinc-400 font-mono">Konfigurasi Kredensial & Role-Based Access Control</p>
            </div>
          </div>
          <button
            @click="showUserModal = false"
            class="text-zinc-400 hover:text-zinc-800 p-1 cursor-pointer rounded-lg hover:bg-zinc-100 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Form Fields -->
        <div class="space-y-4 text-xs">
          
          <!-- Basic Info Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Full Name -->
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Nama Lengkap Pengguna <span class="text-red-500">*</span></label>
              <input
                v-model="userForm.name"
                type="text"
                placeholder="Contoh: Budi Santoso"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-medium text-zinc-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <!-- Username -->
            <div class="space-y-1.5">
              <label class="font-bold text-zinc-700">Username Akun <span class="text-red-500">*</span></label>
              <input
                v-model="userForm.username"
                type="text"
                placeholder="Contoh: budi_slitting"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <!-- Email -->
            <div class="sm:col-span-2 space-y-1.5">
              <label class="font-bold text-zinc-700">Alamat Email <span class="text-red-500">*</span></label>
              <input
                v-model="userForm.email"
                type="email"
                placeholder="budi@saptawarna.co.id"
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-zinc-900 outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <!-- Password Section (Required on Create, Optional on Edit) -->
          <div v-if="!isEditing" class="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 space-y-3">
            <div class="flex items-center justify-between">
              <label class="font-bold text-zinc-900 flex items-center gap-1.5">
                <span>🔑 Kata Sandi (Password)</span>
                <span class="text-red-500">*</span>
              </label>
              <button
                type="button"
                @click="autoGeneratePassword"
                class="text-[11px] font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2.5 py-1 rounded-lg border border-red-200 transition-colors cursor-pointer flex items-center gap-1 font-mono"
              >
                <span>⚡ Buat Password Acak Kuat</span>
              </button>
            </div>

            <div class="relative">
              <input
                v-model="userForm.password"
                :type="showModalPassword ? 'text' : 'password'"
                placeholder="Masukkan atau buat otomatis..."
                class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-black text-zinc-900 outline-none focus:ring-2 focus:ring-red-500 bg-white"
              />
              <button
                type="button"
                @click="showModalPassword = !showModalPassword"
                class="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
              >
                {{ showModalPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>

            <!-- Password Strength Meter -->
            <div v-if="userForm.password" class="space-y-1.5 pt-1 animate-fade-in">
              <div class="flex justify-between items-center text-[11px]">
                <span class="font-bold text-zinc-600">Kekuatan Sandi:</span>
                <span :class="['px-2 py-0.2 rounded font-mono font-bold text-[10px]', pwdStrength.color]">
                  {{ pwdStrength.label }}
                </span>
              </div>
              <div class="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                <div
                  :style="{ width: `${pwdStrength.pct}%` }"
                  :class="['h-full transition-all duration-300', pwdStrength.color.split(' ')[0]]"
                ></div>
              </div>
              <p class="text-[10.5px] text-zinc-500 font-mono">{{ pwdStrength.feedback }}</p>
            </div>
          </div>

          <!-- Quick Preset Role Template -->
          <div class="space-y-2 pt-2 border-t border-zinc-100">
            <div class="flex items-center justify-between">
              <label class="font-bold text-zinc-800">
                ⚡ Template Hak Akses Cepat (Quick Preset):
              </label>
              <span class="text-[10.5px] text-zinc-400 font-mono">Pilih untuk centang otomatis</span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <button
                v-for="preset in ROLE_PRESETS"
                :key="preset.role"
                type="button"
                @click="applyRolePreset(preset.role)"
                :class="[
                  'p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1',
                  userForm.role === preset.role
                    ? 'bg-red-50 border-red-500 ring-2 ring-red-500/20 shadow-2xs'
                    : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100 text-zinc-700'
                ]"
              >
                <div class="font-black text-xs text-zinc-900">{{ preset.title }}</div>
                <div class="text-[10px] text-zinc-500 line-clamp-2 leading-tight">{{ preset.description }}</div>
              </button>
            </div>
          </div>

          <!-- Granular Permission Checklist Table -->
          <div class="space-y-2 pt-2 border-t border-zinc-100">
            <div class="flex items-center justify-between">
              <div>
                <label class="font-bold text-zinc-900">📋 Rincian Hak Akses per Menu:</label>
                <p class="text-[10.5px] text-zinc-500">Centang menu yang boleh dibuka, dan apakah memiliki hak ubah/edit data.</p>
              </div>
              <div class="flex items-center gap-1.5 text-[10.5px]">
                <button
                  type="button"
                  @click="selectAllPermissions(true)"
                  class="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold transition-colors cursor-pointer"
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  @click="selectAllPermissions(false)"
                  class="px-2 py-0.5 rounded bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-bold transition-colors cursor-pointer"
                >
                  Lepas Semua
                </button>
              </div>
            </div>

            <div class="border border-zinc-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto">
              <table class="w-full text-left text-xs border-collapse">
                <thead class="bg-zinc-50 sticky top-0 border-b border-zinc-200 text-[10px] uppercase font-mono text-zinc-500">
                  <tr>
                    <th class="py-2 px-3">Menu Aplikasi</th>
                    <th class="py-2 px-3 text-center w-28">Akses (Lihat)</th>
                    <th class="py-2 px-3 text-center w-28">Izin Edit</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-zinc-100">
                  <tr
                    v-for="menu in APP_MENUS"
                    :key="menu.key"
                    class="hover:bg-zinc-50/60"
                  >
                    <td class="py-2 px-3">
                      <div class="flex items-center gap-2">
                        <span>{{ menu.icon }}</span>
                        <div>
                          <div class="font-bold text-zinc-800">{{ menu.name }}</div>
                          <div class="text-[10px] text-zinc-400 font-mono">{{ menu.category }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Checkbox View -->
                    <td class="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        v-model="userForm.permissions[menu.key].view"
                        @change="handleViewPermissionChange(menu.key)"
                        class="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </td>

                    <!-- Checkbox Edit -->
                    <td class="py-2 px-3 text-center">
                      <input
                        type="checkbox"
                        v-model="userForm.permissions[menu.key].edit"
                        :disabled="!userForm.permissions[menu.key].view"
                        class="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Error Feedback Banner -->
          <div v-if="modalError" class="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
            <span>⚠️</span>
            <span>{{ modalError }}</span>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="flex items-center justify-end gap-2 border-t border-zinc-100 pt-4">
          <button
            type="button"
            @click="showUserModal = false"
            class="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 font-bold text-zinc-700 text-xs transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            @click="saveUser"
            :disabled="isSaving"
            class="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-black text-white text-xs uppercase tracking-wider font-mono shadow-md shadow-red-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {{ isSaving ? 'Menyimpan...' : (isEditing ? 'SIMPAN PERUBAHAN' : 'BUAT PENGGUNA BARU') }}
          </button>
        </div>

      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: RESET PASSWORD KHUSUS PENGGUNA (BY ADMIN) -->
    <!-- ========================================================================= -->
    <div
      v-if="showPwdModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-white rounded-3xl max-w-md w-full p-6 border border-zinc-200 shadow-2xl space-y-4 text-xs">
        <div class="flex items-center justify-between border-b border-zinc-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🔑</span>
            <div>
              <h3 class="text-sm font-black text-zinc-900">Ubah Kata Sandi Pengguna</h3>
              <p class="text-[11px] text-zinc-500 font-mono">{{ targetUser?.name }} (@{{ targetUser?.username }})</p>
            </div>
          </div>
          <button @click="showPwdModal = false" class="text-zinc-400 hover:text-zinc-800 cursor-pointer">✕</button>
        </div>

        <div class="space-y-3">
          <div class="flex items-center justify-between">
            <label class="font-bold text-zinc-700">Kata Sandi Baru</label>
            <button
              @click="targetNewPassword = generateRandomPassword(12)"
              type="button"
              class="text-[10.5px] font-bold text-red-600 hover:text-red-700 font-mono"
            >
              ⚡ Auto Generate
            </button>
          </div>
          <input
            v-model="targetNewPassword"
            type="text"
            placeholder="Minimal 6 karakter"
            class="w-full px-3.5 py-2.5 rounded-xl border border-zinc-300 font-mono text-sm font-bold text-zinc-900 outline-none focus:ring-2 focus:ring-red-500"
          />

          <!-- Quick strength -->
          <div v-if="targetNewPassword" class="space-y-1">
            <div class="flex justify-between items-center text-[10.5px]">
              <span class="font-bold text-zinc-600">Kekuatan:</span>
              <span class="font-mono font-bold">{{ evaluatePasswordStrength(targetNewPassword).label }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3">
          <button
            @click="showPwdModal = false"
            class="px-3 py-1.5 rounded-xl bg-zinc-100 text-zinc-700 font-bold"
          >
            Batal
          </button>
          <button
            @click="commitResetPassword"
            class="px-4 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-black font-mono uppercase text-xs"
          >
            Ubah Sandi
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useUserStore } from '@/stores/userStore';
import { useAuthStore } from '@/stores/authStore';
import {
  APP_MENUS,
  ROLE_PRESETS,
  DEFAULT_SUPER_ADMIN,
  generatePresetPermissions,
  generateRandomPassword,
  evaluatePasswordStrength
} from '@/services/authService';

const userStore = useUserStore();
const authStore = useAuthStore();

const searchQuery = ref('');
const filterRole = ref('ALL');
const filterStatus = ref('ALL');

onMounted(async () => {
  await userStore.fetchUsers();
});

// Filtered Users List
const filteredUsers = computed(() => {
  return userStore.users.filter(u => {
    // Search query
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase().trim();
      const matchName = (u.name || '').toLowerCase().includes(q);
      const matchUser = (u.username || '').toLowerCase().includes(q);
      const matchEmail = (u.email || '').toLowerCase().includes(q);
      if (!matchName && !matchUser && !matchEmail) return false;
    }

    // Filter Role
    if (filterRole.value !== 'ALL' && u.role !== filterRole.value) {
      return false;
    }

    // Filter Status
    if (filterStatus.value === 'ACTIVE' && !u.active) return false;
    if (filterStatus.value === 'INACTIVE' && u.active) return false;

    return true;
  });
});

// Helpers
const getRoleTitle = (role) => {
  const p = ROLE_PRESETS.find(r => r.role === role);
  return p ? p.title.split(' (')[0] : role;
};

const getRoleBadgeClass = (role) => {
  const p = ROLE_PRESETS.find(r => r.role === role);
  return p ? p.badgeColor : 'bg-zinc-800 text-white';
};

const getPermissionsSummary = (user) => {
  if (user.role === 'SUPER_ADMIN') return 'Semua Menu (Full Edit)';
  const perms = user.permissions || {};
  const activeKeys = Object.keys(perms).filter(k => perms[k]?.view);
  const editKeys = Object.keys(perms).filter(k => perms[k]?.edit);
  return `${activeKeys.length} Menu (${editKeys.length} Edit)`;
};

const formatDateTime = (iso) => {
  if (!iso) return 'Belum pernah';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

// Modal State
const showUserModal = ref(false);
const isEditing = ref(false);
const editingUserId = ref(null);
const showModalPassword = ref(false);
const modalError = ref('');
const isSaving = ref(false);

const userForm = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
  role: 'OPERATOR',
  permissions: {}
});

// Password strength for userForm.password
const pwdStrength = computed(() => {
  return evaluatePasswordStrength(userForm.password);
});

const autoGeneratePassword = () => {
  const pwd = generateRandomPassword(12);
  userForm.password = pwd;
  showModalPassword.value = true;
};

const openAddModal = () => {
  isEditing.value = false;
  editingUserId.value = null;
  modalError.value = '';
  showModalPassword.value = false;

  userForm.name = '';
  userForm.username = '';
  userForm.email = '';
  userForm.password = generateRandomPassword(12);
  userForm.role = 'OPERATOR';
  userForm.permissions = generatePresetPermissions('OPERATOR');

  showUserModal.value = true;
};

const openEditModal = (user) => {
  isEditing.value = true;
  editingUserId.value = user.id;
  modalError.value = '';
  showModalPassword.value = false;

  userForm.name = user.name;
  userForm.username = user.username;
  userForm.email = user.email;
  userForm.password = '';
  userForm.role = user.role;

  // Initialize permissions deep clone
  const userPerms = typeof user.permissionsJson === 'string'
    ? JSON.parse(user.permissionsJson)
    : (user.permissions || {});

  const fullPerms = {};
  APP_MENUS.forEach(m => {
    fullPerms[m.key] = {
      view: !!userPerms[m.key]?.view,
      edit: !!userPerms[m.key]?.edit
    };
  });

  userForm.permissions = fullPerms;
  showUserModal.value = true;
};

const applyRolePreset = (role) => {
  userForm.role = role;
  if (role !== 'CUSTOM') {
    userForm.permissions = generatePresetPermissions(role);
  }
};

const handleViewPermissionChange = (menuKey) => {
  if (!userForm.permissions[menuKey].view) {
    userForm.permissions[menuKey].edit = false;
  }
  userForm.role = 'CUSTOM';
};

const selectAllPermissions = (enable) => {
  APP_MENUS.forEach(m => {
    userForm.permissions[m.key].view = enable;
    userForm.permissions[m.key].edit = enable;
  });
  userForm.role = enable ? 'SUPER_ADMIN' : 'CUSTOM';
};

const saveUser = async () => {
  modalError.value = '';
  isSaving.value = true;

  try {
    if (isEditing.value) {
      await userStore.updateUser(editingUserId.value, {
        name: userForm.name,
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        permissions: userForm.permissions
      });
    } else {
      await userStore.createUser({
        name: userForm.name,
        username: userForm.username,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role,
        permissions: userForm.permissions
      });
    }
    showUserModal.value = false;
  } catch (err) {
    modalError.value = err.message || 'Gagal menyimpan data pengguna.';
  } finally {
    isSaving.value = false;
  }
};

const handleToggleStatus = async (user) => {
  try {
    await userStore.toggleUserStatus(user.id);
  } catch (err) {
    alert(err.message);
  }
};

const handleDeleteUser = async (user) => {
  if (confirm(`Yakin ingin menghapus pengguna "${user.name} (@${user.username})"? Tindakan ini permanen.`)) {
    try {
      await userStore.deleteUser(user.id);
    } catch (err) {
      alert(err.message);
    }
  }
};

// Reset Password directly by Admin
const showPwdModal = ref(false);
const targetUser = ref(null);
const targetNewPassword = ref('');

const openPasswordModal = (user) => {
  targetUser.value = user;
  targetNewPassword.value = generateRandomPassword(12);
  showPwdModal.value = true;
};

const commitResetPassword = async () => {
  if (!targetUser.value || !targetNewPassword.value) return;
  try {
    await userStore.resetUserPassword(targetUser.value.id, targetNewPassword.value);
    alert(`Kata sandi untuk @${targetUser.value.username} berhasil diubah menjadi:\n${targetNewPassword.value}`);
    showPwdModal.value = false;
  } catch (err) {
    alert(err.message);
  }
};
</script>
