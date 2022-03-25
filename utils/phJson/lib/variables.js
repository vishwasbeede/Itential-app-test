/**
 * This module defines a custom jsDoc tag.
 * It allows you to document methodRoles parameters.
 * @module lib/variables
 */


exports.name = 'variables';

exports.options = {
  mustHaveValue: true,
  onTagged(doclet, tag) {
    const js = {
      type: '',
      name: '',
    };
    const tags = tag.value.split(' ');
    if (tags[0].charAt(0) === '{' && tags[0].charAt(tags[0].length - 1) === '}') {
      js.type = tags[0].substring(1, tags[0].length - 1);
    }
    [, js.name] = tags;
    if (Array.isArray(doclet[tag.originalTitle])) {
      doclet[tag.originalTitle].push(js);
    } else {
      doclet[tag.originalTitle] = [js];
    }
  },
};
