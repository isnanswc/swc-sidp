<template>
  <!-- Full Screen Login Layout without Sidebar / Navbar -->
  <div v-if="route.name === 'Login'" class="min-h-screen w-full bg-zinc-950">
    <router-view />
  </div>

  <!-- Main Authenticated App Layout -->
  <div v-else class="min-h-screen flex bg-zinc-100 antialiased font-sans text-zinc-900">
    <!-- Desktop & Mobile Sidebar (Default Collapsed / Closed) -->
    <Sidebar
      :is-open="isSidebarOpen"
      :is-mobile="isMobileSidebarOpen"
      @toggle="toggleSidebar"
      @close-mobile="isMobileSidebarOpen = false"
    />

    <!-- Mobile Backdrop -->
    <div
      v-if="isMobileSidebarOpen"
      @click="isMobileSidebarOpen = false"
      class="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs z-45 md:hidden"
    ></div>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Sticky Top Navbar -->
      <Navbar
        @toggle-mobile-sidebar="isMobileSidebarOpen = !isMobileSidebarOpen"
      />

      <!-- Router Page Content Container -->
      <main class="flex-1 p-3 sm:p-5 lg:p-6 max-w-7xl w-full mx-auto">
        <router-view />
      </main>
    </div>

    <!-- Floating Global AI Copilot Widget -->
    <AiCopilotWidget />
  </div>

  <!-- Global Lock Screen & User Profile Modal Teleports -->
  <LockScreenModal />
  <UserProfileModal />

  <!-- Global Loading & Long-Running Responsiveness Overlay -->
  <GlobalLoadingOverlay />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/authStore';
import { getCurrentSessionId, updateSessionHeartbeat } from '@/services/sessionService';
import Sidebar from '@/components/Sidebar.vue';
import Navbar from '@/components/Navbar.vue';
import AiCopilotWidget from '@/components/ai/AiCopilotWidget.vue';
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay.vue';
import LockScreenModal from '@/components/auth/LockScreenModal.vue';
import UserProfileModal from '@/components/auth/UserProfileModal.vue';

const route = useRoute();
const authStore = useAuthStore();

// Default Tertutup (Collapsed mode)
const isSidebarOpen = ref(false);
const isMobileSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

// Global Idle & Session Activity Tracking (throttled 30s)
let lastActivityHeartbeat = 0;
const onUserActivity = () => {
  authStore.resetIdleTimer();

  const now = Date.now();
  if (now - lastActivityHeartbeat > 30 * 1000) {
    lastActivityHeartbeat = now;
    const sessId = getCurrentSessionId();
    if (sessId) {
      updateSessionHeartbeat(sessId);
    }
  }
};

const onVisibilityChange = () => {
  if (typeof document !== 'undefined' && !document.hidden) {
    onUserActivity();
  }
};

onMounted(() => {
  window.addEventListener('mousemove', onUserActivity, { passive: true });
  window.addEventListener('mousedown', onUserActivity, { passive: true });
  window.addEventListener('keydown', onUserActivity, { passive: true });
  window.addEventListener('touchstart', onUserActivity, { passive: true });
  window.addEventListener('scroll', onUserActivity, { passive: true });
  window.addEventListener('focus', onUserActivity);
  document.addEventListener('visibilitychange', onVisibilityChange);

  authStore.resetIdleTimer();
});

onUnmounted(() => {
  window.removeEventListener('mousemove', onUserActivity);
  window.removeEventListener('mousedown', onUserActivity);
  window.removeEventListener('keydown', onUserActivity);
  window.removeEventListener('touchstart', onUserActivity);
  window.removeEventListener('scroll', onUserActivity);
  window.removeEventListener('focus', onUserActivity);
  document.removeEventListener('visibilitychange', onVisibilityChange);
});
</script>
