import { describe, expect, test } from "@playwright/test";
import { useCode } from "../testUtils";

describe("auth", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  describe("User is not logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-not-connected.json",
    });

    test("'context.accountId' should be null and show login button", async ({
      page,
    }) => {
      await useCode(page, "auth/wallet.js");

      const accountId = await page.textContent('[data-testid="accountId"]');
      expect(accountId).toBe("");
    });

    test("should show wallet modal after clicking login button", async ({
      page,
    }) => {
      await useCode(page, "auth/wallet.js");

      await page.click("#open-walletselector-button");

      const modal = await page.getByText("Connect Your Wallet");
      expect(modal).not.toBeNull();
    });
  });

  describe("User is logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-connected.json",
    });

    test("should have 'context.accountId' be non null and show logout button", async ({
      page,
    }) => {
      await useCode(page, "auth/wallet.js");

      const accountId = page.getByTestId("accountId");
      expect(accountId).toHaveText("anybody.near");
    });

    test("should prompt to disconnect wallet after clicking logout button", async ({
      page,
    }) => {
      await useCode(page, "auth/wallet.js");

      // Verify auth keys exist
      const authKey = await page.evaluate(() => ({
        near_app_wallet_auth_key: localStorage.getItem(
          "near_app_wallet_auth_key"
        ),
      }));

      expect(authKey).not.toBeNull();

      await page.getByRole("button", { name: "Log out" }).click();

      // Verify auth keys are removed
      await page.waitForFunction(
        () => {
          return localStorage.getItem("near_app_wallet_auth_key") === null;
        },
        { timeout: 1000 }
      );

      const accountId = await page.textContent('[data-testid="accountId"]');
      expect(accountId).toBe("");
    });
  });
});
