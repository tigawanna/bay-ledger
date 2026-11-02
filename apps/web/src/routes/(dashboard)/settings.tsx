import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import { useThemeContext, type Theme } from "~/components/theme/theme-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
  RadioGroupItemControl,
  RadioGroupItemIndicator,
  RadioGroupItemInput,
  RadioGroupItemLabel,
} from "~/components/ui/radio-group";
import { displayName, resolveAuthSession } from "~/lib/auth/session";

export const Route = createFileRoute("/(dashboard)/settings")({
  component: SettingsPage,
});

const themes: { value: Theme; label: string; hint: string }[] = [
  { value: "light", label: "Light", hint: "Bright warehouse floor" },
  { value: "dark", label: "Dark", hint: "Night shift" },
  { value: "system", label: "System", hint: "Follow the device" },
];

function SettingsPage() {
  const { theme, setTheme } = useThemeContext();
  const session = resolveAuthSession();

  return (
    <div class="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Settings</h1>
        <p class="text-muted-foreground mt-1 text-sm">
          Appearance and account for {displayName(session)}.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>How Bayledger looks on this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={theme()} onChange={(value) => setTheme(value as Theme)}>
            <For each={themes}>
              {(item) => (
                <RadioGroupItem value={item.value} class="flex items-center gap-3 py-1.5">
                  <RadioGroupItemInput />
                  <RadioGroupItemControl>
                    <RadioGroupItemIndicator />
                  </RadioGroupItemControl>
                  <RadioGroupItemLabel>
                    <span class="block font-medium">{item.label}</span>
                    <span class="text-muted-foreground text-xs">{item.hint}</span>
                  </RadioGroupItemLabel>
                </RadioGroupItem>
              )}
            </For>
          </RadioGroup>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Read from the signed-in Cognito session.</CardDescription>
        </CardHeader>
        <CardContent class="grid gap-3 text-sm">
          <Row label="Name" value={displayName(session)} />
          <Row label="Email" value={session?.email ?? session?.username} />
          <Row label="Role" value={session?.role} />
          <Row label="Groups" value={session?.groups.join(", ")} />
        </CardContent>
      </Card>
    </div>
  );
}

function Row(props: { label: string; value?: string }) {
  return (
    <div class="flex items-center justify-between gap-4">
      <Label class="text-muted-foreground font-normal">{props.label}</Label>
      <span class="truncate font-medium">{props.value || "—"}</span>
    </div>
  );
}
