<template>
  <div class="max-w-2xl">
    <PageHeader>
      <h1 class="font-display text-2xl font-bold text-slate-900">{{ id ? $t('cardForm.editCard') : $t('cardForm.newCard') }}</h1>
      <template #actions>
        <AppButton
          v-if="id && canRefreshFromMilesopedia"
          type="button"
          variant="outline"
          size="sm"
          :disabled="refreshing"
          @click="refreshFromMilesopedia"
        >
          {{ refreshing ? $t('cardForm.refreshingFromMilesopedia') : $t('cardForm.refreshFromMilesopedia') }}
        </AppButton>
      </template>
    </PageHeader>
    <p v-if="loadError" class="mb-4 text-sm text-red-600">{{ loadError }}</p>
    <form v-else @submit.prevent="submit" class="space-y-6">
      <div class="border border-slate-200 bg-white p-6">
        <AppInput v-model="form.cardName" type="text" required>
          {{ $t('cardForm.cardName') }}
        </AppInput>
      </div>
      <div class="border border-slate-200 bg-white p-6">
        <h2 class="mb-4 font-display text-sm font-bold text-slate-900">Type &amp; statut</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <AppSelect v-model="form.type" :options="typeOptions" required>
            <template #label>{{ $t('cardForm.type') }}</template>
          </AppSelect>
          <AppSelect v-model="form.status" :options="statusOptions" required>
            <template #label>{{ $t('cardForm.status') }}</template>
          </AppSelect>
          <AppSelect v-model="form.pointsType" :options="pointsTypeOptions" required>
            <template #label>{{ $t('cardForm.pointsType') }}</template>
          </AppSelect>
          <AppSelect v-model="form.bank" :options="bankOptions" required>
            <template #label>{{ $t('cardForm.bank') }}</template>
          </AppSelect>
        </div>
      </div>
      <div class="border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-sm font-semibold text-slate-900">Montants</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.lineOfCredit') }}</label>
            <input v-model.number="form.lineOfCredit" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.annualCost') }}</label>
            <input v-model.number="form.annualCost" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.pointsValue') }}</label>
            <input v-model.number="form.pointsValue" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.expenses') }}</label>
            <input v-model.number="form.expenses" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.progression') }}</label>
            <input v-model.number="form.progression" type="number" min="0" max="100" step="0.01" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
        </div>
      </div>
      <div class="border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-sm font-semibold text-slate-900">Dates</h2>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.openDate') }}</label>
            <input v-model="form.openDate" type="date" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.closeDate') }}</label>
            <input v-model="form.closeDate" type="date" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.possibleReopenDate') }}</label>
            <input v-model="form.possibleReopenDate" type="date" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.deadline') }}</label>
            <input v-model="form.deadline" type="date" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
        </div>
      </div>
      <div class="border border-slate-200 bg-white p-6">
        <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.pointsDetails') }}</label>
        <textarea v-model="form.pointsDetails" rows="3" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500"></textarea>
      </div>
      <div class="flex gap-3">
        <AppButton type="button" variant="secondary" size="md" @click="$router.push('/cards')">{{ $t('cardForm.cancel') }}</AppButton>
        <AppButton type="submit" variant="primary" size="md" :disabled="saving">{{ id ? $t('cardForm.update') : $t('cardForm.create') }}</AppButton>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth';
import { getCard, createCard, updateCard, refreshCardFromMilesopedia } from '../api/client';
import { CARD_TYPES, CARD_STATUSES, POINTS_TYPES, BANKS, pointsTypeLabel } from '../constants';
import PageHeader from '../components/PageHeader.vue';
import AppInput from '../components/AppInput.vue';
import AppSelect from '../components/AppSelect.vue';
import AppButton from '../components/AppButton.vue';

const { t: $t } = useI18n();

const props = defineProps({ id: { type: String, default: null } });
const route = useRoute();
const router = useRouter();
const { isSuperadmin } = useAuth();
const id = props.id ?? route.params.id;

const loadError = ref(null);
const saving = ref(false);
const refreshing = ref(false);

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

const typeOptions = computed(() => CARD_TYPES.map((t) => ({ value: t, label: t })));
const statusOptions = computed(() =>
  CARD_STATUSES.map((s) => ({ value: s.value, label: $t('status.' + s.value) }))
);
const pointsTypeOptions = computed(() =>
  POINTS_TYPES.map((p) => ({ value: p, label: pointsTypeLabel(p) }))
);
const bankOptions = computed(() => BANKS.map((b) => ({ value: b, label: b })));

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
  if (!id) {
    if (history.state?.prefill) {
      toForm(history.state.prefill);
    } else {
      // Adding a card is only allowed from the catalogue (prefill required)
      router.replace('/available-cards');
    }
  } else {
    loadCard();
  }
});
watch(() => route.params.id, loadCard);
</script>

