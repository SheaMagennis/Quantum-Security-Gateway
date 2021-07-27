'use strict';

const util = require('util');
const snippets = require('../../snippets');
const shell = require('../../python').PythonShell;
const errors = require('../../errors');

const validateInput = (node, msg) => {
  if (msg.topic !== 'Quantum Circuit') {
    node.error(errors.NOT_QUANTUM_CIRCUIT, msg);
  }
};

module.exports = function(RED) {
  function MeasureNode(config) {
    RED.nodes.createNode(this, config);
    this.name = config.name;
    this.selectedBit = config.selectedBit;
    this.selectedRegVarName = config.selectedRegVarName;
    this.classicalRegistersOrBits = '';
    const node = this;

    this.on('input', async function(msg, send, done) {
      let script = '';
      validateInput(node, msg);
      const params = (!node.selectedRegVarName) ? `${msg.payload.qubit}, ${node.selectedBit}`:
        `${msg.payload.registerVar}[${msg.payload.qubit}], ` +
        `${node.selectedRegVarName}[${node.selectedBit}]`;

      script += util.format(snippets.MEASURE, params);

      await shell.execute(script, (err) => {
        if (err) node.error(err);
        else {
          send(msg);

          const status = (!node.selectedRegVarName) ? `Result: cbit ${node.selectedBit}`:
          `Result: register ${node.selectedRegVarName} / cbit ${node.selectedBit}`;

          node.status({
            fill: 'grey',
            shape: 'dot',
            text: status,
          });
        };
      });
    });
  }

  RED.nodes.registerType('measure', MeasureNode);
};