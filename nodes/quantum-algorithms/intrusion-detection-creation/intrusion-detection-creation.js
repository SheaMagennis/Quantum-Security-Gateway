'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function IntrusionDetectionCreationNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'intrusion-detection-creation';
    this.modelName = config.modelName || 'default';
    this.shots = config.shots || 1;
    const node = this;
    logger.trace(this.id, 'Initialised intrusion-detection-creation system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'intrusion-detection-creation node received input');

      let error = errors.validateIntrusionCreationInput(msg);// changeMe
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }
      node.status({
        fill: 'orange',
        shape: 'dot',
        text: 'Creating model...',
      });
      let modelState = node.modelName;
      let params = msg.payload;
      let shotVar = node.shots;
      let final = snippets.QSVC_IMPORTS+snippets.CREATE_QSVC_START+snippets.PCA+snippets.CREATE_QSVC_END;
      let script = util.format(final, params, shotVar, modelState);
      // logger.trace(node.id, script); // testing
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
            if (err.includes('scikit-learn estimators should always specify their parameters')) {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Model created!',
              });
              logger.trace('done');
              msg.payload = ('done');
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
            }}).finally(() => {
            logger.trace(node.id, 'Executed intrusion-detection-creation command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('intrusion-detection-creation', IntrusionDetectionCreationNode);
};
