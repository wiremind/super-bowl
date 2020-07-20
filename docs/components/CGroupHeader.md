# CGroupHeader <Badge text="CGroupHeader"/>

This component shows the general information of each group ``messageCount, enqueuedDatetime, uniqueActors, remainingTime, progress``.

## Props
``` js
  props: {
    messages: Array,
    groupId: String
  }
```

## Data
- ``isOpened:Boolean``: answers: is the hidden row of the current group opened?


## Methods
| Name          | Function        |
| ------------- |:-------------:|
| onToggle() | change ``isOpened`` and call ``toogleRow`` in [CGroupTable](/super-bowl/components/CGroupTable)|


