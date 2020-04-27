const axios = require('axios');

function getMessages() {
  return axios
    .get('/messages/states')
    .then(res => res.data.result)
    .catch(error => console.log(error.response));
}

export default {
  getMessages
};
