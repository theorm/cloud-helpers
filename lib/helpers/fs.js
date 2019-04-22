const fs = require('fs')
const { join } = require('path')
const { promisify } = require('util')

const readdirAsync = promisify(fs.readdir)
const statAsync = promisify(fs.stat)

async function listFiles(baseDir) {
  const baseRegex = new RegExp(`^${baseDir}`)

  const filesList = []
  async function walkDir(basePath) {
    const content = await readdirAsync(basePath)
    for (const item of content) { // eslint-disable-line no-restricted-syntax
      const itemPath = join(basePath, item)
      const stats = await statAsync(itemPath) // eslint-disable-line no-await-in-loop
      if (stats.isDirectory()) await walkDir(itemPath) // eslint-disable-line no-await-in-loop
      else filesList.push(itemPath.replace(baseRegex, ''))
    }
  }
  await walkDir(baseDir)
  return filesList
}


function listFilesSync(baseDir) {
  const baseRegex = new RegExp(`^${baseDir}`)

  const filesList = []
  function walkDir(basePath) {
    const content = fs.readdirSync(basePath)
    for (const item of content) { // eslint-disable-line no-restricted-syntax
      const itemPath = join(basePath, item)
      const stats = fs.statSync(itemPath) // eslint-disable-line no-await-in-loop
      if (stats.isDirectory()) walkDir(itemPath) // eslint-disable-line no-await-in-loop
      else filesList.push(itemPath.replace(baseRegex, ''))
    }
  }
  walkDir(baseDir)
  return filesList
}

module.exports = {
  listFiles,
  listFilesSync
}
