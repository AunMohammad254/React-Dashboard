# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Theme System (Windows Dark/Light)

This project implements a comprehensive theme system that detects and applies Windows dark/light preferences, supports manual overrides, persists settings, synchronizes across tabs, and animates theme transitions.

### Architecture
- Components:
  - `src/lib/theme-controller.js`: Central controller. Detects system theme via `matchMedia`, tracks current mode (`light` | `dark` | `system`), computes effective theme, applies `.dark` class, persists to `localStorage`, emits events, and syncs across tabs.
  - `src/hooks/use-theme.js`: React hook to access `mode`, `effective`, and `setTheme`.
  - `src/index.css`: Defines full color systems for light/dark with CSS variables and smooth transitions.
- Interaction sequence (theme change):
  1) User or system triggers a change (button click or OS preference).
  2) `ThemeController` updates `mode`/`effective` and applies `.dark` or removes it.
  3) CSS variables swap; `body` and UI re-render with smooth transitions.
  4) Event emitted; subscribers update local state (hook updates UI state).
  5) Preference stored in `localStorage`; other tabs receive `storage` event and sync.

### Detection & Fallbacks
- Web: Uses `window.matchMedia('(prefers-color-scheme: dark)')` and listens to `change` events (with Safari fallback `addListener`).
- Fallback: If API is unavailable, defaults to light.
- Desktop (guidance): Use Windows Registry key `HKCU\Software\Microsoft\Windows\CurrentVersion\Themes\Personalize\AppsUseLightTheme` and OS-specific hooks (`WM_SETTINGCHANGE` for Win32, `UISettings.ColorValuesChanged` for UWP/WPF). Provide an API layer mirroring `ThemeController` methods.

### Theme Management
- Apply classes: `.dark` on `document.documentElement` (root) and `data-theme="dark|light"` attribute.
- Variables: `index.css` defines light/dark palettes for background, surface, text, primary/secondary/accent, semantic (error/warning/success), charts, and sidebar.
- Animations: Smooth transitions for `background-color`, `color`, `border-color` with reduced-motion respect.
- Manual override: Buttons in `App.jsx` set `light`, `dark`, or `system`.

### WCAG Contrast
- Colors chosen with OKLCH values targeting WCAG 2.1:
  - 4.5:1 for normal text
  - 3:1 for large text and UI components
- Validate with tools like `axe-core`, `Deque Color Contrast`, or `Chrome Lighthouse`.

### Assets & Icons
- Use `resolveThemedAsset({ light, dark })` from `theme-controller` to pick the correct asset.
- Provide light/dark variants for SVGs and images; prefer CSS `currentColor` for icons where possible.
- Optional: Custom cursors per theme via `body { cursor: url(light.cur), auto }` and `.dark body { cursor: url(dark.cur), auto }`.

### Persistence & Sync
- Storage: `localStorage` key `app.theme.v2` with `{ mode, version }`.
- Migration: Legacy keys `app.theme` or `theme` auto-migrate on first run.
- Cross-tab: Listens to `storage` events to apply changes in all tabs.
- Conflict policy: User override (`light`/`dark`) wins over system. `system` follows OS.

### Testing & QA
- OS Matrix: Verify on Windows 10/11, including runtime preference switches.
- Displays: Test high-DPI and multiple monitors.
- Visual validation: Screenshot comparison per theme; manual pass of all components.
- Performance: Measure toggle responsiveness (<200ms target) and memory impact.
- Accessibility: Run contrast audits and screen reader checks.

### Development Guidelines
- Naming: Use CSS variables aligned with logical roles (`--background`, `--foreground`, `--primary`, etc.).
- Components: Read colors from variables; avoid hardcoded colors.
- New theme-aware components: Read `useTheme()` if behavior differs by mode.

### Maintenance Procedures
- Adding components: Ensure styles use theme variables and test both themes.
- Debugging: Inspect `documentElement.classList` for `.dark`; check `localStorage` key; verify `matchMedia` state.
- Visual regression: Maintain per-theme snapshots; run cross-tab sync checks.

## Rendering Fixes (Badge/Card)
- Verified import aliases (`@` -> `src`) in `vite.config.js` and confirmed named exports in `src/components/ui/badge.jsx` and `src/components/ui/card.jsx`.
- Fixed `Badge` `outline` variant to include a visible `border` for proper outlined appearance.
- Added `src/components/ErrorBoundary.jsx` and wrapped `SectionCards` in `App.jsx` to isolate and catch rendering issues.
- Confirmed Tailwind v4 tokens and CSS variables in `src/index.css` ensure classes like `bg-card` and `text-card-foreground` render correctly.

### Testing & Verification
- Run `npm run dev` and visit the local preview to verify components render without errors.
- Check browser console for warnings; none observed during smoke tests.
- Verified responsive behavior on typical viewport sizes; container queries in `CardHeader` depend on modern browser support.

### Cross-Browser Notes
- The UI uses CSS variables and container queries. Test in latest Chrome, Firefox, and Safari for full support. For legacy browsers, consider fallbacks if strict compatibility is required.
