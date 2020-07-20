# CSearchInput <Badge text="Search Input"/>

This component is an input that allow you to filter the data, the data is filter in a lazy way, that means that online update when ``onChange:event`` is triggered.

<CImage src="csearch_input_design.png" caption="Design: Search Input"></CImage>


::: tip
If you want to update each time that you type, remove the keyword ``lazy`` from the ``v-model`` 
:::

it uses ``isLoading`` and  ``filter`` from ``store.js``.

At the end of the input there is a <Badge text="spinner" type="tip"/>  that is shown when the data is loading.
