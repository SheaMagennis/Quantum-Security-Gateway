const anomalyDetectionNode = require('../../nodes/quantum-algorithms/anomaly-detection/anomaly-detection.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();
let baseJSON= `{"payload":{%s,
"Destination":{"0":"140.2.12.26","1":"Broadcast","2":"12.169.15.21"},
"Protocol":{"0":"TCP","1":"ARP","2":"TCP"},"Length":{"0":55,"1":42,"2":67}}}`;

describe('AnomalyDetectionNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(anomalyDetectionNode, 'anomaly-detection', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('anomaly-detection', 'anomalyDetectionNode', [[]]);
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'anomaly detection');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('anomaly-detection', 'a1', []);

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('anomaly-detection', 'a1', []);
    let sub = `"id":{"0":"error","1":2,"2":3}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.MISMATCHED_TYPES;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if uneven number of values', function(done) {
    flow.add('anomaly-detection', 'a1', []);
    let sub = `"id":{"0":1,"1":2,"2":3,"3":4}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.UNEVEN;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('anomaly-detection', 'a1', []);
    let sub = `"id":{"bad":1,"1":2,"2":3}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('anomaly-detection', 'anomalyDetectionNode', [['helperNode']],{shots: '100'});
    flow.addOutput('helperNode');
    let temp = `"Source":{"0":"194.168.11.251","1":"72:64:fe:c9:e7:3a","2":"130.82.12.26"}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'Source';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
