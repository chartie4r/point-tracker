<template>
  <span
    class="inline-flex flex-shrink-0 items-center justify-center overflow-hidden"
    :class="size === 'sm' ? 'h-6 w-8' : 'h-8 w-12'"
    :title="bank"
  >
    <img
      v-if="logoUrl && !imgFailed"
      :src="logoUrl"
      :alt="bank"
      class="h-full w-full object-contain"
      @error="imgFailed = true"
    />
    <span v-else class="text-xs font-bold text-slate-500">{{ initials }}</span>
  </span>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { getBankLogoUrl, getBankInitials } from '../utils/logos';

const props = defineProps({
  bank: { type: String, default: '' },
  size: { type: String, default: 'md' }, // 'sm' | 'md'
});

const logoUrl = computed(() => getBankLogoUrl(props.bank));
const initials = computed(() => getBankInitials(props.bank));
const imgFailed = ref(false);

watch(
  () => props.bank,
  () => {
    imgFailed.value = false;
  },
);
</script>
