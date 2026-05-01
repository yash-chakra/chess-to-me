## 1. Update SettingsPanel Component Logic

- [x] 1.1 Add visibility check for auto-detected engines: `const selectedEngineFound = availableEngines?.some(engine => engine.name === selectedEngine && engine.status === "installed")`
- [x] 1.2 Update helper text to show "✓ Auto-detected at {path}" for found engines and "{engine name} not configured" for non-found engines
- [x] 1.3 Verify availableEngines prop is passed from App.jsx to SettingsPanel with correct status values

## 2. Conditionally Render Path Configuration

- [x] 2.1 Wrap the path TextField (line 97-103) in conditional: `{!selectedEngineFound && <TextField ... />}`
- [x] 2.2 Wrap the auto-detect and browse Buttons (line 104-111) in the same conditional
- [x] 2.3 Verify both controls are hidden/shown together as a unit

## 3. Helper Text Updates

- [x] 3.1 Replace the static helper text (line 90-94) with conditional logic:
  - If selectedEngineFound: show success variant with "✓ Auto-detected at {path}"
  - If not found: show text.secondary variant with "not configured"
- [x] 3.2 Ensure helper text updates when selectedEngine changes

## 4. Testing and Verification

- [x] 4.1 Test with auto-detected Stockfish: verify path controls are hidden, helper shows auto-detected status
- [x] 4.2 Test with non-detected LC0: verify path controls are visible, helper shows "not configured"
- [x] 4.3 Test engine switching: verify controls hide/show as you switch between detected and non-detected engines
- [x] 4.4 Test with no engines detected: verify controls are visible for whichever engine is selected
- [x] 4.5 Verify behavior on app restart: settings persist correctly
