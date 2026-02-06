<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <h1 class="text-2xl font-semibold text-slate-900">{{ $t('cardList.title') }}</h1>
      <div class="flex flex-wrap gap-2">
        <select
          v-model="filterStatus"
          class="rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8"
        >
          <option value="">{{ $t('cardList.allStatuses') }}</option>
          <option v-for="s in CARD_STATUSES" :key="s.value" :value="s.value">{{ $t('status.' + s.value) }}</option>
        </select>
        <select
          v-model="filterBank"
          class="rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8"
        >
          <option value="">{{ $t('cardList.allBanks') }}</option>
          <option v-for="b in BANKS" :key="b" :value="b">{{ b }}</option>
        </select>
        <select
          v-model="filterPointsType"
          class="rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8"
        >
          <option value="">{{ $t('cardList.allPointTypes') }}</option>
          <option v-for="p in POINTS_TYPES" :key="p" :value="p">{{ pointsTypeLabel(p) }}</option>
        </select>
      </div>
    </div>
    <p v-if="loading" class="text-slate-600">{{ $t('cardList.loading') }}</p>
    <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>
    <div v-else class="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-slate-200">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-900">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.card') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.type') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.bank') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.status') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.pointsType') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.pointsValue') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.annualCost') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white">{{ $t('cardList.lastSnapshot') }}</th>
            <th scope="col" class="relative px-4 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="card in filteredCards" :key="card.id" class="hover:bg-slate-50/50">
            <td class="whitespace-nowrap px-4 py-3">
              <router-link :to="`/cards/${card.id}`" class="font-medium text-primary-600 hover:text-primary-700">{{ card.cardName }}</router-link>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ card.type }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ card.bank }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ statusLabel(card.status) }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ pointsTypeLabel(card.pointsType) }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ card.pointsValue ?? '–' }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ card.annualCost != null ? `$${card.annualCost}` : '–' }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
              <template v-if="card.lastSnapshot">{{ card.lastSnapshot.weekStartDate }}: {{ card.lastSnapshot.pointsValue }} pts</template>
              <span v-else>–</span>
            </td>
            <td class="whitespace-nowrap px-4 py-3">
              <div class="flex gap-2">
                <router-link :to="`/cards/${card.id}/snapshots`" class="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50">{{ $t('cardList.snapshots') }}</router-link>
                <button type="button" class="rounded-md px-2.5 py-1 text-sm font-medium text-red-600 ring-1 ring-red-300 hover:bg-red-50" @click="confirmDelete(card)">{{ $t('cardList.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p v-if="!loading && !error && filteredCards.length === 0" class="mt-4 text-slate-600">
      {{ $t('cardList.noCards') }} <router-link to="/cards/new" class="font-medium text-primary-600 hover:text-primary-700">{{ $t('cardList.addOne') }}</router-link>.
    </p>
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" @click.self="deleteTarget = null">
      <div class="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <p class="text-slate-700">{{ $t('cardList.deleteConfirm', { name: deleteTarget.cardName }) }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <button type="button" class="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" @click="deleteTarget = null">{{ $t('cardList.cancel') }}</button>
          <button type="button" class="rounded-md bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700" @click="doDelete">{{ $t('cardList.delete') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCards, deleteCard } from '../api/client';
import { useI18n } from 'vue-i18n';
import { CARD_STATUSES, BANKS, POINTS_TYPES, pointsTypeLabel } from '../constants';

const { t } = useI18n();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const cards = ref([]);
const filterStatus = ref('');
const filterBank = ref('');
const filterPointsType = ref('');
const deleteTarget = ref(null);

const filteredCards = computed(() => {
  let list = cards.value;
  if (filterStatus.value) list = list.filter((c) => c.status === filterStatus.value);
  if (filterBank.value) list = list.filter((c) => c.bank === filterBank.value);
  if (filterPointsType.value) list = list.filter((c) => c.pointsType === filterPointsType.value);
  return list;
});

function statusLabel(status) {
  const s = CARD_STATUSES.find((x) => x.value === status);
  return s ? t('status.' + status) : status;
}

async function load() {
  loading.value = true;
  error.value = null;
  try {
    cards.value = await getCards();
  } catch (e) {
    error.value = e.response?.data?.error || e.message;
  } finally {
    loading.value = false;
  }
}

function confirmDelete(card) {
  deleteTarget.value = card;
}

async function doDelete() {
  if (!deleteTarget.value) return;
  try {
    await deleteCard(deleteTarget.value.id);
    deleteTarget.value = null;
    await load();
  } catch (e) {
    error.value = e.response?.data?.error || e.message;
  }
}

onMounted(load);
</script>
