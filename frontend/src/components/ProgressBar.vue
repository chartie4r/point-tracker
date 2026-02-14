<template>
  <div class="w-full">
    <div v-if="label || showPercent" class="mb-1 flex justify-between text-sm text-slate-600 dark:text-slate-400">
      <span v-if="label">{{ label }}</span>
      <span v-else></span>
      <span v-if="showPercent">{{ percent }}%</span>
    </div>
    <div
      class="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-600"
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
    validator: (v) => ['default', 'violet', 'emerald', 'amber', 'sky', 'rose', 'teal', 'indigo', 'fuchsia', 'cyan', 'warning', 'success'].includes(v),
  },
});

const percent = computed(() => {
  if (props.max <= 0) return 0;
  return Math.min(100, Math.round((props.value / props.max) * 100));
});

const barClasses = computed(() => {
  const map = {
    default: 'bg-primary-500',
    violet: 'bg-violet-500',
    emerald: 'bg-emerald-500',
    amber: 'bg-amber-500',
    sky: 'bg-sky-500',
    rose: 'bg-rose-500',
    teal: 'bg-teal-500',
    indigo: 'bg-indigo-500',
    fuchsia: 'bg-fuchsia-500',
    cyan: 'bg-cyan-500',
    warning: 'bg-amber-500',
    success: 'bg-emerald-500',
  };
  return map[props.variant] || map.default;
});
</script>
