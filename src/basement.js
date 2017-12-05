const BaseBoundary = require('./boundaries/base')
const AutoRecoveringBoundary = require('./boundaries/auto-recovering')
let currentLogger = require('./logger')

/**
 * Pseudo-abstract base class which other apps should inherit from
 */
class Basement {
  /**
   * Initialize a new application.
   * @constructor
   * @param {Object} settings - Application settings.
   * @param {Object} [logger] - Custom logger that used instead of default.
   * @param {Object} boundaries - Application boundaries to handle.
   */
  constructor ({settings, logger, boundaries}) {
    this.settings = settings
    this.boundaries = boundaries
    currentLogger.logger = logger
  }

  /**
   * Settings setter with type checking.
   * @param {Object} settings - Application settings.
   * @access private
   */
  set settings (settings) {
    if (settings instanceof Object === false || !Object.keys(settings).length) {
      throw new Error('Settings argument must be an object of application settings')
    }

    this._settings = settings
  }

  /**
   * Settings getter.
   * @access public
   * @return {Object} Current application settings.
   */
  get settings () {
    return this._settings
  }

  /**
   * Logger getter.
   * @access public
   * @return {Object} Current application logger.
   */
  get logger () {
    return currentLogger.logger
  }

  /**
   * Boundaries setter with type and required methods checking for each boundary.
   * @param {Object} boundaries - Application boundaries.
   * @access private
   */
  set boundaries (boundaries) {
    if (boundaries instanceof Object === false || !Object.keys(boundaries).length) {
      throw new Error('Boundaries argument must be an object of application boundaries')
    }

    // Get values from uniterable object of boudaries and loop over them
    for (const boundary of Object.values(boundaries)) {
      // Check that each boundary has required methods for Basement handlers
      const isBoundary = Object.getPrototypeOf(boundary) === BaseBoundary ||
        Object.getPrototypeOf(boundary) === AutoRecoveringBoundary
      if (!isBoundary) {
        throw new Error(`${boundary.name} must be extended from Boundary class`)
      }
    }

    this._boundaries = boundaries
  }

  /**
   * Boundaries getter.
   * @access public
   * @return {Object} Application boundaries.
   */
  get boundaries () {
    return this._boundaries
  }

  /**
   * Ordered sequence of boundaries startups that should be implemented in subclass.
   * @return {Promise.<undefined>}
   * @throws {Error} In case if not implemented in subclass.
   * @access protected
   */
  async startSequence () {
    throw new Error(`Subclass of ${Basement.name} must explicitly implement this method!`)
  }

  /**
   * Start boundaries of {@link Basement~startSequence} and watch for errors.
   *
   * @return {Promise.<undefined>|Promise.<Error>}
   * @access public
   */
  async start () {
    this.logger.info('Starting...')

    // Setup kernel signals stop handlers before start
    // so everything will shutdown at least partially
    if (!Basement.isTestEnv()) {
      ['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((sigEvent) => {
        process.on(sigEvent, () => this.stop())
      })
    }

    try {
      await this.startSequence()
    } catch (error) {
      if (!Basement.isTestEnv()) {
        this.logger.error(error, 'Error during startup')
        process.exit(1)
      } else {
        throw error
      }
    }

    this.logger.info('Started')
  }

  /**
   * Ordered sequence of boundaries shutdowns that should be implemented in subclass.
   * @return {Promise.<undefined>}
   * @throws {Error} In case if not implemented in subclass.
   * @access protected
   */
  async stopSequence () {
    throw new Error(`Subclass of ${Basement.name} must explicitly implement this method!`)
  }

  /**
   * Stop boundaries of {@link Basement~stopSequence} and watch for errors.
   *
   * @return {Promise.<undefined>|Promise.<Error>}
   * @access public
   */
  async stop () {
    this.logger.info('Stopping...')

    // Last resort fallback to shutdown application no matter what
    const timeoutId = setTimeout(() => {
      const unclosedBoundaries = Object.keys(this.boundaries).filter(
        name => !this.boundaries[name].isClosed())
      if (!Basement.isTestEnv()) {
        this.logger.error(`Stopped forcefully. Unclosed boundaries is ${unclosedBoundaries}`)
        process.exit(1)
      } else {
        throw new Error(`Unclosed boundaries is ${unclosedBoundaries}`)
      }
    }, this.settings.shutdownTimeout)

    try {
      await this.stopSequence()
      clearTimeout(timeoutId)
    } catch (error) {
      if (!Basement.isTestEnv()) {
        this.logger.error(error, 'Error during shutdown')
        process.exit(1)
      } else {
        throw error
      }
    }
  }

  static isTestEnv () {
    return process.env.NODE_ENV === 'test'
  }
}

module.exports = Basement
