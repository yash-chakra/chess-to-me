## 1. Parser + Board Integration

- [x] 1.1 Add `chess.js` to dependencies and encode a helper that can parse Stockfish lines into cleaned `from`/`to` pairs while ignoring noise.
- [x] 1.2 Build the chat row renderer that creates play icons, supports inline expansion of the raw line, and keeps the board anchored on the left while the chat column scrolls internally.
- [x] 1.3 Resize the left pane board to cover ~60% of the available width, apply 5px padding, and recompute dimensions on window resize so the top (black pieces) are never clipped.

## 2. FEN/PGN Importer Flow

- [x] 2.1 Add the popup that opens from the `+` button under the board, hosts a textarea plus a file picker, and stays within the left column without adding bottom panels.
- [x] 2.2 Parse pasted/uploaded FEN or PGN using `chess.js`, derive the position history, feed it to the board, and keep a stored sequence for future replay.
- [x] 2.3 Validate input and show inline errors while keeping the popup focused; ensure invalid submissions leave the board untouched and allow re-submission.
