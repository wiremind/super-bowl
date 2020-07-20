# CMessageTable <Badge text="Message Table"/>

This component shows the tasks on ``Remoulade``. Each row of the table is a [CMessageRow](/super-bowl/components/CMessageRow), at the bottom of the table there is a [CPageFooter](/super-bowl/components/CPageFooter), at the top of the table has a [CSearchInput](/super-bowl/components/CSearchInput)

<CImage src="cmessagetable_design.png" caption="Design: Message Table"></CImage>


## Data
- ``columns``:``array`` are the columns, each on will be rendered in a [CTh](/super-bowl/components/CTh)
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
  ]
```
- ``openedRows``: each row has associated a hidden row, that contains the ``args``, ``kwargs``, ``queueName` of the corresponding task.


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
   - when this component is destroyed:
      - calls ``clearIntervalTimeOut`` that stop the calls done by ``startRefresh``
      - calls ``resetAttributesPage`` that reset the attributes shared between components
:::
