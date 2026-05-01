## Context

Currently the renderer shows the board, chat, and analysis area without a safe mechanism to observe what Stockfish or Ollama are doing. Both engines run outside the app and chat height is independent of the board, so users cannot keep both in sync or see logs easily. The request is to bundle the process control, logs, and UI navigation inside the same electron renderer so the analysis experience feels cohesive.

## Goals / Non-Goals

**Goals:**
- Launch and supervise Ollama (`ollama serve` + `ollama run <model>`) and Stockfish as child processes that live inside the application lifecycle.
- Provide a log-focused tab with navigation controls that lets users see Stockfish and Ollama output while keeping the chat panel height matched to the chessboard.
- Expose a dropdown in the settings page for selecting Ollama models, defaulting to `qwen3:8b`, and trigger the model reload whenever the selection changes.

**Non-Goals:**
- Rewrite the overall Blueprint-based layout or create a completely new chat component.
- Modify the underlying LLM prompts or Stockfish analysis policy—those remain the same as the existing `analysis-and-llm-guidance` spec.

## Decisions

1. **Dedicated process manager module:** Introduce a `processManager` (or similarly named service) that launches `ollama serve` as a persistent daemon and keeps it alive. When the app loads it starts `ollama serve`, and the manager exposes commands to spawn/kill `ollama run <model>` subprocesses as the UI selects models. The same module also starts Stockfish via `child_process.spawn` so stdout/stderr streams can feed the shared log buffer.
2. **Log collection and navigation:** Store the latest Stockfish and Ollama logs in a reactive store (e.g., `useState`/`useReducer` or context). The logs tab renders both streams in separate panels, and the footer toolbar includes an icon button that switches between analysis and logs, plus a back icon on the log page to return.
3. **UI height syncing:** Wrap the chat panel and board inside a flex container with `height: 100%` and use Blueprint cards so the chat card mirrors the board height (e.g., using `display: grid` with equal row heights or matching `element.getBoundingClientRect`). The logs tab can reuse the same layout, keeping the overall viewport scroll-free.
4. **Settings dropdown model control:** Add a dropdown field in settings populated with available Ollama models, defaulting to `qwen3:8b`. Changes dispatch an IPC event (or context action) that tells the process manager to restart `ollama run <model>`, ensuring the command runs in its own child process and logs are captured.

## Risks / Trade-offs

- [Process failures] ? If `ollama serve` or `ollama run` fails to start (missing binary, incompatible version), the UI must show a warning and avoid leaving orphaned processes. Mitigation: capture exit codes, display toast, and provide retry button.
- [Model switching latency] ? Restarting a model requires tearing down the previous `ollama run` process before starting the next one, which can take several seconds. Mitigation: show a loading indicator in settings/log tab and queue the next run until the previous exits cleanly.
- [UI synchronization] ? Matching heights via JS measurement may drift if the board resizes after load. Mitigation: recalculate heights on resize and use CSS flex basis rather than hard-coded values.

## Migration Plan

1. Develop the process manager module and wire it to the renderer lifecycle tests to confirm child processes start/stop during hot reload.
2. Build the logs tab UI and navigation buttons, ensuring it toggles without full route changes.
3. Add the settings dropdown and hook it into the manager so `ollama run` restarts when the user selects a new model.
4. Verify default `qwen3:8b` run, logs capture, and height alignment across desktop screen sizes.
5. Ship along with an updated README entry describing the new child-process requirements (e.g., `ollama` binary in PATH).

## Open Questions

1. Should model selection persist across sessions (e.g., via localStorage) or reset to `qwen3:8b` every launch?
2. Do we need to monitor for `ollama serve` restarts if it crashes, or is manual restart acceptable for now?
3. What set of Ollama models should the dropdown expose beyond `qwen3:8b`?
