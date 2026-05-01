import {
  Alert,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import type { SettingsPanelProps } from "../types";

function getEnginePath(formState: Record<string, any>, engineName: string): string {
  return formState[`${engineName}Path`] || "";
}

export default function SettingsPanel({
  formState,
  onFieldChange,
  onDetect,
  onBrowse,
  onSaveSettings,
  onSettingsComplete,
  settingsSaving,
  engineStatus,
  statusMessage,
  systemStatus,
  sx,
  availableEngines,
  selectedEngine,
  onEngineChange
}: SettingsPanelProps) {
  const systemChips = [
    { label: `Platform: ${systemStatus?.platform || "unknown"}`, color: "default" as const },
    {
      label: systemStatus?.ollamaRunning ? "Ollama serve running" : "Ollama offline",
      color: systemStatus?.ollamaRunning ? ("success" as const) : ("error" as const)
    },
    {
      label: systemStatus?.ollamaRunActive ? "Ollama model active" : "Ollama model idle",
      color: systemStatus?.ollamaRunActive ? ("success" as const) : ("warning" as const)
    },
    {
      label: `Model: ${systemStatus?.activeModel || formState.ollamaModel}`,
      color: "default" as const
    },
    {
      label: systemStatus?.qwen3Installed ? "qwen3 ready" : "qwen3 missing",
      color: systemStatus?.qwen3Installed ? ("success" as const) : ("error" as const)
    }
  ];
  const availableModelList = Array.isArray(systemStatus?.availableModels)
    ? systemStatus.availableModels.filter(Boolean)
    : [];
  const modelOptions = [...new Set([...(availableModelList || []), formState.ollamaModel || "qwen3:8b"])];

  const selectedEngineFound = availableEngines?.some(
    (engine) => engine.name === selectedEngine && engine.status === "installed"
  );

  return (
    <Paper
      elevation={3}
      sx={{
        width: "100%",
        height: "100%",
        overflowY: "auto",
        p: { xs: 2, md: 3 },
        bgcolor: "background.paper",
        ...sx
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h5">Application settings</Typography>
        <Typography variant="body2" color="text.secondary">
          Select a chess engine (Stockfish or LC0) and configure LLM analysis before moving to the analysis view.
        </Typography>

        <Typography variant="h6">Chess Engine</Typography>
        <FormControl fullWidth>
          <InputLabel id="engine-select-label">Engine</InputLabel>
          <Select
            labelId="engine-select-label"
            label="Engine"
            value={selectedEngine || ""}
            onChange={(event) => onEngineChange?.(event.target.value)}
          >
            {availableEngines?.map((engine) => (
              <MenuItem key={engine.name} value={engine.name}>
                {engine.name.toUpperCase()} - {engine.status === "installed" ? "Installed" : "Not found"}
              </MenuItem>
            ))}
          </Select>
          {selectedEngineFound ? (
            <Typography variant="caption" color="success.main" sx={{ mt: 1 }}>
              ✓ Auto-detected at {getEnginePath(formState, selectedEngine || "")}
            </Typography>
          ) : (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              {selectedEngine?.toUpperCase()} not configured
            </Typography>
          )}
        </FormControl>

        {!selectedEngineFound && (
          <>
            <TextField
              label={`${selectedEngine?.toUpperCase() || "Engine"} executable path`}
              value={getEnginePath(formState, selectedEngine || "")}
              onChange={(event) => onFieldChange?.(`${selectedEngine}Path`, event.target.value)}
              fullWidth
              helperText="Path to engine binary (e.g., /usr/local/bin/lc0 or C:\\Program Files\\LC0\\lc0.exe)"
            />
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={onDetect} size="small">
                Auto-detect
              </Button>
              <Button variant="outlined" onClick={onBrowse} size="small">
                Browse
              </Button>
            </Stack>
          </>
        )}
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Analysis depth"
              type="number"
              inputProps={{ min: 6, max: 30 }}
              value={formState.analysisDepth}
              onChange={(event) => onFieldChange("analysisDepth", event.target.value)}
              fullWidth
              helperText="6-30"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Language"
              value={formState.explainLanguage}
              onChange={(event) => onFieldChange("explainLanguage", event.target.value)}
              fullWidth
              helperText="LLM response language"
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="ollama-model-label">LLM model</InputLabel>
              <Select
                labelId="ollama-model-label"
                label="LLM model"
                value={formState.ollamaModel}
                onChange={(event) => onFieldChange("ollamaModel", event.target.value)}
              >
                {modelOptions.map((model) => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
              {systemStatus?.lastModelError && (
                <Typography variant="caption" color="error">
                  {systemStatus.lastModelError}
                </Typography>
              )}
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="LLM base URL"
              value={formState.ollamaBaseUrl}
              onChange={(event) => onFieldChange("ollamaBaseUrl", event.target.value)}
              fullWidth
            />
          </Grid>
        </Grid>
        {statusMessage ? <Alert severity="info">{statusMessage}</Alert> : null}
        <Stack direction="row" spacing={2} justifyContent="flex-end">
          <Button variant="contained" color="primary" onClick={onSaveSettings} disabled={settingsSaving}>
            Save settings
          </Button>
          <Button variant="contained" color="secondary" onClick={onSettingsComplete} disabled={!engineStatus?.configured}>
            Go to analysis
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {systemChips.map((chip) => (
            <Chip key={chip.label} label={chip.label} color={chip.color} size="small" />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
}
