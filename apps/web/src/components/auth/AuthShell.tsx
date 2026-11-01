import { Link } from "@tanstack/solid-router";
import type { JSX } from "solid-js";
import { Logo } from "~/components/icon/logo";
import { ThemeToggle } from "~/components/theme/ThemeToggle";

export function AuthShell(props: { title: string; description: string; children: JSX.Element }) {
  return (
    <div class="bg-background flex min-h-svh flex-col">
      <header class="flex items-center justify-between px-6 py-4">
        <Link to="/sign-in" class="flex items-center gap-2">
          <Logo class="size-8" />
          <span class="text-lg font-semibold tracking-wide">Bayledger</span>
        </Link>
        <ThemeToggle />
      </header>
      <main class="flex flex-1 justify-center px-4 pt-6 pb-16">
        <div class="w-full max-w-md">
          <h1 class="text-2xl font-semibold tracking-tight text-balance">{props.title}</h1>
          <p class="text-muted-foreground mt-2 max-w-[46ch] text-pretty">{props.description}</p>
          <div class="mt-8">{props.children}</div>
        </div>
      </main>
    </div>
  );
}
