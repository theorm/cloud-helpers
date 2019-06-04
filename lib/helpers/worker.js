const fs = require('fs')
const path = require('path')
const { get, isString } = require('lodash')
const { getLogger } = require('./log')
const { loadConfig } = require('./config')
const { getServices, registerServiceFactory } = require('./services')
const { startSvcApi } = require('./svcapi')
const messagingLib = require('./messaging')

const includedServices = ['log', 'config']

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f)
    const isDirectory = fs.statSync(dirPath).isDirectory()
    return isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f))
  })
}

function getAllWorkers(workersLocation) {
  const files = []
  const prefixRegex = new RegExp(`^${workersLocation}\\/`)
  walkDir(workersLocation, files.push.bind(files))
  return files.map(f => f.replace(prefixRegex, '').replace(/\.[^.]+$/, ''))
}

function printWorkersHelp(workerName, workersLocation, log) {
  const items = []
  if (isString(workerName)) items.push(`Worker "${workerName}" not found`)
  items.push('Available workers:')
  getAllWorkers(workersLocation).forEach(worker => items.push(`\t${worker}`))
  log.error(items.join('\n'))
}

async function startQueueWorker(workerName, queueName, onError, workersLocation = './lib/workers') {
  const config = loadConfig()
  const log = getLogger()
  const Messaging = messagingLib.get(config.messaging.provider)

  registerServiceFactory('config', async () => config)
  registerServiceFactory('log', async () => log)

  let handler
  try {
    if (!isString(workerName)) throw new Error('Cannot find module')
    handler = require(`${workersLocation}/${workerName}`) // eslint-disable-line
  } catch (e) {
    if (e.message.match(/Cannot find module/)) {
      printWorkersHelp(workerName, workersLocation, log)
    }
    throw e
  }
  const messaging = new Messaging(onError, config.messaging[config.messaging.provider])
  const context = await getServices((handler.services || []).concat(includedServices))

  let listenQueueName = queueName
  if (!isString(queueName)) {
    listenQueueName = workerName.replace(/\//g, '.')
    log.warn(`No queue name specified for worker "${workerName}" trying to use queue "${listenQueueName}"`)
  }

  const queueUri = get(config.messaging.queues, listenQueueName)
  if (!isString(queueUri)) {
    throw new Error(`No queue "${listenQueueName}" details found in config`)
  }
  messaging.subscribe(
    queueUri,
    async (msg, meta) => handler(msg, context, meta)
      .catch(e => {
        log.warn(`Processing failed. Requeueing (${meta.attempts} attempts):`, e)
        throw e
      })
  )
  startSvcApi()
  log.info(`Worker "${workerName}" is listening on queue "${listenQueueName}": ${queueUri}`)
  return [workerName, listenQueueName]
}

async function startOneShotWorker(workerName, workersLocation = './lib/workers') {
  const config = loadConfig()
  const log = getLogger()

  registerServiceFactory('config', async () => config)
  registerServiceFactory('log', async () => log)

  let handler
  try {
    if (!isString(workerName)) throw new Error('Cannot find module')
    handler = require(`${workersLocation}/${workerName}`) // eslint-disable-line
  } catch (e) {
    if (e.message.match(/Cannot find module/)) {
      printWorkersHelp(workerName, workersLocation, log)
    }
    throw e
  }
  const context = await getServices((handler.services || []).concat(includedServices))
  startSvcApi()
  return handler(context)
}

module.exports = {
  startQueueWorker,
  startOneShotWorker
}
