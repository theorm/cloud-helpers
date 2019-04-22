const nsq = require('nsqjs') // eslint-disable-line
const assert = require('assert')
const { promisify } = require('util')
const {
  isFunction, isObjectLike, isEmpty, random
} = require('lodash')
const { Messaging } = require('./base')

class NsqMessaging extends Messaging {
  constructor(onError, options) {
    super()
    assert(isFunction(onError), '"onError" must be defined')
    assert(isObjectLike(options), '"options" must be defined')
    this._onError = onError
    this._options = options
  }

  async publish(topic, message) {
    const writer = await this._getWriter()
    return promisify(writer.publish.bind(writer))(topic, message)
  }

  async subscribe(uri, handler) {
    const [topic, channel] = uri.split('/')
    return this._newReader(topic, channel, handler)
  }

  _getWriterHostAndPort() {
    const { nsqdTCPAddresses } = this._options
    assert(!isEmpty(nsqdTCPAddresses),
      'At least one entry in "nsqdTCPAddresses" is required for writer at the moment')
    const address = nsqdTCPAddresses[random(0, nsqdTCPAddresses.length - 1)]
    return address.split(':')
  }

  async _getWriter() {
    if (this._writerPromise) return this._writerPromise
    const [writerHost, writerPort] = this._getWriterHostAndPort()
    this._writerPromise = new Promise((res, rej) => {
      const writer = new nsq.Writer(writerHost, writerPort)
      writer.on('ready', () => {
        res(writer)
      })
      writer.on('error', e => {
        if (this._writerPromise && !this._writerPromise.__isNotPending) {
          const error = new Error(`Could not connect to writer on ${writerHost}:${writerPort}: ${e.message}`, e)
          rej(error)
        }
        return delete this._writerPromise
      })
      writer.on('closed', () => {
        if (this._writerPromise && !this._writerPromise.__isNotPending) {
          rej(new Error('Closing writer'))
        }
        return delete this._writerPromise
      })
      writer.connect()
    }).then(x => {
      if (this._writerPromise) {
        this._writerPromise.__isNotPending = true
      }
      return x
    }).catch(e => {
      if (this._writerPromise) {
        this._writerPromise.__isNotPending = true
      }
      throw e
    })
    return this._writerPromise
  }

  async _newReader(topic, channel, handler) {
    if (this._readerPromise) return this._readerPromise
    this._readerPromise = new Promise((res, rej) => {
      const reader = new nsq.Reader(topic, channel, this._options)
      reader.on('ready', () => {
        res(reader)
      })
      reader.on('message', msg => {
        handler(msg.body, { id: msg.id, attempts: msg.attempts })
          .then(() => msg.finish())
          .catch(() => msg.requeue())
      })
      reader.on('error', error => {
        if (this._readerPromise && !this._readerPromise.__isNotPending) {
          rej(error)
        } else {
          this._onError(error)
        }
        delete this._readerPromise
      })
      reader.on('closed', () => {
        const error = new Error(`Reader for ${topic}/${channel} closed`)
        if (this._readerPromise && !this._readerPromise.__isNotPending) {
          rej(error)
        } else {
          this._onError(error)
        }
        delete this._readerPromise
      })
      reader.connect()
    }).then(x => {
      if (this._readerPromise) {
        this._readerPromise.__isNotPending = true
      }
      return x
    }).catch(e => {
      if (this._readerPromise) {
        this._readerPromise.__isNotPending = true
      }
      throw e
    })
    return this._readerPromise
  }
}

module.exports = { NsqMessaging }
