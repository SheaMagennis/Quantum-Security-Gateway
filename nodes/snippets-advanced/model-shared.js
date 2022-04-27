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
const SHARED_IMPORTS=`
import numpy as np
import pandas as pd
from qiskit import Aer
from qiskit.utils import QuantumInstance
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import QuantumKernel
import pickle
import json
`;

const PCA_IMPORTS=`
from sklearn.preprocessing import normalize
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
`;

const PCA=`
scalar=StandardScaler()#PCA for dimensionality reduction
scalar.fit(test)
test=scalar.transform(test)
pca=PCA(n_components=3)
pca.fit(test)
test = pca.transform(test)
test = normalize(test, axis=0, norm='max')#normalization
`;

module.exports = {
  PCA_IMPORTS,
  PCA,
  SHARED_IMPORTS,
};
