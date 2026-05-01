const electronAPI = typeof window !== "undefined" ? window.electronAPI : null;

export async function discoverEngines() {
  if (!electronAPI?.discoverEngines) {
    console.warn("Engine discovery API unavailable");
    return { stockfish: null, lc0: null };
  }

  try {
    const result = await electronAPI.discoverEngines();
    return {
      stockfish: result?.stockfish || null,
      lc0: result?.lc0 || null
    };
  } catch (err) {
    console.error(`Engine discovery failed: ${err.message}`);
    return { stockfish: null, lc0: null };
  }
}

export async function detectEngine(engineName) {
  if (!electronAPI?.detectEngine) {
    return null;
  }

  try {
    const result = await electronAPI.detectEngine({ engine: engineName });
    return result?.path || null;
  } catch (err) {
    console.error(`Detection of ${engineName} failed: ${err.message}`);
    return null;
  }
}

export async function validateEnginePath(engineName, path) {
  if (!electronAPI?.validateEngine) {
    return false;
  }

  try {
    const result = await electronAPI.validateEngine({ engine: engineName, path });
    return result?.valid === true;
  } catch (err) {
    console.error(`Validation of ${engineName} at ${path} failed: ${err.message}`);
    return false;
  }
}

export function getDefaultEngine(discoveredEngines) {
  if (discoveredEngines?.lc0) {
    return "lc0";
  }
  if (discoveredEngines?.stockfish) {
    return "stockfish";
  }
  return null;
}

export function getAvailableEngines(discoveredEngines) {
  const available = [];
  if (discoveredEngines?.stockfish) {
    available.push({
      name: "stockfish",
      path: discoveredEngines.stockfish,
      status: "installed"
    });
  }
  if (discoveredEngines?.lc0) {
    available.push({
      name: "lc0",
      path: discoveredEngines.lc0,
      status: "installed"
    });
  }
  return available;
}
