import { splitProps, type ComponentProps } from "solid-js";

const pixels = [
  { class: "pixel-1", x: 8, y: 0 },
  { class: "pixel-2", x: 12, y: 4 },
  { class: "pixel-3", x: 16, y: 8 },
  { class: "pixel-4", x: 12, y: 12 },
  { class: "pixel-5", x: 8, y: 16 },
  { class: "pixel-6", x: 4, y: 12 },
  { class: "pixel-7", x: 0, y: 8 },
  { class: "pixel-8", x: 4, y: 4 },
];

export function Diamond(props: ComponentProps<"svg">) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <svg viewBox="0 0 20 20" fill="currentColor" role="status" aria-label="Loading" class={local.class} {...rest}>
      <style>
        {`
          @keyframes spin-pixel {
            0% { opacity: 0; }
            1% { opacity: 1; }
            100% { opacity: 0; }
          }
          .pixel-1 { animation: spin-pixel 0.8s ease-in-out 0s infinite; }
          .pixel-2 { animation: spin-pixel 0.8s ease-in-out 0.1s infinite; }
          .pixel-3 { animation: spin-pixel 0.8s ease-in-out 0.2s infinite; }
          .pixel-4 { animation: spin-pixel 0.8s ease-in-out 0.3s infinite; }
          .pixel-5 { animation: spin-pixel 0.8s ease-in-out 0.4s infinite; }
          .pixel-6 { animation: spin-pixel 0.8s ease-in-out 0.5s infinite; }
          .pixel-7 { animation: spin-pixel 0.8s ease-in-out 0.6s infinite; }
          .pixel-8 { animation: spin-pixel 0.8s ease-in-out 0.7s infinite; }
        `}
      </style>
      {pixels.map((pixel) => (
        <rect class={pixel.class} x={pixel.x} y={pixel.y} width="4" height="4" />
      ))}
    </svg>
  );
}
