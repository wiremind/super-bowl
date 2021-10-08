<template>
  <tr class="border-b text-xs border-gray-200 hover:bg-blue-100">
    <td class="border px-4 py-2">
      {{ actorName }}
    </td>
    <td class="border px-4 py-2">
      <div class="flex">
        <input v-model="editableEnabled" type="checkbox" class="h-5 w-5 mr-2" />
        {{ editableEnabled }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div class="flex items-center space-x-2">
        <div class="w-1/3">{{ interval | formatSeconds }}</div>
        <input v-model.number="editableInterval" class="w2/3" type="number" />
      </div>
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
      {{ lastQueued | formatDistance }}
    </td>
    <td class="border w-28">
      <select v-model.number="editableWeekday" class="pl-2 pr-2">
        <option :value="null"></option>
        <option
          v-for="(day, index) in [
            'Monday',
            'Tuesday',
            'Wednesday',
            'Thursday',
            'Friday',
            'Saturday',
            'Sunday'
          ]"
          :key="index"
          :value="index + 1"
        >
          {{ day }}
        </option>
      </select>
    </td>
    <td class="border px-4 py-2">
      <input v-model="editableArgs" :class="{ 'invalid-input': !isArgsValid }" />
    </td>
    <td class="border px-4 py-2">
      <input v-model="editableKwargs" :class="{ 'invalid-input': !isKwargsValid }" />
    </td>
    <td class="border px-4 py-2">
      <input v-model="editableTz" />
    </td>
  </tr>
</template>

<script>
import { formatDistance, formatDistanceStrict, addSeconds } from 'date-fns';
import scheduleUtils from '@/schedule/utils';
import utils from '@/shared/utils';

export default {
  name: 'CJobRow',
  props: {
    actorName: String,
    dailyTime: String,
    enabled: Boolean,
    interval: Number,
    isoWeekday: Number,
    args: String,
    kwargs: String,
    lastQueued: Date,
    tz: String
  },
  data() {
    return {
      errorMessage: null
    };
  },
  filters: {
    formatDistance(time) {
      return time ? formatDistance(scheduleUtils.dateToUTC(new Date()), time) + ' ago' : '';
    },
    formatSeconds(seconds) {
      if (!seconds) {
        return '';
      }
      const currentDate = new Date();
      return formatDistanceStrict(addSeconds(currentDate, seconds), currentDate);
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
        if (val !== null && this.editableWeekday === null) {
          this.editableInterval = 86400;
        }
        this.$emit('update:dailyTime', val);
      }
    },
    editableInterval: {
      get() {
        return this.interval;
      },
      set(val) {
        if (val !== 86400 && val !== null) {
          this.editableDailyTime = null;
          this.editableWeekday = null;
        }
        this.$emit('update:interval', val);
      }
    },
    editableWeekday: {
      get() {
        return this.isoWeekday;
      },
      set(val) {
        if (val !== null) {
          this.editableInterval = 86400;
        }
        this.$emit('update:isoWeekday', val);
      }
    },
    editableTz: {
      get() {
        return this.tz;
      },
      set(val) {
        this.$emit('update:tz', val);
      }
    },
    editableArgs: {
      get() {
        return this.args;
      },
      set(val) {
        this.$emit('update:args', val);
      }
    },
    editableKwargs: {
      get() {
        return this.kwargs;
      },
      set(val) {
        this.$emit('update:kwargs', val);
      }
    },
    isArgsValid() {
      return utils.isJson(this.args) && Array.isArray(JSON.parse(this.args));
    },
    isKwargsValid() {
      return utils.isJson(this.kwargs) && !Array.isArray(JSON.parse(this.kwargs));
    },
    isValid() {
      return this.isArgsValid && this.isKwargsValid;
    }
  },
  watch: {
    isValid(newValue) {
      this.$emit('validityUpdate', newValue);
    }
  }
};
</script>
