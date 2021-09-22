<template>
  <div class="px-4 pt-2">
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
        <template v-for="(job, index) in displayedJobs">
          <c-job-row
            :key="index"
            :actorName="job.actorName"
            :dailyTime="job.dailyTime"
            :enabled="job.enabled"
            :interval="job.interval"
            :isoWeekday="job.isoWeekday"
            :args="job.args"
            :kwargs="job.kwargs"
            :lastQueued="job.lastQueued"
            :tz="job.tz"
          ></c-job-row>
        </template>
      </tbody>
    </table>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import CTh from '@/components/CTh';
import CJobRow from '@/components/CJobRow';
import utils from '@/utils';

export default {
  name: 'CJobTable',
  components: { CTh, CJobRow },
  data() {
    return {
      columns: [
        { label: 'Actor Name', name: 'actorName', sortable: true },
        { label: 'Daily Time', name: 'dailyTime' },
        { label: 'Enabled', name: 'enabled', sortable: true },
        { label: 'Interval', name: 'interval', sortable: true },
        { label: 'Weekday', name: 'isoWeekday', sortable: true },
        { label: 'Args', name: 'args' },
        { label: 'Kwargs', name: 'kwargs' },
        { label: 'Last Queued', name: 'lastQueued', sortable: true },
        { label: 'Time Zone', name: 'tz' }
      ]
    };
  },
  computed: {
    ...mapState(['jobs', 'isLoading', 'sortedColumn', 'sortDirection', 'filter']),
    filteredJobs() {
      if (!this.filter) {
        return this.jobs;
      }
      const filterKeys = ['actorName'];
      return utils.filterTable(this.jobs, this.filter, filterKeys);
    },
    displayedJobs() {
      if (!this.sortedColumn) {
        return this.filteredJobs;
      }
      return utils.sortTable(this.filteredJobs, this.sortDirection, this.sortedColumn);
    }
  },
  created() {
    this.$store.dispatch('getJobs');
  }
};
</script>
