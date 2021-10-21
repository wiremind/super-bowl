import CMessageTable from '@/messages/components/CMessageTable';
import helpers from '../helpers';
import JsonViewer from 'vue-json-viewer';
import CMessageContent from '@/messages/components/CMessageContent';
import Vue from 'vue';

let sortedColumn = null;
let sortDirection = null;

function createMessagesTable(messages = [], countMessages = 0, actors = []) {
  return helpers.getWrapper(CMessageTable, {
    modules: {
      messages: {
        state: {
          messages,
          countMessages,
          sortedColumn,
          sortDirection
        },
        mutations: {
          setSortDirection(state, direction) {
            sortDirection = direction;
            state.sortDirection = direction;
          },
          setSortedColumn(state, column) {
            sortedColumn = column;
            state.sortedColumn = column;
          }
        },
        actions: {
          updateSortDirection(context, direction) {
            context.commit('setSortDirection', direction);
          },
          updateSortedColumn(context, column) {
            context.commit('setSortedColumn', column);
          },
          getArgsKwargs(context, messageId) {
            let message;
            context.state.messages.forEach(msg => {
              if (msg.compositionType) {
                msg.messages.forEach(m => {
                  if (m.messageId === messageId) {
                    message = m;
                  }
                });
              } else {
                if (msg.messageId === messageId) {
                  message = msg;
                }
              }
            });
            return Promise.resolve({
              args: message.args,
              kwargs: message.kwargs,
              options: message.options
            });
          }
        }
      }
    },
    state: {
      actors
    }
  });
}

describe('Test message row', () => {
  const messages = [
    {
      messageId: 'id',
      actorName: 'do_work',
      priority: 1,
      status: 'Started',
      startedDatetime: new Date('2020-10-10 10:00:00'),
      executionTime: 60000,
      waitTime: 40271000,
      remainingTime: 240000,
      progress: 0.2,
      queueName: 'default',
      args: ['arg'],
      kwargs: { kwarg: 'value' },
      options: { option: 'value' }
    }
  ];
  const wrapper = createMessagesTable(messages, 1);
  it('appears when there is a message', () => {
    expect(wrapper.findAll('tr').length).toBe(2);
  });
  describe('has the correct values', () => {
    const cells = wrapper.findAll('td');
    test.each([
      ['actor_name', 0, 'do_work'],
      ['priority', 1, '1'],
      ['status', 2, 'Started'],
      ['started time', 3, '2020-10-10 10:00'],
      ['wait time', 4, '11:11:11'],
      ['execution time', 5, '00:01:00'],
      ['remaining time', 6, '00:04:00'],
      ['progress', 7, '20%']
    ])('has the correct %s', (name, index, correctValue) => {
      expect(cells.at(index).text()).toBe(correctValue);
    });
  });
  describe('Test message content', () => {
    let row, content;
    beforeAll(async () => {
      row = wrapper.findAll('tr').at(1);
      await row.trigger('click');
      content = wrapper.findAll('tr').at(2);
    });
    it('displays the correct message id', () => {
      expect(content.text()).toContain('id');
    });
    it('displays the correct queue name', () => {
      expect(content.text()).toContain('default');
    });
    it('displays the correct args', () => {
      const args = content.findComponent(JsonViewer);
      expect(args.props('value')).toStrictEqual(['arg']);
    });
    it('displays the correct kwargs', () => {
      const kwargs = content.findAllComponents(JsonViewer).at(1);
      expect(kwargs.props('value')).toStrictEqual({ kwarg: 'value' });
    });
    it('displays the correct options', () => {
      const options = content.findAllComponents(JsonViewer).at(2);
      expect(options.props('value')).toStrictEqual({ option: 'value' });
    });
  });
});

