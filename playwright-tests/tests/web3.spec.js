import { expect, test } from "@playwright/test";

import { waitForSelectorToBeVisible } from "../testUtils";

test("should be possible to interact with web3 widgets", async ({ page }) => {
  await page.goto("/");

  await page.evaluate(() => {
    document.body.innerHTML = `
			<near-social-viewer src="meta-pool-official.near/widget/MetaPoolStakeEth"></near-social-viewer>
			`;
  });

  await waitForSelectorToBeVisible(
    page,
    'near-social-viewer[src="meta-pool-official.near/widget/MetaPoolStakeEth"]'
  );

  const header = page.getByRole('heading', { name: 'Stake ETH' });
  await expect(header).toBeVisible();

  const Web3ConnectButton = page.getByRole("button", {
    name: "Connect with Ethereum wallet",
  });

  await Web3ConnectButton.click();

  await expect(page.getByRole("button", { name: "Connecting" })).toBeVisible();
});
