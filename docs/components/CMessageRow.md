# CMessageRow <Badge text="Message Row"/>

This component is used by [CMessageTable](/super-bowl/components/CMessageTable), and represents a task on [Remoulade](https://github.com/wiremind/remoulade)

## Props
``` js
  props: {
    priority: Number,
    messageId: String,
    name: String,
    actorName: String,
    args: Array,
    progress: Number,
    kwargs: Object,
    enqueuedDatetime: Date,
    startedDatetime: Date,
    endDatetime: Date,
  }
```

## Data
  - ``canCancel:Boolean``: answers, can be canceled the current task?
  - ``isOpened:Boolean``: answers, Is the current hidden row opened?
  - ``response:String``: response after calling ``cancel`` or ``requeue`` action (displayed for 3 seconds)
  - ``nameState:String``: the name of the state, it is copy of ``name`` received by the props

## Methods
| Name          | Function        |
| ------------- |:-------------:|
| ``getColorState(name)``| Return the color of the asociated state|
| ``cancelMessage`` | call an action from the ``store.js`` to cancel the current Message|
| ``requeueMessage`` | call an action from the ``store.js`` to requeue the current Message|


::: tip
A Message is a task on  [Remoulade](https://github.com/wiremind/remoulade).
:::

::: warning
When a Message is requeued is created a new Message
:::
