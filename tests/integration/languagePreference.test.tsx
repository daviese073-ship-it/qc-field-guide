import { screen } from "@testing-library/react";
import { render } from "@testing-library/react";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { AppProviders } from "@/app/providers";
import { routes } from "@/app/router";
import {
  clearLanguagePreference,
  getLanguagePreference,
  setLanguagePreference
} from "@/services/localization/languagePreference";

describe("language preference foundation", () => {
  afterEach(() => {
    clearLanguagePreference();
  });

  it("stores en, fr, and bilingual preferences with bilingual primary language", () => {
    expect(getLanguagePreference()).toEqual({ mode: "en" });

    expect(setLanguagePreference({ mode: "fr" })).toBe(true);
    expect(getLanguagePreference()).toEqual({ mode: "fr" });

    expect(
      setLanguagePreference({ mode: "bilingual", bilingualPrimary: "fr" })
    ).toBe(true);
    expect(getLanguagePreference()).toEqual({
      mode: "bilingual",
      bilingualPrimary: "fr"
    });

    expect(
      setLanguagePreference({ mode: "bilingual", bilingualPrimary: "en" })
    ).toBe(true);
    expect(getLanguagePreference()).toEqual({
      mode: "bilingual",
      bilingualPrimary: "en"
    });
  });

  it("changes language preference without changing the current canonical route or object ID", () => {
    const router = createMemoryRouter(routes, {
      initialEntries: ["/activity/10.3"]
    });

    render(
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    );

    expect(router.state.location.pathname).toBe("/activity/10.3");
    expect(screen.getByTestId("activity-id")).toHaveTextContent("10.3");

    expect(
      setLanguagePreference({ mode: "bilingual", bilingualPrimary: "fr" })
    ).toBe(true);

    expect(router.state.location.pathname).toBe("/activity/10.3");
    expect(screen.getByTestId("activity-id")).toHaveTextContent("10.3");
  });
});
