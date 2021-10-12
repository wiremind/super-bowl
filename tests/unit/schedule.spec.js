import helpers from '../helpers';
import CJobTable from '@/schedule/components/CJobTable';
import Vue from 'vue';

let saveJobs;

function createScheduleView(jobs = []) {
  saveJobs = jest.fn();
  return helpers.getWrapper(CJobTable, {
    modules: {
      schedule: {
        state: {
          jobs: []
        },
        mutations: {
          setJobs(state, newJobs) {
            state.jobs = newJobs;
          }
        },
        actions: {
          getJobs(context) {
            context.commit('setJobs', jobs);
          },
          saveJobs: saveJobs
        }
      }
    }
  });
}

const job = {
  actorName: 'do_work',
  dailyTime: null,
  enabled: true,
  interval: 100,
  isoWeekday: null,
  args: [],
  kwargs: {},
  lastQueued: null,
  tz: 'UTC'
};

describe('Test enabled', () => {
  let wrapper;
  beforeAll(async () => {
    wrapper = createScheduleView([job]);
    await Vue.nextTick();
  });
  it('can be unchecked', async () => {
    const enableButton = wrapper.find('input[type="checkbox"]');
    expect(enableButton.element.checked).toBe(true);
    await enableButton.setChecked(false);
    expect(enableButton.element.checked).toBe(false);
  });
  it('changes the enabled value when saved', async () => {
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ enabled: false }]);
  });
});

describe('Test interval', () => {
  let wrapper, intervalInput, datetimeInput, mondayOption;
  beforeAll(async () => {
    wrapper = createScheduleView([job]);
    await Vue.nextTick();
    intervalInput = wrapper.find('input[type="number"]');
    datetimeInput = wrapper.find('.datetime-stub');
    mondayOption = helpers.findByText(wrapper, 'option', 'Monday');
  });
  it('can change value', async () => {
    expect(intervalInput.element.value).toBe('100');
    await intervalInput.setValue(1000);
    expect(intervalInput.element.value).toBe('1000');
  });
  it('is set to 24 hours when daily_time is set', async () => {
    await intervalInput.setValue(100);
    await datetimeInput.setValue('2020-10-10 10:00:00');
    expect(intervalInput.element.value).toBe('86400');
  });
  it('is set to 24 hours when weekday is set', async () => {
    await intervalInput.setValue(100);
    await mondayOption.setSelected();
    expect(intervalInput.element.value).toBe('86400');
  });
  it('changes the interval value when changed', async () => {
    await intervalInput.setValue(1000);
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ interval: 1000 }]);
  });
});

describe('Test daily time input', () => {
  let wrapper, intervalInput, dailyTimeInput;
  beforeAll(async () => {
    wrapper = createScheduleView([job]);
    await Vue.nextTick();
    intervalInput = wrapper.find('input[type="number"]');
    dailyTimeInput = wrapper.find('.datetime-stub');
  });
  it('can change value', async () => {
    expect(dailyTimeInput.element.value).toBe('');
    await dailyTimeInput.setValue('2020-10-10 10:00:00');
    expect(dailyTimeInput.element.value).toBe('2020-10-10 10:00:00');
  });
  it('is set to null when interval is edited', async () => {
    await dailyTimeInput.setValue('2020-10-10 10:00:00');
    await intervalInput.setValue('10');
    expect(dailyTimeInput.element.value).toBe('');
  });
  it('changes the daily time value when changed', async () => {
    await dailyTimeInput.setValue('2020-10-10 10:00:00');
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ dailyTime: '2020-10-10 10:00:00' }]);
  });
});

