<script setup lang="ts">

const { session, clear: clearSession } = useUserSession()

async function logout() {
  await clearSession()
  await navigateTo('/login')
}
</script>

<style>
.logo {
  height: 64px; /* Increase the height */
  width: auto; /* Maintain aspect ratio */
  border-radius: 8px; /* Add curved edges */
}
</style>

<template>
  <nav class="navbar bg-base-100 shadow-md">
    <!-- Logo Placeholder -->
    <div class="flex-1">
      <!-- <a href="/" class="text-xl font-bold">Logo</a> -->
      <a href="/" class="flex items-center gap-2">
        <img src="../public/assets/images/blinks-logo.png" alt="Blinks Logo" class="logo" />
        <span class="text-xl text-primary font-bold ml-[-18px]">Blinks</span>
      </a>
    </div>

    <!-- Right Side -->
    <div class="flex-none">
      <div v-if="session?.loggedIn" class="flex items-center gap-2">
        <span class="text-sm">Welcome, {{ session?.username || 'User' }}</span>
        <button @click="logout" class="btn btn-secondary">Logout</button>
      </div>
    </div>
  </nav>
</template>