import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardCheck,
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
  UserRoundCheck,
  Wrench,
  type LucideIcon
} from "lucide-react";

export type GeneralQcAccent =
  "teal" | "blue" | "amber" | "purple" | "green" | "orange" | "red" | "cyan";

export type GeneralQcVisualProcess = {
  id: string;
  title: string;
  description: string;
  accent: GeneralQcAccent;
  Icon: LucideIcon;
};

export type GeneralQcRailItem = {
  id: string;
  title: string;
  description: string;
  accent: GeneralQcAccent;
  Icon: LucideIcon;
};

export type GeneralQcTip = GeneralQcRailItem;

// Temporary presentation-only fixtures for the Phase 017 visual rebuild.
// These are not canonical General QC process records and are not indexed.
export const generalQcVisualProcesses: GeneralQcVisualProcess[] = [
  {
    id: "visual-inspection-planning",
    title: "Inspection Planning",
    description: "Plan inspections and prepare for success.",
    accent: "teal",
    Icon: ClipboardPenLine
  },
  {
    id: "visual-requirement-review",
    title: "Requirement Review",
    description: "Review documents and applicable requirements.",
    accent: "blue",
    Icon: FileSearch
  },
  {
    id: "visual-itp-pie-prie",
    title: "ITP / PIE / PRIE Execution",
    description: "Execute inspection plans and checklists.",
    accent: "amber",
    Icon: ClipboardPenLine
  },
  {
    id: "visual-hold-witness",
    title: "Hold & Witness Points",
    description: "Identify and manage hold and witness points.",
    accent: "purple",
    Icon: Eye
  },
  {
    id: "visual-inspection-acceptance",
    title: "Inspection & Acceptance",
    description: "Inspect work and determine acceptance.",
    accent: "green",
    Icon: CheckCircle2
  },
  {
    id: "visual-deficiency-reporting",
    title: "Deficiency Reporting",
    description: "Report deficiencies that do not yet constitute NCRs.",
    accent: "orange",
    Icon: AlertTriangle
  },
  {
    id: "visual-non-conformity",
    title: "Non-Conformity Reporting",
    description: "Report and manage non-conformities (NCRs).",
    accent: "red",
    Icon: ShieldAlert
  },
  {
    id: "visual-corrective-action",
    title: "Corrective Action",
    description: "Implement and verify corrective actions.",
    accent: "blue",
    Icon: Wrench
  },
  {
    id: "visual-reinspection",
    title: "Reinspection & Verification",
    description: "Reinspect and verify corrected work.",
    accent: "cyan",
    Icon: RefreshCw
  },
  {
    id: "visual-quality-evidence",
    title: "Quality Evidence & Photo Documentation",
    description: "Capture, organize and maintain objective evidence.",
    accent: "purple",
    Icon: Camera
  },
  {
    id: "visual-testing-records",
    title: "Testing & Test Records",
    description: "Manage testing activities and records.",
    accent: "orange",
    Icon: FlaskConical
  },
  {
    id: "visual-material-receiving",
    title: "Material Receiving & Verification",
    description: "Verify materials and manage deliveries.",
    accent: "green",
    Icon: PackageCheck
  },
  {
    id: "visual-rfi",
    title: "RFI / Technical Clarification",
    description: "Request and track technical clarifications.",
    accent: "blue",
    Icon: FileQuestion
  },
  {
    id: "visual-change-control",
    title: "Change & Revised Document Control",
    description: "Control changes and revised documents.",
    accent: "amber",
    Icon: FileText
  },
  {
    id: "visual-traceability",
    title: "Traceability",
    description: "Maintain traceability of activities, records and approvals.",
    accent: "teal",
    Icon: Link
  },
  {
    id: "visual-quality-closeout",
    title: "Quality Closeout",
    description: "Complete quality requirements and close out.",
    accent: "purple",
    Icon: FolderClosed
  }
];

export const generalQcCommonlyUsedVisualItems: GeneralQcRailItem[] = [
  {
    id: "visual-non-conformity",
    title: "Non-Conformity Reporting",
    description: "Report and manage NCRs",
    accent: "red",
    Icon: ShieldAlert
  },
  {
    id: "visual-inspection-acceptance",
    title: "Inspection & Acceptance",
    description: "Inspect work and accept",
    accent: "green",
    Icon: CheckCircle2
  },
  {
    id: "visual-hold-witness",
    title: "Hold & Witness Points",
    description: "Control key inspection points",
    accent: "purple",
    Icon: Eye
  },
  {
    id: "visual-corrective-action",
    title: "Corrective Action",
    description: "Implement and verify actions",
    accent: "blue",
    Icon: Wrench
  },
  {
    id: "visual-reinspection",
    title: "Reinspection & Verification",
    description: "Verify corrected work",
    accent: "cyan",
    Icon: RefreshCw
  }
];

export const generalQcFieldTipVisualItems: GeneralQcTip[] = [
  {
    id: "visual-tip-photos",
    title: "Take clear, time-stamped photos",
    description: "Good evidence saves time and prevents disputes.",
    accent: "green",
    Icon: Camera
  },
  {
    id: "visual-tip-requirement",
    title: "Verify the requirement first",
    description: 'Always confirm what "good" looks like before inspecting.',
    accent: "blue",
    Icon: ClipboardCheck
  },
  {
    id: "visual-tip-communicate",
    title: "Communicate early",
    description: "Early communication prevents rework and delays.",
    accent: "amber",
    Icon: UserRoundCheck
  },
  {
    id: "visual-tip-close-loop",
    title: "Close the loop",
    description: "Ensure corrective actions are verified and properly closed.",
    accent: "purple",
    Icon: FolderClosed
  }
];
