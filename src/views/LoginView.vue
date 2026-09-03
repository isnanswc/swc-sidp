<template>
  <div 
    class="min-h-screen w-full bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden font-sans select-none"
    @mousemove="handleContainerMouseMove"
    @mouseleave="handleContainerMouseLeave"
  >
    <!-- Background Technical Grid & Soft Ambient Lighting -->
    <div class="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none"></div>
    <div class="absolute -top-40 -left-40 w-96 h-96 bg-red-500/5 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Main Container Card (Dominant White Clean Luxury Style) -->
    <div class="w-full max-w-5xl bg-white border border-slate-200/90 rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.07)] overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10">
      
      <!-- ========================================================================= -->
      <!-- LEFT HERO PANEL (INTERACTIVE 3D PARALLAX FILM CYLINDER MODEL) -->
      <!-- ========================================================================= -->
      <div class="lg:col-span-6 bg-gradient-to-br from-white via-slate-50 to-slate-100/80 p-8 sm:p-12 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-200/80 relative overflow-hidden">
        
        <!-- Soft Radial Glow on Left -->
        <div class="absolute -top-10 -right-10 w-48 h-48 bg-red-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <!-- Top Branding -->
        <div class="space-y-6 relative z-10">
          <div class="flex items-center gap-3.5">
            <!-- Official SWC Logo Badge -->
            <div class="bg-white px-3.5 py-1.5 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center justify-center">
              <span class="font-black text-red-600 text-2xl leading-none tracking-tighter" style="font-family: 'Arial Black', Impact, sans-serif;">
                SWC
              </span>
              <span class="text-[7.5px] font-black text-slate-800 leading-tight tracking-tight uppercase mt-0.5">
                Rotogravure
              </span>
            </div>

            <div>
              <h1 class="text-base font-black text-slate-900 uppercase tracking-wider leading-tight">
                PT. SAPTAWARNA CEMERLANG
              </h1>
              <p class="text-xs font-medium text-slate-500 tracking-tight">
                Flexible Packaging Industrial Plant
              </p>
            </div>
          </div>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-mono font-bold shadow-2xs">
            <span class="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
            <span>M-LABEL INDUSTRIAL PORTAL v2.0</span>
          </div>
        </div>

        <!-- Center 3D Interactive Parallax Stage -->
        <div 
          class="my-8 sm:my-10 flex flex-col items-center justify-center relative perspective-container"
        >
          <!-- 3D Transform Object responding to Mouse Move -->
          <div 
            class="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center transition-transform duration-200 ease-out"
            :style="parallaxCardStyle"
          >
            <!-- Outer Machine Ring -->
            <div class="absolute inset-0 rounded-full border border-dashed border-slate-300 animate-[spin_25s_linear_infinite]"></div>
            
            <!-- Secondary Technical Orbital Ring -->
            <div class="absolute inset-4 rounded-full border border-red-300/40 animate-[spin_16s_linear_infinite_reverse]"></div>

            <!-- Soft Backlight Halo -->
            <div class="absolute inset-8 rounded-full bg-gradient-to-tr from-red-100 to-slate-100 blur-xl opacity-70"></div>

            <!-- 3D Geometric Isometric Roll SVG -->
            <svg class="w-40 h-40 sm:w-44 sm:h-44 relative z-10 drop-shadow-md" viewBox="0 0 160 160" fill="none">
              <!-- Shadow base -->
              <ellipse cx="80" cy="125" rx="55" ry="16" fill="#cbd5e1" fill-opacity="0.4" />

              <!-- Outer Roll Cylinder Body -->
              <ellipse cx="80" cy="50" rx="46" ry="20" fill="url(#rollTopGrad)" stroke="#94a3b8" stroke-width="1.5" />
              <path d="M34 50v55c0 11 20.6 20 46 20s46-9 46-20V50" fill="url(#rollBodyGrad)" stroke="#94a3b8" stroke-width="1.5" />

              <!-- Core Tube (Inner 3" / 6" Paper Core) -->
              <ellipse cx="80" cy="50" rx="20" ry="9" fill="#334155" stroke="#64748b" stroke-width="1.5" />
              <ellipse cx="80" cy="50" rx="10" ry="4.5" fill="#0f172a" />

              <!-- Laser Alignment Crosshairs -->
              <line x1="80" y1="12" x2="80" y2="28" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
              <line x1="80" y1="132" x2="80" y2="148" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
              <line x1="12" y1="80" x2="28" y2="80" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />
              <line x1="132" y1="80" x2="148" y2="80" stroke="#ef4444" stroke-width="2" stroke-linecap="round" />

              <!-- Precision Rotating Dash Outer Web -->
              <circle cx="80" cy="80" r="70" stroke="#cbd5e1" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="10 8" class="animate-[spin_30s_linear_infinite]" />

              <!-- Gradients Definition -->
              <defs>
                <linearGradient id="rollTopGrad" x1="34" y1="50" x2="126" y2="50" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#ffffff" />
                  <stop offset="0.5" stop-color="#f1f5f9" />
                  <stop offset="1" stop-color="#e2e8f0" />
                </linearGradient>
                <linearGradient id="rollBodyGrad" x1="34" y1="50" x2="126" y2="125" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#f8fafc" />
                  <stop offset="0.25" stop-color="#e2e8f0" />
                  <stop offset="0.7" stop-color="#cbd5e1" />
                  <stop offset="1" stop-color="#94a3b8" />
                </linearGradient>
              </defs>
            </svg>

            <!-- Floating 3D Depth Metric Pill 1 (Top Left) -->
            <div 
              class="absolute -top-1 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md rounded-xl px-2.5 py-1 text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1.5 transition-transform duration-300 pointer-events-none"
              :style="parallaxTagStyle1"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              <span>Speed: <strong>600 m/m</strong></span>
            </div>

            <!-- Floating 3D Depth Metric Pill 2 (Bottom Right) -->
            <div 
              class="absolute -bottom-2 -right-2 sm:-right-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md rounded-xl px-2.5 py-1 text-[10px] font-mono font-bold text-slate-700 flex items-center gap-1.5 transition-transform duration-300 pointer-events-none"
              :style="parallaxTagStyle2"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>Film: <strong>20μ VMCPP</strong></span>
            </div>
          </div>

          <div class="text-center mt-4 space-y-0.5">
            <div class="text-xs font-mono font-black tracking-widest text-slate-800 uppercase">
              HIGH PRECISION FILM CONVERTING
            </div>
            <p class="text-[11px] text-slate-500 font-medium">Slitting • Rewind • Casting • Metallizing</p>
          </div>
        </div>

        <!-- Bottom Plant Badges -->
        <div class="border-t border-slate-200/80 pt-4 flex items-center justify-between text-[11px] text-slate-500 font-mono">
          <div class="flex items-center gap-1.5">
            <span class="text-red-600">🔒</span>
            <span>Enterprise Security</span>
          </div>
          <div class="flex items-center gap-1.5">
            <span class="text-emerald-600">●</span>
            <span>Industrial Offline Ready</span>
          </div>
        </div>
      </div>

      <!-- ========================================================================= -->
      <!-- RIGHT PANEL (LOGIN FORM - CLEAN WHITE WITH SOFT ENTERPRISE ACCENTS) -->
      <!-- ========================================================================= -->
      <div class="lg:col-span-6 bg-white p-8 sm:p-12 flex flex-col justify-between">
        
        <div class="space-y-6">
          <!-- Form Header -->
          <div>
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-mono font-bold text-red-600 tracking-wider uppercase">AUTHENTICATION</span>
              <span class="text-[11px] font-mono text-slate-400">Portal Keamanan</span>
            </div>
            <h2 class="text-2xl font-black text-slate-900 tracking-tight">
              Masuk ke Sistem
            </h2>
            <p class="text-xs text-slate-500 mt-1">
              Gunakan kredensial akun Anda untuk mengakses sistem manajemen produksi.
            </p>
          </div>

          <!-- Error Alert Banner -->
          <div
            v-if="errorMessage"
            class="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-start gap-3 animate-fade-in"
          >
            <span class="text-base text-red-500 shrink-0">⚠️</span>
            <div class="leading-relaxed font-medium">{{ errorMessage }}</div>
          </div>

          <!-- Login Form Fields -->
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Username / Email Field -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 font-mono tracking-tight">
                USERNAME ATAU EMAIL
              </label>
              <div class="relative">
                <span class="absolute left-3.5 top-3 text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </span>
                <input
                  v-model="loginForm.identifier"
                  type="text"
                  required
                  autocomplete="username"
                  placeholder="Masukkan username atau email"
                  class="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-4 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                />
              </div>
            </div>

            <!-- Password Field -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-xs font-bold text-slate-700 font-mono tracking-tight">
                  KATA SANDI (PASSWORD)
                </label>
                <button
                  type="button"
                  @click="openResetModal"
                  class="text-[11px] font-bold text-red-600 hover:text-red-700 transition-colors cursor-pointer"
                >
                  Lupa Kata Sandi?
                </button>
              </div>
              <div class="relative">
                <span class="absolute left-3.5 top-3 text-slate-400">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0110 0v4" />
                  </svg>
                </span>
                <input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  autocomplete="current-password"
                  placeholder="Masukkan kata sandi"
                  class="w-full bg-slate-50/70 border border-slate-200 text-slate-900 rounded-xl pl-10 pr-10 py-2.5 text-xs sm:text-sm font-mono focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
                />
                <!-- Show/Hide Toggle -->
                <button
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer text-xs"
                  title="Lihat/Sembunyikan Password"
                >
                  <span v-if="showPassword">👁️</span>
                  <span v-else>👁️‍🗨️</span>
                </button>
              </div>
            </div>

            <!-- Remember Me -->
            <div class="flex items-center justify-between text-xs pt-1">
              <label class="flex items-center gap-2 cursor-pointer text-slate-600 hover:text-slate-900">
                <input
                  v-model="loginForm.remember"
                  type="checkbox"
                  class="rounded bg-slate-100 border-slate-300 text-red-600 focus:ring-0 cursor-pointer"
                />
                <span>Ingat Sesi di Perangkat Ini</span>
              </label>
            </div>

            <!-- Submit Button (High-Tech Red Button) -->
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-black text-xs sm:text-sm tracking-wider uppercase font-mono shadow-lg shadow-red-600/25 hover:shadow-red-600/40 transition-all cursor-pointer flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              <svg v-if="isLoading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>🔒</span>
              <span>{{ isLoading ? 'MEMVERIFIKASI...' : 'MASUK KE SISTEM' }}</span>
            </button>
          </form>
        </div>

        <!-- Footer Notice -->
        <div class="text-center text-[11px] text-slate-400 font-mono mt-8 border-t border-slate-100 pt-4">
          © 2026 PT. Saptawarna Cemerlang — All Rights Reserved
        </div>
      </div>

    </div>

    <!-- ========================================================================= -->
    <!-- MODAL: PEMULIHAN PASSWORD & VERIFIKASI OTP -->
    <!-- ========================================================================= -->
    <div
      v-if="showResetModal"
      class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
      @click.self="showResetModal = false"
    >
      <div class="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-fade-in">
        <div class="flex items-center justify-between border-b border-slate-100 pb-3">
          <div class="flex items-center gap-2">
            <span class="text-lg">🔑</span>
            <h3 class="font-black text-sm text-slate-900 font-mono">Pemulihan Kata Sandi</h3>
          </div>
          <button
            @click="showResetModal = false"
            class="text-slate-400 hover:text-slate-700 text-xs font-bold cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div v-if="resetError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs">
          {{ resetError }}
        </div>

        <!-- Step 1: Input Email -->
        <div v-if="resetStep === 1" class="space-y-4">
          <p class="text-xs text-slate-600 leading-relaxed">
            Masukkan alamat email akun Super Admin Anda. Sistem akan memverifikasi dan mengirimkan kode OTP satu kali pakai.
          </p>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 font-mono">Email Terdaftar</label>
            <input
              v-model="resetEmailInput"
              type="email"
              required
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:border-red-500 focus:bg-white outline-none"
              placeholder="nama@email.com"
            />
          </div>
          <button
            @click="handleSendOtp"
            :disabled="isResetting || !resetEmailInput"
            class="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold font-mono tracking-wider uppercase text-xs text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ isResetting ? 'Mengirim...' : 'KIRIM KODE OTP' }}
          </button>
        </div>

        <!-- Step 2: Input OTP & New Password -->
        <div v-else-if="resetStep === 2" class="space-y-4">
          <div class="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
            <p>Kode OTP telah dikirimkan ke: <strong>{{ resetMaskedEmail }}</strong></p>
            <p v-if="demoOtpCode" class="font-mono font-bold text-[11px] text-emerald-800">
              [Kode Verifikasi: {{ demoOtpCode }}]
            </p>
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 font-mono">Kode OTP (6 Digit)</label>
            <input
              v-model="resetOtpInput"
              maxlength="6"
              class="w-full px-3 py-2 text-center tracking-widest text-base font-black bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:border-red-500 focus:bg-white outline-none uppercase"
              placeholder="123456"
            />
          </div>
          <div>
            <label class="block text-xs font-bold text-slate-700 mb-1 font-mono">Kata Sandi Baru</label>
            <input
              v-model="resetNewPassword"
              type="password"
              class="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-mono focus:border-red-500 focus:bg-white outline-none"
              placeholder="Minimal 8 karakter (kombinasi huruf & angka)"
            />
          </div>
          <button
            @click="handleVerifyAndReset"
            :disabled="isResetting || !resetOtpInput || !resetNewPassword"
            class="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 font-bold font-mono tracking-wider uppercase text-xs text-white transition-colors cursor-pointer disabled:opacity-50"
          >
            {{ isResetting ? 'Menyimpan...' : 'SIMPAN KATA SANDI BARU' }}
          </button>
        </div>

        <!-- Step 3: Success -->
        <div v-else-if="resetStep === 3" class="space-y-4 text-center py-2">
          <div class="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto font-black">
            ✓
          </div>
          <div class="space-y-1">
            <h4 class="font-bold text-base text-slate-900 font-mono">Kata Sandi Berhasil Diperbarui!</h4>
            <p class="text-xs text-slate-500">Silakan login kembali dengan kredensial baru Anda.</p>
          </div>
          <button
            @click="showResetModal = false; resetStep = 1"
            class="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold font-mono text-xs cursor-pointer"
          >
            Tutup & Kembali ke Login
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
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

