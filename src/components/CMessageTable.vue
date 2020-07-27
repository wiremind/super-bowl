<template>
  <div class="px-4 pt-2">
    <c-search-input />
    <table class="w-full bg-white rounded mb-4">
      <thead>
        <tr class="bg-gray-100 h-8">
          <c-th
            v-for="(column, index) in columns"
            :label="column.label"
            :name="column.name"
            :key="index"
            :isSortable="column.sortable"
          ></c-th>
        </tr>
      </thead>
      <tbody>
        <template v-for="m in messages">
          <c-message-row
            :key="m.messageId + 'message-row'"
            :messageId="m.messageId"
            :actorName="m.actorName"
            :priority="m.priority"
            :stateName="m.name"
            :progress="m.progress"
            :enqueuedDatetime="m.enqueuedDatetime"
            :startedDatetime="m.startedDatetime"
            :endDatetime="m.endDatetime"
            @onToggle="toggleRow"
          ></c-message-row>
          <c-message-content
            v-if="openedRows.includes(m.messageId)"
            :key="m.messageId + 'message-content'"
            :messageId="m.messageId"
            :stateName="m.name"
            :colspan="columns.length"
            :actorName="m.actorName"
          ></c-message-content>
        </template>
        <tr class="border text-xs h-10 text-gray-800" v-if="countMessages > 10">
          <td :colspan="columns.length">
            <c-page-footer :total="countMessages"></c-page-footer>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import CMessageRow from '@/components/CMessageRow';
import CMessageContent from '@/components/CMessageContent';
import CSearchInput from '@/components/CSearchInput';
import CTh from '@/components/CTh';
import CPageFooter from '@/components/CPageFooter';
import { mapState } from 'vuex';
import utils from '@/utils';
require('@/assets/css/spinner.css');
export default {
  name: 'CMessageTable',
  components: { CMessageRow, CMessageContent, CTh, CPageFooter, CSearchInput },

  data() {
    return {
      columns: [
        // if the column is sortable must have a name
        { label: 'Actor', name: 'actorName', sortable: true },
        { label: 'Priority', name: 'priority', sortable: true },
        { label: 'State', name: 'name', sortable: true },
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
    ...mapState(['messages', 'refreshInterval', 'actors', 'countMessages'])
  },
  methods: {
    toggleRow(id) {
      this.openedRows = utils.toggleItemFromList(id, this.openedRows);
    }
  },
  created() {
    this.$store.commit('setCurrentPath', this.$route.path);
    this.$store.dispatch('startRefresh');
  },
  beforeCreate() {
    this.$store.commit('clearIntervalTimeOut');
    this.$store.commit('resetAttributesPage');
  }
};
</script>
