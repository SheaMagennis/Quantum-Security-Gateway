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

// Probably shouldn't use wildcard import here for efficiency but whatever will
// worry about it later.
const IMPORTS =
`from math import pi
from qiskit import *
`;

const QUANTUM_CIRCUIT =
`qc = QuantumCircuit(%s)
`;

const CLASSICAL_REGISTER =
`cr%s = ClassicalRegister(%s)
`;

const QUANTUM_REGISTER =
`qr%s = QuantumRegister(%s)
`;

const TOFFOLI_GATE =
`qc.toffoli(%s, %s, %s)
`;

const CNOT_GATE =
`qc.cx(%s, %s)
`;

const BARRIER =
`qc.barrier(%s)
`;

const HADAMARD_GATE =
`qc.h(%s)
`;

const MEASURE =
`qc.measure(%s)
`;

const LOCAL_SIMULATOR =
`simulator = Aer.get_backend('qasm_simulator')
result = execute(qc, backend = simulator, shots = %s).result()
counts = result.get_counts()
print(counts)
`;

const IBMQ_SYSTEM_QASM =
`from qiskit.providers.ibmq import least_busy
provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('ibmq_qasm_simulator')
`;

const IBMQ_SYSTEM_DEFAULT =
`from qiskit.providers.ibmq import least_busy
provider = IBMQ.enable_account('%s')
backends = provider.backends(filters=lambda x: (x.configuration().n_qubits >= %s and x.configuration().simulator == %s))
backend_service = least_busy(backends)
`;

const IBMQ_SYSTEM_PREFERRED =
`provider = IBMQ.enable_account('%s')
backend_service = provider.get_backend('%s')
`;

const IBMQ_SYSTEM_VERBOSE =
`job = execute(qc, backend=backend_service, shots=%s)
job.result()
`;

const IBMQ_SYSTEM_RESULT =
`job = execute(qc, backend=backend_service, shots=%s)
counts = job.result().get_counts()
print(counts)
`;

const NOT_GATE =
`qc.x(%s)
`;

const CIRCUIT_DIAGRAM =
`qc.draw(output='mpl')
`;

const GROVERS =
`from qiskit import Aer
from qiskit.quantum_info import Statevector
from qiskit.algorithms import Grover, AmplificationProblem

element = '%s'
oracle = Statevector.from_label(element)
problem = AmplificationProblem(oracle=oracle, is_good_state = lambda bitstr: bitstr==element)
backend = Aer.get_backend('qasm_simulator')
grover = Grover(quantum_instance=backend)
result = grover.amplify(problem)
print(result.top_measurement)
iterations = Grover.optimal_num_iterations(num_solutions=1, num_qubits=len(element))
print(iterations)
`;

const RESET =
`qc.reset(%s)
`;

const PHASE_GATE =
`qc.p(%s, %s)
`;

const ROTATION_GATE =
`qc.r%s(%s, %s)
`;

const UNITARY_GATE =
`qc.u(%s, %s, %s, %s)
`;

const IDENTITY =
`qc.id(%s)
`;

const SWAP =
`qc.swap(%s, %s)
`;

const MULTI_CONTROLLED_U_GATE =
`from qiskit.circuit.library import UGate
qc.append(UGate(%s, %s, %s).control(%s), %s)
`;

const BLOCH_SPHERE =
`from qiskit.visualization import plot_bloch_multivector
from qiskit.quantum_info import Statevector
state = Statevector.from_instruction(qc)
plot_bloch_multivector(state)
`;

const HISTOGRAM =
`from qiskit.visualization import plot_histogram
simulator = Aer.get_backend('qasm_simulator')
result = execute(qc, backend = simulator, shots = %s).result()
plot_histogram(result.get_counts(), color='midnightblue', title="Circuit Output")
`;

const CU_GATE =
`qc.cu(%s, %s, %s, %s, %s, %s)
`;

const ENCODE_IMAGE =
`import matplotlib.pyplot as plt
import base64
import io
import warnings
warnings.filterwarnings("ignore", category=UserWarning)
buffer = io.BytesIO()
plt.savefig(buffer,  format='png')
buffer.seek(0)
b64_str = base64.b64encode(buffer.read())
print(b64_str)
buffer.close()
`;

