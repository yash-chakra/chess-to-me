## Context

Stockfish currently writes lines directly into the chat area with verbose prefixes (e.g., “Line 1, CP -27”), raw move data, and additional analysis text. The board and chat operate independently—clicking or hovering over an analysis line does nothing beyond keeping a text log—and the only way to feed positions is by typing FEN manually. We need to keep the board fixed, host all interactions inside the chat text box, and treat Stockfish output as actionable move data while also enabling richer inputs (FEN/PGN or uploads) without blocking UI updates.

## Goals / Non-Goals

**Goals:**

- Replace the raw Stockfish text log with a parser that understands “from-to” coordinate pairs, filters out noise (Line/CP prefixes), and renders each line as a selectable row with a play icon and optional expanded detail.
- Keep the chess board anchored inside the left pane, calculate its size relative to the window (60-70% width), and respond to parsed move sequences without pushing other UI elements.
- Provide a unified FEN/PGN popup that accepts typed data or file uploads, reuses chess.js for parsing, and feeds the resulting sequence of positions into the board (and chat) without additional panels.

**Non-Goals:**

- Reintroducing separate analysis panels outside the chat area or recreating the old status bar space.
- Supporting legacy analysis formats beyond Stockfish/PGN/FEN.

## Decisions

1. **Parsing Strategy:** Feed each Stockfish line into a lightweight parser that scans for coordinate pairs (two-character tokens like `e2e4`). Ignore prefixes like “Line N” or “CP”. Each “from-to” pair will become a move object that can be serialized and shoveled to the board via chess.js. Display each parsed line inside the chat panel with a small play icon (e.g., `PlayArrow`). Clicking the icon or row expands an inline panel showing the raw text but does not open a modal; hitting `Escape` or clicking elsewhere collapses it.

2. **chess.js Integration:** Instantiate `new Chess()` in the parser’s controller. For a FEN input, call `load(fen)` and push the resulting FEN onto an array. When importing a PGN, call `load_pgn(pgn)` and iterate over `history()` or store FEN snapshots via `fen()` after each move. Use this library both for parsing user inputs (FEN/PGN/file upload) and for applying Stockfish move sequences (each move pair is `move({ from, to })`).

3. **UI Flow:** The chat text box remains the hub for inputs. When Stockfish data arrives, the parser writes structured entries into the chat list (replacing “analysis results” panel). The FEN/PGN popup is triggered by the `+` button below the board (left pane). The popup supports typed text (textarea) plus a file input; on change it reads the file (using `FileReader`/`fs` on Electron) and feeds the text to chess.js. Parsed positions update the board immediately without shifting layout. If the user clicks a line or icon, the board replays the sequence from the last stored position.

4. **Responsive Layout:** Wrap the board in a container that monitors `window.innerWidth`/`innerHeight`, recalculates target board size (60-70% of width, leaving padding), and caps the height so pieces aren’t clipped. The board is padded by 5 pixels on all sides and sits inside the left column (70% width of total). Use CSS flex layouts to ensure the chat pane (right column) fills remaining width with an 80/20 height split between chat history and input box.

## Risks / Trade-offs

- [Parsing errors] → Stockfish notation may include variations (e.g., `Nf3`, castles). Mitigate by trying `chess.js.move()` fallback and logging unhandled tokens for later review.
- [Resizable layout] → Automatically resizing the board can clip pieces or misalign overlays. Mitigate by recalculating on `resize`/`orientationchange` and locking minimum size (e.g., 50% width) while keeping board padding.
- [File uploads] → Parsing large PGNs may block UI. Mitigate by reading files asynchronously and showing a loading indicator inside the popup.

## Migration Plan

- Stage 1: Add `chess.js` dependency and helper utilities for parsing Stockfish lines, keeping old chat fallback disabled until parser is verified.
- Stage 2: Implement the responsive split layout, board padding, and `+` button before wiring the popup so the board remains stable.
- Stage 3: Build the popup (textarea + file upload), hook into the board and chat lifecycle to replay parsed positions, and test with sample PGNs.

## Open Questions

- Should we store parsed Stockfish move sequences in a shared state (e.g., Context or Redux) so both the chat list and board can replay them, or is the chat component alone enough?
- Do we need to support PGN variations (comments or nested annotations) when parsing files, or can we reject them with a user-friendly message?
