const {resolveLevel, safeCycles} = require('bunyan')

class SpecificLevelStream {
  constructor (levels, stream) {
    this.levels = {}
    for (const level of levels) {
      this.levels[resolveLevel(level)] = true
    }
    this.stream = stream
  }

  write (rec) {
    if (this.levels[rec.level]) {
      this.stream.write(`${JSON.stringify(rec, safeCycles())}\n`)
    }
  }
}

module.exports = SpecificLevelStream
