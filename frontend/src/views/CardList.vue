<template>
  <div>
    <PageHeader>
      <h1 class="font-display text-2xl font-bold text-slate-900 dark:text-slate-100">{{ $t('cardList.title') }}</h1>
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
    <section v-if="!loading && !error && cards.length" class="mb-5">
      <h2 class="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Program points tracker</h2>
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ContentCard
          v-for="program in pointsProgramSummary"
          :key="program.pointsType"
          :tint="getPointsTypeAccent(program.pointsType)"
          padding="md"
        >
          <template #header>
            <p class="text-xs font-semibold text-slate-500 dark:text-slate-400">{{ translatedPointsType(program.pointsType) }}</p>
            <p class="text-xl font-bold" :class="accentTextClass(program.pointsType)">{{ formatRewardPoints(program.totalRewardPoints) }}</p>
          </template>
          <div class="text-sm text-slate-600 dark:text-slate-300">
            <p>{{ program.cardCount }} card<span v-if="program.cardCount > 1">s</span></p>
            <p>Tracked value: {{ formatDollars(program.totalPointsValue) }}</p>
          </div>
        </ContentCard>
      </div>
    </section>

    <p v-if="loading" class="text-slate-600 dark:text-slate-400">{{ $t('cardList.loading') }}</p>
    <p v-else-if="error" class="text-red-600 dark:text-red-400 text-sm">{{ error }}</p>
    <div v-else class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      <ContentCard
        v-for="card in filteredCards"
        :key="card.id"
        :tint="getPointsTypeAccent(card.pointsType)"
        padding="md"
        class="flex flex-col"
      >
        <template #header>
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <div class="flex items-center gap-2">
                <BankLogo :bank="card.bank" size="sm" />
                <router-link :to="`/cards/${card.id}`" class="font-semibold text-slate-900 dark:text-slate-100 hover:underline" :class="accentLinkClass(card.pointsType)">
                  {{ card.cardName }}
                </router-link>
              </div>
              <p v-if="spendSubtitle(card)" class="mt-0.5 text-sm text-slate-600 dark:text-slate-400">
                {{ spendSubtitle(card) }}
              </p>
            </div>
            <div class="text-right shrink-0">
              <p class="text-xs font-medium text-slate-500 dark:text-slate-400">{{ $t('cardList.reward') }}</p>
              <p class="text-lg font-bold" :class="accentTextClass(card.pointsType)">
                {{ formatRewardPoints(card.rewardPoints) }}
              </p>
            </div>
          </div>
        </template>
        <div class="space-y-3">
          <template v-if="effectiveProgression(card) != null">
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="text-slate-600 dark:text-slate-400">
                <template v-if="effectiveSpendingGoal(card)">{{ $t('cardList.spendProgress', { current: formatDollars(card.expenses ?? 0), goal: formatDollars(effectiveSpendingGoal(card)) }) }}</template>
                <template v-else>–</template>
              </span>
              <span class="font-semibold" :class="accentTextClass(card.pointsType)">{{ Math.round(effectiveProgression(card)) }}%</span>
            </div>
            <ProgressBar
              :value="effectiveProgression(card)"
              :max="100"
              :show-percent="false"
              :variant="getPointsTypeAccent(card.pointsType)"
            />
          </template>
          <template v-else-if="currentBonusLevel(card) && currentBonusLevel(card).level.requirementType === 'transaction'">
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('cardList.progression') }}: {{ $t('cardList.transactionLevel') }}</p>
          </template>
          <template v-else>
            <p class="text-sm text-slate-500 dark:text-slate-400">{{ $t('cardList.progression') }}: –</p>
          </template>
        </div>
        <template #footer>
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div class="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm" :class="accentTextClass(card.pointsType)">
              <span v-if="effectiveDeadline(card)">{{ $t('cardList.daysLeft', { count: daysLeft(effectiveDeadline(card)) }) }}</span>
              <span v-if="card.expenses != null && effectiveSpendingGoal(card) != null">{{ $t('cardList.toGo', { amount: formatDollars(Math.max(0, effectiveSpendingGoal(card) - (card.expenses ?? 0))) }) }}</span>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <router-link :to="`/cards/${card.id}`" class="text-sm font-semibold hover:underline" :class="accentLinkClass(card.pointsType)">
                {{ $t('cardList.viewDetails') }}
              </router-link>
              <AppButton :to="`/cards/${card.id}/snapshots`" variant="outline" size="sm">{{ $t('cardList.snapshots') }}</AppButton>
              <AppButton type="button" variant="danger" size="sm" @click="confirmDelete(card)">{{ $t('cardList.delete') }}</AppButton>
            </div>
          </div>
        </template>
      </ContentCard>
    </div>
    <EmptyState
      v-if="!loading && !error && filteredCards.length === 0"
      :title="$t('cardList.noCards')"
      :action-label="$t('cardList.addOne')"
      action-to="/available-cards"
    />
    <div v-if="deleteTarget" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/50 backdrop-blur-sm p-4" @click.self="deleteTarget = null">
      <div class="w-full max-w-sm border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 p-6">
        <p class="text-slate-700 dark:text-slate-200">{{ $t('cardList.deleteConfirm', { name: deleteTarget.cardName }) }}</p>
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
import { useTranslatedPointsType } from '../composables/useTranslatedPointsType';
import { CARD_STATUSES, BANKS, POINTS_TYPES, getPointsTypeAccent } from '../constants';
import BankLogo from '../components/BankLogo.vue';
import ContentCard from '../components/ContentCard.vue';
import PageHeader from '../components/PageHeader.vue';
import AppSelect from '../components/AppSelect.vue';
import ProgressBar from '../components/ProgressBar.vue';
import EmptyState from '../components/EmptyState.vue';
import AppButton from '../components/AppButton.vue';

