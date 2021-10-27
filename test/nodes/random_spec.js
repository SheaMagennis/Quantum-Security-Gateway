const randomNode = require('../../nodes/quantum-algorithms/random/random.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('RandomNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(randomNode, 'random', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('random', 'randomNode', [[]]);

    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'random');
      done();
    });
  });

  it('return success output on valid input', function(done) {
    flow.add('random', 'randomNode', [['helperNode']]);
    flow.addOutput('helperNode');

    const givenInput = {payload: 15};
    const expectedLowerOutput = {
      randVal: 0,
    };
    const expectedHigherOutput = {
      randVal: 63,
    };
    testUtil.outputReceivedInCorrectRange(flow, givenInput, expectedLowerOutput, expectedHigherOutput, done);
  }).timeout(25000);
});
