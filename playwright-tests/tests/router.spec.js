import { expect, test } from "@playwright/test";
import { pauseIfVideoRecording, waitForSelectorToBeVisible } from "../testUtils";

test("Verify default route loads successfully and displays expected content", async ({
  page,
}) => {
  // Navigate to the default route
  await page.goto("/");

  // Verify the viewer's default route
  await waitForSelectorToBeVisible(
    page,
    'near-social-viewer[src="devs.near/widget/default"]'
  );

  // Get the value of the initialProps attribute
  const initialProps = await page.evaluate(() => {
    const viewer = document.querySelector(
      'near-social-viewer[src="devs.near/widget/default"]'
    );
    return viewer.getAttribute("initialProps");
  });

  // Assert initialProps parse correctly
  expect(JSON.parse(initialProps)).toEqual({ message: "hello world!" });

  // Verify default component renders
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="devs.near/widget/default"]'
  );

  // Verify default props are active
  await waitForSelectorToBeVisible(page, 'h4:has-text("hello world!")');

  await pauseIfVideoRecording(page, 1000);
});

test("should load the other routes with params when provided", async ({
  page,
}) => {
  // // Navigate to some route
  await page.goto("/efiz.near/widget/Tree?rootPath=devs.near");

  // Verify route loads
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="efiz.near/widget/Node"]'
  );

  // Verify provided props are active
  await waitForSelectorToBeVisible(page, 'div:has-text("devs.near")');
  
  await pauseIfVideoRecording(page, 1000);
});
