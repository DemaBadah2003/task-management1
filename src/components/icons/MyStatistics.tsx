import * as React from 'react';
import type { SVGProps } from 'react';
const SvgMyStatistics = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 16 16"
    {...props}
  >
    <path fill="#fff" fillOpacity={0.01} d="M0 0h16v16H0z" />
    <path
      fill="#0F172A"
      fillRule="evenodd"
      d="M12.267 1.067c.294 0 .533.238.533.533v12.8a.533.533 0 0 1-1.066 0V1.6c0-.295.238-.533.533-.533M10.134 3.2c.294 0 .533.239.533.533V14.4a.533.533 0 0 1-1.067 0V3.733c0-.294.239-.533.534-.533m4.266 0c.295 0 .534.239.534.533V14.4a.533.533 0 0 1-1.067 0V3.733c0-.294.239-.533.533-.533M5.867 4.267c.294 0 .533.238.533.533v9.6a.533.533 0 0 1-1.066 0V4.8c0-.295.238-.533.533-.533M1.6 5.333c.295 0 .534.24.534.534V14.4a.533.533 0 0 1-1.067 0V5.867c0-.295.239-.534.533-.534m6.4 0c.295 0 .534.24.534.534V14.4a.533.533 0 0 1-1.067 0V5.867c0-.295.239-.534.533-.534M3.734 7.467c.294 0 .533.238.533.533v6.4a.533.533 0 0 1-1.067 0V8c0-.295.239-.533.534-.533"
      clipRule="evenodd"
    />
  </svg>
);
export default SvgMyStatistics;
