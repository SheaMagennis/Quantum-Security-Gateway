const intrusionDetectionCreationNode = require('../../nodes/quantum-algorithms/intrusion-detection-creation/' +
    'intrusion-detection-creation.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();
// 'label': {'0': 'error', '1': 2
let baseJSON= `{"payload":{%s,"dur":{"0":0.000011,"1":0.000008,"2":0.000005},"proto":{"0":"tcp","1":"udp","2":"udp"},
"service":{"0":"-","1":"-","2":"-"},"state":{"0":"INT","1":"INT","2":"INT"},
"spkts":{"0":4,"1":2,"2":2}}}`;

describe('IntrusionDetectionCreationNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(intrusionDetectionCreationNode, 'intrusion-detection-creation', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [[]],
        {shots: '100', modelName: 'testing'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'intrusion detection creation');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [], {shots: '100', modelName: 'testing'});

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if json has wrong headers', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [], {shots: '100', modelName: 'testing'});

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.NO_LABEL;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [], {shots: '100', modelName: 'testing'});
    let sub = `"label":{"0":2,"1":1,"2":0}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_LABEL_VALUE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if uneven number of values', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [], {shots: '100', modelName: 'testing'});
    let sub = `"label":{"0":1,"1":1,"2":0,"3":0}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.UNEVEN;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if less than three packets sent for classification', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [], {shots: '100', modelName: 'testing'});
    let sub = `"label":{"0":1,"1":0}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.NEEDS_MORE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('intrusion-detection-creation', 'idc', [], {shots: '100', modelName: 'testing'});
    let sub = `"label":{"bad":1,"1":0,"2":0}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('intrusion-detection-creation', 'idc',
        [['helperNode']], {shots: '100', modelName: 'testing'});
    flow.addOutput('helperNode');
    let temp = `"label": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'Intrusion Detection Model successfully created';
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('intrusion creation deletion', function(done) {// change
    flow.add('delete-model', 'dm', [['helperNode']], {model_name: 'testing', model_type: 'qsvc'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'Model testing deleted';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
