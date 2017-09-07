require('bootstrap');
require('../less/setting.less');

var common = require('./common');
var tab = require('./ht-tab');

// 로그인 안하면 이 페이지 못들어옴
common.ajax({
    url: '/api/member/get',  // 사용자정보 가져옴
    success: function (result) {
        if (!result.signedIn) {
            alert('로그인이 필요한 페이지입니다.');
            location.href = '/';
        }
    }
});