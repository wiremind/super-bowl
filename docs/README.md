# Super Bowl

Super Bowl is a web based tool for monitoring and administrating [Remoulade](https://github.com/wiremind/remoulade) tasks.
Allows an easy setup, filterable, sortable, and paginated tables

![lint](https://github.com/wiremind/super-bowl/workflows/lint/badge.svg)
![jest](https://github.com/wiremind/super-bowl/workflows/test/badge.svg)
[![license](https://img.shields.io/github/license/wiremind/super-bowl.svg)](https://github.com/wiremind/super-bowl/blob/master/LICENSE)

## Features

- Real-time monitoring
    - View currently Task (progress, state, enqueued time, started time, args, kwarg, and more)
    - Group (progress, messages in group, and more)
    - Pipeline (progress, groups, task, and more)
    - Estimates ending time ( task, group, pipeline)
    - Scheduled Jobs (time, args, kwargs and more)

- Actions
    - Enqueue a task
    - Cancel a (task, group)
    - Control Refresh time of dashboard


## Installation

#### Project setup
```
npm install
```

#### Compiles and hot-reloads for development
```
npm run serve
```

#### Compiles and minifies for production
```
npm run build
```

#### Lints and fixes files
```
npm run lint
```
