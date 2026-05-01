import {
  discoverEngines,
  detectEngine,
  validateEnginePath,
  getDefaultEngine,
  getAvailableEngines
} from "./engineDiscovery";

describe("Engine Discovery", () => {
  let mockElectronAPI: any;

  beforeEach(async () => {
    jest.resetModules();

    mockElectronAPI = {
      discoverEngines: jest.fn(),
      detectEngine: jest.fn(),
      validateEngine: jest.fn()
    };
    (global as any).window.electronAPI = mockElectronAPI;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("discoverEngines", () => {
    test("should discover both engines", async () => {
      mockElectronAPI.discoverEngines.mockResolvedValue({
        stockfish: "/usr/bin/stockfish",
        lc0: "/usr/bin/lc0"
      });

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: "/usr/bin/stockfish",
        lc0: "/usr/bin/lc0"
      });
      expect(mockElectronAPI.discoverEngines).toHaveBeenCalled();
    });

    test("should discover only Stockfish", async () => {
      mockElectronAPI.discoverEngines.mockResolvedValue({
        stockfish: "/usr/bin/stockfish",
        lc0: null
      });

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: "/usr/bin/stockfish",
        lc0: null
      });
    });

    test("should discover only LC0", async () => {
      mockElectronAPI.discoverEngines.mockResolvedValue({
        stockfish: null,
        lc0: "/opt/lc0/lc0"
      });

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: null,
        lc0: "/opt/lc0/lc0"
      });
    });

    test("should return null when neither engine found", async () => {
      mockElectronAPI.discoverEngines.mockResolvedValue({
        stockfish: null,
        lc0: null
      });

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: null,
        lc0: null
      });
    });

    test("should return defaults when API unavailable", async () => {
      (global as any).window.electronAPI = null;

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: null,
        lc0: null
      });
    });

    test("should handle API errors gracefully", async () => {
      mockElectronAPI.discoverEngines.mockRejectedValue(new Error("API error"));

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: null,
        lc0: null
      });
    });

    test("should handle partial API responses", async () => {
      mockElectronAPI.discoverEngines.mockResolvedValue({
        stockfish: "/usr/bin/stockfish"
      });

      const result = await discoverEngines();

      expect(result).toEqual({
        stockfish: "/usr/bin/stockfish",
        lc0: null
      });
    });
  });

  describe("detectEngine", () => {
    test("should detect Stockfish", async () => {
      mockElectronAPI.detectEngine.mockResolvedValue({
        path: "/usr/bin/stockfish"
      });

      const result = await detectEngine("stockfish");

      expect(result).toBe("/usr/bin/stockfish");
      expect(mockElectronAPI.detectEngine).toHaveBeenCalledWith({
        engine: "stockfish"
      });
    });

    test("should detect LC0", async () => {
      mockElectronAPI.detectEngine.mockResolvedValue({
        path: "/opt/lc0/lc0"
      });

      const result = await detectEngine("lc0");

      expect(result).toBe("/opt/lc0/lc0");
      expect(mockElectronAPI.detectEngine).toHaveBeenCalledWith({
        engine: "lc0"
      });
    });

    test("should return null when engine not found", async () => {
      mockElectronAPI.detectEngine.mockResolvedValue({
        path: null
      });

      const result = await detectEngine("stockfish");

      expect(result).toBeNull();
    });

    test("should return null when API unavailable", async () => {
      (global as any).window.electronAPI = null;

      const result = await detectEngine("stockfish");

      expect(result).toBeNull();
    });

    test("should handle API errors gracefully", async () => {
      mockElectronAPI.detectEngine.mockRejectedValue(new Error("Detection failed"));

      const result = await detectEngine("stockfish");

      expect(result).toBeNull();
    });
  });

  describe("validateEnginePath", () => {
    test("should validate engine path", async () => {
      mockElectronAPI.validateEngine.mockResolvedValue({
        valid: true
      });

      const result = await validateEnginePath("stockfish", "/usr/bin/stockfish");

      expect(result).toBe(true);
      expect(mockElectronAPI.validateEngine).toHaveBeenCalledWith({
        engine: "stockfish",
        path: "/usr/bin/stockfish"
      });
    });

    test("should return false for invalid path", async () => {
      mockElectronAPI.validateEngine.mockResolvedValue({
        valid: false
      });

      const result = await validateEnginePath("stockfish", "/invalid/path");

      expect(result).toBe(false);
    });

    test("should return false when API unavailable", async () => {
      (global as any).window.electronAPI = null;

      const result = await validateEnginePath("stockfish", "/usr/bin/stockfish");

      expect(result).toBe(false);
    });

    test("should handle API errors gracefully", async () => {
      mockElectronAPI.validateEngine.mockRejectedValue(new Error("Validation failed"));

      const result = await validateEnginePath("stockfish", "/usr/bin/stockfish");

      expect(result).toBe(false);
    });

    test("should handle missing valid property", async () => {
      mockElectronAPI.validateEngine.mockResolvedValue({});

      const result = await validateEnginePath("stockfish", "/usr/bin/stockfish");

      expect(result).toBe(false);
    });
  });

  describe("getDefaultEngine", () => {
    test("should prefer LC0 when both available", () => {
      const discovered = {
        stockfish: "/usr/bin/stockfish",
        lc0: "/opt/lc0/lc0"
      };

      const result = getDefaultEngine(discovered);

      expect(result).toBe("lc0");
    });

    test("should return Stockfish when LC0 unavailable", () => {
      const discovered = {
        stockfish: "/usr/bin/stockfish",
        lc0: null
      };

      const result = getDefaultEngine(discovered);

      expect(result).toBe("stockfish");
    });

    test("should return LC0 when Stockfish unavailable", () => {
      const discovered = {
        stockfish: null,
        lc0: "/opt/lc0/lc0"
      };

      const result = getDefaultEngine(discovered);

      expect(result).toBe("lc0");
    });

    test("should return null when no engines available", () => {
      const discovered = {
        stockfish: null,
        lc0: null
      };

      const result = getDefaultEngine(discovered);

      expect(result).toBeNull();
    });

    test("should return null for empty object", () => {
      const result = getDefaultEngine({} as any);

      expect(result).toBeNull();
    });

    test("should return null for null input", () => {
      const result = getDefaultEngine(null as any);

      expect(result).toBeNull();
    });
  });

  describe("getAvailableEngines", () => {
    test("should list both engines", () => {
      const discovered = {
        stockfish: "/usr/bin/stockfish",
        lc0: "/opt/lc0/lc0"
      };

      const result = getAvailableEngines(discovered);

      expect(result).toEqual([
        {
          name: "stockfish",
          path: "/usr/bin/stockfish",
          status: "installed"
        },
        {
          name: "lc0",
          path: "/opt/lc0/lc0",
          status: "installed"
        }
      ]);
    });

    test("should list only Stockfish when LC0 unavailable", () => {
      const discovered = {
        stockfish: "/usr/bin/stockfish",
        lc0: null
      };

      const result = getAvailableEngines(discovered);

      expect(result).toEqual([
        {
          name: "stockfish",
          path: "/usr/bin/stockfish",
          status: "installed"
        }
      ]);
    });

    test("should list only LC0 when Stockfish unavailable", () => {
      const discovered = {
        stockfish: null,
        lc0: "/opt/lc0/lc0"
      };

      const result = getAvailableEngines(discovered);

      expect(result).toEqual([
        {
          name: "lc0",
          path: "/opt/lc0/lc0",
          status: "installed"
        }
      ]);
    });

    test("should return empty array when no engines available", () => {
      const discovered = {
        stockfish: null,
        lc0: null
      };

      const result = getAvailableEngines(discovered);

      expect(result).toEqual([]);
    });

    test("should return empty array for null input", () => {
      const result = getAvailableEngines(null as any);

      expect(result).toEqual([]);
    });

    test("should return empty array for empty object", () => {
      const result = getAvailableEngines({} as any);

      expect(result).toEqual([]);
    });
  });
});
