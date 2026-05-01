// Mock window.electronAPI for testing engine classes
global.window = {
  electronAPI: {
    ensureEngineRunning: jest.fn(),
    analyzePosition: jest.fn(),
    stopEngine: jest.fn(),
    discoverEngines: jest.fn(),
    detectEngine: jest.fn(),
    validateEngine: jest.fn()
  }
};
