import { mount } from '@vue/test-utils';
import CMessageRow from '@/components/CMessageRow';
import { advanceTo } from 'jest-date-mock';

describe('Computed properties in Message Row', () => {
  it('returns the right wait time', () => {
    const wrapper = mount(CMessageRow, {
      propsData: {
        startedDatetime: new Date('December 10, 2020 05:32:10'),
        enqueuedDatetime: new Date('December 10, 2020 03:24:00'),
        stateName: 'Pending'
      }
    });
    expect(wrapper.vm.waitTime).toBe('02:08:10');
  });

  // start ten minutes ago
  // can arise precision problems
  const cases = [
    [new Date('December 10, 2020 01:00:00'), 0.1, '01:30:00'], // 10% == 10 min, then 90% =  90 minutes
    [new Date('December 10, 2020 01:00:00'), 0.2, '00:40:00'], // 20% == 10 min, then 80% = 40 minutes
    [new Date('December 10, 2020 01:00:00'), 0.5, '00:10:00'], // 50% == 10 min then, the other 50% is 10 minutes
    [new Date('December 10, 2020 01:00:00'), 1.0, '00:00:00'] // if is completed then 00:00:00
  ];

  test.each(cases)(
    'given %p and %p as arguments, returns %p',
    (startedDatetime, progress, expectedResult) => {
      const currentDate = new Date('December 10, 2020 01:10:00');
      // mock time
      advanceTo(currentDate);

      const wrapper = mount(CMessageRow, {
        propsData: {
          startedDatetime,
          progress,
          stateName: 'Started'
        }
      });
      expect(wrapper.vm.remainingTime).toBe(expectedResult);
    }
  );
});
