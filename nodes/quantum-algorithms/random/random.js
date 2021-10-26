'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function RandomNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'random';
    const node = this;

    logger.trace(this.id, 'Initialised random');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'random received input');

      let error = errors.validateRandomInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      let script = util.format(snippets.RAND);
      logger.trace(node.id, script); // testing
      shell.start();
      await shell.execute(script)
          .then((data) => {
            logger.trace(data);
            msg.payload = data.slice(924, data.length);
            send(msg);
            done();
          }).catch((err) => {
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed random command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('random', RandomNode);
};
