var htOption = require('./ht-option');
var htPrice = require('./ht-price');

// 이렇게 해야 사전처리나 공통처리를 할 수 있음
// 에러 처리하는 ajax module
function ajax(options) {
    if (!options.error) {
        options.error = function (jqXHR) {
            var errorCode = jqXHR.responseJSON.errorCode;

            if (errorCode === 403) {
                $('.header-btn-member').click();    // 강제로 로그인 메뉴 호출
            }

            alert(jqXHR.responseJSON.message);
        };
    }

    $.ajax(options);
}

$('body').on('click', function (event) {
    var target = $(event.target);

    if (target.closest('.ht-option-control').length > 0) {
        htOption.handler(target);
    }
    else if (target.closest('.ht-price-btn').length > 0) {
        htPrice.handler(target.closest('.ht-price-btn'));
    }
    else {
        htOption.closeAll();
    }
});

ajax({
    url: '/api/menu/json',
    success: function (result) {
        initMenu(result);
    }
});

function initMenu(menus) {
    var template = require('../template/header-menu.hbs');

    $('.header-menu').empty();

    for (var i = 0; i < menus.length; i++) {
        var menuHtml = template(menus[i]);

        $('.header-menu').append(menuHtml);
    }
    attachEvent();
}

$('.header-logo').on('click', function () {
    location.href = './';
});

function attachEvent() {
    $('.header-sub-menu > li').on('click', function () {
        var theresId = $(this).attr('theres-id');
        location.href = './theres.html?id=' + theresId;
    });

    $('.header-menu > li').on('mouseover', function () {
        var subMenu = $(this).find('.header-sub-menu');
        var subMenuItemWidth = subMenu.find('li').outerWidth(); // 여백까지 나오게 하려면 outerWidth()
        var subMenuItemMaxCount = 5;
        var subMenuItemCount = subMenu.find('li').length;

        var width = subMenuItemWidth * Math.min(subMenuItemCount, subMenuItemMaxCount);

        if ($(this).offset().left + width > $(window).width()) {
            var subMenuLeft = $(window).width() - ($(this).offset().left + width);
            subMenu.css('left', subMenuLeft);
        }
        else {
            subMenu.css('left', 0);
        }

        subMenu.width(width);
        subMenu.show();
    });

    $('.header-menu > li').on('mouseout', function () {
        $(this).find('.header-sub-menu').hide();
    });
}

$('.header-btn-member').on('click', function () {
    // 로그인 했는지 안했는지
    ajax({
        url: '/api/member/get',
        success: function (result) {
            openMemberLayer(result);
        }
    });
});

function signIn() {
    // validation 먼저 함.
    var email = $('#ht-sign-in-email').val().trim();
    var password = $('#ht-sign-in-password').val().trim();
    var remember = $('#ht-sign-in-remember').prop('checked');

    if (!email) {
        alert('이메일을 입력하세요.');
        $('#ht-sign-in-email').focus();
        return;
    }
    else if (!password) {
        alert('비밀번호를 입력하세요.');
        $('#ht-sign-in-password').focus();
        return;
    }

    ajax({
        url: '/api/member/signin',
        method: 'POST',
        data: {
            email: email,
            password: password,
            remember: remember
        },
        success: function (result) {
            alert(result.email + ' 님 반갑습니다.');
            closeMemberLayer();
        }
    });
}

function signUp() {
    // validation 먼저 함.
    var email = $('#ht-sign-up-email').val().trim();
    var password = $('#ht-sign-up-password').val().trim();
    var agree = $('#ht-sign-up-agree').prop('checked'); // 체크가 됐는지 안됐는지

    if (!email) {
        alert('이메일을 입력하세요.');
        $('#ht-sign-up-email').focus();
        return;
    }
    else if (!password) {
        alert('비밀번호를 입력하세요.');
        $('#ht-sign-up-password').focus();
        return;
    }
    else if (!agree) {
        alert('약관에 동의하셔야 합니다.');
        return;
    }

    // POST 방식으로 email, password 서버로 보냄
    ajax({
        url: '/api/member/signup',
        method: 'POST',
        data: {
            email: email,
            password: password
        },
        success: function (result) {
            alert('정상적으로 가입되셨습니다.');
            closeMemberLayer();
        }
    });
}

function signOut() {
    ajax({
        url: '/api/member/signout',
        success: function () {
            alert('로그아웃 했음');
            closeMemberLayer();
        }
    });
}

function openMemberLayer(memberInfo) {
    $('body').append('<div class="overlay-layer dark-layer"></div>');
    $('body').css('overflow', 'hidden');

    var memberLayerTemplate = require('../template/member-layer.hbs');
    var memberLayer = memberLayerTemplate(memberInfo);

    $('body').append(memberLayer);

    $('.ht-member-layer').animate({
        right: '0px'
    }, {
        duration: 500,
        complete: function () {
            if (!memberInfo.signedIn) {
                $('.ht-member-toggle').on('click', function () {
                    $('.ht-sign-in').toggle();
                    $('.ht-sign-up').toggle();
                });

                $('#ht-sign-in').on('click', function () {
                    signIn();
                });

                $('#ht-sign-up').on('click', function () {
                    signUp();
                });
            }
            else {
                $('#ht-setting').on('click', function () {
                    location.href = '/setting.html';
                });

                $('#ht-sign-out').on('click', function () {
                    signOut();
                });
            }

            $('.overlay-layer').on('click', function () {
                closeMemberLayer();
            })
        }
    });
}

function closeMemberLayer() {
    $('.ht-member-layer').animate({
        right: '-333px'
    }, {
        duration: 500,
        complete: function () {
            $('.ht-member-layer').remove();
            $('.overlay-layer').remove();
            $('body').css('overflow', 'auto');
        }
    });
}

module.exports = {
    ajax: ajax
};