// 3D Parallax Mouse Tracking State
const mouseX = ref(0);
const mouseY = ref(0);

const handleContainerMouseMove = (e) => {
  const { clientX, clientY } = e;
  const { innerWidth, innerHeight } = window;
  // Calculate relative offset between -1 and 1
  mouseX.value = (clientX / innerWidth - 0.5) * 2;
  mouseY.value = (clientY / innerHeight - 0.5) * 2;
};

const handleContainerMouseLeave = () => {
  mouseX.value = 0;
  mouseY.value = 0;
};

const parallaxCardStyle = computed(() => {
  const tiltX = -mouseY.value * 12; // tilt degrees
  const tiltY = mouseX.value * 15;
  return {
    transform: `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg)`
  };
});

const parallaxTagStyle1 = computed(() => {
  const transX = mouseX.value * 8;
  const transY = mouseY.value * 8;
  return {
    transform: `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 35px)`
  };
});

const parallaxTagStyle2 = computed(() => {
  const transX = -mouseX.value * 10;
  const transY = -mouseY.value * 10;
  return {
    transform: `translate3d(${transX.toFixed(1)}px, ${transY.toFixed(1)}px, 45px)`
  };
});

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

const handleLogin = async () => {
  errorMessage.value = '';
  isLoading.value = true;
  try {
    await authStore.login(loginForm.identifier, loginForm.password);
    router.push('/');
  } catch (err) {
    errorMessage.value = err.message || 'Gagal login. Silakan periksa kembali username dan kata sandi Anda.';
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
.perspective-container {
  perspective: 1200px;
}
</style>
