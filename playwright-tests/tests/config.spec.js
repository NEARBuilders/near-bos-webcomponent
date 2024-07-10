import { describe, expect, test } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../testUtils";

  describe("test data-component attribute", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/");
    });

    test("test", async ({
      page,
    }) => {
			const src="neardevs.testnet/widget/default"
			const config = '{"enableComponentSrcDataKey": true}'

      await page.evaluate(() => {
				const src="zavodil.near/widget/Lido"
				// const config = '{"enableComponentSrcDataKey": true}'
				const config = JSON.stringify({ enableComponentSrcDataKey: true });
        document.body.innerHTML = `<near-social-viewer src="${src}" config='${config}'}></near-social-viewer>`;
			});

			await waitForSelectorToBeVisible(page, 'div[data-component]');
  		const dataComponentValue = await page.getAttribute('div[data-component]', 'data-component');
  
			expect(dataComponentValue).toBe(src);
    });
});
