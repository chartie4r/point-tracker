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
          class="mt-1 block w-full border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex flex-col gap-3">
        <button
          type="submit"
          class="w-full border-2 border-violet-500 bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
          :disabled="loading"
        >
          {{ loading ? $t('auth.loading') : $t('auth.sendResetLink') }}
        </button>
        <router-link to="/login" class="text-center text-sm text-primary-600 hover:text-primary-700">
          {{ $t('auth.backToLogin') }}
        </router-link>
      </div>
    </form>
    <div v-else class="mt-6 border border-primary-500/30 bg-primary-500/10 p-4 text-sm text-primary-700">
      <p>{{ $t('auth.resetLinkSent') }}</p>
      <p v-if="resetUrl" class="mt-2 break-all font-mono text-xs text-slate-600">{{ resetUrl }}</p>
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
    error.value = e.response?.data?.error || e.message || $t('auth.errorGeneric');
  } finally {
    loading.value = false;
  }
}
</script>
