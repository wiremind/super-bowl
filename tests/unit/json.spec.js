import utils from '@/shared/utils';

describe('Test isJSON Utility', () => {
  const cases = [
    ['   ', false],
    ['[1]', true],
    ['[1,2,', false],
    ['{"a":"b"}', true],
    ['{"name",', false],
    [null, false],
    ['', false],
    ['{"a":true, "b":12, "c":"d"}', true]
  ];
  test.each(cases)('given an %p check if is json', (str, res) => {
    expect(utils.isJson(str)).toBe(res);
  });
});
