const RED = 'RED';
const BLACK = 'BLACK';

export class RBNode {
  constructor(char) {
    this.char = char;
    this.color = RED;
    this.left = null;
    this.right = null;
    this.parent = null;
    this.size = 1;
  }
}

export default class RedBlackTextTree {
  constructor() {
    this.TNULL = new RBNode(null);
    this.TNULL.color = BLACK;
    this.TNULL.size = 0;
    this.root = this.TNULL;
  }

  // --- Rotations ---
  leftRotate(x) {
    let y = x.right;
    x.right = y.left;
    if (y.left !== this.TNULL) {
      y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.left) {
      x.parent.left = y;
    } else {
      x.parent.right = y;
    }
    y.left = x;
    x.parent = y;

    // Update sizes
    y.size = x.size;
    x.size = x.left.size + x.right.size + 1;
  }

  rightRotate(x) {
    let y = x.left;
    x.left = y.right;
    if (y.right !== this.TNULL) {
      y.right.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === null) {
      this.root = y;
    } else if (x === x.parent.right) {
      x.parent.right = y;
    } else {
      x.parent.left = y;
    }
    y.right = x;
    x.parent = y;

    // Update sizes
    y.size = x.size;
    x.size = x.left.size + x.right.size + 1;
  }

  // --- Insertion ---
  insertAt(index, char) {
    let node = new RBNode(char);
    node.left = this.TNULL;
    node.right = this.TNULL;

    let y = null;
    let x = this.root;
    let isLeftChild = false; // Track the traversal direction

    // Traverse to find position
    while (x !== this.TNULL) {
      y = x;
      y.size++; // Increase size of ancestors as we go down
      
      let leftSize = x.left.size;
      if (index <= leftSize) {
        x = x.left;
        isLeftChild = true; // We branched left
      } else {
        index -= (leftSize + 1);
        x = x.right;
        isLeftChild = false; // We branched right
      }
    }

    node.parent = y;
    if (y === null) {
      this.root = node;
    } else if (isLeftChild) {
      // Reliably attach based on the tracked direction
      y.left = node;
    } else {
      y.right = node;
    }

    if (node.parent === null) {
      node.color = BLACK;
      return;
    }
    if (node.parent.parent === null) {
      return;
    }

    this.fixInsert(node);
  }

  fixInsert(k) {
    let u;
    while (k.parent !== null && k.parent.color === RED) {
      if (k.parent === k.parent.parent.right) {
        u = k.parent.parent.left; 
        if (u.color === RED) {
          u.color = BLACK;
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.left) {
            k = k.parent;
            this.rightRotate(k);
          }
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          this.leftRotate(k.parent.parent);
        }
      } else {
        u = k.parent.parent.right;
        if (u.color === RED) {
          u.color = BLACK;
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          k = k.parent.parent;
        } else {
          if (k === k.parent.right) {
            k = k.parent;
            this.leftRotate(k);
          }
          k.parent.color = BLACK;
          k.parent.parent.color = RED;
          this.rightRotate(k.parent.parent);
        }
      }
      if (k === this.root) break;
    }
    this.root.color = BLACK;
  }

  // --- Deletion ---
  deleteAt(index) {
    if (this.root === this.TNULL) return;

    let z = this.root;
    let found = false;

    // Traverse to find the exact node by index
    while (z !== this.TNULL) {
      let leftSize = z.left.size;
      if (index === leftSize) {
        found = true;
        break;
      } else if (index < leftSize) {
        z = z.left;
      } else {
        index -= (leftSize + 1);
        z = z.right;
      }
    }

    if (!found) return; // Index out of bounds

    let x, y;
    let originalColor = z.color;

    if (z.left === this.TNULL) {
      x = z.right;
      this.transplant(z, z.right);
      this.updateAncestorSizes(x.parent);
    } else if (z.right === this.TNULL) {
      x = z.left;
      this.transplant(z, z.left);
      this.updateAncestorSizes(x.parent);
    } else {
      // Find successor
      y = this.minimum(z.right);
      originalColor = y.color;
      x = y.right;
      
      if (y.parent === z) {
        x.parent = y;
      } else {
        this.transplant(y, y.right);
        y.right = z.right;
        y.right.parent = y;
      }
      this.transplant(z, y);
      y.left = z.left;
      y.left.parent = y;
      y.color = z.color;
      
      this.updateAncestorSizes(x.parent);
      
      // Recalculate size for the swapped node
      y.size = y.left.size + y.right.size + 1;
      this.updateAncestorSizes(y.parent);
    }

    if (originalColor === BLACK) {
      this.fixDelete(x);
    }
  }

  updateAncestorSizes(node) {
    while (node !== null) {
      node.size = node.left.size + node.right.size + 1;
      node = node.parent;
    }
  }

  transplant(u, v) {
    if (u.parent === null) {
      this.root = v;
    } else if (u === u.parent.left) {
      u.parent.left = v;
    } else {
      u.parent.right = v;
    }
    v.parent = u.parent;
  }

  minimum(node) {
    while (node.left !== this.TNULL) {
      node = node.left;
    }
    return node;
  }

  fixDelete(x) {
    let s;
    while (x !== this.root && x.color === BLACK) {
      if (x === x.parent.left) {
        s = x.parent.right;
        if (s.color === RED) {
          s.color = BLACK;
          x.parent.color = RED;
          this.leftRotate(x.parent);
          s = x.parent.right;
        }
        if (s.left.color === BLACK && s.right.color === BLACK) {
          s.color = RED;
          x = x.parent;
        } else {
          if (s.right.color === BLACK) {
            s.left.color = BLACK;
            s.color = RED;
            this.rightRotate(s);
            s = x.parent.right;
          }
          s.color = x.parent.color;
          x.parent.color = BLACK;
          s.right.color = BLACK;
          this.leftRotate(x.parent);
          x = this.root;
        }
      } else {
        s = x.parent.left;
        if (s.color === RED) {
          s.color = BLACK;
          x.parent.color = RED;
          this.rightRotate(x.parent);
          s = x.parent.left;
        }
        if (s.right.color === BLACK && s.left.color === BLACK) {
          s.color = RED;
          x = x.parent;
        } else {
          if (s.left.color === BLACK) {
            s.right.color = BLACK;
            s.color = RED;
            this.leftRotate(s);
            s = x.parent.left;
          }
          s.color = x.parent.color;
          x.parent.color = BLACK;
          s.left.color = BLACK;
          this.rightRotate(x.parent);
          x = this.root;
        }
      }
    }
    x.color = BLACK;
  }

  // --- Output ---
  toString() {
    let result = '';
    const traverse = (node) => {
      if (node !== this.TNULL) {
        traverse(node.left);
        result += node.char;
        traverse(node.right);
      }
    };
    traverse(this.root);
    return result;
  }
}
