'use strict';
const fs = require('fs');
const eHelper = require('./error-shared');


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

const NO_FILE =
'There is no model by this name';

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
  let z = eHelper.checkCreationJSON(msg, 'none', 'none');
  if (z instanceof Error) {
    return z;
  }
};

function validateAttackInput(msg, modelName, usage) {
  if (usage === 'test') {
    let x = eHelper.checkTarget(msg);
    if (x instanceof Error) {
      return x;
    }
  }
  let y = eHelper.checkUseJSON(msg, modelName, 'regr', 'Target');
  if (y instanceof Error) {
    return y;
  }
  let z = eHelper.checkTime(msg);
  if (z instanceof Error) {
    return z;
  }
};

function validateAttackCreationInput(msg, modelName) {
  let w = eHelper.checkCreationJSON(msg, modelName, 'regr');
  if (w instanceof Error) {
    return w;
  }
  let x = eHelper.checkTime(msg);
  if (x instanceof Error) {
    return x;
  }
  let y = eHelper.checkTarget(msg);
  if (y instanceof Error) {
    return y;
  }
  let z = eHelper.targetDiverse(msg);
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
  let w = eHelper.checkCreationJSON(msg, modelName, 'qsvc');
  if (w instanceof Error) {
    return w;
  }
  let x = eHelper.checkLabel(msg);
  if (x instanceof Error) {
    return x;
  }
  let y = eHelper.checkCreateLabel(msg);
  if (y instanceof Error) {
    return y;
  }
  let z = eHelper.checkPCA(msg, true);
  if (z instanceof Error) {
    return z;
  }
}

function validateIntrusionInput(msg, modelName, usage) {
  if (usage === 'test') {
    let x = eHelper.checkLabel(msg);
    if (x instanceof Error) {
      return x;
    }
  }
  let y = eHelper.checkUseJSON(msg, modelName, 'qsvc', 'label');
  let z = eHelper.checkPCA(msg, false);
  if (y instanceof Error) {
    return y;
  }
  if (z instanceof Error) {
    return z;
  }
}

function validateDatePredictionInput(msg) {
  let y = eHelper.checkCreationJSON(msg, 'none', 'none');
  if (y instanceof Error) {
    return y;
  }
  let z = eHelper.checkPredTime(msg);
  if (z instanceof Error) {
    return z;
  }
}

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
  NO_FILE,
  NO_INTERNET,
  GREATER_THAN_TWO,
  INPUT_ODD_INTEGER,
  INPUT_AN_INTEGER,
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
  validateDatePredictionInput,
};
