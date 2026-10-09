import * as React from 'react';
import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement> & { size?: number | string };

const SvgCalendarDays = ({ size = '1em', ...props }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 11 12"
    {...props}
  >
    <path
      fill="#434654"
      fillOpacity={0.8}
      d="M1.167 11.667q-.482 0-.824-.343A1.12 1.12 0 0 1 0 10.5V2.333q0-.48.343-.824.342-.342.824-.342h.583V0h1.167v1.167h4.666V0H8.75v1.167h.583q.482 0 .824.342.343.344.343.824V10.5q0 .48-.343.824a1.12 1.12 0 0 1-.824.343zm0-1.167h8.166V4.667H1.167zm0-7h8.166V2.333H1.167zm0 0V2.333z"
    />
  </svg>
);
export default SvgCalendarDays;
