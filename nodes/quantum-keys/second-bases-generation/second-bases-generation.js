'use strict';

const util = require('util');
const keys = require('../../snippets-keys');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function SecondBasesGenerationNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'second-bases-generation';
    this.bits = config.bits;
    const node = this;

    logger.trace(this.id, 'Initialised second-bases');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'second-bases received input');

      let error = errors.validateKeys(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      node.status({
        fill: 'orange',
        shape: 'dot',
        text: 'Generating base',
      });

      let script = util.format(keys.keyImports + keys.received, node.bits);
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
            logger.trace(node.id, 'Executed second-bases command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('second-bases-generation', SecondBasesGenerationNode);
};
