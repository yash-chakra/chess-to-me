import { LC0Engine } from "./LC0Engine";

describe("LC0Engine", () => {
  let engine: LC0Engine;
  let mockElectronAPI: any;
  let LC0EngineClass: typeof LC0Engine;

  beforeEach(async () => {
    jest.resetModules();

    mockElectronAPI = {
      ensureEngineRunning: jest.fn(),
      analyzePosition: jest.fn(),
      stopEngine: jest.fn()
    };
    (global as any).window.electronAPI = mockElectronAPI;

    const module = await import("./LC0Engine");
    LC0EngineClass = module.LC0Engine;

    engine = new LC0EngineClass("/path/to/lc0");
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("should instantiate with correct name", () => {
    expect(engine.name).toBe("LC0");
    expect(engine.path).toBe("/path/to/lc0");
  });

  test("should initialize engine via electronAPI", async () => {
    mockElectronAPI.ensureEngineRunning.mockResolvedValue(undefined);

    await engine.init();

    expect(mockElectronAPI.ensureEngineRunning).toHaveBeenCalledWith({
      engine: "lc0",
      path: "/path/to/lc0"
    });
  });

  test("should throw error on initialization failure", async () => {
    mockElectronAPI.ensureEngineRunning.mockRejectedValue(new Error("Weights not found"));

    await expect(engine.init()).rejects.toThrow("Failed to initialize LC0");
  });

  test("should throw error when ensureEngineRunning unavailable", async () => {
    mockElectronAPI.ensureEngineRunning = undefined;

    await expect(engine.init()).rejects.toThrow("Engine initialization API unavailable");
  });

  test("should analyze position with default parameters", async () => {
    const mockAnalysis = {
      ok: true,
      analysis: [
        { move: "e2e4", eval: 0.35, depth: 16 },
        { move: "d2d4", eval: 0.28, depth: 16 }
      ]
    };
    mockElectronAPI.analyzePosition.mockResolvedValue(mockAnalysis);

    const result = await engine.analyze("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1");

    expect(mockElectronAPI.analyzePosition).toHaveBeenCalledWith({
      engine: "lc0",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      depth: 16,
      multiPv: 4
    });
    expect(result).toEqual(mockAnalysis.analysis);
  });

  test("should analyze with custom depth and multiPv", async () => {
    const mockAnalysis = { ok: true, analysis: [] };
    mockElectronAPI.analyzePosition.mockResolvedValue(mockAnalysis);

    await engine.analyze("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1", 18, 3);

    expect(mockElectronAPI.analyzePosition).toHaveBeenCalledWith({
      engine: "lc0",
      fen: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
      depth: 18,
      multiPv: 3
    });
  });

  test("should throw error on analysis failure", async () => {
    mockElectronAPI.analyzePosition.mockResolvedValue({
      ok: false,
      error: "Invalid FEN"
    });

    await expect(engine.analyze("invalid fen")).rejects.toThrow("Invalid FEN");
  });

  test("should throw error when analyzePosition API unavailable", async () => {
    mockElectronAPI.analyzePosition = undefined;

    await expect(
      engine.analyze("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    ).rejects.toThrow("Analysis API unavailable");
  });

  test("should wrap analysis errors with engine context", async () => {
    mockElectronAPI.analyzePosition.mockRejectedValue(new Error("Process timeout"));

    await expect(
      engine.analyze("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1")
    ).rejects.toThrow("LC0 analysis error: Process timeout");
  });

  test("should stop engine gracefully", async () => {
    mockElectronAPI.stopEngine.mockResolvedValue(undefined);

    await engine.stop();

    expect(mockElectronAPI.stopEngine).toHaveBeenCalledWith({
      engine: "lc0"
    });
  });

  test("should handle missing stopEngine API during stop", async () => {
    (global as any).window.electronAPI = { stopEngine: null };

    await expect(engine.stop()).resolves.toBeUndefined();
  });

  test("should swallow errors during stop", async () => {
    mockElectronAPI.stopEngine.mockRejectedValue(new Error("Already stopped"));

    await expect(engine.stop()).resolves.toBeUndefined();
  });

  test("should destroy engine by calling stop", async () => {
    mockElectronAPI.stopEngine.mockResolvedValue(undefined);

    await engine.destroy();

    expect(mockElectronAPI.stopEngine).toHaveBeenCalledWith({
      engine: "lc0"
    });
  });

  test("should return engine status", () => {
    const status = engine.getStatus();

    expect(status).toEqual({
      name: "LC0",
      path: "/path/to/lc0",
      ready: false
    });
  });

  test("should report ready status when process is set", () => {
    engine.process = { pid: 5678 };

    const status = engine.getStatus();

    expect(status.ready).toBe(true);
  });
});
