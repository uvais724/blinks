<template>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="(item, index) in sharedItems"
        :key="item._id"
        class="relative bg-base-100 shadow-xl p-4 rounded-lg"
      >
        <!-- Shared Item Details -->
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h2 class="font-bold text-lg">{{ item.title }}</h2>
            <p class="text-sm text-gray-600 truncate">
              {{ item.type === 'link' ? item.description : `${item.links.length} links` }}
            </p>
          </div>
          <!-- Open Button -->
          <a
            v-if="item.type === 'link'"
            :href="item.url"
            target="_blank"
            class="btn btn-primary"
          >
            Open Link
          </a>
          <button
            v-else
            class="btn btn-secondary"
            @click="toggleCollection(index)"
          >
            {{ activeCollectionIndex === index ? 'Hide Links' : 'View Links' }}
          </button>
        </div>
  
        <!-- Links Drawer for Shared Collections -->
        <transition name="slide">
          <div
            v-if="activeCollectionIndex === index && item.type === 'collection'"
            class="mt-4 bg-gray-100 p-4 rounded-lg"
          >
            <div
              v-for="link in item.links"
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
                class="btn btn-primary ml-auto"
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

// Fetch shared items when the component is mounted
const fetchSharedItems = async () => {
  const { data } = await useFetch<{ success: boolean; sharedItems?: any[] }>('/api/shared').json();
  if (data.value?.success && data.value.sharedItems) {
    // Normalize the shared items
    const normalizedItems = await Promise.all(
      data.value.sharedItems.map(async (item: { type: string; itemId: any }) => {
        if (item.type === 'Link') {
          return {
            _id: item.itemId._id,
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
            _id: item.itemId._id,
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