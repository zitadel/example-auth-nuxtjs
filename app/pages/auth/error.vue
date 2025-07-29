<template>
  <main
    class="flex-1 grid place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8"
  >
    <div class="text-center">
      <div
        class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6"
      >
        <!--suppress HtmlDeprecatedAttribute -->
        <svg
          class="h-8 w-8 text-red-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h1
        class="text-5xl font-semibold tracking-tight text-balance text-gray-900 sm:text-7xl"
      >
        {{ heading }}
      </h1>
      <p
        class="mt-6 text-lg font-medium text-pretty text-gray-500 sm:text-xl/8"
      >
        {{ message }}
      </p>
      <div class="mt-10 flex items-center justify-center gap-x-6">
        <NuxtLink
          to="/api/auth/signin"
          class="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Try signing in again
        </NuxtLink>
        <NuxtLink
          to="/"
          class="rounded-md bg-gray-100 px-3.5 py-2.5 text-sm font-semibold text-gray-700 shadow-xs hover:bg-gray-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-500"
        >
          Go back home
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const route = useRoute();
const error = route.query.error || 'default';

const getErrorInfo = (errorType: string) => {
  switch (errorType.toLowerCase()) {
    case 'configuration':
      return {
        heading: 'Server error',
        message:
          'There is a problem with the server configuration. Check the server logs for more information.',
      };
    case 'accessdenied':
      return {
        heading: 'Access denied',
        message: 'You do not have permission to sign in.',
      };
    case 'verification':
      return {
        heading: 'Unable to sign in',
        message:
          'The sign in link is no longer valid. It may have been used already or it may have expired.',
      };
    default:
      return {
        heading: 'Authentication error',
        message: 'An unexpected error occurred during authentication.',
      };
  }
};

const { heading, message } = getErrorInfo(error as string);
</script>
