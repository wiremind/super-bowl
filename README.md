<img src="/src/assets/img/logo.png" align="right" width="131" />

# Super Bowl

Super Bowl is a web based tool for monitoring and administrating [Remoulade](https://github.com/wiremind/remoulade) tasks.
Allows an easy setup, filterable, sortable, and paginated tables

![lint](https://github.com/wiremind/super-bowl/workflows/lint/badge.svg)
![jest](https://github.com/wiremind/super-bowl/workflows/test/badge.svg)
[![license](https://img.shields.io/github/license/wiremind/super-bowl.svg)](https://github.com/wiremind/super-bowl/blob/master/LICENSE)


## Documentation

Please refer to https://wiremind.github.io/super-bowl.

## Quickstart

Please refer to https://wiremind.github.io/super-bowl/examples/messages.html

### Build & debug

```console
$ npm install
$ npm run serve
```

### Run in a container

```console
docker run -it --rm -p 8080:80 ghcr.io/wiremind/super-bowl:master
```

Then open http://localhost:8080 in your browser.

Note that it wil try to contact a wsgi server hosting remoulade api at localhost. To specify a different host/port:

```console
docker run -it --rm -p 8080:80 ghcr.io/wiremind/super-bowl:master
 -e REMOULADE_WSGI_LOCATION=remoulade_api_url:12345
```
