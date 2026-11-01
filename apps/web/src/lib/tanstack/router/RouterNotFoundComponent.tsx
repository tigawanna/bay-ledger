import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/solid-router";
import { FiArrowLeft } from "solid-icons/fi";

export function RouterNotFoundComponent() {
  return (
    <div
      data-test="router-not-found"
      class="bg-background relative flex h-full min-h-screen w-full flex-1 items-center justify-center overflow-y-auto px-6 py-16"
    >
      <div class="flex max-w-lg flex-col items-center text-center">
        <p class="text-[clamp(4.5rem,12vw,7.5rem)] leading-none tracking-[-0.04em] text-foreground">
          404
        </p>
        <h1 class="mt-3 text-3xl leading-tight tracking-[-0.03em] text-balance md:text-4xl">
          This path is not in the app
        </h1>
        <p class="mt-4 max-w-[42ch] text-base leading-7 text-pretty text-muted-foreground">
          Nothing maps to this URL. Go home, or step back to the previous page.
        </p>
        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button as={Link} to="/" data-test="router-not-found-home">
            Back home
          </Button>
          <Button
            type="button"
            variant="ghost"
            data-test="router-not-found-back"
            onClick={() => window.history.back()}
          >
            <FiArrowLeft class="size-3.5" />
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}
