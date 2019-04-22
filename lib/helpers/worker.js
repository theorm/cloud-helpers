const { get } = require('lodash')
const { getLogger } = require('./log')
const { loadConfig } = require('./config')
const { getServices, registerServiceFactory } = require('./services')
const { startSvcApi } = require('./svcapi')
const messagingLib = require('./messaging')

const includedServices = ['log', 'config']

async function startQueueWorker(workerName, queueName, onError, workersLocation = './lib/workers') {
  const config = loadConfig()
  const log = getLogger()
  const Messaging = messagingLib.get(config.messaging.provider)

  registerServiceFactory('config', async () => config)
  registerServiceFactory('log', async () => log)

  const handler = require(`${workersLocation}/${workerName}`) // eslint-disable-line
  const messaging = new Messaging(onError, config.messaging[config.messaging.provider])
  const context = await getServices((handler.services || []).concat(includedServices))
  const queueUri = get(config.messaging.queues, queueName)
  messaging.subscribe(
    get(config.messaging.queues, queueName),
    async (msg, meta) => handler(msg, context, meta)
      .catch(e => {
        log.warn(`Processing failed. Requeueing (${meta.attempts} attempts):`, e)
        throw e
      })
  )
  startSvcApi()
  log.info(`Worker "${workerName}" is listening on queue "${queueName}": ${queueUri}`)
  return [workerName, queueName]
}

async function startOneShotWorker(workerName, workersLocation = './lib/workers') {
  const config = loadConfig()
  const log = getLogger()

  registerServiceFactory('config', async () => config)
  registerServiceFactory('log', async () => log)

  const handler = require(`${workersLocation}/${workerName}`) // eslint-disable-line
  const context = await getServices((handler.services || []).concat(includedServices))
  startSvcApi()
  return handler(context)
}

module.exports = {
  startQueueWorker,
  startOneShotWorker
}
