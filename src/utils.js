const getSortColumnAndDirection = (columnName, sortedColumn, sortDirection) => {
  let columnAndDirection = [null, null];
  if (columnName !== sortedColumn) {
    columnAndDirection = [columnName, 'asc'];
  } else if (sortDirection === 'asc') {
    columnAndDirection = [columnName, 'desc'];
  }
  return columnAndDirection;
};

const filterTable = (data, filter, filterKeys) => {
  return data.filter(item =>
    filterKeys
      .map(key => item[key].toLowerCase())
      .join('~~')
      .includes(filter.toLowerCase())
  );
};

const sortTable = (data, sortDirection, sortedColumn) => {
  return [...data].sort((row1, row2) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const a = row1[sortedColumn] || 0,
      b = row2[sortedColumn] || 0;
    return direction * (a < b ? -1 : 1);
  });
};

/**
 * check if a given string is a valid string
 * @param {String} str
 */
const isJson = str => {
  try {
    const obj = JSON.parse(str);
    // Handle non-exception-throwing cases:
    // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
    // but... JSON.parse(null) returns null, and typeof null === "object",
    if (obj && typeof obj === 'object') {
      return true;
    }
  } catch (e) {
    return false;
  }
  return false;
};

const toJson = str => {
  return JSON.parse(str);
};

/**
 * return the dd:hh:mm:ss between two dates
 * @param  {Date} startDate
 * @param  {Date} endDate
 * @param  {Number} factor: scale the difference by a factor
 */
const getDistance = (startDate, endDate, factor = 1) => {
  let delta = (Math.abs(endDate - startDate) * factor) / 1000;
  const diff = [
    ['days', 60 * 60 * 24],
    ['hours', 60 * 60],
    ['minutes', 60],
    ['seconds', 1]
  ].reduce((acc, [key, value]) => {
    acc[key] = Math.floor(delta / value);
    delta -= acc[key] * value;
    return acc;
  });
  Object.keys(diff).map(key => {
    if (diff[key] < 10) {
      diff[key] = '0' + diff[key];
    }
  });
  return diff;
};

const camelCaseToUnderScore = str => {
  return str
    .split(/(?=[A-Z])/)
    .join('_')
    .toLowerCase();
};

export default {
  getSortColumnAndDirection,
  filterTable,
  sortTable,
  isJson,
  toJson,
  getDistance,
  camelCaseToUnderScore
};
