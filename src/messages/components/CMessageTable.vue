<template>
  <div class="px-4 pt-2">
    <c-search-input />
    <c-table
      :messages="messages"
      :countMessages="countMessages"
      :sorted-column="sortedColumn"
      :sort-direction="sortDirection"
      name="main_table"
      @sort="sort"
    />
  </div>
</template>

<script>
import CSearchInput from '@/messages/components/CSearchInput';
import CTable from '@/messages/components/CTable';
import { mapState } from 'vuex';
import utils from '@/messages/utils';
require('@/assets/css/spinner.css');
export default {
  name: 'CMessageTable',
  components: {
    CSearchInput,
    CTable
  },
  computed: {
    ...mapState({
      messages: state => state.messages.messages,
      countMessages: state => state.messages.countMessages
    }),
    sortedColumn: {
      get() {
        return this.$store.state.messages.sortedColumn;
      },
      set(column) {
        this.$store.dispatch('updateSortedColumn', column);
      }
    },
    sortDirection: {
      get() {
        return this.$store.state.messages.sortDirection;
      },
      set(direction) {
        this.$store.dispatch('updateSortDirection', direction);
      }
    }
  },
  created() {
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
