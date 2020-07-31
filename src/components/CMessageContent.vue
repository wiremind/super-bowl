<template>
  <tr>
    <td class="border text-xs px-4 py-2" :colspan="colspan - 3">
      <div class="text-xs">
        <div class="font-bold inline-block">Message Id</div>
        :{{ messageId }}
      </div>
      <div class="text-xs">
        <div class="font-bold inline-block">Queue Name</div>
        :{{ queueName }}
      </div>
      <pre
        class="text-xs bg-white"
      ><div class="font-bold inline-block">Args</div>:{{args | json}}</pre>
      <pre
        class="text-xs bg-white"
      ><div class="font-bold inline-block">Kwargs</div>:{{kwargs | json}}</pre>
    </td>
    <td class="border text-xs px-4 py-2" :colspan="3">
      <pre class="text-xs bg-white" v-if="result">
        <div class="font-bold inline-block">Result</div>:{{result}}</pre>
    </td>
  </tr>
</template>

<script>
import utils from '@/utils';
import api from '@/api';
export default {
  name: 'CMessageContent',
  props: {
    messageId: String,
    actorName: String,
    colspan: Number,
    stateName: String
  },
  data() {
    return {
      args: String,
      kwargs: String,
      result: null
    };
  },
  computed: {
    queueName() {
      const actors = this.$store.getters.actorsByName;
      return actors[this.actorName] ? actors[this.actorName].queueName : '';
    }
  },
  filters: {
    json(str) {
      return str && utils.isJson(str) ? JSON.stringify(utils.toJson(str), undefined, 2) : '';
    }
  },
  methods: {
    updateResult() {
      if (this.stateName == 'Success') {
        api.getResult(this.messageId).then(res => {
          this.result = res;
        });
      }
    }
  },
  watch: {
    stateName() {
      this.updateResult();
    }
  },
  created() {
    api.getArgsKwargs(this.messageId).then(res => {
      this.args = res.args;
      this.kwargs = res.kwargs;
    });
    this.updateResult();
  }
};
</script>
