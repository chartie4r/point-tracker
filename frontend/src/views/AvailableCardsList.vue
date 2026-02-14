<template>
  <div class="w-full">
    <PageHeader>
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{{ $t('availableCards.title') }}</h1>
        <p class="mt-1 text-slate-600 dark:text-slate-400">{{ $t('availableCards.intro') }}</p>
      </div>
      <template #actions>
        <template v-if="isSuperadmin">
          <AppButton
            type="button"
            variant="primary"
            size="md"
            :disabled="refreshing || loading"
            @click="refreshCatalog(false)"
          >
            {{ refreshing ? $t('availableCards.refreshingFromMilesopedia') : $t('availableCards.refreshFromMilesopedia') }}
          </AppButton>
          <AppButton
            type="button"
            variant="secondary"
            size="md"
            :disabled="refreshing || loading"
            @click="refreshCatalog(true)"
          >
            {{ refreshing ? $t('availableCards.refreshingWithAi') : $t('availableCards.refreshWithAi') }}
          </AppButton>
          <span v-if="lastRefreshedAt" class="text-sm text-slate-500 dark:text-slate-400">{{ $t('availableCards.lastRefreshed') }}: {{ formatDate(lastRefreshedAt) }}</span>
        </template>
        <span v-else-if="lastRefreshedAt" class="text-sm text-slate-500 dark:text-slate-400">{{ $t('availableCards.lastRefreshed') }}: {{ formatDate(lastRefreshedAt) }}</span>
      </template>
    </PageHeader>
    <p v-if="refreshStartedMessage" class="text-sm text-primary-600 dark:text-violet-400">{{ refreshStartedMessage }}</p>
    <p v-if="loading" class="mt-4 text-slate-600 dark:text-slate-400">{{ $t('availableCards.loading') }}</p>
    <p v-else-if="error" class="mt-4 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
    <div v-else class="mt-4 flex flex-wrap items-center gap-2">
      <AppSelect v-model="filterBank" :options="bankOptions" />
      <AppSelect v-model="filterType" :options="typeOptions" />
      <AppSelect v-model="filterPointsType" :options="pointsTypeOptions" />
      <AppSelect v-model="filterSegment" :options="segmentOptions" />
      <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
        <input v-model="filterNoAnnualCost" type="checkbox" class="border-slate-300 dark:border-slate-600 text-primary-500 focus:ring-primary-500 dark:accent-violet-500" />
        {{ $t('availableCards.noAnnualCost') }}
      </label>
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ $t('availableCards.sortBy') }}</span>
      <AppSelect v-model="sortOrder" :options="sortOptions" class="min-w-[12rem]" />
    </div>
    <ul v-if="!loading && !error" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="card in pagedCards"
        :key="cardKey(card)"
        class="group flex flex-col overflow-hidden rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 transition hover:border-primary-200 dark:hover:border-violet-500/50 sm:flex-row"
      >
        <!-- Credit card visual (same style as CardDetails) -->
        <div class="shrink-0 sm:w-[200px]">
          <div
            class="catalogue-card flex aspect-[1.586] flex-col justify-between p-4 sm:aspect-auto sm:h-full sm:min-h-[140px]"
            :style="{ background: getBankCardColor(card.bank) }"
          >
            <div class="flex items-start justify-between">
              <span class="text-xs font-bold tracking-wide text-white uppercase">{{ card.bank }}</span>
              <span v-if="catalogueCardPoints(card)" class="text-right text-xs font-bold tabular-nums text-white">
                {{ catalogueCardPoints(card) }} pts
              </span>
            </div>
            <div class="flex items-end justify-end -mr-1.5 -mb-1.5">
              <CardNetworkLogo :type="card.type" light class="flex-shrink-0 scale-90 sm:scale-100" />
            </div>
          </div>
        </div>
        <!-- Details + actions -->
        <div class="flex flex-1 flex-col p-4">
          <strong class="font-display text-slate-900 dark:text-slate-100">{{ card.cardName }}</strong>
          <span class="mt-0.5 text-sm text-slate-500 dark:text-slate-400">{{ card.isBusiness ? $t('availableCards.business') : $t('availableCards.personal') }} · {{ translatedPointsType(card.pointsType) }}</span>
          <div class="mt-2 flex flex-col gap-0.5 text-sm">
            <span v-if="card.noWelcomeBonus" class="font-medium text-slate-600 dark:text-slate-400">{{ $t('availableCards.noWelcomeOffer') }}</span>
            <span v-else-if="card.welcomeValueY1 != null" class="font-bold text-primary-600 dark:text-violet-400">{{ $t('availableCards.valueFirstYear') }}: ${{ card.welcomeValueY1 }}</span>
            <span v-if="card.annualCost != null" class="text-slate-600 dark:text-slate-400">{{ $t('availableCards.annualCost') }}: ${{ card.annualCost }} {{ $t('availableCards.perYear') }}</span>
          </div>
          <div class="mt-auto flex flex-wrap gap-2 pt-3">
            <AppButton :to="{ name: 'CardNew', state: { prefill: toPrefill(card) } }" variant="primary" size="sm">
              {{ $t('availableCards.addToMyCards') }}
            </AppButton>
            <AppButton
              :to="{ name: 'CardDetails', params: { id: card.id }, query: { mode: 'catalogue' } }"
              variant="outline"
              size="sm"
            >
              {{ $t('availableCards.details') }}
            </AppButton>
            <AppButton v-if="isSuperadmin" type="button" variant="outline" size="sm" :disabled="rowRefreshingId === card.id || refreshing || loading" @click="refreshOne(card, false)">
              {{ rowRefreshingId === card.id ? $t('availableCards.refreshing') : $t('availableCards.refresh') }}
            </AppButton>
            <AppButton v-if="isSuperadmin" type="button" variant="outline" size="sm" class="border-primary-200 bg-primary-50 text-primary-700 hover:bg-primary-100 dark:border-violet-500/50 dark:bg-violet-500/10 dark:text-violet-300" :disabled="rowRefreshingId === card.id || refreshing || loading" @click="refreshOne(card, true)">
              {{ rowRefreshingId === card.id ? $t('availableCards.refreshingWithAi') : $t('availableCards.refreshOneWithAi') }}
            </AppButton>
          </div>
        </div>
      </li>
    </ul>
    <EmptyState v-if="!loading && !error && sortedFilteredCards.length === 0" :title="$t('availableCards.noMatch')" />
    <div v-if="totalPages > 1 && !loading && !error && sortedFilteredCards.length > 0" class="mt-6 flex items-center justify-center gap-3">
      <AppButton type="button" variant="outline" size="sm" :disabled="page === 1" @click="page--">{{ $t('availableCards.prev') }}</AppButton>
      <span class="text-sm text-slate-500 dark:text-slate-400">{{ $t('availableCards.page') }} {{ page }} / {{ totalPages }}</span>
      <AppButton type="button" variant="outline" size="sm" :disabled="page === totalPages" @click="page++">{{ $t('availableCards.next') }}</AppButton>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth';
