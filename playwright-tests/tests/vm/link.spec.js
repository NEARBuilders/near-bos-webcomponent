import { describe, test, expect } from "@playwright/test";
import { useCode, pauseIfVideoRecording } from "../../testUtils";

describe("Link custom element", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should set props.to to props.href and delete props.href if only props.href is provided", async ({
    page,
  }) => {
    await useCode(page, "custom/link.js", {
      to: undefined,
      href: "https://example.com",
      text: "click me",
    });

    // Expect the custom element to be rendered
    const renderedLink = await page.getByRole("link");
    expect(renderedLink).toBeTruthy();

    // Verify attribute
    expect(renderedLink).toHaveAttribute("href", "https://example.com");

    await pauseIfVideoRecording(page);
  });

  test("should use props.to if provided and valid string", async ({ page }) => {
    await useCode(page, "custom/link.js", {
      to: "https://example.com",
      text: "click me",
    });

    // Expect the custom element to be rendered
    const renderedLink = await page.getByRole("link");
    expect(renderedLink).toBeTruthy();

    // Verify attribute
    expect(renderedLink).toHaveAttribute("href", "https://example.com");

    await pauseIfVideoRecording(page);
  });

  test('should set props.to to "about:blank" if props.to is provided but not a valid string', async ({
    page,
  }) => {
    await useCode(page, "custom/link.js", {
      to: "javascript:alert('XSS')",
      text: "click me",
    });

    // Expect the custom element to be rendered
    const renderedLink = await page.getByRole("link");
    expect(renderedLink).toBeTruthy();

    // Verify attribute
    expect(renderedLink).toHaveAttribute("href", "about:blank");

    await pauseIfVideoRecording(page);
  });

  test('should default to "/" if neither props.to nor props.href are provided', async ({
    page,
  }) => {
    await useCode(page, "custom/link.js", { text: "click me" });

    // Expect the custom element to be rendered
    const renderedLink = await page.getByRole("link");
    expect(renderedLink).toBeTruthy();

    // Verify attribute
    expect(renderedLink).toHaveAttribute("href", "/");

    await pauseIfVideoRecording(page);
  });
});
