<template>
  <div class="space-y-8">
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
          :class="isTracked ? 'bg-violet-500 text-white shadow-sm' : ''"
          @click="isTracked = true"
        >
          {{ $t('cardDetails.trackedView') }}
        </button>
        <button
          type="button"
          class="rounded-full px-3 py-1 transition"
          :class="!isTracked ? 'bg-slate-900 text-white shadow-sm' : ''"
          @click="isTracked = false"
        >
          {{ $t('cardDetails.cataloguePreview') }}
        </button>
      </div>
    </div>

    <!-- Section A – Hero -->
    <section class="border border-slate-200 bg-white px-6 py-7 sm:px-8 sm:py-8 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
      <!-- Loading -->
      <div
        v-if="loading"
        class="flex w-full flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"
      >
        <div class="max-w-xl space-y-4">
          <div class="h-3 w-24 rounded bg-slate-200" />
          <div class="h-8 w-3/4 rounded bg-slate-200" />
          <div class="h-4 w-full rounded bg-slate-100" />
          <div class="flex gap-2">
            <div class="h-6 w-24 rounded bg-slate-100" />
            <div class="h-6 w-20 rounded bg-slate-100" />
          </div>
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <div class="h-10 rounded bg-slate-100" />
            <div class="h-10 rounded bg-slate-100" />
            <div class="h-10 rounded bg-slate-100" />
          </div>
        </div>
        <div class="h-[212px] w-full max-w-[340px] rounded-2xl bg-slate-200" />
      </div>

      <!-- Error -->
      <div
        v-else-if="error"
        class="flex w-full flex-col items-start gap-3"
      >
        <p class="text-sm font-medium text-slate-700">
          {{ error }}
        </p>
        <router-link
          :to="backLink"
          class="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          ← {{ isCatalogueMode ? $t('cardDetails.backToCatalogue') : $t('cardDetails.backToCards') }}
        </router-link>
      </div>

      <!-- Content -->
      <template v-else>
        <!-- Left: text + metadata -->
        <div class="max-w-xl space-y-4">
          <div class="space-y-1">
            <h1 class="font-display text-2xl font-extrabold text-slate-900 sm:text-3xl lg:text-4xl">
              {{ card.cardName }}
            </h1>
            <p v-if="jumbotronSubtitle" class="text-base font-medium text-slate-700 sm:text-lg">
              {{ jumbotronSubtitle }}
            </p>
          </div>

          <div class="flex flex-wrap gap-2">
            <Badge variant="neutral" size="sm">
              {{ card.isBusiness ? $t('availableCards.business') : $t('availableCards.personal') }}
            </Badge>
            <Badge variant="info" size="sm">
              {{ translatedPointsType(card.pointsProgram) }}
            </Badge>
            <Badge v-if="isTracked" :variant="statusVariant" size="sm">
              {{ cardStatusLabel }}
            </Badge>
            <Badge
              v-for="tag in jumbotronTags"
              :key="tag.label"
              :variant="tag.variant"
              size="sm"
            >
              {{ tag.label }}
            </Badge>
          </div>

          <!-- What this card offers: checklist -->
          <div>
            <p class="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {{ $t('cardDetails.whatThisCardOffers') }}
            </p>
            <ul v-if="jumbotronChecklist.length" class="flex flex-col gap-2 text-sm text-slate-700 dark:text-slate-300">
              <li
                v-for="(item, idx) in jumbotronChecklist"
                :key="idx"
                class="flex items-start gap-2"
              >
                <span class="mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true">✓</span>
                <span>
                  {{ item.label }}
                  <span v-if="item.detail" class="text-slate-500 dark:text-slate-400">· {{ item.detail }}</span>
                </span>
              </li>
            </ul>
            <p v-else class="text-sm text-slate-500 dark:text-slate-400">
              {{ $t('cardDetails.checklistEmpty') }}
            </p>
          </div>

          <dl class="grid grid-cols-2 gap-4 text-sm text-slate-700 sm:grid-cols-3">
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                {{ $t('cardDetails.minimumSpend') }}
              </dt>
              <dd class="mt-0.5 font-semibold">
                <template v-if="card.minSpend != null && card.bonusWindowMonths != null">
                  {{ $t('cardDetails.spendAmountInMonths', { amount: card.minSpend.toLocaleString(), months: card.bonusWindowMonths }) }}
                </template>
                <template v-else-if="card.minSpend != null">
                  {{ $t('cardDetails.spendAmountOnly', { amount: card.minSpend.toLocaleString() }) }}
                </template>
                <template v-else>–</template>
              </dd>
            </div>
            <div>
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                {{ $t('cardDetails.bonusPoints') }}
              </dt>
              <dd class="mt-0.5 font-semibold">
                <template v-if="card.bonusPointsTarget != null">
                  {{ $t('cardDetails.bonusPointsEstValue', { pts: card.bonusPointsTarget.toLocaleString(), value: card.estimatedValue }) }}
                </template>
                <template v-else>
                  {{ $t('cardDetails.estValueOnly', { value: card.estimatedValue }) }}
                </template>
              </dd>
            </div>
            <div v-if="isTracked">
              <dt class="text-xs font-medium uppercase tracking-wide text-slate-500">
                {{ $t('cardDetails.onPace') }}
              </dt>
              <dd class="mt-0.5 flex items-center gap-2">
                <span class="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                <span>{{ $t('cardDetails.comfortablyOnTrack') }}</span>
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
              {{ $t('cardDetails.logTransaction') }}
            </AppButton>
            <AppButton
              v-if="isTracked"
              :to="editLink"
              variant="outline"
              size="md"
            >
              {{ $t('cardDetails.editTrackingSettings') }}
            </AppButton>
            <AppButton
              v-if="!isTracked"
              type="button"
              variant="outline"
              size="md"
              :disabled="refreshingCatalogueCard"
              @click="refreshCatalogueCard"
            >
              {{ refreshingCatalogueCard ? $t('availableCards.refreshing') : $t('cardForm.refreshFromMilesopedia') }}
            </AppButton>

            <AppButton
              v-if="!isTracked && isAuthenticated"
              type="button"
              variant="primary"
              size="md"
            >
              {{ $t('cardDetails.startTracking') }}
            </AppButton>
            <AppButton
              v-if="!isTracked && !isAuthenticated"
              :to="loginLinkWithReturn"
              variant="primary"
              size="md"
            >
              {{ $t('cardDetails.startTracking') }}
            </AppButton>

            <a
              v-if="!isTracked && card.subscribeUrl"
              :href="card.subscribeUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700"
            >
              {{ $t('cardDetails.subscribeToCard') }}
              <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Right: credit-card-style artwork (minimal, bank brand color) -->
        <div class="w-full max-w-[340px]">
          <div
            class="credit-card relative w-full aspect-[1.586] rounded-[1rem] overflow-hidden shadow-xl flex flex-col justify-between p-5"
            :style="{ background: bankCardColor }"
          >
            <!-- Top: bank name (left) | bonus points (right) -->
            <div class="flex items-start justify-between shrink-0">
              <span class="text-base font-bold tracking-wide text-white uppercase">{{ card.bank }}</span>
              <span v-if="card.bonusPointsTarget != null" class="text-right text-sm font-bold tabular-nums text-white shrink-0">
                {{ card.bonusPointsTarget.toLocaleString() }} pts
              </span>
            </div>

            <!-- Card number -->
            <div class="font-mono text-sm sm:text-base tracking-[0.2em] text-white tabular-nums shrink-0 whitespace-nowrap overflow-hidden min-w-0">
              {{ displayCardNumber }}
            </div>

            <!-- Bottom: network logo (nudged toward bottom-right corner) -->
            <div class="flex items-end justify-end shrink-0 -mr-2 -mb-2">
              <CardNetworkLogo :type="card.network" light class="flex-shrink-0" />
            </div>
          </div>
        </div>
      </template>
    </section>

    <!-- Sections B onward: only when card is loaded -->
    <template v-if="!loading && !error">
    <!-- Section B – Quick snapshot tiles -->
    <section class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile v-if="isTracked" :label="$t('cardDetails.bonusProgress')" :value="`${bonusProgress.percent}%`">
        <p class="text-sm text-slate-600">{{ bonusProgress.current.toLocaleString() }} / {{ bonusProgress.target.toLocaleString() }} pts</p>
        <ProgressBar :value="bonusProgress.current" :max="bonusProgress.target" class="mt-3" />
      </MetricTile>

      <MetricTile v-if="!isTracked" :label="$t('cardDetails.annualFee')" :value="annualFeeLabel">
        <p v-if="card.annualCost === 0" class="text-sm text-slate-600">{{ $t('cardDetails.noOngoingCost') }}</p>
      </MetricTile>

      <MetricTile
        :label="$t('cardDetails.spendRequirement')"
        :value="showTracking ? `$${spendProgress.current.toLocaleString()}` : (card.minSpend != null ? '$' + card.minSpend.toLocaleString() : '–')"
      >
        <p class="text-sm text-slate-600">
          <span v-if="showTracking">
            {{ $t('cardDetails.ofAmountInMonths', { amount: '$' + spendProgress.target.toLocaleString(), months: card.bonusWindowMonths ?? '–' }) }}
          </span>
          <span v-else>
            {{ $t('cardDetails.totalSpendInMonths', { months: card.bonusWindowMonths ?? '–' }) }}
          </span>
        </p>
        <ProgressBar
          v-if="showTracking"
          class="mt-3"
          :value="spendProgress.current"
          :max="spendProgress.target"
          :variant="spendProgress.variant"
        />
      </MetricTile>

      <MetricTile v-if="isTracked" :label="$t('cardDetails.daysRemaining')" :value="card.daysRemaining != null ? card.daysRemaining : '–'">
        <p class="text-sm text-slate-600">{{ $t('cardDetails.daysLeftToHitBonus') }}</p>
        <Badge class="mt-3" :variant="urgencyVariant" size="sm">{{ urgencyLabel }}</Badge>
      </MetricTile>

      <MetricTile
        v-if="!isTracked"
        :label="$t('cardDetails.bonusPoints')"
        :value="card.bonusPointsTarget != null ? card.bonusPointsTarget.toLocaleString() + ' pts' : '–'"
      >
        <p class="text-sm text-slate-600">{{ $t('cardDetails.pointsWhenMeetRequirement') }}</p>
      </MetricTile>

      <MetricTile :label="$t('cardDetails.estimatedValue')" :value="card.estimatedValue">
        <p v-if="card.centsPerPoint != null" class="text-sm text-slate-600">{{ $t('cardDetails.centsPerPoint', { cents: card.centsPerPoint }) }}</p>
      </MetricTile>
    </section>

    <!-- Section C – Analytics row (tracked only) -->
    <section v-if="isTracked" class="flex flex-col gap-4 lg:flex-row">
      <!-- Spending Timeline -->
      <Panel
        class="flex-1"
        :title="$t('cardDetails.spendingTimeline')"
      >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p class="text-sm text-slate-500">
            {{ $t('cardDetails.dailySpendingBreakdown') }}
          </p>
          <div class="inline-flex border border-slate-200 bg-white">
            <button
              v-for="range in spendingTimeRanges"
              :key="range.value"
              type="button"
              class="border-r border-slate-200 px-3 py-1.5 text-xs font-medium transition last:border-r-0"
              :class="selectedSpendingRange === range.value ? 'bg-violet-500 text-white' : 'text-slate-600 hover:bg-slate-50'"
              @click="selectedSpendingRange = range.value"
            >
              {{ range.label }}
            </button>
          </div>
        </div>

        <div class="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          <div class="flex-1">
            <div class="border border-slate-200 bg-white p-4">
              <!-- Legend -->
              <div class="mb-3 flex flex-wrap gap-4 text-xs text-slate-600">
                <div class="flex items-center gap-2">
                  <span class="inline-block h-1 w-5 bg-violet-500" />
                  <span>{{ $t('cardDetails.cumulativeSpending') }}</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="inline-block h-px w-5 border-t border-dashed border-slate-400" />
                  <span>{{ $t('cardDetails.targetPace') }}</span>
                </div>
              </div>
              <!-- Chart -->
              <div class="relative h-56 w-full">
                <svg
                  class="h-full w-full overflow-visible"
                  :viewBox="`0 0 ${chartWidth} ${chartHeight}`"
                  preserveAspectRatio="xMidYMid meet"
                >
                  <!-- Grid -->
                  <g v-for="i in 8" :key="'grid-' + i" class="text-slate-200">
                    <line
                      :x1="chartPadding.left"
                      :y1="chartPadding.top + (i - 1) * chartInnerHeight / 8"
                      :x2="chartWidth - chartPadding.right"
                      :y2="chartPadding.top + (i - 1) * chartInnerHeight / 8"
                      stroke="currentColor"
                      stroke-width="0.5"
                      stroke-dasharray="2 2"
                    />
                  </g>
                  <!-- Y-axis labels -->
                  <g class="text-[10px] text-slate-500">
                    <text
                      v-for="(val, i) in yAxisLabels"
                      :key="'y-' + i"
                      :x="chartPadding.left - 6"
                      :y="chartPadding.top + (1 - val / chartYMax) * chartInnerHeight + 3"
                      text-anchor="end"
                    >
                      {{ val >= 1000 ? (val / 1000) + 'k' : val }}
                    </text>
                  </g>
                  <!-- Area fill (flat, no gradient) -->
                  <path
                    :d="spendingAreaPath"
                    fill="rgb(139 92 246 / 0.08)"
                  />
                  <!-- Line: Cumulative Spending -->
                  <path
                    :d="spendingLinePath"
                    fill="none"
                    stroke="rgb(139 92 246)"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- Line: Target Pace -->
                  <path
                    :d="targetPaceLinePath"
                    fill="none"
                    stroke="rgb(148 163 184)"
                    stroke-width="1.5"
                    stroke-dasharray="4 3"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                  <!-- X-axis labels -->
                  <g class="text-[10px] text-slate-500">
                    <text
                      v-for="(item, i) in xAxisLabelsWithIndex"
                      :key="'x-' + i"
                      :x="xScale(item.index)"
                      :y="chartHeight - chartPadding.bottom + 14"
                      text-anchor="middle"
                    >
                      {{ item.label }}
                    </text>
                  </g>
                </svg>
              </div>
            </div>
          </div>
          <dl
            v-if="showTracking"
            class="mt-4 w-full space-y-2 text-xs text-slate-700 lg:mt-0 lg:w-52"
          >
            <div class="flex items-center justify-between">
              <dt class="text-slate-500">{{ $t('cardDetails.currentPace') }}</dt>
              <dd class="font-semibold text-slate-900">
                ${{ analyticsSummary.currentPace.toLocaleString() }}/week
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500">{{ $t('cardDetails.requiredPace') }}</dt>
              <dd class="font-semibold">
                ${{ analyticsSummary.requiredPace.toLocaleString() }}/week
              </dd>
            </div>
            <div class="flex items-center justify-between">
              <dt class="text-slate-500">{{ $t('cardDetails.projectedFinish') }}</dt>
              <dd class="font-semibold">
                {{ analyticsSummary.projectedFinish }}
              </dd>
            </div>
          </dl>
        </div>

        <p v-if="!showTracking" class="mt-4 text-xs text-slate-500">
          {{ $t('cardDetails.startTrackingToUnlock') }}
        </p>
      </Panel>

      <!-- Spend by category -->
      <Panel
        class="w-full lg:w-80"
        :title="$t('cardDetails.spendByCategory')"
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
                  {{ cat.percent }}% {{ $t('cardDetails.ofTrackedSpend') }}
                </p>
              </div>
            </li>
          </ul>
        </div>
      </Panel>
    </section>

    <!-- Section D – Activity row (tracked only) -->
    <section v-if="isTracked" class="flex flex-col gap-4 lg:flex-row">
      <!-- Recent activity -->
      <Panel
        class="flex-[2]"
        :title="$t('cardDetails.recentActivity')"
        :action-label="$t('cardDetails.viewAllMock')"
      >
        <template v-if="isTracked">
          <div class="-mx-6 overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-200">
              <thead class="bg-slate-50">
                <tr>
                  <th class="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ $t('cardDetails.date') }}
                  </th>
                  <th class="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ $t('cardDetails.merchant') }}
                  </th>
                  <th class="px-6 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ $t('cardDetails.category') }}
                  </th>
                  <th class="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ $t('cardDetails.amount') }}
                  </th>
                  <th class="px-6 py-2 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ $t('cardDetails.points') }}
                  </th>
                  <th class="px-6 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {{ $t('cardDetails.countsTowardBonus') }}
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
                      {{ tx.countsTowardsBonus ? $t('common.yes') : $t('common.no') }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="mt-4 text-xs text-slate-500">
            {{ $t('cardDetails.mockTransactionsNote') }}
          </p>
        </template>
        <p v-else class="text-xs text-slate-500">
          {{ $t('cardDetails.onceStartTracking') }}
        </p>
      </Panel>

      <!-- Bonus milestones -->
      <Panel
        class="flex-1"
        :title="$t('cardDetails.bonusMilestones')"
      >
        <template v-if="isTracked">
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
          When you start tracking, you'll see key milestones here, from approval to bonus posting.
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

    <!-- Card Benefits & Rewards Structure (at end; catalogue + tracked) -->
    <Panel title="Card Benefits & Rewards Structure">
      <div class="space-y-6">
        <!-- Point earning structure -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Point earning structure
          </p>
          <div class="mt-3 grid gap-4 sm:grid-cols-3">
            <article
              v-for="earn in pointEarningStructure"
              :key="earn.id"
              class="border p-5"
              :class="earn.tintClasses"
            >
              <div class="flex h-9 w-9 items-center justify-center rounded-lg" :class="earn.iconBg">
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path v-if="earn.icon === 'dining'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  <path v-else-if="earn.icon === 'travel'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  <path v-else-if="earn.icon === 'cart'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p class="mt-3 text-xl font-bold text-slate-900">
                {{ earn.multiplier }}
              </p>
              <p class="mt-1 text-sm font-semibold text-slate-800">
                {{ earn.label }}
              </p>
              <p class="mt-2 text-xs leading-snug text-slate-600">
                {{ earn.description }}
              </p>
            </article>
          </div>
        </div>

        <!-- Protection & premium benefits -->
        <div>
          <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Protection & premium benefits
          </p>
          <div class="mt-3 grid gap-4 md:grid-cols-2">
            <article class="border border-slate-200 bg-white p-5">
              <div class="flex items-center gap-2">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                </div>
                <h3 class="text-sm font-semibold text-slate-900">
                  Travel & Purchase Protection
                </h3>
              </div>
              <ul class="mt-4 space-y-2">
                <li
                  v-for="item in travelProtectionBenefits"
                  :key="item.label"
                  class="flex items-start gap-2 text-sm text-slate-700"
                >
                  <span class="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span><strong class="font-medium text-slate-900">{{ item.label }}:</strong> {{ item.detail }}</span>
                </li>
              </ul>
            </article>
            <article class="border border-slate-200 bg-white p-5">
              <div class="flex items-center gap-2">
                <div class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                </div>
                <h3 class="text-sm font-semibold text-slate-900">
                  Premium Travel Benefits
                </h3>
              </div>
              <ul class="mt-4 space-y-2">
                <li
                  v-for="item in premiumTravelBenefits"
                  :key="item.label"
                  class="flex items-start gap-2 text-sm text-slate-700"
                >
                  <span class="mt-0.5 shrink-0 text-emerald-500">✓</span>
                  <span><strong class="font-medium text-slate-900">{{ item.label }}:</strong> {{ item.detail }}</span>
                </li>
              </ul>
            </article>
          </div>
        </div>
      </div>
    </Panel>
    </template>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuth } from '../composables/useAuth.js';
