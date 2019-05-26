const Koa = require('koa')
const bodyParser = require('koa-bodyparser')
const Router = require('koa-router')

const { loadConfig } = require('./config')
const { getLogger } = require('./log')

const { jsonErrorReportedMiddleware, services } = require('./koa')
const { registerServiceFactory } = require('./services')
const { listFilesSync } = require('./fs')
const { SvcApiPrefix, svcApiRouter } = require('./svcapi')


const includedServices = ['log', 'config']

function getApp(onError, routesDir) {
  if (global.__cloudhelpersSvcApiApp) return global.__cloudhelpersSvcApiApp

  const config = loadConfig()
  const log = getLogger()

  registerServiceFactory('config', async () => config)
  registerServiceFactory('log', async () => log)

  const app = new Koa()
  app.use(bodyParser())
  app.use(jsonErrorReportedMiddleware)

  const baseDir = routesDir === undefined
    ? './lib/routes'
    : routesDir

  const routePrefixes = listFilesSync(baseDir).map(f => f.replace(/(\/index)?.js$/, ''))

  routePrefixes.forEach(prefix => {
    const constructor = require(`${baseDir}${prefix}`) // eslint-disable-line
    const routes = constructor(new Router({ prefix }))
    const serviceNames = [...new Set((routes.services || []).concat(includedServices))]
    app.use(routes.routes()).use(routes.allowedMethods())
    routes.use(services(serviceNames))
    const serviceLayer = routes.stack.pop()
    routes.stack.unshift(serviceLayer)
    log.info(`Set up routes on ${prefix}`)
  })

  app.use(svcApiRouter.routes()).use(svcApiRouter.allowedMethods())
  log.info(`Set up Service API routes on /${SvcApiPrefix}`)

  app.on('error', (err) => {
    if (err.statusCode >= 500 || err.statusCode === undefined) {
      log.error(`Unexpected error: ${err.stack}`)
      onError(err)
    }
  })
  global.__cloudhelpersSvcApiApp = app

  return app
}

async function startApi(onError, routesDir) {
  const app = getApp(onError, routesDir)
  const log = getLogger()

  const port = process.env.PORT || 3000
  app.listen(port)
  log.info('Listening on', `http://localhost:${port}`)
}

module.exports = { startApi, getApp }
