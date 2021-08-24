<template>
  <tr class="border-b text-xs border-gray-200 hover:bg-blue-100 cursor-pointer" @click="onToggle">
    <td class="border px-4 py-2 flex">
      <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
      <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
      <pre
        class="text-xs ml-2 whitespace-normal"
      ><b>Group ({{message.messages.length}})</b>{{ actorNames }}</pre>
    </td>
    <td class="border px-4 py-2">
      {{ message.messages[currentActorIndex].priority }}
    </td>
    <td class="border px-4 py-2 font-semibold" :style="{ color: getColorState() }">
      {{ message.messages[currentActorIndex].status }}
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
      <div
        v-if="
          message.messages[message.messages.length - 1].status === 'Success' ||
          message.messages[message.messages.length - 1].status === 'Failure'
        "
        class="whitespace-normal"
      >
        {{ executionTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div v-if="message.messages[currentActorIndex].status === 'Started'" class="overflow-auto">
        {{ remainingTime }}
      </div>
    </td>
    <td class="border px-4 py-2 flex">
      <pre class="text-xs whitespace-normal">{{
        message.messages[currentActorIndex].progress | percentage
      }}</pre>
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
    remainingTime() {
      if (
        this.message.messages[this.currentActorIndex].endDatetime ||
        !this.message.messages[this.currentActorIndex].progress ||
        !this.message.messages[this.currentActorIndex].startedDatetime ||
        this.message.messages[this.currentActorIndex].status !== 'Started'
      ) {
        return null;
      }
      const factor =
        (1 - this.message.messages[this.currentActorIndex].progress) /
        this.message.messages[this.currentActorIndex].progress;
      const diff = utils.formatMillis(
        (utils.dateToUTC(new Date()) -
          utils.dateToUTC(this.message.messages[this.currentActorIndex].startedDatetime)) *
          factor
      );
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    actorNames: function () {
      let actorString = '';
      this.message.messages.forEach(message => (actorString += ' ' + message.actorName));
      return actorString;
    },
    currentActorIndex: function () {
      const index = Math.max(this.message.messages.findIndex(el => el.status === undefined) - 1, 0);
      if (index === -2) {
        return this.message.messages.length - 1;
      } else {
        return index;
      }
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
      return colors[this.message.messages[this.currentActorIndex].status] || 'black';
    }
  }
};
</script>
