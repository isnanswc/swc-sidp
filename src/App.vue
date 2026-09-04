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

  <!-- Global Loading & Long-Running Responsiveness Overlay -->
  <GlobalLoadingOverlay />
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@/components/Sidebar.vue';
import Navbar from '@/components/Navbar.vue';
import AiCopilotWidget from '@/components/ai/AiCopilotWidget.vue';
import GlobalLoadingOverlay from '@/components/GlobalLoadingOverlay.vue';

const route = useRoute();

// Default Tertutup (Collapsed mode)
const isSidebarOpen = ref(false);
const isMobileSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};
</script>
