const attackPredictionCreationNode = require('../../nodes/quantum-algorithms/attack-prediction-creation/' +
    'attack-prediction-creation.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();

let baseJSON= `{"payload":{%s,"DateTime": {"0": "2010-10-19 13:55:36",
"1": "2025-11-29 13:55:36","2": "2010-12-19 13:55:36"}}}`;

describe('AttackPredictionCreationNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(attackPredictionCreationNode, 'attack-prediction-creation', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('attack-prediction-creation', 'apc', [[]],
        {shots: '100', modelName: 'testing'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'attack prediction creation');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('attack-prediction-creation', 'apc', [], {shots: '100', modelName: 'testing'});

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if json has wrong headers', function(done) {
    flow.add('attack-prediction-creation', 'apc', [], {shots: '100', modelName: 'testing'});

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.NO_LABEL;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('attack-prediction-creation', 'apc', [], {shots: '100', modelName: 'testing'});
    let sub = `"Target":{"0":"error","1":"1","2":"0"}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_TARGET_VALUE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if uneven number of values', function(done) {
    flow.add('attack-prediction-creation', 'apc', [], {shots: '100', modelName: 'testing'});
    let sub = `"Target":{"0":1,"1":1,"2":0,"3":0}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.UNEVEN;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('attack-prediction-creation', 'apc', [], {shots: '100', modelName: 'testing'});
    let sub = `"Target":{"bad":1,"1":0,"2":0}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('attack-prediction-creation', 'apc',
        [['helperNode']], {shots: '100', modelName: 'testing'});
    flow.addOutput('helperNode');
    let temp = `"Target": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'Attack Prediction Model successfully created';
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('attack creation deletion', function(done) {// change
    flow.add('delete-model', 'dm', [['helperNode']], {model_name: 'testing', model_type: 'regr'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'Model testing deleted';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});