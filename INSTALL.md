# Install (Windows / cross-platform fork)

This fork replaces the original Python+Unix-pty implementation with
[`node-pty`](https://github.com/microsoft/node-pty), so it works on Windows
(via ConPTY), macOS, and Linux.

## Requirements

- **Node.js** (>= 18) installed and on PATH. The plugin spawns a small
  helper process (`pty-helper.js`) that hosts node-pty in a normal Node
  context — required because Obsidian's renderer can't create Worker threads,
  which node-pty's Windows path needs.
- Override the Node binary by setting `VIN_TERM_NODE` in your environment
  before launching Obsidian.

## Quick install (no build required)

The committed `main.js` and `pty-helper.js` are prebuilt. From your vault root:

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

Produces `main.js`. Then install as above (run `npm install --omit=dev`
at the destination so node-pty's runtime binaries are present).

## Shell selection

Default shell per platform:
- Windows: Git Bash (if installed) → PowerShell 7 → `powershell.exe`
- macOS: `/bin/zsh -i -l`
- Linux: `$SHELL` or `/bin/bash`

Override by setting `VIN_TERM_SHELL` in your environment before launching Obsidian.

## Architecture

```
Obsidian renderer (this plugin)        node child process
     main.js                              pty-helper.js
       |  spawn(node, ...)                 |
       |---- stdin (input + ctrl) -------->|---- node-pty ----> shell
       |<--- stdout (raw output) ----------|
```

Control sequences (resize, kill) are framed as `ESC ] V ; <cmd> BEL` and
embedded inline in the stdin stream.
