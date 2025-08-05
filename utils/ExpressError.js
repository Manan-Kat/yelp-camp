class ExpressError extends Error {
  constructor(message, statusCode) {
    // calls the parent class and adds all its exiting functions/methods to this one
    super();
    this.message = message;
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
