import Vue from 'vue';
import CActorArgument from '@/enqueue/components/CActorArgument';
import helpers from '../helpers';
import CEnqueueForm from '@/enqueue/components/CEnqueueForm';

function createEnqueueForm(actors = [], options = []) {
  return helpers.getWrapper(CEnqueueForm, {
    state: {
      actors
    },
    modules: {
      enqueue: {
        state: {
          options
        }
      }
    }
  });
}

describe('Test int input validity', () => {
  let input, button;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'int'
          }
        ]
      }
    ];

    const wrapper = createEnqueueForm(actors);
    const option = helpers.findByText(wrapper, 'option', 'do_work');

    await option.setSelected();

    input = wrapper.findComponent(CActorArgument).find('input');
    button = helpers.findByText(wrapper, 'button', 'Enqueue');
  });

  it('is valid with a valid value', async () => {
    await input.setValue('0');
    expect(button.element.disabled).toBe(false);
  });
  it('is invalid with a float value', async () => {
    await input.setValue('2.2');
    expect(button.element.disabled).toBe(true);
  });
  it('is invalid when empty', async () => {
    await input.setValue('');
    expect(button.element.disabled).toBe(true);
  });
});

describe('Test empty float input validity', () => {
  let input, button;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'float'
          }
        ]
      }
    ];
    const wrapper = createEnqueueForm(actors);
    const option = helpers.findByText(wrapper, 'option', 'do_work');
    await option.setSelected();
    input = wrapper.findComponent(CActorArgument).find('input');
    button = helpers.findByText(wrapper, 'button', 'Enqueue');
  });
  it('is valid with a valid float value', async () => {
    await input.setValue('2.2');
    expect(button.element.disabled).toBe(false);
  });
  it('is invalid when empty', async () => {
    await input.setValue('');
    expect(button.element.disabled).toBe(true);
  });
});

describe('Test JSON parsing', () => {
  let input, button;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'empty'
          }
        ]
      }
    ];
    const wrapper = createEnqueueForm(actors);
    const optionActor = helpers.findByText(wrapper, 'option', 'do_work');
    await optionActor.setSelected();
    const optionJson = helpers.findByText(wrapper, 'option', 'Json');
    await optionJson.setSelected();
    input = wrapper.findComponent(CActorArgument).find('input');
    button = helpers.findByText(wrapper, 'button', 'Enqueue');
  });
  it('is invalid when empty', async () => {
    await input.setValue('');
    expect(button.element.disabled).toBe(true);
    expect(input.classes()).toContain('invalid-input');
  });
  it('is valid with correct JSON', async () => {
    await input.setValue('{}');
    expect(button.element.disabled).toBe(false);
    expect(input.classes()).not.toContain('invalid-input');
  });
  it('is invalid with invalid JSON', async () => {
    await input.setValue('{"a"}');
    expect(button.element.disabled).toBe(true);
    expect(input.classes()).toContain('invalid-input');
  });
});

describe.each([
  ['datetime', '2020-10-10 10:00:00'],
  ['date', '2020-10-10']
])('Test %s input', (type, value) => {
  let input, button;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: type
          }
        ]
      }
    ];
    const wrapper = createEnqueueForm(actors);
    const option = helpers.findByText(wrapper, 'option', 'do_work');
    await option.setSelected();
    input = wrapper.find('.datetime-stub');
    button = helpers.findByText(wrapper, 'button', 'Enqueue');
  });
  it('is invalid when no date is selected', async () => {
    await input.setValue(null);
    expect(button.element.disabled).toBe(true);
  });
  it('is valid when a date is selected', async () => {
    await input.setValue(value);
    expect(button.element.disabled).toBe(false);
  });
});

