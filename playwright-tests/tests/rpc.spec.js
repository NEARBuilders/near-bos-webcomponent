import { expect, test } from "@playwright/test";
import {
  pauseIfVideoRecording,
  waitForSelectorToBeVisible,
} from "../testUtils";

test("Verify custom RPC is called when provided", async ({ page }) => {
  // Navigate to the default route
  await page.goto("/");

  // Verify the viewer is visible
  await waitForSelectorToBeVisible(page, "near-social-viewer");

  // Set the rpc attribute to a custom rpc value
  await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.setAttribute("rpc", "https://custom-rpc-url.com/");
  });

  // Listen for network requests
  let rpcCalled = false;
  page.on("request", (request) => {
    if (request.url() === "https://custom-rpc-url.com/") {
      rpcCalled = true;
    }
  });

  // Get the value of the rpc attribute
  const actualRpc = await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.getAttribute("rpc");
  });

  expect(actualRpc).toBe("https://custom-rpc-url.com/");

  // Wait for the widget to render
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="devs.near/widget/default"]'
  );

  // Expect that the custom RPC is called at least once
  expect(rpcCalled).toBe(true);
});

test("Verify default RPC is called when value not provided", async ({
  page,
}) => {
  // Navigate to the default route
  await page.goto("/");

  // Listen for network requests
  let rpcCalled = false;
  page.on("request", (request) => {
    // default rpc request
    if (request.url() === "https://free.rpc.fastnear.com/") {
      rpcCalled = true;
    }
  });

  // Verify the viewer is visible
  await waitForSelectorToBeVisible(page, "near-social-viewer");

  // Get the value of the rpc attribute
  const rpc = await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.getAttribute("rpc");
  });

  // expect value to be undefined
  expect(rpc, undefined);

  // Wait for the widget to render
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="devs.near/widget/default"]'
  );

  // Expect that the custom RPC is called at least once within the timeout
  expect(rpcCalled).toBe(true);
});
