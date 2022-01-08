const deleteModelNode = require('../../nodes/quantum-algorithms/delete-model/delete-model.js');
const intrusionDetectionCreationNode = require('../../nodes/quantum-algorithms/intrusion-detection-creation/intrusion-detection-creation.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();

let creationJSON = `{"label": {"0": 1, "1": 1, "2": 0},"payload":{"dur":{"0":0.000011,"1":0.000008,"2":0.000005},
"proto":{"0":"udp","1":"udp","2":"udp"},"service":{"0":"-","1":"-","2":"-"},"state":{"0":"INT","1":"INT","2":"INT"},
"spkts":{"0":2,"1":2,"2":2}}}`;

describe('DeleteModelNode', function() {

  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load creation node', function(done) {
    testUtil.isLoaded(intrusionDetectionCreationNode, 'intrusion-detection-creation', done);
  });

  it('delete setup', function(done) {
    flow.add('intrusion-detection-creation', 'intrusionDetectionNode',
        [['helperNode']], {shots: '100', modelName: 'testing'});
    flow.addOutput('helperNode');
    //let temp = `"label": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(creationJSON));
    const expectedOutput = 'done';
    testUtil.correctOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('load node', function(done) {
    testUtil.isLoaded(deleteModelNode, 'delete-model', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('delete-model', 'deleteModelNode', [[]]);
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'delete model');
      done();
    });
  });

  it('return success output on valid input', function(done) {// change
    flow.add('delete-model', 'deleteModelNode', [['helperNode']], {modelName: 'testing', model_type: 'qsvc'});
    flow.addOutput('helperNode');
    let temp = `"dur": {"0": 0.000008, "1": 0.000008, "2": 0.000008}`;
    const givenInput = {payload: 0};
    const expectedOutput = 'model';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('delete setup', function(done) {
    flow.add('delete-model', 'deleteModelNode', [['helperNode']], {model_name: 'testing', model_type: 'qsvc'});
    const givenInput = JSON.parse(util.format(creationJSON));
    testUtil.executeFlow(flow, givenInput, done);
  });
});
