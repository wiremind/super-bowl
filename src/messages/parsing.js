/**
 * Parse Messages, recursively parse their pipeTarget and compute their waitTime, executionTime and remainingTime
 * @param rawMessage
 * @param loadDatetime
 * @returns {{pipeTarget: (*[]|null), queueName: *, enqueuedDatetime: (Date|null), compositionId: (*|null), startedDatetime: (Date|null), groupId: (*|null), messageId, progress: (*|null), actorName: (string|null|*), priority, endDatetime: (Date|null), status}}
 */
const parseMessage = (rawMessage, loadDatetime) => {
  const parsedMessage = {
    priority: rawMessage.priority,
    messageId: rawMessage.message_id,
    status: rawMessage.status,
    actorName: rawMessage.actor_name,
    progress: rawMessage.progress,
    enqueuedDatetime: rawMessage.enqueued_datetime ? new Date(rawMessage.enqueued_datetime) : null,
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
      parsedMessage.waitTime = loadDatetime - parsedMessage.enqueuedDatetime;
    }
  }
  if (parsedMessage.startedDatetime) {
    if (parsedMessage.endDatetime) {
      parsedMessage.executionTime = parsedMessage.endDatetime - parsedMessage.startedDatetime;
    } else {
      parsedMessage.executionTime = loadDatetime - parsedMessage.startedDatetime;
    }
  }
  if (parsedMessage.startedDatetime && parsedMessage.progress > 0 && !parsedMessage.endDatetime) {
    parsedMessage.remainingTime =
      ((loadDatetime - parsedMessage.startedDatetime) * (1 - parsedMessage.progress)) /
      parsedMessage.progress;
  }
  return parsedMessage;
};

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
    msg => msg.pipeTarget && msg.pipeTarget.map(el => el.messageId).includes(array[index].messageId)
  );
}

/**
 * Find the first messages of a composition given an array containing its messages
 * @param compositionMsgs
 * @returns {*[]}
 */
function findFirstMessages(compositionMsgs) {
  const startIndexes = [];
  for (let index = 0; index < compositionMsgs.length; index += 1) {
    if (findPreviousElement(index, compositionMsgs) === -1) {
      startIndexes.push(index);
    }
  }
  return startIndexes;
}

/**
 * Recursively adds to the composition all the messages from the pipe target that have not been enqueued
 * @param message
 * @param compositions
 */
function fillPipe(message, compositions) {
  if (message.pipeTarget) {
    message.pipeTarget.forEach(targetMessage => {
      if (
        compositions[message.compositionId].findIndex(
          ({ messageId }) => messageId === targetMessage.messageId
        ) === -1
      ) {
        targetMessage.status = 'Not yet enqueued';
        compositions[message.compositionId].push(targetMessage);
        fillPipe(targetMessage, compositions);
      }
    });
  }
}

/**
 * Adds to the composition all the properties that are computed from its children's properties
 * @param composition
 * @returns {*}
 */
