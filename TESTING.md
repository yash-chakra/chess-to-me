# Testing Guide

This project includes comprehensive unit tests for the chess engine abstraction layer and discovery system.

## Running Tests

### Run all tests once:
```bash
npm test
```

### Run tests in watch mode (re-run on file changes):
```bash
npm run test:watch
```

### Run tests with coverage report:
```bash
npm test -- --coverage
```

## Test Structure

Tests are located alongside source files with `.test.js` extension:

- `src/utils/ChessEngine.test.js` — Tests for the abstract engine base class
- `src/utils/StockfishEngine.test.js` — Tests for Stockfish implementation
- `src/utils/LC0Engine.test.js` — Tests for LC0 implementation
- `src/utils/engineDiscovery.test.js` — Tests for engine detection and validation

## Test Coverage

### ChessEngine (Abstract Base Class)
- Cannot be instantiated directly
- Subclass implementations inherit properly
- All abstract methods require implementation by subclasses
- Path and process initialization

### StockfishEngine
- Correct engine name and path configuration
- Engine initialization via Electron IPC
- Position analysis with default and custom parameters
- Error handling and context-specific error messages
- Engine stop and destroy operations
- Status reporting with process state

### LC0Engine
- Correct engine name and path configuration
- Engine initialization via Electron IPC (LC0-specific)
- Position analysis with default and custom parameters
- Neural network-specific error handling
- Engine stop and destroy operations
- Status reporting with process state

### Engine Discovery
- **discoverEngines()** — Multi-engine discovery, API errors, partial results
- **detectEngine()** — Single engine detection, error handling, missing engines
- **validateEnginePath()** — Path validation, invalid paths, API errors
- **getDefaultEngine()** — Engine priority (LC0 > Stockfish), fallback logic
- **getAvailableEngines()** — List available engines with status

## Key Testing Patterns

### Mocking Electron IPC
Tests mock the `window.electronAPI` to simulate IPC calls:

```javascript
const mockElectronAPI = {
  ensureEngineRunning: jest.fn(),
  analyzePosition: jest.fn(),
  stopEngine: jest.fn()
};
global.window.electronAPI = mockElectronAPI;
```

### Testing Async Operations
Tests use `async/await` and Jest's async test support:

```javascript
test("should initialize engine", async () => {
  mockElectronAPI.ensureEngineRunning.mockResolvedValue(undefined);
  await engine.init();
  expect(mockElectronAPI.ensureEngineRunning).toHaveBeenCalled();
});
```

### Error Scenarios
Tests verify proper error handling:

```javascript
test("should throw on initialization failure", async () => {
  mockElectronAPI.ensureEngineRunning.mockRejectedValue(new Error("Failed"));
  await expect(engine.init()).rejects.toThrow("Failed to initialize Stockfish");
});
```

## What's Not Yet Tested

The following would benefit from additional integration or E2E testing:

- **EngineRouter** — Multi-engine lifecycle management and switching
- **Engine Discovery Integration** — Real filesystem lookups (would require temp files)
- **Electron Main Process** — IPC handlers and subprocess spawning
- **React Components** — SettingsPanel engine selection UI (would require React Testing Library)
- **UCI Protocol** — Real engine communication (would require engine binaries)

## Adding New Tests

When adding new engine functionality:

1. Add unit tests alongside the code file (e.g., `MyFeature.test.js`)
2. Mock external dependencies (Electron IPC, filesystem, etc.)
3. Test both happy paths and error cases
4. Verify error messages include context (engine name, operation)
5. Update this guide if introducing new testing patterns

## Common Jest Matchers

- `expect(value).toBe(expected)` — Exact equality
- `expect(fn).toHaveBeenCalled()` — Function was called
- `expect(fn).toHaveBeenCalledWith(args)` — Called with specific args
- `expect(promise).rejects.toThrow()` — Async rejection
- `expect(promise).resolves.toEqual(value)` — Async resolution

See [Jest documentation](https://jestjs.io/docs/expect) for full matcher reference.
