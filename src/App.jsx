import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SettingsPanel from "./components/SettingsPanel";
import AnalysisBoard from "./components/AnalysisBoard";
import ChatPanel from "./components/ChatPanel";
import {
  deriveFenSequence,
  parseFenOrPgnInput,
  parseStockfishLine
} from "./utils/analysisHelpers";

const electronAPI = typeof window !== "undefined" ? window.electronAPI : null;
const SETTINGS_FLAG = "chess-to-me:settings-saved";

const DEFAULT_FORM = {
  stockfishPath: "",
  analysisDepth: 16,
  explainLanguage: "English",
  ollamaModel: "qwen3",
  ollamaBaseUrl: "http://localhost:11434/api",
  referenceApiKey: "",
  referenceDbUsers: ""
};

export default function App() {
  const [viewMode, setViewMode] = useState(() => {
    if (typeof window === "undefined") return "settings";
    return window.localStorage.getItem(SETTINGS_FLAG) === "true" ? "analysis" : "settings";
  });
  const [formState, setFormState] = useState(DEFAULT_FORM);
  const [engineStatus, setEngineStatus] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisStatus, setAnalysisStatus] = useState("");
  const [analysisLines, setAnalysisLines] = useState([]);
  const [analysisEntries, setAnalysisEntries] = useState([]);
  const [lineDialogOpen, setLineDialogOpen] = useState(false);
  const [activeLine, setActiveLine] = useState(null);
  const [lineAnalysisText, setLineAnalysisText] = useState("");
  const [lineAnalysisLoading, setLineAnalysisLoading] = useState(false);
  const [lineAnalysisError, setLineAnalysisError] = useState("");
  const [explanations, setExplanations] = useState([]);
  const [currentFen, setCurrentFen] = useState("start");
  const [questionText, setQuestionText] = useState("");
  const [questionResponse, setQuestionResponse] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importText, setImportText] = useState("start");
  const [importError, setImportError] = useState("");
  const [importLoading, setImportLoading] = useState(false);
  const [windowSize, setWindowSize] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 720
  }));
  const importFileInput = useRef(null);

  const fetchSystemStatus = useCallback(async () => {
    if (!electronAPI?.getSystemStatus) {
      return;
    }
    try {
      const status = await electronAPI.getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      setStatusMessage("Unable to fetch system status.");
    }
  }, []);

  const loadEngineStatus = useCallback(async () => {
    if (!electronAPI?.getEngineStatus) {
      return;
    }
    try {
      const status = await electronAPI.getEngineStatus();
      setEngineStatus(status);
      setFormState((prev) => ({
        ...prev,
        stockfishPath: status.path || prev.stockfishPath,
        analysisDepth: Number(status.settings?.analysisDepth) || prev.analysisDepth,
        explainLanguage: status.settings?.explainLanguage || prev.explainLanguage,
        ollamaModel: status.settings?.ollamaModel || prev.ollamaModel,
        ollamaBaseUrl: status.settings?.ollamaBaseUrl || prev.ollamaBaseUrl,
        referenceApiKey: status.settings?.referenceApiKey || prev.referenceApiKey,
        referenceDbUsers: status.settings?.referenceDbUsers || prev.referenceDbUsers
      }));
    } catch (err) {
      setStatusMessage("Unable to read saved engine settings.");
    }
  }, []);

  useEffect(() => {
    fetchSystemStatus();
    loadEngineStatus();
  }, [fetchSystemStatus, loadEngineStatus]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const fetchExplanations = useCallback(
    async (fen, lines) => {
      if (!lines?.length || !electronAPI?.explainLines) {
        setExplanations([]);
        return;
      }
      try {
        const response = await electronAPI.explainLines({
          fen,
          lines,
          language: formState.explainLanguage,
          model: formState.ollamaModel,
          baseUrl: formState.ollamaBaseUrl
        });
        if (response?.ok) {
          setExplanations(response.explanations || []);
        } else {
          setExplanations([]);
        }
      } catch (err) {
        setExplanations([]);
      }
    },
    [formState.explainLanguage, formState.ollamaModel, formState.ollamaBaseUrl]
  );

  const handleAnalysisSuccess = useCallback(
    (lines, fen) => {
      setAnalysisLines(lines);
      const entries = (lines || []).map((line, index) => parseStockfishLine(line, index + 1));
      setAnalysisEntries(entries);
      setAnalysisStatus("");
      fetchExplanations(fen, lines);
    },
    [fetchExplanations]
  );

  const runAnalysis = useCallback(
    async (fen) => {
      if (!electronAPI?.analyzePosition) {
        setAnalysisStatus("Analysis engine unavailable.");
        return;
      }
      setAnalysisLoading(true);
      setAnalysisStatus("");
      try {
        const response = await electronAPI.analyzePosition({
          fen,
          depth: formState.analysisDepth,
          multiPv: 4
        });
        if (!response?.ok) {
          setAnalysisStatus(response?.error || "Stockfish failed to return analysis.");
          setAnalysisLines([]);
          setAnalysisEntries([]);
          setExplanations([]);
          return;
        }
        const lines = response.analysis?.lines || [];
        handleAnalysisSuccess(lines, fen);
      } catch (err) {
        setAnalysisStatus("Stockfish analysis failed.");
        setAnalysisLines([]);
        setAnalysisEntries([]);
        setExplanations([]);
      } finally {
        setAnalysisLoading(false);
      }
    },
    [formState.analysisDepth, handleAnalysisSuccess]
  );

  const applyPositions = useCallback(
    (positions, message) => {
      if (!positions?.length) {
        setAnalysisStatus("No valid positions found.");
        return;
      }
      const finalFen = positions[positions.length - 1];
      setImportText(finalFen === "start" ? "start" : finalFen);
      setCurrentFen(finalFen);
      setStatusMessage(message || "Position loaded.");
      setAnalysisStatus("");
      runAnalysis(finalFen);
    },
    [runAnalysis]
  );

  const handleFormChange = useCallback((key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleDetect = useCallback(async () => {
    if (!electronAPI?.detectStockfish) {
      setStatusMessage("Auto-detect is unavailable.");
      return;
    }
    setStatusMessage("Scanning for Stockfish...");
    try {
      const result = await electronAPI.detectStockfish();
      if (result?.found && result?.path) {
        setFormState((prev) => ({ ...prev, stockfishPath: result.path }));
        setStatusMessage("Stockfish path auto-detected.");
        return;
      }
      setStatusMessage("Stockfish could not be detected automatically.");
    } catch (err) {
      setStatusMessage("Auto-detection failed.");
    }
  }, []);

  const handleBrowse = useCallback(async () => {
    if (!electronAPI?.browseStockfish) {
      setStatusMessage("Browse dialog unavailable.");
      return;
    }
    try {
      const response = await electronAPI.browseStockfish();
      if (!response?.selected) {
        setStatusMessage("No executable selected.");
        return;
      }
      if (!response.valid) {
        setStatusMessage("Selected file is not a valid engine.");
        return;
      }
      setFormState((prev) => ({ ...prev, stockfishPath: response.path || prev.stockfishPath }));
      setStatusMessage("Stockfish executable selected.");
    } catch (err) {
      setStatusMessage("Unable to browse for Stockfish.");
    }
  }, []);

  const handleSaveSettings = useCallback(async () => {
    if (!formState.stockfishPath) {
      setStatusMessage("Please provide a Stockfish executable path.");
      return;
    }
    if (!electronAPI?.setStockfishPath || !electronAPI?.updateAppSettings) {
      setStatusMessage("Renderer APIs are not ready.");
      return;
    }
    setSettingsSaving(true);
    setStatusMessage("Validating and saving settings...");
    try {
      const pathResult = await electronAPI.setStockfishPath(formState.stockfishPath);
      if (!pathResult?.ok) {
        setStatusMessage("Stockfish path validation failed.");
        return;
      }
      const configResult = await electronAPI.updateAppSettings({
        analysisDepth: Number(formState.analysisDepth),
        explainLanguage: formState.explainLanguage,
        ollamaModel: formState.ollamaModel,
        ollamaBaseUrl: formState.ollamaBaseUrl,
        referenceApiKey: formState.referenceApiKey,
        referenceDbUsers: formState.referenceDbUsers
      });
      if (!configResult?.ok) {
        setStatusMessage("Failed to persist application settings.");
        return;
      }
      setEngineStatus((prev) => ({
        ...prev,
        configured: true,
        path: formState.stockfishPath,
        settings: configResult.settings
      }));
      setStatusMessage("Settings saved and Stockfish validated.");
      fetchSystemStatus();
    } catch (err) {
      setStatusMessage("Unable to save settings.");
    } finally {
      setSettingsSaving(false);
    }
  }, [fetchSystemStatus, formState]);

  const handleSettingsComplete = useCallback(() => {
    if (!engineStatus?.configured) {
      setStatusMessage("Please configure Stockfish before entering the analysis view.");
      return;
    }
    setViewMode("analysis");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SETTINGS_FLAG, "true");
    }
  }, [engineStatus]);

  const handleResetToStart = useCallback(() => {
    setImportText("start");
    setAnalysisStatus("");
    applyPositions(["start"], "Start position loaded.");
  }, [applyPositions]);

  const handleLineDialogClose = useCallback(() => {
    setLineDialogOpen(false);
    setActiveLine(null);
    setLineAnalysisText("");
    setLineAnalysisError("");
  }, []);

  const handleShowLine = useCallback(
    async (entry) => {
      if (!entry) {
        return;
      }
      setActiveLine(entry);
      setLineDialogOpen(true);
      setLineAnalysisText("");
      setLineAnalysisError("");
      if (!entry.moves?.length) {
        setLineAnalysisError("This line has no parsed moves to analyze.");
        return;
      }
      if (!electronAPI?.askQuestion) {
        setLineAnalysisError("LLM analysis API is unavailable.");
        return;
      }
      setLineAnalysisLoading(true);
      const moveSequence = entry.moves.map((move) => `${move.from}${move.to}`).join(" ");
      const question = `You are a chess coach reviewing Stockfish output. Analyze the following move line on the current board (FEN: ${currentFen}). Each pair of coordinates is a move: the first pair is the piece's current square, the next pair is the destination. Highlight threats for both sides, weak areas, and how each player should proceed, including useful attacking and defending hints. Moves: ${moveSequence}`;
      try {
        const response = await electronAPI.askQuestion({
          question,
          fen: currentFen,
          lines: analysisLines,
          language: formState.explainLanguage,
          model: formState.ollamaModel,
          baseUrl: formState.ollamaBaseUrl
        });
        if (!response?.ok || !response.answer) {
          setLineAnalysisError(response?.error || "LLM did not return any analysis.");
        } else {
          setLineAnalysisText(response.answer);
        }
      } catch (err) {
        setLineAnalysisError("LLM analysis failed.");
      } finally {
        setLineAnalysisLoading(false);
      }
    },
    [analysisLines, currentFen, electronAPI, formState.explainLanguage, formState.ollamaBaseUrl, formState.ollamaModel]
  );

  const handlePlayLine = useCallback(
    (moves) => {
      if (!moves?.length) {
        setAnalysisStatus("No moves to replay.");
        return;
      }
      const sequence = deriveFenSequence(moves, currentFen);
      if (!sequence?.length) {
        setAnalysisStatus("Unable to replay this line.");
        return;
      }
      applyPositions(sequence, "Replayed analysis line.");
    },
    [applyPositions, currentFen]
  );

  const openImportPicker = useCallback(() => {
    importFileInput.current?.click();
  }, []);

  const handleImportFile = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (typeof FileReader === "undefined") {
      setImportError("File uploads are unavailable.");
      return;
    }
    setImportLoading(true);
    setImportError("");
    const reader = new FileReader();
    reader.onload = () => {
      setImportText(String(reader.result || ""));
      setImportLoading(false);
    };
    reader.onerror = () => {
      setImportError("Unable to read the selected file.");
      setImportLoading(false);
    };
    reader.readAsText(file);
    event.target.value = "";
  }, []);

  const handleImportSubmit = useCallback(() => {
    const text = String(importText || "").trim();
    if (!text) {
      setImportError("Provide FEN or PGN text.");
      return;
    }
    setImportLoading(true);
    const result = parseFenOrPgnInput(text);
    if (result.error) {
      setImportError(result.error);
      setImportLoading(false);
      return;
    }
    setImportError("");
    applyPositions(result.positions, "Imported positions applied.");
    setImportDialogOpen(false);
    setImportLoading(false);
  }, [applyPositions, importText]);

  const handleQuestion = useCallback(async () => {
    const question = String(questionText || "").trim();
    if (!question) {
      setStatusMessage("Ask a question about the current position.");
      return;
    }
    if (!electronAPI?.askQuestion) {
      setStatusMessage("LLM question API unavailable.");
      return;
    }
    setQuestionLoading(true);
    setStatusMessage("Sending question to LLM...");
    try {
      const response = await electronAPI.askQuestion({
        question,
        fen: currentFen,
        lines: analysisLines,
        language: formState.explainLanguage,
        model: formState.ollamaModel,
        baseUrl: formState.ollamaBaseUrl
      });
      if (!response?.ok) {
        setStatusMessage(response?.error || "No response from LLM.");
        return;
      }
      setQuestionResponse(response.answer || "No answer returned.");
      setStatusMessage("LLM answered your question.");
    } catch (err) {
      setStatusMessage("LLM question failed.");
    } finally {
      setQuestionLoading(false);
    }
  }, [analysisLines, currentFen, formState.explainLanguage, formState.ollamaBaseUrl, formState.ollamaModel, questionText]);

  const onOpenSettings = useCallback(() => {
    setViewMode("settings");
  }, []);

  const boardSize = useMemo(() => {
    const width = windowSize.width || 1280;
    const height = windowSize.height || 720;
    const horizontalPadding = 48;
    const verticalPadding = 96;
    const usableWidth = Math.max(360, width - horizontalPadding);
    const usableHeight = Math.max(360, height - verticalPadding);
    const boardWidth = usableWidth * 0.6;
    const dimension = Math.min(boardWidth, usableHeight, 760);
    return { width: dimension, height: dimension };
  }, [windowSize.width, windowSize.height]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        height: "100vh",
        width: "100%",
        background: "linear-gradient(160deg, #e4e8f4 0%, #f3f3f1 45%, #f2ede4 100%)",
        px: { xs: 2, md: 4 },
        py: { xs: 2, md: 3 },
        overflow: "hidden"
      }}
    >
      {viewMode === "settings" ? (
        <Box sx={{ height: "100%", overflow: "hidden" }}>
          <Container maxWidth="md" sx={{ height: "100%" }}>
            <SettingsPanel
              formState={formState}
              onFieldChange={handleFormChange}
              onDetect={handleDetect}
              onBrowse={handleBrowse}
              onSaveSettings={handleSaveSettings}
              onSettingsComplete={handleSettingsComplete}
              settingsSaving={settingsSaving}
              engineStatus={engineStatus}
              statusMessage={statusMessage}
              systemStatus={systemStatus}
            />
          </Container>
        </Box>
      ) : (
        <Stack spacing={3} sx={{ flex: 1, minHeight: 0, overflow: "hidden" }}>
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              display: "flex",
              gap: 3,
              flexDirection: { xs: "column", md: "row" }
            }}
          >
            <Box
              sx={{
                flex: "7 1 0%",
                minHeight: 0,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                padding: "5px",
                boxSizing: "border-box"
              }}
            >
              <Box sx={{ flex: 1, minHeight: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                <AnalysisBoard
                  currentFen={currentFen}
                  setCurrentFen={setCurrentFen}
                  runAnalysis={runAnalysis}
                  setStatusMessage={setStatusMessage}
                  size={boardSize}
                />
              </Box>
              <Box sx={{ display: "flex", justifyContent: "flex-end", pt: 1 }}>
              <IconButton
                size="small"
                onClick={() => setImportDialogOpen(true)}
                color="primary"
                aria-label="open import controls"
              >
                <AddIcon fontSize="small" />
              </IconButton>
              </Box>
            </Box>
            <Box
              sx={{
                flex: "3 1 0%",
                minWidth: { xs: "100%", md: 320 },
                display: "flex",
                flexDirection: "column",
                gap: 2,
                minHeight: 0,
                height: "100%",
                overflow: "hidden"
              }}
            >
              <ChatPanel
                questionText={questionText}
                onQuestionChange={setQuestionText}
                onAskQuestion={handleQuestion}
                questionLoading={questionLoading}
                questionResponse={questionResponse}
                onClearQuestion={() => setQuestionText("")}
                onOpenSettings={onOpenSettings}
                analysisEntries={analysisEntries}
                analysisStatus={analysisStatus}
                analysisLoading={analysisLoading}
                onPlayLine={handlePlayLine}
                onShowLine={handleShowLine}
                sx={{ flex: 1 }}
              />
            </Box>
          </Box>
        </Stack>
      )}
      <input
        ref={importFileInput}
        type="file"
        accept=".fen,.pgn,text/plain"
        style={{ display: "none" }}
        onChange={handleImportFile}
      />
      <Dialog open={importDialogOpen} onClose={() => setImportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Import FEN / PGN</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              multiline
              minRows={4}
              maxRows={8}
              value={importText}
              onChange={(event) => {
                setImportText(event.target.value);
                if (importError) {
                  setImportError("");
                }
              }}
              placeholder="Paste a FEN or PGN string here (supports the same moves Stockfish reports)."
              fullWidth
            />
            <Stack direction="row" spacing={1} alignItems="center">
              <Button variant="outlined" onClick={openImportPicker}>
                Browse file
              </Button>
              {importLoading && <CircularProgress size={18} />}
              <Typography variant="body2" color="text.secondary">
                Upload .fen/.pgn for batch positions
              </Typography>
            </Stack>
            {importError && (
              <Typography variant="body2" color="error">
                {importError}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={handleImportSubmit} disabled={importLoading}>
            Load positions
          </Button>
          <Button variant="outlined" onClick={handleResetToStart}>
            Reset board
          </Button>
          <Button onClick={() => setImportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      <Dialog open={lineDialogOpen} onClose={handleLineDialogClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {activeLine ? `Line ${activeLine.rank ?? ""} analysis` : "Line analysis"}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            {activeLine?.moves && activeLine.moves.length > 0 && (
              <Typography variant="body2" color="text.secondary">
                Moves:{" "}
                {activeLine.moves
                  .map((move) => `${move.from.toUpperCase()} → ${move.to.toUpperCase()}`)
                  .join(", ")}
              </Typography>
            )}
            {activeLine?.rawText && (
              <Typography variant="body2" color="text.secondary">
                Source: {activeLine.rawText}
              </Typography>
            )}
            {lineAnalysisLoading && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={20} />
                <Typography variant="body2">Generating LLM analysis…</Typography>
              </Box>
            )}
            {lineAnalysisError && (
              <Typography variant="body2" color="error">
                {lineAnalysisError}
              </Typography>
            )}
            {lineAnalysisText && (
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {lineAnalysisText}
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleLineDialogClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
