/**
 * This module defines a custom jsDoc tag.
 * It allows you to document methodRoles parameters.
 * @module lib/route
 */

exports.name = 'roles';

exports.options = {
  mustHaveValue: true,
  onTagged(doclet, tag) {
    doclet.roles = tag.value.split(' ');
  },
};
