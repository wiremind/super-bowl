# CJobRow <Badge text="Job Row"/>

This component represents a scheduled job, is used in [CJobTable](/super-bowl/components/CJobTable).

## Props
``` js
  props: {
    actorName: String,
    dailyTime: String,
    enabled: Boolean,
    interval: Number,
    isoWeekday: Number,
    args: Array,
    kwargs: Object,
    lastQueued: Date,
    tz: String
  }
```

## Filters
| Name          | Function        |
| ------------- |:-------------:|
|``formatDistance(time)``| Return how long ago was the last queued date|
|``formatWeekDay(isoWeekday)``| Return the string of day of the week given its isoWeekday|
|``formatSeconds(seconds)``| Format the ``interval``| 
