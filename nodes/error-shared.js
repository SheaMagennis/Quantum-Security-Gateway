'use strict';
const fs = require('fs');

/*
 * Node-RED nodes error handling functions should be defined here for homogeneity and reuse.
 *
 * Remember to export these validation functions at the end of the file.
 *
 * To use values from JavaScript code within an error message, insert a '%s' where you want
 * to place the values. You can then use the util.format() function to replace them with
 * the values at runtime.
 */

const INPUT_JSON =
'The input must be a JSON value';

const BAD_FORMAT =
'The value types assigned to the json keys are incorrect';

const BAD_HEADERS =
'The keys in the inputted json do not match those required';

const NEEDS_MORE =
'At least three records of data are needed in the json';

const UNEVEN =
'There should be the same number of key-value pairs for each header';

const BAD_SUBKEYS =
'The sub-keys must be sequential strings of incremental values, starting from 0';

const NO_LABEL =
'No label field has been provided';

const NO_TARGET =
'No label field has been provided';

const BAD_LABEL_VALUE =
'Value in label must be either 0 or 1';

const BAD_TARGET_VALUE =
'The Value in target must be an integer';

const LACKING_LABEL_DIVERSITY =
'The records must have at least one record labelled with 0 and one with 1, with the value in label being either 0 or 1';

const BAD_TARGET_DIVERSITY =
'The records must have at least two differing targets';

const NOT_ENOUGH_FIELDS =
'Value in label must be either 0 or 1';

const NO_MODEL = 'No model exists by this name';

const EXISTING_MODEL = 'A model by this name already exists';

const BAD_PCA='The inputted JSON records are too similar for PCA reduction.';

const BAD_TIME='The date/time entered is not in the correct format';

const MISMATCHED_TYPES =
'The types held by the sub-keys must be consistent';

const ONE_INPUT ='Only one input field permitted';

function checkPredTime(msg) {
  let key=Object.keys(msg.payload)[0];
  if (Object.keys(msg.payload).length>1) {
    return new Error(ONE_INPUT);
  }
  let values = Object.values(msg.payload[key]);
  let re = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/;
  for (let t=0; t<values.length; t++) {
    try {
      if (!re.test(values[t])) {
        return new Error(BAD_TIME);
      }
    } catch (err) {
      return new Error(BAD_TIME);
    }
  }
}

function checkTime(msg) {
  if (!Object.keys(msg.payload).includes('DateTime')) {
    return new Error(NO_TARGET);
  }
  let time = msg.payload['DateTime'];
  let timeValues = Object.values(time);
  let re = /[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (2[0-3]|[01][0-9]):[0-5][0-9]:[0-5][0-9]/;
  for (let t=0; t<timeValues.length; t++) {
    try {
      if (!re.test(timeValues[t])) {
        return new Error(BAD_TIME);
      }
    } catch (err) {
      return new Error(BAD_TIME);
    }
  }
}

function targetDiverse(msg) {
  let target = msg.payload['Target'];
  let targetValues = Object.values(target);
  let same = true;
  let firstVal = targetValues[0];
  for (const aVal of targetValues) {
    if (aVal !== firstVal) {
      same = false;
      break;
    }
  }
  if (same) {
    return new Error(BAD_TARGET_DIVERSITY);
  }
}

function checkTarget(msg) {
  if (!Object.keys(msg.payload).includes('Target')) {
    return new Error(NO_TARGET);
  }
  let target = msg.payload['Target'];
  let targetValues = Object.values(target);
  if (targetValues.some((elem) => (typeof elem !== 'number'))) {
    return new Error(BAD_TARGET_VALUE);
  }
}

function checkModelExists(modelName, modelType) {
  let found = false;
  let data = fs.readFileSync('./model_information/model_information.csv', 'utf8');
  data = data.toString().split('\r\n');
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  }
  for (let j = 1; j < data.length - 1; j++) {
    if (data[j][0] === modelType + modelName) {
      found = true;
    }
  }
  return found;
}

function checkPCA(msg, first) {
  let distinct=0;
  let temp = Object.values(msg.payload);
  for (const t of temp) {
    let oTemp=Object.values(t);
    let firstVal=oTemp[0];
    for (const third of oTemp) {
      if (third!==firstVal) {
        distinct+=1;
        break;
      }
    }
  }
  let val=3;
  if (first) {
    val=4;
  }
  if (distinct<val) {
    return new Error(BAD_PCA);
  }
}

function checkCreateLabel(msg) {
  if (Object.keys(msg.payload).length<4) {
    return new Error(NOT_ENOUGH_FIELDS);
  }
  let label = msg.payload['label'];
  let labelValues = Object.values(label);
  if (!(labelValues.includes(0)&&labelValues.includes(1))) {
    return new Error(LACKING_LABEL_DIVERSITY);
  }
}

function checkLabel(msg) {
  if (!Object.keys(msg.payload).includes('label')) {
    return new Error(NO_LABEL);
  }
  let label = msg.payload['label'];
  let labelValues = Object.values(label);
  let corrVals =[0, 1];
  if (!labelValues.every((elem) => corrVals.includes(elem))) {
    return new Error(BAD_LABEL_VALUE);
  }
}

