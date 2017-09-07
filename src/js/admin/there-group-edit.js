require('../../less/admin/there-group-edit.less');

var common = require('./common');

var URLSearchParams = require('url-search-params');
var params = new URLSearchParams(location.search);
var id = params.get('id');
var pageType;
var validId = false;

// 취소 버튼
$('.hta-cancel').on('click', function () {
    location.href = './there-group.html';
});

// 저장 버튼
$('.hta-save').on('click', function () {
    var groupId = $('#hta-there-group-id').val().trim();
    var groupName = $('#hta-there-group-name').val().trim();

    // 중복체크 안했을 경우
    if (!validId) {
        alert('지역그룹ID 중복체크를 해주세요.');
        return;
    }
    else if (!groupId) {
        alert('지역그룹ID를 입력하세요.');
        $('#hta-there-group-id').focus();
        return;
    }
    else if (!groupName) {
        alert('지역그룹명을 입력하세요.');
        $('#hta-there-group-name').focus();
        return;
    }

    var url;

    // 추가
    if (pageType == 'add') {
        url = '/api/admin/there/group/add';
    }
    // 수정
    else if (pageType == 'edit') {
        url = '/api/admin/there/group/' + id;
    }

    $.ajax({
        url: url,
        method: 'POST',
        data: {
            id: groupId,
            name: groupName
        },
        success: function (result) {
            location.href = './there-group.html';
        }
    });
});

function init(id) {
    if (!id) {  // id 가 없으면 추가 페이지로 감
        pageType = 'add';
        $('.hta-delete').hide();

        $('#hta-there-group-id').on('change', function () {
            validId = false;
        });

        $('.hta-check-duplicate').on('click', function () {
            var groupId = $('#hta-there-group-id').val().trim();

            if (!groupId) {
                alert('지역그룹ID를 입력하세요.');
                $('#hta-there-group-id').focus();
                return;
            }

            $.ajax({
                url: '/api/admin/there/group/' + groupId,
                method: 'OPTIONS',
                success: function (result) {
                    if (!result.exists) {
                        alert('사용할 수 있는 ID입니다.');
                        validId = true;
                    }
                    else {
                        alert('사용할 수 없는 ID입니다.');
                        $('#hta-there-group-id').focus();
                        validId = false;
                    }
                }
            });
        });
    }
    else {  // id 가 있으면 수정 페이지로 감
        pageType = 'edit';
        $('.hta-check-duplicate').hide();
        $('#hta-there-group-id').attr('disabled', true);

        $.ajax({
            url: '/api/admin/there/group/' + id,
            method: 'GET',
            success: function (result) {
                $('#hta-there-group-id').val(result.id);
                $('#hta-there-group-name').val(result.name);
                validId = true;
            }
        });

        $('.hta-delete').on('click', function () {
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
                            url: '/api/admin/there/group/' + id,
                            method: 'DELETE',
                            success: function (result) {
                                location.href = './there-group.html';
                            },
                            error: function () {
                                alert('포함된 지역이 있으면 삭제할 수 없습니다.')
                            }
                        });

                        common.closeDialog();
                    }
                }
            });
        });
    }
}

init(id);