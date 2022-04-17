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

const LSTMImport=`
#algorithm outlined in https://arxiv.org/pdf/2009.01783.pdf - page 7 onwards
import numpy as np
import math
import matplotlib.pyplot as plt
import pandas as pd

import qiskit
from qiskit import transpile, assemble
from qiskit.visualization import *
from qiskit import QuantumCircuit, QuantumRegister
from qiskit import Aer, execute
from qiskit.opflow.gradients import Gradient, NaturalGradient, QFI, Hessian
from qiskit.circuit import Parameter, ParameterVector, ParameterExpression
from qiskit.opflow import Z, X, I, StateFn, CircuitStateFn, SummedOp
from datetime import datetime
from sklearn.preprocessing import StandardScaler
`;
const LSTM=`
initial=%j

class QLSTM:
    def __init__(self):
        self.data=[]
        self.depth=1
        
    def _setDepth(self,depth):
        self.depth=depth
    
    def _resolve(self,c,h,x):#recurse on this n times
        #print(x)
        #print(h)
        val = h+x
        #VQC1
        depth=self.depth
        
        first=self._makeVQC(val,depth)
        firstOut=self._sigmoid(first)
        #VQC2
        second=self._makeVQC(val,depth)
        secondOut=self._sigmoid(second)
        #VQC3
        third=self._makeVQC(val,depth)
        thirdOut=self._hyperTan(third)
        #VQC4
        fourth=self._makeVQC(val,depth)
        fourthOut=self._sigmoid(fourth)
        #operate on 1
        #print(firstOut)
        tLeft=self._mult(firstOut,c)
        #operate on 2 and 3
        tMid=self._mult(secondOut,thirdOut)
        #sum above 2 -| ct output
        ct=self._elemAdd(tLeft,tMid)
        #above with 4
        tRight=self._mult(self._hyperTanSec(ct),fourthOut)
        #resulting
        #print(tRight)
        yt=self._makeVQC(tRight,depth)
        ht=self._makeVQC(tRight,depth)[:2]#res first or last 2?
        #print("results:")
        #print(yt)#this is the output that is processed
        #print(ht)
        #print(ct)
        return [ct,ht,yt]
    
    def _makeVQC(self,val,depth):
        #backend = Aer.get_backend('qasm_simulator')
        backend=backend_service
        classical=4
        quant=4
        qc = QuantumCircuit(quant, classical)
        self._initialVQC(val,qc,quant)
        for i in range(depth):
            self._performVariation(qc,quant,val)
        res = self._measureVQC(quant,qc,backend)
        return res
    
    def _initialVQC(self,val,qc,quant):
        for i in range(quant):
            qc.h(i)
            angle=val[i]
            qc.ry(np.arctan(angle),i)
            qc.rz(np.arctan(angle**2),i)
    
    def _performVariation(self,qc,qubits,val):
        self._performVariationFirst(qc,qubits)
        self._performVariationSecond(qc,qubits,val)
    
    def _performVariationFirst(self,qc,qubits):
        qc.cx(0, 1)
        qc.cx(1, 2)
        qc.cx(2, 3)
        qc.cx(3, 0)
        qc.cx(0, 2)
        qc.cx(1, 3)
        qc.cx(2, 0)
        qc.cx(3, 1)
    
    def _performVariationSecond(self,qc,qubits,val):
        values=self._optimisation(val)
        j=0
        for i in range(qubits):
            qc.u(values[j].real,values[j+1].real,values[j+2].real,i)#get values from optimisation
            j+=3
    
    def _measureVQC(self,quant,qc,backend):
        for i in range(quant):
            qc.measure(i,i)
        result = execute(qc, backend = backend, shots = %d).result()
        counts=result.get_counts()
        dec = list(counts.keys())[0]
        return dec
    
    def _elemAdd(self,val1,val2):
        a = np.array(val1)
        b = np.array(val2)
        return a+b.tolist()
    
    def _mult(self,val1,val2):
        a = np.array(val1)
        b = np.array(val2)
        return np.multiply(a,b).tolist()
    
    def _hyperTanSec(self,res):
        for x in range(len(res)):
            res[x]=math.tanh(res[x])
        return res
    
    def _hyperTan(self,val):
        res = [int(i) for i in str(val)]
        for x in range(len(res)):
            res[x]=math.tanh(res[x])
        return res
    
    def _sigmoid(self,val):
        res = [int(i) for i in str(val)]
        for x in range(len(res)):
            if res[x] >= 0:
                res[x] = 1 / (1 + math.exp(-res[x]))
            else:
                res[x] = 1 / (1 + math.exp(res[x]))
        return res
    
    #using https://qiskit.org/documentation/tutorials/operators/02_gradients_framework.html
    def _optimisation(self,val): # apply gradient descent
        # Instantiate the Hamiltonian observable
        H = (2 * X) + Z #IS THIS CORRECT?
        quant=4
        qc = QuantumCircuit(quant)
        self._initialVQC(val,qc,quant)
        self._performVariationFirst(qc,quant)
        #performVariationSecond(qc,quant)
        a=Parameter(chr(ord('a') + 3*0))
        b=Parameter(chr(ord('b') + 3*0))
        c=Parameter(chr(ord('c') + 3*0))
        d=Parameter(chr(ord('a') + 3*1))
        e=Parameter(chr(ord('b') + 3*1))
        f=Parameter(chr(ord('c') + 3*1))
        g=Parameter(chr(ord('a') + 3*2))
        h=Parameter(chr(ord('b') + 3*2))
        i=Parameter(chr(ord('c') + 3*2))
        j=Parameter(chr(ord('a') + 3*3))
        k=Parameter(chr(ord('b') + 3*3))
        l=Parameter(chr(ord('c') + 3*3))
        qc.u(a,b,c,0)#get values from optimisation
        qc.u(d,e,f,1)
        qc.u(g,h,i,2)
        qc.u(j,k,l,3)
        # Combine the Hamiltonian observable and the state
        op = ~StateFn(H) @ CircuitStateFn(primitive=qc, coeff=1.)
        # Convert the expectation value into an operator corresponding to the gradient w.r.t. the state parameters using
        # the parameter shift method.
        params = [a, b, c, d, e, f, g, h, i, j, k, l]
        # Define the values to be assigned to the parameters
        value_dict = {a:1,b:1,c:1,d:1,e:1,f:1,g:1,h:1,i:1,j:1,k:1,l:1} #WHAT VALUES?
        state_grad = Gradient(grad_method='param_shift').convert(operator=op, params=params)
        # Print the operator corresponding to the gradient
        #print(state_grad)
        # Assign the parameters and evaluate the gradient
        state_grad_result = state_grad.assign_parameters(value_dict).eval()
        #print('State gradient computed with parameter shift', state_grad_result)
        return state_grad_result
    
    def getEstimation(self, data):#enter 2d array
        final=[]
        for x in range(len(data)):
            if(x==0):
                temp = self._resolve([0,0,0,0],[0,0],data[x])#control bits, hidden bits, values
            else:
                temp = self._resolve(temp[0],[float(temp[1][0]),float(temp[1][1])],data[x])
        return [float(temp[2][:2][0]),float(temp[2][:2][1])]
\n    
def transformData(data):
    #data=["2011-11-11 13:55:36","2011-11-13 13:55:36","2011-11-17 13:55:36"]
    values=[]
    #raise Exception(data[0])
    for x in range(len(data)):
        val = (datetime.fromisoformat(data[x][0]))#datetime.fromisoformat(data[x])
        tempvals=int(val.timestamp())
        values.append(tempvals)
        
    res=[]
    for y in range(len(values)-1):
        res.append([values[y+1]-values[y],values[y+1]-values[y]])
    return res

    
x=QLSTM()
#data=["2011-11-11 13:55:36","2011-11-13 13:55:36","2011-11-17 13:55:36"]

df = pd.DataFrame(initial)
data=df.values.tolist()


val = transformData(data)

scalar=StandardScaler()
scalar.fit(val)
val=scalar.transform(val)

valScal=val.tolist()
res=x.getEstimation(valScal)#only use first 
lastVal=int(datetime.fromisoformat((data[-1][0])).timestamp())#int(datetime.fromisoformat((data[-1])).timestamp())

unscaled = scalar.inverse_transform([res])#[-1][0]

nextVal=lastVal+unscaled[0][0]

date = datetime.fromtimestamp(nextVal)
print("Predicted Date:")
print(date)
`;

module.exports = {
  LSTM,
  LSTMImport,
};
