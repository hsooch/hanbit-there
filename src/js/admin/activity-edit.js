require('../../less/admin/activity-edit.less');

var _ = require('lodash');
_.move = require('lodash-move').default;

var UrlSearchParams = require('url-search-params');
var params = new UrlSearchParams(location.search);

var common = require('./common');

// 이거만 고치고 싹 지우고 그대로 다시 보여줌
// 유저 눈에는 ui 가 움직이는것 처럼 보임
var model = {
    location: {},
    lists: []
};

var validId = false;
var photos = [];

$.ajax({
    url: '/api/admin/there/groups',
    success: function (result) {
        var thereGroupItemsTemplate = require('../../template/admin/there-group-items.hbs');
        var thereGroupItemsHtml = thereGroupItemsTemplate(result);

        $('#hta-there-group-select .dropdown-menu').html(thereGroupItemsHtml);

        $('#hta-there-group-select .dropdown-menu a').on('click', function (event) {
            common.addDropdownEvent(event, this);

            $('#hta-there-select .dropdown-title').html('지역');
            $('#hta-there-select .dropdown-menu').empty();
            $('.hta-activity-list').empty();
            delete model.thereId;  // thereId 라는 key 를 지움

            var groupId = $(this).attr('group-id');
            requestTheres(groupId);
        });
    }
});

function requestTheres(groupId) {
    $.ajax({
        url: '/api/admin/there/list',
        data: {
            groupId: groupId
        },
        success: function (result) {
            var thereItemsTemplate = require('../../template/admin/there-items.hbs');
            var thereItemsHtml = thereItemsTemplate(result);

            $('#hta-there-select .dropdown-menu').html(thereItemsHtml);

            $('#hta-there-select .dropdown-menu a').on('click', function (event) {
                common.addDropdownEvent(event, this);

                var thereId = $(this).attr('there-id');
                model.thereId = thereId;
            });
        }
    });
}

function addPreview(url, saved) {
    var preview = $('<li><div class="hta-photo-remove">X</div></li>');
    preview.attr('saved', saved);

    preview.css({
        'background-image': 'url(' + url + ')',
        'width': '50px',
        'height': '50px'
    });

    $('.hta-photos').append(preview);

    $('.hta-photos > li:last-child .hta-photo-remove').on('click', function () {
        var photo = $(this).parent('li');

        var saved = photo.attr('saved') === 'true';
        var savedPhotoCount = model.photos ? model.photos.length : 0;

        var index = saved ? photo.index() : photo.index() - savedPhotoCount;

        if (saved) {
            model.photos[index] = '_removed_';
            photo.hide();
        }
        else {
            photos.splice(index, 1);
            photo.remove();
        }
    });
}

$('#hta-activity-photos').on('change', function () {
    if (this.files.length === 0) {
        return;
    }

    for (var i = 0; i < this.files.length; i++) {
        var file = this.files[i];

        if (!file.type.startsWith('image/')) {  // mime 타입이 이미지가 아닐 경우
            continue;
        }

        photos.push(file);

        var fileReader = new FileReader();

        fileReader.onload = function (event) {
            addPreview(event.target.result, false);
        };

        fileReader.readAsDataURL(file);
    }
});


$('#hta-activity-id').on('change', function () {
    validId = false;
});

function addCheckDuplicateEvent() {
    $('.hta-check-duplicate').on('click', function () {
        var id = $('#hta-activity-id').val().trim();

        if (!id) {
            alert('지역ID를 입력하세요.');
            $('#hta-activity-id').focus();
            return;
        }
        else if (!/^[a-zA-Z][0-9a-zA-Z\-]{3,}$/.test(id)) {
            alert('잘못된 ID형식입니다.');
            $('#hta-activity-id').focus();
            return;
        }

        $.ajax({
            url: '/api/admin/activity/' + id,
            method: 'OPTIONS',
            success: function (result) {
                if (!result.exists) {
                    alert('사용할 수 있는 ID입니다.');
                    validId = true;
                }
                else {
                    alert('사용할 수 없는 ID입니다.');
                    $('#hta-activity-id').focus();
                    validId = false;
                }
            }
        });
    });
}

$('.hta-activity-info-list .hta-add-row').on('click', function () {
    model.lists.push({
        title: '제목',
        type: 'dot',
        items: []
    });

    setInfoLists();
});

function setInfoLists() {
    $('.hta-activity-info tbody').empty();

    var template = require('../../template/admin/activity-info.hbs');

    for (var i = 0; i < model.lists.length; i++) {
        model.lists[i].no = i + 1;

        var html = template(model.lists[i]);

        $('.hta-activity-info tbody').append(html);
    }

    addInfoListsEvents();
}

function addInfoListsEvents() {
    addBtnRowEvents();

    $('.hta-activity-info tbody tr').off('dblclick');
    $('.hta-activity-info tbody tr').on('dblclick', function () {
        var row = $(this);
        var rowIndex = row.index();
        var info = model.lists[rowIndex];
        var template = require('../../template/admin/activity-info-edit.hbs');
        var html = template(info);

        row.replaceWith(html);

        addBtnRowEvents();
    });

    $('.hta-activity-info tbody tr').off('click');
    $('.hta-activity-info tbody tr').on('click', function () {
        $('.hta-activity-info tbody tr').removeClass('selected');
        $(this).addClass('selected');

        var index = $(this).index();

        require('./activity-info-items')
            .init(model.lists[index].items, function (itemCount) {
                $('.hta-activity-info tbody tr.selected .hta-item-count').text(itemCount);
            });
    });
}

