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

module.exports = {
  CREATE_REGR_START,
  CREATE_REGR_END,
};