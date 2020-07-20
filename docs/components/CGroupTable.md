# CGroupTable <Badge text="Group Table"/>

This component is responsible to display all the groups registered on [Remoulade](https://github.com/wiremind/remoulade). 
Each row of this table is composed by a [CGroupHeader](/super-bowl/components/CGroupHeader) and a [CGroupContent](/super-bowl/components/CGroupContent).
At the bottom of the table there is a [CPageFooter](/super-bowl/components/CPageFooter), at the top of the table has a [CSearchInput](/super-bowl/components/CSearchInput)

## Data
- ``columns``
``` js
  { label: 'Group Id', name: 'groupId' },
  { label: 'Actors' },
  { label: 'Message Count' },
  { label: 'Enqueued Datetime' },
  { label: 'Progress', name: 'progress' },
  { label: 'Remaining Time', name: 'remainingTime' }
```
- ``openedRows:Array``: each row has associated a hidden row, that contains the messages in that group.



## Methods
| Name          | Function        |
| ------------- |:-------------:|
| toogleRow(``id``) | Hide or Display the row with id equals ``id``|


This component uses ``['groups', 'refreshInterval', 'countGroups']`` from ``store.js``

::: warning
   - when this component is created: 
      - calls ``setCurrentPath``, used by ``refresh``
      - calls ``startRefresh`` call ``refresh`` each ``refreshInterval``
         - ``setCurrentPath`` must be called before ``startRefresh``
   - when this component is destroyed:
      - calls ``clearIntervalTimeOut`` that stop the calls done by ``startRefresh``
      - calls ``resetAttributesPage`` that reset the attributes shared between components
:::