import { useTranslatedPointsType } from '../composables/useTranslatedPointsType.js';
import { getCard, getAvailableCard, refreshAvailableCard } from '../api/client.js';
import { getBankCardColor } from '../constants.js';
import AppButton from '../components/AppButton.vue';
import Badge from '../components/Badge.vue';
import CardNetworkLogo from '../components/CardNetworkLogo.vue';
import ProgressBar from '../components/ProgressBar.vue';
import Panel from '../components/Panel.vue';
import ContentCard from '../components/ContentCard.vue';
import MetricTile from '../components/MetricTile.vue';

const route = useRoute();
const { t } = useI18n();
const { isAuthenticated } = useAuth();
const translatedPointsType = useTranslatedPointsType();

const isCatalogueMode = computed(() => route.query.mode === 'catalogue');
const isTracked = ref(!isCatalogueMode.value);
const showTracking = computed(() => !isCatalogueMode.value && isTracked.value);

const backLink = computed(() => (isCatalogueMode.value ? '/available-cards' : '/cards'));
const backLabel = computed(() =>
  isCatalogueMode.value ? t('cardDetails.backToCatalogue') : t('cardDetails.backToCards'),
);

/** Login link with returnUrl so after login user comes back to this page. */
const loginLinkWithReturn = computed(() => ({
  name: 'Login',
  query: { redirect: route.fullPath },
}));

