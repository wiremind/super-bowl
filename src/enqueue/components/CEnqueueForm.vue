<template>
  <div class="container mx-auto py-10 w-3/4">
    <div class="errors-box">
      <div v-if="errorsRequest.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="(error, index) in errorsRequest" :key="index">{{ error }}</li>
        </ul>
      </div>
    </div>

    <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2">
      <div class="flex flex-wrap -mx-3 mb-6">
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label for="field_actor_name">Actor Name</label>
          <div class="relative">
            <select
              class="arg-input mb-0 h-12"
              id="field_actor_name"
              v-model="selectedActor"
              @change="selectActor()"
              :class="{ 'border-red-500': emptyName }"
            >
              <option v-for="(actor, index) in actors" :key="index" :value="actor">
                {{ actor.name }}
              </option>
            </select>
            <small v-if="emptyName" class="text-xs text-red-500">Actor Name required</small>
          </div>
        </div>
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label for="grid-last-name">delay(ms)</label>
          <div class="relative">
            <input
              class="arg-input mb-0 h-12"
              id="grid-last-name"
              v-model="message.delay"
              type="number"
              min="0"
            />
          </div>
        </div>
      </div>
      <hr class="mt-3" />
      <label class="text-base my-5">Arguments</label>
      <div>
        <div v-for="arg in selectedActor.args" :key="arg.name">
          <label class="normal-case">{{ arg.name }} : {{ arg.type }}</label>
          <c-actor-argument
            :name="arg.name"
            :argType="arg.type"
            v-model="message.kwargs[arg.name]"
            @validityUpdate="$set(validity, arg.name, $event)"
          />
        </div>
        <hr class="my-5" />
        <c-options-input
          v-model="message.options"
          :options="options"
          @validityUpdate="optionsValidity = $event"
        />
        <div class="w-full flex justify-end pt-10 space-x-3">
          <button class="btn btn-success" type="button" @click="resetForm">Clear</button>
          <button
            :class="{
              'hover:bg-blue-700': isFormValid,
              'opacity-50': !isFormValid,
              'cursor-not-allowed': !isFormValid
            }"
            class="btn"
            type="button"
            :disabled="!isFormValid"
            id="enqueue_button"
            @click="submit"
          >
            Enqueue
          </button>
        </div>
        <small v-if="response" class="text-xs float-right text-green-500 mt-3">
          {{ response }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import CActorArgument from '@/enqueue/components/CActorArgument';
import COptionsInput from '@/enqueue/components/COptionsInput';

const initialState = () => {
  return {
    response: null,
    errorsRequest: [],
    validity: {},
    emptyName: false,
    message: {
      actorName: '',
      delay: 0,
      args: [],
      kwargs: {},
      options: {}
    },
    selectedActor: {},
    selectedOption: '',
    optionValue: '',
    optionsValidity: true
  };
};

export default {
  name: 'CEnqueueForm',
  components: { COptionsInput, CActorArgument },
  data: initialState,
  computed: {
    ...mapState({
      actors: state => state.actors,
      options: state => state.enqueue.options
    }),
    isFormValid: function () {
      return (
        !this.emptyName &&
        Object.entries(this.validity).reduce((acc, curVal) => acc && curVal[1], true) &&
        this.optionsValidity
      );
    }
  },
  methods: {
    resetForm() {
      Object.assign(this.$data, initialState());
    },
    selectActor() {
      this.message.kwargs = {};
      this.message.actorName = this.selectedActor.name;
      this.validity = [];
      this.checkForm();
    },
    checkForm() {
      this.emptyName = this.message.actorName.length === 0;
      return !this.emptyName;
    },
    submit() {
      if (!this.checkForm()) {
        return true;
      }
      const payload = { ...this.message };
      this.errorsRequest = [];
      this.$store
        .dispatch('enqueueMessage', payload)
        .then(() => {
          this.response = 'Message Sent!';
          setTimeout(() => {
            this.response = null;
          }, 1000);
        })
        .catch(error => {
          this.errorsRequest.push(error.response.data.error);
        });
    }
  },
  created() {
    this.$store.dispatch('getActors');
    this.$store.dispatch('getOptions');
  }
};
</script>
