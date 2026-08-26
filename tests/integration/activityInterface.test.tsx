import { readFileSync } from "node:fs";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { productionRegistries } from "@/app/productionAppData";
import { routes } from "@/app/router";
import { buildActivityScreenModel } from "@/services/screenContracts";

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry]
  });

  return {
    router,
    ...render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    )
  };
}

const firstText = (blocks: NonNullable<unknown>) => {
  const typedBlocks = blocks as readonly {
    type: string;
    item?: { text?: { en: string } };
    items?: readonly { text: { en: string } }[];
  }[];
  const block = typedBlocks[0];

  return (block.items?.[0]?.text.en ?? block.item?.text?.en ?? "")
    .split(";")[0]
    .trim();
};

describe("Activity Quick / Full / Learn interface", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("uses one generic activity interface for arbitrary canonical activities", () => {
    for (const activityId of ["2.1", "10.3", "13.1"]) {
      const activity = productionRegistries.activities.getById(activityId);
      const { unmount } = renderRoute(`/activity/${activityId}`);

      expect(activity).toBeDefined();
      expect(screen.getByTestId("activity-interface")).toHaveAttribute(
        "data-activity-accent"
      );
      expect(
        screen.getByRole("heading", {
          name: new RegExp(`${activityId} .*${activity?.title.en}`)
        })
      ).toBeInTheDocument();

      unmount();
    }
  });

  it("keeps the same activity identity across Quick, Full, and Learn routes", () => {
    const quick = renderRoute("/activity/2.1");

    expect(screen.getByTestId("activity-id")).toHaveTextContent("2.1");
    expect(screen.getByRole("tab", { name: "Quick" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByRole("tab", { name: "Full" })).toHaveAttribute(
      "href",
      "/activity/2.1?mode=full"
    );
    expect(screen.getByRole("tab", { name: "Learn" })).toHaveAttribute(
      "href",
      "/activity/2.1?mode=learn"
    );

    quick.unmount();
    const full = renderRoute("/activity/2.1?mode=full");
    expect(screen.getByRole("tab", { name: "Full" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByTestId("activity-id")).toHaveTextContent("2.1");

    full.unmount();
    renderRoute("/activity/2.1?mode=learn");
    expect(screen.getByRole("tab", { name: "Learn" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByTestId("activity-id")).toHaveTextContent("2.1");
  });

  it("renders Quick mode from canonical QuickView fields without cross-activity leakage", () => {
    const quickView = productionRegistries.quickViews.getById("2.1");
    const otherQuickView = productionRegistries.quickViews.getById("10.3");

    expect(quickView?.inspect).toBeDefined();
    expect(otherQuickView?.inspect).toBeDefined();
    renderRoute("/activity/2.1");

    expect(
      screen.getByText(firstText(quickView?.inspect ?? []))
    ).toBeInTheDocument();
    expect(
      screen.queryByText(firstText(otherQuickView?.inspect ?? []))
    ).not.toBeInTheDocument();
  });

  it("preserves required Quick visual slots when optional source data is sparse", () => {
    renderRoute("/activity/2.4");

    expect(screen.getByTestId("quick-primary-grid")).toBeInTheDocument();
    expect(screen.getAllByTestId("quick-card")).toHaveLength(4);
    expect(screen.getByTestId("quick-do-not-miss")).toBeInTheDocument();
    expect(screen.getByTestId("quick-field-tip")).toHaveTextContent(
      "Information not available for this activity."
    );
    expect(screen.getByTestId("quick-info-panel")).toHaveTextContent("Stage");
    expect(screen.getByTestId("quick-info-panel")).toHaveTextContent(
      "Criticality"
    );
    expect(screen.getByTestId("quick-info-panel")).toHaveTextContent(
      "Quality Impact"
    );
    expect(screen.getAllByTestId("quick-unavailable-state").length)
      .toBeGreaterThan(0);
  });

  it("keeps required right-rail panels available even when a group is empty", () => {
    renderRoute("/activity/1.1");

    expect(
      screen.getByRole("heading", { name: "Next / Related Work" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Related Systems" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Related Inspections" })
    ).toBeInTheDocument();
    expect(
      screen.getByTestId("activity-view-all-unavailable")
    ).toBeDisabled();
  });

  it("maps canonical Full technical content into controlled presentation groups", () => {
    renderRoute("/activity/2.1?mode=full");

    expect(
      screen.getByRole("tab", { name: "Full" })
    ).toHaveAttribute("aria-selected", "true");
    expect(screen.getAllByTestId("full-group-row")).toHaveLength(10);
    expect(screen.getAllByText("Quality Objective").length).toBeGreaterThan(0);
    expect(screen.getByText("Planning & Preparation")).toBeInTheDocument();
    expect(screen.getByText("Acceptance & Closure")).toBeInTheDocument();
    expect(
      screen.getByText("latest structural foundation drawings;")
    ).toBeInTheDocument();
  });

  it("preserves all ten fixed Full rows when a group has no mapped source data", () => {
    renderRoute("/activity/2.4?mode=full");

    expect(screen.getAllByTestId("full-group-row")).toHaveLength(10);
    expect(screen.getAllByTestId("full-row-number")).toHaveLength(10);
    expect(screen.getAllByTestId("full-row-badge")).toHaveLength(10);
    expect(
      screen.getAllByText("Information not available for this activity.").length
    ).toBeGreaterThan(0);
  });

  it("renders Learn mode from canonical LearnContent and terminology references", () => {
    const learnContent = productionRegistries.learnContent.getById("2.1");

    expect(learnContent?.whatIsThis).toBeDefined();
    renderRoute("/activity/2.1?mode=learn");

    expect(screen.getByText("What is Foundation Formwork?")).toBeInTheDocument();
    expect(
      screen.getAllByText(firstText(learnContent?.whatIsThis ?? [])).length
    ).toBeGreaterThan(0);
    expect(screen.getByText("Key Principles")).toBeInTheDocument();
    expect(screen.getByTestId("learn-sequence")).toBeInTheDocument();
    expect(screen.getAllByTestId("learn-card")).toHaveLength(6);
  });

  it("preserves the fixed Learn template slots when source data is sparse", () => {
    renderRoute("/activity/2.4?mode=learn");

    expect(screen.getAllByTestId("learn-card")).toHaveLength(6);
    expect(screen.getByTestId("learn-sequence")).toBeInTheDocument();
    expect(screen.getByText(/What is/i)).toBeInTheDocument();
    expect(screen.getByText("Why It Matters")).toBeInTheDocument();
    expect(screen.getByText("Key Principles")).toBeInTheDocument();
    expect(screen.getByText("Common Interfaces")).toBeInTheDocument();
    expect(screen.getByText("Typical Materials")).toBeInTheDocument();
    expect(screen.getByText("Terms to Know")).toBeInTheDocument();
  });

  it("keeps the right rail sourced from relationship navigation groups", () => {
    const model = buildActivityScreenModel(productionRegistries, "2.1", "quick");
    const before = model.relationshipGroups.find(
      (group) => group.id === "before"
    );
    const after = model.relationshipGroups.find(
      (group) => group.id === "after"
    );

    renderRoute("/activity/2.1");

    expect(
      screen.getByRole("heading", { name: "Next / Related Work" })
    ).toBeInTheDocument();
    expect(before?.items.length).toBeGreaterThan(0);
    expect(after?.items.length).toBeGreaterThan(0);
    expect(
      screen.getByRole("link", {
        name: new RegExp(before?.items[0]?.relatedNodeId ?? "")
      })
    ).toHaveAttribute("href");
  });

  it("renders workflow and pre-concealment controls only when functional", () => {
    renderRoute("/activity/10.3");

    expect(screen.getByRole("link", { name: /Activity Mode:/i })).toHaveAttribute(
      "href"
    );
    expect(
      screen.getByRole("link", { name: /Pre-Concealment:/i })
    ).toHaveAttribute("href");
    expect(
      screen.getByRole("link", { name: /Firestop Inspection/i })
    ).toHaveAttribute("href", "/workflow/WF-FIRE-01");
    expect(
      screen.getByRole("link", { name: /Before Closing Fire-Rated Assembly/i })
    ).toHaveAttribute("href", "/preconcealment/PC-FIRE-01");
  });

  it("does not hard-code Foundation Formwork or section-specific layout branches", () => {
    const source = readFileSync(
      "src/screens/ActivityPage/ActivityPage.tsx",
      "utf8"
    );

    expect(source).not.toMatch(/activityId\s*===\s*["']2\.1["']/);
    expect(source).not.toMatch(/sectionId\s*===/);
    expect(source).not.toMatch(/Foundation\s+Formwork/);
  });

  it("keeps EN/FR mode changes on the same canonical activity route", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute("/activity/2.1?mode=learn");

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(router.state.location.pathname).toBe("/activity/2.1");
    expect(router.state.location.search).toBe("?mode=learn");
    expect(screen.getByTestId("activity-id")).toHaveTextContent("2.1");
  });

  it("uses different approved system accents for activities in different sections", () => {
    const foundation = renderRoute("/activity/2.1");
    expect(screen.getByTestId("activity-interface")).toHaveAttribute(
      "data-activity-accent",
      "qcfg-system-substructure"
    );

    foundation.unmount();
    renderRoute("/activity/10.3");
    expect(screen.getByTestId("activity-interface")).toHaveAttribute(
      "data-activity-accent",
      "qcfg-system-fire"
    );
  });

  it("does not add forbidden official project-QMS controls", () => {
    renderRoute("/activity/2.1");
    const main = screen.getByRole("main");

    for (const label of [
      "Project KPIs",
      "Completion %",
      "Approval",
      "Signature",
      "Assigned Contractor",
      "Due Date",
      "Live NCR"
    ]) {
      expect(within(main).queryByText(label)).not.toBeInTheDocument();
    }
  });
});
