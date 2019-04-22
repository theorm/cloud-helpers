/* eslint: jest */
const FilesystemStorage = require('../../../lib/helpers/storage').get('filesystem')
const { Envelope } = require('../../../lib/helpers/messaging')
const { readManyFromBuffer } = require('../../../lib/util/protobuf')


const storage = new FilesystemStorage({ baseDir: '/tmp/cloudhelpers_test' })

it('stores and reads a single protobuf', async () => {
  const request = new Envelope({
    id: 'FOOBar',
    content: Buffer.from(JSON.stringify({ content: '123' }))
  })
  const prefix = 'foo/bar/1'
  await storage.put(prefix, request)
  const buffer = await storage.get(prefix)
  const decodedRequest = Envelope.decode(buffer)
  expect(decodedRequest).toEqual(request)
})

it('stores and reads multiple protobuf', async () => {
  const requestA = new Envelope({
    id: 'FOOBar2',
    content: Buffer.from(JSON.stringify({ content: '123' }))
  })
  const requestB = new Envelope({
    id: 'FOOBar2',
    content: Buffer.from(JSON.stringify({ content: 'abc' }))
  })
  const prefix = 'foo/bar/2'
  await storage.putMany(prefix, [requestA, requestB])
  const buffer = await storage.get(prefix)
  const decodedRequests = readManyFromBuffer(Envelope, buffer)
  expect(decodedRequests).toEqual([requestA, requestB])
})
