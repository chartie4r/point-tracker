<template>
  <div class="border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800">
    <div class="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-600 px-6 py-4">
      <h2 class="text-lg font-semibold text-slate-900 dark:text-slate-100">
        {{ title }}
      </h2>
      <AppButton
        v-if="actionLabel"
        :to="actionTo"
        variant="outline"
        size="sm"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </AppButton>
    </div>
    <div class="p-6">
      <slot />
    </div>
  </div>
</template>

<script setup>
import AppButton from './AppButton.vue';

defineProps({
  title: { type: String, required: true },
  actionLabel: { type: String, default: '' },
  actionTo: { type: [String, Object], default: null },
});

defineEmits(['action']);
</script>
