const KeyCreationNode = require('../../nodes/quantum-keys/key-creation/key-creation.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('KeyCreationNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(KeyCreationNode, 'key-creation', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('key-creation', 'KeyCreationNode', [[]],
        {firstKey: '1 0 0', secondKey: '1 1 1'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'key creation');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow.add('key-creation', 'KeyCreationNode', [['helperNode']],
        {firstBases: '0 1 1', secondBases: '0 0 1', privateValue: '1 0 0'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 15};
    const expectedOutput = 'key';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
