/**
 * This module defines custom JSDOC tags for helping to generate pronghorn.json.
 */

const routeTag = require('./route.js');
const methodRolesTag = require('./methodRoles.js');
const variablesTag = require('./variables.js');
const task = require('./task.js');
const pronghornFreeText = require('./pronghornFreeText.js');
const enumerals = require('./enumerals.js');
const variableTooltip = require('./variableTooltip.js');

function defineTags(dictionary) {
  dictionary.defineTag(routeTag.name, routeTag.options);
  dictionary.defineTag(enumerals.name, enumerals.options)
    .synonym('enumerals')
    .synonym('enumeral');
  dictionary.defineTag(variablesTag.name, variablesTag.options)
    .synonym('incomingVariables')
    .synonym('outgoingVariables');
  dictionary.defineTag(methodRolesTag.name, methodRolesTag.options);
  dictionary.defineTag(task.name, task.options)
    .synonym('encrypted')
    .synonym('pronghorntitleblock');
  dictionary.defineTag(pronghornFreeText.name, pronghornFreeText.options)
    .synonym('export')
    .synonym('src')
    .synonym('title')
    .synonym('displayName')
    .synonym('pronghornId')
    .synonym('pronghornType')
    .synonym('path')
    .synonym('view')
    .synonym('icon')
    .synonym('pronghornTemplate');
  dictionary.defineTag(variableTooltip.name, variableTooltip.options);
}

module.exports.defineTags = defineTags;
