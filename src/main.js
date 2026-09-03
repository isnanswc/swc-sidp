import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './assets/main.css';
import { purgeAllLegacyDummyData } from '@/db';

// Jalankan pembersihan satu kali untuk memastikan basis data lokal bersih murni (Zero-Seeding Policy)
purgeAllLegacyDummyData();

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');
