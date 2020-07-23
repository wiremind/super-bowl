# CMessageTable <Badge text="Message Table"/>

This component shows the tasks on ``Remoulade``. Each row of the table is a [CMessageRow](/super-bowl/components/CMessageRow) and [CMessageContent](/super-bowl/components/CMessageContent), at the bottom of the table there is a [CPageFooter](/super-bowl/components/CPageFooter), at the top of the table has a [CSearchInput](/super-bowl/components/CSearchInput)

<CImage src="cmessagetable_design.png" caption="Design: Message Table"></CImage>

## Data
- ``columns:Array`` are the columns, each one will be rendered in a [CTh](/super-bowl/components/CTh)
``` js
  columns: [
    { label: 'Actor', name: 'actorName', sortable: true },
    { label: 'Priority', name: 'priority', sortable: true },
    { label: 'State', name: 'name', sortable: true },
    { label: 'Started time', name: 'startedDatetime', sortable: true },
    { label: 'Wait time' },
    { label: 'Execution time' },
    { label: 'Remaining time' },
    { label: 'Progress', name: 'progress', sortable: true },
    { label: 'Actions' }
  ],
  openedRows: [] // ids of the rows opened
```
- ``openedRows``: hidden rows opened

It uses ``['messages', 'refreshInterval', 'actors', 'countMessages']`` from ``store.js``

## Methods
| Name          | Function        |
| ------------- |:-------------:|
| toogleRow(``id``) | Hide or Display the row with id equals ``id``|
| queueName(``actorName``) | Get the queueName of the given ``actorName``|


::: warning
   - when this component is created: 
      - calls ``setCurrentPath``, used by ``refresh``
      - calls ``startRefresh`` call ``refresh`` each ``refreshInterval``
         - ``setCurrentPath`` must be called before ``startRefresh``
   - before this component is created:
      - calls ``clearIntervalTimeOut`` which stop the periodic calls from other components
      - calls ``resetAttributesPage``, reset shared attributes between components
:::
