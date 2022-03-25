/* eslint-disable no-console */
const callbackify = require('../utils/callbackify');

const fulfilledPromise = callbackify(async () => 'fullfilled');

const rejectedPromise = callbackify(async () => {
  throw new Error('rejected');
});

const succsesfulSync = callbackify(() => 'successful');

const erroredSync = callbackify(() => {
  throw new Error('failed');
});

fulfilledPromise((result, err) => {
  if (err) {
    console.error(`Errored. ${err.message}`);
  } else {
    console.log(`Fulfilled. ${result}`);
  }
});

rejectedPromise((result, err) => {
  if (err) {
    console.error(`Errored. ${err.message}`);
  } else {
    console.log(`Fulfilled. ${result}`);
  }
});

succsesfulSync((result, err) => {
  if (err) {
    console.error(`Syncronous error. ${err.message}`);
  } else {
    console.log(`Result. ${result}`);
  }
});

erroredSync((result, err) => {
  if (err) {
    console.error(`Syncronous error. ${err.message}`);
  } else {
    console.log(`Result. ${result}`);
  }
});
