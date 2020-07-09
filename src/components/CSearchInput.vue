<template>
  <div class="flex float-right w-48 mb-3 search relative mr-6 my-2">
    <div class="absolute pin-r pin-t mt-3 ml-2 mr-4 text-purple-lighter">
      <img src="@/assets/img/lupe.svg" width="17rem" height="20rem" />
    </div>
    <input
      class="placeholder-gray-700 bg-gray-100 mr-2 text-sm font-medium leading-5  focus:outline-none  py-2 px-2 block w-full appearance-none leading-normal"
      id="filter"
      placeholder="Search..."
      type="search"
      style="text-indent:20px"
      v-model.lazy="filter"
    />
    <div class="loader absolute right-0" v-if="isLoading">Loading...</div>
  </div>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'CSearchInput',
  computed: {
    ...mapState(['isLoading']),
    filter: {
      get() {
        return this.$store.state.filter;
      },
      set(filter) {
        this.$store.dispatch('updateFilter', filter);
      }
    }
  }
};
</script>
