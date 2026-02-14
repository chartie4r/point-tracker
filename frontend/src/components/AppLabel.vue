<template>
  <label
    v-if="labelFor"
    :for="labelFor"
    class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
  >
    <slot />
  </label>
  <span
    v-else
    class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
  >
    <slot />
  </span>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  /** Id of the form control (HTML for attribute) */
  for: { type: String, default: '' },
});

const labelFor = computed(() => props.for);
</script>
