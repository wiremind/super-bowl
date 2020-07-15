<template>
  <tr class="border-b text-xs border-gray-200 hover:bg-blue-100">
    <td class="border px-4 py-2">
      {{ actorName }}
    </td>
    <td class="border px-4 py-2">
      {{ dailyTime }}
    </td>
    <td class="border px-4 py-2">
      {{ enabled }}
    </td>
    <td class="border px-4 py-2">
      {{ interval | formatSeconds }}
    </td>
    <td class="border px-4 py-2">
      {{ isoWeekday | formatWeekDay }}
    </td>
    <td class="border px-4 py-2">
      {{ args }}
    </td>
    <td class="border px-4 py-2">
      {{ kwargs }}
    </td>
    <td class="border px-4 py-2">
      {{ lastQueued | formatDistance }}
    </td>
    <td class="border px-4 py-2">
      {{ tz }}
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
    tz: String
  },
  filters: {
    formatDistance(time) {
      return time ? formatDistance(utils.dateToUTC(new Date()), time) + ' ago' : '';
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
    }
  }
};
</script>