describe('Test list input', () => {
  let wrapper, input, buttonEnqueue, buttonAdd, optionJson, optionString;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'list'
          }
        ]
      }
    ];
    wrapper = createEnqueueForm(actors);
    const optionActor = helpers.findByText(wrapper, 'option', 'do_work');
    await optionActor.setSelected();
    await Vue.nextTick();
    optionString = helpers.findByText(wrapper, 'option', 'String');
    optionJson = helpers.findByText(wrapper, 'option', 'Json');
    input = wrapper.findComponent(CActorArgument).find('input');
    buttonEnqueue = helpers.findByText(wrapper, 'button', 'Enqueue');
    buttonAdd = helpers.findByText(wrapper.findComponent(CActorArgument), 'button', '+ Add');
  });
  it('is valid by default with String selected', async () => {
    await optionString.setSelected();
    expect(buttonAdd.element.disabled).toBe(false);
    expect(buttonEnqueue.element.disabled).toBe(false);
  });
  it('can add elements', async () => {
    for (let i = 0; i < 3; i++) {
      await input.setValue(i.toString());
      await buttonAdd.trigger('click');
    }
    const removeButtons = wrapper.findAll('.btn-danger');
    expect(removeButtons.length).toBe(3);
  });
  it('can remove elements', async () => {
    for (let i = 0; i < 2; i++) {
      const rmvButton = wrapper.find('.btn-danger');
      await rmvButton.trigger('click');
    }
    const removeButtons = wrapper.findAll('.btn-danger');
    expect(removeButtons.length).toBe(1);
  });
  describe('can validate JSON', () => {
    it('is invalid when inputs are not valid JSON', async () => {
      await optionJson.setSelected();
      expect(input.classes()).not.toContain('invalid-input');
      expect(wrapper.findAll('.invalid-input').length).toBe(1);
      expect(buttonAdd.element.disabled).toBe(true);
      expect(buttonEnqueue.element.disabled).toBe(true);
    });

    it('can Enqueue when elements are valid JSON', async () => {
      const inputListElement = wrapper.find('.invalid-input');
      await inputListElement.setValue('{}');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(inputListElement.classes()).not.toContain('invalid-input');
      expect(buttonAdd.element.disabled).toBe(true);
    });

    it('can Add elements when input is valid JSON', async () => {
      await input.setValue('{}');
      expect(buttonAdd.element.disabled).toBe(false);
    });

    it('is valid when invalid element is removed', async () => {
      const inputListElement = wrapper.findComponent(CActorArgument).findAll('input').at(1);
      await inputListElement.setValue('');
      expect(buttonEnqueue.element.disabled).toBe(true);
      const rmvButton = wrapper.find('.btn-danger');
      await rmvButton.trigger('click');
      expect(buttonEnqueue.element.disabled).toBe(false);
    });
  });
  it('correctly switches back to String parsing', async () => {
    await optionString.setSelected();
    await input.setValue('');
    await buttonAdd.trigger('click');
    await optionJson.setSelected();
    const inputListElement = wrapper.find('.invalid-input');
    expect(buttonEnqueue.element.disabled).toBe(true);
    await optionString.setSelected();
    expect(inputListElement.classes()).not.toContain('invalid-input');
    expect(buttonEnqueue.element.disabled).toBe(false);
  });
});

