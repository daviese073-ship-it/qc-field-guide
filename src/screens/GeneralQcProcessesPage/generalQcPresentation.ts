import { ClipboardPenLine } from "lucide-react";

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
  }
> = {
  teal: {
    circle: "bg-[#dff5f2]",
    text: "text-[#0f9f9a]",
    border: "hover:border-[#8fd8d3]",
    side: "bg-[#0f9f9a]"
  },
  blue: {
    circle: "bg-[#e6eeff]",
    text: "text-[#2563eb]",
    border: "hover:border-[#a9c1ff]",
    side: "bg-[#2563eb]"
  },
  amber: {
    circle: "bg-[#fff2d8]",
    text: "text-[#f59e0b]",
    border: "hover:border-[#f3c86f]",
    side: "bg-[#f59e0b]"
  },
  purple: {
    circle: "bg-[#eee7ff]",
    text: "text-[#7c3aed]",
    border: "hover:border-[#c4b1ff]",
    side: "bg-[#7c3aed]"
  },
  green: {
    circle: "bg-[#e5f5e6]",
    text: "text-[#4caf50]",
    border: "hover:border-[#a7d9a9]",
    side: "bg-[#4caf50]"
  },
  orange: {
    circle: "bg-[#fde8d7]",
    text: "text-[#f97316]",
    border: "hover:border-[#f7ba87]",
    side: "bg-[#f97316]"
  },
  red: {
    circle: "bg-[#fde7e7]",
    text: "text-[#ef4444]",
    border: "hover:border-[#f5aaaa]",
    side: "bg-[#ef4444]"
  },
  cyan: {
    circle: "bg-[#ddf4f5]",
    text: "text-[#149da5]",
    border: "hover:border-[#96dadd]",
    side: "bg-[#149da5]"
  }
};

export const getGeneralQcVisual = (id: string) =>
  generalQcVisualsById[id] ?? {
    accent: "blue",
    Icon: ClipboardPenLine
  };
