const axios = require('axios');

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
  getJobs,
  deleteJob,
  addJob,
  updateJob
};
