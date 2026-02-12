<template>
  <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
    <div class="min-w-0">
      <slot />
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup>
</script>