const displayCardNumber = computed(() => '****  ****  ****  ****');

const cardPayload = ref(null);
const loading = ref(true);
const error = ref(null);
const refreshingCatalogueCard = ref(false);

async function refreshCatalogueCard() {
  const id = route.params.id;
  if (!id || isTracked.value) return;
  refreshingCatalogueCard.value = true;
  error.value = null;
  try {
    const updated = await refreshAvailableCard(id);
    cardPayload.value = updated;
  } catch (err) {
    error.value = err.response?.data?.error || err.message || 'Refresh failed';
  } finally {
    refreshingCatalogueCard.value = false;
  }
}

async function fetchCard() {
  const id = route.params.id;
  if (!id) {
    loading.value = false;
    error.value = 'Missing card id';
    return;
  }
  loading.value = true;
  error.value = null;
  cardPayload.value = null;
  try {
    if (isCatalogueMode.value) {
      cardPayload.value = await getAvailableCard(id);
    } else {
      cardPayload.value = await getCard(id);
    }
  } catch (err) {
    const status = err.response?.status;
    error.value = status === 404 ? 'Card not found' : err.message || 'Failed to load card';
  } finally {
    loading.value = false;
  }
}

onMounted(fetchCard);
watch([() => route.params.id, () => route.query.mode], () => {
  isTracked.value = !isCatalogueMode.value;
  fetchCard();
});

