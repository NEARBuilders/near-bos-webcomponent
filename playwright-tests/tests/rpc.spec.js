import { expect, test } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../testUtils";

const DEFAULT_RPC_URL = "https://rpc.mainnet.near.org/";
const CUSTOM_RPC_URL = "https://custom-rpc-url.com/";

test("Verify default RPC is called when value not provided", async ({
  page,
}) => {
  // Set up a listener for the default rpc request
  const defaultRpcRequestPromise = page.waitForRequest(DEFAULT_RPC_URL);

  // Navigate to the default route
  await page.goto("/");

  await page.evaluate(() => {
		const config = JSON.stringify({ "vm": { "features": {"enableComponentSrcDataKey": true }}})


    document.body.innerHTML = `
    <near-social-viewer src="devs.near/widget/default" config='${config}'></near-social-viewer>
    `;
  });

  // Verify the viewer is visible
  await waitForSelectorToBeVisible(page, "near-social-viewer");

  // Get the value of the rpc attribute
  const rpc = await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.getAttribute("rpc");
  });

  // expect value to be undefined (aka use default value)
  expect(rpc, undefined);

  // Wait for the widget to render
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="devs.near/widget/default"]'
  );

  // Assert that the default RPC request has been made
  const defaultRpcRequest = await defaultRpcRequestPromise;
  expect(defaultRpcRequest).toBeTruthy();
});

test("Verify custom RPC is called when provided", async ({ page }) => {
  // Navigate to the default route
  await page.goto("/");

  // Verify the viewer is visible
  await waitForSelectorToBeVisible(page, "near-social-viewer");

  let customRPCisCalledPromiseResolve;
  let customRPCisCalled = new Promise((resolve) => {
    customRPCisCalledPromiseResolve = resolve;
  });

  // Mock the custom rpc call so that the request doesn't hang
  await page.route(CUSTOM_RPC_URL, async (route) => {
    customRPCisCalledPromiseResolve(true);
    await route.continue({ url: DEFAULT_RPC_URL });
  });

  // Set the rpc attribute to a custom rpc value
  await page.evaluate((url) => {
		const config = JSON.stringify({ "vm": { "features": {"enableComponentSrcDataKey": true }}})

    document.body.innerHTML = `
    <near-social-viewer src="devs.near/widget/default" rpc="${url}" config='${config}'></near-social-viewer>
    `;
  }, CUSTOM_RPC_URL);

  // Get the value of the rpc attribute
  const actualRpc = await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.getAttribute("rpc");
  });

  // Assert it equals custom value
  expect(actualRpc).toBe(CUSTOM_RPC_URL);

  // Wait for the widget to render
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="devs.near/widget/default"]'
  );

  // Set the src to new value (which should trigger the custom rpc call)
  await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    viewer.setAttribute("src", "efiz.near/widget/Tree");
  });

  // Expect that the custom RPC is called
  const customRpcRequest = await page.waitForRequest(CUSTOM_RPC_URL);
  expect(customRpcRequest).toBeTruthy();
  expect(await customRPCisCalled).toBeTruthy();
});
