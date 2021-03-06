# Groups <Badge text="example"/>

This example create a function ``count_words`` that counts the words in the contents of a given page.

## Script

File name: ``groups.py``

``` python
import remoulade
import requests
from remoulade import group
from remoulade.api.main import app
from remoulade.brokers.rabbitmq import RabbitmqBroker
from remoulade.cancel import Cancel
from remoulade.cancel.backends import StubBackend as CancelBackend
from remoulade.middleware import CurrentMessage
from remoulade.state import MessageState, backends

broker = RabbitmqBroker()
# allow to cancel a message
broker.add_middleware(Cancel(backend=CancelBackend()))
# allow to update the progress
broker.add_middleware(CurrentMessage())
# allow to save the state of the task
broker.add_middleware(MessageState(backend=backends.RedisBackend()))
remoulade.set_broker(broker)


@remoulade.actor
def count_words(url):
    msg = CurrentMessage.get_current_message()
    msg.set_progress(0)
    count = len(requests.get(url).text.split(" "))
    msg.set_progress(1)
    print("number of words {}".format(count))


broker.declare_actor(count_words)

if __name__ == "__main__":
    urls = [
        "http://example.com",
        "https://github.com",
        "https://gitlab.com",
        "https://google.com",
    ]
    # creating a group
    group([count_words.message(url) for url in urls]).run()
    # the port 5005 is the default port read by super-bowl
    app.run(host="localhost", port=5005)
```

## Commands

``` sh
  $ python3 groups.py
  $ remoulade groups
  # in another terminal run super-bowl to see the dashboard
```

## Result

<CImage src="example_groups.png" caption="Results example tab /groups" zoom="true"></CImage>
