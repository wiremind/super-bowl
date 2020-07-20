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
