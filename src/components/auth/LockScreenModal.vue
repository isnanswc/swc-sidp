<template>
  <div
    v-if="authStore.isLocked"
    class="fixed inset-0 z-[9999] bg-zinc-950/95 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in"
    @keydown.stop
  >
    <!-- Background Industrial Watermark Pattern -->
    <div class="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:20px_20px]"></div>

    <!-- Main Lock Screen Card -->
    <div class="relative z-10 w-full max-w-sm sm:max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] text-center text-white space-y-6">
      
      <!-- Top Decorative Accent -->
      <div class="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-zinc-800 rounded-t-3xl"></div>

      <!-- Live Realtime Clock -->
      <div class="space-y-1 pt-1">
        <div class="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white">
          {{ currentTime }}
        </div>
        <div class="text-xs font-mono text-zinc-400 font-semibold uppercase tracking-wider">
          {{ currentDate }}
        </div>
      </div>

      <!-- User Identification Badge -->
      <div class="bg-zinc-950/70 border border-zinc-800/80 rounded-2xl p-4 flex items-center gap-3.5 text-left">
        <div
          :class="[
            'w-11 h-11 rounded-2xl font-black font-mono flex items-center justify-center text-base shrink-0 shadow-md',
            authStore.isSuperAdmin ? 'bg-red-600 text-white' : 'bg-zinc-800 text-white'
          ]"
        >
          {{ (authStore.currentUser?.name || 'U').charAt(0).toUpperCase() }}
        </div>
        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-1.5">
            <h3 class="font-black text-sm text-white truncate">
              {{ authStore.currentUser?.name || 'Pengguna' }}
            </h3>
            <span
              :class="[
                'text-[9px] font-black font-mono px-1.5 py-0.2 rounded shrink-0 uppercase',
                authStore.isSuperAdmin ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-zinc-800 text-zinc-300'
              ]"
            >
              {{ authStore.currentUser?.role }}
            </span>
          </div>
          <p class="text-[11px] font-mono text-zinc-400 truncate">
            @{{ authStore.currentUser?.username }} • {{ getDepartmentName(authStore.currentUser?.department) }}
          </p>
        </div>
      </div>

      <!-- Lock Status & Instructions -->
      <div class="space-y-2">
        <div class="flex items-center justify-center gap-2 text-xs font-bold text-zinc-300">
          <svg class="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span class="tracking-wide uppercase font-mono text-[11px]">Layar Terkunci (Keamanan Shift)</span>
        </div>

        <!-- 4-Digit PIN Dots Indicator -->
        <div
          class="flex items-center justify-center gap-4 py-2"
          :class="{ 'animate-shake': isShaking }"
        >
          <div
            v-for="i in 4"
            :key="i"
            class="w-4 h-4 rounded-full border-2 transition-all duration-200"
            :class="[
              enteredPin.length >= i
                ? (isError ? 'bg-red-600 border-red-500 scale-110 shadow-lg shadow-red-600/50' : 'bg-white border-white scale-110 shadow-lg shadow-white/40')
                : 'border-zinc-700 bg-zinc-950/80'
            ]"
          ></div>
        </div>

        <p v-if="errorMessage" class="text-xs text-red-400 font-medium animate-fade-in font-mono">
          {{ errorMessage }}
        </p>
        <p v-else class="text-[11px] text-zinc-500 font-mono">
          Masukkan 4 digit PIN Anda untuk membuka
        </p>
      </div>

      <!-- Numeric Keypad Grid (Interactive Screen & Physical Keyboard) -->
      <div class="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto pt-1">
        <button
          v-for="num in ['1','2','3','4','5','6','7','8','9']"
          :key="num"
          type="button"
          @click="pressKey(num)"
          class="h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700/60 font-mono font-bold text-lg text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          {{ num }}
        </button>

        <!-- Backspace Button -->
        <button
          type="button"
          @click="pressBackspace"
          class="h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 font-mono font-bold text-xs text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title="Hapus Digit"
        >
          ⌫
        </button>

        <!-- Digit 0 -->
        <button
          type="button"
          @click="pressKey('0')"
          class="h-12 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 active:bg-zinc-600 border border-zinc-700/60 font-mono font-bold text-lg text-white transition-all cursor-pointer flex items-center justify-center shadow-xs"
        >
          0
        </button>

        <!-- Clear Button -->
        <button
          type="button"
          @click="clearPin"
          class="h-12 rounded-2xl bg-zinc-900 hover:bg-zinc-800 active:bg-zinc-700 border border-zinc-800 font-mono font-bold text-xs text-zinc-400 hover:text-white transition-all cursor-pointer flex items-center justify-center"
          title="Hapus Semua"
        >
          C
        </button>
      </div>

      <!-- Action Footer: Switch User / Logout -->
      <div class="pt-3 border-t border-zinc-800/80 flex items-center justify-between text-xs font-mono">
        <button
          type="button"
          @click="handleSwitchAccount"
          class="text-zinc-400 hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <span>🔄</span>
          <span>Ganti Akun / Logout</span>
        </button>

        <span class="text-[10px] text-zinc-500" title="Hubungi Super Admin jika Anda lupa PIN">
          Lupa PIN? Hubungi Admin
        </span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { DEPARTMENTS } from '@/services/authService';

