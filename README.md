# Chess To Me (Electron + Dual Chess Engines)

Desktop chess analysis platform running locally installed chess engines (Stockfish or LC0) with AI explanations:

- **Dual engine support**: Choose between Stockfish (traditional eval-based) or LC0 (neural network-based)
- Auto-detect engines from standard installation paths or browse manually
- Paste a FEN and load board position instantly
- Drag pieces on a standard black/white chessboard
- Analyze current position with up to 4 engine PV lines (best line first)
- Configurable analysis depth (6-30)
- Generate per-line natural-language explanations in user-selected language using local Ollama
- Select a line and step forward/backward through the line on the board
- View line moves in figurine-style chess notation (piece symbols)

## Quick Start

1. **Install dependencies**:

```bash
npm install
```

2. **Install a chess engine** (choose one or both):

   - **Stockfish**: Download from https://stockfishchess.org/download/
   - **LC0 (Leela Chess Zero)**: Download from https://github.com/LCZero/lc0/releases
     - LC0 requires neural network weights (~800MB) — see [LC0_SETUP.md](LC0_SETUP.md) for details

3. **Run development mode**:

```bash
npm run dev
```

4. **Configure engine on first launch**:

   - Settings panel opens automatically
   - Select engine (Stockfish or LC0)
   - Click "Auto-detect" or "Browse" to locate the executable
   - Adjust analysis depth (6-30, default 16)
   - Click "Go to analysis"

5. **For AI explanations** (optional):

   Make sure Ollama is running and a model is pulled:

   ```bash
   ollama pull qwen3
   ollama serve
   ```

   Configure the LLM model and base URL in Settings.

## Project Structure

- `electron/main.js`: app window + IPC + dual engine process manager
- `electron/preload.js`: secure renderer bridge API
- `src/App.jsx`: React UI orchestrating settings, analysis, logs, and modular panels
- `src/components/`: Material UI panels (`SettingsPanel`, `AnalysisBoard`, `ChatPanel`, `StatusBanner`)
- `src/utils/ChessEngine.js`: Abstract base class defining engine interface
- `src/utils/StockfishEngine.js`: Stockfish implementation
- `src/utils/LC0Engine.js`: LC0 implementation
- `src/utils/engineDiscovery.js`: Cross-platform engine detection and validation
- `src/theme.js`: shared Material UI theme
- `src/styles.css`: responsive layout styles
- `vite.config.js`: renderer bundler config

## Notes

- This starter runs everything locally; no cloud engine is required.
- Engine path is persisted with `electron-store`.
- UI fonts and icons are bundled locally via npm (`@fontsource/*`, `@fortawesome/fontawesome-free`) with no CDN dependency.
- Styling relies on Material UI components and the shared theme in `src/theme.js`, so there is no Blueprint dependency and the renderer reuses modular panels for the analysis canvas.

## OpenSpec workflow

- This project now lives in OpenSpec: see `openspec/specs/chess-trainer/spec.md` for the current scope and guarantees.
- Run `openspec list --json` (or `openspec list`) to view the active change and its status; the onboarding change is recorded under `openspec/changes/convert-to-openspec`.
- Because the BMAD skills have been removed, contributors should use the spec/change files above to understand requirements before editing application code.

## Windows Installer (Open Source)

This project now includes `electron-builder` (NSIS target) as the installer maker.

1. Prepare bundled assets:

```powershell
# Example: download Ollama setup and copy Stockfish executable
npm run prepare:installer-assets -- -DownloadOllama -StockfishExePath "C:\path\to\stockfish.exe"
```

2. Optional: include local qwen3 payload from your Ollama models directory:

```powershell
npm run prepare:installer-assets -- -IncludeQwen3FromLocalOllama
```

3. Build installer:

```bash
npm run dist:win
```

Installer output is written to `release/`.

### NSIS Tooling Note

- `.nsh` is an include/macro file and is not run directly.
- It is consumed by NSIS (`makensis`) when building an `.nsi` script.
- Local NSIS binary is available in this repo at `tools/nsis/`.
- Check install with:

```bash
npm run nsis:version
```


