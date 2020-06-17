<template>
  <tr
    class="border-b text-xs border-gray-200 hover:bg-blue-100 cursor-pointer "
    @click="onToggle(messageId)"
  >
    <td class="border px-4 py-2">
      <div class="flex">
        <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
        <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
        <pre class="text-xs ml-2 whitespace-normal">{{ actorName }}</pre>
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ priority }}
    </td>
    <td class="border px-4 py-2 font-semibold" :style="{ color: getColorState() }">
      {{ nameState }}
    </td>
    <td class="border px-4 py-2">
      <div class="whitespace-normal" v-if="nameState !== 'Success' || nameState !== 'Failure'">
        {{ startedDatetime | datetime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ waitTime }}
    </td>
    <td class="border px-4 py-2">
      <div v-if="nameState == 'Success' || nameState === 'Failure'" class="whitespace-normal">
        {{ executionTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div v-if="nameState == 'Started'">
        {{ remainingTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ progress | percentage }}</pre>
    </td>
    <td class=" border  px-4 py-2">
      <div class="inline-flex items-center ">
        <button
          v-if="name === 'Pending' && canCancel"
          @click.stop="cancelMessage"
          type="button"
          class="bg-red-500 hover:bg-red-700 text-white py-1 px-2 rounded focus:outline-none focus:shadow-outline"
        >
          {{ txtBtnCancel }}
        </button>
        <p class="pl-1 text-red-500" v-if="onError">{{ error }}</p>
      </div>
    </td>
  </tr>
</template>

<script>
import { format } from 'date-fns';
import utils from '@/utils';

export default {
  name: 'CMessageRow',
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
      isOpened: false,
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
      const diff = utils.getDistance(this.startedDatetime, this.enqueuedDatetime);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    remainingTime() {
      if (this.endDatetime || !this.startedDatetime || this.nameState != 'Started') {
        return null;
      }
      const factor = (1 - this.progress) / this.progress;
      const diff = utils.getDistance(new Date(), this.startedDatetime, factor);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    executionTime() {
      if (!this.startedDatetime) {
        return null;
      }
      const diff = utils.getDistance(
        this.startedDatetime,
        this.endDatetime ? this.endDatetime : new Date()
      );
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
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
      this.isOpened = !this.isOpened;
      this.$emit('onToggle', id);
    }
  }
};
</script>
