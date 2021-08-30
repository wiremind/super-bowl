<template>
  <table class="w-full bg-white rounded mb-4">
    <thead>
      <tr class="bg-gray-100 h-8">
        <c-th
          v-for="(column, index) in columns"
          :label="column.label"
          :name="column.name"
          :key="index"
          :isSortable="column.sortable"
          :sortDirection="sortDirection"
          :sortedColumn="sortedColumn"
          @sort="$emit('sort', column.name)"
        ></c-th>
      </tr>
    </thead>
    <tbody>
      <template v-for="(message, index) in messages">
        <c-message-row
          :message="message"
          @toggle="toggleRow(index)"
          :key="name + '_' + index + '_row'"
          :name="name + '_' + index + '_row'"
        />
        <tr
          v-if="
            openedRows.includes(index) ||
            (message.type && openedRows.includes(message.messages[0].messageId))
          "
          :is="contentType(message)"
          :key="name + '_' + index + '_content'"
          :colspan="columns.length"
          :message="message"
          :name="name + '_' + index + '_content'"
        />
      </template>
      <tr class="border text-xs h-10 text-gray-800" v-if="countMessages > 10">
        <td :colspan="columns.length">
          <c-page-footer :total="countMessages"></c-page-footer>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import CPageFooter from '@/components/CPageFooter';
import CTh from '@/components/CTh';
import CMessageRow from '@/components/CMessageRow';
import CPipelineRow from '@/components/CPipelineRow';
import CGroupRow from '@/components/CGroupRow';
import CMessageContent from '@/components/CMessageContent';
import CPipelineContent from '@/components/CPipelineContent';
import CGroupContent from '@/components/CGroupContent';
import utils from '@/utils';

export default {
  name: 'CTable',
  components: {
    CTh,
    CPageFooter,
    CMessageRow,
    CPipelineRow,
    CGroupRow,
    CMessageContent,
    CPipelineContent,
    CGroupContent
  },
  props: {
    messages: Array,
    countMessages: Number,
    name: String,
    sortedColumn: String,
    sortDirection: String
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
  methods: {
    toggleRow(index) {
      this.openedRows = utils.toggleItemFromList(index, this.openedRows);
    },
    rowType: function (message) {
      if (message.type === 'pipeline') {
        return 'c-pipeline-row';
      } else if (message.type === 'group') {
        return 'c-group-row';
      }
      return 'c-message-row';
    },
    contentType: function (message) {
      if (message.type === 'pipeline') {
        return 'c-pipeline-content';
      } else if (message.type === 'group') {
        return 'c-group-content';
      }
      return 'c-message-content';
    }
  }
};
</script>
