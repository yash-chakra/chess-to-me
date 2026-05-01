import { Chess } from "chess.js";

const coordinateRegex = /[a-h][1-8]/gi;
const pieceNames = {
  p: "Pawn",
  r: "Rook",
  n: "Knight",
  b: "Bishop",
  q: "Queen",
  k: "King"
};
const colorNames = {
  w: "White",
  b: "Black"
};
const cleanNoise = (text) => {
  if (!text) {
    return "";
  }
  return text
    .replace(/Line\s*\d+,?\s*/gi, "")
    .replace(/CP\s*-?\d+/gi, "")
    .replace(/#/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

const formatMoves = (moves) => {
  if (!moves?.length) {
    return "No moves detected";
  }
  return moves.map((move) => `${move.from} ${move.to}`).join(", ");
};

const describeMovesForLlm = ({ moves, startingFen = "start" }) => {
  const board = new Chess();
  if (startingFen && startingFen !== "start") {
    try {
      board.load(startingFen);
    } catch {
      board.reset();
    }
  } else {
    board.reset();
  }
  const attackColor = board.turn() === "w" ? "White" : "Black";
  const defenderColor = attackColor === "White" ? "Black" : "White";
  const moveDetails = [];
  for (const move of moves || []) {
    const moveResult = board.move({ from: move.from, to: move.to, promotion: "q" });
    if (!moveResult) {
      break;
    }
    moveDetails.push({
      colorName: colorNames[moveResult.color] || "Both sides",
      pieceName: pieceNames[moveResult.piece] || "piece",
      from: move.from,
      to: move.to,
      san: moveResult.san || `${move.from}${move.to}`,
      isCapture: (moveResult.flags || "").includes("c")
    });
  }
  const movesLine = (moves || []).map((move) => `${move.from}${move.to}`).join(" ") || "none";
  const first = moveDetails[0];
  const riskText = first
    ? `${first.colorName} must guard ${first.from} after moving the ${first.pieceName.toLowerCase()}, while ${defenderColor} can look to pressure ${first.to}.`
    : `${attackColor} and ${defenderColor} must stay alert to the center tension.`;
  const attackText = first
    ? `${attackColor} attacks by bringing the ${first.pieceName.toLowerCase()} to ${first.to} and keeping ${first.to} under watch.`
    : `${attackColor} wants to improve piece placement before executing a concrete threat.`;
  const opponentIdea = first
    ? `${defenderColor} should reply by contesting ${first.to} or reinforcing the ${first.to} square with another piece.`
    : `${defenderColor} should finish development and challenge the newly opened files.`;
  return [
    `Position FEN: ${startingFen}`,
    `Moves: ${movesLine}`,
    `Risks: ${riskText}`,
    `Attack: ${attackText}`,
    `Opponent idea: ${opponentIdea}`
  ].join("\n");
};

export const parseStockfishLine = (line, fallbackRank = 1, startingFen = "start") => {
  const rawPv = Array.isArray(line.pv) ? line.pv.join(" ") : line.pv || "";
  const rawLine = (line.line || line.text || rawPv || "").trim();
  const cleaned = cleanNoise(rawLine);
  const coordinates = (rawLine || "").match(coordinateRegex) || [];
  const moves = [];
  for (let index = 0; index + 1 < coordinates.length; index += 2) {
    const from = coordinates[index]?.toLowerCase();
    const to = coordinates[index + 1]?.toLowerCase();
    if (from && to) {
      moves.push({ from, to });
    }
  }
  const scoreValue = line.score?.type === "mate" ? `Mate ${line.score.value}` : line.score?.value;
  const scoreLabel = scoreValue ? (line.score?.type === "mate" ? scoreValue : `CP ${scoreValue}`) : null;
  const llmUserMessage = describeMovesForLlm({ moves, startingFen });
  return {
    id: line.id ?? `stockfish-line-${fallbackRank}`,
    rank: line.rank ?? fallbackRank,
    rawText: rawLine || cleaned || "No data",
    cleanText: cleaned || "No data",
    moves,
    scoreLabel,
    description: formatMoves(moves),
    llmUserMessage
  };
};

export const deriveFenSequence = (moves, startingFen = "start") => {
  const board = new Chess();
  if (startingFen && startingFen !== "start") {
    try {
      board.load(startingFen);
    } catch (err) {
      board.reset();
    }
  } else {
    board.reset();
  }
  const initialFen = startingFen === "start" ? board.fen() : startingFen;
  const sequence = [initialFen];
  for (const move of moves || []) {
    const nextMove = board.move({ from: move.from, to: move.to, promotion: "q" });
    if (!nextMove) {
      break;
    }
    sequence.push(board.fen());
  }
  return sequence;
};

const parseFenString = (input) => {
  const chess = new Chess();
  if (chess.load(input)) {
    return [input];
  }
  return null;
};

const parsePgn = (input) => {
  const parser = new Chess();
  if (!parser.loadPgn(input)) {
    return null;
  }
  const moves = parser.history();
  const board = new Chess();
  const positions = [board.fen()];
  for (const san of moves) {
    const result = board.move(san, { sloppy: true });
    if (!result) {
      break;
    }
    positions.push(board.fen());
  }
  return positions;
};

export const parseFenOrPgnInput = (input) => {
  if (!input) {
    return { error: "No input provided." };
  }
  const trimmed = input.trim();
  if (!trimmed) {
    return { error: "No input provided." };
  }
  const fenParts = trimmed.split(/\s+/);
  const maybeFen = fenParts.length === 6 && trimmed.includes("/");
  if (maybeFen) {
    const fenResult = parseFenString(trimmed);
    if (fenResult) {
      return { positions: fenResult };
    }
  }
  const pgnPositions = parsePgn(trimmed);
  if (pgnPositions) {
    return { positions: pgnPositions };
  }
  return { error: "Unable to parse input. Provide a valid FEN or PGN string." };
};
