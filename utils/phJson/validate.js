#!/usr/bin/env node

/**
 * This script is intended to validate a pronghorn.json file. It could be
 * modified to support other well understood JSON files as well.
 */

const Ajv = require('ajv');

// options can be passed, e.g. {allErrors: true}
const ajv = new Ajv();
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));
const schema = require('./schemas/pronghorn.schema.json');
const ph = require('../../pronghorn.json');

const validate = ajv.compile(schema);
const valid = validate(ph);
if (valid) {
  console.log('pronghorn.json is valid');
} else {
  console.error(validate.errors);
  process.exit(1);
}
