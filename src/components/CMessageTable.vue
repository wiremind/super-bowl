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
        <template v-for="message in messages">
          <template v-if="message.type === 'pipeline'">
            <c-pipeline-row
              v-if="message.type === 'pipeline'"
              :messages="message.messages"
              :key="message.messages[0].messageId + 'pipeline-row'"
            />
          </template>
          <template v-else>
            <c-message-row
              :key="message.messageId + 'message-row'"
              :messageId="message.messageId"
              :actorName="message.actorName"
              :priority="message.priority"
              :stateName="message.name"
              :progress="message.progress"
              :enqueuedDatetime="message.enqueuedDatetime"
              :startedDatetime="message.startedDatetime"
              :endDatetime="message.endDatetime"
              @toggle="toggleRow"
            />
            <c-message-content
              v-if="openedRows.includes(message.messageId)"
              :key="message.messageId + 'message-content'"
              :messageId="message.messageId"
              :stateName="message.name"
              :queueName="m.queueName"
              :colspan="columns.length"
              :actorName="message.actorName"
            />
          </template>
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
import CSearchInput from '@/components/CSearchInput';
import CTh from '@/components/CTh';
import CPageFooter from '@/components/CPageFooter';
import CMessageRow from '@/components/CMessageRow';
import CPipelineRow from '@/components/CPipelineRow';
import CMessageContent from '@/components/CMessageContent';
import { mapState } from 'vuex';
import utils from '@/utils';
require('@/assets/css/spinner.css');
export default {
  name: 'CMessageTable',
  components: { CTh, CPageFooter, CSearchInput, CMessageRow, CPipelineRow, CMessageContent },

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
