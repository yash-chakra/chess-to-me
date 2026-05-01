# engine-selection Specification

## Purpose
TBD - created by archiving change migrate-stockfish-to-lc0. Update Purpose after archive.
## Requirements
### Requirement: Discover and cache installed chess engines
The system SHALL automatically discover both Stockfish and LC0 engines on the user's system during app startup, cache their paths, and make the discovery available for subsequent launches without rescanning.

#### Scenario: Engine discovery on first launch
- **WHEN** the application starts and scans for installed engines
- **THEN** the system discovers Stockfish and/or LC0 (whichever are installed), stores their paths in cache, and makes them available for selection

#### Scenario: Use cached engine paths on subsequent launch
- **WHEN** the application starts on subsequent launches
- **THEN** the system loads cached engine paths without rescanning the filesystem

### Requirement: Display engine selection dropdown
The system SHALL display a dropdown menu in the settings panel allowing users to select which chess engine to use for analysis (Stockfish or LC0).

#### Scenario: Select engine from dropdown
- **WHEN** user opens the settings panel and views the engine selection dropdown
- **THEN** user sees available engines (Stockfish, LC0) with their discovery status, and can select their preferred engine

### Requirement: Default to LC0 if available
The system SHALL default the selected engine to LC0 if it is installed. If only Stockfish is found, default to Stockfish. If neither is found, inform the user to install an engine.

#### Scenario: LC0 and Stockfish both available
- **WHEN** the application detects both LC0 and Stockfish are installed
- **THEN** the system selects LC0 by default in the engine dropdown

#### Scenario: Only Stockfish available
- **WHEN** the application detects only Stockfish is installed
- **THEN** the system selects Stockfish by default and locks the dropdown to prevent switching

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

### Requirement: Validate cached engine paths
The system SHALL verify that cached engine paths are still valid on app startup. If a cached engine path no longer exists, the system SHALL mark it as unavailable and prompt the user to reconfigure.

#### Scenario: Engine uninstalled after caching
- **WHEN** a user uninstalls an engine after it was cached, and the app restarts
- **THEN** the system detects the missing engine, removes it from the cache, and shows it as unavailable in settings

### Requirement: Allow manual engine path configuration
The system SHALL allow users to manually specify custom engine paths for both Stockfish and LC0 in the settings, overriding the automatic discovery.

#### Scenario: Set custom engine path
- **WHEN** user clicks to set a custom path for an engine and selects a file
- **THEN** the system validates it is a valid engine executable and stores the custom path