import { useTranslatedPointsType } from '../composables/useTranslatedPointsType';
import { getAvailableCards, scrapeMilesopedia, refreshAvailableCard } from '../api/client';
import { CARD_TYPES, BANKS, POINTS_TYPES, getBankCardColor } from '../constants';
import PageHeader from '../components/PageHeader.vue';
import AppSelect from '../components/AppSelect.vue';
import AppButton from '../components/AppButton.vue';
import EmptyState from '../components/EmptyState.vue';
import CardNetworkLogo from '../components/CardNetworkLogo.vue';

const route = useRoute();
const router = useRouter();
const { t: $t } = useI18n();
const { isSuperadmin } = useAuth();
const translatedPointsType = useTranslatedPointsType();

const bankOptions = computed(() => [{ value: '', label: $t('availableCards.allBanks') }, ...BANKS.map((b) => ({ value: b, label: b }))]);
const typeOptions = computed(() => [{ value: '', label: $t('availableCards.allTypes') }, ...CARD_TYPES.map((t) => ({ value: t, label: t }))]);
const pointsTypeOptions = computed(() => [{ value: '', label: $t('availableCards.allPointTypes') }, ...POINTS_TYPES.map((p) => ({ value: p, label: translatedPointsType(p) }))]);
const segmentOptions = computed(() => [
  { value: '', label: $t('availableCards.allSegments') },
  { value: 'personal', label: $t('availableCards.personal') },
  { value: 'business', label: $t('availableCards.business') },
]);
const sortOptions = computed(() => [
  { value: '', label: $t('availableCards.sortByName') },
  { value: 'valueY1Desc', label: $t('availableCards.sortByValueY1Desc') },
  { value: 'valueY1Asc', label: $t('availableCards.sortByValueY1Asc') },
]);

