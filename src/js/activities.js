require('bootstrap');
require('../less/activities.less');
require('eonasdan-bootstrap-datetimepicker');
require('eonasdan-bootstrap-datetimepicker/build/css/bootstrap-datetimepicker.min.css');

var moment = require('moment');
var UrlSearchParams = require('url-search-params');
var params = new UrlSearchParams(location.search);

var common = require('./common');
var tab = require('./ht-tab');
var carousel = require('./ht-carousel');
var htPrice = require('./ht-price');

function initActivity(model) {
    if (!model) {
        return;
    }

    $('.ht-activity-name').html(model.name);
    $('.ht-activity-in').html('in ' + model.there.nameEn);
    $('.ht-section-activity').css('background-image', 'url(' + model.there.background + ')');

    carousel.init($('.ht-activity-photos'),
        model.photos,
        function (slide) {
            var slideElement = $('<li></li>');
            slideElement.css('background-image', 'url(' + slide + ')');

            return slideElement;
        }, {
            slideDuration: 1000,
            slideInterval: 5000
        });

    if (model.video) {
        $('.ht-activity-video').html(model.video);
    }

    var loadGoogleMapsApi = require('load-google-maps-api-2');

    loadGoogleMapsApi.key = 'AIzaSyDfcKmZL8-AZDEa6vVGBQyeZj77KcIfiuU';
    loadGoogleMapsApi.language = 'ko';
    loadGoogleMapsApi.version = '3';

    var $googleMaps;
    var areaMap;
    var marker;

    loadGoogleMapsApi().then(function (googleMaps) {  // 성공시
        $googleMaps = googleMaps;
        areaMap = new googleMaps.Map($('#ht-activity-map')[0], {
            center: model.location,
            scrollwheel: true,
            zoom: 12
        });
        marker = new googleMaps.Marker({
            position: model.location,
            map: areaMap,
            title: '여기가' + model.name
        });
    }).catch(function (error) {  // 실패시
        console.error(error);
    });

    $('.ht-activity-intro-text').html(model.intro);

    var listTemplate = require('../template/activities/info-list.hbs');

    for (var i = 0; i < model.lists.length; i++) {
        var listHtml = listTemplate(model.lists[i]);

        $('.ht-activity-info-text').append(listHtml);
    }

    tab.setCallback(function (tabId) {
        if (tabId === 'map') {
            $googleMaps.event.trigger(areaMap, 'resize');
            areaMap.panTo(model.location);
        }
    });

    $('#ht-datepicker').datetimepicker({
        inline: true,
        locale: 'ko',
        dayViewHeaderFormat: 'YYYY년 MMMM',
        format: 'YYYYMMDD',
        useCurrent: false,
        minDate: moment().add(1, 'days').startOf('day'),
        maxDate: moment().add(2, 'months').endOf('month'),
        disabledDates: ['20170815', '20170822', '20170829']
    });

    $('#ht-datepicker').on('dp.change', function (event) {  // datepicker 이벤트
        $('.ht-booking-datepick-msg').hide();
        $('.ht-booking-options-box').show();
    });

    $('#ht-booking-option-1 .ht-options > li').on('click', function () {
        $('.ht-price-box').removeClass('disabled');

        // 뭐가 선택됐냐에 따라서 가격이 달라질 수 있으니까 여따둠
        htPrice.setUpdateListener(function () {
            var total = 0;
            var modelIds = ['adult', 'kid', 'baby'];

            modelIds.forEach(function (modelId) {
                var model = htPrice.getModel(modelId);

                if (!model) {
                    return;
                }

                total += model.count * model.price;
            });

            var point = parseInt(total * 0.02);

            $('.ht-booking-price-total .total').text('￦' + total.toLocaleString());
            $('.ht-booking-price-point .point').html(point.toLocaleString() + '<span>P</span>');
        });
        htPrice.setModel('adult', {
            count: 1,
            price: 32340,
            maxCount: 30,
            minCount: 0
        });
        htPrice.setModel('kid', {
            count: 0,
            price: 12540
        });
        htPrice.setModel('baby', {
            count: 0,
            price: 0
        });
    });
}

function init(id) {
    $.ajax({
        url: '/api/activity/' + id,
        success: function (result) {
            initActivity(result);
        }
    });
}

init(params.get('id'));

