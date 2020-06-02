<template>
  <tr class="border-b border-gray-200 hover:bg-blue-100">
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 "> {{ actorName }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 "> {{ dailyTime }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre v-if="enabled" class="text-xs whitespace-normal ml-2 "> {{ enabled }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 ">        {{ interval | formatSeconds }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 ">        {{ isoWeekday | formatWeekDay }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 "> {{ args }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 "> {{ kwargs }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 ">        {{ lastQueued | formatDistance }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal ml-2 "> {{ tz }}</pre>
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
    tz: String
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
    }
  }
};
</script>
