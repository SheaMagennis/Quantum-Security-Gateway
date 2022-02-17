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

const QSVC_TEST = `
index_no = encoded.columns.get_loc("label")
label=test[:,index_no]
label = label.astype('int')#convert from object to usable

test = np.delete(test, index_no, 1)#array, num, column/row
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
fin=model.score(test,label)
print("Accuracy: " + str(fin))
   
`;

module.exports = {
  QSVC_START,
  QSVC_END,
  QSVC_TEST,
  QSVC_TEST_END,
};

