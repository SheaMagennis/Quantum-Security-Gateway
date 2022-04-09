'use strict';

const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const build = require('../../script-builder');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function AttackDatePredictionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'attack-date-prediction';
    this.shots = config.shots || 1;

    const node = this;

    logger.trace(this.id, 'Initialised attack-date-prediction system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'attack-date-prediction node received input');

      errors.validateDatePredictionInput(msg, async function(error) {// changeMe
        if (error) {
          logger.error(node.id, error);
          done(error);
          return;
        }
        node.status({
          fill: 'orange',
          shape: 'dot',
          text: 'Identifying next date...',
        });

        let params = [msg.payload, node.shots];
        let script = build.constructSingleSnippet('LSTM', params);

        shell.start();
        await shell.execute(script)
            .then((data) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Prediction complete!',
              });
              logger.trace(data);
              msg.payload = data;
              send(msg);
              done();
            }).catch((err) => {
              node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Error; Date not able to be identified!',
              });
              logger.error(node.id, err);
              done(err);
            }).finally(() => {
              logger.trace(node.id, 'Executed attack-date-prediction command');
              shell.stop();
            });
      });
    });
  }

  RED.nodes.registerType('attack-date-prediction', AttackDatePredictionNode);
};
