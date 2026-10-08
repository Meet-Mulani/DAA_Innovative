import BinomialNode, { compare } from './BinomialNode.js';

export default class BinomialHeap {
  constructor() {
    this.head = null;
  }

  /**
   * Makes node2 a child of node1.
   * node1 must have a higher (or equal) priority than node2.
   */
  link(node1, node2) {
    node2.parent = node1;
    node2.sibling = node1.child;
    node1.child = node2;
    node1.degree++;
  }

  /**
   * Merges the root lists of two binomial heaps in monotonically increasing order of their degrees.
   * @returns {BinomialNode} The head of the merged root list.
   */
  merge(h1, h2) {
    if (!h1) return h2;
    if (!h2) return h1;

    let head = null;
    let curr1 = h1;
    let curr2 = h2;

    if (curr1.degree <= curr2.degree) {
      head = curr1;
      curr1 = curr1.sibling;
    } else {
      head = curr2;
      curr2 = curr2.sibling;
    }
    
    let curr = head;

    while (curr1 !== null && curr2 !== null) {
      if (curr1.degree <= curr2.degree) {
        curr.sibling = curr1;
        curr1 = curr1.sibling;
      } else {
        curr.sibling = curr2;
        curr2 = curr2.sibling;
      }
      curr = curr.sibling;
    }

    if (curr1 !== null) {
      curr.sibling = curr1;
    } else {
      curr.sibling = curr2;
    }

    return head;
  }

  /**
   * The core operation. Merges another heap into this one and consolidates trees of the same degree.
   * @param {BinomialHeap} heap2 
   */
  union(heap2) {
    let newHead = this.merge(this.head, heap2.head);
    this.head = null;
    heap2.head = null;
    
    if (!newHead) return;

    let prev = null;
    let x = newHead;
    let next = x.sibling;

    while (next !== null) {
      // Case 1 & 2: Degrees differ, or three nodes have the same degree.
      // Move forward without linking.
      if (x.degree !== next.degree || (next.sibling !== null && next.sibling.degree === x.degree)) {
        prev = x;
        x = next;
      } 
      // Case 3 & 4: Degrees are same, we must link them.
      else {
        // Compare using our priority logic: true means x has higher priority than next.
        if (compare(x, next)) { 
          x.sibling = next.sibling;
          this.link(x, next);
        } else {
          if (prev === null) {
            newHead = next;
          } else {
            prev.sibling = next;
          }
          this.link(next, x);
          x = next;
        }
      }
      next = x.sibling;
    }

    this.head = newHead;
    return this;
  }

  /**
   * Creates a new heap with a single node, then unions it into this heap.
   * O(log n) time.
   */
  insert(operation) {
    let newNode = new BinomialNode(operation);
    let tempHeap = new BinomialHeap();
    tempHeap.head = newNode;
    this.union(tempHeap);
    console.log(`[BinomialHeap] Inserted Operation: ${operation.type} '${operation.char}' at ${operation.index} (Role: ${operation.role}, TS: ${operation.timestamp})`);
  }

  /**
   * Scans root list to find the minimum (highest priority) node.
   * @returns {Object} Object containing the minNode and its previous sibling (minPrev).
   */
  findMinNode() {
    let x = this.head;
    if (!x) return { minNode: null, minPrev: null };

    let minNode = x;
    let prev = null;
    let minPrev = null;

    while (x !== null) {
      if (compare(x, minNode)) {
        minNode = x;
        minPrev = prev;
      }
      prev = x;
      x = x.sibling;
    }
    return { minNode, minPrev };
  }

  /**
   * Returns the operation with the highest priority without removing it.
   */
  findMin() {
    const { minNode } = this.findMinNode();
    return minNode ? minNode.operation : null;
  }

  /**
   * Extracts the node with the highest priority, reverses its children, and unions them back.
   * O(log n) time.
   * @returns {Operation|null} The extracted operation.
   */
  extractMin() {
    if (this.head === null) return null;

    let { minNode, minPrev } = this.findMinNode();

    // Remove minNode from root list
    if (minPrev === null) {
      this.head = minNode.sibling;
    } else {
      minPrev.sibling = minNode.sibling;
    }

    // Reverse children of minNode and create a new heap for them
    let child = minNode.child;
    let prevChild = null;
    while (child !== null) {
      let nextChild = child.sibling;
      child.sibling = prevChild;
      child.parent = null;
      prevChild = child;
      child = nextChild;
    }

    let childHeap = new BinomialHeap();
    childHeap.head = prevChild;

    // Union the original heap with the reversed children's heap
    this.union(childHeap);

    console.log(`[BinomialHeap] Extracted Min: ${minNode.operation.type} '${minNode.operation.char}' at ${minNode.operation.index}`);
    return minNode.operation;
  }

  /**
   * Helper to check if heap is empty.
   */
  isEmpty() {
    return this.head === null;
  }
}
