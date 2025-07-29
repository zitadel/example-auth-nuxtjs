<template>
	<div class="bg-gray-50 min-h-screen flex flex-col">
		<ErrorBoundary :show-details="process.env.NODE_ENV === 'development'">
			<slot />
		</ErrorBoundary>
	</div>
</template>

<script setup lang="ts">
import ErrorBoundary from '~/components/ErrorBoundary.vue'
</script>
