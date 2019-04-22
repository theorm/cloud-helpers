const fs = require('fs')
const { dirname, join } = require('path')
const { promisify } = require('util')
const mkdirp = require('mkdirp')
const { Storage } = require('./base')

const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
const readdirAsync = promisify(fs.readdir)
const statAsync = promisify(fs.stat)
const mkdirAsync = promisify(mkdirp)

class FilesystemStorage extends Storage {
  constructor(options) {
    super()
    this._baseDir = options.baseDir
  }

  async get(path) {
    return readFileAsync(join(this._baseDir, path))
  }

  async putBuffer(path, buffer) {
    const filePath = join(this._baseDir, path)
    const fileDirname = dirname(filePath)
    await mkdirAsync(fileDirname)
    return writeFileAsync(filePath, buffer)
  }

  async list(prefix) {
    const base = prefix ? join(this._baseDir, prefix) : this._baseDir
    const baseRegex = new RegExp(`^${base}`)

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
    await walkDir(base)
    return filesList
  }
}

module.exports = { FilesystemStorage }
