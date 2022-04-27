'use strict';

const util = require('util');
const keys = require('../../snippets-keys');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function KeyCreationNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'key-creation';
    this.firstBases = config.firstBases;
    this.secondBases = config.secondBases;
    this.privateValue = config.privateValue;
    const node = this;

    logger.trace(this.id, 'Initialised key-creation');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'key-creation received input');

      let error = errors.validateKeys(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      node.status({
        fill: 'orange',
        shape: 'dot',
        text: 'Generating base and message',
      });

      let script =
          util.format(keys.keyImports + keys.keyCreation, node.firstBases, node.secondBases, node.privateValue);
      shell.start();
      await shell.execute(script)
          .then((data) => {
            node.status({
              fill: 'green',
              shape: 'dot',
              text: 'Generated base and message',
            });

            msg.payload = data;
            send(msg);
            done();
          }).catch((err) => {
            node.status({
              fill: 'red',
              shape: 'dot',
              text: 'Error; Unable to complete!',
            });

            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed key-creation command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('key-creation', KeyCreationNode);
};
