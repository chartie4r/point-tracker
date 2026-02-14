<template>
  <span
    class="card-network-logo"
    :class="[
      `card-network-logo--${typeKey}`,
      { 'card-network-logo--light': light }
    ]"
    :title="type"
  >
    <img
      v-if="logoUrl && !imgFailed"
      :src="logoUrl"
      :alt="type || 'Card network'"
      class="card-network-logo__img"
      @error="imgFailed = true"
    />
    <span v-else class="card-network-logo__fallback">{{ type ? String(type).slice(0, 1) : '?' }}</span>
  </span>
</template>

<script setup>
import { computed, ref } from 'vue';
import { getCardNetworkLogoUrl } from '../utils/logos';

const props = defineProps({
  type: { type: String, default: '' },
  /** When true, show logo in white (e.g. on dark card background). */
  light: { type: Boolean, default: false },
});

const typeKey = computed(() => (props.type || '').toLowerCase().replace(/\s/g, ''));
const logoUrl = computed(() => getCardNetworkLogoUrl(props.type));
const imgFailed = ref(false);
</script>

<style scoped>
.card-network-logo {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 48px;
  height: 26px;
  overflow: hidden;
}
.card-network-logo__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center;
  display: block;
}
.card-network-logo--light {
  color: #fff;
}
/* Logo shown as-is (no filter); SVGs with currentColor need inlining to inherit .card-network-logo--light */
.card-network-logo__fallback {
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
}
.card-network-logo--light .card-network-logo__fallback {
  color: rgba(255, 255, 255, 0.9);
}
</style>
