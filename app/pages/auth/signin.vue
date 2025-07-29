<template>
  <ClientOnly>
    <main
      class="flex-1 grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8"
    >
      <div class="text-center max-w-md w-full">
        <div
          class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 mb-6"
        >
          <!--suppress HtmlDeprecatedAttribute -->
          <svg
            class="h-8 w-8 text-blue-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
            />
          </svg>
        </div>

        <h1
          class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl"
        >
          Sign in
        </h1>

        <p
          :class="`mt-6 text-lg font-medium text-pretty sm:text-xl/8 ${
            error ? 'text-red-600' : 'text-gray-500'
          }`"
        >
          {{ error ? getErrorMessage(error) : 'Continue to your account' }}
        </p>

        <div v-if="provider" class="mt-10">
          <form :action="provider.signinUrl" method="POST" class="space-y-4">
            <input type="hidden" name="csrfToken" :value="csrfToken" />
            <input type="hidden" name="callbackUrl" :value="callbackUrl" />

            <button
              type="submit"
              class="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200"
            >
              <!--suppress HtmlDeprecatedAttribute -->
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fill-rule="evenodd"
                  d="M8 10V7a4 4 0 1 1 8 0v3h1a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h1Zm2-3a2 2 0 1 1 4 0v3h-4V7Zm2 6a1 1 0 0 1 1 1v3a1 1 0 1 1-2 0v-3a1 1 0 0 1 1-1Z"
                  clip-rule="evenodd"
                />
              </svg>
              Sign in with {{ provider.name }}
            </button>
          </form>
        </div>

        <div v-else class="mt-10">
          <p class="text-gray-600">Loading...</p>
        </div>

        <div class="mt-8">
          <NuxtLink
            to="/"
            class="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <!--suppress HtmlDeprecatedAttribute -->
            <svg
              class="w-4 h-4 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
              />
            </svg>
            Back to home
          </NuxtLink>
        </div>
      </div>
    </main>
  </ClientOnly>
</template>

<script setup lang="ts">
import { getProviders, getCsrfToken } from '#auth/client';
import type {
  ClientSafeProvider,
  LiteralUnion,
  BuiltInProviderType,
} from '#auth/client';

const route = useRoute();
const error = route.query.error || null;
const callbackUrl = route.query.callbackUrl || '/profile';

const providers = ref<Record<
  LiteralUnion<BuiltInProviderType>,
  ClientSafeProvider
> | null>(null);
const csrfToken = ref('');

const getErrorMessage = (errorType: string | null) => {
  switch (errorType) {
    case 'Signin':
    case 'OAuthSignin':
    case 'OAuthCallback':
    case 'OAuthCreateAccount':
    case 'EmailCreateAccount':
    case 'Callback':
      return 'Try signing in with a different account.';
    case 'OAuthAccountNotLinked':
      return 'To confirm your identity, sign in with the same account you used originally.';
    case 'EmailSignin':
      return 'The email could not be sent.';
    case 'CredentialsSignin':
      return 'Sign in failed. Check the details you provided are correct.';
    case 'SessionRequired':
      return 'Please sign in to access this page.';
    default:
      return 'Unable to sign in.';
  }
};

onMounted(async () => {
  const [providersData, tokenData] = await Promise.all([
    getProviders(),
    getCsrfToken(),
  ]);
  providers.value = providersData;
  csrfToken.value = tokenData || '';
});

const provider = computed(() => providers.value?.zitadel);
</script>
