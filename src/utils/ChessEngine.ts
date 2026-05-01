import type { AnalysisResult } from "../types";

export abstract class IChessEngine {
  path: string;
  process: any = null;

  constructor(path: string) {
    if (new.target === IChessEngine) {
      throw new TypeError("Cannot instantiate abstract class IChessEngine");
    }
    this.path = path;
    this.process = null;
  }

  abstract init(): Promise<void>;

  abstract analyze(fen: string, depth?: number, multiPv?: number): Promise<AnalysisResult>;

  abstract stop(): Promise<void>;

  abstract destroy(): Promise<void>;

  abstract getStatus(): unknown;
}