const loading = ref(true);
const error = ref(null);
const cards = ref([]);
const lastRefreshedAt = ref(null);
const refreshing = ref(false);
const refreshStartedMessage = ref('');
const rowRefreshingId = ref(null);
const filterBank = ref('');
const filterType = ref('');
const filterPointsType = ref('');
const filterSegment = ref('');
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
  filterSegment.value = q.segment === 'personal' || q.segment === 'business' ? q.segment : '';
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
  if (filterSegment.value) q.segment = filterSegment.value;
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
    (route.query.segment || '') === (q.segment || '') &&
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
  if (filterSegment.value === 'personal') list = list.filter((c) => !c.isBusiness);
  if (filterSegment.value === 'business') list = list.filter((c) => c.isBusiness === true);
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

watch([filterBank, filterType, filterPointsType, filterSegment, filterNoAnnualCost, sortOrder], () => {
  page.value = 1;
});

watch(
  () => [filterBank.value, filterType.value, filterPointsType.value, filterSegment.value, filterNoAnnualCost.value, sortOrder.value, page.value],
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

function catalogueCardPoints(card) {
  const levels = card.bonusLevels || [];
  if (!levels.length) return null;
  const sum = levels.reduce((acc, l) => acc + (l.rewardPoints ?? 0), 0);
  return sum > 0 ? sum.toLocaleString() : null;
}

function toPrefill(card) {
  const details = [];
  if (card.welcomeValueY1 != null && !card.noWelcomeBonus) details.push(`Prime 1ère année: $${card.welcomeValueY1}`);
  if (card.welcomeValueY2 != null) details.push(`Années 2+: $${card.welcomeValueY2}`);
  if (card.minSpend != null) details.push(`Dépense min.: $${card.minSpend}`);
  if (card.minSpendNotes) details.push(card.minSpendNotes);
  if (card.bonusDetails) details.push(card.bonusDetails);
  const bonusLevels = (card.bonusLevels || []).map((l, i) => ({
    order: l.order ?? i + 1,
    spendAmount: l.spendAmount ?? null,
    monthsFromOpen: l.monthsFromOpen ?? null,
    requirementType: 'spend',
    minTransactions: null,
    rewardPoints: l.rewardPoints ?? null,
    achievedAt: null,
  }));
  return {
    cardName: card.cardName,
    type: card.type,
    status: 'To_Open',
    pointsType: card.pointsType,
    bank: card.bank,
    annualCost: card.annualCost ?? null,
    milesopediaUrl: card.milesopediaUrl ?? null,
    milesopediaSlug: card.milesopediaSlug ?? null,
    pointsValue: card.welcomeValueY1 ?? null,
    pointsDetails: details.length ? details.join('\n') : null,
    bonusDetails: card.bonusDetails ? card.bonusDetails.split('\n')[0].trim() : null,
    firstYearFree: card.firstYearFree === true,
    loungeAccess: card.loungeAccess === true,
    loungeAccessDetails: card.loungeAccessDetails ?? null,
    noForeignTransactionFee: card.noForeignTransactionFee === true,
    travelInsurance: card.travelInsurance === true,
    travelInsuranceDetails: card.travelInsuranceDetails ?? null,
    annualTravelCredit: card.annualTravelCredit ?? null,
    isBusiness: card.isBusiness === true,
    bonusLevels,
  };
}

function showDetails(card) {
  router.push({ name: 'CardDetails', params: { id: card.id }, query: { mode: 'catalogue' } });
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

async function refreshCatalog(useAi = false) {
  console.log('[AvailableCards] Refresh all cards: starting (fire-and-forget)', useAi ? '(with AI)' : '');
  refreshing.value = true;
  error.value = null;
  refreshStartedMessage.value = '';
  try {
    const result = await scrapeMilesopedia(useAi);
    if (result.accepted) {
      const baseMsg = result.message || 'Refresh started in the background. Reload the list in a few minutes.';
      let suffix = '';
      if (result.puppeteer) suffix += ' (Puppeteer enabled.)';
      if (result.useAi) suffix += ' (AI extraction enabled.)';
      refreshStartedMessage.value = baseMsg + suffix;
      console.log('[AvailableCards] Refresh all cards: accepted', result.puppeteer ? '(Puppeteer)' : '', result.useAi ? '(AI)' : '');
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

async function refreshOne(card, useAi = false) {
  rowRefreshingId.value = card.id;
  try {
    const updated = await refreshAvailableCard(card.id, useAi);
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

<style scoped>
.catalogue-card {
  border: 1px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>
