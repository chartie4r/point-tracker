<template>
  <span class="card-network-logo" :class="[`card-network-logo--${typeKey}`]" :title="type">
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
  width: 40px;
  height: 26px;
  overflow: hidden;
}
.card-network-logo__img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}
.card-network-logo--visa .card-network-logo__img { max-height: 14px; }
.card-network-logo--mastercard .card-network-logo__img { max-height: 20px; }
.card-network-logo--amex .card-network-logo__img { max-height: 18px; }
.card-network-logo__fallback {
  font-size: 0.75rem;
  font-weight: 700;
  color: #666;
}
</style>
