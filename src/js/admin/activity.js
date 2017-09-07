require('../../less/admin/activity.less');

var common = require('./common');

var Search = require('./search');
var search = new Search($('#hta-activity-search-input'), setList);

$('.hta-add-activity').on('click', function () {
    location.href = './activity-edit.html';
});

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
                requestList(thereId);
            });
        }
    });
}

function requestList(thereId) {
    $.ajax({
        url: '/api/admin/' + thereId + '/activities',
        success: function (result) {
            search.updateList(result);
        }
    });
}

function setList(activities) {
    var activitiesTemplate = require('../../template/admin/activities.hbs');
    var activitiesHtml = activitiesTemplate(activities);

    $('.hta-activity-list').html(activitiesHtml);

    $('.hta-activity-list > li').on('click', function () {
        var activityId = $(this).attr('activity-id');

        location.href = './activity-edit.html?id=' + activityId;
    });
}
