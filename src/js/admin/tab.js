$('.hta-tab-header > li').on('click', function() {
    if ($(this).hasClass('active')) {   // 클릭된넘이 이미 액티브 갖고있으면
        return;
    }

    // 자기꺼 탭
    var tabHeader = $(this).parent('.hta-tab-header');
    var tabContents = $(this).parents('.hta-tab').find('.hta-tab-contents');

    tabHeader.find('li').removeClass('active');
    tabContents.find('li').removeClass('active');

    var tabId = $(this).attr('tab-id');

    tabHeader.find('li[tab-id=' + tabId + ']').addClass('active');
    tabContents.find('li[tab-id=' + tabId + ']').addClass('active');
});