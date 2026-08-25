import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { AppProviders } from "@/app/providers";
import { ActivityModeTabs } from "@/components/activity/ActivityModeTabs";
import { CriticalFlagRow } from "@/components/activity/CriticalFlagRow";
import { QuickChecklistGroup } from "@/components/activity/QuickChecklistGroup";
import { ContentBlockRenderer } from "@/components/content/ContentBlockRenderer";
import { EmptySafeRenderer } from "@/components/content/EmptySafeRenderer";
import { LocalizedText } from "@/components/content/LocalizedText";
import { RelationshipStrip } from "@/components/navigation/RelationshipStrip";
import { AppShell } from "@/components/shell/AppShell";
import { clonePhase003ValidationDataset } from "@/data/development/phase003ValidationDataset";
import { buildActivityScreenModel } from "@/services/screenContracts";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

import {
  contentItemFixture,
  paragraphBlockFixture
} from "../fixtures/domainFixtures";

const preference = { mode: "en" } as const;

const bilingualPreference = {
  mode: "bilingual",
  bilingualPrimary: "en"
} as const;

const groupLabels = {
  before: "Before",
  gates: "Gates",
  interfaces: "Interfaces",
  workflows: "Workflows",
  testing: "Testing",
  commissioning: "Commissioning",
  after: "After",
  closeout: "Closeout"
};

const exampleLabels = {
  situation: "Situation",
  observation: "Observation",
  qualityConcern: "Quality concern",
  reasoning: "Reasoning",
  actionPath: "Action path",
  closure: "Closure",
  lesson: "Lesson"
};

function LocationProbe() {
  const location = useLocation();

  return (
    <output aria-label="current route">
      {location.pathname + location.search}
    </output>
  );
}

const renderInRouter = (node: ReactNode, initialEntry = "/") =>
  render(
    <AppProviders>
      <MemoryRouter initialEntries={[initialEntry]}>{node}</MemoryRouter>
    </AppProviders>
  );

const getActivityModel = () => {
  const registries = validateCanonicalDataset(
    clonePhase003ValidationDataset()
  ).registries;

  return buildActivityScreenModel(registries, "10.3");
};

