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

for val in stuff:  
  try:
    temporary.append(type(initial[val]["0"]).__name__)
  except:
    temporary.append(type(initial[val][0]).__name__)
\n
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

const QSVC_TEST_END=`
#print(data)
#make prediction
fin=model.test(test,res)#[[-0.74856406,-0.30061566, 0.19750934]]
print("Accuracy: " + str(fin))
   
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

for val in stuff:  
  try:
    temporary.append(type(initial[val]["0"]).__name__)
  except:
    temporary.append(type(initial[val][0]).__name__)
\n
finalTypes=",".join(temporary)
row = hold,joined_string,finalTypes
writer.writerow(row)
f.close()
print("Intrusion Detection Model successfully created")#remove
    
`;

module.exports = {
  QSVC_START,
  QSVC_END,
  QSVC_TEST_END,
  PCA,
  QSVC_IMPORTS,
  CREATE_QSVC_START,
  CREATE_QSVC_END,
  CREATE_REGR_START,
  CREATE_REGR_END,
  REGR_IMPORTS,
  REGR_START,
  REGR_END,
};
