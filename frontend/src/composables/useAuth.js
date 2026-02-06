import { ref, computed } from 'vue';
import * as authApi from '../api/client';

const user = ref(null);
const loading = ref(false);
const authReady = ref(false);

export function useAuth() {
  const isAuthenticated = computed(() => !!user.value);
  const isSuperadmin = computed(() => user.value?.role === 'superadmin');

  async function fetchUser() {
    loading.value = true;
    try {
      user.value = await authApi.getMe();
      return user.value;
    } catch {
      user.value = null;
      return null;
    } finally {
      loading.value = false;
      authReady.value = true;
    }
  }

  async function login(email, password) {
    const u = await authApi.login(email, password);
    user.value = u;
    return u;
  }

  async function register(email, password, name) {
    const u = await authApi.register(email, password, name);
    user.value = u;
    return u;
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      user.value = null;
    }
  }

  return {
    user,
    loading,
    authReady,
    isAuthenticated,
    isSuperadmin,
    fetchUser,
    login,
    register,
    logout,
  };
}