const PORTFOLIO_OPTIMISATION =
`from qiskit import Aer
from qiskit.circuit.library import TwoLocal

from qiskit_finance.applications.optimization import PortfolioOptimization
from qiskit_finance.data_providers import RandomDataProvider

from qiskit_optimization.applications import OptimizationApplication
from qiskit_optimization.converters import QuadraticProgramToQubo

import numpy as np
import datetime

num_assets = %s
seed = %s

stocks = [("TICKERS%s" % i) for i in range(num_assets)]
data = RandomDataProvider(tickers=stocks, 
  start=datetime.datetime(%s), 
  end=datetime.datetime(%s),
  seed=seed)

data.run()
mu = data.get_period_return_mean_vector()
sigma = data.get_period_return_covariance_matrix()

q = 0.5
budget = num_assets // 2
penalty = num_assets
portfolio = PortfolioOptimization(expected_returns=mu, covariances=sigma, risk_factor=q, budget=budget)
qp = portfolio.to_quadratic_program()

def index_to_selection(i, num_assets):
  s = "{0:b}".format(i).rjust(num_assets)
  x = np.array([1 if s[i]=='1' else 0 for i in reversed(range(num_assets))])
  return x

def print_result(result):
  selection = result.x
  value = result.fval
  print("Optimal: Selection {}, value {:.4f}".format(selection, value))
  eigenstate = result.min_eigen_solver_result.eigenstate
  eigenvector = eigenstate if isinstance(eigenstate, np.ndarray) else eigenstate.to_matrix()
  probabilities = np.abs(eigenvector)**2
  i_sorted = reversed(np.argsort(probabilities))
  print("\\n-----------------------Full Result-----------------------")
  print("selection\\tvalue\\t\\tprobability")
  print("---------------------------------------------------------")
  for i in i_sorted:
    x = index_to_selection(i, num_assets)
    value = QuadraticProgramToQubo().convert(qp).objective.evaluate(x)
    probability = probabilities[i]
    print("%10s\\t%.4f\\t\\t%.4f" %(x, value, probability))

`;

const NME =
`from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.algorithms import NumPyMinimumEigensolver
exact_mes = NumPyMinimumEigensolver()
exact_eigensolver = MinimumEigenOptimizer(exact_mes)
result = exact_eigensolver.solve(qp)
print_result(result)
`;

const VQE =
`from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.utils import algorithm_globals
from qiskit.utils import QuantumInstance
from qiskit.algorithms import VQE
from qiskit.algorithms.optimizers import COBYLA
algorithm_globals.random_seed = 1234
backend = Aer.get_backend("statevector_simulator")

cobyla = COBYLA()
cobyla.set_options(maxiter=500)
ry = TwoLocal(num_assets, "ry", "cz", reps=3, entanglement="full")
quantum_instance = QuantumInstance(backend=backend, seed_simulator=seed, seed_transpiler=seed)
vqe_mes = VQE(ry, optimizer=cobyla, quantum_instance=quantum_instance)
vqe = MinimumEigenOptimizer(vqe_mes)

result = vqe.solve(qp)
print_result(result)
`;

const QAOA =
`from qiskit_optimization.algorithms import MinimumEigenOptimizer
from qiskit.utils import algorithm_globals
from qiskit.utils import QuantumInstance
from qiskit.algorithms import QAOA
from qiskit.algorithms.optimizers import COBYLA
algorithm_globals.random_seed = 1234
backend = Aer.get_backend("statevector_simulator")

cobyla = COBYLA()
cobyla.set_options(maxiter=250)
quantum_instance = QuantumInstance(backend=backend, seed_simulator=seed, seed_transpiler=seed)
qaoa_mes = QAOA(optimizer=cobyla, reps=3, quantum_instance=quantum_instance)
qaoa = MinimumEigenOptimizer(qaoa_mes)

result = qaoa.solve(qp)
print_result(result)
`;

const INITIALIZE =
`from qiskit.quantum_info import Statevector
qc.initialize(Statevector.from_label('%s').data, %s)
`;

const SHORS =
`from qiskit import Aer
from qiskit.algorithms import Shor
backend = Aer.get_backend('qasm_simulator')
shor = Shor(quantum_instance=backend)
result = shor.factor(%s)
factors = [] if result.factors == [] else result.factors[0]
print(factors)
`;

