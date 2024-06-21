import { expect, test, describe } from "@playwright/test";
import {
  waitForSelectorToBeVisible,
  escapeHtml,
  useCode,
  pauseIfVideoRecording,
} from "../../testUtils";

describe("Near.call", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  describe("User is not logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-not-connected.json",
    });

    test("should throw 'No wallet selected' error", async ({ page }) => {
      const expectedErrorMessage =
        "Uncaught (in promise) Error: No wallet selected";

      await useCode(page, "near-call/positional-params.js", {
        contractName: "contractName",
        methodName: "methodName",
      });

      // Expect error message to be displayed
      const [msg] = await Promise.all([
        page.waitForEvent(
          "pageerror",
          (msg) =>
            console.log(msg)
        ),
        page.getByRole("button", { name: "click" }).click(),
      ]);

      await pauseIfVideoRecording(page);

      // Verify that the expected error message was logged
      expect(msg).toBeTruthy();
      expect(msg.text()).toBe(expectedErrorMessage);
    });
  });

  describe("User is logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-connected.json",
    });

    describe("arguments: (contractName, methodName, args?, gas?, deposit?)", () => {
      test("should throw error if appropriate arguments are not provided", async ({
        page,
      }) => {});
      test("should open confirmation modal with appropriate details", async ({
        page,
      }) => {});
    });

    describe("arguments: ({ tx })", () => {
      test("should throw error if transaction object argument is invalid", async ({
        page,
      }) => {});
      test("should open confirmation modal with appropriate details", async ({
        page,
      }) => {});
    });

    describe("arguments: [{ tx }, ...]", () => {
      test("should throw error if transaction objects in array argument is valid", async ({
        page,
      }) => {});
      test("should open confirmation modal with appropriate details", async ({
        page,
      }) => {});
    });
  });
});
