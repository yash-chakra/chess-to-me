## Context

The SettingsPanel component currently always displays the engine path configuration controls (textbox, auto-detect button, browse button) regardless of whether the selected engine was auto-detected. This creates UI clutter for users who have an engine already found and ready to use. The availableEngines list contains engines with status "installed" (auto-detected) or "not found" (not auto-detected).

## Goals / Non-Goals

**Goals:**
- Hide path configuration controls when selected engine is auto-detected (has status: "installed" in availableEngines)
- Show path configuration controls only when selected engine is not found
- Update helper text to clearly indicate auto-detection status and show the detected path location

**Non-Goals:**
- Change how engine discovery works
- Modify the availableEngines data structure
- Add new engine detection logic
- Support overriding auto-detected paths (users can only use detected paths or manually configure new ones)

## Decisions

**Decision 1: Visibility Check Logic**
- **Choice**: Check if `selectedEngine` exists in `availableEngines` with status "installed"
- **Rationale**: availableEngines already contains the authoritative list of discovered engines. This check is simple, performant, and requires no additional state.
- **Alternative**: Create a separate `isEngineDetected` prop passed from App.jsx. Rejected because it adds unnecessary indirection; the information is already available in availableEngines.

**Decision 2: Helper Text Update**
- **Choice**: Show "✓ Auto-detected at {path}" when engine is found, "not configured" when not found
- **Rationale**: Gives users clear feedback about detection status and shows where the engine is located. The checkmark provides visual confirmation.
- **Alternative**: Just hide all helper text for detected engines. Rejected because users lose visibility into where the engine is actually located.

**Decision 3: Conditional Rendering Location**
- **Choice**: Wrap TextField and Button Stack in a single conditional in SettingsPanel
- **Rationale**: Keeps related UI elements (input + action buttons) together; minimal changes to component structure
- **Alternative**: Create separate sub-component for path configuration. Rejected as over-engineering for this simple toggle.

## Risks / Trade-offs

**[Risk] User wants to override auto-detected path**
→ *Mitigation*: This is out of scope for v1. Path override can be added later if needed (would require a "manual configure" option). Currently, if auto-detection finds the wrong path, user must use a different engine or uninstall the detected one and manually configure.

**[Risk] Helper text visibility** 
→ *Mitigation*: Helper text remains visible at all times (either success state or "not configured"), so users always know the current status.

**[Trade-off] Simpler logic vs. flexibility**
→ *Reasoning*: This design prioritizes simplicity (check availableEngines) over flexibility (override paths). This matches the "auto-detect when possible" philosophy of the app.

## Migration Plan

No migration needed. This is a pure UI improvement with no data model changes:
1. Deploy updated SettingsPanel component
2. Existing settings persist unchanged
3. Existing users with configured engines see improvement immediately (path controls hide if engine is detected)
4. Rollback: revert SettingsPanel to previous version

## Open Questions

None. Implementation is straightforward conditional rendering.
