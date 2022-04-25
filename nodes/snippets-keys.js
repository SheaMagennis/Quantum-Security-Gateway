// Adapting code from https://qiskit.org/textbook/ch-algorithms/quantum-key-distribution.html

const keyImports = `
from qiskit import QuantumCircuit, Aer, transpile, assemble
from qiskit.visualization import plot_histogram, plot_bloch_multivector
from numpy.random import randint
import numpy as np
import pickle
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

print("First Base: "+str(first_bases))
    `;

const received=`

n = %d

second_bases = randint(2, size=n)
message=pickle.load(open("./channel-quantum/quantum-channel", 'rb')) 
second_results = measure_message(message, second_bases)

print("Second Base: " + str(second_bases))

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
        qobj = assemble(message[q], shots=1, memory=True)
        result = aer_sim.run(qobj).result()
        measured_bit = int(result.get_memory()[0])
        measurements.append(measured_bit)
    return measurements
    `;

const keyCreation=`
first_key = remove_garbage(first_bases, second_bases, first_bits)
second_key = remove_garbage(first_bases, second_bases, second_results)

def remove_garbage(a_bases, b_bases, bits):
    good_bits = []
    for q in range(n):
        if a_bases[q] == b_bases[q]:
            # If both used the same basis, add
            # this to the list of 'good' bits
            good_bits.append(bits[q])
    return good_bits
    `;


const keyComparison=`
sample_size = 15
bit_selection = randint(n, size=sample_size)

second_sample = sample_bits(second_key, bit_selection)
print("  second_sample = " + str(second_sample))
first_sample = sample_bits(first_key, bit_selection)
print("first_sample = "+ str(first_sample))
`;

module.exports = {
  keyImports,
  encode,
  received,
  keyCreation,
  keyComparison,
};
