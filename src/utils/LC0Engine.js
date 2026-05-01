import { IChessEngine } from "./ChessEngine";

const electronAPI = typeof window !== "undefined" ? window.electronAPI : null;

export class LC0Engine extends IChessEngine {
  constructor(path) {
    super(path);
    this.name = "LC0";
  }

  async init() {
    if (!electronAPI?.ensureEngineRunning) {
      throw new Error("Engine initialization API unavailable");
    }
    try {
      await electronAPI.ensureEngineRunning({ engine: "lc0", path: this.path });
    } catch (err) {
      throw new Error(`Failed to initialize LC0: ${err.message}`);
    }
  }

  async analyze(fen, depth = 16, multiPv = 4) {
    if (!electronAPI?.analyzePosition) {
      throw new Error("Analysis API unavailable");
    }
    try {
      const response = await electronAPI.analyzePosition({
        engine: "lc0",
        fen,
        depth,
        multiPv
      });
      if (!response?.ok) {
        throw new Error(response?.error || "Analysis failed");
      }
      return response.analysis;
    } catch (err) {
      throw new Error(`LC0 analysis error: ${err.message}`);
    }
  }

  async stop() {
    if (!electronAPI?.stopEngine) {
      return;
    }
    try {
      await electronAPI.stopEngine({ engine: "lc0" });
    } catch {
      // swallow errors
    }
  }

  async destroy() {
    await this.stop();
  }

  getStatus() {
    return {
      name: this.name,
      path: this.path,
      ready: !!this.process
    };
  }
}
