# TestSprite Testing Guide

## Overview
This project uses TestSprite to automate unit, integration, end-to-end, performance, and error scenario testing for the frontend (React + Vite).

## Environment
- OS: Windows
- Node: Installed (see project `package.json`)
- Dev server: Vite v7.2.2 at `http://localhost:5174/`
- Network: Internet required for TestSprite cloud execution
- Python (runner-side): Requires `playwright` or `pyppeteer`

## Prerequisites
- Install dependencies: `npm install`
- Start dev server: `npm run dev` (confirm `http://localhost:5174/`)
- Ensure internet connectivity

## Running Tests
- Command-line:
  - `node C:\Users\AunMohammad\AppData\Local\npm-cache\_npx\<id>\node_modules\@testsprite\testsprite-mcp\dist\index.js generateCodeAndExecute`
- IDE: Use the “Generate Code And Execute” action if available

## Test Categories
- Unit: Components, hooks, utilities
- Integration: Cross-component interactions (navigation, sidebar, theme)
- E2E: Full workflows using headless browser
- Performance: Render and navigation timing, list operations
- Error Scenarios: ErrorBoundary and failure modes

## Reports & Artifacts
- Raw report: `testsprite_tests/tmp/raw_report.md`
- Final report: `testsprite_tests/testsprite-mcp-test-report.md`
- Code summary: `testsprite_tests/tmp/code_summary.json`

## Expected vs Actual
- For this run, all tests failed during environment setup due to missing Python modules (`playwright`/`pyppeteer`).
- App was reachable and dev server healthy; failures were test runner infra-related.

## Known Issues & Remediation
- Missing Python browser automation modules in TestSprite runner.
  - Install: `pip install playwright` then `playwright install` (recommended).
  - Or: `pip install pyppeteer`.
  - Re-run the full test suite after modules are installed.

## Coverage & Performance
- Coverage: 0% for this run (infra failures).
- Performance: Not collected; baseline: Vite ready ~400ms.

## Reproduction Steps
1. `npm install`
2. `npm run dev`
3. Run TestSprite CLI (command above)
4. Inspect `testsprite_tests/tmp/raw_report.md` for details and re-run after fixing runner deps.

## Maintenance Notes
- Keep `code_summary.json` updated when new components/features are added.
- If the dev server port changes, update TestSprite configuration and instructions.