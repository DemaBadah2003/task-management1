import * as React from 'react';
import type { SVGProps } from 'react';
const SvgTasks = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 16"
    {...props}
  >
    <path
      fill="#041B3C"
      d="M3.55 15.075 0 11.525l1.4-1.4 2.125 2.125L7.775 8l1.4 1.425zm0-8L0 3.525l1.4-1.4L3.525 4.25 7.775 0l1.4 1.425zm7.45 6v-2h9v2zm0-8v-2h9v2z"
    />
  </svg>
);
export default SvgTasks;
