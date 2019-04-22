
class Messaging {
  async publish(topic, message) { // eslint-disable-line
    throw new Error('Not implemented')
  }

  async subscribe(uri, handler) { // eslint-disable-line
    throw new Error('Not implemented')
  }
}

module.exports = { Messaging }
