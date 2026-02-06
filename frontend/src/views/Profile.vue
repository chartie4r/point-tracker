<template>
  <div class="mx-auto max-w-lg">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('auth.profileTitle') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('auth.profileIntro') }}</p>

    <form class="mt-6 space-y-4" @submit.prevent="saveProfile">
      <div>
        <label for="profile-email" class="block text-sm font-medium text-slate-700">{{ $t('auth.email') }}</label>
        <input
          id="profile-email"
          v-model="form.email"
          type="email"
          required
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label for="profile-name" class="block text-sm font-medium text-slate-700">{{ $t('auth.name') }}</label>
        <input
          id="profile-name"
          v-model="form.name"
          type="text"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <p v-if="profileError" class="text-sm text-red-600">{{ profileError }}</p>
      <p v-if="profileSuccess" class="text-sm text-emerald-600">{{ profileSuccess }}</p>
      <button
        type="submit"
        class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        :disabled="profileLoading"
      >
        {{ profileLoading ? $t('auth.loading') : $t('auth.saveProfile') }}
      </button>
    </form>

    <hr class="my-8 border-slate-200" />
    <h2 class="text-lg font-medium text-slate-900">{{ $t('auth.changePasswordTitle') }}</h2>
    <form class="mt-4 space-y-4" @submit.prevent="savePassword">
      <div>
        <label for="current-password" class="block text-sm font-medium text-slate-700">{{ $t('auth.currentPassword') }}</label>
        <input
          id="current-password"
          v-model="passwordForm.currentPassword"
          type="password"
          required
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
      </div>
      <div>
        <label for="new-password" class="block text-sm font-medium text-slate-700">{{ $t('auth.newPassword') }}</label>
        <input
          id="new-password"
          v-model="passwordForm.newPassword"
          type="password"
          required
          minlength="8"
          class="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        />
        <p class="mt-0.5 text-xs text-slate-500">{{ $t('auth.passwordMin') }}</p>
      </div>
      <p v-if="passwordError" class="text-sm text-red-600">{{ passwordError }}</p>
      <p v-if="passwordSuccess" class="text-sm text-emerald-600">{{ passwordSuccess }}</p>
      <button
        type="submit"
        class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
        :disabled="passwordLoading"
      >
        {{ passwordLoading ? $t('auth.loading') : $t('auth.changePassword') }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useAuth } from '../composables/useAuth';
import { updateProfile, changePassword } from '../api/client';

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
    profileSuccess.value = 'Profile updated.';
  } catch (e) {
    profileError.value = e.response?.data?.error || e.message || 'Update failed';
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
    passwordSuccess.value = 'Password updated.';
    passwordForm.value = { currentPassword: '', newPassword: '' };
  } catch (e) {
    passwordError.value = e.response?.data?.error || e.message || 'Change failed';
  } finally {
    passwordLoading.value = false;
  }
}
</script>
