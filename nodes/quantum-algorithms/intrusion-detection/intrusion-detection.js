'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const fs = require('fs');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function IntrusionDetectionNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'intrusion-detection';
    this.modelName = config.modelName || 'default';
    this.modelNameList = fs.readdirSync('./model_store').join();
    const node = this;
    logger.trace(this.id, 'Initialised intrusion-detection system');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'intrusion-detection node received input');

      let error = errors.validateIntrusionInput(msg);// changeMe
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
      let firstParam = node.modelName;
      let params = msg.payload;
      let final = snippets.QSVC_IMPORTS+snippets.QSVC_START+snippets.PCA+snippets.QSVC_END;
      let script = util.format(final, firstParam, params);
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
            msg.payload = (data.slice(39, data.length));
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
