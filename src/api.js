const axios = require('axios');
import utils from '@/utils';

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
    .then(res => ({ count: res.data.count, data: parseMessages(res.data.data) }));
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
  function findTargetIndex(target_id, array) {
    return array.findIndex(element => element.messageId === target_id);
  }

  function findPreviousElement(index, array) {
    return array.findIndex(
      msg =>
        msg.pipeTarget && msg.pipeTarget.map(el => el.messageId).includes(array[index].messageId)
    );
  }
  //grouping messages by composition_id
  const compositions = {};
  let i = 0;
  while (i < messages.length) {
    const compositionId = messages[i].compositionId;
    if (compositionId) {
      if (!compositions[compositionId]) {
        compositions[compositionId] = [];
      }
      compositions[compositionId].push(messages.splice(i, 1)[0]);
    } else {
      i += 1;
    }
  }
  // adding not yet enqueued messages
  function fillPipe(composition_id, message) {
    if (message.pipeTarget) {
      message.pipeTarget.forEach(pipe_element => {
        if (
          compositions[composition_id].findIndex(
            composition_element => composition_element.messageId === pipe_element.messageId
          ) === -1
        ) {
          compositions[composition_id].push(pipe_element);
          fillPipe(composition_id, pipe_element);
        }
      });
    }
  }

  Object.keys(compositions).forEach(composition_id => {
    compositions[composition_id].forEach(message => fillPipe(composition_id, message));
  });

  function addDetails(composition) {
    // add status
    const statuses = composition.messages.map(message => message.status);
    if (statuses.includes('Failure')) {
      composition.status = 'Failure';
    } else if (statuses.includes('Skipped')) {
      composition.status = 'Skipped';
    } else if (statuses.includes('Canceled')) {
      composition.status = 'Canceled';
    } else if (statuses.includes('Started')) {
      composition.status = 'Started';
    } else if (statuses.every(status => status === 'Success')) {
      composition.status = 'Success';
    } else if (
      (composition.type === 'group' && statuses.every(status => status === 'Pending')) ||
      (composition.type === 'pipeline' && statuses[0] === 'Pending')
    ) {
      composition.status = 'Pending';
    } else {
      composition.status = 'Started';
    }
    // add Priority
    composition.priority = composition.messages[0].priority;
    // add Started time
    if (composition.type === 'pipeline') {
      composition.startedDatetime = composition.messages[0].startedDatetime;
    } else {
      const datetime = Math.min(
        ...composition.messages.map(message =>
          message.startedDatetime ? message.startedDatetime.valueOf() : Infinity
        )
      );
      if (datetime !== Infinity) {
        composition.startedDatetime = new Date(datetime);
      }
    }
    // add Wait time
    let wait_time = 0;
    composition.messages.forEach(message => {
      if (message.type) {
        if (message.waitTime) {
          wait_time += message.waitTime;
        }
      } else {
        if (message.enqueuedDatetime) {
          wait_time +=
            (message.startedDatetime || utils.dateToUTC(new Date())) - message.enqueuedDatetime;
        }
      }
    });
    composition.waitTime = wait_time;
    // add Execution time
    let execution_time = 0;
    composition.messages.forEach(message => {
      if (message.type) {
        if (message.executionTime) {
          execution_time += message.executionTime;
        }
      } else {
        if (message.startedDatetime) {
          execution_time += (message.endDatetime || new Date()) - message.startedDatetime;
        }
      }
    });
    composition.executionTime = execution_time;
    //add Remaining Time
    let remaining_time = 0;
    if (
      composition.messages.every(
        message =>
          (message.type && (message.status === 'Success' || message.remainingTime)) ||
          message.endDatetime ||
          (message.progress && message.startedDatetime && message.status === 'Started')
      ) &&
      !composition.messages.every(
        message => message.endDatetime || (message.type && message.status === 'Success')
      )
    ) {
      composition.messages.forEach(message => {
        if (message.type) {
          if (message.remainingTime) {
            remaining_time = Math.max(remaining_time, message.remainingTime);
          }
        } else if (!message.endDatetime) {
          remaining_time = Math.max(
            remaining_time,
            ((new Date() - message.endDatetime) * (1 - message.progress)) / message.progress
          );
        }
      });
      composition.remainingTime = remaining_time;
    }
    // add Progress
    if (
      composition.messages.every(message => message.status === 'Success' || message.progress) &&
      !composition.messages.every(message => (message.status = 'Success'))
    ) {
      composition.progress =
        composition.messages
          .map(message => message.progress || 1)
          .reduce((value, acc) => value + acc) / composition.messages.length;
    }

    return composition;
  }

  function assemblePipeline(pipe_index, composition_msgs) {
    const first_message = composition_msgs.splice(pipe_index, 1);
    const pipeline = {
      type: 'pipeline',
      messages: first_message,
      messageId: first_message[0].messageId
    };
    let ids_next = pipeline.messages[0].pipeTarget.map(pipe_element => pipe_element.messageId);
    while (ids_next) {
      if (ids_next.length === 1) {
        const next_message = composition_msgs.splice(
          findTargetIndex(ids_next[0], composition_msgs),
          1
        )[0];
        pipeline.messages.push(next_message);
        if (next_message.groupId) {
          pipeline.groupId = next_message.groupId;
          if (next_message.pipeTarget) {
            pipeline.pipeTarget = next_message.pipeTarget;
          }
          ids_next = null;
        } else {
          if (next_message.pipeTarget) {
            ids_next = next_message.pipeTarget.map(pipe_element => pipe_element.messageId);
          } else {
            ids_next = null;
          }
        }
      } else {
        const group = assembleGroup(ids_next, composition_msgs);
        pipeline.messages.push(group);
        if (group.pipeTarget) {
          ids_next = group.pipeTarget.map(pipe_element => pipe_element.messageId);
        } else {
          ids_next = null;
        }
      }
    }
    return addDetails(pipeline);
  }
  function assembleGroup(start_ids, composition_msgs) {
    const group = { type: 'group', messages: [] };
    start_ids.forEach(id => {
      const index = findTargetIndex(id, composition_msgs);
      if (composition_msgs[index].groupId) {
        group.messages.push(composition_msgs.splice(index, 1)[0]);
      } else {
        group.messages.push(assemblePipeline(index, composition_msgs));
      }
    });
    if (group.messages[0].pipeTarget) {
      group.pipeTarget = group.messages[0].pipeTarget;
    }
    group.messageId = group.messages[0].messageId;
    return addDetails(group);
  }

  function assembleComposition(composition_index, composition_msgs) {
    // finding the index of one of the first messages of a composition
    let index = 0;
    let prev_index = findPreviousElement(index, composition_msgs);
    while (prev_index !== -1) {
      index = prev_index;
      prev_index = findPreviousElement(index, composition_msgs);
    }
    if (composition_msgs[index].groupId) {
      const group_indexes = [];
      composition_msgs.forEach((message, index_message) => {
        if (message.groupId === composition_msgs[index].groupId) {
          group_indexes.push(index_message);
        }
      });
      const group_ids = group_indexes.map(index_message => {
        let prev_index = findPreviousElement(index_message, composition_msgs);
        while (prev_index !== -1 && composition_msgs[prev_index].pipeTarget.length === 1) {
          index_message = prev_index;
          prev_index = findPreviousElement(index_message, composition_msgs);
        }
        return composition_msgs[index_message].messageId;
      });
      const group = assembleGroup(group_ids, composition_msgs);
      if (group.pipeTarget) {
        composition_msgs.push(group);
        return assembleComposition(composition_msgs.length - 1, composition_msgs);
      } else {
        return group;
      }
    } else {
      const pipeline = assemblePipeline(index, composition_msgs);
      if (pipeline.groupId) {
        composition_msgs.push(pipeline);
        return assembleComposition(composition_msgs.length - 1, composition_msgs);
      }
      return pipeline;
    }
  }

  Object.entries(compositions).forEach(composition_messages => {
    const composition = assembleComposition(0, composition_messages[1]);
    messages.push(composition);
  });

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
