<template>
  <div class="home space-y-10">
    <!-- Hero card: splash-style marketing content -->
    <section class="border border-slate-200 bg-white px-6 py-10 sm:px-10 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div class="max-w-xl">
        <h1 class="font-display text-3xl font-extrabold text-slate-900 sm:text-4xl lg:text-5xl">
          {{ $t('home.heroTitle') }}
        </h1>
        <p class="mt-3 text-base text-slate-600 sm:text-lg">
          {{ $t('home.heroSubtitle') }}
        </p>

        <!-- Key benefits as short bullets -->
        <ul class="mt-4 space-y-1.5 text-sm text-slate-600">
          <li>• {{ $t('home.bullet1') }}</li>
          <li>• {{ $t('home.bullet2') }}</li>
          <li>• {{ $t('home.bullet3') }}</li>
        </ul>

        <div class="mt-6 flex flex-wrap items-center gap-3">
          <router-link
            to="/register"
            class="inline-flex items-center border-2 border-violet-500 bg-violet-500 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white"
          >
            {{ $t('home.getStarted') }}
          </router-link>
          <router-link
            to="/login"
            class="inline-flex items-center border-2 border-slate-200 bg-white px-7 py-3 text-sm font-semibold uppercase tracking-wide text-slate-800"
          >
            {{ $t('auth.login') }}
          </router-link>
        </div>
      </div>

      <!-- Right: four splash tiles explaining the product areas -->
      <div class="md:flex-1">
        <div class="grid w-full grid-cols-1 gap-4 text-sm text-slate-700 sm:grid-cols-2">
          <div class="border border-violet-200 bg-violet-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-violet-700">
              {{ $t('home.tileOverviewTitle') }}
            </p>
            <p class="mt-2 text-slate-700">
              {{ $t('home.tileOverviewBody') }}
            </p>
          </div>
          <div class="border border-emerald-200 bg-emerald-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              {{ $t('home.tileCatalogueTitle') }}
            </p>
            <p class="mt-2 text-slate-700">
              {{ $t('home.tileCatalogueBody') }}
            </p>
          </div>
          <div class="border border-amber-200 bg-amber-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
              {{ $t('home.tileWeeklyTitle') }}
            </p>
            <p class="mt-2 text-slate-700">
              {{ $t('home.tileWeeklyBody') }}
            </p>
          </div>
          <div class="border border-sky-200 bg-sky-50 px-4 py-4">
            <p class="text-xs font-semibold uppercase tracking-wide text-sky-700">
              {{ $t('home.tileFansTitle') }}
            </p>
            <p class="mt-2 text-slate-700">
              {{ $t('home.tileFansBody') }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Feature cards: use existing i18n content in a simple grid -->
    <section aria-labelledby="features-heading">
      <h2 id="features-heading" class="sr-only">
        {{ $t('home.featuresTitle') }}
      </h2>
      <div class="grid gap-4 sm:grid-cols-3">
        <article class="border border-slate-200 bg-white px-5 py-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-violet-700">
            01
          </p>
          <h3 class="mt-2 font-display text-lg font-bold text-slate-900">
            {{ $t('home.feature1Title') }}
          </h3>
          <p class="mt-2 text-sm text-slate-600">
            {{ $t('home.feature1Desc') }}
          </p>
        </article>

        <article class="border border-slate-200 bg-white px-5 py-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-pink-700">
            02
          </p>
          <h3 class="mt-2 font-display text-lg font-bold text-slate-900">
            {{ $t('home.feature2Title') }}
          </h3>
          <p class="mt-2 text-sm text-slate-600">
            {{ $t('home.feature2Desc') }}
          </p>
        </article>

        <article class="border border-slate-200 bg-white px-5 py-5">
          <p class="text-xs font-semibold uppercase tracking-wide text-amber-700">
            03
          </p>
          <h3 class="mt-2 font-display text-lg font-bold text-slate-900">
            {{ $t('home.feature3Title') }}
          </h3>
          <p class="mt-2 text-sm text-slate-600">
            {{ $t('home.feature3Desc') }}
          </p>
        </article>
      </div>
    </section>

    <!-- CTA card: final splash call-to-action -->
    <section class="border border-slate-200 bg-white px-6 py-8 text-center sm:py-10">
      <p class="text-base font-medium text-slate-800 sm:text-lg">
        {{ $t('home.ctaText') }}
      </p>
      <router-link
        to="/register"
        class="mt-5 inline-flex items-center border-2 border-violet-500 bg-violet-500 px-7 py-3 text-sm font-semibold uppercase tracking-wide text-white"
      >
        {{ $t('home.getStarted') }}
      </router-link>
    </section>
  </div>
</template>

<script setup>
// Logo image is now controlled in the main App header; no logo in the hero.
</script>