describe("Phase 006 component architecture", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("app shell uses real home, search, and language controls without route-check scaffolding", () => {
    renderInRouter(
      <AppShell>
        <h1>Current screen</h1>
      </AppShell>
    );

    expect(
      screen.getAllByRole("link", { name: "QC Field Guide home" })[0]
    ).toHaveAttribute("href", "/");
    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveAttribute(
      "placeholder",
      "Search inspections, systems, topics..."
    );
    expect(screen.queryByText("Ctrl + K")).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /General QC Processes/i })
    ).toHaveAttribute("href", "/search?q=general%20qc%20processes");
    expect(screen.queryByText("Not saved yet")).not.toBeInTheDocument();
    expect(screen.queryByText("Not tracked yet")).not.toBeInTheDocument();
    expect(screen.queryByText("System Status")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("navigation", { name: "Development route checks" })
    ).not.toBeInTheDocument();
  });

  it("app shell highlights canonical sidebar destinations with aria-current", () => {
    renderInRouter(
      <AppShell>
        <h1>System screen</h1>
      </AppShell>,
      "/section/10"
    );

    expect(
      screen.getByRole("link", { name: /Fire & Life-Safety Construction/i })
    ).toHaveAttribute("aria-current", "page");
    expect(
      screen.getByRole("link", { name: /General QC Processes/i })
    ).toHaveAttribute("href", "/search?q=general%20qc%20processes");
    expect(
      screen.queryByRole("link", { name: "QC Think" })
    ).not.toBeInTheDocument();
  });

  it("language switch updates storage without changing the current route", async () => {
    const user = userEvent.setup();

    renderInRouter(
      <>
        <LocationProbe />
        <AppShell>
          <h1>Activity route</h1>
        </AppShell>
      </>,
      "/activity/10.3?mode=learn"
    );

    expect(
      screen.queryByRole("button", { name: "EN/FR" })
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /^FR$/ }));

    expect(screen.getByLabelText("current route")).toHaveTextContent(
      "/activity/10.3?mode=learn"
    );
    expect(
      localStorage.getItem("qc-field-guide:language-preference")
    ).toContain('"mode":"fr"');
  });

  it("localized text centralizes bilingual fallback behavior", () => {
    render(
      <LocalizedText
        preference={bilingualPreference}
        value={{ en: "Evidence", fr: "Preuves" }}
      />
    );

    expect(screen.getByText("Evidence / Preuves")).toBeInTheDocument();
  });

  it("empty-safe renderer returns nothing for missing or empty data", () => {
    const { container, rerender } = render(
      <EmptySafeRenderer value={[]}>
        {() => <div>Visible</div>}
      </EmptySafeRenderer>
    );

    expect(container).toBeEmptyDOMElement();

    rerender(
      <EmptySafeRenderer value={["value"]}>
        {([value]) => <div>{value}</div>}
      </EmptySafeRenderer>
    );

    expect(screen.getByText("value")).toBeInTheDocument();
  });

  it("relationship strip renders only populated groups supplied by screen contracts", () => {
    const model = getActivityModel();

    renderInRouter(
      <RelationshipStrip
        groupLabels={groupLabels}
        groups={model.relationshipGroups}
        nodeId={model.activityId}
        preference={preference}
      />
    );

    expect(screen.getByRole("heading", { name: "Before" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Gates" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Testing" })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Fictional Gate" })
    ).toHaveAttribute("href", "/gate/G-STR-01");
  });

  it("relationship strip renders nothing for empty groups", () => {
    const { container } = renderInRouter(
      <RelationshipStrip
        groupLabels={groupLabels}
        groups={[]}
        nodeId="10.3"
        preference={preference}
      />
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("activity mode tabs hide unavailable modes and call the supplied mode handler", async () => {
    const user = userEvent.setup();
    const onModeChange = vi.fn();

    render(
      <ActivityModeTabs
        ariaLabel="Activity modes"
        availableModes={["quick", "learn"]}
        currentMode="quick"
        labels={{ quick: "Quick", full: "Full", learn: "Learn" }}
        onModeChange={onModeChange}
      />
    );

    expect(screen.getByRole("tab", { name: "Quick" })).toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: "Full" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Learn" }));

    expect(onModeChange).toHaveBeenCalledWith("learn");
  });

  it("critical flag row renders only labelled supported flags", () => {
    render(
      <CriticalFlagRow
        flags={["highControl", "unknownFlag", "recheckIfModified"]}
        labels={{
          highControl: "High-Control",
          recheckIfModified: "Recheck if Modified"
        }}
      />
    );

    expect(screen.getByText("High-Control")).toBeInTheDocument();
    expect(screen.getByText("Recheck if Modified")).toBeInTheDocument();
    expect(screen.queryByText("unknownFlag")).not.toBeInTheDocument();
  });

  it("quick checklist group renders supplied content and hides empty groups", () => {
    const { container, rerender } = renderInRouter(
      <QuickChecklistGroup items={[]} preference={preference} title="Before" />
    );

    expect(container).toBeEmptyDOMElement();

    rerender(
      <MemoryRouter>
        <QuickChecklistGroup
          conditionLabels={{ whereApplicable: "Where applicable" }}
          items={[{ type: "checkList", items: [contentItemFixture] }]}
          preference={preference}
          title="Before"
        />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Before" })).toBeInTheDocument();
    expect(screen.getByText("Fictional fixture text.")).toBeInTheDocument();
    expect(screen.getByText("Where applicable")).toBeInTheDocument();
  });

  it("content block renderer handles controlled block shapes without generic rich text", () => {
    renderInRouter(
      <ContentBlockRenderer
        blocks={[
          paragraphBlockFixture,
          {
            type: "example",
            example: {
              situation: { en: "Fictional situation." },
              lesson: { en: "Fictional lesson." }
            }
          }
        ]}
        practicalExampleLabels={exampleLabels}
        preference={preference}
      />
    );

    expect(screen.getByText("Fictional fixture text.")).toBeInTheDocument();
    expect(screen.getByText("Fictional situation.")).toBeInTheDocument();
    expect(screen.getByText("Fictional lesson.")).toBeInTheDocument();
    expect(screen.queryByText("Observation")).not.toBeInTheDocument();
  });
});
