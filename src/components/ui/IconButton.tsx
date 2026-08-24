import type { ButtonHTMLAttributes, ReactNode } from "react";

import { Button } from "./Button";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: ReactNode;
};

export function IconButton({ icon, label, ...props }: IconButtonProps) {
  return (
    <Button aria-label={label} title={label} variant="ghost" {...props}>
      {icon}
    </Button>
  );
}