describe('Test dict input', () => {
  let wrapper, inputKey, inputValue, buttonEnqueue, buttonAdd, optionJson, optionString;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'dict'
          }
        ]
      }
    ];
    wrapper = createEnqueueForm(actors);
    const optionActor = helpers.findByText(wrapper, 'option', 'do_work');
    await optionActor.setSelected();
    await Vue.nextTick();
    optionString = helpers.findByText(wrapper, 'option', 'String');
    optionJson = helpers.findByText(wrapper, 'option', 'Json');
    inputKey = wrapper.findComponent(CActorArgument).find('input');
    const inputs = wrapper
      .findAllComponents(CActorArgument)
      .filter(w => w.props('isChild') === true);
    inputKey = inputs.at(0).find('input');
    inputValue = inputs.at(1).find('input');
    buttonEnqueue = helpers.findByText(wrapper, 'button', 'Enqueue');
    buttonAdd = helpers.findByText(wrapper.findComponent(CActorArgument), 'button', '+ Add');
  });
  it('is invalid when key is empty', async () => {
    await inputKey.setValue('');
    expect(buttonAdd.element.disabled).toBe(true);
  });
  it('can add elements', async () => {
    await inputKey.setValue('a');
    await buttonAdd.trigger('click');
    await inputKey.setValue('b');
    await buttonAdd.trigger('click');
    const removeButtons = wrapper.findAll('.btn-danger');
    expect(removeButtons.length).toBe(2);
  });
  it('can remove elements', async () => {
    const rmvButton = wrapper.find('.btn-danger');
    await rmvButton.trigger('click');
    const removeButtons = wrapper.findAll('.btn-danger');
    expect(removeButtons.length).toBe(1);
  });
  it('can not add already added value', async () => {
    const rmvButton = wrapper.find('.btn-danger');
    await rmvButton.trigger('click');
    await inputKey.setValue('key');
    await inputValue.setValue('value');
    await buttonAdd.trigger('click');
    const inputs = wrapper
      .findAllComponents(CActorArgument)
      .filter(w => w.props('isChild') === true);
    const elementKey = inputs.at(2).find('input');
    const elementValue = inputs.at(3).find('input');
    expect(elementKey.element.value).toBe('key');
    expect(elementValue.element.value).toBe('value');
    await inputValue.setValue('value2');
    await buttonAdd.trigger('click');
    const removeButtons = wrapper.findAll('.btn-danger');
    expect(removeButtons.length).toBe(1);
    expect(elementValue.element.value).toBe('value');
  });
  describe('Test invalidity when two elements have the same key', () => {
    let element1Key, element2Key;
    beforeAll(async () => {
      await inputKey.setValue('key2');
      await inputValue.setValue('value2');
      await buttonAdd.trigger('click');
      const inputs = wrapper
        .findAllComponents(CActorArgument)
        .filter(w => w.props('isChild') === true);
      element1Key = inputs.at(2).find('input');
      element2Key = inputs.at(4).find('input');
    });

    it('is invalid when two elements have the same key', async () => {
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(element2Key.classes()).not.toContain('invalid-input');
      await element2Key.setValue('key');
      expect(buttonEnqueue.element.disabled).toBe(true);
      expect(element2Key.classes()).toContain('invalid-input');
    });

    it('is no longer invalid when the invalid key is changed', async () => {
      await element2Key.setValue('key3');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(element2Key.classes()).not.toContain('invalid-input');
    });

    it('is no longer invalid when the other key having the same value is changed', async () => {
      await element2Key.setValue('key');
      await element1Key.setValue('key4');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(element2Key.classes()).not.toContain('invalid-input');
    });

    it('is no longer invalid when the other element having the same key is removed', async () => {
      await element1Key.setValue('key');
      const rm_button = wrapper.find('.btn-danger');
      await rm_button.trigger('click');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(element2Key.classes()).not.toContain('invalid-input');
    });
  });
  describe('parses JSON correctly', () => {
    let elementValue;
    beforeAll(async () => {
      const inputs = wrapper
        .findAllComponents(CActorArgument)
        .filter(w => w.props('isChild') === true);
      elementValue = inputs.at(3).find('input');
    });

    it('is invalid when JSON is selected and input is not valid JSON', async () => {
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(elementValue.classes()).not.toContain('invalid-input');
      await optionJson.setSelected();
      expect(buttonEnqueue.element.disabled).toBe(true);
      expect(elementValue.classes()).toContain('invalid-input');
    });

    it('is valid when the input contains valid JSON', async () => {
      await elementValue.setValue('{}');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(elementValue.classes()).not.toContain('invalid-input');
    });

    it('is valid when the invalid element is removed', async () => {
      await elementValue.setValue('');
      const rm_button = wrapper.find('.btn-danger');
      await rm_button.trigger('click');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(wrapper.findAll('.btn-danger').length).toBe(0);
    });
  });
  it('correctly switches back to String parsing', async () => {
    await optionString.setSelected();
    await inputKey.setValue('key');
    await inputValue.setValue('value');
    await buttonAdd.trigger('click');
    await optionJson.setSelected();
    expect(buttonEnqueue.element.disabled).toBe(true);
    expect(wrapper.findAll('.invalid-input').length).toBe(1);
    await optionString.setSelected();
    expect(buttonEnqueue.element.disabled).toBe(false);
    expect(wrapper.findAll('.invalid-input').length).toBe(0);
  });
});

describe('Test list of list', () => {
  let wrapper, input, buttonEnqueue, buttonAdd;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'typing.List[list]'
          }
        ]
      }
    ];
    wrapper = createEnqueueForm(actors);
    const optionActor = helpers.findByText(wrapper, 'option', 'do_work');
    await optionActor.setSelected();
    await Vue.nextTick();
    input = wrapper.findComponent(CActorArgument).find('input');
    buttonEnqueue = helpers.findByText(wrapper, 'button', 'Enqueue');
    buttonAdd = helpers.findByText(wrapper.findComponent(CActorArgument), 'button', '+ Add');
  });
  describe('parses JSON', () => {
    it('is invalid when input is empty', async () => {
      await input.setValue('');
      expect(buttonAdd.element.disabled).toBe(true);
    });
    it('is invalid when input contains an dict', async () => {
      await input.setValue('{}');
      expect(buttonAdd.element.disabled).toBe(true);
    });
    it('is valid when input contains a list', async () => {
      await input.setValue('[]');
      expect(buttonAdd.element.disabled).toBe(false);
    });
  });
  describe('parses JSON in elements', () => {
    let inputElement;
    beforeAll(async () => {
      await buttonAdd.trigger('click');
      inputElement = wrapper.findComponent(CActorArgument).findAll('input').at(1);
    });
    it('is invalid when element value is empty', async () => {
      await inputElement.setValue('');
      expect(buttonEnqueue.element.disabled).toBe(true);
      expect(inputElement.classes()).toContain('invalid-input');
    });
    it('is invalid when element value is a dict', async () => {
      await inputElement.setValue('{}');
      expect(buttonEnqueue.element.disabled).toBe(true);
      expect(inputElement.classes()).toContain('invalid-input');
    });
    it('is valid when element value is a list', async () => {
      await inputElement.setValue('[]');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(inputElement.classes()).not.toContain('invalid-input');
    });
  });
});

