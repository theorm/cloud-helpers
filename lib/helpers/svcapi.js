const log = require('loglevel')
const Koa = require('koa')
const Router = require('koa-router')

const SvcApiPrefix = 'svc'

const svcApiRouter = new Router({ prefix: `/${SvcApiPrefix}` })

svcApiRouter.get('/health', ctx => { ctx.body = { healthy: 1 } })

// API starts after all initialisation so it is always ready when it starts.
svcApiRouter.get('/readiness', ctx => { ctx.body = { ready: 1 } })

svcApiRouter.get('/config', ctx => {
  ctx.body = {
    // eslint-disable-next-line global-require
    config: require('./config').loadConfig(),
    environment: process.env
  }
})

function startSvcApi() {
  if (global.__cloudhelpersSvcApiApp !== undefined) return

  const app = new Koa()
  app.use(svcApiRouter.routes()).use(svcApiRouter.allowedMethods())

  const port = process.env.PORT || 3000
  log.info('Service API is listening on', `http://localhost:${port}/${SvcApiPrefix}`)
  app.listen(port)
  global.__cloudhelpersSvcApiApp = app
}

module.exports = { SvcApiPrefix, svcApiRouter, startSvcApi }
