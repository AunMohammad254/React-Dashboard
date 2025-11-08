const THEME_STORAGE_KEY = "app.theme.v2";
const THEME_STORAGE_OLD_KEYS = ["app.theme", "theme"];
const THEME_VERSION = 2;

// theme modes: 'light' | 'dark' | 'system'
class ThemeEmitter {
  constructor() {
    this.listeners = new Set();
  }
  on(cb) {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }
  emit(payload) {
    this.listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (_) {}
    });
  }
}

function readStoredPreference() {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      if (
        obj &&
        (obj.mode === "light" || obj.mode === "dark" || obj.mode === "system")
      ) {
        return obj;
      }
    }
    for (const key of THEME_STORAGE_OLD_KEYS) {
      const legacy = localStorage.getItem(key);
      if (legacy) {
        const value = legacy.replace(/"/g, "");
        if (["light", "dark", "system"].includes(value)) {
          const migrated = { mode: value, version: THEME_VERSION };
          localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(migrated));
          localStorage.removeItem(key);
          return migrated;
        }
      }
    }
  } catch (_) {}
  return null;
}

function storePreference(mode) {
  try {
    const payload = { mode, version: THEME_VERSION };
    localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(payload));
  } catch (_) {}
}

function getSystemPrefersDark() {
  const mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
  if (!mq) return false; // fallback to light
  return mq.matches;
}

function applyThemeClass(effectiveTheme) {
  const root = document.documentElement;
  const isDark = effectiveTheme === "dark";
  root.classList.toggle("dark", isDark);
  root.setAttribute("data-theme", isDark ? "dark" : "light");
}

export const ThemeController = (() => {
  let initialized = false;
  let mode = "system"; // user preference: 'light' | 'dark' | 'system'
  let effective = "light"; // applied: 'light' | 'dark'
  const emitter = new ThemeEmitter();
  let mq;

  function computeEffective(m) {
    if (m === "light" || m === "dark") return m;
    return getSystemPrefersDark() ? "dark" : "light";
  }

  function notify() {
    emitter.emit({ mode, effective });
  }

  function handleSystemChange() {
    const nextEffective = computeEffective(mode);
    if (nextEffective !== effective) {
      effective = nextEffective;
      applyThemeClass(effective);
      notify();
    }
  }

  function init() {
    if (initialized) return;
    initialized = true;
    const stored = readStoredPreference();
    if (stored && stored.mode) mode = stored.mode;
    effective = computeEffective(mode);
    applyThemeClass(effective);
    try {
      mq = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)");
      if (mq && typeof mq.addEventListener === "function") {
        mq.addEventListener("change", handleSystemChange);
      } else if (mq && typeof mq.addListener === "function") {
        // Safari < 14
        mq.addListener(handleSystemChange);
      }
    } catch (_) {}
    window.addEventListener("storage", (e) => {
      if (e.key === THEME_STORAGE_KEY) {
        try {
          const obj = JSON.parse(e.newValue);
          if (obj && obj.mode && obj.mode !== mode) {
            mode = obj.mode;
            const nextEffective = computeEffective(mode);
            if (nextEffective !== effective) {
              effective = nextEffective;
              applyThemeClass(effective);
            }
            notify();
          }
        } catch (_) {}
      }
    });
    notify();
  }

  function setTheme(nextMode) {
    if (!["light", "dark", "system"].includes(nextMode)) return;
    if (nextMode === mode) return;
    mode = nextMode;
    storePreference(mode);
    const nextEffective = computeEffective(mode);
    if (nextEffective !== effective) {
      effective = nextEffective;
      applyThemeClass(effective);
    }
    notify();
  }

  function getTheme() {
    return mode;
  }

  function getEffectiveTheme() {
    return effective;
  }

  function onChange(cb) {
    return emitter.on(cb);
  }

  return {
    init,
    setTheme,
    getTheme,
    getEffectiveTheme,
    onChange,
  };
})();

// Asset helper: provide themed asset path based on effective theme
export function resolveThemedAsset({ light, dark }) {
  const isDark = ThemeController.getEffectiveTheme() === "dark";
  return isDark ? dark ?? light : light ?? dark;
}