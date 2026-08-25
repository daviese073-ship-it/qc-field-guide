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
  tokenClass: string;
};

const defaultVisual: VisualMeta = {
  Icon: Layers,
  accent: "qcfg-system-default text-[var(--qcfg-system-accent)]",
  soft: "qcfg-system-default bg-[var(--qcfg-system-surface)]",
  border: "qcfg-system-default border-[color:var(--qcfg-system-border)]",
  tokenClass: "qcfg-system-default"
};

const sectionVisuals: Record<string, VisualMeta> = {
  "1": {
    Icon: Shovel,
    accent: "qcfg-system-earthworks text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-earthworks bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-earthworks border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-earthworks"
  },
  "2": {
    Icon: Warehouse,
    accent: "qcfg-system-substructure text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-substructure bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-substructure border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-substructure"
  },
  "3": {
    Icon: Construction,
    accent: "qcfg-system-superstructure text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-superstructure bg-[var(--qcfg-system-surface)]",
    border:
      "qcfg-system-superstructure border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-superstructure"
  },
  "4": {
    Icon: Building2,
    accent: "qcfg-system-envelope text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-envelope bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-envelope border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-envelope"
  },
  "5": {
    Icon: Home,
    accent: "qcfg-system-roofing text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-roofing bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-roofing border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-roofing"
  },
  "6": {
    Icon: DoorOpen,
    accent: "qcfg-system-interiors text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-interiors bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-interiors border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-interiors"
  },
  "7": {
    Icon: PaintRoller,
    accent: "qcfg-system-finishes text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-finishes bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-finishes border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-finishes"
  },
  "8": {
    Icon: Fan,
    accent: "qcfg-system-mechanical text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-mechanical bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-mechanical border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-mechanical"
  },
  "9": {
    Icon: Zap,
    accent: "qcfg-system-electrical text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-electrical bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-electrical border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-electrical"
  },
  "10": {
    Icon: Flame,
    accent: "qcfg-system-fire text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-fire bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-fire border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-fire"
  },
  "11": {
    Icon: Users,
    accent: "qcfg-system-interfaces text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-interfaces bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-interfaces border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-interfaces"
  },
  "12": {
    Icon: Trees,
    accent: "qcfg-system-external text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-external bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-external border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-external"
  },
  "13": {
    Icon: ClipboardCheck,
    accent: "qcfg-system-testing text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-testing bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-testing border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-testing"
  },
  "14": {
    Icon: ScrollText,
    accent: "qcfg-system-closeout text-[var(--qcfg-system-accent)]",
    soft: "qcfg-system-closeout bg-[var(--qcfg-system-surface)]",
    border: "qcfg-system-closeout border-[color:var(--qcfg-system-border)]",
    tokenClass: "qcfg-system-closeout"
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
  default: {
    Icon: Shield,
    soft: "bg-blue-50",
    accent: "text-[var(--qcfg-status-info)]"
  },
  fire: {
    Icon: Flame,
    soft: "bg-red-50",
    accent: "text-[var(--qcfg-status-critical)]"
  },
  workflow: {
    Icon: ClipboardCheck,
    soft: "bg-blue-50",
    accent: "text-[var(--qcfg-status-info)]"
  },
  gate: {
    Icon: BadgeCheck,
    soft: "bg-emerald-50",
    accent: "text-[var(--qcfg-status-success)]"
  },
  preConcealment: {
    Icon: Hammer,
    soft: "bg-red-50",
    accent: "text-[var(--qcfg-status-critical)]"
  },
  work: {
    Icon: HardHat,
    soft: "bg-slate-100",
    accent: "text-[var(--qcfg-status-reference)]"
  }
};

export function getSectionVisual(sectionId?: string): VisualMeta {
  return sectionId
    ? (sectionVisuals[sectionId] ?? defaultVisual)
    : defaultVisual;
}

export function getTagClass(tag: string) {
  return tagStyles[tag] ?? "border-slate-200 bg-slate-50 text-slate-700";
}
