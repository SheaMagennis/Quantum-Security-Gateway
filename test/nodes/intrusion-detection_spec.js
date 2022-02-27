const intrusionDetectionNode = require('../../nodes/quantum-algorithms/intrusion-detection/intrusion-detection.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/error-shared');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();
// ,"dur":{"0":0.000011,"1":0.000008,"2":0.000005}
let baseJSON= `{"payload":{%s,"proto":{"0":"tcp","1":"udp","2":"udp"},
"service":{"0":"-","1":"-","2":"-"},"state":{"0":"INT","1":"INT","2":"INT"},
"spkts":{"0":2,"1":2,"2":5}}}`;

let creationJSON = `{"payload":{%s, "dur":{"0":0.11,"1":0.12,"2":0.9},
"proto":{"0":"tcp","1":"udp","2":"udp"},"service":{"0":"-","1":"-","2":"-"},"state":{"0":"INT","1":"INT","2":"INT"},
"spkts":{"0":2,"1":2,"2":5}}}`;

describe('IntrusionDetectionNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('intrusion setup', function(done) {
    flow.add('intrusion-detection-creation', 'idc',
        [['helperNode']], {shots: '10', modelName: 'testing'});
    flow.addOutput('helperNode');
    let temp = `"label": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(creationJSON, temp));
    const expectedOutput = 'Intrusion Detection Model successfully created';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('load node', function(done) {
    testUtil.isLoaded(intrusionDetectionNode, 'intrusion-detection', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('intrusion-detection', 'id1', [[]], {modelName: 'testing', modelUsage: 'predict'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'intrusion detection');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('intrusion-detection', 'id1', [], {modelName: 'testing', modelUsage: 'predict'});

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if json has wrong headers', function(done) {
    flow.add('intrusion-detection', 'id1', [], {modelName: 'testing', modelUsage: 'predict'});

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.BAD_HEADERS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('intrusion-detection', 'id1', [], {modelName: 'testing', modelUsage: 'predict'});
    let sub = `"dur":{"0":"error","1":0.000008,"2":0.000008}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_FORMAT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if uneven number of values', function(done) {
    flow.add('intrusion-detection', 'id1', [], {modelName: 'testing', modelUsage: 'predict'});
    let sub = `"dur":{"0":0.000008,"1":0.000008,"2":0.000008,"3":0.000008}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.UNEVEN;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if less than three packets sent for classification', function(done) {
    flow.add('intrusion-detection', 'id1', [], {modelName: 'testing', modelUsage: 'predict'});
    let sub = `"dur":{"0":0.000008,"1":0.000008}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.NEEDS_MORE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('intrusion-detection', 'id1', [], {modelName: 'testing', modelUsage: 'predict'});
    let sub = `"dur":{"bad":0.000008,"1":0.000008,"2":0.000008}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('intrusion-detection', 'id1', [['helperNode']], {modelName: 'testing', modelUsage: 'predict'});
    flow.addOutput('helperNode');
    let temp = `"dur":{"0":0.11,"1":0.12,"2":0.9}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'threat';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('return success output on valid test input', function(done) {// change
    flow.add('intrusion-detection', 'id1', [['helperNode']], {modelName: 'testing', modelUsage: 'test'});
    flow.addOutput('helperNode');
    let temp = `"label": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(creationJSON, temp));
    console.log(givenInput);
    const expectedOutput = 'accuracy';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('delete intrusion setup', function(done) {// change
    flow.add('delete-model', 'dm', [['helperNode']], {model_name: 'testing', model_type: 'qsvc'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'Model testing deleted';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
