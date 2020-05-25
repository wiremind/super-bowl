<template>
  <tr class="border-b border-gray-200 hover:bg-blue-100" @click="onToggle(messageId)">
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ priority }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ messageId }}</pre>
    </td>
    <td class="border px-4 py-2 font-semibold text-sm " :style="{ color: getColorState() }">
      <pre class="text-xs whitespace-normal">{{ nameState }}</pre>
    </td>
    <td class="border px-4 py-2 text-sm ">
      <pre class="text-xs whitespace-normal">{{ actorName }}</pre>
    </td>

    <td class="border px-4 py-2">
      <pre
        class="text-xs whitespace-normal"
        v-if="nameState !== 'Success' || nameState !== 'Failure'"
        >{{ startedDatetime | datetime }}</pre
      >
    </td>

    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ waitTime }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ progress | percentage }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre
        v-if="nameState == 'Success' || nameState === 'Failure'"
        class="text-xs  whitespace-normal"
        >{{ executionTime }}</pre
      >
    </td>
    <td class=" border  px-4 py-2">
      <div class="inline-flex items-center ">
        <button
          v-if="name === 'Pending' && canCancel"
          @click.stop="cancelMessage"
          class="bg-gray-200 hover:bg-gray-300 px-2 py-1 text-black font-bold font-mono rounded focus:outline-none text-xm"
          type="button"
        >
          {{ txtBtnCancel }}
        </button>
        <p class="text-xs pl-1 text-red-500" v-if="onError">{{ error }}</p>
      </div>
    </td>
  </tr>
</template>

<script>
import { format, formatDistance } from 'date-fns';
export default {
  name: 'CRow',
  props: {
    priority: Number,
    messageId: String,
    name: String,
    actorName: String,
    args: Array,
    progress: Number,
    kwargs: Object,
    enqueuedDatetime: Date,
    startedDatetime: Date,
    endDatetime: Date
  },
  data() {
    return {
      canCancel: true,
      onError: false,
      error: '',
      nameState: this.name,
      txtBtnCancel: 'Cancel'
    };
  },

  computed: {
    waitTime() {
      if (!this.startedDatetime || !this.enqueuedDatetime) {
        return null;
      }
      return formatDistance(this.enqueuedDatetime, this.startedDatetime);
    },

    executionTime() {
      if (!this.startedDatetime) {
        return null;
      }
      const endDatetime = this.endDatetime ? this.enqueuedDatetime : new Date();
      let expectedTime = null;
      if (this.progress && this.progress > 0) {
        const factor = (1 - this.progress) / this.progress;
        expectedTime = formatDistance(new Date() * factor, this.startedDatetime * factor);
      }
      const executionTime = formatDistance(this.startedDatetime, endDatetime);
      return executionTime + (expectedTime ? '(' + expectedTime + ' remaining)' : '');
    }
  },

  filters: {
    datetime(value) {
      return value ? format(value, 'y-MM-dd HH:mm') : '';
    },
    percentage(value) {
      return value ? Math.round(value * 100) + '%' : '';
    }
  },

  methods: {
    getColorState() {
      const state = this.nameState.toLowerCase();
      const colors = {
        success: 'green',
        canceled: 'red',
        failure: 'red'
      };
      return colors[state] || 'black';
    },
    cancelMessage() {
      this.canCancel = false;
      this.$store.dispatch('cancelMessage', this.messageId).then(() => {
        this.nameState = 'Canceled';
      });
    },
    onToggle(id) {
      this.$emit('onToggle', id);
    }
  }
};
</script>
