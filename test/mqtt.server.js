var jayson = require('../');
var musher = require("musher");

var server = jayson.server({
    onoff_add: function (a, b, callback) {
        return callback(null, a + b);
    }
});


var bus = musher.connect({host: 'localhost'});


// "http" will be an instance of require('http').Server
var mqtt = server.mqtt({
    topic: "$device/1234567890/channel/:protocol",
    bus: bus
});