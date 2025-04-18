<script setup lang="ts">
import { ref, reactive } from 'vue';

const { fetch: refreshSession } = useUserSession();// Import the session management function
const showRegistrationForm = ref(false); // Controls whether to show the registration form

// Login form state
const loginCredentials = reactive({
  email: '',
  password: '',
});

// Registration form state
const registrationData = reactive({
  username: '',
  email: '',
  password: '',
});

async function login() {
  console.log('Logging in with', loginCredentials);
  $fetch('/api/login', {
    method: 'POST',
    body: loginCredentials,
  })
    .then(async () => {
      // Refresh the session on client-side and redirect to the home page
      await refreshSession();
      await navigateTo('/');
    })
    .catch(() => alert('Bad credentials'));
}

async function register() {
  console.log('Registering user with', registrationData);
  $fetch('/api/register', {
    method: 'POST',
    body: registrationData,
  })
    .then(() => {
      alert('Registration successful! You can now log in.');
      showRegistrationForm.value = false; // Switch back to login form
    })
    .catch(() => alert('Registration failed. Please try again.'));
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="card w-96 bg-white shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-center">{{ showRegistrationForm ? 'Register' : 'Login' }}</h2>

        <!-- Login Form -->
        <form v-if="!showRegistrationForm" @submit.prevent="login" class="flex flex-col gap-4">
          <input
            v-model="loginCredentials.email"
            type="email"
            placeholder="Email"
            class="input input-bordered w-full"
          />
          <input
            v-model="loginCredentials.password"
            type="password"
            placeholder="Password"
            class="input input-bordered w-full"
          />
          <button type="submit" class="btn btn-primary w-full">Login</button>
          <p class="text-sm text-center mt-2">
            New user? <a @click="showRegistrationForm = true" class="text-blue-500 cursor-pointer">Register here</a>
          </p>
        </form>

        <!-- Registration Form -->
        <form v-else @submit.prevent="register" class="flex flex-col gap-4">
          <input
            v-model="registrationData.username"
            type="text"
            placeholder="Username"
            class="input input-bordered w-full"
          />
          <input
            v-model="registrationData.email"
            type="email"
            placeholder="Email"
            class="input input-bordered w-full"
          />
          <input
            v-model="registrationData.password"
            type="password"
            placeholder="Password"
            class="input input-bordered w-full"
          />
          <button type="submit" class="btn btn-primary w-full">Register</button>
          <p class="text-sm text-center mt-2">
            Already have an account? <a @click="showRegistrationForm = false" class="text-blue-500 cursor-pointer">Login here</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>