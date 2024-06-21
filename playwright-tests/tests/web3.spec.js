import { test, describe, expect } from "@playwright/test";

import { waitForSelectorToBeVisible } from "../testUtils";

describe("bos-loader-url", () => {
  test.use({
    storageState: "playwright-tests/storage-states/bos-loader-url.json",
  });
  test("Should be possible to interact with web3 widgets", async ({ page }) => {
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

    await page
      .locator(
        "body > near-social-viewer > div > div > div > div.LidoStakeForm > button"
      )
      .click();

    await page.waitForTimeout(3000);

    const element = await expect(
      page.getByText("Connect your wallet")
    ).toBeVisible();

    console.log("-- HERE");
    console.log(element);
  });
});
