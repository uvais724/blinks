<script setup lang="ts">
const { loggedIn, user, fetch: refreshSession } = useUserSession();

const credentials = reactive({
  email: '',
  password: '',
});

async function login() {
  console.log('Logging in with', credentials);
  $fetch('/api/login', {
    method: 'POST',
    body: credentials,
  })
    .then(async () => {
      // Refresh the session on client-side and redirect to the home page
      await refreshSession();
      await navigateTo('/');
    })
    .catch(() => alert('Bad credentials'));
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="card w-96 bg-white shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-center">Login</h2>
        <form @submit.prevent="login" class="flex flex-col gap-4">
          <input
            v-model="credentials.email"
            type="email"
            placeholder="Email"
            class="input input-bordered w-full"
          />
          <input
            v-model="credentials.password"
            type="password"
            placeholder="Password"
            class="input input-bordered w-full"
          />
          <button type="submit" class="btn btn-primary w-full">Login</button>
        </form>
      </div>
    </div>
  </div>
</template>