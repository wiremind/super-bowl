const axios = require('axios');

const getMessages = () => {
  return axios.get('/messages/states').then(res => res.data.result);
};

const cancelMessage = message_id => {
  return axios.post('/messages/cancel/' + message_id);
};

export default {
  getMessages,
  cancelMessage
};
