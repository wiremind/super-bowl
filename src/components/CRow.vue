<template>
  <tr class="border-b border-gray-200 hover:bg-blue-100">
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ priority }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ messageId }}</pre>
    </td>
    <td class="border px-4 py-2 font-semibold text-sm " :style="{ color: getColorState() }">
      <pre class="text-xs whitespace-normal">{{ nameState }}</pre>
    </td>
    <td class="border px-4 py-2 font-semibold text-sm ">
      <pre class="text-xs whitespace-normal">{{ actorName }}</pre>
    </td>

    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ args }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ kwargs }}</pre>
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
      <pre
        v-if="nameState == 'Success' || nameState === 'Failure'"
        class="text-xs  whitespace-normal"
        >{{ executionTime }}</pre
      >
    </td>
    <td class="hidden sm:block">
      <div class="inline-flex items-center ">
        <button
          v-if="name === 'Pending' && canCancel"
          @click="cancelMessage"
          class="bg-gray-200 hover:bg-gray-300 text-black font-bold pt-1 mt-1 font-mono py-1 px-2 rounded focus:outline-none text-sm"
          type="button"
        >
          {{ txtBtnCancel }}
        </button>
        <p class="text-xs" v-if="isCanceling">Canceling...</p>
        <p class="text-xs pl-1 text-red-500" v-if="onError">{{ error }}</p>
      </div>
    </td>
  </tr>
</template>

<script>
import api from '@/api';
import { format, formatDistance } from 'date-fns';
export default {
  name: 'CRow',
  props: {
    priority: Number,
    messageId: String,
    name: String,
    actorName: String,
    args: Array,
    kwargs: Object,
    enqueuedDatetime: Date,
    startedDatetime: Date,
    endDatetime: Date
  },
  data() {
    return {
      canCancel: true,
      onError: false,
      isCanceling: false,
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
      return formatDistance(this.startedDatetime, endDatetime);
    }
  },

  filters: {
    datetime(value) {
      if (value) {
        return format(value, 'y-MM-dd HH:mm');
      }
      return '';
    }
  },

  methods: {
    getColorState() {
      const state = this.nameState.toLowerCase();
      let color = 'black';
      if (state === 'success') {
        color = 'green';
      } else if (state === 'canceled' || state === 'failure') {
        color = 'red';
      }
      return color;
    },
    cancelMessage() {
      this.canCancel = false;
      this.isCanceling = true;
      api
        .cancelMessage(this.messageId)
        .then(() => {
          setTimeout(() => {
            this.isCanceling = false;
            this.nameState = 'Canceled';
          }, 500);
        })
        .catch(() => {
          this.onError = true;
          this.isCanceling = false;
          this.canCancel = true;
          this.error = 'failure';
        });
    }
  }
};
</script>
