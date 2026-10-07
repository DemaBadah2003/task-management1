import * as React from 'react';
import type { SVGProps } from 'react';
const SvgSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 11 11"
    {...props}
  >
    <path
      fill="#737685"
      d="M9.683 10.5 6.008 6.825a3.555 3.555 0 0 1-2.217.758q-1.59 0-2.69-1.1Q0 5.38 0 3.791 0 2.202 1.101 1.1T3.791 0t2.691 1.101q1.101 1.1 1.101 2.69a3.56 3.56 0 0 1-.758 2.217L10.5 9.683zM3.792 6.417q1.094 0 1.859-.766.765-.765.766-1.86 0-1.092-.766-1.859a2.53 2.53 0 0 0-1.86-.765q-1.092 0-1.859.765-.765.765-.765 1.86 0 1.094.765 1.859t1.86.766"
    />
  </svg>
);
export default SvgSearch;
