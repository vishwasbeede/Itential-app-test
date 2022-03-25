/**
 * This module defines a custom jsDoc tag.
 * It allows you to document route parameters of a route.
 * @module lib/route
 */

exports.name = 'route';

exports.options = {
  mustHaveValue: true,
  mustNotHaveDescription: true,
  canHaveType: true,
  canHaveName: true,
  onTagged(doclet, tag) {
    doclet.route = {
      // TODO: Fix this please...
      // eslint-disable-next-line no-nested-ternary
      type: tag.value.type ? (tag.value.type.names.length === 1 ? tag.value.type.names[0] : tag.value.type.names) : '',
      name: tag.value.name,
    };
  },
};
