/**
 * Type definitions for Electron API exposed via preload.js
 * This file imports from src/types/index.ts to maintain a single source of truth.
 */

import type { ElectronAPI } from "./types";

declare global {
  interface Window {
    /**
     * Electron API exposed via contextBridge in preload.js
     * Provides IPC access to the main process functionality:
     * - Engine detection and configuration (Stockfish, LC0)
     * - Analysis queries
     * - Settings management
     * - LLM (Ollama) chat operations
     * - System status monitoring
     */
    electronAPI: ElectronAPI;
  }
}

export {};