describe('Test pipeline', () => {
  const messages = [
    {
      messageId: 'id',
      compositionType: 'pipeline',
      actorName: 'begin_task',
      priority: 1,
      status: 'Started',
      startedDatetime: new Date('2020-10-10 10:00:00'),
      executionTime: 120000,
      waitTime: 3600000,
      composition_id: 'composition_id',
      messages: [
        {
          messageId: 'id',
          actorName: 'begin_task',
          priority: 7,
          status: 'Success',
          startedDatetime: new Date('2020-10-10 09:00:00'),
          executionTime: 120000,
          waitTime: 3600000,
          queueName: 'default',
          args: ['arg1'],
          kwargs: { kwarg: 'value1' },
          options: { option: 'value1' },
          composition_id: 'composition_id',
          pipe_target: [
            {
              messageId: 'id',
              actorName: 'end_task',
              priority: 7,
              status: 'Started',
              startedDatetime: new Date('2020-10-10 10:00:00'),
              executionTime: 60000,
              waitTime: 40271000,
              remainingTime: 240000,
              progress: 0.2,
              queueName: 'default',
              composition_id: 'composition_id',
              args: ['arg2'],
              kwargs: { kwarg: 'value2' },
              options: { option: 'value2' }
            }
          ]
        },
        {
          messageId: 'id',
          actorName: 'end_task',
          priority: 8,
          status: 'Started',
          startedDatetime: new Date('2020-10-10 10:00:00'),
          executionTime: 60000,
          waitTime: 40271000,
          remainingTime: 240000,
          progress: 0.2,
          queueName: 'default',
          composition_id: 'composition_id',
          args: ['arg2'],
          kwargs: { kwarg: 'value2' },
          options: { option: 'value2' }
        }
      ]
    }
  ];
  const wrapper = createMessagesTable(messages, 1);
  it('displays the pipeline in one row', () => {
    expect(wrapper.findAll('tr').length).toBe(2);
  });
  it('displays both messages in the content', async () => {
    const row = wrapper.findAll('tr').at(1);
    await row.trigger('click');
    const elements = wrapper.findAll('.pipe-element');
    expect(elements.at(0).text()).toContain('begin_task');
    expect(elements.at(1).text()).toContain('end_task');
    expect(elements.at(0).text()).toContain('Success');
    expect(elements.at(1).text()).toContain('Started');
  });
  it('displays additional info in the content', async () => {
    const content = wrapper.findAll('tr').at(2);
    const element1 = content.find('.pipe-element');
    await element1.trigger('click');
    let messageContent = content.findComponent(CMessageContent);
    let text = messageContent.text();
    expect(text).toContain('7');
    expect(text).toContain('2020-10-10 09:00');
    expect(text).toContain('01:00:00');
    expect(text).toContain('00:02:00');
    const element2 = content.findAll('.pipe-element').at(1);
    await element2.trigger('click');
    messageContent = content.findComponent(CMessageContent);
    text = messageContent.text();
    expect(text).toContain('8');
    expect(text).toContain('2020-10-10 10:00');
    expect(text).toContain('11:11:11');
    expect(text).toContain('00:01:00');
    expect(text).toContain('00:04:00');
    expect(text).toContain('20%');
  });
});

