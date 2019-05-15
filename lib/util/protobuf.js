const deterministicallyStringifyJson = require('fast-json-stable-stringify')
const assert = require('assert')
const crypto = require('crypto')
const _ = require('lodash')
const uuidv1 = require('uuid/v1')
const protobuf = require('protobufjs/minimal')

function toBase64(obj) {
  const proto = Object.getPrototypeOf(obj).constructor
  return proto.encode(obj).finish().toString('base64')
}

function fromBase64(Class, string) {
  const proto = Object.getPrototypeOf(Class)
  return new Class(proto.decode(Buffer.from(string, 'base64')))
}

/**
 * NOTE: the "v1-" prefix is to be changed if hashing algorithm changes.
 * @param {object} obj
 */
function getObjectHash(o) {
  const str = deterministicallyStringifyJson(o)
  return `v1-${crypto.createHash('md5').update(str).digest('hex')}`
}

function getHash(obj) {
  const o = obj.constructor.toObject(obj, { defaults: true })
  return getObjectHash(o)
}

function getHashOfFields(obj, fields) {
  const o = obj.constructor.toObject(obj, { defaults: true })
  const objectToHash = fields.reduce((acc, field) => {
    acc[field] = o[field]
    return acc
  }, {})
  return getObjectHash(objectToHash)
}

function ensureTimestamp(obj, field) {
  if (_.isNil(_.get(obj, field))) {
    return Object.assign({}, obj, { [field]: Date.now() })
  }
  return obj
}

function ensureId(obj) {
  if (_.isNil(obj.id)) {
    return Object.assign({}, obj, { id: uuidv1() })
  }
  return obj
}

function readManyFromBuffer(objectClass, buffer) {
  const reader = new protobuf.BufferReader(buffer)
  const items = []
  let doRead = true
  while (doRead) {
    try {
      const item = objectClass.decodeDelimited(reader)
      items.push(item)
    } catch (e) {
      if (e instanceof RangeError) doRead = false
      else throw e
    }
  }
  return items
}

function readFromBuffer(objectClass, buffer) {
  const reader = new protobuf.BufferReader(buffer)
  return objectClass.decode(reader)
}

// https://github.com/dcodeIO/protobuf.js/issues/1063
function encodeDelimited(proto, msg, writer) {
  return proto.encode(msg, writer && writer.len ? writer.fork() : writer).ldelim()
}

function encode(item) {
  const proto = Object.getPrototypeOf(item).constructor
  assert(_.isFunction(proto.encode), `Not a protobuf objects: ${item}`)
  const writer = new protobuf.BufferWriter()
  proto.encode(item, writer)
  return writer.finish()
}

function encodeMany(list) {
  const firstElement = _.first(list)

  const proto = Object.getPrototypeOf(firstElement).constructor
  assert(_.isFunction(proto.encodeDelimited), `Not a list of protobuf objects. First element: ${firstElement}`)
  const writer = new protobuf.BufferWriter()
  list.map(item => encodeDelimited(proto, item, writer))
  return writer.finish()
}


module.exports = {
  toBase64,
  fromBase64,
  getObjectHash,
  getHash,
  getHashOfFields,
  ensureTimestamp,
  ensureId,
  readManyFromBuffer,
  readFromBuffer,
  encodeMany,
  encode
}
