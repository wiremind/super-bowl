import { parseMessages } from '@/messages/parsing';
import utils from '@/messages/utils';

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
  return axios.post(url, args).then(res => ({
    ...parseMessages(
      res.data.data,
      args.sort_column ? utils.underScoreToCamelCase(args.sort_column) : 'enqueuedDatetime',
      args.sort_direction || 'desc'
    ),
    count: res.data.count
  }));
};

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
  cancelMessage
};
