## Why

The analysis workspace currently mixes the board, chat, and analysis controls without a clear place to monitor backend activity, and neither Ollama nor Stockfish are managed by the app itself. As we add more orchestration around LLM workflows, the UI and runtime need better coordination so users can track logs while ensuring the engines always start with predictable settings.

## What Changes

- Launch Ollama and Stockfish as child processes inside the application so their lifecycles, defaults, and log collectors stay in the renderer's control.
- Surface a dedicated logs tab with navigation buttons so users can inspect both Stockfish and Ollama outputs without leaving the analysis context.
- Align the chat panel height with the chessboard and add model-selection controls in settings so the UI reflects analysis state and drives the LLM configuration.

## Capabilities

### New Capabilities
- `analysis-ui-height-and-logs`: Details the UI layout, navigation buttons, and tabbed log view that keep the chat/analysis panes aligned with the board and expose Stockfish/Ollama logs with a back link to analysis.
- `analysis-process-orchestration`: Defines how the app launches `ollama serve`, runs `ollama run <model>` per selection, keeps qwen3:8b as the default model, and starts Stockfish as a child process while wiring its logs to the shared view.

### Modified Capabilities
- _None_

## Impact

- `src/ui/analysis/*`: need adjustments to match chat height with the board, add the logs tab, and new navigation buttons with corresponding Blueprint styling.
- `src/ui/settings`: add the new Ollama model dropdown and hook selections into the process manager for restarting `ollama run <model>`.
- Process orchestration layer (new module under `src/process/` or similar) must start/monitor `ollama serve`, restart model runs, and manage Stockfish, including capturing stdout/stderr for the log tab.
- Build/start scripts may need updates to ensure these background processes run inside the packaged app rather than assuming external daemons.
