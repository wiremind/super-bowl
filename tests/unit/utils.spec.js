import utils from '@/messages/utils';
import { dateToUTC } from '@/schedule/utils';

describe('Test Transform to under score notation', () => {
  const cases = [
    ['actorName', 'actor_name'],
    ['someAttributeId', 'some_attribute_id'],
    ['attribute', 'attribute'],
    ['id0', 'id0']
  ];

  test.each(cases)(
    'given an %p as arguments, returns %p',
    (camelCaseAttribute, underScoreAttribute) => {
      expect(utils.camelCaseToUnderScore(camelCaseAttribute)).toBe(underScoreAttribute);
    }
  );
});

describe('Test format milliseconds (distance between two dates)', () => {
  const cases = [
    [
      new Date('December 10, 2020 01:00:00'),
      new Date('December 10, 2020 02:00:00'),
      { days: '00', hours: '01', minutes: '00', seconds: '00' }
    ],
    [
      new Date('December 10, 2020 01:00:00'),
      new Date('December 11, 2020 02:00:00'),
      { days: '01', hours: '01', minutes: '00', seconds: '00' }
    ],
    [
      new Date('December 11, 2020 01:00:00'),
      new Date('December 11, 2020 03:14:10'),
      { days: '00', hours: '02', minutes: '14', seconds: '10' }
    ]
  ];
  test.each(cases)('given two dates get the difference', (startDate, endDate, expected) => {
    expect(utils.formatMillis(endDate - startDate)).toMatchObject(expected);
  });
});

describe('Test toggle element from list', () => {
  const cases = [
    ['1', [], ['1']],
    ['1', ['1'], []],
    ['1', ['0', '1', '1'], ['0']]
  ];

  test.each(cases)(
    'given an item %p and list %p as arguments, returns %p',
    (item, list, expected) => {
      expect(utils.toggleItemFromList(item, list)).toMatchObject(expected);
    }
  );
});

describe('Test convert date to UTC', () => {
  const date = new Date('Wed, 15 Jun 2020 07:00:00 UTC');
  const cases = [[new Date(date.toLocaleString('en-US', { timeZone: 'Europe/Paris' })), '02']];

  // TODO: check
  test.each(cases)(
    'given a date %p its hours of difference in UTC should be %p',
    (timeZonedDate, diffInHours) => {
      const diff = utils.formatMillis(dateToUTC(timeZonedDate) - date);
      expect(diff.hours).toBe(diffInHours);
    }
  );
});
