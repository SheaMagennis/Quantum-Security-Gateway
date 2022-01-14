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

const NOT_QUANTUM_NODE =
'This node must be connected to nodes from the "Node-RED Quantum" library only.';

const USE_REGISTER_NODES =
'If "Registers & Bits" was selected in the "Quantum Circuit" node properties, ' +
'please connect "Quantum Register" & "Classical Register" nodes to the "Quantum Circuit" node outputs.';

const SELECT_REGISTER_AND_BITS =
'To use "Quantum Register" & "Classical Register" nodes, ' +
'please select "Registers & Bits" in the "Quantum Circuit" node properties.';

const NOT_QUBIT_OBJECT =
'This node must receive qubits objects as inputs.\n' +
'To generate qubits objects, please make use of the "Quantum Circuit" node.';

const NOT_REGISTER_OBJECT =
'This node must receive register objects as inputs.\n' +
'Please connect it to the outputs of the "Quantum Circuit" node.';

const INVALID_REGISTER_NUMBER =
'Please input the correct number of quantum & classical registers in the "Quantum Circuit" node properties.';

const QUBITS_FROM_DIFFERENT_CIRCUITS =
'Only qubits from the same quantum circuit should be connected to this node.';

const SAME_QUBIT_RECEIVED_TWICE =
'Please connect the right number of qubits to the node. For circuit output nodes, ' +
'all qubits should be connected as input. There should be only 1 instance of each qubit at all times in the circuit.';

const NOT_BIT_STRING =
'Only bit string consisting 0 and 1 are allowed';

const BLOCH_SPHERE_WITH_MEASUREMENT =
'The "Bloch Sphere Diagram" node is not compatible with "Measure" nodes because ' +
'measuring a qubit can collapse its state and lead to inconsistencies.\n'+
'Please disconnect or remove any "Measure" node from the quantum circuit.';

const GREATER_THAN_TWO =
'The input integer should be greater than 2';

const INPUT_ODD_INTEGER =
'The input integer should be odd';

const INPUT_AN_INTEGER =
'The input number should an integer';

const NO_INTERNET =
'Failed to connect to the internet.';

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

const NO_FILE =
'There is no model by this name';

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

function validateQubitInput(msg) {
  let keys = Object.keys(msg.payload);

  if (msg.topic !== 'Quantum Circuit') {
    return new Error(NOT_QUANTUM_NODE);
  } else if (keys.includes('register') && typeof msg.payload.register === 'number') {
    return new Error(USE_REGISTER_NODES);
  } else if (!keys.includes('register') || !keys.includes('qubit') || !keys.includes('structure')) {
    return new Error(NOT_QUBIT_OBJECT);
  } else return null;
};

function validateRegisterInput(msg) {
  let keys = Object.keys(msg.payload);
  if (msg.topic !== 'Quantum Circuit') {
    return new Error(NOT_QUANTUM_NODE);
  } else if (keys.includes('register') && typeof msg.payload.register === 'undefined') {
    return new Error(SELECT_REGISTER_AND_BITS);
  } else if ((keys.includes('register') && typeof msg.payload.register !== 'number') || keys.includes('qubit')) {
    return new Error(NOT_REGISTER_OBJECT);
  } else return null;
};

function validateGroversInput(msg) {
  const regex = new RegExp('^[0-1]{1,}$');
  if (!regex.test(msg.payload)) {
    return new Error(NOT_BIT_STRING);
  }
  return null;
};

function validateQubitsFromSameCircuit(qubits) {
  let circuitId = qubits[0].circuitId;
  let valid = qubits.every((obj) => obj.circuitId === circuitId);
  if (!valid) return new Error(QUBITS_FROM_DIFFERENT_CIRCUITS);

  valid = true;
  qubits.map((qubit, index) => {
    for (let i = index+1; i < qubits.length; i++) {
      if (i != index &&
      qubit.payload.register == qubits[i].payload.register &&
      qubit.payload.qubit == qubits[i].payload.qubit) {
        valid = false;
      }
    }
  });
  if (!valid) return new Error(SAME_QUBIT_RECEIVED_TWICE);
  else return null;
};

function validateRegisterStrucutre(structureInitialised, strucutreExpected) {
  let count = 0;
  let qreg = 0;
  let creg = 0;
  structureInitialised.map((x) => {
    if (typeof x !== 'undefined') {
      count += 1;
      if (x.registerType === 'quantum') qreg += 1;
      else creg += 1;
    }
  });

  if (qreg > strucutreExpected.qreg || creg > strucutreExpected.creg) {
    return new Error(INVALID_REGISTER_NUMBER), count;
  } else {
    return [null, count];
  }
};

function validateShorsInput(msg) {
  if (msg.payload < 3) {
    return new Error(GREATER_THAN_TWO);
  }
  if (msg.payload % 2 === 0) {
    return new Error(INPUT_ODD_INTEGER);
  }
  if (typeof(msg.payload) !== 'number' || msg.payload % 1 !== 0) {
    return new Error(INPUT_AN_INTEGER);
  }
  return null;
};

function validateRandomInput(msg) {
  return null;
};

function validateAnomalyInput(msg) {
  return null;
};

function validateAttackInput(msg, modelName) {
  let y = checkUseJSON(msg, modelName);
  let z = checkTime(msg);
  if (y instanceof Error) {
    return y;
  }
  if (z instanceof Error) {
    return z;
  }
};

function validateAttackCreationInput(msg) {
  let x = checkCreationJSON(msg);
  let y = checkTime(msg);
  let z = checkTarget(msg);
  if (x instanceof Error) {
    return x;
  }
  if (y instanceof Error) {
    return y;
  }
  if (z instanceof Error) {
    return z;
  }
};

