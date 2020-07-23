# CTh <Badge text="Table Header"/>

This component represent the header of a column in a table, is used by the following components: [CMessageTable](/super-bowl/components/CMessageTable), [CJobTable](/super-bowl/components/CJobTable), [CGroupTable](/super-bowl/components/CGroupTable), [CGroupContent](/super-bowl/components/CGroupContent)

<CImage src="cth_design.png" caption="Design: Table Header"></CImage>

## Props

``` js
  props: {
    label: String, // the label in the cell
    name: String,  // the identifier of the cell
    isSortable: Boolean // define if you can sort that column
  }
```

::: warning
If ``isSortable`` is ``true`` the ``name`` must be defined
:::

To sort the column uses two attributes defined in ``store.js``: ``sortedColumn``, ``sortDirection``.
