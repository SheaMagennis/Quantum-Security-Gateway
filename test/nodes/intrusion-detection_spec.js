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
    flow.add('intrusion-detection', 'n1', []);

    const givenInput = {payload: {'name': 'Joe'}};
    const expectedMessage = errors.BAD_HEADERS;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });
  it('return error if values are wrong type', function(done) {
    flow.add('intrusion-detection', 'n1', []);
    // cleanup
    const givenInput = {payload: {'id': {'0': 'error', '1': 2},
      'dur': {'0': 0.000011, '1': 0.000008}, 'proto': {'0': 'udp', '1': 'udp'},
      'service': {'0': '-', '1': '-'}, 'state': {'0': 'INT', '1': 'INT'},
      'spkts': {'0': 2, '1': 2}, 'dpkts': {'0': 0, '1': 0}, 'sbytes': {'0': 496, '1': 1762},
      'dbytes': {'0': 0, '1': 0}, 'rate': {'0': 90909.0902, '1': 125000.0003}, 'sttl': {'0': 254, '1': 254},
      'dttl': {'0': 0, '1': 0}, 'sload': {'0': 180363632, '1': 881000000}, 'dload': {'0': 0, '1': 0},
      'sloss': {'0': 0, '1': 0}, 'dloss': {'0': 0, '1': 0}, 'sinpkt': {'0': 0.011, '1': 0.008},
      'dinpkt': {'0': 0, '1': 0}, 'sjit': {'0': 0, '1': 0}, 'djit': {'0': 0, '1': 0}, 'swin': {'0': 0, '1': 0},
      'stcpb': {'0': 0, '1': 0}, 'dtcpb': {'0': 0, '1': 0}, 'dwin': {'0': 0, '1': 0}, 'tcprtt': {'0': 0, '1': 0},
      'synack': {'0': 0, '1': 0}, 'ackdat': {'0': 0, '1': 0}, 'smean': {'0': 248, '1': 881}, 'dmean': {'0': 0, '1': 0},
      'trans_depth': {'0': 0, '1': 0}, 'response_body_len': {'0': 0, '1': 0}, 'ct_srv_src': {'0': 2, '1': 2},
      'ct_state_ttl': {'0': 2, '1': 2}, 'ct_dst_ltm': {'0': 1, '1': 1}, 'ct_src_dport_ltm': {'0': 1, '1': 1},
      'ct_dst_sport_ltm': {'0': 1, '1': 1}, 'ct_dst_src_ltm': {'0': 2, '1': 2}, 'is_ftp_login': {'0': 0, '1': 0},
      'ct_ftp_cmd': {'0': 0, '1': 0}, 'ct_flw_http_mthd': {'0': 0, '1': 0}, 'ct_src_ltm': {'0': 1, '1': 1},
      'ct_srv_dst': {'0': 2, '1': 2}, 'is_sm_ips_ports': {'0': 0, '1': 0}}};
    const expectedMessage = errors.BAD_FORMAT;
    testUtil.nodeFailed(flow, givenInput, expectedMessage, done);
  });
/*
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
  }).timeout(25000);*/
});
