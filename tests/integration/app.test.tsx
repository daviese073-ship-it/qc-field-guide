import { render, screen } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { routes } from "@/app/router";

function renderRoute(initialEntry: string) {
  const router = createMemoryRouter(routes, {
    initialEntries: [initialEntry]
  });

  return render(<RouterProvider router={router} />);
}

describe("application routing foundation", () => {
  it("renders the application shell", () => {
    renderRoute("/");

    expect(
      screen.getByRole("link", { name: "QC Field Guide home" })
    ).toBeInTheDocument();
  });

  it("resolves the home route", () => {
    renderRoute("/");

    expect(
      screen.getByRole("heading", { name: "Foundation Home" })
    ).toBeInTheDocument();
  });

  it("resolves activity deep links with string IDs", () => {
    renderRoute("/activity/10.3");

    expect(screen.getByTestId("activity-id")).toHaveTextContent("10.3");
  });

  it("resolves gate deep links with string IDs", () => {
    renderRoute("/gate/G-STR-01");

    expect(screen.getByText("G-STR-01")).toBeInTheDocument();
  });

  it("resolves workflow deep links with string IDs", () => {
    renderRoute("/workflow/WF-CON-01");

    expect(screen.getByText("WF-CON-01")).toBeInTheDocument();
  });

  it("resolves pre-concealment deep links with string IDs", () => {
    renderRoute("/preconcealment/PC-FIRE-01");

    expect(screen.getByText("PC-FIRE-01")).toBeInTheDocument();
  });

  it("renders Not Found for unknown routes", () => {
    renderRoute("/not-a-route");

    expect(
      screen.getByRole("heading", { name: "Not Found" })
    ).toBeInTheDocument();
  });
});
