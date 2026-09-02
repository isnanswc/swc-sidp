<template>
  <div class="min-h-screen w-full bg-zinc-950 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none">
    
    <!-- Background Technical Grid & Ambient Lighting -->
    <div class="absolute inset-0 bg-[radial-gradient(#27272a_1px,transparent_1px)] [background-size:24px_24px] opacity-25 pointer-events-none"></div>
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Main Container Card (Split Screen Style) -->
    <div class="w-full max-w-5xl bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
      
      <!-- ========================================================================= -->
      <!-- LEFT HERO PANEL (INDUSTRIAL BRAND & ANIMATION) -->
      <!-- ========================================================================= -->
      <div class="lg:col-span-6 bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-zinc-800 relative overflow-hidden">
        <!-- Floating Red Light Accent -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Top Branding -->
        <div class="space-y-6">
          <div class="flex items-center gap-3.5">
            <!-- Official SWC Logo Badge -->
            <div class="bg-white px-3.5 py-1.5 rounded-2xl shadow-lg border border-zinc-200 flex flex-col items-center justify-center">
              <span class="font-black text-red-600 text-2xl leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
                SWC
              </span>
              <span class="text-[7.5px] font-black text-black leading-tight tracking-tight uppercase mt-0.5">
                Rotogravure
              </span>
            </div>

            <div>
              <h1 class="text-base font-black text-white uppercase tracking-wider leading-tight">
                PT. SAPTAWARNA CEMERLANG
              </h1>
              <p class="text-xs font-semibold text-zinc-400 tracking-tight">
                Flexible Packaging Industrial Plant
              </p>
            </div>
          </div>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-950/60 border border-red-800/60 text-red-400 text-xs font-mono font-bold">
            <span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            <span>M-LABEL PRODUCTION PORTAL v2.0</span>
          </div>
        </div>

        <!-- Center Industrial Illustration (Animated Rotating Film Roll Cylinder) -->
        <div class="my-8 sm:my-10 flex flex-col items-center justify-center relative">
          <div class="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            
            <!-- Outer Machine Ring -->
            <div class="absolute inset-0 rounded-full border-2 border-dashed border-zinc-700/60 animate-[spin_20s_linear_infinite]"></div>
            
            <!-- Inner Red Laser Calibration Circle -->
            <div class="absolute inset-3 rounded-full border border-red-600/40 animate-[spin_12s_linear_infinite_reverse]"></div>
            
            <!-- Core Roll SVG Graphic -->
            <svg class="w-32 h-32 sm:w-36 sm:h-36 relative z-10" viewBox="0 0 120 120" fill="none">
              <!-- Outer Film Roll Layer -->
              <circle cx="60" cy="60" r="54" stroke="#ffffff" stroke-width="4" stroke-linecap="round" stroke-dasharray="12 6" class="animate-[spin_15s_linear_infinite]" />
              
              <!-- Red Winding Layer -->
              <circle cx="60" cy="60" r="42" fill="#dc2626" fill-opacity="0.15" stroke="#ef4444" stroke-width="3" />
              
              <!-- Inner Core 3" / 6" -->
              <circle cx="60" cy="60" r="26" fill="#18181b" stroke="#71717a" stroke-width="3" />
              <circle cx="60" cy="60" r="10" fill="#3f3f46" stroke="#ef4444" stroke-width="2" />
              
              <!-- Crosshair Center Laser -->
              <line x1="60" y1="20" x2="60" y2="40" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
              <line x1="60" y1="80" x2="60" y2="100" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
              <line x1="20" y1="60" x2="40" y2="60" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
              <line x1="80" y1="60" x2="100" y2="60" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
            </svg>

            <!-- Center Pulsing Light -->
            <div class="w-3 h-3 rounded-full bg-red-500 absolute z-20 shadow-[0_0_15px_#ef4444] animate-ping"></div>
          </div>

          <div class="text-center mt-3 space-y-0.5">
            <div class="text-xs font-mono font-bold tracking-widest text-zinc-300 uppercase">
              HIGH PRECISION FILM CONVERTING
            </div>
            <p class="text-[11px] text-zinc-500 font-mono">Slitting • Rewind • Casting • Metallizing</p>
          </div>
        </div>

        <!-- Bottom Plant Badges -->
        <div class="border-t border-zinc-800/80 pt-4 flex items-center justify-between text-[11px] text-zinc-400 font-mono">
          <div class="flex items-center gap-1.5">
            <span class="text-red-500">🔒</span>
            <span>RBAC Protected</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-emerald-500">●</span>
            <span>Industrial Offline Ready</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- RIGHT PANEL (LOGIN FORM) -->
      <!-- ========================================================================= -->
      <div class="lg:col-span-6 bg-zinc-900 p-8 sm:p-12 flex flex-col justify-between">
        
        <div class="space-y-6">
          <!-- Form Header -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-red-500 tracking-wider uppercase">AUTHENTICATION</span>
              <span class="text-[11px] font-mono text-zinc-500">Plant Security</span>
            </div>
            <h2 class="text-2xl font-black text-white tracking-tight">
              Masuk ke Sistem
            </h2>
            <p class="text-xs text-zinc-400 mt-1">
              Gunakan akun terdaftar Anda untuk mengakses lembar kerja dan label.
            </p>
          </div>

          <!-- Error Alert Banner -->
          <div
            v-if="errorMessage"
            class="p-3.5 rounded-2xl bg-red-950/70 border border-red-800/80 text-red-200 text-xs flex items-start gap-3 animate-fade-in"
          >
            <span class="text-base text-red-400 shrink-0">⚠️</span>
            <div class="leading-relaxed">{{ errorMessage }}</div>
          </div>

          <!-- Login Form Fields -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username / Email Field -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-zinc-300 font-mono">
                USERNAME ATAU EMAIL
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3 text-zinc-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  v-model="loginForm.identifier"
                  type="text"
                  required
                  autocomplete="username"
                  placeholder="Contoh: admin atau isnanswc@gmail.com"
                  class="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-zinc-600"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-zinc-300 font-mono">
                  KATA SANDI (PASSWORD)
                </label>
                <button
                  type="button"
                  @click="openResetModal"
                  class="text-[11px] font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
              <div class="relative">
                <span class="absolute left-3.5 top-3 text-zinc-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan kata sandi akun"
                  class="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-mono focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all placeholder:text-zinc-600"
                />
                <!-- Show/Hide Toggle -->
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-2.5 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                  title="Lihat/Sembunyikan Password"
                >
                  <span v-if="showPassword">👁️</span>
                  <span v-else>👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-zinc-400 hover:text-zinc-300">
                <input
                  v-model="loginForm.remember"
                  type="checkbox"
                  class="rounded bg-zinc-950 border-zinc-700 text-red-600 focus:ring-0 cursor-pointer"
                />
                <span>Ingat Sesi di Perangkat Ini</span>
              </label>
            </div>

            <!-- Submit Button (High-Tech Red Button) -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase font-mono shadow-lg shadow-red-600/30 hover:shadow-red-600/50 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>🔒</span>
              <span>{{ isLoading ? 'MEMVERIFIKASI...' : 'MASUK KE SISTEM' }}</span>
            </button>
          </form>

          <!-- Default Super Admin Helper Box -->
          <div class="bg-zinc-950 border border-zinc-800 rounded-2xl p-3.5 space-y-1.5 text-xs text-zinc-400 font-mono">
            <div class="flex items-center justify-between font-bold text-zinc-300">
              <span class="flex items-center gap-1.5 text-red-400">
                <span>🔑</span>
                <span>Akun Utama (Super Admin):</span>
              </span>
              <button
                type="button"
                @click="fillDefaultAdmin"
                class="text-[10.5px] px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-white transition-colors cursor-pointer"
              >
                Isi Otomatis
              </button>
            </div>
            <p class="text-[11px]">
              Email: <strong class="text-white">isnanswc@gmail.com</strong> (user: <strong class="text-white">admin</strong>)
            </p>
            <p class="text-[10px] text-zinc-500">
              Kata sandi default: <code class="text-zinc-300">Admin@SWC2026!</code> (dapat diubah setelah login).
            </p>
          </div>
        </div>

        <!-- Footer Notice -->
        <div class="text-center text-[10px] text-zinc-500 font-mono mt-6">
          © 2026 PT. Saptawarna Cemerlang — All Rights Reserved
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: PEMULIHAN PASSWORD & VERIFIKASI OTP (EMAIL ISNANSWC@GMAIL.COM) -->
    <!-- ========================================================================= -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
    >
      <div class="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 max-w-md w-full text-white shadow-2xl space-y-5">
        <div class="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-xl">🛡️</span>
            <div>
              <h3 class="text-sm font-black uppercase font-mono">Verifikasi Pemulihan Kata Sandi</h3>
              <p class="text-[11px] text-zinc-400">Keamanan Akun Super Admin & Pengguna</p>
            </div>
          </div>
          <button
            @click="showResetModal = false"
            class="text-zinc-400 hover:text-white p-1 cursor-pointer rounded-lg hover:bg-zinc-800 transition-colors"
          >
            ✕
          </button>
        </div>

        <!-- Step 1: Request OTP -->
        <div v-if="resetStep === 1" class="space-y-4 text-xs">
          <p class="text-zinc-300 leading-relaxed">
            Masukkan alamat email akun Super Admin (<strong class="text-white">isnanswc@gmail.com</strong>) atau akun Anda untuk menerima kode verifikasi OTP.
          </p>

          <div class="space-y-1.5">
            <label class="font-bold text-zinc-400 font-mono">ALAMAT EMAIL TERDAFTAR</label>
            <input
              v-model="resetEmailInput"
              type="email"
              placeholder="isnanswc@gmail.com"
              class="w-full bg-zinc-950 border border-zinc-700 text-white rounded-xl px-3.5 py-2.5 font-mono text-sm outline-none focus:border-red-500"
            />
          </div>

          <div v-if="resetError" class="text-red-400 text-xs bg-red-950/60 p-2.5 rounded-xl border border-red-800">
            {{ resetError }}
          </div>

          <button
            @click="handleSendOtp"
            :disabled="isResetting"
            class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-black font-mono tracking-wider uppercase text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ isResetting ? 'Mengirim Kode...' : 'KIRIM KODE VERIFIKASI OTP' }}
          </button>
        </div>

        <!-- Step 2: Verify OTP & Input New Password -->
        <div v-else-if="resetStep === 2" class="space-y-4 text-xs">
          <div class="p-3 bg-red-950/40 border border-red-900/60 rounded-xl space-y-1">
            <div class="font-bold text-red-300 flex items-center gap-1.5">
              <span>📧</span>
              <span>Kode Verifikasi Terkirim ke:</span>
            </div>
            <div class="font-mono text-white text-xs font-bold">{{ resetMaskedEmail }}</div>
            <p class="text-[10.5px] text-zinc-400">
              Periksa kotak masuk email Anda. (Mode demo lokal kode: <strong class="text-amber-400 font-mono">{{ demoOtpCode }}</strong>)
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="font-bold text-zinc-400 font-mono">KODE OTP 6 DIGIT</label>
            <input
              v-model="resetOtpInput"
              type="text"
              maxlength="6"
              placeholder="Contoh: 123456"
              class="w-full bg-zinc-950 border border-zinc-700 text-white text-center font-mono text-lg font-black tracking-widest rounded-xl py-2 outline-none focus:border-red-500"
            />
          </div>

          <div class="space-y-1.5">
            <label class="font-bold text-zinc-400 font-mono">KATA SANDI BARU</label>
            <input
              v-model="resetNewPassword"
              type="password"
              placeholder="Minimal 6 karakter"
              class="w-full bg-zinc-950 border border-zinc-700 text-white font-mono text-sm rounded-xl px-3.5 py-2 outline-none focus:border-red-500"
            />
          </div>

          <div v-if="resetError" class="text-red-400 text-xs bg-red-950/60 p-2.5 rounded-xl border border-red-800">
            {{ resetError }}
          </div>

          <button
            @click="handleVerifyAndReset"
            :disabled="isResetting"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-black font-mono tracking-wider uppercase text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ isResetting ? 'Menyimpan...' : 'SIMPAN KATA SANDI BARU' }}
          </button>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="resetStep === 3" class="space-y-4 text-center py-2">
          <div class="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl mx-auto">
            ✓
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-base text-white font-mono">Kata Sandi Berhasil Diperbarui!</h4>
            <p class="text-xs text-zinc-400">Silakan login kembali dengan kredensial baru Anda.</p>
          </div>
          <button
            @click="showResetModal = false; resetStep = 1"
            class="px-5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 font-bold font-mono text-xs cursor-pointer"
          >
            Tutup & Kembali ke Login
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { DEFAULT_SUPER_ADMIN } from '@/services/authService';

