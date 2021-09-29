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
    .then(res => Object.assign(parseMessages(res.data.data), { count: res.data.count }));
};

function parseMessages(data) {
  const loadDateTime = utils.dateToUTC(new Date());

  const parseMessage = rawMessage => {
    const parsedMessage = {
      priority: rawMessage.priority,
      messageId: rawMessage.message_id,
      status: rawMessage.status,
      actorName: rawMessage.actor_name,
      progress: rawMessage.progress ? rawMessage.progress : null,
      enqueuedDatetime: rawMessage.enqueued_datetime
        ? new Date(rawMessage.enqueued_datetime)
        : null,
      startedDatetime: rawMessage.started_datetime ? new Date(rawMessage.started_datetime) : null,
      endDatetime: rawMessage.end_datetime ? new Date(rawMessage.end_datetime) : null,
      pipeTarget:
        rawMessage.options && rawMessage.options.pipe_target
          ? rawMessage.options.pipe_target.map(parseMessage)
          : null,
      groupId:
        rawMessage.options && rawMessage.options.group_info
          ? rawMessage.options.group_info.group_id
          : null,
      compositionId: rawMessage.options ? rawMessage.options.composition_id : null,
      queueName: rawMessage.queue_name
    };
    if (parsedMessage.enqueuedDatetime) {
      if (parsedMessage.startedDatetime) {
        parsedMessage.waitTime = parsedMessage.startedDatetime - parsedMessage.enqueuedDatetime;
      } else {
        parsedMessage.waitTime = loadDateTime - utils.dateToUTC(parsedMessage.enqueuedDatetime);
      }
    }
    if (parsedMessage.startedDatetime) {
      if (parsedMessage.endDatetime) {
        parsedMessage.executionTime = parsedMessage.endDatetime - parsedMessage.startedDatetime;
      } else {
        parsedMessage.executionTime = loadDateTime - utils.dateToUTC(parsedMessage.startedDatetime);
      }
    }
    if (parsedMessage.startedDatetime && parsedMessage.progress > 0 && !parsedMessage.endDatetime) {
      parsedMessage.remainingTime =
        ((loadDateTime - utils.dateToUTC(parsedMessage.startedDatetime)) *
          (1 - parsedMessage.progress)) /
        parsedMessage.progress;
    }
    return parsedMessage;
  };

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
          pipe_element.status = 'Not yet enqueued';
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
    // add name
    if (composition.type === 'group') {
      const nameCount = composition.messages.map(message => message.actorName);
      const nameDict = {};
      for (const name of nameCount) {
        nameDict[name] = nameDict[name] ? nameDict[name] + 1 : 1;
      }
      let actorName = '';
      for (const name in nameDict) {
        actorName += (name.includes('|') ? '(' + name + ')' : name) + '[' + nameDict[name] + '] ';
      }
      if (Object.keys(nameDict).length > 1) {
        actorName = '[' + actorName + ']';
      }
      composition.actorName = actorName;
    } else {
      let actorName = '';
      for (const name of composition.messages.map(message => message.actorName)) {
        actorName += name + ' | ';
      }
      composition.actorName = actorName.substring(0, actorName.length - 3);
    }
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
    } else if (statuses.every(status => status === 'Not yet enqueued')) {
      composition.status = 'Not yet enqueued';
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
      if (message.waitTime) {
        wait_time += message.waitTime;
      }
    });
    composition.waitTime = wait_time;
    // add Execution time
    let execution_time = 0;
    composition.messages.forEach(message => {
      if (message.executionTime) {
        execution_time += message.executionTime;
      }
    });
    composition.executionTime = execution_time;
    //add Remaining Time
    if (composition.messages.every(message => message.endDatetime || message.remainingTime)) {
      let remaining_time = 0;
      composition.messages.forEach(message => {
        if (message.remainingTime) {
          remaining_time = Math.max(remaining_time, message.remainingTime);
        }
      });
      composition.remainingTime = remaining_time;
    }
    // add Progress
    if (
      composition.messages.every(message => message.status === 'Success' || message.progress) &&
      !composition.messages.every(message => message.status === 'Success')
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
  function findMessagesGroupIds(start_ids, composition_msgs) {
    const composition_group_ids = [];
    start_ids.forEach(id => {
      const msg_group_ids = [];
      let msg = composition_msgs[findTargetIndex(id, composition_msgs)];
      if (msg.groupId) {
        msg_group_ids.push(msg.groupId);
      }
      while (msg.pipeTarget) {
        msg = msg.pipeTarget[0];
        if (msg.groupId) {
          msg_group_ids.push(msg.groupId);
        }
      }
      composition_group_ids.push(msg_group_ids);
    });
    return composition_group_ids;
  }
  function findGroupId(start_ids, composition_msgs) {
    // We find the group's group_id thanks to this property :
    // The group's groupId is the first group_id that all first messages + their pipe targets have in common
    const composition_group_ids = findMessagesGroupIds(start_ids, composition_msgs);

    function isGroupId(group_id) {
      return composition_group_ids.every(msg_group_ids => msg_group_ids.includes(group_id));
    }

    for (const group_id of composition_group_ids[0]) {
      if (isGroupId(group_id)) {
        return group_id;
      }
    }
    throw 'Invalid composition';
  }
  function assembleGroup(start_ids, composition_msgs) {
    const group = { type: 'group', messages: [] };
    const groupId = findGroupId(start_ids, composition_msgs);
    const inner_groups = {};
    start_ids.forEach(id => {
      const index = findTargetIndex(id, composition_msgs);
      if (composition_msgs[index].groupId === groupId) {
        group.messages.push(composition_msgs.splice(index, 1)[0]);
      } else {
        if (composition_msgs[index].groupId) {
          if (!inner_groups[composition_msgs[index].groupId]) {
            inner_groups[composition_msgs[index].groupId] = [];
          }
          inner_groups[composition_msgs[index].groupId].push(composition_msgs.splice(index, 1)[0]);
        } else {
          group.messages.push(assemblePipeline(index, composition_msgs));
        }
      }
    });
    Object.values(inner_groups).forEach(inner_grp => {
      const grp = assembleGroup(
        inner_grp.map(msg => msg.messageId),
        inner_grp
      );
      composition_msgs.push(grp);
      group.messages.push(assemblePipeline(composition_msgs.length - 1, composition_msgs));
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

  return { messages: messages, loadDateTime: loadDateTime };
}

const cancelMessage = message_id => {
  return axios.post('/messages/cancel/' + message_id);
};

function compareJobs(a, b) {
  return a.actorName > b.actorName ? 1 : -1;
}

const getJobs = () => {
  return axios.get('scheduled/jobs').then(res => res.data.result.map(parseJob).sort(compareJobs));
};

const parseJob = rawJob => {
  return {
    hash: rawJob.hash,
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

function formatJob(job) {
  const parsedJob = {
    actor_name: job.actorName,
    args: job.args,
    daily_time: job.dailyTime,
    enabled: job.enabled,
    interval: job.interval,
    iso_weekday: job.isoWeekday,
    kwargs: job.kwargs,
    lastQueued: job.last_queued,
    tz: job.tz
  };
  if (parsedJob.daily_time) {
    parsedJob.interval = 86400;
  }
  return parsedJob;
}
const deleteJob = job => {
  const url = '/scheduled/jobs/' + job.hash;
  return axios.delete(url).then(res => res.data.result.map(parseJob).sort(compareJobs()));
};

const addJob = job => {
  const url = '/scheduled/jobs';
  return axios
    .post(url, formatJob(job))
    .then(res => res.data.result.map(parseJob).sort(compareJobs));
};

const updateJob = job => {
  const url = '/scheduled/jobs/' + job.hash;
  return axios
    .put(url, formatJob(job))
    .then(res => res.data.result.map(parseJob).sort(compareJobs));
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
  deleteJob,
  addJob,
  updateJob,
  parseMessages
};
