const { range } = require('lodash')
const { randomString } = require('../../..').util.random

function getRandomMessage(i) {
  return {
    foo: `msg-${i}-${randomString(10)}`
  }
}

async function handler({ messaging, config, log }) {
  const publish = async message => {
    const messageAsString = JSON.stringify(message)
    log.info(`Publishing ${messageAsString}`)
    messaging.publish(
      config.get('messaging.topics.testGroup.testTopic'),
      Buffer.from(messageAsString)
    )
  }
  return Promise.all(range(10).map(async i => publish(getRandomMessage(i))))
}

handler.services = ['messaging']

module.exports = handler
