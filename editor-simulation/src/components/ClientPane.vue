<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow p-4 border-t-4" :class="role === 1 ? 'border-blue-500' : 'border-green-500'">
    <div class="flex justify-between items-center mb-4">
      <div>
        <h2 class="text-lg font-bold">{{ title }}</h2>
        <span class="text-xs font-semibold px-2 py-1 rounded" :class="role === 1 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
          {{ role === 1 ? 'Editor (Role 1)' : 'Normal User (Role 2)' }}
        </span>
      </div>
      <div class="flex flex-col items-end">
        <label class="flex items-center cursor-pointer mb-1">
          <div class="relative">
            <input type="checkbox" class="sr-only" :checked="isOnline" @change="$emit('toggle-online')" />
            <div class="block w-10 h-6 rounded-full transition-colors" :class="isOnline ? 'bg-indigo-500' : 'bg-gray-400'"></div>
            <div class="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform" :class="isOnline ? 'transform translate-x-4' : ''"></div>
          </div>
          <div class="ml-3 text-sm font-medium w-12" :class="isOnline ? 'text-indigo-600' : 'text-gray-500'">
            {{ isOnline ? 'Online' : 'Offline' }}
          </div>
        </label>
        <span v-if="!isOnline" class="text-xs text-red-500 font-bold">Local Queue: {{ queueSize }}</span>
      </div>
    </div>
    
    <div class="mb-2 text-sm text-gray-500">Logical Timestamp: <span class="font-mono bg-gray-100 px-1 rounded">{{ currentTimestamp }}</span></div>
    
    <textarea
      class="w-full flex-grow p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 resize-none"
      :class="role === 1 ? 'focus:ring-blue-500' : 'focus:ring-green-500'"
      placeholder="Type your document edits here..."
      :value="localText"
      @input="handleInput"
    ></textarea>
  </div>
</template>

<script setup>
const props = defineProps({
  title: String,
  role: Number, // 1 or 2
  isOnline: Boolean,
  queueSize: Number,
  currentTimestamp: Number,
  localText: String
});

const emit = defineEmits(['toggle-online', 'text-input']);

function handleInput(event) {
  emit('text-input', event.target.value);
}
</script>
