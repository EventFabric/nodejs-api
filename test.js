/*global console, require*/
var ef = require('./eventfabric'),
username = "admin",
password = "secret",
url = "http://localhost:8080/",
channel = "my.channel",
client = ef.client(username, password, url);

function onLoginSuccess (data) {
    "use strict";
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

    client.sendEvent(value, channel, onEventSent, onEventFail);
}

function onLoginFail(err) {
    "use strict";
    console.error("login error", err);
}

client.login(onLoginSuccess, onLoginFail);

