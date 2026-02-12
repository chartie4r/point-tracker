<template>
  <div class="w-full">
    <div v-if="label || showPercent" class="mb-1 flex justify-between text-sm text-slate-600">
      <span v-if="label">{{ label }}</span>
      <span v-else></span>
      <span v-if="showPercent">{{ percent }}%</span>
    </div>
    <div
      class="h-2 w-full overflow-hidden rounded-full bg-slate-200"
      role="progressbar"
      :aria-valuenow="value"
      :aria-valuemin="0"
      :aria-valuemax="max"
    >
      <div
        class="h-full rounded-full transition-all"
        :class="barClasses"
        :style="{ width: `${percent}%` }"
      />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  label: { type: String, default: '' },
  showPercent: { type: Boolean, default: true },
  variant: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'warning', 'success'].includes(v),
  },
});

const percent = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.round((props.value / props.max) * 100));
});

const barClasses = computed(() => {
  const map = {
    default: 'bg-primary-500',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
  };
  return map[props.variant];
});
</script>
