'use strict';

const errors = require('../../errors');
const logger = require('../../logger');
const build = require('../../script-builder');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function AttackPredictionCreationNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'attack-prediction-creation';
    this.modelName = config.modelName || 'default';
    this.shots = config.shots || 1;
    const node = this;

    logger.trace(this.id, 'Initialised attack-prediction-creation system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'attack-prediction-creation node received input');

      errors.validateAttackCreationInput(msg, node.modelName, async function(error) {// changeMe
        if (error) {
          logger.error(node.id, error);
          done(error);
          return;
        }
        node.status({
          fill: 'orange',
          shape: 'dot',
          text: 'Building model...',
        });

        let params = [msg.payload, node.shots, node.modelName];
        let script = build.constructSnippet('REGR', true, false, params);

        shell.start();
        await shell.execute(script)
            .then((data) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Build complete!',
              });
              logger.trace(data);
              msg.payload = (data.slice(39, data.length));
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
                msg.payload = ('Attack Prediction Model successfully created');
                send(msg);
                done();
              } else {
                node.status({
                  fill: 'red',
                  shape: 'dot',
                  text: 'Error; Build unable to complete!',
                });
                logger.error(node.id, err);
                done(err);
              }
            }).finally(() => {
              logger.trace(node.id, 'Executed attack-prediction-creation command');
              shell.stop();
            });
      });
    });
  }

  RED.nodes.registerType('attack-prediction-creation', AttackPredictionCreationNode);
};
