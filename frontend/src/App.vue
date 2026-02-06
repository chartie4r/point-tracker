<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <header class="bg-slate-900">
      <nav class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8" aria-label="Navigation">
        <div class="flex items-center gap-2">
          <router-link :to="isAuthenticated ? (isSuperadmin ? '/available-cards' : '/cards') : '/'" class="text-lg font-semibold text-white hover:text-white">
            Point Tracker
          </router-link>
        </div>
        <div class="flex items-center gap-6">
          <template v-if="isAuthenticated">
            <template v-if="!isSuperadmin">
              <router-link
                to="/cards"
                class="text-sm font-medium text-slate-300 transition hover:text-white"
                active-class="!text-white"
              >
                {{ $t('nav.myCards') }}
              </router-link>
            </template>
            <router-link
              to="/available-cards"
              class="text-sm font-medium text-slate-300 transition hover:text-white"
              active-class="!text-white"
            >
              {{ $t('nav.availableCards') }}
            </router-link>
            <router-link
              to="/profile"
              class="text-sm font-medium text-slate-300 transition hover:text-white"
              active-class="!text-white"
            >
              {{ $t('nav.profile') }}
            </router-link>
            <button
              type="button"
              class="text-sm font-medium text-slate-300 transition hover:text-white"
              @click="handleLogout"
            >
              {{ $t('auth.logout') }}
            </button>
          </template>
          <template v-else>
            <router-link
              to="/login"
              class="text-sm font-medium text-slate-300 transition hover:text-white"
              active-class="!text-white"
            >
              {{ $t('auth.login') }}
            </router-link>
            <router-link
              to="/register"
              class="text-sm font-medium text-slate-300 transition hover:text-white"
              active-class="!text-white"
            >
              {{ $t('auth.registerLink') }}
            </router-link>
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
import { useRouter } from 'vue-router';
import { useAuth } from './composables/useAuth';

const router = useRouter();
const { isAuthenticated, isSuperadmin, logout } = useAuth();

async function handleLogout() {
  await logout();
  router.push('/login');
}
</script>

<style>
/* Vue Router link active class (no exact match by default) */
a.router-link-active.router-link-exact-active {
  @apply text-white;
}
</style>
