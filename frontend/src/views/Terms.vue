<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
      {{ $t('app.footerTerms') }}
    </h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
      {{ $t('terms.lastUpdated') }}
    </p>
    <p class="mt-6 text-slate-600 dark:text-slate-300">
      {{ $t('terms.intro') }}
    </p>

    <section class="mt-8 space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.acceptanceTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.acceptanceBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.descriptionTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.descriptionBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.accountTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.accountBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.acceptableUseTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.acceptableUseBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.catalogueTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.catalogueBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.disclaimerTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.disclaimerBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.limitationTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.limitationBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.changesTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.changesBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('terms.contactTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('terms.contactBody') }}
        </p>
      </div>
    </section>
  </div>
</template>
