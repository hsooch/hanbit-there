var moment = require('moment');

module.exports = function (dt, oldformat, format) {
    return moment(dt, oldformat).format(format);
};