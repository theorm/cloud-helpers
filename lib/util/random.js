const uuidv1 = require('uuid/v1')

function newUuidv1() {
  return uuidv1()
}

function randomString(length) {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

  for (let i = 0; i < length; i += 1) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }

  return text
}

module.exports = { newUuidv1, randomString }