/** Map ScrapedCard or Card API payload to jumbotron view model. */
function mapPayloadToCard(payload, tracked) {
  if (!payload) {
    return {
      id: route.params.id,
      cardName: '',
      bank: '',
      pointsProgram: '',
      type: 'VISA',
      network: 'VISA',
      status: 'To_Open',
      bonusOffer: '',
      minSpend: null,
      spendSoFar: 0,
      bonusPointsTarget: null,
      bonusPointsEarned: 0,
      bonusWindowMonths: null,
      daysRemaining: null,
      estimatedValue: '–',
      lastDigits: null,
      annualCost: null,
      subscribeUrl: null,
      firstYearFree: false,
      loungeAccess: false,
      loungeAccessDetails: null,
      noForeignTransactionFee: false,
      travelInsurance: false,
      travelInsuranceDetails: null,
      annualTravelCredit: null,
      isBusiness: false,
      centsPerPoint: null,
    };
  }

  /** Cents per point from welcome value (dollars) and bonus points. Returns null if not calculable. */
  function calcCentsPerPoint(valueDollars, points) {
    if (valueDollars == null || points == null || points <= 0 || valueDollars < 0) return null;
    const cents = (Number(valueDollars) * 100) / points;
    return Number.isFinite(cents) && cents >= 0 && cents <= 100 ? Math.round(cents * 100) / 100 : null;
  }

  const levels = payload.bonusLevels || [];
  const maxMonths = levels.length
    ? Math.max(...levels.map((l) => l.monthsFromOpen ?? 0))
    : null;
  const sumPoints = levels.length
    ? levels.reduce((acc, l) => acc + (l.rewardPoints ?? 0), 0)
    : null;
  const firstSpend = levels[0]?.spendAmount ?? payload.minSpend ?? null;

  if (tracked) {
    const deadline = payload.deadline ? new Date(payload.deadline) : null;
    const daysRemaining =
      deadline && !Number.isNaN(deadline.getTime())
        ? Math.max(0, Math.ceil((deadline - new Date()) / (24 * 60 * 60 * 1000)))
        : null;
    const expenses = payload.expenses ?? 0;
    const rewardPoints = payload.rewardPoints ?? 0;
    return {
      id: payload.id,
      cardName: payload.cardName ?? '',
      bank: payload.bank ?? '',
      pointsProgram: payload.pointsType ?? '',
      type: payload.type ?? 'VISA',
      network: payload.type ?? 'VISA',
      status: payload.status ?? 'Open',
      bonusOffer: payload.bonusDetails ?? buildOfferLine(firstSpend, maxMonths, sumPoints),
      minSpend: firstSpend,
      spendSoFar: expenses,
      bonusPointsTarget: sumPoints ?? payload.rewardPoints ?? null,
      bonusPointsEarned: rewardPoints,
      bonusWindowMonths: maxMonths,
      daysRemaining: daysRemaining ?? 0,
      estimatedValue: formatEstimatedValue(payload.pointsValue),
      lastDigits: null,
      annualCost: payload.annualCost ?? null,
      subscribeUrl: payload.milesopediaUrl ?? null,
      firstYearFree: payload.firstYearFree === true,
      loungeAccess: payload.loungeAccess === true,
      loungeAccessDetails: payload.loungeAccessDetails ?? null,
      noForeignTransactionFee: payload.noForeignTransactionFee === true,
      travelInsurance: payload.travelInsurance === true,
      travelInsuranceDetails: payload.travelInsuranceDetails ?? null,
      annualTravelCredit: payload.annualTravelCredit ?? null,
      isBusiness: payload.isBusiness === true,
      centsPerPoint: calcCentsPerPoint(payload.pointsValue, sumPoints ?? payload.rewardPoints ?? null),
    };
  }

  // Catalogue (ScrapedCard)
  const offerLine =
    payload.bonusDetails && payload.bonusDetails.trim()
      ? payload.bonusDetails.split('\n')[0].trim()
      : buildOfferLine(firstSpend, maxMonths, sumPoints);
  return {
    id: payload.id,
    cardName: payload.cardName ?? '',
    bank: payload.bank ?? '',
    pointsProgram: payload.pointsType ?? '',
    type: payload.type ?? 'VISA',
    network: payload.type ?? 'VISA',
    status: 'Available to track',
    bonusOffer: offerLine,
    minSpend: firstSpend ?? payload.minSpend ?? null,
    spendSoFar: 0,
    bonusPointsTarget: sumPoints ?? null,
    bonusPointsEarned: 0,
    bonusWindowMonths: maxMonths ?? null,
    daysRemaining: null,
    estimatedValue: formatEstimatedValue(payload.welcomeValueY1),
    lastDigits: null,
    annualCost: payload.annualCost ?? null,
    subscribeUrl: payload.subscribeUrl ?? null,
    firstYearFree: payload.firstYearFree === true,
    loungeAccess: payload.loungeAccess === true,
    loungeAccessDetails: payload.loungeAccessDetails ?? null,
    noForeignTransactionFee: payload.noForeignTransactionFee === true,
    travelInsurance: payload.travelInsurance === true,
    travelInsuranceDetails: payload.travelInsuranceDetails ?? null,
    annualTravelCredit: payload.annualTravelCredit ?? null,
    isBusiness: payload.isBusiness === true,
    centsPerPoint: calcCentsPerPoint(payload.welcomeValueY1, sumPoints ?? null),
  };
}

