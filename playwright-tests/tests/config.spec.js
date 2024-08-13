import { describe, expect, test } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../testUtils";

async function setupNearSocialViewer(page, src, config) {
  await page.evaluate(
    ({ src, config }) => {
      document.body.innerHTML = `<near-social-viewer src="${src}" config='${JSON.stringify(config)}'></near-social-viewer>`;
    },
    { src, config }
  );
}

describe("test data-component attribute", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("by default there will be no data-component attribute", async ({
    page,
  }) => {
    await page.evaluate(() => {
      const src = "meta-pool-official.near/widget/MetaPoolStakeEth";

      document.body.innerHTML = `<near-social-viewer src="${src}"></near-social-viewer>`;
    });

    const dataComponentElements = page.locator("div[data-component]");
    await expect(dataComponentElements).toHaveCount(0);
  });

  test("with the correct configuration there will be a data-component property in the components", async ({
    page,
  }) => {
    const src = "meta-pool-official.near/widget/MetaPoolStakeEth";
		const config = { "vm": { "features": {"enableComponentSrcDataKey": true }}}

    await setupNearSocialViewer(page, src, config);

    await waitForSelectorToBeVisible(page, "div[data-component]");
    const dataComponentValue = await page.getAttribute(
      "div[data-component]",
      "data-component"
    );

    expect(dataComponentValue).toBe(src);
  });
});
