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
        <h2 class="mb-4 font-display text-sm font-bold text-slate-900 dark:text-slate-100">{{ $t('cardForm.typeAndStatus') }}</h2>
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
          <div class="flex items-center gap-2 sm:col-span-2">
            <input id="form-isBusiness" v-model="form.isBusiness" type="checkbox" class="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
            <label for="form-isBusiness" class="text-sm font-medium text-slate-700">{{ $t('cardForm.businessCard') }}</label>
          </div>
        </div>
      </div>
      <div class="border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ $t('cardForm.amounts') }}</h2>
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
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('cardForm.rewardPoints') }}</label>
            <input v-model.number="form.rewardPoints" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
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
        <h2 class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ $t('cardForm.dates') }}</h2>
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
      <div class="border border-slate-200 bg-white p-6 dark:border-slate-600 dark:bg-slate-800">
        <h2 class="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{{ $t('cardForm.bonusLevels') }}</h2>
        <p class="mb-4 text-xs text-slate-500 dark:text-slate-400">{{ $t('cardForm.bonusLevelsHint') }}</p>
        <div v-for="(level, index) in form.bonusLevels" :key="index" class="mb-4 rounded border border-slate-200 bg-slate-50 p-4 dark:border-slate-600 dark:bg-slate-700/50">
          <div class="mb-2 flex items-center justify-between">
            <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{{ $t('cardForm.levelN', { n: index + 1 }) }}</span>
            <div class="flex gap-1">
              <button type="button" class="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600" :disabled="index === 0" @click="moveLevel(index, -1)">{{ $t('cardForm.moveUp') }}</button>
              <button type="button" class="rounded px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-600" :disabled="index === form.bonusLevels.length - 1" @click="moveLevel(index, 1)">{{ $t('cardForm.moveDown') }}</button>
              <button type="button" class="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30" @click="removeLevel(index)">{{ $t('cardForm.removeLevel') }}</button>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{{ $t('cardForm.requirementType') }}</label>
              <select v-model="level.requirementType" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100">
                <option value="spend">{{ $t('cardForm.requirementSpend') }}</option>
                <option value="transaction">{{ $t('cardForm.requirementTransaction') }}</option>
              </select>
            </div>
            <div v-if="level.requirementType === 'spend'">
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{{ $t('cardForm.spendAmount') }}</label>
              <input v-model.number="level.spendAmount" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div v-if="level.requirementType === 'transaction'">
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{{ $t('cardForm.minTransactions') }}</label>
              <input v-model.number="level.minTransactions" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{{ $t('cardForm.monthsFromOpen') }}</label>
              <input v-model.number="level.monthsFromOpen" type="number" min="1" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{{ $t('cardForm.rewardPointsLevel') }}</label>
              <input v-model.number="level.rewardPoints" type="number" min="0" step="1" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
            <div>
              <label class="mb-1 block text-xs font-medium text-slate-600 dark:text-slate-400">{{ $t('cardForm.achievedAt') }}</label>
              <input v-model="level.achievedAt" type="date" class="block w-full border border-slate-200 bg-white py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100" />
            </div>
          </div>
        </div>
        <AppButton type="button" variant="outline" size="sm" @click="addLevel">{{ $t('cardForm.addLevel') }}</AppButton>
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
import { useTranslatedPointsType } from '../composables/useTranslatedPointsType';
import { getCard, createCard, updateCard, refreshCardFromMilesopedia } from '../api/client';
import { CARD_TYPES, CARD_STATUSES, POINTS_TYPES, BANKS } from '../constants';
import PageHeader from '../components/PageHeader.vue';
import AppInput from '../components/AppInput.vue';
import AppSelect from '../components/AppSelect.vue';
import AppButton from '../components/AppButton.vue';

