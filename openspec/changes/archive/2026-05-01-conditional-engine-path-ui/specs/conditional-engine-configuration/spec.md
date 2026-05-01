# Conditional Engine Configuration

Engine path configuration controls (textbox and action buttons) are shown only when needed, reducing UI clutter and clarifying the user's path to configuration.

## ADDED Requirements

### Requirement: Hide path configuration for auto-detected engines
The settings panel SHALL hide the engine path textbox, auto-detect button, and browse button when the selected engine has been auto-detected (status: "installed" in the availableEngines list).

#### Scenario: User selects auto-detected Stockfish
- **WHEN** user opens Settings and Stockfish is in availableEngines with status "installed"
- **THEN** path textbox and configuration buttons are hidden

#### Scenario: User selects engine not found
- **WHEN** user selects LC0 from the dropdown but LC0 is not in availableEngines
- **THEN** path textbox, auto-detect button, and browse button are visible and enabled

### Requirement: Display auto-detection status in helper text
The settings panel SHALL display helper text that indicates whether an engine was auto-detected and shows its location.

#### Scenario: Auto-detected engine
- **WHEN** selected engine is in availableEngines with status "installed"
- **THEN** helper text shows "✓ Auto-detected at {path}"

#### Scenario: Engine not found
- **WHEN** selected engine is not in availableEngines or has status "not found"
- **THEN** helper text shows "{engine name} not configured"

### Requirement: Conditional visibility based on engine status
The visibility of path configuration controls SHALL be determined by checking if the selectedEngine exists in availableEngines with status "installed".

#### Scenario: Checking visibility state
- **WHEN** selectedEngine = "stockfish" and availableEngines includes {name: "stockfish", status: "installed"}
- **THEN** controls are hidden, helper shows auto-detected status

#### Scenario: Checking visibility state for non-detected engine
- **WHEN** selectedEngine = "lc0" and availableEngines does not include LC0 or includes {name: "lc0", status: "not found"}
- **THEN** controls are visible, helper shows "not configured"
