import { splitProps, type JSX } from "solid-js";

import { cx } from "~/lib/styling/cva";

export type LabelProps = JSX.LabelHTMLAttributes<HTMLLabelElement>;

export function Label(props: LabelProps) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <label class={cx("text-sm leading-none font-medium select-none", local.class)} {...rest} />
  );
}
