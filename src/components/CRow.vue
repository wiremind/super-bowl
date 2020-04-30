<template>
  <tr class="border-b border-gray-200 hover:bg-blue-100">
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ message_id }}</pre>
    </td>
    <td class="border px-4 py-2 font-semibold text-sm " :style="{ color: getColorState() }">
      <pre class="text-xs whitespace-normal">{{ name }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ args }}</pre>
    </td>
    <td class="border px-4 py-2">
      <pre class="text-xs whitespace-normal">{{ kwargs }}</pre>
    </td>
    <td class="hidden sm:block">
      <div class="inline-flex items-center ">
        <button
          v-if="name === 'Pending' && canCancel"
          @click="cancelMessage"
          class="bg-gray-200 hover:bg-gray-300 text-black font-bold pt-1 mt-2 font-mono py-2 px-4 rounded focus:outline-none text-sm"
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

export default {
  name: 'CRow',
  props: {
    message_id: String,
    name: String,
    args: Array,
    kwargs: Object
  },
  data() {
    return {
      canCancel: true,
      onError: false,
      isCanceling: false,
      error: '',
      txtBtnCancel: 'Cancel'
    };
  },
  methods: {
    getColorState() {
      let state = this.name.toLowerCase();
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
        .cancelMessage(this.message_id)
        .then(() => {
          setTimeout(() => {
            this.isCanceling = false;
            this.name = 'Canceled';
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
