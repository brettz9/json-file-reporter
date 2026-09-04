// based on https://github.com/mochajs/mocha/blob/master/lib/reporters/json.js
/* eslint-disable n/no-sync -- Sync API */

import fs from 'node:fs';
import mocha from 'mocha';

const {
  EVENT_TEST_PASS,
  EVENT_TEST_FAIL,
  EVENT_TEST_END,
  EVENT_RUN_END,
  EVENT_TEST_PENDING
} = mocha.Runner.constants;

const DEFAULT_REPORT_PATH = 'report.json';

/* eslint-disable jsdoc/imports-as-dependencies -- Ok */
/**
 *
 */
class Reporter extends mocha.reporters.Base {
  /**
   * @param {import('mocha').Runner} runner
   * @param {{
   *   reporterOptions?: {output: string}
   * }} options
   */
  constructor (runner, options) {
    /* eslint-enable jsdoc/imports-as-dependencies -- Ok */

    super(runner, options);

    const tests = [];
    const pending = [];
    const failures = [];
    const passes = [];

    runner.on(EVENT_TEST_END, (test) => {
      tests.push(test);
    });

    runner.on(EVENT_TEST_PASS, (test) => {
      passes.push(test);
    });

    runner.on(EVENT_TEST_FAIL, (test) => {
      failures.push(test);
    });

    runner.on(EVENT_TEST_PENDING, (test) => {
      pending.push(test);
    });

    runner.once(EVENT_RUN_END, () => {
      const obj = {
        stats: this.stats,
        tests: tests.map((test) => clean(test)),
        pending: pending.map((element) => clean(element)),
        failures: failures.map((failure) => clean(failure)),
        passes: passes.map((pass) => clean(pass))
      };
      runner.testResults = obj;
      const json = JSON.stringify(obj, null, 2);
      let path = DEFAULT_REPORT_PATH;
      const {reporterOptions} = options;
      if (reporterOptions) {
        const {output} = reporterOptions;
        if (output) {
          path = output;
        }
      }
      const out = fs.openSync(path, 'w');
      fs.writeSync(out, json);
      fs.closeSync(out);
    });
  }
}

/* eslint-disable jsdoc/imports-as-dependencies -- Ok */
/**
 * @param {import('mocha').Test} test
 * @returns {{
 *   title: string,
 *   fullTitle: string,
 *   duration: number,
 *   currentRetry: boolean,
 *   err: Error | object
 * }}
 */
function clean (test) {
  /* eslint-enable jsdoc/imports-as-dependencies -- Ok */
  let err = test.err || {};
  if (err && typeof err === 'object' && typeof err.message === 'string') {
    err = errorJSON(err);
  }

  return {
    title: test.title,
    fullTitle: test.fullTitle(),
    duration: test.duration,
    currentRetry: test.currentRetry(),
    err: cleanCycles(err)
  };
}

/**
 * @param {object} obj
 * @returns {object}
 */
function cleanCycles (obj) {
  const cache = [];
  return JSON.parse(
    JSON.stringify(obj, function (key, value) {
      if (typeof value === 'object' && value !== null) {
        if (cache.includes(value)) {
          return String(value);
        }
        cache.push(value);
      }
      return value;
    })
  );
}

/**
 * @param {Error} err
 * @returns {Record<string, string>}
 */
function errorJSON (err) {
  const res = {};
  Object.getOwnPropertyNames(err).forEach((key) => {
    res[key] = err[key];
  });
  return res;
}

export default Reporter;