function buildOfferLine(minSpend, months, points) {
  const parts = [];
  if (points != null) parts.push(`${points.toLocaleString()} pts`);
  if (minSpend != null) parts.push(`after $${minSpend.toLocaleString()} spend`);
  if (months != null) parts.push(`in ${months} months`);
  return parts.length ? parts.join(' ') : '';
}

function formatEstimatedValue(value) {
  if (value == null) return '–';
  if (typeof value === 'number') return `$${value}`;
  return String(value);
}

const card = computed(() =>
  mapPayloadToCard(cardPayload.value, isTracked.value),
);

const bankCardColor = computed(() => getBankCardColor(card.value?.bank));

const annualFeeLabel = computed(() => {
  const cost = card.value.annualCost;
  if (cost == null) return '–';
  if (cost === 0) return t('availableCards.noAnnualFee');
  return `$${cost}${t('availableCards.perYear')}`;
});

/** Subtitle line under the card name: built from card data, mock where missing. */
const jumbotronSubtitle = computed(() => {
  const c = card.value;
  if (c.bonusPointsTarget != null) {
    const program = translatedPointsType(c.pointsProgram || '');
    const pts = c.bonusPointsTarget.toLocaleString();
    return program ? t('cardDetails.earnUpToPointsWithProgram', { pts, program }) : t('cardDetails.earnUpToPoints', { pts });
  }
  return t('cardDetails.welcomeBonusOffer');
});

