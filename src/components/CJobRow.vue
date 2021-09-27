<template>
  <tr class="border-b text-xs border-gray-200 hover:bg-blue-100">
    <td class="border px-4 py-2">
      {{ actorName }}
    </td>
    <td class="p-0">
      <vue-ctk-date-time-picker
        :onlyTime="true"
        formatted="HH:mm"
        format="HH:mm"
        v-model="editableDailyTime"
      />
    </td>
    <td class="border px-4 py-2">
      <div class="flex">
        <input v-model="editableEnabled" type="checkbox" class="h-5" />
        {{ editableEnabled }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div class="flex items-center">
        <div class="w-1/4">{{ interval | formatSeconds }}</div>
        <input v-model.number="editableInterval" class="w3/4" type="number" />
      </div>
    </td>
    <td class="border px-4 py-2">
      <select v-model.number="editableWeekday">
        <option :value="null"></option>
        <option value="1">Monday</option>
      </select>
    </td>
    <td class="border px-4 py-2">
      <pre>{{ args | json }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre>{{ kwargs | json }}</pre>
    </td>
    <td class="border px-4 py-2">
      {{ lastQueued | formatDistance }}
    </td>
    <td class="border px-4 py-2">
      {{ tz }}
    </td>
    <td class="border px-4 w-64">
      <div class="space-x-2 flex" v-if="isEdited && !errorMessage">
        <button class="btn btn-success w-1/2" @click="save">Save</button>
        <button class="btn btn-danger w-1/2" @click="$emit('discard')">Discard</button>
      </div>
      <p v-if="errorMessage">
        {{ errorMessage }}
      </p>
    </td>
  </tr>
</template>

<script>
import { formatDistance, formatDistanceStrict, addSeconds } from 'date-fns';
export default {
  name: 'CJobRow',
  props: {
    actorName: String,
    dailyTime: String,
    enabled: Boolean,
    interval: Number,
    isoWeekday: Number,
    args: Array,
    kwargs: Object,
    lastQueued: Date,
    tz: String,
    isEdited: Boolean
  },
  data() {
    return { errorMessage: null };
  },
  filters: {
    formatDistance(time) {
      return time ? formatDistance(new Date(), time) + ' ago' : '';
    },
    formatWeekDay(isoWeekday) {
      const weekdays = [
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday',
        'Sunday'
      ];
      return isoWeekday ? weekdays[isoWeekday - 1] : '';
    },
    formatSeconds(seconds) {
      if (!seconds) {
        return '';
      }
      const currentDate = new Date();
      return formatDistanceStrict(addSeconds(currentDate, seconds), currentDate);
    },
    json(obj) {
      return obj ? JSON.stringify(obj, undefined) : '';
    }
  },
  computed: {
    editableEnabled: {
      get() {
        return this.enabled;
      },
      set(val) {
        this.$emit('update:enabled', val);
      }
    },
    editableDailyTime: {
      get() {
        return this.dailyTime;
      },
      set(val) {
        this.$emit('update:dailyTime', val);
      }
    },
    editableInterval: {
      get() {
        return this.interval;
      },
      set(val) {
        this.$emit('update:interval', val);
      }
    },
    editableWeekday: {
      get() {
        return this.isoWeekday;
      },
      set(val) {
        this.$emit('update:isoWeekday', val);
      }
    }
  },
  methods: {
    save() {
      if (this.dailyTime && this.interval !== 86400) {
        this.errorMessage = 'Daily Time can only be used with a 24 hour interval (86400 seconds)';
        setTimeout(() => (this.errorMessage = null), 3000);
        return;
      }
      this.$emit('save');
    }
  }
};
</script>
