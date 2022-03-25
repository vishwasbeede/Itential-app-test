// Set globals
/* global describe it log */
/* eslint global-require:warn */

// include required items for testing & logging
/* eslint-disable import/no-extraneous-dependencies */
const assert = require('assert');
const fs = require('fs-extra');
// const mocha = require('mocha');
const winston = require('winston');
const td = require('testdouble');
// const { EventEmitter } = require('events');

// const anything = td.matchers.anything();

let logLevel = 'none';

global.$HOME = `${__dirname}/../..`;

global.log = td.object();
global.cogs = td.object();

// set the log levels that Pronghorn uses, spam and trace are not defaulted in so without
// this you may error on log.trace calls.
const myCustomLevels = {
  levels: {
    spam: 6,
    trace: 5,
    debug: 4,
    info: 3,
    warn: 2,
    error: 1,
    none: 0
  }
};

/* Set up dummy properties for testing */
global.service_config = {
  properties: {}
};

// need to see if there is a log level passed in
process.argv.forEach((val) => {
  // is there a log level defined to be passed in?
  if (val.indexOf('--LOG') === 0) {
    // get the desired log level
    const inputVal = val.split('=')[1];

    // validate the log level is supported, if so set it
    if (Object.hasOwnProperty.call(myCustomLevels.levels, inputVal)) {
      logLevel = inputVal;
    }
  }
});

// need to set global logging
global.log = new winston.Logger({
  level: logLevel,
  levels: myCustomLevels.levels,
  transports: [new winston.transports.Console()]
});

// require the app that we are going to be using
// const cog = require('../../app.js');

// begin the testing - these should be pretty well defined between the describe and the it!
describe('[unit] Workflow Tools Test', () => {
  describe('Workflow Application Tests', () => {
    describe('package.json', () => {
      it('should have a package.json', (done) => {
        fs.exists('package.json', (val) => {
          assert.equal(true, val);
          done();
        });
      });
    });

    describe('README.md', () => {
      it('should have a README', (done) => {
        fs.exists('README.md', (val) => {
          assert.equal(true, val);
          log.log('README.md exists');
          done();
        });
      });
    });
  });
});
