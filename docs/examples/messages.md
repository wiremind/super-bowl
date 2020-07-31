# Messages <Badge text="example"/>

This example creates a function to approximates PI in ``steps`` iterations using [leibniz formula](https://en.wikipedia.org/wiki/Leibniz_formula_for_%CF%80).
It is shown how to update the progress, as well as add middlewares to cancel, save the current state, and save result of the task.

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
from remoulade.results.backends import RedisBackend
from remoulade.results import Results

broker = RabbitmqBroker()
# allow to cancel a message
broker.add_middleware(Cancel(backend=CancelBackend()))
# allow to update the progress
broker.add_middleware(CurrentMessage())
# allow to save the state of the task
broker.add_middleware(MessageState(backend=backends.RedisBackend()))
# allow to save results
broker.add_middleware(Results(backend=RedisBackend()))
remoulade.set_broker(broker)


@remoulade.actor(store_results=True)
def approximate_pi(steps):
    """ Function to approximate pi"""
    time.sleep(3)
    pi = 0
    msg = CurrentMessage.get_current_message()
    for n in reversed(range(steps)):
        msg.set_progress(1 - n / steps)
        pi += (-1.0) ** n / (2.0 * n + 1.0)
    return pi * 4


broker.declare_actor(approximate_pi)

if __name__ == "__main__":
    """
     This will enqueue 5 separate messages and, assuming
     there are enough resources available, execute them in parallel.
     (results expire after 10 minutes by default)
    """
    for i in range(0, 5):
        approximate_pi.send(steps=2000 * (i + 1))
    # the port 5005 is the default port read by super-bowl
    app.run(host="localhost", port=5005)
```

## Commands

``` sh
  $ python3 messages.py
  $ remoulade messages
  # in another terminal run super-bowl to see the dashboard
```

## Results

<CImage src="example_message.png" caption="Results example tab /messages" zoom="true"></CImage>
