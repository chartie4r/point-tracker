<template>
  <div class="mx-auto max-w-sm">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.resetTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.resetIntro') }}</p>
    <form v-if="!success" class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <AppInput
          v-model="newPassword"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
        >
          {{ $t('auth.newPassword') }}
        </AppInput>
        <p class="mt-0.5 text-xs text-slate-500">{{ $t('auth.passwordMin') }}</p>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
      <AppButton type="submit" variant="primary" size="md" class="w-full" :disabled="loading">
        {{ loading ? $t('auth.loading') : $t('auth.resetPassword') }}
      </AppButton>
    </form>
    <ContentCard v-else padding="md" class="mt-6 border-primary-500/30 bg-primary-500/10">
      <p class="text-sm text-primary-700">{{ $t('auth.resetSuccess') }}</p>
      <AppButton :to="user?.role === 'superadmin' ? '/available-cards' : '/cards'" variant="outline" size="sm" class="mt-3">
        {{ $t('auth.goToApp') }}
      </AppButton>
    </ContentCard>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { resetPassword } from '../api/client';
import { useAuth } from '../composables/useAuth';
import AppInput from '../components/AppInput.vue';
import AppButton from '../components/AppButton.vue';
import ContentCard from '../components/ContentCard.vue';

const route = useRoute();
const { t: $t } = useI18n();
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
