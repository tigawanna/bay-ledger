import {
  createContext,
  createEffect,
  createSignal,
  onCleanup,
  useContext,
  type JSX,
} from "solid-js";
import { isServer } from "solid-js/web";

export type ResolvedTheme = "dark" | "light";
export type Theme = ResolvedTheme | "system";

interface ThemeProviderProps {
  children: JSX.Element;
  defaultTheme?: Theme;
  storageKey?: string;
}

interface ThemeProviderState {
  theme: () => Theme;
  resolvedTheme: () => ResolvedTheme;
  setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState>();

function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return theme;
}

function applyResolvedTheme(resolved: ResolvedTheme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(resolved);
  root.setAttribute("data-theme", resolved);
  root.setAttribute("data-kb-theme", resolved);
}

function themeBootScript(storageKey: string) {
  return `(function(key){try{var stored=localStorage.getItem(key);var isDark=stored==="dark"||((stored===null||stored==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);var resolved=isDark?"dark":"light";var root=document.documentElement;root.setAttribute("data-theme",resolved);root.setAttribute("data-kb-theme",resolved);root.classList.add(resolved);}catch(e){}})(${JSON.stringify(storageKey)})`;
}

export function ThemeProvider(props: ThemeProviderProps) {
  const storageKey = () => props.storageKey ?? "bayledger.theme";
  const defaultTheme = () => props.defaultTheme ?? "system";
  const [theme, setThemeSignal] = createSignal<Theme>(defaultTheme());
  const [resolvedTheme, setResolvedTheme] = createSignal<ResolvedTheme>("light");

  createEffect(() => {
    if (isServer) return;
    const stored = localStorage.getItem(storageKey()) as Theme | null;
    if (stored === "dark" || stored === "light" || stored === "system") {
      setThemeSignal(stored);
    }
  });

  createEffect(() => {
    if (isServer) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const current = theme();

    function applyTheme() {
      const resolved = resolveTheme(current);
      applyResolvedTheme(resolved);
      setResolvedTheme(resolved);
    }

    mediaQuery.addEventListener("change", applyTheme);
    applyTheme();
    onCleanup(() => mediaQuery.removeEventListener("change", applyTheme));
  });

  const setTheme = (newTheme: Theme) => {
    localStorage.setItem(storageKey(), newTheme);
    const resolved = resolveTheme(newTheme);

    const apply = () => {
      applyResolvedTheme(resolved);
      setResolvedTheme(resolved);
      setThemeSignal(newTheme);
    };

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reduceMotion && typeof document.startViewTransition === "function") {
      document.startViewTransition(apply);
      return;
    }

    apply();
  };

  const value: ThemeProviderState = {
    theme,
    resolvedTheme,
    setTheme,
  };

  return (
    <ThemeProviderContext.Provider value={value}>
      <script innerText={themeBootScript(storageKey())} />
      {props.children}
    </ThemeProviderContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useThemeContext must be used within a ThemeProvider");
  }
  return context;
}
