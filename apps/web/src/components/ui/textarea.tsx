import { splitProps, type JSX } from "solid-js";

import { cx } from "~/lib/styling/cva";

export type TextareaProps = JSX.TextareaHTMLAttributes<HTMLTextAreaElement>;

export function Textarea(props: TextareaProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <textarea
      class={cx(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
}
