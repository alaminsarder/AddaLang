class AddaError extends Error {
  constructor(message, line) {
    super(message);
    this.name = 'AddaError';
    this.line = line || null;
  }
}
module.exports = { AddaError };
