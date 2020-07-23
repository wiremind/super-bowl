#  CNav <Badge text="Navbar"/>

This component represents the navigation navbar, it uses the array defined in ``routes.js`` to load the menu.
It has a ``Button`` that call refresh and an input type ``select`` that allow to change the interval of refresh. The refresh method is called each ``refreshInterval``.

<CImage src="cnav_design.png" caption="Design: Navbar"></CImage>

## Data
   - ``updateTimes:Array``: The value is given in  ``seconds``

``` js
      updateTimes: [
        { text: 'off', value: null },
        { text: '5s', value: 5 },
        { text: '10s', value: 10 },
        { text: '30s', value: 30 },
        { text: '1m', value: 60 },
        { text: '5m', value: 60 * 5 },
        { text: '1h', value: 60 * 60 },
        { text: '12h', value: 60 * 60 * 12 },
        { text: '1d', value: 60 * 60 * 24 }
      ]
```

## Methods
| Name          | Function        |
| ------------- |:-------------:|
| refresh     | refresh the data of the current page, just apply for components [CMessageTable](/super-bowl/components/CMessageTable), [CGroupTable](/super-bowl/components/CGroupTable) |

To update the refresh interval it uses the attribute  ``refreshInterval`` storage in ``store.js``
