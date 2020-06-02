<template>
  <th class="border-2 px-2" :key="name">
    <div class=" w-full">
      <div
        class="ml-2 text-sm  font-semibold  leading-5"
        @click="onClickSort"
        :class="{ 'cursor-pointer': isSortable }"
      >
        {{ label }}
        <span
          class="arrow"
          v-if="sortedColumn === name"
          :class="sortDirection !== 'asc' ? 'asc' : 'dsc'"
        ></span>
      </div>
    </div>
  </th>
</template>

<script>
export default {
  name: 'CTh',
  props: {
    label: String,
    name: String,
    sortDirection: String,
    sortedColumn: String,
    isSortable: Boolean
  },
  methods: {
    onClickSort() {
      if (this.isSortable) {
        this.$emit('onClickSort', this.name);
      }
    }
  }
};
</script>

<style scoped>
.arrow.asc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-bottom: 4px solid #000;
}
.arrow.dsc {
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 4px solid #000;
}
.arrow {
  display: inline-block;
  vertical-align: middle;
  width: 0;
  height: 0;
  margin-left: 5px;
}
</style>
