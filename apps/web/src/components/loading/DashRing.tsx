import { splitProps, type ComponentProps } from "solid-js";
import { cx } from "~/lib/styling/cva";

export function DashRing(props: ComponentProps<"svg">) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      role="status"
      aria-label="Loading"
      class={cx(local.class)}
      {...rest}
    >
      <circle cx="12" cy="12" r="9.5" opacity="0.1" stroke-width="2" stroke-linecap="round" />
      <circle cx="12" cy="12" r="9.5" stroke-width="2" stroke-linecap="round">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 12 12"
          to="360 12 12"
          dur="2s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dasharray"
          values="0 150;42 150;42 150"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
        <animate
          attributeName="stroke-dashoffset"
          values="0;-16;-59"
          keyTimes="0;0.5;1"
          dur="1.5s"
          repeatCount="indefinite"
        />
      </circle>
    </svg>
  );
}
