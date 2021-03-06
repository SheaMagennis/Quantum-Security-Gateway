'use strict';

const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const build = require('../../script-builder');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function IntrusionDetectionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'intrusion-detection';
    this.modelName = config.modelName || 'default';
    this.modelUsage = config.modelUsage;
    const node = this;
    logger.trace(this.id, 'Initialised intrusion-detection system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'intrusion-detection node received input');
      errors.validateIntrusionInput(msg, node.modelName, node.modelUsage, async function(error) {
        logger.trace(node.id, 'error checking for intrusion');
        if (error) {
          logger.error(node.id, error);
          done(error);
          return;
        }

        node.status({
          fill: 'orange',
          shape: 'dot',
          text: 'Classifying traffic...',
        });

        let params = [node.modelName, msg.payload];
        let script = build.constructSnippet('QSVC', false, 'PCA', params, node.modelUsage);

        shell.start();
        await shell.execute(script)
            .then((data) => {
              node.status({
                fill: 'green',
                shape: 'dot',
                text: 'Traffic classified!',
              });
              logger.trace(data);
              if (node.modelUsage === 'test') {
                msg.payload = ('Accuracy:'+data.split('Accuracy:')[1]).toString();
              } else {
                msg.payload = ('Classifications:'+data.split('Classifications:')[1]).toString();
              }
              send(msg);
              done();
            }).catch((err) => {
              node.status({
                fill: 'red',
                shape: 'dot',
                text: 'Traffic failed to classify!',
              });
              logger.error(node.id, err);
              done(err);
            }).finally(() => {
              logger.trace(node.id, 'Executed intrusion-detection command');
              shell.stop();
            });
      });
    });
  }

  RED.nodes.registerType('intrusion-detection', IntrusionDetectionNode);
};
