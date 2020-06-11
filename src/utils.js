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

const isJson = str => {
  if (typeof str === 'string') {
    str = str.trim();
    if (!str.length) {
      return true;
    }
  }
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
  str = str.trim();
  return JSON.parse(str);
};
export default { getSortColumnAndDirection, filterTable, sortTable, isJson, toJson };
