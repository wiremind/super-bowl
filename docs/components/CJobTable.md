# CJobTable <Badge text="Job Table"/>

This components display all scheduled jobs registered on remoulade. It uses [CJobRow](/super-bowl/components/CJobRow).
At the top of the table there is a [CSearchInput](/super-bowl/components/CSearchInput).

## Data
- ``columns``
``` js
  [
    { label: 'Actor Name', name: 'actorName', sortable: true },
    { label: 'Daily Time', name: 'dailyTime' },
    { label: 'Enabled', name: 'enabled', sortable: true },
    { label: 'Interval', name: 'interval', sortable: true }, // interval of execution
    { label: 'Weekday', name: 'isoWeekday', sortable: true },
    { label: 'Args', name: 'args' },
    { label: 'Kwargs', name: 'kwargs' },
    { label: 'Last Queued', name: 'lastQueued', sortable: true },
    { label: 'Time Zone', name: 'tz' }
  ]
```

::: warning
   - when this component is created call ``getJobs`` from ``store.js``
   - this component do not use pagination, then this component is in charge of filtering using ``filterKeys``
:::

This component uses ``'jobs', 'isLoading', 'sortedColumn', 'sortDirection', 'filter'`` from ``store.js``
