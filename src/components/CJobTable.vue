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
        <template v-for="(job, index) in editableJobs">
          <c-job-row
            :key="index"
            v-bind.sync="job"
            :is-edited="JSON.stringify(job) !== JSON.stringify(jobs[index])"
            @save="$store.dispatch('saveJob', job)"
            @discard="$set(editableJobs, index, Object.assign({}, jobs[index]))"
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

export default {
  name: 'CJobTable',
  components: { CTh, CJobRow },
  data() {
    return {
      columns: [
        { label: 'Actor Name', name: 'actorName' },
        { label: 'Enabled', name: 'enabled' },
        { label: 'Interval', name: 'interval' },
        { label: 'Daily Time', name: 'dailyTime' },
        { label: 'Weekday', name: 'isoWeekday' },
        { label: 'Args', name: 'args' },
        { label: 'Kwargs', name: 'kwargs' },
        { label: 'Last Queued', name: 'lastQueued' },
        { label: 'Time Zone', name: 'tz' },
        { label: 'Actions', name: 'actions' }
      ],
      editableJobs: []
    };
  },
  computed: {
    ...mapState(['jobs'])
  },
  created() {
    this.$store.dispatch('getJobs');
  },
  watch: {
    jobs: function (newValue) {
      this.editableJobs = newValue.map(obj => Object.assign({}, obj));
    }
  }
};
</script>
