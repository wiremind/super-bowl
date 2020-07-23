# CMessageContent <Badge text="Message Content"/>

This component represent the hidden row of each of [CMessageRow](/super-bowl/components/CMessageRow), this component display, ``args``, ``kwargs`` and ``queueName`` of the asociated Message.

## Props
```js
  props: {
    messageId: String,
    actorName: String,
    colspan: Number
  }
```

## Data
```js
  data() {
    return {
      args: String,
      kwargs: String
    };
  }
```

::: warning
   - when this component is created:
      - load the args and kwargs using ``Remoulade API``
:::
