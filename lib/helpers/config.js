const assert = require('assert')
const { readFileSync } = require('fs')
const {
  get, isNil, isObjectLike, isArrayLikeObject
} = require('lodash')
const yaml = require('yaml')

class Config {
  constructor(content, location) {
    Object.keys(content).forEach(k => {
      const v = content[k]
      this[k] = isObjectLike(v) && !isArrayLikeObject(v)
        ? new Config(v) : v
    })
    if (location) {
      this.__location = location
    }
  }

  getLocation() {
    return this.__location
  }

  get(key, defaultValue) {
    return get(this, key, defaultValue)
  }

  getRequired(key) {
    const value = get(this, key)
    assert(!isNil(value), `No value found for key ${key}`)
    return value
  }
}

function loadConfig() {
  const filePath = process.env.CONFIG_FILE || 'config/dev.yaml'
  let content
  try {
    content = readFileSync(filePath)
  } catch (e) {
    e.message = `Could not read config file CONFIG_FILE=${filePath}: ${e.message}`
    throw e
  }
  return new Config(yaml.parse(content.toString()), filePath)
}

module.exports = { loadConfig }
