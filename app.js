/* eslint-disable class-methods-use-this */

// Set globals
/* global log */

/* Required libraries. */

const path = require('path');
const itentialPromisify = require('@itentialopensource/itentialpromisify');

/* Fetch in the other needed components for the this Adaptor */
// eslint-disable-next-line import/no-dynamic-require

const callbackify = require(path.join(__dirname, './utils/callbackify'));

// Fetch properties
const props = global.service_config.properties;

/**
*
* @name pronghornTitleBlock
* @pronghornId @ias/app-NumberTools
* @title NumberTools
* @export NumberTools
* @type Application
* @summary IAS library of tasks
* @displayName IAS Library Numbers tools
* @src cog.js
* @encrypted false
* @roles admin
*/


class NumberTools {
  constructor() {

    // this.reminderCalculation = this.reminderCalculation.bind(this);
    log.trace('App Properties', props);
    this.reminderCalculation = callbackify(this.reminderCalculation);
  }

  // callbackF(a,b){
  //   try{
  //     if(a != null){
  //       throw err(b)
  //     }
  //     return(b)
  //   } 
  //   catch(err){
  //     return err
  //   }
  // }

  /**
   * Calucalate  reminder fo a number.
   *
   * @description Calucalate  reminder fo a number.
   * @pronghornType method
   * @name reminderCalculation
   * @summary Find reminder of giveb two numbers
   * @param {number} dividend - e.g. 100
   * @variableTooltip {dividend} e.g. 100
   * @param {number} divisor - e.g. 12
   * @variableTooltip {divisor} e.g. 12
   * @param callback
   * @return {number} response results of reminder
   * @roles admin
   * @task true
   * @example
   * {
   *    "dividend": 100,
   *    "divisor": 12
   * }
   */
  reminderCalculation(dividend,divisor,callback){
    const errMsg = "Error input arguments should be integers";
   //  console.log(Number.isNaN(Number(inputData)))
   //  console.log(Number.isNaN(Number(inputData)))
  try{
  
   if( Number.isNaN(Number(dividend)) || Number.isNaN(Number(divisor))){
     
    log.error('You must specify inputs dividend and divisor as number');
    throw new Error(errMsg);
    // return callbackF(null, 'You must specify inputs dividend and divisor as number.');
       
   }
      log.info(`In reminderCalculation, with ${dividend}, ${divisor}`);
  //  console.log(`In reminderCalculation, with ${dividend}, ${divisor}`);
  //  return (dividend%divisor, null);
      const reminderRes= dividend%divisor;
  //  return(dividend%divisor)
      return reminderRes;

}
   catch (err) {
    // callback (null, err);
     throw new Error(err)
       }
}
}
module.exports = new NumberTools();