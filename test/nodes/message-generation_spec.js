const MessageGenerationNode = require('../../nodes/quantum-keys/message-generation/message-generation.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('MessageGenerationNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(MessageGenerationNode, 'message-generation', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('message-generation', 'MessageGenerationNode', [[]],
        {bits: '3'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'message generation');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow.add('message-generation', 'MessageGenerationNode', [['helperNode']],
        {bits: '3'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 15};
    const expectedOutput = 'First';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
