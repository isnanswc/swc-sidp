<template>
  <Teleport to="body">
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 1. SLIM PROGRESS BAR ON TOP EDGE (NON-BLOCKING, YOUTUBE/GITHUB STYLE)  -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-300"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLoading"
        class="fixed top-0 left-0 right-0 z-999 h-0.5 sm:h-1 bg-transparent pointer-events-none overflow-hidden"
      >
        <!-- Animated Crimson Glowing Bar -->
        <div class="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-600 shadow-[0_0_8px_rgba(239,68,68,0.8)] slim-progress-bar"></div>
      </div>
    </Transition>

    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <!-- 2. MINIMALIST FLOATING PILL AT TOP RIGHT (NON-BLOCKING, NO AI CLASH)    -->
    <!-- ═══════════════════════════════════════════════════════════════════════ -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 -translate-y-3 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 translate-y-0 scale-100"
      leave-to-class="opacity-0 -translate-y-2 scale-95"
    >
      <div
        v-if="isLoading"
        class="fixed top-16 sm:top-18 right-3 sm:right-6 z-40 select-none pointer-events-auto"
      >
        <div
          class="bg-zinc-900/95 text-white backdrop-blur-md border border-zinc-700/80 shadow-xl rounded-2xl py-1.5 px-3 flex items-center gap-2 max-w-[280px] sm:max-w-xs text-xs font-medium"
        >
          <!-- Compact Red Pulse Spinner -->
          <div class="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
            <span class="w-3.5 h-3.5 rounded-full border-2 border-zinc-700 border-t-red-500 animate-spin"></span>
          </div>

          <!-- Loading Text & Context -->
          <div class="min-w-0 flex-1">
            <div class="font-bold text-white text-[11px] truncate leading-tight">
              {{ loadingMessage || 'Memproses Data...' }}
            </div>
            <div v-if="isLongRunning" class="text-[9px] text-amber-400 font-mono flex items-center gap-1">
              <span>Mengolah data besar</span>
              <span>•</span>
              <span class="font-bold">{{ elapsedSeconds }}s</span>
            </div>
          </div>

          <!-- Emergency Dismiss if > 10s -->
          <button
            v-if="elapsedSeconds >= 10"
            @click="forceResetLoading"
            class="text-[10px] text-zinc-400 hover:text-red-400 hover:bg-zinc-800 p-0.5 px-1.5 rounded font-mono transition-colors cursor-pointer shrink-0"
            title="Tutup paksa indikator loading"
          >
            ✕
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { useGlobalLoading } from '@/services/loadingService';

const { isLoading, loadingMessage, elapsedSeconds, isLongRunning, forceResetLoading } = useGlobalLoading();
</script>

<style scoped>
@keyframes slimProgressIndeterminate {
  0% {
    transform: translateX(-100%) scaleX(0.2);
  }
  50% {
    transform: translateX(0%) scaleX(0.7);
  }
  100% {
    transform: translateX(100%) scaleX(0.3);
  }
}

.slim-progress-bar {
  animation: slimProgressIndeterminate 1.4s infinite cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: left center;
  width: 100%;
}
</style>