function addBtnRowEvents() {
    $('.hta-activity-info .hta-btn-row').off('click');
    $('.hta-activity-info .hta-btn-row').on('click', function () {
        $('.hta-activity-info-item-list').hide();

        var row = $(this).parents('tr');
        var rowIndex = row.index();
        var info = model.lists[rowIndex];

        if ($(this).hasClass('hta-apply-row')) {
            info.title = row.find('.hta-activity-info-title').val().trim();
            info.type = row.find('.hta-activity-info-type').val().trim();
        }
        else if ($(this).hasClass('hta-remove-row')) {
            _.remove(model.lists, function (value, index) {
                return rowIndex === index;
            });

            setInfoLists();
            return;
        }
        else if ($(this).hasClass('hta-up-row')) {
            if (rowIndex < 1) {
                return;
            }

            model.lists = _.move(model.lists, rowIndex, rowIndex - 1);

            setInfoLists();
            return;
        }
        else if ($(this).hasClass('hta-down-row')) {
            if (rowIndex >= model.lists.length - 1) {
                return;
            }

            model.lists = _.move(model.lists, rowIndex, rowIndex + 1);

            setInfoLists();
            return;
        }

        var template = require('../../template/admin/activity-info.hbs');
        var html = template(info);
        row.replaceWith(html);

        addInfoListsEvents();
    });
}

$('.hta-save').on('click', function () {
    model.id = $('#hta-activity-id').val().trim();
    model.name = $('#hta-activity-name').val().trim();
    model.video = $('#hta-activity-video').val().trim();
    model.location = {
        lat: $('#hta-activity-lat').val().trim(),
        lng: $('#hta-activity-lng').val().trim()
    };
    model.intro = $('#hta-activity-intro').val().trim();

    if (!model.thereId) {
        alert('지역을 선택하세요.');
        return;
    }
    else if (!model.id) {
        alert('액티비티ID를 입력하세요.');
        $('#hta-activity-id').focus();
        return;
    }
    else if (!validId) {
        alert('액티비티ID 중복확인을 해주세요.');
        $('#hta-activity-id').focus();
        return;
    }
    else if (!model.name) {
        alert('액티비티명을 입력하세요.');
        $('#hta-activity-name').focus();
        return;
    }
    else if (!photos.length && !_.filter(model.photos, function (value) {
            return value !== '_removed_';
        }).length) {
        alert('사진을 한개 이상 추가하세요.');
        return;
    }
    else if (!model.location.lat) {
        alert('위도를 입력하세요.');
        $('#hta-activity-lat').focus();
        return;
    }
    else if (!model.location.lng) {
        alert('경도를 입력하세요.');
        $('#hta-activity-lng').focus();
        return;
    }
    else if (!model.intro) {
        alert('소개를 입력하세요.');
        $('#hta-activity-intro').focus();
        return;
    }

    if (model.lists) {
        model.lists.forEach(function (list) {
            delete list.no;

            if (!list.items) {
                return;
            }

            list.items.forEach(function (item) {
                delete item.no;
            });
        });
    }

    delete model.there;

    var formData = new FormData();
    formData.append('model', JSON.stringify(model));    // model 을 String 화

    photos.forEach(function (photo) {
        formData.append('photos', photo);
    });

    $.ajax({
        url: '/api/admin/activity/save',
        method: 'POST',
        contentType: false,
        processData: false,
        data: formData,
        success: function (result) {
            alert('정상적으로 저장되었습니다.');

            location.href = './activity-edit.html?id=' + model.id;
        },
        error: function () {
            alert('저장 중 오류가 발생하였습니다.');
        }
    });
});

$('.hta-cancel').on('click', function () {
    history.back();
});

function addDeleteEvent() {
    $('.hta-delete').on('click', function () {
        // TODO 삭제처리
    });
}

function init() {
    if (model.id) {
        $('#hta-there-group-select button').attr('disabled', true);
        $('#hta-there-group-select .dropdown-title').text(model.there.groupId);
        $('#hta-there-select button').attr('disabled', true);
        $('#hta-there-select .dropdown-title').text(model.there.name);

        $('#hta-activity-id').val(model.id);
        $('#hta-activity-id').attr('disabled', true);
        $('.hta-check-duplicate').hide();
        validId = true;

        addDeleteEvent();
    }
    else {
        $('.hta-delete').hide();

        addCheckDuplicateEvent();
    }

    $('#hta-activity-name').val(model.name);

    if (model.photos) {
        model.photos.forEach(function (url) {
            addPreview(url, true);
        });
    }

    $('#hta-activity-video').val(model.video);
    $('#hta-activity-lat').val(model.location.lat);
    $('#hta-activity-lng').val(model.location.lng);
    $('#hta-activity-intro').val(model.intro);

    setInfoLists();
}

if (!params.get('id')) {
    init();
}
else {
    $.ajax({
        url: '/api/activity/' + params.get('id'),
        success: function (result) {
            model = result;
            init();
        }
    });
}