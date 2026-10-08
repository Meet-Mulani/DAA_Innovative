<template>
  <div class="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto overflow-y-auto whitespace-pre">
    <div v-if="!treeData || treeData.length === 0" class="text-gray-500 italic">Heap is empty</div>
    <div v-else>
      <div v-for="(tree, index) in treeData" :key="index" class="mb-4">
        <div class="font-bold text-white mb-1 border-b border-gray-700 inline-block">--- Root Node (Degree {{ tree.degree }}) ---</div>
        <div>{{ renderTree(tree, 0) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  treeData: Array // array of serialized trees
});

function renderTree(node, depth) {
  if (!node) return '';
  let indent = '  '.repeat(depth);
  let result = `${indent}├─ [Role:${node.role}|TS:${node.timestamp}] ${node.type} '${node.char}' @${node.index}\n`;
  
  if (node.children && node.children.length > 0) {
    for (let child of node.children) {
      result += renderTree(child, depth + 1);
    }
  }
  return result;
}
</script>
