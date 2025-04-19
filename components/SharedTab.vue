<template>
  <div class="grid grid-cols-1 gap-4">
    <div v-for="(item, index) in sharedItems" :key="item._id" class="relative bg-base-100 shadow-xl p-4 rounded-lg">
      <!-- Delete Button -->
      <button @click="openDeleteConfirmation(item._id)" class="absolute top-4 right-4 text-red-500 hover:text-red-700"
        aria-label="Delete Shared Item">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
          stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m-7 0a2 2 0 012-2h4a2 2 0 012 2m-6 0v0" />
        </svg>
      </button>

      <!-- Shared Item Details -->
      <div class="flex items-center justify-between mt-8">
        <div class="flex-1">
          <h2 class="font-bold text-lg">{{ item.title }}</h2>
          <p class="text-sm text-gray-600 truncate">
            {{ item.type === 'link' ? item.description : `${item.links.length} links` }}
          </p>
        </div>
        <!-- Open Button -->
        <a v-if="item.type === 'link'" :href="item.url" target="_blank" class="btn btn-primary">
          Open Link
        </a>
        <button v-else class="btn btn-secondary" @click="toggleCollection(index)">
          {{ activeCollectionIndex === index ? 'Hide Links' : 'View Links' }}
        </button>
      </div>

      <!-- Links Drawer for Shared Collections -->
      <transition name="slide">
        <div v-if="activeCollectionIndex === index && item.type === 'collection'"
          class="mt-4 bg-gray-100 p-4 rounded-lg">
          <div v-for="link in item.links" :key="link._id"
            class="flex items-center gap-4 mb-4 bg-white shadow p-4 rounded-lg">
            <!-- Thumbnail -->
            <img :src="link.thumbnail" alt="Thumbnail" class="w-16 h-16 object-cover rounded-lg" />
            <!-- Link Details -->
            <div class="flex-1">
              <h3 class="font-bold text-md">{{ link.title }}</h3>
              <p class="text-sm text-gray-600 truncate">{{ link.description }}</p>
            </div>
            <!-- Open Link Button -->
            <a :href="link.url" target="_blank" class="btn btn-primary ml-auto">
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
        <p class="text-sm text-gray-600 mb-6">Are you sure you want to delete this shared item?</p>
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
  links: Link[];
  type: 'collection';
}

type SharedItem =
  | {
    _id: string;
    title: string;
    description: string;
    thumbnail: string;
    url: string;
    type: 'link';
  }
  | {
    _id: string;
    title: string;
    links: Link[];
    type: 'collection';
  };

const sharedItems = ref<SharedItem[]>([]);
const activeCollectionIndex = ref<number | null>(null);
const showDeleteModal = ref(false);
const itemToDelete = ref<string | null>(null);

// Fetch shared items when the component is mounted
const fetchSharedItems = async () => {
  const { data } = await useFetch<{ success: boolean; sharedItems?: any[] }>('/api/shared').json();
  if (data.value?.success && data.value.sharedItems) {
    console.log('Fetched shared items:', data.value.sharedItems);
    // Normalize the shared items
    const normalizedItems = await Promise.all(
      data.value.sharedItems.map(async (item: { _id: string; type: string; itemId: any }) => {
        console.log('Processing item:', item._id);
        if (item.type === 'Link') {
          return {
            _id: item._id,
            link_id: item.itemId._id,
            title: item.itemId.title,
            description: item.itemId.description,
            thumbnail: item.itemId.thumbnail,
            url: item.itemId.url,
            type: 'link',
          };
        } else if (item.type === 'Collection') {
          // Fetch full link details for the collection
          const linkIds = item.itemId.links;
          const response = await fetch('/api/linksByIds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ linkIds }),
          });
          const result = await response.json();
          const links = result.success ? result.links : [];

          return {
            _id: item._id,
            collection_id: item.itemId._id,
            title: item.itemId.title,
            links,
            type: 'collection',
          };
        }
      })
    );

    sharedItems.value = normalizedItems.filter(Boolean) as SharedItem[];
  }
  console.log('Normalized shared items:', sharedItems.value);
};

// Open the delete confirmation modal
const openDeleteConfirmation = (id: string) => {
  itemToDelete.value = id;
  showDeleteModal.value = true;
};

// Close the delete confirmation modal
const closeDeleteConfirmation = () => {
  itemToDelete.value = null;
  showDeleteModal.value = false;
};

// Confirm deletion
const confirmDelete = async () => {
  if (!itemToDelete.value) return;

  try {
    const response = await fetch(`/api/shared/${itemToDelete.value}`, {
      method: 'DELETE',
    });
    const result = await response.json();

    if (result.success) {
      // Remove the deleted shared item from the `sharedItems` array
      sharedItems.value = sharedItems.value.filter((item) => item._id !== itemToDelete.value);
      console.log(`Shared document with ID ${itemToDelete.value} deleted successfully.`);
    } else {
      console.error(`Failed to delete shared document with ID ${itemToDelete.value}:`, result.error);
    }
  } catch (error) {
    console.error(`An error occurred while deleting the shared document with ID ${itemToDelete.value}:`, error);
  } finally {
    closeDeleteConfirmation();
  }
};

// Toggle the visibility of links for a specific shared collection
const toggleCollection = (index: number) => {
  activeCollectionIndex.value =
    activeCollectionIndex.value === index ? null : index;
};

// Fetch shared items on component mount
onMounted(() => {
  fetchSharedItems();
});
</script>