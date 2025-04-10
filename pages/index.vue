<template>
  <h1 class="text-3xl font-bold text-center my-4">Welcome to the Link Sharing App</h1>
  <LinkSubmitForm @link-saved="addNewLink" />
  <div class="grid grid-cols-1 gap-4">
    <div
      v-for="link in links"
      :key="link._id"
      class="relative flex items-center gap-4 bg-base-100 shadow-xl p-4 rounded-lg h-32"
    >
      <!-- Delete Button -->
      <button
        @click="deleteLink(link._id)"
        class="absolute top-2 right-2 text-red-500 hover:text-red-700"
        aria-label="Delete Link"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-6 0v0" />
        </svg>
      </button>
      <!-- Thumbnail -->
      <img :src="link.thumbnail" alt="Thumbnail" class="w-16 h-16 object-cover rounded-lg" />
      <!-- Link Details -->
      <div class="flex-1">
        <h2 class="font-bold text-lg">{{ link.title }}</h2>
        <p class="text-sm text-gray-600 truncate">{{ link.description }}</p>
        <div class="flex items-center gap-2 mt-2">
          <img :src="link.createdBy.avatarUrl" class="w-6 h-6 rounded-full" />
          <span class="text-sm text-gray-500">@{{ link.createdBy.username }}</span>
        </div>
      </div>
      <!-- Open Button -->
      <a :href="link.url" target="_blank" class="btn btn-primary">Open</a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '@vueuse/core';

interface Link {
  _id: string;
  url: string;
  title: string;
  description: string;
  thumbnail: string;
  createdBy: {
    username: string;
    avatarUrl: string;
  };
}

const links = ref<Link[]>([]);

// Fetch links when the component is mounted
const fetchLinks = async () => {
  console.log("Fetching links...");
  const { data } = await useFetch<{ success: boolean; links?: Link[] }>('/api/links').json();

  if (data.value?.success && data.value.links) {
    links.value = data.value.links; // Populate the links array
  }
  console.log("Fetched links:", links.value);
};

// Add a new link to the top of the list
const addNewLink = (newLink: Link) => {
  links.value.unshift(newLink); // Add the new link to the beginning of the array
};

// Delete a link by its ID
const deleteLink = async (id: string) => {
  try {
    const response = await fetch(`/api/links/${id}`, {
      method: 'DELETE',
    });
    const result = await response.json();

    if (result.success) {
      links.value = links.value.filter((link) => link._id !== id); // Remove the deleted link from the array
      console.log(`Link with ID ${id} deleted successfully.`);
    } else {
      console.error(`Failed to delete link with ID ${id}:`, result.error);
    }
  } catch (error) {
    console.error(`An error occurred while deleting the link with ID ${id}:`, error);
  }
};

// Fetch links on component mount
onMounted(fetchLinks);
</script>