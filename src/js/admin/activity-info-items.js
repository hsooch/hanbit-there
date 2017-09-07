var items = [];
var handler;

function init(_items, _handler) {
    items = _items;
    handler = _handler;
    setItems();

    $('.hta-activity-info-item-list .hta-add-row').off('click');
    $('.hta-activity-info-item-list .hta-add-row').on('click', function () {
        items.push({
            title: '제목이다',
            icon: '아이콘이다',
            text: '내용이다'
        });

        setItems();
    });

    $('.hta-activity-info-item-list').show();
}

function setItems() {
    $('.hta-activity-info-item tbody').empty();

    var template = require('../../template/admin/activity-info-item.hbs');

    for (var i = 0; i < items.length; i++) {
        items[i].no = i + 1;

        var html = template(items[i]);

        $('.hta-activity-info-item tbody').append(html);
    }

    if (typeof handler === 'function') {
        handler(items.length);
    }

    addItemEvents();
}

function addItemEvents() {
    addBtnRowEvents();

    $('.hta-activity-info-item tbody tr').off('dblclick');
    $('.hta-activity-info-item tbody tr').on('dblclick', function () {
        var row = $(this);
        var rowIndex = row.index();
        var info = items[rowIndex];
        var template = require('../../template/admin/activity-info-item-edit.hbs');
        var html = template(info);

        row.replaceWith(html);

        addBtnRowEvents();
    });
}

function addBtnRowEvents() {
    $('.hta-activity-info-item .hta-btn-row').off('click');
    $('.hta-activity-info-item .hta-btn-row').on('click', function () {
        var row = $(this).parents('tr');
        var rowIndex = row.index();
        var info = items[rowIndex];

        if ($(this).hasClass('hta-apply-row')) {
            info.title = row.find('.hta-activity-info-item-title').val().trim();
            info.icon = row.find('.hta-activity-info-item-icon').val().trim();
            info.text = row.find('.hta-activity-info-item-text').val().trim();
        }
        else if ($(this).hasClass('hta-remove-row')) {
            _.remove(items, function (value, index) {
                return rowIndex === index;
            });

            setItems();
            return;
        }
        else if ($(this).hasClass('hta-up-row')) {
            if (rowIndex < 1) {
                return;
            }

            items = _.move(items, rowIndex, rowIndex - 1);

            setItems();
            return;
        }
        else if ($(this).hasClass('hta-down-row')) {
            if (rowIndex >= items.length - 1) {
                return;
            }

            items = _.move(items, rowIndex, rowIndex + 1);

            setItems();
            return;
        }

        var template = require('../../template/admin/activity-info-item.hbs');
        var html = template(info);
        row.replaceWith(html);

        addItemEvents();
    });
}

module.exports = {
    init: init
};