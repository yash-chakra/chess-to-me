import { StockfishEngine } from "./StockfishEngine";
import { LC0Engine } from "./LC0Engine";
import { IChessEngine } from "./ChessEngine";
import type { AnalysisResult } from "../types";

export class EngineRouter {
  selectedEngine: string;
  enginePaths: Record<string, string>;
  currentEngine: IChessEngine | null;

  constructor(selectedEngine: string = "lc0", enginePaths: Record<string, string> = {}) {
    this.selectedEngine = selectedEngine;
    this.enginePaths = enginePaths;
    this.currentEngine = null;
  }

  setSelectedEngine(engineName: string, path?: string): void {
    this.selectedEngine = engineName;
    if (path) {
      this.enginePaths[engineName] = path;
    }
  }

  setEnginePaths(paths: Record<string, string>): void {
    this.enginePaths = { ...this.enginePaths, ...paths };
  }

  private _createEngine(engineName: string): IChessEngine {
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

  async switchEngine(engineName: string, path?: string): Promise<void> {
    if (this.currentEngine) {
      try {
        await this.currentEngine.destroy();
      } catch (err) {
        console.error(`Error destroying previous engine: ${err instanceof Error ? err.message : String(err)}`);
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

  async analyze(fen: string, depth?: number, multiPv?: number): Promise<AnalysisResult> {
    if (!this.currentEngine) {
      throw new Error("No engine currently initialized");
    }
    return this.currentEngine.analyze(fen, depth, multiPv);
  }

  async stop(): Promise<void> {
    if (this.currentEngine) {
      await this.currentEngine.stop();
    }
  }

  async destroy(): Promise<void> {
    if (this.currentEngine) {
      await this.currentEngine.destroy();
      this.currentEngine = null;
    }
  }

  getStatus(): {
    selectedEngine: string;
    engineRunning: boolean;
    currentEngineStatus: ReturnType<IChessEngine['getStatus']> | null;
  } {
    return {
      selectedEngine: this.selectedEngine,
      engineRunning: !!this.currentEngine,
      currentEngineStatus: this.currentEngine?.getStatus?.() || null
    };
  }
}
