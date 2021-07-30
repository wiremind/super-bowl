<template>
  <th class="border-2 px-2" :key="name">
    <div class="w-full">
      <div
        class="ml-2 font-semibold text-sm"
        @click="setSortColumnAndDirection"
        :class="{ 'cursor-pointer': isSortable }"
      >
        {{ label }}
        <span
          class="arrow"
          v-if="sortedColumn && sortedColumn === name"
          :class="sortDirection !== 'asc' ? 'asc' : 'desc'"
        ></span>
      </div>
    </div>
  </th>
</template>

<script>
import utils from '@/utils';
export default {
  name: 'CTh',
  props: {
    label: String,
    name: String,
    isSortable: Boolean
  },
  methods: {
    setSortColumnAndDirection() {
      if (this.isSortable) {
        [this.sortedColumn, this.sortDirection] = utils.getSortColumnAndDirection(
          this.name,
          this.sortedColumn,
          this.sortDirection
        );
      }
    }
  },
  computed: {
    sortedColumn: {
      get() {
        return this.$store.state.sortedColumn;
      },
      set(column) {
        this.$store.dispatch('updateSortedColumn', column);
      }
    },
    sortDirection: {
      get() {
        return this.$store.state.sortDirection;
      },
      set(direction) {
        this.$store.dispatch('updateSortDirection', direction);
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
