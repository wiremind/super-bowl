<template>
  <tr
    class="border-b text-xs border-gray-200 hover:bg-blue-100 cursor-pointer"
    @click.exact="onToggle"
  >
    <td class="border px-4 py-2" @click.alt="searchActor">
      <div class="flex">
        <img v-if="isOpened" src="@/assets/img/expand_more.svg" width="20rem" />
        <img v-else src="@/assets/img/expand_less.svg" width="20rem" />
        <pre class="text-xs ml-2 whitespace-normal">{{ message.actorName }}</pre>
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ message.priority }}
    </td>
    <td
      class="border px-4 py-2 font-semibold"
      :style="{ color: getColorState() }"
      @click.alt="searchState"
    >
      {{ message.status }}
    </td>
    <td class="border px-4 py-2">
      <div
        class="whitespace-normal"
        v-if="message.status !== 'Success' || message.status !== 'Failure'"
      >
        {{ message.startedDatetime | datetime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      {{ waitTime }}
    </td>
    <td class="border px-4 py-2">
      <div
        v-if="message.status === 'Success' || message.status === 'Failure'"
        class="whitespace-normal"
      >
        {{ executionTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <div v-if="message.status === 'Started'">
        {{ remainingTime }}
      </div>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal" v-if="message.status != 'Success'">{{
        message.progress | percentage
      }}</pre>
    </td>
    <td class="border px-4 py-2">
      <div class="inline-flex items-center">
        <button
          v-if="message.status === 'Pending' && canCancel"
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
    message: Object
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
      if (!this.message.startedDatetime || !this.message.enqueuedDatetime) {
        return null;
      }
      const diff = utils.formatMillis(this.message.startedDatetime - this.message.enqueuedDatetime);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    remainingTime() {
      if (
        this.message.endDatetime ||
        !this.message.progress ||
        !this.message.startedDatetime ||
        this.message.status !== 'Started'
      ) {
        return null;
      }
      const factor = (1 - this.message.progress) / this.message.progress;
      const diff = utils.formatMillis((new Date() - this.message.startedDatetime) * factor);
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    executionTime() {
      if (!this.message.startedDatetime) {
        return null;
      }
      const diff = utils.formatMillis(
        this.message.startedDatetime - this.message.endDatetime
          ? this.message.endDatetime
          : new Date()
      );
      return `${diff.hours}:${diff.minutes}:${diff.seconds}`;
    },
    canRequeue() {
      return ['Success', 'Failure', 'Canceled', 'Skipped'].includes(this.message.status);
    }
  },

  methods: {
    getColorState() {
      const colors = {
        Success: 'green',
        Canceled: 'red',
        Failure: 'red'
      };
      return colors[this.message.status] || 'black';
    },
    showResponse(response) {
      this.response = response;
      setTimeout(() => {
        this.response = null;
      }, 3000);
    },
    cancelMessage() {
      this.$store
        .dispatch('cancelMessage', this.message.messageId)
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
        .dispatch('requeueMessage', this.message.messageId)
        .then(() => this.showResponse('Message Enqueued!'))
        .catch(error => {
          this.showResponse('Error: ' + error.response.data.error);
        });
    },
    onToggle() {
      this.isOpened = !this.isOpened;
      this.$emit('toggle', this.message.messageId);
    },
    searchActor() {
      this.$store.dispatch('updateSelectedActors', [this.message.actorName]);
    },
    searchState() {
      this.$store.dispatch('updateSelectedStatuses', [this.message.status]);
    }
  }
};
</script>
