import { expect, test } from "@playwright/test";
import {
  pauseIfVideoRecording,
  waitForSelectorToBeVisible,
} from "../testUtils";

test("Verify default route loads successfully and displays expected content", async ({
  page,
}) => {
  // Navigate to the default route
  await page.goto("/");

  await page.evaluate(() => {
		const config = JSON.stringify({ "vm": { "features": {"enableComponentSrcDataKey": true }}})

    document.body.innerHTML = `
    <near-social-viewer src="devs.near/widget/default" initialprops='{"message": "hello world!"}' config='${config}'></near-social-viewer>
    `;
  });

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
		'body > near-social-viewer > div > div > div > div'
  );

  // Verify provided props are active
  await waitForSelectorToBeVisible(page, 'div:has-text("devs.near")');

  await pauseIfVideoRecording(page, 1000);
});

test("should be possible to set initialProps and src widget for the root path", async ({
  page,
}) => {
  await page.goto("/");
  await page.evaluate(() => {
		const config = JSON.stringify({ "vm": { "features": {"enableComponentSrcDataKey": true }}})

    document.body.innerHTML = `
    <near-social-viewer src="devhub.near/widget/app" initialProps='{"page": "community", "handle": "webassemblymusic"}' config='${config}'></near-social-viewer>
    `;
  });
  await expect(
    await page.getByText("WebAssembly Music", { exact: true })
  ).toBeVisible({ timeout: 10000 });
});

test("for supporting SEO friendly URLs, it should be possible to set initialProps and src widget from any path", async ({
  page,
}) => {
  await page.goto("/community/webassemblymusic");
  await page.evaluate(() => {
    const viewerElement = document.querySelector("near-social-viewer");
    viewerElement.setAttribute("src", "devhub.near/widget/app");
    const pathparts = location.pathname.split("/");
    viewerElement.setAttribute(
      "initialProps",
      JSON.stringify({ page: pathparts[1], handle: pathparts[2] })
    );
  });
  await expect(
    await page.getByText("WebAssembly Music", { exact: true })
  ).toBeVisible();
});

test("should be able to load a widget from the path", async ({ page }) => {
  await page.goto("/petersalomonsen.near/widget/aliens_close");
  const playButton = await page
    .frameLocator("iframe")
    .getByRole("button", { name: "▶" });
  await expect(playButton).toBeVisible();
});