describe('Test group', () => {
  const messages = [
    {
      compositionType: 'group',
      groupId: 'groupId',
      compositionId: 'compositionId',
      messages: [
        {
          messageId: 'id',
          actorName: 'do_work_b',
          priority: 1,
          status: 'Success',
          startedDatetime: new Date('2020-10-10 11:00:00'),
          executionTime: 60000,
          waitTime: 40271000,
          remainingTime: 240000,
          progress: 0.4,
          queueName: 'default',
          args: ['arg'],
          kwargs: { kwarg: 'value' },
          options: { option: 'value' },
          groupId: 'groupId',
          compositionId: 'compositionId'
        },
        {
          messageId: 'id',
          actorName: 'do_work_a',
          priority: 0,
          status: 'Started',
          startedDatetime: new Date('2020-10-10 10:00:00'),
          executionTime: 60000,
          waitTime: 40271000,
          remainingTime: 240000,
          progress: 0.2,
          queueName: 'default',
          args: ['arg'],
          kwargs: { kwarg: 'value' },
          options: { option: 'value' },
          groupId: 'groupId',
          compositionId: 'compositionId'
        }
      ]
    }
  ];
  const wrapper = createMessagesTable(messages, 1);
  it('displays the group in one row', () => {
    expect(wrapper.findAll('tr').length).toBe(2);
  });
  it('displays both messages in the content', async () => {
    const row = wrapper.findAll('tr').at(1);
    await row.trigger('click');
    await Vue.nextTick();
    const elements = wrapper.findAll('tr').at(2).findAll('tr');
    expect(elements.at(2).find('td').text()).toContain('do_work_b');
    expect(elements.at(3).find('td').text()).toContain('do_work_a');
  });
  describe('Test sorting by column', () => {
    test.each([
      ['actor name', 0, 'do_work_a', 'do_work_b'],
      ['priority', 1, '0', '1'],
      ['status', 2, 'Started', 'Success'],
      ['started time', 3, '2020-10-10 10:00', '2020-10-10 11:00'],
      ['progress', 7, '20%', '40%']
    ])('Test sorting by %s', async (name, index, lesserValue, greaterValue) => {
      const column = wrapper.findAll('tr').at(2).findAll('th > div > div').at(index);
      let rows = wrapper.findAll('tr');
      expect(rows.at(4).findAll('td').at(index).text()).toBe(greaterValue);
      expect(rows.at(5).findAll('td').at(index).text()).toBe(lesserValue);
      await column.trigger('click');
      rows = wrapper.findAll('tr');
      expect(rows.at(4).findAll('td').at(index).text()).toBe(lesserValue);
      expect(rows.at(5).findAll('td').at(index).text()).toBe(greaterValue);
      await column.trigger('click');
      rows = wrapper.findAll('tr');
      expect(rows.at(4).findAll('td').at(index).text()).toBe(greaterValue);
      expect(rows.at(5).findAll('td').at(index).text()).toBe(lesserValue);
      await column.trigger('click');
      rows = wrapper.findAll('tr');
      expect(rows.at(4).findAll('td').at(index).text()).toBe(greaterValue);
      expect(rows.at(5).findAll('td').at(index).text()).toBe(lesserValue);
    });
  });
});

describe('Test sorting by column', () => {
  const messages = [
    {
      messageId: 'id',
      actorName: 'do_work_b',
      priority: 1,
      status: 'Success',
      startedDatetime: new Date('2020-10-10 11:00:00'),
      executionTime: 60000,
      waitTime: 40271000,
      remainingTime: 240000,
      progress: 0.4,
      queueName: 'default',
      args: ['arg'],
      kwargs: { kwarg: 'value' },
      options: { option: 'value' }
    },
    {
      messageId: 'id',
      actorName: 'do_work_a',
      priority: 0,
      status: 'Started',
      startedDatetime: new Date('2020-10-10 10:00:00'),
      executionTime: 60000,
      waitTime: 40271000,
      remainingTime: 240000,
      progress: 0.2,
      queueName: 'default',
      args: ['arg'],
      kwargs: { kwarg: 'value' },
      options: { option: 'value' }
    }
  ];
  const wrapper = createMessagesTable(messages, 2);
  test.each([
    ['actorName', 0],
    ['priority', 1],
    ['status', 2],
    ['startedDatetime', 3],
    ['progress', 7]
  ])('Test sorting by %s', async (name, index) => {
    const column = wrapper.findAll('th > div > div').at(index);
    expect(sortDirection).toBe(null);
    expect(sortedColumn).toBe(null);
    await column.trigger('click');
    expect(sortDirection).toBe('asc');
    expect(sortedColumn).toBe(name);
    await column.trigger('click');
    expect(sortDirection).toBe('desc');
    expect(sortedColumn).toBe(name);
    await column.trigger('click');
    expect(sortDirection).toBe(null);
    expect(sortedColumn).toBe(null);
  });
});
