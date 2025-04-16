<template>
  <form @submit.prevent="handleSubmit" class="form-control">
    <div class="input-group w-full">
      <input v-model="url" type="text" placeholder="Paste a link..." class="input input-bordered w-[90%]" />
      <button type="submit" class="btn btn-primary w-[10%]" :disabled="loading">
        {{ loading ? 'Loading...' : 'Preview' }}
      </button>
    </div>
    <!-- Error Message -->
    <p v-if="error" class="text-red-500 text-sm mt-2">{{ error }}</p>
  </form>

  <div v-if="previewData" class="card bg-base-100 shadow-xl mt-4">
    <!-- Delete Icon -->
    <button
      @click="cancelPreview"
      class="absolute top-2 right-2 text-red-500 hover:text-red-700"
      aria-label="Delete Preview"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    <div class="card-body grid grid-cols-[auto_1fr_auto] gap-2 items-center">
      <img :src="previewData.thumbnail" alt="Preview" class="w-24 h-24 object-cover rounded-lg" />
      <div>
        <h2 class="card-title">{{ previewData.title }}</h2>
        <p>{{ previewData.description }}</p>
      </div>
      <div class="flex flex-col items-end gap-2">
        <button @click="saveLink" class="btn btn-primary w-full">Save Link</button>
    </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { isValidUrl } from '~/server/utils/urlValidator'; // Adjust the import path as necessary

interface PreviewData {
  title: string;
  description: string;
  thumbnail: string;
  domain: string;
}

const url = ref<string>('');
const previewData = ref<PreviewData | null>(null);
const loading = ref<boolean>(false); // Track loading state
const error = ref<string | null>(null); // Track error message
const emit = defineEmits(['link-saved']);

const currentUser = ref<{ _id: string } | null>({
  _id: '67fa64158139571853da6676', // Use a plain string instead of ObjectId
});

const handleSubmit = async () => {
  if (!url.value.trim()) {
    error.value = 'Please enter a valid URL.';
    return;
  }

  // Validate the URL against allowed domains
  if (!isValidUrl(url.value)) {
    error.value = 'The URL must belong to one of the allowed websites: Facebook, Twitter, LinkedIn, Reddit, YouTube, Instagram, or TikTok.';
    return;
  }

  loading.value = true; // Disable the button
  error.value = null; // Clear any previous errors

  try {
    const response = await $fetch<{ success: boolean; data?: PreviewData }>('/api/links/preview', {
      method: 'POST',
      body: { url: url.value },
    });

    if (response.success && response.data) {
      previewData.value = response.data;
    } else {
      error.value = 'Failed to fetch preview. Please try again.';
    }
  } catch (err) {
    error.value = 'An error occurred while fetching the preview.';
    console.error(err);
  } finally {
    loading.value = false; // Enable the button
  }
};

const cancelPreview = () => {
  previewData.value = null; // Clear the preview data
  url.value = ''; // Optionally reset the input field
};

const saveLink = async () => {
  if (!currentUser.value) {
    console.error('currentUser is null');
    return;
  }

  try {
    // Check if the link already exists in the database
    const checkResponse = await $fetch<{ success: boolean; exists: boolean }>('/api/links/check', {
      method: 'POST',
      body: { title: previewData.value?.title },
    });
    console.log('Check response:', checkResponse); // Debugging log

    if (checkResponse.success && checkResponse.exists) {
      alert('This link already exists in the database.');
      previewData.value = null; // Clear the preview
      url.value = ''; // Reset the input field
      return; // Prevent saving the link
    }

    // Proceed to save the link if it doesn't exist
    const response = await $fetch<{ success: boolean; link?: any }>('/api/links/create', {
      method: 'POST',
      body: {
        url: url.value,
        ...previewData.value,
        createdBy: currentUser.value._id, // Replace with auth user ID
      },
    });

    if (response.success && response.link) {
      alert('Link saved!');
      emit('link-saved', response.link); // Emit the saved link
      previewData.value = null; // Clear the preview
      url.value = ''; // Reset the input field
    } else {
      alert('Failed to save the link. Please try again.');
    }
  } catch (error) {
    console.error('An error occurred while saving the link:', error);
    alert('An error occurred. Please try again.');
  }
};
</script>