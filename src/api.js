const axios = require('axios');

const getMessages = () => {
  return axios.get('/messages/states').then(res => res.data.result.map(parseMessage));
};

function parseMessage(rawMessage) {
  return {
    priority: rawMessage.priority,
    messageId: rawMessage.message_id,
    name: rawMessage.name,
    actorName: rawMessage.actor_name,
    args: rawMessage.args,
    kwargs: rawMessage.kwargs,
    enqueuedDatetime: rawMessage.enqueued_datetime ? new Date(rawMessage.enqueued_datetime) : null,
    startedDatetime: rawMessage.started_datetime ? new Date(rawMessage.started_datetime) : null,
    endDatetime: rawMessage.end_datetime ? new Date(rawMessage.end_datetime) : null
  };
}

const cancelMessage = message_id => {
  return axios.post('/messages/cancel/' + message_id);
};

export default {
  getMessages,
  cancelMessage
};
