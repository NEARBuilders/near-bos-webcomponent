import { expect, test, describe } from "@playwright/test";

describe("auth", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  describe("User is not logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-not-connected.json",
    });

    test("'context.accountId' should be null and show login button", async ({ page }) => {
      await useCode(page, "auth/wallet.js");

      const accountId = await page.textContent('[data-testid="accountId"]');
      expect(accountId).toBe("null");
    });

    test("should show wallet modal after clicking login button", async ({ page }) => {
      await useCode(page, "auth/wallet.js");

      await page.click("#open-walletselector-button");

      const modal = await page.waitForSelector("near-wallet-selector");
      expect(modal).not.toBeNull();
    });
  });

  describe("User is logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-connected.json",
    });

    test("should have 'context.accountId' be non null and show logout button", async ({ page }) => {
     await useCode(page, "auth/wallet.js");

      const accountId = await page.textContent('[data-testid="accountId"]');
      expect(accountId).toBe("anybody.near");
    });

    test("should prompt to disconnect wallet after clicking logout button", async ({ page }) => {
     await useCode(page, "auth/wallet.js");

      await page.getByRole("button", { name: "Log out" }).click();
    });
  });
});