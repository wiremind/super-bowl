<template>
  <div class="container mx-auto py-10 w-3/4">
    <div class="errors-box">
      <div v-if="errorsRequest.length">
        <b>Please correct the following error(s):</b>
        <ul>
          <li v-for="(error, index) in errorsRequest" :key="index">{{ error }}</li>
        </ul>
      </div>
      <small v-if="response" class="text-xs text-green-500">{{ response }}</small>
    </div>

    <form
      class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 flex flex-col my-2"
      @submit.prevent="submit"
    >
      <div class="flex flex-wrap -mx-3 mb-6">
        <div class="w-full md:w-1/2 px-3 mb-6 md:mb-0">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            for="field_actor_name"
          >
            Actor Name
          </label>
          <div class="relative">
            <select
              class="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
              id="field_actor_name"
              v-model="message.actorName"
              @change="selectActor()"
              :class="{ 'border-red-500': emptyName }"
            >
              <option v-for="(value, name) in actors" :key="name" :value="name">
                {{ name }}
              </option>
            </select>
            <small v-if="emptyName" class="text-xs text-red-500">Actor Name required</small>
          </div>
        </div>
        <div class="w-full md:w-1/2 px-3">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            for="grid-last-name"
          >
            delay(min)
          </label>
          <input
            class="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
            id="grid-last-name"
            v-model="message.delay"
            type="number"
            min="0"
          />
        </div>
      </div>
      <div class="flex flex-wrap -mx-3 mb-2">
        <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            for="field_args"
          >
            Args
          </label>
          <textarea
            class="appearance-none  h-40 block w-full bg-gray-200 focus:bg-white text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
            id="field_args"
            placeholder='[1, ["a", 7], "str"]'
            @blur="checkForm"
            v-model="message.args"
            :class="{ 'border-red-500': invalidArgs }"
          ></textarea>
          <div class="errors-box">
            <div v-if="errorsRequest.length">
              <b>Please correct the following error(s):</b>
              <ul>
                <li v-for="(error, index) in errorsRequest" :key="index">{{ error }}</li>
              </ul>
            </div>
            <small v-if="response" class="text-xs text-green-500">{{ response }}</small>
          </div>
          <small v-if="invalidArgs" class="text-xs text-red-500">Invalid Args</small>
        </div>

        <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            for="field_kwargs"
          >
            Kwargs
          </label>
          <textarea
            :class="{ 'border-red-500': invalidKwargs }"
            class="appearance-none  h-40 block w-full bg-gray-200 focus:bg-white text-gray-700 border rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
            id="field_kwargs"
            v-model="message.kwargs"
            @blur="checkForm"
            placeholder='{"nums":[1,2,5]}'
          ></textarea>
          <small v-if="invalidKwargs" class="text-xs text-red-500">Invalid Kwargs</small>
        </div>

        <div class="w-full md:w-1/3 px-3 mb-6 md:mb-0">
          <label
            class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2"
            for="field_options"
          >
            Options
          </label>
          <textarea
            :class="{ 'border-red-500': invalidOptions }"
            class="appearance-none  h-40 block w-full bg-gray-200 focus:bg-white text-gray-700 border  rounded py-3 px-4 leading-tight focus:outline-none focus:border-gray-500"
            id="field_options"
            v-model="message.options"
            @blur="checkForm"
            placeholder='{"isOn":true}'
          ></textarea>
          <small v-if="invalidOptions" class="text-xs text-red-500">Invalid Options</small>
        </div>

        <div class="w-full flex justify-end">
          <button
            class="bg-green-500 hover:bg-blue-700 text-white font-bold py-2 mt-8 ml-4 px-4 mr-3 rounded"
            type="button"
            @click="resetForm"
          >
            Clear
          </button>
          <button
            :class="{
              'hover:bg-blue-700': isFormValid,
              'opacity-50': !isFormValid,
              'cursor-not-allowed': !isFormValid
            }"
            class="bg-blue-500 text-white font-bold py-2 mt-8 px-4 rounded"
            type="submit"
            :disabled="!isFormValid"
          >
            Enqueue
          </button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import utils from '@/utils';

const initialState = () => {
  return {
    response: null,
    errorsRequest: [],
    emptyName: false,
    invalidArgs: false,
    invalidKwargs: false,
    invalidOptions: false,
    isFormValid: true,
    message: {
      actorName: '',
      delay: 0,
      args: '',
      kwargs: '',
      options: ''
    }
  };
};

export default {
  name: 'CEnqueue',
  data: initialState,
  computed: {
    ...mapState(['actors', 'isLoading'])
  },

  methods: {
    resetForm() {
      Object.assign(this.$data, initialState());
    },
    selectActor() {
      this.checkForm();
    },
    checkForm() {
      this.emptyName = this.message.actorName.length === 0;
      this.invalidArgs = this.message.args.trim() ? !utils.isJson(this.message.args) : false;
      this.invalidKwargs = this.message.kwargs.trim() ? !utils.isJson(this.message.kwargs) : false;
      this.invalidOptions = this.message.options.trim()
        ? !utils.isJson(this.message.options)
        : false;
      this.isFormValid =
        !this.invalidArgs && !this.invalidKwargs && !this.invalidOptions && !this.emptyName;
      return this.isFormValid;
    },
    submit() {
      if (!this.checkForm()) {
        return true;
      }
      const payload = { ...this.message };
      this.errorsRequest = [];
      if (payload.args.trim()) {
        payload.args = utils.toJson(payload.args);
      }
      if (payload.kwargs.trim()) {
        payload.kwargs = utils.toJson(payload.kwargs);
      }
      if (payload.options.trim()) {
        payload.options = utils.toJson(payload.options);
      }
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
  }
};
</script>