function validateListInput(msg) {
  return null;
};

function validateHelperInput(msg) {
  const files = fs.readdirSync('./model_store');
  if (!files.includes(msg)) {
    return new Error(NO_FILE);
  }
};

function validateIntrusionCreationInput(msg, modelName) {
  let x = checkCreationJSON(msg, modelName);
  let y = checkLabel(msg, modelName);
  let z = checkPCA(msg, true);
  if (x instanceof Error) {
    return x;
  }
  if (y instanceof Error) {
    return y;
  }
  if (z instanceof Error) {
    return z;
  }
}

function validateIntrusionInput(msg, modelName) {
  let y = checkUseJSON(msg, modelName);
  let z = checkPCA(msg, false);
  if (y instanceof Error) {
    return y;
  }
  if (z instanceof Error) {
    return z;
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
function checkTarget(msg) {
  if (!Object.keys(msg.payload).includes('Target')) {
    return new Error(NO_TARGET);
  }
  let target = msg.payload['Target'];
  let targetValues = Object.values(target);
  if (targetValues.some((elem) => (typeof elem !== 'number'))) {
    return new Error(BAD_TARGET_VALUE);
  }
  let same=true;
  let firstVal=targetValues[0];
  for (const aVal of targetValues) {
    if (aVal!==firstVal) {
      same=false;
      break;
    }
  }
  if (same) {
    return new Error(BAD_TARGET_DIVERSITY);
  }
}

function checkModelExists(modelName) {
  let found = false;
  let data = fs.readFileSync('./model_information/model_information.csv', 'utf8');
  data = data.toString().split('\r\n');
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  }
  for (let j = 1; j < data.length - 1; j++) {
    if (data[j][0] === 'qsvc' + modelName) {
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

function checkLabel(msg) {
  if (!Object.keys(msg.payload).includes('label')) {
    return new Error(NO_LABEL);
  }
  if (Object.keys(msg.payload).length<4) {
    return new Error(NOT_ENOUGH_FIELDS);
  }
  let label = msg.payload['label'];
  let labelValues = Object.values(label);
  let corrVals =[0, 1];
  if (!labelValues.every((elem) => corrVals.includes(elem))) {
    return new Error(BAD_LABEL_VALUE);
  }
  if (!(labelValues.includes(0)&&labelValues.includes(1))) {
    return new Error(LACKING_LABEL_DIVERSITY);
  }
}

function checkCreationJSON(msg, modelName) {
  let found = checkModelExists(modelName);
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
    headerNum+=1;
    let subKey = Object.keys(val);
    let keyLen = subKey.length;
    for (let i = 0; i<keyLen; i++) {
      if (subKey[i]!==i.toString()) {
        return new Error(BAD_SUBKEYS);
      }
    }
  }
};

function getTypesHeader(modelName) {
  let headers=[];
  let types=[];
  let found=false;

  let data = fs.readFileSync('./model_information/model_information.csv', 'utf8');
  data = data.toString().split('\r\n');

  for (let i = 0; i<data.length; i++) {
    data[i] = data[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
  }

  for (let j = 1; j<data.length-1; j++) {
    if (data[j][0] === 'qsvc'+modelName) {
      headers = data[j][1].split(',');
      types = data[j][2].split(',');
      headers[0] = headers[0].substr(1);
      types[0] = types[0].substr(1);
      headers[headers.length-1] = headers[headers.length-1].slice(0, -1);
      types[types.length-1] = types[types.length-1].slice(0, -1);
      found=true;
    }
  }
  if (!found) {
    return new Error(NO_MODEL);
  }
  return [headers, types];
}

function checkUseJSON(msg, modelName) {
  if (typeof(msg.payload) !== 'object') {
    return new Error(INPUT_JSON);
  }

  let details = getTypesHeader(modelName);
  let headers = details[0];
  let types = details[1];
  types = covertPythonTypeToJS(types);

  if (JSON.stringify(Object.keys(msg.payload))!==JSON.stringify(headers)) {
    return new Error(BAD_HEADERS);
  }
  let vals = Object.values(msg.payload);
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
    let subKey = Object.keys(val);
    let keyLen = subKey.length;
    for (let i = 0; i<keyLen; i++) {
      if (subKey[i]!==i.toString()) {
        return new Error(BAD_SUBKEYS);
      }
    }
    let oneType = types[headerNum];
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
  NOT_QUANTUM_NODE,
  USE_REGISTER_NODES,
  SELECT_REGISTER_AND_BITS,
  NOT_QUBIT_OBJECT,
  NOT_REGISTER_OBJECT,
  INVALID_REGISTER_NUMBER,
  QUBITS_FROM_DIFFERENT_CIRCUITS,
  SAME_QUBIT_RECEIVED_TWICE,
  NOT_BIT_STRING,
  BLOCH_SPHERE_WITH_MEASUREMENT,
  GREATER_THAN_TWO,
  INPUT_ODD_INTEGER,
  INPUT_AN_INTEGER,
  NO_INTERNET,
  INPUT_JSON,
  BAD_HEADERS,
  BAD_FORMAT,
  UNEVEN,
  NEEDS_MORE,
  BAD_SUBKEYS,
  NO_LABEL,
  BAD_LABEL_VALUE,
  BAD_TARGET_VALUE,
  validateQubitInput,
  validateRegisterInput,
  validateQubitsFromSameCircuit,
  validateRegisterStrucutre,
  validateGroversInput,
  validateShorsInput,
  validateRandomInput,
  validateIntrusionInput,
  validateAnomalyInput,
  validateAttackInput,
  validateListInput,
  validateHelperInput,
  validateIntrusionCreationInput,
  validateAttackCreationInput,
};
