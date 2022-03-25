/**
 * This module defines a custom jsDoc tag.
 * It allows you to document isTask tag.
 * @module lib/task
 */


exports.name = 'task';

exports.options = {
  mustHaveValue: true,
  onTagged(doclet, tag) {
    doclet[tag.originalTitle] = !!((tag.value === true || tag.value === 'true'));
  },
};
