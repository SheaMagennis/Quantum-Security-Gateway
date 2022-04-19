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
  single = require(path);
};

function constructSnipppetEnd(sumCon, reduction, end, build) {
  let soFar=sumCon;
  if (reduction !== false) {
    soFar = shared[reduction+'_IMPORTS'] + soFar;
    soFar = soFar + shared[reduction];
  }
  if (build) {
    soFar = soFar + create[end];
  } else {
    soFar = soFar + snippet[end];
  }
  return soFar;
}

function constructSnippet(name, build, reduction, params, usage, buildText='') {
  imports(name);
  let imp = name + '_IMPORTS';
  let sumCon=between[imp];
  let end='';

  if (build===true) {
    sumCon+=buildText;
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
  sumCon=constructSnipppetEnd(sumCon, reduction, end, build);
  sumCon=shared['SHARED_IMPORTS']+sumCon;
  return substituteSnippet(sumCon, params);
};

function constructSingleSnippet(name, params, backend='') {
  importOne(name);
  let sub = backend+single[name+'Import']+single[name];
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


// constructSnippet('1','2','3','4','5','6')
