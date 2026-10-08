/**
 * Represents a node in the Binomial Heap.
 */
export default class BinomialNode {
  /**
   * @param {Operation} operation - The payload containing the edit operation
   */
  constructor(operation) {
    this.operation = operation;
    this.degree = 0;
    this.parent = null;
    this.child = null;
    this.sibling = null;
  }
}

/**
 * Comparator function to determine priority.
 * Priority rules:
 * 1. Role (Editor = 1 > Normal = 2)
 * 2. Timestamp (smaller = older = higher priority)
 * 
 * @param {BinomialNode} nodeA
 * @param {BinomialNode} nodeB
 * @returns {boolean} true if nodeA has higher priority than nodeB
 */
export function compare(nodeA, nodeB) {
  if (nodeA.operation.role !== nodeB.operation.role) {
    return nodeA.operation.role < nodeB.operation.role;
  }
  return nodeA.operation.timestamp < nodeB.operation.timestamp;
}
