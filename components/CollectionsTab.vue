<template>
  <div class="grid grid-cols-1 gap-4">
    <div
      v-for="(collection, index) in collections"
      :key="collection._id"
      class="relative bg-base-100 shadow-xl p-4 rounded-lg"
    >
      <!-- Delete Collection Button -->
      <button
        @click="openDeleteConfirmation(collection._id, 'collection')"
        class="absolute top-2 right-2 text-red-500 hover:text-red-700"
        aria-label="Delete Collection"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-6 0v0" />
        </svg>
      </button>

      <!-- Collection Details -->
      <div class="flex items-center justify-between mt-8">
        <div class="flex-1">
          <h2 class="font-bold text-lg">{{ collection.title }}</h2>
          <p class="text-sm text-gray-600 truncate">Description: {{ collection.description }}</p>
        </div>

        <!-- Share Collection Button -->
        <ShareLink :link-id="collection._id" type="Collection" class="mr-4" />

        <!-- Toggle View Button -->
        <button class="btn btn-primary" @click="toggleCollection(index)">
          {{ activeCollectionIndex === index ? 'Hide Links' : 'View Links' }}
        </button>
      </div>

      <!-- Links Drawer -->
      <transition name="slide">
        <div v-if="activeCollectionIndex === index" class="mt-4 bg-gray-100 p-4 rounded-lg">
          <div
            v-for="link in collection.links"
            :key="link._id"
            class="flex items-center gap-4 mb-4 bg-white shadow p-4 rounded-lg"
          >
            <!-- Link Delete Button -->
            <button
              @click="openDeleteConfirmation(link._id, 'link')"
              class="text-red-500 hover:text-red-700"
              aria-label="Delete Link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <!-- Thumbnail -->
            <img :src="link.thumbnail" alt="Thumbnail" class="w-16 h-16 object-cover rounded-lg" />
            <!-- Link Details -->
            <div class="flex-1">
              <h3 class="font-bold text-md">{{ link.title }}</h3>
              <p class="text-sm text-gray-600 truncate">{{ link.description }}</p>
            </div>
            <!-- Open Link Button -->
            <a :href="link.url" target="_blank" class="btn btn-secondary ml-auto">
              Open Link
            </a>
          </div>
        </div>
      </transition>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 class="text-lg font-bold mb-4">Confirm Deletion</h2>
        <p class="text-sm text-gray-600 mb-6">
          Are you sure you want to delete this
          <span class="font-semibold">{{ deleteType === 'collection' ? 'collection' : 'link' }}</span>?
        </p>
        <div class="flex justify-end gap-4">
          <button @click="closeDeleteConfirmation" class="btn btn-secondary">No</button>
          <button @click="confirmDelete" class="btn btn-primary">Yes</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useFetch } from '@vueuse/core';
import ShareLink from '~/components/ShareLink.vue'; // Import the ShareLink component

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
  description: string;
  links: Link[]; // Array of links related to the collection
}

const collections = ref<Collection[]>([]);
const activeCollectionIndex = ref<number | null>(null); // Track the currently active collection
const showDeleteModal = ref(false);
const itemToDelete = ref<string | null>(null);
const deleteType = ref<'collection' | 'link' | null>(null);

// Fetch collections when the component is mounted
const fetchCollections = async () => {
  const { data } = await useFetch<{ success: boolean; collections?: Collection[] }>('/api/collections').json();
  if (data.value?.success && data.value.collections) {
    collections.value = data.value.collections; // Populate the collections array
  }
  console.log('Fetched collections:', collections.value);
};

// Toggle the visibility of links for a specific collection
const toggleCollection = (index: number) => {
  activeCollectionIndex.value =
    activeCollectionIndex.value === index ? null : index;
};

// Open the delete confirmation modal
const openDeleteConfirmation = (id: string, type: 'collection' | 'link') => {
  itemToDelete.value = id;
  deleteType.value = type;
  showDeleteModal.value = true;
};

// Close the delete confirmation modal
const closeDeleteConfirmation = () => {
  itemToDelete.value = null;
  deleteType.value = null;
  showDeleteModal.value = false;
};

// Confirm deletion
const confirmDelete = async () => {
  if (!itemToDelete.value || !deleteType.value) return;

  try {
    const endpoint =
      deleteType.value === 'collection'
        ? `/api/collections/${itemToDelete.value}`
        : `/api/collections/removeLink`;

    const body =
      deleteType.value === 'collection'
        ? null
        : JSON.stringify({
            collectionId: collections.value.find((collection) =>
              collection.links.some((link) => link._id === itemToDelete.value)
            )?._id,
            linkId: itemToDelete.value,
          });

    const response = await fetch(endpoint, {
      method: deleteType.value === 'collection' ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });

    const result = await response.json();

    if (result.success) {
      if (deleteType.value === 'collection') {
        // Remove the deleted collection from the `collections` array
        collections.value = collections.value.filter(
          (collection) => collection._id !== itemToDelete.value
        );
        console.log(`Collection with ID ${itemToDelete.value} deleted successfully.`);
      } else if (deleteType.value === 'link') {
        // Update the links array of the appropriate collection
        collections.value = collections.value.map((collection) => ({
          ...collection,
          links: collection.links.filter((link) => link._id !== itemToDelete.value),
        }));
        console.log(`Link with ID ${itemToDelete.value} removed from the collection successfully.`);
      }
      await fetchCollections(); // Refresh the collections after deletion
    } else {
      console.error(`Failed to delete ${deleteType.value} with ID ${itemToDelete.value}:`, result.error);
    }
  } catch (error) {
    console.error(`An error occurred while deleting the ${deleteType.value} with ID ${itemToDelete.value}:`, error);
  } finally {
    closeDeleteConfirmation();
  }
};

// Fetch collections on component mount
onMounted(() => {
  fetchCollections();
});
</script>