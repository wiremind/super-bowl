# Messages <Badge text="example"/>

This example create a function to approximates PI in ``steps`` iterations.
It is shown how to update the progress, as well as add middlewares to cancel and save the state.

<CImage src="example_message.png" caption="Result Example tab /messages" zoom="true"></CImage>

## Script

File name: ``messages.py``

``` python
import remoulade
import time
from remoulade.api.main import app
from remoulade.brokers.rabbitmq import RabbitmqBroker
from remoulade.cancel import Cancel
from remoulade.cancel.backends import StubBackend as CancelBackend
from remoulade.state import MessageState, backends
from remoulade.middleware import CurrentMessage
broker = RabbitmqBroker()
# allow to cancel a message
broker.add_middleware(Cancel(backend=CancelBackend()))
# allow to update the progress
broker.add_middleware(CurrentMessage())
# allow to save the state of the task
broker.add_middleware(MessageState(backend=backends.RedisBackend()))
remoulade.set_broker(broker)


@remoulade.actor
def leibniz(steps):
    """ Function to approximate pi"""
    time.sleep(3)
    pi = 0
    msg = CurrentMessage.get_current_message()
    for n in reversed(range(steps)):
        msg.set_progress(1 - n / steps)
        pi += (-1.0) ** n / (2.0 * n + 1.0)
    return pi * 4


broker.declare_actor(leibniz)

if __name__ == "__main__":
    # create five task to aproximates pi in:
    #  [1000, 2000, ..., 5000] iterations
    for i in range(1, 6):
        leibniz.send(steps=1000 * i)
    app.run(host="localhost", port=5005)
```

## Commands

``` sh
  $ python3 messages.py
  $ remoulade messages
```
