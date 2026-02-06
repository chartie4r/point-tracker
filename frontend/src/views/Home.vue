<template>
  <div class="home">
    <!-- Hero -->
    <section class="relative overflow-hidden rounded-2xl bg-slate-900 px-6 py-16 text-white sm:px-10 sm:py-20 lg:px-12">
      <div class="relative z-10 mx-auto max-w-3xl text-center">
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
          {{ $t('home.heroTitle') }}
        </h1>
        <p class="mt-4 text-lg text-slate-300 sm:text-xl">
          {{ $t('home.heroSubtitle') }}
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-4">
          <router-link
            to="/register"
            class="inline-flex items-center rounded-lg bg-primary-500 px-6 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-primary-600"
          >
            {{ $t('home.getStarted') }}
          </router-link>
          <router-link
            to="/login"
            class="inline-flex items-center rounded-lg border border-slate-500 bg-transparent px-6 py-3 text-base font-semibold text-white transition hover:border-slate-400 hover:bg-white/5"
          >
            {{ $t('auth.login') }}
          </router-link>
        </div>
      </div>
      <!-- Decorative grid -->
      <div class="absolute inset-0 z-0 opacity-20" aria-hidden="true">
        <div class="absolute inset-0" style="background-image: linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px); background-size: 3rem 3rem;" />
      </div>
    </section>

    <!-- Sales points -->
    <section class="mt-16" aria-labelledby="features-heading">
      <h2 id="features-heading" class="sr-only">{{ $t('home.featuresTitle') }}</h2>
      <div class="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        <article class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-primary-200">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ $t('home.feature1Title') }}</h3>
          <p class="mt-2 text-slate-600">{{ $t('home.feature1Desc') }}</p>
        </article>

        <article class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-primary-200">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ $t('home.feature2Title') }}</h3>
          <p class="mt-2 text-slate-600">{{ $t('home.feature2Desc') }}</p>
        </article>

        <article class="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200/80 transition hover:ring-primary-200 sm:col-span-2 lg:col-span-1">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
            <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
          </div>
          <h3 class="mt-4 text-lg font-semibold text-slate-900">{{ $t('home.feature3Title') }}</h3>
          <p class="mt-2 text-slate-600">{{ $t('home.feature3Desc') }}</p>
        </article>
      </div>
    </section>

    <!-- CTA -->
    <section class="mt-16 rounded-2xl bg-slate-100 px-6 py-10 text-center sm:py-12">
      <p class="text-lg font-medium text-slate-700">{{ $t('home.ctaText') }}</p>
      <router-link
        to="/register"
        class="mt-4 inline-flex items-center rounded-lg bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
      >
        {{ $t('home.getStarted') }}
      </router-link>
    </section>
  </div>
</template>

<script setup>
</script>
