const KeyComparisonNode = require('../../nodes/quantum-keys/key-comparison/key-comparison.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('KeyComparisonNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(KeyComparisonNode, 'key-comparison', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('key-comparison', 'KeyComparisonNode', [[]],
        {firstKey: '1 0 0', secondKey: '1 1 1'});
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'key comparison');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow.add('key-comparison', 'KeyComparisonNode', [['helperNode']],
        {firstKey: '1 0 0', secondKey: '1 1 1'});
    flow.addOutput('helperNode');
    const givenInput = {payload: 15};
    const expectedOutput = 'match';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
