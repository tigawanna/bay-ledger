import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/solid-router";
import { FiCheck, FiCopy, FiRotateCw } from "solid-icons/fi";
import { createSignal, onCleanup, Show, type JSX } from "solid-js";

export function toAppError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string") return new Error(error);
  return new Error("Unknown error");
}

export function formatErrorForCopy(error: Error) {
  const parts = [`${error.name}: ${error.message}`];
  if (error.stack) parts.push(error.stack);
  if (error.cause instanceof Error) {
    parts.push(`Caused by: ${error.cause.stack ?? `${error.cause.name}: ${error.cause.message}`}`);
  } else if (error.cause !== undefined) {
    try {
      parts.push(`Caused by: ${JSON.stringify(error.cause)}`);
    } catch {
      parts.push("Caused by: [unserializable]");
    }
  }
  return parts.join("\n\n");
}

export type ErrorTemplateProps = {
  error: unknown;
  title?: string;
  description?: string;
  onRetry?: () => void;
  showHome?: boolean;
  layout?: "page" | "inline";
  children?: JSX.Element;
};

export function ErrorTemplate(props: ErrorTemplateProps) {
  const resolved = () => toAppError(props.error);
  const layout = () => props.layout ?? "inline";
  const title = () => props.title ?? "This view hit a snag";
  const description = () =>
    props.description ??
    "Something on this screen failed. Reload, or head back and pick up where you left off.";

  return (
    <div
      data-slot="error-template"
      data-layout={layout()}
      class={
        layout() === "page"
          ? "bg-background relative h-full min-h-0 w-full flex-1 overflow-y-auto"
          : "bg-background relative flex min-h-0 w-full flex-1 flex-col overflow-y-auto rounded-lg border border-border"
      }
    >
      <div class="relative flex min-h-full flex-col">
        <div
          class={
            layout() === "page"
              ? "relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-16"
              : "relative z-10 flex flex-1 flex-col items-center justify-center px-6 py-12"
          }
        >
          <div class="flex max-w-md flex-col items-center text-center">
            <h2
              class={
                layout() === "page"
                  ? "text-4xl leading-tight tracking-[-0.03em] text-balance text-foreground md:text-5xl"
                  : "text-2xl leading-tight tracking-[-0.03em] text-balance text-foreground"
              }
            >
              {title()}
            </h2>
            <p class="mt-5 max-w-[40ch] text-base leading-7 text-pretty text-muted-foreground">
              {description()}
            </p>
            <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Show when={props.showHome ?? layout() === "page"}>
                <Button as={Link} to="/" data-test="error-template-home">
                  Back home
                </Button>
              </Show>
              <Show when={props.onRetry}>
                <Button
                  type="button"
                  variant={props.showHome ?? layout() === "page" ? "ghost" : "outline"}
                  data-test="error-template-retry"
                  onClick={() => props.onRetry?.()}
                >
                  <FiRotateCw class="size-3.5" />
                  Try again
                </Button>
              </Show>
              {props.children}
            </div>
          </div>
        </div>
        <Show when={import.meta.env.DEV}>
          <ErrorDevelopmentPanel error={resolved()} />
        </Show>
      </div>
    </div>
  );
}

function ErrorDevelopmentPanel(props: { error: Error }) {
  const [copied, setCopied] = createSignal(false);
  let copyReset: ReturnType<typeof setTimeout> | undefined;

  onCleanup(() => {
    if (copyReset) clearTimeout(copyReset);
  });

  const copyStackTrace = async () => {
    await navigator.clipboard.writeText(formatErrorForCopy(props.error));
    setCopied(true);
    if (copyReset) clearTimeout(copyReset);
    copyReset = setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      data-test="error-template-development"
      class="relative z-10 border-t border-border bg-muted/80 px-4 py-5 backdrop-blur-sm"
    >
      <div class="mx-auto w-full max-w-3xl">
        <div class="flex items-center justify-between gap-4">
          <p class="text-xs font-medium text-muted-foreground">Development details</p>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={copyStackTrace}
            data-test="error-template-copy"
          >
            <Show when={copied()} fallback={<FiCopy class="size-3.5" />}>
              <FiCheck class="size-3.5" />
            </Show>
            {copied() ? "Copied" : "Copy stack"}
          </Button>
        </div>
        <p class="mt-3 font-mono text-sm text-primary">{props.error.name}</p>
        <p class="mt-1 font-mono text-sm leading-6 text-muted-foreground">{props.error.message}</p>
        <Show when={props.error.stack}>
          <details class="mt-4">
            <summary class="cursor-pointer text-sm text-muted-foreground">Stack trace</summary>
            <pre class="mt-3 max-h-64 overflow-auto rounded-lg border border-border bg-background p-3 font-mono text-xs leading-5">
              {props.error.stack}
            </pre>
          </details>
        </Show>
      </div>
    </div>
  );
}
