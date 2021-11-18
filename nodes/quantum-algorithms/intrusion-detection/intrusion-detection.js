'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function IntrusionDetectionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'intrusion-detection';
    const node = this;

    logger.trace(this.id, 'Initialised intrusion-detection system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'intrusion-detection node received input');

      let error = errors.validateRandomInput(msg);
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

      let script = util.format(snippets.QSVM);
      // logger.trace(node.id, script); // testing
      shell.start();
      await shell.execute(script)
          .then((data) => {
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'Traffic classified!',
            });
            logger.trace(data);
            msg.payload = data;
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
  }

  RED.nodes.registerType('intrusion-detection', IntrusionDetectionNode);
};
