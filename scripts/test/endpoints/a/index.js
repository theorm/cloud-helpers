module.exports = router => {
  // eslint-disable-next-line no-param-reassign
  router.services = ['foo']

  router.get('/this', async ctx => {
    const { config, log, foo } = ctx.services
    ctx.body = { config, foo }
    log.info('"this" handled')
  })

  return router
}
