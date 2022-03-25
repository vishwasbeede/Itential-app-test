// This file is used to override specific testing rules for the utils dir
module.exports = {
  'rules': {
    // everything in utils is a cli tool, console logs are fine
    'no-console': 0,
    // some of the utils use dependencies from dev deps. not a big deal.
    'import/no-extraneous-dependencies': 0,
  }
};
