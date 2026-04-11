## Why

Stockfish lines are currently surfacing as raw text inside the chat panel even though the board state is already rendered elsewhere, so it is hard to act on a sequence of moves or reuse them for navigation. At the same time, analysis input is limited to manual FEN typing and it is difficult to reuse PGN/game inputs. Bringing a structured parser and unified import flow will make analysis results actionable and expand how analysts feed positions into the UI.

## What Changes

- Build a parser/formatter that understands Stockfish's move notation (location pairs) so every line becomes a structured move sequence with icons and play buttons; clicking an entry expands the full line without a modal while keeping focus inside the chat area.
- Create a FEN/PGN input popup that accepts text or file uploads, leverages chess.js to parse each position, and feeds those positions into chessboard.js so the board can step through historic states.
- Update the chat panel to reuse the parsed analysis, render only the cleaned move lines, and eliminate any redundant analysis controls; leave all interactions inside the chat text box.

## Capabilities

### New Capabilities
- `stockfish-notation-parser`: Understand Stockfish output, drop verbose fields like "Line 1, CP -27," split every move pair into "from-to" tokens, and render each line as a row with a play icon and an inline expandable detail panel.
- `fen-pgn-importer`: Provide a compact popup that accepts FEN or PGN text, offers a file picker for `.fen`/`.pgn` uploads, uses chess.js to parse the data into an array of FEN strings, and wires those positions into the chessboard display (starting position plus parsed moves).

### Modified Capabilities
- None.

## Impact

- UI components: `src/components/ChatPanel.jsx`, `src/components/AnalysisBoard.jsx`, any shared layout wrappers.
- New dependencies: `chess.js` (for parsing FEN/PGN) and possibly updates to how analysis data is structured.
- UX flow: chat panel plus popup interactions; board display must stay fixed and respond to parsed input without jumping content.
