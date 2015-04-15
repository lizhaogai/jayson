var jayson = require('../');
var musher = require("musher");

var bus = musher.connect({host: 'localhost'});

var client = jayson.client.mqtt({
    topic: "$device/:did/channel/:protocol",
    _topic: "$device/%s/channel/%s",
    bus: bus
});

// the third parameter is set to "null" to indicate a notification
client.info({
    deviceId: "1234567890",
    channelId: "on-off"
}).request('onoff_add', [4, 1], '1212weidsionvsd', function (err, response) {
    if (err) throw err;
    console.log(response);
    // request was received successfully
});