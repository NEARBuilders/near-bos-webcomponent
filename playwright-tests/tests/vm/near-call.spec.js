import { describe, expect, test } from "@playwright/test";
import { pauseIfVideoRecording, useCode } from "../../testUtils";

describe("Near.call", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  describe("User is not logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-not-connected.json",
    });

    test("should throw 'No wallet selected' error", async ({ page }) => {
      const expectedErrorMessage = "No wallet selected";

      await useCode(page, "near-call/positional-params.js", {
        contractName: "hello.near-examples.near",
        methodName: "set_greeting",
      });

      // Expect error message to be displayed
      const [error] = await Promise.all([
        page.waitForEvent("pageerror"),
        await page.getByRole("button", { name: "click" }).click(),
      ]);

      await pauseIfVideoRecording(page);

      // Verify that the expected error message was logged
      expect(error).toBeTruthy();
      expect(error.message).toContain(expectedErrorMessage);
    });
  });

  describe("User is logged in", () => {
    test.use({
      storageState: "playwright-tests/storage-states/wallet-connected.json",
    });

    describe("arguments: (contractName, methodName, args?, gas?, deposit?)", () => {
      test("should throw error if appropriate arguments are not provide (over 5 args)", async ({
        page,
      }) => {
        const expectedErrorMessage =
          "Method: Near.call. Required argument: 'contractName'. If the first argument is a string: 'methodName'. Optional: 'args', 'gas' (defaults to 300Tg), 'deposit' (defaults to 0)";

        await useCode(page, "near-call/positional-params.js", {
          contractName: "hello.near-examples.near",
          methodName: "set_greeting",
          args: { message: "Hello, World!" },
          gas: "300000000000000",
          deposit: "1000000000000000000000000",
          extra: "extra argument",
        });

        // Expect error message to be displayed
        const [error] = await Promise.all([
          page.waitForEvent("pageerror"),
          await page.getByRole("button", { name: "click" }).click(),
        ]);

        await pauseIfVideoRecording(page);

        // Verify that the expected error message was logged
        expect(error).toBeTruthy();
        expect(error.message).toContain(expectedErrorMessage);
      });
      test("should open confirmation modal with appropriate details", async ({
        page,
      }) => {
        const expectedTransactionData = {
          receiverId: "hello.near-examples.near",
          actions: [
            {
              functionCall: {
                methodName: "set_greeting",
                args: { message: "Hello, World!" },
                gas: "300000000000000",
                deposit: "1000000000000000000000000",
              },
            },
          ],
        };

        await useCode(page, "near-call/positional-params.js", {
          contractName: "hello.near-examples.near",
          methodName: "set_greeting",
          args: { message: "Hello, World!" },
          gas: "300000000000000",
          deposit: "1000000000000000000000000",
        });

        await page.getByRole("button", { name: "click" }).click();

        const transactionObj = JSON.parse(
          await page.locator("div.modal-body code").innerText()
        );

        await pauseIfVideoRecording(page);

        // do something with transactionObj
        expect(transactionObj).toMatchObject(expectedTransactionData);
      });
    });

    describe("arguments: ({ tx })", () => {
      test("should throw error if transaction object argument is invalid (single string provided)", async ({
        page,
      }) => {
        const expectedErrorMessage =
          "Method: Near.call. Required argument: 'tx/txs'. A single argument call requires an TX object or an array of TX objects.";

        await useCode(page, "near-call/positional-params.js", {
          contractName: "hello.near-examples.near",
        });

        // Expect error message to be displayed
        const [error] = await Promise.all([
          page.waitForEvent("pageerror"),
          await page.getByRole("button", { name: "click" }).click(),
        ]);

        await pauseIfVideoRecording(page);

        // Verify that the expected error message was logged
        expect(error).toBeTruthy();
        expect(error.message).toContain(expectedErrorMessage);
      });
      test("should open confirmation modal with appropriate details", async ({
        page,
      }) => {
        const expectedTransactionData = {
          receiverId: "hello.near-examples.near",
          actions: [
            {
              functionCall: {
                methodName: "set_greeting",
                args: { message: "Hello, World!" },
                gas: "300000000000000",
                deposit: "1000000000000000000000000",
              },
            },
          ],
        };

        await useCode(page, "near-call/object-params.js", {
          tx: {
            contractName: "hello.near-examples.near",
            methodName: "set_greeting",
            args: { message: "Hello, World!" },
            gas: "300000000000000",
            deposit: "1000000000000000000000000",
          },
        });

        await page.getByRole("button", { name: "click" }).click();

        const transactionObj = JSON.parse(
          await page.locator("div.modal-body code").innerText()
        );

        await pauseIfVideoRecording(page);

        // do something with transactionObj
        expect(transactionObj).toMatchObject(expectedTransactionData);
      });
    });

    describe("arguments: [{ tx }, ...]", () => {
      test("should open confirmation modal with appropriate details, multiple transactions", async ({
        page,
      }) => {
        const expectedTransactionData = {
          receiverId: "hello.near-examples.near",
          actions: [
            {
              functionCall: {
                methodName: "set_greeting",
                args: { message: "Hello, World!" },
                gas: "300000000000000",
                deposit: "1000000000000000000000000",
              },
            },
            {
              functionCall: {
                methodName: "set_greeting",
                args: { message: "Goodbye, World!" },
                gas: "300000000000000",
                deposit: "1000000000000000000000000",
              },
            },
          ],
        };

        await useCode(page, "near-call/object-params.js", {
          tx: [
            {
              contractName: "hello.near-examples.near",
              methodName: "set_greeting",
              args: { message: "Hello, World!" },
              gas: "300000000000000",
              deposit: "1000000000000000000000000",
            },
            {
              contractName: "hello.near-examples.near",
              methodName: "set_greeting",
              args: { message: "Goodbye, World!" },
              gas: "300000000000000",
              deposit: "1000000000000000000000000",
            },
          ],
        });

        await page.getByRole("button", { name: "click" }).click();

        const transactionObj = JSON.parse(
          await page.locator("div.modal-body code").innerText()
        );

        await pauseIfVideoRecording(page);

        // do something with transactionObj
        expect(transactionObj).toMatchObject(expectedTransactionData);
      });
    });
  });
});
