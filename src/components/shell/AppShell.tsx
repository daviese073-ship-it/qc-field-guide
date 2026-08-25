import type { PropsWithChildren } from "react";

import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="qcfg-app-shell">
      <AppSidebar />
      <div className="min-h-screen md:pl-[274px]">
        <AppHeader
          appName="QC/QA"
          homeLabel="QC Field Guide home"
          languageLabel="Language preference"
          searchLabel="Search"
        />
        <main className="qcfg-main-surface min-w-0 p-4 md:min-h-[calc(100vh-92px)] md:pb-6 md:pl-6 md:pr-[18px] md:pt-6">
          {children}
        </main>
      </div>
    </div>
  );
}
