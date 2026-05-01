# lc0-engine-integration Specification

## Purpose
TBD - created by archiving change migrate-stockfish-to-lc0. Update Purpose after archive.
## Requirements
### Requirement: Discover LC0 engine on system
The system SHALL search for LC0 executable in common installation paths on the user's system (Windows, macOS, Linux) and detect available versions. If LC0 is not found in standard locations, the system SHALL allow users to manually specify the LC0 engine path in settings.

#### Scenario: LC0 found in standard location
- **WHEN** the application starts and scans common LC0 paths (e.g., C:\Program Files\Leela Chess Zero\lc0.exe on Windows)
- **THEN** the application successfully detects LC0 and enables analysis features

#### Scenario: LC0 not found, user provides manual path
- **WHEN** the application cannot find LC0 in standard paths and user enters a custom path in settings
- **THEN** the application verifies the path points to a valid LC0 executable and uses it for analysis

### Requirement: Configure LC0 engine parameters
The system SHALL allow users to configure LC0-specific parameters (such as number of threads, batch size, or backend selection) through the settings panel. Configuration changes SHALL take effect on the next analysis session.

#### Scenario: User adjusts LC0 threads
- **WHEN** user opens settings and modifies the LC0 thread count value
- **THEN** the new thread count is saved and used by LC0 on subsequent analysis runs

### Requirement: Use LC0 for position analysis
The system SHALL send chess positions from the board to the LC0 engine and display the analysis results (evaluation, best moves, principal variation) in the analysis panel.

#### Scenario: Analyze current board position
- **WHEN** a chess position is displayed on the board and LC0 is configured
- **THEN** the system sends the position to LC0 and displays the engine's evaluation and suggested best moves

### Requirement: Handle LC0 unavailability gracefully
The system SHALL display a clear error or informational message to the user if LC0 is not installed or becomes unavailable during analysis, without crashing or freezing the application.

#### Scenario: LC0 not installed
- **WHEN** user attempts to analyze a position but LC0 is not installed on their system
- **THEN** the system displays a message explaining that LC0 is required and provides installation guidance

