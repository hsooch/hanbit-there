function optionControlHandler(target) {
    if (target.closest('.ht-option-selectbox').length > 0) {
        selectboxHandler(target);
    }
    else if (target.closest('.ht-options').length > 0) {
        optionHandler(target);
    }
}

function selectboxHandler(target) {
    var options = target.parents('.ht-option-control').find('.ht-options');
    closeOptions(options[0]);

    options.toggle();

    var caret = target.find('.ht-option-caret');
    if (caret.hasClass('fa-angle-down')) {
        caret.removeClass('fa-angle-down');
        caret.addClass('fa-angle-up');
    }
    else {
        caret.removeClass('fa-angle-up');
        caret.addClass('fa-angle-down');
    }
}

function optionHandler(target) {
    if (target.hasClass('.ht-options')) {
        return;
    }

    var option = target.closest('li');  // 자기자신이 li 일수도 있으니까 parent 로 찾음 안됨
    var optionHtml = option.html();
    var selectbox = option.parents('.ht-option-control').find('.ht-option-selectbox');

    selectbox.find('span').html(optionHtml);
    closeOptions();
}

function closeOptions(except) {
    $('.ht-options').each(function (index, element) {
        if (except === element) {
            return;
        }

        var options = $(element);
        var caret = options.parents('.ht-option-control').find('.ht-option-caret');

        caret.removeClass('fa-angle-up');
        caret.addClass('fa-angle-down');

        options.hide();
    });
}

module.exports = {
    handler: optionControlHandler,
    closeAll: function () {
        closeOptions();
    }
};