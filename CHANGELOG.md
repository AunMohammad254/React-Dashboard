# Changelog

## 2025-11-09

- Tests: Added auto-install bootstrap for Playwright (Chromium) and Pyppeteer across suite.
- Tests: Standardized Chromium launch with `--no-sandbox` for container/CI compatibility.
- Tests: Introduced `TEST_BASE_URL` env variable across tests, defaulting to `http://localhost:5174`.
- Docs: Added `TESTING.md` explaining dev server `--host` requirement and test execution.
- Infra: Ensured Vite dev server is launched with `--host` for Testsprite tunnel access.