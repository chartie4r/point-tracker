<template>
  <div>
    <div class="mb-6 flex flex-wrap items-center gap-4">
      <router-link to="/cards" class="text-sm font-medium text-primary-600 hover:text-primary-700">← {{ $t('snapshots.backToCards') }}</router-link>
      <h1 class="text-2xl font-semibold text-slate-900">
        <template v-if="card">{{ card.cardName }} – {{ $t('snapshots.title') }}</template>
        <template v-else>{{ $t('snapshots.titleShort') }}</template>
      </h1>
      <router-link v-if="card" :to="`/cards/${card.id}`" class="border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-whiteer">{{ $t('snapshots.editCard') }}</router-link>
    </div>
    <p v-if="loadError" class="mb-4 text-sm text-red-400">{{ loadError }}</p>
    <template v-else-if="card">
      <div class="mb-6 border border-slate-200 bg-white p-6">
        <h2 class="mb-4 text-lg font-semibold text-slate-900">{{ $t('snapshots.addSnapshot') }}</h2>
        <form @submit.prevent="addSnapshot" class="flex flex-wrap items-end gap-4">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('snapshots.weekStart') }}</label>
            <input v-model="newSnapshot.weekStartDate" type="date" required class="block border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('snapshots.pointsValue') }}</label>
            <input v-model.number="newSnapshot.pointsValue" type="number" min="0" required class="block w-24 border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('snapshots.expenses') }}</label>
            <input v-model.number="newSnapshot.expenses" type="number" min="0" class="block w-24 border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-700">{{ $t('snapshots.notes') }}</label>
            <input v-model="newSnapshot.notes" type="text" class="block w-48 border border-slate-200 bg-slate-50 py-2 px-3 text-sm text-slate-900 placeholder-slate-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500" />
          </div>
          <button type="submit" class="border-2 border-violet-500 bg-violet-500 px-4 py-2 text-sm font-medium text-white hover:bg-violet-600 disabled:opacity-50" :disabled="adding">{{ $t('snapshots.add') }}</button>
        </form>
      </div>
      <div class="border border-slate-200 bg-white">
        <h2 class="border-b border-slate-200 px-6 py-4 text-lg font-semibold text-slate-900">{{ $t('snapshots.history') }}</h2>
        <p v-if="loading" class="p-6 text-slate-600">{{ $t('snapshots.loading') }}</p>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50">
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">{{ $t('snapshots.weekStartCol') }}</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">{{ $t('snapshots.pointsValue') }}</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">{{ $t('snapshots.expenses') }}</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600">{{ $t('snapshots.notes') }}</th>
                <th scope="col" class="relative px-4 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 bg-white">
              <tr v-for="s in snapshots" :key="s.id" class="hover:bg-whiteer/50">
                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ s.weekStartDate }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ s.pointsValue }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600">{{ s.expenses ?? '–' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600">{{ s.notes || '–' }}</td>
                <td class="whitespace-nowrap px-4 py-3">
                  <button type="button" class="text-sm font-medium text-red-400 hover:text-red-300" @click="removeSnapshot(s)">{{ $t('snapshots.delete') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-if="!loading && snapshots.length === 0" class="p-6 text-slate-600">{{ $t('snapshots.noSnapshots') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getCard, getSnapshots, createSnapshot, deleteSnapshot } from '../api/client';

const { t: $t } = useI18n();

const props = defineProps({ id: String });
const route = useRoute();
const cardId = computed(() => props.id || route.params.id);

const card = ref(null);
const loadError = ref(null);
const loading = ref(true);
const snapshots = ref([]);
const adding = ref(false);

const newSnapshot = reactive({
  weekStartDate: getDefaultWeekStart(),
  pointsValue: 0,
  expenses: null,
  notes: null,
});

function getDefaultWeekStart() {
  const d = new Date();
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  return d.toISOString().slice(0, 10);
}

async function loadCard() {
  if (!cardId.value) return;
  loadError.value = null;
  try {
    card.value = await getCard(cardId.value);
  } catch (e) {
    loadError.value = e.response?.data?.error || e.message;
  }
}

async function loadSnapshots() {
  if (!cardId.value) return;
  loading.value = true;
  try {
    snapshots.value = await getSnapshots(cardId.value);
  } catch (e) {
    loadError.value = e.response?.data?.error || e.message;
  } finally {
    loading.value = false;
  }
}

async function addSnapshot() {
  adding.value = true;
  try {
    await createSnapshot(cardId.value, {
      weekStartDate: newSnapshot.weekStartDate,
      pointsValue: newSnapshot.pointsValue,
      expenses: newSnapshot.expenses ?? undefined,
      notes: newSnapshot.notes || undefined,
    });
    newSnapshot.weekStartDate = getDefaultWeekStart();
    newSnapshot.pointsValue = 0;
    newSnapshot.expenses = null;
    newSnapshot.notes = null;
    await loadSnapshots();
  } catch (e) {
    alert(e.response?.data?.error || e.message);
  } finally {
    adding.value = false;
  }
}

async function removeSnapshot(s) {
  if (!confirm($t('snapshots.deleteConfirm'))) return;
  try {
    await deleteSnapshot(s.id);
    await loadSnapshots();
  } catch (e) {
    alert(e.response?.data?.error || e.message);
  }
}

onMounted(async () => {
  await loadCard();
  await loadSnapshots();
});
</script>
