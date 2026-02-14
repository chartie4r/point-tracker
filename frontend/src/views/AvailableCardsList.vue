<template>
  <div class="w-full">
    <PageHeader>
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">{{ $t('availableCards.title') }}</h1>
        <p class="mt-1 text-slate-600">{{ $t('availableCards.intro') }}</p>
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
          <span v-if="lastRefreshedAt" class="text-sm text-slate-500">{{ $t('availableCards.lastRefreshed') }}: {{ formatDate(lastRefreshedAt) }}</span>
        </template>
        <span v-else-if="lastRefreshedAt" class="text-sm text-slate-500">{{ $t('availableCards.lastRefreshed') }}: {{ formatDate(lastRefreshedAt) }}</span>
      </template>
    </PageHeader>
    <p v-if="refreshStartedMessage" class="text-sm text-primary-600">{{ refreshStartedMessage }}</p>
    <p v-if="loading" class="mt-4 text-slate-600">{{ $t('availableCards.loading') }}</p>
    <p v-else-if="error" class="mt-4 text-sm text-red-600">{{ error }}</p>
    <div v-else class="mt-4 flex flex-wrap items-center gap-2">
      <AppSelect v-model="filterCardSegment" :options="cardSegmentOptions" />
      <AppSelect v-model="filterBank" :options="bankOptions" />
      <AppSelect v-model="filterType" :options="typeOptions" />
      <AppSelect v-model="filterPointsType" :options="pointsTypeOptions" />
      <label class="flex cursor-pointer items-center gap-2 text-sm text-slate-700">
        <input v-model="filterNoAnnualCost" type="checkbox" class="border-slate-300 text-primary-500 focus:ring-primary-500" />
        {{ $t('availableCards.noAnnualCost') }}
      </label>
      <span class="text-sm text-slate-500">{{ $t('availableCards.sortBy') }}</span>
      <AppSelect v-model="sortOrder" :options="sortOptions" class="min-w-[12rem]" />
    </div>
    <ul v-if="!loading && !error" class="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <li v-for="card in pagedCards" :key="cardKey(card)" class="group flex flex-col border border-slate-200 bg-white p-5 transition hover:border-primary-200">
        <RouterLink
          :to="{ name: 'CardDetails', params: { id: card.id }, query: { mode: 'catalogue' } }"
          class="flex min-h-0 flex-1 flex-col text-left no-underline"
        >
          <div class="mb-2 flex items-center justify-between">
            <BankLogo :bank="card.bank" />
            <CardNetworkLogo :type="card.type" />
          </div>
          <div class="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <strong class="font-display text-slate-900">{{ card.cardName }}</strong>
            <span v-if="card.isBusiness" class="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">{{ $t('availableCards.pme') }}</span>
          </div>
          <span class="text-sm text-slate-500">{{ pointsTypeLabel(card.pointsType) }}</span>
          <div class="mt-1 flex flex-col gap-0.5 text-sm">
            <span v-if="card.noWelcomeBonus" class="font-medium text-slate-600">{{ $t('availableCards.noWelcomeOffer') }}</span>
            <span v-else-if="card.welcomeValueY1 != null" class="font-bold text-primary-600">{{ $t('availableCards.valueFirstYear') }}: ${{ card.welcomeValueY1 }}</span>
            <span v-if="card.annualCost != null" class="text-slate-600">{{ $t('availableCards.annualCost') }}: ${{ card.annualCost }} {{ $t('availableCards.perYear') }}</span>
          </div>
          <div class="mt-auto flex flex-wrap gap-2 pt-3" @click.stop>
            <AppButton :to="{ name: 'CardNew', state: { prefill: toPrefill(card) } }" variant="primary" size="sm">
              {{ $t('availableCards.addToMyCards') }}
            </AppButton>
          </div>
        </RouterLink>
      </li>
    </ul>
    <EmptyState v-if="!loading && !error && sortedFilteredCards.length === 0" :title="$t('availableCards.noMatch')" />
    <div v-if="totalPages > 1 && !loading && !error && sortedFilteredCards.length > 0" class="mt-6 flex items-center justify-center gap-3">
      <AppButton type="button" variant="outline" size="sm" :disabled="page === 1" @click="page--">{{ $t('availableCards.prev') }}</AppButton>
      <span class="text-sm text-slate-500">{{ $t('availableCards.page') }} {{ page }} / {{ totalPages }}</span>
      <AppButton type="button" variant="outline" size="sm" :disabled="page === totalPages" @click="page++">{{ $t('availableCards.next') }}</AppButton>
    </div>
    <div v-if="selectedCard" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" @click.self="closeDetails">
      <div class="max-h-[90vh] w-full max-w-lg overflow-y-auto border border-slate-200 bg-white p-6">
        <h2 class="mb-4 font-display text-lg font-bold text-slate-900">{{ $t('availableCards.cardDetails') }}</h2>
        <dl class="space-y-2 text-sm">
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.name') }}</dt><dd class="text-slate-800">{{ selectedCard.cardName }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.bank') }}</dt><dd class="text-slate-800">{{ selectedCard.bank }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.type') }}</dt><dd class="text-slate-800">{{ selectedCard.type }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.pointsType') }}</dt><dd class="text-slate-800">{{ pointsTypeLabel(selectedCard.pointsType) }}</dd></div>
          <div><dt class="font-medium text-slate-500">{{ $t('availableCards.annualCost') }}</dt><dd class="text-slate-800">{{ selectedCard.annualCost != null ? `$${selectedCard.annualCost}` : $t('availableCards.na') }}</dd></div>
          <template v-if="selectedCard.noWelcomeBonus || selectedCard.welcomeValueY1 != null || selectedCard.welcomeValueY2 != null">
            <div><dt class="font-medium text-slate-500">{{ $t('availableCards.welcomeBonusValue') }}</dt><dd class="text-slate-800"><span v-if="selectedCard.noWelcomeBonus">{{ $t('availableCards.noWelcomeOffer') }}</span><template v-else><span v-if="selectedCard.welcomeValueY1 != null" class="font-semibold text-primary-600">{{ $t('availableCards.year1') }}: ${{ selectedCard.welcomeValueY1 }}</span><span v-if="selectedCard.welcomeValueY2 != null"><span v-if="selectedCard.welcomeValueY1 != null"> | </span>{{ $t('availableCards.years2Plus') }}: ${{ selectedCard.welcomeValueY2 }}</span></template></dd></div>
          </template>
          <div v-if="selectedCard.minSpend != null || selectedCard.minSpendNotes"><dt class="font-medium text-slate-500">{{ $t('availableCards.minimumSpend') }}</dt><dd class="text-slate-800"><span v-if="selectedCard.minSpend != null">${{ selectedCard.minSpend }}</span><span v-if="selectedCard.minSpendNotes"><span v-if="selectedCard.minSpend != null"> — </span>{{ selectedCard.minSpendNotes }}</span></dd></div>
          <div v-if="selectedCard.bonusDetails"><dt class="font-medium text-slate-500">{{ $t('availableCards.bonusDetails') }}</dt><dd class="whitespace-pre-line text-slate-600">{{ selectedCard.bonusDetails }}</dd></div>
          <div v-if="selectedCard.milesopediaUrl"><dt class="font-medium text-slate-500">Milesopedia</dt><dd><a :href="selectedCard.milesopediaUrl" target="_blank" rel="noopener noreferrer" class="font-semibold text-primary-600 hover:text-primary-700 underline">{{ $t('availableCards.openCardPage') }}</a></dd></div>
        </dl>
        <div class="mt-6 flex justify-end gap-2">
          <AppButton type="button" variant="secondary" size="md" @click="closeDetails">{{ $t('availableCards.close') }}</AppButton>
          <AppButton type="button" variant="primary" size="md" @click="goAddAndClose">{{ $t('availableCards.addToMyCards') }}</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth';
