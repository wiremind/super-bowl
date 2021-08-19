const axios = require('axios');

const getArgsKwargs = id => {
  const url = '/messages/states/' + id;
  return axios.get(url).then(res => parseArgs(res.data));
};

const parseArgs = rawMessage => {
  return {
    args: rawMessage.args,
    kwargs: rawMessage.kwargs,
    options: rawMessage.options
  };
};

const getMessages = args => {
  const url = '/messages/states';
  return axios
    .post(url, args)
    .then(res => ({ count: res.data.count, data: parseMessages(res.data.data.map) }));
};

function parseMessages(data) {
  console.log(data);
  function findTargetIndex(target_id) {
    return messages.findIndex(
      element =>
        element.message_id === target_id ||
        (element.type === 'pipeline' && element.messages[0] === target_id)
    );
  }
  const messages = data.map(parseMessage);
  console.log(messages);
  let pipe_index = messages.findIndex(element => element.pipe_target);
  while (pipe_index !== -1) {
    messages[pipe_index] = { type: 'pipeline', messages: [messages[pipe_index]] };
    let target_index = findTargetIndex(messages[pipe_index].messages[0].pipe_target[0].message_id);
    while (target_index !== null && target_index !== -1) {
      const next_message = messages.splice(target_index, 1)[0];
      if (pipe_index > target_index) {
        pipe_index -= 1;
      }
      if (next_message.type === 'pipeline') {
        messages[pipe_index].messages.push(next_message.messages);
      } else {
        messages[pipe_index].messages.push(next_message);
      }
      if (next_message.pipe_target) {
        target_index = findTargetIndex(next_message.pipe_target[0].message_id);
      } else {
        target_index = null;
      }
    }
    if (target_index) {
      let next_message =
        messages[pipe_index].messages[messages[pipe_index].messages.length - 1].pipe_target[0];
      while (next_message) {
        messages[pipe_index].messages.push(parseMessage(next_message));
        if (next_message.options && next_message.options.pipe_target) {
          next_message = next_message.options.pipe_target[0];
        } else {
          next_message = null;
        }
      }
    }

    pipe_index = messages.findIndex(element => !(element instanceof Array) && element.pipe_target);
  }
  console.log(messages);
  return messages;
}
const parseMessage = rawMessage => {
  return {
    priority: rawMessage.priority,
    messageId: rawMessage.message_id,
    status: rawMessage.status,
    actorName: rawMessage.actor_name,
    progress: rawMessage.progress ? rawMessage.progress : null,
    enqueuedDatetime: rawMessage.enqueued_datetime ? new Date(rawMessage.enqueued_datetime) : null,
    startedDatetime: rawMessage.started_datetime ? new Date(rawMessage.started_datetime) : null,
    endDatetime: rawMessage.end_datetime ? new Date(rawMessage.end_datetime) : null,
    queueName: rawMessage.queue_name,
    pipe_target:
      rawMessage.options && rawMessage.options.pipe_target ? rawMessage.options.pipe_target : null
  };
};

const cancelMessage = message_id => {
  return axios.post('/messages/cancel/' + message_id);
};

const getJobs = () => {
  return axios.get('scheduled/jobs').then(res => res.data.result.map(parseJob));
};

const parseJob = rawJob => {
  return {
    actorName: rawJob.actor_name,
    args: rawJob.args,
    dailyTime: rawJob.daily_time,
    enabled: rawJob.enabled,
    interval: rawJob.interval,
    isoWeekday: rawJob.iso_weekday,
    kwargs: rawJob.kwargs,
    lastQueued: rawJob.last_queued ? new Date(rawJob.last_queued) : null,
    tz: rawJob.tz
  };
};

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

const getActors = () => {
  return axios.get('/actors').then(res => res.data.result.map(parseActor));
};

const parseActor = rawActor => {
  for (const arg of rawActor.args) {
    if (arg.type === undefined) {
      arg.type = 'empty';
    }
  }
  return {
    name: rawActor.name,
    priority: rawActor.priority,
    queueName: rawActor.queue_name,
    args: rawActor.args
  };
};

const getOptions = () => {
  return axios.get('/options').then(res => res.data.options);
};

const getGroups = () => {
  const url = '/groups';
  return axios
    .post(url)
    .then(res => ({ count: res.data.count, data: res.data.data.map(parseGroup) }));
};

const parseGroup = rawGroup => {
  return {
    groupId: rawGroup.group_id,
    messages: rawGroup.messages.map(parseMessage)
  };
};

const requeue = messageId => {
  const url = '/messages/requeue/' + messageId;
  return axios.get(url);
};

const getResult = messageId => {
  const url = '/messages/result/' + messageId;
  return axios.get(url).then(res => res.data.result);
};

const cleanStates = args => {
  const url = '/messages/states/';
  return axios.delete(url, args);
};

export default {
  cleanStates,
  getResult,
  requeue,
  getArgsKwargs,
  getMessages,
  cancelMessage,
  getJobs,
  enqueueMessage,
  getActors,
  getOptions,
  getGroups
};
