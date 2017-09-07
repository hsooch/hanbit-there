require('../../less/admin/there-info-edit.less');

var _ = require('lodash');
_.move = require('lodash-move').default;

var UrlSearchParams = require('url-search-params');
var params = new UrlSearchParams(location.search);

var common = require('./common');
var tab = require('./tab');

var pageType = 'add';
var validId = false;

var groups = [];

var model = {
    location: {},
    areaInfo: [],
    traffics: []
};

// 개발 용도로만 사용
window.printModel = function() {
    var json = JSON.stringify(model); // 데이터 구조를 스트링화 JSON 으로
    var obj = JSON.parse(json);     // 오브젝트화
    console.log(obj);
};

$.ajax({
    url: '/api/admin/there/groups',
    success: function (result) {
        groups = result;
        var thereGroupItemsTemplate = require('../../template/admin/there-group-items.hbs');
        var thereGroupItemsHtml = thereGroupItemsTemplate(result);

        $('#hta-there-group-select .dropdown-menu').html(thereGroupItemsHtml);

        $('#hta-there-group-select .dropdown-menu a').on('click', function (event) {
            common.addDropdownEvent(event, this);

            model.groupId = $(this).attr('group-id');
        });
    }
});

$('#hta-there-background').on('change', function() {
    if (this.files.length === 0) {
        return;
    }

    for (var i=0; i<this.files.length; i++) {
        var file = this.files[i];

        if (!file.type.startsWith('image/')) {  // mime 타입이 이미지가 아닐 경우
            alert('이미지 파일을 선택하세요.');
            return;
        }
    }

    var fileReader = new FileReader();

    // 파일 선택버튼에 이미지 선택한거 삽입
    fileReader.onload = function(event) {
        $('#hta-there-background-preview').css({
            'background-image': 'url(' + event.target.result + ')',
            'height': '250px'
        });
    };

    fileReader.readAsDataURL(this.files[0]);
});

$('.hta-save').on('click', function() {
    model.id = $('#hta-there-id').val().trim();
    model.name = $('#hta-there-name').val().trim();
    model.nameEn = $('#hta-there-name-en').val().trim();
    model.timezone = $('#hta-there-timezone').val().trim();
    model.summary = $('#hta-there-summary').val().trim();
    model.location.lat = $('#hta-there-lat').val().trim();
    model.location.lng = $('#hta-there-lng').val().trim();

    if (!model.groupId) {
        alert('지역그룹을 선택하세요.');
        return;
    }
    else if (!model.id) {
        alert('지역ID를 입력하세요.');
        $('#hta-there-id').focus();
        return;
    }
    else if (!validId) {
        alert('지역ID 중복체크를 해주세요.');
        return;
    }
    else if (!model.name) {
        alert('지역명을 입력하세요.');
        $('#hta-there-name').focus();
        return;
    }
    else if (!model.nameEn) {
        alert('영문지역명을 입력하세요.');
        $('#hta-there-name-en').focus();
        return;
    }
    else if (!model.background && $('#hta-there-background')[0].files.length === 0) {
        alert('배경이미지를 선택하세요.');
        return;
    }
    else if (!model.timezone) {
        alert('지역시간대를 입력하세요.');
        $('#hta-there-timezone').focus();
        return;
    }
    else if (!model.summary) {
        alert('지역설명을 입력하세요.');
        $('#hta-there-summary').focus();
        return;
    }
    else if (!model.location.lat) {
        alert('위도를 입력하세요.');
        $('.hta-tab-header li[tab-id=location]').click();   // 스크립트로 탭 클릭
        $('#hta-there-lat').focus();
        return;
    }
    else if (!model.location.lng) {
        alert('경도를 입력하세요.');
        $('.hta-tab-header li[tab-id=location]').click();
        $('#hta-there-lng').focus();
        return;
    }

    for (var i=0; i<model.areaInfo.length; i++) {
        delete model.areaInfo[i].no;

        if (!model.areaInfo[i].title) {
            alert('정보의 제목을 입력하세요.');
            return;
        }
        else if (!model.areaInfo[i].value) {
            alert('정보의 내용을 입력하세요.');
            return;
        }
    }
    
    for (var i=0; i<model.traffics.length; i++) {
        delete model.traffics[i].no;

        if (!model.traffics[i].icon) {
            alert('교통편의 아이콘을 입력하세요.');
            return;
        }
        else if (!model.traffics[i].title) {
            alert('교통편의 제목을 입력하세요.');
            return;
        }
        else if (!model.traffics[i].contents) {
            alert('교통편의 내용을 입력하세요.');
            return;
        }
    }

    var url;

    if (pageType == 'add') {
        url = '/api/admin/there/add';
    }
    else if (pageType == 'edit') {
        url = '/api/admin/there/' + model.id;
    }

    var formData = new FormData();
    formData.append('json', JSON.stringify(model));

    var background = $('#hta-there-background')[0].files;
    if (background.length > 0) {
        formData.append('background', background[0]);
    }

    $.ajax({
        url: url,
        method: 'POST',
        contentType: false, // multipart/form-data
        processData: false, // multipart/form-data
        data: formData,
        success: function(result) {
            alert('정상적으로 저장되었습니다.');

            if (pageType === 'add') {
                location.href = location.href + '?id='  + model.id;
            }
            else if (pageType === 'edit') {
                location.reload();
            }
        },
        error: function() {
            alert('저장 중 오류가 발생하였습니다.');
        }
    });
});

