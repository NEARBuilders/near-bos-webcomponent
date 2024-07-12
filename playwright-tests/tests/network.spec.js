import { expect, test } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../testUtils";

const MAINNET_RPC_URL = "https://rpc.mainnet.near.org/";
const TESTNET_RPC_URL = "https://rpc.testnet.near.org/";

test("should use default network (mainnet) when network value not provided", async ({
  page,
}) => {
  // Set up a listener for the default rpc request
  const defaultNetworkRequestPromise = page.waitForRequest(MAINNET_RPC_URL);

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

  // Get the value of the network attribute
  const network = await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.getAttribute("network");
  });

  // expect value to be undefined (aka use default value)
  expect(network, undefined);

  // Wait for the widget to render
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="devs.near/widget/default"]'
  );

  // Assert that the default RPC request has been made
  const defaultNetworkRequest = await defaultNetworkRequestPromise;
  expect(defaultNetworkRequest).toBeTruthy();
});

test("should use testnet network when network attribute is provided", async ({
  page,
}) => {
  // Set up a listener for the testnet rpc request
  const defaultNetworkRequestPromise = page.waitForRequest(TESTNET_RPC_URL);

  // Navigate to the default route
  await page.goto("/");

  // Set the netork attribute to testnet
  await page.evaluate(() => {
		const config = JSON.stringify({ "vm": { "features": {"enableComponentSrcDataKey": true }}})

    document.body.innerHTML = `
    <near-social-viewer src="neardevs.testnet/widget/default" network="testnet" config='${config}'></near-social-viewer>
    `;
  });

  // Verify the viewer is visible
  await waitForSelectorToBeVisible(page, "near-social-viewer");

  // Get the value of the network attribute
  const network = await page.evaluate(() => {
    const viewer = document.querySelector("near-social-viewer");
    return viewer.getAttribute("network");
  });

  // expect value to be "testnet"
  expect(network, "testnet");

  // Wait for the widget to render
  await waitForSelectorToBeVisible(
    page,
    'div[data-component="neardevs.testnet/widget/default"]'
  );

  // Assert that the default RPC request has been made
  const defaultNetworkRequest = await defaultNetworkRequestPromise;
  expect(defaultNetworkRequest).toBeTruthy();
});
