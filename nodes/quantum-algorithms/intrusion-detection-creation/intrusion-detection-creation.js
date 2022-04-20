'use strict';

const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const build = require('../../script-builder');
const util = require('util');
const snippets = require('../../snippets');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function IntrusionDetectionCreationNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'intrusion-detection-creation';
    this.modelName = config.modelName || 'default';
    this.shots = config.shots || 1;
    this.label = config.label || 'label';
    this.apiToken = config.api_token;
    this.chosenSystem = config.chosen_system;
    this.preferredBackend = config.preferred_backend;
    this.backend = config.backend;
    const node = this;
    logger.trace(this.id, 'Initialised intrusion-detection-creation system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'intrusion-detection-creation node received input');

      errors.validateIntrusionCreationInput(msg, node.modelName, node.label, async function(error) {// changeMe
        if (error) {
          logger.error(node.id, error);
          node.status({
            fill: 'red',
            shape: 'dot',
            text: 'Model failed to create!',
          });
          done(error);
          return;
        }
        node.status({
          fill: 'orange',
          shape: 'dot',
          text: 'Creating model...',
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
              bEnd += util.format(snippets.IBMQ_SYSTEM_QASM, node.apiToken);
            }
          }
        }

        let params = [msg.payload, node.label, node.shots, node.modelName];

        let script = build.constructSnippet('QSVC', true, 'PCA', params, false, bEnd);

        shell.start();
        await shell.execute(script)
            .then((data) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Model created!',
              });
              logger.trace(data);
              msg.payload = (data.slice(1579, data.length));
              send(msg);
              done();
            }).catch((err) => {
              if (err.split('Error').length<=3) { // Don't fail on warnings
                node.status({
                  fill: 'green',
                  shape: 'dot',
                  text: 'Model created!',
                });
                logger.trace(err);
                msg.payload = ('Intrusion Detection Model successfully created');
                send(msg);
                done();
              } else {
                node.status({
                  fill: 'red',
                  shape: 'dot',
                  text: 'Model failed to create!',
                });
                logger.error(node.id, err);
                done(err);
              }
            }).finally(() => {
              logger.trace(node.id, 'Executed intrusion-detection-creation command');
              shell.stop();
            });
      });
    });
  }

  RED.nodes.registerType('intrusion-detection-creation', IntrusionDetectionCreationNode);
};
