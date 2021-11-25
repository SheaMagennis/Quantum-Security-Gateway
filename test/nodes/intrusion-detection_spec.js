const intrusionDetectionNode = require('../../nodes/quantum-algorithms/intrusion-detection/intrusion-detection.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');

const flow = new FlowBuilder();

describe('IntrusionDetectionNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(intrusionDetectionNode, 'intrusion-detection', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('intrusion-detection', 'intrusionDetectionNode', [[]]);
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      // console.log(JSON.stringify(inputNode, null, 4));
      inputNode.should.have.property('name', 'intrusion detection');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('intrusion-detection', 'i1', []);

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if json has wrong headers', function(done) {
    flow.add('shors', 'n1', []);

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.BAD_FORMAT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('intrusion-detection', 'intrusionDetectionNode', [['helperNode']]);
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
