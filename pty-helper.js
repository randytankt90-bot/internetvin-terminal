"use strict";
// PTY helper — runs in a child process spawned with ELECTRON_RUN_AS_NODE=1.
//
// argv[2] = absolute path to node-pty package
// argv[3] = JSON: { shell, args, cwd, env, cols, rows }
//
// Stdin: raw bytes forwarded to PTY, except control sequences:
//   ESC ] V ; <cmd> BEL    where <cmd> is "R;<cols>;<rows>" or "K"
// Stdout: raw PTY output.

const nodePtyPath = process.argv[2];
const cfg = JSON.parse(process.argv[3]);

let nodePty;
try {
  nodePty = require(nodePtyPath);
} catch (e) {
  process.stderr.write("PTY_HELPER_ERROR: failed to require node-pty: " + (e && e.stack || e) + "\n");
  process.exit(2);
}

let pty;
try {
  pty = nodePty.spawn(cfg.shell, cfg.args || [], {
    name: "xterm-256color",
    cols: cfg.cols || 80,
    rows: cfg.rows || 24,
    cwd: cfg.cwd,
    env: cfg.env,
  });
} catch (e) {
  process.stderr.write("PTY_HELPER_ERROR: spawn failed: " + (e && e.stack || e) + "\n");
  process.exit(3);
}

pty.onData((d) => { try { process.stdout.write(d); } catch {} });
pty.onExit(({ exitCode }) => {
  try { process.stdout.end(); } catch {}
  process.exit(typeof exitCode === "number" ? exitCode : 0);
});

const SEQ_START = "\x1b]V;";
const SEQ_END = "\x07";
let buf = "";

process.stdin.setEncoding("utf8");
process.stdin.on("data", (chunk) => {
  buf += chunk;
  while (true) {
    const i = buf.indexOf(SEQ_START);
    if (i < 0) {
      if (buf.length) { try { pty.write(buf); } catch {} buf = ""; }
      break;
    }
    if (i > 0) { try { pty.write(buf.slice(0, i)); } catch {} }
    const j = buf.indexOf(SEQ_END, i + SEQ_START.length);
    if (j < 0) { buf = buf.slice(i); break; }
    const cmd = buf.slice(i + SEQ_START.length, j);
    buf = buf.slice(j + 1);
    if (cmd.startsWith("R;")) {
      const parts = cmd.slice(2).split(";");
      const cols = parseInt(parts[0], 10);
      const rows = parseInt(parts[1], 10);
      if (Number.isFinite(cols) && Number.isFinite(rows)) {
        try { pty.resize(cols, rows); } catch {}
      }
    } else if (cmd === "K") {
      try { pty.kill(); } catch {}
    }
  }
});

process.stdin.on("end", () => { try { pty.kill(); } catch {} });
