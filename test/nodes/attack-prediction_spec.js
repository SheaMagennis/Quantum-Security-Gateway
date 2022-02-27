const attackPredictionNode = require('../../nodes/quantum-algorithms/attack-prediction/attack-prediction.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/error-shared');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();
// ,"dur":{"0":0.000011,"1":0.000008,"2":0.000005}
let baseJSON= `{"payload":{%s}}`;

let creationJSON = `{"payload":{%s,"DateTime": {"0": "2010-10-19 13:55:36",
"1": "2025-11-29 13:55:36","2": "2010-12-19 13:55:36"}}}`;

describe('AttackPredictionNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('attack setup', function(done) {
    flow.add('attack-prediction-creation', 'apc',
        [['helperNode']], {shots: '10', modelName: 'testing'});
    flow.addOutput('helperNode');
    let temp = `"Target": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(creationJSON, temp));
    const expectedOutput = 'Attack Prediction Model successfully created';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('load node', function(done) {
    testUtil.isLoaded(attackPredictionNode, 'attack-prediction', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('attack-prediction', 'ap1', [[]], {modelName: 'testing'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'attack prediction');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('attack-prediction', 'ap1', [], {modelName: 'testing'});

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if json has wrong headers', function(done) {
    flow.add('attack-prediction', 'ap1', [], {modelName: 'testing'});

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.BAD_HEADERS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('attack-prediction', 'ap1', [], {modelName: 'testing'});
    let sub = `"DateTime":{"0":"error","1":0.000008,"2":0.000008}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_FORMAT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('attack-prediction', 'ap1', [], {modelName: 'testing'});
    let sub = `"DateTime": {"hi": "2010-10-19 13:55:36","1": "2025-11-29 13:55:36","2": "2010-12-19 13:55:36"}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('attack-prediction', 'ap1', [['helperNode']], {modelName: 'testing'});
    flow.addOutput('helperNode');
    let temp = `"DateTime": {"0": "2010-10-19 13:55:36","1": "2025-11-29 13:55:36","2": "2010-12-19 13:55:36"}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'predicted';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('delete attack setup', function(done) {// change
    flow.add('delete-model', 'dm', [['helperNode']], {model_name: 'testing', model_type: 'regr'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'Model testing deleted';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
