<template>
  <tr>
    <td :colspan="colspan" class="p-10">
      <c-table
        :messages="sortedMessages"
        :name="message.messages[0].groupId + '_table'"
        :sort-direction="sortDirection"
        :sorted-column="sortedColumn"
        @sort="updateSort"
      />
    </td>
  </tr>
</template>
<script>
import utils from '@/utils';
export default {
  name: 'CGroupContent',
  components: { CTable: () => import('./CTable.vue') },
  props: {
    message: Object,
    groupId: String,
    colspan: Number
  },
  data() {
    return {
      columns: [
        { label: 'Actor', name: 'actorName', sortable: true },
        { label: 'Priority', name: 'priority', sortable: true },
        { label: 'State', name: 'name', sortable: true },
        { label: 'Started time', name: 'startedDatetime', sortable: true },
        { label: 'Wait time' },
        { label: 'Execution time' },
        { label: 'Remaining time' },
        { label: 'Progress', name: 'progress', sortable: true },
        { label: 'Actions', name: 'actions' }
      ],
      openedRows: [],
      sortedColumn: null,
      sortDirection: null
    };
  },
  methods: {
    toggleRow(id) {
      this.openedRows = utils.toggleItemFromList(id, this.openedRows);
    },
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
