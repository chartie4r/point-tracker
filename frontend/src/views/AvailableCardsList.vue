<template>
  <div class="w-full">
    <h1 class="text-2xl font-semibold text-slate-900">{{ $t('availableCards.title') }}</h1>
    <p class="mt-1 text-slate-600">{{ $t('availableCards.intro') }}</p>
    <div v-if="isSuperadmin" class="mt-4 flex flex-wrap items-center gap-3">
      <button
        type="button"
        class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        :disabled="refreshing || loading"
        @click="refreshCatalog"
      >
        {{ refreshing ? $t('availableCards.refreshingFromMilesopedia') : $t('availableCards.refreshFromMilesopedia') }}
      </button>
      <span v-if="lastRefreshedAt" class="text-sm text-slate-500">{{ $t('availableCards.lastRefreshed') }}: {{ formatDate(lastRefreshedAt) }}</span>
      <p v-if="refreshStartedMessage" class="w-full text-sm text-emerald-600">{{ refreshStartedMessage }}</p>
    </div>
    <div v-else-if="lastRefreshedAt" class="mt-4 text-sm text-slate-500">{{ $t('availableCards.lastRefreshed') }}: {{ formatDate(lastRefreshedAt) }}</div>
    <p v-if="loading" class="mt-4 text-slate-600">{{ $t('availableCards.loading') }}</p>
    <p v-else-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    <div v-else class="mt-4 flex flex-wrap items-center gap-2">
      <select v-model="filterBank" class="rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8">
        <option value="">{{ $t('availableCards.allBanks') }}</option>
        <option v-for="b in BANKS" :key="b" :value="b">{{ b }}</option>
      </select>
      <select v-model="filterType" class="rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8">
        <option value="">{{ $t('availableCards.allTypes') }}</option>
        <option v-for="t in CARD_TYPES" :key="t" :value="t">{{ t }}</option>
      </select>
      <select v-model="filterPointsType" class="rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8">
        <option value="">{{ $t('availableCards.allPointTypes') }}</option>
        <option v-for="p in POINTS_TYPES" :key="p" :value="p">{{ pointsTypeLabel(p) }}</option>
      </select>
      <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input v-model="filterNoAnnualCost" type="checkbox" class="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
        {{ $t('availableCards.noAnnualCost') }}
      </label>
      <span class="text-sm text-slate-500">{{ $t('availableCards.sortBy') }}</span>
      <select v-model="sortOrder" class="min-w-[12rem] rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm py-1.5 pl-2 pr-8">
        <option value="">{{ $t('availableCards.sortByName') }}</option>
        <option value="valueY1Desc">{{ $t('availableCards.sortByValueY1Desc') }}</option>
        <option value="valueY1Asc">{{ $t('availableCards.sortByValueY1Asc') }}</option>
      </select>
    </div>
    <ul v-if="!loading && !error" class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="card in pagedCards" :key="cardKey(card)" class="flex flex-col rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
        <div class="mb-2 flex items-center justify-between">
          <div class="h-8 w-12 overflow-hidden rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0" :title="card.bank">
            <img v-if="getBankLogoUrl(card.bank)" :src="getBankLogoUrl(card.bank)" :alt="card.bank" class="h-full w-full object-contain" />
            <span v-else class="text-xs font-bold text-slate-500">{{ getBankInitials(card.bank) }}</span>
          </div>
          <CardNetworkLogo :type="card.type" />
        </div>
        <strong class="text-slate-900">{{ card.cardName }}</strong>
        <span class="text-sm text-slate-500">{{ card.bank }} · {{ card.type }} · {{ pointsTypeLabel(card.pointsType) }}</span>
        <div class="mt-1 flex flex-col gap-0.5 text-sm">
          <span v-if="card.welcomeValueY1 != null" class="font-semibold text-emerald-600">{{ $t('availableCards.valueFirstYear') }}: ${{ card.welcomeValueY1 }}</span>
          <span v-if="card.annualCost != null" class="text-slate-700">{{ $t('availableCards.annualCost') }}: ${{ card.annualCost }} {{ $t('availableCards.perYear') }}</span>
        </div>
        <div class="mt-auto flex flex-wrap gap-2 pt-3">
          <router-link :to="{ name: 'CardNew', state: { prefill: toPrefill(card) } }" class="rounded-md bg-primary-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-primary-700">
            {{ $t('availableCards.addToMyCards') }}
          </router-link>
          <button type="button" class="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" @click="showDetails(card)">{{ $t('availableCards.details') }}</button>
          <button v-if="isSuperadmin" type="button" class="rounded-md bg-white px-2.5 py-1 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50" :disabled="rowRefreshingId === card.id || refreshing || loading" @click="refreshOne(card)">
            {{ rowRefreshingId === card.id ? $t('availableCards.refreshing') : $t('availableCards.refresh') }}
          </button>
        </div>
      </li>
    </ul>
    <p v-if="!loading && !error && sortedFilteredCards.length === 0" class="mt-4 text-slate-600">{{ $t('availableCards.noMatch') }}</p>
    <div v-if="totalPages > 1 && !loading && !error && sortedFilteredCards.length > 0" class="mt-6 flex items-center justify-center gap-3">
      <button type="button" class="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50" :disabled="page === 1" @click="page--">{{ $t('availableCards.prev') }}</button>
      <span class="text-sm text-slate-600">{{ $t('availableCards.page') }} {{ page }} / {{ totalPages }}</span>
      <button type="button" class="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50" :disabled="page === totalPages" @click="page++">{{ $t('availableCards.next') }}</button>
    </div>
    <div v-if="selectedCard" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" @click.self="closeDetails">
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl bg-white p-6 shadow-xl ring-1 ring-slate-200">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">{{ $t('availableCards.cardDetails') }}</h2>
        <dl class="space-y-2 text-sm">
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.name') }}</dt><dd class="text-slate-900">{{ selectedCard.cardName }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.bank') }}</dt><dd class="text-slate-900">{{ selectedCard.bank }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.type') }}</dt><dd class="text-slate-900">{{ selectedCard.type }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.pointsType') }}</dt><dd class="text-slate-900">{{ pointsTypeLabel(selectedCard.pointsType) }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.annualCost') }}</dt><dd class="text-slate-900">{{ selectedCard.annualCost != null ? `$${selectedCard.annualCost}` : $t('availableCards.na') }}</dd></div>
          <template v-if="selectedCard.welcomeValueY1 != null || selectedCard.welcomeValueY2 != null">
            <div><dt class="font-medium text-slate-500">{{ $t('availableCards.welcomeBonusValue') }}</dt><dd class="text-slate-900"><span v-if="selectedCard.welcomeValueY1 != null">{{ $t('availableCards.year1') }}: ${{ selectedCard.welcomeValueY1 }}</span><span v-if="selectedCard.welcomeValueY2 != null"><span v-if="selectedCard.welcomeValueY1 != null"> | </span>{{ $t('availableCards.years2Plus') }}: ${{ selectedCard.welcomeValueY2 }}</span></dd></div>
          </template>
          <div v-if="selectedCard.minSpend != null"><dt class="font-medium text-slate-500">{{ $t('availableCards.minimumSpend') }}</dt><dd class="text-slate-900">${{ selectedCard.minSpend }}</dd></div>
          <div v-if="selectedCard.bonusDetails"><dt class="font-medium text-slate-500">{{ $t('availableCards.bonusDetails') }}</dt><dd class="whitespace-pre-line text-slate-700">{{ selectedCard.bonusDetails }}</dd></div>
          <div v-if="selectedCard.milesopediaUrl"><dt class="font-medium text-slate-500">Milesopedia</dt><dd><a :href="selectedCard.milesopediaUrl" target="_blank" rel="noopener noreferrer" class="font-medium text-primary-600 hover:text-primary-700">{{ $t('availableCards.openCardPage') }}</a></dd></div>
        </dl>
        <div class="mt-6 flex justify-end gap-2">
          <button type="button" class="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" @click="closeDetails">{{ $t('availableCards.close') }}</button>
          <router-link :to="{ name: 'CardNew', state: { prefill: toPrefill(selectedCard) } }" class="rounded-md bg-primary-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-700" @click.native="closeDetails">{{ $t('availableCards.addToMyCards') }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { getAvailableCards, scrapeMilesopedia, refreshAvailableCard } from '../api/client';
import { CARD_TYPES, BANKS, POINTS_TYPES, pointsTypeLabel } from '../constants';
import { getBankLogoUrl, getBankInitials } from '../utils/logos';
import CardNetworkLogo from '../components/CardNetworkLogo.vue';

const route = useRoute();
const router = useRouter();
const { isSuperadmin } = useAuth();

const loading = ref(true);
const error = ref(null);
const cards = ref([]);
const lastRefreshedAt = ref(null);
const refreshing = ref(false);
const refreshStartedMessage = ref('');
const rowRefreshingId = ref(null);
const selectedCard = ref(null);
const filterBank = ref('');
const filterType = ref('');
const filterPointsType = ref('');
const filterNoAnnualCost = ref(false);
const sortOrder = ref('valueY1Desc');
const page = ref(1);
const pageSize = 30;

const DEFAULT_SORT = 'valueY1Desc';

function applyQueryToState() {
  const q = route.query;
  filterBank.value = typeof q.bank === 'string' ? q.bank : '';
  filterType.value = typeof q.type === 'string' ? q.type : '';
  filterPointsType.value = typeof q.pointsType === 'string' ? q.pointsType : '';
  filterNoAnnualCost.value = q.noAnnualCost === '1' || q.noAnnualCost === 'true';
  sortOrder.value = q.sort === 'valueY1Asc' || q.sort === 'valueY1Desc' || q.sort === '' ? (q.sort || DEFAULT_SORT) : DEFAULT_SORT;
  const p = parseInt(q.page, 10);
  page.value = Number.isFinite(p) && p >= 1 ? p : 1;
}

function stateToQuery() {
  const q = {};
  if (filterBank.value) q.bank = filterBank.value;
  if (filterType.value) q.type = filterType.value;
  if (filterPointsType.value) q.pointsType = filterPointsType.value;
  if (filterNoAnnualCost.value) q.noAnnualCost = '1';
  if (sortOrder.value !== DEFAULT_SORT) q.sort = sortOrder.value;
  if (page.value > 1) q.page = String(page.value);
  return q;
}

function pushQuery() {
  const q = stateToQuery();
  const same =
    (route.query.bank || '') === (q.bank || '') &&
    (route.query.type || '') === (q.type || '') &&
    (route.query.pointsType || '') === (q.pointsType || '') &&
    (route.query.noAnnualCost || '') === (q.noAnnualCost || '') &&
    (route.query.sort || DEFAULT_SORT) === (q.sort || DEFAULT_SORT) &&
    (route.query.page || '1') === (q.page || '1');
  if (same) return;
  router.replace({ name: route.name, query: q });
}

const filteredCards = computed(() => {
  let list = cards.value;
  if (filterBank.value) list = list.filter((c) => c.bank === filterBank.value);
  if (filterType.value) list = list.filter((c) => c.type === filterType.value);
  if (filterPointsType.value) list = list.filter((c) => c.pointsType === filterPointsType.value);
  if (filterNoAnnualCost.value) list = list.filter((c) => c.annualCost == null || c.annualCost === 0);
  return list;
});

const sortedFilteredCards = computed(() => {
  const list = [...filteredCards.value];
  if (sortOrder.value === 'valueY1Desc') {
    list.sort((a, b) => (b.welcomeValueY1 ?? -1) - (a.welcomeValueY1 ?? -1));
  } else if (sortOrder.value === 'valueY1Asc') {
    list.sort((a, b) => (a.welcomeValueY1 ?? 1e9) - (b.welcomeValueY1 ?? 1e9));
  } else {
    list.sort((a, b) => (a.cardName || '').localeCompare(b.cardName || ''));
  }
  return list;
});

const totalPages = computed(() =>
  sortedFilteredCards.value.length ? Math.ceil(sortedFilteredCards.value.length / pageSize) : 1,
);

const pagedCards = computed(() => {
  const start = (page.value - 1) * pageSize;
  return sortedFilteredCards.value.slice(start, start + pageSize);
});

watch([filterBank, filterType, filterPointsType, filterNoAnnualCost, sortOrder], () => {
  page.value = 1;
});

watch(
  () => [filterBank.value, filterType.value, filterPointsType.value, filterNoAnnualCost.value, sortOrder.value, page.value],
  () => pushQuery(),
  { deep: true },
);

watch(
  () => route.query,
  () => applyQueryToState(),
  { deep: true },
);

function cardKey(card) {
  return `${card.cardName}-${card.bank}-${card.type}`;
}

function toPrefill(card) {
  return {
    cardName: card.cardName,
    type: card.type,
    status: 'To_Open',
    pointsType: card.pointsType,
    bank: card.bank,
    annualCost: card.annualCost ?? null,
  };
}

function showDetails(card) {
  selectedCard.value = card;
}

function closeDetails() {
  selectedCard.value = null;
}

async function loadCatalog() {
  loading.value = true;
  error.value = null;
  try {
    const data = await getAvailableCards();
    cards.value = data.cards ?? [];
    lastRefreshedAt.value = data.lastRefreshedAt ?? null;
  } catch (e) {
    error.value = e.response?.data?.error || e.message;
  } finally {
    loading.value = false;
  }
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(d);
}

async function refreshCatalog() {
  console.log('[AvailableCards] Refresh all cards: starting (fire-and-forget)…');
  refreshing.value = true;
  error.value = null;
  refreshStartedMessage.value = '';
  try {
    const result = await scrapeMilesopedia();
    if (result.accepted) {
      refreshStartedMessage.value = result.message || 'Refresh started in the background. Reload the list in a few minutes.';
      console.log('[AvailableCards] Refresh all cards: accepted, background job started');
      setTimeout(() => { refreshStartedMessage.value = ''; }, 8000);
    } else {
      await loadCatalog();
    }
  } catch (e) {
    const msg = e.response?.data?.error || e.message;
    console.error('[AvailableCards] Refresh all cards: error', msg);
    error.value = msg;
  } finally {
    refreshing.value = false;
  }
}

async function refreshOne(card) {
  rowRefreshingId.value = card.id;
  try {
    const updated = await refreshAvailableCard(card.id);
    cards.value = cards.value.map((c) => (c.id === updated.id ? updated : c));
  } catch (e) {
    alert(e.response?.data?.error || e.message);
  } finally {
    rowRefreshingId.value = null;
  }
}

onMounted(() => {
  applyQueryToState();
  loadCatalog();
});
</script>
