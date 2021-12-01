'use strict';

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

function validateIntrusionInput(msg) {
  if (typeof(msg.payload) !== 'object') {
    return new Error(INPUT_JSON);
  }
  let headers = ['id', 'dur', 'proto', 'service', 'state', 'spkts',
    'dpkts', 'sbytes', 'dbytes', 'rate', 'sttl', 'dttl', 'sload',
    'dload', 'sloss', 'dloss', 'sinpkt', 'dinpkt', 'sjit', 'djit',
    'swin', 'stcpb', 'dtcpb', 'dwin', 'tcprtt', 'synack', 'ackdat',
    'smean', 'dmean', 'trans_depth', 'response_body_len', 'ct_srv_src',
    'ct_state_ttl', 'ct_dst_ltm', 'ct_src_dport_ltm', 'ct_dst_sport_ltm',
    'ct_dst_src_ltm', 'is_ftp_login', 'ct_ftp_cmd', 'ct_flw_http_mthd',
    'ct_src_ltm', 'ct_srv_dst', 'is_sm_ips_ports'];
  if (JSON.stringify(Object.keys(msg.payload))!==JSON.stringify(headers)) {
    return new Error(BAD_HEADERS);
  }
  let vals = Object.values(msg.payload);// new
  let headerNum=-1;
  let protoVals=['udp', 'arp', 'tcp', 'ospf', 'sctp'];// and more
  let serviceVals=['http', '-', 'ftp'];// and more
  let stateVals=['FIN', 'INT'];
  for (const val of vals) {
    let subVal=Object.values(val);
    headerNum+=1;
    for (const sinVal of subVal) {
      if (headerNum<2 || headerNum>4) {// number of string
        if (isNaN(sinVal) ) {
          return new Error(BAD_FORMAT);
        }
      } else if (headerNum===2) {
        if (!protoVals.includes(sinVal)) {
          return new Error(BAD_FORMAT);
        }
      } else if (headerNum===3) {
        if (!serviceVals.includes(sinVal)) {
          return new Error(BAD_FORMAT);
        }
      } else if (headerNum===4) {
        if (!stateVals.includes(sinVal)) {
          return new Error(BAD_FORMAT);
        }
      }
    }
  }
  // are the number of elements equal
  // are the key names correct
  return null;
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
  validateQubitInput,
  validateRegisterInput,
  validateQubitsFromSameCircuit,
  validateRegisterStrucutre,
  validateGroversInput,
  validateShorsInput,
  validateRandomInput,
  validateIntrusionInput,
};
