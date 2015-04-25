var utils = require('../utils');

var MqttServer = function (server, options) {
    if (!(this instanceof MqttServer)) return new MqttServer(server, options);

    var self = this;
    self.server = server;
    self.options = utils.merge(server.options, options || {});
    self.topic = options.topic;

    self.mqttClient = options.mqttClient;
    self.mqttRouter = options.mqttRouter;
    self.rpcEvent = options.rpcEvent || 'rpc';
    self.replyEvent = options.replyEvent || 'reply';

//    var channel = self.bus.subscribe(self.topic);

    self.mqttRouter.subscribe(self.topic, function config(topic, payload) {
        self.handle(self.topic, payload);
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
                    self.mqttClient.publish(topic + '/' + self.replyEvent, err);
                }
                self.mqttClient.publish(topic + '/' + self.replyEvent, body);
            });
        } else {
            // no response received at all, must be a notification
        }
    });
};

module.exports = MqttServer;

