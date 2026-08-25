import type { SVGProps } from "react";

export function SubstructureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M6 4h3a2 2 0 0 1 2 2v6a1 1 0 0 0 1 1h6a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2" />
    </svg>
  );
}

export function SuperstructureIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M3 21h18" />
      <path d="M9 8h1" />
      <path d="M9 12h1" />
      <path d="M9 16h1" />
      <path d="M14 8h1" />
      <path d="M14 12h1" />
      <path d="M14 16h1" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  );
}

export function BuildingEnvelopeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="M3 21V8l9-4 9 4v13" />
      <path d="M13 13h4v8H7v-6h6" />
      <path d="M13 21v-9a1 1 0 0 0-1-1h-2a1 1 0 0 0-1 1v3" />
    </svg>
  );
}

export function MultidisciplinaryInterfacesIcon(
  props: SVGProps<SVGSVGElement>
) {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M0 0h24v24H0z" fill="none" stroke="none" />
      <path d="m5.931 6.936 1.275 4.249m5.607 5.609 4.251 1.275" />
      <path d="m11.683 12.317 5.759-5.759" />
      <path d="M4 5.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0" />
      <path d="M17 5.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0" />
      <path d="M17 18.5a1.5 1.5 0 1 0 3 0 1.5 1.5 0 1 0-3 0" />
      <path d="M4 15.5a4.5 4.5 0 1 0 9 0 4.5 4.5 0 1 0-9 0" />
    </svg>
  );
}
