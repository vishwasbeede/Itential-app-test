/**
 * This module defines a custom jsDoc tag.
 * It allows you to document variable tooltips.
 * @module lib/variables
 */

exports.name = 'variableTooltip';

exports.options = {
  mustHaveValue: true,
  onTagged(doclet, tag) {
    const variableTooltip = {
      variableName: '',
      value: '',
    };

    /* Matches a variable name inside curly braces followed by
     * a sequence of words seperated by whitespace.
     * Example: ^{varName} This is a tooltip$ -> [ 1: varName, 2: This is a tooltip ]
     */
    const matches = (/^\{([a-zA-Z][0-9a-zA-Z$_-]+)\}\s+((\w|\s|[.?!/,\(\)\[\]\{\:'}])+)$/g).exec(tag.value);
    if (matches) {
      [
        , // Skip the first element; it contains the entire matched string
        variableTooltip.variableName,
        variableTooltip.value
      ] = matches;
    } else {
      console.log(`Could not generate tooltip for ${tag.value}`);
    }


    if (!('variableTooltips' in doclet)) doclet.variableTooltips = [];
    doclet.variableTooltips.push(variableTooltip);
  },
};
