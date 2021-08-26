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
    pipeTarget:
      rawMessage.options && rawMessage.options.pipe_target
        ? rawMessage.options.pipe_target.map(parseMessage)
        : null,
    groupId:
      rawMessage.options && rawMessage.options.group_info
        ? rawMessage.options.group_info.group_id
        : null,
    compositionId: rawMessage.options ? rawMessage.options.composition_id : null
  };
};

function parseMessages(data) {
  const messages = data.map(parseMessage);
  const a = [...messages];
  console.log(a);
  function findTargetIndex(target_id) {
    messages.findIndex(element => {
      return element.messageId === target_id;
    });
    return messages.findIndex(element => element.messageId === target_id);
  }

  function findPreviousElement(index) {
    return messages.findIndex(
      el =>
        el.pipeTarget && el.pipeTarget.map(el => el.messageId).includes(messages[index].messageId)
    );
  }

  // adding not yet enqueued messages
  messages.forEach(function (message) {
    if (message.pipeTarget) {
      message.pipeTarget.forEach(function (pipe_element) {
        if (messages.findIndex(message => message.messageId === pipe_element.messageId) === -1) {
          messages.push(pipe_element);
        }
      });
    }
  });

  function assemblePipeline(pipe_index) {
    console.log('pipeline');
    const pipeline = { type: 'pipeline', messages: messages.splice(pipe_index, 1) };
    let ids_next = pipeline.messages[0].pipeTarget.map(pipe_element => pipe_element.messageId);
    while (ids_next) {
      if (ids_next.length === 1) {
        const next_message = messages.splice(findTargetIndex(ids_next[0]), 1)[0];
        pipeline.messages.push(next_message);
        if (next_message.groupId) {
          pipeline.groupId = next_message.groupId;
          if (next_message.pipeTarget) {
            pipeline.pipeTarget = next_message.pipeTarget;
          }
          ids_next = null;
        } else {
          ids_next = next_message.pipeTarget;
        }
      } else {
        const group = assembleGroup(ids_next);
        pipeline.messages.push(group);
        ids_next = group.pipeTarget;
      }
    }
    pipeline.compositionId = pipeline.messages[0].compositionId;
    return pipeline;
  }
  function assembleGroup(start_ids) {
    console.log('group');
    const group = { type: 'group', messages: [] };
    start_ids.forEach(id => {
      const index = findTargetIndex(id);
      if (messages[index].groupId) {
        group.messages.push(messages.splice(index, 1)[0]);
      } else {
        group.messages.push(assemblePipeline(index));
      }
    });
    if (group.messages[0].pipeTarget) {
      group.pipeTarget = group.messages[0].pipeTarget;
    }
    group.compositionId = group.messages[0].compositionId;
    console.log(group);
    return group;
  }

  function assembleComposition(index) {
    // finding the index of one of the first messages of a composition
    let prev_index = findPreviousElement(index);
    while (prev_index !== -1) {
      index = prev_index;
      prev_index = findPreviousElement(index);
    }
    if (messages[index].groupId) {
      const group_indexes = [];
      messages.forEach((message, index_message) => {
        if (message.groupId === messages[index].groupId) {
          group_indexes.push(index_message);
        }
      });
      const group_ids = group_indexes.map(index_message => {
        let prev_index = findPreviousElement(index_message);
        while (prev_index !== -1 && messages[prev_index].pipeTarget.length === 1) {
          index_message = prev_index;
          prev_index = findPreviousElement(index_message);
        }
        return messages[index_message].messageId;
      });
      const group = assembleGroup(group_ids);
      if (group.pipeTarget) {
        messages.push(group);
        return assembleComposition(messages.length - 1);
      } else {
        return group;
      }
    } else {
      const pipeline = assemblePipeline(index);
      if (pipeline.groupId) {
        messages.push(pipeline);
        return assembleComposition(messages.length - 1);
      }
      return pipeline;
    }
  }

  let index = messages.findIndex(message => message.compositionId);
  while (index !== -1) {
    const composition = assembleComposition(index);
    console.log(composition);
    delete composition.compositionId;
    messages.push(composition);
    const b = [...messages];
    console.log(b);
    index = messages.findIndex(message => message.compositionId);
  }

  return messages;
}

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
