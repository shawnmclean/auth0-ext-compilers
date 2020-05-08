module.exports = class ExtensibilityUserError extends Error {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
}
