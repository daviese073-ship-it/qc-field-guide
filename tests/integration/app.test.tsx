import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { productionRegistries } from "@/app/productionAppData";
import { routes } from "@/app/router";

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

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

describe("production route-bound screen composition", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders the production application shell and home route", () => {
    renderRoute("/");
    const main = screen.getByRole("main");

    expect(
      screen.getAllByRole("link", { name: "QC Field Guide home" })[0]
    ).toHaveAttribute("href", "/");
    expect(
      within(main).getByRole("heading", {
        name: "What will you inspect today?"
      })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Inspection Systems" })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Recently Visited Systems" })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Field Tips" })
    ).toBeInTheDocument();
    expect(screen.getAllByRole("searchbox", { name: "Search" })).toHaveLength(
      1
    );

    for (const section of productionRegistries.sections.getAll()) {
      expect(
        within(main).getByRole("link", {
          name: new RegExp(escapeRegExp(section.title.en))
        })
      ).toHaveAttribute("href", `/section/${section.id}`);
    }

    const fireSystemCard = within(main).getByRole("link", {
      name: /Fire & Life-Safety Construction/
    });

    expect(
      within(main).getByRole("link", { name: /View All Systems/i })
    ).toHaveAttribute("href", "#home-inspection-systems");
    expect(
      within(
        within(main).getByRole("heading", { name: "Inspection Systems" })
          .parentElement?.parentElement ?? main
      ).getAllByRole("link")
    ).toHaveLength(15);
    expect(
      within(fireSystemCard).getByText("8 activities")
    ).toBeInTheDocument();
  });

  it("does not render obsolete rejected Home elements", () => {
    renderRoute("/");
    const main = screen.getByRole("main");

    [
      "Quick Inspection",
      "What Are You Doing?",
      "Before Closing / Covering",
      "QC Think",
      "Production data",
      "Activity Mode / Workflows",
      "QC Principles",
      "System Status",
      "Tip of the Day"
    ].forEach((label) => {
      expect(within(main).queryByText(label)).not.toBeInTheDocument();
    });

    expect(
      within(main).queryByPlaceholderText(
        "Search activity, term, acronym, workflow..."
      )
    ).not.toBeInTheDocument();
  });

  it("makes all production section routes reachable", () => {
    for (const section of productionRegistries.sections.getAll()) {
      const { unmount } = renderRoute(`/section/${section.id}`);

      expect(
        screen.getByRole("heading", {
          name: new RegExp(escapeRegExp(section.title.en))
        })
      ).toBeInTheDocument();
      expect(screen.getByText("Activities in this system")).toBeInTheDocument();

      unmount();
    }
  });

  it("exposes canonical activity links from a section screen", () => {
    renderRoute("/section/10");

    expect(
      screen.getAllByRole("link", { name: /10.3 Firestopping/i })[0]
    ).toHaveAttribute("href", "/activity/10.3");
  });

  it("renders representative activity routes and preserves string IDs", () => {
    for (const activityId of ["10.3", "2.5", "13.1"]) {
      const activity = productionRegistries.activities.getById(activityId);
      const { unmount } = renderRoute(`/activity/${activityId}`);

      expect(activity).toBeDefined();
      expect(
        screen.getByRole("heading", {
          name: new RegExp(`${activityId} .*${activity?.title.en}`)
        })
      ).toBeInTheDocument();

      unmount();
    }
  });

  it("renders QuickView from production presentation data", () => {
    renderRoute("/activity/10.3");

    expect(screen.getByRole("tab", { name: "Quick" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("Inspect")).toBeInTheDocument();
    expect(screen.getByText("Evidence")).toBeInTheDocument();
    expect(screen.getByText("Watch for")).toBeInTheDocument();
  });

  it("renders Learn from production presentation data", () => {
    renderRoute("/activity/10.3?mode=learn");

    expect(screen.getByRole("tab", { name: "Learn" })).toHaveAttribute(
      "aria-selected",
      "true"
    );
    expect(screen.getByText("What is this?")).toBeInTheDocument();
    expect(screen.getByText("Why it matters")).toBeInTheDocument();
  });

  it("shows workflow and pre-concealment links only when applicable", () => {
    renderRoute("/activity/10.3");

    expect(
      screen.getByRole("link", { name: /Firestop Inspection/i })
    ).toHaveAttribute("href", "/workflow/WF-FIRE-01");
    expect(
      screen.getByRole("link", { name: /Before Closing Fire-Rated Assembly/i })
    ).toHaveAttribute("href", "/preconcealment/PC-FIRE-01");
  });

  it("does not show meaningless workflow panels for activities outside workflow data", () => {
    const activityWithoutWorkflow = productionRegistries.activities
      .getAll()
      .find(
        (activity) =>
          !productionRegistries.workflows
            .getAll()
            .some((workflow) => workflow.activityIds?.includes(activity.id))
      );

    expect(activityWithoutWorkflow).toBeDefined();
    renderRoute(`/activity/${activityWithoutWorkflow?.id}`);

    expect(screen.queryByText("Related Workflows")).not.toBeInTheDocument();
  });

  it("renders workflow and pre-concealment route screens", () => {
    const workflowRoute = renderRoute("/workflow/WF-FIRE-01");

    expect(
      screen.getByRole("heading", { name: /Firestop Inspection/i })
    ).toBeInTheDocument();
    expect(screen.getByText("Workflow Information")).toBeInTheDocument();
    expect(screen.getByText("Step")).toBeInTheDocument();

    workflowRoute.unmount();

    renderRoute("/preconcealment/PC-FIRE-01");

    expect(
      screen.getByRole("heading", {
        name: /Before Closing Fire-Rated Assembly/i
      })
    ).toBeInTheDocument();
    expect(screen.getAllByText("Stop")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Check")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Evidence")[0]).toBeInTheDocument();
  });

  it("binds production search results to canonical navigation", () => {
    renderRoute("/search?q=firestop");

    const result = screen.getByRole("link", { name: /10.3 Firestopping/i });
    expect(result).toBeInTheDocument();
    expect(result).toHaveAttribute("href", "/activity/10.3");
  });

  it("renders the General QC Processes visual screen from its canonical route", () => {
    renderRoute("/general-qc");

    const main = screen.getByRole("main");

    expect(
      screen.getByRole("link", { name: /General QC Processes/i })
    ).toHaveAttribute("aria-current", "page");
    expect(
      within(main).getByRole("heading", { name: "General QC Processes" })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "All Processes" })
    ).toBeInTheDocument();
    expect(within(main).getByRole("button", { name: "Grid" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(within(main).getByRole("button", { name: "List" })).toHaveAttribute(
      "aria-pressed",
      "false"
    );
    expect(
      within(main).getByRole("heading", { name: "Commonly Used" })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("heading", { name: "Field Tips" })
    ).toBeInTheDocument();
    expect(
      within(main).getByRole("link", { name: /Inspection Planning/i })
    ).toBeInTheDocument();
    expect(
      within(main).getAllByRole("link", { name: /Reporting|Review|Planning/i })
        .length
    ).toBeGreaterThan(0);
    expect(
      within(main).queryByText("Related Searches")
    ).not.toBeInTheDocument();
    expect(within(main).queryByText("Search Tip")).not.toBeInTheDocument();
    expect(within(main).queryByText("Filters")).not.toBeInTheDocument();
  });

  it("switches visible activity content to French without changing route identity", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute("/activity/10.3");

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(router.state.location.pathname).toBe("/activity/10.3");
    expect(
      screen.getByRole("heading", { name: /10.3 Calfeutrement coupe-feu/i })
    ).toBeInTheDocument();
  });

  it("handles invalid route objects gracefully", () => {
    const invalidActivityRoute = renderRoute("/activity/10.999");

    expect(
      screen.getByRole("heading", { name: "Activity not found" })
    ).toBeInTheDocument();

    invalidActivityRoute.unmount();

    renderRoute("/not-a-route");

    expect(
      screen.getByRole("heading", {
        name: "This production route is not available"
      })
    ).toBeInTheDocument();
  });
});