const { t } = useI18n();
const router = useRouter();
const translatedPointsType = useTranslatedPointsType();
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
  POINTS_TYPES.map((p) => ({ value: p, label: translatedPointsType(p) }))
);

const filteredCards = computed(() => {
  let list = cards.value;
  if (filterStatus.value) list = list.filter((c) => c.status === filterStatus.value);
  if (filterBank.value) list = list.filter((c) => c.bank === filterBank.value);
  if (filterPointsType.value) list = list.filter((c) => c.pointsType === filterPointsType.value);
  return list;
});

const pointsProgramSummary = computed(() => {
  const groups = new Map();
  for (const card of cards.value) {
    const key = card.pointsType || 'Unknown';
    const row = groups.get(key) || {
      pointsType: key,
      cardCount: 0,
      totalRewardPoints: 0,
      totalPointsValue: 0,
    };
    row.cardCount += 1;
    row.totalRewardPoints += Number(card.rewardPoints || 0);
    row.totalPointsValue += Number(card.pointsValue || 0);
    groups.set(key, row);
  }
  return [...groups.values()].sort((a, b) => b.totalRewardPoints - a.totalRewardPoints);
});

function statusLabel(status) {
  const s = CARD_STATUSES.find((x) => x.value === status);
  return s ? t('status.' + status) : status;
}

/** Spending goal derived from expenses and progression (goal = expenses / (progression/100)) */
function spendingGoal(card) {
  const p = Number(card.progression);
  const exp = card.expenses != null ? Number(card.expenses) : null;
  if (p > 0 && p <= 100 && exp != null) return Math.round(exp / (p / 100));
  return null;
}

function formatDollars(n) {
  return `$${Number(n).toLocaleString()}`;
}

