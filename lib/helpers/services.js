const assert = require('assert')
const _ = require('lodash')

async function getServicesParallel(serviceNames) {
  const unknownServices = _.difference(serviceNames,
    Object.keys(global.__cloudHelpersServiceFactories))
  assert(_.isEmpty(unknownServices), `Unknown services: ${unknownServices.join(', ')}`)
  const nameServicePairs = await Promise.all(_.map(serviceNames, async name => {
    if (global.__cloudHelpersServicesCache[name] === undefined) {
      global.__cloudHelpersServicesCache[name] = await global.__cloudHelpersServiceFactories[name]()
    }
    return [name, global.__cloudHelpersServicesCache[name]]
  }))

  return _.chain(nameServicePairs).groupBy(_.property(0)).mapValues(p => p[0][1]).value()
}

async function initServicesSequential(serviceNames) {
  const nameServicePairs = []

  // eslint-disable-next-line no-restricted-syntax, guard-for-in
  for (const name of serviceNames) {
    if (global.__cloudHelpersServicesCache[name] === undefined) {
      // eslint-disable-next-line
      global.__cloudHelpersServicesCache[name] = await global.__cloudHelpersServiceFactories[name]()
    }
    nameServicePairs.push([name, global.__cloudHelpersServicesCache[name]])
  }

  return nameServicePairs
}

async function getServicesSequential(serviceNames) {
  const unknownServices = _.difference(serviceNames,
    Object.keys(global.__cloudHelpersServiceFactories))
  assert(_.isEmpty(unknownServices), `Unknown services: ${unknownServices.join(', ')}`)

  const nameServicePairs = await initServicesSequential(serviceNames)
  return _.chain(nameServicePairs).groupBy(_.property(0)).mapValues(p => p[0][1]).value()
}

async function getServices(serviceNames, isParallel = true) {
  const uniqueServiceNames = [...new Set(serviceNames)]
  if (isParallel) {
    return getServicesParallel(uniqueServiceNames)
  }
  return getServicesSequential(uniqueServiceNames)
}

function registerServiceFactory(name, factory) {
  global.__cloudHelpersServiceFactories[name] = factory
}

if (global.__cloudHelpersServicesCache === undefined) global.__cloudHelpersServicesCache = {}
if (global.__cloudHelpersServiceFactories === undefined) global.__cloudHelpersServiceFactories = {}

module.exports = { registerServiceFactory, getServices }
