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

// add PCR import
const QSVC_IMPORTS=`
from qiskit_machine_learning.algorithms import QSVC
import pickle
import json
`;

const REGR_IMPORTS = `
import datetime
from qiskit_machine_learning.algorithms import QSVR
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

const CREATE_REGR_START = `
import csv

initial=%j
df=pd.DataFrame(initial)
backend = Aer.get_backend('qasm_simulator')

instance = QuantumInstance(backend, shots=%d, skip_qobj_validation=False)
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
