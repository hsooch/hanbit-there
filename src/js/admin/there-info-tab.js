var areaInfo = [];

function init(_areaInfo) {
    areaInfo = _areaInfo;
    setAreaInfo();

    $('[tab-id=info] .hta-add-row').on('click', function() {
        areaInfo.push({
            title: '제목',
            value: '내용'
        });

        setAreaInfo();
    });
}

function setAreaInfo() {
    $('.hta-area-info tbody').empty();

    var template = require('../../template/admin/there-info.hbs');

    for (var i = 0; i < areaInfo.length; i++) {
        areaInfo[i].no = i + 1;     // 모델에 이렇게 새로운 키 추가 가능함

        var html = template(areaInfo[i]);

        $('.hta-area-info tbody').append(html);
    }

    addAreaInfoEvents();
}

function addAreaInfoEvents() {
    addBtnRowEvents();  // 세팅후 바로 이벤트

    $('.hta-area-info tbody tr').off('dblclick');   // 이벤트가 중복으로 걸리는걸 방지하기 위해 일단 뺌
    $('.hta-area-info tbody tr').on('dblclick', function () {
        var row = $(this);
        var index = row.index();
        var info = areaInfo[index];
        var template = require('../../template/admin/there-info-edit.hbs');
        var html = template(info);

        row.replaceWith(html);

        addBtnRowEvents();  // 더블클릭 하면 이벤트
    });
}

function addBtnRowEvents() {
    $('.hta-area-info .hta-btn-row').off('click');     // 이벤트가 중복으로 걸리는걸 방지하기 위해 일단 뺌
    $('.hta-area-info .hta-btn-row').on('click', function () {
        var row = $(this).parents('tr');
        var rowIndex = row.index();
        var info = areaInfo[rowIndex];

        if ($(this).hasClass('hta-apply-row')) {
            info.title = row.find('.hta-area-info-title').val().trim();
            info.value = row.find('.hta-area-info-value').val().trim();
        }
        else if ($(this).hasClass('hta-remove-row')) {
            _.remove(areaInfo, function (value, index) {
                return rowIndex === index;     // true 가 걸리면 지워짐
            });

            setAreaInfo();
            return;
        }
        else if ($(this).hasClass('hta-up-row')) {
            if (rowIndex < 1) {
                return;
            }

            areaInfo = _.move(areaInfo, rowIndex, rowIndex - 1);

            setAreaInfo();
            return;
        }
        else if ($(this).hasClass('hta-down-row')) {
            if (rowIndex >= areaInfo.length - 1) {
                return;
            }

            areaInfo = _.move(areaInfo, rowIndex, rowIndex + 1);

            setAreaInfo();
            return;
        }

        var template = require('../../template/admin/there-info.hbs');
        var html = template(info);
        row.replaceWith(html);

        addAreaInfoEvents();
    });
}

module.exports = {
    init: init
};