'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const build = require('../../script-builder');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function AnomalyDetectionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'anomaly-detection';
    this.shots = config.shots || 1;
    this.deviations = config.deviations || 1;

    const node = this;

    logger.trace(this.id, 'Initialised anomaly-detection system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'anomaly-detection node received input');

      let error = errors.validateAnomalyInput(msg);// changeMe
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }
      node.status({
        fill: 'orange',
        shape: 'dot',
        text: 'Looking for anomalies...',
      });

      let params = [msg.payload, node.shots, node.deviations];
      let script = build.constructSingleSnippet('QKNN', params);

      shell.start();
      await shell.execute(script)
          .then((data) => {
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'Detection complete!',
            });
            logger.trace(data);
            msg.payload = data;
            send(msg);
            done();
          }).catch((err) => {
            node.status({
              fill: 'red',
              shape: 'dot',
              text: 'Error; Anomaly not able to be identified!',
            });
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed anomaly-detection command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('anomaly-detection', AnomalyDetectionNode);
};
