<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isLoading"
        class="fixed inset-0 z-999 flex items-center justify-center bg-zinc-950/40 backdrop-blur-xs select-none"
      >
        <div
          class="bg-white border border-zinc-200 shadow-2xl rounded-2xl p-5 max-w-sm w-full mx-4 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-150"
        >
          <!-- Elegant Spinner with Red Accent -->
          <div class="relative w-14 h-14 mb-3 flex items-center justify-center">
            <div class="w-14 h-14 rounded-full border-4 border-zinc-100 border-t-red-600 animate-spin"></div>
            <div class="absolute w-7 h-7 rounded-full bg-zinc-900 flex items-center justify-center text-white">
              <svg class="w-3.5 h-3.5 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
          </div>

          <!-- Main Message -->
          <h3 class="text-sm font-bold text-zinc-900 tracking-tight">
            {{ loadingMessage || 'Memproses Data...' }}
          </h3>

          <!-- Secondary Notice: Activated when operation exceeds 2 seconds -->
          <div
            v-if="isLongRunning"
            class="mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-left w-full flex items-start gap-2"
          >
            <div class="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
              !
            </div>
            <div class="text-[11px] text-amber-800 leading-snug">
              <span class="font-semibold block text-amber-900">Mengolah Data Besar (10K+ Record)</span>
              Sistem sedang memproses database lokal. Mohon tunggu beberapa saat...
              <span class="inline-block font-mono font-bold mt-1 px-1.5 py-0.2 bg-amber-200/70 text-amber-950 rounded text-[10px]">
                ⏱️ {{ elapsedSeconds }} detik
              </span>
            </div>
          </div>

          <!-- Emergency Dismiss if > 15s -->
          <button
            v-if="elapsedSeconds >= 15"
            @click="forceResetLoading"
            class="mt-4 text-[11px] font-semibold text-zinc-400 hover:text-red-600 underline cursor-pointer transition-colors"
          >
            Tutup Paksa (Jika Aplikasi Macet)
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
