import { Alert, Stack } from "@mui/material";

export default function StatusBanner({ statusMessage, analysisStatus }) {
  if (!statusMessage && !analysisStatus) {
    return null;
  }

  return (
    <Stack spacing={1} sx={{ width: "100%" }}>
      {statusMessage && (
        <Alert severity="info" variant="filled">
          {statusMessage}
        </Alert>
      )}
      {analysisStatus && (
        <Alert severity="warning" variant="outlined">
          {analysisStatus}
        </Alert>
      )}
    </Stack>
  );
}
