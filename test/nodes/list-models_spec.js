const listModelsNode = require('../../nodes/quantum-algorithms/list-models/list-models.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();

let baseJSON= `{"payload":{%s,"dur":{"0":0.000011,"1":0.000008,"2":0.000005},"proto":{"0":"tcp","1":"udp","2":"udp"},
"service":{"0":"-","1":"-","2":"-"},"state":{"0":"INT","1":"INT","2":"INT"},
"spkts":{"0":4,"1":2,"2":2}}}`;

describe('ListModelsNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('list setup', function(done) {
    flow.add('intrusion-detection-creation', 'intrusionDetectionNodeInList',
        [['helperNode']], {shots: '10', modelName: 'testing'});
    flow.addOutput('helperNode');
    let temp = `"label": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'done';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('load node', function(done) {
    testUtil.isLoaded(listModelsNode, 'list-models', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('list-models', 'listModelsNode', [[]]);
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'list models');
      done();
    });
  });

  it('return model names', function(done) {// change
    flow.add('list-models', 'listModelsNode', [['helperNode']]);
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'testing';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('return success output on valid input', function(done) {// change
    flow.add('delete-model', 'deleteModelNode', [['helperNode']], {model_name: 'testing', model_type: 'qsvc'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'model';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
