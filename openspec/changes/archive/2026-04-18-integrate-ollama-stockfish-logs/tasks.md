## 1. Process Supervision

- [x] 1.1 Implement a process manager that spawns `ollama serve` as a persistent child process and restarts or surfaces errors if it exits unexpectedly.
- [x] 1.2 Extend the manager to run `ollama run <model>` subprocesses (default `qwen3:8b`), capture stdout/stderr, and kill the previous run before starting a new one when requested.
- [x] 1.3 Add Stockfish as a child process under the same manager so its stdout/stderr are streamed into the shared log buffer.

## 2. Logs UI and Layout

- [x] 2.1 Build the logs tab that renders Stockfish and Ollama streams in separate tabs, including a logs icon button to open it and a back icon button to return to the analysis layout.
- [x] 2.2 Adjust the chat panel/chessboard layout so the chat card height tracks the chessboard card, keeping the viewport free of global scrollbars even when toggling the logs tab.

## 3. Settings Integration

- [x] 3.1 Add an Ollama model dropdown in the settings page with `qwen3:8b` selected by default and trigger the process manager to restart the current `ollama run` when the selection changes.
- [x] 3.2 Ensure the logs icon button and back button update the navigation state consistently and that the active logs tab shows the outputs from the currently running child processes.
