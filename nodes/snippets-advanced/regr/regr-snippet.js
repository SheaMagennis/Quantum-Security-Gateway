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

const REGR_TEST = `
index_no = encoded.columns.get_loc("Target")
label=test[:,index_no]
label = label.astype('int')#convert from object to usable

data = np.delete(data, index_no, 1)#array, num, column/row
`;

const REGR_END =`
fin=model.predict(data)
for i in fin:
  print("Predicted value : "+ "{}".format(i))

`;

const REGR_TEST_END=`
#print(data)
#make prediction
fin=model.score(data,label)
print("Accuracy: " + str(fin))
   
`;

module.exports = {
  REGR_START,
  REGR_END,
  REGR_TEST,
  REGR_TEST_END,
};
