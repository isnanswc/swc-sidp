import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { purgeAllLegacyDummyData } from '@/db';

// Jalankan pembersihan satu kali untuk memastikan basis data lokal bersih murni (Zero-Seeding Policy)
async function bootstrapApp() {
  try {
    await purgeAllLegacyDummyData();
  } catch (e) {
    console.warn('Purge legacy data warning:', e);
  }

  const app = createApp(App);
  app.config.errorHandler = (err, vm, info) => {
    console.error('SWC_VUE_GLOBAL_ERROR:', err, info);
  };

  app.use(createPinia());
  app.use(router);
  app.mount('#app');
}

bootstrapApp();
