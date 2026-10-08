export default class Operation {
  /**
   * Represents an edit operation in the text editor.
   * @param {string} char - The character inserted or deleted
   * @param {number} index - The position in the string
   * @param {string} type - "INSERT" or "DELETE"
   * @param {number} role - 1 for Editor, 2 for Normal User
   * @param {number} timestamp - Logical clock ticking up on every action
   */
  constructor(char, index, type, role, timestamp) {
    this.char = char;
    this.index = index;
    this.type = type;
    this.role = role;
    this.timestamp = timestamp;
  }
}
