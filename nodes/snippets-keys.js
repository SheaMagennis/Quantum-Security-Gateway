// Adapting code from https://qiskit.org/textbook/ch-algorithms/quantum-key-distribution.html

const keyImports = `
from qiskit import QuantumCircuit, Aer, transpile, assemble
from qiskit.visualization import plot_histogram, plot_bloch_multivector
from numpy.random import randint
import numpy as np
import pickle
import json
from ast import literal_eval
`;

const encode=`

n = %d
## Step 1
#first generates bits
first_bits = randint(2, size=n)

## Step 2
# Create an array to tell us which qubits
# are encoded in which bases

def encode_message(bits, bases):
    message = []
    for i in range(n):
        qc = QuantumCircuit(1,1)
        if bases[i] == 0: # Prepare qubit in Z-basis
            if bits[i] == 0:
                pass 
            else:
                qc.x(0)
        else: # Prepare qubit in X-basis
            if bits[i] == 0:
                qc.h(0)
            else:
                qc.x(0)
                qc.h(0)
        qc.barrier()
        message.append(qc)
    return message
\n    
first_bases = randint(2, size=n)
message = encode_message(first_bits, first_bases)

pickle.dump(message, open("./channel-quantum/quantum-channel", 'wb'))

print("First Base: ")
print(*first_bases)
print("First bits: ")
print(*first_bits)
    `;

const received=`

n = %d

def measure_message(message, bases):
    backend = Aer.get_backend('qasm_simulator')
    measurements = []
    for q in range(n):
        if bases[q] == 0: # measuring in Z-basis
            message[q].measure(0,0)
        if bases[q] == 1: # measuring in X-basis
            message[q].h(0)
            message[q].measure(0,0)
        aer_sim = Aer.get_backend('qasm_simulator')
        result = aer_sim.run(message[q], shots=1, memory=True).result()
        measured_bit = int(result.get_memory()[0])
        measurements.append(measured_bit)
    pickle.dump(message, open("./channel-quantum/quantum-channel", 'wb'))
    return measurements

\n
second_bases = randint(2, size=n)
message=pickle.load(open("./channel-quantum/quantum-channel", 'rb')) 
second_results = np.asarray(measure_message(message, second_bases))
#pickle.dump(second_results, open("./channel-quantum/quantum-channel", 'wb'))

print("Second Base: ")
print(*second_bases)
print("Results: ")
print(*second_results)
    `;

const keyCreation=`
first = [int(num) for num in "%s".split()]
second=[int(num) for num in "%s".split()]
comp=[int(num) for num in "%s".split()]

first_bases=np.array(first)
second_bases=np.array(second)
component=np.array(comp)

def remove_garbage(a_bases, b_bases, bits):
    good_bits = []
    for q in range(len(first_bases)):
        if a_bases[q] == b_bases[q]:
            # If both used the same basis, add
            # this to the list of 'good' bits
            good_bits.append(bits[q])
    return good_bits
\n
key = remove_garbage(first_bases, second_bases, component)
print("key: ")
print(*key)

    `;


const keyComparison=`
first_key = [int(num) for num in "%s".split()]
second_key = [int(num) for num in "%s".split()]

#first = [int(num) for num in "%s".split()]
#second=[int(num) for num in "%s".split()]

#first_key=np.array(first)
#second_key=np.array(second)

sample_size = len(first_key)#.size
n=len(second_key) % 3 
if (n==0):
    n+=1
\n
bit_selection = randint(n, size=sample_size)

def sample_bits(bits, selection):
    sample = []
    for i in selection:
        # use np.mod to make sure the
        # bit we sample is always in 
        # the list range
        i = np.mod(i, len(bits))
        # pop(i) removes the element of the
        # list at index 'i'
        sample.append(bits.pop(i))
    return sample

second_sample = sample_bits(second_key, bit_selection)
first_sample = sample_bits(first_key, bit_selection)
print("First key = "+ str(first_sample))
print("Second key = " + str(second_sample))
if(first_sample == second_sample):
    print("Match found")
else:
    print("The keys do not match")
`;

module.exports = {
  keyImports,
  encode,
  received,
  keyCreation,
  keyComparison,
};
