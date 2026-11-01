import { For, splitProps, type ComponentProps } from "solid-js";
import { cx } from "~/lib/styling/cva";

type BouncingDotsProps = ComponentProps<"span"> & { dots?: number };

export function BouncingDots(props: BouncingDotsProps) {
  const [local, rest] = splitProps(props, ["class", "dots"]);
  const dots = () => {
    const count = local.dots ?? 3;
    return Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 3;
  };

  return (
    <>
      <style>{`
        @keyframes loading-ui-bouncing-dots {
          0%,
          100% {
            transform: scale(0.8);
            opacity: 0.5;
          }

          50% {
            transform: scale(1.2);
            opacity: 1;
          }
        }
      `}</style>
      <span role="status" class={cx("inline-flex items-center gap-[12%]", local.class)} {...rest}>
        <For each={Array.from({ length: dots() }, (_, index) => index)}>
          {(index) => (
            <span
              aria-hidden="true"
              class="inline-block aspect-square grow rounded-full bg-current"
              style={{
                animation: "loading-ui-bouncing-dots var(--duration, 1.4s) ease-in-out infinite",
                "animation-delay": `calc(var(--delay, 0.2s) * ${index})`,
              }}
            />
          )}
        </For>
        <span class="sr-only">Loading</span>
      </span>
    </>
  );
}
