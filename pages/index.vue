<template>
  <h1 class="text-3xl font-bold text-center my-4">Welcome to the Link Sharing App</h1>
  <LinkSubmitForm @link-saved="addNewLink" />
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <div v-for="link in links" :key="link._id" class="card bg-base-100 shadow-xl">
      <figure><img :src="link.thumbnail" alt="Thumbnail" class="w-full h-48 object-cover" /></figure>
      <div class="card-body">
        <h2 class="card-title">{{ link.title }}</h2>
        <p>{{ link.description }}</p>
        <div class="flex items-center gap-2">
          <img :src="link.createdBy.avatarUrl" class="w-8 h-8 rounded-full" />
          <span>@{{ link.createdBy.username }}</span>
        </div>
        <a :href="link.url" target="_blank" class="btn btn-primary">Open</a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
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

const { data } = await useFetch<{ success: boolean; links?: Link[] }>('/api/links');
const links = ref<Link[]>(data.value?.links || []);

const addNewLink = (newLink: Link) => {
  links.value.unshift(newLink); // Add the new link to the beginning of the array
};
</script>