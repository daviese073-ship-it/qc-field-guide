import { readFileSync } from "node:fs";

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
      expect(screen.getByText("Common Mistakes")).toBeInTheDocument();
      expect(screen.getByText("Key Reminders")).toBeInTheDocument();
      expect(screen.getByText("Typical Outputs")).toBeInTheDocument();

      unmount();
    }
  });

  it("renders the NCR detail screen from canonical process content", () => {
    const process = productionGeneralQcService.getProcessById("general-qc-ncr");

    expect(process).toBeDefined();
    if (!process) throw new Error("Expected NCR process fixture to exist.");
    renderRoute("/general-qc/general-qc-ncr");

    expect(screen.getByTestId("general-qc-detail")).toHaveAttribute(
      "data-process-accent",
      "red"
    );
    expect(
      screen.getByRole("heading", { name: process.title.en })
    ).toBeInTheDocument();
    expect(screen.getByText(process.summary.en)).toBeInTheDocument();
    expect(screen.getByText(process.whenToUse.en)).toBeInTheDocument();

    expect(
      screen.getAllByTestId("general-qc-workflow-step-number")
    ).toHaveLength(process.fieldWorkflow.length);
    for (const step of process.fieldWorkflow) {
      expect(screen.getByText(step.action.en)).toBeInTheDocument();
      expect(screen.getByText(step.detail.en)).toBeInTheDocument();
    }

    for (const reminder of process.keyReminders) {
      expect(screen.getByText(reminder.en)).toBeInTheDocument();
    }
    for (const output of process.typicalOutputs) {
      expect(screen.getByText(output.en)).toBeInTheDocument();
    }
  });

  it("renders source-backed capture and mistake tabs without changing route identity", async () => {
    const user = userEvent.setup();
    const process = productionGeneralQcService.getProcessById("general-qc-ncr");
    const { router } = renderRoute("/general-qc/general-qc-ncr");

    expect(process).toBeDefined();
    if (!process) throw new Error("Expected NCR process fixture to exist.");

    await user.click(screen.getByRole("tab", { name: "What to Capture" }));
    expect(
      screen.getByRole("tab", { name: "What to Capture" })
    ).toHaveAttribute("aria-selected", "true");
    for (const item of process.whatToCapture) {
      expect(screen.getByText(item.en)).toBeInTheDocument();
    }

    await user.click(screen.getByRole("tab", { name: "Common Mistakes" }));
    expect(
      screen.getByRole("tab", { name: "Common Mistakes" })
    ).toHaveAttribute("aria-selected", "true");
    for (const item of process.commonMistakes) {
      expect(screen.getByText(item.en)).toBeInTheDocument();
    }

    expect(router.state.location.pathname).toBe("/general-qc/general-qc-ncr");
  });

  it("uses per-process accent metadata without per-process detail components", () => {
    const expectedAccents = new Map([
      ["general-qc-inspection-planning", "teal"],
      ["general-qc-ncr", "red"],
      ["general-qc-quality-evidence", "purple"],
      ["general-qc-quality-closeout", "purple"]
    ]);

    for (const [processId, accent] of expectedAccents) {
      const { unmount } = renderRoute(`/general-qc/${processId}`);

      expect(screen.getByTestId("general-qc-detail")).toHaveAttribute(
        "data-process-accent",
        accent
      );

      unmount();
    }

    const source = readFileSync(
      "src/screens/GeneralQcProcessesPage/GeneralQcProcessDetailPage.tsx",
      "utf8"
    );

    expect(source).not.toMatch(/processId\s*===/);
    expect(source).not.toMatch(/case\s+["']general-qc-/);
  });

  it("does not add deferred or official-QMS controls to the process detail screen", () => {
    renderRoute("/general-qc/general-qc-ncr");

    expect(screen.queryByText(/Download/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Learn More/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/At a Glance/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Related Resources/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Approve/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Release/i })).toBeNull();
    expect(screen.queryByRole("button", { name: /Sign/i })).toBeNull();
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

  it("FR mode preserves the canonical process route while rendering available localized content", async () => {
    const user = userEvent.setup();
    const { router } = renderRoute(
      "/general-qc/general-qc-inspection-planning"
    );

    await user.click(screen.getByRole("button", { name: "FR" }));

    expect(router.state.location.pathname).toBe(
      "/general-qc/general-qc-inspection-planning"
    );
    expect(
      screen.getByRole("heading", { name: "Planification de l'inspection" })
    ).toBeInTheDocument();
  });
});
