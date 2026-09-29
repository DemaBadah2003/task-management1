import * as React from 'react';
import type { SVGProps } from 'react';
const SvgEpics = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 18"
    {...props}
  >
    <path
      fill="#041B3C"
      d="M13 18v-3H9V5H7v3H0V0h7v3h6V0h7v8h-7V5h-2v8h2v-3h7v8zM2 2v4zm13 10v4zm0-10v4zm0 4h3V2h-3zm0 10h3v-4h-3zM2 6h3V2H2z"
    />
  </svg>
);
export default SvgEpics;
