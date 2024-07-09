import { describe, expect, test } from "@playwright/test";
import {
  escapeHtml,
  pauseIfVideoRecording,
  useCode,
  waitForSelectorToBeVisible,
} from "../../testUtils";

test("should throw error if a custom element is referenced from code, but not defined", async ({
  page,
}) => {
  // Navigate to the default route
  await page.goto("/");

  const code = escapeHtml("return <Test />;");

  // Set code attribute to reference a non-existent custom element
  await page.evaluate((code) => {
    document.body.innerHTML = `
    <near-social-viewer code="${code}" />
    `;
  }, code);

  // Verify the viewer is visible
  await waitForSelectorToBeVisible(page, "near-social-viewer");

  // Expect error message to be displayed
  const errorMsg = await page.getByText("Error: Unknown element: Test");

  expect(errorMsg).toBeTruthy();

  await pauseIfVideoRecording(page);
});

test("should render custom element when defined, with attributes and children", async ({
  page,
}) => {
  await page.goto("/");

  await useCode(page, "custom/link.js", {
    to: "/anywhere",
    text: "go somewhere",
  });

  // Expect the custom element to be rendered
  const renderedLink = await page.getByRole("link");
  expect(renderedLink).toBeTruthy();

  // Verify attribute
  expect(renderedLink).toHaveAttribute("href", "/anywhere");

  // Verify children
  const renderedChildren = await page.getByText("go somewhere");

  expect(renderedChildren).toBeTruthy();

  await pauseIfVideoRecording(page);
});
