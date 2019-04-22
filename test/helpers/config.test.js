/* eslint: jest */
const { loadConfig } = require('../..').helpers.config

process.env.CONFIG_FILE = `${__dirname}/testconfig.yml`

it('loads config', () => {
  const config = loadConfig()
  expect(config.messaging.provider).toBe('nsq')
})

it('contains location', () => {
  const config = loadConfig()
  expect(config.getLocation()).toBe(process.env.CONFIG_FILE)
})

it('reads values in different ways', () => {
  const config = loadConfig()
  expect(config.messaging.provider).toBe('nsq')
  expect(config.messaging.get('provider')).toBe('nsq')
  expect(config.messaging.getRequired('provider')).toBe('nsq')

  expect(config.get('messaging.provider')).toBe('nsq')
  expect(config.getRequired('messaging.provider')).toBe('nsq')

  expect(config.get('foo.bar.baz')).toBe(undefined)
  expect(config.get('foo.bar.baz', 'x')).toBe('x')


  expect(config.getRequired('messaging.provider')).toBe('nsq')
  expect(() => config.getRequired('foo.boo.boo')).toThrow(/No value found for key foo.boo.boo/)
})
