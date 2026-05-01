# engine-selection Specification (Delta)

## MODIFIED Requirements

### Requirement: Display engine installation status
The system SHALL show the installation status of each engine (found/not installed) in the settings panel, helping users understand what engines are available. Path configuration controls (textbox, auto-detect button, browse button) SHALL be hidden for auto-detected engines and visible only when an engine is not found.

#### Scenario: View engine status for auto-detected engine
- **WHEN** user views the engine selection UI and an engine is auto-detected (status: "installed")
- **THEN** engine displays with installation status, path configuration controls are hidden, and helper text shows "✓ Auto-detected at {path}"

#### Scenario: View engine status for non-detected engine
- **WHEN** user views the engine selection UI and an engine is not found (not in availableEngines)
- **THEN** engine displays as "Not found", path textbox and configuration buttons are visible, and helper text shows "{engine name} not configured"

#### Scenario: Select non-detected engine to configure
- **WHEN** user selects an engine that was not auto-detected
- **THEN** path configuration controls become visible, allowing manual path entry via textbox, auto-detect, or browse buttons
