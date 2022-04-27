const detailModelNode = require('../../nodes/helper-nodes/detail-model/detail-model.js');
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

describe('DetailModelNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('detail setup', function(done) {
    flow.add('intrusion-detection-creation', 'idc',
        [['helperNode']], {shots: '10', modelName: 'testing', label: 'label', backend: 'local'});
    flow.addOutput('helperNode');
    let temp = `"label": {"0": 1, "1": 1, "2": 0}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'Intrusion Detection Model successfully created';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('load node', function(done) {
    testUtil.isLoaded(detailModelNode, 'detail-model', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('detail-model', 'dm2', [[]]);
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'detail model');
      done();
    });
  });

  it('return error if model not existing', function(done) {
    flow.add('detail-model', 'dm2', [['helperNode']], {model_name: 'nonExist', model_type: 'qsvc'});
    const givenInput = {payload: 'test'};
    const expectedMessage = errors.NO_MODEL;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('returns correct output on valid input', function(done) {// change
    flow.add('detail-model', 'dm2', [['helperNode']], {model_name: 'testing', model_type: 'qsvc'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'header';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('delete model once detail completed', function(done) {// change
    flow.add('delete-model', 'dm', [['helperNode']], {model_name: 'testing', model_type: 'qsvc'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 'test'};
    const expectedOutput = 'model';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
