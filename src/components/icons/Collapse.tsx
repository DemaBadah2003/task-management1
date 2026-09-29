import * as React from 'react';
import type { SVGProps } from 'react';
const SvgCollapse = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 12 20"
    {...props}
  >
    <path
      fill="#041B3C"
      d="M10 20 0 10 10 0l1.775 1.775L3.55 10l8.225 8.225z"
    />
  </svg>
);
export default SvgCollapse;
