<template>
  <component
    :is="tag"
    :to="to"
    :type="tag === 'button' ? type : undefined"
    :disabled="disabled"
    class="inline-flex items-center justify-center font-semibold transition disabled:opacity-50"
    :class="[sizeClasses, variantClasses]"
    @click="tag === 'button' ? $emit('click') : undefined"
  >
    <slot />
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'danger'].includes(v),
  },
  size: {
    type: String,
    default: 'md',
    validator: (v) => ['sm', 'md', 'lg'].includes(v),
  },
  type: { type: String, default: 'button' },
  disabled: { type: Boolean, default: false },
  to: { type: [String, Object], default: null },
});

defineEmits(['click']);

const tag = computed(() => (props.to ? 'router-link' : 'button'));

const sizeClasses = computed(() => {
  const map = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-7 py-3 text-sm uppercase tracking-wide',
  };
  return map[props.size];
});

const variantClasses = computed(() => {
  const map = {
    primary: 'border-2 border-violet-500 bg-violet-500 text-white hover:bg-violet-600 hover:border-violet-600',
    secondary: 'border-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
    danger: 'border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600',
  };
  return map[props.variant];
});
</script>
