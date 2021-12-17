const anomalyDetectionNode = require('../../nodes/quantum-algorithms/anomaly-detection/anomaly-detection.js');
const testUtil = require('../test-util');
const nodeTestHelper = testUtil.nodeTestHelper;
const assert = require('chai').assert;
const errors = require('../../nodes/errors');
const {FlowBuilder} = require('../flow-builder');
const util = require('util');

const flow = new FlowBuilder();
// 'id': {'0': 'error', '1': 2
let baseJSON= `{"payload":{%s,"dur":{"0":0.000011,"1":0.000008,"2":0.000005},"proto":{"0":"udp","1":"udp","2":"udp"},
"service":{"0":"-","1":"-","2":"-"},"state":{"0":"INT","1":"INT","2":"INT"},
"spkts":{"0":2,"1":2,"2":2},"dpkts":{"0":0,"1":0,"2":0},"sbytes":{"0":496,"1":1762,"2":1068},
"dbytes":{"0":0,"1":0,"2":0},"rate":{"0":90909.0902,"1":125000.0003,"2":200000.0051},"sttl":{"0":254,"1":254,"2":254},
"dttl":{"0":0,"1":0,"2":0},"sload":{"0":180363632,"1":881000000,"2":854400000},"dload":{"0":0,"1":0,"2":0},
"sloss":{"0":0,"1":0,"2":0},"dloss":{"0":0,"1":0,"2":0},"sinpkt":{"0":0.011,"1":0.008,"2":0.005},
"dinpkt":{"0":0,"1":0,"2":0},"sjit":{"0":0,"1":0,"2":0},"djit":{"0":0,"1":0,"2":0},"swin":{"0":0,"1":0,"2":0},
"stcpb":{"0":0,"1":0,"2":0},"dtcpb":{"0":0,"1":0,"2":0},"dwin":{"0":0,"1":0,"2":0},
"tcprtt":{"0":0,"1":0,"2":0},"synack":{"0":0,"1":0,"2":0},"ackdat":{"0":0,"1":0,"2":0},
"smean":{"0":248,"1":881,"2":534},"dmean":{"0":0,"1":0,"2":0},"trans_depth":{"0":0,"1":0,"2":0},
"response_body_len":{"0":0,"1":0,"2":0},"ct_srv_src":{"0":2,"1":2,"2":3},
"ct_state_ttl":{"0":2,"1":2,"2":2},"ct_dst_ltm":{"0":1,"1":1,"2":1},
"ct_src_dport_ltm":{"0":1,"1":1,"2":1},"ct_dst_sport_ltm":{"0":1,"1":1,"2":1},"ct_dst_src_ltm":{"0":2,"1":2,"2":3},
"is_ftp_login":{"0":0,"1":0,"2":0},"ct_ftp_cmd":{"0":0,"1":0,"2":0},"ct_flw_http_mthd":{"0":0,"1":0,"2":0},
"ct_src_ltm":{"0":1,"1":1,"2":1},"ct_srv_dst":{"0":2,"1":2,"2":3},"is_sm_ips_ports":{"0":0,"1":0,"2":0}}}`;

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
    flow.add('anomaly-detection', 'i1', []);

    const givenInput = {payload: 1};
    const expectedMessage = errors.INPUT_JSON;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if json has wrong headers', function(done) {
    flow.add('anomaly-detection', 'n1', []);

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.BAD_HEADERS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if values are wrong type', function(done) {
    flow.add('anomaly-detection', 'n1', []);
    let sub = `"id":{"0":"error","1":2,"2":3}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_FORMAT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if uneven number of values', function(done) {
    flow.add('anomaly-detection', 'n1', []);
    let sub = `"id":{"0":1,"1":2,"2":3,"3":4}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.UNEVEN;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if less than three packets sent for classification', function(done) {
    flow.add('anomaly-detection', 'n1', []);
    let sub = `"id":{"0":1,"1":2}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.NEEDS_MORE;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return error if incorrect subkey used', function(done) {
    flow.add('anomaly-detection', 'n1', []);
    let sub = `"id":{"bad":1,"1":2,"2":3}`;
    const givenInput = JSON.parse(util.format(baseJSON, sub));
    const expectedMessage = errors.BAD_SUBKEYS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });

  it('return success output on valid input', function(done) {// change
    flow.add('anomaly-detection', 'anomalyDetectionNode', [['helperNode']]);
    flow.addOutput('helperNode');
    let temp = `"id": {"0": 1, "1": 2, "2": 3}`;
    const givenInput = JSON.parse(util.format(baseJSON, temp));
    const expectedOutput = 'Threat detected\r\nThreat detected\r\nThreat detected';
    const otherExpectedOutput = 'Threat detected\nThreat detected\nThreat detected';
    testUtil.aCorrectOutputReceived(flow, givenInput, expectedOutput, otherExpectedOutput, done);
  }).timeout(25000);
});
