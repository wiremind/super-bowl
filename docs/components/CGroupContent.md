# CGroupContent <Badge text="Group Content"/>

This is a row that contains a table with the task in a group, it uses [CTh](/super-bowl/components/CTh), [CMessageRow](/super-bowl/components/CMessageRow) and [CMessageContent](/super-bowl/components/CMessageContent).

## Props
``` js
  props: {
    messages: Array,
    groupId: String
  }
```

## Methods
| Name          | Function        |
| ------------- |:-------------:|
| toogleRow(``id``) | Hide or Show the row of a Message with messageId equals ``id``|
