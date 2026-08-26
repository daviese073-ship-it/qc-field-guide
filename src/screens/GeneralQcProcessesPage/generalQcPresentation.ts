import {
  Bell,
  Camera,
  CheckCircle2,
  ClipboardCheck,
  ClipboardPenLine,
  FileCheck2,
  FileSearch,
  FlaskConical,
  FolderClosed,
  LockKeyhole,
  PackageCheck,
  RefreshCw,
  Scale,
  SearchCheck,
  Target,
  UsersRound,
  Wrench
} from "lucide-react";

import {
  generalQcVisualsById,
  type GeneralQcAccent
} from "./generalQcVisualFixtures";

export const accentClasses: Record<
  GeneralQcAccent,
  {
    circle: string;
    text: string;
    border: string;
    side: string;
    hex: string;
    softBorder: string;
  }
> = {
  teal: {
    circle: "bg-[#dff5f2]",
    text: "text-[#0f9f9a]",
    border: "hover:border-[#8fd8d3]",
    side: "bg-[#0f9f9a]",
    hex: "#0f9f9a",
    softBorder: "border-[#8fd8d3]"
  },
  blue: {
    circle: "bg-[#e6eeff]",
    text: "text-[#2563eb]",
    border: "hover:border-[#a9c1ff]",
    side: "bg-[#2563eb]",
    hex: "#2563eb",
    softBorder: "border-[#a9c1ff]"
  },
  amber: {
    circle: "bg-[#fff2d8]",
    text: "text-[#f59e0b]",
    border: "hover:border-[#f3c86f]",
    side: "bg-[#f59e0b]",
    hex: "#f59e0b",
    softBorder: "border-[#f3c86f]"
  },
  purple: {
    circle: "bg-[#eee7ff]",
    text: "text-[#7c3aed]",
    border: "hover:border-[#c4b1ff]",
    side: "bg-[#7c3aed]",
    hex: "#7c3aed",
    softBorder: "border-[#c4b1ff]"
  },
  green: {
    circle: "bg-[#e5f5e6]",
    text: "text-[#4caf50]",
    border: "hover:border-[#a7d9a9]",
    side: "bg-[#4caf50]",
    hex: "#4caf50",
    softBorder: "border-[#a7d9a9]"
  },
  orange: {
    circle: "bg-[#fde8d7]",
    text: "text-[#f97316]",
    border: "hover:border-[#f7ba87]",
    side: "bg-[#f97316]",
    hex: "#f97316",
    softBorder: "border-[#f7ba87]"
  },
  red: {
    circle: "bg-[#fde7e7]",
    text: "text-[#ef4444]",
    border: "hover:border-[#f5aaaa]",
    side: "bg-[#ef4444]",
    hex: "#ef1f2d",
    softBorder: "border-[#f5aaaa]"
  },
  cyan: {
    circle: "bg-[#ddf4f5]",
    text: "text-[#149da5]",
    border: "hover:border-[#96dadd]",
    side: "bg-[#149da5]",
    hex: "#149da5",
    softBorder: "border-[#96dadd]"
  }
};

export const getGeneralQcVisual = (id: string) =>
  generalQcVisualsById[id] ?? {
    accent: "blue",
    Icon: ClipboardPenLine
  };

const workflowIconRules = [
  {
    test: /notify|coordinate|assign|distribute|communicate/,
    Icon: UsersRound,
    tone: "purple"
  },
  {
    test: /control|contain|quarantine|withdraw|protect|maintain/,
    Icon: LockKeyhole,
    tone: "amber"
  },
  {
    test: /document|record|capture|photo|evidence|store|file/,
    Icon: Camera,
    tone: "green"
  },
  {
    test: /determine|evaluate|compare|classify|disposition|accept|reject/,
    Icon: Scale,
    tone: "orange"
  },
  {
    test: /implement|correct|repair|rework|resolve/,
    Icon: Wrench,
    tone: "blue"
  },
  {
    test: /reinspect|verify effectiveness|verify implementation|complete|close/,
    Icon: CheckCircle2,
    tone: "green"
  },
  {
    test: /test|measure|sample|witness test/,
    Icon: FlaskConical,
    tone: "blue"
  },
  {
    test: /delivery|material|receive|identify delivery/,
    Icon: PackageCheck,
    tone: "green"
  },
  {
    test: /review|requirement|drawing|document|revision|basis/,
    Icon: FileSearch,
    tone: "blue"
  },
  {
    test: /track|link|trace|preserve|transfer/,
    Icon: FolderClosed,
    tone: "purple"
  },
  { test: /readiness|prerequisite|confirm/, Icon: FileCheck2, tone: "blue" },
  { test: /repeat|retest/, Icon: RefreshCw, tone: "teal" },
  { test: /question|clarification|research/, Icon: SearchCheck, tone: "blue" },
  { test: /notice|point/, Icon: Bell, tone: "amber" },
  { test: /identify|define|select/, Icon: Target, tone: "red" }
] as const;

export const getGeneralQcWorkflowStepVisual = (action: string) => {
  const normalized = action.toLowerCase();
  const match = workflowIconRules.find((rule) => rule.test.test(normalized));

  return match ?? { Icon: ClipboardCheck, tone: "blue" as const };
};
