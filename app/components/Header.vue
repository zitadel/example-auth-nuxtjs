<template>
	<header class="bg-white border-b border-gray-200">
		<div class="max-w-7xl mx-auto px-6 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center space-x-3">
					<NuxtImg
						src="/app-logo.svg"
						alt="App Icon"
						width="40"
						height="40"
						class="w-8 h-8"
					/>
					<h1 class="text-xl font-semibold text-gray-900">
						Demo Application
					</h1>
				</div>
				<SignOutButton v-if="isAuthenticated" />
			</div>
		</div>
	</header>
</template>

<script setup lang="ts">
import SignOutButton from '~/components/SignOutButton.vue'

type HeaderProps = {
	isAuthenticated: boolean
}

defineProps<HeaderProps>()

defineOptions({
	name: 'HeaderComponent'
})
</script>
