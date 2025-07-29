<template>
  <div class="bg-gray-50 min-h-screen flex flex-col">
    <Header :is-authenticated="true" />
    <main class="flex-1 px-6 py-12">
      <div
        v-if="status === 'loading'"
        class="flex items-center justify-center min-h-screen"
      >
        <p>Loading your session…</p>
      </div>
      <div v-else class="max-w-5xl mx-auto">
        <div
          class="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 mb-8"
        >
          <div class="flex items-center">
            <div
              class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center"
            >
              <!--suppress HtmlDeprecatedAttribute -->
              <svg
                class="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="ml-4">
              <h2 class="text-xl font-semibold text-green-900">
                Authentication Successful!
              </h2>
              <p class="text-green-700 mt-1">
                You have successfully logged into the application.
              </p>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg border border-gray-200 p-8">
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">
            Session Information
          </h2>
          <p class="text-gray-600 mb-6">
            Below is the authentication data stored in your session:
          </p>
          <div class="bg-gray-900 rounded-lg p-6 overflow-x-auto">
            <pre class="text-sm text-green-400 font-mono leading-relaxed"
              >{{ JSON.stringify(data, null, 2) }}
            </pre>
          </div>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Header from '~/components/Header.vue';
import Footer from '~/components/Footer.vue';
import { useAuth } from '#auth/client';

const { data, status, signIn } = useAuth();

watchEffect(() => {
  if (status.value === 'unauthenticated') {
    signIn('zitadel', { callbackUrl: '/profile' });
  }
});
</script>
