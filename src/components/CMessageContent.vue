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
      ><span class="font-bold inline-block">Args</span>:{{args | json}}</pre>
      <pre
        class="text-xs bg-white"
      ><span class="font-bold inline-block">Kwargs</span>:{{kwargs | json}}</pre>
      <pre
        class="text-xs bg-white"
      ><span class="font-bold inline-block">Options</span>:{{options | json}}</pre>
    </td>
    <td class="border text-xs px-4 py-2" :colspan="3">
      <p class="text-xs bg-white" v-if="result">
        <span class="font-bold inline-block">Result</span>
        :{{ result }}
      </p>
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
      options: String,
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
      if (this.stateName === 'Success') {
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
      this.options = res.options;
    });
    this.updateResult();
  }
};
</script>
