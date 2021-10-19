<template>
  <th class="border-2 px-2" :key="name">
    <div class="w-full">
      <div
        class="mx-1 font-semibold text-sm"
        @click="sort"
        :class="{ 'cursor-pointer': isSortable }"
      >
        {{ label }}
        <span
          class="arrow"
          v-if="sortedColumn && sortedColumn === name"
          :class="sortDirection"
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
    isSortable: Boolean,
    sortedColumn: String,
    sortDirection: String
  },
  methods: {
    sort() {
      if (this.isSortable) {
        this.$emit('sort');
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
.arrow.desc {
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
