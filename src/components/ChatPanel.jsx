import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import { useMemo } from "react";

const sanitizeHtml = (html) => {
  if (!html) {
    return "";
  }
  if (typeof window === "undefined") {
    return html;
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  doc.querySelectorAll("script,style").forEach((el) => el.remove());
  return doc.body.innerHTML;
};

export default function ChatPanel({
  questionText,
  onQuestionChange,
  onAskQuestion,
  questionLoading,
  questionResponse,
  onClearQuestion,
  onOpenSettings,
  analysisEntries = [],
  analysisStatus,
  analysisLoading,
  onPlayLine,
  onShowLine,
  sx
}) {
  const paperSx = Array.isArray(sx) ? sx : sx ? [sx] : [];
  const responseHtml = sanitizeHtml(questionResponse);

  const hasEntries = analysisEntries.length > 0;

  const analysisRows = useMemo(() => analysisEntries, [analysisEntries]);

  return (
    <Paper
      elevation={3}
      sx={[
        {
          display: "flex",
          flexDirection: "column",
          height: "100%",
          overflow: "hidden",
          p: 3
        },
        ...paperSx
      ]}
    >
      <Stack spacing={2} sx={{ flex: 1, overflow: "hidden", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Typography variant="h6" sx={{ lineHeight: 1 }}>
            Ask a strategic question
          </Typography>
          <IconButton size="small" onClick={onOpenSettings} aria-label="open settings">
            <SettingsIcon fontSize="small" />
          </IconButton>
        </Box>
        {analysisStatus && (
          <Typography variant="body2" color="error" sx={{ fontWeight: 500 }}>
            {analysisStatus}
          </Typography>
        )}
        <Box
          sx={{
            flex: 8,
            minHeight: 0,
            overflow: "hidden",
            borderRadius: 2,
            border: 1,
            borderColor: "divider",
            p: 2,
            display: "flex",
            flexDirection: "column",
            gap: 1
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <Typography variant="subtitle2">Analysis</Typography>
            {analysisLoading && <CircularProgress size={16} />}
          </Stack>
          <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", pr: 0.5 }}>
            <Stack spacing={1}>
              {!hasEntries && (
                <Typography variant="body2" color="text.secondary">
                  Stockfish lines will appear here (select “Show line” to read the LLM analysis).
                </Typography>
              )}
              {analysisRows.map((entry) => (
                <Box
                  key={`analysis-${entry.id}-${entry.rank}`}
                  sx={{
                    p: 1,
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    display: "flex",
                    alignItems: "center",
                    gap: 1
                  }}
                >
                  <IconButton
                    size="small"
                    aria-label={`Play line ${entry.rank}`}
                    onClick={() => onPlayLine?.(entry.moves)}
                  >
                    <PlayArrowIcon fontSize="small" />
                  </IconButton>
                  <Typography variant="body2">
                    Line {entry.rank ?? entry.id}
                  </Typography>
                  {entry.scoreLabel && (
                    <Typography variant="caption" color="text.secondary">
                      {entry.scoreLabel}
                    </Typography>
                  )}
                  <Button
                    size="small"
                    variant="text"
                    onClick={() => onShowLine?.(entry)}
                    sx={{ textTransform: "none" }}
                  >
                    Show line
                  </Button>
                </Box>
              ))}
            </Stack>
          </Box>
          {questionResponse && (
            <Box
              sx={{
                borderTop: 1,
                borderColor: "divider",
                pt: 1,
                minHeight: 0,
                overflowY: "auto"
              }}
            >
              <Typography variant="subtitle2">LLM answer</Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                component="div"
                sx={{ wordBreak: "break-word", whiteSpace: "pre-wrap" }}
                dangerouslySetInnerHTML={{ __html: responseHtml }}
              />
            </Box>
          )}
        </Box>
        <Box sx={{ flex: 2, minHeight: 0 }}>
          <TextField
            multiline
            minRows={3}
            maxRows={5}
            placeholder="e.g. What plans should White consider here?"
            value={questionText}
            onChange={(event) => onQuestionChange(event.target.value)}
            fullWidth
            sx={{ height: "100%" }}
          />
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="contained" onClick={onAskQuestion} disabled={questionLoading}>
            Ask LLM
          </Button>
          <Button variant="outlined" onClick={onClearQuestion}>
            Clear
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
