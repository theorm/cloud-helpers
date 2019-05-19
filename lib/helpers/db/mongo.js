const assert = require('assert')
const { isString, get, isUndefined, isFunction, noop } = require('lodash')
const { MongoClient } = require('mongodb') // eslint-disable-line

global.__mongodbConnectionPool = {}

class MongoDb {
  constructor(options, onError) {
    this._options = options
    this._onError = isFunction(onError) ? onError : noop
  }

  async getCollection(collectionTag) {
    const collectionUri = this._options.collections[collectionTag]
    assert(isString(collectionUri), `"${collectionTag}" mongo collection tag not found`)
    const [dbTag, collectionName] = collectionUri.split('/')
    const db = await this._getDb(dbTag)
    return db.collection(collectionName)
  }

  async _getDb(dbTag) {
    if (isUndefined(global.__mongodbConnectionPool[dbTag])) {
      const dbOptions = this._options[dbTag]
      const uri = get(dbOptions, 'uri')
      assert(isString(uri), `No "uri" found for monogo database ${dbTag}`)
      const client = new MongoClient(uri, {
        useNewUrlParser: true,
        sslValidate: false, // connection speed optimisation
        poolSize: 1, // -- // --- TODO: define in URI string?
        connectTimeoutMS: 1000, // just drop it if takes longer.
        reconnectInterval: 100,
        checkServerIdentity: false, // perf
      })
      await client.connect()
      global.__mongodbConnectionPool[dbTag] = client

      const topology = get(client, 'topology.s.sessionPool.topology')
      if (isFunction(get(topology, 'on'))) {
        topology.on('reconnectFailed', this._onError)
      }
      if (isFunction(get(client, 'on'))) {
        topology.on('error', this._onError)
      }
    }
    return global.__mongodbConnectionPool[dbTag].db()
  }
}

module.exports = { MongoDb }