/** Jumbotron tags derived from card benefit booleans. */
const jumbotronTags = computed(() => {
  const c = card.value;
  const tags = [];
  if (c.firstYearFree) tags.push({ label: t('cardDetails.tagFirstYearFree'), variant: 'success' });
  if (c.loungeAccess) tags.push({ label: t('cardDetails.tagLoungeAccess'), variant: 'neutral' });
  if (c.noForeignTransactionFee) tags.push({ label: t('cardDetails.tagNoFxFee'), variant: 'success' });
  if (c.travelInsurance) tags.push({ label: t('cardDetails.tagInsurance'), variant: 'neutral' });
  return tags;
});

/** Jumbotron checklist: benefits the card offers (lounge, travel credit, insurance, etc.). */
const jumbotronChecklist = computed(() => {
  const c = card.value;
  const items = [];
  if (c.loungeAccess) {
    items.push({ label: t('cardDetails.checklistLoungeVip'), detail: c.loungeAccessDetails ?? null });
  }
  if (c.annualTravelCredit != null && c.annualTravelCredit > 0) {
    items.push({ label: t('cardDetails.checklistAnnualTravelCredit', { amount: c.annualTravelCredit.toLocaleString() }) });
  }
  if (c.travelInsurance) {
    items.push({ label: t('cardDetails.checklistExcellentInsurance'), detail: c.travelInsuranceDetails ?? null });
  }
  if (c.firstYearFree && c.annualCost != null && c.annualCost > 0) {
    items.push({ label: t('cardDetails.highlightAnnualFeeWaived'), detail: t('cardDetails.thenAmountPerYear', { amount: c.annualCost }) });
  } else if (c.firstYearFree) {
    items.push({ label: t('cardDetails.highlightAnnualFeeWaived') });
  }
  if (c.noForeignTransactionFee) {
    items.push({ label: t('cardDetails.highlightNoForeignTxFee') });
  }
  return items;
});

// Card Benefits & Rewards Structure (mock – can be driven by API later)
const pointEarningStructure = [
  {
    id: 1,
    icon: 'dining',
    multiplier: '3X Points',
    label: 'Dining & grocery',
    description: 'On dining at restaurants worldwide & online grocery purchases (excluding Target, Walmart & wholesale clubs).',
    tintClasses: 'border-violet-200 bg-violet-50',
    iconBg: 'bg-violet-100 text-violet-600',
  },
  {
    id: 2,
    icon: 'travel',
    multiplier: '3X Points',
    label: 'Travel',
    description: 'On travel purchases including flights, hotels, trains, taxis, rideshares & more.',
    tintClasses: 'border-sky-200 bg-sky-50',
    iconBg: 'bg-sky-100 text-sky-600',
  },
  {
    id: 3,
    icon: 'cart',
    multiplier: '1X Point',
    label: 'All other purchases',
    description: 'On all other purchases with no limits or restrictions on earning.',
    tintClasses: 'border-slate-200 bg-white',
    iconBg: 'bg-slate-100 text-slate-600',
  },
];

const travelProtectionBenefits = [
  { label: 'Trip Cancellation Insurance', detail: 'Up to $10,000 per trip' },
  { label: 'Auto Rental Collision Coverage', detail: 'Primary coverage worldwide' },
  { label: 'Purchase Protection', detail: 'Up to $500 per claim, $50,000 per year' },
  { label: 'Extended Warranty Protection', detail: 'Additional year on eligible warranties' },
];

const premiumTravelBenefits = [
  { label: 'No Foreign Transaction Fees', detail: 'Use worldwide with no additional charges' },
  { label: 'Travel Portal Benefits', detail: '25% more value when redeemed for travel' },
  { label: 'Transfer to Partners', detail: '1:1 to 14+ airline and hotel programs' },
  { label: 'DoorDash Benefits', detail: 'Complimentary DashPass subscription after activation' },
];

const bonusProgress = computed(() => {
  const target = card.value.bonusPointsTarget ?? 0;
  const safeTarget = target > 0 ? target : 1;
  const current = Math.min(card.value.bonusPointsEarned ?? 0, safeTarget);
  const percent = safeTarget > 0 ? Math.round((current / safeTarget) * 100) : 0;
  return {
    current,
    target: safeTarget,
    percent,
  };
});

const spendProgress = computed(() => {
  const target = card.value.minSpend ?? 0;
  const safeTarget = target > 0 ? target : 1;
  const current = Math.min(card.value.spendSoFar ?? 0, safeTarget);
  const ratio = safeTarget > 0 ? current / safeTarget : 0;
  let variant = 'default';
  const daysLeft = card.value.daysRemaining;
  if (daysLeft != null && ratio < 0.4 && daysLeft < 60) {
    variant = 'warning';
  } else if (ratio >= 0.75) {
    variant = 'success';
  }
  return {
    current,
    target: safeTarget,
    variant,
  };
});

