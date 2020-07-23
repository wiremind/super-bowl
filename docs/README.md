# SuperBowl

***Everything you need to know about SuperBowl***

Super Bowl is a web based tool for real-time monitoring and administrating of [Remoulade](https://github.com/wiremind/remoulade) tasks.
Allows an easy setup, filterable, sortable, and paginated tables.

![lint](https://github.com/wiremind/super-bowl/workflows/lint/badge.svg)
![jest](https://github.com/wiremind/super-bowl/workflows/test/badge.svg)
[![license](https://img.shields.io/github/license/wiremind/super-bowl.svg)](https://github.com/wiremind/super-bowl/blob/master/LICENSE)

If you’re new to SuperBowl you can get started by [following the examples](/super-bowl/examples/messages).

## Features

- Real-time monitoring
    - View current Tasks (progress, state, enqueued time, started time, args, kwarg, and more)
    - View current Groups (progress, messages in group, and more)
    - Estimates ending time ( Task, Group)
    - View Scheduled Jobs (time, args, kwargs and more)

- Actions
    - Enqueue a Task (Message)
    - Cancel a (Task, Group)
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
