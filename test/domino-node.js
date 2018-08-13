/* jshint node: true, esnext: true */
/* global QUnit */
'use strict';

// Test DOMPurify + domino using Node.js (version 6 and up)
const createDOMPurify = require('../dist/purify.cjs');
const domino = require('domino');
const fs = require('fs');
const testSuite = require('./test-suite');
const tests = require('./fixtures/expect');
const xssTests = tests.filter( element => /alert/.test( element.payload ) );

require('qunit-parameterize/qunit-parameterize');

QUnit.assert.contains = function( needle, haystack, message ) {
  const result = haystack.indexOf(needle) > -1;
  this.push(result, needle, haystack, message);
};

QUnit.config.autostart = false;

function run() {
    const window = domino.createWindow(
        `<html><head></head><body><div id="qunit-fixture"></div></body></html>`
    );

    require('../node_modules/jquery/dist/jquery.js')(window);
    QUnit.module('DOMPurify in domino');

    if (!window.jQuery) {
        console.warn('Unable to load jQuery');
    }

    const DOMPurify = createDOMPurify(window);
    if (!DOMPurify.isSupported) {
        console.error('Unexpected error returned by domino');
        process.exit(1);
    }

    window.alert = () => {
        window.xssed = true;
    };

    testSuite(DOMPurify, window, tests, xssTests);
    QUnit.start();
}

run();
