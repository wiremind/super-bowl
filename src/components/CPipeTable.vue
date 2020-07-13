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
          ></c-th>
        </tr>
      </thead>
      <tbody>
        <template v-for="p in pipelines">
          <c-pipe-header
            :key="p.pipelineId + 'header'"
            :pipelineId="p.pipelineId"
            :messages="p.messages"
            @onToggle="toggleRow"
          ></c-pipe-header>
          <c-pipe-content
            v-if="openedRows.includes(p.pipelineId)"
            :key="p.pipelineId + 'content'"
            :messages="p.messages"
            :pipelineId="p.pipelineId"
          ></c-pipe-content>
        </template>
        <tr class="border text-xs h-10 text-gray-800" v-if="countPipelines > 10">
          <td :colspan="columns.length">
            <c-page-footer :total="countPipelines"></c-page-footer>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import CPipeContent from '@/components/CPipeContent';
import CPipeHeader from '@/components/CPipeHeader';
import CSearchInput from '@/components/CSearchInput';
import CPageFooter from '@/components/CPageFooter';
import CTh from '@/components/CTh';
import utils from '@/utils';
import { mapState } from 'vuex';

export default {
  name: 'CPipeTable',
  components: { CTh, CPipeHeader, CPipeContent, CPageFooter, CSearchInput },
  data() {
    return {
      columns: [
        { label: 'Pipeline Id', name: 'pipelineId' },
        { label: 'Actors' },
        { label: 'Message Count' },
        { label: 'Enqueued Datetime' },
        { label: 'Progress', name: 'progress' },
        { label: 'Remaining Time', name: 'remainingTime' }
      ],
      openedRows: []
    };
  },
  methods: {
    toggleRow(id) {
      this.openedRows = utils.toggleItemFromList(id, this.openedRows);
    }
  },
  computed: {
    ...mapState(['pipelines', 'refreshInterval', 'countPipelines'])
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
