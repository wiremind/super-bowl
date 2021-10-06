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

export default {
  isJson
};
