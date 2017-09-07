require('bootstrap');

$('.hta-menu').on('click', function () {
    var subMenu = $(this).parent('.hta-menu-group').find('.hta-sub-menu');

    //$('.hta-sub-menu').css('display', 'none');
    subMenu.slideToggle();
});

$('.hta-logo').on('click', function () {
    location.href = './';
});

$('.hta-sub-menu > li').on('click', function () {
    var link = $(this).attr('link');

    if (!link) {
        return;
    }

    location.href = link + '.html';
});

// 드롭다운 리스트 타이틀 바꾸기
$('.dropdown-menu a').on('click', function (event) {
    addDropdownEvent(event, this);
});

// 파일 셀렉터
$('.hta-file-select').on('click', function() {
    var fileInputId = $(this).attr('for');

    $('#' + fileInputId).click();
});

function addDropdownEvent(event, element) {
    event.preventDefault(); // 원래 이벤트의 기본동작을 막음 (ex. a href 이동 막음)

    var html = $(element).html();
    var dropdownTitle = $(element).parents('.btn-group').find('.dropdown-title');
    dropdownTitle.html(html);
}

// 삭제 팝업창
function openDialog(options) {
    var modalTemplate = require('../../template/admin/modal.hbs');
    var modalHtml = modalTemplate({
        // modal.hbs 에 있는 {{}} 변수들
        title: options.title || 'HT Admin',     // 만약에 options.title 이 없으면 undefined 이므로 false
        body: options.body,
        buttons: options.buttons || []          // buttons 가 비어있으면 걍 빈배열
    });
    var dialog = $(modalHtml);

    $('body').append(dialog);

    $('.hta-dialog-btn').on('click', function () {
        // function 타입 일때만 실행
        if (typeof options.handler === 'function') {
            var btnId = $(this).attr('btn-id');

            options.handler(btnId);
        }
    });

    $('.hta-modal').on('hidden.bs.modal', function () {
        $('.hta-modal').remove();
    });

    $('.hta-modal').modal('show');
}

// 팝업창 닫기
function hideDialog() {
    $('.hta-modal').modal('hide');
}

// 딴데서 쓰려면 export 해줘야함 그럼 xx.openDialog, xx.closeDialog 로 다른데서 부를수 있다
module.exports = {
    openDialog: openDialog,
    closeDialog: hideDialog,
    addDropdownEvent: addDropdownEvent
};