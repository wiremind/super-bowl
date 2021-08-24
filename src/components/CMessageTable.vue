<template>
  <div class="px-4 pt-2">
    <c-search-input />
    <c-table
      :messages="messages"
      :countMessages="countMessages"
      :sorted-column="sortedColumn"
      :sort-direction="sortDirection"
      @sort="sort"
    />
  </div>
</template>

<script>
import CSearchInput from '@/components/CSearchInput';
import CTable from '@/components/CTable';
import { mapState } from 'vuex';
import utils from '@/utils';
require('@/assets/css/spinner.css');
export default {
  name: 'CMessageTable',
  components: {
    CSearchInput,
    CTable
  },

  data() {
    return {
      columns: [
        // if the column is sortable must have a name
        { label: 'Actor', name: 'actorName', sortable: true },
        { label: 'Priority', name: 'priority', sortable: true },
        { label: 'State', name: 'status', sortable: true },
        { label: 'Started time', name: 'startedDatetime', sortable: true },
        { label: 'Wait time' },
        { label: 'Execution time' },
        { label: 'Remaining time' },
        { label: 'Progress', name: 'progress', sortable: true },
        { label: 'Actions' }
      ],
      openedRows: []
    };
  },
  computed: {
    ...mapState(['messages', 'refreshInterval', 'actors', 'countMessages']),
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
  },
  created() {
    this.$store.commit('setCurrentPath', this.$route.path);
    this.$store.dispatch('startRefresh');
  },
  beforeCreate() {
    this.$store.commit('clearIntervalTimeOut');
    this.$store.commit('resetAttributesPage');
  },
  methods: {
    sort: function (columnName) {
      [this.sortedColumn, this.sortDirection] = utils.getSortColumnAndDirection(
        columnName,
        this.sortedColumn,
        this.sortDirection
      );
    }
  }
};
</script>
