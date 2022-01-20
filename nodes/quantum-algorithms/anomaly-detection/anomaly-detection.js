'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function AnomalyDetectionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'anomaly-detection';
    this.shots = config.shots || 1;

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
      let shotVar = node.shots;
      let params = msg.payload;
      let script = util.format(snippets.WARN_TEST, params, shotVar); // snippets.ANOM
      shell.start(['-x']);// -Wignore
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
            if (!err.includes('error')) { // Don't fail on warnings
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Model created!',
              });
              logger.trace(err);
              msg.payload = (err);
              send(msg);
              done();
            } else {
              node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Error; Anomaly not able to be identified!',
              });
              logger.error(node.id, err);
              done(err);
            }
          }).finally(() => {
            logger.trace(node.id, 'Executed anomaly-detection command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('anomaly-detection', AnomalyDetectionNode);
};
