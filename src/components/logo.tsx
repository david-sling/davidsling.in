import type { SVGProps } from "react";

/** David's chevron mark, carried over from the previous site. Fills with currentColor. */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 79 72" fill="currentColor" aria-hidden {...props}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0L0 13.99L18.317 13.99L52.8 36L18.317 58.01L0 58.01L0 72L22.598 72L79 36L22.598 0L0 0Z"
      />
    </svg>
  );
}
