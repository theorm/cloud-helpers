const assert = require('assert')
const protobuf = require('protobufjs/minimal')
const {
  isFunction, isString, isNil, isArray, isEmpty, first
} = require('lodash')

// https://github.com/dcodeIO/protobuf.js/issues/1063
function encodeDelimited(proto, msg, writer) {
  return proto.encode(msg, writer && writer.len ? writer.fork() : writer).ldelim()
}

class Storage {
  /**
   *
   * @param {string} path
   * @param {object} content a string, object, buffer of protobuf object
   */
  async put(path, content) {
    assert(isString(path), `"path" expected to be a string but is ${path}`)
    assert(!isNil(content), `"content" is empty: ${content}`)

    if (isString(content)) return this.putBuffer(path, content, 'text/plain')
    // protobuf
    const proto = Object.getPrototypeOf(content).constructor
    if (isFunction(proto.encode)) {
      const writer = new protobuf.BufferWriter()
      proto.encode(content, writer)
      return this.putBuffer(path, writer.finish(), 'application/protobuf')
    }
    if (Buffer.isBuffer(content)) return this.putBuffer(path, content)
    // otherwise JSON encode
    return this.putBuffer(path, JSON.stringify(content), 'application/json')
  }

  /**
   * NOTE: Only checking the first element to detect type
   * @param {string} path
   * @param {array} contentList a list of string, object, buffer of protobuf object
   */
  async putMany(path, contentList) {
    assert(isString(path), `"path" expected to be a string but is ${path}`)
    assert(isArray(contentList) && !isEmpty(contentList), `"content" is not an non empty array: ${contentList}`)

    const firstElement = first(contentList)

    if (isString(firstElement)) return this.putBuffer(path, contentList.join('\n'), 'text/plain')
    // protobuf
    const proto = Object.getPrototypeOf(firstElement).constructor
    if (isFunction(proto.encodeDelimited)) {
      const writer = new protobuf.BufferWriter()
      contentList.map(item => encodeDelimited(proto, item, writer))
      const buffer = writer.finish()
      return this.putBuffer(path, buffer, 'application/protobuf')
    }
    // otherwise JSON encode
    return this.putBuffer(path, JSON.stringify(contentList), 'application/json')
  }

  /**
   *
   * @param {string} path location of the content
   */
  async get(path) { // eslint-disable-line
    throw new Error('Not implemented')
  }

  /**
   *
   * @param {string} path location of the content
   * @param {Buffer} buffer buffer to write
   * @param {string} contentType content type (optional)
   * @param {*} contentEncoding content encoding (optional)
   */
  async putBuffer(path, buffer, contentType, contentEncoding) { // eslint-disable-line
    throw new Error('Not implemented')
  }

  async list(prefix) { // eslint-disable-line
    throw new Error('Not implemented')
  }

  async listAll(prefix) {
    let nextContinuationToken
    let items = []
    do {
      // eslint-disable-next-line no-await-in-loop
      const { contents, continuationToken } = await this.list(prefix, nextContinuationToken)
      nextContinuationToken = continuationToken
      items = items.concat(contents)
    } while (nextContinuationToken !== undefined)
    return items
  }
}

module.exports = { Storage }
