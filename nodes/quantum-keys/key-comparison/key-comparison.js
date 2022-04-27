'use strict';

const util = require('util');
const keys = require('../../snippets-keys');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function KeyComparisonNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'key-comparison';
    this.firstKey = config.firstKey;
    this.secondKey = config.secondKey;
    const node = this;

    logger.trace(this.id, 'Initialised key-comparison');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'key-comparison received input');

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
          util.format(keys.keyImports + keys.keyComparison, node.firstKey, node.secondKey);
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
            logger.trace(node.id, 'Executed key-comparison command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('key-comparison', KeyComparisonNode);
};
