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
        <template v-for="g in groups">
          <c-group-header
            :key="g.groupId + 'header'"
            :groupId="g.groupId"
            :messages="g.messages"
            @onToggle="toggleRow"
          ></c-group-header>
          <c-group-content
            v-if="openedRows.includes(g.groupId)"
            :key="g.groupId + 'content'"
            :messages="g.messages"
            :groupId="g.groupId"
          ></c-group-content>
        </template>
        <tr class="border text-xs h-10 text-gray-800" v-if="countGroups > 10">
          <td :colspan="columns.length">
            <c-page-footer :total="countGroups"></c-page-footer>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import CGroupContent from '@/components/CGroupContent';
import CGroupHeader from '@/components/CGroupHeader';
import CSearchInput from '@/components/CSearchInput';
import CPageFooter from '@/components/CPageFooter';
import CTh from '@/components/CTh';
import utils from '@/utils';
import { mapState } from 'vuex';

export default {
  name: 'CGroupTable',
  components: { CTh, CGroupHeader, CGroupContent, CPageFooter, CSearchInput },
  data() {
    return {
      columns: [
        { label: 'Group Id', name: 'groupId' },
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
    ...mapState(['groups', 'refreshInterval', 'countGroups'])
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
