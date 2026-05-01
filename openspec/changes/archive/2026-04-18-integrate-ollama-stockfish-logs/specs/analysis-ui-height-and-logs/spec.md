## ADDED Requirements

### Requirement: Chat panel height matches chessboard height
The renderer SHALL keep the chat panel container as tall as the chessboard card so that both panels move in lockstep and no uneven whitespace appears between them.

#### Scenario: Window is resized vertically
- **WHEN** the user resizes the main window taller or shorter
- **THEN** the chat panel height recomputes to match the chessboard height and the overall layout remains free of vertical scroll bars

#### Scenario: Board rerenders for new position
- **WHEN** the chessboard updates for a pasted FEN or new analysis session
- **THEN** the chat panel height adjusts along with the board so the two cards stay aligned

### Requirement: Logs view with icon navigation
The renderer SHALL add a logs tab that displays Stockfish and Ollama logs side-by-side and supply a logs icon button that opens the tab plus a back icon button that returns to the analysis view.

#### Scenario: Opening logs from analysis
- **WHEN** the user clicks the logs icon button on the analysis page
- **THEN** the UI replaces the analysis cards with the logs tab, shows two child tabs named "Stockfish" and "Ollama", and displays captured stdout/stderr for each engine

#### Scenario: Returning to analysis from logs
- **WHEN** the user clicks the back icon button inside the logs view
- **THEN** the renderer restores the analysis layout with the chat panel height still matched to the chessboard and the logs tab hides

#### Scenario: Logs tab displays fresh entries
- **WHEN** new lines appear on the Stockfish or Ollama streams
- **THEN** the corresponding tab content scrolls to show the most recent messages while the overall window layout stays stable so height alignment is preserved
