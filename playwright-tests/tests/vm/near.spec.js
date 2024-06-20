import { expect, test, describe } from "@playwright/test";
import { waitForSelectorToBeVisible } from "../../testUtils";

describe("User is not logged in", () => {
  test.use({
    storageState: "playwright-tests/storage-states/wallet-not-connected.json",
  });

  test("should throw 'No wallet selected' error", async ({ page }) => {
    await page.goto("/");
  });
});

describe("User is logged in", () => {
  test.use({
    storageState: "playwright-tests/storage-states/wallet-connected.json",
  });

  describe("arguments: (contractName, methodName, args?, gas?, deposit?)", () => {
    test("should throw error if appropriate arguments are not provided", async ({ page }) => {});
    test("should open confirmation modal with appropriate details", async ({ page }) => {});
  });

  describe("arguments: ({ tx })", () => {
    test("should throw error if transaction object argument is invalid", async ({ page }) => {});
    test("should open confirmation modal with appropriate details", async ({ page }) => {});
  });

  describe("arguments: [{ tx }, ...]", () => {
    test("should throw error if transaction objects in array argument is valid", async ({ page }) => {});
    test("should open confirmation modal with appropriate details", async ({ page }) => {});
  });
});
