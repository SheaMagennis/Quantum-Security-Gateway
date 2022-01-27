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

const REGR_IMPORTS = `
import datetime
import json
import numpy as np
import pandas as pd

from qiskit import Aer
from qiskit.utils import QuantumInstance
from qiskit.circuit.library import ZZFeatureMap
from qiskit_machine_learning.kernels import QuantumKernel
from qiskit_machine_learning.algorithms import QSVR
from sklearn.preprocessing import normalize
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import pickle
import json
`;

const CREATE_REGR_START = `
import csv

initial=%j
df=pd.DataFrame(initial)
backend = Aer.get_backend('qasm_simulator')

quantum_instance = QuantumInstance(backend, shots=%d)
hold="regr%s"

val=df['DateTime']
years=[]
months=[]
days=[]
hours=[]
for x in range(len(val)):
 temp=val[x]
 res = datetime.datetime.strptime(temp, '%Y-%m-%d %H:%M:%S')
 years.append(res.year)
 months.append(res.month)
 days.append(res.day)
 hours.append(res.hour)

\n
df['year']=years
df['month']=months
df['day']=days
df['hours']=hours

encoded = pd.get_dummies(df)#

final=encoded.to_numpy()
dTime_no = df.columns.get_loc("DateTime")
index_no = encoded.columns.get_loc("Target")
label=final[:,index_no]
label = label.astype('int')#convert from object to usable

test = np.delete(final, index_no, 1)#array, num, column/row
test = np.delete(test, dTime_no, 1)`;

const CREATE_REGR_END=`
num_qubits = 3#2
shots = 128  # Number of times the job will be run on the quantum device 8096
feature_map = ZZFeatureMap(feature_dimension=num_qubits, reps=2, entanglement='linear')#full
instance = QuantumInstance(backend, shots=shots, skip_qobj_validation=False)  # create instance on backend
basis = QuantumKernel(feature_map, quantum_instance=instance)  # Change
num_inputs=3
regr=QSVR(quantum_kernel=basis)

# fit regressor
regr.fit(test, label)
pickle.dump(regr, open("./model_store/"+hold, 'wb'))

f = open('./model_information/model_information.csv', 'a+', newline='')

writer = csv.writer(f)
stuff=initial.keys()
stuff=list(stuff)
stuff.remove("Target")
joined_string = ",".join(stuff)
temporary=[]

for val in stuff:  temporary.append(type(initial[val]["0"]).__name__)

finalTypes=",".join(temporary)
row = hold,joined_string,finalTypes
writer.writerow(row)
f.close()
print("Attack Prediction model successfully created")

`;

const REGR_START=`
modelName="./model_store/regr%s" #qsvcStore
model = pickle.load(open(modelName, 'rb')) 
#get data inputted and convert to dataframe
type=%j
df=pd.DataFrame(data=type)
#process data

val=df['DateTime']
years=[]
months=[]
days=[]
hours=[]
for x in range(len(val)):
 temp=val[x]
 res = datetime.datetime.strptime(temp, '%Y-%m-%d %H:%M:%S')
 years.append(res.year)
 months.append(res.month)
 days.append(res.day)
 hours.append(res.hour)

\n
df['year']=years
df['month']=months
df['day']=days
df['hours']=hours

encoded = pd.get_dummies(df)
test = encoded.to_numpy()

dTime_no = df.columns.get_loc("DateTime")
data = np.delete(test, dTime_no, 1)
`;

const REGR_END =`
fin=model.predict(data)
for i in fin:
  print("Predicted value : "+ "{}".format(i))

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
encoded = pd.get_dummies(res, drop_first=True)
test=encoded.to_numpy()
`;

const QSVC_END=`
#print(data)
#make prediction
fin=model.predict(test)#[[-0.74856406,-0.30061566, 0.19750934]]
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
df=pd.DataFrame(initial)
encoded = pd.get_dummies(df, drop_first=True)#one-hot encoding
final=encoded.to_numpy()
index_no = encoded.columns.get_loc("label")
label=final[:,index_no]
label = label.astype('int')#convert from object to usable

test = np.delete(final, index_no, 1)#array, num, column/row
`;

const CREATE_QSVC_END=`
backend = Aer.get_backend('qasm_simulator')
num_qubits = 2
shots = %d  # Number of times the job will be run on the quantum device
feature_map = ZZFeatureMap(feature_dimension=num_qubits, reps=2, entanglement='full')  
instance = QuantumInstance(backend, shots=shots, skip_qobj_validation=False)  # create instance on backend
basis = QuantumKernel(feature_map, quantum_instance=instance)  

train_features=test
qsvc= QSVC(quantum_kernel=basis)
qsvc.fit(train_features, label)
hold="qsvc%s"
pickle.dump(qsvc, open("./model_store/"+hold, 'wb'))
f = open('./model_information/model_information.csv', 'a+', newline='')

writer = csv.writer(f)
stuff=initial.keys()
stuff=list(stuff)
stuff.remove("label")
joined_string = ",".join(stuff)
temporary=[]

for val in stuff:  temporary.append(type(initial[val]["0"]).__name__)

finalTypes=",".join(temporary)
row = hold,joined_string,finalTypes
writer.writerow(row)
f.close()
print("Intrusion Detection Model successfully created")#remove
    
`;

const PCA =`
scalar=StandardScaler()#PCA for dimensionality reduction
scalar.fit(test)
test=scalar.transform(test)
pca=PCA(n_components=3)
pca.fit(test)
test = pca.transform(test)
test = normalize(test, axis=0, norm='max')#normalization
`;

const LIST_MODELS = `
import os
x = os.listdir("./model_store")
apModels=[]
idModels=[]
for i in x:
    if i.startswith("qsvc"):
        idModels.append(i[4:])
    if i.startswith("regr"):
        apModels.append(i[4:])
        
\n         
print("Intrusion-detection models:")
for idVal in idModels:
  print(idVal)
  
\n
print("Attack-prediction models:")
for apVal in apModels:
  print(apVal)
    
`;

const DETAIL_MODEL = `
import csv
mName="%s"
with open('./model_information/model_information.csv', 'r', newline="") as readFile:
    reader = csv.reader(readFile)
    for row in reader:
        if row[0] == mName:
          print("Model Headers:")
          print(row[1])
          print("Model Types:")
          print(row[2])
            
`;

const DELETE_MODEL = `
import os
import csv
mName="%s"
os.remove("./model_store/"+mName)
lines = list()
with open('./model_information/model_information.csv', 'r', newline="") as readFile:
    reader = csv.reader(readFile)
    for row in reader:
        lines.append(row)
        if row[0] == mName:
            lines.remove(row)
          
\n            
with open('./model_information/model_information.csv', 'w', newline="") as writeFile:
    writer = csv.writer(writeFile)
    writer.writerows(lines)
       
\n
print("Model " +mName[4:] + " deleted")  
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
  CREATE_REGR_START,
  CREATE_REGR_END,
  REGR_IMPORTS,
  REGR_START,
  REGR_END,
  LIST_MODELS,
  DELETE_MODEL,
  DETAIL_MODEL,
};
