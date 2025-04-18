<script setup lang="ts">

const { session, clear: clearSession } = useUserSession()

async function logout() {
  await clearSession()
  await navigateTo('/login')
}
</script>

<template>
  <nav class="navbar bg-base-100 shadow-md">
    <!-- Logo Placeholder -->
    <div class="flex-1">
      <a href="/" class="text-xl font-bold">Logo</a>
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