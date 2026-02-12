<template>
  <component
    :is="tag"
    :to="to"
    class="block border border-slate-200 bg-white px-4 py-4 transition hover:border-primary-200 hover:shadow-card"
  >
    <p v-if="label" class="text-xs font-semibold uppercase tracking-wide text-slate-500">
      {{ label }}
    </p>
    <p class="mt-2 text-2xl font-bold text-slate-900">
      {{ value }}
    </p>
    <Badge v-if="trend" variant="info" size="sm" class="mt-2">
      {{ trend }}
    </Badge>
  </component>
</template>

<script setup>
import { computed } from 'vue';
import Badge from './Badge.vue';

const props = defineProps({
  label: { type: String, default: '' },
  value: { type: [String, Number], required: true },
  to: { type: [String, Object], default: null },
  trend: { type: String, default: '' },
});

const tag = computed(() => (props.to ? 'router-link' : 'div'));
</script>
