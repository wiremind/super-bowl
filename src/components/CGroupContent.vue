<template>
  <tr>
    <td
      class="border text-xs px-4 py-2"
      style="background-color:whitesmoke"
      :colspan="columns.length"
    >
      <div class="px-4 pt-2">
        <table class="w-full bg-white rounded mb-4">
          <thead>
            <tr class="bg-gray-100 h-8">
              <c-th
                v-for="(column, index) in columns"
                :label="column.label"
                :name="column.name"
                :key="index"
              ></c-th>
            </tr>
          </thead>
          <tbody>
            <template v-for="m in messages">
              <c-message-row
                :key="m.messageId"
                :messageId="m.messageId"
                :actorName="m.actorName"
                :priority="m.priority"
                :stateName="m.name"
                :progress="m.progress"
                :args="m.args"
                :kwargs="m.kwargs"
                :enqueuedDatetime="m.enqueuedDatetime"
                :startedDatetime="m.startedDatetime"
                :endDatetime="m.endDatetime"
                @onToggle="toggleRow"
              ></c-message-row>
              <c-message-content
                v-if="openedRows.includes(m.messageId)"
                :key="m.messageId + 'message-content'"
                :messageId="m.messageId"
                :colspan="columns.length"
                :actorName="m.actorName"
              ></c-message-content>
            </template>
          </tbody>
        </table>
      </div>
    </td>
  </tr>
</template>
<script>
import CMessageRow from '@/components/CMessageRow';
import CMessageContent from '@/components/CMessageContent';
import CTh from '@/components/CTh';
import utils from '@/utils';
export default {
  name: 'CGroupContent',
  components: { CMessageRow, CMessageContent, CTh },
  props: {
    messages: Array,
    groupId: String
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
      openedRows: []
    };
  },
  methods: {
    toggleRow(id) {
      this.openedRows = utils.toggleItemFromList(id, this.openedRows);
    }
  }
};
</script>
