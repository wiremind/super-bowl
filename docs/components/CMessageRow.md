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
    isExpandable: { // Attributes that enables the hidden row
      type: Boolean,
      default: true
    }
  }
```

## Data
  - ``canCancel:Boolean``: answers, can be canceled the current task?
  - ``isOpened:Boolean``: answers, Is the current hidden row opened?
  - ``onError:Boolean``: answers: there was an error executing an action with the current task?
  - ``error:String``: storage the error, after the action
  - ``nameState:String``: the name of the state, it is copy of ``name`` received by the props
  - ``txtBtnCancel:String``: the text in the button cancel



::: tip
A Message is a task on  [Remoulade](https://github.com/wiremind/remoulade).
:::
