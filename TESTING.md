# Testing Guide

This project uses a combination of Playwright/Pyppeteer-based Python tests and the Testsprite MCP harness for automated frontend validation.

## Prerequisites
- Node.js and npm installed.
- Python 3.9+ available in PATH.
- Internet access for Testsprite proxy tunnel.

## Start the Dev Server (Expose to Network)
Run Vite with explicit host binding so the remote tunnel can reach your local app:

```
npm run dev -- --port 5174 --host
```

Notes:
- Default test base URL is `http://localhost:5174`.
- If the server auto-selects a different port, set `TEST_BASE_URL` accordingly.

## Test Base URL
All tests now read `TEST_BASE_URL` (when present) or default to `http://localhost:5174`.

Examples:
```
# Windows PowerShell
$env:TEST_BASE_URL = "http://localhost:5174"

# Bash
export TEST_BASE_URL="http://localhost:5174"
```

## Browser Automation Bootstrapping
- Playwright/Pyppeteer are auto-installed by tests on first run if missing.
- Chromium is launched with `--no-sandbox` for CI/containers.
- No manual install is required unless you prefer pre-installing:
  - `pip install playwright && python -m playwright install --with-deps chromium`
  - `pip install pyppeteer`

## Running Tests with Testsprite MCP
1. Ensure the dev server is running with `--host` and reachable.
2. Generate/update the code summary: created at `testsprite_tests/tmp/code_summary.json`.
3. Re-run the suite via Testsprite tools (already orchestrated in this workspace):
   - `generateCodeAndExecute` for a full run
   - `reRunTests` to retry after fixes

Artifacts:
- Raw report: `testsprite_tests/tmp/raw_report.md`
- Finalized report: `testsprite_tests/testsprite-mcp-test-report.md`

## Troubleshooting
- Timeouts to `http://localhost:5174/`: Start Vite with `--host` and confirm `Local`/`Network` URLs.
- Port conflicts: Stop old Vite instances, then relaunch on `5174`.
- Tests failing immediately: Confirm `TEST_BASE_URL` matches your dev server URL.