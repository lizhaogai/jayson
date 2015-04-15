var net = require('net');
var url = require('url');
var utils = require('../utils');
var Client = require('../client');
var util = require('util');

/**
 *  Constructor for a Jayson TCP Client
 *  @class Jayson JSON-RPC TCP Client
 *  @constructor
 *  @extends Client
 *  @param {Object|String} [options] Optional hash of settings or a URL
 *  @return {TcpClient}
 *  @api public
 */
var MqttClient = function (options) {
    // accept first parameter as a url string
    if (typeof(options) === 'string') options = url.parse(options);

    if (!(this instanceof MqttClient)) return new MqttClient(options);
    Client.call(this, options);

    var self = this;

    self.topic = options.topic;
    self._topic = options._topic;
    self.bus = options.bus;
    self.rpcEvent = options.rpcEvent || 'rpc';
    self.replyEvent = options.replyEvent || 'reply';

    var channel = self.bus.subscribe(this.topic);
    self.callbacks = {};
    // listen on the channel


    channel.on(self.replyEvent, function (data, route) {
        utils.JSON.parse(data, {}, function (err, response) {
            if (err) {
                self.callbacks[request.id](err);
                delete self.callbacks[response.id];
                return;
            }
            self.callbacks[response.id].call(null, null, response);
        });
    });

    var defaults = utils.merge(this.options, {
        encoding: 'utf8'
    });

    this.options = utils.merge(defaults, options || {});
};
require('util').inherits(MqttClient, Client);

module.exports = MqttClient;

MqttClient.prototype.info = function (info) {
    this.info = info;
    return this;
};

MqttClient.prototype._request = function (request, callback) {
    var self = this;

    // copies options so object can be modified in this context
    var options = utils.merge({}, this.options);
    this.callbacks[request.id] = callback;
    utils.JSON.stringify(request, options, function (err, body) {
        if (err) {
            delete this.callbacks[request.id];
            return callback(err);
        }
        var topic;
        if (self.info.deviceId && self.info.channelId) {
            topic = util.format(self._topic, self.info.deviceId, self.info.channelId);
        } else if (self.info.deviceId) {
            topic = util.format(self._topic, self.info.deviceId);
        } else if (self.info.channelId) {
            topic = util.format(self._topic, self.info.channelId);
        } else {
            topic = self.topic;
        }
        self.bus.publish(topic, self.rpcEvent, body);
    });
};
