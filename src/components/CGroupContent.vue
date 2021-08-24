<template>
  <div />
</template>
<script>
import utils from '@/utils';
export default {
  name: 'CGroupContent',
  props: {
    message: Array,
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
