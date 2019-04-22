const { getObjectHash } = require('../../lib/util/protobuf')

describe('getObjectHash', () => {
  it('generates valid hash', () => {
    const hashA = getObjectHash(['one', 'two'])
    const hashB = getObjectHash(['one', 'two'])
    expect(hashA).toBe(hashB)
  })
})
