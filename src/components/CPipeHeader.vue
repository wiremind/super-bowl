<template>
  <tr @click="onToggle" class="text-xs hover:bg-blue-100">
    <td class="border px-4 py-2">
      <div class="flex">
        <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
        <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
        <pre class="text-xs ml-2 whitespace-normal">{{ groupId }}</pre>
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ uniqueActors }}
    </td>
    <td class="border px-4 py-2">
      {{ messageCount }}
    </td>
    <td class="border px-4 py-2">
      {{ enqueuedDatetime | datetime }}
    </td>
    <td class="border px-4 py-2">
      {{ progress | percentage }}
    </td>
    <td class="border px-4 py-2">
      {{ remainingTime }}
    </td>
  </tr>
</template>
<script>
import utils from '@/utils';

export default {
  name: 'CPipeHeader',
  props: {
    messages: Array,
    groupId: String
  },
  data() {
    return {
      isOpened: false
    };
  },
  computed: {
    messageCount() {
      return this.messages.length;
    },
    enqueuedDatetime() {
      return this.messages[0].enqueuedDatetime;
    },
    uniqueActors() {
      return [...new Set(this.messages.map(x => x.actorName))].sort().join(', ');
    },
    remainingTime() {
      if (!this.progress) {
        return '';
      }
      const factor = (1 - this.progress) / this.progress;
      const diff = utils.formatMillis((new Date() - this.enqueuedDatetime) * factor);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    progress() {
      const length = this.messages.length || 1;
      return this.messages.reduce((prev, next) => prev + next.progress || 0, 0) / length;
    }
  },
  methods: {
    onToggle() {
      this.isOpened = !this.isOpened;
      this.$emit('onToggle', this.groupId);
    }
  }
};
</script>
