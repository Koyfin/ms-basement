let initialLogger = require('./logger')

const isTest = process.env.NODE_ENV === 'test'

/** Set the most important application events handlers */
if (!isTest) {
  process.on('SIGUSER1', () => {
    initialLogger.info('Received debug signal SIGUSER1')
  })

  process.on('unhandledRejection', (reason, promise) => {
    initialLogger.error({ reason, promise }, 'Unhandled Rejection')
  })

  process.on('uncaughtException', (error) => {
    initialLogger.error(error, 'Unhandled Exception')
  })

  process.on('exit', (code) => {
    initialLogger.info(`Stopped with code: ${code}`)
  })
}

/** Expose pseudo-abstract base class which other apps should inherit from */
module.exports = class Basement {
  /**
   * Initialize a new application.
   * @constructor
   * @param {Object} settings - Application settings.
   * @param {Object} [logger] - Custom logger that used instead of default.
   * @param {Object} boundaries - Application boundaries to handle.
   */
  constructor ({ settings, logger, boundaries }) {
    this.settings = settings
    this.logger = logger
    this.boundaries = boundaries
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
   * Custom logger setter with type checking and fallback to default one.
   * @param {Object} [logger] - Application logger.
   * @access private
   */
  set logger (logger) {
    if (logger === undefined) {
      this._logger = initialLogger
    } else {
      if (logger instanceof Object === false || !Object.keys(logger).length) {
        throw new Error('Logger argument must either be an object representing logger instance or not passed at all')
      }

      // Overwrite reference to the initial logger, so the most important
      // application events handlers will utilize the custom logger as well
      initialLogger = logger

      this._logger = logger
    }
  }

  /**
   * Logger getter.
   * @access public
   * @return {Object} Current application logger.
   */
  get logger () {
    return this._logger
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
      const hasInit = Object.prototype.hasOwnProperty.call(boundary, 'init')
      const hasStop = Object.prototype.hasOwnProperty.call(boundary, 'stop')

      // Check that each boundary has required methods for Basement handlers
      if (!hasInit || !hasStop) {
        throw new Error(`Boundary ${boundary} must implement static async init() and stop() methods`)
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
    this.logger.info('Starting...');

    // Setup kernel signals stop handlers before start
    // so everything will shutdown at least partially
    ['SIGTERM', 'SIGINT', 'SIGHUP'].forEach((sigEvent) => {
      process.on(sigEvent, () => this.stop())
    })

    try {
      await this.startSequence()
    } catch (error) {
      if (!isTest) {
        this.logger.error(error, '✘ Error during startup')
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
      this.logger.error('✘ Stopped forcefully, not all connections were closed')
      if (!isTest) process.exit(1)
    }, this.settings.shutdownTimeout)

    try {
      await this.stopSequence()
      clearTimeout(timeoutId)
    } catch (error) {
      if (!isTest) {
        this.logger.error(error, '✘ Error during shutdown')
        process.exit(1)
      } else {
        throw error
      }
    }
  }
}