function checkCreationJSON(msg, modelName, modelType) {
  let found = checkModelExists(modelName, modelType);
  if (found) {
    return new Error(EXISTING_MODEL);
  }
  if (typeof(msg.payload) !== 'object') {
    return new Error(INPUT_JSON);
  }
  let vals = Object.values(msg.payload);
  let headerNum=-1;
  let standardLen = 0;
  for (const val of vals) {
    if (headerNum===-1) {
      standardLen = Object.keys(val).length;
    } else {
      if (Object.keys(val).length !== standardLen) {
        return new Error(UNEVEN);
      }
    }
    let subVal=Object.values(val);
    if (subVal.length<3) {
      return new Error(NEEDS_MORE);
    }
    let firstType=typeof(subVal[0]);
    if (!subVal.every((elem) => typeof(elem)===firstType)) {
      return new Error(MISMATCHED_TYPES);
    }
    headerNum+=1;
    const hasKeys = !!Object.keys(val).length;
    if (hasKeys) {
      let subKey = Object.keys(val);
      let keyLen = subKey.length;
      for (let i = 0; i < keyLen; i++) {
        if (subKey[i] !== i.toString()) {
          return new Error(BAD_SUBKEYS);
        }
      }
    }
  }
};

function getTypesHeader(modelName, mType) {
  let headers=[];
  let types=[];
  let found=false;

  let data = fs.readFileSync('./model_information/model_information.csv', 'utf8');
  data = data.toString().split('\r\n');

  for (let i = 0; i<data.length; i++) {
    data[i] = data[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  }

  for (let j = 1; j<data.length-1; j++) {
    if (data[j][0] === mType+modelName) {
      if (data[j][1].charAt(0)==='"') {
        headers = data[j][1].split(',');
        types = data[j][2].split(',');
        headers[0] = headers[0].substr(1);
        types[0] = types[0].substr(1);
        headers[headers.length-1] = headers[headers.length-1].slice(0, -1);
        types[types.length-1] = types[types.length-1].slice(0, -1);
      } else {
        headers=[data[j][1]];
        types=[data[j][2]];
      }
      found=true;
    }
  }
  if (!found) {
    return new Error(NO_MODEL);
  }
  return [headers, types];
}

function orderIndex(saved, keys) {
  const keysIndex = [];
  // eslint-disable-next-line guard-for-in
  for (const i of keys) {
    keysIndex.push(saved.indexOf(i));
  }
  return keysIndex;
}

function checkUseJSON(msg, modelName, mType, ignore) {
  if (typeof(msg.payload) !== 'object') {
    return new Error(INPUT_JSON);
  }
  let details = getTypesHeader(modelName, mType);
  let headers = details[0];
  let types = details[1];
  types = covertPythonTypeToJS(types);
  let pLoad=JSON.parse(JSON.stringify(msg.payload));
  if (Object.keys(pLoad).includes(ignore)) {
    delete pLoad[ignore];
  }

  let pNew = Object.keys(pLoad).slice();
  let hNew=headers.slice();
  if (JSON.stringify(pNew.sort())!==JSON.stringify(hNew.sort())) {
    return new Error(BAD_HEADERS);
  }

  let keyToHeaderMapping=orderIndex(headers, Object.keys(pLoad));
  let vals = Object.values(pLoad);
  let headerNum=0;
  let standardLen = 0;
  for (const val of vals) {
    if (headerNum===0) {
      standardLen = Object.keys(val).length;
    } else {
      if (Object.keys(val).length !== standardLen) {
        return new Error(UNEVEN);
      }
    }
    let subVal=Object.values(val);
    if (subVal.length<3) {
      return new Error(NEEDS_MORE);
    }
    const hasKeys = !!Object.keys(val).length;
    if (hasKeys) {
      let subKey = Object.keys(val);
      let keyLen = subKey.length;
      for (let i = 0; i<keyLen; i++) {
        if (subKey[i]!==i.toString()) {
          return new Error(BAD_SUBKEYS);
        }
      }
    }
    let qInd = keyToHeaderMapping[headerNum];
    let oneType = types[qInd];
    for (const sinVal of subVal) {
      if (!(typeof (sinVal) === oneType)) {
        return new Error(BAD_FORMAT);
      }
    }
    headerNum+=1;
  }
  return null;
};

function covertPythonTypeToJS(inp) {
  inp = inp.map( (inc) => {
    if (inc === 'int' || inc === 'float') {
      return 'number';
    }
    if (inc === 'str') {
      return 'string';
    }
  });
  return inp;
};

module.exports = {
  INPUT_JSON,
  BAD_HEADERS,
  BAD_FORMAT,
  UNEVEN,
  NEEDS_MORE,
  BAD_SUBKEYS,
  NO_LABEL,
  NO_TARGET,
  BAD_LABEL_VALUE,
  BAD_TARGET_VALUE,
  MISMATCHED_TYPES,
  ONE_INPUT,
  checkCreateLabel,
  checkTime,
  checkPCA,
  checkLabel,
  checkTarget,
  checkUseJSON,
  checkCreationJSON,
  checkModelExists,
  targetDiverse,
  checkPredTime,
};
