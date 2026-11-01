import { Button } from "@/components/ui/button";
import { FiMoon, FiSun } from "solid-icons/fi";
import { Match, Switch } from "solid-js";
import { useThemeContext } from "./theme-provider";



export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();
  return (
    <Switch>
      <Match when={theme() === "dark"}>
        <Button variant="outline" onClick={() => setTheme("light")}>
          <FiMoon class="size-4" />
        </Button>
      </Match>
      <Match when={theme() === "light"}>
        <Button variant="outline" onClick={() => setTheme("dark")}>
          <FiSun class="size-4" />
        </Button>
      </Match>
    </Switch>
  );
}
