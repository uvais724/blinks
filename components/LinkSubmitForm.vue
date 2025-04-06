<template>
    <form @submit.prevent="handleSubmit" class="form-control">
      <div class="input-group w-full">
        <input v-model="url" type="text" placeholder="Paste a link..." class="input input-bordered w-[90%]" />
        <button type="submit" class="btn btn-primary w-[10%]">Preview</button>
      </div>
    </form>
  

  <div v-if="previewData" class="card bg-base-100 shadow-xl mt-4">
    <div class="card-body grid grid-cols-[auto_1fr_auto] gap-2 items-center">
      <img :src="previewData.thumbnail" alt="Preview" class="w-24 h-24 object-cover rounded-lg" />
      <div>
        <h2 class="card-title">{{ previewData.title }}</h2>
        <p>{{ previewData.description }}</p>
      </div>
      <button @click="saveLink" class="btn btn-primary">Save Link</button>
    </div>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue';

interface PreviewData {
  title: string;
  description: string;
  thumbnail: string;
  domain: string;
}

const url = ref<string>('');
const previewData = ref<PreviewData | null>(null);
const emit = defineEmits(['link-saved']);

const handleSubmit = async () => {
  const response = await $fetch<{ success: boolean; data?: PreviewData }>('/api/links/preview', {
    method: 'POST',
    body: { url: url.value },
  });
  if (response.success) previewData.value = response.data || null;
};

const saveLink = async () => {
  const response = await $fetch<{ success: boolean; link?: any }>('/api/links/create', {
    method: 'POST',
    body: {
      url: url.value,
      ...previewData.value,
      createdBy: 'uvais', // Replace with auth user ID
    },
  });
  if (response.success && response.link) {
    alert('Link saved!') 
    emit('link-saved', response.link); // Emit the saved link
    previewData.value = null; // Clear the preview
    url.value = ''; // Reset the input field
  }
};
</script>