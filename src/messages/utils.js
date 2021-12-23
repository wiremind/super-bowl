const getSortColumnAndDirection = (columnName, sortedColumn, sortDirection) => {
  let columnAndDirection = [null, null];
  if (columnName !== sortedColumn) {
    columnAndDirection = [columnName, 'asc'];
  } else if (sortDirection === 'asc') {
    columnAndDirection = [columnName, 'desc'];
  }
  return columnAndDirection;
};

/**
 * return the dd:hh:mm:ss of a given milliseconds
 * @param  millis milliseconds(int)
 */
const formatMillis = millis => {
  let delta = Math.abs(millis) / 1000;
  const diff = [
    ['days', 60 * 60 * 24],
    ['hours', 60 * 60],
    ['minutes', 60],
    ['seconds', 1]
  ].reduce((acc, [key, value]) => {
    acc[key] = Math.floor(delta / value);
    delta -= acc[key] * value;
    return acc;
  }, {});
  Object.keys(diff).map(key => {
    diff[key] = diff[key] < 10 ? '0' + diff[key] : '' + diff[key];
  });
  return diff;
};

const camelCaseToUnderScore = str => {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

const underScoreToCamelCase = str => {
  return str
    .split(/_/)
    .map((s, index) => {
      if (index !== 0) {
        return s.charAt(0).toUpperCase() + s.slice(1);
      } else {
        return s;
      }
    })
    .join('');
};

/**
 * If item exist in list remove it
 * otherwise add it.
 * @param {item}
 * @param {list}
 */
const toggleItemFromList = (item, list) => {
  return list.indexOf(item) >= 0 ? list.filter(it => it !== item) : [...list, item];
};

export default {
  getSortColumnAndDirection,
  formatMillis,
  underScoreToCamelCase,
  camelCaseToUnderScore,
  toggleItemFromList
};
