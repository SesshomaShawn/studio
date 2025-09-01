import type { SVGProps } from 'react';

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0l9.3-9.3a1 1 0 0 0 0-1.41z" />
      <path d="M7 7h.01" />
      <path d="m15 12-4.5 4.5" />
      <path d="m12 15 4.5-4.5" />
    </svg>
  ),
};
