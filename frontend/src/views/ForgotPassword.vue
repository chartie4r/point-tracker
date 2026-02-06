<template>
  <div class="mx-auto max-w-sm">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.forgotTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.forgotIntro') }}</p>
    <form v-if="!sent" class="mt-6 space-y-4" @submit.prevent="submit">
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
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex flex-col gap-3">
        <button
          type="submit"
          class="w-full rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? $t('auth.loading') : $t('auth.sendResetLink') }}
        </button>
        <router-link to="/login" class="text-center text-sm text-primary-600 hover:text-primary-700">
          {{ $t('auth.backToLogin') }}
        </router-link>
      </div>
    </form>
    <div v-else class="mt-6 rounded-md bg-emerald-50 p-4 text-sm text-emerald-800">
      <p>{{ $t('auth.resetLinkSent') }}</p>
      <p v-if="resetUrl" class="mt-2 break-all font-mono text-xs">{{ resetUrl }}</p>
      <router-link to="/login" class="mt-3 inline-block font-medium text-primary-600 hover:text-primary-700">{{ $t('auth.backToLogin') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { forgotPassword } from '../api/client';

const email = ref('');
const error = ref('');
const loading = ref(false);
const sent = ref(false);
const resetUrl = ref('');

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    const data = await forgotPassword(email.value);
    sent.value = true;
    resetUrl.value = data.resetUrl || '';
  } catch (e) {
    error.value = e.response?.data?.error || e.message || 'Request failed';
  } finally {
    loading.value = false;
  }
}
</script>