const authStore = useAuthStore();
const router = useRouter();

const enteredPin = ref('');
const errorMessage = ref('');
const isError = ref(false);
const isShaking = ref(false);
const currentTime = ref('');
const currentDate = ref('');
let clockTimer = null;

const updateClock = () => {
  const now = new Date();
  currentTime.value = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  currentDate.value = now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const getDepartmentName = (deptKey) => {
  const found = DEPARTMENTS.find(d => d.key === deptKey);
  return found ? found.name : 'Produksi';
};

const pressKey = (digit) => {
  if (enteredPin.value.length < 4) {
    enteredPin.value += digit;
    errorMessage.value = '';
    isError.value = false;

    if (enteredPin.value.length === 4) {
      submitPin();
    }
  }
};

const pressBackspace = () => {
  if (enteredPin.value.length > 0) {
    enteredPin.value = enteredPin.value.slice(0, -1);
    errorMessage.value = '';
    isError.value = false;
  }
};

const clearPin = () => {
  enteredPin.value = '';
  errorMessage.value = '';
  isError.value = false;
};

const submitPin = async () => {
  try {
    await authStore.unlockScreen(enteredPin.value);
    enteredPin.value = '';
    errorMessage.value = '';
    isError.value = false;
  } catch (err) {
    isError.value = true;
    isShaking.value = true;
    errorMessage.value = err.message || 'PIN salah.';
    setTimeout(() => {
      isShaking.value = false;
      enteredPin.value = '';
    }, 600);
  }
};

const handleSwitchAccount = async () => {
  if (confirm('Keluar dari sesi ini dan kembali ke halaman login?')) {
    await authStore.logout();
  }
};

// Physical Keyboard Listener (Numpad / Digits 0-9)
const handlePhysicalKey = (e) => {
  if (!authStore.isLocked) return;

  if (e.key >= '0' && e.key <= '9') {
    pressKey(e.key);
  } else if (e.key === 'Backspace') {
    pressBackspace();
  } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
    clearPin();
  }
};

onMounted(() => {
  updateClock();
  clockTimer = setInterval(updateClock, 1000);
  window.addEventListener('keydown', handlePhysicalKey);
});

onUnmounted(() => {
  if (clockTimer) clearInterval(clockTimer);
  window.removeEventListener('keydown', handlePhysicalKey);
});

// If lock state resets, clear entered pin
watch(() => authStore.isLocked, (val) => {
  if (!val) {
    enteredPin.value = '';
    errorMessage.value = '';
    isError.value = false;
  }
});
</script>

<style scoped>
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-8px); }
  40%, 80% { transform: translateX(8px); }
}

.animate-shake {
  animation: shake 0.4s ease-in-out;
}
</style>
