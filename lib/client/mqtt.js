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
    self.cbCache = options.cbCache;

    var channel = self.bus.subscribe(this.topic + '/reply');
    // listen on the channel
    channel.on(self.replyEvent, function (data, route) {

        if (typeof(data) == 'string') {
            utils.JSON.parse(data, {}, function (err, response) {
                var callback = self.cbCache.get(response.id);
                self.cbCache.remove(response.id);
                if (err && callback) {
                    callback(err);
                    return;
                }
                if (callback) {
                    callback.call(null, null, response);
                }
            });
        } else {
            var response = data;
            var callback = self.cbCache.get(response.id);
            self.cbCache.remove(response.id);
            if (callback) {
                callback.call(null, null, response);
            }
        }
    });

    var defaults = utils.merge(this.options, {
        encoding: 'utf8'
    });

    this.options = utils.merge(defaults, options || {});
};
require('util').inherits(MqttClient, Client);

module.exports = MqttClient;

MqttClient.prototype.channel = function (channel) {
    this._channel = channel;
    return this;
};

MqttClient.prototype._request = function (request, callback) {
    var self = this;

    // copies options so object can be modified in this context
    var options = utils.merge({}, this.options);
    self.cbCache.set(request.id, callback);
    utils.JSON.stringify(request, options, function (err, body) {
        if (err) {
            self.cbCache.remove(request.id);
            return callback(err);
        }
        var topic;
        if (self._channel.deviceId && self._channel.channelId) {
            topic = util.format(self._topic, self._channel.deviceId, self._channel.channelId);
        } else if (self._channel.deviceId) {
            topic = util.format(self._topic, self._channel.deviceId);
        } else if (self._channel.channelId) {
            topic = util.format(self._topic, self._channel.channelId);
        } else {
            topic = self.topic;
        }
        self.bus.publish(topic, self.rpcEvent, body);
    });
};
