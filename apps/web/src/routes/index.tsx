import { Link, createFileRoute } from "@tanstack/solid-router";
import { Logo } from "~/components/icon/logo";
import { ThemeToggle } from "~/components/theme/ThemeToggle";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  return (
    <main class="flex flex-col items-center justify-center gap-5">
      <header class="w-full flex flex-row justify-between items-center">
        <Logo class="w-10 h-10" />
        <ThemeToggle />
      </header>
      <div class="grid grid-cols-2 gap-4 w-full h-sfull">
        <div class="flex flex-col justify-center items-center gap-2 bg-muted/40 p-4 rounded-lg aspect-video">
          <Link to="/messages" class="text-2xl font-bold">
            Messages
          </Link>
        </div>
        <div class="flex flex-col justify-center items-center gap-2 bg-muted/40 p-4 rounded-lg aspect-video">
          <Link to="/messages" class="text-2xl font-bold">
            Messages
          </Link>
        </div>
      </div>
    </main>
  );
}
