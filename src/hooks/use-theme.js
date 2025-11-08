import { useEffect, useState, useMemo } from "react";
import { ThemeController } from "@/lib/theme-controller";

export function useTheme() {
  const [mode, setModeState] = useState(ThemeController.getTheme());
  const [effective, setEffectiveState] = useState(
    ThemeController.getEffectiveTheme()
  );

  useEffect(() => {
    ThemeController.init();
    const unsubscribe = ThemeController.onChange(({ mode, effective }) => {
      setModeState(mode);
      setEffectiveState(effective);
    });
    return unsubscribe;
  }, []);

  const api = useMemo(
    () => ({
      mode,
      effective,
      setTheme: ThemeController.setTheme,
    }),
    [mode, effective]
  );

  return api;
}