
# CPageFooter <Badge text="Page Footer"/>

This component is rendered for components which support ``paging``.

<CImage src="cpage_footer_design.png" caption="Design: Page Footer"></CImage>

## Props

``` js
  props: {
    total: Number // the total number of registers
  }
```

## Data

- ``sizes``:``array`` is rendered in a ``select option`` input at the bottom of each table
``` js
  sizes: [  // the number of registers per page
    { text: '10', value: 10 },
    { text: '50', value: 50 },
    { text: '100', value: 100 },
    { text: '200', value: 200 },
    { text: '1000', value: 1000 }
  ]
```

::: warning
If the number of registers is less than ``10`` this component is not rendered.
:::

## Methods
| Name          | Function        |
| ------------- |:-------------:|
| next | go to the next page|
| previous | go to the previous page|

It uses ``sizePage`` and ``currentPage`` from ``store.js``
