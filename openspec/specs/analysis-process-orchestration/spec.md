# analysis-process-orchestration Specification

## Purpose
TBD - created by archiving change integrate-ollama-stockfish-logs. Update Purpose after archive.
## Requirements
### Requirement: Ollama serve runs as an internal daemon
The application SHALL launch `ollama serve` as a child process when the renderer starts and keep it alive as a non-terminating daemon so the binary does not need manual starts.

#### Scenario: App startup
- **WHEN** the renderer initializes in development or production
- **THEN** it spawns `ollama serve` via `child_process.spawn`, monitors its lifecycle, and restarts or surfaces an error if the daemon exits unexpectedly

### Requirement: Ollama run loads qwen3:8b by default
After `ollama serve` is active, the renderer SHALL execute `ollama run qwen3:8b` in a separate child process so the qwen3:8b model is primed and ready under the new logs tab.

#### Scenario: Renderer finishes bootstrapping
- **WHEN** the process manager detects `ollama serve` is listening
- **THEN** it spawns `ollama run qwen3:8b` in its own child process and streams the stdout/stderr to the log buffer for the Ollama tab

### Requirement: Stockfish starts inside the application
The renderer SHALL start Stockfish as a child process instead of relying on external workers, capturing its stdout/stderr for the log view and ensuring it stops when the app quits.

#### Scenario: Analysis session begins
- **WHEN** the user opens the analysis page
- **THEN** the app spawns the Stockfish binary as a child process, listens for PV output, and feeds logs into the Stockfish tab without leaving dangling processes when the window closes

### Requirement: User-selected Ollama model restarts `ollama run`
Settings SHALL include a dropdown of available Ollama models, and changing the selection SHALL terminate the current `ollama run` process (if running) and start `ollama run <model>` so the new model becomes active.

#### Scenario: User picks a different model
- **WHEN** the dropdown value changes to another supported model
- **THEN** the manager kills the existing `ollama run` subprocess, invokes `ollama run <new-model>` in a fresh child process, and displays the new process output in the Ollama log tab

### Requirement: Ollama logs are captured for every child process
Every time an `ollama run <model>` subprocess starts, the renderer SHALL collect both stdout and stderr, tagging entries with the active model so the logs tab can present the correct trace for each selection.

#### Scenario: Model command emits output
- **WHEN** the newly spawned `ollama run` prints lines during initialization or inference
- **THEN** those lines appear under the Ollama tab in chronological order and mention the model name so users know which run produced them

