# MS-Basement package

## Overview

This package is the base for each microservice, which provides an interface for implementation by derived application. It powers up boundaries, handles startup and graceful shutdown, binds basic Node.js `process` event handlers.

## Installation

This package is a part of [Koyfin microservices generator](https://github.com/Koyfin/generator-ms) and does not need explicit installation in general case, but it still can be used as a standalone application base:

```bash
npm install @koyfin/basement
```

## Usage

New application is created by extending the `Basement` class and overriding `constructor` arguments, `startSequence` and `stopSequence` methods.

```javascript
//src/app.js
const Basement = require('@koyfin/ms-basement');
const settings = require('./settings');

const boundaries = {
  inbound: require('./boundaries/inbound'),
  outbound: require('./boundaries/outbound'),
};

module.exports = class App extends Basement {
  /**
   * @todo If necessary, implement custom logger
   */
  constructor() {
    super({ settings, boundaries });
  }

  async startSequence() {
    await this.boundaries.inbound.init();
    await this.boundaries.outbound.init();
  }

  async stopSequence() {
    await this.boundaries.outbound.stop();
    await this.boundaries.inbound.stop();
  }
};

```
After that, instantiate the application and call it's public `start` method:

```javascript
// src/index.js
const App = require('./app');

const app = new App();

app.start();
```
