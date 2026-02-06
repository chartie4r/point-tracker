<template>
  <div class="max-w-2xl">
    <div class="mb-6 flex items-center justify-between gap-4">
      <h1 class="text-2xl font-semibold text-slate-900">{{ id ? $t('cardForm.editCard') : $t('cardForm.newCard') }}</h1>
      <button
        v-if="id && canRefreshFromMilesopedia"
        type="button"
        class="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50"
        :disabled="refreshing"
        @click="refreshFromMilesopedia"
      >
        {{ refreshing ? $t('cardForm.refreshingFromMilesopedia') : $t('cardForm.refreshFromMilesopedia') }}
      </button>
    </div>
    <p v-if="loadError" class="mb-4 text-sm text-red-600">{{ loadError }}</p>
    <form v-else @submit.prevent="submit" class="space-y-6">
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.cardName') }}</label>
        <input v-model="form.cardName" type="text" required class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
      </div>
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-4 text-sm font-semibold text-slate-900">Type &amp; statut</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.type') }}</label>
            <select v-model="form.type" required class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
              <option v-for="t in CARD_TYPES" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.status') }}</label>
            <select v-model="form.status" required class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
              <option v-for="s in CARD_STATUSES" :key="s.value" :value="s.value">{{ $t('status.' + s.value) }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.pointsType') }}</label>
            <select v-model="form.pointsType" required class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
              <option v-for="p in POINTS_TYPES" :key="p" :value="p">{{ pointsTypeLabel(p) }}</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.bank') }}</label>
            <select v-model="form.bank" required class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm">
              <option v-for="b in BANKS" :key="b" :value="b">{{ b }}</option>
            </select>
          </div>
        </div>
      </div>
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-4 text-sm font-semibold text-slate-900">Montants</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.lineOfCredit') }}</label>
            <input v-model.number="form.lineOfCredit" type="number" min="0" step="1" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.annualCost') }}</label>
            <input v-model.number="form.annualCost" type="number" min="0" step="1" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.pointsValue') }}</label>
            <input v-model.number="form.pointsValue" type="number" min="0" step="1" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.expenses') }}</label>
            <input v-model.number="form.expenses" type="number" min="0" step="1" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.progression') }}</label>
            <input v-model.number="form.progression" type="number" min="0" max="100" step="0.01" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
        </div>
      </div>
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 class="mb-4 text-sm font-semibold text-slate-900">Dates</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.openDate') }}</label>
            <input v-model="form.openDate" type="date" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.closeDate') }}</label>
            <input v-model="form.closeDate" type="date" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.possibleReopenDate') }}</label>
            <input v-model="form.possibleReopenDate" type="date" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.deadline') }}</label>
            <input v-model="form.deadline" type="date" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm" />
          </div>
        </div>
      </div>
      <div class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.pointsDetails') }}</label>
        <textarea v-model="form.pointsDetails" rows="3" class="block w-full rounded-md border border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 text-sm"></textarea>
      </div>
      <div class="flex gap-3">
        <button type="button" class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50" @click="$router.push('/cards')">{{ $t('cardForm.cancel') }}</button>
        <button type="submit" class="rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50" :disabled="saving">{{ id ? $t('cardForm.update') : $t('cardForm.create') }}</button>
      </div>
    </form>
    <div v-if="!id && isSuperadmin" class="mt-8 rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <h2 class="mb-2 text-lg font-semibold text-slate-900">{{ $t('cardForm.importFromMilesopedia') }}</h2>
      <p class="mb-4 text-sm text-slate-600">{{ $t('cardForm.importIntro') }}</p>
      <button type="button" class="rounded-md bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 disabled:opacity-50" :disabled="scraping" @click="fetchMilesopedia">{{ scraping ? $t('cardForm.fetching') : $t('cardForm.fetchFromMilesopedia') }}</button>
      <div v-if="milesopediaCards.length" class="mt-4">
        <p class="mb-2 text-sm font-medium text-slate-700">{{ $t('cardForm.selectCardToPrefill') }}</p>
        <ul class="space-y-1">
          <li v-for="c in milesopediaCards" :key="c.milesopediaSlug">
            <button type="button" class="text-left text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline" @click="applyMilesopediaCard(c)">
              {{ c.cardName }} ({{ c.bank }}, {{ c.type }}) – {{ c.annualCost != null ? `$${c.annualCost}` : '?' }} {{ $t('cardForm.annual') }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuth } from '../composables/useAuth';
import { getCard, createCard, updateCard, scrapeMilesopedia, refreshCardFromMilesopedia } from '../api/client';
import { CARD_TYPES, CARD_STATUSES, POINTS_TYPES, BANKS, pointsTypeLabel } from '../constants';

const props = defineProps({ id: { type: String, default: null } });
const route = useRoute();
const router = useRouter();
const { isSuperadmin } = useAuth();
const id = props.id ?? route.params.id;

const loadError = ref(null);
const saving = ref(false);
const scraping = ref(false);
const refreshing = ref(false);
const milesopediaCards = ref([]);

const form = reactive({
  cardName: '',
  type: 'VISA',
  status: 'To_Open',
  pointsType: 'Aeroplan',
  bank: 'TD',
  lineOfCredit: null,
  openDate: null,
  closeDate: null,
  possibleReopenDate: null,
  annualCost: null,
  progression: null,
  expenses: null,
  deadline: null,
  pointsValue: null,
  pointsDetails: null,
  milesopediaUrl: null,
  milesopediaSlug: null,
});

function toForm(card) {
  form.cardName = card.cardName ?? '';
  form.type = card.type ?? 'VISA';
  form.status = card.status ?? 'To_Open';
  form.pointsType = card.pointsType ?? 'Aeroplan';
  form.bank = card.bank ?? 'TD';
  form.lineOfCredit = card.lineOfCredit ?? null;
  form.openDate = card.openDate ?? null;
  form.closeDate = card.closeDate ?? null;
  form.possibleReopenDate = card.possibleReopenDate ?? null;
  form.annualCost = card.annualCost ?? null;
  form.progression = card.progression ?? null;
  form.expenses = card.expenses ?? null;
  form.deadline = card.deadline ?? null;
  form.pointsValue = card.pointsValue ?? null;
  form.pointsDetails = card.pointsDetails ?? null;
  form.milesopediaUrl = card.milesopediaUrl ?? null;
  form.milesopediaSlug = card.milesopediaSlug ?? null;
}

function toPayload() {
  return {
    cardName: form.cardName,
    type: form.type,
    status: form.status,
    pointsType: form.pointsType,
    bank: form.bank,
    lineOfCredit: form.lineOfCredit ?? undefined,
    openDate: form.openDate || undefined,
    closeDate: form.closeDate || undefined,
    possibleReopenDate: form.possibleReopenDate || undefined,
    annualCost: form.annualCost ?? undefined,
    progression: form.progression ?? undefined,
    expenses: form.expenses ?? undefined,
    deadline: form.deadline || undefined,
    pointsValue: form.pointsValue ?? undefined,
    pointsDetails: form.pointsDetails || undefined,
    milesopediaUrl: form.milesopediaUrl || undefined,
    milesopediaSlug: form.milesopediaSlug || undefined,
  };
}

async function loadCard() {
  if (!id) return;
  loadError.value = null;
  try {
    const card = await getCard(id);
    toForm(card);
  } catch (e) {
    loadError.value = e.response?.data?.error || e.message;
  }
}

async function submit() {
  saving.value = true;
  try {
    if (id) {
      await updateCard(id, toPayload());
      await loadCard();
    } else {
      const created = await createCard(toPayload());
      router.push(`/cards/${created.id}`);
    }
  } catch (e) {
    alert(e.response?.data?.error || e.message);
  } finally {
    saving.value = false;
  }
}

async function fetchMilesopedia() {
  scraping.value = true;
  milesopediaCards.value = [];
  try {
    milesopediaCards.value = await scrapeMilesopedia();
  } catch (e) {
    alert(e.response?.data?.error || e.message);
  } finally {
    scraping.value = false;
  }
}

function applyMilesopediaCard(c) {
  form.cardName = c.cardName ?? form.cardName;
  form.type = c.type ?? form.type;
  form.pointsType = c.pointsType ?? form.pointsType;
  form.bank = c.bank ?? form.bank;
  form.annualCost = c.annualCost ?? form.annualCost;
  form.milesopediaUrl = c.milesopediaUrl ?? null;
  form.milesopediaSlug = c.milesopediaSlug ?? null;
}

const canRefreshFromMilesopedia = computed(
  () => !!form.milesopediaUrl || !!form.milesopediaSlug,
);

async function refreshFromMilesopedia() {
  if (!id) return;
  refreshing.value = true;
  try {
    const updated = await refreshCardFromMilesopedia(id);
    toForm(updated);
  } catch (e) {
    alert(e.response?.data?.error || e.message);
  } finally {
    refreshing.value = false;
  }
}

onMounted(() => {
  if (!id && history.state?.prefill) {
    toForm(history.state.prefill);
  } else if (id) {
    loadCard();
  }
});
watch(() => route.params.id, loadCard);
</script>

