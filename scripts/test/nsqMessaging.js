const Messaging = require('../..').helpers.messaging.get('nsq')

function onError(error) {
  console.error(error.stack)
  process.exit(1)
}

const messaging = new Messaging(onError, {
  nsqdTCPAddresses: ['127.0.0.1:4150'],
  lookupdHTTPAddresses: ['127.0.0.1:4161']
})

async function main() {
  console.log('Subscribing...')
  await messaging.subscribe('testTopic/testQueue', async message => {
    console.log('Got message', message.toString())
  })
  console.log('Subscribed...')

  await messaging.publish('testTopic', 'one')
  await messaging.publish('testTopic', 'two')
  await messaging.publish('testTopic', 'three')
  await new Promise(res => setTimeout(res, 100))
}

main()
  .then(() => {
    console.log('Done')
    // process.exit(0)
  })
  .catch(e => {
    console.error('Error in main', e.stack)
    process.exit(1)
  })
