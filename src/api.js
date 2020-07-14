const axios = require('axios');

const getMessages = args => {
  const url = '/messages/states';
  return axios
    .get(url, {
      params: args
    })
    .then(res => ({ count: res.data.count, data: res.data.data.map(parseMessage) }));
};

const parseMessage = rawMessage => {
  return {
    priority: rawMessage.priority,
    messageId: rawMessage.message_id,
    name: rawMessage.name,
    actorName: rawMessage.actor_name,
    args: rawMessage.args,
    kwargs: rawMessage.kwargs,
    progress: rawMessage.progress ? rawMessage.progress : null,
    enqueuedDatetime: rawMessage.enqueued_datetime ? new Date(rawMessage.enqueued_datetime) : null,
    startedDatetime: rawMessage.started_datetime ? new Date(rawMessage.started_datetime) : null,
    endDatetime: rawMessage.end_datetime ? new Date(rawMessage.end_datetime) : null,
    groupId: rawMessage.group_id
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
  return {
    name: rawActor.name,
    priority: rawActor.priority,
    queueName: rawActor.queue_name
  };
};

const getGroups = args => {
  const url = '/groups';
  return axios
    .get(url, {
      params: args
    })
    .then(res => ({ count: res.data.count, data: res.data.data.map(parseGroup) }));
};

const parseGroup = rawGroup => {
  return {
    groupId: rawGroup.group_id,
    messages: rawGroup.messages.map(parseMessage)
  };
};

const getPipelines = args => {
  const url = '/pipelines';
  return axios
    .get(url, {
      params: args
    })
    .then(res => ({ count: res.data.count, data: res.data.data.map(parsePipeline) }));
};

const parsePipeline = rawPipe => {
  return {
    pipelineId: rawPipe.pipeline_id,
    messages: rawPipe.messages.map(parseMessage)
  };
};

export default {
  getMessages,
  cancelMessage,
  getJobs,
  enqueueMessage,
  getActors,
  getGroups,
  getPipelines
};
