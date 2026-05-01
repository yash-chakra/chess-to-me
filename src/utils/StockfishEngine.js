import { IChessEngine } from "./ChessEngine";

const electronAPI = typeof window !== "undefined" ? window.electronAPI : null;

export class StockfishEngine extends IChessEngine {
  constructor(path) {
    super(path);
    this.name = "Stockfish";
  }

  async init() {
    if (!electronAPI?.ensureEngineRunning) {
      throw new Error("Engine initialization API unavailable");
    }
    try {
      await electronAPI.ensureEngineRunning({ engine: "stockfish", path: this.path });
    } catch (err) {
      throw new Error(`Failed to initialize Stockfish: ${err.message}`);
    }
  }

  async analyze(fen, depth = 16, multiPv = 4) {
    if (!electronAPI?.analyzePosition) {
      throw new Error("Analysis API unavailable");
    }
    try {
      const response = await electronAPI.analyzePosition({
        engine: "stockfish",
        fen,
        depth,
        multiPv
      });
      if (!response?.ok) {
        throw new Error(response?.error || "Analysis failed");
      }
      return response.analysis;
    } catch (err) {
      throw new Error(`Stockfish analysis error: ${err.message}`);
    }
  }

  async stop() {
    if (!electronAPI?.stopEngine) {
      return;
    }
    try {
      await electronAPI.stopEngine({ engine: "stockfish" });
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
