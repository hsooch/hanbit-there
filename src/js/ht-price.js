var models = {};
var updateListener;

function priceControlHandler(target) {
    var priceControl = target.parents('.ht-price-control');
    var priceBox = priceControl.find('.ht-price-box');

    if (priceBox.hasClass('disabled')) {
        return;
    }

    var modelId = priceControl.attr('model-id'); // model-id = adult, kid, baby

    if (!models[modelId]) {
        return;
    }

    var model = models[modelId];

    if (target.hasClass('ht-price-count-plus')) {
        model.count = Math.min(model.maxCount || 50, model.count + 1);
    }
    else if (target.hasClass('ht-price-count-minus')) {
        model.count = Math.max(model.minCount || 0, model.count - 1);
    }

    updatePriceBox(modelId);
}

function updatePriceBox(modelId) {
    var priceBox = $('.ht-price-control[model-id=' + modelId + '] .ht-price-box');
    var model = models[modelId];

    if (priceBox.length < 1 || !model) {
        return;
    }

    var priceCount = priceBox.find('.ht-price-count');
    var price = priceBox.find('.ht-price');

    priceCount.text(model.count);
    price.text('￦' + (model.price * model.count).toLocaleString()); // toLocaleString() -> , 찍어줌

    if (typeof updateListener === 'function') {
        updateListener();
    }
}

function setModel(id, model) {
    models[id] = model;

    updatePriceBox(id);
}

function getModel(id) {
    return models[id];
}

module.exports = {
    handler: priceControlHandler,
    setModel: setModel,
    getModel: getModel,
    setUpdateListener: function (listener) {
        if (typeof listener !== 'function') {
            return;
        }
        updateListener = listener;
    }
};