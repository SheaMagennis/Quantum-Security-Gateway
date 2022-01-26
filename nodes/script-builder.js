'use strict';
const snippets = require('./snippets');
const util = require('util');

function constructSnippet(name, build, reduction, params) {
  let imp = name + '_IMPORTS';
  if (build === true) {
    name = 'CREATE_' + name;
  }
  let sta = name + '_START';
  let end = name + '_END';
  let final = snippets[imp]+snippets[sta];
  if (reduction !== false) {
    final = final + snippets[reduction];
  }
  final = final + snippets[end];
  if (Array.isArray(params)) {
    // eslint-disable-next-line guard-for-in
    for (let i in params) {
      final=util.format(final, params[i]);
    }
  } else {
    final=util.format(final, params);
  }
  return final;
};

module.exports = {
  constructSnippet,
};
