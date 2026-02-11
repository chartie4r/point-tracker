<template>
  <div class="mx-auto max-w-sm">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.resetTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.resetIntro') }}</p>
    <form v-if="!success" class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <label for="newPassword" class="block text-sm font-medium text-slate-700">{{ $t('auth.newPassword') }}</label>
        <input
          id="newPassword"
          v-model="newPassword"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
          class="mt-1 block w-full border border-slate-200 bg-white px-3 py-2 text-slate-900 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
        />
        <p class="mt-0.5 text-xs text-slate-500">{{ $t('auth.passwordMin') }}</p>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <button
        type="submit"
        class="w-full border-2 border-violet-500 bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50"
        :disabled="loading"
      >
        {{ loading ? $t('auth.loading') : $t('auth.resetPassword') }}
      </button>
    </form>
    <div v-else class="mt-6 border border-primary-500/30 bg-primary-500/10 p-4 text-sm text-primary-700">
      <p>{{ $t('auth.resetSuccess') }}</p>
      <router-link :to="user?.role === 'superadmin' ? '/available-cards' : '/cards'" class="mt-3 inline-block font-medium text-primary-600 hover:text-primary-700">{{ $t('auth.goToApp') }}</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { resetPassword } from '../api/client';
import { useAuth } from '../composables/useAuth';

const route = useRoute();
const router = useRouter();
const { user, fetchUser } = useAuth();
const token = computed(() => route.params.token);
const newPassword = ref('');
const error = ref('');
const loading = ref(false);
const success = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await resetPassword(token.value, newPassword.value);
    await fetchUser();
    success.value = true;
  } catch (e) {
    error.value = e.response?.data?.error || e.message || $t('auth.errorReset');
  } finally {
    loading.value = false;
  }
}
</script>
