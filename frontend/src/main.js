import './assets/main.css';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { i18n } from './i18n';
import { setAuthCallback } from './api/client';
import { useAuth } from './composables/useAuth';

setAuthCallback(() => {
  useAuth().logout().then(() => {
    if (router.currentRoute.value.meta.requiresAuth) {
      router.push('/login');
    }
  });
});

const app = createApp(App);
app.use(createPinia());
app.use(i18n);
app.use(router);
app.mount('#app');
