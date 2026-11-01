import { For, splitProps, type ComponentProps, type JSX } from "solid-js";
import { cx } from "~/lib/styling/cva";

type PulsatingDotsProps = ComponentProps<"span"> & { dots?: number; duration?: number };

export function PulsatingDots(props: PulsatingDotsProps) {
  const [local, rest] = splitProps(props, ["class", "dots", "duration", "style"]);
  const dots = () => {
    const count = local.dots ?? 3;
    return Number.isFinite(count) ? Math.max(1, Math.floor(count)) : 3;
  };
  const duration = () => (Number.isFinite(local.duration) ? local.duration! : 1);

  const rootStyle = (): JSX.CSSProperties =>
    ({
      ...(typeof local.style === "object" ? local.style : {}),
      "--duration": `${duration()}s`,
    }) as JSX.CSSProperties;

  return (
    <>
      <style>{`
        @keyframes loading-ui-pulsating-dots {
          0%,
          100% {
            transform: scale(1);
            opacity: 0.5;
          }

          50% {
            transform: scale(1.5);
            opacity: 1;
          }
        }
      `}</style>
      <span
        role="status"
        class={cx("inline-flex items-center justify-center", local.class)}
        style={rootStyle()}
        {...rest}
      >
        <span aria-hidden="true" class="inline-flex w-full gap-[16%]">
          <For each={Array.from({ length: dots() }, (_, index) => index)}>
            {(index) => (
              <span
                class="inline-block aspect-square grow rounded-full bg-current"
                style={{
                  animation: "loading-ui-pulsating-dots var(--duration, 1s) ease-in-out infinite",
                  "animation-delay": `${index * 0.3}s`,
                }}
              />
            )}
          </For>
        </span>
        <span class="sr-only">Loading</span>
      </span>
    </>
  );
}