const { t: $t } = useI18n();
const translatedPointsType = useTranslatedPointsType();

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
  rewardPoints: null,
  pointsDetails: null,
  milesopediaUrl: null,
  milesopediaSlug: null,
  bonusDetails: null,
  firstYearFree: false,
  loungeAccess: false,
  loungeAccessDetails: null,
  noForeignTransactionFee: false,
  travelInsurance: false,
  travelInsuranceDetails: null,
  isBusiness: false,
  bonusLevels: [],
});

function defaultLevel(order = 1) {
  return {
    order,
    spendAmount: null,
    monthsFromOpen: null,
    requirementType: 'spend',
    minTransactions: null,
    rewardPoints: null,
    achievedAt: null,
  };
}

function addLevel() {
  form.bonusLevels.push(defaultLevel(form.bonusLevels.length + 1));
}

function removeLevel(index) {
  form.bonusLevels.splice(index, 1);
  renumberLevels();
}

function moveLevel(index, delta) {
  const newIndex = index + delta;
  if (newIndex < 0 || newIndex >= form.bonusLevels.length) return;
  const arr = form.bonusLevels;
  [arr[index], arr[newIndex]] = [arr[newIndex], arr[index]];
  renumberLevels();
}

function renumberLevels() {
  form.bonusLevels.forEach((level, i) => {
    level.order = i + 1;
  });
}

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
  form.rewardPoints = card.rewardPoints ?? null;
  form.pointsDetails = card.pointsDetails ?? null;
  form.milesopediaUrl = card.milesopediaUrl ?? null;
  form.milesopediaSlug = card.milesopediaSlug ?? null;
  form.bonusDetails = card.bonusDetails ?? null;
  form.firstYearFree = card.firstYearFree === true;
  form.loungeAccess = card.loungeAccess === true;
  form.loungeAccessDetails = card.loungeAccessDetails ?? null;
  form.noForeignTransactionFee = card.noForeignTransactionFee === true;
  form.travelInsurance = card.travelInsurance === true;
  form.travelInsuranceDetails = card.travelInsuranceDetails ?? null;
  form.isBusiness = card.isBusiness === true;
  const levels = card.bonusLevels && card.bonusLevels.length ? card.bonusLevels : [];
  form.bonusLevels = levels
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((l, i) => ({
      id: l.id,
      order: l.order ?? i + 1,
      spendAmount: l.spendAmount ?? null,
      monthsFromOpen: l.monthsFromOpen ?? null,
      requirementType: l.requirementType ?? 'spend',
      minTransactions: l.minTransactions ?? null,
      rewardPoints: l.rewardPoints ?? null,
      achievedAt: l.achievedAt ?? null,
    }));
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
    rewardPoints: form.rewardPoints ?? undefined,
    pointsDetails: form.pointsDetails || undefined,
    milesopediaUrl: form.milesopediaUrl || undefined,
    milesopediaSlug: form.milesopediaSlug || undefined,
    bonusDetails: form.bonusDetails || undefined,
    firstYearFree: form.firstYearFree,
    loungeAccess: form.loungeAccess,
    loungeAccessDetails: form.loungeAccessDetails || undefined,
    noForeignTransactionFee: form.noForeignTransactionFee,
    travelInsurance: form.travelInsurance,
    travelInsuranceDetails: form.travelInsuranceDetails || undefined,
    isBusiness: form.isBusiness,
    bonusLevels: form.bonusLevels.map((l, i) => ({
      order: l.order ?? i + 1,
      spendAmount: l.spendAmount ?? undefined,
      monthsFromOpen: l.monthsFromOpen ?? undefined,
      requirementType: l.requirementType ?? 'spend',
      minTransactions: l.requirementType === 'transaction' ? (l.minTransactions ?? undefined) : undefined,
      rewardPoints: l.rewardPoints ?? undefined,
      achievedAt: l.achievedAt || undefined,
    })),
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
      router.push({ name: 'CardList' });
    } else {
      await createCard(toPayload());
      router.push({ name: 'CardList' });
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
  POINTS_TYPES.map((p) => ({ value: p, label: translatedPointsType(p) }))
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

