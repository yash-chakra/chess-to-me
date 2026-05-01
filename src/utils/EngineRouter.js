import { StockfishEngine } from "./StockfishEngine";
import { LC0Engine } from "./LC0Engine";

export class EngineRouter {
  constructor(selectedEngine, enginePaths) {
    this.selectedEngine = selectedEngine || "lc0";
    this.enginePaths = enginePaths || {};
    this.currentEngine = null;
  }

  setSelectedEngine(engineName, path) {
    this.selectedEngine = engineName;
    if (path) {
      this.enginePaths[engineName] = path;
    }
  }

  setEnginePaths(paths) {
    this.enginePaths = { ...this.enginePaths, ...paths };
  }

  _createEngine(engineName) {
    const path = this.enginePaths[engineName];
    if (!path) {
      throw new Error(`No path configured for engine: ${engineName}`);
    }

    switch (engineName.toLowerCase()) {
      case "stockfish":
        return new StockfishEngine(path);
      case "lc0":
        return new LC0Engine(path);
      default:
        throw new Error(`Unknown engine: ${engineName}`);
    }
  }

  async switchEngine(engineName, path) {
    if (this.currentEngine) {
      try {
        await this.currentEngine.destroy();
      } catch (err) {
        console.error(`Error destroying previous engine: ${err.message}`);
      }
    }

    this.setSelectedEngine(engineName, path);
    this.currentEngine = this._createEngine(engineName);

    try {
      await this.currentEngine.init();
    } catch (err) {
      this.currentEngine = null;
      throw err;
    }
  }

  async analyze(fen, depth, multiPv) {
    if (!this.currentEngine) {
      throw new Error("No engine currently initialized");
    }
    return this.currentEngine.analyze(fen, depth, multiPv);
  }

  async stop() {
    if (this.currentEngine) {
      await this.currentEngine.stop();
    }
  }

  async destroy() {
    if (this.currentEngine) {
      await this.currentEngine.destroy();
      this.currentEngine = null;
    }
  }

  getStatus() {
    return {
      selectedEngine: this.selectedEngine,
      engineRunning: !!this.currentEngine,
      currentEngineStatus: this.currentEngine?.getStatus?.() || null
    };
  }
}
