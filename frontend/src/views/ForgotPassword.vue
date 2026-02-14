<template>
  <div class="mx-auto max-w-sm">
    <h1 class="text-2xl font-semibold text-slate-900 dark:text-slate-100">{{ $t('auth.forgotTitle') }}</h1>
    <p class="mt-1 text-slate-600 dark:text-slate-400">{{ $t('auth.forgotIntro') }}</p>
    <form v-if="!sent" class="mt-6 space-y-4" @submit.prevent="submit">
      <AppInput v-model="email" type="email" required autocomplete="email">
        {{ $t('auth.email') }}
      </AppInput>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <div class="flex flex-col gap-3">
        <AppButton type="submit" variant="primary" size="md" class="w-full" :disabled="loading">
          {{ loading ? $t('auth.loading') : $t('auth.sendResetLink') }}
        </AppButton>
        <AppButton to="/login" variant="outline" size="sm" class="w-full">
          {{ $t('auth.backToLogin') }}
        </AppButton>
      </div>
    </form>
    <ContentCard v-else padding="md" variant="success" class="mt-6">
      <p class="text-sm text-primary-700 dark:text-primary-200">{{ $t('auth.resetLinkSent') }}</p>
      <p v-if="resetUrl" class="mt-2 break-all font-mono text-xs text-slate-600 dark:text-slate-400">{{ resetUrl }}</p>
      <AppButton to="/login" variant="outline" size="sm" class="mt-3">
        {{ $t('auth.backToLogin') }}
      </AppButton>
    </ContentCard>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { forgotPassword } from '../api/client';
import AppInput from '../components/AppInput.vue';
import AppButton from '../components/AppButton.vue';
import ContentCard from '../components/ContentCard.vue';

const { t: $t } = useI18n();
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
