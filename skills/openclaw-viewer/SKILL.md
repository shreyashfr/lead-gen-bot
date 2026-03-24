---
name: openclaw-viewer
description: 'Runs the openclaw-viewer Next.js dashboard so you can monitor agents, browse logs, cron jobs, files, and system stats from the browser.'
---

# OpenClaw Viewer Skill

This skill boots the [openclaw-viewer](https://github.com/prasann16/openclaw-viewer) dashboard beside the main agent so you can:

- Watch live logs (SSE tail of `gateway.log`).
- View CPU, RAM, disk usage, and uptime.
- Browse cron jobs, PDF logs, workspace files, and SQLite tables.
- Query the database, inspect processes, and even kill a runaway process.
- Toggle dark mode so it is easy on the eyes.

> **Note:** The viewer is just an embedded Next.js UI running on localhost:3000. Keep it behind SSH/Tailscale when accessing remotely.

---

## Setup (run once)

```bash
# Clone & install dependencies (already done in workspace, but repeat if you redeploy)
cd ~/.openclaw/workspace/openclaw-viewer
npm install
```

If the install finishes with vulnerabilities, they are not critical for local monitoring.

---

## Running the viewer (recommended approach)

```bash
bash ~/.openclaw/workspace/skills/openclaw-viewer/scripts/run_viewer.sh
```

Environment variables supported:
- `CLAWD_ROOT` → defaults to `~/.clawdbot` (configuration + state).
- `WORKSPACE_DATA` → defaults to `~/.clawdbot/workspace` (memory + files). You can point it at `~/clawd` if you host Clawdbot there.
- `GATEWAY_LOG` → defaults to `~/.clawdbot/gateway.log` (streamed logs).

The script launches `npm run dev` in the viewer directory and writes logs to `~/.openclaw/openclaw-viewer.log`. It runs in the background so you can keep the terminal. To stop it, kill the process (e.g., `pkill -f run_viewer.sh`).

After launching, open `http://localhost:3000` (or tunnel/Tailscale if remote).

---

## Use cases

1. **Daily operator tasks**: Kick off the viewer at boot and monitor streams, cron jobs, and DB tables without dropping into the shell.
2. **Security**: Tunnel via SSH (`ssh -L 3000:localhost:3000 user@server`) or use Tailscale for remote access.
3. **Development**: The viewer reads your workspace files, databases, and logs in real time — great for debugging new skills.

**Reminder:** Never expose the viewer port publicly—always proxy through SSH/Tailscale/Serve.

---

## Troubleshooting

- Logs live at `~/.openclaw/openclaw-viewer.log`.
- If the viewer complains about missing state, ensure the environment variables above point to the correct install.
- To inspect SQLite tables, download the DB via the viewer or run `sqlite3 <path>` yourself.
- If the dashboard stops streaming logs, restart it via the script or simply rerun the script (old process is replaced).
