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
        @click="openDeleteConfirmation(link._id)"
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
      <!-- Add to collection Button -->
      <button class="btn btn-secondary" @click="openAddToCollectionPopup(link._id)">
        Add to Collection
      </button>

      <!-- Open Button -->
      <a :href="link.url" target="_blank" class="btn btn-primary">Open</a>
    </div>
  </div>

  <!-- Confirmation Modal -->
  <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-lg font-bold mb-4">Confirm Deletion</h2>
      <p class="text-sm text-gray-600 mb-6">Are you sure you want to delete this link?</p>
      <div class="flex justify-end gap-4">
        <button @click="closeDeleteConfirmation" class="btn btn-secondary">No</button>
        <button @click="confirmDelete" class="btn btn-primary">Yes</button>
      </div>
    </div>
  </div>

  <!-- Add to Collection Modal -->
  <div v-if="showAddToCollectionModal" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg shadow-lg w-96">
      <h2 class="text-lg font-bold mb-4">Add to Collection</h2>
      <div class="mb-4" v-if="collections.length > 0">
        <label class="block text-sm font-medium text-gray-700">Select a Collection</label>
        <select v-model="selectedCollectionId" class="select select-bordered w-full">
          <option v-for="collection in collections" :key="collection._id" :value="collection._id">
            {{ collection.name }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label class="flex items-center gap-2">
          <input type="checkbox" v-model="createNewCollection" />
          <span>Create a New Collection</span>
        </label>
        <input
          v-if="createNewCollection"
          v-model="newCollectionName"
          type="text"
          placeholder="Enter collection name"
          class="input input-bordered w-full mt-2"
        />
      </div>
      <div class="flex justify-end gap-4">
        <button @click="closeAddToCollectionPopup" class="btn btn-secondary">Cancel</button>
        <button @click="addToCollection" class="btn btn-primary">Add</button>
      </div>
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

interface Collection {
  _id: string;
  name: string;
}

const links = ref<Link[]>([]);
const showDeleteModal = ref(false);
const collections = ref<Collection[]>([]);
const linkToDelete = ref<string | null>(null);
const showAddToCollectionModal = ref(false);
const selectedCollectionId = ref<string | null>(null);
const createNewCollection = ref(false);
const newCollectionName = ref('');
const linkToAdd = ref<string | null>(null);

// Fetch links when the component is mounted
const fetchLinks = async () => {
  const { data } = await useFetch<{ success: boolean; links?: Link[] }>('/api/links').json();
  if (data.value?.success && data.value.links) {
    links.value = data.value.links; // Populate the links array
  }
  console.log("Fetched links:", links.value);
};

// Fetch collections when the component is mounted
const fetchCollections = async () => {
  const { data } = await useFetch<{ success: boolean; collections?: Collection[] }>('/api/collections').json();
  if (data.value?.success && data.value.collections) {
    collections.value = data.value.collections; // Populate the collections array
  }
};

// Open the Add to Collection popup
const openAddToCollectionPopup = (linkId: string) => {
  linkToAdd.value = linkId;
  showAddToCollectionModal.value = true;
};

// Close the Add to Collection popup
const closeAddToCollectionPopup = () => {
  linkToAdd.value = null;
  selectedCollectionId.value = null;
  createNewCollection.value = false;
  newCollectionName.value = '';
  showAddToCollectionModal.value = false;
};

// Add the link to the collection
const addToCollection = async () => {
  if (!linkToAdd.value) return;

  try {
    if (createNewCollection.value && newCollectionName.value) {
      // Create a new collection and add the link
      const response = await fetch('/api/collections/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCollectionName.value, linkId: linkToAdd.value }),
      });
      const result = await response.json();

      if (result.success) {
        alert('Link added to new collection successfully!');
        fetchCollections(); // Refresh collections
      } else {
        console.error('Error creating collection:', result.error);
        alert(result.error);
      }
    } else if (selectedCollectionId.value) {
      // Add the link to an existing collection
      const response = await fetch('/api/collections/addToCollection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: selectedCollectionId.value, linkId: linkToAdd.value }),
      });
      const result = await response.json();

      if (result.success) {
        alert('Link added to collection successfully!');
      } else {
        console.error('Error adding link to collection:', result.error);
        alert(result.error);
      }
    }
  } catch (error) {
    console.error('An error occurred while adding the link to the collection:', error);
    alert('An error occurred. Please try again.');
  } finally {
    closeAddToCollectionPopup();
  }
};

// Add a new link to the top of the list
const addNewLink = (newLink: Link) => {
  links.value.unshift(newLink); // Add the new link to the beginning of the array
};

// Open the delete confirmation modal
const openDeleteConfirmation = (id: string) => {
  linkToDelete.value = id;
  showDeleteModal.value = true;
};

// Close the delete confirmation modal
const closeDeleteConfirmation = () => {
  linkToDelete.value = null;
  showDeleteModal.value = false;
};

// Confirm deletion
const confirmDelete = async () => {
  if (!linkToDelete.value) return;

  try {
    const response = await fetch(`/api/links/${linkToDelete.value}`, {
      method: 'DELETE',
    });
    const result = await response.json();

    if (result.success) {
      links.value = links.value.filter((link) => link._id !== linkToDelete.value); // Remove the deleted link from the array
      console.log(`Link with ID ${linkToDelete.value} deleted successfully.`);
    } else {
      console.error(`Failed to delete link with ID ${linkToDelete.value}:`, result.error);
    }
  } catch (error) {
    console.error(`An error occurred while deleting the link with ID ${linkToDelete.value}:`, error);
  } finally {
    closeDeleteConfirmation();
  }
};

// Fetch links and collections on component mount
onMounted(() => {
  fetchLinks();
  fetchCollections();
});
</script>