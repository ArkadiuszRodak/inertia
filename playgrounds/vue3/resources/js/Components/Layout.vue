<script setup lang="ts">
import { Link, usePage } from '@inertiajs/vue3'
import { computed } from 'vue'

const appName = computed(() => usePage().props.appName)
</script>

<template>
  <nav class="flex items-center space-x-6 bg-slate-800 px-10 py-6 text-white">
    <div class="rounded-lg bg-slate-700 px-4 py-1">{{ appName }}</div>
    <Link href="/" class="hover:underline">Home</Link>
    <Link href="/users" class="hover:underline">Users</Link>
    <Link href="/article" class="hover:underline">Article</Link>
    <Link href="/form" class="hover:underline">Form</Link>
    <Link href="/logout" method="post" as="button" type="button" class="hover:underline">Logout</Link>
  </nav>
  <main class="px-10 py-8">
    <slot />
  </main>
</template>
