'use strict';

/*
 * Snippets must be constants, and constants must capitalised with underscores.
 *
 * Remember to export snippets at the end of the file.
 *
 * To use values from JavaScript code within a snippet, insert a '%s' where you want
 * to place the values. You can then use the util.format() function to replace them with
 * the values at runtime.
 */

const QKNN=`
# Adaptation of https://github.com/GroenteLepel/qiskit-quantum-knn for anomaly detection on unsupervised data
# This code uses the existing code from the above implementation to analyse the distance between
# each value set in a given list and the other values. The outlier is identified as the point with the greatest 
#distance, which is then outputted
# Functions not shared as part of the package are redefined and modified for a single test input

import io
from contextlib import redirect_stderr
f = io.StringIO()
with redirect_stderr(f):
  import qiskit.aqua.utils.subsystem as ss
  import pandas as pd
  from qiskit_quantum_knn.qknn import QKNeighborsClassifier
  import qiskit as qk
  from qiskit.utils import QuantumInstance
  import numpy as np
  import itertools
  from sklearn.preprocessing import OrdinalEncoder
  from qiskit_quantum_knn.encoding import analog
  from qiskit import Aer
  import math
  initial=%j
  df=pd.DataFrame(initial)
  def calculate_fidelities(counts) -> np.ndarray:
      subsystem_counts = ss.get_subsystems_counts(counts)
      control_counts = QKNeighborsClassifier.setup_control_counts(
          subsystem_counts[1]
      )
      total_counts = control_counts['0'] + control_counts['1']
      exp_fidelity = np.abs(control_counts['0'] - control_counts['1']) / total_counts
      num_qubits = len(list(subsystem_counts[0].keys())[0])
      comp_basis_states = list(itertools.product(['0', '1'], repeat=num_qubits))
      fidelities = np.zeros(2 ** num_qubits, dtype=float)
      for comp_state in comp_basis_states:
          comp_state = ''.join(comp_state)
          fidelity = 0.
          for control_state in control_counts.keys():
              state_str = comp_state + ' ' + control_state
              if state_str not in counts:
                  fidelity += 0  # added for readability
              else:
                  fidelity += (-1) ** int(control_state) * (counts[state_str]) / control_counts[control_state] * (
                              1 - exp_fidelity ** 2)
              \n                
          index_state = int(comp_state, 2)
          fidelity *= 2 ** num_qubits / 2
          fidelity += exp_fidelity
          fidelities[index_state] = fidelity
      return fidelities
  def get_all_fidelities(circuit_results):  #: qres.Result
      all_counts = circuit_results.get_counts()
      num_qubits = len(list(all_counts.keys())) - 2
      n_occurrences = len(all_counts)  # number of occurring states
      n_datapoints = 2 ** num_qubits  # number of data points
      all_fidelities = np.empty(
          shape=(n_occurrences, n_datapoints),
      )
      all_fidelities = calculate_fidelities(all_counts)
      return all_fidelities
  def getOutlier(n_queries, fidelities):
      sorted_neighbors = np.argpartition(
          1 - fidelities,
          -n_queries
      )
      sorted_neighbors = sorted_neighbors[sorted_neighbors < n_queries]  
      return sorted_neighbors
  backend = Aer.get_backend('qasm_simulator')
  instance = QuantumInstance(backend, shots=%d)
  
  qknn = QKNeighborsClassifier(
      n_neighbors=3,  # not used in this case, though could be used in getOutlier
      quantum_instance=instance
  )
  
  #example_data = [[0, 1], [1, 0], [1, 0]]
  
  encoder = OrdinalEncoder()
  encoded = encoder.fit_transform(df)
  encoded=encoded+1
  lSize=len(encoded[0])
  p = int(math.log(lSize, 2))
  cutPoint=int(pow(2, p))
  example_data = analog.encode(encoded[:, :cutPoint]).tolist()
  
  totals = []
  for i in range(len(example_data)):  # length of list
      test_data = [example_data[i]]
      use_data = example_data[:i] + example_data[i + 1:]
      indVals = []
      trainLen = len(use_data)
      qknn = QKNeighborsClassifier(
          n_neighbors=3,
          quantum_instance=instance
      )
      first = qknn.construct_circuits(test_data, use_data)
      second = qknn.get_circuit_results(first)
      third = get_all_fidelities(second)  
      fourth = getOutlier(trainLen, third)
      done = [third[i] for i in fourth]
      val = sum(done)
      totals.append(val)
  
  mean = np.mean(totals)
  standard = np.std(totals)
  divider = mean + (%d * standard)
  anoms = [x for x,y in enumerate(totals) if y > divider]
  if (len(anoms)==0): print("No Anomalies Found")
  else:
    print("Anomalies: ")
    for x in anoms: 
      print(df.iloc[x].to_string())
`;

module.exports = {
  QKNN,
};
