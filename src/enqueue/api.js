const axios = require('axios');

const enqueueMessage = message => {
  return axios.post('/messages', formatMessage(message));
};

const formatMessage = message => {
  return {
    actor_name: message.actorName ? message.actorName : null,
    delay: message.delay ? message.delay : null,
    args: message.args ? message.args : null,
    kwargs: message.kwargs ? message.kwargs : null,
    options: message.options ? message.options : null
  };
};

const getOptions = () => {
  return axios.get('/options').then(res => res.data.options);
};

export default {
  enqueueMessage,
  getOptions
};
