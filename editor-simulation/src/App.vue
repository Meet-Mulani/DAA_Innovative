<template>
  <div class="min-h-screen bg-gray-100 p-4 md:p-8 flex flex-col">
    <header class="mb-8 text-center">
      <h1 class="text-3xl font-extrabold text-gray-800 tracking-tight">Real-Time Collaborative Document Editor</h1>
      <p class="text-gray-500 mt-2 font-medium">DAA Binomial Min-Heap Simulation</p>
    </header>

    <div class="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-[600px]">
      <ClientPane
        title="Client A"
        :role="clientA.role"
        :isOnline="clientA.isOnline"
        :queueSize="clientA.queueSize"
        :currentTimestamp="logicalClock"
        :localText="clientA.text"
        @text-input="(val) => handleInput(clientA, val)"
        @toggle-online="toggleOnline(clientA)"
      />
      
      <ClientPane
        title="Client B"
        :role="clientB.role"
        :isOnline="clientB.isOnline"
        :queueSize="clientB.queueSize"
        :currentTimestamp="logicalClock"
        :localText="clientB.text"
        @text-input="(val) => handleInput(clientB, val)"
        @toggle-online="toggleOnline(clientB)"
      />

      <ServerPane
        :serverString="serverDocument"
        :heapData="serializedServerHeap"
        @resolve="resolveConflicts"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import ClientPane from './components/ClientPane.vue';
import ServerPane from './components/ServerPane.vue';
import BinomialHeap from './algorithms/BinomialHeap.js';
import Operation from './algorithms/Operation.js';

import RedBlackTextTree from './algorithms/RedBlackTextTree.js';

// --- PHASE 4: Core State & Logic --- //

const logicalClock = ref(0);
const serverHeap = ref(new BinomialHeap());
// Replace string with RedBlackTextTree
const rbTree = ref(new RedBlackTextTree());
const serverDocument = ref('');

const clientA = reactive({
  role: 1, // Editor
  isOnline: true,
  heap: new BinomialHeap(),
  queueSize: 0,
  text: ''
});

const clientB = reactive({
  role: 2, // Normal User
  isOnline: false,
  heap: new BinomialHeap(),
  queueSize: 0,
  text: ''
});

const serializedServerHeap = ref([]);

// --- Serialization for UI (Visualizes the Binomial Tree) --- //
function updateServerVisualization() {
  serializedServerHeap.value = serializeHeap(serverHeap.value);
}

function serializeHeap(heap) {
  const result = [];
  let curr = heap.head;
  while (curr) {
    result.push(serializeNode(curr));
    curr = curr.sibling;
  }
  return result;
}

function serializeNode(node) {
  if (!node) return null;
  const children = [];
  let child = node.child;
  while (child) {
    children.push(serializeNode(child));
    child = child.sibling;
  }
  return {
    degree: node.degree,
    role: node.operation.role,
    timestamp: node.operation.timestamp,
    type: node.operation.type,
    char: node.operation.char,
    index: node.operation.index,
    // Reverse children because they are linked in reverse order mathematically
    children: children.reverse() 
  };
}

// --- Operation Interception --- //
function handleInput(clientState, newText) {
  logicalClock.value++;
  let oldText = clientState.text;
  
  let opType = '';
  let opChar = '';
  let opIndex = 0;
  
  // Basic Delta Extraction
  if (newText.length > oldText.length) {
    opType = 'INSERT';
    for (let i = 0; i < newText.length; i++) {
      if (newText[i] !== oldText[i]) {
        opChar = newText[i];
        opIndex = i;
        break;
      }
    }
  } else if (newText.length < oldText.length) {
    opType = 'DELETE';
    for (let i = 0; i < oldText.length; i++) {
      if (oldText[i] !== newText[i]) {
        opChar = oldText[i];
        opIndex = i;
        break;
      }
    }
  } else {
    // Replacement ignored in this simple sim
    clientState.text = newText;
    return;
  }
  
  clientState.text = newText;
  
  // Create the Operation
  const op = new Operation(opChar, opIndex, opType, clientState.role, logicalClock.value);
  
  // Route to proper heap based on connection state
  if (clientState.isOnline) {
    serverHeap.value.insert(op);
    updateServerVisualization();
  } else {
    clientState.heap.insert(op);
    clientState.queueSize++; 
  }
}

// --- The Batching Engine --- //
function toggleOnline(clientState) {
  clientState.isOnline = !clientState.isOnline;
  
  if (clientState.isOnline && !clientState.heap.isEmpty()) {
    console.log(`[Network] Client ${clientState.role} came online. Unioning local heap with Server Heap.`);
    
    // MATHEMATICAL HIGHLIGHT: Union the local heap to the server heap O(log n)
    serverHeap.value.union(clientState.heap);
    
    // Reset local queue
    clientState.heap = new BinomialHeap();
    clientState.queueSize = 0;
    
    updateServerVisualization();
  }
}

// --- PHASE 5: Conflict Resolution & Execution --- //
const appliedOpsHistory = [];

function resolveConflicts() {
  console.log("[Server] Starting Conflict Resolution...");
  
  while (!serverHeap.value.isEmpty()) {
    const op = serverHeap.value.extractMin();
    let shiftedIndex = op.index;
    
    for (const appliedOp of appliedOpsHistory) {
      // FIX: Only shift indices against operations from DIFFERENT clients
      if (appliedOp.role !== op.role) {
        if (appliedOp.type === 'INSERT' && appliedOp.index <= shiftedIndex) {
          shiftedIndex++;
        } else if (appliedOp.type === 'DELETE' && appliedOp.index < shiftedIndex) {
          shiftedIndex--;
        }
      }
    }
    
    // 3. Execution: Red-Black Tree Manipulation in O(log n)
    if (op.type === 'INSERT') {
      rbTree.value.insertAt(shiftedIndex, op.char);
    } else if (op.type === 'DELETE') {
      rbTree.value.deleteAt(shiftedIndex);
    }
    
    // FIX: Push the role into history so the check above works
    appliedOpsHistory.push({ type: op.type, index: shiftedIndex, role: op.role });
  }
  
  // Extract finalized string via O(n) traversal only when rendering
  serverDocument.value = rbTree.value.toString();
  
  updateServerVisualization();
  console.log("[Server] Document synced. Final String: ", serverDocument.value);
}
</script>
