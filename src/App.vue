<template>
  <main class="w-screen">
    <c-nav />
    <transition name="fade">
      <router-view />
    </transition>
  </main>
</template>

<script>
import CNav from '@/components/CNav';
export default {
  name: 'App',
  components: { CNav }
};
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
