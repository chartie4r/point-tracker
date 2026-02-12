<template>
  <component
    :is="tag"
    :to="to"
    class="flex items-center gap-3 border-b border-slate-100 py-3 last:border-b-0"
    :class="to ? 'hover:bg-slate-50/80 transition' : ''"
  >
    <div v-if="$slots.leading" class="flex-shrink-0">
      <slot name="leading" />
    </div>
    <div class="min-w-0 flex-1">
      <slot />
    </div>
    <div v-if="$slots.trailing" class="flex-shrink-0">
      <slot name="trailing" />
    </div>
  </component>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  to: { type: [String, Object], default: null },
});

const tag = computed(() => (props.to ? 'router-link' : 'div'));
</script>
