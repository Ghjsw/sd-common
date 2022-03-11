/* eslint-disable no-var */
const utils = {
  isEmpty: (obj) => {
    const arr = Object.keys(obj);
    return arr.length === 0;
  },
  trimObj: (obj) => {
    const params = { ...obj };
    if (utils.isEmpty(params)) return params;
    return Object.keys(params).reduce((pre, next) => {
      pre[next] = params[next] && utils.isString(params[next])
        ? params[next].replace(/\s+/g, '')
        : params[next];
      return pre;
    }, {});
  },
  isString: function(obj) {
    return obj && typeof obj === 'string' && obj.constructor === 'String';
  },
  formatDate: function(value, format, hideWeek) {
    const t = (value && new Date(value)) || new Date();
    const week_day = t.getDay();
    let week_day_c;
    // eslint-disable-next-line no-redeclare
    var format = format || 'yyyy-MM-dd HH:mm:ss';
    switch (week_day) {
      case 1:
        week_day_c = '周一';
        break;
      case 2:
        week_day_c = '周二';
        break;
      case 3:
        week_day_c = '周三';
        break;
      case 4:
        week_day_c = '周四';
        break;
      case 5:
        week_day_c = '周五';
        break;
      case 6:
        week_day_c = '周六';
        break;
      case 0:
        week_day_c = '周日';
        break;
      default:
        week_day_c = '';
        break;
    }
    // 不足位数,补全
    const tf = function(i) {
      return (i < 10 ? '0' : '') + i;
    };
    let result = format.replace(/yyyy|MM|dd|HH|mm|ss/g, function(a) {
      switch (a) {
        case 'yyyy':
          return tf(t.getFullYear());
        case 'MM':
          return tf(t.getMonth() + 1);
        case 'dd':
          return tf(t.getDate());
        case 'HH':
          return tf(t.getHours());
        case 'mm':
          return tf(t.getMinutes());
        case 'ss':
          return tf(t.getSeconds());
      }
    });
    if (!hideWeek) {
      result = result + ' ' + week_day_c;
    }
    return result;
  }
};

export default utils;
