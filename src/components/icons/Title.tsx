import type { SVGProps } from 'react';

const TitleIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="12"
    height="12"
    viewBox="0 0 16 16"
    fill="none"
    {...props}
  >
    <circle cx="8" cy="8" r="8" fill="#BA1A1A" />
    <path fill="#FFFFFF" d="M7.25 4.5h1.5v1.5h-1.5zM7.25 7.5h1.5v4h-1.5z" />
  </svg>
);

export default TitleIcon;
