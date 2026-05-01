# engine-configuration Specification

## Purpose
TBD - created by archiving change migrate-stockfish-to-lc0. Update Purpose after archive.
## Requirements
### Requirement: Display engine configuration interface
The system SHALL provide a settings panel section dedicated to engine configuration, displaying the currently selected engine (LC0), its status (installed/not installed), and options for configuring engine-specific parameters.

#### Scenario: Open engine settings
- **WHEN** user opens the settings panel
- **THEN** user sees an "Engine" section showing LC0 is selected, with fields for engine path and parameters

### Requirement: Manage engine path
The system SHALL allow users to view and modify the path to the LC0 executable. The system SHALL validate that the provided path points to a valid LC0 binary.

#### Scenario: Update engine path
- **WHEN** user clicks "Browse" or enters a new path in the engine path field
- **THEN** system verifies the file is a valid LC0 executable and saves the new path

### Requirement: Persist engine configuration
The system SHALL save all engine configuration settings (path, parameters) and restore them when the application restarts. Configuration changes SHALL not be lost between sessions.

#### Scenario: Restart with saved configuration
- **WHEN** user configures LC0 path and parameters, closes the application, then reopens it
- **THEN** the application loads the previously saved LC0 configuration and uses it for analysis

### Requirement: Validate engine availability
The system SHALL check that the configured LC0 engine is available and functional before attempting to analyze positions. If the engine becomes unavailable, the system SHALL notify the user.

#### Scenario: Engine path becomes invalid
- **WHEN** the LC0 executable is moved or deleted after configuration
- **THEN** the system detects this and displays a warning that the engine is unavailable, prompting the user to reconfigure

