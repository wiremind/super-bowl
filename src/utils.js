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

export default { getSortColumnAndDirection, filterTable, sortTable };
