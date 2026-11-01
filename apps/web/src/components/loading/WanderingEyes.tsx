import { For, splitProps, type ComponentProps, type JSX } from "solid-js";
import { cx } from "~/lib/styling/cva";

type WanderingEyesProps = ComponentProps<"span"> & {
  eyeScale?: number;
  gapScale?: number;
  pupilScale?: number;
  blinkScale?: number;
  travelScale?: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function WanderingEyes(props: WanderingEyesProps) {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "eyeScale",
    "gapScale",
    "pupilScale",
    "blinkScale",
    "travelScale",
  ]);

  const eyesStyle = (): JSX.CSSProperties => {
    const safeEyeScale = clamp(local.eyeScale ?? 0.62, 0.28, 0.7);
    const safeGapScale = clamp(local.gapScale ?? 0.09, 0.04, 0.3);
    const safePupilScale = clamp(local.pupilScale ?? 0.32, 0.12, 0.45);
    const safeBlinkScale = clamp(local.blinkScale ?? 0.375, 0.15, 1);
    const safeTravelScale = clamp(local.travelScale ?? 0.3125, 0.08, 0.5);

    return {
      ...(typeof local.style === "object" ? local.style : {}),
      "--loading-ui-wandering-eyes-eye": `${(safeEyeScale * 100).toFixed(2)}cqmin`,
      "--loading-ui-wandering-eyes-gap": `${(safeGapScale * 100).toFixed(2)}cqmin`,
      "--loading-ui-wandering-eyes-pupil-scale": `${safePupilScale}`,
      "--loading-ui-wandering-eyes-blink": `${safeBlinkScale}`,
      "--loading-ui-wandering-eyes-travel-scale": `${safeTravelScale}`,
    } as JSX.CSSProperties;
  };

  return (
    <>
      <style>{`
        @keyframes loading-ui-wandering-eyes-move {
          0%,
          10% {
            background-position: 0 0;
          }

          13%,
          40% {
            background-position: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale) * -1) 0;
          }

          43%,
          70% {
            background-position: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale)) 0;
          }

          73%,
          90% {
            background-position: 0 calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-travel-scale));
          }

          93%,
          100% {
            background-position: 0 0;
          }
        }

        @keyframes loading-ui-wandering-eyes-blink {
          0%,
          10%,
          12%,
          20%,
          22%,
          40%,
          42%,
          60%,
          62%,
          70%,
          72%,
          90%,
          92%,
          98%,
          100% {
            height: var(--loading-ui-wandering-eyes-eye);
          }

          11%,
          21%,
          41%,
          61%,
          71%,
          91%,
          99% {
            height: calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-blink));
          }
        }
      `}</style>
      <span
        role="status"
        class={cx(
          "@container-size relative inline-flex aspect-9/4 items-center justify-center align-middle [--eye-color:color-mix(in_srgb,currentColor_16%,transparent)] [--pupil-color:currentColor]",
          local.class,
        )}
        style={eyesStyle()}
        {...rest}
      >
        <span
          aria-hidden="true"
          class="inline-flex items-center justify-center gap-(--loading-ui-wandering-eyes-gap)"
        >
          <For each={[0, 1]}>
            {() => (
              <span
                class="inline-block rounded-full"
                style={{
                  width: "var(--loading-ui-wandering-eyes-eye)",
                  height: "var(--loading-ui-wandering-eyes-eye)",
                  "background-color": "var(--eye-color)",
                  "background-image":
                    "radial-gradient(circle calc(var(--loading-ui-wandering-eyes-eye) * var(--loading-ui-wandering-eyes-pupil-scale)), var(--pupil-color) 100%, transparent 0)",
                  "background-repeat": "no-repeat",
                  animation:
                    "loading-ui-wandering-eyes-move var(--duration, 10s) infinite, loading-ui-wandering-eyes-blink var(--duration, 10s) infinite",
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
