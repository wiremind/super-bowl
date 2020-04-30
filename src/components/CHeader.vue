<template>
  <header class="shadow w-screen">
    <!-- Icon made by <a href="https://www.flaticon.com/authors/eucalyp" title="Eucalyp">Eucalyp</a> from <a href="https://www.flaticon.com/" title="Flaticon"> www.flaticon.com</a>-->
    <nav>
      <nav class="flex items-center justify-between flex-wrap bg-wiremind p-6 fixed w-full">
        <div class="flex items-center flex-shrink-0 text-white mr-6">
          <img src="@/assets/img/hero.svg" width="34rem" height="34rem" class="mr-3" alt="" />
          <span class="font-mono font-semibold text-xl tracking-tight ">Bowl</span>
        </div>
        <div class="flex">
          <select
            @change="onUpdateRefreshInterval"
            v-model="refreshIntervalSelected"
            class="inline-block bg-gray-300  mr-1   text-black leading-none border-white hover:border-transparent hover:text-teal-500 hover:bg-whit"
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
            @click="onUpdateMessages"
            href="#"
            class="inline-block bg-gray-300 rounded text-sm px-1 py-1 leading-none   text-white  hover:border-transparent hover:text-teal-500 hover:bg-white"
          >
            <img src="@/assets/img/refresh.svg" width="20rem" />
          </a>
        </div>
      </nav>
    </nav>
  </header>
</template>

<script>
export default {
  name: 'CHeader',
  components: {},
  methods: {
    onUpdateMessages() {
      this.$emit('onUpdateMessages');
    },
    onUpdateRefreshInterval() {
      this.$emit('onUpdateRefreshInterval', this.refreshIntervalSelected);
    }
  },
  props: {
    refreshInterval: {
      type: Number
    }
  },
  data() {
    return {
      refreshIntervalSelected: this.refreshInterval,
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
  }
};
</script>
<style scoped>
select,
a {
  height: 1.7rem;
}
</style>
