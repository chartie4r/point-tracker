import { createRouter, createWebHistory } from 'vue-router';
import { useAuth } from '../composables/useAuth';

const routes = [
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue'), meta: { guest: true } },
  { path: '/register', name: 'Register', component: () => import('../views/Register.vue'), meta: { guest: true } },
  { path: '/forgot-password', name: 'ForgotPassword', component: () => import('../views/ForgotPassword.vue'), meta: { guest: true } },
  { path: '/reset-password/:token', name: 'ResetPassword', component: () => import('../views/ResetPassword.vue'), meta: { guest: true } },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue'), meta: { requiresAuth: true } },
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/privacy', name: 'Privacy', component: () => import('../views/Privacy.vue') },
  { path: '/terms', name: 'Terms', component: () => import('../views/Terms.vue') },
  { path: '/cards', name: 'CardList', component: () => import('../views/CardList.vue'), meta: { requiresAuth: true } },
  { path: '/available-cards', name: 'AvailableCards', component: () => import('../views/AvailableCardsList.vue') },
  { path: '/cards/new', name: 'CardNew', component: () => import('../views/CardForm.vue'), props: { id: null }, meta: { requiresAuth: true } },
  { path: '/cards/:id', name: 'CardDetails', component: () => import('../views/CardDetails.vue'), props: true, meta: { requiresAuth: true, cataloguePublic: true } },
  { path: '/cards/:id/edit', name: 'CardEdit', component: () => import('../views/CardForm.vue'), props: true, meta: { requiresAuth: true } },
  { path: '/cards/:id/snapshots', name: 'CardSnapshots', component: () => import('../views/CardSnapshots.vue'), props: true, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const { user, fetchUser, authReady } = useAuth();
  if (!authReady.value) {
    await fetchUser();
  }
  const isLoggedIn = !!user.value;
  const isSuperadmin = user.value?.role === 'superadmin';
  if (to.meta.requiresAuth && !isLoggedIn) {
    // Catalogue card detail is public when ?mode=catalogue
    if (to.meta.cataloguePublic && to.query.mode === 'catalogue') {
      // allow
    } else {
      return { name: 'Login', query: { redirect: to.fullPath } };
    }
  }
  if (to.meta.guest && isLoggedIn && !['ResetPassword'].includes(to.name)) {
    return { path: isSuperadmin ? '/available-cards' : '/cards' };
  }
  // Superadmin: cards list and edit go to catalogue; CardNew is allowed when adding from catalogue (prefill checked in component)
  if (isLoggedIn && isSuperadmin && ['CardList', 'CardEdit', 'CardSnapshots'].includes(to.name)) {
    return { path: '/available-cards' };
  }
});

export default router;
