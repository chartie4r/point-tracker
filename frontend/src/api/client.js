import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

let onUnauthorized = () => {};
export function setAuthCallback(cb) {
  onUnauthorized = cb;
}

api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      onUnauthorized();
    }
    return Promise.reject(err);
  },
);

export async function getMe() {
  const { data } = await api.get('/api/auth/me');
  return data.user;
}

export async function login(email, password) {
  const { data } = await api.post('/api/auth/login', { email, password });
  return data.user;
}

export async function register(email, password, name) {
  const { data } = await api.post('/api/auth/register', { email, password, name });
  return data.user;
}

export async function logout() {
  await api.post('/api/auth/logout');
}

export async function updateProfile(payload) {
  const { data } = await api.patch('/api/auth/me', payload);
  return data.user;
}

export async function changePassword(currentPassword, newPassword) {
  await api.post('/api/auth/change-password', { currentPassword, newPassword });
}

export async function forgotPassword(email) {
  const { data } = await api.post('/api/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(token, newPassword) {
  const { data } = await api.post('/api/auth/reset-password', { token, newPassword });
  return data.user;
}

export async function getCards() {
  const { data } = await api.get('/api/cards');
  return data;
}

export async function getCard(id) {
  const { data } = await api.get(`/api/cards/${id}`);
  return data;
}

export async function createCard(payload) {
  const { data } = await api.post('/api/cards', payload);
  return data;
}

export async function updateCard(id, payload) {
  const { data } = await api.put(`/api/cards/${id}`, payload);
  return data;
}

export async function deleteCard(id) {
  await api.delete(`/api/cards/${id}`);
}

export async function getSnapshots(cardId, params = {}) {
  const { data } = await api.get(`/api/cards/${cardId}/snapshots`, { params });
  return data;
}

export async function createSnapshot(cardId, payload) {
  const { data } = await api.post(`/api/cards/${cardId}/snapshots`, payload);
  return data;
}

export async function updateSnapshot(id, payload) {
  const { data } = await api.put(`/api/snapshots/${id}`, payload);
  return data;
}

export async function deleteSnapshot(id) {
  await api.delete(`/api/snapshots/${id}`);
}

export async function getAvailableCards() {
  const { data } = await api.get('/api/available-cards');
  return { cards: data.cards ?? data, lastRefreshedAt: data.lastRefreshedAt ?? null };
}

/** useAi: when true, run Claude extraction for min spend / conditions. */
export async function refreshAvailableCard(id, useAi = false) {
  const url = useAi ? `/api/available-cards/${id}/refresh?useAi=true` : `/api/available-cards/${id}/refresh`;
  const { data } = await api.post(url);
  return data;
}

export async function refreshCardFromMilesopedia(id) {
  const { data } = await api.post(`/api/cards/${id}/refresh-from-milesopedia`);
  return data;
}

/** Fire-and-forget: starts catalog refresh, returns immediately with 202. useAi: when true, runs Claude extraction (costs API calls). */
export async function scrapeMilesopedia(useAi = false) {
  const url = useAi ? '/api/scrape/milesopedia?useAi=true' : '/api/scrape/milesopedia';
  const { data, status } = await api.post(url);
  return { accepted: status === 202, ...data };
}
