## ADDED Requirements

### Requirement: Offer dual-mode FEN/PGN input within popup
The system SHALL present a popup that can be opened by the `+` button below the board and contains (a) a textarea for pasting FEN or PGN text and (b) a file input or "Browse" button for selecting `.fen` or `.pgn` files. The popup SHALL remain within the left pane and not spawn new panels beneath the board.

#### Scenario: Opening the popup
- **WHEN** the user clicks the `+` button below the chessboard
- **THEN** the popup appears above the button, centered within the left pane, showing both the textarea and the file selector without altering the board placement.

### Requirement: Use chess.js to parse and emit position sequences
Upon receiving text or uploaded files, the popup SHALL call `chess.js` to parse either a single FEN or a PGN; for PGNs the system SHALL record the FEN after each half-move so the resulting array can power board replay. Valid input SHALL immediately update the board to the final position while storing the entire sequence for later navigation.

#### Scenario: Parsing a PGN file
- **WHEN** the user uploads a PGN whose moves cover ten ply
- **THEN** chess.js returns the position history, the board jumps to the last position, and the stored FEN array contains 10+ entries representing each move.

### Requirement: Handle invalid input gracefully
If the textarea or file contains invalid FEN/PGN text, the popup SHALL show an inline validation message, leave the board unchanged, and keep focus inside the popup until corrected. The user SHALL be able to re-submit after editing the input.

#### Scenario: User submits corrupted FEN
- **WHEN** the user pastes `invalid fen string` and presses the submit action
- **THEN** the popup displays "Unable to parse input; please check your FEN/PGN," the board retains its current position, and the popup stays open for corrections.
