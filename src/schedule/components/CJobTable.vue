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
        <c-job-row
          v-for="(job, index) in editableJobs"
          :key="index"
          v-bind.sync="job"
          @validityUpdate="$set(validity, index, $event)"
        />
      </tbody>
    </table>
    <div class="flex float-right items-center">
      <b v-if="saveError" class="rounded border border-black text-red-500 p-2 mx-3 h-full">
        {{ saveError }}
      </b>
      <div class="space-x-2" v-if="editedJobs.length > 0">
        <button class="btn btn-success" @click="save" v-if="validity.every(v => v)">Save</button>
        <button
          class="btn btn-danger"
          @click="editableJobs = stringifiedJobs.map(job => ({ ...job }))"
        >
          Discard
        </button>
      </div>
    </div>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import CTh from '@/shared/components/CTh';
import CJobRow from '@/schedule/components/CJobRow';

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
        { label: 'Last Queued', name: 'lastQueued' },
        { label: 'Weekday', name: 'isoWeekday' },
        { label: 'Args', name: 'args' },
        { label: 'Kwargs', name: 'kwargs' },
        { label: 'Time Zone', name: 'tz' }
      ],
      editableJobs: [],
      validity: []
    };
  },
  computed: {
    ...mapState({
      jobs: state => state.schedule.jobs,
      saveError: state => state.schedule.saveError
    }),
    comparableJobs() {
      return this.stringifiedJobs.map(JSON.stringify);
    },
    editedJobs() {
      return this.editableJobs.filter(
        (job, index) => JSON.stringify(job) !== this.comparableJobs[index]
      );
    },
    stringifiedJobs() {
      return this.jobs.map(job => ({
        ...job,
        args: JSON.stringify(job.args),
        kwargs: JSON.stringify(job.kwargs)
      }));
    }
  },
  methods: {
    save() {
      const newJobs = this.editedJobs.map(job => ({
        ...job,
        args: JSON.parse(job.args),
        kwargs: JSON.parse(job.kwargs)
      }));
      this.$store.dispatch('saveJobs', newJobs);
    }
  },
  created() {
    this.$store.dispatch('getJobs');
  },
  watch: {
    stringifiedJobs: function (newValue) {
      this.editableJobs = newValue.map(job => ({ ...job }));
    }
  }
};
</script>
