import { readFileSync } from "node:fs";

import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { productionRegistries } from "@/app/productionAppData";
import { routes } from "@/app/router";
import { buildSectionScreenModel } from "@/services/screenContracts";
import { createRelationshipService } from "@/services/relationships";

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

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

describe("System / Section entry interface", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("resolves every canonical system route with the generic section renderer", () => {
    for (const section of productionRegistries.sections.getAll()) {
      const activities = productionRegistries.activities.getActivitiesBySection(
        section.id
      );
      const { unmount } = renderRoute(`/section/${section.id}`);
      const main = screen.getByRole("main");

      expect(within(main).getByTestId("section-entry")).toHaveAttribute(
        "data-section-accent"
      );
      expect(
        within(main).getByRole("heading", {
          name: new RegExp(
            `${section.id.padStart(2, "0")}.*${escapeRegExp(section.title.en)}`
          )
        })
      ).toBeInTheDocument();
      expect(within(main).getAllByTestId("section-activity-row")).toHaveLength(
        activities.length
      );

      unmount();
    }
  });

  it("renders canonical activity membership, order, and activity routes", () => {
    renderRoute("/section/1");
    const main = screen.getByRole("main");
    const rows = within(main).getAllByTestId("section-activity-row");
    const activities =
      productionRegistries.activities.getActivitiesBySection("1");

    expect(rows).toHaveLength(activities.length);
    expect(
      rows.map(
        (row) => within(row).getByTestId("section-activity-id-tile").textContent
      )
    ).toEqual(activities.map((activity) => activity.id));

    activities.forEach((activity) => {
      expect(
        within(main).getByRole("link", {
          name: new RegExp(
            `${escapeRegExp(activity.id)}.*${escapeRegExp(activity.title.en)}`
          )
        })
      ).toHaveAttribute("href", `/activity/${activity.id}`);
    });
  });

  it("omits supporting activity prose from system entry rows", () => {
    const model = buildSectionScreenModel(productionRegistries, "1");

    expect(model.activities.some((activity) => activity.purpose?.en)).toBe(
      true
    );

    renderRoute("/section/1");

    const rows = screen.getAllByTestId("section-activity-row");

    model.activities.forEach((activity, index) => {
      expect(
        within(rows[index]).getByText(activity.title.en)
      ).toBeInTheDocument();

      if (activity.purpose?.en) {
        expect(
          within(rows[index]).queryByText(activity.purpose.en)
        ).not.toBeInTheDocument();
      }
    });
  });

  it("renders activity flags from the section screen model", () => {
    const model = buildSectionScreenModel(productionRegistries, "1");
    const expectedFlags = new Set(
      model.activities.flatMap((activity) => activity.flags)
    );

    renderRoute("/section/1");

    for (const flag of ["interfaceCritical", "preConcealment", "testing"]) {
      expect(expectedFlags.has(flag)).toBe(true);
      expect(screen.getAllByText(flag).length).toBeGreaterThan(0);
    }
  });

  it("derives related workflows from canonical workflow activity membership", () => {
    const workflow = productionRegistries.workflows
      .getAll()
      .find((item) => item.activityIds?.length);
    const activity = workflow?.activityIds?.[0]
      ? productionRegistries.activities.getById(workflow.activityIds[0])
      : undefined;

    expect(workflow).toBeDefined();
    expect(activity).toBeDefined();
    renderRoute(`/section/${activity?.sectionId}`);

    expect(
      screen.getByRole("heading", { name: "Related Workflows" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: new RegExp(escapeRegExp(workflow?.title.en ?? ""))
      })
    ).toHaveAttribute("href", `/workflow/${workflow?.id}`);
  });

  it("derives key interfaces from the relationship graph", () => {
    const relationshipService = createRelationshipService(productionRegistries);
    const sourceActivity = productionRegistries.activities
      .getAll()
      .find((activity) =>
        relationshipService
          .getInterfaces(activity.id)
          .some((item) => item.relatedNodeKind === "activity")
      );
    const interfaceItem = sourceActivity
      ? relationshipService
          .getInterfaces(sourceActivity.id)
          .find((item) => item.relatedNodeKind === "activity")
      : undefined;

    expect(sourceActivity).toBeDefined();
    expect(interfaceItem).toBeDefined();
    renderRoute(`/section/${sourceActivity?.sectionId}`);

    expect(
      screen.getByRole("heading", { name: "Key Interfaces" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", {
        name: new RegExp(escapeRegExp(interfaceItem?.relatedNodeId ?? ""))
      })
    ).toHaveAttribute("href", `/activity/${interfaceItem?.relatedNodeId}`);
  });

  it("follows canonical next-system order and omits next navigation on the final system", () => {
    const first = renderRoute("/section/1");
    const firstBottomNav = screen.getByTestId("section-bottom-nav");

    expect(
      within(firstBottomNav).getByRole("link", { name: /2 Substructure/i })
    ).toHaveAttribute("href", "/section/2");

    first.unmount();

    renderRoute("/section/14");

    expect(
      within(screen.getByTestId("section-bottom-nav")).queryByRole("link")
    ).not.toBeInTheDocument();
  });

  it("changes system accent and sidebar active state by canonical section", () => {
    const first = renderRoute("/section/1");

    expect(screen.getByTestId("section-entry")).toHaveAttribute(
      "data-section-accent",
      "qcfg-system-earthworks"
    );
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: /Sitework & Earthworks/i }
      )
    ).toHaveAttribute("aria-current", "page");

    first.unmount();

    renderRoute("/section/2");

    expect(screen.getByTestId("section-entry")).toHaveAttribute(
      "data-section-accent",
      "qcfg-system-substructure"
    );
    expect(
      within(screen.getByRole("navigation", { name: "Primary" })).getByRole(
        "link",
        { name: /Substructure/i }
      )
    ).toHaveAttribute("aria-current", "page");
  });

  it("keeps EN/FR switching on the same canonical system route", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute("/section/1");

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(router.state.location.pathname).toBe("/section/1");
    expect(
      screen.getByRole("heading", {
        name: /01 Travaux de site et terrassement/i
      })
    ).toBeInTheDocument();
  });

  it("does not render forbidden detail, project-QMS, or fake status content", () => {
    renderRoute("/section/1");
    const main = screen.getByRole("main");

    for (const label of [
      "Quick",
      "Full",
      "Learn",
      "Project KPIs",
      "Completion %",
      "Inspection form",
      "Approval",
      "Signature",
      "Search Results"
    ]) {
      expect(within(main).queryByText(label)).not.toBeInTheDocument();
    }
  });

  it("does not contain section-specific layout branches", () => {
    const source = readFileSync(
      "src/screens/SectionPage/SectionPage.tsx",
      "utf8"
    );

    expect(source).not.toMatch(/sectionId\s*===\s*["']\d+/);
    expect(source).not.toMatch(/case\s+["']\d+["']/);
    expect(source).not.toMatch(/SiteworkLayout|SubstructureLayout/);
  });
});
