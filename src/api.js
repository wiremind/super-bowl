const axios = require('axios');

const getArgsKwargs = id => {
  const url = '/messages/state/' + id;
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
    .then(res => ({ count: res.data.count, data: res.data.data.map(parseMessage) }));
};

const parseMessage = rawMessage => {
  return {
    priority: rawMessage.priority,
    messageId: rawMessage.message_id,
    status: rawMessage.status,
    actorName: rawMessage.actor_name,
    progress: rawMessage.progress ? rawMessage.progress : null,
    enqueuedDatetime: rawMessage.enqueued_datetime ? new Date(rawMessage.enqueued_datetime) : null,
    startedDatetime: rawMessage.started_datetime ? new Date(rawMessage.started_datetime) : null,
    endDatetime: rawMessage.end_datetime ? new Date(rawMessage.end_datetime) : null
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