const statusVariant = computed(() => {
  if (!isTracked.value) return 'neutral';
  return 'info';
});

const cardStatusLabel = computed(() =>
  isTracked.value ? t('cardDetails.statusInProgress') : t('cardDetails.statusAvailableToTrack'),
);

const urgencyVariant = computed(() => {
  const d = card.value.daysRemaining;
  if (d == null) return 'neutral';
  if (d <= 30) return 'warning';
  if (d <= 60) return 'info';
  return 'neutral';
});

const urgencyLabel = computed(() => {
  const d = card.value.daysRemaining;
  if (d == null) return t('cardDetails.plentyOfTime');
  if (d <= 30) return t('cardDetails.tightWindow');
  if (d <= 60) return t('cardDetails.comfortablePace');
  return t('cardDetails.plentyOfTime');
});

const editLink = computed(() => ({
  name: 'CardEdit',
  params: { id: card.value.id },
}));

const analyticsSummary = computed(() => ({
  currentPace: 850,
  requiredPace: 750,
  projectedFinish: '2–3 weeks early',
}));

// Spending Timeline: time range buttons
const spendingTimeRanges = computed(() => [
  { value: '7 Days', label: t('cardDetails.range7Days') },
  { value: '30 Days', label: t('cardDetails.range30Days') },
  { value: 'All Time', label: t('cardDetails.rangeAllTime') },
]);
const selectedSpendingRange = ref('All Time');

// Spending Timeline: daily mock data from account opening (Jan 16) to Mar 9
const SPEND_TARGET = 4000;
const DAYS_TO_TARGET = 32; // target reached by ~Feb 17
function buildSpendingTimelineData() {
  const start = new Date('2025-01-16');
  const end = new Date('2025-03-09');
  const points = [];
  let cumulative = 0;
  // Deterministic daily increments (mock pattern: ~90–180/day with occasional spikes)
  const dailyAmount = (dayIndex) => {
    const base = 90 + (dayIndex % 7) * 12 + (dayIndex % 5) * 8;
    if (dayIndex > 0 && dayIndex % 4 === 0) return base + 180;
    return base;
  };
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayIndex = Math.floor((d - start) / (24 * 60 * 60 * 1000));
    cumulative += dailyAmount(dayIndex);
    const targetPace = Math.min(SPEND_TARGET, (SPEND_TARGET / DAYS_TO_TARGET) * dayIndex);
    points.push({
      date: new Date(d),
      dateStr: d.toISOString().slice(0, 10),
      cumulative: Math.min(cumulative, 3200),
      targetPace: Math.round(targetPace),
    });
  }
  return points;
}
const spendingTimelineData = buildSpendingTimelineData();

const filteredSpendingData = computed(() => {
  const data = spendingTimelineData;
  const n = data.length;
  if (selectedSpendingRange.value === '7 Days') return data.slice(-7);
  if (selectedSpendingRange.value === '30 Days') return data.slice(-30);
  return data;
});

// Chart dimensions and scaling
const chartWidth = 520;
const chartHeight = 224;
const chartPadding = { left: 36, right: 16, top: 12, bottom: 28 };
const chartInnerWidth = chartWidth - chartPadding.left - chartPadding.right;
const chartInnerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
const chartYMax = SPEND_TARGET;

const yAxisLabels = [0, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000];

const xAxisLabelsWithIndex = computed(() => {
  const data = filteredSpendingData.value;
  if (!data.length) return [];
  const step = Math.max(1, Math.floor((data.length - 1) / 6));
  const out = [];
  for (let i = 0; i < data.length; i += step) {
    out.push({ label: data[i].date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), index: i });
  }
  if (data.length - 1 !== (out[out.length - 1]?.index ?? -1)) {
    out.push({ label: data[data.length - 1].date.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }), index: data.length - 1 });
  }
  return out;
});

function xScale(index) {
  const data = filteredSpendingData.value;
  if (data.length <= 1) return chartPadding.left;
  return chartPadding.left + (index / (data.length - 1)) * chartInnerWidth;
}
function yScale(value) {
  return chartPadding.top + (1 - value / chartYMax) * chartInnerHeight;
}

const spendingLinePath = computed(() => {
  const data = filteredSpendingData.value;
  if (!data.length) return '';
  const pts = data.map((p, i) => `${xScale(i)},${yScale(p.cumulative)}`);
  return `M ${pts.join(' L ')}`;
});

const spendingAreaPath = computed(() => {
  const data = filteredSpendingData.value;
  if (!data.length) return '';
  const baseY = chartPadding.top + chartInnerHeight;
  const pts = data.map((p, i) => `${xScale(i)},${yScale(p.cumulative)}`);
  return `M ${xScale(0)},${baseY} L ${pts.join(' L ')} L ${xScale(data.length - 1)},${baseY} Z`;
});

const targetPaceLinePath = computed(() => {
  const data = filteredSpendingData.value;
  if (!data.length) return '';
  const pts = data.map((p, i) => `${xScale(i)},${yScale(p.targetPace)}`);
  return `M ${pts.join(' L ')}`;
});

// Single source of truth: total tracked spend = last cumulative from Spending Timeline
const totalTrackedSpend = computed(() => {
  const data = spendingTimelineData;
  return data.length ? data[data.length - 1].cumulative : 0;
});

