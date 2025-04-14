<template>
  <div class="grid grid-cols-1 gap-4">
    <div
      v-for="collection in collections"
      :key="collection._id"
      class="relative flex items-center gap-4 bg-base-100 shadow-xl p-4 rounded-lg h-32"
    >
      <!-- Collection Details -->
      <div class="flex-1">
        <h2 class="font-bold text-lg">{{ collection.title }}</h2>
        <p class="text-sm text-gray-600 truncate">Collection ID: {{ collection._id }}</p>
      </div>
      <!-- View Collection Button -->
      <button class="btn btn-primary" @click="viewCollection(collection._id)">View</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '@vueuse/core';

interface Collection {
  _id: string;
  title: string;
}

const collections = ref<Collection[]>([]);

// Fetch collections when the component is mounted
const fetchCollections = async () => {
  const { data } = await useFetch<{ success: boolean; collections?: Collection[] }>('/api/collections').json();
  if (data.value?.success && data.value.collections) {
    collections.value = data.value.collections; // Populate the collections array
  }
  console.log("Fetched collections:", collections.value);
};

// View a specific collection (placeholder function)
const viewCollection = (collectionId: string) => {
  alert(`Viewing collection with ID: ${collectionId}`);
};

// Fetch collections on component mount
onMounted(() => {
  fetchCollections();
});
</script>