# LC0 Chess Engine Setup Guide

## Overview

This application now supports **LC0** (Leela Chess Zero), a neural network-based chess engine, in addition to Stockfish. LC0 provides a different analysis perspective based on deep learning rather than traditional alpha-beta search.

## Installation

### Windows

1. **Download LC0**
   - Visit: https://github.com/LCZero/lc0/releases
   - Download the latest Windows release (e.g., `lc0-v0.30.0-windows-cpu.zip`)

2. **Extract and Install**
   - Extract the ZIP file to a location like:
     - `C:\Program Files\LC0\`
     - `C:\Program Files (x86)\LC0\`
     - Or any custom directory

3. **Verify Installation**
   - Open Command Prompt and run:
     ```
     lc0.exe --help
     ```
   - You should see LC0 help information

### macOS

1. **Using Homebrew (Recommended)**
   ```bash
   brew install lczero
   ```

2. **Manual Download**
   - Visit: https://github.com/LCZero/lc0/releases
   - Download macOS release
   - Extract to `/usr/local/bin/` or similar location

3. **Verify Installation**
   ```bash
   lc0 --help
   ```

### Linux

1. **Using Package Manager**
   ```bash
   # Ubuntu/Debian
   sudo apt-get install lc0
   
   # Fedora/RHEL
   sudo dnf install lc0
   
   # Arch
   sudo pacman -S leela-chess
   ```

2. **Manual Download**
   - Visit: https://github.com/LCZero/lc0/releases
   - Download Linux release
   - Extract to `/usr/local/bin/` or `~/.local/bin/`

3. **Verify Installation**
   ```bash
   lc0 --help
   ```

## Neural Network Weights

LC0 requires neural network weight files to function. These are separate from the engine binary.

### Automatic Download

When you first run LC0 through this application:
1. If weights are missing, LC0 will attempt to download them
2. A default neural network will be downloaded (~800MB)
3. This may take a few minutes depending on your internet connection

### Manual Setup

If automatic download fails:

1. **Download Weights**
   - Visit: https://lczero.org/
   - Or: https://github.com/LCZero/lc0/wiki/Weights
   - Download a neural network file (e.g., `7248-256x20-swa-1.pb.gz`)

2. **Place in LC0 Directory**
   - On Windows: `C:\Program Files\LC0\`
   - On macOS: `~/.cache/lc0/` or alongside the binary
   - On Linux: `~/.cache/lc0/` or `/usr/share/lc0/`

3. **Or Set Weights Path**
   - LC0 will search for weights in standard locations
   - You can specify custom path via UCI option `WeightsFile`

## Using LC0 in This Application

1. **Engine Selection**
   - Open Settings
   - Select "LC0" from the engine dropdown
   - Click "Auto-detect" to find LC0, or "Browse" to select manually

2. **Analysis**
   - Select a chess position
   - The app will use LC0 for analysis
   - Results will display engine evaluation and best moves

## Performance Considerations

### Hardware Requirements

- **CPU**: Modern multi-core processor (LC0 uses all available cores)
- **Memory**: 4GB+ recommended
- **Disk**: 1GB+ for weights and cache

### Optimization

**For Better Performance:**
- Close other applications to free CPU cores
- Allow LC0 to use multiple threads (auto-configured)
- First analysis may be slower (weights loading)

**For Faster Startup:**
- Install weights manually ahead of time
- Use a recent neural network for better accuracy

## Troubleshooting

### "LC0 not found"
- **Solution**: Use "Browse" in settings to manually locate `lc0` or `lc0.exe`

### "Engine initialization timeout"
- **Cause**: LC0 taking too long to load weights or initialize
- **Solution**:
  1. Check that neural network weights are installed
  2. Try with a smaller network file
  3. Restart the application

### Slow Analysis
- **Cause**: Using too many threads or insufficient hardware
- **Solution**:
  1. Close other applications
  2. Check system resources
  3. Wait for initial weight loading (first run is slower)

### "Weights file not found"
- **Cause**: LC0 missing neural network
- **Solution**:
  1. Run LC0 directly: `lc0 --help`
  2. It will attempt to auto-download weights
  3. Or manually download from https://lczero.org/

## Engine Differences

### Stockfish vs LC0

| Aspect | Stockfish | LC0 |
|--------|-----------|-----|
| **Type** | Traditional eval + search | Neural network |
| **Analysis** | Tactical, precise | Positional, intuitive |
| **Startup** | Fast | Slower (weights loading) |
| **Memory** | Low | Moderate-High |
| **CPU** | Single-threaded efficient | Multi-core optimized |
| **Evaluation** | Centipawn-based | Probability-based |

### When to Use Each

**Use Stockfish for:**
- Tactical analysis (endgames, forcing sequences)
- Quick analysis (low latency)
- Limited hardware

**Use LC0 for:**
- Positional understanding
- Openings and middlegames
- Deep strategic insights
- High-end hardware

## Documentation

- **LC0 Official**: https://lczero.org/
- **LC0 GitHub**: https://github.com/LCZero/lc0/
- **UCI Protocol**: https://github.com/LCZero/lc0/wiki/UCI-Options

## Support

If you encounter issues:
1. Check the logs in the application (Analysis → Logs tab)
2. Verify LC0 works standalone: `lc0 --help`
3. Ensure weights file is present
4. Try reinstalling LC0

## Advanced Configuration

LC0 supports various UCI options that can be configured via the application:

- `Threads`: Number of CPU threads (auto-detected)
- `Backend`: GPU/CPU backend selection
- `WeightsFile`: Custom weights file path
- `BatchSize`: Neural network batch processing size

Currently, the application uses default options. Custom options can be added in future updates.
