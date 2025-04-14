<template>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="(collection, index) in collections"
        :key="collection._id"
        class="relative bg-base-100 shadow-xl p-4 rounded-lg"
      >
        <!-- Collection Details -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h2 class="font-bold text-lg">{{ collection.title }}</h2>
            <p class="text-sm text-gray-600 truncate">Collection ID: {{ collection._id }}</p>
          </div>
          <!-- Toggle View Button -->
          <button
            class="btn btn-primary"
            @click="toggleCollection(index)"
          >
            {{ activeCollectionIndex === index ? 'Hide Links' : 'View Links' }}
          </button>
        </div>
  
        <!-- Links Drawer -->
        <transition name="slide">
          <div
            v-if="activeCollectionIndex === index"
            class="mt-4 bg-gray-100 p-4 rounded-lg"
          >
            <div
              v-for="link in collection.links"
              :key="link._id"
              class="flex items-center gap-4 mb-4 bg-white shadow p-4 rounded-lg"
            >
              <!-- Thumbnail -->
              <img
                :src="link.thumbnail"
                alt="Thumbnail"
                class="w-16 h-16 object-cover rounded-lg"
              />
              <!-- Link Details -->
              <div class="flex-1">
                <h3 class="font-bold text-md">{{ link.title }}</h3>
                <p class="text-sm text-gray-600 truncate">{{ link.description }}</p>
              </div>
              <!-- Open Link Button -->
              <a
                :href="link.url"
                target="_blank"
                class="btn btn-secondary ml-auto"
              >
                Open Link
              </a>
            </div>
          </div>
        </transition>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useFetch } from '@vueuse/core';
  
  interface Link {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    url: string;
  }
  
  interface Collection {
    _id: string;
    title: string;
    links: Link[]; // Array of links related to the collection
  }
  
  const collections = ref<Collection[]>([]);
  const activeCollectionIndex = ref<number | null>(null); // Track the currently active collection
  
  // Fetch collections when the component is mounted
  const fetchCollections = async () => {
    const { data } = await useFetch<{ success: boolean; collections?: Collection[] }>('/api/collections').json();
    if (data.value?.success && data.value.collections) {
      collections.value = data.value.collections; // Populate the collections array
    }
    console.log("Fetched collections:", collections.value);
  };
  
  // Toggle the visibility of links for a specific collection
  const toggleCollection = (index: number) => {
    activeCollectionIndex.value =
      activeCollectionIndex.value === index ? null : index;
  };
  
  // Fetch collections on component mount
  onMounted(() => {
    fetchCollections();
  });
  </script>
  
  <style>
  /* Add a sliding animation for the drawer */
  .slide-enter-active,
  .slide-leave-active {
    transition: max-height 0.3s ease;
  }
  .slide-enter-from,
  .slide-leave-to {
    max-height: 0;
    overflow: hidden;
  }
  .slide-enter-to,
  .slide-leave-from {
    max-height: 500px; /* Adjust based on content */
  }
  </style>