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
      {{ lastQueued | formatDistance }}
    </td>
    <td class="border px-4 py-2">
      <input v-model="editableTz" />
    </td>
    <td class="border px-4 w-60">
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
import utils from '@/utils';

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
    return {
      errorMessage: null,
      isArgsValid: true,
      isKwargsValid: true,
      editableArgs: null,
      editableKwargs: null
    };
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
          this.editableInterval = null;
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
    }
  },
  methods: {
    save() {
      if (!this.isArgsValid) {
        this.errorMessage = 'Invalid Args';
        setTimeout(() => (this.errorMessage = null), 3000);
        return;
      }
      if (!this.isKwargsValid) {
        this.errorMessage = 'Invalid Kwargs';
        setTimeout(() => (this.errorMessage = null), 3000);
        return;
      }
      this.$emit('save');
    }
  },
  watch: {
    args(newValue) {
      if (
        utils.isJson(this.editableArgs) &&
        JSON.stringify(JSON.parse(this.editableArgs)) !== JSON.stringify(newValue)
      ) {
        this.editableArgs = JSON.stringify(newValue);
      }
    },
    editableArgs(val) {
      this.isArgsValid = utils.isJson(val) && Array.isArray(JSON.parse(val));
      if (this.isArgsValid) {
        this.$emit('update:args', JSON.parse(val));
      }
    },
    kwargs(newValue) {
      if (
        utils.isJson(this.editableKwargs) &&
        JSON.stringify(JSON.parse(this.editableKwargs)) !== JSON.stringify(newValue)
      ) {
        this.editableKwargs = JSON.stringify(newValue);
      }
    },
    editableKwargs(val) {
      this.isKwargsValid = utils.isJson(val) && !Array.isArray(JSON.parse(val));
      if (this.isKwargsValid) {
        this.$emit('update:kwargs', JSON.parse(val));
      }
    }
  },
  created() {
    this.editableArgs = JSON.stringify(this.args);
    this.editableKwargs = JSON.stringify(this.kwargs);
  }
};
</script>
