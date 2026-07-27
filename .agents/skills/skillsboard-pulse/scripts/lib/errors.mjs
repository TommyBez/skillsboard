export class GraphValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "GraphValidationError";
  }
}

export function invariant(condition, message) {
  if (!condition) throw new GraphValidationError(message);
}
