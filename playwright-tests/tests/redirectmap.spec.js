import { test, describe, expect } from "@playwright/test";

describe("bos-loader-url", () => {
  test.use({
    storageState: "playwright-tests/storage-states/bos-loader-url.json",
  });
  test("Should be possible to provide a redirectmap through flags in localStorage", async ({
    page,
  }) => {
    await page.route("http://localhost:3030", async (route) => {
      await route.fulfill({
        body: JSON.stringify({
          components: {
            "something.near/widget/testcomponent": {
              code: "return 'I come from a redirect map pointed to by flags in localStorage';",
            },
          },
        }),
      });
    });
    await page.goto("/something.near/widget/testcomponent");
    await expect(
      page.getByText(
        "I come from a redirect map pointed to by flags in localStorage"
      )
    ).toBeVisible();
  });
});

describe("session-storage", () => {
  test("Should be possible to provide a redirectmap through session storage key", async ({
    page,
  }) => {
    await page.context().addInitScript(() => {
      console.log("init script");
      sessionStorage.setItem(
        "nearSocialVMredirectMap",
        JSON.stringify({
          "something.near/widget/testcomponent": {
            code: "return 'I come from a redirect map from session storage';",
          },
        })
      );
    });
    await page.goto("/something.near/widget/testcomponent");
    await page.evaluate(() => {
      console.log(
        JSON.parse(sessionStorage.getItem("nearSocialVMredirectMap"))
      );
    });
    await expect(
      await page.getByText("I come from a redirect map from session storage")
    ).toBeVisible();
  });
});

describe("hot-reload", () => {
  test("Make sure that the attribute hotReloadEnable is set", async ({
    page,
  }) => {
    // TODO:
    // 1. test if hotReloadEnable is false or not provided so there's going to be no request to the websocket;
    // 2. test if hotReloadEnable is true so there's a request to the websocket;

    // check for websocket playwright: https://playwright.dev/docs/api/class-websocket
    // useWeb3: separate PR

    // maybe you need to mock the websocket request like Pieter did in network.spec.js

    // Navigate to the default route
    await page.goto("/");

    // Set the netork attribute to testnet
    await page.evaluate(() => {
      document.body.innerHTML = `
    <near-social-viewer src="neardevs.testnet/widget/default" hotReloadEnable></near-social-viewer>
    `;
    });

    // Verify the viewer is visible
    await waitForSelectorToBeVisible(page, "near-social-viewer");

    // Get the value of the network attribute
    const hotReloadEnable = await page.evaluate(() => {
      const viewer = document.querySelector("near-social-viewer");
      return viewer.getAttribute("hotReloadEnable");
    });

    // expect value to be "testnet"
    expect(hotReloadEnable, "true");
  });
});
