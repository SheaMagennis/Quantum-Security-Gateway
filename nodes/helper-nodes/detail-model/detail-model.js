'use strict';

const util = require('util');
const snippets = require('../../snippets');
const errors = require('../../errors');
const logger = require('../../logger');
const {PythonInteractive, PythonPath} = require('../../python');
const shell = new PythonInteractive(PythonPath);

module.exports = function(RED) {
  function DetailNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name || 'detail-model';
    this.model_name = config.model_name;
    this.model_type = config.model_type;

    const node = this;

    logger.trace(this.id, 'Initialised detail');

    this.on('input', async function(msg, send, done) {
      logger.trace(node.id, 'detail received input');

      let error = errors.validateHelperInput(node.model_type+node.model_name);
      if (error) {
        logger.error(node.id, error);
        done(error);
        return;
      }
      const params = node.model_type+node.model_name;
      let script = util.format(snippets.DETAIL_MODEL, params);
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
            logger.trace(node.id, 'Executed detail command');
            shell.stop();
          });
    });
  }

  RED.nodes.registerType('detail-model', DetailNode);
};