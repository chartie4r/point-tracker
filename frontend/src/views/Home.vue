<template>
  <div class="home space-y-10">
    <!-- Hero card: splash-style marketing content -->
    <section class="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-10 sm:px-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div class="max-w-xl">
        <h1 class="font-display text-3xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-4xl lg:text-5xl">
          {{ $t('home.heroTitle') }}
        </h1>
        <p class="mt-3 text-base text-slate-600 dark:text-slate-300 sm:text-lg">
          {{ $t('home.heroSubtitle') }}
        </p>

        <!-- Key benefits as short bullets -->
        <ul class="mt-4 space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
          <li>• {{ $t('home.bullet1') }}</li>
          <li>• {{ $t('home.bullet2') }}</li>
          <li>• {{ $t('home.bullet3') }}</li>
        </ul>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <AppButton to="/register" variant="primary" size="lg">
            {{ $t('home.getStarted') }}
          </AppButton>
          <AppButton to="/login" variant="secondary" size="lg">
            {{ $t('auth.login') }}
          </AppButton>
        </div>
      </div>

      <!-- Right: four splash tiles explaining the product areas -->
      <div class="md:flex-1">
        <div class="grid w-full grid-cols-1 gap-4 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
          <ContentCard padding="md" tint="violet">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-violet-700 dark:text-violet-400">
                {{ $t('home.tileOverviewTitle') }}
              </p>
            </template>
            <p class="mt-2 text-slate-700 dark:text-slate-300">
              {{ $t('home.tileOverviewBody') }}
            </p>
          </ContentCard>
          <ContentCard padding="md" tint="emerald">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-400">
                {{ $t('home.tileCatalogueTitle') }}
              </p>
            </template>
            <p class="mt-2 text-slate-700 dark:text-slate-300">
              {{ $t('home.tileCatalogueBody') }}
            </p>
          </ContentCard>
          <ContentCard padding="md" tint="amber">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400">
                {{ $t('home.tileWeeklyTitle') }}
              </p>
            </template>
            <p class="mt-2 text-slate-700 dark:text-slate-300">
              {{ $t('home.tileWeeklyBody') }}
            </p>
          </ContentCard>
          <ContentCard padding="md" tint="sky">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-sky-700 dark:text-sky-400">
                {{ $t('home.tileFansTitle') }}
              </p>
            </template>
            <p class="mt-2 text-slate-700 dark:text-slate-300">
              {{ $t('home.tileFansBody') }}
            </p>
          </ContentCard>
        </div>
      </div>
    </section>

    <!-- Feature cards: use existing i18n content in a simple grid -->
    <section aria-labelledby="features-heading">
      <h2 id="features-heading" class="sr-only">
        {{ $t('home.featuresTitle') }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <article>
          <ContentCard padding="md">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-violet-700">01</p>
              <h3 class="mt-2 font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ $t('home.feature1Title') }}
              </h3>
            </template>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {{ $t('home.feature1Desc') }}
            </p>
          </ContentCard>
        </article>

        <article>
          <ContentCard padding="md">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-pink-700">02</p>
              <h3 class="mt-2 font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ $t('home.feature2Title') }}
              </h3>
            </template>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {{ $t('home.feature2Desc') }}
            </p>
          </ContentCard>
        </article>

        <article>
          <ContentCard padding="md">
            <template #header>
              <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">03</p>
              <h3 class="mt-2 font-display text-lg font-bold text-slate-900 dark:text-slate-100">
                {{ $t('home.feature3Title') }}
              </h3>
            </template>
            <p class="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {{ $t('home.feature3Desc') }}
            </p>
          </ContentCard>
        </article>
      </div>
    </section>

    <!-- CTA card: final splash call-to-action -->
    <section class="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-6 py-8 text-center sm:py-10">
      <p class="text-base font-medium text-slate-800 dark:text-slate-200 sm:text-lg">
        {{ $t('home.ctaText') }}
      </p>
      <AppButton to="/register" variant="primary" size="lg" class="mt-5">
        {{ $t('home.getStarted') }}
      </AppButton>
    </section>
  </div>
</template>

<script setup>
import AppButton from '../components/AppButton.vue';
import ContentCard from '../components/ContentCard.vue';
</script>
