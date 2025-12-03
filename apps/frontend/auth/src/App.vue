<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { initialize, isLoading } = useAuth();

// Initialize auth on app mount
onMounted(async () => {
  await initialize();
});
</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="text-green-700">Loading...</div>
  </div>
  <RouterView v-else />
</template>

<style>
/* Minimal global styles - using Tailwind classes in components */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}
</style>
