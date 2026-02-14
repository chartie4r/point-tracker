<template>
  <div>
    <AppLabel v-if="$slots.default" :for="inputId">
      <slot />
    </AppLabel>
    <input
      :id="inputId"
      :value="modelValue"
      :type="type"
      :placeholder="placeholder"
      :required="required"
      :min="min"
      :max="max"
      :minlength="minlength"
      :maxlength="maxlength"
      :step="step"
      :disabled="disabled"
      :autocomplete="autocomplete"
      class="block w-full border bg-white dark:bg-slate-800 py-2 px-3 text-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 dark:focus:border-violet-500 dark:focus:ring-violet-500 disabled:opacity-50"
      :class="inputClasses"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ error }}</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import AppLabel from './AppLabel.vue';

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  type: { type: String, default: 'text' },
  placeholder: { type: String, default: '' },
  required: { type: Boolean, default: false },
  min: { type: [String, Number], default: undefined },
  max: { type: [String, Number], default: undefined },
  minlength: { type: [String, Number], default: undefined },
  maxlength: { type: [String, Number], default: undefined },
  step: { type: [String, Number], default: undefined },
  disabled: { type: Boolean, default: false },
  error: { type: String, default: '' },
  autocomplete: { type: String, default: undefined },
});

defineEmits(['update:modelValue']);

const inputId = computed(() => `app-input-${Math.random().toString(36).slice(2, 9)}`);

const inputClasses = computed(() =>
  props.error ? 'border-red-500 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'
);
</script>
