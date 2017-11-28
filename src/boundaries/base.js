/**
 * Boundary class that other boundaries should be derived from.
 * Only objects with BaseBoundary as a prototype will be accepted by Basement's
 * `boundaries` property setter to enforce the correct structure
 */
class BaseBoundary {
  static async init () {
    if (!this.isClosed()) {
      throw new Error(`${this.name}.init can't be start, status is ${this.status}`)
    }

    try {
      this.status = this.possibleStatuses.initialization
      await this.initSequence()
      this.status = this.possibleStatuses.opened
    } catch (e) {
      this.status = this.possibleStatuses.closed
      throw e
    }
  }

  static async initSequence () {
    throw new Error(`${this.name} must explicitly implement initSequence method!`)
  }

  static async close () {
    if (this.isClosed()) return Promise.resolve()
    if (!this.isOpened()) {
      throw new Error(`${this.name}.close can't be start, status is ${this.status}`)
    }

    try {
      this.status = this.possibleStatuses.closing
      await this.closeSequence()
      this.status = this.possibleStatuses.closed
    } catch (e) {
      this.status = this.possibleStatuses.opened
      throw e
    }

    return Promise.resolve()
  }

  static async closeSequence () {
    throw new Error(`${this.name} must explicitly implement closeSequence method!`)
  }

  static isClosed () {
    return this.status === this.possibleStatuses.closed
  }

  static isOpened () {
    return this.status === this.possibleStatuses.opened
  }
}

BaseBoundary.possibleStatuses = {
  closed: 'closed',
  initialization: 'initialization',
  opened: 'opened',
  closing: 'closing'
}
BaseBoundary.status = BaseBoundary.possibleStatuses.closed

module.exports = BaseBoundary