// 지역정보 삭제
$('.hta-delete').on('click', function() {
    common.openDialog({
        body: '정말 삭제하시겠습니까?',
        buttons: [{
            id: 'delete',
            name: '삭제',
            style: 'danger'
        }],
        handler: function (btnId) {
            if (btnId === 'delete') {
                $.ajax({
                    url: '/api/admin/there/' + model.id,
                    method: 'DELETE',
                    success: function () {
                        alert('정상적으로 삭제되었습니다.');
                        location.href = './there-info.html';
                    },
                    error: function () {
                        alert('삭제 중 오류가 발생하였습니다.');
                    }
                });
            }
        }
    });
});

// 지역정보에서 취소버튼
$('.hta-cancel').on('click', function () {
    history.back(); // 뒤로가기
});

function init() {
    var group = _.find(groups, function(group) {
        return group.id === model.groupId;
    });

    if (group) {
        $('#hta-there-group-select .dropdown-title').html(group.name);
        $('#hta-there-group-select .dropdown-toggle').attr('disabled', true);
    }

    var id = model.id;

    if (id) {
        $('#hta-there-id').val(id);
        $('#hta-there-id').attr('disabled', true);
        $('.hta-check-duplicate').hide();
        pageType = 'edit';
        validId = true;
    }
    else {
        $('.hta-delete').hide();    // .hta-delete 기본속성 none 주고 edit 일때 show() 해도됨
    }

    $('#hta-there-name').val(model.name);
    $('#hta-there-name-en').val(model.nameEn);

    if (model.background) {
        $('#hta-there-background-preview').css({
            'background-image': 'url(' + model.background + ')',
            'height': '250px'
        });
    }

    $('#hta-there-timezone').val(model.timezone);
    $('#hta-there-summary').val(model.summary);

    if (!model.location) {
        model.location = {};
    }
    // model.location = model.location || {};

    $('#hta-there-lat').val(model.location.lat);
    $('#hta-there-lng').val(model.location.lng);

    var thereInfoTab = require('./there-info-tab');
    thereInfoTab.init(model.areaInfo);

    var thereTrafficTab = require('./there-traffic-tab');
    thereTrafficTab.init(model.traffics);

    $('#hta-there-id').on('change', function () {
        validId = false;
    });

    $('.hta-check-duplicate').on('click', function () {
        var id = $('#hta-there-id').val().trim();

        if (!id) {
            alert('지역ID를 입력하세요.');
            $('#hta-there-id').focus();
            return;
        }
        else if (!/^[a-zA-Z][0-9a-zA-Z\-]{3,}$/.test(id)) {
            alert('잘못된 ID형식입니다.');
            $('#hta-there-id').focus();
            return;
        }

        $.ajax({
            url: '/api/admin/there/' + id,
            method: 'OPTIONS',
            success: function (result) {
                if (!result.exists) {
                    alert('사용할 수 있는 ID입니다.');
                    validId = true;
                }
                else {
                    alert('사용할 수 없는 ID입니다.');
                    $('#hta-there-id').focus();
                    validId = false;
                }
            }
        });
    });
}

if (!params.get('id')) {
    init();
}
else {
    $.ajax({
        url: '/api/there/' + params.get('id'),
        success: function(result) {
            model = result;
            init();
        }
    });
}