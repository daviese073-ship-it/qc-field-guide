import type { PropsWithChildren } from "react";

import { AppHeader } from "./AppHeader";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <AppHeader
        appName="QC Field Guide"
        homeLabel="QC Field Guide home"
        languageLabel="Language preference"
        searchLabel="Search"
      />
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
