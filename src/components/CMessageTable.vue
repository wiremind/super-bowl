<template>
  <div class="px-4 pt-2">
    <!-- Filters -->
    <div class="flex float-right w-48 mb-3 search relative mr-6 my-2">
      <input
        class="placeholder-gray-700 bg-gray-100 mr-2 text-sm font-medium leading-5  focus:outline-none  py-2 px-2 block w-full appearance-none leading-normal"
        id="filter"
        placeholder="Search..."
        type="search"
        style="text-indent:20px"
        v-model="filter"
      />
      <div class="absolute pin-r pin-t mt-3 mr-4 text-purple-lighter">
        <svg
          version="1.1"
          class="h-4 text-dark"
          xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink"
          x="0px"
          y="0px"
          viewBox="0 0 52.966 52.966"
          style="enable-background:new 0 0 52.966 52.966;     margin-left: 0.5rem;"
          xml:space="preserve"
        >
          <path
            d="M51.704,51.273L36.845,35.82c3.79-3.801,6.138-9.041,6.138-14.82c0-11.58-9.42-21-21-21s-21,9.42-21,21s9.42,21,21,21
            c5.083,0,9.748-1.817,13.384-4.832l14.895,15.491c0.196,0.205,0.458,0.307,0.721,0.307c0.25,0,0.499-0.093,0.693-0.279
            C52.074,52.304,52.086,51.671,51.704,51.273z M21.983,40c-10.477,0-19-8.523-19-19s8.523-19,19-19s19,8.523,19,19
            S32.459,40,21.983,40z"
          />
        </svg>
      </div>
      <div class="loader" v-if="isLoading">Loading...</div>
    </div>
    <table class="w-full bg-white rounded mb-4">
      <thead>
        <tr class="bg-gray-100 h-8">
          <c-th
            v-for="(column, index) in columns"
            :label="column.label"
            :name="column.name"
            :sortDirection="sortDirection"
            :key="index"
            :isSortable="column.sortable"
            :sortedColumn="sortedColumn"
            @onClickSort="setSortColumnAndDirection"
          ></c-th>
        </tr>
      </thead>
      <tbody>
        <template v-for="m in displayedMessages">
          <c-message-row
            :key="m.messageId"
            :messageId="m.messageId"
            :actorName="m.actorName"
            :priority="m.priority"
            :name="m.name"
            :progress="m.progress"
            :args="m.args"
            :kwargs="m.kwargs"
            :enqueuedDatetime="m.enqueuedDatetime"
            :startedDatetime="m.startedDatetime"
            :endDatetime="m.endDatetime"
            @onToggle="toggleRow"
          ></c-message-row>
          <tr :key="m.messageId + 0" v-if="openedRows.includes(m.messageId)">
            <td class="border px-4 py-2" :colspan="columns.length">
              <pre class="text-xs ml-2 bg-white">Args: {{ m.args | json }}</pre>
              <pre class="text-xs ml-2 bg-white">Kwargs: {{ m.kwargs | json }}</pre>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<script>
import CMessageRow from '@/components/CMessageRow';
import CTh from '@/components/CTh';
import { mapState } from 'vuex';
import utils from '@/utils';
require('@/assets/css/spinner.css');
export default {
  name: 'CMessageTable',
  components: { CMessageRow, CTh },

  data() {
    return {
      filter: '',
      columns: [
        // if the column is sortable must have a name
        { label: 'Priority', name: 'priority', sortable: true },
        { label: 'Message id', name: 'messageId' },
        { label: 'State', name: 'name', sortable: true },
        { label: 'Actor', name: 'actorName', sortable: true },
        { label: 'Started time', name: 'startedDatetime', sortable: true },
        { label: 'Wait time' },
        { label: 'Progress', name: 'progress', sortable: true },
        { label: 'Execution time' },
        { label: 'Actions' }
      ],
      sortedColumn: null,
      sortDirection: 'asc',
      openedRows: []
    };
  },

  computed: {
    ...mapState(['messages', 'refreshInterval', 'isLoading']),
    filteredMessages() {
      if (!this.filter) {
        return this.messages;
      }
      const filterKeys = ['name', 'messageId', 'actorName'];
      return utils.filterTable(this.messages, this.filter, filterKeys);
    },
    displayedMessages() {
      if (!this.sortedColumn) {
        return this.filteredMessages;
      }
      return utils.sortTable(this.filteredMessages, this.sortDirection, this.sortedColumn);
    }
  },
  methods: {
    setSortColumnAndDirection(columnName) {
      [this.sortedColumn, this.sortDirection] = utils.getSortColumnAndDirection(
        columnName,
        this.sortedColumn,
        this.sortDirection
      );
    },
    toggleRow(id) {
      const index = this.openedRows.indexOf(id);
      if (index >= 0) {
        this.openedRows = this.openedRows.filter(item => item !== id);
      } else {
        this.openedRows = [...this.openedRows, id];
      }
    }
  },
  filters: {
    json(obj) {
      return obj ? JSON.stringify(obj, undefined, 2) : '';
    }
  },
  created() {
    this.$store.dispatch('getMessages');
    this.$store.dispatch('startUpdateMessages');
  },

  beforeDestroy() {
    this.$store.commit('clearIntervalTimeOut');
  }
};
</script>
