<template>
  <div class="px-4 pt-2">
    <div class="flex float-right w-48 mb-3 search relative mr-6 my-2">
      <div class="absolute pin-r pin-t mt-3 ml-2 mr-4 text-purple-lighter">
        <img src="@/assets/img/lupe.svg" width="17rem" height="20rem" />
      </div>
      <input
        class="placeholder-gray-700 bg-gray-100 mr-2 text-sm font-medium leading-5  focus:outline-none  py-2 px-2 block w-full appearance-none leading-normal"
        id="filter"
        placeholder="Search..."
        type="search"
        style="text-indent:20px"
        v-model="filter"
      />
      <div class="loader absolute right-0" v-if="isLoading">Loading...</div>
    </div>

    <table class="w-full bg-white rounded mb-4">
      <thead>
        <tr class="bg-gray-100 h-8">
          <c-th
            v-for="(column, index) in columns"
            :label="column.label"
            :name="column.name"
            :sortDirection="sortDirection"
            :key="index"
            :isSortable="column.sortable"
            :sortedColumn="sortedColumn"
            @onClickSort="setSortColumnAndDirection"
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
      filter: '',
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
      ],
      sortedColumn: null,
      sortDirection: 'asc'
    };
  },
  computed: {
    ...mapState(['jobs', 'isLoading']),

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
  methods: {
    setSortColumnAndDirection(columnName) {
      [this.sortedColumn, this.sortDirection] = utils.getSortColumnAndDirection(
        columnName,
        this.sortedColumn,
        this.sortDirection
      );
    }
  },

  created() {
    this.$store.dispatch('getJobs');
  }
};
</script>
