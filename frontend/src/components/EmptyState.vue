<template>
  <div class="flex flex-col items-center justify-center py-12 text-center">
    <slot name="icon">
      <span class="text-4xl text-slate-300 dark:text-slate-600" aria-hidden="true">—</span>
    </slot>
    <h3 class="mt-4 text-base font-semibold text-slate-900 dark:text-slate-100">
      {{ title }}
    </h3>
    <p class="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-sm">
      {{ message }}
    </p>
    <div v-if="actionLabel" class="mt-4">
      <AppButton
        v-if="actionTo"
        :to="actionTo"
        variant="primary"
        size="md"
      >
        {{ actionLabel }}
      </AppButton>
      <AppButton
        v-else
        variant="primary"
        size="md"
        @click="$emit('action')"
      >
        {{ actionLabel }}
      </AppButton>
    </div>
  </div>
</template>

<script setup>
import AppButton from './AppButton.vue';

defineProps({
  title: { type: String, required: true },
  message: { type: String, default: '' },
  actionLabel: { type: String, default: '' },
  actionTo: { type: [String, Object], default: null },
});

defineEmits(['action']);
</script>
