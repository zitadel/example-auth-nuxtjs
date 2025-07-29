<template>
  <footer class="bg-gray-100 border-t border-gray-200">
    <div class="max-w-7xl mx-auto px-6 py-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <span class="text-sm text-gray-600">Powered by</span>
          <NuxtImg
            src="/zitadel-logo.svg"
            alt="Zitadel"
            width="295"
            height="81"
            class="h-12 w-auto"
          />
        </div>
        <div class="flex items-start max-w-2xl">
          <div class="ml-3">
            <p class="text-sm text-gray-600 text-right">
              <strong class="text-gray-800">Disclaimer:</strong>
              This is a demonstration application for reference purposes only.
              Do not use this code in production environments without proper
              security review and modifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
defineOptions({
  name: 'FooterComponent',
});
</script>
