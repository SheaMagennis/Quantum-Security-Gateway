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

const CREATE_QSVC_START = `
import os
import sqlite3
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
mName="%s"
hold="qsvc"+mName
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
conn = None
database = "./DB/modelInfo"
conn = sqlite3.connect(database)
c = conn.cursor()
#name header type modeltype
for x in range(len(stuff)):
  c.execute('INSERT INTO modelInput VALUES (?,?,?,?)',(mName,stuff[x],temporary[x],"qsvc"))
\n
conn.commit()
print("Intrusion Detection Model successfully created")#remove
    
`;

module.exports = {
  CREATE_QSVC_START,
  CREATE_QSVC_END,
};
