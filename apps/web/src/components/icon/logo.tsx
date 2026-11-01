import type { JSX } from "solid-js";

export function Logo(props: JSX.SvgSVGAttributes<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width={props.width || "80"}
      height={props.height || "80"}
      fill="none"
      viewBox="0 0 24 24"
    >
      <path
        stroke="#904c4c"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M8 11h2m-2 7 3-3 2 2 3-3M13 3H8.2c-1.12 0-1.68 0-2.108.218a2 2 0 0 0-.874.874C5 4.52 5 5.08 5 6.2v11.6c0 1.12 0 1.68.218 2.108a2 2 0 0 0 .874.874C6.52 21 7.08 21 8.2 21h7.6c1.12 0 1.68 0 2.108-.218a2 2 0 0 0 .874-.874C19 19.48 19 18.92 19 17.8V9m-6-6 6 6m-6-6v4.4c0 .56 0 .84.109 1.054a1 1 0 0 0 .437.437C13.76 9 14.04 9 14.6 9H19"
      />
    </svg>
  );
}
