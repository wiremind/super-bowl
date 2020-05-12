<template>
  <div class="px-4 pt-32">
    <!-- Filters -->
    <div class="w-full">
      <div class="flex float-right w-48 mb-3 search">
        <input
          class="placeholder-gray-700 bg-gray-100  focus:outline-none  py-2 px-2 block w-full appearance-none leading-normal"
          id="filter"
          placeholder="Search..."
          type="text"
          v-model="filter"
        />
        <slot></slot>
      </div>
    </div>
    <div>
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100 border-4 h-8">
            <c-th
              v-for="(column, index) in columns"
              :label="column.label"
              :name="column.name"
              :key="index"
              :isSortable="column.sortable"
              :sortedColumn="sortedColumn"
              @onClickSort="setSortColumnAndDirection"
            ></c-th>
          </tr>
        </thead>
        <tbody>
          <c-row
            v-for="m in displayedMessages"
            :key="m.messageId"
            :messageId="m.messageId"
            :actorName="m.actorName"
            :priority="m.priority"
            :name="m.name"
            :args="m.args"
            :kwargs="m.kwargs"
            :enqueuedDatetime="m.enqueuedDatetime"
            :startedDatetime="m.startedDatetime"
            :endDatetime="m.endDatetime"
          ></c-row>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import CRow from '@/components/CRow';
import CTh from '@/components/CTh';
export default {
  name: 'CTable',
  components: { CRow, CTh },
  props: {
    messages: {
      type: Array,
      default: () => []
    }
  },

  data() {
    return {
      filter: '',
      columns: [
        // if the column is Sortable must have a name
        { label: 'Priority', name: 'priority', sortable: true },
        { label: 'Message id', name: 'messageId' },
        { label: 'State', name: 'name', sortable: true },
        { label: 'Actor', name: 'actorName', sortable: true },
        { label: 'Args', name: 'args' },
        { label: 'Kwargs', name: 'kwargs' },
        { label: 'Started time', name: 'startedDatetime', sortable: true },
        { label: 'Wait time' },
        { label: 'Execution time' },
        { label: 'Actions' }
      ],
      sortedColumn: null,
      sortDirection: 'asc'
    };
  },

  computed: {
    filteredMessages() {
      if (!this.filter) {
        return this.messages;
      }
      const filterKeys = ['name', 'messageId', 'actorName'];

      return this.messages.filter(m =>
        filterKeys
          .map(key => m[key].toLowerCase())
          .join('~~')
          .includes(this.filter.toLowerCase())
      );
    },
    displayedMessages() {
      if (!this.sortedColumn) {
        return this.filteredMessages;
      }
      return [...this.filteredMessages].sort((row1, row2) => {
        const direction = this.sortDirection === 'asc' ? 1 : -1;
        const a = row1[this.sortedColumn] || 0,
          b = row2[this.sortedColumn] || 0;
        return direction * (a < b ? -1 : 1);
      });
    }
  },
  methods: {
    setSortColumnAndDirection(columnName) {
      if (columnName === this.sortedColumn) {
        if (this.sortDirection === 'asc') {
          this.sortDirection = 'desc';
        } else {
          this.sortedColumn = null;
        }
      } else {
        this.sortedColumn = columnName;
        this.sortDirection = 'asc';
      }
    }
  }
};
</script>

<style scoped>
td,
.search,
th {
  padding: 0rem;
  font-family: monospace;
}
th,
td {
  background: #f7fafc;
  position: sticky;
  position: -webkit-sticky;
  top: 4rem;
}
</style>
