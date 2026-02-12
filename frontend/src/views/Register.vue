<template>
  <div class="mx-auto max-w-sm">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.registerTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.registerIntro') }}</p>
    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <AppInput v-model="email" type="email" required autocomplete="email">
        {{ $t('auth.email') }}
      </AppInput>
      <AppInput v-model="name" type="text" autocomplete="name">
        {{ $t('auth.name') }}
      </AppInput>
      <div>
        <AppInput
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
        >
          {{ $t('auth.password') }}
        </AppInput>
        <p class="mt-0.5 text-xs text-slate-500">{{ $t('auth.passwordMin') }}</p>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex flex-col gap-3">
        <AppButton type="submit" variant="primary" size="md" class="w-full" :disabled="loading">
          {{ loading ? $t('auth.loading') : $t('auth.register') }}
        </AppButton>
        <p class="text-center text-sm text-slate-600">
          {{ $t('auth.hasAccount') }}
          <AppButton to="/login" variant="outline" size="sm" class="inline-flex font-medium">
            {{ $t('auth.loginLink') }}
          </AppButton>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth';
import AppInput from '../components/AppInput.vue';
import AppButton from '../components/AppButton.vue';

const router = useRouter();
const { t: $t } = useI18n();
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
    error.value = e.response?.data?.error || e.message || $t('auth.errorRegister');
  } finally {
    loading.value = false;
  }
}
</script>
