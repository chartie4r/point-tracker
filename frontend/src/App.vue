<template>
  <div class="min-h-screen flex flex-col dark:bg-slate-900">
    <header class="bg-white/90 dark:bg-slate-900/90 backdrop-blur border-b border-slate-200/80 dark:border-slate-700/80">
      <nav class="mx-auto flex max-w-7xl items-center px-4 py-3 sm:px-6 lg:px-8" aria-label="Navigation">
        <!-- Left: logo + app name -->
        <router-link
          :to="isAuthenticated ? (isSuperadmin ? '/available-cards' : '/cards') : '/'"
          class="flex items-center gap-2 sm:gap-3 text-slate-900 dark:text-slate-100 hover:text-primary-500 dark:hover:text-violet-400 transition-colors"
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
            <span class="text-[10px] sm:text-[11px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ $t('app.tagline') }}
            </span>
          </span>
        </router-link>

        <!-- Center: main navigation (catalogue for everyone; My cards + Profile when logged in) -->
        <div class="flex-1 flex justify-center">
          <div class="flex items-center gap-6 text-sm font-medium">
            <router-link
              v-if="isAuthenticated && !isSuperadmin"
              to="/cards"
              class="border-b-2 border-transparent pb-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500"
            >
              {{ $t('nav.myCards') }}
            </router-link>
            <router-link
              to="/available-cards"
              class="border-b-2 border-transparent pb-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500"
            >
              {{ $t('nav.availableCards') }}
            </router-link>
            <router-link
              v-if="isAuthenticated"
              to="/profile"
              class="border-b-2 border-transparent pb-1 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-500"
            >
              {{ $t('nav.profile') }}
            </router-link>
          </div>
        </div>

        <!-- Right: theme + language + auth actions -->
        <div class="flex items-center gap-4">
          <!-- Theme toggle -->
          <div class="flex items-center gap-2" role="group" :aria-label="$t('theme.label')">
            <span class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ isDark ? $t('theme.dark') : $t('theme.light') }}</span>
            <div
              class="flex h-6 w-11 rounded-full border border-slate-200 dark:border-slate-600 bg-slate-100 dark:bg-slate-800 p-0.5"
            >
              <button
                type="button"
                class="h-full flex-1 rounded-l-full transition"
                :class="!isDark ? 'bg-white dark:bg-slate-600 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'"
                :aria-label="$t('theme.switchToLight')"
                :aria-pressed="!isDark"
                @click="setTheme(false)"
              />
              <button
                type="button"
                class="h-full flex-1 rounded-r-full transition"
                :class="isDark ? 'bg-slate-600 dark:bg-slate-500 shadow-sm' : 'hover:bg-slate-200/50 dark:hover:bg-slate-700/50'"
                :aria-label="$t('theme.switchToDark')"
                :aria-pressed="isDark"
                @click="setTheme(true)"
              />
            </div>
          </div>
          <!-- Language switcher -->
          <div class="flex h-8 w-10 items-center justify-center border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-xs font-medium text-slate-500 dark:text-slate-400">
            <button
              type="button"
              class="w-full text-center text-primary-600 dark:text-violet-400"
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
    <main class="flex-1 mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 dark:bg-slate-900">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from './composables/useAuth';
import { useTheme } from './composables/useTheme';
import AppButton from './components/AppButton.vue';
import logoUrl from './assets/logo-rocket.svg';

const router = useRouter();
const { isAuthenticated, isSuperadmin, logout } = useAuth();
const { locale } = useI18n();
const { isDark } = useTheme();

const currentLocale = computed(() => locale.value);

function setTheme(dark) {
  isDark.value = dark;
}

function toggleLocale() {
  locale.value = locale.value === 'en' ? 'fr' : 'en';
}

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>

