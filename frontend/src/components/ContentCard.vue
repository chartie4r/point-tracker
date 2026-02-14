<template>
  <component
    :is="tag"
    :to="to"
    class="block border transition"
    :class="[tintClasses, variantClasses, to ? 'hover:shadow-card cursor-pointer' : '']"
  >
    <div v-if="$slots.header" class="border-b border-slate-100 dark:border-slate-700" :class="sectionPadding">
      <slot name="header" />
    </div>
    <div :class="sectionPadding">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-slate-100 dark:border-slate-700" :class="sectionPadding">
      <slot name="footer" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  to: { type: [String, Object], default: null },
  padding: {
    type: String,
    default: 'md',
    validator: (v) => ['none', 'sm', 'md', 'lg'].includes(v),
  },
  /** Optional tint for splash/marketing tiles and bonus cards: violet, emerald, amber, sky, rose, teal, indigo, fuchsia, cyan */
  tint: {
    type: String,
    default: null,
    validator: (v) => !v || ['violet', 'emerald', 'amber', 'sky', 'rose', 'teal', 'indigo', 'fuchsia', 'cyan'].includes(v),
  },
  /** Optional variant for feedback blocks: success (e.g. reset link sent), info */
  variant: {
    type: String,
    default: null,
    validator: (v) => !v || ['success', 'info'].includes(v),
  },
});

const tag = computed(() => (props.to ? 'router-link' : 'div'));

const tintClasses = computed(() => {
  if (!props.tint) return props.variant ? '' : 'border-slate-200 bg-white hover:border-primary-200 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-slate-500';
  const map = {
    violet: 'border-violet-200 bg-violet-50 hover:border-violet-300 dark:border-violet-800 dark:bg-violet-950/50 dark:hover:border-violet-700',
    emerald: 'border-emerald-200 bg-emerald-50 hover:border-emerald-300 dark:border-emerald-800 dark:bg-emerald-950/50 dark:hover:border-emerald-700',
    amber: 'border-amber-200 bg-amber-50 hover:border-amber-300 dark:border-amber-800 dark:bg-amber-950/50 dark:hover:border-amber-700',
    sky: 'border-sky-200 bg-sky-50 hover:border-sky-300 dark:border-sky-800 dark:bg-sky-950/50 dark:hover:border-sky-700',
    rose: 'border-rose-200 bg-rose-50 hover:border-rose-300 dark:border-rose-800 dark:bg-rose-950/50 dark:hover:border-rose-700',
    teal: 'border-teal-200 bg-teal-50 hover:border-teal-300 dark:border-teal-800 dark:bg-teal-950/50 dark:hover:border-teal-700',
    indigo: 'border-indigo-200 bg-indigo-50 hover:border-indigo-300 dark:border-indigo-800 dark:bg-indigo-950/50 dark:hover:border-indigo-700',
    fuchsia: 'border-fuchsia-200 bg-fuchsia-50 hover:border-fuchsia-300 dark:border-fuchsia-800 dark:bg-fuchsia-950/50 dark:hover:border-fuchsia-700',
    cyan: 'border-cyan-200 bg-cyan-50 hover:border-cyan-300 dark:border-cyan-800 dark:bg-cyan-950/50 dark:hover:border-cyan-700',
  };
  return map[props.tint];
});

const variantClasses = computed(() => {
  if (!props.variant) return '';
  if (props.variant === 'success') return 'border-primary-500/30 bg-primary-500/10 dark:border-primary-400/30 dark:bg-primary-500/20';
  if (props.variant === 'info') return 'border-sky-300 bg-sky-50 dark:border-sky-600 dark:bg-sky-950/50';
  return '';
});

const paddingMap = {
  none: '',
  sm: 'p-3',
  md: 'px-5 py-4',
  lg: 'p-6',
};

const sectionPadding = computed(() => paddingMap[props.padding] || 'px-5 py-4');
</script>
