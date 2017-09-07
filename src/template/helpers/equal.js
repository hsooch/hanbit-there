module.exports = function () {
    if (arguments.length < 3) {
        return false;
    }

    return arguments[0] === arguments[1];
};