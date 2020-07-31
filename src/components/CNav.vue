<template>
  <nav class="bg-gray-800 ">
    <div class="max-w-7xl mx-auto px-2 sm:px-6">
      <div class="relative flex items-center justify-between h-16 fixed">
        <div class="flex-1 flex items-baseline justify-center sm:items-stretch sm:justify-start">
          <a href="/"><img src="@/assets/img/logo.png" class="mr-2 logo" /></a>
          <a href="/">
            <div class="flex-shrink-0 py-1 mr-2 text-lg text-white font-bold">
              SuperBowl
            </div>
          </a>
          <div class="flex">
            <template v-for="(route, index) in routes">
              <router-link
                :key="index"
                :to="route.path"
                v-if="route.path != '*'"
                class="px-3 py-2 rounded-md text-sm font-medium leading-5 text-white focus:outline-none focus:text-white transition duration-150 ease-in-out"
              >
                {{ route.name }}
              </router-link>
            </template>
          </div>
        </div>
        <div
          class="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0"
          v-if="this.$route.meta.requiresRefreshButton"
        >
          <select
            v-model="refreshInterval"
            class="inline-block bg-gray-300  mr-1  text-black leading-none border-white hover:border-transparent hover:text-teal-500 hover:bg-whit"
          >
            <option
              v-for="updateTime in updateTimes"
              :key="updateTime.text"
              :value="updateTime.value"
            >
              {{ updateTime.text }}
            </option>
          </select>
          <a
            @click="onClickRefresh"
            href="#"
            class="inline-block bg-gray-300 rounded text-sm pt-1 px-1 py-1 leading-none   text-white  hover:border-transparent hover:text-teal-500 hover:bg-white"
          >
            <img src="@/assets/img/refresh.svg" width="20rem" />
          </a>
        </div>
        <a href="https://wiremind.github.io/super-bowl/" target="_blank">
          <img src="@/assets/img/help.svg" width="20rem" class="ml-1" />
        </a>
      </div>
    </div>
  </nav>
</template>

<script>
import routes from '@/routes';
export default {
  name: 'CNav',
  data() {
    return {
      routes,
      updateTimes: [
        { text: 'off', value: null },
        { text: '5s', value: 5 },
        { text: '10s', value: 10 },
        { text: '30s', value: 30 },
        { text: '1m', value: 60 },
        { text: '5m', value: 60 * 5 },
        { text: '1h', value: 60 * 60 },
        { text: '12h', value: 60 * 60 * 12 },
        { text: '1d', value: 60 * 60 * 24 }
      ]
    };
  },
  methods: {
    onClickRefresh() {
      this.$store.dispatch('refresh');
    }
  },
  computed: {
    refreshInterval: {
      get() {
        return this.$store.state.refreshInterval;
      },
      set(interval) {
        this.$store.dispatch('updateRefreshInterval', interval);
      }
    }
  }
};
</script>

<style scoped>
select {
  height: 1.7rem;
}
.logo {
  height: 2.2rem;
  min-width: 2.2rem;
  margin-right: 0.8rem;
  vertical-align: top;
}
</style>
