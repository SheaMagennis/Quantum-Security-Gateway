'use strict';
// const snippets = require('./snippets');
const util = require('util');
const shared = require('./snippets-advanced/model-shared');
let create='';
let between='';
let snippet='';
let single='';

function imports(name) {
  let path = './snippets-advanced/'+name+'/'+name+'-';
  create = require(path+'create-snippet');
  between = require(path+'shared');
  snippet = require(path+'snippet');
};

function importOne(name) {
  let path = './snippets-new-solutions/'+name;
  single = require(path+'create-snippet');
};

function constructSnipppetEnd(sumCon, reduction, end){
  let soFar=sumCon;
  if (reduction !== false) {
    soFar = shared[reduction+'_IMPORTS'] + soFar;
    soFar = soFar + shared[reduction];
  }
  soFar = soFar + snippet[end];
  return soFar;
}

function constructSnippet(name, build, reduction, params, usage) {
  imports(name);

  let imp = name + '_IMPORTS';
  let sumCon=between[imp];
  let end='';

  if (build===true) {
    name = 'CREATE_' + name;
    let sta = name + '_START';
    end = name + '_END';
    sumCon = sumCon+create[sta];
  } else {
    let sta = name + '_START';
    if (usage==='test') {
      end = name + '_TEST_END'; // switch with other test
    } else {
      end = name + '_END';
    }
    sumCon = sumCon+snippet[sta];
    if (usage ==='test') {
      let test = name + '_TEST';
      sumCon = sumCon + snippet[test];
    }
  }
  sumCon=constructSnipppetEnd(sumCon, reduction, end);
  sumCon=shared['SHARED_IMPORTS']+sumCon;
  return substituteSnippet(sumCon, params);
};

function constructSingleSnippet(name, params) {
  importOne(name);
  let sub = single[name];
  return substituteSnippet(sub, params);
}

function substituteSnippet(name, params) {
  let final = name;
  if (Array.isArray(params)) {
    // eslint-disable-next-line guard-for-in
    for (let i in params) {
      final=util.format(final, params[i]);
    }
  } else {
    final=util.format(final, params);
  }
  return final;
}

module.exports = {
  constructSnippet,
  constructSingleSnippet,
};
