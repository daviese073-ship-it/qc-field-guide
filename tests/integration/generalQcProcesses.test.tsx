import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import {
  productionGeneralQcService,
  productionRegistries,
  productionSearchService
} from "@/app/productionAppData";
import { routes } from "@/app/router";
import { productionCanonicalDataset } from "@/data/productionCanonicalDataset";
import { validateCanonicalDataset } from "@/services/validation/validateCanonicalDataset";

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

describe("General QC Processes canonical content", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads exactly 16 process records and preserves existing production identities", () => {
    const processes = productionGeneralQcService.getAllProcesses();

    expect(processes).toHaveLength(16);
    expect(productionRegistries.activities.getAll()).toHaveLength(139);
    expect(productionRegistries.sections.getAll()).toHaveLength(14);
    expect(processes.map((process) => process.sequence)).toEqual(
      Array.from({ length: 16 }, (_, index) => index + 1)
    );
    expect(processes[0]?.title.en).toBe("Inspection Planning");
    expect(processes[15]?.title.en).toBe("Quality Closeout");
  });

  it("keeps Universal Field Reference separate from the 16 processes", () => {
    const reference = productionGeneralQcService.getUniversalReference();

    expect(reference).toBeDefined();
    expect(reference?.title.en).toBe("Universal Field Reference");
    expect(reference?.minimumUsefulQualityRecord).toHaveLength(9);
    expect(
      productionGeneralQcService
        .getAllProcesses()
        .some((process) => process.title.en === "Universal Field Reference")
    ).toBe(false);
  });

  it("validates related process links and rejects broken references", () => {
    const validated = validateCanonicalDataset(productionCanonicalDataset);

    for (const process of validated.registries.generalQcProcesses.getAll()) {
      for (const relatedProcessId of process.relatedProcessIds) {
        expect(
          validated.registries.generalQcProcesses.has(relatedProcessId)
        ).toBe(true);
      }
    }

    const brokenDataset = structuredClone(productionCanonicalDataset);
    brokenDataset.generalQcProcesses[0]?.relatedProcessIds.push(
      "general-qc-missing-process"
    );

    expect(() => validateCanonicalDataset(brokenDataset)).toThrow(
      /references missing related process "general-qc-missing-process"/
    );
  });

  it("rejects duplicate General QC process IDs", () => {
    const duplicateDataset = structuredClone(productionCanonicalDataset);
    duplicateDataset.generalQcProcesses.push(
      structuredClone(duplicateDataset.generalQcProcesses[0])
    );

    expect(() => validateCanonicalDataset(duplicateDataset)).toThrow(
      /Duplicate General QC process ID "general-qc-inspection-planning"/
    );
  });

  it("renders the landing route with 16 routed process cards in source order", () => {
    renderRoute("/general-qc");

    const main = screen.getByRole("main");
    const processLinks = within(main)
      .getAllByRole("link")
      .filter((link) => link.getAttribute("href")?.startsWith("/general-qc/"));

    expect(
      within(main).getByRole("heading", { name: "General QC Processes" })
    ).toBeInTheDocument();
    expect(processLinks).toHaveLength(16);
    expect(processLinks[0]).toHaveAttribute(
      "href",
      "/general-qc/general-qc-inspection-planning"
    );
    expect(processLinks[15]).toHaveAttribute(
      "href",
      "/general-qc/general-qc-quality-closeout"
    );
    expect(
      within(main).getByText("No usage history is available yet.")
    ).toBeInTheDocument();
    expect(
      within(main).getByText(
        "No approved field-tip derivation rule is defined yet."
      )
    ).toBeInTheDocument();
  });

  it("renders list view from the same canonical records", async () => {
    const user = userEvent.setup();

    renderRoute("/general-qc");
    await user.click(screen.getByRole("button", { name: "List" }));

    expect(screen.getByRole("button", { name: "List" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
    expect(
      screen.getByRole("link", { name: /01 Inspection Planning/i })
    ).toHaveAttribute("href", "/general-qc/general-qc-inspection-planning");
  });

  it("resolves every process detail route with the generic renderer", () => {
    for (const process of productionGeneralQcService.getAllProcesses()) {
      const { unmount } = renderRoute(`/general-qc/${process.id}`);

      expect(
        screen.getByRole("heading", { name: process.title.en })
      ).toBeInTheDocument();
      expect(screen.getByText("When to Use")).toBeInTheDocument();
      expect(screen.getByText("Field Workflow")).toBeInTheDocument();
      expect(screen.getByText("What to Capture")).toBeInTheDocument();
      expect(screen.getByText("Related Processes")).toBeInTheDocument();

      unmount();
    }
  });

  it("renders related process links as navigable canonical destinations", () => {
    renderRoute("/general-qc/general-qc-ncr");

    expect(
      screen.getByRole("link", { name: /Corrective Action/i })
    ).toHaveAttribute("href", "/general-qc/general-qc-corrective-action");
    expect(screen.getByRole("link", { name: /Traceability/i })).toHaveAttribute(
      "href",
      "/general-qc/general-qc-traceability"
    );
  });

  it("search finds General QC Processes and routes to detail screens", () => {
    const result = productionSearchService
      .search("Non-Conformity Reporting", {
        language: "all"
      })
      .find((item) => item.objectType === "generalQcProcess");

    expect(result).toMatchObject({
      objectId: "general-qc-ncr",
      objectType: "generalQcProcess",
      route: "/general-qc/general-qc-ncr"
    });
  });

  it("FR mode falls back to English without changing the canonical process route", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute(
      "/general-qc/general-qc-inspection-planning"
    );

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(router.state.location.pathname).toBe(
      "/general-qc/general-qc-inspection-planning"
    );
    expect(
      screen.getByRole("heading", { name: "Inspection Planning" })
    ).toBeInTheDocument();
  });
});
