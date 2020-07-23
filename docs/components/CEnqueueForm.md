# CEnqueueForm <Badge text="Enqueue Form"/>

This components represents the form to Enqueue a Task on [Remoulade](https://github.com/wiremind/remoulade).

<CImage src="cenqueue_form_design.png" caption="Design: Enqueue Form"></CImage>

## Data

- ``response:String``: response after sending the form
- ``errorsRequest:Array``:  Errors after send the request
- ``emptyName:Boolean``: False if the actor name has not been selected
- ``invalidArgs:Boolean``: False if the args are not in a valid ``Array``
- ``invalidKwargs:Boolean``: False if the kwargs are not a valid ``Dict``
- ``invalidOptions:Boolean``: False if the options are not a valid ``Dict``
- ``isFormValid:Boolean``: False if any ``invalidArgs, invalidKwargs, invalidOptions, emptyName`` is False
- ``message:Object``: The data to create a task on [Remoulade](https://github.com/wiremind/remoulade).
  ``` js
    {
      actorName: '',
      delay: 0,
      args: '',
      kwargs: '',
      options: ''
    }
  ```

## Methods

| Name          | Function        |
| ------------- |:-------------:|
| resetForm | initialize the inputs in the form|
| checkForm | check if all inputs are valid (set the value of ``isFormValid``|
| submit    | calls ``enqueueMessage(message)`` from ``store.js``, if is successful  shows <Badge text="Message Sent!" />|

::: warning
   - when this component is created ``getActors`` from ``store.js``  is called.
:::
