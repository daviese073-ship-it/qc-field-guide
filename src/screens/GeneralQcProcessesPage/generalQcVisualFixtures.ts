import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardPenLine,
  Eye,
  FileQuestion,
  FileSearch,
  FileText,
  FlaskConical,
  FolderClosed,
  Link,
  PackageCheck,
  RefreshCw,
  ShieldAlert,
  Wrench,
  type LucideIcon
} from "lucide-react";

export type GeneralQcAccent =
  "teal" | "blue" | "amber" | "purple" | "green" | "orange" | "red" | "cyan";

export type GeneralQcVisualProcess = {
  accent: GeneralQcAccent;
  Icon: LucideIcon;
};

export const generalQcVisualsById: Record<string, GeneralQcVisualProcess> = {
  "general-qc-inspection-planning": {
    accent: "teal",
    Icon: ClipboardPenLine
  },
  "general-qc-requirement-review": {
    accent: "blue",
    Icon: FileSearch
  },
  "general-qc-itp-execution": {
    accent: "amber",
    Icon: ClipboardPenLine
  },
  "general-qc-hold-witness-points": {
    accent: "purple",
    Icon: Eye
  },
  "general-qc-inspection-acceptance": {
    accent: "green",
    Icon: CheckCircle2
  },
  "general-qc-deficiency-reporting": {
    accent: "orange",
    Icon: AlertTriangle
  },
  "general-qc-ncr": {
    accent: "red",
    Icon: ShieldAlert
  },
  "general-qc-corrective-action": {
    accent: "blue",
    Icon: Wrench
  },
  "general-qc-reinspection-verification": {
    accent: "cyan",
    Icon: RefreshCw
  },
  "general-qc-quality-evidence": {
    accent: "purple",
    Icon: Camera
  },
  "general-qc-testing-records": {
    accent: "orange",
    Icon: FlaskConical
  },
  "general-qc-material-receiving": {
    accent: "green",
    Icon: PackageCheck
  },
  "general-qc-rfi-clarification": {
    accent: "blue",
    Icon: FileQuestion
  },
  "general-qc-change-document-control": {
    accent: "amber",
    Icon: FileText
  },
  "general-qc-traceability": {
    accent: "teal",
    Icon: Link
  },
  "general-qc-quality-closeout": {
    accent: "purple",
    Icon: FolderClosed
  }
};
