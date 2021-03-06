const util = require('util');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const {FlowBuilder} = require('../flow-builder');
const toffoliGateNode = require('../../nodes/quantum/toffoli-gate/toffoli-gate.js');
const snippets = require('../../nodes/snippets.js');
const errors = require('../../nodes/errors');

const flow = new FlowBuilder();

describe('ToffoliGateNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(toffoliGateNode, 'toffoli-gate', done);
  });

  it('pass qubit through gate', function(done) {
    flow.add('quantum-circuit', 'n0', [['n1'], ['n1'], ['n1']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '3'});
    flow.add('toffoli-gate', 'n1', [['n2'], ['n2'], ['n2']], {targetPosition: 'Upper'});
    flow.addOutput('n2');

    let payloadObjectList = [
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 0},
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 1},
      {structure: {qubits: 3, cbits: 3},
        register: undefined,
        qubit: 2},
    ];

    testUtil.qubitsPassedThroughGate(flow, payloadObjectList, done);
  });

  it('execute command', function(done) {
    let command = util.format(snippets.TOFFOLI_GATE, '0', '2', '1');
    flow.add('quantum-circuit', 'n0', [['n1'], ['n2'], ['n3']],
        {structure: 'qubits', outputs: '3', qbitsreg: '3', cbitsreg: '1'});
    flow.add('hadamard-gate', 'n1', [['n4']]);
    flow.add('hadamard-gate', 'n2', [['n4']]);
    flow.add('not-gate', 'n3', [['n4']]);
    flow.add('toffoli-gate', 'n4', [['n5'], ['n5'], ['n5']], {targetPosition: 'Middle'});
    flow.addOutput('n5');

    testUtil.commandExecuted(flow, command, done);
  });

  it('should fail on receiving input from non-quantum nodes', function(done) {
    flow.add('toffoli-gate', 'n1', [['n2'], ['n2'], ['n2']], {targetPosition: 'Middle'});
    flow.addOutput('n2');

    const givenInput = {payload: '', topic: ''};
    const expectedMessage = errors.NOT_QUANTUM_NODE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should fail on receiving non-qubit object', function(done) {
    flow.add('toffoli-gate', 'n1', [['n2'], ['n2'], ['n2']], {targetPosition: 'Middle'});
    flow.addOutput('n2');

    const givenInput = {payload: {structure: '', qubit: 3}, topic: 'Quantum Circuit'};
    const expectedMessage = errors.NOT_QUBIT_OBJECT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('should return correct output for register only circuit', function(done) {
    flow.add('quantum-circuit', 'qc', [['qr'], ['cr']],
        {structure: 'registers', outputs: '2', qbitsreg: '1', cbitsreg: '1'});
    flow.add('classical-register', 'cr', [[]], {classicalBits: '3'});
    flow.add('quantum-register', 'qr', [['to'], ['n1'], ['n2']], {outputs: 3});
    flow.add('not-gate', 'n1', [['to']]);
    flow.add('not-gate', 'n2', [['to']]);
    flow.add('toffoli-gate', 'to', [['m1'], ['m2'], ['m3']], {targetPosition: 'Top'});
    flow.add('measure', 'm1', [['si']], {selectedBit: 0});
    flow.add('measure', 'm2', [['si']], {selectedBit: 1});
    flow.add('measure', 'm3', [['si']], {selectedBit: 2});
    flow.add('local-simulator', 'si', [['out']], {shots: '1'});
    flow.addOutput('out');

    const givenInput = {payload: ''};
    const expectedOutput = {'111': 1};
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  });
});

