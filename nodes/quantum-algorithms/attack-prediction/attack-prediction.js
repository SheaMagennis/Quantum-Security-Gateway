'use strict';

const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const build = require('../../script-builder');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function AttackPredictionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'attack-prediction';
    this.modelName = config.modelName || 'default';
    this.modelUsage = config.modelUsage;
    const node = this;

    logger.trace(this.id, 'Initialised attack-prediction system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'attack-prediction node received input');

      errors.validateAttackInput(msg, node.modelName, node.modelUsage, async function(error) {// changeMe
        if (error) {
          logger.error(node.id, error);
          done(error);
          return;
        }
        node.status({
          fill: 'orange',
          shape: 'dot',
          text: 'Predicting attacks...',
        });

        let params = [node.modelName, msg.payload];
        let script = build.constructSnippet('REGR', false, false, params, node.modelUsage);

        shell.start();
        await shell.execute(script)
            .then((data) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Prediction complete!',
              });
              logger.trace(data);
              msg.payload = (data);
              send(msg);
              done();
            }).catch((err) => {
              node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Error; Prediction unable to complete!',
              });
              logger.error(node.id, err);
              done(err);
            }).finally(() => {
              logger.trace(node.id, 'Executed attack-prediction command');
              shell.stop();
            });
      });
    });
  }

  RED.nodes.registerType('attack-prediction', AttackPredictionNode);
};
