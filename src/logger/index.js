const { createLogger, stdSerializers } = require('bunyan')
const { name, version } = require('./project-metadata')

const logger = createLogger({
  name,
  version,
  streams: [
    { name: 'stdout', level: process.env.LOG_LEVEL || 'trace', stream: process.stdout },
    { name: 'stderr', level: 'error', stream: process.stderr }
  ],
  serializers: {
    error: stdSerializers.err
  }
})

module.exports = logger
