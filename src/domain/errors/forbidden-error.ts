const ForbiddenError = class extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForbiddenError";
  }
};

export default ForbiddenError;
