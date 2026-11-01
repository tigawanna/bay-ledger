import { For, splitProps, type ComponentProps } from "solid-js";
import { cx } from "~/lib/styling/cva";

type BarsProps = ComponentProps<"span"> & { bars?: number };

export function Bars(props: BarsProps) {
  const [local, rest] = splitProps(props, ["class", "bars"]);
  const bars = () => {
    const count = local.bars ?? 3;
    return Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 3;
  };

  return (
    <>
      <style>{`
        @keyframes loading-ui-wave-bars {
          0%,
          100% {
            transform: scaleY(1);
            opacity: 0.5;
          }

          50% {
            transform: scaleY(0.6);
            opacity: 1;
          }
        }
      `}</style>
      <span role="status" class={cx("inline-flex items-stretch gap-[5%]", local.class)} {...rest}>
        <For each={Array.from({ length: bars() }, (_, index) => index)}>
          {(index) => (
            <span
              aria-hidden="true"
              class="inline-block h-full rounded-[1px] bg-current"
              style={{
                width: `${100 / bars()}%`,
                animation: "loading-ui-wave-bars var(--duration, 1.2s) ease-in-out infinite",
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
