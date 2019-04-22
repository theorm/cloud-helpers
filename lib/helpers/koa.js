const { getServices } = require('./services')

function serviceLazyLoadMiddleware(servicesFactoryFn) {
  return async (ctx, next) => {
    ctx.services = await servicesFactoryFn()
    return next()
  }
}

function services(serviceNames) {
  return serviceLazyLoadMiddleware(async () => getServices(serviceNames))
}

async function jsonErrorReportedMiddleware(ctx, next) {
  try {
    await next()
  } catch (err) {
    ctx.status = err.statusCode || 500
    ctx.body = { statusCode: ctx.status, message: err.message, stack: err.stack }
    ctx.app.emit('error', err, ctx)
  }
}

module.exports = { services, jsonErrorReportedMiddleware }
