<template>
  <div :is="inTable ? 'tr' : 'div'" class="border text-xs px-4 py-2">
    <div :is="inTable ? 'td' : 'div'" :colspan="colspan" class="p-10">
      <c-table
        :messages="sortedMessages"
        :name="name + '_table'"
        :sort-direction="sortDirection"
        :sorted-column="sortedColumn"
        @sort="updateSort"
      />
    </div>
  </div>
</template>
<script>
import utils from '@/utils';
export default {
  name: 'CGroupContent',
  components: { CTable: () => import('./CTable.vue') },
  props: {
    message: Object,
    groupId: String,
    colspan: Number,
    name: String,
    inTable: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      sortedColumn: null,
      sortDirection: null
    };
  },
  methods: {
    updateSort(columnName) {
      [this.sortedColumn, this.sortDirection] = utils.getSortColumnAndDirection(
        columnName,
        this.sortedColumn,
        this.sortDirection
      );
    }
  },
  computed: {
    sortedMessages: function () {
      const sortedColumn = this.sortedColumn;
      const sortDirection = this.sortDirection;
      const sortedArray = [...this.message.messages];
      if (this.sortedColumn) {
        sortedArray.sort(function (a, b) {
          if (a[sortedColumn] === b[sortedColumn]) {
            return 0;
          }
          if (sortDirection === 'asc') {
            if (a[sortedColumn] > b[sortedColumn]) {
              return 1;
            } else {
              return -1;
            }
          } else {
            if (a[sortedColumn] < b[sortedColumn]) {
              return 1;
            } else {
              return -1;
            }
          }
        });
      }
      return sortedArray;
    }
  }
};
</script>
