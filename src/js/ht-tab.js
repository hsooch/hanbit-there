var callback = [];
var commonCallback;

$('.ht-tab-btns > li').on('click', function () {
    if ($(this).hasClass('active')) {
        return;
    }

    var tabIndex = $(this).index();

    var tabBtns = $(this).parent('.ht-tab-btns').find('li');
    tabBtns.removeClass('active');
    $(tabBtns[tabIndex]).addClass('active');

    var tabContents = $(this).parents('.ht-tab').find('.ht-tab-contents > li');
    tabContents.removeClass('active');
    $(tabContents[tabIndex]).addClass('active');

    if (typeof callback[tabIndex] === 'function') {
        callback[tabIndex]();
    }

    var tabId = $(this).attr('tab-id');

    if (tabId && typeof commonCallback === 'function') {
        commonCallback(tabId);
    }
});

module.exports = {
    setCallback: function () {
        if (arguments.length > 0 && typeof arguments[0] === 'function') {
            commonCallback = arguments[0];
        }
        else if (arguments.length > 1 && typeof arguments[0] === 'number' && typeof arguments[1] === 'function') {
            callback[arguments[0]] = arguments[1];
        }
    }
};