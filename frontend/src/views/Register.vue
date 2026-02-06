<template>
  <div class="mx-auto max-w-sm">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.registerTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.registerIntro') }}</p>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="email" class="block text-sm font-medium text-slate-700">{{ $t('auth.email') }}</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          autocomplete="email"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label for="name" class="block text-sm font-medium text-slate-700">{{ $t('auth.name') }}</label>
        <input
          id="name"
          v-model="name"
          type="text"
          autocomplete="name"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label for="password" class="block text-sm font-medium text-slate-700">{{ $t('auth.password') }}</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <p class="mt-0.5 text-xs text-slate-500">{{ $t('auth.passwordMin') }}</p>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex flex-col gap-3">
        <button
          type="submit"
          class="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? $t('auth.loading') : $t('auth.register') }}
        </button>
        <p class="text-center text-sm text-slate-600">
          {{ $t('auth.hasAccount') }}
          <router-link to="/login" class="font-medium text-primary-600 hover:text-primary-700">{{ $t('auth.loginLink') }}</router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const router = useRouter();
const { register } = useAuth();
const email = ref('');
const name = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await register(email.value, password.value, name.value || undefined);
    router.replace('/');
  } catch (e) {
    error.value = e.response?.data?.error || e.message || 'Registration failed';
  } finally {
    loading.value = false;
  }
}
</script>
