const {createLogger, stdSerializers} = require('bunyan')
const {name, version} = require('./project-metadata')
const SpecificLevelStream = require('./specific-level-stream')

const logger = createLogger({
  name,
  version,
  streams: [
    {
      type: 'raw',
      name: 'stdout',
      level: process.env.LOG_LEVEL || 'trace',
      stream: new SpecificLevelStream(['trace', 'debug', 'info', 'warn'], process.stdout)
    },
    {
      type: 'raw',
      name: 'stderr',
      level: 'error',
      stream: new SpecificLevelStream(['error', 'fatal'], process.stderr)
    }
  ],
  serializers: {
    error: stdSerializers.err
  }
})

module.exports = logger
