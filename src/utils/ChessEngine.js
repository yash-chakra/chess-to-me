export class IChessEngine {
  constructor(path) {
    if (new.target === IChessEngine) {
      throw new TypeError("Cannot instantiate abstract class IChessEngine");
    }
    this.path = path;
    this.process = null;
  }

  async init() {
    throw new Error("init() must be implemented by subclass");
  }

  async analyze(fen, depth, multiPv) {
    throw new Error("analyze() must be implemented by subclass");
  }

  async stop() {
    throw new Error("stop() must be implemented by subclass");
  }

  async destroy() {
    throw new Error("destroy() must be implemented by subclass");
  }

  getStatus() {
    throw new Error("getStatus() must be implemented by subclass");
  }
}
