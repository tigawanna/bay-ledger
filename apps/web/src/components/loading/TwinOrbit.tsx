import { splitProps, type ComponentProps } from "solid-js";
import { cx } from "~/lib/styling/cva";

export function TwinOrbit(props: ComponentProps<"span">) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <>
      <style>{`
        @keyframes loading-ui-twin-orbit-rotate {
          100% {
            transform: rotate(360deg) translate(155%);
          }
        }
      `}</style>
      <span
        role="status"
        class={cx("relative inline-block aspect-square rounded-full bg-current", local.class)}
        {...rest}
      >
        <span
          aria-hidden="true"
          class="absolute inset-0 rounded-full bg-current"
          style={{
            transform: "rotate(0deg) translate(155%)",
            animation: "loading-ui-twin-orbit-rotate var(--duration, 1s) ease infinite",
          }}
        />
        <span
          aria-hidden="true"
          class="absolute inset-0 rounded-full bg-current"
          style={{
            transform: "rotate(0deg) translate(155%)",
            animation: "loading-ui-twin-orbit-rotate var(--duration, 1s) ease infinite",
            "animation-delay": "calc(var(--duration, 1s) / 2)",
          }}
        />
        <span class="sr-only">Loading</span>
      </span>
    </>
  );
}
