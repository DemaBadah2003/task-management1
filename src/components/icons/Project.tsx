import * as React from 'react';
import type { SVGProps } from 'react';

const SvgProject = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 22 16"
    aria-hidden="true"
    {...props}
  >
    <path
      fill="currentColor"
      d="M2 16q-.824 0-1.412-.588A1.93 1.93 0 0 1 0 14V2Q0 1.176.588.588A1.93 1.93 0 0 1 2 0h6l2 2h8q.824 0 1.413.587Q20 3.176 20 4H9.175l-2-2H2v12l2.4-8h17.1l-2.575 8.575a1.95 1.95 0 0 1-.738 1.038A2 2 0 0 1 17 16zm2.1-2H17l1.8-6H5.9zm0 0 1.8-6zM2 4V2z"
    />
  </svg>
);

export default SvgProject;
