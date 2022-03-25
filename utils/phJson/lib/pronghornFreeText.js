/**
 * This module defines a custom jsDoc tag.
 * It allows you to document any parameters to be used in pronghorn.json file.
 * @module lib/pronghornFreeText
 */

exports.name = 'pronghornFreeText';
exports.options = {
  mustHaveValue: true,
  mustNotHaveDescription: true,
  onTagged(doclet, tag) {
    doclet[tag.originalTitle] = tag.value;
  },
};
