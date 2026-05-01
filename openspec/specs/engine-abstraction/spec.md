# engine-abstraction Specification

## Purpose
TBD - created by archiving change migrate-stockfish-to-lc0. Update Purpose after archive.
## Requirements
### Requirement: Define unified engine interface
The system SHALL define a unified interface (abstract class or protocol) that both Stockfish and LC0 engines implement, enabling consistent engine interaction regardless of the underlying implementation.

#### Scenario: Switch engines without changing caller code
- **WHEN** the application switches from Stockfish to LC0 engine
- **THEN** the caller code does not need to change because both engines implement the same interface

### Requirement: Implement Stockfish engine class
The system SHALL refactor existing Stockfish engine handling into a dedicated StockfishEngine class that implements the unified engine interface, preserving existing functionality.

#### Scenario: Use refactored Stockfish engine
- **WHEN** user selects Stockfish as the active engine
- **THEN** the StockfishEngine class initializes and handles analysis the same way as the original code

### Requirement: Implement LC0 engine class
The system SHALL implement an LC0Engine class that implements the unified engine interface, following official LC0 documentation for engine communication and output parsing.

#### Scenario: Initialize LC0 engine
- **WHEN** user selects LC0 as the active engine
- **THEN** the LC0Engine class initializes the LC0 executable and establishes communication per official documentation

#### Scenario: Receive LC0 analysis output
- **WHEN** LC0 produces analysis output
- **THEN** the LC0Engine class parses the output and provides results in the same format as StockfishEngine

### Requirement: Engine router/selector
The system SHALL implement a router component that instantiates the correct engine class based on user settings and manages engine lifecycle (initialization, analysis, shutdown).

#### Scenario: Route to selected engine
- **WHEN** the user initiates an analysis request
- **THEN** the router checks the selected engine setting and uses the appropriate engine class

### Requirement: Handle engine lifecycle
The system SHALL properly initialize engines on selection and clean up resources when switching engines or closing the application.

#### Scenario: Switch engines during analysis
- **WHEN** user switches from Stockfish to LC0 while analysis is running
- **THEN** the system cleanly stops the current engine, releases its resources, initializes the new engine, and restarts analysis on the current position

