/*eslint-disable*/
"use strict";

var $protobuf = require("protobufjs/minimal");

var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.Envelope = (function() {

    function Envelope(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    Envelope.prototype.id = "";
    Envelope.prototype.traceId = "";
    Envelope.prototype.content = $util.newBuffer([]);

    Envelope.create = function create(properties) {
        return new Envelope(properties);
    };

    Envelope.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.id != null && message.hasOwnProperty("id"))
            writer.uint32(10).string(message.id);
        if (message.traceId != null && message.hasOwnProperty("traceId"))
            writer.uint32(18).string(message.traceId);
        writer.uint32(26).bytes(message.content);
        return writer;
    };

    Envelope.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    Envelope.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Envelope();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1:
                message.id = reader.string();
                break;
            case 2:
                message.traceId = reader.string();
                break;
            case 3:
                message.content = reader.bytes();
                break;
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        if (!message.hasOwnProperty("content"))
            throw $util.ProtocolError("missing required 'content'", { instance: message });
        return message;
    };

    Envelope.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    Envelope.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.id != null && message.hasOwnProperty("id"))
            if (!$util.isString(message.id))
                return "id: string expected";
        if (message.traceId != null && message.hasOwnProperty("traceId"))
            if (!$util.isString(message.traceId))
                return "traceId: string expected";
        if (!(message.content && typeof message.content.length === "number" || $util.isString(message.content)))
            return "content: buffer expected";
        return null;
    };

    Envelope.fromObject = function fromObject(object) {
        if (object instanceof $root.Envelope)
            return object;
        var message = new $root.Envelope();
        if (object.id != null)
            message.id = String(object.id);
        if (object.traceId != null)
            message.traceId = String(object.traceId);
        if (object.content != null)
            if (typeof object.content === "string")
                $util.base64.decode(object.content, message.content = $util.newBuffer($util.base64.length(object.content)), 0);
            else if (object.content.length)
                message.content = object.content;
        return message;
    };

    Envelope.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.id = "";
            object.traceId = "";
            if (options.bytes === String)
                object.content = "";
            else {
                object.content = [];
                if (options.bytes !== Array)
                    object.content = $util.newBuffer(object.content);
            }
        }
        if (message.id != null && message.hasOwnProperty("id"))
            object.id = message.id;
        if (message.traceId != null && message.hasOwnProperty("traceId"))
            object.traceId = message.traceId;
        if (message.content != null && message.hasOwnProperty("content"))
            object.content = options.bytes === String ? $util.base64.encode(message.content, 0, message.content.length) : options.bytes === Array ? Array.prototype.slice.call(message.content) : message.content;
        return object;
    };

    Envelope.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    return Envelope;
})();

module.exports = $root;
