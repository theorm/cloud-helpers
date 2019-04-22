const { Envelope } = require('./generated/messaging')

module.exports = {
  get: provider => {
    switch (provider) {
      case 'nsq':
        return require('./nsq').NsqMessaging // eslint-disable-line
      default:
        throw new Error(`Unknown messaging provider: ${provider}`)
    }
  },
  Envelope
}
