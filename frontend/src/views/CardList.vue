<template>
  <div>
    <PageHeader>
      <h1 class="font-display text-2xl font-bold text-slate-900">{{ $t('cardList.title') }}</h1>
      <template #actions>
        <AppSelect
          v-model="filterStatus"
          :options="statusOptions"
          :placeholder="$t('cardList.allStatuses')"
        />
        <AppSelect
          v-model="filterBank"
          :options="bankOptions"
          :placeholder="$t('cardList.allBanks')"
        />
        <AppSelect
          v-model="filterPointsType"
          :options="pointsTypeOptions"
          :placeholder="$t('cardList.allPointTypes')"
        />
      </template>
    </PageHeader>
    <p v-if="loading" class="text-slate-600">{{ $t('cardList.loading') }}</p>
    <p v-else-if="error" class="text-red-600 text-sm">{{ error }}</p>
    <div v-else class="overflow-hidden border border-slate-200 bg-white">
      <table class="min-w-full divide-y divide-slate-200">
        <thead class="bg-slate-50">
          <tr>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.card') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.type') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.bank') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.status') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.pointsType') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.pointsValue') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.annualCost') }}</th>
            <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600">{{ $t('cardList.lastSnapshot') }}</th>
            <th scope="col" class="relative px-4 py-3"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 bg-white">
          <tr v-for="card in filteredCards" :key="card.id" class="hover:bg-slate-50/80 transition">
            <td class="whitespace-nowrap px-4 py-3">
              <router-link :to="`/cards/${card.id}`" class="font-semibold text-primary-600 hover:text-primary-700">{{ card.cardName }}</router-link>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ card.type }}</td>
            <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">
              <div class="flex items-center gap-2">
                <BankLogo :bank="card.bank" size="sm" />
                <span>{{ card.bank }}</span>
              </div>
            </td>
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
                <router-link :to="`/cards/${card.id}/snapshots`" class="border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition">{{ $t('cardList.snapshots') }}</router-link>
                <button type="button" class="border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 transition" @click="confirmDelete(card)">{{ $t('cardList.delete') }}</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <EmptyState
      v-if="!loading && !error && filteredCards.length === 0"
      :title="$t('cardList.noCards')"
      :message="$t('cardList.addOne')"
      :action-label="$t('cardList.addOne')"
      action-to="/available-cards"
    />
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4" @click.self="deleteTarget = null">
      <div class="w-full max-w-sm border border-slate-200 bg-white p-6">
        <p class="text-slate-700">{{ $t('cardList.deleteConfirm', { name: deleteTarget.cardName }) }}</p>
        <div class="mt-4 flex justify-end gap-2">
          <AppButton variant="secondary" @click="deleteTarget = null">{{ $t('cardList.cancel') }}</AppButton>
          <AppButton variant="danger" @click="doDelete">{{ $t('cardList.delete') }}</AppButton>
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
import BankLogo from '../components/BankLogo.vue';
import PageHeader from '../components/PageHeader.vue';
import AppSelect from '../components/AppSelect.vue';
import EmptyState from '../components/EmptyState.vue';
import AppButton from '../components/AppButton.vue';

const { t } = useI18n();
const router = useRouter();
const loading = ref(true);
const error = ref(null);
const cards = ref([]);
const filterStatus = ref('');
const filterBank = ref('');
const filterPointsType = ref('');
const deleteTarget = ref(null);

const statusOptions = computed(() =>
  CARD_STATUSES.map((s) => ({ value: s.value, label: t('status.' + s.value) }))
);
const bankOptions = computed(() => BANKS.map((b) => ({ value: b, label: b })));
const pointsTypeOptions = computed(() =>
  POINTS_TYPES.map((p) => ({ value: p, label: pointsTypeLabel(p) }))
);

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
