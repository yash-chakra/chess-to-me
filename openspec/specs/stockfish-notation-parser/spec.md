## ADDED Requirements

### Requirement: Parse Stockfish notation into structured moves
The system SHALL parse every Stockfish line by stripping prefixes like "Line N," "CP xx," or trailing comments and producing an ordered array of move objects where each object contains `from` and `to` coordinates derived from two-character tokens (e.g., `e2e4` -> `from: e2`, `to: e4`). Tokens without clear coordinate syntax SHALL be dropped and logged for diagnostics.

#### Scenario: Stockfish line with noise and two move pairs
- **WHEN** Stockfish emits `Line 1, CP -27 e2e4 e7e5`
- **THEN** the parser outputs `[ {from: e2, to: e4}, {from: e7, to: e5} ]` and records the cleaned move list in the chat panel.

### Requirement: Render parsed lines with inline playback controls
Each parsed Stockfish entry SHALL render as a chat row containing a small play icon (e.g., Material UI `PlayArrow`). Clicking the row or icon SHALL expand an inline panel showing the full raw line text, without opening a modal or overlay outside the chat area, and a subsequent press of the `Escape` key or a click outside the panel SHALL collapse it.

#### Scenario: Play icon interaction
- **WHEN** the user clicks the play icon on a Stockfish row
- **THEN** the expanded inline panel appears below that row showing the raw text and the board replays the move sequence without altering the rest of the layout; pressing `Escape` closes the panel.

### Requirement: Keep the board fixed while showing analysis
Parsed Stockfish entries SHALL not trigger layout shifts that move the board; instead, the chat pane shall scroll internally while the board and its 5px padded container remain anchored to the left column (70% width of the window). The chat list SHALL display a vertical scroll bar once content exceeds its height instead of expanding the page.

#### Scenario: Large analysis stream
- **WHEN** Stockfish emits many lines such that the chat history exceeds the visible height
- **THEN** only the chat pane scrolls, the board position stays unchanged, and no new panels appear outside the chat container.
