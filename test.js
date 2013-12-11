var ef = require('./eventfabric');
var client = ef.client("your_username", "your_password");

function onLoginSuccess (data) {
    var value = {
        "text": "cpu",
        "percentage": Math.random() * 100
    };

    function onEventSent(status, data) {
        var eventSent = JSON.parse(data);
        console.log("event sent", status, eventSent);
    }

    function onEventFail (status, res) {
        console.error("event error", status, res);
    }

    client.sendEvent(value, "your_channel", onEventSent, onEventFail);
}

function onLoginFail(err) {
    console.error("login error", err);
}

client.login(onLoginSuccess, onLoginFail);