function addDetails(composition) {
  // add name
  if (composition.compositionType === 'group') {
    const actorsCount = composition.messages.reduce((count, { actorName }) => {
      count[actorName] = count[actorName] + 1 || 1;
      return count;
    }, {});
    let actorName = '';
    for (const name in actorsCount) {
      actorName += (name.includes('|') ? '(' + name + ')' : name) + '[' + actorsCount[name] + '] ';
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
    (composition.compositionType === 'group' && statuses.every(status => status === 'Pending')) ||
    (composition.compositionType === 'pipeline' && statuses[0] === 'Pending')
  ) {
    composition.status = 'Pending';
  } else {
    composition.status = 'Started';
  }
  // add Priority
  composition.priority = composition.messages[0].priority;
  // add Started time
  if (composition.compositionType === 'pipeline') {
    composition.startedDatetime = composition.messages[0].startedDatetime;
  } else {
    const datetime = Math.min(...composition.messages.map(msg => msg.startedDatetime || Infinity));
    if (datetime !== Infinity) {
      composition.startedDatetime = new Date(datetime);
    }
  }
  // add Enqueued datetime
  composition.enqueuedDatetime = new Date(
    Math.min(...composition.messages.map(msg => msg.enqueuedDatetime || Infinity))
  );
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
      composition.messages.reduce((acc, { progress }) => acc + (progress || 1), 0) /
      composition.messages.length;
  }

  // add Composition id
  composition.compositionId = composition.messages[0].compositionId;

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
    compositionType: 'pipeline',
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
      pipeline.groupId = group.groupId;
      pipeline.messages.push(group);
      if (group.pipeTarget) {
        targetIds = group.pipeTarget.map(targetMessage => targetMessage.messageId);
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
  const group = { compositionType: 'group', messages: [] };
  const groupId = findGroupId(startIds, compositionMsgs);
  while (startIds.length > 0) {
    const index = findTargetIndex(startIds[0], compositionMsgs);
    // If the message at the start has the correct groupId, it means it is directly a message of this group
    if (compositionMsgs[index].groupId === groupId) {
      group.messages.push(compositionMsgs.splice(index, 1)[0]);
      startIds.splice(0, 1);
    } else {
      // If it has another groupId that is shared by other messages,
      // find all the ids of the messages that are part of the subgroup and assemble it
      // Then remove from startIds the ids of messages absorbed by the new group
      const subgroupId = compositionMsgs[index].groupId;
      if (subgroupId && compositionMsgs.filter(msg => msg.groupId === subgroupId).length > 1) {
        const subgroupId = compositionMsgs[index].groupId;
        const pipeGroupIds = findMessagesGroupIds(startIds, compositionMsgs);
        const startIdsSubgroup = startIds.filter((id, index) =>
          pipeGroupIds[index].includes(subgroupId)
        );
        compositionMsgs.push(assembleGroup(startIdsSubgroup, compositionMsgs));
        const msgIds = compositionMsgs.map(msg => msg.messageId);
        startIds = startIds.filter(id => msgIds.includes(id));
      } else {
        // If it doesn't have a groupId, it is the first message of a pipeline
        const pipeline = assemblePipeline(index, compositionMsgs);
        // If the pipeline has the correct groupId, it is directly a children of the group
        if (pipeline.groupId === groupId) {
          group.messages.push(pipeline);
          startIds.splice(0, 1);
        } else {
          // Else it belongs to a smaller group
          // No need to delete an id here as the pipeline has the Id of its first message
          compositionMsgs.push(pipeline);
        }
      }
    }
  }
  group.groupId = groupId;
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

/**
 * Sorts the assembled compositions by column
 * @param array
 * @param sortColumn
 * @param sortDirection
 * @returns {*}
 */
function sortByColumn(array, sortColumn, sortDirection) {
  function compareByColumn(a, b) {
    let value;
    if (a[sortColumn] < b[sortColumn]) {
      value = 1;
    } else {
      value = -1;
    }
    if (sortDirection === 'desc') {
      value *= -1;
    }
    return value;
  }
  return array.sort(compareByColumn);
}

/**
 * Merge the messages and compositions while keeping them sorted by a column
 * @param messages
 * @param compositions
 * @param sortColumn
 * @param sortDirection
 * @returns {*}
 */
function insertByColumn(messages, compositions, sortColumn, sortDirection) {
  let index = 0;
  while (compositions.length > 0) {
    if (
      index === messages.length ||
      (sortDirection === 'asc' &&
        compositions[0][sortColumn] != null &&
        (messages[index][sortColumn] == null ||
          messages[index][sortColumn] > compositions[0][sortColumn])) ||
      (sortDirection === 'desc' &&
        (compositions[0][sortColumn] == null ||
          (messages[index][sortColumn] != null &&
            messages[index][sortColumn] < compositions[0][sortColumn])))
    ) {
      messages.splice(index, 0, compositions.splice(0, 1)[0]);
    }
    index += 1;
  }
  return messages;
}

/**
 * Parse Messages, regroup them into their compositions and add computed properties such as waitTime.
 * @param data
 * @param sortColumn
 * @param sortDirection
 * @returns {{loadDateTime: Date, messages}}
 */
export function parseMessages(data, sortColumn = null, sortDirection = null) {
  const loadDatetime = new Date();

  //Recursively parse messages to extract useful information
  let messages = data.map(message => parseMessage(message, loadDatetime));

  //group messages by composition_id
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
  Object.values(compositions).forEach(composition => {
    composition.map(message => fillPipe(message, compositions));
  });

  // assemble compositions
  let assembledCompositions = Object.values(compositions).map(assembleComposition);
  // sort the compositions
  assembledCompositions = sortByColumn(assembledCompositions, sortColumn, sortDirection);
  // insert the compositions with the messages keeping them sorted by column
  messages = insertByColumn(messages, assembledCompositions, sortColumn, sortDirection);
  return { messages: messages, loadDateTime: loadDatetime };
}
