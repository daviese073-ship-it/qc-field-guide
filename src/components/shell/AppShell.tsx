import type { PropsWithChildren } from "react";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader
        appName="QC Field Guide"
        homeLabel="QC Field Guide home"
        languageLabel="Language preference"
        searchLabel="Search"
      />
      <div className="lg:flex">
        <AppSidebar />
        <main className="min-w-0 flex-1 px-4 py-5 md:px-6 lg:px-7">
          {children}
        </main>
      </div>
    </div>
  );
}
