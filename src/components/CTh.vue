<template>
  <th class="border-4 px-4 py-2" :key="name">
    <div class=" w-full">
      <div
        class="ml-2"
        @click="onClickSort"
        :class="{ 'cursor-pointer': isSortable }"
        :style="{ color: sortedColumn === name && isSortable ? 'blue' : 'black' }"
      >
        {{ label }}
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
