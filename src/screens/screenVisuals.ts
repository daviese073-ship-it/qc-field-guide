import {
  BadgeCheck,
  Building2,
  ClipboardCheck,
  Construction,
  DoorOpen,
  Fan,
  Flame,
  Hammer,
  HardHat,
  Home,
  Layers,
  PaintRoller,
  ScrollText,
  Shield,
  Shovel,
  Trees,
  Users,
  Warehouse,
  Zap,
  type LucideIcon
} from "lucide-react";

type VisualMeta = {
  Icon: LucideIcon;
  accent: string;
  soft: string;
  border: string;
};

const defaultVisual: VisualMeta = {
  Icon: Layers,
  accent: "text-blue-700",
  soft: "bg-blue-50",
  border: "border-blue-300"
};

const sectionVisuals: Record<string, VisualMeta> = {
  "1": {
    Icon: Shovel,
    accent: "text-emerald-700",
    soft: "bg-emerald-50",
    border: "border-emerald-300"
  },
  "2": {
    Icon: Warehouse,
    accent: "text-teal-700",
    soft: "bg-teal-50",
    border: "border-teal-300"
  },
  "3": {
    Icon: Construction,
    accent: "text-blue-700",
    soft: "bg-blue-50",
    border: "border-blue-300"
  },
  "4": {
    Icon: Building2,
    accent: "text-sky-700",
    soft: "bg-sky-50",
    border: "border-sky-300"
  },
  "5": {
    Icon: Home,
    accent: "text-violet-700",
    soft: "bg-violet-50",
    border: "border-violet-300"
  },
  "6": {
    Icon: DoorOpen,
    accent: "text-purple-700",
    soft: "bg-purple-50",
    border: "border-purple-300"
  },
  "7": {
    Icon: PaintRoller,
    accent: "text-fuchsia-700",
    soft: "bg-fuchsia-50",
    border: "border-fuchsia-300"
  },
  "8": {
    Icon: Fan,
    accent: "text-orange-700",
    soft: "bg-orange-50",
    border: "border-orange-300"
  },
  "9": {
    Icon: Zap,
    accent: "text-amber-700",
    soft: "bg-amber-50",
    border: "border-amber-300"
  },
  "10": {
    Icon: Flame,
    accent: "text-red-700",
    soft: "bg-red-50",
    border: "border-red-300"
  },
  "11": {
    Icon: Users,
    accent: "text-cyan-700",
    soft: "bg-cyan-50",
    border: "border-cyan-300"
  },
  "12": {
    Icon: Trees,
    accent: "text-green-700",
    soft: "bg-green-50",
    border: "border-green-300"
  },
  "13": {
    Icon: ClipboardCheck,
    accent: "text-blue-700",
    soft: "bg-blue-50",
    border: "border-blue-300"
  },
  "14": {
    Icon: ScrollText,
    accent: "text-stone-700",
    soft: "bg-stone-50",
    border: "border-stone-300"
  }
};

const tagStyles: Record<string, string> = {
  highControl: "border-red-200 bg-red-50 text-red-700",
  interfaceCritical: "border-orange-200 bg-orange-50 text-orange-700",
  preConcealment: "border-amber-200 bg-amber-50 text-amber-700",
  traceabilityCritical: "border-blue-200 bg-blue-50 text-blue-700",
  specialistInterface: "border-violet-200 bg-violet-50 text-violet-700",
  acceptanceGate: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

export const activityVisuals = {
  default: { Icon: Shield, soft: "bg-blue-50", accent: "text-blue-700" },
  fire: { Icon: Flame, soft: "bg-red-50", accent: "text-red-700" },
  workflow: {
    Icon: ClipboardCheck,
    soft: "bg-blue-50",
    accent: "text-blue-700"
  },
  gate: { Icon: BadgeCheck, soft: "bg-emerald-50", accent: "text-emerald-700" },
  preConcealment: {
    Icon: Hammer,
    soft: "bg-red-50",
    accent: "text-red-700"
  },
  work: { Icon: HardHat, soft: "bg-slate-100", accent: "text-slate-700" }
};

export function getSectionVisual(sectionId?: string): VisualMeta {
  return sectionId
    ? (sectionVisuals[sectionId] ?? defaultVisual)
    : defaultVisual;
}

export function getTagClass(tag: string) {
  return tagStyles[tag] ?? "border-slate-200 bg-slate-50 text-slate-700";
}