describe('Test weekday input', () => {
  let wrapper, intervalInput, mondayOption, weekdaySelect;
  beforeAll(async () => {
    wrapper = createScheduleView([job]);
    await Vue.nextTick();
    intervalInput = wrapper.find('input[type="number"]');
    mondayOption = helpers.findByText(wrapper, 'option', 'Monday');
    weekdaySelect = wrapper.find('select');
  });
  it('can change value', async () => {
    expect(weekdaySelect.element.value).toBe('');
    await mondayOption.setSelected();
    expect(weekdaySelect.element.value).toBe('1');
  });
  it('is set to null when interval is edited', async () => {
    await mondayOption.setSelected();
    await intervalInput.setValue('10');
    expect(weekdaySelect.element.value).toBe('');
  });
  it('changes the weekday value when changed', async () => {
    await mondayOption.setSelected();
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ isoWeekday: 1 }]);
  });
});

describe.each([
  ['args', 3, '{}', '[]', '["arg"]'],
  ['kwargs', 4, '[]', '{}', '{"arg":"value"}']
])('Test %s input', (name, inputIndex, invalidValue, defaultValue, validValue) => {
  let wrapper, argInput;
  beforeAll(async () => {
    wrapper = createScheduleView([job]);
    await Vue.nextTick();
    argInput = wrapper.findAll('input').at(inputIndex);
  });
  it('can change value', async () => {
    expect(argInput.element.value).toBe(defaultValue);
    await argInput.setValue(validValue);
    expect(argInput.element.value).toBe(validValue);
  });
  describe('validates the input value', () => {
    it('is invalid when empty', async () => {
      await argInput.setValue('');
      expect(argInput.classes()).toContain('invalid-input');
      expect(wrapper.findAll('.btn-success').length).toBe(0);
    });
    it('is invalid when value is of the wrong type', async () => {
      await argInput.setValue(invalidValue);
      expect(argInput.classes()).toContain('invalid-input');
      expect(wrapper.findAll('.btn-success').length).toBe(0);
    });
    it('is invalid when value is not valid JSON', async () => {
      await argInput.setValue('[');
      expect(argInput.classes()).toContain('invalid-input');
      expect(wrapper.findAll('.btn-success').length).toBe(0);
    });
    it('is valid when value is of the valid type', async () => {
      await argInput.setValue(validValue);
      expect(argInput.classes()).not.toContain('invalid-input');
      expect(wrapper.findAll('.btn-success').length).toBe(1);
    });
  });
  it('changes the value when saved', async () => {
    await argInput.setValue(validValue);
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1][0][name]).toMatchObject(JSON.parse(validValue));
  });
});

describe('Test time zone input', () => {
  let wrapper, tzInput;
  beforeAll(async () => {
    wrapper = createScheduleView([job]);
    await Vue.nextTick();
    tzInput = wrapper.findAll('input').at(5);
  });
  it('can change value', async () => {
    expect(tzInput.element.value).toBe('UTC');
    await tzInput.setValue('Europe/Paris');
    expect(tzInput.element.value).toBe('Europe/Paris');
  });
  it('changes the tz value when saved', async () => {
    await tzInput.setValue('Europe/Paris');
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ tz: 'Europe/Paris' }]);
  });
});

describe('Test save button', () => {
  it('saves all modified fields', async () => {
    const wrapper = createScheduleView([job]);
    await Vue.nextTick();
    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setChecked(false);
    const intervalInput = wrapper.find('input[type="number"]');
    await intervalInput.setValue(1000);
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ enabled: false, interval: 1000 }]);
  });
  it('saves all modified jobs', async () => {
    const jobs = [
      { ...job, actorName: 'do_work1' },
      { ...job, actorName: 'do_work2' },
      { ...job, actorName: 'do_work3' }
    ];
    const wrapper = createScheduleView(jobs);
    await Vue.nextTick();
    const checkboxes = wrapper.findAll('input[type="checkbox"]');
    await checkboxes.at(0).setChecked(false);
    await checkboxes.at(1).setChecked(false);
    const btnSave = wrapper.find('.btn-success');
    await btnSave.trigger('click');
    expect(saveJobs.mock.calls[0][1]).toMatchObject([{ enabled: false }, { enabled: false }]);
  });
});