const RAND =
`from qiskit import Aer, QuantumCircuit, execute
simulator = Aer.get_backend('qasm_simulator')
qc = QuantumCircuit(6,6)

for qubit in range(6):  qc.h(qubit)  

for qubit in range(6):  qc.measure(qubit,qubit)

result = execute(qc, backend = simulator, shots = 1).result()
counts=result.get_counts()
dec = list(counts.keys())[0]
print(int(dec,2))
`;

const ANOM=`
#%j
from sklearn.cluster import SpectralClustering
from sklearn.metrics import normalized_mutual_info_score

from qiskit import Aer
from qiskit.circuit.library import ZZFeatureMap
from qiskit.utils import QuantumInstance, algorithm_globals
from qiskit_machine_learning.kernels import QuantumKernel
from qiskit_machine_learning.datasets import ad_hoc_data

seed = 12345
algorithm_globals.random_seed = seed

adhoc_dimension = 2
train_features, train_labels, test_features, test_labels, adhoc_total = ad_hoc_data(
    training_size=25,
    test_size=0,
    n=adhoc_dimension,
    gap=0.6,
    plot_data=False, one_hot=False, include_sample_total=True
)

adhoc_feature_map = ZZFeatureMap(feature_dimension=adhoc_dimension,
                                 reps=2, entanglement='linear')

adhoc_backend = QuantumInstance(Aer.get_backend('qasm_simulator'), shots=%d,
                                seed_simulator=seed, seed_transpiler=seed)

adhoc_kernel = QuantumKernel(feature_map=adhoc_feature_map, quantum_instance=adhoc_backend)

adhoc_matrix = adhoc_kernel.evaluate(x_vec=train_features)

adhoc_spectral = SpectralClustering(2, affinity="precomputed")
cluster_labels = adhoc_spectral.fit_predict(adhoc_matrix)
print(cluster_labels)
`;

const REGR_IMPORTS = `
import numpy as np
import matplotlib.pyplot as plt

from qiskit import Aer, QuantumCircuit
from qiskit.utils import QuantumInstance
from qiskit.circuit import Parameter
from qiskit.algorithms.optimizers import L_BFGS_B

from qiskit_machine_learning.neural_networks import TwoLayerQNN
from qiskit_machine_learning.algorithms.regressors import VQR
import pickle
`;

const REGR_CREATE = `
#%j
#instance
quantum_instance = QuantumInstance(Aer.get_backend('aer_simulator'), shots=%d)
#dataset
num_samples = 20
eps = 0.2
lb, ub = -np.pi, np.pi
X_ = np.linspace(lb, ub, num=50).reshape(50, 1)
f = lambda x: np.sin(x)

X = (ub - lb)*np.random.rand(num_samples, 1) + lb
y = f(X[:,0]) + eps*(2*np.random.rand(num_samples)-1)

#vars set up
# construct simple feature map
param_x = Parameter('x')
feature_map = QuantumCircuit(1, name='fm')
feature_map.ry(param_x, 0)

# construct simple ansatz
param_y = Parameter('y')
ansatz = QuantumCircuit(1, name='vf')
ansatz.ry(param_y, 0)

# construct QNN
regression_opflow_qnn = TwoLayerQNN(1, feature_map, ansatz, quantum_instance=quantum_instance)


#concrete below
vqr = VQR(feature_map=feature_map,
          ansatz=ansatz,
          optimizer=L_BFGS_B(),
          quantum_instance=quantum_instance)

# fit regressor
vqr.fit(X, y)
pickle.dump(vqr, open("./model_store/regr%s", 'wb'))
# score result
ans = vqr.score(X, y)
print(ans)
`;

const REGR_USE=`
model = pickle.load(open("./model_store/regr%s", 'rb'))
ans = model.predict(X)#replace with input
print(ans)
`;

const QSVC_IMPORTS=`
import numpy as np
import pandas as pd
from qiskit import Aer
from qiskit.utils import QuantumInstance
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import QuantumKernel
from qiskit_machine_learning.algorithms import QSVC
from sklearn.preprocessing import normalize
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import pickle
import json
`;