// Spend by category: same total as timeline, proportions (Travel 48%, Dining 26%, Groceries 16%, Other 10%)
const spendByCategory = computed(() => {
  const total = totalTrackedSpend.value || 1;
  const proportions = [
    { label: 'Travel', pct: 0.48, color: 'bg-sky-500', hex: '#0ea5e9' },
    { label: 'Dining', pct: 0.26, color: 'bg-violet-500', hex: '#8b5cf6' },
    { label: 'Groceries', pct: 0.16, color: 'bg-emerald-500', hex: '#10b981' },
    { label: 'Other', pct: 0.1, color: 'bg-slate-400', hex: '#9ca3af' },
  ];
  return proportions.map(({ label, pct, color, hex }) => {
    const amount = Math.round(total * pct);
    const percent = Math.round(pct * 100);
    return { label, amount, percent, color, hex };
  });
});

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

// Recent activity: transactions derived from spendByCategory (same totals as timeline + category breakdown)
const recentTransactions = computed(() => {
  const categories = spendByCategory.value;
  if (!categories.length) return [];
  const total = totalTrackedSpend.value;
  if (total <= 0) return [];
  const start = new Date('2025-01-16');
  const end = new Date('2025-03-09');
  const days = Math.max(1, Math.round((end - start) / (24 * 60 * 60 * 1000)));
  const formatDate = (d) => d.toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
  const formatAmount = (n) => `$${Number(n).toFixed(2)}`;
  const ptsPerDollar = (category) => (category === 'Travel' || category === 'Dining' ? 2 : 1);
  const list = [];
  let id = 1;
  const categoryTx = [
    { label: 'Travel', amounts: [0.5, 0.35, 0.15], merchants: ['Air Canada', 'Hôtel Gouverneur', 'Budget Rent a Car'], badgeVariant: 'info' },
    { label: 'Dining', amounts: [0.45, 0.35, 0.2], merchants: ['La Petite Brasserie', 'Uber Eats', 'Restaurant Toqué'], badgeVariant: 'info' },
    { label: 'Groceries', amounts: [0.55, 0.45], merchants: ['Metro', 'IGA'], badgeVariant: 'success' },
    { label: 'Other', amounts: [0.6, 0.4], merchants: ['Amazon.ca', 'Shell Gas Station'], badgeVariant: 'neutral' },
  ];
  categoryTx.forEach(({ label, amounts, merchants, badgeVariant }, catIndex) => {
    const cat = categories.find((c) => c.label === label);
    if (!cat || cat.amount <= 0) return;
    amounts.forEach((share, i) => {
      const amount = Math.round(cat.amount * share);
      if (amount <= 0) return;
      const dayOffset = Math.min(Math.floor((catIndex * 0.25 + i * 0.15) * days), days - 1);
      const date = new Date(start);
      date.setDate(date.getDate() + dayOffset);
      if (date > end) return;
      const points = amount * ptsPerDollar(label);
      list.push({
        id: id++,
        date: formatDate(date),
        dateSort: date.getTime(),
        merchant: merchants[i] ?? label,
        category: label,
        badgeVariant,
        amount: formatAmount(amount),
        amountNum: amount,
        points: points.toLocaleString(),
        countsTowardsBonus: true,
      });
    });
  });
  list.push({
    id: id++,
    date: formatDate(new Date('2025-02-05')),
    dateSort: new Date('2025-02-05').getTime(),
    merchant: 'Spotify',
    category: 'Subscriptions',
    badgeVariant: 'neutral',
    amount: formatAmount(16.99),
    amountNum: 16.99,
    points: '51',
    countsTowardsBonus: false,
  });
  list.sort((a, b) => b.dateSort - a.dateSort);
  return list.map(({ dateSort, amountNum, ...rest }) => rest);
});

const milestones = [
  { id: 1, title: 'Card approved', dateLabel: 'Dec 1', description: 'Your application was approved and the welcome bonus clock started.', status: 'done', badgeVariant: 'success', statusLabel: 'Completed' },
  { id: 2, title: 'Card activated', dateLabel: 'Dec 5', description: 'Card activated and ready to use for eligible purchases.', status: 'done', badgeVariant: 'success', statusLabel: 'Completed' },
  { id: 3, title: 'First purchase', dateLabel: 'Dec 8', description: 'First eligible purchase posted; bonus period is active.', status: 'done', badgeVariant: 'success', statusLabel: 'Completed' },
  { id: 4, title: '25% of minimum spend', dateLabel: 'Dec 22', description: 'You reached $1,000 of the required $4,000 spend.', status: 'done', badgeVariant: 'success', statusLabel: 'Completed' },
  { id: 5, title: '50% of minimum spend reached', dateLabel: 'Jan 7', description: 'You have crossed half of the required minimum spend.', status: 'done', badgeVariant: 'success', statusLabel: 'Completed' },
  { id: 6, title: '75% of minimum spend', dateLabel: 'Jan 28', description: 'You are three-quarters of the way to the spend requirement.', status: 'current', badgeVariant: 'info', statusLabel: 'In progress' },
  { id: 7, title: 'Minimum spend met', dateLabel: 'Estimated Feb 12', description: 'Based on your current pace, you should hit the minimum spend around this date.', status: 'upcoming', badgeVariant: 'neutral', statusLabel: 'Upcoming' },
  { id: 8, title: 'Bonus points posted', dateLabel: 'Estimated Mar 15', description: 'Welcome bonus points typically post 1–2 statements after you meet the requirement.', status: 'upcoming', badgeVariant: 'neutral', statusLabel: 'Upcoming' },
];

function milestoneDotClasses(milestone) {
  if (milestone.status === 'done') {
    return 'border-emerald-500 bg-emerald-500';
  }
  if (milestone.status === 'current') {
    return 'border-violet-500 bg-white';
  }
  return 'border-slate-300 bg-white';
}
</script>

<style scoped>
.credit-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 25px 50px -12px rgba(0, 0, 0, 0.25),
    0 0 0 1px rgba(0, 0, 0, 0.1) inset;
}

</style>
