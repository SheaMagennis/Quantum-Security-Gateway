'use strict';

const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const build = require('../../script-builder');
const snippets = require('../../snippets');
const util = require('util');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function AnomalyDetectionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'anomaly-detection';
    this.shots = config.shots || 1;
    this.deviations = config.deviations || 1;
    this.apiToken = config.api_token;
    this.chosenSystem = config.chosen_system;
    this.preferredBackend = config.preferred_backend;
    this.backend = config.backend;
    const node = this;

    logger.trace(this.id, 'Initialised anomaly-detection system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'anomaly-detection node received input');

      errors.validateAnomalyInput(msg, async function(error) {// changeMe
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

        let bEnd= '';
        if (node.backend==='local') {
          bEnd+=snippets.LOCAL_BACKEND;
        } else {
          if (node.preferredBackend) {
            bEnd += util.format(snippets.IBMQ_SYSTEM_PREFERRED, node.apiToken, node.preferredBackend);
          } else {
            if (node.chosenSystem === 'Qubit_System') {
              bEnd += util.format(snippets.IBMQ_SYSTEM_DEFAULT, node.apiToken, 2, 'False');
            } else {
              let qLen = Object.keys(msg.payload).length
              if (qLen > 32) {
                bEnd += util.format(snippets.IBMQ_SYSTEM_DEFAULT, node.apiToken, qLen, 'True');
              } else {
                bEnd += util.format(snippets.IBMQ_SYSTEM_QASM, node.apiToken);
              }
            }
          }
        }

        let params = [msg.payload, node.shots, node.deviations];
        let script = build.constructSingleSnippet('QKNN', params, bEnd);

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
    });
  }

  RED.nodes.registerType('anomaly-detection', AnomalyDetectionNode);
};
