<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow p-4 border-t-4 border-purple-500">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-lg font-bold">Server (Master Document)</h2>
        <span class="text-xs font-semibold px-2 py-1 rounded bg-purple-100 text-purple-800">
          Source of Truth
        </span>
      </div>
      <button 
        @click="$emit('resolve')"
        class="bg-purple-600 hover:bg-purple-700 text-white text-sm font-bold py-2 px-4 rounded shadow transition-colors active:scale-95">
        Sync / Resolve
      </button>
    </div>
    
    <div class="mb-4">
      <h3 class="text-sm font-bold text-gray-700 mb-2">Finalized Document Output</h3>
      <div class="w-full h-32 p-3 border bg-gray-50 border-gray-300 rounded overflow-y-auto whitespace-pre-wrap font-mono text-sm shadow-inner">
        {{ serverString === '' ? '(Empty Document)' : serverString }}
      </div>
    </div>

    <div class="flex-grow flex flex-col overflow-hidden">
      <h3 class="text-sm font-bold text-gray-700 mb-2">Binomial Heap Visualization</h3>
      <HeapVisualizer :treeData="heapData" class="flex-grow min-h-[200px]" />
    </div>
  </div>
</template>

<script setup>
import HeapVisualizer from './HeapVisualizer.vue';

const props = defineProps({
  serverString: String,
  heapData: Array
});

const emit = defineEmits(['resolve']);
</script>
