<script setup lang="ts">
import { ref, reactive } from 'vue';
import validator from 'email-validator'; 

const { fetch: refreshSession } = useUserSession(); // Import the session management function
const showRegistrationForm = ref(false); // Controls whether to show the registration form
const errorMessage = ref(''); // Holds the error message to display
const showPassword = ref(false); // Controls the visibility of the password fields
// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

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
  errorMessage.value = ''; // Clear any previous error message
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
    .catch(() => {
      errorMessage.value = 'Invalid email or password. Please try again.';
    });
}

async function register() {
  errorMessage.value = ''; // Clear any previous error message
  
   // Validate email format
   if (!validator.validate(registrationData.email)) {
    errorMessage.value = 'Please enter a valid email address.';
    return;
  }

  // Validate email format
  if (!validator.validate(registrationData.email)) {
    errorMessage.value = 'Please enter a valid email address.';
    return;
  }

  // Validate password format
  if (!passwordRegex.test(registrationData.password)) {
    errorMessage.value = 'Password must be at least 8 characters long and include uppercase, lowercase, a number, and a special character.';
    return;
  }

  $fetch('/api/register', {
    method: 'POST',
    body: registrationData,
  })
    .then(() => {
      alert('Registration successful! You can now log in.');
      showRegistrationForm.value = false; // Switch back to login form
    })
    .catch(() => {
      errorMessage.value = 'Registration failed. Please check your details and try again.';
    });
}
</script>

<template>
  <div class="flex flex-col items-center justify-top min-h-screen bg-gray-100 space-y-6">
    <!-- Instructions Section -->
    <div class="w-full max-w-md text-center px-4">
      <img src="../public/assets/images/instructions.png" alt="Instructions" class="w-full h-auto mb-4" />
    </div>

    <!-- Login/Registration Card -->
    <div class="card w-96 bg-white shadow-xl">
      <div class="card-body">
        <h2 class="card-title text-center">{{ showRegistrationForm ? 'Register' : 'Login' }}</h2>

        <!-- Error Message -->
        <p v-if="errorMessage" class="text-red-500 text-sm text-center mb-4">{{ errorMessage }}</p>

        <!-- Login Form -->
        <form v-if="!showRegistrationForm" @submit.prevent="login" class="flex flex-col gap-4">
          <input
            v-model="loginCredentials.email"
            type="email"
            placeholder="Email"
            class="input input-bordered w-full"
          />
          <div class="relative">
            <input
              v-model="loginCredentials.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="input input-bordered w-full"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <button type="submit" class="btn btn-primary w-full">Login</button>
          <p class="text-sm text-center mt-2">
            New user? <a @click="showRegistrationForm = true; errorMessage = '';" class="text-blue-500 cursor-pointer">Register here</a>
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
          <div class="relative">
            <input
              v-model="registrationData.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Password"
              class="input input-bordered w-full"
            />
            <button
              type="button"
              @click="showPassword = !showPassword"
              class="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>
          <button type="submit" class="btn btn-primary w-full">Register</button>
          <p class="text-sm text-center mt-2">
            Already have an account? <a @click="showRegistrationForm = false; errorMessage = '';" class="text-blue-500 cursor-pointer">Login here</a>
          </p>
        </form>
      </div>
    </div>
  </div>
</template>