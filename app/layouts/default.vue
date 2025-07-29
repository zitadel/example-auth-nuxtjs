<template>
  <ErrorBoundary :show-details="isDev" class="flex-1 flex flex-col">
    <slot />
  </ErrorBoundary>
</template>

<script setup lang="ts">
import ErrorBoundary from '~/components/ErrorBoundary.vue';

const isDev = import.meta.dev;
</script>
