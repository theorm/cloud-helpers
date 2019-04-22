process.env.CONFIG_FILE = `${__dirname}/test.yml`

const log = require('../..').helpers.log.getLogger()
const config = require('../..').helpers.config.loadConfig()
const { startQueueWorker, startOneShotWorker } = require('../..').helpers.worker
const { registerServiceFactory } = require('../..').helpers.services
const Messaging = require('../..').helpers.messaging.get(config.messaging.provider)

const WorkersBaseDir = `${__dirname}/workers`

function onError(error) {
  log.error('An error occurred. Exiting', error)
  process.exit(1)
}

registerServiceFactory('messaging', async () => new Messaging(onError, config.messaging.get(config.messaging.get('provider'))))

async function main() {
  log.info('starting subscribe worker')
  await startQueueWorker('subscribe', 'testGroup.testQueue', onError, WorkersBaseDir)
  log.info('subscribe worker started')
  log.info('calling publish worker')
  await startOneShotWorker('publish', WorkersBaseDir)
  log.info('publish worker done')
}

main()
  .then(() => {
    log.info('Ctrl-C to stop subscribe worker')
  })
  .catch(onError)
