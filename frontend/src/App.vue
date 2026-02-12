<template>
  <div class="min-h-screen flex flex-col">
    <header class="bg-white/90 backdrop-blur border-b border-slate-200/80">
      <nav class="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8" aria-label="Navigation">
        <!-- Left: logo + app name -->
        <router-link
          :to="isAuthenticated ? (isSuperadmin ? '/available-cards' : '/cards') : '/'"
          class="flex items-center gap-2 sm:gap-3 text-slate-900 hover:text-primary-500 transition-colors"
        >
          <img
            :src="logoUrl"
            alt="PointsRocket"
            class="h-8 w-8 sm:h-9 sm:w-9"
          />
          <span class="flex flex-col leading-tight">
            <span class="text-sm sm:text-base font-semibold tracking-tight">
              PointsRocket
            </span>
            <span class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Track · Earn · Travel
            </span>
          </span>
        </router-link>

        <!-- Center: main navigation when authenticated -->
        <div class="flex-1 flex justify-center">
          <div v-if="isAuthenticated" class="flex items-center gap-6 text-sm font-medium">
            <router-link
              v-if="!isSuperadmin"
              to="/cards"
              class="border-b-2 border-transparent pb-1 text-slate-600 hover:text-slate-900 hover:border-slate-300"
            >
              {{ $t('nav.myCards') }}
            </router-link>
            <router-link
              to="/available-cards"
              class="border-b-2 border-transparent pb-1 text-slate-600 hover:text-slate-900 hover:border-slate-300"
            >
              {{ $t('nav.availableCards') }}
            </router-link>
            <router-link
              to="/profile"
              class="border-b-2 border-transparent pb-1 text-slate-600 hover:text-slate-900 hover:border-slate-300"
            >
              {{ $t('nav.profile') }}
            </router-link>
          </div>
        </div>

        <!-- Right: language switcher + auth actions -->
        <div class="flex items-center gap-4">
          <!-- Language switcher -->
          <div class="flex h-8 w-10 items-center justify-center border border-slate-200 bg-white text-xs font-medium text-slate-500">
            <button
              type="button"
              class="w-full text-center text-primary-600"
              @click="toggleLocale"
            >
              {{ currentLocale === 'en' ? 'FR' : 'EN' }}
            </button>
          </div>

          <!-- Auth actions -->
          <template v-if="isAuthenticated">
            <AppButton variant="outline" size="sm" @click="handleLogout">
              {{ $t('auth.logout') }}
            </AppButton>
          </template>
          <template v-else>
            <AppButton to="/login" variant="outline" size="sm">
              {{ $t('auth.login') }}
            </AppButton>
            <AppButton to="/register" variant="primary" size="md">
              {{ $t('auth.registerLink') }}
            </AppButton>
          </template>
        </div>
      </nav>
    </header>
    <main class="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from './composables/useAuth';
import AppButton from './components/AppButton.vue';
import logoUrl from './assets/logo-rocket.png';

const router = useRouter();
const { isAuthenticated, isSuperadmin, logout } = useAuth();
const { locale } = useI18n();

const currentLocale = computed(() => locale.value);

function toggleLocale() {
  locale.value = locale.value === 'en' ? 'fr' : 'en';
}

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>

