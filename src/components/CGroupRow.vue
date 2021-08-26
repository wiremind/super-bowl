<template>
  <tr class="border-b text-xs border-gray-200 hover:bg-blue-100 cursor-pointer" @click="onToggle">
    <td class="border px-4 py-2">
      <div class="flex">
        <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
        <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
        <pre
          class="text-xs ml-2 whitespace-normal"
        ><b>Group ({{message.messages.length}}) : </b>{{ actorNames }}</pre>
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ priority }}
    </td>
    <td class="border px-4 py-2 font-semibold" :style="{ color: getColorState() }">
      {{ status }}
    </td>
    <td class="border px-4 py-2">
      <div class="whitespace-normal">
        {{ message.messages[0].startedDatetime | datetime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ waitTime }}
    </td>
    <td class="border px-4 py-2">
      <div v-if="status === 'Success' || status === 'Failure'" class="whitespace-normal">
        {{ executionTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div v-if="status === 'Started'" class="overflow-auto">
        {{ remainingTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ progress | percentage }}</pre>
    </td>
    <td class="border px-4 py-2">
      <div class="inline-flex items-center">
        <p class="pl-1 absolute bg-white mb-8" v-if="true">{{ response }}</p>
      </div>
    </td>
  </tr>
</template>

<script>
import utils from '@/utils';

export default {
  name: 'CGroupRow',
  props: {
    message: Object
  },
  data: function () {
    return {
      isOpened: false,
      response: null
    };
  },
  computed: {
    status() {
      const statusArray = this.message.messages.map(el => el.status);
      if (statusArray.includes('Failure')) {
        return 'Failure';
      }
      if (statusArray.includes('Skipped')) {
        return 'Skipped';
      }
      if (statusArray.includes('Canceled')) {
        return 'Canceled';
      }
      if (statusArray.includes('Started')) {
        return 'Started';
      }
      if (statusArray.every(el => el === 'Success')) {
        return 'Success';
      }
      if (statusArray.every(el => el === 'Pending')) {
        return 'Pending';
      }
      return 'Started';
    },
    priority() {
      const prioArray = [];
      this.message.messages.forEach(function (element) {
        if (!prioArray.includes(element.priority)) {
          prioArray.push(element.priority);
        }
      });
      prioArray.sort();
      let prioString = '';
      prioArray.forEach(element => (prioString += element + ', '));
      prioString = prioString.slice(0, -2);
      return prioString;
    },
    remainingTime() {
      if (
        this.message.messages.every(element => element.endDatetime) ||
        !this.message.messages.every(element => element.progress && element.startedDatetime) ||
        this.status !== 'Started'
      ) {
        return null;
      }
      const diff = this.message.messages.map(element =>
        element.endDatetime
          ? 0
          : ((1 - element.progress) / element.progress) *
            (utils.dateToUTC(new Date()) - utils.dateToUTC(element.startedDatetime))
      );
      const maxDiff = utils.formatMillis(Math.max(diff));
      return `${maxDiff.hours}:${maxDiff.minutes}:${maxDiff.seconds}`;
    },
    progress() {
      return Math.min(this.message.messages.map(el => el.progress));
    },
    actorNames: function () {
      const actorCount = {};
      this.message.messages.forEach(message => {
        if (actorCount[message.actorName]) {
          actorCount[message.actorName] += 1;
        } else {
          actorCount[message.actorName] = 1;
        }
      });
      let actorString = '';
      Object.entries(actorCount).forEach(
        actor => (actorString += actor[0] + (actor[1] > 1 ? '*' + actor[1] + ' ' : ' '))
      );
      return actorString;
    },
    executionTime() {
      if (!this.message.messages[0].startedDatetime) {
        return null;
      }
      const diff = utils.formatMillis(
        utils.dateToUTC(this.message.messages[0].startedDatetime) -
          utils.dateToUTC(
            this.message.messages[this.message.messages.length - 1].endDatetime
              ? this.message.messages[this.message.messages.length - 1].endDatetime
              : new Date()
          )
      );
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    waitTime() {
      let index = 0;
      let wait_time = 0;
      while (
        index < this.message.messages.length &&
        this.message.messages[index].startedDatetime &&
        this.message.messages[index].enqueuedDatetime
      ) {
        wait_time +=
          this.message.messages[index].startedDatetime -
          this.message.messages[index].enqueuedDatetime;
        index += 1;
      }
      wait_time = utils.formatMillis(wait_time);
      return `${wait_time.hours}:${wait_time.minutes}:${wait_time.seconds}`;
    }
  },
  methods: {
    onToggle() {
      this.isOpened = !this.isOpened;
      this.$emit('toggle', this.message.messages[0].messageId);
    },
    getColorState() {
      const colors = {
        Success: 'green',
        Canceled: 'red',
        Failure: 'red'
      };
      return colors[this.status] || 'black';
    }
  }
};
</script>
