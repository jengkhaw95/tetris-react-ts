import React from "react";

export default function IconDisconnect({
  className,
  size,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={`icon icon-tabler icon-tabler-user ${className}`}
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      strokeWidth="2"
      stroke="currentColor"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
      <path d="M20 16l-4 4"></path>
      <path d="M7 12l5 5l-1.5 1.5a3.536 3.536 0 1 1 -5 -5l1.5 -1.5z"></path>
      <path d="M17 12l-5 -5l1.5 -1.5a3.536 3.536 0 1 1 5 5l-1.5 1.5z"></path>
      <path d="M3 21l2.5 -2.5"></path>
      <path d="M18.5 5.5l2.5 -2.5"></path>
      <path d="M10 11l-2 2"></path>
      <path d="M13 14l-2 2"></path>
      <path d="M16 16l4 4"></path>
    </svg>
  );
}
