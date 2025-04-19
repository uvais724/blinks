<template>
    <div>
      <!-- Share Button -->
      <button class="btn btn-accent" @click="openSharePopup">Share</button>
  
      <!-- Share Popup -->
      <div v-if="showSharePopup" class="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 class="text-lg font-bold mb-4">Share {{ type === 'link' ? 'Link' : 'Collection' }}</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700">Select User</label>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search user"
              class="input input-bordered w-full"
              @input="searchUsers"
            />
            <!-- Chips for Selected Users -->
            <div class="flex flex-wrap gap-2 mt-2">
              <div
                v-for="user in selectedUsers"
                :key="user._id"
                class="flex items-center bg-blue-100 text-blue-700 px-3 py-1 rounded-full"
              >
                {{ user.username }}
                <button
                  class="ml-2 text-red-500 hover:text-red-700"
                  @click="removeUser(user._id)"
                >
                  &times;
                </button>
              </div>
            </div>
            <!-- User Search Results -->
            <ul class="mt-2 max-h-40 overflow-y-auto">
              <li
                v-for="user in filteredUsers"
                :key="user._id"
                class="p-2 hover:bg-gray-100 cursor-pointer"
                @click="addUser(user)"
              >
                {{ user.username }}
              </li>
            </ul>
          </div>
          <div class="flex justify-end gap-4">
            <button @click="closeSharePopup" class="btn btn-secondary">Cancel</button>
            <button @click="shareItem" class="btn btn-primary" :disabled="selectedUsers.length === 0">Share</button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from 'vue';
  import { useFetch } from '@vueuse/core';
  
  interface User {
    _id: string;
    username: string;
  }
  
  const props = defineProps<{ linkId: string; type: 'link' | 'collection' }>();
  
  const showSharePopup = ref(false);
  const searchQuery = ref('');
  const filteredUsers = ref<User[]>([]);
  const selectedUsers = ref<User[]>([]);
  const itemToShare = ref<string | null>(null);
  
  // Open the share popup
  const openSharePopup = () => {
    itemToShare.value = props.linkId; // Use the linkId prop
    showSharePopup.value = true;
    console.log('Link ID:', itemToShare.value); // Debugging line
  };
  
  // Close the share popup
  const closeSharePopup = () => {
    itemToShare.value = null;
    selectedUsers.value = [];
    searchQuery.value = '';
    filteredUsers.value = [];
    showSharePopup.value = false;
  };
  
  // Search users
  const searchUsers = async () => {
    const { data } = await useFetch<{ success: boolean; users?: User[] }>(`/api/users?query=${searchQuery.value}`).json();
    if (data.value?.success && data.value.users) {
      filteredUsers.value = data.value.users;
    }
  };
  
  // Add a user to the selected users list
  const addUser = (user: User) => {
    if (!selectedUsers.value.some((u) => u._id === user._id)) {
      selectedUsers.value.push(user);
    }
  };
  
  // Remove a user from the selected users list
  const removeUser = (userId: string) => {
    selectedUsers.value = selectedUsers.value.filter((user) => user._id !== userId);
  };
  
  // Share the item
  const shareItem = async () => {
    if (!itemToShare.value || selectedUsers.value.length === 0) return;
  
    const endpoint = props.type === 'link' ? '/api/share/link' : '/api/share/collection';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        itemId: itemToShare.value,
        userIds: selectedUsers.value.map((user) => user._id),
      }),
    });
  
    const result = await response.json();
    if (result.success) {
      alert(`${props.type === 'link' ? 'Link' : 'Collection'} shared successfully!`);
      closeSharePopup();
    } else {
      alert(`Failed to share the ${props.type}. Please try again.`);
    }
  };
  </script>