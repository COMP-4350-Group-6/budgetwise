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
  <div v-if="isLoading" class="loading-screen">
    <div class="loading-text">Loading...</div>
  </div>
  <RouterView v-else />
</template>

<style>

.loading-text {
  color: white;
  font-size: 1.5rem;
  font-weight: 500;
}
</style>
