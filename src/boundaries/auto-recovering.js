const BaseBoundary = require('./base')

class AutorecoveringBoundary extends BaseBoundary {
  static async init () {
    if (!this.isClosed() && !this.willBeReinit()) {
      throw new Error(`${this.name}.init can't be start, status is ${this.status}`)
    }

    try {
      this.status = this.possibleStatuses.initialization
      await this.initSequence()
      this.status = this.possibleStatuses.opened
    } catch (e) {
      this.reinit()
    }
  }

  static async close () {
    if (this.willBeReinit()) {
      clearTimeout(this.timeout)
      return Promise.resolve()
    }
    return super.close()
  }

  static reinit () {
    this.status = this.possibleStatuses.waitBeforeReinit
    if (!this.reinitializationTimeout) {
      throw new Error(`${this.name} must have defined reinitializationTimeout`)
    }
    this.timeout = setTimeout(() => this.init(), this.reinitializationTimeout)
  }

  static willBeReinit () {
    return this.status === this.possibleStatuses.waitBeforeReinit
  }
}

AutorecoveringBoundary.possibleStatuses.waitBeforeReinit = 'waitBeforeReinit'
AutorecoveringBoundary.timeout = null
AutorecoveringBoundary.reinitializationTimeout = null

module.exports = AutorecoveringBoundary
