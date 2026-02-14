<template>
  <div class="space-y-8">
    <p v-if="loadError" class="text-sm text-red-600">{{ loadError }}</p>
    <template v-else>
    <!-- Back link + view mode toggle -->
    <div class="flex flex-wrap items-center justify-between gap-3">
      <router-link
        :to="backLink"
        class="text-xs font-medium text-slate-500 hover:text-slate-700"
      >
        ← {{ backLabel }}
      </router-link>
      <div class="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white p-1 text-xs font-medium text-slate-600">
        <button
          type="button"
          class="rounded-full px-3 py-1 transition"
          :class="isTracked ? 'bg-primary-500 text-white shadow-sm' : ''"
          @click="isTracked = true"
        >
          Tracked card view
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 transition"
          :class="!isTracked ? 'bg-slate-900 text-white shadow-sm' : ''"
          @click="isTracked = false"
        >
          Catalogue preview
        </button>
      </div>
    </div>

    <!-- Section A – Hero -->
    <section class="border border-slate-200 bg-white px-6 py-7 sm:px-8 sm:py-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <!-- Left: text + metadata -->
      <div class="max-w-xl space-y-4">
        <div class="space-y-1">
          <p class="text-xs font-semibold uppercase tracking-wide text-primary-600">
            Welcome bonus tracker
          </p>
          <h1 class="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
            {{ card.cardName }}
          </h1>
          <p class="text-sm text-slate-600 sm:text-base">
            {{ card.bonusOffer }}
          </p>
        </div>

        <div class="flex flex-wrap gap-2">
          <Badge variant="neutral" size="sm">
            {{ card.bank }} · {{ card.type }}
          </Badge>
          <Badge variant="info" size="sm">
            {{ card.pointsProgram }}
          </Badge>
          <Badge :variant="statusVariant" size="sm">
            {{ cardStatusLabel }}
          </Badge>
          <Badge v-if="!isTracked" variant="warning" size="sm">
            Not yet tracking
          </Badge>
        </div>

        <dl class="grid grid-cols-2 gap-4 text-sm text-slate-700 sm:grid-cols-3">
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
              Minimum spend
            </dt>
            <dd class="mt-0.5 font-semibold">
              ${{ card.minSpend.toLocaleString() }} in {{ card.bonusWindowMonths }} months
            </dd>
          </div>
          <div>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
              Bonus points
            </dt>
            <dd class="mt-0.5 font-semibold">
              {{ card.bonusPointsTarget.toLocaleString() }} pts (est. {{ card.estimatedValue }})
            </dd>
          </div>
          <div v-if="isTracked">
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
              On pace?
            </dt>
            <dd class="mt-0.5 flex items-center gap-2">
              <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              <span>Comfortably on track</span>
            </dd>
          </div>
          <div v-else>
            <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
              Tracking
            </dt>
            <dd class="mt-0.5 text-slate-600">
              Start tracking to unlock detailed analytics.
            </dd>
          </div>
        </dl>

        <div class="flex flex-wrap items-center gap-3 pt-1">
          <AppButton
            v-if="isTracked"
            type="button"
            variant="primary"
            size="md"
          >
            Log a transaction
          </AppButton>
          <AppButton
            v-if="isTracked"
            :to="editLink"
            variant="outline"
            size="md"
          >
            Edit tracking settings
          </AppButton>

          <AppButton
            v-if="!isTracked"
            type="button"
            variant="primary"
            size="md"
          >
            Start tracking this card
          </AppButton>
          <AppButton
            v-if="!isTracked"
            to="/available-cards"
            variant="outline"
            size="md"
          >
            View in catalogue
          </AppButton>
        </div>
      </div>

      <!-- Right: stylized card artwork -->
      <div class="w-full max-w-sm">
        <div class="relative rounded-2xl bg-gradient-to-br from-violet-600 via-indigo-500 to-sky-500 p-5 text-white shadow-xl">
          <div class="flex items-start justify-between gap-3">
            <div class="space-y-1">
              <p class="text-[10px] uppercase tracking-[0.15em] text-violet-100/90">
                PointsRocket · Tracker
              </p>
              <p class="font-display text-lg font-semibold leading-snug">
                {{ card.cardName }}
              </p>
              <p class="text-xs text-violet-100/80">
                {{ card.bank }} · {{ card.pointsProgram }}
              </p>
            </div>
            <div class="flex flex-col items-end gap-2">
              <BankLogo :bank="card.bank" size="sm" />
              <CardNetworkLogo :type="card.network" />
            </div>
          </div>
          <div class="mt-6 flex items-end justify-between text-xs">
            <div class="space-y-1">
              <p class="text-[10px] uppercase tracking-wide text-violet-100/90">
                Welcome bonus progress
              </p>
              <p class="text-sm font-semibold">
                {{ bonusProgress.current.toLocaleString() }} / {{ bonusProgress.target.toLocaleString() }} pts
              </p>
            </div>
            <p class="text-[11px] text-violet-100/80">
              {{ bonusProgress.percent }}% complete
            </p>
          </div>
          <div class="mt-2">
            <ProgressBar :value="bonusProgress.current" :max="bonusProgress.target" :show-percent="false" />
          </div>
          <div class="mt-4 flex items-center justify-between text-[10px] text-violet-100/80">
            <span>Card ending · {{ card.lastDigits }}</span>
            <span v-if="isTracked">{{ card.daysRemaining }} days left</span>
            <span v-else>Tracking not started</span>
          </div>
        </div>
      </div>
    </section>

    <!-- Section B – Quick snapshot tiles -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <article class="border border-slate-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Bonus progress
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900">
          <span v-if="showTracking">{{ bonusProgress.percent }}%</span>
          <span v-else>–</span>
        </p>
        <p class="mt-1 text-sm text-slate-600">
          <span v-if="showTracking">
            {{ bonusProgress.current.toLocaleString() }} / {{ bonusProgress.target.toLocaleString() }} pts
          </span>
          <span v-else>
            Start tracking to see your progress toward the welcome bonus.
          </span>
        </p>
        <div class="mt-3">
          <ProgressBar
            v-if="showTracking"
            :value="bonusProgress.current"
            :max="bonusProgress.target"
          />
          <div v-else class="h-2 w-full rounded-full bg-slate-200" />
        </div>
      </article>

      <article class="border border-slate-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Spend requirement
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900">
          <span v-if="showTracking">${{ spendProgress.current.toLocaleString() }}</span>
          <span v-else>${{ card.minSpend.toLocaleString() }}</span>
        </p>
        <p class="mt-1 text-sm text-slate-600">
          <span v-if="showTracking">
            of ${{ spendProgress.target.toLocaleString() }} in {{ card.bonusWindowMonths }} months
          </span>
          <span v-else>
            total spend in {{ card.bonusWindowMonths }} months to earn the mock bonus.
          </span>
        </p>
        <div class="mt-3">
          <ProgressBar
            :value="showTracking ? spendProgress.current : 0"
            :max="spendProgress.target"
            :variant="showTracking ? spendProgress.variant : 'default'"
          />
        </div>
      </article>

      <article class="border border-slate-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Days remaining
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900">
          <span v-if="showTracking">{{ card.daysRemaining }}</span>
          <span v-else>–</span>
        </p>
        <p class="mt-1 text-sm text-slate-600">
          <span v-if="showTracking">days left to hit the bonus</span>
          <span v-else>Up to {{ card.bonusWindowMonths }} months to complete the offer.</span>
        </p>
        <Badge
          class="mt-3"
          :variant="showTracking ? urgencyVariant : 'neutral'"
          size="sm"
        >
          {{ showTracking ? urgencyLabel : 'Tracking not started' }}
        </Badge>
      </article>

      <article class="border border-slate-200 bg-white p-5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Estimated value
        </p>
        <p class="mt-2 text-2xl font-bold text-slate-900">
          {{ card.estimatedValue }}
        </p>
        <p class="mt-1 text-sm text-slate-600">
          At {{ card.centsPerPoint }}¢ per point (mock estimate)
        </p>
        <p v-if="!isTracked" class="mt-3 text-xs text-slate-500">
          Start tracking this card to see personalized value over time.
        </p>
      </article>
    </section>

    <!-- Section C – Analytics row -->
    <section class="flex flex-col gap-4 lg:flex-row">
      <!-- Spend over time -->
      <Panel
        class="flex-1"
        title="Spend over time"
      >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600">
          <div class="inline-flex items-center gap-4">
            <button
              v-for="range in timeRanges"
              :key="range"
              type="button"
              class="rounded-full border px-3 py-1 transition"
              :class="range === selectedRange ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 bg-slate-50 hover:bg-slate-100'"
              @click="selectedRange = range"
            >
              {{ range }}
            </button>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center gap-1">
              <span class="inline-block h-1.5 w-5 rounded-full bg-primary-500" />
              <span>Actual spend</span>
            </div>
            <div class="flex items-center gap-1">
              <span class="inline-block h-1.5 w-5 rounded-full border border-dashed border-slate-500" />
              <span>Required pace</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div class="flex-1">
            <div class="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-400">
              Spend-over-time chart (mock data)
            </div>
          </div>
          <dl
            v-if="showTracking"
            class="mt-4 w-full space-y-2 text-xs text-slate-700 lg:mt-0 lg:w-52"
          >
            <div class="flex items-center justify-between">
              <dt class="text-slate-500">Current pace</dt>
              <dd class="font-semibold text-slate-900">
                ${{ analyticsSummary.currentPace.toLocaleString() }}/week
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500">Required pace</dt>
              <dd class="font-semibold">
                ${{ analyticsSummary.requiredPace.toLocaleString() }}/week
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500">Projected finish</dt>
              <dd class="font-semibold">
                {{ analyticsSummary.projectedFinish }}
              </dd>
            </div>
          </dl>
        </div>

        <p v-if="!showTracking" class="mt-4 text-xs text-slate-500">
          Start tracking this card to unlock personalized charts based on your real transactions.
        </p>
      </Panel>

      <!-- Spend by category -->
      <Panel
        class="w-full lg:w-80"
        title="Spend by category"
      >
        <div class="flex flex-col items-center gap-4 sm:flex-row lg:flex-col">
          <div class="flex h-40 w-40 items-center justify-center">
            <div class="relative h-36 w-36 rounded-full border border-slate-200 bg-slate-100 overflow-hidden">
              <div
                class="absolute inset-0 rounded-full"
                :style="pieGradientStyle"
              />
              <div class="absolute inset-6 rounded-full bg-white" />
            </div>
          </div>
          <ul class="w-full space-y-2 text-xs text-slate-700">
            <li
              v-for="cat in spendByCategory"
              :key="cat.label"
              class="flex items-center justify-between gap-2"
            >
              <div class="flex items-center gap-2">
                <span
                  class="inline-block h-2.5 w-2.5 rounded-full"
                  :class="cat.color"
                />
                <span class="font-medium text-slate-800">
                  {{ cat.label }}
                </span>
              </div>
              <div class="text-right">
                <p class="font-semibold text-slate-900">
                  ${{ cat.amount.toLocaleString() }}
                </p>
                <p class="text-[11px] text-slate-500">
                  {{ cat.percent }}% of tracked spend
                </p>
              </div>
            </li>
          </ul>
        </div>
      </Panel>
    </section>

    <!-- Section D – Activity row -->
    <section class="flex flex-col gap-4 lg:flex-row">
      <!-- Recent transactions -->
      <Panel
        class="flex-[2]"
        title="Recent activity"
        action-label="View all (mock)"
      >
        <template v-if="showTracking">
          <div class="-mx-6 overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date
                  </th>
                  <th class="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Merchant
                  </th>
                  <th class="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th class="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>
                  <th class="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Points
                  </th>
                  <th class="px-6 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Counts toward bonus
                  </th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 bg-white">
                <tr
                  v-for="tx in recentTransactions"
                  :key="tx.id"
                  class="hover:bg-slate-50/80 transition"
                >
                  <td class="whitespace-nowrap px-6 py-3 text-sm text-slate-700">
                    {{ tx.date }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-sm text-slate-700">
                    {{ tx.merchant }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-sm text-slate-700">
                    <Badge
                      size="sm"
                      :variant="tx.badgeVariant"
                    >
                      {{ tx.category }}
                    </Badge>
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-right text-sm text-slate-700">
                    {{ tx.amount }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-right text-sm text-slate-700">
                    {{ tx.points }}
                  </td>
                  <td class="whitespace-nowrap px-6 py-3 text-center text-sm text-slate-700">
                    <span
                      class="inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-medium"
                      :class="tx.countsTowardsBonus ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'"
                    >
                      {{ tx.countsTowardsBonus ? 'Yes' : 'No' }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-4 text-xs text-slate-500">
            This table uses static mock transactions to illustrate the layout.
          </p>
        </template>
        <p v-else class="text-xs text-slate-500">
          Once you start tracking this card, your recent transactions that count toward the bonus will appear here.
        </p>
      </Panel>

      <!-- Bonus milestones -->
      <Panel
        class="flex-1"
        title="Bonus milestones"
      >
        <template v-if="showTracking">
          <ol class="space-y-4">
            <li
              v-for="milestone in milestones"
              :key="milestone.id"
              class="flex gap-3"
            >
              <div class="flex flex-col items-center pt-1">
                <span
                  class="inline-flex h-3 w-3 rounded-full border-2"
                  :class="milestoneDotClasses(milestone)"
                />
                <span
                  v-if="milestone !== milestones[milestones.length - 1]"
                  class="mt-1 h-full w-px flex-1 bg-slate-200"
                />
              </div>
              <div class="flex-1">
                <p class="text-sm font-semibold text-slate-900">
                  {{ milestone.title }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ milestone.dateLabel }}
                </p>
                <p class="mt-1 text-xs text-slate-600">
                  {{ milestone.description }}
                </p>
                <Badge
                  class="mt-2"
                  :variant="milestone.badgeVariant"
                  size="sm"
                >
                  {{ milestone.statusLabel }}
                </Badge>
              </div>
            </li>
          </ol>
        </template>
        <p v-else class="text-xs text-slate-500">
          When you start tracking, you’ll see key milestones here, from approval to bonus posting.
        </p>
      </Panel>
    </section>

    <!-- Section E – Optimization & offer strategy -->
    <section class="grid gap-4 md:grid-cols-3">
      <ContentCard padding="md" tint="violet">
        <template #header>
          <p class="text-xs font-semibold uppercase tracking-wide text-violet-700">
            Travel & dining focus
          </p>
        </template>
        <ul class="mt-2 space-y-1.5 text-sm text-slate-700">
          <li>Prioritize flights, hotels, and restaurants on this card for 3×–5× categories.</li>
          <li>Move upcoming trips and weekend getaways to this card while the bonus is active.</li>
          <li>Pair with a no‑fee card for non‑bonus categories.</li>
        </ul>
      </ContentCard>

      <ContentCard padding="md" tint="emerald">
        <template #header>
          <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Everyday essentials
          </p>
        </template>
        <ul class="mt-2 space-y-1.5 text-sm text-slate-700">
          <li>Shift groceries, gas, and pharmacy purchases here until the minimum spend is met.</li>
          <li>Add this card to your mobile wallet for tap‑to‑pay convenience.</li>
          <li>Use for recurring bills (streaming, subscriptions) during the bonus window.</li>
        </ul>
      </ContentCard>

      <ContentCard padding="md" tint="amber">
        <template #header>
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
            Stack & optimize
          </p>
        </template>
        <ul class="mt-2 space-y-1.5 text-sm text-slate-700">
          <li>Combine with shopping portals or airline offers to multiply rewards.</li>
          <li>Keep an eye on category bonuses that rotate each quarter.</li>
          <li>Plan a large one‑time purchase to close the remaining gap efficiently.</li>
        </ul>
      </ContentCard>
    </section>

    <!-- Section F – Tasks & checklists -->
    <section class="flex flex-col gap-4 lg:flex-row">
      <!-- Setup checklist -->
      <Panel
        class="flex-1"
        title="Setup checklist"
      >
        <div>
          <ListRow
            v-for="item in setupChecklist"
            :key="item.id"
          >
            <template #leading>
              <input
                v-model="item.done"
                type="checkbox"
                class="h-4 w-4 rounded border-slate-300 text-primary-500 focus:ring-primary-500"
              />
            </template>
            <div>
              <p class="text-sm font-medium text-slate-900">
                {{ item.label }}
              </p>
              <p class="text-xs text-slate-600">
                {{ item.description }}
              </p>
            </div>
          </ListRow>
        </div>
        <div class="mt-4 flex justify-end">
          <AppButton
            type="button"
            variant="outline"
            size="sm"
            @click="markAllSetupDone"
          >
            Mark all as done
          </AppButton>
        </div>
      </Panel>

      <!-- Next actions -->
      <Panel
        class="flex-1"
        title="Next actions"
      >
        <div>
          <ListRow
            v-for="task in nextActions"
            :key="task.id"
          >
            <div>
              <p class="text-sm font-medium text-slate-900">
                {{ task.label }}
              </p>
              <p class="text-xs text-slate-600">
                {{ task.description }}
              </p>
              <div class="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                <Badge
                  size="sm"
                  :variant="task.badgeVariant"
                >
                  {{ task.statusLabel }}
                </Badge>
                <span class="text-slate-500">
                  {{ task.meta }}
                </span>
              </div>
            </div>
            <template #trailing>
              <AppButton
                type="button"
                size="sm"
                variant="outline"
                @click="advanceTask(task)"
              >
                Mark done
              </AppButton>
            </template>
          </ListRow>
        </div>
      </Panel>
    </section>

    <!-- Section G – Additional insights -->
    <section class="flex flex-col gap-4 lg:flex-row">
      <!-- Expert recommendations -->
      <Panel
        class="flex-[3]"
        title="Insights & recommendations"
      >
        <div class="grid gap-3 md:grid-cols-3">
          <article
            v-for="rec in expertRecommendations"
            :key="rec.id"
            class="flex flex-col gap-1 rounded-md border border-slate-200 bg-slate-50 p-4"
          >
            <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {{ rec.label }}
            </p>
            <h3 class="text-sm font-semibold text-slate-900">
              {{ rec.title }}
            </h3>
            <p class="text-xs text-slate-600">
              {{ rec.body }}
            </p>
          </article>
        </div>
      </Panel>

      <!-- Progress summary visualization -->
      <Panel
        class="flex-[2]"
        title="Weekly progress (mock)"
      >
        <div class="flex h-40 items-end gap-1 rounded-lg bg-slate-50 p-3">
          <div
            v-for="bar in weeklyProgress"
            :key="bar.week"
            class="flex-1"
          >
            <div
              class="mx-auto w-3 rounded-t-sm bg-primary-500"
              :style="{ height: `${bar.height}px`, opacity: bar.isCurrent ? 1 : 0.55 }"
            />
          </div>
        </div>
        <div class="mt-3 flex items-center justify-between text-[11px] text-slate-500">
          <span>Past 8 weeks of spend (mock)</span>
          <span>Darkest bar = current week</span>
        </div>
      </Panel>
    </section>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { getCard, getAvailableCard } from '../api/client';
import { pointsTypeLabel } from '../constants';
import AppButton from '../components/AppButton.vue';
import Badge from '../components/Badge.vue';
import BankLogo from '../components/BankLogo.vue';
import CardNetworkLogo from '../components/CardNetworkLogo.vue';
import ProgressBar from '../components/ProgressBar.vue';
import Panel from '../components/Panel.vue';
import ListRow from '../components/ListRow.vue';
import ContentCard from '../components/ContentCard.vue';

const route = useRoute();
const { t } = useI18n();

const cardPayload = ref(null);
const loadError = ref(null);

const isCatalogueMode = computed(() => route.query.mode === 'catalogue');
const isTracked = computed(() => !isCatalogueMode.value);
const showTracking = computed(() => isTracked.value);

const backLink = computed(() => (isCatalogueMode.value ? '/available-cards' : '/cards'));
const backLabel = computed(() =>
  isCatalogueMode.value ? t('availableCards.title') : t('snapshots.backToCards'),
);

function mapCatalogueToCard(p) {
  const levels = p.bonusLevels || [];
  const maxMonths = levels.length ? Math.max(...levels.map((l) => l.monthsFromOpen ?? 0)) : null;
  const sumPoints = levels.length ? levels.reduce((acc, l) => acc + (l.rewardPoints ?? 0), 0) : null;
  const firstSpend = levels[0]?.spendAmount ?? p.minSpend ?? null;
  const offerLine =
    p.bonusDetails && p.bonusDetails.trim()
      ? p.bonusDetails.split('\n')[0].trim()
      : [sumPoints != null ? `${sumPoints.toLocaleString()} pts` : '', firstSpend != null ? `after $${firstSpend.toLocaleString()} spend` : '', maxMonths != null ? `in ${maxMonths} months` : ''].filter(Boolean).join(' ');
  return {
    id: p.id,
    cardName: p.cardName ?? '',
    bank: p.bank ?? '',
    pointsProgram: (p.pointsType ?? '').replace(/_/g, ' ') || pointsTypeLabel(p.pointsType),
    type: p.type ?? 'VISA',
    network: p.type ?? 'VISA',
    status: 'Available to track',
    bonusOffer: offerLine || '–',
    minSpend: firstSpend ?? p.minSpend ?? 0,
    spendSoFar: 0,
    bonusPointsTarget: sumPoints ?? 0,
    bonusPointsEarned: 0,
    bonusWindowMonths: maxMonths ?? 0,
    daysRemaining: null,
    estimatedValue: p.welcomeValueY1 != null ? `$${p.welcomeValueY1}` : '–',
    centsPerPoint: null,
    lastDigits: null,
  };
}

function mapTrackedToCard(p) {
  const levels = p.bonusLevels || [];
  const maxMonths = levels.length ? Math.max(...levels.map((l) => l.monthsFromOpen ?? 0)) : null;
  const sumPoints = levels.length ? levels.reduce((acc, l) => acc + (l.rewardPoints ?? 0), 0) : (p.rewardPoints ?? 0);
  const firstSpend = levels[0]?.spendAmount ?? p.minSpend ?? null;
  const deadline = p.deadline ? new Date(p.deadline) : null;
  const daysRemaining =
    deadline && !Number.isNaN(deadline.getTime())
      ? Math.max(0, Math.ceil((deadline - new Date()) / (24 * 60 * 60 * 1000)))
      : null;
  const offerLine = p.bonusDetails && p.bonusDetails.trim() ? p.bonusDetails.split('\n')[0].trim() : [sumPoints ? `${sumPoints.toLocaleString()} pts` : '', firstSpend ? `after $${firstSpend.toLocaleString()} spend` : '', maxMonths ? `in ${maxMonths} months` : ''].filter(Boolean).join(' ');
  return {
    id: p.id,
    cardName: p.cardName ?? '',
    bank: p.bank ?? '',
    pointsProgram: (p.pointsType ?? '').replace(/_/g, ' ') || pointsTypeLabel(p.pointsType),
    type: p.type ?? 'VISA',
    network: p.type ?? 'VISA',
    status: p.status ?? 'Open',
    bonusOffer: offerLine || '–',
    minSpend: firstSpend ?? 0,
    spendSoFar: p.expenses ?? 0,
    bonusPointsTarget: sumPoints ?? 0,
    bonusPointsEarned: p.rewardPoints ?? 0,
    bonusWindowMonths: maxMonths ?? 0,
    daysRemaining: daysRemaining ?? 0,
    estimatedValue: p.pointsValue != null ? `$${p.pointsValue}` : '–',
    centsPerPoint: null,
    lastDigits: null,
  };
}

const card = computed(() => {
  const p = cardPayload.value;
  if (!p) {
    return {
      id: route.params.id,
      cardName: '–',
      bank: '–',
      pointsProgram: '–',
      type: 'VISA',
      network: 'VISA',
      status: isTracked.value ? 'In progress' : 'Available to track',
      bonusOffer: '–',
      minSpend: 0,
      spendSoFar: 0,
      bonusPointsTarget: 0,
      bonusPointsEarned: 0,
      bonusWindowMonths: 0,
      daysRemaining: 0,
      estimatedValue: '–',
      centsPerPoint: null,
      lastDigits: null,
    };
  }
  return isCatalogueMode.value ? mapCatalogueToCard(p) : mapTrackedToCard(p);
});

async function loadCard() {
  const id = route.params.id;
  if (!id) return;
  loadError.value = null;
  cardPayload.value = null;
  try {
    if (isCatalogueMode.value) {
      cardPayload.value = await getAvailableCard(id);
    } else {
      const data = await getCard(id);
      cardPayload.value = data;
    }
  } catch (e) {
    loadError.value = e.response?.data?.error || e.message;
  }
}

onMounted(loadCard);
watch(() => [route.params.id, route.query.mode], loadCard);

const bonusProgress = computed(() => {
  const target = card.value.bonusPointsTarget || 1;
  const current = Math.min(card.value.bonusPointsEarned, target);
  const percent = Math.round((current / target) * 100);
  return {
    current,
    target,
    percent,
  };
});

const spendProgress = computed(() => {
  const target = card.value.minSpend || 1;
  const current = Math.min(card.value.spendSoFar, target);
  const ratio = current / target;
  let variant = 'default';
  if (ratio < 0.4 && card.value.daysRemaining < 60) {
    variant = 'warning';
  } else if (ratio >= 0.75) {
    variant = 'success';
  }
  return {
    current,
    target,
    variant,
  };
});

const statusVariant = computed(() => {
  if (!isTracked.value) return 'neutral';
  return 'info';
});

const cardStatusLabel = computed(() =>
  isTracked.value ? 'In progress' : 'Available to track',
);

const urgencyVariant = computed(() => {
  if (card.value.daysRemaining <= 30) return 'warning';
  if (card.value.daysRemaining <= 60) return 'info';
  return 'neutral';
});

const urgencyLabel = computed(() => {
  if (card.value.daysRemaining <= 30) return 'Tight window';
  if (card.value.daysRemaining <= 60) return 'Comfortable pace';
  return 'Plenty of time';
});

const editLink = computed(() => ({
  name: 'CardEdit',
  params: { id: card.value.id },
}));

const timeRanges = ['30 days', '90 days', 'Full bonus period'];
const selectedRange = ref(timeRanges[1]);

const analyticsSummary = computed(() => ({
  currentPace: 850,
  requiredPace: 750,
  projectedFinish: '2–3 weeks early',
}));

const spendByCategory = computed(() => [
  { label: 'Travel', amount: 1200, percent: 48, color: 'bg-sky-500', hex: '#0ea5e9' },
  { label: 'Dining', amount: 650, percent: 26, color: 'bg-violet-500', hex: '#8b5cf6' },
  { label: 'Groceries', amount: 400, percent: 16, color: 'bg-emerald-500', hex: '#10b981' },
  { label: 'Other', amount: 250, percent: 10, color: 'bg-slate-400', hex: '#9ca3af' },
]);

const pieGradientStyle = computed(() => {
  const data = spendByCategory.value;
  const total = data.reduce((sum, cat) => sum + cat.amount, 0) || 1;
  let currentAngle = 0;
  const stops = data.map((cat) => {
    const sliceAngle = (cat.amount / total) * 360;
    const start = currentAngle;
    const end = currentAngle + sliceAngle;
    currentAngle = end;
    return `${cat.hex} ${start}deg ${end}deg`;
  });
  return {
    backgroundImage: `conic-gradient(${stops.join(', ')})`,
  };
});

const recentTransactions = [
  {
    id: 1,
    date: 'Jan 3',
    merchant: 'Air Canada',
    category: 'Travel',
    badgeVariant: 'info',
    amount: '$620.00',
    points: '2,480',
    countsTowardsBonus: true,
  },
  {
    id: 2,
    date: 'Jan 6',
    merchant: 'La Petite Brasserie',
    category: 'Dining',
    badgeVariant: 'info',
    amount: '$84.50',
    points: '338',
    countsTowardsBonus: true,
  },
  {
    id: 3,
    date: 'Jan 8',
    merchant: 'Metro Groceries',
    category: 'Groceries',
    badgeVariant: 'success',
    amount: '$156.20',
    points: '468',
    countsTowardsBonus: true,
  },
  {
    id: 4,
    date: 'Jan 9',
    merchant: 'Spotify',
    category: 'Subscriptions',
    badgeVariant: 'neutral',
    amount: '$16.99',
    points: '51',
    countsTowardsBonus: false,
  },
];

const milestones = [
  {
    id: 1,
    title: 'Card approved',
    dateLabel: 'Dec 1 (mock)',
    description: 'Your application was approved and the welcome bonus clock started.',
    status: 'done',
    badgeVariant: 'success',
    statusLabel: 'Completed',
  },
  {
    id: 2,
    title: 'Card activated',
    dateLabel: 'Dec 5',
    description: 'Card activated and ready to use for eligible purchases.',
    status: 'done',
    badgeVariant: 'success',
    statusLabel: 'Completed',
  },
  {
    id: 3,
    title: '50% of minimum spend reached',
    dateLabel: 'Jan 7',
    description: 'You have crossed half of the required minimum spend.',
    status: 'current',
    badgeVariant: 'info',
    statusLabel: 'In progress',
  },
  {
    id: 4,
    title: 'Minimum spend met',
    dateLabel: 'Estimated Feb 12',
    description: 'Based on your current pace, you should hit the minimum spend around this date.',
    status: 'upcoming',
    badgeVariant: 'neutral',
    statusLabel: 'Upcoming',
  },
  {
    id: 5,
    title: 'Bonus points posted',
    dateLabel: 'Estimated statement after min spend',
    description: 'Welcome bonus points typically post 1–2 statements after you meet the requirement.',
    status: 'upcoming',
    badgeVariant: 'neutral',
    statusLabel: 'Upcoming',
  },
];

function milestoneDotClasses(milestone) {
  if (milestone.status === 'done') {
    return 'border-emerald-500 bg-emerald-500';
  }
  if (milestone.status === 'current') {
    return 'border-primary-500 bg-white';
  }
  return 'border-slate-300 bg-white';
}

const setupChecklist = ref([
  {
    id: 1,
    label: 'Set up automatic payments',
    description: 'Avoid interest and keep the bonus on track with full statement autopay.',
    done: true,
  },
  {
    id: 2,
    label: 'Add card to your mobile wallet',
    description: 'Use tap‑to‑pay for everyday purchases to keep progress steady.',
    done: false,
  },
  {
    id: 3,
    label: 'Enable transaction alerts',
    description: 'Get a push or email when large purchases post to the card.',
    done: false,
  },
  {
    id: 4,
    label: 'Review card benefits',
    description: 'Check insurance coverage, lounge access, and travel protections.',
    done: false,
  },
]);

function markAllSetupDone() {
  setupChecklist.value.forEach((item) => {
    item.done = true;
  });
}

const nextActions = ref([
  {
    id: 1,
    label: 'Move upcoming trip flights to this card',
    description: 'Book your next travel within the bonus window to generate a large chunk of spend.',
    status: 'in_progress',
    badgeVariant: 'info',
    statusLabel: 'In progress',
    meta: 'Target this week',
  },
  {
    id: 2,
    label: 'Shift groceries and gas to this card',
    description: 'Use this card for day‑to‑day spend until the requirement is met.',
    status: 'not_started',
    badgeVariant: 'neutral',
    statusLabel: 'Not started',
    meta: 'Ongoing',
  },
  {
    id: 3,
    label: 'Plan one large purchase',
    description: 'Time a big expense (appliance, insurance payment) to close the remaining gap.',
    status: 'not_started',
    badgeVariant: 'neutral',
    statusLabel: 'Not started',
    meta: 'Before statement date',
  },
]);

function advanceTask(task) {
  if (task.status === 'completed') return;
  task.status = 'completed';
  task.badgeVariant = 'success';
  task.statusLabel = 'Done';
}

const expertRecommendations = [
  {
    id: 1,
    label: 'Pace',
    title: 'You are slightly ahead of schedule',
    body: 'Your weekly spend is above the required pace. You can shift small purchases back to other cards if you want to diversify rewards.',
  },
  {
    id: 2,
    label: 'Mix',
    title: 'Most spend is in bonus categories',
    body: 'Roughly 70% of tracked spend falls into travel and dining, which typically earn the highest multipliers.',
  },
  {
    id: 3,
    label: 'Risk',
    title: 'Low risk of missing the deadline',
    body: 'With more than a month left and over half of the requirement met, you have strong buffer for unexpected changes.',
  },
];

const weeklyProgress = [
  { week: 1, height: 18, isCurrent: false },
  { week: 2, height: 24, isCurrent: false },
  { week: 3, height: 32, isCurrent: false },
  { week: 4, height: 40, isCurrent: false },
  { week: 5, height: 46, isCurrent: false },
  { week: 6, height: 36, isCurrent: false },
  { week: 7, height: 52, isCurrent: true },
  { week: 8, height: 44, isCurrent: false },
];
</script>

