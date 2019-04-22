const assert = require('assert')
const { isString, get, isUndefined } = require('lodash')
const { MongoClient } = require('mongodb') // eslint-disable-line

global.__mongodbConnectionPool = {}

class MongoDb {
  constructor(options) {
    this._options = options
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
    }
    return global.__mongodbConnectionPool[dbTag].db()
  }
}

module.exports = { MongoDb }
