import utils from '@/utils';

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
