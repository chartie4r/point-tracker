<template>
  <component
    :is="tag"
    :to="to"
    class="block border transition"
    :class="[tintClasses, variantClasses, to ? 'hover:shadow-card cursor-pointer' : '']"
  >
    <div v-if="$slots.header" class="border-b border-slate-100" :class="sectionPadding">
      <slot name="header" />
    </div>
    <div :class="sectionPadding">
      <slot />
    </div>
    <div v-if="$slots.footer" class="border-t border-slate-100" :class="sectionPadding">
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
  /** Optional tint for splash/marketing tiles: violet, emerald, amber, sky */
  tint: {
    type: String,
    default: null,
    validator: (v) => !v || ['violet', 'emerald', 'amber', 'sky'].includes(v),
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
  if (!props.tint) return props.variant ? '' : 'border-slate-200 bg-white hover:border-primary-200';
  const map = {
    violet: 'border-violet-200 bg-violet-50 hover:border-violet-300',
    emerald: 'border-emerald-200 bg-emerald-50 hover:border-emerald-300',
    amber: 'border-amber-200 bg-amber-50 hover:border-amber-300',
    sky: 'border-sky-200 bg-sky-50 hover:border-sky-300',
  };
  return map[props.tint];
});

const variantClasses = computed(() => {
  if (!props.variant) return '';
  if (props.variant === 'success') return 'border-primary-500/30 bg-primary-500/10';
  if (props.variant === 'info') return 'border-sky-300 bg-sky-50';
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
