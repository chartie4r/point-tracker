<template>
  <div class="mx-auto max-w-lg">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.profileTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.profileIntro') }}</p>

    <form class="mt-6 space-y-4" @submit.prevent="saveProfile">
      <AppInput v-model="form.email" type="email" required>
        {{ $t('auth.email') }}
      </AppInput>
      <AppInput v-model="form.name" type="text">
        {{ $t('auth.name') }}
      </AppInput>
      <p v-if="profileError" class="text-sm text-red-600">{{ profileError }}</p>
      <p v-if="profileSuccess" class="text-sm text-primary-600">{{ profileSuccess }}</p>
      <AppButton type="submit" variant="primary" size="md" :disabled="profileLoading">
        {{ profileLoading ? $t('auth.loading') : $t('auth.saveProfile') }}
      </AppButton>
    </form>

    <hr class="my-8 border-slate-200" />
    <h2 class="text-lg font-medium text-slate-900">{{ $t('auth.changePasswordTitle') }}</h2>
    <form class="mt-4 space-y-4" @submit.prevent="savePassword">
      <AppInput v-model="passwordForm.currentPassword" type="password" required>
        {{ $t('auth.currentPassword') }}
      </AppInput>
      <div>
        <AppInput
          v-model="passwordForm.newPassword"
          type="password"
          required
          minlength="8"
        >
          {{ $t('auth.newPassword') }}
        </AppInput>
        <p class="mt-0.5 text-xs text-slate-500">{{ $t('auth.passwordMin') }}</p>
      </div>
      <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
      <p v-if="passwordSuccess" class="text-sm text-primary-600">{{ passwordSuccess }}</p>
      <AppButton type="submit" variant="secondary" size="md" :disabled="passwordLoading">
        {{ passwordLoading ? $t('auth.loading') : $t('auth.changePassword') }}
      </AppButton>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth';
import { updateProfile, changePassword } from '../api/client';
import AppInput from '../components/AppInput.vue';
import AppButton from '../components/AppButton.vue';

const { t: $t } = useI18n();
const { user } = useAuth();
const form = ref({ email: '', name: '' });
const profileError = ref('');
const profileSuccess = ref('');
const profileLoading = ref(false);
const passwordForm = ref({ currentPassword: '', newPassword: '' });
const passwordError = ref('');
const passwordSuccess = ref('');
const passwordLoading = ref(false);

watch(
  user,
  (u) => {
    if (u) {
      form.value = { email: u.email, name: u.name || '' };
    }
  },
  { immediate: true },
);

async function saveProfile() {
  profileError.value = '';
  profileSuccess.value = '';
  profileLoading.value = true;
  try {
    const u = await updateProfile(form.value);
    user.value = u;
    profileSuccess.value = $t('auth.profileUpdated');
  } catch (e) {
    profileError.value = e.response?.data?.error || e.message || $t('auth.errorGeneric');
  } finally {
    profileLoading.value = false;
  }
}

async function savePassword() {
  passwordError.value = '';
  passwordSuccess.value = '';
  passwordLoading.value = true;
  try {
    await changePassword(passwordForm.value.currentPassword, passwordForm.value.newPassword);
    passwordSuccess.value = $t('auth.passwordUpdated');
    passwordForm.value = { currentPassword: '', newPassword: '' };
  } catch (e) {
    passwordError.value = e.response?.data?.error || e.message || $t('auth.errorGeneric');
  } finally {
    passwordLoading.value = false;
  }
}
</script>
