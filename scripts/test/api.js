process.env.CONFIG_FILE = `${__dirname}/test.yml`

const { startApi } = require('../..').helpers.api
const log = require('../..').helpers.log.getLogger()
const { registerServiceFactory } = require('../..').helpers.services

function onError(e) {
  log.error(`An error occurred: ${e.message}. Exiting`, e.stack)
  process.exit(1)
}

registerServiceFactory('foo', async () => new Promise(res => setTimeout(() => res('foooooo'), 100)))

startApi(onError, `${__dirname}/endpoints`)
  .then(() => log.info('Started. Ctrl+C to cancel'))
  .catch(onError)
