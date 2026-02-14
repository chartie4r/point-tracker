<template>
  <div>
    <PageHeader>
      <div>
        <h1 class="font-display text-2xl font-bold text-slate-900">
          <template v-if="card">{{ card.cardName }} – {{ $t('snapshots.title') }}</template>
          <template v-else>{{ $t('snapshots.titleShort') }}</template>
        </h1>
      </div>
      <template #actions>
        <AppButton to="/cards" variant="outline" size="sm">← {{ $t('snapshots.backToCards') }}</AppButton>
        <AppButton v-if="card" :to="`/cards/${card.id}/edit`" variant="outline" size="sm">
          {{ $t('snapshots.editCard') }}
        </AppButton>
      </template>
    </PageHeader>
    <p v-if="loadError" class="mb-4 text-sm text-red-400 dark:text-red-400">{{ loadError }}</p>
    <template v-else-if="card">
      <ContentCard class="mb-6" padding="md">
        <template #header>
          <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">{{ $t('snapshots.addSnapshot') }}</h2>
        </template>
        <form @submit.prevent="addSnapshot" class="flex flex-wrap items-end gap-4">
          <div>
            <AppInput v-model="newSnapshot.weekStartDate" type="date" required>
              {{ $t('snapshots.weekStart') }}
            </AppInput>
          </div>
          <div>
            <AppInput
              :model-value="String(newSnapshot.pointsValue ?? '')"
              type="number"
              min="0"
              required
              @update:model-value="newSnapshot.pointsValue = parseInt($event, 10) || 0"
            >
              {{ $t('snapshots.pointsValue') }}
            </AppInput>
          </div>
          <div>
            <AppInput
              :model-value="newSnapshot.expenses != null ? String(newSnapshot.expenses) : ''"
              type="number"
              min="0"
              @update:model-value="newSnapshot.expenses = $event === '' ? null : parseInt($event, 10) || 0"
            >
              {{ $t('snapshots.expenses') }}
            </AppInput>
          </div>
          <div>
            <AppInput v-model="newSnapshot.notes" type="text">
              {{ $t('snapshots.notes') }}
            </AppInput>
          </div>
          <AppButton type="submit" variant="primary" size="md" :disabled="adding">
            {{ $t('snapshots.add') }}
          </AppButton>
        </form>
      </ContentCard>
      <Panel :title="$t('snapshots.history')">
        <p v-if="loading" class="text-slate-600 dark:text-slate-400">{{ $t('snapshots.loading') }}</p>
        <template v-else-if="snapshots.length === 0">
          <EmptyState
            :title="$t('snapshots.noSnapshots')"
            :message="$t('snapshots.noSnapshots')"
          />
        </template>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-slate-200">
            <thead class="bg-slate-50 dark:bg-slate-700/50">
              <tr>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">{{ $t('snapshots.weekStartCol') }}</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">{{ $t('snapshots.pointsValue') }}</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">{{ $t('snapshots.expenses') }}</th>
                <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">{{ $t('snapshots.notes') }}</th>
                <th scope="col" class="relative px-4 py-3"><span class="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-600">
              <tr v-for="s in snapshots" :key="s.id" class="hover:bg-slate-50/50 dark:hover:bg-slate-700/30">
                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ s.weekStartDate }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ s.pointsValue }}</td>
                <td class="whitespace-nowrap px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ s.expenses ?? '–' }}</td>
                <td class="px-4 py-3 text-sm text-slate-600 dark:text-slate-300">{{ s.notes || '–' }}</td>
                <td class="whitespace-nowrap px-4 py-3">
                  <AppButton type="button" variant="danger" size="sm" @click="removeSnapshot(s)">{{ $t('snapshots.delete') }}</AppButton>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Panel>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getCard, getSnapshots, createSnapshot, deleteSnapshot } from '../api/client';
import PageHeader from '../components/PageHeader.vue';
import ContentCard from '../components/ContentCard.vue';
import AppButton from '../components/AppButton.vue';
import AppInput from '../components/AppInput.vue';
import Panel from '../components/Panel.vue';
import EmptyState from '../components/EmptyState.vue';

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
