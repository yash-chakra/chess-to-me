## Why

Users selecting an auto-detected engine (Stockfish or LC0) don't need to manually configure a path—the engine is already found and ready to use. Currently, the path textbox and configuration buttons are always visible, creating unnecessary UI clutter. Hiding these controls for auto-detected engines reduces cognitive load and makes the UX flow clearer: "found → use it" vs. "not found → help us locate it."

## What Changes

- Path textbox, auto-detect button, and browse button are now **hidden** when the selected engine is auto-detected (status: "installed")
- Path configuration controls are **visible** only when an engine is selected but not found, prompting manual path entry
- Helper text below the engine dropdown changes from generic status to clearly indicate auto-detection status with the path location

## Capabilities

### New Capabilities
- `conditional-engine-configuration`: Engine path configuration UI that conditionally shows based on auto-detection status

### Modified Capabilities
- `engine-selection`: Modified to support conditional visibility of path configuration controls based on detected engine status

## Impact

- Affected code: `src/components/SettingsPanel.jsx`, `src/App.jsx` (minimal changes to how availableEngines is passed)
- UX: Cleaner, progressive disclosure of configuration options
- No breaking changes; improves settings flow for both new and existing users
