<template>
  <main class="w-screen">
    <c-nav />
    <router-view />
  </main>
</template>

<script>
import CNav from '@/components/CNav';
export default {
  name: 'App',
  components: { CNav }
};
</script>
