require('bootstrap');
require('../less/theres.less');
require('../less/ht-tab.less');

var common = require('./common');
var tab = require('./ht-tab');

var moment = require('moment-timezone');

var URLSearchParams = require('url-search-params');
var params = new URLSearchParams(location.search);
var theresId = params.get('id');

$.ajax({
    url: '/api/there/' + theresId,
    success: function (result) {
        initThere(result);
    }
});

function initThere(model) {
    $('.ht-section-there').css('background-image', 'url(' + model.background + ')');

    $('.ht-there-name').html(model.name);
    $('.ht-there-summary').html(model.summary);

    var areaInfoTemplate = require('../template/theres/area-info.hbs');
    var areaInfoHtml = areaInfoTemplate(model);

    $('.ht-area-info').html(areaInfoHtml);

    var areaDatetimeTemplate = require('../template/theres/area-timedate.hbs');

    var areaDatetimeHtml = areaDatetimeTemplate({
        time: moment().tz(model.timezone).format('hh:mm'),
        apm: moment().tz(model.timezone).format('a'),
        date: moment().tz(model.timezone).format('YYYY.MM.DD')
    });

    $('.ht-weather-datetime').html(areaDatetimeHtml);

    var lat = model.location.lat;
    var lng = model.location.lng;

    var apiKey = 'd6283abd824b6b45e030b893b30106d6';
    var apiURL = 'http://api.openweathermap.org/data/2.5/weather' +
        '?lat=' + lat + '&lon=' + lng +
        '&appid=' + apiKey +
        '&units=metric' +
        '&callback=?';

    $.getJSON(apiURL, function (result) {
        var icon = result.weather[0].icon;
        var degree = result.main.temp;

        var areaForecastTemplate = require("../template/theres/area-forecast.hbs");
        var areaForecastHtml = areaForecastTemplate({
            icon: './img/weather/' + icon + '.svg',
            degree: '30'
        });

        $('.ht-weather-forecast').html(areaForecastHtml);
    });

    var areaTrafficTemplate = require('../template/theres/area-traffic.hbs');
    var areaTrafficHtml = areaTrafficTemplate(model);

    $('.ht-traffic-list').html(areaTrafficHtml);

    var loadGoogleMapsApi = require('load-google-maps-api-2');

    loadGoogleMapsApi.key = 'AIzaSyDfcKmZL8-AZDEa6vVGBQyeZj77KcIfiuU';
    loadGoogleMapsApi.language = 'ko';
    loadGoogleMapsApi.version = '3';

    var $googleMaps;
    var areaMap;
    var marker;

    loadGoogleMapsApi().then(function (googleMaps) {  // 성공시
        $googleMaps = googleMaps;
        areaMap = new googleMaps.Map($('#ht-area-map')[0], {
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

    tab.setCallback(2, function () {    // function = handler
        $googleMaps.event.trigger(areaMap, 'resize');
        areaMap.panTo(model.location);
    });

    $('.ht-area-name').text(model.nameEn);
}


var activityTemplate = require('../template/ht-activity.hbs');
var activities = require('./model/theres/' + theresId + '-activities');

for (var i = 0; i < activities.length; i++) {
    var activityModel = activities[i];
    var activityHtml = activityTemplate(activityModel);

    $('.ht-activities-list').append(activityHtml);
}

















