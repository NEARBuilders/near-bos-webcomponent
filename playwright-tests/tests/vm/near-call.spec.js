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
        const expectedTransactionData = { message: "Hello, World!" };

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
        const expectedTransactionData = { message: "Hello, World!" };

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
        const modalBody = await page.locator(".modal-body");
        const transactionNumber = await modalBody.locator("h4").textContent();
        const values = await modalBody
          .locator(".font-monospace")
          .allInnerTexts();
        const [contractId, methodName, deposit, gas] = values;

        await pauseIfVideoRecording(page);

        // do something with transactionObj
        expect(transactionObj).toMatchObject(expectedTransactionData);
        expect(transactionNumber).toBe("Transaction #1");
        expect(contractId).toBe("hello.near-examples.near");
        expect(methodName).toBe("set_greeting");
        expect(deposit).toBe("1 NEAR");
        expect(gas).toBe("300 TGas");
      });
    });

    describe("arguments: [{ tx }, ...]", () => {
      test("should open confirmation modal with appropriate details, multiple transactions", async ({
        page,
      }) => {
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
              contractName: "goodbye.near-examples.near",
              methodName: "set_goobye",
              args: { message: "Goodbye, World!" },
              gas: "600000000000000",
              deposit: "2000000000000000000000000",
            },
          ],
        });

        await page.getByRole("button", { name: "click" }).click();

        const blocks = await page
          .locator("div.modal-body code")
          .allInnerTexts();
        const modalBody = await page.locator(".modal-body");
        const transactionNumbers = await modalBody
          .locator("h4")
          .allInnerTexts();
        const values = await modalBody
          .locator(".font-monospace")
          .allInnerTexts();

        const [firstBlock, secondBlock] = blocks;

        await pauseIfVideoRecording(page);

        expect(transactionNumbers).toEqual([
          "Transaction #1",
          "Transaction #2",
        ]);
        expect(values).toEqual([
          "hello.near-examples.near",
          "set_greeting",
          "1 NEAR",
          "300 TGas",
          "goodbye.near-examples.near",
          "set_goobye",
          "2 NEAR",
          "600 TGas",
        ]);

        expect(JSON.parse(firstBlock)).toMatchObject({
          message: "Hello, World!",
        });
        expect(JSON.parse(secondBlock)).toMatchObject({
          message: "Goodbye, World!",
        });
      });
    });
  });
});
