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
    .then(res => ({ ...parseMessages(res.data.data), count: res.data.count }));
};

/**
 * Parse Messages, regroup them into their compositions and add computed properties such as waitTime.
 * @param data
 * @returns {{loadDateTime: Date, messages}}
 */
function parseMessages(data) {
  const loadDateTime = new Date();

  /**
   * Parse Messages, recursively parse their pipeTarget and compute their waitTime, executionTime and remainingTime
   * @param rawMessage
   * @returns {{pipeTarget: (*[]|null), queueName: *, enqueuedDatetime: (Date|null), compositionId: (*|null), startedDatetime: (Date|null), groupId: (*|null), messageId, progress: (*|null), actorName: (string|null|*), priority, endDatetime: (Date|null), status}}
   */
  const parseMessage = rawMessage => {
    const parsedMessage = {
      priority: rawMessage.priority,
      messageId: rawMessage.message_id,
      status: rawMessage.status,
      actorName: rawMessage.actor_name,
      progress: rawMessage.progress,
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
        parsedMessage.waitTime = loadDateTime - parsedMessage.enqueuedDatetime;
      }
    }
    if (parsedMessage.startedDatetime) {
      if (parsedMessage.endDatetime) {
        parsedMessage.executionTime = parsedMessage.endDatetime - parsedMessage.startedDatetime;
      } else {
        parsedMessage.executionTime = loadDateTime - parsedMessage.startedDatetime;
      }
    }
    if (parsedMessage.startedDatetime && parsedMessage.progress > 0 && !parsedMessage.endDatetime) {
      parsedMessage.remainingTime =
        ((loadDateTime - parsedMessage.startedDatetime) * (1 - parsedMessage.progress)) /
        parsedMessage.progress;
    }
    return parsedMessage;
  };

  const messages = data.map(parseMessage);

  /**
   * Find the index of the message or composition in the array that has the target id
   * @param targetId
   * @param array
   * @returns {*}
   */
  function findTargetIndex(targetId, array) {
    return array.findIndex(element => element.messageId === targetId);
  }

  /**
   * Find the index of an element that is before the element with the given index in a pipeline
   * @param index
   * @param array
   * @returns {*}
   */
  function findPreviousElement(index, array) {
    return array.findIndex(
      msg =>
        msg.pipeTarget && msg.pipeTarget.map(el => el.messageId).includes(array[index].messageId)
    );
  }

  function findFirstMessages(compositionMsgs) {
    const startIndexes = [];
    for (let index = 0; index < compositionMsgs.length; index += 1) {
      if (findPreviousElement(index, compositionMsgs) === -1) {
        startIndexes.push(index);
      }
    }
    return startIndexes;
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

  /**
   * Recursively adds to the composition all the messages from the pipe target that have not been enqueued
   * @param message
   */
  function fillPipe(message) {
    if (message.pipeTarget) {
      message.pipeTarget.forEach(targetMessage => {
        if (
          compositions[message.compositionId].findIndex(
            ({ messageId }) => messageId === targetMessage.messageId
          ) === -1
        ) {
          targetMessage.status = 'Not yet enqueued';
          compositions[message.compositionId].push(targetMessage);
          fillPipe(targetMessage);
        }
      });
    }
  }

  // adding not yet enqueued messages
  Object.values(compositions).forEach(messages => {
    messages.map(fillPipe);
  });

  /**
   * Adds to the composition all the properties that are computed from its children's properties
   * @param composition
   * @returns {*}
   */
  function addDetails(composition) {
    // add name
    if (composition.type === 'group') {
      const actorsCount = composition.messages.reduce((count, { actorName }) => {
        count[actorName] = count[actorName] + 1 || 1;
        return count;
      }, {});
      let actorName = '';
      for (const name in actorsCount) {
        actorName +=
          (name.includes('|') ? '(' + name + ')' : name) + '[' + actorsCount[name] + '] ';
      }
      if (Object.keys(actorsCount).length > 1) {
        actorName = '[' + actorName + ']';
      }
      composition.actorName = actorName;
    } else {
      composition.actorName = composition.messages.map(({ actorName }) => actorName).join(' | ');
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
      const datetime = composition.messages.reduce(
        (count, { startedDatetime }) => Math.min(count, startedDatetime || Infinity),
        Infinity
      );
      if (datetime !== Infinity) {
        composition.startedDatetime = new Date(datetime);
      }
    }
    // add Wait time
    composition.waitTime = composition.messages.reduce(
      (count, { waitTime }) => count + (waitTime || 0),
      0
    );
    // add Execution time
    composition.executionTime = composition.messages.reduce(
      (count, { executionTime }) => count + (executionTime || 0),
      0
    );
    //add Remaining Time
    if (composition.messages.every(message => message.endDatetime || message.remainingTime)) {
      composition.remainingTime = composition.messages.reduce(
        (count, { remainingTime }) => Math.max(count, remainingTime || 0),
        0
      );
    }
    // add Progress
    if (
      composition.messages.every(message => message.status === 'Success' || message.progress) &&
      !composition.messages.every(message => message.status === 'Success')
    ) {
      composition.progress =
        composition.messages.reduce((acc, { progress }) => acc + (progress || 1)) /
        composition.messages.length;
    }

    return composition;
  }

  /**
   * Assemble the pipeline starting with the message at the given index from the given messages
   * @param firstIndex
   * @param compositionMsgs
   * @returns {*}
   */
  function assemblePipeline(firstIndex, compositionMsgs) {
    const firstMessage = compositionMsgs.splice(firstIndex, 1);
    const pipeline = {
      type: 'pipeline',
      messages: firstMessage,
      messageId: firstMessage[0].messageId
    };
    let targetIds = pipeline.messages[0].pipeTarget.map(targetMessage => targetMessage.messageId);
    while (targetIds) {
      if (targetIds.length === 1) {
        const nextMessage = compositionMsgs.splice(
          findTargetIndex(targetIds[0], compositionMsgs),
          1
        )[0];
        pipeline.messages.push(nextMessage);
        if (nextMessage.groupId) {
          pipeline.groupId = nextMessage.groupId;
          if (nextMessage.pipeTarget) {
            pipeline.pipeTarget = nextMessage.pipeTarget;
          }
          targetIds = null;
        } else {
          if (nextMessage.pipeTarget) {
            targetIds = nextMessage.pipeTarget.map(pipeElement => pipeElement.messageId);
          } else {
            targetIds = null;
          }
        }
      } else {
        const group = assembleGroup(targetIds, compositionMsgs);
        pipeline.messages.push(group);
        if (group.pipeTarget) {
          targetIds = group.pipeTarget.map(pipeElement => pipeElement.messageId);
        } else {
          targetIds = null;
        }
      }
    }
    return addDetails(pipeline);
  }

  /**
   * Returns for each given id the list of groupIds contained in the message with the given id and its pipeTarget
   * @param startIds
   * @param compositionMsgs
   * @returns {*[]}
   */
  function findMessagesGroupIds(startIds, compositionMsgs) {
    const compositionGroupIds = [];
    startIds.forEach(id => {
      const msgGroupIds = [];
      let msg = compositionMsgs[findTargetIndex(id, compositionMsgs)];
      if (msg.groupId) {
        msgGroupIds.push(msg.groupId);
      }
      while (msg.pipeTarget) {
        msg = msg.pipeTarget[0];
        if (msg.groupId) {
          msgGroupIds.push(msg.groupId);
        }
      }
      compositionGroupIds.push(msgGroupIds);
    });
    return compositionGroupIds;
  }

  /**
   * Returns the groupId of the group that starts with the messages with the given ids
   * @param startIds
   * @param compositionMsgs
   * @returns {any}
   */
  function findGroupId(startIds, compositionMsgs) {
    // We find the group's groupId thanks to this property :
    // The group's groupId is the first groupId that all first messages + their pipe targets have in common
    const compositionGroupIds = findMessagesGroupIds(startIds, compositionMsgs);

    function isGroupId(groupId) {
      return compositionGroupIds.every(msgGroupIds => msgGroupIds.includes(groupId));
    }

    for (const groupId of compositionGroupIds[0]) {
      if (isGroupId(groupId)) {
        return groupId;
      }
    }
    throw 'Invalid composition';
  }

  /**
   * Assemble the group starting with the given ids
   * @param startIds
   * @param compositionMsgs
   * @returns {*}
   */
  function assembleGroup(startIds, compositionMsgs) {
    const group = { type: 'group', messages: [] };
    const groupId = findGroupId(startIds, compositionMsgs);
    while (startIds.length > 0) {
      const index = findTargetIndex(startIds[0], compositionMsgs);
      // If the message at the start has the correct groupId, it means it is directly a message of this group
      if (compositionMsgs[index].groupId === groupId) {
        group.messages.push(compositionMsgs.splice(index, 1)[0]);
        startIds.splice(0, 1);
      } else {
        // If it has another groupId, find all the ids of the messages that are part of the subgroup and assemble it
        // Then remove from startIds the ids of messages absorbed by the new group
        if (compositionMsgs[index].groupId) {
          const subgroupId = compositionMsgs[index].groupId;
          const pipeGroupIds = findMessagesGroupIds(startIds, compositionMsgs);
          const startIdSubgroup = startIds.filter((id, index) =>
            pipeGroupIds[index].includes(subgroupId)
          );
          compositionMsgs.push(assembleGroup(startIdSubgroup, compositionMsgs));
          const msgIds = compositionMsgs.map(msg => msg.messageId);
          startIds = startIds.filter(id => msgIds.includes(id));
        } else {
          // If it doesn't have a groupId, it is the first message of a pipeline
          group.messages.push(assemblePipeline(index, compositionMsgs));
          startIds.splice(0, 1);
        }
      }
    }
    if (group.messages[0].pipeTarget) {
      group.pipeTarget = group.messages[0].pipeTarget;
    }
    group.messageId = group.messages[0].messageId;
    return addDetails(group);
  }

  /**
   * Assemble a composition
   * @param compositionMsgs
   * @returns {*}
   */
  function assembleComposition(compositionMsgs) {
    // finding the indexes of the first messages of the composition
    const startIndexes = findFirstMessages(compositionMsgs);
    // If there is a single start message then the composition is a pipeline starting with this message
    if (startIndexes.length === 1) {
      return assemblePipeline(startIndexes[0], compositionMsgs);
    }
    // Else, these messages are the start messages of a group
    const startIds = startIndexes.map(index => compositionMsgs[index].messageId);
    const group = assembleGroup(startIds, compositionMsgs);
    // If the group has a pipe target, then the composition is a pipeline starting with this group
    if (group.pipeTarget) {
      compositionMsgs.push(group);
      return assemblePipeline(compositionMsgs.length - 1, compositionMsgs);
    }
    // Else it's just this group
    return group;
  }

  Object.values(compositions).forEach(compositionMessages => {
    messages.push(assembleComposition(compositionMessages));
  });
  return { messages: messages, loadDateTime: loadDateTime };
}

const cancelMessage = messageId => {
  return axios.post('/messages/cancel/' + messageId);
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
  parseMessages
};