const QSVC_START =`
modelName="./model_store/qsvc%s" #qsvcStore
model = pickle.load(open(modelName, 'rb')) 
#get data inputted and convert to dataframe
type=%j
res=pd.DataFrame(data=type)
#process data
encoded = pd.get_dummies(res)
final=encoded.to_numpy()
test = np.delete(final, 1, 1)
`;

const QSVC_END=`
#print(data)
#make prediction
fin=model.predict(data)#[[-0.74856406,-0.30061566, 0.19750934]]
#print(fin)
for i in fin:
  if i == 0:  print("No threat present")
  else:  print("Threat detected")
   
#print("non-threats: "+str(nonThreats))
#print("threats: "+str(threats))
  
`;

const CREATE_QSVC_START = `
import csv
initial=%j
df=pd.DataFrame(initial)#one-hot encoding
encoded = pd.get_dummies(df)
final=encoded.to_numpy()
index_no = encoded.columns.get_loc("label")
label=final[:,index_no]
label = label.astype('int')#convert from object to usable

arrOne = np.delete(final, index_no, 1)#array, num, column/row
test = np.delete(arrOne, 1, 1)
`;

const CREATE_QSVC_END=`
backend = Aer.get_backend('qasm_simulator')
num_qubits = 2
shots = %d  # Number of times the job will be run on the quantum device
feature_map = ZZFeatureMap(feature_dimension=num_qubits, reps=2, entanglement='full')  
instance = QuantumInstance(backend, shots=shots, skip_qobj_validation=False)  # create instance on backend
basis = QuantumKernel(feature_map, quantum_instance=instance)  
train_features=data
qsvc= QSVC(quantum_kernel=basis)
qsvc.fit(train_features, label)
pickle.dump(qsvc, open("./model_store/qsvc%s", 'wb'))
f = open('./model_information/model_information.csv', 'w')
writer = csv.writer(f)
stuff=initial.keys()
joined_string = ",".join(stuff)
temporary=[]

for val in stuff:  temporary.append(type(initial[val]["0"]).__name__)

finalTypes=",".join(temporary)
row = "name",joined_string,finalTypes
writer.writerow(row)
f.close()
print("done")#remove
    
`;

const PCA =`
scalar=StandardScaler()#PCA for dimensionality reduction
scalar.fit(test)
test=scalar.transform(test)
pca=PCA(n_components=3)
pca.fit(test)
test = pca.transform(test)
data = normalize(test, axis=0, norm='max')#normalization
`;

const LIST_MODELS = `
import os
x = os.listdir("./model_store")
print("Intrusion-detection models:")
for i in x:
    if i.startswith("qsvc"):
        print(i[4:])
        
`;

const DELETE_MODEL = `
import os
os.remove("./model_store/%s")
print("model removed")
`;

module.exports = {
  IMPORTS,
  QUANTUM_CIRCUIT,
  CLASSICAL_REGISTER,
  QUANTUM_REGISTER,
  TOFFOLI_GATE,
  CNOT_GATE,
  BARRIER,
  HADAMARD_GATE,
  MEASURE,
  LOCAL_SIMULATOR,
  MULTI_CONTROLLED_U_GATE,
  IBMQ_SYSTEM_QASM,
  IBMQ_SYSTEM_DEFAULT,
  IBMQ_SYSTEM_PREFERRED,
  IBMQ_SYSTEM_VERBOSE,
  IBMQ_SYSTEM_RESULT,
  GROVERS,
  NOT_GATE,
  CIRCUIT_DIAGRAM,
  RESET,
  PHASE_GATE,
  ROTATION_GATE,
  IDENTITY,
  SWAP,
  UNITARY_GATE,
  BLOCH_SPHERE,
  CU_GATE,
  ENCODE_IMAGE,
  PORTFOLIO_OPTIMISATION,
  NME,
  VQE,
  QAOA,
  INITIALIZE,
  SHORS,
  HISTOGRAM,
  RAND,
  QSVC_START,
  QSVC_END,
  PCA,
  QSVC_IMPORTS,
  CREATE_QSVC_START,
  CREATE_QSVC_END,
  ANOM,
  REGR_CREATE,
  REGR_IMPORTS,
  REGR_USE,
  LIST_MODELS,
  DELETE_MODEL,
};
