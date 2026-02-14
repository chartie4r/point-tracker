<template>
  <div class="max-w-3xl">
    <h1 class="text-2xl font-bold text-slate-900 dark:text-slate-100">
      {{ $t('app.footerPrivacy') }}
    </h1>
    <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
      {{ $t('privacy.lastUpdated') }}
    </p>
    <p class="mt-6 text-slate-600 dark:text-slate-300">
      {{ $t('privacy.intro') }}
    </p>

    <section class="mt-8 space-y-6">
      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.whoWeAreTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.whoWeAreBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.dataTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.dataBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.useTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.useBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.storageTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.storageBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.thirdPartiesTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.thirdPartiesBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.rightsTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.rightsBody') }}
        </p>
      </div>

      <div>
        <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
          {{ $t('privacy.contactTitle') }}
        </h2>
        <p class="mt-2 text-slate-600 dark:text-slate-300">
          {{ $t('privacy.contactBody') }}
        </p>
      </div>
    </section>
  </div>
</template>
