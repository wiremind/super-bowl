<template>
  <tr>
    <td :colspan="colspan" class="p-10">
      <c-table :messages="message.messages" :name="message.messages[0].groupId + '_table'" />
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
