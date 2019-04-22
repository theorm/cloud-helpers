module.exports = {
  get: provider => {
    switch (provider) {
      case 'mongo':
        return require('./mongo').MongoDb // eslint-disable-line
      default:
        throw new Error(`Unknown db provider: ${provider}`)
    }
  }
}
