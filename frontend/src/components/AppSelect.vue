<template>
  <div>
    <AppLabel v-if="$slots.label" :for="selectId">
      <slot name="label" />
    </AppLabel>
    <select
      :id="selectId"
      :value="modelValue"
      class="border bg-white py-1.5 pl-2 pr-8 text-sm text-slate-800 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
      :class="selectClasses"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <template v-if="options && options.length">
        <option
          v-for="opt in options"
          :key="opt.value"
          :value="opt.value"
        >
          {{ opt.label }}
        </option>
      </template>
      <slot v-else />
    </select>
    <p v-if="error" class="mt-1 text-sm text-red-600">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppLabel from './AppLabel.vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  options: { type: Array, default: null },
  placeholder: { type: String, default: '' },
  error: { type: String, default: '' },
});

defineEmits(['update:modelValue']);

const selectId = computed(() => `app-select-${Math.random().toString(36).slice(2, 9)}`);

const selectClasses = computed(() => {
  const base = 'block w-full';
  const border = props.error ? 'border-red-500' : 'border-slate-200';
  return `${base} ${border}`;
});
</script>