function daysLeft(deadlineStr) {
  if (!deadlineStr) return null;
  const end = new Date(deadlineStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  const diff = Math.ceil((end - today) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

/** Approximate months between two date strings (YYYY-MM-DD). */
function monthsBetween(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr);
  const end = new Date(endStr);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(1, Math.round(months));
}

/** Format reward points for display (e.g. "60,000 pts" or "–"). */
function formatRewardPoints(value) {
  if (value == null) return '–';
  const n = Number(value);
  return Number.isFinite(n) ? `${n.toLocaleString()} pts` : '–';
}

/** Current bonus level (first not achieved, or last if all achieved). Returns { level, index, total, isComplete }. */
function currentBonusLevel(card) {
  const levels = card.bonusLevels && card.bonusLevels.length ? card.bonusLevels : [];
  if (!levels.length) return null;
  const idx = levels.findIndex((l) => !l.achievedAt);
  const i = idx >= 0 ? idx : levels.length - 1;
  return { level: levels[i], index: i, total: levels.length, isComplete: idx < 0 };
}

/** Deadline date string (YYYY-MM-DD) for a level: openDate + monthsFromOpen. */
function levelDeadline(openDateStr, monthsFromOpen) {
  if (!openDateStr || monthsFromOpen == null) return null;
  const d = new Date(openDateStr);
  d.setMonth(d.getMonth() + Number(monthsFromOpen));
  return d.toISOString().slice(0, 10);
}

/** Subtitle line: uses bonus levels when present, else legacy spendingGoal/deadline. */
function spendSubtitle(card) {
  const current = currentBonusLevel(card);
  if (current) {
    const { level, index, total } = current;
    const levelLabel = total > 1 ? t('cardList.levelOf', { n: index + 1, total }) : '';
    const prefix = levelLabel ? levelLabel + ': ' : '';
    if (level.requirementType === 'spend' && level.spendAmount != null && level.spendAmount > 0) {
      const amount = formatDollars(level.spendAmount);
      const months = level.monthsFromOpen != null ? level.monthsFromOpen : null;
      if (months != null && months > 0) return prefix + t('cardList.spendInMonths', { amount, months });
      const deadline = levelDeadline(card.openDate, level.monthsFromOpen);
      if (deadline) {
        const d = new Date(deadline);
        const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        return prefix + t('cardList.spendByDate', { amount, date });
      }
      return prefix + t('cardList.spendAmount', { amount });
    }
    if (level.requirementType === 'transaction') {
      const n = level.minTransactions ?? 1;
      const months = level.monthsFromOpen != null ? level.monthsFromOpen : null;
      if (months != null) return prefix + t('cardList.transactionByMonth', { count: n, months });
      return prefix + t('cardList.transactionRequirement', { count: n });
    }
    return levelLabel || null;
  }
  const goal = spendingGoal(card);
  if (goal == null) return null;
  const amount = formatDollars(goal);
  const months = monthsBetween(card.openDate, card.deadline);
  if (months != null && months > 0) return t('cardList.spendInMonths', { amount, months });
  if (card.deadline) {
    const d = new Date(card.deadline);
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    return t('cardList.spendByDate', { amount, date });
  }
  return t('cardList.spendAmount', { amount });
}

/** Spending goal for display: from current bonus level (spend type) or legacy progression. */
function effectiveSpendingGoal(card) {
  const current = currentBonusLevel(card);
  if (current && current.level.requirementType === 'spend' && current.level.spendAmount != null && current.level.spendAmount > 0) {
    return current.level.spendAmount;
  }
  return spendingGoal(card);
}

/** Progress 0–100 for current level (spend type) or legacy card.progression. */
function effectiveProgression(card) {
  const current = currentBonusLevel(card);
  if (current && current.level.requirementType === 'spend' && current.level.spendAmount != null && current.level.spendAmount > 0) {
    const exp = card.expenses != null ? Number(card.expenses) : 0;
    const goal = current.level.spendAmount;
    return Math.min(100, Math.round((exp / goal) * 100));
  }
  if (card.progression != null) return Number(card.progression);
  return null;
}

/** Deadline for footer: current level deadline or card.deadline. */
function effectiveDeadline(card) {
  const current = currentBonusLevel(card);
  if (current && current.level.monthsFromOpen != null && card.openDate) {
    return levelDeadline(card.openDate, current.level.monthsFromOpen);
  }
  return card.deadline || null;
}

const ACCENT_TEXT = {
  violet: 'text-violet-600 dark:text-violet-400',
  emerald: 'text-emerald-600 dark:text-emerald-400',
  amber: 'text-amber-600 dark:text-amber-400',
  sky: 'text-sky-600 dark:text-sky-400',
  rose: 'text-rose-600 dark:text-rose-400',
  teal: 'text-teal-600 dark:text-teal-400',
  indigo: 'text-indigo-600 dark:text-indigo-400',
  fuchsia: 'text-fuchsia-600 dark:text-fuchsia-400',
  cyan: 'text-cyan-600 dark:text-cyan-400',
};

function accentTextClass(pointsType) {
  return ACCENT_TEXT[getPointsTypeAccent(pointsType)] || ACCENT_TEXT.violet;
}

function accentLinkClass(pointsType) {
  const accent = getPointsTypeAccent(pointsType);
  const map = {
    violet: 'text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300',
    emerald: 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300',
    amber: 'text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300',
    sky: 'text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300',
    rose: 'text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300',
    teal: 'text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300',
    indigo: 'text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300',
    fuchsia: 'text-fuchsia-600 hover:text-fuchsia-700 dark:text-fuchsia-400 dark:hover:text-fuchsia-300',
    cyan: 'text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300',
  };
  return map[accent] || map.violet;
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
