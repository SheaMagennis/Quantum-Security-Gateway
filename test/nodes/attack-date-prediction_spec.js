const AttackDatePredictionNode =
    require('../../nodes/quantum-algorithms/attack-date-prediction/attack-date-prediction.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/error-shared');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();
let baseJSON= `{"payload":{%s}}`;

describe('AttackDatePredictionNode', function() {
  beforeEach(function(done) {
    nodeTestHelper.startServer(done);
  });

  afterEach(function(done) {
    flow.reset();
    nodeTestHelper.unload();
    nodeTestHelper.stopServer(done);
  });

  it('load node', function(done) {
    testUtil.isLoaded(AttackDatePredictionNode, 'attack-date-prediction', done);
  });

  it('default name outputs correctly', function(done) {
    flow.add('attack-date-prediction', 'AttackDatePredictionNode', [[]]);
    nodeTestHelper.load(flow.nodes, flow.flow, function() {
      let inputNode = nodeTestHelper.getNode(flow.inputId);
      inputNode.should.have.property('name', 'attack date prediction');
      done();
    });
  });

  it('return error if input is not json', function(done) {
    flow.add('attack-date-prediction', 'ad1', []);

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('attack-date-prediction', 'ad1', []);
    let sub = `"id":{"0":"error","1":2,"2":3}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.MISMATCHED_TYPES;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('attack-date-prediction', 'ad1', []);
    let sub = `"id":{"bad":1,"1":2,"2":3}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('attack-date-prediction', 'AttackDatePredictionNode', [['helperNode']], {shots: '1', backend: 'local'});
    flow.addOutput('helperNode');
    let temp = `"DateTime": {"0": "2010-10-19 13:55:36","1": "2025-11-29 13:55:36","2": "2010-12-19 13:55:36"}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'predicted date';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, done);
  }).timeout(25000);
});
