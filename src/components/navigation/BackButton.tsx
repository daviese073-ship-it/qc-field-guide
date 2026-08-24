import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/Button";

interface BackButtonProps {
  label: string;
  onBack: () => void;
}

export function BackButton({ label, onBack }: BackButtonProps) {
  return (
    <Button onClick={onBack} variant="ghost">
      <ArrowLeft className="h-4 w-4" aria-hidden />
      {label}
    </Button>
  );
}
