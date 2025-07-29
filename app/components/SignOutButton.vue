<template>
  <form action="/api/auth/logout" method="POST">
    <button
      type="submit"
      class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition duration-200 cursor-pointer"
    >
      Sign out
    </button>
  </form>
</template>

<script setup lang="ts">
defineOptions({
  name: 'SignOutButton',
});
</script>
