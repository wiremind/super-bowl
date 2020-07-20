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
          <tr :key="m.messageId + 0" v-if="openedRows.includes(m.messageId)">
            <td class="border text-xs px-4 py-2" :colspan="columns.length">
              <div class="text-xs">
                <div class="font-bold inline-block">Message Id</div>
                :{{ m.messageId }}
              </div>
              <div class="text-xs">
                <div class="font-bold inline-block">Queue Name</div>
                :{{ queueName(m.actorName) }}
              </div>
              <pre
                class="text-xs bg-white"
              ><div class="font-bold inline-block">Args</div>:{{m.args | json}}</pre>
              <pre
                class="text-xs bg-white"
              ><div class="font-bold inline-block">Kwargs</div>:{{m.kwargs | json}}</pre>
            </td>
          </tr>
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
import CSearchInput from '@/components/CSearchInput';
import CTh from '@/components/CTh';
import CPageFooter from '@/components/CPageFooter';
import { mapState } from 'vuex';
import utils from '@/utils';
require('@/assets/css/spinner.css');
export default {
  name: 'CMessageTable',
  components: { CMessageRow, CTh, CPageFooter, CSearchInput },

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
    },
    queueName(actorName) {
      const actors = this.$store.getters.actorsByName;
      const actor = actors[actorName];
      return actor ? actor.queueName : '';
    }
  },
  filters: {
    json(obj) {
      return obj ? JSON.stringify(obj, undefined, 2) : '';
    }
  },
  created() {
    this.$store.commit('setCurrentPath', this.$route.path);
    this.$store.dispatch('startRefresh');
  },
  beforeDestroy() {
    this.$store.commit('clearIntervalTimeOut');
    this.$store.commit('resetAttributesPage');
  }
};
</script>
