import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { purgeAllLegacyDummyData } from '@/db';

function bootstrapApp() {
  const app = createApp(App);
  app.config.errorHandler = (err, vm, info) => {
    console.error('SWC_VUE_GLOBAL_ERROR:', err, info);
  };

  app.use(createPinia());
  app.use(router);
  app.mount('#app');

  // Background non-blocking execution of purge legacy dummy data
  setTimeout(() => {
    purgeAllLegacyDummyData().catch(e => {
      console.warn('Purge legacy data warning:', e);
    });
  }, 100);
}

bootstrapApp();
