'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function ListNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'list-models';
    const node = this;

    logger.trace(this.id, 'Initialised list');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'list received input');

      let error = errors.validateListInput(msg);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }

      let script = util.format(snippets.LIST_MODELS);
      shell.start();
      await shell.execute(script)
          .then((data) => {
            logger.trace(data);
            msg.payload = data;// (data.slice(924, data.length))
            send(msg);
            done();
          }).catch((err) => {
            logger.error(node.id, err);
            done(err);
          }).finally(() => {
            logger.trace(node.id, 'Executed list command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('list-models', ListNode);
};
