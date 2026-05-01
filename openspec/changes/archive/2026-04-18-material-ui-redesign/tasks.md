## 1. Material UI theming

- [x] 1.1 Add Material UI dependencies and remove Blueprint-specific imports; ensure src/main.jsx wraps App with the Material theme provider.
- [x] 1.2 Create src/theme.js (or similar) that exports palette/typography overrides matching the desktop aesthetic.

## 2. Modular analysis layout

- [x] 2.1 Split App.jsx layout into dedicated components (SettingsPanel, AnalysisBoard, ChatPanel, StatusBanner) under src/components/, keeping each module responsible only for its UI and props.
- [x] 2.2 Update App.jsx to orchestrate state/IPC calls and render the new modules, passing callbacks/status as props.

## 3. Styling cleanup and docs

- [x] 3.1 Simplify src/styles.css to only include global overrides (background, scrollbars, root sizing) and remove Blueprint-only selectors.
- [x] 3.2 Update README/doc notes to mention the Material UI renderer and the new module architecture.
