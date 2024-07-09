import { expect, test } from "@playwright/test";

import { waitForSelectorToBeVisible } from "../testUtils";

test("should be possible to interact with web3 widgets", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    document.body.innerHTML = `
			<near-social-viewer src="zavodil.near/widget/Lido"></near-social-viewer>
			`;
  });

  await waitForSelectorToBeVisible(
    page,
    'near-social-viewer[src="zavodil.near/widget/Lido"]'
  );

  await waitForSelectorToBeVisible(
    page,
    "body > near-social-viewer > div > div > div > div.LidoStakeForm"
  );

  const Web3ConnectButton = page.getByRole("button", {
    name: "Connect with Web3",
  });

  await Web3ConnectButton.click();

  await expect(page.getByRole("button", { name: "Connecting" })).toBeVisible();
});
