/**
 * This module defines a custom jsDoc tag.
 * It allows you to document methodRoles parameters.
 * @module lib/variables
 */


exports.name = 'enumerals';

exports.options = {
  mustHaveValue: true,
  onTagged(doclet, tag) {
    const js = {
      name: '',
      value: '',
    };
    const varName = tag.value.match(/\{.*?\}/g);
    if (varName[0].indexOf('->') !== -1) {
      const names = varName[0].substring(1, varName[0].length - 1).split('->');
      js.name = names[0].match(/[^\s*].*[^\s*]/g);
      js.display_name = names[1].match(/[^\s*].*[^\s*]/g);
    } else {
      js.name = varName[0].substring(1, varName[0].length - 1).match(/[^\s*].*[^\s*]/g);
    }
    const enumValue = tag.value.match(/\[.*?\]/g);
    js.value = JSON.parse(enumValue[0]);
    if (Array.isArray(doclet[tag.originalTitle])) {
      doclet[tag.originalTitle].push(js);
    } else {
      doclet[tag.originalTitle] = [js];
    }
  },
};
