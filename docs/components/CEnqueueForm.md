# CEnqueueForm <Badge text="Enqueue Form"/>

This components represents the form to Enqueue a Task on [Remoulade](https://github.com/wiremind/remoulade).

<CImage src="cenqueue_form_design.png" caption="Design: Enqueue Form"></CImage>

## Data

- ``response:String``: response after sending the form
- ``errorsRequest:Array``:  Errors after the request
- ``emptyName:Boolean``: False if the actor name has not been selected
- ``invalidArgs``: False if the args are not in a valid format
- ``invalidKwargs``: False if the kwargs are not in a valid format
- ``invalidOptions``: False if the options are not in a valid format
- ``isFormValid``: False if any ``invalidArgs, invalidKwargs, invalidOptions, emptyName`` is False
- ``message:Object``: The neccesary data to create a task on [Remoulade](https://github.com/wiremind/remoulade).
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
| reset Form | initialize the inputs in the form|
| checkForm | check if all content in inputs is valid|
| submit | calls ``enqueueMessage(message)`` from ``store.js``, if is successful  shows <Badge text="Message Sent!" />|

::: warning
   - when this component is created ``getActors`` from ``store.js``  is called.
:::



