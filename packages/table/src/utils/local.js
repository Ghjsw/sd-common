/**
 *
 * @param {1: local; 2: session} st
 * @param {object:key} key
 * @param {object: value} value
 * @param {time} expires
 */
export const storage = function(st, key, value, expires) {
  if (+st === 1) {
    st = window.localStorage;
    expires = expires || 60;
  } else {
    st = window.sessionStorage;
    expires = expires || 5;
  }
  if (typeof value !== 'undefined') {
    try {
      return st.setItem(
        key,
        JSON.stringify({
          data: value,
          expires: new Date().getTime() + expires * 1000 * 60
        })
      );
    } catch (e) {
      console.log(e);
    }
  } else {
    const result = JSON.parse(st.getItem(key) || '{}');
    if (result && new Date().getTime() < result.expires) {
      return result.data;
    } else {
      st.removeItem(key);
      return null;
    }
  }
};
