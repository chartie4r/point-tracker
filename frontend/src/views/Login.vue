<template>
  <div class="mx-auto max-w-sm">
    <h1 class="font-display text-2xl font-bold text-slate-900">{{ $t('auth.loginTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.loginIntro') }}</p>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <AppInput v-model="email" type="email" required autocomplete="email">
        {{ $t('auth.email') }}
      </AppInput>
      <AppInput v-model="password" type="password" required autocomplete="current-password">
        {{ $t('auth.password') }}
      </AppInput>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex flex-col gap-3">
        <AppButton type="submit" variant="primary" size="md" class="w-full" :disabled="loading">
          {{ loading ? $t('auth.loading') : $t('auth.login') }}
        </AppButton>
        <AppButton to="/forgot-password" variant="outline" size="sm" class="w-full">
          {{ $t('auth.forgotPassword') }}
        </AppButton>
        <p class="text-center text-sm text-slate-600">
          {{ $t('auth.noAccount') }}
          <AppButton to="/register" variant="outline" size="sm" class="inline-flex font-semibold">
            {{ $t('auth.registerLink') }}
          </AppButton>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth';
import AppInput from '../components/AppInput.vue';
import AppButton from '../components/AppButton.vue';

const router = useRouter();
const route = useRoute();
const { t: $t } = useI18n();
const { login, user } = useAuth();
const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function submit() {
  error.value = '';
  loading.value = true;
  try {
    await login(email.value, password.value);
    const defaultRedirect = user.value?.role === 'superadmin' ? '/available-cards' : '/cards';
    const redirect = route.query.redirect || defaultRedirect;
    router.replace(redirect);
  } catch (e) {
    error.value = e.response?.data?.error || e.message || $t('auth.errorLogin');
  } finally {
    loading.value = false;
  }
}
</script>
