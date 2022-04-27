const SecondBasesGenerationNode =
    require('../../nodes/quantum-keys/second-bases-generation/second-bases-generation.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('SecondBasesGenerationNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('message generation setup', function(done) {
    flow.add('message-generation', 'MessageGenerationNode', [['helperNode']],
        {bits: '3'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 15};
    const expectedOutput = 'First';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);

  it('load node', function(done) {
    testUtil.isLoaded(SecondBasesGenerationNode, 'second-bases-generation', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('second-bases-generation', 'SecondBasesGenerationNode', [[]],
        {firstKey: '1 0 0', secondKey: '1 1 1'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'second bases generation');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow.add('second-bases-generation', 'SecondBasesGenerationNode', [['helperNode']],
        {bits: '3'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 15};
    const expectedOutput = 'Second';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