const router = useRouter();
const authStore = useAuthStore();

const loginForm = reactive({
  identifier: '',
  password: '',
  remember: true
});

const showPassword = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');

// Password Reset Modal State
const showResetModal = ref(false);
const resetStep = ref(1); // 1: Email, 2: OTP, 3: Success
const resetEmailInput = ref(DEFAULT_SUPER_ADMIN.email);
const resetOtpInput = ref('');
const resetNewPassword = ref('');
const resetMaskedEmail = ref('');
const demoOtpCode = ref('');
const resetError = ref('');
const isResetting = ref(false);

const fillDefaultAdmin = () => {
  loginForm.identifier = DEFAULT_SUPER_ADMIN.username;
  loginForm.password = DEFAULT_SUPER_ADMIN.defaultPassword;
};

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await authStore.login(loginForm.identifier, loginForm.password);
    router.push('/');
  } catch (err) {
    errorMessage.value = err.message || 'Gagal login. Silakan coba lagi.';
  } finally {
    isLoading.value = false;
  }
};

const openResetModal = () => {
  resetStep.value = 1;
  resetError.value = '';
  resetOtpInput.value = '';
  resetNewPassword.value = '';
  resetEmailInput.value = DEFAULT_SUPER_ADMIN.email;
  showResetModal.value = true;
};

const handleSendOtp = async () => {
  resetError.value = '';
  isResetting.value = true;
  try {
    const res = await authStore.requestPasswordResetOtp(resetEmailInput.value);
    resetMaskedEmail.value = res.maskedEmail;
    demoOtpCode.value = res.otpCode;
    resetStep.value = 2;
  } catch (err) {
    resetError.value = err.message || 'Gagal mengirim kode verifikasi.';
  } finally {
    isResetting.value = false;
  }
};

const handleVerifyAndReset = async () => {
  resetError.value = '';
  isResetting.value = true;
  try {
    await authStore.verifyOtpAndResetPassword(
      resetEmailInput.value,
      resetOtpInput.value,
      resetNewPassword.value
    );
    resetStep.value = 3;
  } catch (err) {
    resetError.value = err.message || 'Verifikasi gagal.';
  } finally {
    isResetting.value = false;
  }
};
</script>

<style scoped>
@keyframes spinSlow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
