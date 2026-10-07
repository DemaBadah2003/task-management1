import type { SVGProps } from 'react';
const SvgFolder = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    fill="none"
    viewBox="0 0 20 20"
    {...props}
  >
    <path
      stroke="#041B3C"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3.333 16.667h13.334A1.666 1.666 0 0 0 18.333 15V6.667A1.667 1.667 0 0 0 16.667 5h-6.609a1.67 1.67 0 0 1-1.383-.75l-.684-1a1.67 1.67 0 0 0-1.383-.75H3.333a1.667 1.667 0 0 0-1.666 1.667V15c0 .917.75 1.667 1.666 1.667"
    />
  </svg>
);
export default SvgFolder;