describe('Test dict of dict', () => {
  let wrapper, inputKey, inputValue, buttonEnqueue, buttonAdd;
  beforeAll(async () => {
    const actors = [
      {
        name: 'do_work',
        args: [
          {
            name: 'arg',
            type: 'typing.Dict[int, dict]'
          }
        ]
      }
    ];
    wrapper = createEnqueueForm(actors);
    const optionActor = helpers.findByText(wrapper, 'option', 'do_work');
    await optionActor.setSelected();
    await Vue.nextTick();
    const inputs = wrapper.findComponent(CActorArgument).findAll('input');
    inputKey = inputs.at(0);
    inputValue = inputs.at(1);
    buttonEnqueue = helpers.findByText(wrapper, 'button', 'Enqueue');
    buttonAdd = helpers.findByText(wrapper.findComponent(CActorArgument), 'button', '+ Add');
    await inputKey.setValue(1);
  });
  describe('parses JSON', () => {
    it('is invalid when value input is empty', async () => {
      await inputValue.setValue('');
      expect(buttonAdd.element.disabled).toBe(true);
    });
    it('is invalid when input contains a list', async () => {
      await inputValue.setValue('[]');
      expect(buttonAdd.element.disabled).toBe(true);
    });
    it('is valid when input contains a dict', async () => {
      await inputValue.setValue('{}');
      expect(buttonAdd.element.disabled).toBe(false);
    });
  });
  describe('parses JSON in elements', () => {
    let inputElement;
    beforeAll(async () => {
      await buttonAdd.trigger('click');
      inputElement = wrapper.findComponent(CActorArgument).findAll('input').at(3);
    });
    it('is invalid when element value is empty', async () => {
      await inputElement.setValue('');
      expect(buttonEnqueue.element.disabled).toBe(true);
      expect(inputElement.classes()).toContain('invalid-input');
    });
    it('is invalid when element value is a list', async () => {
      await inputElement.setValue('[]');
      expect(buttonEnqueue.element.disabled).toBe(true);
      expect(inputElement.classes()).toContain('invalid-input');
    });
    it('is valid when element value is a dict', async () => {
      await inputElement.setValue('{}');
      expect(buttonEnqueue.element.disabled).toBe(false);
      expect(inputElement.classes()).not.toContain('invalid-input');
    });
  });
});

describe('Test options inputs', () => {
  const wrapper = createEnqueueForm(
    [],
    ['max_retries', 'store_results', 'on_failure', 'unknown_option']
  );
  let optionSelect = wrapper.findAll('select').at(1);
  const btnAdd = helpers.findByText(wrapper, 'button', '+ Add');
  it('allows to select known options', () => {
    const options = optionSelect.findAll('option');
    expect(options.length).toBe(3);
    expect(options.wrappers.map(wrapper => wrapper.element.value)).toMatchObject([
      'max_retries',
      'store_results',
      'on_failure'
    ]);
  });
  it('verifies input validity', async () => {
    const optionMaxRetries = helpers.findByText(wrapper, 'option', 'max_retries : int');
    await optionMaxRetries.setSelected();
    const optionInput = wrapper.findAll('input').at(1);
    await optionInput.setValue('text');
    expect(btnAdd.element.disabled).toBe(true);
  });
  it('allows to add options', async () => {
    const optionMaxRetries = helpers.findByText(wrapper, 'option', 'max_retries : int');
    await optionMaxRetries.setSelected();
    const optionInput = wrapper.findAll('input').at(1);
    await optionInput.setValue(5);
    await btnAdd.trigger('click');
    expect(wrapper.findAll('.btn-danger').length).toBe(1);
  });
  it('resets inputs when an option is added', () => {
    expect(optionSelect.element.value).toBe('');
    expect(wrapper.findAll('input').at(1).element.value).toBe('');
  });
  it('added options are no longer in the select', () => {
    optionSelect = wrapper.findAll('select').at(1);
    const options = optionSelect.findAll('option');
    expect(options.length).toBe(2);
    expect(options.wrappers.map(wrapper => wrapper.element.value)).toMatchObject([
      'store_results',
      'on_failure'
    ]);
  });
  it('verifies added elements validity', async () => {
    const elementInput = wrapper.findAll('input').at(2);
    await elementInput.setValue('text');
    expect(elementInput.classes()).toContain('invalid-input');
    const enqueueButton = helpers.findByText(wrapper, 'button', 'Enqueue');
    expect(enqueueButton.element.disabled).toBe(true);
  });
  it('can remove elements', async () => {
    const btnRemove = wrapper.find('.btn-danger');
    await btnRemove.trigger('click');
    expect(wrapper.findAll('.btn-danger').length).toBe(0);
    optionSelect = wrapper.findAll('select').at(1);
    const options = optionSelect.findAll('option');
    expect(options.length).toBe(3);
    expect(options.wrappers.map(wrapper => wrapper.element.value)).toMatchObject([
      'max_retries',
      'store_results',
      'on_failure'
    ]);
  });
});
