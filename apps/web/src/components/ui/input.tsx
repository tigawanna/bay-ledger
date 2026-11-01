import { splitProps, type JSX } from "solid-js";

import { cx } from "~/lib/styling/cva";

export type InputProps = JSX.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <input
      class={cx(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
        local.class,
      )}
      {...rest}
    />
  );
}
