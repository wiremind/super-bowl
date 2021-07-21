<template>
  <div>
    <div class="inline float-left">
      <span class="font-bold mt-2 mr-2 ml-5">Items per page</span>
      <select v-model.number="sizePage" class="browser-default bg-white">
        <option v-for="size in sizes" :key="size.text" :value="size.value">
          {{ size.text }}
        </option>
      </select>
    </div>
    <div class="inline-flex float-right">
      <div class="mt-2">{{ first + 1 }}-{{ last }}</div>
      <div class="ml-1 mt-2" v-if="totalPages > 1">of {{ total }}</div>
      <img
        v-if="totalPages > 1"
        src="@/assets/img/left_page.svg"
        width="25rem"
        class="cursor-pointer mt-1"
        @click="previous"
      />
      <img
        v-if="totalPages > 1"
        src="@/assets/img/right_page.svg"
        class="cursor-pointer mt-1"
        width="25rem"
        @click="next"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'CPageFooter',
  props: {
    total: Number
  },
  data() {
    return {
      sizes: [
        { text: '10', value: 10 },
        { text: '50', value: 50 },
        { text: '100', value: 100 },
        { text: '200', value: 200 },
        { text: '1000', value: 1000 }
      ]
    };
  },
  methods: {
    next() {
      this.currentPage = (this.currentPage + 1) % this.totalPages;
    },
    previous() {
      this.currentPage = (this.currentPage - 1 + this.totalPages) % this.totalPages;
    }
  },
  computed: {
    sizePage: {
      get() {
        return this.$store.state.sizePage;
      },
      set(size) {
        this.$store.dispatch('updateSizePage', size);
      }
    },
    currentPage: {
      get() {
        return this.$store.state.currentPage;
      },
      set(currentPage) {
        this.$store.dispatch('updateCurrentPage', currentPage);
      }
    },
    totalPages() {
      return Math.ceil(this.total / this.sizePage);
    },
    first() {
      return this.currentPage * this.sizePage;
    },
    last() {
      return Math.min(this.first + this.sizePage, this.total);
    }
  }
};
</script>
