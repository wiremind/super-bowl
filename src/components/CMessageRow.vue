<template>
  <tr
    class="border-b text-xs border-gray-200 hover:bg-blue-100 cursor-pointer"
    @click.exact="onToggle"
  >
    <td class="border px-4 py-2" @click.alt="searchActor">
      <div class="flex">
        <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
        <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
        <pre class="text-xs ml-2 whitespace-normal">{{ actorName }}</pre>
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ priority }}
    </td>
    <td
      class="border px-4 py-2 font-semibold"
      :style="{ color: getColorState() }"
      @click.alt="searchState"
    >
      {{ stateName }}
    </td>
    <td class="border px-4 py-2">
      <div class="whitespace-normal" v-if="stateName !== 'Success' || stateName !== 'Failure'">
        {{ startedDatetime | datetime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ waitTime }}
    </td>
    <td class="border px-4 py-2">
      <div v-if="stateName === 'Success' || stateName === 'Failure'" class="whitespace-normal">
        {{ executionTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div v-if="stateName === 'Started'">
        {{ remainingTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal" v-if="stateName !== 'Success'">{{
        progress | percentage
      }}</pre>
    </td>
    <td class="border px-4 py-2">
      <div class="inline-flex items-center">
        <button
          v-if="stateName === 'Pending' && canCancel"
          @click.stop="cancelMessage"
          type="button"
          class="btn btn-xs btn-danger"
        >
          Cancel
        </button>
        <button v-if="canRequeue" @click.stop="requeueMessage" type="button" class="btn btn-xs">
          Requeue
        </button>
        <p class="pl-1 absolute bg-white mb-8" v-if="true">{{ response }}</p>
      </div>
    </td>
  </tr>
</template>

<script>
import utils from '@/utils';

export default {
  name: 'CMessageRow',
  props: {
    priority: Number,
    messageId: String,
    stateName: String,
    actorName: String,
    progress: Number,
    enqueuedDatetime: Date,
    startedDatetime: Date,
    endDatetime: Date
  },
  data() {
    return {
      canCancel: true,
      isOpened: false,
      response: null
    };
  },

  computed: {
    waitTime() {
      if (!this.startedDatetime || !this.enqueuedDatetime) {
        return null;
      }
      const diff = utils.formatMillis(this.startedDatetime - this.enqueuedDatetime);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    remainingTime() {
      if (
        this.endDatetime ||
        !this.progress ||
        !this.startedDatetime ||
        this.stateName !== 'Started'
      ) {
        return null;
      }
      const factor = (1 - this.progress) / this.progress;
      const diff = utils.formatMillis(
        (utils.dateToUTC(new Date()) - utils.dateToUTC(this.startedDatetime)) * factor
      );
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    executionTime() {
      if (!this.startedDatetime) {
        return null;
      }
      const diff = utils.formatMillis(
        utils.dateToUTC(this.startedDatetime) -
          utils.dateToUTC(this.endDatetime ? this.endDatetime : new Date())
      );
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    canRequeue() {
      return ['Success', 'Failure', 'Canceled', 'Skipped'].includes(this.stateName);
    }
  },

  methods: {
    getColorState() {
      const colors = {
        Success: 'green',
        Canceled: 'red',
        Failure: 'red'
      };
      return colors[this.stateName] || 'black';
    },
    showResponse(response) {
      this.response = response;
      setTimeout(() => {
        this.response = null;
      }, 3000);
    },
    cancelMessage() {
      this.$store
        .dispatch('cancelMessage', this.messageId)
        .then(() => {
          this.canCancel = false;
          this.showResponse('Message Canceled!');
        })
        .catch(error => {
          this.showResponse('Error: ' + error.response.data.error);
        });
    },
    requeueMessage() {
      this.$store
        .dispatch('requeueMessage', this.messageId)
        .then(() => this.showResponse('Message Enqueued!'))
        .catch(error => {
          this.showResponse('Error: ' + error.response.data.error);
        });
    },
    onToggle() {
      this.isOpened = !this.isOpened;
      this.$emit('onToggle', this.messageId);
    },
    searchActor() {
      this.$store.dispatch('updateSelectedActors', [this.actorName]);
    },
    searchState() {
      this.$store.dispatch('updateSelectedStatuses', [this.stateName]);
    }
  }
};
</script>
