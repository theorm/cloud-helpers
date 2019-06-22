const assert = require('assert')
// eslint-disable-next-line import/no-unresolved
const S3 = require('aws-sdk/clients/s3')
const { isEmpty, isString, get } = require('lodash')
const { Storage } = require('./base')

class S3Storage extends Storage {
  constructor(options) {
    super()
    const s3Opts = get(options, 's3Options', {})
    this._s3 = new S3(s3Opts)
    assert(isString(options.bucket) && !isEmpty(options.bucket),
      `Expected a bucket name in "bucket" option but got: ${options.bucket}`)
    this._bucket = options.bucket
  }

  async get(path) {
    const response = await this._s3.getObject({
      Bucket: this._bucket,
      Key: path
    }).promise()
    return response.Body
  }

  async putBuffer(path, buffer, contentType, contentEncoding) {
    return this._s3.putObject({
      Bucket: this._bucket,
      Key: path,
      Body: buffer,
      ContentType: contentType,
      ContentEncoding: contentEncoding
    }).promise()
  }

  /**
   *
   */
  async list(prefix, nextContinuationToken) {
    const params = {
      Bucket: this._bucket
    }
    if (nextContinuationToken !== undefined) {
      params.ContinuationToken = nextContinuationToken
    }

    if (prefix) params.Prefix = prefix
    const {
      Contents: rawContents,
      NextContinuationToken: continuationToken = undefined
    } = await this._s3.listObjectsV2(params).promise()

    const contents = rawContents.map(item => ({
      path: item.Key,
      metadata: item
    }))

    return { contents, continuationToken }
  }
}

module.exports = { S3Storage }