import { getAvailableCards, scrapeMilesopedia } from '../api/client';
import { CARD_TYPES, BANKS, POINTS_TYPES, pointsTypeLabel } from '../constants';
import PageHeader from '../components/PageHeader.vue';
import AppSelect from '../components/AppSelect.vue';
import AppButton from '../components/AppButton.vue';
import EmptyState from '../components/EmptyState.vue';
import CardNetworkLogo from '../components/CardNetworkLogo.vue';
import BankLogo from '../components/BankLogo.vue';

const route = useRoute();
const router = useRouter();
const { t: $t } = useI18n();
const { isSuperadmin } = useAuth();

const bankOptions = computed(() => [{ value: '', label: $t('availableCards.allBanks') }, ...BANKS.map((b) => ({ value: b, label: b }))]);
const typeOptions = computed(() => [{ value: '', label: $t('availableCards.allTypes') }, ...CARD_TYPES.map((t) => ({ value: t, label: t }))]);
const pointsTypeOptions = computed(() => [{ value: '', label: $t('availableCards.allPointTypes') }, ...POINTS_TYPES.map((p) => ({ value: p, label: pointsTypeLabel(p) }))]);
const cardSegmentOptions = computed(() => [
  { value: 'personal', label: $t('availableCards.personal') },
  { value: 'pme', label: $t('availableCards.pme') },
  { value: 'all', label: $t('availableCards.allSegments') },
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
const selectedCard = ref(null);
const filterCardSegment = ref('personal');
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
  filterCardSegment.value = q.segment === 'pme' || q.segment === 'all' ? q.segment : 'personal';
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
  if (filterCardSegment.value !== 'personal') q.segment = filterCardSegment.value;
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
    (route.query.segment || 'personal') === (q.segment || 'personal') &&
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
  if (filterCardSegment.value === 'personal') list = list.filter((c) => !c.isBusiness);
  else if (filterCardSegment.value === 'pme') list = list.filter((c) => c.isBusiness === true);
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

watch([filterCardSegment, filterBank, filterType, filterPointsType, filterNoAnnualCost, sortOrder], () => {
  page.value = 1;
});

watch(
  () => [filterCardSegment.value, filterBank.value, filterType.value, filterPointsType.value, filterNoAnnualCost.value, sortOrder.value, page.value],
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
  const details = [];
  if (card.welcomeValueY1 != null && !card.noWelcomeBonus) details.push(`Prime 1ère année: $${card.welcomeValueY1}`);
  if (card.welcomeValueY2 != null) details.push(`Années 2+: $${card.welcomeValueY2}`);
  if (card.minSpend != null) details.push(`Dépense min.: $${card.minSpend}`);
  if (card.minSpendNotes) details.push(card.minSpendNotes);
  if (card.bonusDetails) details.push(card.bonusDetails);
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
    isBusiness: card.isBusiness === true,
  };
}

function showDetails(card) {
  selectedCard.value = card;
}

function closeDetails() {
  selectedCard.value = null;
}

function goAddAndClose() {
  const prefill = selectedCard.value ? toPrefill(selectedCard.value) : null;
  closeDetails();
  router.push({ name: 'CardNew', state: { prefill } });
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

onMounted(() => {
  applyQueryToState();
  loadCatalog();
});
</script>
