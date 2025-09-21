import type { SVGProps } from "react";

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v0A2.5 2.5 0 0 1 9.5 7h-3A2.5 2.5 0 0 1 4 4.5v0A2.5 2.5 0 0 1 6.5 2Z" />
      <path d="M14.5 2A2.5 2.5 0 0 1 17 4.5v0A2.5 2.5 0 0 1 14.5 7h-3a2.5 2.5 0 0 1-2.5-2.5v0A2.5 2.5 0 0 1 11.5 2Z" />
      <path d="M12 7.5V9" />
      <path d="M8 7.5V9" />
      <path d="M16 7.5V9" />
      <path d="M8.5 14a.5.5 0 0 0-1 0v1a.5.5 0 0 0 1 0Z" />
      <path d="m14 18-2-2-2 2" />
      <path d="M12 16V9.5" />
      <path d="M10.5 12H13" />
      <path d="M4.3 10.3c-1.3 2.4-1.3 5.4 0 7.8" />
      <path d="M19.7 10.3c1.3 2.4 1.3 5.4 0 7.8" />
      <path d="M10 22h4" />
    </svg>
  ),
};
