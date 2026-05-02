# Install (Windows / cross-platform fork)

This fork replaces the original Python+Unix-pty implementation with
[`node-pty`](https://github.com/microsoft/node-pty), so it works on Windows
(via ConPTY), macOS, and Linux.

## Quick install (no build required)

The committed `main.js` is prebuilt. From your vault root:

```bash
cd .obsidian/plugins
git clone https://github.com/randytankt90-bot/internetvin-terminal.git
cd internetvin-terminal
npm install --omit=dev    # installs node-pty + its prebuilt binaries
```

Then in Obsidian: **Settings → Community plugins → enable "internetVin Terminal"**.

## Build from source

```bash
npm install
npm run build
```

Produces `main.js`. Then ship the folder as above (with a `--omit=dev`
install at the destination so node-pty's runtime binaries are present).

## Shell selection

Default shell per platform:
- Windows: Git Bash (if installed) → PowerShell 7 → powershell.exe
- macOS: `/bin/zsh -i -l`
- Linux: `$SHELL` or `/bin/bash`

Override by setting `VIN_TERM_SHELL` in your environment before launching Obsidian.
