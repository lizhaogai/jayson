var utils = require('../utils');

var MqttServer = function (server, options) {
    if (!(this instanceof MqttServer)) return new MqttServer(server, options);

    var self = this;
    self.server = server;
    self.options = utils.merge(server.options, options || {});
    self.topic = options.topic;
    self.bus = options.bus;
    self.rpcEvent = options.rpcEvent || 'rpc';
    self.replyEvent = options.replyEvent || 'reply';

    var channel = self.bus.subscribe(self.topic);

    channel.on(self.rpcEvent, function (data, route) {
        self.handle(route.topic, data);
    });
};

MqttServer.prototype.handle = function (topic, request) {
    var self = this;
    var options = self.options || {};
    self.server.call(request, function (error, success) {
        var response = error || success;
        if (response) {
            utils.JSON.stringify(response, options, function (err, body) {
                if (err) {
                    self.bus.publish(topic, self.replyEvent, err);
                }
                self.bus.publish(topic, self.replyEvent, body);
            });
        } else {
            // no response received at all, must be a notification
        }
    });
};

module.exports = MqttServer;

