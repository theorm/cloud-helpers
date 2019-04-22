module.exports = {
  get: provider => {
    switch (provider) {
      case 'filesystem':
        return require('./filesystem').FilesystemStorage // eslint-disable-line
      case 's3':
        return require('./s3').S3Storage // eslint-disable-line  
      default:
        throw new Error(`Unknown storage provider: ${provider}`)
    }
  }
}
